// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (e) {
      setErr("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Forgot password</h1>
      {sent ? (
        <p>Check your email for a reset link (if an account exists).</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block mb-2">Email</span>
            <input
              className="w-full border rounded p-3"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {err && <p className="text-red-600">{err}</p>}
          <button
            className="w-full bg-orange-600 text-white rounded p-3 font-medium"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
