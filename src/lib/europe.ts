// src/lib/europe.ts
export type CountryCode =
  | "AL" | "AD" | "AT" | "BA" | "BE" | "BG" | "CH" | "CY" | "CZ" | "DE" | "DK"
  | "EE" | "ES" | "FI" | "FR" | "GB" | "GR" | "HR" | "HU" | "IE" | "IS" | "IT"
  | "LI" | "LT" | "LU" | "LV" | "ME" | "MK" | "MT" | "NL" | "NO" | "PL" | "PT"
  | "RO" | "RS" | "SE" | "SI" | "SK";

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  AL: "Albania",
  AD: "Andorra",
  AT: "Austria",
  BA: "Bosnia and Herzegovina",
  BE: "Belgium",
  BG: "Bulgaria",
  CH: "Switzerland",
  CY: "Cyprus",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  EE: "Estonia",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GR: "Greece",
  HR: "Croatia",
  HU: "Hungary",
  IE: "Ireland",
  IS: "Iceland",
  IT: "Italy",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  ME: "Montenegro",
  MK: "North Macedonia",
  MT: "Malta",
  NL: "Netherlands",
  NO: "Norway",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  RS: "Serbia",
  SE: "Sweden",
  SI: "Slovenia",
  SK: "Slovakia",
};

// approximate country centroids (lat, lon)
export const COUNTRY_CENTROIDS: Record<CountryCode, [number, number]> = {
  AL: [41.15, 20.17],
  AD: [42.55, 1.57],
  AT: [47.59, 14.13],
  BA: [44.17, 17.79],
  BE: [50.64, 4.66],
  BG: [42.73, 25.49],
  CH: [46.80, 8.23],
  CY: [35.10, 33.25],
  CZ: [49.74, 15.34],
  DE: [51.16, 10.45],
  DK: [56.26, 9.50],
  EE: [58.67, 25.53],
  ES: [40.30, -3.73],
  FI: [64.00, 26.00],
  FR: [46.23, 2.21],
  GB: [52.36, -1.17],
  GR: [39.07, 22.95],
  HR: [45.10, 15.20],
  HU: [47.16, 19.50],
  IE: [53.41, -8.24],
  IS: [64.96, -19.02],
  IT: [42.50, 12.50],
  LI: [47.17, 9.54],
  LT: [55.34, 23.90],
  LU: [49.81, 6.13],
  LV: [56.88, 24.60],
  ME: [42.79, 19.23],
  MK: [41.60, 21.70],
  MT: [35.89, 14.45],
  NL: [52.21, 5.29],
  NO: [60.47, 8.47],
  PL: [52.00, 19.15],
  PT: [39.40, -8.22],
  RO: [45.94, 24.97],
  RS: [44.12, 20.84],
  SE: [60.13, 18.64],
  SI: [46.15, 14.99],
  SK: [48.67, 19.70],
};

export function toRad(n: number) {
  return (n * Math.PI) / 180;
}

export function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
