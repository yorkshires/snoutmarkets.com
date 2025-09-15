// src/components/ListingCard.tsx
import Link from "next/link";

// Works with priceCents + currency and won't throw if currency is odd/empty
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

export default function ListingCard({ listing }: { listing: any }) {
  // Accept either relation, string, or categoryName
  const categoryName =
    (typeof listing?.category === "object" ? listing?.category?.name : listing?.category) ||
    listing?.categoryName ||
    "";

  const meta = [categoryName, listing?.location || ""].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
    >
      {listing?.imageUrl ? (
        <img
          src={listing.imageUrl}
          alt={listing?.title || "Listing image"}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-56 w-full bg-slate-100" />
      )}

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
