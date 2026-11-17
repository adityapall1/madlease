import { useEffect, useRef } from 'react'

// The architectural backdrop moves more slowly than the content, without
// intercepting scroll or rerendering React on every frame.
export function useLandingParallax(enabled) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled || !ref.current) return
    const element = ref.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const draw = () => {
      frame = 0
      const offset = reduced.matches ? 0 : Math.max(0, -element.getBoundingClientRect().top) * 0.18
      element.style.setProperty('--backdrop-shift', `${offset.toFixed(1)}px`)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    reduced.addEventListener('change', schedule)
    draw()
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); reduced.removeEventListener('change', schedule) }
  }, [enabled])
  return ref
}
