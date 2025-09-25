// src/app/api/listings/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const origin = new URL(req.url).origin;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?next=/account/listings`);
  }

  // Only allow deleting own listing
  const listing = await prisma.listing.findFirst({
    where: { id: ctx.params.id, userId },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.redirect(`${origin}/account/listings?error=not_found_or_not_owner`);
  }

  await prisma.listing.delete({ where: { id: ctx.params.id } });

  // Refresh pages that show listings
  revalidatePath("/");
  revalidatePath("/account/listings");

  return NextResponse.redirect(`${origin}/account/listings?deleted=1`);
}
