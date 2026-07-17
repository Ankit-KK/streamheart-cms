'use server';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

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

    // Read the raw text first to see exactly what Neon returns
    const rawText = await res.text();
    console.log('📡 Neon Auth Raw Response Status:', res.status);
    console.log('📡 Neon Auth Raw Response Body:', rawText);

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      // If it's not JSON, it might be an HTML error page or plain text
    }

    if (!res.ok) {
      const errorMsg = (data as any).error?.message || rawText || `Failed with status ${res.status}`;
      return { error: errorMsg };
    }
    
    console.log('✅ Reset email triggered successfully');
  } catch (error: any) {
    console.error('❌ Fetch Network Error:', error.message);
    return { error: `Network error: ${error.message}. Check Vercel logs.` };
  }

  return { success: 'If an account with this email exists, a password reset link has been sent.' };
}
