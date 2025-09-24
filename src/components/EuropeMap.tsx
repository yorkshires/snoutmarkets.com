// src/components/EuropeMap.tsx
import dynamic from "next/dynamic";

// Wrap the client-only Leaflet map so it's never rendered on the server
const EuropeMap = dynamic(() => import("./EuropeMap.client"), {
  ssr: false,
  // (optional) show nothing while loading — avoids layout shift in the filter box
  loading: () => null,
});

export default EuropeMap;
