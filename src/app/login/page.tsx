// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [tab, setTab] = useState<"pwd" | "magic" | "signup">("pwd");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("error") === "invalid") setError("Wrong email or password.");
    if (p.get("error") === "exists") setError("An account with this email already exists.");
  }, []);

  async function onMagicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      if (!fd.get("email") && email) fd.set("email", email);
      const res = await fetch("/api/auth/magic-link", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Could not send the email. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <h1 className="text-4xl font-bold mb-4">Sign in</h1>

      <div className="inline-flex rounded-xl border bg-white p-1 mb-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "pwd" ? "bg-orange-600 text-white" : "text-slate-700"}`}
          onClick={() => setTab("pwd")}
        >
          Email & password
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "magic" ? "bg-orange-600 text-white" : "text-slate-700"}`}
          onClick={() => setTab("magic")}
        >
          Magic link
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "signup" ? "bg-orange-600 text-white" : "text-slate-700"}`}
          onClick={() => setTab("signup")}
        >
          Create account
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 text-rose-800 p-3 text-sm">{error}</div>
      )}

      {tab === "pwd" && (
        <div className="rounded-2xl border bg-white p-5 mb-6">
          <h2 className="font-semibold mb-3">Email & password</h2>
          <form action="/api/auth/password" method="post" className="grid gap-3">
            <label className="block">
              <span className="text-sm text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <button className="rounded-xl bg-orange-600 text-white px-4 py-2">Sign in</button>
          </form>
          <p className="text-xs text-slate-500 mt-3">Tip: In dev, password defaults to “demo” unless you set AUTH_EMAIL / AUTH_PASSWORD.</p>
        </div>
      )}

      {tab === "magic" && (
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Use a magic link</h2>
          <p className="text-sm text-slate-600 mb-3">Enter your email and we’ll send you a secure sign-in link.</p>
          <form onSubmit={onMagicSubmit} className="grid gap-3">
            <label className="block">
              <span className="text-sm text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                disabled={status === "sending" || status === "sent"}
              />
            </label>
            <button className="rounded-xl bg-slate-900 text-white px-4 py-2" type="submit" disabled={status !== "idle"}>
              {status === "sending" ? "Sending…" : status === "sent" ? "Link sent" : "Send verification link"}
            </button>
          </form>
        </div>
      )}

      {tab === "signup" && (
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Create your account</h2>
          <form action="/api/auth/signup" method="post" className="grid gap-3">
            <label className="block">
              <span className="text-sm text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <button className="rounded-xl bg-orange-600 text-white px-4 py-2">Create account</button>
          </form>
        </div>
      )}
    </div>
  );
}
