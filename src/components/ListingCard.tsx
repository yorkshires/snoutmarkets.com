// src/components/ListingCard.tsx
import Link from "next/link";

function formatPrice(v: any) {
  if (v == null) return "";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(n);
}

export default function ListingCard({ listing }: { listing: any }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
    >
      {listing.imageUrl ? (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-56 w-full bg-slate-100" />
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 group-hover:underline">
            {listing.title}
          </h3>
          <div className="text-slate-900 font-medium shrink-0">
            {formatPrice(listing.price)}
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          {listing.category} • {listing.location}
        </p>
      </div>
    </Link>
  );
}
