'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await auth.signIn.email({
    email,
    password,
  });

  if (error) {
    // Redirect back to login with an error message in the URL
    redirect(`/login?error=${encodeURIComponent(error.message || 'Failed to sign in')}`);
  }

  redirect('/dashboard');
}
