import type { PaletteKey } from './materials'

export type RoadDirection = 'horizontal' | 'vertical'
export type Road = { id: string; direction: RoadDirection; minX: number; maxX: number; minZ: number; maxZ: number }
export type Lot = { id: string; x: number; z: number; width: number; depth: number; kind: 'house' | 'shop' | 'large'; body: PaletteKey; roof: PaletteKey; rotation: number; stories: number }
export type Vehicle = { x: number; z: number; color: PaletteKey; rotation: number; roadId: string }
export type Person = { x: number; z: number; shirt: PaletteKey; rotation: number }

export const worldBounds = { minX: -60, maxX: 60, minZ: -30, maxZ: 50, beachEndZ: -14 }

export const roads: Road[] = [
  { id: 'ocean-avenue', direction: 'horizontal', minX: -60, maxX: 60, minZ: -11, maxZ: -5 },
  { id: 'seabreeze-street', direction: 'horizontal', minX: -60, maxX: 60, minZ: 9, maxZ: 14 },
  { id: 'harbor-street', direction: 'horizontal', minX: -60, maxX: 60, minZ: 28, maxZ: 33 },
  { id: 'west-boardwalk-road', direction: 'vertical', minX: -39, maxX: -33, minZ: -11, maxZ: 50 },
  { id: 'central-avenue', direction: 'vertical', minX: -3, maxX: 3, minZ: -11, maxZ: 50 },
  { id: 'east-palm-drive', direction: 'vertical', minX: 33, maxX: 39, minZ: -11, maxZ: 50 },
]

export const lots: Lot[] = [
  { id: 'surf-shop', x: -48, z: 0, width: 8, depth: 6, kind: 'shop', body: 'cream', roof: 'teal', rotation: 0, stories: 2 },
  { id: 'coral-house', x: -24, z: 0, width: 7, depth: 6, kind: 'house', body: 'coral', roof: 'navy', rotation: 0, stories: 2 },
  { id: 'blue-house', x: 14, z: 0, width: 7, depth: 6, kind: 'house', body: 'blue', roof: 'orange', rotation: 0, stories: 2 },
  { id: 'teal-house', x: 43, z: 0, width: 7, depth: 6, kind: 'house', body: 'teal', roof: 'red', rotation: 0, stories: 2 },

  { id: 'west-apartments', x: -51, z: 22, width: 14, depth: 8, kind: 'large', body: 'coral', roof: 'navy', rotation: 0, stories: 4 },
  { id: 'central-hotel', x: -17, z: 22, width: 15, depth: 8, kind: 'large', body: 'cream', roof: 'teal', rotation: 0, stories: 4 },
  { id: 'east-condos', x: 18, z: 22, width: 14, depth: 8, kind: 'large', body: 'blue', roof: 'red', rotation: 0, stories: 4 },
  { id: 'palm-court', x: 51, z: 22, width: 12, depth: 8, kind: 'large', body: 'teal', roof: 'orange', rotation: 0, stories: 3 },

  { id: 'back-left-blocker', x: -51, z: 45, width: 13, depth: 8, kind: 'large', body: 'yellow', roof: 'orange', rotation: Math.PI, stories: 4 },
  { id: 'back-mid-left-blocker', x: -24, z: 45, width: 13, depth: 8, kind: 'large', body: 'teal', roof: 'navy', rotation: Math.PI, stories: 5 },
  { id: 'back-mid-right-blocker', x: 14, z: 45, width: 13, depth: 8, kind: 'large', body: 'pink', roof: 'red', rotation: Math.PI, stories: 4 },
  { id: 'back-right-blocker', x: 49, z: 45, width: 13, depth: 8, kind: 'large', body: 'cream', roof: 'teal', rotation: Math.PI, stories: 5 },

  { id: 'left-edge-a', x: -56, z: 3, width: 7, depth: 7, kind: 'large', body: 'blue', roof: 'navy', rotation: Math.PI / 2, stories: 3 },
  { id: 'left-edge-b', x: -56, z: 22, width: 7, depth: 7, kind: 'large', body: 'coral', roof: 'orange', rotation: Math.PI / 2, stories: 4 },
  { id: 'left-edge-c', x: -56, z: 42, width: 7, depth: 7, kind: 'large', body: 'cream', roof: 'red', rotation: Math.PI / 2, stories: 4 },
  { id: 'right-edge-a', x: 56, z: 3, width: 7, depth: 7, kind: 'large', body: 'yellow', roof: 'red', rotation: -Math.PI / 2, stories: 3 },
  { id: 'right-edge-b', x: 56, z: 22, width: 7, depth: 7, kind: 'large', body: 'teal', roof: 'navy', rotation: -Math.PI / 2, stories: 4 },
  { id: 'right-edge-c', x: 56, z: 42, width: 7, depth: 7, kind: 'large', body: 'coral', roof: 'orange', rotation: -Math.PI / 2, stories: 4 },
]

export const vehicles: Vehicle[] = [
  { x: -52, z: -9.5, color: 'teal', rotation: 0, roadId: 'ocean-avenue' },
  { x: -25, z: -6.5, color: 'yellow', rotation: Math.PI, roadId: 'ocean-avenue' },
  { x: 7, z: -9.5, color: 'blue', rotation: 0, roadId: 'ocean-avenue' },
  { x: 33, z: -6.5, color: 'red', rotation: Math.PI, roadId: 'ocean-avenue' },
  { x: 52, z: -9.5, color: 'orange', rotation: 0, roadId: 'ocean-avenue' },

  { x: -48, z: 10.2, color: 'blue', rotation: 0, roadId: 'seabreeze-street' },
  { x: -18, z: 12.8, color: 'red', rotation: Math.PI, roadId: 'seabreeze-street' },
  { x: 17, z: 10.2, color: 'yellow', rotation: 0, roadId: 'seabreeze-street' },
  { x: 48, z: 12.8, color: 'teal', rotation: Math.PI, roadId: 'seabreeze-street' },

  { x: -35.5, z: 22, color: 'teal', rotation: -Math.PI / 2, roadId: 'west-boardwalk-road' },
  { x: 0.5, z: 19, color: 'blue', rotation: -Math.PI / 2, roadId: 'central-avenue' },
  { x: 35.5, z: 39, color: 'red', rotation: Math.PI / 2, roadId: 'east-palm-drive' },
]

export const people: Person[] = [
  { x: -51, z: -23, shirt: 'teal', rotation: 0.2 },
  { x: -19, z: -25, shirt: 'pink', rotation: 0.7 },
  { x: 31, z: -24, shirt: 'blue', rotation: 0.1 },
  { x: -53, z: -2, shirt: 'coral', rotation: Math.PI },
  { x: -7, z: 2, shirt: 'green', rotation: Math.PI },
  { x: 43, z: 2, shirt: 'pink', rotation: Math.PI },
  { x: -25, z: 17, shirt: 'teal', rotation: 0 },
  { x: 7, z: 17, shirt: 'yellow', rotation: 1.4 },
  { x: 39, z: 21, shirt: 'blue', rotation: -0.5 },
]

export function containsPoint(road: Road, x: number, z: number): boolean {
  return x >= road.minX && x <= road.maxX && z >= road.minZ && z <= road.maxZ
}

export function isRoad(x: number, z: number): boolean {
  return roads.some((road) => containsPoint(road, x, z))
}

export function isSidewalk(x: number, z: number): boolean {
  return !isRoad(x, z) && roads.some((road) => x >= road.minX - 2 && x <= road.maxX + 2 && z >= road.minZ - 2 && z <= road.maxZ + 2)
}

export function lotBounds(lot: Lot): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const width = Math.abs(Math.sin(lot.rotation)) > 0.5 ? lot.depth : lot.width
  const depth = Math.abs(Math.sin(lot.rotation)) > 0.5 ? lot.width : lot.depth
  return { minX: lot.x - width / 2, maxX: lot.x + width / 2, minZ: lot.z - depth / 2, maxZ: lot.z + depth / 2 }
}
