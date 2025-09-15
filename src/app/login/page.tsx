"use client";

import { useState } from "react";

export default function LoginPage() {
  const [status, setStatus] =
    useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [devLink, setDevLink] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    setDevLink(null);

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (!res.ok) {
      setStatus("error");
      setMessage("Noget gik galt. Prøv igen.");
      return;
    }

    const json = await res.json();
    setStatus("sent");
    if (json.sent) {
      setMessage("Tjek din mail for dit login-link.");
    } else if (json.link) {
      setMessage("Dev: klik linket herunder for at logge ind.");
      setDevLink(json.link as string);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Log ind</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" name="email" type="email" required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sender…" : "Send login-link"}
        </button>

        {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}
        {devLink && (
          <div className="mt-2">
            <a className="text-blue-600 underline break-all" href={devLink}>
              {devLink}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
