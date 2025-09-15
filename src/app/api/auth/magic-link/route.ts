import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await prisma.magicLink.create({
    data: { token, email, expiresAt }, // ingen userId i modellen
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const link = `${base}/api/auth/callback?token=${token}`;

  // TODO: send mail via Resend. For nu returnerer vi linket i JSON:
  return NextResponse.json({ ok: true, sent: false, link });
}
