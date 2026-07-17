'use server';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Fetch our own API route, which proxies the request to Neon Auth
    const res = await fetch(`${baseUrl}/api/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        redirectTo: `${baseUrl}/reset-password`
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error?.message || 'Failed to send reset email' };
    }
  } catch (error) {
    return { error: 'Failed to send reset email. Please try again.' };
  }

  // We return success even if the email doesn't exist to prevent email enumeration
  return { success: 'If an account with this email exists, a password reset link has been sent.' };
}
