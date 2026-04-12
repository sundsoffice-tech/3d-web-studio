import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { ChillingDude } from './ChillingDude'
import { Suspense } from 'react'

/**
 * Debug-Ansicht: Isolierter ChillingDude mit OrbitControls,
 * Grid und AxesHelper zum Debuggen der Positionierung.
 * Temporaer in App.tsx einbinden zum Testen.
 */
export function DebugDude() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas camera={{ position: [1.5, 1.2, 1.5], fov: 50 }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 3]} intensity={1} />
          <pointLight position={[-2, 3, 1]} intensity={0.5} color="#ff8040" />

          {/* Boden-Referenz */}
          <Grid
            infiniteGrid
            cellSize={0.25}
            sectionSize={1}
            cellColor="#333"
            sectionColor="#555"
            fadeDistance={10}
          />

          {/* Achsen: Rot=X, Gruen=Y, Blau=Z */}
          <axesHelper args={[2]} />

          {/* Der Dude -- Position 0,0,0 zum Debuggen */}
          <ChillingDude position={[0, 0, 0]} rotation={[0, 0, 0]} active={true} />

          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
