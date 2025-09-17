// src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Tab = "password" | "magic";

export default function LoginPage() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] =
    useState<"idle" | "sending" | "sent" | "fail">("idle");

  // Read all possible flags
  const exists = params.get("error") === "exists";
  const mustVerify =
    params.get("verify") === "1" || params.get("error") === "verify";
  const badCreds = params.get("error") === "badcreds";
  const invalid = params.get("error") === "invalid";
  const server = params.get("error") === "server";
  const expired = params.get("error") === "expired";
  const magicSent = params.get("magic") === "sent";
  const sentFailed = params.get("sent") === "0";

  // Prefill email from ?email
  useEffect(() => {
    const q = params.get("email");
    if (q) setEmail(q);
  }, [params]);

  async function handleResend(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      setResendStatus("sending");
      const fd = new FormData();
      fd.append("email", email.toLowerCase().trim());
      const r = await fetch("/api/auth/resend-verification", {
        method: "POST",
        body: fd,
      });
      setResendStatus(r.ok ? "sent" : "fail");
    } catch {
      setResendStatus("fail");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="flex items-center mb-6">
        <h1 className="text-5xl font-semibold text-slate-900">Sign in</h1>
        <Link href="/signup" className="ml-auto px-4 py-2 rounded-2xl bg-white border">
          Create account
        </Link>
      </div>

      {/* Banners */}
      <div className="space-y-3 mb-4">
        {exists && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-blue-900">
            An account with <strong>{email || "this email"}</strong> already exists.
            Please sign in with your password below, or send yourself a magic link.
          </div>
        )}
        {mustVerify && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-yellow-900">
            We sent you a verification link. Open the email and click “Verify my email”.
            {sentFailed && <span className="ml-2 text-red-700">Sending failed. Try “Resend verification”.</span>}
            {" "}
            <button
              onClick={handleResend}
              className="underline font-medium"
              disabled={resendStatus === "sending" || !email}
            >
              {resendStatus === "sending" ? "Sending…" : "Resend verification"}
            </button>
            {resendStatus === "sent" && <span className="ml-2">✔ Sent</span>}
            {resendStatus === "fail" && <span className="ml-2 text-red-700">Failed</span>}
          </div>
        )}
        {badCreds && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            Incorrect email or password. Please try again.
          </div>
        )}
        {invalid && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            Please enter a valid email and password.
          </div>
        )}
        {server && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            Something went wrong. Please try again.
          </div>
        )}
        {expired && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            That verification link expired. Enter your email below and click “Resend verification”.
          </div>
        )}
        {magicSent && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800">
            Magic link sent! Check your inbox.
          </div>
        )}
      </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-orange-600 text-white px-4 py-3">
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
