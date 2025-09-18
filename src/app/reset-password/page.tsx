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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: pwd }),
    });
    if (r.ok) {
      setOk(true);
      setTimeout(() => router.push("/login"), 1200);
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Something went wrong");
    }
  }

  if (!token) {
    return <div className="max-w-md mx-auto p-6">Invalid reset link.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>
      {ok ? (
        <p>Password updated. Redirecting to sign in…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border rounded p-2"
            type="password"
            placeholder="New password (min 8 chars)"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            minLength={8}
            required
          />
          {err && <p className="text-red-600">{err}</p>}
          <button className="w-full bg-orange-600 text-white rounded p-2">Update password</button>
        </form>
      )}
    </div>
  );
}
