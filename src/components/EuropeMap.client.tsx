// src/components/EuropeMap.client.tsx
// @ts-nocheck
"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { CountryCode } from "@/lib/europe";
import { COUNTRY_CENTROIDS } from "@/lib/europe";

type Props = {
  selected?: CountryCode | null;
  onSelect?: (cc: CountryCode) => void;
};

export default function EuropeMapClient({ selected, onSelect }: Props) {
  const points = useMemo(() => {
    return Object.entries(COUNTRY_CENTROIDS).map(([cc, [lat, lng]]) => ({
      cc,
      lat,
      lng,
    }));
  }, []);

  return (
    <div className="h-[380px] rounded-xl overflow-hidden border bg-white">
      <MapContainer
        center={[54.5, 10]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const isSelected = selected && p.cc === selected;
          return (
            <CircleMarker
              key={p.cc}
              center={[p.lat, p.lng]}
              radius={isSelected ? 9 : 7}
              pathOptions={{
                weight: isSelected ? 2 : 1,
                color: isSelected ? "#FB923C" : "#0F172A",
                fillColor: isSelected ? "#FB923C" : "#0F172A",
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => onSelect?.(p.cc as CountryCode) }}
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
