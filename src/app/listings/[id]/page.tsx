// src/app/listings/[id]/page.tsx
import { notFound } from "next/navigation";
import ContactCard from "@/components/ContactCard";
import { prisma } from "@/lib/db";

function formatPrice(priceCents?: number | null, currency?: string | null) {
  if (priceCents == null) return "";
  const value = Math.round(priceCents) / 100;
  const cur = (currency || "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(value);
  } catch {
    return `${value.toFixed(2)} ${cur}`;
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id }, // if numeric id, cast: where: { id: Number(params.id) }
    include: { user: true },
  });

  if (!listing) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 rounded-2xl border bg-white shadow-sm overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full max-h-[520px] object-cover"
          />
        ) : null}

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-1">{listing.title}</h1>
          <div className="text-lg font-medium text-slate-900 mb-4">
            {formatPrice(listing.priceCents, listing.currency)}
          </div>
          <div className="text-sm text-slate-600 mb-3">
            {listing.category} • {listing.location}
          </div>
          <p className="text-slate-800 whitespace-pre-line">{listing.description}</p>
        </div>
      </div>

      <div className="md:col-span-1">
        <ContactCard
          email={listing.user?.email || "seller@example.com"}
          name={listing.user?.name || null}
          location={listing.location || null}
        />
      </div>
    </div>
  );
}
