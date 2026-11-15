import { createContext, useContext } from 'react'

// user     the signed-in Supabase user, or null
// profile  that user's row in the profiles table, or null while it loads
// loading  true until we know whether anyone is signed in. Pages that
//          redirect based on sign-in wait for this, so nothing flashes.
export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
