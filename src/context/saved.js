import { createContext, useContext } from 'react'

// ids     a Set of the listing ids the signed-in user has saved
// toggle  saves or unsaves a listing; sends signed-out visitors to sign in
export const SavedContext = createContext({ ids: new Set(), toggle: async () => {} })

export function useSaved() {
  return useContext(SavedContext)
}
