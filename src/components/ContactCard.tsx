// src/components/ContactCard.tsx
"use client";

import { useState } from "react";

export default function ContactCard({
  email,
  phone,
  name,
  location,
}: {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  location?: string | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  }

  return (
    <aside className="rounded-2xl border bg-white p-4">
      <h3 className="font-semibold text-slate-900 mb-1">Contact seller</h3>
      {name ? <p className="text-sm text-slate-700">{name}</p> : null}
      {location ? <p className="text-sm text-slate-600">{location}</p> : null}

      <div className="mt-3 grid gap-2">
        {email ? (
          <div className="flex items-center gap-2">
            <a href={`mailto:${email}`} className="rounded-xl border px-4 py-2">
              Email seller
            </a>
            <button onClick={() => copy(email, "email")} className="rounded-xl border px-4 py-2">
              {copied === "email" ? "Copied" : "Copy email"}
            </button>
          </div>
        ) : null}
        {phone ? (
          <div className="flex items-center gap-2">
            <a href={`tel:${phone}`} className="rounded-xl border px-4 py-2">
              Call seller
            </a>
            <button onClick={() => copy(phone, "phone")} className="rounded-xl border px-4 py-2">
              {copied === "phone" ? "Copied" : "Copy phone"}
            </button>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Contact the seller directly — no payments through the platform.
      </p>
    </aside>
  );
}
