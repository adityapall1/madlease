// Fetches building outlines and campus landmarks from OpenStreetMap, once, and
// writes them to files we commit. The website never talks to Overpass itself:
// it is a shared, volunteer-run server and far too slow to call on page load.
//
//   node scripts/fetch-osm.mjs        (Node 20 or newer)
//
// Writes:
//   supabase/06_footprints.sql   sets footprint and osm_id on the seeded buildings
//   src/data/landmarks.js        landmark points, used for walk times
//   src/data/madison.js          the box a dropped pin has to stay inside
//
// Nothing here is typed in by hand. Every coordinate that comes out of this
// script came from OpenStreetMap.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apartments } from './seed-data.mjs'

const ENDPOINT = 'https://overpass-api.de/api/interpreter'
// Overpass asks scripts to say who they are, so a server admin can tell what a
// burst of requests was for.
const USER_AGENT = 'MadLease-footprints/1.0 (student sublease map; one-off building outline fetch)'

// How far from a building's point we will accept an outline, in metres.
const NEAR = 30

const LANDMARKS = [
  { id: 'bascom', name: 'Bascom Hall', short: 'Bascom' },
  { id: 'memorial-union', name: 'Memorial Union', short: 'Memorial Union' },
  { id: 'union-south', name: 'Union South', short: 'Union South' },
  { id: 'college-library', name: 'College Library', short: 'College Library' },
  { id: 'engineering', name: 'Engineering Hall', short: 'Engineering Hall' },
  { id: 'morgridge', name: 'Morgridge Hall', short: 'Morgridge Hall' },
]

const root = fileURLToPath(new URL('..', import.meta.url))
const wait = (ms) => new Promise((done) => setTimeout(done, ms))

// ---------------------------------------------------------------------------
// Talking to Overpass
// ---------------------------------------------------------------------------

async function send(query) {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
    body: 'data=' + encodeURIComponent(query),
  })
}

// One retry, then give up. 429 and 504 are Overpass saying "busy, come back
// later"; it also uses 502 and 503 for the same thing when its queue is full.
// Retrying in a loop would only add to the load.
async function overpass(query) {
  let res = await send(query)
  if ([429, 502, 503, 504].includes(res.status)) {
    console.log(`  Overpass is busy (${res.status}). Waiting 30 seconds, then trying once more.`)
    await wait(30_000)
    res = await send(query)
  }
  if (!res.ok) throw new Error(`Overpass answered ${res.status}. Try again in a few minutes.`)

  const data = await res.json()
  // A query that runs out of time still comes back as 200, with a remark.
  if (data.remark) throw new Error(`Overpass could not finish the query: ${data.remark}`)
  return data.elements
}

// ---------------------------------------------------------------------------
// Geometry. Points are [lng, lat], the order GeoJSON uses.
// ---------------------------------------------------------------------------

const isClosed = (ring) => {
  const first = ring[0]
  const last = ring[ring.length - 1]
  return first[0] === last[0] && first[1] === last[1]
}

const toRing = (geometry) => geometry.map((p) => [p.lon, p.lat])

// Signed area in square degrees. Only ever compared with other areas nearby,
// so there is no need to convert to metres.
function ringArea(ring) {
  let sum = 0
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return sum / 2
}

// The balance point of a ring. Unlike the middle of its bounding box, this
// stays inside an L-shaped building's bulk.
function ringCentroid(ring) {
  const area = ringArea(ring)
  let x = 0
  let y = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const cross = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    x += (ring[i][0] + ring[i + 1][0]) * cross
    y += (ring[i][1] + ring[i + 1][1]) * cross
  }
  return [x / (6 * area), y / (6 * area)]
}

// Classic ray casting: count how many edges a line going right from the point
// crosses. An odd count means the point is inside.
function inRing(point, ring) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// A polygon is [outer, ...holes]. Inside the outline but not in a courtyard.
const inPolygon = (point, polygon) =>
  inRing(point, polygon[0]) && !polygon.slice(1).some((hole) => inRing(point, hole))

// Metres from a point to the closest edge of a ring. Near Madison a degree of
// longitude is shorter than a degree of latitude, so scale it before measuring.
function metresToRing(point, ring) {
  const perDegLat = 111_320
  const perDegLng = perDegLat * Math.cos((point[1] * Math.PI) / 180)
  const flat = ([lng, lat]) => [(lng - point[0]) * perDegLng, (lat - point[1]) * perDegLat]

  let best = Infinity
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, ay] = flat(ring[i])
    const [bx, by] = flat(ring[i + 1])
    const dx = bx - ax
    const dy = by - ay
    const len = dx * dx + dy * dy
    // How far along the edge the closest spot is, kept between its two ends.
    const t = len === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len))
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy))
  }
  return best
}

// Turns an Overpass element into a list of polygons, or null if its shape
// can't be used. A way is one outline. A relation is a set of outer rings
// (separate wings) and inner rings (courtyards).
function polygonsOf(el) {
  if (el.type === 'way' && el.geometry) {
    const ring = toRing(el.geometry)
    return isClosed(ring) && ring.length >= 4 ? [[ring]] : null
  }

  if (el.type === 'relation' && el.members) {
    const rings = el.members
      .filter((m) => m.type === 'way' && m.geometry)
      .map((m) => ({ role: m.role, ring: toRing(m.geometry) }))
    // Some relations split one outline across several ways. Stitching those
    // together is fiddly and none of our buildings need it, so skip them
    // rather than guess.
    if (rings.length === 0 || rings.some((r) => !isClosed(r.ring))) return null

    const polygons = rings.filter((r) => r.role !== 'inner').map((r) => [r.ring])
    for (const hole of rings.filter((r) => r.role === 'inner')) {
      const owner = polygons.find((polygon) => inRing(hole.ring[0], polygon[0]))
      if (owner) owner.push(hole.ring)
    }
    return polygons.length > 0 ? polygons : null
  }

  return null
}

const totalArea = (polygons) => polygons.reduce((sum, p) => sum + Math.abs(ringArea(p[0])), 0)

const toGeoJSON = (polygons) =>
  polygons.length === 1
    ? { type: 'Polygon', coordinates: polygons[0] }
    : { type: 'MultiPolygon', coordinates: polygons }

// ---------------------------------------------------------------------------
// Step 1: building outlines
// ---------------------------------------------------------------------------

console.log(`Asking Overpass for outlines near ${apartments.length} buildings...`)

// One request for all buildings. Each line asks for anything tagged as a
// building within 30 m of our point; "out geom" includes the outline itself.
const buildingQuery = `[out:json][timeout:90];
(
${apartments.map((a) => `  wr(around:${NEAR},${a.coords[0]},${a.coords[1]})["building"];`).join('\n')}
);
out geom;`

const shapes = (await overpass(buildingQuery))
  .map((el) => ({ el, polygons: polygonsOf(el) }))
  .filter((s) => s.polygons)

const updates = []
const unmatched = []

for (const apt of apartments) {
  const point = [apt.coords[1], apt.coords[0]]

  // Best case: our point sits inside an outline. If it sits inside more than
  // one, the smallest is the most specific.
  const around = shapes
    .filter((s) => s.polygons.some((polygon) => inPolygon(point, polygon)))
    .sort((a, b) => totalArea(a.polygons) - totalArea(b.polygons))
  let pick = around[0]
  let how = 'point is inside'

  // Otherwise take the closest outline, but only if it is really close.
  if (!pick) {
    const byDistance = shapes
      .map((s) => ({ ...s, metres: Math.min(...s.polygons.map((p) => metresToRing(point, p[0]))) }))
      .sort((a, b) => a.metres - b.metres)
    if (byDistance[0] && byDistance[0].metres <= NEAR) {
      pick = byDistance[0]
      how = `nearest, ${byDistance[0].metres.toFixed(0)} m away`
    }
  }

  if (!pick) {
    unmatched.push(apt.name)
    console.log(`  ${apt.name}: no outline found, leaving footprint empty`)
    continue
  }

  const osmName = pick.el.tags?.name ?? '(unnamed in OSM)'
  console.log(`  ${apt.name}: ${pick.el.type} ${pick.el.id} "${osmName}" (${how})`)
  updates.push({ id: apt.id, name: apt.name, osmId: pick.el.id, footprint: toGeoJSON(pick.polygons) })
}

const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`

const sql = `-- MadLease, file 6 of 6: real building outlines.
--
-- Generated by scripts/fetch-osm.mjs from OpenStreetMap data
-- (© OpenStreetMap contributors). Do not edit by hand: run the script again.
-- Run this after 05_seed.sql, since it updates the buildings that file creates.
${unmatched.length > 0 ? `--\n-- No outline was found for: ${unmatched.join(', ')}. Those stay as dots on the map.\n` : ''}
${updates
  .map(
    (u) =>
      `-- ${u.name}\nupdate public.buildings set osm_id = ${u.osmId}, footprint = ${sqlText(JSON.stringify(u.footprint))}::jsonb where id = ${sqlText(u.id)};`,
  )
  .join('\n\n')}
`
writeFileSync(root + 'supabase/06_footprints.sql', sql)
console.log(`Wrote supabase/06_footprints.sql (${updates.length} of ${apartments.length} buildings).`)

// ---------------------------------------------------------------------------
// Step 2: landmarks, and the edge of Madison
// ---------------------------------------------------------------------------

// Be polite: leave a gap between the two requests.
await wait(5_000)
console.log('Asking Overpass for campus landmarks and the city boundary...')

// Landmarks are searched for within 2.5 km of the middle of our buildings,
// which covers campus without matching a "Memorial Union" in another city.
const midLat = apartments.reduce((sum, a) => sum + a.coords[0], 0) / apartments.length
const midLng = apartments.reduce((sum, a) => sum + a.coords[1], 0) / apartments.length

// The last three lines find the city boundary that contains one of our
// buildings and ask only for its bounding box ("out bb").
const landmarkQuery = `[out:json][timeout:60];
(
${LANDMARKS.map((l) => `  nwr["name"="${l.name}"](around:2500,${midLat.toFixed(5)},${midLng.toFixed(5)});`).join('\n')}
);
out geom;
is_in(${apartments[0].coords[0]},${apartments[0].coords[1]})->.here;
rel(pivot.here)["boundary"="administrative"]["admin_level"="8"];
out bb;`

const found = await overpass(landmarkQuery)

const landmarks = []
for (const mark of LANDMARKS) {
  // A name can match more than the building: Memorial Union is also the name
  // of a bike-share dock outside it. Prefer real buildings, then the biggest.
  const matches = found
    .filter((el) => el.tags?.name === mark.name && el.tags?.boundary !== 'administrative')
    .map((el) => ({ el, polygons: polygonsOf(el) }))
    .filter((m) => m.polygons || isPoint(m.el))
    .sort((a, b) => {
      const aBuilding = a.el.tags.building ? 1 : 0
      const bBuilding = b.el.tags.building ? 1 : 0
      if (aBuilding !== bBuilding) return bBuilding - aBuilding
      return (b.polygons ? totalArea(b.polygons) : 0) - (a.polygons ? totalArea(a.polygons) : 0)
    })

  const best = matches[0]
  if (!best) {
    console.log(`  ${mark.name}: not found in OpenStreetMap, skipping`)
    continue
  }

  // A shape's centre is the centroid of its largest outer ring. A lone point
  // (College Library is mapped as one) is already its own centre.
  let centre
  if (best.polygons) {
    const largest = [...best.polygons].sort((a, b) => Math.abs(ringArea(b[0])) - Math.abs(ringArea(a[0])))[0]
    centre = ringCentroid(largest[0])
  } else {
    centre = [best.el.lon, best.el.lat]
  }

  console.log(`  ${mark.name}: ${best.el.type} ${best.el.id}`)
  landmarks.push({ ...mark, lat: Number(centre[1].toFixed(6)), lng: Number(centre[0].toFixed(6)) })
}

function isPoint(el) {
  return el.type === 'node' && typeof el.lat === 'number'
}

writeFileSync(
  root + 'src/data/landmarks.js',
  `// Campus landmarks that walk times are measured to.
//
// Generated by scripts/fetch-osm.mjs from OpenStreetMap data
// (© OpenStreetMap contributors). Do not edit by hand: run the script again.
// Each point is the centre of the building's outline.

export const landmarks = [
${landmarks.map((l) => `  { id: '${l.id}', name: '${l.name}', short: '${l.short}', lat: ${l.lat}, lng: ${l.lng} },`).join('\n')}
]
`,
)
console.log(`Wrote src/data/landmarks.js (${landmarks.length} of ${LANDMARKS.length} landmarks).`)

const city = found.find((el) => el.tags?.boundary === 'administrative' && el.bounds)
if (!city) {
  console.log('  City boundary not found. src/data/madison.js was left as it is.')
} else {
  // Round outward to two decimals (about a kilometre) so the box is never
  // tighter than the real boundary.
  const down = (n) => Math.floor(n * 100) / 100
  const up = (n) => Math.ceil(n * 100) / 100
  const box = {
    minLat: down(city.bounds.minlat),
    maxLat: up(city.bounds.maxlat),
    minLng: down(city.bounds.minlon),
    maxLng: up(city.bounds.maxlon),
  }

  writeFileSync(
    root + 'src/data/madison.js',
    `// The box a dropped pin has to stay inside.
//
// Generated by scripts/fetch-osm.mjs: the bounding box of the City of
// ${city.tags.name} boundary in OpenStreetMap, rounded outward. The same four
// numbers are in the buildings_in_madison check in supabase/01_schema.sql,
// which is the real guard. Keep the two in sync.

export const madisonBox = { minLat: ${box.minLat}, maxLat: ${box.maxLat}, minLng: ${box.minLng}, maxLng: ${box.maxLng} }
`,
  )
  console.log(`Wrote src/data/madison.js: lat ${box.minLat} to ${box.maxLat}, lng ${box.minLng} to ${box.maxLng}`)
}

console.log('Done.')
