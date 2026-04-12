import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ChillingDudeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  active: boolean
}

const SKIN = '#d4a574'
const SHIRT = '#3090d0'
const SHORTS = '#2a5a3a'

/*
  Referenz-Berechnung (CapsuleGeometry: totalHeight = height + 2*radius):

  TORSO:  capsule(0.13, 0.18) -> total 0.44, half 0.22
          Liegt entlang Z via rotation=[PI/2,0,0]
          Center [0,0,0] -> extends Z: -0.22 to +0.22

  NECK:   capsule(0.04, 0.03) -> total 0.11, half 0.055
          At Z = -0.22 (torso top)

  HEAD:   sphere(0.1)
          At Z = -0.22 - 0.07 - 0.1 = -0.39 (nach neck)

  HIP:    capsule(0.12, 0.03) -> total 0.27, half 0.135
          At Z = +0.20 (torso bottom, ueberlappt)

  THIGH:  capsule(0.05, 0.12) -> total 0.22, half 0.11
          Starts at Z = +0.28 (hip area)

  KNEE:   sphere(0.042) at thigh end

  SHIN:   capsule(0.038, 0.12) -> total 0.196, half 0.098

  FOOT:   capsule(0.03, 0.04) rotated for flat foot
*/

export function ChillingDude({
  position,
  rotation = [0, 0, 0],
  active,
}: ChillingDudeProps) {
  const drinkArmRef = useRef<THREE.Group>(null!)
  const headRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!active) return
    const t = state.clock.elapsedTime
    const cycle = (t * 0.25) % 1

    let armRot = 0
    let headTilt = 0

    if (cycle < 0.15) {
      const p = cycle / 0.15
      armRot = THREE.MathUtils.lerp(0, -0.5, p)
      headTilt = THREE.MathUtils.lerp(0, 0.08, p)
    } else if (cycle < 0.3) {
      armRot = -0.5 + Math.sin(((cycle - 0.15) / 0.15) * Math.PI * 2) * 0.03
      headTilt = 0.08
    } else if (cycle < 0.45) {
      const p = (cycle - 0.3) / 0.15
      armRot = THREE.MathUtils.lerp(-0.5, 0, p)
      headTilt = THREE.MathUtils.lerp(0.08, 0, p)
    } else {
      armRot = Math.sin(t * 0.3) * 0.008
      headTilt = Math.sin(t * 0.2) * 0.008
    }

    // Arm rotiert um X (in dem gekippten Koordinatensystem hebt das den Drink)
    if (drinkArmRef.current) drinkArmRef.current.rotation.x = armRot
    if (headRef.current) headRef.current.rotation.z = headTilt
  })

  // Alle Capsules liegen entlang Z via rotation=[PI/2,0,0]
  const LIE = [Math.PI / 2, 0, 0] as const

  return (
    <group position={position} rotation={rotation}>
      <Lounger />

      {/*
        Koerper liegt auf dem Stuhl.
        Stuhl-Sitz: y=0.42, geneigt 0.35 rad
        Koerper-Gruppe: gleiche Neigung, auf der Sitzflaeche
      */}
      {/* Mathematik: bodyY = planeY + R*cos(θ), bodyZ = planeZ - R*sin(θ)
           planeY=0.42, planeZ=0.05, R=0.13, θ=0.35
           bodyY = 0.42 + 0.122 = 0.542, bodyZ = 0.05 - 0.045 = 0.005 */}
      <group position={[0, 0.542, 0.005]} rotation={[0.35, 0, 0]}>

        {/* === TORSO === */}
        <mesh rotation={LIE}>
          <capsuleGeometry args={[0.13, 0.18, 6, 10]} />
          <meshStandardMaterial color={SHIRT} roughness={0.75} />
        </mesh>

        {/* === HALS + KOPF (Z = -0.22 = Torso-Top) === */}
        <group ref={headRef} position={[0, 0.02, -0.22]}>
          {/* Hals */}
          <mesh rotation={LIE}>
            <capsuleGeometry args={[0.04, 0.03, 4, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Kopf (Hals-Top = -0.055, Kopf-Center noch weiter) */}
          <mesh position={[0, 0.03, -0.12]}>
            <sphereGeometry args={[0.1, 14, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Haare */}
          <mesh position={[0, 0.06, -0.13]}>
            <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
          </mesh>
          {/* Ohren */}
          <mesh position={[-0.09, 0.02, -0.12]}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial color="#c89565" roughness={0.85} />
          </mesh>
          <mesh position={[0.09, 0.02, -0.12]}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial color="#c89565" roughness={0.85} />
          </mesh>
          {/* Sonnenbrille */}
          <mesh position={[-0.033, 0.04, -0.04]}>
            <sphereGeometry args={[0.025, 8, 6, 0, Math.PI]} />
            <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.05} clearcoat={1} />
          </mesh>
          <mesh position={[0.033, 0.04, -0.04]}>
            <sphereGeometry args={[0.025, 8, 6, 0, Math.PI]} />
            <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.05} clearcoat={1} />
          </mesh>
          {/* Nase */}
          <mesh position={[0, 0.015, -0.045]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#c89565" roughness={0.85} />
          </mesh>
          {/* Mund */}
          <mesh position={[0, -0.01, -0.04]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.016, 0.003, 4, 8, Math.PI]} />
            <meshStandardMaterial color="#b07050" />
          </mesh>
        </group>

        {/* === HUEFTE (Z = +0.20 = nahe Torso-Bottom) === */}
        <mesh position={[0, -0.02, 0.20]} rotation={LIE}>
          <capsuleGeometry args={[0.12, 0.03, 6, 8]} />
          <meshStandardMaterial color={SHORTS} roughness={0.8} />
        </mesh>

        {/* === LINKER ARM (seitlich, X = -0.15) === */}
        <group position={[-0.15, 0.0, -0.06]}>
          {/* Schulter (r=0.05, ueberlappt Torso r=0.13) */}
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={SHIRT} roughness={0.75} />
          </mesh>
          {/* Oberarm: nach aussen/vorne, entlang Z mit leichtem X-Winkel */}
          <mesh position={[-0.04, 0, 0.1]} rotation={[0.3, 0, 0.4]}>
            <capsuleGeometry args={[0.033, 0.1, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Ellbogen */}
          <mesh position={[-0.08, -0.02, 0.2]}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Unterarm */}
          <mesh position={[-0.1, -0.02, 0.3]} rotation={[0.05, 0, 0.2]}>
            <capsuleGeometry args={[0.026, 0.08, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.12, -0.02, 0.38]}>
            <sphereGeometry args={[0.026, 6, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
        </group>

        {/* === RECHTER ARM (haelt Drink) === */}
        <group ref={drinkArmRef} position={[0.15, 0.0, -0.06]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={SHIRT} roughness={0.75} />
          </mesh>
          {/* Oberarm */}
          <mesh position={[0.04, 0, 0.08]} rotation={[0.2, 0, -0.35]}>
            <capsuleGeometry args={[0.033, 0.09, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Ellbogen */}
          <mesh position={[0.08, -0.01, 0.16]}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Unterarm */}
          <mesh position={[0.09, 0, 0.24]} rotation={[-0.2, 0, -0.1]}>
            <capsuleGeometry args={[0.026, 0.07, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Hand + Drink */}
          <group position={[0.09, 0, 0.32]}>
            <mesh>
              <sphereGeometry args={[0.026, 6, 6]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
            <CocktailGlass />
          </group>
        </group>

        {/* === LINKES BEIN (Start Z = +0.28, innerhalb Huefte) === */}
        <group position={[-0.06, -0.03, 0.28]}>
          {/* Oberschenkel: total 0.22, half 0.11 */}
          <mesh position={[0, 0, 0.11]} rotation={LIE}>
            <capsuleGeometry args={[0.05, 0.12, 5, 8]} />
            <meshStandardMaterial color={SHORTS} roughness={0.8} />
          </mesh>
          {/* Knie: bei Z = 0.22 (Oberschenkel-Ende) */}
          <mesh position={[0, 0, 0.22]}>
            <sphereGeometry args={[0.042, 6, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Wade: total 0.196, half 0.098 */}
          <mesh position={[0, 0, 0.32]} rotation={LIE}>
            <capsuleGeometry args={[0.038, 0.12, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Fuss: bei Z = 0.42 (Wade-Ende) */}
          <mesh position={[0, -0.03, 0.44]} rotation={[-1.2, 0, 0]}>
            <capsuleGeometry args={[0.028, 0.04, 3, 6]} />
            <meshStandardMaterial color="#c0a880" roughness={0.9} />
          </mesh>
        </group>

        {/* === RECHTES BEIN === */}
        <group position={[0.06, -0.03, 0.28]}>
          <mesh position={[0, 0, 0.11]} rotation={LIE}>
            <capsuleGeometry args={[0.05, 0.12, 5, 8]} />
            <meshStandardMaterial color={SHORTS} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.22]}>
            <sphereGeometry args={[0.042, 6, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.32]} rotation={LIE}>
            <capsuleGeometry args={[0.038, 0.12, 4, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.03, 0.44]} rotation={[-1.2, 0, 0]}>
            <capsuleGeometry args={[0.028, 0.04, 3, 6]} />
            <meshStandardMaterial color="#c0a880" roughness={0.9} />
          </mesh>
        </group>

      </group>
    </group>
  )
}

function Lounger() {
  const F = '#a09080'
  return (
    <group>
      {/* Stoff Sitz+Lehne */}
      <mesh position={[0, 0.42, 0.05]} rotation={[0.35, 0, 0]}>
        <planeGeometry args={[0.6, 1.3]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.66, -0.5]} rotation={[0.85, 0, 0]}>
        <planeGeometry args={[0.6, 0.65]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Rahmen */}
      {[-0.31, 0.31].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.39, 0.05]} rotation={[0.35, 0, 0]}>
            <capsuleGeometry args={[0.013, 1.2, 3, 6]} />
            <meshStandardMaterial color={F} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[x, 0.64, -0.45]} rotation={[0.85, 0, 0]}>
            <capsuleGeometry args={[0.013, 0.55, 3, 6]} />
            <meshStandardMaterial color={F} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Beine */}
      {([[-0.31, 0.55], [0.31, 0.55], [-0.31, -0.35], [0.31, -0.35]] as const).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.19, z]}>
          <capsuleGeometry args={[0.011, 0.3, 3, 6]} />
          <meshStandardMaterial color={F} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
      {/* Querstreben */}
      {[0.55, -0.35].map((z) => (
        <mesh key={z} position={[0, 0.04, z]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.009, 0.54, 3, 4]} />
          <meshStandardMaterial color={F} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function CocktailGlass() {
  return (
    <group position={[0, 0.03, 0]}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.022, 0.08, 8, 1, true]} />
        <meshPhysicalMaterial color="#c0e8ff" transmission={0.6} thickness={0.3} roughness={0.02} ior={1.45} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.023, 0.019, 0.05, 8]} />
        <meshStandardMaterial color="#ff7030" roughness={0.3} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.006, 0.03, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[0.002, 0.06, 2, 4]} />
        <meshStandardMaterial color="#ff3050" />
      </mesh>
      <mesh position={[-0.006, 0.035, 0]} rotation={[0.1, 0, -0.15]}>
        <coneGeometry args={[0.018, 0.009, 8, 1, true]} />
        <meshStandardMaterial color="#ffe040" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
