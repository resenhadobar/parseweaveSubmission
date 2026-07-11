import * as THREE from 'three'
import { addBlock, createBlockBatch } from './blocks'
import { createPalmTree } from './assets'
import { sceneryBounds, worldBounds } from './layout'
import type { PaletteKey } from './materials'

type Peak = { x: number; z: number; radius: number; height: number }
type TreeSpot = { x: number; z: number; palm?: boolean }

const mountainScale = 2
const peaks: Peak[] = [
  { x: -78, z: -38, radius: 24, height: 12 },
  { x: -82, z: -10, radius: 25, height: 15 },
  { x: -80, z: 24, radius: 27, height: 18 },
  { x: -65, z: 58, radius: 30, height: 22 },
  { x: -28, z: 68, radius: 31, height: 25 },
  { x: 8, z: 69, radius: 34, height: 24 },
  { x: 43, z: 66, radius: 30, height: 22 },
  { x: 76, z: 29, radius: 27, height: 18 },
  { x: 81, z: -8, radius: 25, height: 15 },
  { x: 78, z: -39, radius: 23, height: 12 },
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
  group.name = 'rio-inspired-rock-horseshoe-perimeter'

  createFlatBoardExtension(group)
  createOrganicMountains(group)
  treeSpots.forEach((spot) => addVoxelTree(group, spot))
  addPlayableRoadsidePosts(group)

  console.info('[VoxelBeach] Added 2x-height optimized Rio rock horseshoe mountains with instanced voxel batches')
  return group
}

export function sampleMountainHeight(x: number, z: number): number {
  return mountainHeight(x, z)
}

export function estimateMountainColumnCount(): number {
  let count = 0
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 3) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 3) {
      if (isMountainAllowed(x, z) && mountainHeight(x, z) > 0) count += 1
    }
  }
  return count
}

function createFlatBoardExtension(group: THREE.Group): void {
  const batch = createBlockBatch('outer-ground')
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 2) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 2) {
      if (x >= worldBounds.minX && x <= worldBounds.maxX && z >= worldBounds.minZ && z <= worldBounds.maxZ) continue
      const color: PaletteKey = z <= worldBounds.beachEndZ ? 'sand' : hash(x, z) > 0.9 ? 'leaf' : 'green'
      batch.add({ color, position: [x, -0.04, z], scale: [2, 0.14, 2] })
    }
  }
  batch.build(group)
}

function createOrganicMountains(group: THREE.Group): void {
  const batch = createBlockBatch('mountain-rock-horseshoe')
  for (let x = sceneryBounds.minX; x <= sceneryBounds.maxX; x += 3) {
    for (let z = sceneryBounds.minZ; z <= sceneryBounds.maxZ; z += 3) {
      if (!isMountainAllowed(x, z)) continue
      const height = mountainHeight(x, z)
      if (height <= 0) continue
      addOrganicColumn(batch.add, x, z, height)
    }
  }
  batch.build(group)
  console.info(`[VoxelBeach] Optimized mountains into instanced batches from ${batch.count()} voxel transforms`)
}

function isMountainAllowed(x: number, z: number): boolean {
  const outsidePlayable = x < worldBounds.minX || x > worldBounds.maxX || z > worldBounds.maxZ
  const beachWaterHorseshoe = z < worldBounds.beachEndZ && (x < worldBounds.minX + 11 || x > worldBounds.maxX - 11)
  return outsidePlayable || beachWaterHorseshoe
}

function mountainHeight(x: number, z: number): number {
  let height = 0
  for (const peak of peaks) {
    const dx = x - peak.x
    const dz = z - peak.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    const falloff = Math.max(0, 1 - distance / peak.radius)
    const ridgeNoise = 0.82 + hash(Math.round(x / 4), Math.round(z / 4)) * 0.38
    height = Math.max(height, Math.pow(falloff, 1.35) * peak.height * ridgeNoise)
  }
  const backRamp = Math.max(0, (z - worldBounds.maxZ + 12) / 20)
  const sideRamp = Math.max(0, Math.max(worldBounds.minX - x, x - worldBounds.maxX) / 13)
  const waterRamp = z < worldBounds.beachEndZ ? Math.max(0, (Math.abs(x) - 51) / 12) * 2.4 : 0
  height += Math.min(5.5, backRamp * 2.2 + sideRamp * 2.4 + waterRamp)
  return Math.floor(height * mountainScale)
}

function addOrganicColumn(add: (options?: Parameters<typeof addBlock>[1]) => void, x: number, z: number, height: number): void {
  const tiers = Math.max(1, Math.ceil(height / 2))
  for (let tier = 0; tier < tiers; tier += 1) {
    const level = tier * 2
    const greenPatch = hash(Math.floor(x / 4) + tier * 2, Math.floor(z / 4) - tier) > 0.8
    const lowSoil = level < height * 0.14 && hash(x + tier, z) > 0.45
    const color: PaletteKey = greenPatch ? (hash(x, z + tier) > 0.5 ? 'leaf' : 'green') : lowSoil ? 'earth' : 'rock'
    const width = 2.72 + hash(x + tier, z) * 0.55
    const depth = 2.72 + hash(x, z + tier) * 0.55
    add({
      color,
      position: [x + (hash(x, tier) - 0.5) * 0.55, 0.38 + tier * 0.88, z + (hash(z, tier) - 0.5) * 0.55],
      scale: [width, 0.9, depth],
    })
  }

  if (height > 14 && hash(x, z) > 0.94) {
    add({ color: 'trunk', position: [x, height * 0.44 + 0.45, z], scale: [0.28, 0.9, 0.28] })
    add({ color: 'leaf', position: [x, height * 0.44 + 1.1, z], scale: [1.25, 0.8, 1.25] })
  }
}

function addVoxelTree(group: THREE.Group, spot: TreeSpot): void {
  if (spot.palm) {
    const palm = createPalmTree()
    palm.position.set(spot.x, 0.08, spot.z)
    group.add(palm)
    return
  }

  const baseHeight = Math.max(0, mountainHeight(spot.x, spot.z) * 0.44)
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
