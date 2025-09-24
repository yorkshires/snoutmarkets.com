// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import FilterBar from "@/components/FilterBar";
import type { CountryCode } from "@/lib/europe";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = {
  q?: string;
  category?: string; // category slug
  min?: string;      // "19.99" or "19,99"
  max?: string;
  country?: string;  // seller country (2-letter)
};

function toCents(v?: string) {
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  noStore(); // always fetch fresh data

  const q            = (searchParams?.q ?? "").trim();
  const categorySlug = (searchParams?.category ?? "").trim();
  const minPrice     = toCents(searchParams?.min);
  const maxPrice     = toCents(searchParams?.max);
  const countryCode  = (searchParams?.country ?? "").toUpperCase() as CountryCode | "";

  // for the category dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });

  // ---- build filters (keep only ACTIVE on homepage) ----
  const where: any = { status: "ACTIVE" as const };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    // to-one relation filter by slug
    where.category = { is: { slug: categorySlug } };
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    where.priceCents = {};
    if (typeof minPrice === "number") where.priceCents.gte = minPrice;
    if (typeof maxPrice === "number") where.priceCents.lte = maxPrice;
  }

  if (countryCode) {
    // your earlier code used user.profile; keep that shape
    // (if your Prisma model uses sellerProfile instead, change "profile" to "sellerProfile")
    where.user = { is: { profile: { is: { countryCode } } } };
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
      {/* Hero search */}
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
        <select
          name="category"
          defaultValue={categorySlug || ""}
          className="rounded-xl border px-3 py-3"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
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

      {/* Country filter + map */}
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
