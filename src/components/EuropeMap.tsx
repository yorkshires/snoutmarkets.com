// src/components/EuropeMap.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { CountryCode } from "@/lib/europe";
import { COUNTRY_CENTROIDS } from "@/lib/europe";

// Lazy-load react-leaflet only on client
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });
const Tooltip      = dynamic(() => import("react-leaflet").then(m => m.Tooltip),      { ssr: false });

type Props = {
  selected?: CountryCode | null;
  onSelect?: (cc: CountryCode) => void;
};

export default function EuropeMap({ selected, onSelect }: Props) {
  // Convert centroids to leaflet-friendly array once
  const points = useMemo(() => {
    return (Object.keys(COUNTRY_CENTROIDS) as CountryCode[]).map((cc) => ({
      cc,
      lat: COUNTRY_CENTROIDS[cc][0],
      lng: COUNTRY_CENTROIDS[cc][1],
    }));
  }, []);

  // map center/zoom that fits Europe comfortably
  const center: [number, number] = [54, 15];
  const zoom = 4;

  return (
    <div className="h-[380px] rounded-xl overflow-hidden border">
      {/* Map */}
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const active = selected === p.cc;
          return (
            <CircleMarker
              key={p.cc}
              center={[p.lat, p.lng]}
              radius={active ? 8 : 6}
              pathOptions={{ color: active ? "#EA580C" : "#1f2937", weight: 2, fillOpacity: 0.9 }}
              eventHandlers={{ click: () => onSelect?.(p.cc) }}
            >
              <Tooltip direction="right" offset={[8, 0]} opacity={1} permanent>
                <span className="font-medium text-[12px]">{p.cc}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
