'use server';

import { db } from '@/lib/db';
import { creators, creatorLedger, payoutHistory } from '@/lib/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getActiveCreators() {
  return await db
    .select({
      id: creators.id,
      creatorHandle: creators.creatorHandle,
      creatorCode: creators.creatorCode,
      payoutRate: creators.payoutRate,
    })
    .from(creators)
    .where(eq(creators.status, 'ACTIVE'))
    .orderBy(creators.creatorHandle);
}

export async function getPayouts() {
  const payouts = await db
    .select({
      id: payoutHistory.id,
      creatorHandle: creators.creatorHandle,
      creatorCode: creators.creatorCode,
      grossInr: payoutHistory.grossInr,
      refundsInr: payoutHistory.refundsInr,
      payoutRate: payoutHistory.payoutRate,
      netPayoutInr: payoutHistory.netPayoutInr,
      periodStart: payoutHistory.periodStart,
      periodEnd: payoutHistory.periodEnd,
      status: payoutHistory.status,
      transactionReference: payoutHistory.transactionReference,
      processedAt: payoutHistory.processedAt,
    })
    .from(payoutHistory)
    .leftJoin(creators, eq(payoutHistory.creatorId, creators.id))
    .orderBy(desc(payoutHistory.processedAt));
    
  return payouts;
}

export async function recordPayout(formData: FormData): Promise<void> {
  const creatorId = formData.get('creatorId') as string;
  const grossInrStr = formData.get('grossInr') as string;
  const refundsInrStr = formData.get('refundsInr') as string;
  const payoutRateStr = formData.get('payoutRate') as string;
  const periodStart = formData.get('periodStart') as string;
  const periodEnd = formData.get('periodEnd') as string;
  const transactionRef = formData.get('transactionRef') as string;
  const paymentMethod = formData.get('paymentMethod') as string;

  // Convert Rupees (from form) to Paise (for database)
  const grossInrPaise = Math.round(parseFloat(grossInrStr) * 100) || 0;
  const refundsInrPaise = Math.round(parseFloat(refundsInrStr) * 100) || 0;
  const payoutRate = parseFloat(payoutRateStr) || 0;
  
  // Calculate Net Payout in Paise
  const netPayoutInrPaise = Math.round((grossInrPaise - refundsInrPaise) * (payoutRate / 100));

  let redirectUrl = '/dashboard/payouts?tab=history'; // Default to history tab

  try {
    await db.transaction(async (tx) => {
      await tx.insert(payoutHistory).values({
        creatorId,
        grossInr: grossInrPaise,
        refundsInr: refundsInrPaise,
        payoutRate,
        netPayoutInr: netPayoutInrPaise,
        periodStart,
        periodEnd,
        status: 'COMPLETED',
        transactionReference: transactionRef || null,
        paymentMethod: paymentMethod || 'UPI',
        processedAt: new Date(),
      });

      await tx.insert(creatorLedger).values({
        creatorId,
        totalPaidOutInr: netPayoutInrPaise,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: creatorLedger.creatorId,
        set: {
          totalPaidOutInr: sql`${creatorLedger.totalPaidOutInr} + ${netPayoutInrPaise}`,
          updatedAt: new Date(),
        },
      });
    });

    revalidatePath('/dashboard/payouts');
    redirectUrl = '/dashboard/payouts?tab=history&success=Payout recorded and ledger updated successfully!';
  } catch (error: any) {
    console.error('Payout DB Error:', error);
    redirectUrl = `/dashboard/payouts?tab=new&error=Raw DB Error: ${encodeURIComponent(error.message || String(error))}`;
  }

  redirect(redirectUrl);
}
