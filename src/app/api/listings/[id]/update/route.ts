// src/app/api/listings/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth";

function toCents(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const origin = new URL(req.url).origin;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?next=/sell/edit/${ctx.params.id}`);
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim();
  const imageUrl = String(form.get("imageUrl") ?? "").trim() || null;

  if (!title || !priceCents || !categorySlug) {
    return NextResponse.redirect(`${origin}/sell/edit/${ctx.params.id}?error=invalid`);
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.redirect(`${origin}/sell/edit/${ctx.params.id}?error=bad_category`);
  }

  // Only allow editing own listing
  const owned = await prisma.listing.findFirst({
    where: { id: ctx.params.id, userId },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.redirect(`${origin}/account/listings?error=not_found_or_not_owner`);
  }

  await prisma.listing.update({
    where: { id: ctx.params.id },
    data: {
      title,
      description,
      categoryId: category.id,
      priceCents,
      currency: "EUR",
      location,
      imageUrl,
    },
  });

  // Revalidate after a successful update
  revalidatePath("/");
  revalidatePath("/account/listings");
  revalidatePath(`/listings/${ctx.params.id}`);

  return NextResponse.redirect(`${origin}/listings/${ctx.params.id}`);
}
