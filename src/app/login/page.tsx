// src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Tab = "password" | "magic" | "create";

export default function LoginPage() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "fail">("idle");

  const mustVerify =
    params.get("verify") === "1" || params.get("error") === "verify";
  const created = params.get("created") === "1";
  const expired = params.get("error") === "expired";

  useEffect(() => {
    // Make sure users see the banner immediately after signup
    if (mustVerify) setTab("password");
  }, [mustVerify]);

  async function handleResend(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      setResendStatus("sending");
      const fd = new FormData();
      fd.append("email", email.toLowerCase().trim());
      const r = await fetch("/api/auth/resend-verification", { method: "POST", body: fd });
      setResendStatus(r.ok ? "sent" : "fail");
    } catch {
      setResendStatus("fail");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-5xl font-semibold text-slate-900 mb-6">Sign in</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-2xl ${tab === "password" ? "bg-orange-600 text-white" : "bg-white"}`}
          onClick={() => setTab("password")}
        >
          Email & password
        </button>
        <button
          className={`px-4 py-2 rounded-2xl ${tab === "magic" ? "bg-orange-600 text-white" : "bg-white"}`}
          onClick={() => setTab("magic")}
        >
          Magic link
        </button>
        <button
          className={`ml-auto px-4 py-2 rounded-2xl ${tab === "create" ? "bg-orange-600 text-white" : "bg-white"}`}
          onClick={() => setTab("create")}
        >
          Create account
        </button>
      </div>

      {/* Info banners */}
      <div className="space-y-3 mb-4">
        {created && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800">
            Account created. Please verify your email to continue.
          </div>
        )}
        {mustVerify && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-yellow-900">
            We sent you a verification link. Open the email and click “Verify my email”.
            {email ? (
              <>
                {" "}
                Didn’t get it?{" "}
                <button
                  onClick={handleResend}
                  className="underline font-medium"
                  disabled={resendStatus === "sending"}
                >
                  {resendStatus === "sending" ? "Sending…" : "Resend verification"}
                </button>
                {resendStatus === "sent" && <span className="ml-2">✔ Sent</span>}
                {resendStatus === "fail" && <span className="ml-2 text-red-700">Failed to send</span>}
              </>
            ) : (
              <> Type your email below and click “Resend verification”.</>
            )}
          </div>
        )}
        {expired && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            That verification link expired. Enter your email below and click “Resend verification”.
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border">
        {tab === "password" && (
          <form method="POST" action="/api/login/password" className="space-y-5">
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
                className="w-full rounded-2xl border px-4 py-3"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
              Sign in
            </button>
            <p className="text-xs text-slate-500">
              Tip: In dev, password may default to “demo”.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResend}
                className="underline text-sm"
                disabled={!email || resendStatus === "sending"}
              >
                {resendStatus === "sending" ? "Sending…" : "Resend verification"}
              </button>
            </div>
          </form>
        )}

        {tab === "magic" && (
          <form method="POST" action="/api/auth/magic-link" className="space-y-5">
            <div>
              <label className="block mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
              Send magic link
            </button>
          </form>
        )}

        {tab === "create" && (
          <form method="POST" action="/api/signup" className="space-y-5">
            <div>
              <label className="block mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
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
            <p className="text-xs text-slate-500">
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline">Terms</Link> and{" "}
              <Link href="/privacy" className="underline">Privacy</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
