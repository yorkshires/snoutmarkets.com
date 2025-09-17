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
  const origin = new URL(req.url).origin;

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?next=/sell/new`, { status: 302 });
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim();
  const imageUrl = String(form.get("imageUrl") ?? "").trim();

  if (!title || !description || !categorySlug || priceCents === null) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({ where: { slug: categorySlug } });
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
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
