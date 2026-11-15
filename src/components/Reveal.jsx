import { useEffect, useRef } from 'react'

// Content stays visible when JavaScript or motion support is unavailable.
export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || !window.IntersectionObserver || !el.animate) return
    let animation
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animation = el.animate([
        { opacity: 0.15, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 650, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' })
      observer.disconnect()
    }, { threshold: 0.12 })
    const stop = () => { if (motion.matches) { observer.disconnect(); animation?.cancel() } }
    motion.addEventListener('change', stop)
    observer.observe(el)
    return () => { observer.disconnect(); animation?.cancel(); motion.removeEventListener('change', stop) }
  }, [delay])
  return <div ref={ref} className={className}>{children}</div>
}
