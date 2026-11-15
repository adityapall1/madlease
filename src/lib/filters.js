// Browse filters: reading them from the URL, writing them back, and applying
// them to the listings in memory.
//
// The URL is the single source of truth. That is what makes a refresh keep the
// filters, the back button undo the last change, and a copied link open the
// same view for someone else.

import { AMENITIES } from './constants.js'
import { metresBetween } from './geo.js'

export const SORTS = [
  { id: 'new', label: 'Newest' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
  { id: 'soon', label: 'Soonest available' },
  { id: 'near', label: 'Closest to landmark' },
]

// "4" stands for 4 or more.
export const BED_CHIPS = [
  { id: '0', label: 'Studio' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4+' },
]

export const BATH_CHOICES = ['1', '1.5', '2', '3']

const DATE = /^\d{4}-\d{2}-\d{2}$/

// Short parameter names keep shared links readable:
//   /browse?q=james&beds=1,2&max=1500&sort=low&b=james
const EMPTY = {
  q: '',
  min: '',
  max: '',
  beds: [],
  baths: '',
  type: '',
  furnished: false,
  amenities: [],
  moveIn: '',
  moveOut: '',
  sort: 'new',
  building: '',
}

const number = (text) => (/^\d+(\.\d+)?$/.test(text ?? '') ? text : '')
const pickList = (text, allowed) => (text ?? '').split(',').filter((item) => allowed.includes(item))

// Anything unexpected in the URL is dropped rather than trusted, since people
// can type whatever they like up there.
export function readFilters(params) {
  const sort = params.get('sort')
  const type = params.get('type')
  return {
    q: params.get('q') ?? '',
    min: number(params.get('min')),
    max: number(params.get('max')),
    beds: pickList(
      params.get('beds'),
      BED_CHIPS.map((chip) => chip.id),
    ),
    baths: BATH_CHOICES.includes(params.get('baths')) ? params.get('baths') : '',
    type: type === 'entire' || type === 'room' ? type : '',
    furnished: params.get('furn') === '1',
    amenities: pickList(
      params.get('am'),
      AMENITIES.map((a) => a.id),
    ),
    moveIn: DATE.test(params.get('in') ?? '') ? params.get('in') : '',
    moveOut: DATE.test(params.get('out') ?? '') ? params.get('out') : '',
    sort: SORTS.some((s) => s.id === sort) ? sort : EMPTY.sort,
    building: params.get('b') ?? '',
  }
}

// Only what differs from the defaults is written, so a plain /browse stays plain.
export function writeFilters(f) {
  const params = new URLSearchParams()
  if (f.q.trim()) params.set('q', f.q)
  if (f.min) params.set('min', f.min)
  if (f.max) params.set('max', f.max)
  if (f.beds.length > 0) params.set('beds', f.beds.join(','))
  if (f.baths) params.set('baths', f.baths)
  if (f.type) params.set('type', f.type)
  if (f.furnished) params.set('furn', '1')
  if (f.amenities.length > 0) params.set('am', f.amenities.join(','))
  if (f.moveIn) params.set('in', f.moveIn)
  if (f.moveOut) params.set('out', f.moveOut)
  if (f.sort !== EMPTY.sort) params.set('sort', f.sort)
  if (f.building) params.set('b', f.building)
  return params
}

// Clearing filters keeps the sort and the selected building: those are about
// how the results are shown, not which ones match.
export function clearFilters(f) {
  return { ...EMPTY, sort: f.sort, building: f.building }
}

// How many filters are on, for the badge on the Filters button.
export function countFilters(f) {
  return [
    f.q.trim(),
    f.min || f.max,
    f.beds.length > 0,
    f.baths,
    f.type,
    f.furnished,
    f.amenities.length > 0,
    f.moveIn || f.moveOut,
  ].filter(Boolean).length
}

// Does one listing pass every filter that is switched on? The selected
// building is not checked here, because the map needs to know what matches at
// every building, not just the selected one.
export function matches(listing, f) {
  const q = f.q.trim().toLowerCase()
  if (q) {
    const place = `${listing.building?.name ?? ''} ${listing.building?.address ?? ''}`.toLowerCase()
    if (!place.includes(q)) return false
  }

  if (f.min && listing.rent < Number(f.min)) return false
  if (f.max && listing.rent > Number(f.max)) return false

  if (f.beds.length > 0) {
    const chip = listing.beds >= 4 ? '4' : String(listing.beds)
    if (!f.beds.includes(chip)) return false
  }

  if (f.baths && Number(listing.baths) < Number(f.baths)) return false
  if (f.type && listing.unit_type !== f.type) return false
  if (f.furnished && !listing.furnished) return false
  if (!f.amenities.every((a) => listing.amenities.includes(a))) return false

  // Dates are "2027-01-01" text, which sorts the same way the dates do, so
  // plain comparison works. Moving in: the sublease must have started by then
  // and still be running. Moving out: it must last at least that long.
  if (f.moveIn && !(listing.start_date <= f.moveIn && listing.end_date > f.moveIn)) return false
  if (f.moveOut && !(listing.end_date >= f.moveOut)) return false

  return true
}

// Returns a new sorted list. `landmark` is only used by "closest".
export function sortListings(rows, sort, landmark) {
  const list = [...rows]
  if (sort === 'low') return list.sort((a, b) => a.rent - b.rent)
  if (sort === 'high') return list.sort((a, b) => b.rent - a.rent)
  if (sort === 'soon') return list.sort((a, b) => a.start_date.localeCompare(b.start_date))
  if (sort === 'near' && landmark) {
    const far = (row) => (row.building ? metresBetween(row.building, landmark) : Infinity)
    return list.sort((a, b) => far(a) - far(b))
  }
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at))
}
