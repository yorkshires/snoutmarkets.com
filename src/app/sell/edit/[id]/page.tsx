// src/app/sell/edit/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  // Use the same session user as the rest of the app
  const uid = await getSessionUserId();
  if (!uid) {
    redirect(`/login?next=/sell/edit/${params.id}`);
  }

  const [listing, categories] = await Promise.all([
    prisma.listing.findFirst({
      where: { id: params.id, userId: uid }, // ensure ownership
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!listing) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Edit listing</h1>

      <form
        action={`/api/listings/${listing.id}/update`}
        method="post"
        className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            defaultValue={listing.title}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={listing.description ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full rounded-lg border px-3 py-2"
              defaultValue={categories.find((c) => c.id === listing.categoryId)?.slug}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (EUR)</label>
            <input
              name="price"
              inputMode="decimal"
              required
              className="w-full rounded-lg border px-3 py-2"
              defaultValue={(listing.priceCents / 100).toFixed(2)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              name="location"
              className="w-full rounded-lg border px-3 py-2"
              defaultValue={listing.location ?? ""}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
          <input
            name="imageUrl"
            className="w-full rounded-lg border px-3 py-2"
            defaultValue={listing.imageUrl ?? ""}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-600 text-white font-medium px-6 py-2 hover:opacity-90"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
