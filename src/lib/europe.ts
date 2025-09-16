// src/lib/europe.ts
export type CountryCode =
  | "AL" | "AD" | "AT" | "BA" | "BE" | "BG" | "CH" | "CY" | "CZ" | "DE" | "DK"
  | "EE" | "ES" | "FI" | "FR" | "GB" | "GR" | "HR" | "HU" | "IE" | "IS" | "IT"
  | "LI" | "LT" | "LU" | "LV" | "ME" | "MK" | "MT" | "NL" | "NO" | "PL" | "PT"
  | "RO" | "RS" | "SE" | "SI" | "SK";

export const COUNTRY_NAMES: Record<CountryCode,string> = {
  AL:"Albania", AD:"Andorra", AT:"Austria", BA:"Bosnia and Herzegovina", BE:"Belgium",
  BG:"Bulgaria", CH:"Switzerland", CY:"Cyprus", CZ:"Czechia", DE:"Germany", DK:"Denmark",
  EE:"Estonia", ES:"Spain", FI:"Finland", FR:"France", GB:"United Kingdom", GR:"Greece",
  HR:"Croatia", HU:"Hungary", IE:"Ireland", IS:"Iceland", IT:"Italy", LI:"Liechtenstein",
  LT:"Lithuania", LU:"Luxembourg", LV:"Latvia", ME:"Montenegro", MK:"North Macedonia",
  MT:"Malta", NL:"Netherlands", NO:"Norway", PL:"Poland", PT:"Portugal", RO:"Romania",
  RS:"Serbia", SE:"Sweden", SI:"Slovenia", SK:"Slovakia"
};

// rough lat/lon centroids (deg)
export const COUNTRY_CENTROIDS: Record<CountryCode, [number, number]> = {
  AL:[41.1533,20.1683], AD:[42.5063,1.5218], AT:[47.5162,14.5501], BA:[43.9159,17.6791],
  BE:[50.5039,4.4699], BG:[42.7339,25.4858], CH:[46.8182,8.2275], CY:[35.1264,33.4299],
  CZ:[49.8175,15.4730], DE:[51.1657,10.4515], DK:[56.2639,9.5018], EE:[58.5953,25.0136],
  ES:[40.4637,-3.7492], FI:[61.9241,25.7482], FR:[46.2276,2.2137], GB:[55.3781,-3.4360],
  GR:[39.0742,21.8243], HR:[45.1000,15.2000], HU:[47.1625,19.5033], IE:[53.1424,-7.6921],
  IS:[64.9631,-19.0208], IT:[41.8719,12.5674], LI:[47.1660,9.5554], LT:[55.1694,23.8813],
  LU:[49.8153,6.1296], LV:[56.8796,24.6032], ME:[42.7087,19.3744], MK:[41.6086,21.7453],
  MT:[35.9375,14.3754], NL:[52.1326,5.2913], NO:[60.4720,8.4689], PL:[51.9194,19.1451],
  PT:[39.3999,-8.2245], RO:[45.9432,24.9668], RS:[44.0165,21.0059], SE:[60.1282,18.6435],
  SI:[46.1512,14.9955], SK:[48.6690,19.6990]
};

export function haversineKm(a:[number,number], b:[number,number]) {
  const R = 6371;
  const toRad = (d:number) => (d*Math.PI)/180;
  const dLat = toRad(b[0]-a[0]);
  const dLon = toRad(b[1]-a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const s =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}

export function countriesWithin(my: CountryCode, maxKm: number): CountryCode[] {
  const me = COUNTRY_CENTROIDS[my];
  return (Object.keys(COUNTRY_CENTROIDS) as CountryCode[]).filter((cc) => {
    const d = haversineKm(me, COUNTRY_CENTROIDS[cc]);
    return d <= maxKm;
  });
}
