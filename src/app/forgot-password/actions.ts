'use server';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

  // Bulletproof URL detection for Vercel
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    const apiUrl = `${baseUrl}/api/auth/forget-password`;
    console.log('🔍 Attempting to fetch reset password at:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        redirectTo: `${baseUrl}/reset-password`
      }),
    });

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      console.error('❌ API Error Response:', data);
      return { error: data.error?.message || `Failed with status ${res.status}` };
    }
    
    console.log('✅ Reset email triggered successfully');
  } catch (error: any) {
    console.error('❌ Fetch Network Error:', error.message);
    return { error: `Network error: ${error.message}. Check Vercel logs.` };
  }

  // We return success even if the email doesn't exist to prevent email enumeration
  return { success: 'If an account with this email exists, a password reset link has been sent.' };
}
