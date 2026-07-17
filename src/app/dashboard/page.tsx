import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.emailAddresses[0]?.emailAddress}</h1>
      <p className="mt-2 text-gray-600">Your secure CMS foundation with Clerk is ready.</p>
      
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-2 text-lg font-semibold text-gray-900">System Online</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Database</h3>
          <p className="mt-2 text-lg font-semibold text-green-600">Connected</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Auth</h3>
          <p className="mt-2 text-lg font-semibold text-green-600">Secured via Clerk</p>
        </div>
      </div>
    </div>
  );
}
