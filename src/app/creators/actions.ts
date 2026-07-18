'use server';

import { db } from '@/lib/db';
import { creators } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getCreators() {
  const allCreators = await db.select().from(creators).orderBy(desc(creators.createdAt));
  return allCreators;
}

export async function addCreator(formData: FormData): Promise<void> {
  const handle = formData.get('handle') as string;
  const code = formData.get('code') as string;
  const email = formData.get('email') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const phone = formData.get('phone') as string;
  const rate = formData.get('rate') as string;
  const notes = formData.get('notes') as string;

  if (!handle || !code) {
    redirect('/creators?error=Creator Handle and Code are required.');
  }

  try {
    await db.insert(creators).values({
      creatorHandle: handle.toLowerCase().trim(),
      creatorCode: code.toUpperCase().trim(),
      email: email || null,
      contactEmail: contactEmail || null,
      phoneNumber: phone || null,
      payoutRate: rate || null,
      notes: notes || null,
      status: 'ACTIVE',
    });
    
    revalidatePath('/creators');
    redirect('/creators?success=Creator added successfully.');
  } catch (error: any) {
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      redirect('/creators?error=A creator with this handle or code already exists.');
    }
    redirect('/creators?error=Failed to add creator. Please try again.');
  }
}
