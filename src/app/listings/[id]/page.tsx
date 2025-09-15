// src/app/listings/[id]/page.tsx
import { notFound } from "next/navigation";
import ContactCard from "@/components/ContactCard";
import { prisma } from "@/lib/db";

function formatPrice(v: any) {
  if (v == null) return "";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(n);
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id }, // works for string IDs (UUID). If your ID is numeric, cast Number(params.id)
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
            {formatPrice(listing.price)}
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
          name={(listing.user as any)?.name || null}
          location={(listing as any)?.location || null}
        />
      </div>
    </div>
  );
}
