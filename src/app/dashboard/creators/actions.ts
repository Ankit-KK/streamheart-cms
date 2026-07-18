'use server';

import { db } from '@/lib/db';
import { creators, creatorFinancials } from '@/lib/schema';
import { desc, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Fetch creators with optional search and JOIN financial details
export async function getCreators(searchTerm?: string) {
  const whereCondition = searchTerm 
    ? or(
        ilike(creators.creatorHandle, `%${searchTerm}%`),
        ilike(creators.creatorCode, `%${searchTerm}%`),
        ilike(creators.email, `%${searchTerm}%`)
      )
    : undefined;

  const allCreators = await db
    .select({
      id: creators.id,
      creatorHandle: creators.creatorHandle,
      creatorCode: creators.creatorCode,
      email: creators.email,
      payoutRate: creators.payoutRate,
      status: creators.status,
      upiId: creatorFinancials.upiId,
    })
    .from(creators)
    .leftJoin(creatorFinancials, eq(creators.id, creatorFinancials.creatorId))
    .where(whereCondition)
    .orderBy(desc(creators.createdAt));
    
  return allCreators;
}

// Add a creator AND their financial details in one secure transaction
export async function addCreator(formData: FormData): Promise<void> {
  const handle = formData.get('handle') as string;
  const code = formData.get('code') as string;
  const email = formData.get('email') as string;
  const rate = formData.get('rate') as string;
  
  const legalName = formData.get('legalName') as string;
  const pan = formData.get('pan') as string;
  const upi = formData.get('upi') as string;
  const bankName = formData.get('bankName') as string;
  const accountHolder = formData.get('accountHolder') as string;
  const accLast4 = formData.get('accLast4') as string;
  const ifsc = formData.get('ifsc') as string;

  if (!handle || !code) {
    redirect('/dashboard/creators?error=Creator Handle and Code are required.');
  }

  let redirectUrl = '/dashboard/creators';

  try {
    await db.transaction(async (tx) => {
      const [newCreator] = await tx.insert(creators).values({
        creatorHandle: handle.toLowerCase().trim(),
        creatorCode: code.toUpperCase().trim(),
        email: email || null,
        payoutRate: rate || null,
        status: 'ACTIVE',
      }).returning({ id: creators.id });

      if (legalName || pan || upi || bankName || accountHolder || accLast4 || ifsc) {
        await tx.insert(creatorFinancials).values({
          creatorId: newCreator.id,
          legalName: legalName || null,
          panNumber: pan || null,
          upiId: upi || null,
          bankName: bankName || null,
          accountHolderName: accountHolder || null,
          accountNumberLast4: accLast4 || null,
          ifsc: ifsc || null,
        });
      }
    });
    
    revalidatePath('/dashboard/creators');
    redirectUrl = '/dashboard/creators?success=Creator and financial details added successfully!';
    
  } catch (error: any) {
    const errMsg = error.message || String(error);
    
    if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
      redirectUrl = '/dashboard/creators?error=A creator with this handle or code already exists.';
    } else {
      console.error('DB Error:', errMsg);
      redirectUrl = `/dashboard/creators?error=Raw DB Error: ${encodeURIComponent(errMsg)}`;
    }
  }

  redirect(redirectUrl);
}

// Toggle creator status between ACTIVE and INACTIVE
export async function toggleCreatorStatus(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('status') as string;
  
  // Toggle logic
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  let redirectUrl = '/dashboard/creators';

  try {
    await db.update(creators)
      .set({ 
        status: newStatus,
        updatedAt: new Date() 
      })
      .where(eq(creators.id, id));
      
    revalidatePath('/dashboard/creators');
    redirectUrl = `/dashboard/creators?success=Creator status updated to ${newStatus}.`;
  } catch (error: any) {
    console.error('Failed to update status:', error);
    redirectUrl = `/dashboard/creators?error=Failed to update creator status.`;
  }
  
  // Redirect OUTSIDE the try/catch block
  redirect(redirectUrl);
}
