import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { FactoryCameraRig } from './FactoryCameraRig'
import { FactoryFloor } from './FactoryFloor'
import { RobotArm } from './RobotArm'
import { ConveyorBelt } from './ConveyorBelt'
import { DataCubes } from './DataCubes'
import { SparkParticles } from './SparkParticles'
import { StatusPanel } from './StatusPanel'

interface AutomationSceneProps {
  scrollProgress: number
}

function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  // Fruehere Aktivierung damit alles sichtbar ist BEVOR man vorbeiscrollt
  const phase = useMemo(() => {
    return {
      beltActive: scrollProgress > 0.05,
      robot1Active: scrollProgress > 0.08,
      robot2Active: scrollProgress > 0.12,
      robot3Active: scrollProgress > 0.16,
      cubesActive: scrollProgress > 0.1,
      sparksActive: scrollProgress > 0.2,
      panelsActive: scrollProgress > 0.06,
      allComplete: scrollProgress > 0.7,
    }
  }, [scrollProgress])

  // Dynamische Werte fuer Status-Panels
  const throughput = phase.cubesActive
    ? Math.floor(scrollProgress * 1247)
    : 0
  const efficiency = phase.allComplete ? '99.7%' : phase.beltActive ? '87.3%' : '--'

  return (
    <>
      <color attach="background" args={['#040410']} />
      <fog attach="fog" args={['#040410', 15, 45]} />

      {/* Beleuchtung */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#4060ff" distance={25} />
      <pointLight position={[-6, 5, 2]} intensity={0.8} color="#ff6040" distance={15} />
      <pointLight position={[6, 5, -2]} intensity={0.8} color="#40c0ff" distance={15} />
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.5}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />

      <FactoryCameraRig progress={scrollProgress} />
      <FactoryFloor />

      {/* === FOERDERBAENDER === */}
      {/* Hauptband (horizontal) */}
      <ConveyorBelt
        position={[0, 0, 0]}
        length={10}
        active={phase.beltActive}
      />
      {/* Seitenband links (diagonal) */}
      <ConveyorBelt
        position={[-3, 0, -3]}
        length={5}
        rotation={[0, Math.PI / 4, 0]}
        active={phase.beltActive}
      />
      {/* Seitenband rechts (diagonal) */}
      <ConveyorBelt
        position={[3, 0, -3]}
        length={5}
        rotation={[0, -Math.PI / 4, 0]}
        active={phase.beltActive}
      />

      {/* === DATENWUERFEL auf Hauptband === */}
      <DataCubes
        conveyorPos={[0, 0, 0]}
        conveyorLength={10}
        active={phase.cubesActive}
        cubeCount={8}
      />

      {/* === ROBOTERARME === */}
      {/* Linker Arm (blau) -- Aufnahme vom Band */}
      <RobotArm
        position={[-3, 0, 1.5]}
        color="#4080ff"
        speed={1.0}
        phaseOffset={0}
        active={phase.robot1Active}
        task="pickup"
      />
      {/* Mittlerer Arm (cyan) -- Schweissen/Bearbeiten */}
      <RobotArm
        position={[0, 0, 1.5]}
        color="#40c0ff"
        speed={1.2}
        phaseOffset={1.5}
        active={phase.robot2Active}
        task="weld"
      />
      {/* Rechter Arm (violett) -- Platzieren/Sortieren */}
      <RobotArm
        position={[3, 0, 1.5]}
        color="#8040ff"
        speed={0.9}
        phaseOffset={3}
        active={phase.robot3Active}
        task="place"
      />


      {/* === FUNKEN an Arbeitspunkten === */}
      <SparkParticles
        position={[-3, 2.5, 1.5]}
        active={phase.sparksActive && phase.robot1Active}
        count={30}
      />
      <SparkParticles
        position={[0, 2.5, 1.5]}
        active={phase.sparksActive && phase.robot2Active}
        count={30}
      />
      <SparkParticles
        position={[3, 2.5, 1.5]}
        active={phase.sparksActive && phase.robot3Active}
        count={30}
      />

      {/* === STATUS-PANELS === */}
      <StatusPanel
        position={[-3, 4.2, 1.5]}
        label="STATION 01"
        value={phase.robot1Active ? 'AKTIV' : 'IDLE'}
        active={phase.panelsActive && phase.robot1Active}
      />
      <StatusPanel
        position={[0, 4.2, 1.5]}
        label="STATION 02"
        value={phase.robot2Active ? 'AKTIV' : 'IDLE'}
        active={phase.panelsActive && phase.robot2Active}
      />
      <StatusPanel
        position={[3, 4.2, 1.5]}
        label="STATION 03"
        value={phase.robot3Active ? 'AKTIV' : 'IDLE'}
        active={phase.panelsActive && phase.robot3Active}
      />

      {/* Haupt-Dashboard */}
      <StatusPanel
        position={[0, 6, -2]}
        label="DURCHSATZ"
        value={`${throughput} / s`}
        active={phase.panelsActive}
      />
      <StatusPanel
        position={[2.2, 6, -2]}
        label="EFFIZIENZ"
        value={efficiency}
        active={phase.panelsActive}
      />
      <StatusPanel
        position={[-2.2, 6, -2]}
        label="MODUS"
        value={phase.allComplete ? 'VOLLAUTOMATIK' : 'ANLAUF'}
        active={phase.panelsActive}
      />

      {/* ContactShadows: einmalig gerendert, danach kostenlos */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={25}
        blur={2}
        far={6}
        resolution={256}
        color="#000020"
        frames={1}
      />

      <Environment preset="city" environmentIntensity={0.4} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={1.0}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </>
  )
}

export function AutomationScene({ scrollProgress }: AutomationSceneProps) {
  return (
    <div
      role="img"
      aria-label="3D Roboter-Fabrik: Drei Roboterarme bearbeiten automatisch Datenpakete auf Foerderbaendern"
      style={{ width: '100%', height: '100%' }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 14, 18], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.3,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
