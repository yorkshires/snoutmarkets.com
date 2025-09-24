// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";

type SearchParams = {
  q?: string;
  category?: string; // Category.id
  min?: string;      // EUR string
  max?: string;      // EUR string
  country?: string;  // two-letter code, e.g. "DK"
};

function toNumber(v?: string) {
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
function eurToCents(n?: number) {
  return n == null ? undefined : Math.round(n * 100);
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const q = (searchParams.q ?? "").trim();
  const minCents = eurToCents(toNumber(searchParams.min));
  const maxCents = eurToCents(toNumber(searchParams.max));
  const country = (searchParams.country ?? "").trim().toUpperCase() as CountryCode | "";

  // ✅ Load real categories from DB
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Only accept the category if it exists; otherwise ignore it.
  const rawCategoryId = (searchParams.category ?? "").trim();
  const categoryId = categories.some((c) => c.id === rawCategoryId) ? rawCategoryId : "";

  const where: any = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;

  if (minCents !== undefined || maxCents !== undefined) {
    where.priceCents = {};
    if (minCents !== undefined) where.priceCents.gte = minCents;
    if (maxCents !== undefined) where.priceCents.lte = maxCents;
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { profile: { select: { countryCode: true } } } },
      category: { select: { id: true, name: true } },
    },
    take: 60,
  });

  const filtered =
    country
      ? listings.filter((l) => l.user?.profile?.countryCode?.toUpperCase() === country)
      : listings;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Pass categories to the client filter bar */}
      <FilterBar categories={categories} />

      <h2 className="text-2xl font-semibold">Latest listings</h2>

      {filtered.length === 0 ? (
        <div className="text-gray-600">No listings match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l as any} />
          ))}
        </div>
      )}
    </div>
  );
}
