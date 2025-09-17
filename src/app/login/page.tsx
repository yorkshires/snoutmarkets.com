// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "password" | "magic" | "create";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-5xl font-semibold text-slate-900 mb-6">Sign in</h1>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("password")}
          className={`px-4 py-2 rounded-2xl border ${tab === "password" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-900"}`}
        >
          Email &amp; password
        </button>
        <button
          onClick={() => setTab("magic")}
          className={`px-4 py-2 rounded-2xl border ${tab === "magic" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-900"}`}
        >
          Magic link
        </button>
        <button
          onClick={() => setTab("create")}
          className={`ml-auto px-4 py-2 rounded-2xl border ${tab === "create" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-900"}`}
        >
          Create account
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-6 md:p-8">
        {tab === "password" && <PasswordSignInForm />}
        {tab === "magic" && <MagicLinkForm />}
        {tab === "create" && <CreateAccountForm />}
      </div>
    </div>
  );
}

function PasswordSignInForm() {
  return (
    <form method="post" action="/api/login/password" className="space-y-4">
      <div>
        <div className="text-sm text-slate-700 mb-1">Email</div>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>
      <div>
        <div className="text-sm text-slate-700 mb-1">Password</div>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>
      <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
        Sign in
      </button>
      <p className="text-xs text-slate-500">Tip: In dev, password may default to “demo”.</p>
    </form>
  );
}

function MagicLinkForm() {
  return (
    <form method="post" action="/api/login/magic" className="space-y-4">
      <div>
        <div className="text-sm text-slate-700 mb-1">Email</div>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>
      <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
        Send verification link
      </button>
      <p className="text-xs text-slate-500">
        We’ll email you a secure sign-in link. No password needed.
      </p>
    </form>
  );
}

function CreateAccountForm() {
  return (
    <form method="post" action="/api/signup" className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
      <div>
        <div className="text-sm text-slate-700 mb-1">Email</div>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>
      <div>
        <div className="text-sm text-slate-700 mb-1">Password</div>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>
      <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
        Create account
      </button>
      <p className="text-xs text-slate-500">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy</Link>.
      </p>
    </form>
  );
}
