// src/components/ContactCard.tsx
"use client";

import { useState } from "react";

export default function ContactCard({
  email,
  name,
  location,
}: {
  email: string;
  name?: string | null;
  location?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <aside className="rounded-2xl border bg-white shadow-sm p-5">
      <h3 className="text-lg font-semibold mb-2">Contact the seller</h3>

      <div className="space-y-1 text-sm text-slate-600 mb-3">
        {name ? <div className="text-slate-900 font-medium">{name}</div> : null}
        {location ? <div>{location}</div> : null}
        <div className="break-all text-slate-900">{email}</div>
      </div>

      <div className="flex gap-2">
        <a
          href={`mailto:${email}`}
          className="rounded-xl bg-orange-600 text-white px-4 py-2"
        >
          Email seller
        </a>
        <button onClick={copy} className="rounded-xl border px-4 py-2">
          {copied ? "Copied" : "Copy email"}
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Contact the seller directly — no payments through the platform.
      </p>
    </aside>
  );
}
