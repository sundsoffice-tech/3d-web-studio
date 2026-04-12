---
name: accessibility-3d
description: Macht 3D-Inhalte barrierefrei (WCAG 2.1). Screen-Reader-Support, Keyboard-Navigation, prefers-reduced-motion, Fallbacks. Trigger bei "Accessibility", "Barrierefreiheit", "a11y", "Screen Reader", "WCAG".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# 3D Accessibility

Implementiere Barrierefreiheit fuer: $ARGUMENTS

## Kern-Anforderungen

### 1. prefers-reduced-motion (WCAG 2.3.3)

```tsx
// src/hooks/useReducedMotion.ts
export function useReducedMotion() {
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

// Verwendung in 3D-Komponente
function AnimatedMesh() {
  const reducedMotion = useReducedMotion()

  useFrame((state, delta) => {
    if (reducedMotion) return // Keine Animation
    meshRef.current.rotation.y += delta
  })
}
```

### 2. Screen-Reader-Support

```tsx
// Canvas-Container mit ARIA
<div
  role="img"
  aria-label="Interaktive 3D-Darstellung eines Produkts. Verwenden Sie Maus oder Touch zum Drehen."
>
  <Canvas>
    {/* Szene */}
  </Canvas>
</div>

// Fuer interaktive Elemente: @react-three/a11y
import { A11y, A11yAnnouncer } from '@react-three/a11y'

<Canvas>
  <A11y
    role="button"
    description="Produkt in den Warenkorb legen"
    actionCall={() => addToCart()}
  >
    <ProductMesh />
  </A11y>
</Canvas>
<A11yAnnouncer />  {/* Ausserhalb Canvas! */}
```

### 3. Keyboard-Navigation

```tsx
<A11y
  role="button"
  description="Farbe wechseln"
  tabIndex={0}
  actionCall={() => changeColor()}
>
  <ColorSwatch />
</A11y>
```

### 4. Pause-Kontrolle (WCAG 2.2.2)

```tsx
function Scene() {
  const [paused, setPaused] = useState(false)

  return (
    <>
      <button
        onClick={() => setPaused(!paused)}
        aria-label={paused ? 'Animation fortsetzen' : 'Animation pausieren'}
      >
        {paused ? 'Play' : 'Pause'}
      </button>
      <Canvas>
        <AnimatedContent paused={paused} />
      </Canvas>
    </>
  )
}
```

### 5. Statischer Fallback

```tsx
function Scene3D() {
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      setWebglSupported(!!gl)
    } catch {
      setWebglSupported(false)
    }
  }, [])

  if (!webglSupported) {
    return (
      <img
        src="/fallback/product-hero.webp"
        alt="Produktansicht aus verschiedenen Perspektiven"
      />
    )
  }

  return <Canvas>{/* ... */}</Canvas>
}
```

## Checkliste

- [ ] `aria-label` auf Canvas-Container mit Beschreibung der Szene
- [ ] `prefers-reduced-motion` wird respektiert
- [ ] Interaktive 3D-Elemente sind per Keyboard erreichbar
- [ ] Pause/Stop-Button fuer kontinuierliche Animationen
- [ ] Statischer Fallback fuer nicht-WebGL-faehige Geraete
- [ ] Farbkontrast bei Text-Overlays ueber 3D geprueft
- [ ] Screen-Reader-Ankuendigungen fuer Zustandsaenderungen
