import { useState, useEffect } from 'react'

/**
 * Erkennt ob der User prefers-reduced-motion aktiviert hat.
 * Verwende diesen Hook um Animationen zu deaktivieren/vereinfachen.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
