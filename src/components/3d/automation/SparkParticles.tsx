import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SparkParticlesProps {
  position: [number, number, number]
  active: boolean
  count?: number
}

/**
 * Funkenflug-Partikel an Roboter-Arbeitspunkten.
 * Simuliert Schweiss-/Bearbeitungsfunken.
 */
export function SparkParticles({
  position,
  active,
  count = 40,
}: SparkParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, velocities, lifetimes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = Array.from({ length: count }, () => new THREE.Vector3())
    const life = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      life[i] = Math.random()
      vel[i].set(
        (Math.random() - 0.5) * 2,
        Math.random() * 3,
        (Math.random() - 0.5) * 2
      )
    }

    return { positions: pos, velocities: vel, lifetimes: life }
  }, [count])

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return

    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute

    for (let i = 0; i < count; i++) {
      lifetimes[i] -= delta * 2

      if (lifetimes[i] <= 0) {
        // Respawn
        lifetimes[i] = 0.5 + Math.random() * 0.5
        posAttr.setXYZ(i, 0, 0, 0)
        velocities[i].set(
          (Math.random() - 0.5) * 3,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 3
        )
      } else {
        // Physik
        const x = posAttr.getX(i) + velocities[i].x * delta
        const y = posAttr.getY(i) + velocities[i].y * delta
        const z = posAttr.getZ(i) + velocities[i].z * delta
        velocities[i].y -= 9.8 * delta // Schwerkraft
        posAttr.setXYZ(i, x, y, z)
      }
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffcc60"
        toneMapped={false}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
