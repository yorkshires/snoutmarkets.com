// src/app/page.tsx
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  noStore(); // absolutely no caching

  // ✅ Always show latest listings — no filters at all
  const listings = await prisma.listing.findMany({
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
      <section className="rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-white border p-6 md:p-8">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
            Europe’s Marketplace for Dogs and Dog Owners
          </span>
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Buy and sell responsibly. Connect with trusted owners and find the right
          gear—no platform payments, contact sellers directly.
        </p>

        {/* Pretty search bar (UI only; filters intentionally disabled for reliability) */}
        <form
          className="mt-6 rounded-2xl bg-white/70 backdrop-blur border p-4 md:p-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-sm"
          method="get"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            name="q"
            placeholder="Search dogs or gear…"
            className="flex-1 rounded-xl border px-4 py-3 outline-none"
          />
          <select name="category" defaultValue="" className="rounded-xl border px-3 py-3">
            <option value="">All categories</option>
          </select>
          <input
            name="min"
            placeholder="Min price"
            className="w-32 rounded-xl border px-3 py-3"
            inputMode="numeric"
          />
          <input
            name="max"
            placeholder="Max price"
            className="w-32 rounded-xl border px-3 py-3"
            inputMode="numeric"
          />
          <button
            type="submit"
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 transition"
            title="Search (disabled for now — results always show)"
          >
            Search
          </button>
        </form>
      </section>

      <div className="text-sm text-gray-600">
        Contact the seller directly — no payments through the platform.
      </div>

      <h2 className="text-2xl font-semibold">Latest listings</h2>

      {listings.length === 0 ? (
        <div className="text-gray-600">No listings in the database.</div>
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
