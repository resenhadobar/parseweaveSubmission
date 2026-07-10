import * as THREE from 'three'
import { addBlock } from './blocks'
import { createPalmTree } from './assets'
import { sceneryBounds, worldBounds } from './layout'
import type { PaletteKey } from './materials'

type Mesa = { x: number; z: number; width: number; depth: number; levels: number }
type TreeSpot = { x: number; z: number; palm?: boolean }

const mesas: Mesa[] = [
  { x: -72, z: -34, width: 15, depth: 10, levels: 4 },
  { x: -76, z: 22, width: 14, depth: 13, levels: 5 },
  { x: -70, z: 56, width: 18, depth: 14, levels: 5 },
  { x: -47, z: 64, width: 19, depth: 15, levels: 6 },
  { x: -17, z: 65, width: 22, depth: 16, levels: 6 },
  { x: 15, z: 65, width: 21, depth: 15, levels: 6 },
  { x: 45, z: 64, width: 19, depth: 15, levels: 5 },
  { x: 72, z: 56, width: 17, depth: 13, levels: 5 },
  { x: 76, z: 24, width: 14, depth: 12, levels: 4 },
]

const treeSpots: TreeSpot[] = [
  { x: -77, z: -20, palm: true },
  { x: -67, z: -13, palm: true },
  { x: -70, z: 6 },
  { x: -79, z: 39 },
  { x: -58, z: 52 },
  { x: -32, z: 56 },
  { x: -2, z: 56 },
  { x: 28, z: 55 },
  { x: 58, z: 52 },
  { x: 78, z: 39 },
  { x: 70, z: 6 },
  { x: 76, z: -18, palm: true },
]

export function createPerimeterScenery(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'reference-style-unplayable-perimeter'

  createFlatBoardExtension(group)
  mesas.forEach((mesa) => addTerracedMesa(group, mesa))
  treeSpots.forEach((spot) => addVoxelTree(group, spot))
  addPlayableRoadsidePosts(group)

  console.info('[VoxelBeach] Added reference-style perimeter: flat board, terraced brown/white voxel mesas, and edge trees')
  return group
}

function createFlatBoardExtension(group: THREE.Group): void {
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 2) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 2) {
      if (x >= worldBounds.minX && x <= worldBounds.maxX && z >= worldBounds.minZ && z <= worldBounds.maxZ) continue
      const color: PaletteKey = z <= worldBounds.beachEndZ ? 'sand' : (x + z) % 10 === 0 ? 'leaf' : 'green'
      addBlock(group, { color, position: [x, -0.04, z], scale: [2, 0.14, 2] })
    }
  }
}

function addTerracedMesa(group: THREE.Group, mesa: Mesa): void {
  for (let level = 0; level < mesa.levels; level += 1) {
    const inset = level * 1.35
    const width = Math.max(2.5, mesa.width - inset * 2)
    const depth = Math.max(2.5, mesa.depth - inset * 2)
    const y = 0.18 + level * 0.42
    addBlock(group, {
      color: level === mesa.levels - 1 ? 'snow' : 'earth',
      position: [mesa.x, y, mesa.z],
      scale: [width, 0.42, depth],
    })
    if (level < mesa.levels - 1) {
      addBlock(group, {
        color: 'wood',
        position: [mesa.x, y + 0.07, mesa.z - depth * 0.45],
        scale: [width * 0.92, 0.12, 0.16],
      })
    }
  }
}

function addVoxelTree(group: THREE.Group, spot: TreeSpot): void {
  if (spot.palm) {
    const palm = createPalmTree()
    palm.position.set(spot.x, 0.08, spot.z)
    group.add(palm)
    return
  }

  addBlock(group, { color: 'trunk', position: [spot.x, 0.65, spot.z], scale: [0.35, 1.25, 0.35] })
  addBlock(group, { color: 'leaf', position: [spot.x, 1.55, spot.z], scale: [1.45, 0.9, 1.45] })
  addBlock(group, { color: 'palm', position: [spot.x, 2.15, spot.z], scale: [1.05, 0.75, 1.05] })
}

function addPlayableRoadsidePosts(group: THREE.Group): void {
  for (let x = worldBounds.minX + 2; x <= worldBounds.maxX - 2; x += 8) {
    addBlock(group, { color: 'wood', position: [x, 0.5, worldBounds.maxZ + 0.8], scale: [0.18, 0.9, 0.18] })
  }
  for (const x of [worldBounds.minX - 0.8, worldBounds.maxX + 0.8]) {
    for (let z = worldBounds.minZ + 2; z <= worldBounds.maxZ - 2; z += 8) {
      addBlock(group, { color: 'wood', position: [x, 0.5, z], scale: [0.18, 0.9, 0.18] })
    }
  }
}
