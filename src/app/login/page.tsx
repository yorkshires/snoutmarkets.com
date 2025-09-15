"use client";

import { useState } from "react";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">Sign in</h1>
      <p className="text-slate-600 mb-6">
        Enter your email and we’ll send you a secure sign-in link.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            type="email"
            required
            disabled={status === "sending" || status === "sent"}
            placeholder="you@example.com"
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={status === "sending" || status === "sent"}
        >
          {status === "sending" ? "Sending…" : "Send verification link"}
        </button>

        {status === "sent" && (
          <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 p-3 text-sm">
            Check your inbox. We just sent you a sign-in link. The link expires in 15 minutes.
            If you can’t find it, look in your spam folder.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 text-rose-800 p-3 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
