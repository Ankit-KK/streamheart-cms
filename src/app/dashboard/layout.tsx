import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600">StreamHeart</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
            Dashboard
          </a>
          <a href="/dashboard/creators" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
            Creators
          </a>
          <a href="/dashboard/payouts" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
            Payouts
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200 mt-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <UserProfile />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
