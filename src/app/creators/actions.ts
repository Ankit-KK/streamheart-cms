'use server';

import { db } from '@/lib/db';
import { creators, creatorFinancials } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Fetch creators and JOIN their financial details (like UPI)
export async function getCreators() {
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
    .orderBy(desc(creators.createdAt));
    
  return allCreators;
}

// Add a creator AND their financial details in one secure transaction
export async function addCreator(formData: FormData): Promise<void> {
  const handle = formData.get('handle') as string;
  const code = formData.get('code') as string;
  const email = formData.get('email') as string;
  const rate = formData.get('rate') as string;
  
  // Financial fields
  const legalName = formData.get('legalName') as string;
  const pan = formData.get('pan') as string;
  const upi = formData.get('upi') as string;
  const bankName = formData.get('bankName') as string;
  const accountHolder = formData.get('accountHolder') as string;
  const accLast4 = formData.get('accLast4') as string;
  const ifsc = formData.get('ifsc') as string;

  if (!handle || !code) {
    redirect('/creators?error=Creator Handle and Code are required.');
  }

  try {
    // Use a database transaction: if one fails, both roll back
    await db.transaction(async (tx) => {
      // 1. Insert the main creator profile
      const [newCreator] = await tx.insert(creators).values({
        creatorHandle: handle.toLowerCase().trim(),
        creatorCode: code.toUpperCase().trim(),
        email: email || null,
        payoutRate: rate || null,
        status: 'ACTIVE',
      }).returning({ id: creators.id });

      // 2. If any financial details were provided, insert them into the financials table
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
    
    revalidatePath('/creators');
    redirect('/creators?success=Creator and financial details added successfully!');
  } catch (error: any) {
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      redirect('/creators?error=A creator with this handle or code already exists.');
    }
    console.error('DB Error:', error);
    redirect('/creators?error=Failed to add creator. Check server logs.');
  }
}
