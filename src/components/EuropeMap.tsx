// src/components/EuropeMap.tsx
"use client";

import { COUNTRY_NAMES, CountryCode } from "@/lib/europe";

type Props = {
  selected?: CountryCode | null;
  onSelect?: (cc: CountryCode) => void;
};

// tiny stylized “dot map” of Europe (no deps)
const POS: Record<CountryCode, { x: number; y: number }> = (() => {
  const raw: Record<CountryCode, [number, number]> = {
    AL:[20.17,41.15], AD:[1.52,42.51], AT:[14.55,47.52], BA:[17.68,43.92],
    BE:[4.47,50.50], BG:[25.49,42.73], CH:[8.23,46.82], CY:[33.43,35.13],
    CZ:[15.47,49.82], DE:[10.45,51.17], DK:[9.50,56.26], EE:[25.01,58.60],
    ES:[-3.75,40.46], FI:[25.75,61.92], FR:[2.21,46.23], GB:[-3.44,55.38],
    GR:[21.82,39.07], HR:[15.20,45.10], HU:[19.50,47.16], IE:[-7.69,53.14],
    IS:[-19.02,64.96], IT:[12.57,41.87], LI:[9.56,47.17], LT:[23.88,55.17],
    LU:[6.13,49.82], LV:[24.60,56.88], ME:[19.37,42.71], MK:[21.75,41.61],
    MT:[14.38,35.94], NL:[5.29,52.13], NO:[8.47,60.47], PL:[19.15,51.92],
    PT:[-8.22,39.40], RO:[24.97,45.94], RS:[21.01,44.02], SE:[18.64,60.13],
    SI:[15.00,46.15], SK:[19.70,48.67]
  };
  const proj = (lon:number, lat:number) => {
    const x = (lon + 25) * (100/55); // [-25..30] -> [0..100]
    const y = (70 - lat) * (100/40); // [30..70] -> [0..100]
    return { x, y };
  };
  const out: any = {};
  for (const cc of Object.keys(raw) as CountryCode[]) {
    const [lon, lat] = raw[cc];
    out[cc] = proj(lon, lat);
  }
  return out;
})();

export default function EuropeMap({ selected, onSelect }: Props) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-auto rounded-xl border bg-white">
      <rect x="0" y="0" width="100" height="100" fill="white" />
      {Object.entries(POS).map(([cc, p]) => {
        const active = selected === cc;
        return (
          <g key={cc} onClick={() => onSelect?.(cc as CountryCode)} style={{ cursor: "pointer" }}>
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 2.4 : 1.8}
              className={active ? "fill-orange-600" : "fill-slate-700"}
            />
            <text
              x={p.x + 2.5}
              y={p.y + 0.8}
              fontSize="2.6"
              className="select-none fill-slate-900"
            >
              {cc}
            </text>
          </g>
        );
      })}
      <text x="4" y="96" fontSize="3" className="fill-slate-600">
        Europe – click a country
      </text>
    </svg>
  );
}
