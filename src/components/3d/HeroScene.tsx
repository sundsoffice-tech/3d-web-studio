import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function FloatingGeometry() {
  const reducedMotion = useReducedMotion()
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Zentrales Objekt mit Distortion */}
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={0.5} floatIntensity={1.5}>
        <mesh scale={1.8}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#4060ff"
            roughness={0.2}
            metalness={0.8}
            distort={reducedMotion ? 0 : 0.3}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Orbiting Shapes */}
      <OrbitingShapes paused={reducedMotion} />
    </group>
  )
}

function OrbitingShapes({ paused }: { paused: boolean }) {
  const shapes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      radius: 3 + Math.random() * 1.5,
      speed: 0.2 + Math.random() * 0.3,
      yOffset: (Math.random() - 0.5) * 2,
      scale: 0.1 + Math.random() * 0.2,
      type: i % 3,
      color: ['#ff4080', '#40ff80', '#8040ff', '#ff8040', '#40c0ff'][i % 5],
    }))
  }, [])

  return (
    <>
      {shapes.map((shape) => (
        <OrbitingShape key={shape.id} {...shape} paused={paused} />
      ))}
    </>
  )
}

function OrbitingShape({
  angle,
  radius,
  speed,
  yOffset,
  scale,
  type,
  color,
  paused,
}: {
  angle: number
  radius: number
  speed: number
  yOffset: number
  scale: number
  type: number
  color: string
  paused: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = paused ? 0 : state.clock.elapsedTime
    meshRef.current.position.x = Math.cos(angle + t * speed) * radius
    meshRef.current.position.z = Math.sin(angle + t * speed) * radius
    meshRef.current.position.y = yOffset + Math.sin(t * 0.5 + angle) * 0.3
    meshRef.current.rotation.x = t * 0.5
    meshRef.current.rotation.z = t * 0.3
  })

  return (
    <mesh ref={meshRef} scale={scale}>
      {type === 0 && <boxGeometry args={[1, 1, 1]} />}
      {type === 1 && <octahedronGeometry args={[0.7]} />}
      {type === 2 && <tetrahedronGeometry args={[0.7]} />}
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <div
      role="img"
      aria-label="Interaktive 3D-Szene mit schwebenden geometrischen Formen"
      style={{ width: '100%', height: '100%' }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050510']} />
          <fog attach="fog" args={['#050510', 8, 25]} />

          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#4060ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.5} color="#ff4080" />

          <FloatingGeometry />
          <Stars radius={50} depth={80} count={2000} factor={3} saturation={0.5} fade speed={0.5} />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}
