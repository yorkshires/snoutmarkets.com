// src/app/account/listings/page.tsx
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountListingsPage() {
  const uid = await getSessionUserId();
  if (!uid) {
    redirect("/login?next=/account/listings");
  }

  const listings = await prisma.listing.findMany({
    where: { userId: uid },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">My listings</h1>
        <Link href="/sell/new" className="rounded-xl bg-orange-600 text-white px-4 py-2">
          Create
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border bg-orange-50 text-slate-700 p-6">
          You don’t have any listings yet. Click <strong>Create</strong> to add one.
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-white">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-5">
              <div>
                <div className="text-lg font-medium">{l.title}</div>
                <div className="text-sm text-gray-600">
                  {l.category?.name ?? "—"} • {l.currency} {(l.priceCents / 100).toFixed(2)} • {l.location ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/listings/${l.id}`} className="rounded-xl border px-3 py-2">
                  View
                </Link>
                <Link href={`/sell/edit/${l.id}`} className="rounded-xl border px-3 py-2">
                  Edit
                </Link>
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
