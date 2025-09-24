// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = {
  q?: string;
  category?: string; // category slug
  min?: string;      // "19.99" or "19,99"
  max?: string;
};

function toCents(v?: string) {
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  noStore(); // absolutely no caching

  const q            = (searchParams?.q ?? "").trim();
  const categorySlug = (searchParams?.category ?? "").trim();
  const minPrice     = toCents(searchParams?.min);
  const maxPrice     = toCents(searchParams?.max);

  // For the category dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });

  // ---- Build WHERE (homepage shows ACTIVE listings) ----
  // BUGFIX: Previously we always added an empty `priceCents: {}` when no min/max
  // which Prisma treats as an impossible filter -> 0 results.
  // Now we only add priceCents if min or max is actually provided.
  const where: any = { status: "ACTIVE" as const };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    // Category is optional (categoryId is nullable) → must use `is` to filter.
    where.category = { is: { slug: categorySlug } };
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    const price: any = {};
    if (typeof minPrice === "number") price.gte = minPrice;
    if (typeof maxPrice === "number") price.lte = maxPrice;
    if (Object.keys(price).length) {
      where.priceCents = price;
    }
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* HERO WITH SLOGAN */}
      <section className="rounded-3xl border p-6 md:p-8 bg-white">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Europe’s Marketplace for Dogs and Dog Owners
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Buy and sell responsibly. Connect with trusted owners and find the right
          gear—no platform payments, contact sellers directly.
        </p>

        {/* SEARCH BAR */}
        <form className="mt-6 flex flex-col gap-3 md:flex-row" action="/">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search dogs or gear…"
            className="flex-1 rounded-xl border px-4 py-3 outline-none"
          />
          <select
            name="category"
            defaultValue={categorySlug || ""}
            className="rounded-xl border px-3 py-3"
          >
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
          <button className="rounded-xl bg-orange-600 text-white px-5 py-3 font-semibold">
            Search
          </button>
        </form>
      </section>

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
