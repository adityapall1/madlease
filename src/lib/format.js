// Every price, unit and date shown anywhere on the site goes through these
// functions. The map, the list and the detail view all call the same ones, so
// they can never disagree about a listing's numbers.

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// "$1,150"
export function formatMoney(amount) {
  return dollars.format(amount)
}

const BASIS = { per_person: 'per person', whole_unit: 'whole unit' }

// "$1,150/mo per person" or "$2,300/mo whole unit". The basis is always shown
// next to the price because the two are easy to mix up.
export function formatRent(listing) {
  return `${formatMoney(listing.rent)}/mo ${BASIS[listing.rent_basis]}`
}

// How many listings are in a set, and the cheapest and most expensive of them.
export function leaseSummary(rows) {
  const rents = rows.map((row) => row.rent)
  if (rents.length === 0) return { count: 0, min: null, max: null }
  return { count: rents.length, min: Math.min(...rents), max: Math.max(...rents) }
}

// "$975 – $3,200", or just "$1,450" when there is only one price.
export function formatRange(summary) {
  if (summary.count === 0) return 'No subleases listed'
  const low = formatMoney(summary.min)
  if (summary.min === summary.max) return low
  return `${low} – ${formatMoney(summary.max)}`
}

// "from $975", used on the map.
export function formatFrom(summary) {
  return summary.count === 0 ? '' : `from ${formatMoney(summary.min)}`
}

export function formatBeds(beds) {
  return beds === 0 ? 'Studio' : `${beds} bed`
}

export function formatBaths(baths) {
  return `${Number(baths)} bath`
}

// "3 listings", "1 listing"
export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

// "2 bed · 1 bath · whole unit" or "Room · 2 roommates"
export function formatUnit(listing) {
  if (listing.unit_type === 'room') return `Room · ${plural(listing.roommates, 'roommate')}`
  return `${formatBeds(listing.beds)} · ${formatBaths(listing.baths)} · whole unit`
}

// The detail view has room to say what the room is part of:
// "Room in a 4 bed · 2 bath · 3 roommates"
export function formatUnitLong(listing) {
  if (listing.unit_type !== 'room') return formatUnit(listing)
  const place = listing.beds === 0 ? 'studio' : `${listing.beds} bed`
  return `Room in a ${place} · ${formatBaths(listing.baths)} · ${plural(listing.roommates, 'roommate')}`
}

// Dates come from the database as "2027-01-01". new Date("2027-01-01") reads
// that as midnight in London, which is still the day before in Madison, so
// build the date from its parts instead.
export function parseDate(text) {
  const [year, month, day] = text.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// A Date back to "2027-01-01", in local time.
export function toISO(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function today() {
  return toISO(new Date())
}

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// "Jan 1 – Aug 31, 2027", or "Dec 1, 2026 – May 31, 2027" across a new year.
export function formatDates(start, end) {
  const from = parseDate(start)
  const to = parseDate(end)
  const first = from.getFullYear() === to.getFullYear() ? shortDate.format(from) : fullDate.format(from)
  return `${first} – ${fullDate.format(to)}`
}

// "8 months". Short stays are given in weeks so they don't round to nothing.
export function formatLength(start, end) {
  const days = Math.round((parseDate(end) - parseDate(start)) / 86_400_000) + 1
  if (days < 25) return plural(Math.max(1, Math.round(days / 7)), 'week')
  return plural(Math.round(days / 30.44), 'month')
}

// Always "about": the time is an estimate from a straight-line distance.
export function formatWalk(minutes, landmark) {
  return `about ${minutes} min walk to ${landmark.short}`
}
