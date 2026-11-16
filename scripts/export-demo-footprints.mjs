// Reuse the existing OSM snapshot for browser-only demos; no invented coordinates.
import { readFile, writeFile } from 'node:fs/promises'

const sql = await readFile(new URL('../supabase/06_footprints.sql', import.meta.url), 'utf8')
const footprints = Object.fromEntries([...sql.matchAll(/footprint = '(.*?)'::jsonb where id = '(.*?)'/g)]
  .map(([, geometry, id]) => [id, JSON.parse(geometry)]))
if (!Object.keys(footprints).length) throw new Error('No OSM footprints found in the snapshot')
await writeFile(new URL('../src/data/demo-footprints.json', import.meta.url), JSON.stringify(footprints))
console.log(`Exported ${Object.keys(footprints).length} OSM building footprints`)
