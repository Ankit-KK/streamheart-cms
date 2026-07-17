"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    if (res.ok) { router.push("/login?reset=success"); } 
    else { setError(data.error || "Failed to reset password."); }
    setLoading(false);
  };

  if (!token) return <div className="flex min-h-screen items-center justify-center"><p className="text-red-600">Invalid or missing reset token.</p></div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div><h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Set New Password</h2></div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="password" required className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 px-3" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" required className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 px-3" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
          <div className="text-center"><Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Login</Link></div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}
