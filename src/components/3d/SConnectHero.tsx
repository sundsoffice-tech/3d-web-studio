import { useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- Colors ---
const TEAL = new THREE.Color('#00d4aa')
const NAVY = new THREE.Color('#0077b6')
const CYAN = new THREE.Color('#00b4d8')

// --- Central Icosahedron ---
function CoreShape() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    ref.current.rotation.y += 0.001
    ref.current.rotation.x += 0.0005
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshStandardMaterial
        color={TEAL}
        wireframe
        emissive={TEAL}
        emissiveIntensity={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// --- Orbiting Shape ---
function OrbitShape({
  geometry,
  color,
  radius,
  speed,
  offset = 0,
  scale = 0.35,
}: {
  geometry: 'octahedron' | 'torusKnot' | 'sphere' | 'ring'
  color: THREE.Color
  radius: number
  speed: number
  offset?: number
  scale?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius
    ref.current.position.y = Math.sin(t * 0.7) * 0.8
    ref.current.rotation.x += 0.005
    ref.current.rotation.y += 0.008
  })

  return (
    <mesh ref={ref} scale={scale}>
      {geometry === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'torusKnot' && <torusKnotGeometry args={[0.6, 0.2, 64, 8]} />}
      {geometry === 'sphere' && <sphereGeometry args={[1, 16, 16]} />}
      {geometry === 'ring' && <torusGeometry args={[1, 0.15, 12, 32]} />}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={geometry === 'sphere' ? 0.5 : 0.8}
      />
    </mesh>
  )
}

// --- Particles ---
function Particles({ count = 150 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    return arr
  }, [count])

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + 0.003
      pos.setY(i, y > 8 ? -8 : y)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={TEAL}
        size={0.03}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  )
}

// --- Mouse Parallax ---
function MouseParallax() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'mousemove') {
      target.current.x = (e.data.x - 0.5) * 2
      target.current.y = (e.data.y - 0.5) * 2
    }
  }, [])

  // Also listen to direct mouse
  const handleMouse = useCallback((e: MouseEvent) => {
    target.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    target.current.y = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    window.addEventListener('mousemove', handleMouse)
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [handleMessage, handleMouse])

  useFrame(() => {
    mouse.current.x += (target.current.x - mouse.current.x) * 0.05
    mouse.current.y += (target.current.y - mouse.current.y) * 0.05
    camera.position.x = mouse.current.x * 0.5
    camera.position.y = mouse.current.y * 0.3 + 0.5
    camera.lookAt(0, 0, 0)
  })

  return null
}

// --- Scene ---
function Scene({ particleCount = 150, showBloom = true }: { particleCount?: number; showBloom?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} color="#0a1122" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00d4aa" />
      <pointLight position={[-3, -2, 4]} intensity={0.4} color="#0077b6" />

      <CoreShape />
      <OrbitShape geometry="octahedron" color={NAVY} radius={3} speed={0.3} offset={0} />
      <OrbitShape geometry="torusKnot" color={CYAN} radius={4} speed={-0.2} offset={2} scale={0.25} />
      <OrbitShape geometry="sphere" color={TEAL} radius={2.5} speed={0.4} offset={4} scale={0.3} />
      <OrbitShape geometry="ring" color={NAVY} radius={3.5} speed={-0.15} offset={1} scale={0.4} />
      <Particles count={particleCount} />
      <MouseParallax />

      {showBloom && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            intensity={0.8}
          />
        </EffectComposer>
      )}
    </>
  )
}

// --- Exported Full Component ---
export default function SConnectHero() {
  const isWide = typeof window !== 'undefined' ? window.innerWidth > 900 : true
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 480 : false

  if (isMobile) return null

  const particleCount = isWide ? 150 : 50

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false }}
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      style={{ position: 'fixed', inset: 0, background: 'transparent' }}
    >
      <Scene particleCount={particleCount} showBloom={isWide} />
    </Canvas>
  )
}
