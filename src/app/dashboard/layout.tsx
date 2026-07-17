import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600">StreamHeart</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
            Dashboard
          </a>
          {/* We will add more links in Step 3 */}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{session.user?.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden">
          <h1 className="text-lg font-bold text-indigo-600">StreamHeart</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
