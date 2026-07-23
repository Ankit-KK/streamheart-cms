import { db } from '@/lib/db';
import { creators } from '@/lib/schema';
import { count, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

// Force Next.js to fetch fresh data from the database on every page load
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentUser();

  // Fetch real metrics from the Neon database
  const totalResult = await db.select({ value: count() }).from(creators);
  const activeResult = await db.select({ value: count() }).from(creators).where(eq(creators.status, 'ACTIVE'));
  const inactiveResult = await db.select({ value: count() }).from(creators).where(eq(creators.status, 'INACTIVE'));

  const totalCreators = totalResult[0]?.value || 0;
  const activeCreators = activeResult[0]?.value || 0;
  const inactiveCreators = inactiveResult[0]?.value || 0;

  return (
    <div>
      {/* Welcome Header */}
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.emailAddresses[0]?.emailAddress}
      </h1>
      <p className="mt-2 text-gray-600">Here is a real-time overview of your creator management system.</p>
      
      {/* Real-Time Metrics Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        
        {/* Total Creators Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Creators</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalCreators}</p>
          <Link href="/dashboard/creators" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all creators →
          </Link>
        </div>

        {/* Active Creators Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Active Creators</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-green-600">{activeCreators}</p>
          <p className="mt-1 text-xs text-gray-500">Eligible for payouts</p>
        </div>

        {/* Inactive Creators Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Inactive Creators</h3>
            <span className="text-2xl">⏸️</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-red-600">{inactiveCreators}</p>
          <p className="mt-1 text-xs text-gray-500">Payouts paused</p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link href="/dashboard/creators" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <span className="text-indigo-600 text-xl">➕</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Add New Creator</p>
              <p className="text-sm text-gray-500">Register a creator and their financial details</p>
            </div>
          </Link>
          
          {/* Placeholder for the next module we will build */}
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
            <div className="bg-gray-200 p-3 rounded-full mr-4">
              <span className="text-gray-500 text-xl">💸</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Process Payouts</p>
              <p className="text-sm text-gray-500">Coming in Step 4: Sync Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
