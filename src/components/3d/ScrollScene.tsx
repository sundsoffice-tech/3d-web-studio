import { useRef, useMemo, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ScrollSceneProps {
  containerRef: RefObject<HTMLDivElement | null>
}

function CameraRig({ progress }: { progress: number }) {
  useFrame((state) => {
    const t = progress
    // Kamera kreist um die Szene basierend auf Scroll
    state.camera.position.x = Math.sin(t * Math.PI * 2) * 6
    state.camera.position.y = 1 + t * 2
    state.camera.position.z = Math.cos(t * Math.PI * 2) * 6
    state.camera.lookAt(0, 0, 0)
  })

  return null
}

function GlassTorus({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const reducedMotion = useReducedMotion()

  useFrame((_, delta) => {
    if (!meshRef.current || reducedMotion) return
    meshRef.current.rotation.x += delta * 0.15
    meshRef.current.rotation.z += delta * 0.1
  })

  const scale = THREE.MathUtils.lerp(0.3, 1, Math.min(progress * 3, 1))

  return (
    <mesh ref={meshRef} scale={scale}>
      <torusKnotGeometry args={[1, 0.35, 128, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={6}
        thickness={0.5}
        chromaticAberration={0.15}
        anisotropy={0.3}
        distortion={0.3}
        distortionScale={0.2}
        temporalDistortion={0.1}
        ior={1.5}
        color="#c0d0ff"
      />
    </mesh>
  )
}

function FloatingRings({ progress }: { progress: number }) {
  const rings = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        radius: 2.5 + i * 0.5,
        color: ['#ff4080', '#4060ff', '#40ff80', '#ff8040', '#c040ff'][i],
      })),
    []
  )

  return (
    <>
      {rings.map((ring) => (
        <Ring key={ring.id} {...ring} progress={progress} />
      ))}
    </>
  )
}

function Ring({
  radius,
  color,
  progress,
  id,
}: {
  radius: number
  color: string
  progress: number
  id: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (!meshRef.current) return
    // Ringe erscheinen nacheinander beim Scrollen
    const ringProgress = Math.max(0, (progress - id * 0.1) / 0.3)
    const scale = THREE.MathUtils.clamp(ringProgress, 0, 1)
    meshRef.current.scale.setScalar(scale)
    meshRef.current.rotation.x = Math.PI / 2 + progress * Math.PI * 0.5
    meshRef.current.rotation.z = progress * Math.PI * id * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, 0.02, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  )
}

function PhaseLabel({ progress }: { progress: number }) {
  const phase = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2
  const labels = ['Entstehung', 'Transformation', 'Vollendung']
  const opacity = Math.sin(((progress * 3) % 1) * Math.PI)

  return (
    <Text
      position={[0, -2.5, 0]}
      fontSize={0.4}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      fillOpacity={opacity * 0.7}
    >
      {labels[phase]}
    </Text>
  )
}

function ScrollContent({ progress }: { progress: number }) {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 6, 20]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#4060ff" />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#ff4080" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={1}
        color="#ffffff"
      />

      <CameraRig progress={progress} />
      <GlassTorus progress={progress} />
      <FloatingRings progress={progress} />
      <PhaseLabel progress={progress} />

      <Environment preset="night" />
    </>
  )
}

export function ScrollScene({ containerRef }: ScrollSceneProps) {
  const progress = useScrollProgress(containerRef)

  return (
    <div className="scroll-canvas-wrapper">
      <div
        role="img"
        aria-label="Scroll-gesteuerte 3D-Animation: Glasobjekt mit umkreisenden Ringen"
        style={{ width: '100%', height: '100%' }}
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ScrollContent progress={progress} />
          </Suspense>
        </Canvas>
      </div>
      <div className="scroll-info">
        <h2>Scroll-Animation</h2>
        <p>{Math.round(progress * 100)}% gescrollt</p>
      </div>
    </div>
  )
}
