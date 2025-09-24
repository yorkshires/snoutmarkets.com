// src/app/api/listings/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function toCents(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

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

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim();
  const imageUrl = String(form.get("imageUrl") ?? "").trim() || null;

  if (!title || !categorySlug || priceCents === null) {
    return NextResponse.redirect(`${origin}/sell/edit/${ctx.params.id}?error=invalid`);
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.redirect(`${origin}/sell/edit/${ctx.params.id}?error=bad_category`);
  }

  // ensure ownership
  const owned = await prisma.listing.findFirst({
    where: { id: ctx.params.id, userId },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.redirect(`${origin}/account/listings?error=not_owner`);
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

  // 🔄 revalidate AFTER a successful update
  revalidatePath("/");
  revalidatePath("/account/listings");
  revalidatePath(`/listings/${ctx.params.id}`);

  return NextResponse.redirect(`${origin}/listings/${ctx.params.id}`);
}
