// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";

type SearchParams = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  country?: string; // two-letter code, e.g. "DK"
};

function parsePrice(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim();
  const min = parsePrice(searchParams.min);
  const max = parsePrice(searchParams.max);
  const country = (searchParams.country ?? "").trim().toUpperCase() as
    | CountryCode
    | "";

  const where: any = {
    status: "ACTIVE",
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (min !== undefined || max !== undefined) {
    where.price = {};
    if (min !== undefined) where.price.gte = min;
    if (max !== undefined) where.price.lte = max;
  }

  // ✅ Robust country filter: use normalized seller profile countryCode (two-letter)
  if (country) {
    where.user = {
      is: {
        profile: {
          is: { countryCode: country },
        },
      },
    };
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <FilterBar />

      <h2 className="text-2xl font-semibold">Latest listings</h2>

      {listings.length === 0 ? (
        <div className="text-gray-600">No listings match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l as any} />
          ))}
        </div>
      )}
    </div>
  );
}
