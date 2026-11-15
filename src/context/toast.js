import { createContext, useContext } from 'react'

// toast('Email copied') shows a short message at the bottom of the screen for
// a few seconds. Used for quick confirmations and for errors from actions that
// have no form to show them in, like the save button.
export const ToastContext = createContext(() => {})

export function useToast() {
  return useContext(ToastContext)
}
