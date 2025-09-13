import Link from "next/link";

// ---- EURO DISPLAY HELPERS ----
const DKK_TO_EUR = 0.134; // <-- Sæt din ønskede kurs her (1 DKK -> EUR)

function formatForEuroDisplay(cents: number, currency: string) {
  // Hvis prisen er i DKK, konverter til EUR for visning
  if (currency === "DKK") {
    const eurCents = Math.round(cents * DKK_TO_EUR);
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(
      eurCents / 100
    );
  }
  // Ellers: formatter efter angivet valuta
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);
}

type Props = {
  listing: {
    id: string;
    title: string;
    description?: string | null;
    priceCents: number;
    currency: string;
    imageUrl?: string | null;
    location?: string | null;
    category?: { name: string } | null;
  };
};

export default function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing.id}`} className="block rounded-2xl border overflow-hidden hover:shadow-md transition">
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={listing.imageUrl} alt={listing.title} className="w-full h-52 object-cover" />
      ) : (
        <div className="w-full h-52 bg-gray-100" />
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium line-clamp-1">{listing.title}</h3>
          <span className="shrink-0 text-sm">{formatForEuroDisplay(listing.priceCents, listing.currency)}</span>
        </div>

        {listing.category?.name && (
          <div className="text-xs text-gray-500">{listing.category.name}</div>
        )}
        {listing.location && (
          <div className="text-xs text-gray-500">{listing.location}</div>
        )}
      </div>
    </Link>
  );
}
