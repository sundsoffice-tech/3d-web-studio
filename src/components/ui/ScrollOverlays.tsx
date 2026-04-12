interface ScrollOverlaysProps {
  progress: number
}

interface Phase {
  title: string
  subtitle: string
  start: number
  end: number
}

const phases: Phase[] = [
  {
    title: 'Vollautomatisch',
    subtitle: 'Keine Menschen noetig. Nur Maschinen.',
    start: 0,
    end: 0.07,
  },
  {
    title: 'Systeme starten',
    subtitle: 'Foerderbaender und Stationen initialisieren',
    start: 0.08,
    end: 0.18,
  },
  {
    title: 'Roboter uebernehmen',
    subtitle: 'Greifen. Schweissen. Platzieren. Praezise.',
    start: 0.2,
    end: 0.38,
  },
  {
    title: 'Volle Produktion',
    subtitle: 'Jede Station arbeitet autonom und synchron',
    start: 0.42,
    end: 0.56,
  },
  {
    title: 'Und der Chef?',
    subtitle: 'Geniesst seinen Drink. Laeuft ja alles.',
    start: 0.62,
    end: 0.78,
  },
  {
    title: 'Automatisierung.',
    subtitle: 'Damit du dich auf das Wesentliche konzentrieren kannst.',
    start: 0.82,
    end: 0.98,
  },
]

function getActivePhase(
  progress: number
): { phase: Phase; opacity: number } | null {
  for (const phase of phases) {
    if (progress >= phase.start && progress <= phase.end) {
      const mid = (phase.start + phase.end) / 2
      const halfDuration = (phase.end - phase.start) / 2
      const dist = Math.abs(progress - mid)
      const opacity = 1 - dist / halfDuration
      return { phase, opacity: Math.max(0, Math.min(1, opacity)) }
    }
  }
  return null
}

export function ScrollOverlays({ progress }: ScrollOverlaysProps) {
  const active = getActivePhase(progress)

  if (!active || active.opacity < 0.01) return null

  return (
    <div className="scroll-overlay" style={{ opacity: active.opacity }}>
      <h2 className="scroll-overlay-title">{active.phase.title}</h2>
      <p className="scroll-overlay-subtitle">{active.phase.subtitle}</p>
    </div>
  )
}
