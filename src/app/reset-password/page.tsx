// src/app/reset-password/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: pwd }),
    });
    setLoading(false);
    if (r.ok) {
      setOk(true);
      setTimeout(() => router.push("/login"), 1200);
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Something went wrong");
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-4">Reset password</h1>
        <p>Invalid reset link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Set a new password</h1>
      {ok ? (
        <p>Password updated. Redirecting to sign in…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block mb-2">New password</span>
            <input
              className="w-full border rounded p-3"
              type="password"
              placeholder="Minimum 8 characters"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {err && <p className="text-red-600">{err}</p>}
          <button className="w-full bg-orange-600 text-white rounded p-3 font-medium" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
