import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  // DEBUG: Check if Vercel is actually providing these keys
  const hasSecret = !!process.env.CLERK_SECRET_KEY;
  const hasPublic = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  console.log('🔍 CLERK_SECRET_KEY exists:', hasSecret);
  console.log('🔍 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:', hasPublic);
  
  if (!hasSecret || !hasPublic) {
    console.error('❌ CRITICAL: Clerk keys are missing in Vercel Environment Variables!');
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
