// src/app/account/listings/page.tsx
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Minimal session: try cookie (sm_uid/uid) else fallback to demo user
async function ensureUserId(): Promise<string> {
  const c = cookies();
  const fromCookie = c.get("sm_uid")?.value || c.get("uid")?.value || null;
  if (fromCookie) return fromCookie;

  const user = await prisma.user.upsert({
    where: { email: "demo@snoutmarkets.com" },
    update: {},
    create: { email: "demo@snoutmarkets.com", name: "Demo Seller" },
    select: { id: true },
  });
  return user.id;
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(cents / 100);
}

export default async function AccountListingsPage() {
  const uid = await ensureUserId();

  const listings = await prisma.listing.findMany({
    where: { userId: uid },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link href="/sell/new" className="rounded-xl bg-orange-600 text-white px-4 py-2">Create</Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-gray-600">
          You don’t have any listings yet.{" "}
          <Link href="/sell/new" className="underline">Create your first one</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="rounded-xl border bg-white p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{l.title}</div>
                <div className="text-sm text-gray-600">
                  {l.category?.name ?? "—"} • {formatCurrency(l.priceCents, l.currency)} • {l.location || "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/listings/${l.id}`} className="rounded-xl border px-3 py-2">View</Link>
                <Link href={`/sell/edit/${l.id}`} className="rounded-xl border px-3 py-2">Edit</Link>
                <form action={`/api/listings/${l.id}/delete`} method="post">
                  <button className="rounded-xl border px-3 py-2 text-red-600">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
