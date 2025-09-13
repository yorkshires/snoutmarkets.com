// src/app/api/auth/magic-link/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";

function baseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const raw = String(form.get("email") ?? "").trim().toLowerCase();

    if (!raw || !/^\S+@\S+\.\S+$/.test(raw)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Sørg for at brugeren eksisterer (valgfrit men praktisk)
    await prisma.user.upsert({
      where: { email: raw },
      update: {},
      create: { email: raw, name: raw.split("@")[0] ?? "User" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Gem magic-link med EMAIL (ikke userId)
    await prisma.magicLink.create({
      data: {
        token,
        email: raw,
        expiresAt,
      },
    });

    const loginLink = `${baseUrl()}/api/auth/callback?token=${token}`;

    // Send mail via Resend hvis tilgængelig – ellers returnér link i JSON (praktisk i dev)
    if (resend) {
      await resend.emails.send({
        from: process.env.AUTH_EMAIL_FROM || "SnoutMarkets <login@snoutmarkets.com>",
        to: raw,
        subject: "Your login link",
        text: `Click to log in: ${loginLink}\n\nThis link expires in 15 minutes.`,
      });
    }

    return NextResponse.json({ ok: true, sent: Boolean(resend), link: resend ? undefined : loginLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
