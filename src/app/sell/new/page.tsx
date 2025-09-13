// src/app/sell/new/page.tsx
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Create a listing</h1>

      <form
        action="/api/listings"
        method="post"
        className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="e.g. Labrador puppy, black — ready for new home"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={5}
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="Write a short, clear description…"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full rounded-lg border px-3 py-2 outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select category…
              </option>
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
              placeholder="e.g. 19.95"
              required
              className="w-full rounded-lg border px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              name="location"
              className="w-full rounded-lg border px-3 py-2 outline-none"
              placeholder="e.g. Copenhagen"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
          <input
            name="imageUrl"
            className="w-full rounded-lg border px-3 py-2 outline-none"
            placeholder="https://…"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-600 text-white font-medium px-6 py-2 hover:opacity-90"
          >
            Publish
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        You’ll be redirected to the listing page after publishing.
      </p>
    </div>
  );
}
