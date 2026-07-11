import * as THREE from 'three'
import { lotBounds, lots, worldBounds } from '../voxel/layout'

type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number }

type CircleCollider = { x: number; z: number; radius: number }

const padding = 0.55
const buildingColliders: Bounds[] = lots.map((lot) => {
  const bounds = lotBounds(lot)
  return {
    minX: bounds.minX - padding,
    maxX: bounds.maxX + padding,
    minZ: bounds.minZ - padding,
    maxZ: bounds.maxZ + padding,
  }
})

const propColliders: CircleCollider[] = [
  ...circleList([[-46, -20], [-16, -22], [18, -20], [48, -22]], 2.1),
  ...circleList([[-52, -24], [-40, -18], [-27, -25], [-8, -20], [7, -25], [24, -19], [39, -25], [54, -20]], 0.9),
  ...circleList([[-33, -15.7], [34, -15.4], [-51, -14.9], [51, -27]], 1.2),
  ...circleList([[-18, 6], [18, 6], [-20, 25], [18, 25], [-51, 26], [51, 26]], 1.05),
  ...circleList([[-56, -13], [-44, -13], [-28, -13], [-8, -13], [8, -13], [28, -13], [44, -13], [56, -13], [-57, 7], [-43, 7], [-20, 16], [20, 16], [43, 8], [56, 8], [-45, 36], [-28, 36], [24, 36], [44, 37]], 0.75),
  ...circleList([[-50, 17], [-42, 20], [-31, 7], [-14, 17], [-5, 7], [14, 17], [27, 7], [50, 17], [-54, 38], [-48, 40], [-35, 39], [-16, 37], [6, 38], [31, 39], [48, 40], [55, 35]], 1.05),
]

export function resolvePlayerCollision(previous: THREE.Vector3, desired: THREE.Vector3, radius = 0.42): THREE.Vector3 {
  const resolved = previous.clone()
  const xOnly = new THREE.Vector3(desired.x, desired.y, previous.z)
  if (!collides(xOnly.x, xOnly.z, radius)) resolved.x = xOnly.x

  const zOnly = new THREE.Vector3(resolved.x, desired.y, desired.z)
  if (!collides(zOnly.x, zOnly.z, radius)) resolved.z = zOnly.z

  resolved.x = THREE.MathUtils.clamp(resolved.x, worldBounds.minX + radius, worldBounds.maxX - radius)
  resolved.z = THREE.MathUtils.clamp(resolved.z, worldBounds.minZ + radius, worldBounds.maxZ - radius)
  return resolved
}

export function collides(x: number, z: number, radius: number): boolean {
  if (x < worldBounds.minX + radius || x > worldBounds.maxX - radius || z < worldBounds.minZ + radius || z > worldBounds.maxZ - radius) return true
  return buildingColliders.some((bounds) => circleHitsBounds(x, z, radius, bounds)) || propColliders.some((circle) => Math.hypot(x - circle.x, z - circle.z) < radius + circle.radius)
}

function circleHitsBounds(x: number, z: number, radius: number, bounds: Bounds): boolean {
  const nearestX = THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX)
  const nearestZ = THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ)
  return Math.hypot(x - nearestX, z - nearestZ) < radius
}

function circleList(points: readonly (readonly [number, number])[], radius: number): CircleCollider[] {
  return points.map(([x, z]) => ({ x, z, radius }))
}
