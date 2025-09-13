// src/app/api/auth/magic-link/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const emailSchema = z.string().email();

function tokenString() {
  // stabil, nok entropi, funker i Node runtime
  return crypto.randomUUID().replace(/-/g, "") + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const raw = (form.get("email") ?? "").toString().trim().toLowerCase();
    const email = emailSchema.parse(raw);

    // Find eller opret bruger
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split("@")[0] },
      select: { id: true, email: true },
    });

    // Opret magic token (15 min gyldighed)
    const token = tokenString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.magicLink.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const base =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      `http://${req.headers.get("host") ?? "localhost:3000"}`;

    const url = `${base}/api/auth/callback?token=${encodeURIComponent(token)}`;

    // Send mail (hvis nøgle er sat)
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: user.email,
        subject: "Your SnoutMarkets login link",
        html: `
          <p>Hi!</p>
          <p>Click to log in:</p>
          <p><a href="${url}">${url}</a></p>
          <p>This link expires in 15 minutes.</p>
        `,
      });
    } else {
      console.warn("RESEND_API_KEY or FROM_EMAIL not set – skipping email send. URL:", url);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Invalid email" },
      { status: 400 }
    );
  }
}
