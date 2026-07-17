'use client';

import { useActionState } from 'react';
import { signInWithEmail } from './actions';

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <form action={formAction} className="w-full max-w-md space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">StreamHeart CMS</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your admin account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 px-3 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 px-3 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
