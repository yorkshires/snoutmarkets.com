// src/app/api/debug-make-token/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

function baseUrl(h: Headers) {
  const env =
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = (h.get("x-forwarded-proto") || "https").split(",")[0].trim();
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.magicLink.create({ data: { email, token, expiresAt } });

  const verifyUrl = `${baseUrl(req.headers)}/api/auth/verify?token=${token}`;

  try {
    await sendEmail(email, "Confirm your email",
      `<p>Click to verify:</p><p><a href="${verifyUrl}">Verify my email</a></p>`);
    return NextResponse.json({ ok: true, sent: true, verifyUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: true, sent: false, verifyUrl, error: String(e?.message || e) });
  }
}
