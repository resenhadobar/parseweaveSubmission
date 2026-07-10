import * as THREE from 'three'
import { addBlock } from './blocks'
import { createPalmTree } from './assets'
import { sceneryBounds, worldBounds } from './layout'
import type { PaletteKey } from './materials'

type Mountain = { x: number; z: number; radius: number; height: number }
type TreeSpot = { x: number; z: number; kind: 'pine' | 'palm' }

const mountains: Mountain[] = [
  { x: -73, z: 60, radius: 9, height: 9 },
  { x: -56, z: 66, radius: 12, height: 12 },
  { x: -34, z: 64, radius: 10, height: 10 },
  { x: -8, z: 67, radius: 13, height: 13 },
  { x: 18, z: 65, radius: 11, height: 11 },
  { x: 43, z: 66, radius: 13, height: 12 },
  { x: 68, z: 60, radius: 10, height: 10 },
  { x: -76, z: 18, radius: 8, height: 8 },
  { x: 76, z: 22, radius: 8, height: 8 },
]

const trees: TreeSpot[] = [
  { x: -78, z: -18, kind: 'palm' },
  { x: -72, z: -4, kind: 'palm' },
  { x: -73, z: 12, kind: 'pine' },
  { x: -79, z: 31, kind: 'pine' },
  { x: -67, z: 49, kind: 'pine' },
  { x: -49, z: 58, kind: 'pine' },
  { x: -24, z: 59, kind: 'pine' },
  { x: 0, z: 60, kind: 'pine' },
  { x: 23, z: 58, kind: 'pine' },
  { x: 48, z: 59, kind: 'pine' },
  { x: 69, z: 47, kind: 'pine' },
  { x: 79, z: 30, kind: 'pine' },
  { x: 72, z: 9, kind: 'pine' },
  { x: 78, z: -10, kind: 'palm' },
]

export function createPerimeterScenery(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'unplayable-voxel-perimeter'

  createOuterGround(group)
  mountains.forEach((mountain) => addMountain(group, mountain))
  trees.forEach((spot) => addTree(group, spot))
  addPlayableBorder(group)

  console.info('[VoxelBeach] Added unplayable perimeter scenery with voxel mountains and tree line')
  return group
}

function createOuterGround(group: THREE.Group): void {
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 2) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 2) {
      if (x >= worldBounds.minX && x <= worldBounds.maxX && z >= worldBounds.minZ && z <= worldBounds.maxZ) continue
      const color: PaletteKey = z < worldBounds.beachEndZ ? 'sandDark' : (x * 7 + z) % 9 === 0 ? 'leaf' : 'green'
      addBlock(group, { color, position: [x, -0.04, z], scale: [2, 0.14, 2] })
    }
  }
}

function addMountain(group: THREE.Group, mountain: Mountain): void {
  for (let level = 0; level < mountain.height; level += 1) {
    const width = Math.max(1, mountain.radius - level * 0.75)
    const color: PaletteKey = level > mountain.height - 2 ? 'snow' : level > mountain.height * 0.6 ? 'rock' : 'earth'
    addBlock(group, {
      color,
      position: [mountain.x, 0.18 + level * 0.5, mountain.z],
      scale: [width * 2, 0.5, width * 2],
    })
    if (level % 2 === 0) {
      addBlock(group, {
        color: level > mountain.height * 0.65 ? 'rock' : 'green',
        position: [mountain.x + width * 0.35, 0.22 + level * 0.5, mountain.z - width * 0.25],
        scale: [width * 0.9, 0.42, width * 0.75],
      })
    }
  }
}

function addTree(group: THREE.Group, spot: TreeSpot): void {
  if (spot.kind === 'palm') {
    const palm = createPalmTree()
    palm.position.set(spot.x, 0.08, spot.z)
    group.add(palm)
    return
  }

  addBlock(group, { color: 'trunk', position: [spot.x, 0.55, spot.z], scale: [0.42, 1.1, 0.42] })
  addBlock(group, { color: 'leaf', position: [spot.x, 1.45, spot.z], scale: [2.2, 1.1, 2.2] })
  addBlock(group, { color: 'palm', position: [spot.x, 2.15, spot.z], scale: [1.55, 1, 1.55] })
  addBlock(group, { color: 'leaf', position: [spot.x, 2.8, spot.z], scale: [0.9, 0.8, 0.9] })
}

function addPlayableBorder(group: THREE.Group): void {
  for (let x = worldBounds.minX; x <= worldBounds.maxX; x += 4) {
    addBlock(group, { color: 'wood', position: [x, 0.28, worldBounds.maxZ + 1], scale: [2.1, 0.36, 0.34] })
  }
  for (const x of [worldBounds.minX - 1, worldBounds.maxX + 1]) {
    for (let z = worldBounds.minZ; z <= worldBounds.maxZ; z += 4) {
      addBlock(group, { color: 'wood', position: [x, 0.28, z], scale: [0.34, 0.36, 2.1] })
    }
  }
}
