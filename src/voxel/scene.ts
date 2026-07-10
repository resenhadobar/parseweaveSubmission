import * as THREE from 'three'
import { addBlock, addGrid } from './blocks'
import {
  createBeachHouse,
  createBeachUmbrella,
  createCar,
  createLifeguardTower,
  createPalmTree,
  createSurfShop,
  createVoxelPerson,
} from './assets'
import { createOcean } from './ocean'
import type { PaletteKey } from './materials'

type CarColor = Parameters<typeof createCar>[0]
type PersonColor = Parameters<typeof createVoxelPerson>[0]
type Road = { minX: number; maxX: number; minZ: number; maxZ: number }

const WORLD_MIN_X = -60
const WORLD_MAX_X = 60
const WORLD_MIN_Z = -30
const WORLD_MAX_Z = 50
const BEACH_END_Z = -14

const roads: Road[] = [
  { minX: WORLD_MIN_X, maxX: WORLD_MAX_X, minZ: -11, maxZ: -5 },
  { minX: WORLD_MIN_X, maxX: WORLD_MAX_X, minZ: 9, maxZ: 14 },
  { minX: WORLD_MIN_X, maxX: WORLD_MAX_X, minZ: 28, maxZ: 33 },
  { minX: -39, maxX: -33, minZ: -11, maxZ: WORLD_MAX_Z },
  { minX: -3, maxX: 3, minZ: -11, maxZ: WORLD_MAX_Z },
  { minX: 33, maxX: 39, minZ: -11, maxZ: WORLD_MAX_Z },
]

export function createBeachBlockScene(): THREE.Group {
  const world = new THREE.Group()
  world.name = 'voxel-beach-block'

  createGround(world)
  createBeachDetails(world)
  createRoadDetails(world)
  createNeighborhoodBuildings(world)
  createEdgeBuildings(world)
  createLandscape(world)
  createPeople(world)
  world.add(createOcean())

  console.info('[VoxelBeach] Built larger connected beach neighborhood with building-bounded edges and no artificial rails')
  return world
}

function createGround(world: THREE.Group): void {
  for (let x = WORLD_MIN_X; x <= WORLD_MAX_X; x += 1) {
    for (let z = WORLD_MIN_Z; z <= WORLD_MAX_Z; z += 1) {
      const color = getGroundColor(x, z)
      addBlock(world, { color, position: [x, 0, z], scale: [1, 0.18, 1] })
    }
  }
  addGrid(world, 'wood', WORLD_MIN_X, -15, WORLD_MAX_X - WORLD_MIN_X + 1, 2, 0.04)
}

function getGroundColor(x: number, z: number): PaletteKey {
  if (isRoad(x, z)) return 'road'
  if (isSidewalk(x, z)) return 'sidewalk'
  if (z <= BEACH_END_Z) return (x + z) % 5 === 0 ? 'sandDark' : 'sand'
  return (x * 3 + z) % 11 === 0 ? 'leaf' : 'green'
}

function isRoad(x: number, z: number): boolean {
  return roads.some((road) => x >= road.minX && x <= road.maxX && z >= road.minZ && z <= road.maxZ)
}

function isSidewalk(x: number, z: number): boolean {
  return roads.some((road) => x >= road.minX - 2 && x <= road.maxX + 2 && z >= road.minZ - 2 && z <= road.maxZ + 2)
}

function createBeachDetails(world: THREE.Group): void {
  for (let x = -56; x <= 56; x += 7) {
    addBlock(world, { color: 'sandDark', position: [x, 0.14, -27], scale: [3.6, 0.22, 1.2] })
    addBlock(world, { color: 'white', position: [x + 1.25, 0.26, -23], scale: [0.45, 0.14, 0.28] })
  }

  for (const [x, z] of [[-46, -20], [-16, -22], [18, -20], [48, -22]] as const) {
    const tower = createLifeguardTower()
    tower.position.set(x, 0.1, z)
    world.add(tower)
  }

  for (const [x, z] of [[-52, -24], [-40, -18], [-27, -25], [-8, -20], [7, -25], [24, -19], [39, -25], [54, -20]] as const) {
    const umbrella = createBeachUmbrella()
    umbrella.position.set(x, 0.1, z)
    world.add(umbrella)
  }

  const towelColors: PaletteKey[] = ['pink', 'teal', 'yellow', 'coral', 'blue']
  for (let i = 0; i < 18; i += 1) {
    const x = -55 + i * 6.4
    const z = -25 + (i % 4) * 3
    addBlock(world, { color: towelColors[i % towelColors.length], position: [x, 0.12, z], scale: [2.4, 0.1, 1.25] })
    addBlock(world, { color: 'white', position: [x - 0.65, 0.22, z + 0.22], scale: [0.55, 0.1, 0.3] })
  }

  addBlock(world, { color: 'wood', position: [17, 1.0, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'wood', position: [25, 1.0, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'white', position: [21, 1.95, -20], scale: [8.2, 0.12, 0.12] })
  for (let i = 0; i < 8; i += 1) addBlock(world, { color: 'white', position: [18 + i * 0.9, 1.08, -20], scale: [0.08, 1.45, 0.08] })
}

function createRoadDetails(world: THREE.Group): void {
  for (const z of [-8, 11.5, 30.5]) {
    for (let x = WORLD_MIN_X + 3; x <= WORLD_MAX_X - 3; x += 5) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [2.2, 0.05, 0.13] })
  }
  for (const x of [-36, 0, 36]) {
    for (let z = -7; z <= WORLD_MAX_Z - 3; z += 5) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [0.13, 0.05, 2.2] })
  }
  for (const x of [-50, -36, -18, 0, 18, 36, 50]) {
    addCrosswalk(world, x, -8, 'horizontal')
    addCrosswalk(world, x, 11.5, 'horizontal')
    addCrosswalk(world, x, 30.5, 'horizontal')
  }
  for (let x = WORLD_MIN_X + 4; x <= WORLD_MAX_X - 4; x += 8) {
    addStreetLight(world, x, -13.2)
    addStreetLight(world, x, -2.8)
  }
  for (let z = 4; z <= 44; z += 8) {
    addStreetLight(world, -31, z)
    addStreetLight(world, 5, z)
    addStreetLight(world, 41, z)
  }
  addCars(world, [
    [-52, -9.5, 'teal'], [-41, -6.5, 'orange'], [-28, -9.5, 'yellow'], [-12, -6.5, 'red'], [7, -9.5, 'blue'], [24, -6.5, 'yellow'], [46, -9.5, 'teal'],
    [-48, 10.2, 'blue'], [-22, 12.8, 'red'], [14, 10.2, 'yellow'], [44, 12.8, 'orange'],
    [-35.5, 22, 'teal'], [0.5, 19, 'blue'], [35.5, 39, 'red'],
  ])
}

function createNeighborhoodBuildings(world: THREE.Group): void {
  const rows: Array<[number, number, number]> = [
    [-50, 3, 0], [-38, 3, 0], [-24, 3, 0], [-12, 3, 0], [12, 3, 0], [24, 3, 0], [38, 3, 0], [51, 3, 0],
    [-50, 19, Math.PI], [-22, 20, Math.PI], [14, 20, Math.PI], [48, 20, Math.PI],
    [-51, 40, Math.PI], [-25, 41, Math.PI], [11, 41, Math.PI], [48, 40, Math.PI],
  ]
  rows.forEach(([x, z, rot], index) => {
    const building = index === 2 ? createSurfShop() : createBeachHouse({ body: pickBody(index), roof: pickRoof(index), stories: index % 5 === 0 ? 3 : 2 })
    building.position.set(x, 0.08, z)
    building.rotation.y = rot
    world.add(building)
  })

  addLargeBuilding(world, [-8, 20, 0], [12, 5.4, 6], 'cream', 'teal')
  addLargeBuilding(world, [30, 21, 0], [13, 6.2, 7], 'coral', 'navy')
  addLargeBuilding(world, [-47, 41, 0], [12, 5.8, 7], 'blue', 'orange')
  addLargeBuilding(world, [28, 42, 0], [14, 6.4, 8], 'teal', 'red')
}

function createEdgeBuildings(world: THREE.Group): void {
  for (let x = -54; x <= 54; x += 13) addLargeBuilding(world, [x, 49, Math.PI], [10, 6 + ((x + 54) % 3), 7], pickBody(x), pickRoof(x))
  for (let z = 0; z <= 44; z += 12) {
    addLargeBuilding(world, [-59, z, Math.PI / 2], [9, 5.5 + (z % 2), 7], pickBody(z + 2), pickRoof(z + 5))
    addLargeBuilding(world, [59, z, -Math.PI / 2], [9, 5.5 + (z % 2), 7], pickBody(z + 7), pickRoof(z + 3))
  }
}

function createLandscape(world: THREE.Group): void {
  for (const [x, z] of [[-56, -13], [-44, -13], [-28, -13], [-8, -13], [8, -13], [28, -13], [44, -13], [56, -13], [-45, 16], [-10, 16], [22, 16], [54, 16], [-43, 36], [-8, 36], [24, 36], [55, 36]] as const) {
    const palm = createPalmTree()
    palm.position.set(x, 0.08, z)
    world.add(palm)
  }
  for (const [x, z] of [[-18, 6], [18, 6], [-20, 25], [18, 25], [-51, 26], [51, 26]] as const) {
    addBlock(world, { color: 'wood', position: [x, 0.36, z], scale: [2.1, 0.26, 0.35] })
    addBlock(world, { color: 'wood', position: [x - 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
    addBlock(world, { color: 'wood', position: [x + 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
  }
}

function createPeople(world: THREE.Group): void {
  const people: Array<[number, number, PersonColor, number]> = [
    [-51, -23, 'teal', 0.2], [-37, -20, 'yellow', -0.6], [-19, -25, 'pink', 0.7], [5, -22, 'coral', 0.3], [31, -24, 'blue', 0.1], [49, -21, 'green', -0.4],
    [-53, -2, 'coral', Math.PI], [-31, 2, 'blue', Math.PI], [-7, 2, 'green', Math.PI], [17, 2, 'orange', Math.PI], [43, 2, 'pink', Math.PI],
    [-25, 17, 'teal', 0], [7, 17, 'yellow', 1.4], [39, 21, 'blue', -0.5], [-40, 37, 'pink', 0.6], [20, 37, 'green', -0.8],
  ]
  people.forEach(([x, z, shirt, rot]) => {
    const person = createVoxelPerson(shirt)
    person.position.set(x, 0.1, z)
    person.rotation.y = rot
    world.add(person)
  })
}

function addLargeBuilding(world: THREE.Group, transform: [number, number, number], size: [number, number, number], body: PaletteKey, roof: PaletteKey): void {
  const [x, z, rot] = transform
  const [w, h, d] = size
  const group = new THREE.Group()
  addBlock(group, { color: body, position: [0, h / 2, 0], scale: [w, h, d] })
  addBlock(group, { color: roof, position: [0, h + 0.33, 0], scale: [w + 0.8, 0.66, d + 0.8] })
  addBlock(group, { color: 'darkGlass', position: [0, 1.7, -d / 2 - 0.04], scale: [1.1, 1.6, 0.08] })
  for (let floor = 0; floor < Math.floor(h / 1.5); floor += 1) {
    for (let col = 0; col < Math.floor(w / 2.4); col += 1) {
      addBlock(group, { color: 'glass', position: [-w / 2 + 1.3 + col * 2.2, 2.8 + floor * 1.25, -d / 2 - 0.05], scale: [0.72, 0.54, 0.08] })
    }
  }
  group.position.set(x, 0.08, z)
  group.rotation.y = rot
  world.add(group)
}

function addCrosswalk(world: THREE.Group, x: number, z: number, direction: 'horizontal' | 'vertical'): void {
  for (let i = -3; i <= 3; i += 1) {
    addBlock(world, { color: 'white', position: direction === 'horizontal' ? [x, 0.2, z + i * 0.7] : [x + i * 0.7, 0.2, z], scale: direction === 'horizontal' ? [2.5, 0.05, 0.25] : [0.25, 0.05, 2.5] })
  }
}

function addStreetLight(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'black', position: [x, 0.74, z], scale: [0.15, 1.3, 0.15] })
  addBlock(world, { color: 'yellow', position: [x, 1.48, z], scale: [0.34, 0.34, 0.34] })
}

function addCars(world: THREE.Group, cars: Array<[number, number, CarColor]>): void {
  cars.forEach(([x, z, color]) => {
    const car = createCar(color)
    car.position.set(x, 0.24, z)
    if (z > -8 || x > 0) car.rotation.y = Math.PI
    world.add(car)
  })
}

function pickBody(seed: number): PaletteKey {
  const colors: PaletteKey[] = ['coral', 'teal', 'cream', 'blue', 'yellow', 'pink']
  return colors[Math.abs(seed) % colors.length]
}

function pickRoof(seed: number): PaletteKey {
  const colors: PaletteKey[] = ['navy', 'orange', 'red', 'teal']
  return colors[Math.abs(seed) % colors.length]
}
