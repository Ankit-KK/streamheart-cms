"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (res.ok) { setMessage(data.message + (data.token ? ` (Dev Token: ${data.token})` : "")); } 
    else { setError(data.error || "Something went wrong."); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your email to receive a reset link.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="email" required className="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 px-3" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600 whitespace-pre-wrap">{message}</div>}
          <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div className="text-center"><Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Login</Link></div>
        </form>
      </div>
    </div>
  );
}
