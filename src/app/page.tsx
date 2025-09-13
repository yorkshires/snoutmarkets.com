// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";

type SearchParams = { q?: string; category?: string; min?: string; max?: string };

function parsePrice(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  const q = (searchParams?.q ?? "").trim();
  const categorySlug = (searchParams?.category ?? "").trim();
  const minPrice = parsePrice(searchParams?.min);
  const maxPrice = parsePrice(searchParams?.max);

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { breed: { contains: q, mode: "insensitive" } },
    ];
  }
  if (categorySlug) where.category = { slug: categorySlug };
  if (minPrice !== undefined) where.priceCents = { ...(where.priceCents || {}), gte: minPrice };
  if (maxPrice !== undefined) where.priceCents = { ...(where.priceCents || {}), lte: maxPrice };

  const listings = await prisma.listing.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Search bar */}
      <form className="rounded-2xl bg-orange-50 p-4 md:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search dogs or gear..."
          className="flex-1 rounded-xl border px-4 py-3 outline-none"
        />
        <select name="category" defaultValue={categorySlug || ""} className="rounded-xl border px-3 py-3">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input name="min" defaultValue={searchParams?.min || ""} placeholder="Min price" className="w-32 rounded-xl border px-3 py-3" inputMode="numeric" />
        <input name="max" defaultValue={searchParams?.max || ""} placeholder="Max price" className="w-32 rounded-xl border px-3 py-3" inputMode="numeric" />
        <button type="submit" className="rounded-xl bg-orange-600 text-white font-medium px-6 py-3">Search</button>
      </form>

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
