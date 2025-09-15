import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=token", req.url));

  const link = await prisma.magicLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  // markér som brugt
  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // hent eller opret bruger
  const user = await prisma.user.upsert({
    where: { email: link.email },
    update: {},
    create: { email: link.email, name: null },
  });

  // opret session (forventet signatur: createSession(userId: string))
  await createSession(user.id);

  // send videre
  return NextResponse.redirect(new URL("/account", req.url));
}
