import * as THREE from 'three'
import { addBlock } from './blocks'
import { createPalmTree } from './assets'
import { sceneryBounds, worldBounds } from './layout'
import type { PaletteKey } from './materials'

type Peak = { x: number; z: number; radius: number; height: number }
type TreeSpot = { x: number; z: number; palm?: boolean }

const peaks: Peak[] = [
  { x: -78, z: 35, radius: 18, height: 7 },
  { x: -62, z: 61, radius: 24, height: 11 },
  { x: -28, z: 66, radius: 25, height: 13 },
  { x: 8, z: 67, radius: 27, height: 12 },
  { x: 42, z: 64, radius: 23, height: 11 },
  { x: 72, z: 42, radius: 19, height: 8 },
]

const treeSpots: TreeSpot[] = [
  { x: -77, z: -20, palm: true },
  { x: -67, z: -13, palm: true },
  { x: -74, z: 11 },
  { x: -79, z: 38 },
  { x: -58, z: 52 },
  { x: -34, z: 57 },
  { x: -9, z: 58 },
  { x: 20, z: 57 },
  { x: 47, z: 55 },
  { x: 70, z: 42 },
  { x: 75, z: 12 },
  { x: 76, z: -18, palm: true },
]

export function createPerimeterScenery(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'rio-inspired-organic-perimeter'

  createFlatBoardExtension(group)
  createOrganicMountains(group)
  treeSpots.forEach((spot) => addVoxelTree(group, spot))
  addPlayableRoadsidePosts(group)

  console.info('[VoxelBeach] Added Rio-inspired organic green/rock mountain perimeter and edge trees')
  return group
}

function createFlatBoardExtension(group: THREE.Group): void {
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 2) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 2) {
      if (x >= worldBounds.minX && x <= worldBounds.maxX && z >= worldBounds.minZ && z <= worldBounds.maxZ) continue
      const color: PaletteKey = z <= worldBounds.beachEndZ ? 'sand' : (hash(x, z) > 0.84 ? 'leaf' : 'green')
      addBlock(group, { color, position: [x, -0.04, z], scale: [2, 0.14, 2] })
    }
  }
}

function createOrganicMountains(group: THREE.Group): void {
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 2) {
    for (let z = -2; z <= sceneryBounds.maxZ; z += 2) {
      if (x >= worldBounds.minX && x <= worldBounds.maxX && z <= worldBounds.maxZ) continue
      const height = mountainHeight(x, z)
      if (height <= 0) continue
      addOrganicColumn(group, x, z, height)
    }
  }
}

function mountainHeight(x: number, z: number): number {
  let height = 0
  for (const peak of peaks) {
    const dx = x - peak.x
    const dz = z - peak.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    const falloff = Math.max(0, 1 - distance / peak.radius)
    const ridgeNoise = 0.74 + hash(Math.round(x / 4), Math.round(z / 4)) * 0.42
    height = Math.max(height, Math.pow(falloff, 1.7) * peak.height * ridgeNoise)
  }
  const backRamp = Math.max(0, (z - worldBounds.maxZ + 10) / 24)
  const sideRamp = Math.max(0, Math.max(worldBounds.minX - x, x - worldBounds.maxX) / 18)
  height += Math.min(2.5, backRamp * 1.4 + sideRamp * 1.1)
  return Math.floor(height)
}

function addOrganicColumn(group: THREE.Group, x: number, z: number, height: number): void {
  for (let level = 0; level < height; level += 1) {
    const top = level >= height - 1
    const exposedRock = hash(x + level * 3, z - level * 5) > 0.7 && level > height * 0.25
    const color: PaletteKey = top ? (hash(x, z) > 0.4 ? 'leaf' : 'green') : exposedRock ? 'rock' : level < height * 0.3 ? 'earth' : 'green'
    const width = 1.85 + hash(x + level, z) * 0.35
    const depth = 1.85 + hash(x, z + level) * 0.35
    addBlock(group, {
      color,
      position: [x + (hash(x, level) - 0.5) * 0.35, 0.16 + level * 0.42, z + (hash(z, level) - 0.5) * 0.35],
      scale: [width, 0.44, depth],
    })
  }

  if (height > 4 && hash(x, z) > 0.88) {
    addBlock(group, { color: 'trunk', position: [x, height * 0.42 + 0.45, z], scale: [0.28, 0.9, 0.28] })
    addBlock(group, { color: 'leaf', position: [x, height * 0.42 + 1.1, z], scale: [1.25, 0.8, 1.25] })
  }
}

function addVoxelTree(group: THREE.Group, spot: TreeSpot): void {
  if (spot.palm) {
    const palm = createPalmTree()
    palm.position.set(spot.x, 0.08, spot.z)
    group.add(palm)
    return
  }

  const baseHeight = Math.max(0, mountainHeight(spot.x, spot.z) * 0.42)
  addBlock(group, { color: 'trunk', position: [spot.x, baseHeight + 0.65, spot.z], scale: [0.35, 1.25, 0.35] })
  addBlock(group, { color: 'leaf', position: [spot.x, baseHeight + 1.55, spot.z], scale: [1.45, 0.9, 1.45] })
  addBlock(group, { color: 'palm', position: [spot.x, baseHeight + 2.15, spot.z], scale: [1.05, 0.75, 1.05] })
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

function hash(x: number, z: number): number {
  const value = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return value - Math.floor(value)
}
