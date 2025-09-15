// src/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await prisma.magicLink.create({
    data: { token, email, expiresAt },
  });

  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  const link = `${base}/api/auth/callback?token=${token}`;

  // Send via Resend hvis API key er sat – ellers returnér link (dev)
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "noreply@snoutmarkets.com";

  let sent = false;
  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: "Log ind på SnoutMarkets",
          html: `
            <p>Hej!</p>
            <p>Klik på linket her for at logge ind (gyldigt i 15 min):</p>
            <p><a href="${link}">${link}</a></p>
            <p>Hvis du ikke anmodede om dette, kan du ignorere mailen.</p>
          `,
        }),
      });
      sent = true;
    } catch {
      sent = false;
    }
  }

  return NextResponse.json({ ok: true, sent, link: sent ? undefined : link });
}
