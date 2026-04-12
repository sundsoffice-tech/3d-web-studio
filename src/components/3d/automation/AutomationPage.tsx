import { useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { AutomationScene } from './AutomationScene'
import { ScrollOverlays } from '@/components/ui/ScrollOverlays'

export function AutomationPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(containerRef)

  return (
    <div className="automation-page">
      <div ref={containerRef} className="automation-scroll-container">
        <div className="automation-sticky">
          <AutomationScene scrollProgress={progress} />
          <ScrollOverlays progress={progress} />
        </div>
      </div>
      <footer className="footer">
        <p>Built with Three.js + R3F + GSAP</p>
      </footer>
    </div>
  )
}
