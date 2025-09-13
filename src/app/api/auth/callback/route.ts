// src/app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

function baseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Find gyldigt, ubrugt link
  const record = await prisma.magicLink.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, email: true },
  });

  if (!record) {
    return NextResponse.redirect(`${baseUrl()}/login?error=invalid_or_expired`);
  }

  // Find/opret bruger ud fra e-mail
  let user = await prisma.user.findUnique({
    where: { email: record.email },
    select: { id: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: record.email,
        name: record.email.split("@")[0] ?? "User",
      },
      select: { id: true },
    });
  }

  // Markér magic link som brugt
  await prisma.magicLink.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // Opret session for brugerens id
  await createSession(user.id);

  // Send videre – tilpas gerne til /sell/new hvis du vil
  return NextResponse.redirect(`${baseUrl()}/account`);
}
