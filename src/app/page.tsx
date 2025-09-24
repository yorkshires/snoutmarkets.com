// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic"; // ⬅️ prevent caching of the homepage

type SearchParams = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  country?: string; // optional country filter (uses seller profile country code)
};

function parsePrice(v?: string) {
  // also accept comma decimals like "19,99"
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  noStore(); // ⬅️ hard-disable any per-request caching

  const q = (searchParams?.q ?? "").trim();
  const categorySlug = (searchParams?.category ?? "").trim();
  const minPrice = parsePrice(searchParams?.min);
  const maxPrice = parsePrice(searchParams?.max);
  const countryCode = (searchParams?.country ?? "").toUpperCase() as CountryCode | "";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });

  // keep your original intent: show only ACTIVE
  const where: any = { status: "ACTIVE" as const };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    // correct relation filter by slug
    where.category = { is: { slug: categorySlug } };
  }

  if (minPrice != null || maxPrice != null) {
    where.priceCents = {};
    if (minPrice != null) where.priceCents.gte = minPrice;
    if (maxPrice != null) where.priceCents.lte = maxPrice;
  }

  // Country filter via seller profile (user.profile.countryCode)
  if (countryCode) {
    where.user = {
      is: {
        profile: {
          is: { countryCode },
        },
      },
    };
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      priceCents: true,
      currency: true,
      location: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Existing hero search */}
      <form
        className="rounded-2xl bg-orange-50 p-4 md:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center"
        method="get"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search dogs or gear..."
          className="flex-1 rounded-xl border px-4 py-3 outline-none"
        />
        <select name="category" defaultValue={categorySlug || ""} className="rounded-xl border px-3 py-3">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="min"
          defaultValue={searchParams?.min || ""}
          placeholder="Min price"
          className="w-32 rounded-xl border px-3 py-3"
          inputMode="numeric"
        />
        <input
          name="max"
          defaultValue={searchParams?.max || ""}
          placeholder="Max price"
          className="w-32 rounded-xl border px-3 py-3"
          inputMode="numeric"
        />
        <button type="submit" className="rounded-xl bg-orange-600 text-white font-medium px-6 py-3">
          Search
        </button>
      </form>

      {/* Country filter + small Europe map */}
      <FilterBar />

      <div className="text-sm text-gray-600">
        Contact the seller directly — no payments through the platform.
      </div>

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
