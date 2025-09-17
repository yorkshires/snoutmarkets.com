"use client";
import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { CountryCode } from "@/lib/europe";
import { COUNTRY_CENTROIDS } from "@/lib/europe";

export default function EuropeMapClient({ selected, onSelect }: { selected?: CountryCode | null; onSelect?: (cc: CountryCode) => void }) {
  const points = useMemo(
    () => (Object.keys(COUNTRY_CENTROIDS) as CountryCode[]).map((cc) => ({ cc, lat: COUNTRY_CENTROIDS[cc][0], lng: COUNTRY_CENTROIDS[cc][1] })),
    []
  );

  return (
    <div className="h-[380px] rounded-xl overflow-hidden border">
      <MapContainer center={[54, 15]} zoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => {
          const active = selected === p.cc;
          return (
            <CircleMarker key={p.cc} center={[p.lat, p.lng]} radius={active ? 8 : 6}
              pathOptions={{ color: active ? "#EA580C" : "#1f2937", weight: 2, fillOpacity: 0.9 }}
              eventHandlers={{ click: () => onSelect?.(p.cc) }}>
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
