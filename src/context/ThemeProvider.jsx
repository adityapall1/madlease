import { useEffect, useState } from 'react'
import { darkQuery, readPref, resolve, savePref } from '../lib/theme.js'
import { ThemeContext } from './theme.js'

function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(readPref)
  const [theme, setTheme] = useState(() => resolve(pref))

  // While following the system, switch live when the OS setting changes.
  useEffect(() => {
    if (pref !== 'system') return
    const update = () => setTheme(resolve('system'))
    darkQuery.addEventListener('change', update)
    return () => darkQuery.removeEventListener('change', update)
  }, [pref])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const favicon = document.getElementById('site-favicon')
    if (favicon) favicon.href = `${import.meta.env.BASE_URL}brand/favicon-${theme}.svg`
  }, [theme])

  function setPref(next) {
    savePref(next)
    setPrefState(next)
    setTheme(resolve(next))
  }

  return <ThemeContext.Provider value={{ pref, theme, setPref }}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
