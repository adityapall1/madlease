// The same key is read by the inline script in index.html, which sets the theme
// before React loads. Keep the two in sync.
const KEY = 'madlease-theme'

export const PREFS = ['system', 'light', 'dark']

// Storage can throw in private windows, so every read and write is guarded.
export function readPref() {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function savePref(pref) {
  try {
    if (pref === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, pref)
  } catch {
    // Not being able to save just means the choice lasts until the next reload.
  }
}

export const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function resolve(pref) {
  if (pref === 'system') return darkQuery.matches ? 'dark' : 'light'
  return pref
}
