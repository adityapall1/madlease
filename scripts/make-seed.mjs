// Turns scripts/seed-data.mjs into supabase/05_seed.sql: the 26 buildings, plus
// every made-up lease as a demo listing with no owner.
//
//   node scripts/make-seed.mjs
//
// Running it twice gives the same file, and running the SQL twice gives the
// same rows, because nothing here is random.

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apartments } from './seed-data.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))

// The seed data only has beds, baths, rent and months. The rest of a listing
// (furnished, amenities, room or whole unit) is filled in below. Newer student
// high-rises get the amenities those buildings tend to have.
const NEWER = [
  'hub', 'oliv', 'ovation', 'james', 'la-ciel', 'lux', 'domain', 'rive',
  'x01', 'grand-central', 'lark-at-kohl', 'university-square', 'collegiate',
]

// How each amenity reads in a sentence that starts "Includes ...". Pets get
// their own sentence, since "includes pets" says the wrong thing.
const AMENITY_WORDS = {
  laundry: 'in-unit laundry',
  parking: 'a parking spot',
  gym: 'a gym in the building',
  utilities: 'utilities',
  ac: 'AC',
  balcony: 'a balcony',
  dishwasher: 'a dishwasher',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// A number from 0 to 99 that is always the same for the same text. It stands
// in for Math.random so the output never changes between runs.
function roll(text) {
  return createHash('sha1').update(text).digest().readUInt32BE(0) % 100
}

// A fixed id per demo listing, so running the seed again updates the same rows
// instead of adding copies. It is a hash of the lease's old id, laid out the
// way a UUID is.
function demoId(key) {
  const hex = createHash('sha1').update(`madlease-demo:${key}`).digest('hex')
  const variant = '89ab'[parseInt(hex[16], 16) % 4]
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

// "Jan 2027" -> the 1st of that month, or its last day.
function monthDate(text, edge) {
  const [name, year] = text.split(' ')
  const month = MONTHS.indexOf(name)
  if (month < 0) throw new Error(`Unknown month in "${text}"`)
  // Day 0 of the next month is the last day of this one.
  const day = edge === 'start' ? 1 : new Date(Date.UTC(Number(year), month + 1, 0)).getUTCDate()
  return { iso: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, month, day, year }
}

const sayDate = (d) => `${LONG_MONTHS[d.month]} ${d.day}`

function list(words) {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

// Rounds to the nearest $5 so split prices look like real asking prices.
const tidy = (dollars) => Math.round(dollars / 5) * 5

function makeListing(apt, lease) {
  const newer = NEWER.includes(apt.id)

  // Most listings are a whole unit at its full price. Some multi-bedroom ones
  // become a single room, and some are a whole unit priced per person, because
  // real sublease posts come in all three shapes.
  const kind = lease.beds >= 2 ? roll(`${lease.id}:kind`) : 99
  const isRoom = kind < 25
  const perPerson = isRoom || kind < 45

  const amenities = []
  if (newer || roll(`${apt.id}:laundry`) < 25) amenities.push('laundry')
  if (roll(`${lease.id}:parking`) < 15) amenities.push('parking')
  if (newer) amenities.push('gym')
  if (roll(`${lease.id}:pets`) < 20) amenities.push('pets')
  if (roll(`${lease.id}:utilities`) < 30) amenities.push('utilities')
  if (newer || roll(`${apt.id}:ac`) < 60) amenities.push('ac')
  if (roll(`${lease.id}:balcony`) < 25) amenities.push('balcony')
  if (newer || roll(`${apt.id}:dishwasher`) < 40) amenities.push('dishwasher')

  const furnished = roll(`${lease.id}:furnished`) < (newer ? 75 : 30)
  const start = monthDate(lease.start, 'start')
  const end = monthDate(lease.end, 'end')

  const size = lease.beds === 0 ? 'studio' : `${lease.beds} bed, ${lease.baths} bath apartment`
  const unitLine = isRoom
    ? `One bedroom in a ${size} at ${apt.name}, shared with ${lease.beds - 1} ${lease.beds - 1 === 1 ? 'roommate' : 'roommates'}.`
    : `Whole ${size} at ${apt.name}.`
  const priceLine = perPerson && !isRoom ? ' The price is per person.' : ''
  const included = amenities.filter((a) => a !== 'pets').map((a) => AMENITY_WORDS[a])
  const amenityLine =
    (included.length > 0 ? ` Includes ${list(included)}.` : '') + (amenities.includes('pets') ? ' Pets are allowed.' : '')

  let title = lease.beds === 0 ? `Studio at ${apt.name}` : `${lease.beds} bed at ${apt.name}`
  if (isRoom) title = `Room in a ${lease.beds} bed at ${apt.name}`

  return {
    id: demoId(lease.id),
    building_id: apt.id,
    title,
    unit_type: isRoom ? 'room' : 'entire',
    beds: lease.beds,
    baths: lease.baths,
    roommates: isRoom ? lease.beds - 1 : null,
    rent: perPerson ? tidy(lease.rent / lease.beds) : lease.rent,
    rent_basis: perPerson ? 'per_person' : 'whole_unit',
    furnished,
    amenities,
    start_date: start.iso,
    end_date: end.iso,
    description:
      `${unitLine}${priceLine} ${furnished ? 'Comes furnished.' : 'Unfurnished.'}${amenityLine} ` +
      `Available ${sayDate(start)} to ${sayDate(end)}, ${end.year}.\n\n` +
      'This is a demo listing with made-up details, here so you can try the site.',
    sortKey: roll(`${lease.id}:order`) * 1000 + roll(`${lease.id}:order2`),
  }
}

const listings = apartments.flatMap((apt) => apt.leases.map((lease) => makeListing(apt, lease)))

// Spread the "posted" times over a few weeks in a mixed-up order, so sorting
// by newest doesn't just walk through the buildings one by one.
const firstPost = Date.UTC(2026, 9, 20, 15)
;[...listings]
  .sort((a, b) => a.sortKey - b.sortKey)
  .forEach((row, i) => {
    row.created_at = new Date(firstPost + i * 7 * 60 * 60 * 1000).toISOString()
  })

// SQL text: wrap in single quotes and double any quote inside.
const q = (value) => `'${String(value).replaceAll("'", "''")}'`
const arr = (values) => (values.length > 0 ? `array[${values.map(q).join(', ')}]` : `'{}'::text[]`)

const buildingRows = apartments
  .map((a) => `  (${q(a.id)}, ${q(a.name)}, ${q(a.address)}, ${a.coords[0]}, ${a.coords[1]})`)
  .join(',\n')

const listingRows = listings
  .map(
    (l) =>
      `  (${q(l.id)}, ${q(l.building_id)}, null, true, ${q(l.title)}, ${q(l.unit_type)}, ${l.beds}, ${l.baths}, ` +
      `${l.roommates ?? 'null'}, ${l.rent}, ${q(l.rent_basis)}, ${l.furnished}, ${arr(l.amenities)}, ` +
      `${q(l.start_date)}, ${q(l.end_date)}, ${q(l.description)}, 'active', ${q(l.created_at)})`,
  )
  .join(',\n')

const sql = `-- MadLease, file 5 of 6: the starting data.
--
-- Generated by scripts/make-seed.mjs from scripts/seed-data.mjs. Do not edit
-- by hand: change the data file and run the script again.
--
-- ${apartments.length} real buildings (names, addresses and coordinates from OpenStreetMap)
-- and ${listings.length} demo listings. Demo listings have no owner and is_demo = true, so
-- the site labels them "Demo listing" and turns Contact off. Their prices,
-- sizes and dates are made up.
--
-- To clear the demo data out later:  delete from public.listings where is_demo;

insert into public.buildings (id, name, address, lat, lng) values
${buildingRows}
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng;

insert into public.listings (
  id, building_id, owner_id, is_demo, title, unit_type, beds, baths, roommates, rent, rent_basis,
  furnished, amenities, start_date, end_date, description, status, created_at
) values
${listingRows}
on conflict (id) do update set
  building_id = excluded.building_id,
  title = excluded.title,
  unit_type = excluded.unit_type,
  beds = excluded.beds,
  baths = excluded.baths,
  roommates = excluded.roommates,
  rent = excluded.rent,
  rent_basis = excluded.rent_basis,
  furnished = excluded.furnished,
  amenities = excluded.amenities,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  description = excluded.description;
`

writeFileSync(root + 'supabase/05_seed.sql', sql)

const rooms = listings.filter((l) => l.unit_type === 'room').length
const split = listings.filter((l) => l.unit_type === 'entire' && l.rent_basis === 'per_person').length
console.log(`Wrote supabase/05_seed.sql: ${apartments.length} buildings, ${listings.length} listings`)
console.log(`  ${rooms} rooms, ${split} whole units priced per person, ${listings.length - rooms - split} whole units at full price`)
console.log(`  ${listings.filter((l) => l.furnished).length} furnished`)
