// src/components/NewListingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import { COUNTRY_NAMES } from "@/lib/europe";

type Category = { id: string; name: string; slug: string };

export default function NewListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    // Always set imageUrl and currency explicitly
    form.set("imageUrl", imageUrl);
    if (!form.get("currency")) form.set("currency", "EUR");

    // If price is provided in euros, keep as string; server can convert to cents
    const res = await fetch("/api/listings", { method: "POST", body: form });
    if (res.redirected) {
      router.push(res.url);
      return;
    }
    setSaving(false);
    alert("Could not save listing.");
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h2 className="font-semibold text-slate-900 text-lg mb-3">New listing</h2>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
        {/* Title */}
        <label className="block">
          <span className="text-sm text-slate-700">Title</span>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g. Vintage road bike"
          />
        </label>

        {/* Category */}
        <label className="block">
          <span className="text-sm text-slate-700">Category</span>
          <select name="categoryId" required className="mt-1 w-full rounded-xl border px-3 py-2">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Price (EUR) */}
        <label className="block">
          <span className="text-sm text-slate-700">Price</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              name="priceEuro"
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 199.00"
              className="w-full rounded-xl border px-3 py-2"
            />
            <input type="hidden" name="currency" value="EUR" />
            <span className="text-sm text-slate-600 shrink-0">EUR</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Price will be stored in cents with currency EUR.
          </p>
        </label>

        {/* City / Location */}
        <label className="block">
          <span className="text-sm text-slate-700">City / Location</span>
          <input
            name="location"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g. Copenhagen"
          />
        </label>

        {/* Country */}
        <label className="block">
          <span className="text-sm text-slate-700">Country</span>
          <select
            name="countryCode"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a country
            </option>
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {/* Contact Email */}
        <label className="block">
          <span className="text-sm text-slate-700">Contact email</span>
          <input
            name="contactEmail"
            type="email"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="you@example.com"
          />
        </label>

        {/* Contact Phone */}
        <label className="block">
          <span className="text-sm text-slate-700">Contact phone</span>
          <input
            name="contactPhone"
            type="tel"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="+45 12 34 56 78"
          />
        </label>

        {/* Image */}
        <div className="md:col-span-2">
          <span className="text-sm text-slate-700">Image</span>
          <div className="mt-1">
            <ImageUploader onUploaded={(url) => setImageUrl(url)} />
          </div>
          {imageUrl ? (
            <p className="text-xs text-slate-600 mt-2 break-all">
              Uploaded image URL: <span className="font-mono">{imageUrl}</span>
            </p>
          ) : null}
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </div>

        {/* Description */}
        <label className="block md:col-span-2">
          <span className="text-sm text-slate-700">Description</span>
          <textarea
            name="description"
            rows={5}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="Write a short description..."
          />
        </label>

        {/* Actions */}
        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-orange-600 text-white px-5 py-2 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create listing"}
          </button>
          <a href="/" className="text-sm text-slate-700 hover:underline">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
