import { AMENITIES } from './constants.js'

export function listingError(fields) {
  if (fields.title.trim().length < 3 || fields.title.length > 80) return 'Use a title between 3 and 80 characters.'
  if (fields.description.length > 2000) return 'Keep the description within 2,000 characters.'
  if (!Number.isInteger(fields.rent) || fields.rent < 100 || fields.rent > 10000) return 'Rent must be a whole dollar amount from $100 to $10,000.'
  if (!Number.isInteger(fields.beds) || fields.beds < 0 || fields.beds > 8) return 'Choose 0 to 8 bedrooms.'
  if (fields.baths < 0.5 || fields.baths > 8 || !Number.isInteger(fields.baths * 2)) return 'Bathrooms must be 0.5 to 8 in half steps.'
  if (!['entire', 'room'].includes(fields.unit_type)) return 'Choose a whole unit or a room.'
  if (!['per_person', 'whole_unit'].includes(fields.rent_basis)) return 'Choose what the rent covers.'
  if (fields.unit_type === 'room' && (!Number.isInteger(fields.roommates) || fields.roommates < 1 || fields.roommates > 10 || fields.rent_basis !== 'per_person')) return 'A room needs 1 to 10 roommates and a per-person price.'
  if (!fields.start_date || !fields.end_date || fields.end_date <= fields.start_date) return 'The end date must be after the start date.'
  if (!fields.amenities.every((id) => AMENITIES.some((a) => a.id === id))) return 'Choose amenities from the list.'
  return ''
}
