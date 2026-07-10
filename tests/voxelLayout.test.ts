import { describe, expect, it } from 'vitest'
import { containsPoint, isRoad, isSidewalk, lotBounds, lots, roads, sceneryBounds, vehicles, worldBounds } from '../src/voxel/layout'
import { sampleMountainHeight } from '../src/voxel/scenery'

function boxesOverlap(a: ReturnType<typeof lotBounds>, b: { minX: number; maxX: number; minZ: number; maxZ: number }): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ
}

describe('voxel neighborhood layout', () => {
  it('keeps every lot clear of roads and inside the playable area', () => {
    for (const lot of lots) {
      const bounds = lotBounds(lot)
      expect(bounds.minX, `${lot.id} minX`).toBeGreaterThanOrEqual(worldBounds.minX)
      expect(bounds.maxX, `${lot.id} maxX`).toBeLessThanOrEqual(worldBounds.maxX)
      expect(bounds.minZ, `${lot.id} minZ`).toBeGreaterThanOrEqual(worldBounds.minZ)
      expect(bounds.maxZ, `${lot.id} maxZ`).toBeLessThanOrEqual(worldBounds.maxZ)

      for (const road of roads) {
        expect(boxesOverlap(bounds, road), `${lot.id} overlaps ${road.id}`).toBe(false)
      }
    }
  })

  it('keeps lots from overlapping each other', () => {
    for (let i = 0; i < lots.length; i += 1) {
      for (let j = i + 1; j < lots.length; j += 1) {
        expect(boxesOverlap(lotBounds(lots[i]), lotBounds(lots[j])), `${lots[i].id} overlaps ${lots[j].id}`).toBe(false)
      }
    }
  })

  it('keeps sidewalks adjacent to roads but never inside road lanes', () => {
    for (let x = worldBounds.minX; x <= worldBounds.maxX; x += 1) {
      for (let z = worldBounds.minZ; z <= worldBounds.maxZ; z += 1) {
        expect(isRoad(x, z) && isSidewalk(x, z), `sidewalk bleeds into road at ${x},${z}`).toBe(false)
      }
    }
  })

  it('keeps all vehicles on their assigned road and facing lane direction', () => {
    for (const vehicle of vehicles) {
      const road = roads.find((candidate) => candidate.id === vehicle.roadId)
      expect(road, `${vehicle.roadId} exists`).toBeDefined()
      expect(containsPoint(road!, vehicle.x, vehicle.z), `vehicle ${vehicle.color} is off ${vehicle.roadId}`).toBe(true)

      if (road!.direction === 'horizontal') {
        const centerZ = (road!.minZ + road!.maxZ) / 2
        const expected = vehicle.z < centerZ ? 0 : Math.PI
        expect(vehicle.rotation, `horizontal car wrong way at ${vehicle.x},${vehicle.z}`).toBe(expected)
      } else {
        const centerX = (road!.minX + road!.maxX) / 2
        const expected = vehicle.x < centerX ? Math.PI / 2 : -Math.PI / 2
        expect(vehicle.rotation, `vertical car wrong way at ${vehicle.x},${vehicle.z}`).toBe(expected)
      }
    }
  })

  it('uses coherent car, person, and building scale ratios', () => {
    const carLength = 2.6
    const personHeight = 1.58
    const floorHeight = 2.3
    for (const lot of lots) {
      expect(lot.width / carLength, `${lot.id} too narrow for cars`).toBeGreaterThanOrEqual(2.6)
      expect(lot.depth / carLength, `${lot.id} too shallow for cars`).toBeGreaterThanOrEqual(2.2)
      expect(floorHeight, `${lot.id} story cannot fit a person`).toBeGreaterThan(personHeight * 1.35)
      expect(lot.stories * floorHeight, `${lot.id} height too close to person height`).toBeGreaterThan(personHeight * 2.5)
    }
  })

  it('keeps scenery outside but surrounding the playable block', () => {
    expect(sceneryBounds.minX).toBeLessThan(worldBounds.minX)
    expect(sceneryBounds.maxX).toBeGreaterThan(worldBounds.maxX)
    expect(sceneryBounds.minZ).toBeLessThan(worldBounds.minZ)
    expect(sceneryBounds.maxZ).toBeGreaterThan(worldBounds.maxZ)
  })

  it('includes a high-rise skyline behind the neighborhood', () => {
    const highRises = lots.filter((lot) => lot.kind === 'large' && lot.stories >= 8 && lot.z > 35)
    expect(highRises.length).toBeGreaterThanOrEqual(3)
  })

  it('forms a taller horseshoe mountain range into beach and water edges', () => {
    expect(sampleMountainHeight(0, sceneryBounds.maxZ - 4)).toBeGreaterThanOrEqual(14)
    expect(sampleMountainHeight(worldBounds.minX - 4, worldBounds.beachEndZ - 12)).toBeGreaterThanOrEqual(4)
    expect(sampleMountainHeight(worldBounds.maxX + 4, worldBounds.beachEndZ - 12)).toBeGreaterThanOrEqual(4)
  })
})
