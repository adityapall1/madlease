import { apartments } from '../../scripts/seed-data.mjs'

export const DEMO_KEY = 'madlease-browse-demo'
export const isLocalDemo = (id) => id?.startsWith('local-demo-')

// Real OSM locations, fictional rents and units. Never written to Supabase.
export function makeDemoListings(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 7, 0)
  const date = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  const buildings = apartments.map(place => ({
    id: `local-demo-${place.id}`, name: place.name, address: place.address,
    lat: place.coords[0], lng: place.coords[1], footprint: null,
  }))
  const listings = buildings.map((building, index) => {
    const unit = apartments[index].leases[0]
    return {
      id: `${building.id}-listing`, building_id: building.id, building,
      owner_id: null, is_demo: true, title: `Test sublease at ${building.name}`,
      unit_type: index % 2 ? 'room' : 'entire', beds: unit.beds || 1, baths: unit.baths,
      roommates: index % 2 ? 2 : null, rent: index % 2 ? 750 + index * 10 : unit.rent,
      rent_basis: index % 2 ? 'per_person' : 'whole_unit', furnished: index % 3 === 0,
      amenities: ['laundry', 'ac'], start_date: date(start), end_date: date(end),
      description: 'Fictional test sublease for exploring MadLease. This is not an available rental. Contact and saving are disabled.',
      photos: [], status: 'active', created_at: now.toISOString(), updated_at: now.toISOString(),
    }
  })
  return { buildings, listings }
}
