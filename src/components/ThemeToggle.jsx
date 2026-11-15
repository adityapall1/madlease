import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/theme.js'
import { PREFS } from '../lib/theme.js'

const ICONS = { system: Monitor, light: Sun, dark: Moon }
const NAMES = { system: 'System', light: 'Light', dark: 'Dark' }

// One button that steps through system -> light -> dark. Three choices are too
// few to be worth a menu.
function ThemeToggle() {
  const { pref, setPref } = useTheme()
  const next = PREFS[(PREFS.indexOf(pref) + 1) % PREFS.length]
  const Icon = ICONS[pref]
  const label = `Theme: ${NAMES[pref]}. Switch to ${NAMES[next]}.`

  return (
    <button type="button" className="icon-btn" onClick={() => setPref(next)} aria-label={label} title={label}>
      <Icon aria-hidden="true" />
    </button>
  )
}

export default ThemeToggle
