import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// main.jsx checks this and shows a setup screen instead of the app, so nothing
// else has to worry about the client being missing.
export const hasEnv = Boolean(url && key)

// The publishable key is meant to be public. What protects the data is Row
// Level Security in the database, not keeping this key hidden.
export const supabase = hasEnv
  ? createClient(url, key, {
      // We sign in with emailed codes, never links, so there is nothing to read
      // out of the URL when the page loads.
      auth: { detectSessionInUrl: false },
    })
  : null
