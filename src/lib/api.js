// Every call to Supabase lives in this file, so the rest of the app never
// builds a query itself and there is one place to look when data is wrong.

import { today } from './format.js'
import { supabase } from './supabase.js'

// Supabase hands back { data, error } instead of throwing. Unwrapping it here
// means callers use ordinary try/catch and can't forget to check for an error.
function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// A listing plus the building it is in. The building's outline is left out
// because browse already loads every building separately.
const LISTING = '*, building:buildings(id, name, address, lat, lng)'

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

// Emails a one-time code. shouldCreateUser makes this one call work for both
// new and returning students.
export async function sendCode(email) {
  unwrap(await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }))
}

export async function verifyCode(email, token) {
  return unwrap(await supabase.auth.verifyOtp({ email, token, type: 'email' }))
}

export async function signOut() {
  unwrap(await supabase.auth.signOut())
}

// Calls back with the session now, and again whenever it changes (sign in,
// sign out, token refresh). Returns a function that stops listening.
export function watchAuth(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function fetchProfile(id) {
  return unwrap(await supabase.from('profiles').select('*').eq('id', id).maybeSingle())
}

export async function updateProfile(id, fields) {
  return unwrap(await supabase.from('profiles').update(fields).eq('id', id).select().single())
}

// ---------------------------------------------------------------------------
// Buildings and listings
// ---------------------------------------------------------------------------

export async function fetchBuildings() {
  return unwrap(await supabase.from('buildings').select('*').order('name'))
}

// What browse shows. The database would also return the signed-in user's own
// taken and expired listings, so the two filters here are what keep those out
// of browse.
export async function fetchActiveListings() {
  return unwrap(
    await supabase
      .from('listings')
      .select(LISTING)
      .eq('status', 'active')
      .gte('end_date', today())
      .order('created_at', { ascending: false }),
  )
}

// One listing by id, or null. Null covers both "never existed" and "you're
// not allowed to see it" (taken or expired, and not yours).
export async function fetchListing(id) {
  return unwrap(await supabase.from('listings').select(LISTING).eq('id', id).maybeSingle())
}

export async function fetchMyListings(userId) {
  return unwrap(
    await supabase.from('listings').select(LISTING).eq('owner_id', userId).order('created_at', { ascending: false }),
  )
}

export async function createBuilding(fields) {
  return unwrap(await supabase.from('buildings').insert(fields).select().single())
}

export async function createListing(fields) {
  return unwrap(await supabase.from('listings').insert(fields).select(LISTING).single())
}

export async function updateListing(id, fields) {
  return unwrap(await supabase.from('listings').update(fields).eq('id', id).select(LISTING).single())
}

// Removes the row first. If that fails nothing is lost; if the photo cleanup
// fails afterwards, the worst case is a few stray files nobody can see.
export async function deleteListing(listing) {
  unwrap(await supabase.from('listings').delete().eq('id', listing.id))
  try {
    await cleanupListingPhotos(listing, true)
    return { cleanupFailed: false }
  } catch {
    return { cleanupFailed: true }
  }
}

// Include files from interrupted uploads, which may not be in the row yet.
export async function cleanupListingPhotos(listing, all = false) {
  const folder = `${listing.owner_id}/${listing.id}`
  const paths = []
  let offset = 0
  while (true) {
    const rows = unwrap(await supabase.storage.from('listing-photos').list(folder, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }))
    paths.push(...rows.filter((file) => file.id).map((file) => `${folder}/${file.name}`))
    if (rows.length < 100) break
    offset += rows.length
  }
  await removePhotos(paths.filter((path) => all || !listing.photos.includes(path)))
}

// ---------------------------------------------------------------------------
// Saved listings
// ---------------------------------------------------------------------------

export async function fetchSavedIds(userId) {
  const rows = unwrap(await supabase.from('saved_listings').select('listing_id').eq('user_id', userId))
  return rows.map((row) => row.listing_id)
}

// Saved rows with their listing. `listing` comes back null when the listing
// has been taken or has expired, because the database hides it from everyone
// but its owner. The profile page shows those as "no longer available".
export async function fetchSaved(userId) {
  return unwrap(
    await supabase
      .from('saved_listings')
      .select(`listing_id, created_at, listing:listings(${LISTING})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  )
}

export async function saveListing(userId, listingId) {
  const { error } = await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId })
  // 23505 is "already exists". Saving something twice is not a problem.
  if (error && error.code !== '23505') throw error
}

export async function unsaveListing(userId, listingId) {
  unwrap(await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId))
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export function photoUrl(path) {
  return supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl
}

// An avatar always has the same file name, so browsers would keep showing the
// old one after a change. Tacking the profile's last-updated time onto the
// address makes each new upload look like a new file.
export function avatarUrl(profile) {
  if (!profile?.avatar_path) return null
  const url = supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl
  return `${url}?v=${encodeURIComponent(profile.updated_at ?? '')}`
}

// Listing photos get a new name every time, so they can be cached for a year.
export async function uploadPhoto(path, blob) {
  unwrap(
    await supabase.storage.from('listing-photos').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' }),
  )
}

export async function removePhotos(paths) {
  if (!paths || paths.length === 0) return
  unwrap(await supabase.storage.from('listing-photos').remove(paths))
}

// upsert lets a new avatar replace the old file in place.
export async function uploadAvatar(path, blob) {
  unwrap(await supabase.storage.from('avatars').upload(path, blob, { contentType: blob.type, upsert: true }))
}
