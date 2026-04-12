---
name: shader-dev
description: Entwickelt Custom Shader mit TSL (Three.js Shading Language) oder GLSL. Erstellt Shader-Materialien, Post-Processing-Effekte und visuelle Effekte. Trigger bei "Shader", "Custom Material", "Effekt", "TSL", "GLSL", "visueller Effekt".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Shader-Entwicklung

Erstelle einen Shader/visuellen Effekt fuer: $ARGUMENTS

## TSL (Three.js Shading Language) -- Standard

TSL ist der neue Standard fuer Shader in Three.js. Shader werden als JavaScript-Node-Graphen geschrieben und kompilieren automatisch zu GLSL (WebGL) und WGSL (WebGPU).

### Basis-Template

```tsx
// src/shaders/[effectName].ts
import {
  uniform,
  vec3,
  vec4,
  sin,
  cos,
  time,
  positionLocal,
  normalLocal,
  uv,
  float,
  mix,
  smoothstep,
  Fn,
} from 'three/tsl'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

export function createGradientMaterial() {
  const colorA = uniform(vec3(0.2, 0.4, 1.0))
  const colorB = uniform(vec3(1.0, 0.2, 0.5))
  const speed = uniform(float(1.0))

  const material = new MeshPhysicalNodeMaterial()

  // Animierter Gradient basierend auf UV und Zeit
  const t = smoothstep(0.0, 1.0, uv().y.add(sin(time.mul(speed)).mul(0.1)))
  material.colorNode = mix(colorA, colorB, t)

  return { material, uniforms: { colorA, colorB, speed } }
}
```

### Vertex-Displacement

```tsx
import { positionLocal, sin, time, normalLocal, float } from 'three/tsl'

// Vertex-Verschiebung fuer Wellen-Effekt
const displacement = sin(
  positionLocal.x.mul(4.0).add(time.mul(2.0))
).mul(0.1)

material.positionNode = positionLocal.add(
  normalLocal.mul(displacement)
)
```

### Post-Processing mit TSL

```tsx
import { bloom, pass } from 'three/tsl'
import { RenderPipeline } from 'three/webgpu'

const pipeline = new RenderPipeline(renderer)
const scenePass = pass(scene, camera)
const bloomPass = bloom(scenePass, { strength: 1.5, radius: 0.4 })
pipeline.outputNode = bloomPass
```

## R3F Integration

```tsx
import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { createGradientMaterial } from '@/shaders/gradientShader'

export function ShaderMesh() {
  const { material, uniforms } = useMemo(() => createGradientMaterial(), [])

  useFrame((state) => {
    // Uniforms zur Laufzeit aendern
    uniforms.speed.value = Math.sin(state.clock.elapsedTime) + 1.5
  })

  return (
    <mesh material={material}>
      <sphereGeometry args={[1, 64, 64]} />
    </mesh>
  )
}
```

## Regeln

1. **TSL bevorzugen**: Neuer Code soll TSL verwenden, nicht GLSL-Strings
2. **Separate Dateien**: Shader-Logik in `src/shaders/` als `.ts`-Module
3. **Uniforms exportieren**: Fuer Runtime-Kontrolle Uniforms zurueckgeben
4. **Performance**: Minimale Textur-Lookups, einfache Mathematik wo moeglich
5. **Kompatibilitaet**: TSL kompiliert fuer WebGL UND WebGPU automatisch
6. **Debugging**: `console.log(material.fragmentNode.build())` zeigt generierten Code

## Haeufige TSL-Nodes

| Node | Zweck |
|------|-------|
| `time` | Animationszeit (float) |
| `uv()` | UV-Koordinaten |
| `positionLocal` | Lokale Vertex-Position |
| `normalLocal` | Lokale Vertex-Normale |
| `cameraPosition` | Kamera-Weltposition |
| `sin`, `cos`, `pow` | Mathematische Funktionen |
| `mix`, `smoothstep` | Interpolation |
| `texture` | Textur-Sampling |
| `uniform(value)` | Animierbare Uniform-Variable |
