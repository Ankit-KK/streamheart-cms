'use server';

import { db } from '@/lib/db';
import { creators } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Fetch all creators
export async function getCreators() {
  const allCreators = await db.select().from(creators).orderBy(desc(creators.createdAt));
  return allCreators;
}

// Add a new creator
export async function addCreator(formData: FormData): Promise<void> {
  const handle = formData.get('handle') as string;
  const code = formData.get('code') as string;
  const upi = formData.get('upi') as string;
  const rateStr = formData.get('rate') as string;
  const rate = parseInt(rateStr, 10);

  if (!handle || !code || !upi || isNaN(rate)) {
    redirect('/creators?error=All fields are required and rate must be a number.');
  }

  try {
    await db.insert(creators).values({
      creatorHandle: handle.toLowerCase().trim(),
      creatorCode: code.toUpperCase().trim(),
      upiId: upi.trim(),
      payoutRate: rate,
    });
    
    // Refresh the page data automatically
    revalidatePath('/creators');
    redirect('/creators?success=Creator added successfully.');
  } catch (error: any) {
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      redirect('/creators?error=A creator with this handle or code already exists.');
    }
    redirect('/creators?error=Failed to add creator. Please try again.');
  }
}
