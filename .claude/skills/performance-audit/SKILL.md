---
name: performance-audit
description: Analysiert und optimiert die Performance von 3D-Szenen. Draw Calls, Texturspeicher, Bundle-Groesse, Frame-Rate-Probleme, Lazy Loading. Trigger bei "Performance", "langsam", "optimieren", "FPS", "Draw Calls", "Ladezeit".
allowed-tools: Read, Glob, Grep, Bash
disable-model-invocation: true
---

# 3D Performance Audit

Analysiere die Performance fuer: $ARGUMENTS

## Pruefpunkte

### 1. Draw Calls & Geometrie

```tsx
// Debug-Info in der Szene anzeigen
import { useFrame } from '@react-three/fiber'

useFrame(({ gl }) => {
  console.log('Draw Calls:', gl.info.render.calls)
  console.log('Triangles:', gl.info.render.triangles)
  console.log('Geometries:', gl.info.memory.geometries)
  console.log('Textures:', gl.info.memory.textures)
})
```

**Zielwerte:**
- Draw Calls: <100 fuer Desktop, <50 fuer Mobile
- Triangles pro Frame: <500K Desktop, <100K Mobile
- Texturspeicher: <256MB VRAM

**Loesung bei zu vielen Draw Calls:**
- `InstancedMesh` fuer identische Objekte
- `BatchedMesh` fuer verschiedene Geometrien
- Material-Merging (gleiche Materialien zusammenfassen)
- Texture Atlas (mehrere Texturen in eine)

### 2. Bundle & Ladezeit

```bash
# Bundle-Analyse
npx vite-bundle-visualizer

# GLB-Groessen pruefen
ls -lh src/models/*.glb public/models/*.glb
```

**Optimierungen:**
- Dynamic `import()` fuer 3D-Module (Code Splitting)
- `<Suspense>` mit sinnvollem Fallback
- Draco/MeshOpt Komprimierung fuer GLBs
- WebP/KTX2 fuer Texturen
- `useGLTF.preload()` fuer kritische Modelle

### 3. Render-Performance

```tsx
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

<Canvas>
  <PerformanceMonitor
    onIncline={() => setDpr(2)}
    onDecline={() => setDpr(1)}
  >
    <AdaptiveDpr pixelated />
    <AdaptiveEvents />
    {/* Szene */}
  </PerformanceMonitor>
</Canvas>
```

**Weitere Optimierungen:**
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- Frustum Culling (Standard in Three.js)
- `object.matrixAutoUpdate = false` fuer statische Objekte
- Shadow Maps begrenzen (Aufloesung, Anzahl)
- Post-Processing: pmndrs/postprocessing (merged Passes automatisch)

### 4. Speicher-Leaks

```tsx
// Cleanup-Pattern
useEffect(() => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial()

  return () => {
    geometry.dispose()
    material.dispose()
    texture?.dispose()
  }
}, [])
```

**Pruefen:**
- `gl.info.memory` ueber Zeit beobachten
- Geometrien/Materialien/Texturen muessen disposed werden
- Event-Listener in useEffect Cleanup entfernen
- `dispose={null}` auf `<group>` fuer von useGLTF geladene Modelle

### 5. Mobile-spezifisch

- Max 1x DPR auf aelteren Mobilgeraeten
- `powerPreference: 'low-power'` fuer Mobile
- Weniger Partikel, einfachere Shader
- Touch-Events statt Hover
- `prefers-reduced-motion` respektieren

## Ergebnis-Format

Liefere einen Report mit:
1. Gefundene Performance-Probleme (sortiert nach Impact)
2. Konkrete Code-Aenderungen als Loesung
3. Vorher/Nachher Metriken (geschaetzt)
