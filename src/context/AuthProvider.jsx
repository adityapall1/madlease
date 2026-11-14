import { useCallback, useEffect, useState } from 'react'
import * as api from '../lib/api.js'
import { AuthContext } from './auth.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Supabase calls back straight away with the saved session (or none), then
  // again on every sign in, sign out and token refresh.
  useEffect(() => {
    return api.watchAuth((session) => {
      const next = session?.user ?? null
      // A token refresh hands over a new object for the same person. Keeping
      // the old one avoids re-running everything that depends on `user`.
      setUser((prev) => (prev?.id === next?.id ? prev : next))
      if (!next) setProfile(null)
      setLoading(false)
    })
  }, [])

  const userId = user?.id

  const refreshProfile = useCallback(async () => {
    if (!userId) return null
    const row = await api.fetchProfile(userId)
    setProfile(row)
    return row
  }, [userId])

  // The profile is loaded here rather than inside the callback above because
  // Supabase warns against making other Supabase calls from within it.
  useEffect(() => {
    if (!userId) return
    let stale = false
    api
      .fetchProfile(userId)
      .then((row) => {
        if (!stale) setProfile(row)
      })
      .catch(() => {
        // The page still works without a profile; the nav falls back to the email.
      })
    return () => {
      stale = true
    }
  }, [userId])

  const signOut = useCallback(async () => {
    await api.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>{children}</AuthContext.Provider>
  )
}

export default AuthProvider
