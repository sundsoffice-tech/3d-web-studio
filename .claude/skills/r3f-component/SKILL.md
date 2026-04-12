---
name: r3f-component
description: Erstellt eine wiederverwendbare React Three Fiber 3D-Komponente (Mesh, Gruppe, Partikel, etc.) mit TypeScript-Typen und Performance-Best-Practices. Trigger bei "3D Komponente", "Mesh erstellen", "3D Objekt", "R3F Component".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# R3F 3D-Komponente erstellen

Erstelle eine R3F-Komponente fuer: $ARGUMENTS

## Template

```tsx
// src/components/3d/[ComponentName].tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ComponentNameProps {
  position?: [number, number, number]
  scale?: number
  color?: string
}

export function ComponentName({
  position = [0, 0, 0],
  scale = 1,
  color = '#ffffff',
}: ComponentNameProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Geometrie und Material memoizen
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color }),
    [color]
  )

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={geometry}
      material={material}
    />
  )
}
```

## Regeln

1. **TypeScript**: Props-Interface mit sinnvollen Defaults
2. **Refs**: `useRef<THREE.Mesh>(null!)` mit Non-null Assertion
3. **Memoization**: `useMemo` fuer Geometrien und Materialien
4. **useFrame**: Delta-basierte Animation (nicht zeitabhaengig)
5. **Dispose**: Geometrien/Materialien werden von R3F automatisch disposed -- nur bei manueller Erstellung in `useMemo` mit Cleanup
6. **Instancing**: Ab 3+ identischen Meshes `<Instances>` aus drei verwenden
7. **Keine inline Objekte**: `position={[0,0,0]}` ist ok, aber komplexe Objekte in `useMemo`

## Modell laden (GLB/glTF)

```tsx
import { useGLTF } from '@react-three/drei'

// Pre-generiert mit: npx gltfjsx model.glb --transform --types
export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/model.glb')
  return (
    <group {...props}>
      <mesh geometry={nodes.Body.geometry} material={materials.Default} />
    </group>
  )
}

useGLTF.preload('/models/model.glb')
```

## Partikel-System

```tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Particles({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const matrices = useMemo(() => {
    const temp = new THREE.Matrix4()
    const arr = new Float32Array(count * 16)
    for (let i = 0; i < count; i++) {
      temp.setPosition(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )
      temp.toArray(arr, i * 16)
    }
    return arr
  }, [count])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  )
}
```
