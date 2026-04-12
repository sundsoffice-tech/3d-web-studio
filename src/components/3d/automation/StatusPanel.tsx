import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, RoundedBox, Outlines } from '@react-three/drei'
import * as THREE from 'three'

interface StatusPanelProps {
  position: [number, number, number]
  label: string
  value: string
  active: boolean
}

/**
 * Holographisches Status-Display das ueber einer Station schwebt.
 */
export function StatusPanel({
  position,
  label,
  value,
  active,
}: StatusPanelProps) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!groupRef.current) return
    // Leichtes Schweben
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05
  })

  return (
    <Billboard position={position}>
      <group ref={groupRef}>
        {/* Panel-Hintergrund */}
        <RoundedBox args={[1.8, 0.6, 0.02]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#0a1020"
            transparent
            opacity={active ? 0.7 : 0.3}
            metalness={0.5}
            roughness={0.3}
          />
        </RoundedBox>

        {/* Outline statt zweites Mesh */}
        <Outlines thickness={0.015} color={active ? '#4080ff' : '#1a2040'} transparent opacity={active ? 0.6 : 0.15} />

        {/* Label */}
        <Text
          position={[0, 0.1, 0.02]}
          fontSize={0.12}
          color="#6090c0"
          anchorX="center"
        >
          {label}
        </Text>

        {/* Wert */}
        <Text
          position={[0, -0.1, 0.02]}
          fontSize={0.18}
          color={active ? '#ffffff' : '#4a5060'}
          anchorX="center"
          fontWeight="bold"
        >
          {value}
        </Text>
      </group>
    </Billboard>
  )
}
