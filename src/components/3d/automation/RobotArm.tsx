import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'

interface RobotArmProps {
  position: [number, number, number]
  color?: string
  speed?: number
  phaseOffset?: number
  active: boolean
  task?: 'pickup' | 'weld' | 'place'
}

// Wiederverwendbare Materialien
function JointMaterial() {
  return (
    <meshPhysicalMaterial
      color="#2a3040"
      metalness={0.9}
      roughness={0.15}
      clearcoat={0.3}
      clearcoatRoughness={0.2}
    />
  )
}

function MetalMaterial() {
  return (
    <meshPhysicalMaterial
      color="#8a95a5"
      metalness={0.75}
      roughness={0.25}
      sheen={0.3}
      sheenColor="#ffffff"
      sheenRoughness={0.4}
      clearcoat={0.15}
    />
  )
}

function AccentMaterial({
  color,
  active,
  intensity = 0.6,
}: {
  color: THREE.Color
  active: boolean
  intensity?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={active ? intensity : 0.05}
      toneMapped={false}
    />
  )
}

// Gelenk-Ring fuer visuelles Detail
function JointRing({ radius = 0.2 }: { radius?: number }) {
  return (
    <mesh>
      <torusGeometry args={[radius, 0.015, 6, 16]} />
      <meshStandardMaterial color="#1a2030" metalness={0.9} roughness={0.2} />
    </mesh>
  )
}

export function RobotArm({
  position,
  color = '#4080ff',
  speed = 1,
  phaseOffset = 0,
  active,
  task = 'pickup',
}: RobotArmProps) {
  const baseRef = useRef<THREE.Group>(null!)
  const shoulderRef = useRef<THREE.Group>(null!)
  const elbowRef = useRef<THREE.Group>(null!)
  const gripperLRef = useRef<THREE.Mesh>(null!)
  const gripperRRef = useRef<THREE.Mesh>(null!)

  const accentColor = useMemo(() => new THREE.Color(color), [color])

  useFrame((state) => {
    if (!active) return
    const raw = state.clock.elapsedTime * speed * 0.4 + phaseOffset
    const cycle = raw % 1

    let baseY = 0
    let shoulderZ = 0
    let elbowZ = 0
    let gripOpen = 0.22

    if (task === 'pickup') {
      if (cycle < 0.15) {
        const t = cycle / 0.15
        baseY = THREE.MathUtils.lerp(0, -0.7, t)
        shoulderZ = THREE.MathUtils.lerp(-0.2, -0.7, t)
        elbowZ = THREE.MathUtils.lerp(-0.1, -0.6, t)
      } else if (cycle < 0.25) {
        const t = (cycle - 0.15) / 0.1
        baseY = -0.7
        shoulderZ = -0.7
        elbowZ = -0.6
        gripOpen = THREE.MathUtils.lerp(0.22, 0.04, t)
      } else if (cycle < 0.4) {
        const t = (cycle - 0.25) / 0.15
        baseY = -0.7
        shoulderZ = THREE.MathUtils.lerp(-0.7, -0.15, t)
        elbowZ = THREE.MathUtils.lerp(-0.6, -0.3, t)
        gripOpen = 0.04
      } else if (cycle < 0.6) {
        const t = (cycle - 0.4) / 0.2
        baseY = THREE.MathUtils.lerp(-0.7, 0.7, t)
        shoulderZ = -0.15
        elbowZ = -0.3
        gripOpen = 0.04
      } else if (cycle < 0.75) {
        const t = (cycle - 0.6) / 0.15
        baseY = 0.7
        shoulderZ = THREE.MathUtils.lerp(-0.15, -0.65, t)
        elbowZ = THREE.MathUtils.lerp(-0.3, -0.55, t)
        gripOpen = 0.04
      } else if (cycle < 0.85) {
        const t = (cycle - 0.75) / 0.1
        baseY = 0.7
        shoulderZ = -0.65
        elbowZ = -0.55
        gripOpen = THREE.MathUtils.lerp(0.04, 0.22, t)
      } else {
        const t = (cycle - 0.85) / 0.15
        baseY = THREE.MathUtils.lerp(0.7, 0, t)
        shoulderZ = THREE.MathUtils.lerp(-0.65, -0.2, t)
        elbowZ = THREE.MathUtils.lerp(-0.55, -0.1, t)
      }
    } else if (task === 'weld') {
      if (cycle < 0.2) {
        const t = cycle / 0.2
        baseY = -0.4
        shoulderZ = THREE.MathUtils.lerp(-0.2, -0.55, t)
        elbowZ = THREE.MathUtils.lerp(-0.1, -0.5, t)
        gripOpen = 0.02
      } else if (cycle < 0.7) {
        const t = (cycle - 0.2) / 0.5
        baseY = THREE.MathUtils.lerp(-0.4, 0.4, t)
        shoulderZ = -0.55 + Math.sin(t * Math.PI * 3) * 0.03
        elbowZ = -0.5
        gripOpen = 0.02
      } else {
        const t = (cycle - 0.7) / 0.3
        baseY = THREE.MathUtils.lerp(0.4, -0.4, t)
        shoulderZ = THREE.MathUtils.lerp(-0.55, -0.2, t)
        elbowZ = THREE.MathUtils.lerp(-0.5, -0.1, t)
        gripOpen = 0.02
      }
    } else {
      if (cycle < 0.2) {
        const t = cycle / 0.2
        baseY = 0.5
        shoulderZ = THREE.MathUtils.lerp(-0.2, -0.7, t)
        elbowZ = THREE.MathUtils.lerp(-0.1, -0.6, t)
        gripOpen = THREE.MathUtils.lerp(0.22, 0.04, t)
      } else if (cycle < 0.45) {
        const t = (cycle - 0.2) / 0.25
        baseY = 0.5
        shoulderZ = THREE.MathUtils.lerp(-0.7, -0.1, t)
        elbowZ = THREE.MathUtils.lerp(-0.6, -0.2, t)
        gripOpen = 0.04
      } else if (cycle < 0.65) {
        const t = (cycle - 0.45) / 0.2
        baseY = THREE.MathUtils.lerp(0.5, -0.6, t)
        shoulderZ = -0.1
        elbowZ = -0.2
        gripOpen = 0.04
      } else if (cycle < 0.85) {
        const t = (cycle - 0.65) / 0.2
        baseY = -0.6
        shoulderZ = THREE.MathUtils.lerp(-0.1, -0.6, t)
        elbowZ = THREE.MathUtils.lerp(-0.2, -0.5, t)
        gripOpen = THREE.MathUtils.lerp(0.04, 0.22, t)
      } else {
        const t = (cycle - 0.85) / 0.15
        baseY = THREE.MathUtils.lerp(-0.6, 0.5, t)
        shoulderZ = THREE.MathUtils.lerp(-0.6, -0.2, t)
        elbowZ = THREE.MathUtils.lerp(-0.5, -0.1, t)
      }
    }

    if (baseRef.current) baseRef.current.rotation.y = baseY
    if (shoulderRef.current) shoulderRef.current.rotation.z = shoulderZ
    if (elbowRef.current) elbowRef.current.rotation.z = elbowZ
    if (gripperLRef.current) gripperLRef.current.position.x = -gripOpen
    if (gripperRRef.current) gripperRRef.current.position.x = gripOpen
  })

  return (
    <group position={position}>
      {/* Bodenplatte mit Outline */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.1, 16]} />
        <JointMaterial />
        <Outlines thickness={0.008} color={color} opacity={0.4} transparent />
      </mesh>

      {/* Warnstreifen an der Basis */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.78, 24]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.2} toneMapped={false} />
      </mesh>

      <group ref={baseRef} position={[0, 0.15, 0]}>
        {/* Basis-Zylinder */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 12]} />
          <MetalMaterial />
          <Outlines thickness={0.005} color="#ffffff" opacity={0.15} transparent />
        </mesh>

        {/* Leuchtring */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.32, 0.03, 8, 24]} />
          <AccentMaterial color={accentColor} active={active} intensity={0.8} />
        </mesh>

        {/* Schulter */}
        <group ref={shoulderRef} position={[0, 0.55, 0]}>
          <mesh>
            <sphereGeometry args={[0.18, 12, 12]} />
            <JointMaterial />
          </mesh>
          <JointRing radius={0.19} />

          {/* Oberarm */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.15, 1.0, 0.15]} />
            <MetalMaterial />
            <Outlines thickness={0.004} color="#ffffff" opacity={0.1} transparent />
          </mesh>

          {/* Leuchtstreifen Oberarm */}
          <mesh position={[0.085, 0.6, 0]}>
            <boxGeometry args={[0.015, 0.8, 0.06]} />
            <AccentMaterial color={accentColor} active={active} />
          </mesh>
          <mesh position={[-0.085, 0.6, 0]}>
            <boxGeometry args={[0.015, 0.8, 0.06]} />
            <AccentMaterial color={accentColor} active={active} intensity={0.3} />
          </mesh>

          {/* Kabeldetail am Oberarm */}
          <mesh position={[0, 0.6, 0.09]}>
            <cylinderGeometry args={[0.012, 0.012, 0.7, 4]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>

          {/* Ellbogen */}
          <group ref={elbowRef} position={[0, 1.1, 0]}>
            <mesh>
              <sphereGeometry args={[0.14, 12, 12]} />
              <JointMaterial />
            </mesh>
            <JointRing radius={0.15} />

            {/* Unterarm */}
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.12, 0.7, 0.12]} />
              <MetalMaterial />
              <Outlines thickness={0.004} color="#ffffff" opacity={0.1} transparent />
            </mesh>

            {/* Leuchtstreifen Unterarm */}
            <mesh position={[0.07, 0.45, 0]}>
              <boxGeometry args={[0.015, 0.5, 0.05]} />
              <AccentMaterial color={accentColor} active={active} />
            </mesh>

            {/* Kabel am Unterarm */}
            <mesh position={[0, 0.45, 0.075]}>
              <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>

            {/* Greifer-Basis */}
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.3, 0.08, 0.15]} />
              <JointMaterial />
            </mesh>

            {/* Greifer-Finger */}
            <mesh ref={gripperLRef} position={[-0.12, 0.97, 0]}>
              <boxGeometry args={[0.04, 0.18, 0.1]} />
              <meshPhysicalMaterial
                color={accentColor}
                metalness={0.6}
                roughness={0.3}
                sheen={0.5}
                sheenColor={accentColor}
              />
            </mesh>
            <mesh ref={gripperRRef} position={[0.12, 0.97, 0]}>
              <boxGeometry args={[0.04, 0.18, 0.1]} />
              <meshPhysicalMaterial
                color={accentColor}
                metalness={0.6}
                roughness={0.3}
                sheen={0.5}
                sheenColor={accentColor}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
