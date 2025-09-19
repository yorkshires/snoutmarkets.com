// src/components/FilterBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRY_NAMES, CountryCode } from "@/lib/europe";
import EuropeMap from "@/components/EuropeMap";
import SloganBanner from "@/components/SloganBanner";
import { useState, useMemo } from "react";

const EU_CODES = Object.entries(COUNTRY_NAMES).map(([cc, name]) => ({
  code: cc as CountryCode,
  name,
}));

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [my, setMy] = useState<CountryCode | "">(params.get("my") as any || "");
  const [maxKm, setMaxKm] = useState<string>(params.get("maxkm") || "");
  const [country, setCountry] = useState<CountryCode | null>(params.get("country") as any || null);

  function submit(next: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    }
    router.push("/?" + p.toString());
  }

  const selectedLabel = useMemo(() => (country ? COUNTRY_NAMES[country] : "Any"), [country]);

  return (
    <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-sm text-slate-700">My country</span>
            <select
              value={my}
              onChange={(e) => setMy(e.target.value as any)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            >
              <option value="">—</option>
              {EU_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Max distance (km)</span>
            <input
              type="number"
              min={50}
              step={50}
              placeholder="e.g. 600"
              value={maxKm}
              onChange={(e) => setMaxKm(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>
          <button
            className="rounded-xl bg-slate-900 text-white px-4 py-2"
            onClick={() => submit({ my: my || null, maxkm: maxKm || null, country: null })}
          >
            Apply distance
          </button>
        </div>
        <SloganBanner />

        <div className="rounded-xl border bg-white p-3 text-sm text-slate-700">
          <p className="font-medium mb-1">How the distance filter works</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Set <em>My country</em> and a <em>Max distance</em> to hide far-away countries.</li>
            <li>Distance is calculated “as the crow flies”.</li>
            <li>Click any marker on the map to filter by that country instantly.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-700">Filter by country</div>
            <div className="text-slate-900 font-medium">{selectedLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={country ?? ""}
              onChange={(e) => setCountry((e.target.value || null) as any)}
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
              onClick={() => submit({ country: country || null })}
            >
              Apply country
            </button>
          </div>
        </div>
        <EuropeMap
          selected={country || undefined}
          onSelect={(cc) => {
            setCountry(cc);
            submit({ country: cc });
          }}
        />
      </div>
    </div>
  );
}
