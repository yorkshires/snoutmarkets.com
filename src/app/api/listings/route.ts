// src/app/api/listings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// Convert "19.95" / "19,95" to integer cents (e.g. 1995). Returns null if invalid.
function toCents(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

// Minimal session helper: try cookie, else fallback to demo user.
async function ensureUserId(): Promise<string> {
  const c = cookies();
  const fromCookie =
    c.get("sm_uid")?.value || c.get("uid")?.value || null;
  if (fromCookie) return fromCookie;

  // Fallback: upsert demo user so we can create a listing without login
  const user = await prisma.user.upsert({
    where: { email: "demo@snoutmarkets.com" },
    update: {},
    create: { email: "demo@snoutmarkets.com", name: "Demo Seller" },
    select: { id: true },
  });
  return user.id;
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;

  const userId = await ensureUserId();

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim();
  const rawImage = String(form.get("imageUrl") ?? "").trim();
  const imageUrl = rawImage || null;

  if (!title || !categorySlug || priceCents === null) {
    return NextResponse.redirect(`${origin}/sell/new?error=invalid`);
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.redirect(`${origin}/sell/new?error=bad_category`);
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      category: { connect: { id: category.id } },
      priceCents,
      currency: "EUR",
      location,
      imageUrl,
      user: { connect: { id: userId } },
    },
    select: { id: true },
  });

  return NextResponse.redirect(`${origin}/listings/${listing.id}`);
}
