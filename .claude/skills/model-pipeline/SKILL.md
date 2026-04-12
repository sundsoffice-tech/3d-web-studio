---
name: model-pipeline
description: Pipeline fuer 3D-Modell-Import, Optimierung und Web-Integration. GLB/glTF Komprimierung (Draco, KTX2, MeshOpt), gltfjsx Konvertierung, LOD-Setup. Trigger bei "Modell optimieren", "GLB importieren", "3D Asset", "Modell laden", "gltfjsx".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 3D-Modell Pipeline

Verarbeite/importiere das 3D-Modell: $ARGUMENTS

## Optimierungs-Pipeline

### 1. GLB mit gltf-transform optimieren

```bash
# Alles-in-einem: Draco + WebP Texturen + Deduplizierung
npx @gltf-transform/cli optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp

# Maximale Komprimierung (fuer grosse Modelle)
npx @gltf-transform/cli optimize input.glb output.glb \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024

# Einzelne Operationen
npx @gltf-transform/cli dedup input.glb deduped.glb
npx @gltf-transform/cli draco deduped.glb compressed.glb
npx @gltf-transform/cli webp compressed.glb final.glb
```

### 2. R3F-Komponente generieren mit gltfjsx

```bash
# Standard: JSX + komprimiertes GLB
npx gltfjsx model.glb --transform --types

# Optionen
npx gltfjsx model.glb \
  --transform \        # Komprimiert GLB automatisch
  --types \            # TypeScript-Typen generieren
  --draco \            # Draco-Loader verwenden
  --root /models \     # Asset-Pfad-Prefix
  --instance           # InstancedMesh fuer wiederholte Teile
```

### 3. Modell in R3F laden

```tsx
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ModelProps {
  animation?: string
}

export function Model({ animation, ...props }: ModelProps & JSX.IntrinsicElements['group']) {
  const groupRef = useRef<THREE.Group>(null!)
  const { nodes, materials, animations } = useGLTF('/models/model-transformed.glb')
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (animation && actions[animation]) {
      actions[animation]!.reset().fadeIn(0.5).play()
      return () => { actions[animation]!.fadeOut(0.5) }
    }
  }, [animation, actions])

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh geometry={(nodes.Body as THREE.Mesh).geometry} material={materials.Default} />
    </group>
  )
}

useGLTF.preload('/models/model-transformed.glb')
```

### 4. LOD (Level of Detail)

```tsx
import { Detailed } from '@react-three/drei'

export function LODModel(props: JSX.IntrinsicElements['group']) {
  return (
    <Detailed distances={[0, 25, 50]} {...props}>
      <ModelHigh />   {/* 0-25 Einheiten: volles Detail */}
      <ModelMedium /> {/* 25-50 Einheiten: reduziert */}
      <ModelLow />    {/* 50+ Einheiten: minimal */}
    </Detailed>
  )
}
```

## Groessen-Richtlinien

| Modell-Typ | Max Triangles | Max Textur | Max GLB-Groesse |
|-----------|---------------|------------|-----------------|
| Hero/Hauptobjekt | 100K | 2048x2048 | 2MB |
| Sekundaer-Objekt | 30K | 1024x1024 | 500KB |
| Hintergrund/Deko | 5K | 512x512 | 100KB |
| Icon/UI-Element | 1K | 256x256 | 50KB |

## Blender-Export Checkliste

1. **Modifiers anwenden** (Apply Modifiers im Export)
2. **Decimate Modifier** fuer Poly-Reduktion
3. **Principled BSDF** verwenden (mappt direkt auf glTF PBR)
4. **Texturen auf 2er-Potenzen** (512, 1024, 2048)
5. **Animationen als benannte NLA-Actions** organisieren
6. **Nur Sichtbares exportieren** bei Bedarf
7. **Draco-Komprimierung** im Blender-Exporter aktivieren
