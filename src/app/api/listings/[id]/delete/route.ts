// src/app/api/listings/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

async function ensureUserId(): Promise<string> {
  const c = cookies();
  const fromCookie = c.get("sm_uid")?.value || c.get("uid")?.value || null;
  if (fromCookie) return fromCookie;
  const user = await prisma.user.upsert({
    where: { email: "demo@snoutmarkets.com" },
    update: {},
    create: { email: "demo@snoutmarkets.com", name: "Demo Seller" },
    select: { id: true },
  });
  return user.id;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const origin = new URL(req.url).origin;
  const userId = await ensureUserId();

  // Only allow deleting own listing
  const listing = await prisma.listing.findFirst({
    where: { id: ctx.params.id, userId },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.redirect(`${origin}/account/listings?error=not_found_or_not_owner`);
  }

  await prisma.listing.delete({ where: { id: ctx.params.id } });
  return NextResponse.redirect(`${origin}/account/listings?deleted=1`);
}
