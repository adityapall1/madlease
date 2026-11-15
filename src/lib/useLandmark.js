import { useState } from 'react'
import { landmarks } from '../data/landmarks.js'

const KEY = 'madlease-landmark'

function read() {
  try {
    const saved = localStorage.getItem(KEY)
    return landmarks.find((l) => l.id === saved) ?? landmarks[0]
  } catch {
    return landmarks[0]
  }
}

// The landmark walk times are measured to. It is a personal preference (where
// your classes are), not part of a search, so it is remembered in this browser
// instead of going in the URL. Defaults to the first landmark, Bascom Hall.
export function useLandmark() {
  const [landmark, setLandmark] = useState(read)

  function choose(id) {
    const next = landmarks.find((l) => l.id === id) ?? landmarks[0]
    setLandmark(next)
    try {
      localStorage.setItem(KEY, next.id)
    } catch {
      // Without storage the choice just lasts until the page is reloaded.
    }
  }

  return [landmark, choose]
}
