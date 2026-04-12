import { useEffect, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollProgressOptions {
  start?: string
  end?: string
  scrub?: boolean | number
}

/**
 * Gibt den Scroll-Fortschritt (0-1) relativ zu einem Trigger-Element zurueck.
 * Ideal fuer scroll-gesteuerte 3D-Kamerafahrten und Objekt-Animationen.
 */
export function useScrollProgress(
  triggerRef: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {}
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!triggerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: options.start ?? 'top top',
      end: options.end ?? 'bottom bottom',
      scrub: options.scrub ?? true,
      onUpdate: (self) => setProgress(self.progress),
    })

    return () => trigger.kill()
  }, [triggerRef, options.start, options.end, options.scrub])

  return progress
}
