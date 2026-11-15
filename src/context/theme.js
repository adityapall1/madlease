import { createContext, useContext } from 'react'

// pref is what the user picked (system, light, dark). theme is what is actually
// showing (light or dark), which is what the map needs to choose its tiles.
export const ThemeContext = createContext({ pref: 'system', theme: 'light', setPref: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}
