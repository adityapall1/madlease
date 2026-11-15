import { useEffect, useRef } from 'react'

export function useScrollScene(enabled) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled || !ref.current) return
    const el = ref.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const draw = () => {
      frame = 0
      const box = el.getBoundingClientRect()
      const mobile = window.innerWidth < 768
      const distance = mobile ? box.height : Math.max(1, box.height - window.innerHeight + 56)
      const progress = motion.matches ? 0 : Math.max(0, Math.min(1, (56 - box.top) / distance))
      el.style.setProperty('--scene', progress.toFixed(4))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [enabled])
  return ref
}
