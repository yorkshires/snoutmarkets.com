// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";

type SearchParams = {
  q?: string;
  category?: string;
  min?: string; // EUR as string, e.g. "10" or "10.50"
  max?: string; // EUR as string
  country?: string; // two-letter code, e.g. "DK"
};

function toNumber(v?: string) {
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
function eurToCents(n?: number) {
  return n === undefined ? undefined : Math.round(n * 100);
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim();
  const minEUR = toNumber(searchParams.min);
  const maxEUR = toNumber(searchParams.max);
  const minCents = eurToCents(minEUR);
  const maxCents = eurToCents(maxEUR);
  const country = (searchParams.country ?? "").trim().toUpperCase() as
    | CountryCode
    | "";

  const where: any = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) where.category = category;

  // ✅ Use priceCents (NOT price), and convert EUR ➜ cents
  if (minCents !== undefined || maxCents !== undefined) {
    where.priceCents = {};
    if (minCents !== undefined) where.priceCents.gte = minCents;
    if (maxCents !== undefined) where.priceCents.lte = maxCents;
  }

  // Fetch listings; include seller profile countryCode for client display
  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          profile: { select: { countryCode: true } },
        },
      },
    },
    take: 60,
  });

  // Optional country filter (robust across schema variations)
  const filtered =
    country
      ? listings.filter(
          (l) => l.user?.profile?.countryCode?.toUpperCase() === country
        )
      : listings;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <FilterBar />

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
