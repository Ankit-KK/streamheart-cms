import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

// Ensure this page is rendered dynamically on the server to check the session
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: session } = await auth.getSession();

  // If the user is already logged in, send them straight to the dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  // Otherwise, send them to the login page
  redirect('/login');
}
