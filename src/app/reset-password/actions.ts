'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const token = formData.get('token') as string;

  if (!password || !token) {
    return { error: 'Missing password or token' };
  }

  const { error } = await auth.resetPassword({
    newPassword: password,
    token,
  });

  if (error) {
    return { error: error.message || 'Failed to reset password. The link may have expired.' };
  }

  redirect('/login?success=Password updated successfully. Please log in.');
}
