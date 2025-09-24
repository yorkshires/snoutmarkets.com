// src/components/FilterBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRY_NAMES, CountryCode } from "@/lib/europe";
import EuropeMap from "@/components/EuropeMap";
import SloganBanner from "@/components/SloganBanner";
import { useMemo, useState } from "react";

type CategoryOption = { id: string; name: string };

type Props = {
  categories: CategoryOption[];
};

const EU_CODES = Object.entries(COUNTRY_NAMES).map(([cc, name]) => ({
  code: cc as CountryCode,
  name,
}));

export default function FilterBar({ categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");

  const validCategoryId = useMemo(() => {
    const id = (sp.get("category") ?? "").trim();
    return categories.some((c) => c.id === id) ? id : "";
  }, [categories, sp]);

  const [categoryId, setCategoryId] = useState<string>(validCategoryId);
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  const [country, setCountry] = useState<CountryCode | "">(
    (sp.get("country")?.toUpperCase() as CountryCode) || ""
  );

  const submit = (patch?: Partial<Record<string, string | null>>) => {
    const next = new URLSearchParams(sp.toString());

    const set = (k: string, v: string | null | undefined) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    };

    set("q", q || null);
    set("category", categoryId || null); // ✅ send Category.id
    set("min", min || null);
    set("max", max || null);
    set("country", country || null);

    if (patch) {
      for (const [k, v] of Object.entries(patch)) set(k, v ?? null);
    }

    router.push("/?" + next.toString());
  };

  return (
    <div className="space-y-4">
      <SloganBanner />

      <div className="rounded-2xl border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Search dogs or gear…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* ✅ Real categories from DB (Category.id as value) */}
          <select
            className="rounded-xl border px-3 py-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Category (Any)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Min price"
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Max price"
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />

          <div className="flex gap-2 items-center">
            <label className="text-sm text-slate-600">Filter by</label>
            <select
              value={country ?? ""}
              onChange={(e) =>
                setCountry((e.target.value.toUpperCase() as CountryCode) || "")
              }
              className="rounded-xl border px-3 py-2"
            >
              <option value="">Any</option>
              {EU_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-xl bg-orange-600 text-white px-4 py-2"
              onClick={() => submit()}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4">
          <EuropeMap
            selected={country || undefined}
            onSelect={(cc) => {
              setCountry(cc);
              submit({ country: cc });
            }}
          />
        </div>
      </div>
    </div>
  );
}
