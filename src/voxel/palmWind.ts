import * as THREE from 'three'

const swayingPalms: THREE.Group[] = []

export function registerPalmForWind(palm: THREE.Group): void {
  swayingPalms.push(palm)
}

export function updatePalmWind(elapsedSeconds: number): void {
  swayingPalms.forEach((palm, index) => {
    const phase = elapsedSeconds * 1.25 + index * 0.73
    palm.rotation.z = Math.sin(phase) * 0.025
    palm.rotation.x = Math.cos(phase * 0.8) * 0.014
  })
}
