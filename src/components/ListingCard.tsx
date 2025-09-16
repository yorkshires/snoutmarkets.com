// src/components/ListingCard.tsx
import Link from "next/link";

function formatPriceEUR(priceCents?: number | null) {
  if (priceCents == null) return "";
  const value = Math.round(priceCents) / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);
  } catch {
    return `${value.toFixed(2)} EUR`;
  }
}

export default function ListingCard({
  listing,
}: {
  listing: {
    id: string;
    title?: string | null;
    imageUrl?: string | null;
    priceCents?: number | null;
    currency?: string | null; // ignored for display
    location?: string | null;
    countryCode?: string | null;
  };
}) {
  const meta = [listing.location, listing.countryCode].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title || "Listing image"}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 group-hover:underline">
            {listing?.title || "Untitled"}
          </h3>
          <div className="text-slate-900 font-medium shrink-0">
            {formatPriceEUR(listing?.priceCents)}
          </div>
        </div>
        {meta ? <p className="text-sm text-slate-600 mt-1">{meta}</p> : null}
      </div>
    </Link>
  );
}
