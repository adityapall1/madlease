import { useEffect, useState } from 'react'

// The same width the stylesheets switch to the phone layout at.
const query = window.matchMedia('(max-width: 767px)')

// True on phone-sized screens. Layout is done in CSS; this exists for the few
// things CSS can't do, like making the hidden part of the bottom sheet
// unreachable by keyboard.
export function useIsMobile() {
  const [mobile, setMobile] = useState(query.matches)

  useEffect(() => {
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return mobile
}
