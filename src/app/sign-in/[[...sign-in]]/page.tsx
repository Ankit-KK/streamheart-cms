import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <SignIn 
        appearance={{ 
          elements: { 
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-sm normal-case',
            card: 'shadow-lg border border-gray-200'
          } 
        }} 
      />
    </div>
  );
}
