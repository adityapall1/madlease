// Refresh the quiet campus backdrop from OSM. Never called by the website.
import { writeFile } from 'node:fs/promises'
import { apartments } from './seed-data.mjs'

const lat = apartments.map(a => a.coords[0])
const lng = apartments.map(a => a.coords[1])
const bounds = [[Math.min(...lat) - .012, Math.min(...lng) - .018], [Math.max(...lat) + .012, Math.max(...lng) + .018]]
const query = `[out:json][timeout:60];(way[building](${bounds.flat().join(',')});way[highway](${bounds.flat().join(',')}););out geom;`
const response = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'MadLease-campus-map/1.0' },
  body: 'data=' + encodeURIComponent(query),
  signal: AbortSignal.timeout(75000),
})
if (!response.ok) throw new Error(`Overpass: ${response.status}`)
const { elements } = await response.json()
const buildings = [], streets = []
for (const way of elements) {
  if (!way.geometry?.length) continue
  const points = way.geometry.map(p => [Number(p.lat.toFixed(6)), Number(p.lon.toFixed(6))])
  if (way.tags.building) buildings.push(points)
  else if (!['footway', 'pedestrian', 'path', 'steps', 'cycleway', 'service', 'track', 'construction', 'proposed'].includes(way.tags.highway)) streets.push(points)
}
await writeFile(new URL('../src/data/campus-map.json', import.meta.url), JSON.stringify({ bounds, buildings, streets }))
console.log(`Saved ${buildings.length} building outlines and ${streets.length} streets.`)
