import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { dataMessage } from '../lib/errors.js'
import { signInPath } from '../lib/paths.js'
import { useAuth } from './auth.js'
import { SavedContext } from './saved.js'
import { useToast } from './toast.js'

const NONE = new Set()

export default function SavedProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = user?.id
  const [saved, setSaved] = useState({ owner: null, ids: NONE })
  const [pending, setPending] = useState(NONE)
  const locks = useRef(new Set())
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(null)
  const ready = !userId || saved.owner === userId
  const ids = ready && userId ? saved.ids : NONE

  useEffect(() => {
    if (!userId) return
    let stale = false
    api.fetchSavedIds(userId).then((list) => {
      if (!stale) { setSaved({ owner: userId, ids: new Set(list) }); setFailed(null) }
    }).catch(() => { if (!stale) setFailed(userId) })
    return () => { stale = true }
  }, [userId, attempt])

  const toggle = useCallback(async (listingId) => {
    if (!userId) { navigate(signInPath(location)); return false }
    if (!ready) {
      setAttempt((n) => n + 1)
      toast('Loading your saved list. Please try again in a moment.')
      return false
    }
    const key = `${userId}/${listingId}`
    if (locks.current.has(key)) return false
    locks.current.add(key)
    setPending(new Set(locks.current))
    const wasSaved = ids.has(listingId)
    const flip = (on) => setSaved((prev) => {
      if (prev.owner !== userId) return prev
      const next = new Set(prev.ids)
      if (on) next.add(listingId)
      else next.delete(listingId)
      return { owner: userId, ids: next }
    })
    flip(!wasSaved)
    try {
      if (wasSaved) await api.unsaveListing(userId, listingId)
      else await api.saveListing(userId, listingId)
      return true
    } catch (err) {
      flip(wasSaved)
      toast(dataMessage(err, 'Could not update your saved list. Try again.'))
      return false
    } finally {
      locks.current.delete(key)
      setPending(new Set(locks.current))
    }
  }, [userId, ready, ids, navigate, location, toast])

  return <SavedContext.Provider value={{ ids, toggle, pending, ready, failed: failed === userId, retry: () => setAttempt((n) => n + 1) }}>{children}</SavedContext.Provider>
}
