---
name: scroll-animation
description: Erstellt scroll-gesteuerte 3D-Animationen mit GSAP ScrollTrigger und Three.js/R3F. Kamera-Fahrten, Objekt-Reveals, parallaktische 3D-Effekte. Trigger bei "Scroll Animation", "ScrollTrigger", "Scroll 3D", "Kamerafahrt", "Parallax 3D".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Scroll-gesteuerte 3D-Animation

Erstelle eine Scroll-Animation fuer: $ARGUMENTS

## GSAP ScrollTrigger + R3F Pattern

### Hook fuer Scroll-Progress

```tsx
// src/hooks/useScrollProgress.ts
import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress(
  triggerRef: React.RefObject<HTMLElement>,
  options?: ScrollTrigger.Vars
) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!triggerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => setProgress(self.progress),
      ...options,
    })

    return () => trigger.kill()
  }, [triggerRef, options])

  return progress
}
```

### Kamerafahrt entlang Scroll

```tsx
// src/components/3d/ScrollScene.tsx
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import * as THREE from 'three'

function CameraRig({ progress }: { progress: number }) {
  useFrame((state) => {
    // Kamera bewegt sich entlang einer Kurve
    const t = progress
    state.camera.position.set(
      Math.sin(t * Math.PI * 2) * 5,
      2 + t * 3,
      Math.cos(t * Math.PI * 2) * 5
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function ScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const progress = useScrollProgress(containerRef)

  return (
    <div ref={containerRef} style={{ height: '400vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <Canvas camera={{ fov: 45 }}>
          <CameraRig progress={progress} />
          {/* Szeneninhalt */}
        </Canvas>
      </div>
    </div>
  )
}
```

### Objekt-Reveal bei Scroll

```tsx
function RevealObject({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (!meshRef.current) return
    // Einblenden ab 20% Scroll
    const t = Math.max(0, (progress - 0.2) / 0.3)
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0, 1, t))
    meshRef.current.material.opacity = t
    meshRef.current.rotation.y = t * Math.PI * 2
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial transparent />
    </mesh>
  )
}
```

## GSAP Timeline + Three.js (ohne R3F)

```tsx
// Vanilla Three.js mit GSAP Timeline
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '#scene-container',
    start: 'top top',
    end: '+=3000',
    scrub: 1,
    pin: true,
  },
})

tl.to(camera.position, { x: 5, y: 3, z: -2, duration: 1 })
  .to(model.rotation, { y: Math.PI, duration: 1 }, '<')
  .to(material.uniforms.progress, { value: 1, duration: 1 }, 0.5)
```

## ScrollSmoother (optional)

```tsx
import { ScrollSmoother } from 'gsap/ScrollSmoother'
gsap.registerPlugin(ScrollSmoother)

ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.5,
  effects: true,
})
```

## Checkliste

1. **Container-Hoehe**: Mindestens 200-400vh fuer genuegend Scroll-Strecke
2. **sticky/pinned Canvas**: Canvas bleibt fixiert waehrend Inhalt scrollt
3. **scrub: true/1**: Synchronisiert Animation mit Scroll-Position
4. **Performance**: `will-change: transform` auf animierten Elementen
5. **Mobile**: Touch-Scroll testen, `ScrollTrigger.normalizeScroll(true)` fuer konsistentes Verhalten
6. **prefers-reduced-motion**: Scroll-Animationen vereinfachen oder ueberspringen
7. **Cleanup**: `ScrollTrigger.kill()` und `timeline.kill()` in useEffect Cleanup
