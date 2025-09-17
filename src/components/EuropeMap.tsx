// src/components/EuropeMap.tsx
import dynamic from "next/dynamic";
import type { CountryCode } from "@/lib/europe";

const EuropeMapClient = dynamic(() => import("./EuropeMap.client"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] rounded-xl overflow-hidden border bg-white grid place-items-center text-sm text-slate-600">
      Loading map…
    </div>
  ),
});

export default function EuropeMap(props: {
  selected?: CountryCode | null;
  onSelect?: (cc: CountryCode) => void;
}) {
  return <EuropeMapClient {...props} />;
}
