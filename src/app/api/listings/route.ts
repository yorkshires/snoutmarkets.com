// src/app/api/listings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// "19.95" or "19,95" -> 1995
function toCents(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.redirect(`${origin}/login?next=/sell/new`);

  const form = await req.formData();

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categorySlug = String(form.get("category") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const location = String(form.get("location") ?? "").trim() || null;
  const imageUrl = String(form.get("imageUrl") ?? "").trim() || null;

  if (!title || !categorySlug || priceCents == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
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

      // ✅ ensure new items appear on homepage
      status: "ACTIVE",
      // publishedAt: new Date(), // uncomment if your schema has this column
    },
    select: { id: true },
  });

  // refresh pages that show listings
  revalidatePath("/");
  revalidatePath("/account/listings");

  return NextResponse.redirect(`${origin}/listings/${listing.id}`);
}
