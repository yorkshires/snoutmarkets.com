"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

type Category = { id: string; name: string; slug: string };

export default function NewListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/listings", { method: "POST", body: fd });

    if (res.ok) {
      const { id } = await res.json();
      router.push(`/listings/${id}`);
    } else {
      alert(await res.text());
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create listing</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title</label>
            <input name="title" required className="w-full rounded-xl border px-3 py-2" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Price (EUR)</label>
            <input
              name="price"
              placeholder="e.g. 19.95"
              className="w-full rounded-xl border px-3 py-2"
            />
            <input type="hidden" name="currency" value="EUR" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} className="w-full rounded-xl border px-3 py-2" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Category</label>
            <select name="category" className="w-full rounded-xl border px-3 py-2">
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Location</label>
            <input name="location" className="w-full rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Photos</label>
          <ImageUploader onUploaded={(url) => setImageUrl(url)} />
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-orange-600 text-white px-5 py-2 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Publish listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
