import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

interface FactoryCameraRigProps {
  progress: number
}

export function FactoryCameraRig({ progress }: FactoryCameraRigProps) {
  const currentPos = useMemo(() => new THREE.Vector3(0, 8, 16), [])
  const currentTarget = useMemo(() => new THREE.Vector3(0, 1.5, 0), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetLookAt = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    let cx: number, cy: number, cz: number
    let lx = 0, ly = 1.5, lz = 0

    if (progress < 0.08) {
      // Totale: Fabrik von oben, alles im Blick
      const t = progress / 0.08
      cx = THREE.MathUtils.lerp(2, 2, t)
      cy = THREE.MathUtils.lerp(12, 9, t)
      cz = THREE.MathUtils.lerp(16, 13, t)
    } else if (progress < 0.25) {
      // Naeher zum linken Roboter (pickup)
      const t = (progress - 0.08) / 0.17
      cx = THREE.MathUtils.lerp(2, -3, t)
      cy = THREE.MathUtils.lerp(9, 4, t)
      cz = THREE.MathUtils.lerp(13, 6, t)
      lx = THREE.MathUtils.lerp(0, -3, t)
      ly = THREE.MathUtils.lerp(1.5, 1.8, t)
    } else if (progress < 0.45) {
      // Entlang Foerderband gleiten: links → mitte → rechts
      const t = (progress - 0.25) / 0.2
      cx = THREE.MathUtils.lerp(-3, 4, t)
      cy = THREE.MathUtils.lerp(4, 3.5, t)
      cz = THREE.MathUtils.lerp(6, 5.5, t)
      lx = THREE.MathUtils.lerp(-3, 3, t)
      ly = 1.5
    } else if (progress < 0.6) {
      // Nah am mittleren Roboter (Schweissen + Funken)
      const t = (progress - 0.45) / 0.15
      cx = THREE.MathUtils.lerp(4, 2, t)
      cy = THREE.MathUtils.lerp(3.5, 3, t)
      cz = THREE.MathUtils.lerp(5.5, 4.5, t)
      lx = THREE.MathUtils.lerp(3, 0, t)
      ly = THREE.MathUtils.lerp(1.5, 2.2, t)
    } else if (progress < 0.78) {
      // Schwenk zum Dude auf dem Liegestuhl
      const t = (progress - 0.6) / 0.18
      cx = THREE.MathUtils.lerp(2, 9.5, t)
      cy = THREE.MathUtils.lerp(3, 2, t)
      cz = THREE.MathUtils.lerp(4.5, 6.5, t)
      lx = THREE.MathUtils.lerp(0, 7.5, t)
      ly = THREE.MathUtils.lerp(2.2, 0.7, t)
      lz = THREE.MathUtils.lerp(0, 3, t)
    } else {
      // Finale Totale -- alles im Bild, Roboter + Dude
      const t = (progress - 0.78) / 0.22
      cx = THREE.MathUtils.lerp(9.5, 10, t)
      cy = THREE.MathUtils.lerp(2, 7, t)
      cz = THREE.MathUtils.lerp(6.5, 12, t)
      lx = THREE.MathUtils.lerp(7.5, 2, t)
      ly = THREE.MathUtils.lerp(0.7, 1.2, t)
      lz = THREE.MathUtils.lerp(3, 1, t)
    }

    targetPos.set(cx, cy, cz)
    targetLookAt.set(lx, ly, lz)

    currentPos.lerp(targetPos, 0.06)
    currentTarget.lerp(targetLookAt, 0.06)

    state.camera.position.copy(currentPos)
    state.camera.lookAt(currentTarget)
  })

  return null
}
