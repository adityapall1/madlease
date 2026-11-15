// The CARTO basemap key. It is public, like the Supabase key: it only meters
// tile requests. When it is missing the map falls back to plain OpenStreetMap
// tiles, so a fresh clone still shows a map.
export const cartoKey = import.meta.env.VITE_CARTO_KEY ?? ''
export const hasCarto = Boolean(cartoKey)
