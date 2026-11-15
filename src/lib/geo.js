// Distance and shape helpers. Points are { lat, lng } objects unless noted.

const EARTH = 6_371_000 // radius in metres
const rad = (degrees) => (degrees * Math.PI) / 180

// Straight-line metres between two points (the haversine formula, which
// allows for the earth being round).
export function metresBetween(a, b) {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH * Math.asin(Math.sqrt(h))
}

// Nobody walks in a straight line through buildings, so the distance is padded
// by 30% to stand in for following streets. 80 metres a minute is an ordinary
// walking pace. The result is a rough guide, which is why the site always
// words it as "about".
export function walkMinutes(from, to) {
  return Math.max(1, Math.round((metresBetween(from, to) * 1.3) / 80))
}

// Footprints are stored as GeoJSON, which lists points as [lng, lat]. Leaflet
// wants [lat, lng]. Returns what Leaflet's Polygon takes: a list of rings for
// a Polygon, or a list of those for a MultiPolygon.
export function footprintToLatLngs(footprint) {
  const flip = (ring) => ring.map(([lng, lat]) => [lat, lng])
  if (footprint.type === 'Polygon') return footprint.coordinates.map(flip)
  return footprint.coordinates.map((polygon) => polygon.map(flip))
}

// The corners of the smallest box around a building: [[south, west], [north, east]].
// A building with no footprint is a single point, so its box has no size.
export function buildingBounds(building) {
  if (!building.footprint) {
    return [
      [building.lat, building.lng],
      [building.lat, building.lng],
    ]
  }

  const polygons = building.footprint.type === 'Polygon' ? [building.footprint.coordinates] : building.footprint.coordinates
  // Only outer rings matter here; a courtyard can't stick out past the walls.
  const points = polygons.flatMap((polygon) => polygon[0])
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}

// One box around a whole set of buildings, for fitting the map to them.
export function boundsOfAll(buildings) {
  const boxes = buildings.map(buildingBounds)
  return [
    [Math.min(...boxes.map((b) => b[0][0])), Math.min(...boxes.map((b) => b[0][1]))],
    [Math.max(...boxes.map((b) => b[1][0])), Math.max(...boxes.map((b) => b[1][1]))],
  ]
}

export function inBox(point, box) {
  return point.lat >= box.minLat && point.lat <= box.maxLat && point.lng >= box.minLng && point.lng <= box.maxLng
}

// Pulls a point back to the nearest edge of the box if it has strayed outside.
export function clampToBox(point, box) {
  return {
    lat: Math.min(box.maxLat, Math.max(box.minLat, point.lat)),
    lng: Math.min(box.maxLng, Math.max(box.minLng, point.lng)),
  }
}
