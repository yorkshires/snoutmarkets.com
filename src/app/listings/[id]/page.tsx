// src/app/listings/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    cents / 100
  );
}

export default async function ListingDetail({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      user: true,
    },
  });

  if (!listing) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-[420px] object-cover"
            />
          ) : (
            <div className="w-full h-[420px] bg-gray-100" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>

          <div className="text-xl font-medium">
            {formatCurrency(listing.priceCents, listing.currency)}
          </div>

          <div className="mt-2 text-gray-600">
            {listing.category?.name} • {listing.location || "No location"}
          </div>

          <p className="mt-6 whitespace-pre-wrap">{listing.description}</p>

          <div className="mt-8 p-4 rounded-xl bg-white border">
            <div className="text-sm text-gray-500 mb-1">Seller</div>
            <div className="font-medium">{listing.user?.name || "Seller"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
