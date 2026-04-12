---
name: threejs-scene
description: Erstellt eine neue Three.js/R3F 3D-Szene mit korrekter Struktur, Beleuchtung, Kamera und Performance-Optimierung. Trigger bei Anfragen wie "erstelle eine 3D-Szene", "neue Scene", "3D Hintergrund", "Canvas Setup".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Three.js / R3F Szene erstellen

Erstelle eine produktionsreife 3D-Szene basierend auf: $ARGUMENTS

## Architektur

Verwende React Three Fiber (R3F) v9 mit folgender Struktur:

```tsx
// src/components/3d/[SceneName].tsx
import { Canvas } from '@react-three/fiber'
import { Environment, AdaptiveDpr, Preload } from '@react-three/drei'
import { Suspense } from 'react'

export function SceneName() {
  return (
    <Canvas
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Suspense fallback={null}>
        {/* Szeneninhalt */}
        <Environment preset="studio" />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

## Checkliste

1. **Canvas-Setup**: `dpr={[1, 2]}`, `powerPreference: 'high-performance'`
2. **Kamera**: FOV 45-75, Near/Far an Szengroesse anpassen
3. **Beleuchtung**: Environment Map + optionale Direktlichter
4. **Suspense**: Wrapper mit Fallback-UI
5. **Performance**: `<AdaptiveDpr />`, `<PerformanceMonitor />` bei Bedarf
6. **Cleanup**: `useEffect` Cleanup fuer Event-Listener und Subscriptions
7. **Responsiv**: Canvas passt sich Container an (CSS `width: 100%, height: 100%`)
8. **Accessibility**: `aria-label` auf Canvas-Container, `prefers-reduced-motion` Check
9. **WebGPU**: Falls moeglich `createRoot` mit WebGPU Renderer konfigurieren

## Renderer-Auswahl

```tsx
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

// WebGPU mit WebGL-Fallback
const renderer = navigator.gpu
  ? await import('three/webgpu')
  : undefined

<Canvas gl={(canvas) => {
  if (renderer) {
    return new renderer.WebGPURenderer({ canvas, antialias: true })
  }
  return new THREE.WebGLRenderer({ canvas, antialias: true })
}} />
```

## Timer statt Clock (deprecated)

```tsx
import { Timer } from 'three'
const timer = new Timer()

useFrame(() => {
  timer.update()
  const delta = timer.getDelta()
})
```
