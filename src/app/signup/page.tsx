// src/app/signup/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");

  const invalid = params.get("error") === "invalid";

  useEffect(() => {
    const q = params.get("email");
    if (q) setEmail(q);
  }, [params]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-5xl font-semibold text-slate-900 mb-6">Create account</h1>

      {invalid && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
          Please use a valid email and a password of at least 8 characters.
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border">
        <form method="POST" action="/api/signup" className="space-y-5">
          <div>
            <label className="block mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border px-4 py-3"
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
            Create account
          </button>
          <p className="text-sm text-slate-600">
            Already have an account? <Link href="/login" className="underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
