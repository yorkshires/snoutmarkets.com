// src/app/api/auth/magic-link/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function getBaseUrl(req: NextRequest) {
  // Brug altid produktionsdomænet hvis det er sat
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.BASE_URL;
  if (envUrl) return envUrl;
  // Fallbacks (ok i udvikling / hvis preview er offentligt)
  const vercelUrl = process.env.VERCEL_URL; // fx myapp-abc123.vercel.app
  if (vercelUrl) return `https://${vercelUrl}`;
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  // find/creer bruger
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true, email: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.magicLink.create({
    data: { token, email: user.email, expiresAt },
  });

  const base = getBaseUrl(req);
  const link = `${base}/api/auth/callback?token=${token}`;

  // Hvis du ikke har mail sat op endnu, returnér linket som nu:
  return NextResponse.json({ ok: true, sent: false, link });
}
