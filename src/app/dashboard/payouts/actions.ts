'use server';

import { db } from '@/lib/db';
import { creators, creatorLedger, payoutHistory } from '@/lib/schema';
import { desc, eq, sql, or, ilike } from 'drizzle-orm';
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

// 1. Fetch Payouts with optional search filtering
export async function getPayouts(searchTerm?: string) {
  const whereCondition = searchTerm
    ? or(
        ilike(creators.creatorHandle, `%${searchTerm}%`),
        ilike(creators.creatorCode, `%${searchTerm}%`),
        ilike(payoutHistory.transactionReference, `%${searchTerm}%`)
      )
    : undefined;

  const payouts = await db
    .select({
      id: payoutHistory.id,
      creatorId: payoutHistory.creatorId,
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
    .where(whereCondition)
    .orderBy(desc(payoutHistory.processedAt));
    
  return payouts;
}

// 2. Record Single Payout (Existing logic)
export async function recordPayout(formData: FormData): Promise<void> {
  const creatorId = formData.get('creatorId') as string;
  const grossInrStr = formData.get('grossInr') as string;
  const refundsInrStr = formData.get('refundsInr') as string;
  const payoutRateStr = formData.get('payoutRate') as string;
  const periodStart = formData.get('periodStart') as string;
  const periodEnd = formData.get('periodEnd') as string;
  const transactionRef = formData.get('transactionRef') as string;
  const paymentMethod = formData.get('paymentMethod') as string;

  const grossInrPaise = Math.round(parseFloat(grossInrStr) * 100) || 0;
  const refundsInrPaise = Math.round(parseFloat(refundsInrStr) * 100) || 0;
  const payoutRate = parseFloat(payoutRateStr) || 0;
  const netPayoutInrPaise = Math.round((grossInrPaise - refundsInrPaise) * (payoutRate / 100));

  let redirectUrl = '/dashboard/payouts?tab=history';

  try {
    await db.transaction(async (tx) => {
      await tx.insert(payoutHistory).values({
        creatorId, grossInr: grossInrPaise, refundsInr: refundsInrPaise, payoutRate,
        netPayoutInr: netPayoutInrPaise, periodStart, periodEnd, status: 'COMPLETED',
        transactionReference: transactionRef || null, paymentMethod: paymentMethod || 'UPI', processedAt: new Date(),
      });

      await tx.insert(creatorLedger).values({
        creatorId, totalPaidOutInr: netPayoutInrPaise, updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: creatorLedger.creatorId,
        set: { totalPaidOutInr: sql`${creatorLedger.totalPaidOutInr} + ${netPayoutInrPaise}`, updatedAt: new Date() },
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

// 3. DELETE PAYOUT & REVERSE LEDGER
export async function deletePayout(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  const creatorId = formData.get('creatorId') as string;
  const netPayoutInr = parseInt(formData.get('netPayoutInr') as string, 10);

  let redirectUrl = '/dashboard/payouts?tab=history';

  try {
    await db.transaction(async (tx) => {
      // Delete the payout record
      await tx.delete(payoutHistory).where(eq(payoutHistory.id, id));

      // Reverse the ledger entry (subtract the paid amount safely)
      if (netPayoutInr > 0) {
        await tx.update(creatorLedger)
          .set({
            totalPaidOutInr: sql`GREATEST(COALESCE(${creatorLedger.totalPaidOutInr}, 0) - ${netPayoutInr}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(creatorLedger.creatorId, creatorId));
      }
    });
    revalidatePath('/dashboard/payouts');
    redirectUrl = '/dashboard/payouts?tab=history&success=Payout deleted and ledger reversed successfully!';
  } catch (error: any) {
    console.error('Delete Payout Error:', error);
    redirectUrl = `/dashboard/payouts?tab=history&error=Failed to delete payout: ${encodeURIComponent(error.message)}`;
  }
  redirect(redirectUrl);
}

// 4. BULK GENERATE PAYOUTS
export async function generateBulkPayouts(formData: FormData): Promise<void> {
  const periodStart = formData.get('periodStart') as string;
  const periodEnd = formData.get('periodEnd') as string;

  let redirectUrl = '/dashboard/payouts?tab=history';

  try {
    // Fetch all active creators and their current ledger status
    const creatorsWithLedger = await db
      .select({
        creatorId: creators.id,
        totalGross: creatorLedger.totalGrossInr,
        totalRefunds: creatorLedger.totalRefundsInr,
        totalPaidOut: creatorLedger.totalPaidOutInr,
        payoutRate: creators.payoutRate,
      })
      .from(creators)
      .leftJoin(creatorLedger, eq(creators.id, creatorLedger.creatorId))
      .where(eq(creators.status, 'ACTIVE'));

    let generatedCount = 0;

    await db.transaction(async (tx) => {
      for (const c of creatorsWithLedger) {
        const gross = c.totalGross || 0;
        const refunds = c.totalRefunds || 0;
        const paidOut = c.totalPaidOut || 0;
        const rate = parseFloat(c.payoutRate || '0');

        // Calculate outstanding balance (in Paise)
        const outstandingGross = gross - refunds;
        const totalPayoutDue = Math.round(outstandingGross * (rate / 100));
        const newPayoutAmount = totalPayoutDue - paidOut;

        // Only generate if there is a positive balance due
        if (newPayoutAmount > 0) {
          await tx.insert(payoutHistory).values({
            creatorId: c.creatorId,
            grossInr: outstandingGross,
            refundsInr: refunds,
            payoutRate: rate,
            netPayoutInr: newPayoutAmount,
            periodStart,
            periodEnd,
            status: 'GENERATED',
            paymentMethod: 'Pending',
          });

          // Update ledger to lock in this generated payout
          await tx.insert(creatorLedger).values({
            creatorId: c.creatorId,
            totalPaidOutInr: newPayoutAmount,
            updatedAt: new Date(),
          }).onConflictDoUpdate({
            target: creatorLedger.creatorId,
            set: {
              totalPaidOutInr: sql`${creatorLedger.totalPaidOutInr} + ${newPayoutAmount}`,
              updatedAt: new Date(),
            },
          });

          generatedCount++;
        }
      }
    });

    revalidatePath('/dashboard/payouts');
    redirectUrl = `/dashboard/payouts?tab=history&success=Successfully generated ${generatedCount} bulk payouts!`;
  } catch (error: any) {
    console.error('Bulk Payout Error:', error);
    redirectUrl = `/dashboard/payouts?tab=history&error=Bulk generation failed: ${encodeURIComponent(error.message)}`;
  }
  redirect(redirectUrl);
}
