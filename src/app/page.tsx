// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";

type SearchParams = {
  q?: string;
  category?: string; // slug/string stored in DB
  min?: string;      // EUR string
  max?: string;      // EUR string
  country?: string;  // two-letter, e.g. "DK"
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
  const rawCategory = (searchParams.category ?? "").trim();
  const minCents = eurToCents(toNumber(searchParams.min));
  const maxCents = eurToCents(toNumber(searchParams.max));
  const country = (searchParams.country ?? "").trim().toUpperCase() as CountryCode | "";

  // Get the distinct categories that actually exist in the DB (ACTIVE only).
  const distinctCats = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categories: string[] = distinctCats
    .map((c) => c.category)
    .filter((x): x is string => !!x);

  // Only accept the category if it exists; otherwise ignore it.
  const category = categories.includes(rawCategory) ? rawCategory : "";

  const where: any = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) where.category = category;

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
    },
    take: 60,
  });

  const filtered =
    country
      ? listings.filter((l) => l.user?.profile?.countryCode?.toUpperCase() === country)
      : listings;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Pass the real categories down to the client filter bar */}
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
