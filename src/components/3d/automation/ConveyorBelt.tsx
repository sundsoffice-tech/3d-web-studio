import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'

interface ConveyorBeltProps {
  position: [number, number, number]
  length?: number
  rotation?: [number, number, number]
  active: boolean
}

/**
 * Animiertes Foerderband mit sich bewegenden Segmenten
 * und Rollen an den Enden.
 */
export function ConveyorBelt({
  position,
  length = 8,
  rotation = [0, 0, 0],
  active,
}: ConveyorBeltProps) {
  const segmentsRef = useRef<THREE.InstancedMesh>(null!)

  const segmentCount = Math.floor(length * 4)
  const segmentWidth = length / segmentCount

  const dummy = useMemo(() => new THREE.Matrix4(), [])

  useFrame((state) => {
    if (!segmentsRef.current) return
    const t = active ? state.clock.elapsedTime : 0

    for (let i = 0; i < segmentCount; i++) {
      // Segmente bewegen sich entlang der X-Achse und loopen
      const offset = ((i * segmentWidth + t * 1.5) % length) - length / 2
      dummy.makeTranslation(offset, 0, 0)
      segmentsRef.current.setMatrixAt(i, dummy)
    }
    segmentsRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Seitenwaende mit Outline */}
      <mesh position={[0, 0, 0.35]}>
        <boxGeometry args={[length + 0.4, 0.2, 0.05]} />
        <meshPhysicalMaterial color="#1a2030" metalness={0.85} roughness={0.2} clearcoat={0.2} />
        <Outlines thickness={0.003} color="#ffffff" opacity={0.08} transparent />
      </mesh>
      <mesh position={[0, 0, -0.35]}>
        <boxGeometry args={[length + 0.4, 0.2, 0.05]} />
        <meshPhysicalMaterial color="#1a2030" metalness={0.85} roughness={0.2} clearcoat={0.2} />
        <Outlines thickness={0.003} color="#ffffff" opacity={0.08} transparent />
      </mesh>

      {/* Bandflaeche (Hintergrund) */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[length, 0.05, 0.6]} />
        <meshStandardMaterial color="#111820" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Animierte Band-Segmente */}
      <instancedMesh
        ref={segmentsRef}
        args={[undefined, undefined, segmentCount]}
        position={[0, 0.09, 0]}
      >
        <boxGeometry args={[segmentWidth * 0.85, 0.03, 0.55]} />
        <meshStandardMaterial color="#2a3545" metalness={0.5} roughness={0.6} />
      </instancedMesh>

      {/* Rollen an den Enden */}
      <Roller position={[-length / 2 - 0.05, 0, 0]} active={active} />
      <Roller position={[length / 2 + 0.05, 0, 0]} active={active} />

      {/* Leuchtstreifen an den Seiten */}
      <mesh position={[0, 0.12, 0.37]}>
        <boxGeometry args={[length - 0.5, 0.02, 0.01]} />
        <meshStandardMaterial
          color="#4080ff"
          emissive="#4080ff"
          emissiveIntensity={active ? 0.4 : 0.05}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.12, -0.37]}>
        <boxGeometry args={[length - 0.5, 0.02, 0.01]} />
        <meshStandardMaterial
          color="#4080ff"
          emissive="#4080ff"
          emissiveIntensity={active ? 0.4 : 0.05}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Roller({
  position,
  active,
}: {
  position: [number, number, number]
  active: boolean
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!ref.current || !active) return
    ref.current.rotation.z -= 0.05
  })

  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.65, 12]} />
      <meshPhysicalMaterial color="#3a4050" metalness={0.85} roughness={0.15} clearcoat={0.3} />
    </mesh>
  )
}
