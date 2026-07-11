import * as THREE from 'three'
import { addBlock } from './blocks'
import type { PaletteKey } from './materials'

export function addStreetLight(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'black', position: [x, 0.74, z], scale: [0.15, 1.3, 0.15] })
  addBlock(world, { color: 'yellow', position: [x, 1.48, z], scale: [0.34, 0.34, 0.34] })
}

export function addBench(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'wood', position: [x, 0.36, z], scale: [2.1, 0.26, 0.35] })
  addBlock(world, { color: 'wood', position: [x - 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
  addBlock(world, { color: 'wood', position: [x + 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
}

export function addFoodCart(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'coral', position: [x, 0.65, z], scale: [1.7, 0.9, 1] })
  addBlock(world, { color: 'white', position: [x, 1.32, z], scale: [1.95, 0.18, 1.15] })
  addBlock(world, { color: 'yellow', position: [x - 0.55, 1.55, z], scale: [0.3, 0.35, 0.12] })
  addBlock(world, {
    color: 'black',
    position: [x - 0.65, 0.22, z - 0.55],
    scale: [0.25, 0.25, 0.1],
  })
  addBlock(world, {
    color: 'black',
    position: [x + 0.65, 0.22, z - 0.55],
    scale: [0.25, 0.25, 0.1],
  })
}

export function addBeachShower(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'metal', position: [x, 1.05, z], scale: [0.14, 2, 0.14] })
  addBlock(world, { color: 'metal', position: [x + 0.34, 1.95, z], scale: [0.65, 0.12, 0.12] })
  addBlock(world, { color: 'glass', position: [x + 0.72, 1.78, z], scale: [0.18, 0.22, 0.18] })
}

export function addSurfRack(world: THREE.Group, x: number, z: number): void {
  for (let i = 0; i < 4; i += 1)
    addBlock(world, {
      color: ['teal', 'yellow', 'coral', 'blue'][i] as PaletteKey,
      position: [x + i * 0.36, 0.9, z],
      scale: [0.18, 1.6, 0.12],
    })
  addBlock(world, { color: 'wood', position: [x + 0.55, 0.3, z], scale: [1.9, 0.18, 0.2] })
}

export function addTinyBoat(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'white', position: [x, 0.26, z], scale: [3.3, 0.32, 1.1] })
  addBlock(world, { color: 'blue', position: [x, 0.55, z], scale: [2.2, 0.22, 0.65] })
  addBlock(world, { color: 'wood', position: [x - 0.35, 1, z], scale: [0.12, 1.3, 0.12] })
  addBlock(world, { color: 'white', position: [x + 0.15, 1.2, z], scale: [0.9, 1.1, 0.08] })
}

export function addBicycle(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'black', position: [x - 0.55, 0.32, z], scale: [0.45, 0.45, 0.12] })
  addBlock(world, { color: 'black', position: [x + 0.55, 0.32, z], scale: [0.45, 0.45, 0.12] })
  addBlock(world, { color: 'teal', position: [x, 0.55, z], scale: [0.95, 0.12, 0.12] })
  addBlock(world, { color: 'metal', position: [x + 0.35, 0.82, z], scale: [0.12, 0.52, 0.12] })
}
