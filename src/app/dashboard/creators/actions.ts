'use server';

import { db } from '@/lib/db';
import { creators, creatorFinancials } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
    redirect('/dashboard/creators?success=Creator and financial details added successfully!');
  } catch (error: any) {
    const errMsg = error.message || String(error);
    
    // If it's a duplicate error, show the clean message
    if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
      redirect('/dashboard/creators?error=A creator with this handle or code already exists.');
    }
    
    // For ANY other error, show the raw database error on the screen
    console.error('DB Error:', errMsg);
    redirect(`/dashboard/creators?error=Raw DB Error: ${encodeURIComponent(errMsg)}`);
  }
}
