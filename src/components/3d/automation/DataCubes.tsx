import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DataCubesProps {
  conveyorPos: [number, number, number]
  conveyorLength?: number
  active: boolean
  cubeCount?: number
}

/**
 * Leuchtende Wuerfel die sich auf dem Foerderband bewegen.
 * Stellen Datenpakete dar die automatisch verarbeitet werden.
 */
export function DataCubes({
  conveyorPos,
  conveyorLength = 8,
  active,
  cubeCount = 6,
}: DataCubesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const cubeData = useMemo(() => {
    return Array.from({ length: cubeCount }, (_, i) => ({
      phase: i / cubeCount,
      speed: 0.8 + Math.random() * 0.4,
      scale: 0.15 + Math.random() * 0.1,
      color: new THREE.Color(
        ['#4080ff', '#40ff80', '#ff8040', '#c040ff', '#40c0ff', '#ff4080'][i % 6]
      ),
    }))
  }, [cubeCount])

  const dummy = useMemo(() => new THREE.Matrix4(), [])
  const tmpScale = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!meshRef.current || !active) {
      // Verstecke alle wenn nicht aktiv
      if (meshRef.current) {
        for (let i = 0; i < cubeCount; i++) {
          dummy.makeScale(0, 0, 0)
          meshRef.current.setMatrixAt(i, dummy)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
      }
      return
    }

    const t = state.clock.elapsedTime
    const halfLen = conveyorLength / 2

    for (let i = 0; i < cubeCount; i++) {
      const cube = cubeData[i]
      // Position entlang des Bands
      const progress = ((cube.phase + t * 0.15 * cube.speed) % 1)
      const x = conveyorPos[0] + progress * conveyorLength - halfLen
      const y = conveyorPos[1] + 0.2 + cube.scale / 2
      const z = conveyorPos[2]

      // Leichte Rotation
      const rot = new THREE.Euler(t * 0.5, t * 0.3 + i, 0)
      const quat = new THREE.Quaternion().setFromEuler(rot)
      tmpScale.set(cube.scale, cube.scale, cube.scale)

      dummy.compose(
        new THREE.Vector3(x, y, z),
        quat,
        tmpScale
      )
      meshRef.current.setMatrixAt(i, dummy)
      meshRef.current.setColorAt(i, cube.color)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cubeCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        emissive="#ffffff"
        emissiveIntensity={0.4}
        metalness={0.2}
        roughness={0.1}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        toneMapped={false}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}
