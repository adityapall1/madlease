// Fixed lists and limits. The database enforces the same values with check
// constraints (supabase/01_schema.sql); these copies exist so the forms can
// say what is wrong before a save is even attempted.

// The ids are what is stored in the database and in the URL.
export const AMENITIES = [
  { id: 'laundry', label: 'In-unit laundry' },
  { id: 'parking', label: 'Parking' },
  { id: 'gym', label: 'Gym' },
  { id: 'pets', label: 'Pets allowed' },
  { id: 'utilities', label: 'Utilities included' },
  { id: 'ac', label: 'AC' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'dishwasher', label: 'Dishwasher' },
]

export function amenityLabel(id) {
  return AMENITIES.find((a) => a.id === id)?.label ?? id
}

export const LIMITS = {
  title: 80,
  description: 2000,
  bio: 300,
  name: 80,
  major: 80,
  phone: 30,
  address: 120,
  photos: 6,
  minRent: 100,
  maxRent: 10000,
  maxBeds: 8,
  maxBaths: 8,
  maxRoommates: 10,
  minGradYear: 2020,
  maxGradYear: 2035,
}
