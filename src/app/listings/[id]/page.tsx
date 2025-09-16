// src/app/listings/[id]/page.tsx
import { notFound } from "next/navigation";
import ContactCard from "@/components/ContactCard";
import { prisma } from "@/lib/db";

function formatPriceEUR(priceCents?: number | null) {
  if (priceCents == null) return "";
  const value = Math.round(priceCents) / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);
  } catch {
    return `${value.toFixed(2)} EUR`;
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
      category: { select: { name: true } },
    },
  });
  if (!listing) notFound();

  const meta: string[] = [];
  if (listing.category?.name) meta.push(listing.category.name);
  if (listing.location) meta.push(listing.location);
  const metaLine = meta.join(" • ");

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 rounded-2xl overflow-hidden border bg-white">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} className="w-full object-cover aspect-[16/9]" />
        ) : null}
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-1">{listing.title}</h1>
          <div className="text-lg font-medium text-slate-900 mb-4">
            {formatPriceEUR(listing.priceCents)}
          </div>
          {metaLine ? (
            <div className="text-sm text-slate-600 mb-3">{metaLine}</div>
          ) : null}
          <p className="text-slate-800 whitespace-pre-line">{listing.description || ""}</p>
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
