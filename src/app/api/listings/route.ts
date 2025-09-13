// src/app/api/listings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

// Convert "19.95" / "19,95" to integer cents (e.g. 1995). Returns null if invalid.
function toCents(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export async function POST(req: Request) {
  // Build absolute URLs for redirects (works both locally and on Vercel)
  const origin = new URL(req.url).origin;

  // Require logged-in user
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?need=1`);
  }

  // Read form fields
  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim();
  const rawImage = String(form.get("imageUrl") ?? "").trim();
  const imageUrl = rawImage || null;

  // Basic validation
  if (!title || !categorySlug || priceCents === null) {
    return NextResponse.redirect(`${origin}/sell/new?error=invalid`);
  }

  // Validate category
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    return NextResponse.redirect(`${origin}/sell/new?error=bad_category`);
  }

  // Create listing
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

  // Go to the new listing detail page
  return NextResponse.redirect(`${origin}/listings/${listing.id}`);
}
