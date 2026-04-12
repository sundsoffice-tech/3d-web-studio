import { Grid, MeshReflectorMaterial } from '@react-three/drei'

export function FactoryFloor() {
  return (
    <group>
      {/* Reflektierender Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[400, 300]}
          mixBlur={1}
          mixStrength={0.4}
          resolution={512}
          mirror={0.35}
          color="#0a0a14"
        />
      </mesh>

      {/* Tech Grid */}
      <Grid
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.3}
        cellColor="#0f1520"
        sectionSize={4}
        sectionThickness={0.6}
        sectionColor="#1a2535"
        fadeDistance={35}
        fadeStrength={1.5}
        fadeFrom={1}
      />
    </group>
  )
}
