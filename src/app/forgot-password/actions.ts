'use server';

import { auth } from '@/lib/auth/server';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

  // Use the Vercel URL to generate the correct reset link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await auth.forgetPassword({
    email,
    redirectTo: `${baseUrl}/reset-password`,
  });

  if (error) {
    return { error: error.message || 'Failed to send reset email' };
  }

  // We return success even if the email doesn't exist to prevent email enumeration
  return { success: 'If an account with this email exists, a password reset link has been sent.' };
}
