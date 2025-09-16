// src/components/ListingCard.tsx
import Link from "next/link";

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

export default function ListingCard({
  listing,
}: {
  listing: {
    id: string;
    title?: string | null;
    imageUrl?: string | null;
    priceCents?: number | null;
    currency?: string | null;
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
            {formatPrice(listing?.priceCents, listing?.currency)}
          </div>
        </div>
        {meta ? <p className="text-sm text-slate-600 mt-1">{meta}</p> : null}
      </div>
    </Link>
  );
}
