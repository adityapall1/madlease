// Apartment buildings around the UW-Madison campus and downtown.
//
// Names, addresses and coordinates come from OpenStreetMap's own building data
// (queried through the Overpass API), so the markers land on the real buildings.
// Do not hand-edit the coordinates -- an eyeballed guess is how an earlier
// version of this file ended up putting The Embassy on top of Memorial Library.
//
// The leases are still placeholder data: every price, unit size and date below
// is made up. Swap the leases out for a real API response later; `apartments` is
// the only shape the UI depends on.

export const apartments = [
  {
    id: 'surfside',
    name: 'Surfside',
    address: '630 N Frances St',
    coords: [43.07676, -89.39555], // [lat, lng] -- the order Leaflet expects
    leases: [
      { id: 'surfside-1', beds: 1, baths: 1, rent: 1195, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'surfside-2', beds: 2, baths: 1, rent: 1650, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'alchemy',
    name: 'Alchemy Apartments',
    address: '620 N Lake St',
    coords: [43.07646, -89.39705],
    leases: [
      { id: 'alchemy-1', beds: 0, baths: 1, rent: 1150, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'alchemy-2', beds: 1, baths: 1, rent: 1340, start: 'Feb 2027', end: 'Aug 2027' },
      { id: 'alchemy-3', beds: 2, baths: 2, rent: 1890, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'waterfront',
    name: 'The Waterfront Apartments',
    address: '633 N Henry St',
    coords: [43.07756, -89.393],
    leases: [
      { id: 'waterfront-1', beds: 0, baths: 1, rent: 1025, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'waterfront-2', beds: 1, baths: 1, rent: 1275, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'waterfront-3', beds: 2, baths: 1, rent: 1720, start: 'Jun 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'langdon-hall',
    name: 'Langdon Hall Apartments',
    address: '633 Langdon St',
    coords: [43.07557, -89.39699],
    leases: [
      { id: 'langdon-hall-1', beds: 1, baths: 1, rent: 1095, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'langdon-hall-2', beds: 2, baths: 1, rent: 1580, start: 'Jan 2027', end: 'Jul 2027' },
    ],
  },
  {
    id: 'collegiate',
    name: 'Collegiate Madison',
    address: '515 N Lake St',
    coords: [43.0754, -89.39704],
    leases: [
      { id: 'collegiate-1', beds: 1, baths: 1, rent: 1420, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'collegiate-2', beds: 3, baths: 3, rent: 2650, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'collegiate-3', beds: 2, baths: 2, rent: 2150, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'towers-on-state',
    name: 'The Towers on State',
    address: '502 N Frances St',
    coords: [43.07516, -89.39574],
    leases: [
      { id: 'towers-on-state-1', beds: 0, baths: 1, rent: 1095, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'towers-on-state-2', beds: 2, baths: 1, rent: 1780, start: 'Jan 2027', end: 'Jul 2027' },
      { id: 'towers-on-state-3', beds: 1, baths: 1, rent: 1285, start: 'Mar 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'hawthorne',
    name: 'Hawthorne Apartments',
    address: '642 State St',
    coords: [43.07512, -89.39637],
    leases: [
      { id: 'hawthorne-1', beds: 1, baths: 1, rent: 1050, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'hawthorne-2', beds: 2, baths: 1, rent: 1490, start: 'Jun 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'statesider',
    name: 'The Statesider',
    address: '505 N Frances St',
    coords: [43.07511, -89.39512],
    leases: [
      { id: 'statesider-1', beds: 0, baths: 1, rent: 985, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'statesider-2', beds: 1, baths: 1, rent: 1240, start: 'May 2027', end: 'Aug 2027' },
      { id: 'statesider-3', beds: 1, baths: 1, rent: 1180, start: 'Feb 2027', end: 'Aug 2027' },
      { id: 'statesider-4', beds: 2, baths: 1, rent: 1695, start: 'Jan 2027', end: 'Jun 2027' },
    ],
  },
  {
    id: 'hub',
    name: 'The HUB Madison',
    address: '437 N Frances St',
    coords: [43.07437, -89.39509],
    leases: [
      { id: 'hub-1', beds: 1, baths: 1, rent: 1495, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'hub-2', beds: 4, baths: 4, rent: 3250, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'hub-3', beds: 2, baths: 2, rent: 2290, start: 'Apr 2027', end: 'Aug 2027' },
      { id: 'hub-4', beds: 0, baths: 1, rent: 1395, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'oliv',
    name: 'ōLiv Madison',
    address: '339 W Gorham St',
    coords: [43.07426, -89.39162],
    leases: [
      { id: 'oliv-1', beds: 1, baths: 1, rent: 1540, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'oliv-2', beds: 2, baths: 2, rent: 2310, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'oliv-3', beds: 4, baths: 4, rent: 3150, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'oliv-4', beds: 0, baths: 1, rent: 1430, start: 'Jun 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'ovation',
    name: 'Ovation 309',
    address: '309 W Johnson St',
    coords: [43.07415, -89.39013],
    leases: [
      { id: 'ovation-1', beds: 2, baths: 2, rent: 2050, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'ovation-2', beds: 1, baths: 1, rent: 1475, start: 'Jan 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'james',
    name: 'The James',
    address: '432 W Gorham St',
    coords: [43.07363, -89.3942],
    leases: [
      { id: 'james-1', beds: 0, baths: 1, rent: 1385, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'james-2', beds: 1, baths: 1, rent: 1590, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'james-3', beds: 2, baths: 2, rent: 2420, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'james-4', beds: 4, baths: 4, rent: 3390, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'varsity',
    name: 'Varsity Campus Apartments',
    address: '405 N Lake St',
    coords: [43.07352, -89.39722],
    leases: [
      { id: 'varsity-1', beds: 0, baths: 1, rent: 915, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'varsity-2', beds: 1, baths: 1, rent: 1120, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'varsity-3', beds: 2, baths: 1, rent: 1540, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'aberdeen',
    name: 'Aberdeen Apartments',
    address: '437 W Gorham St',
    coords: [43.07316, -89.39358],
    leases: [
      { id: 'aberdeen-1', beds: 1, baths: 1, rent: 1150, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'aberdeen-2', beds: 2, baths: 1, rent: 1640, start: 'Jan 2027', end: 'Jul 2027' },
      { id: 'aberdeen-3', beds: 3, baths: 2, rent: 2190, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'embassy',
    name: 'The Embassy',
    address: '505 University Ave',
    coords: [43.07287, -89.39437],
    leases: [
      { id: 'embassy-1', beds: 0, baths: 1, rent: 995, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'embassy-2', beds: 1, baths: 1, rent: 1210, start: 'May 2027', end: 'Aug 2027' },
      { id: 'embassy-3', beds: 2, baths: 1, rent: 1685, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'embassy-4', beds: 3, baths: 2, rent: 2340, start: 'Feb 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'la-ciel',
    name: 'La Ciel',
    address: '515 University Ave',
    coords: [43.07284, -89.39498],
    leases: [
      { id: 'la-ciel-1', beds: 1, baths: 1, rent: 1465, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'la-ciel-2', beds: 2, baths: 2, rent: 2180, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'la-ciel-3', beds: 0, baths: 1, rent: 1310, start: 'Apr 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'city-view',
    name: 'City View Apartments',
    address: '313 N Frances St',
    coords: [43.07267, -89.39555],
    leases: [
      { id: 'city-view-1', beds: 1, baths: 1, rent: 1075, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'city-view-2', beds: 2, baths: 1, rent: 1495, start: 'Feb 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'university-square',
    name: 'University Square',
    address: '324 N Lake St',
    coords: [43.07263, -89.39831],
    leases: [
      { id: 'university-square-1', beds: 1, baths: 1, rent: 1380, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'university-square-2', beds: 2, baths: 2, rent: 1995, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'university-square-3', beds: 4, baths: 2, rent: 2880, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'lux',
    name: 'The Lux',
    address: '433 W Johnson St',
    coords: [43.07264, -89.39241],
    leases: [
      { id: 'lux-1', beds: 1, baths: 1, rent: 1455, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'lux-2', beds: 2, baths: 2, rent: 2125, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'lux-3', beds: 4, baths: 2, rent: 2960, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'domain',
    name: 'Domain',
    address: '420 W Dayton St',
    coords: [43.07283, -89.39193],
    leases: [
      { id: 'domain-1', beds: 1, baths: 1, rent: 1610, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'domain-2', beds: 2, baths: 2, rent: 2395, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'domain-3', beds: 0, baths: 1, rent: 1450, start: 'Mar 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'rive',
    name: 'The Rive Madison',
    address: '506 W Johnson St',
    coords: [43.07231, -89.39417],
    leases: [
      { id: 'rive-1', beds: 0, baths: 1, rent: 1340, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'rive-2', beds: 1, baths: 1, rent: 1520, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'rive-3', beds: 2, baths: 2, rent: 2260, start: 'Apr 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'palisades',
    name: 'The Palisades',
    address: '535 W Johnson St',
    coords: [43.07173, -89.39505],
    leases: [
      { id: 'palisades-1', beds: 2, baths: 2, rent: 1920, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'palisades-2', beds: 3, baths: 2, rent: 2480, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'palisades-3', beds: 1, baths: 1, rent: 1395, start: 'Jun 2027', end: 'Aug 2027' },
      { id: 'palisades-4', beds: 2, baths: 2, rent: 2010, start: 'Feb 2027', end: 'Aug 2027' },
      { id: 'palisades-5', beds: 0, baths: 1, rent: 1130, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'x01',
    name: 'X01',
    address: '1001 University Ave',
    coords: [43.07292, -89.40282],
    leases: [
      { id: 'x01-1', beds: 1, baths: 1, rent: 1330, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'x01-2', beds: 2, baths: 2, rent: 2070, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'x01-3', beds: 0, baths: 1, rent: 1205, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'grand-central',
    name: 'Grand Central',
    address: '1022 W Johnson St',
    coords: [43.07246, -89.40368],
    leases: [
      { id: 'grand-central-1', beds: 1, baths: 1, rent: 1265, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'grand-central-2', beds: 2, baths: 1, rent: 1810, start: 'Jan 2027', end: 'Jul 2027' },
      { id: 'grand-central-3', beds: 4, baths: 2, rent: 2740, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'lark-at-kohl',
    name: 'Lark at Kohl',
    address: '110 N Bedford St',
    coords: [43.0697, -89.39424],
    leases: [
      { id: 'lark-at-kohl-1', beds: 0, baths: 1, rent: 1375, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'lark-at-kohl-2', beds: 1, baths: 1, rent: 1585, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'lark-at-kohl-3', beds: 2, baths: 2, rent: 2340, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'lark-at-kohl-4', beds: 4, baths: 4, rent: 3280, start: 'May 2027', end: 'Aug 2027' },
    ],
  },
  {
    id: 'regent',
    name: 'The Regent Apartments',
    address: '1402 Regent St',
    coords: [43.06803, -89.41004],
    leases: [
      { id: 'regent-1', beds: 0, baths: 1, rent: 875, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'regent-2', beds: 1, baths: 1, rent: 1040, start: 'Jan 2027', end: 'Aug 2027' },
      { id: 'regent-3', beds: 2, baths: 1, rent: 1430, start: 'Jun 2027', end: 'Aug 2027' },
    ],
  },
]

// How many subleases are posted at a building, and the cheapest and most
// expensive of them. The map popup and the listings panel both call this, so the
// two can never disagree about a building's numbers.
export function leaseSummary(apartment) {
  const rents = apartment.leases.map((lease) => lease.rent)
  if (rents.length === 0) return { count: 0, min: null, max: null }
  return { count: rents.length, min: Math.min(...rents), max: Math.max(...rents) }
}

// "$975 - $3,200", or just "$1,450" when a building has only one price.
export function formatRange(summary) {
  if (summary.count === 0) return 'No leases listed'
  const low = `$${summary.min.toLocaleString()}`
  if (summary.min === summary.max) return low
  return `${low} – $${summary.max.toLocaleString()}`
}

// "Studio", "1 bed / 1 bath", "4 bed / 2 bath"
export function formatUnit(lease) {
  const beds = lease.beds === 0 ? 'Studio' : `${lease.beds} bed`
  return `${beds} / ${lease.baths} bath`
}
