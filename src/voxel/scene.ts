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

type CarColor = Parameters<typeof createCar>[0]
type PersonColor = Parameters<typeof createVoxelPerson>[0]

const WORLD_MIN_X = -30
const WORLD_MAX_X = 30
const BEACH_Z = -18
const INLAND_Z = 24

export function createBeachBlockScene(): THREE.Group {
  const world = new THREE.Group()
  world.name = 'voxel-beach-block'

  createGround(world)
  createBorders(world)
  createBeachDetails(world)
  createOceanAvenue(world)
  createInteriorStreets(world)
  createBuildings(world)
  createPeople(world)
  world.add(createOcean())

  console.info('[VoxelBeach] Rebuilt larger contained neighborhood with grounded tiles, avenue, inner streets, borders, and ocean')
  return world
}

function createGround(world: THREE.Group): void {
  addGrid(world, 'sand', WORLD_MIN_X, BEACH_Z, 61, 10, -0.01)
  addGrid(world, 'sidewalk', WORLD_MIN_X, -8, 61, 2, 0)
  addGrid(world, 'road', WORLD_MIN_X, -6, 61, 6, 0)
  addGrid(world, 'sidewalk', WORLD_MIN_X, 0, 61, 2, 0)
  addGrid(world, 'green', WORLD_MIN_X, 2, 61, 23, -0.01)

  for (let x = WORLD_MIN_X; x <= WORLD_MAX_X; x += 1) {
    addBlock(world, { color: x % 2 === 0 ? 'sand' : 'sandDark', position: [x, 0.02, BEACH_Z - 1], scale: [1, 0.16, 1] })
  }
}

function createBorders(world: THREE.Group): void {
  for (let x = WORLD_MIN_X; x <= WORLD_MAX_X; x += 1) {
    addBlock(world, { color: 'wood', position: [x, 0.42, INLAND_Z + 1], scale: [0.92, 0.58, 0.32] })
    addBlock(world, { color: 'wood', position: [x, 0.42, BEACH_Z - 1.8], scale: [0.92, 0.58, 0.32] })
  }
  for (let z = BEACH_Z - 1; z <= INLAND_Z; z += 1) {
    addBlock(world, { color: 'wood', position: [WORLD_MIN_X - 1, 0.42, z], scale: [0.32, 0.58, 0.92] })
    addBlock(world, { color: 'wood', position: [WORLD_MAX_X + 1, 0.42, z], scale: [0.32, 0.58, 0.92] })
  }
  for (let x = WORLD_MIN_X + 2; x <= WORLD_MAX_X - 2; x += 4) {
    addBlock(world, { color: 'white', position: [x, 0.95, INLAND_Z + 1], scale: [0.18, 1.2, 0.18] })
  }
}

function createBeachDetails(world: THREE.Group): void {
  for (let x = -28; x <= 28; x += 4) {
    addBlock(world, { color: 'sandDark', position: [x, 0.12, -17], scale: [2.8, 0.24, 0.9] })
    addBlock(world, { color: 'white', position: [x + 1.1, 0.22, -15], scale: [0.42, 0.14, 0.28] })
  }

  const lifeguards: Array<[number, number]> = [
    [-22, -12.8],
    [23, -12.3],
  ]
  lifeguards.forEach(([x, z]) => {
    const tower = createLifeguardTower()
    tower.position.set(x, 0.08, z)
    world.add(tower)
  })

  for (const [x, z] of [[-15, -13], [-7, -15], [3, -12.5], [12, -15], [20, -13.5]] as const) {
    const umbrella = createBeachUmbrella()
    umbrella.position.set(x, 0.08, z)
    world.add(umbrella)
  }

  for (const [x, z, color] of [
    [-24, -15, 'pink'], [-18, -11, 'teal'], [-10, -14, 'yellow'], [-1, -16, 'coral'], [8, -13, 'pink'], [16, -11, 'teal'], [26, -15, 'yellow'],
  ] as const) {
    addBlock(world, { color, position: [x, 0.1, z], scale: [2.4, 0.12, 1.25] })
    addBlock(world, { color: 'white', position: [x - 0.65, 0.22, z + 0.22], scale: [0.55, 0.1, 0.3] })
  }

  addBlock(world, { color: 'wood', position: [8, 1.0, -10.2], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'wood', position: [14, 1.0, -10.2], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'white', position: [11, 1.95, -10.2], scale: [6.2, 0.12, 0.12] })
  for (let i = 0; i < 6; i += 1) addBlock(world, { color: 'white', position: [8.8 + i * 0.85, 1.1, -10.2], scale: [0.08, 1.45, 0.08] })
}

function createOceanAvenue(world: THREE.Group): void {
  for (let x = WORLD_MIN_X + 2; x <= WORLD_MAX_X - 2; x += 4) addBlock(world, { color: 'yellow', position: [x, 0.15, -3], scale: [1.8, 0.06, 0.14] })
  for (const x of [-24, -10, 6, 22]) {
    for (let z = -5.6; z <= -0.4; z += 0.7) addBlock(world, { color: 'white', position: [x, 0.18, z], scale: [2.2, 0.05, 0.25] })
  }
  for (let x = WORLD_MIN_X + 2; x <= WORLD_MAX_X - 2; x += 4) {
    addBlock(world, { color: 'black', position: [x, 0.74, -8.6], scale: [0.16, 1.3, 0.16] })
    addBlock(world, { color: 'yellow', position: [x, 1.48, -8.6], scale: [0.38, 0.38, 0.38] })
    addBlock(world, { color: 'black', position: [x, 0.7, 1.9], scale: [0.14, 1.2, 0.14] })
    addBlock(world, { color: 'yellow', position: [x, 1.38, 1.9], scale: [0.32, 0.32, 0.32] })
  }
  addCars(world, [[-24, -4.8, 'teal'], [-15, -1.2, 'yellow'], [-4, -4.8, 'blue'], [8, -1.2, 'red'], [19, -4.8, 'orange'], [27, -1.2, 'teal']])
}

function createInteriorStreets(world: THREE.Group): void {
  addGrid(world, 'road', -26, 9, 52, 4, 0.01)
  addGrid(world, 'sidewalk', -26, 7, 52, 2, 0.02)
  addGrid(world, 'sidewalk', -26, 13, 52, 2, 0.02)
  for (const x of [-18, 0, 18]) {
    addGrid(world, 'road', x - 2, 2, 4, 23, 0.015)
    addGrid(world, 'sidewalk', x - 4, 2, 2, 23, 0.025)
    addGrid(world, 'sidewalk', x + 2, 2, 2, 23, 0.025)
  }
  for (let x = -24; x <= 24; x += 5) addBlock(world, { color: 'yellow', position: [x, 0.18, 11], scale: [2.1, 0.05, 0.12] })
  for (const x of [-18, 0, 18]) {
    for (let z = 4; z <= 22; z += 5) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [0.12, 0.05, 2.1] })
  }
  addCars(world, [[-20, 10.3, 'blue'], [-7, 11.7, 'red'], [13, 10.3, 'yellow'], [19.2, 18, 'teal']])
}

function createBuildings(world: THREE.Group): void {
  const buildings: Array<[THREE.Group, number, number, number]> = [
    [createBeachHouse({ body: 'coral', roof: 'navy', stories: 2 }), -25, 4.5, 0],
    [createSurfShop(), -15, 4.5, 0],
    [createBeachHouse({ body: 'teal', roof: 'orange', stories: 2 }), -6, 4.5, 0],
    [createBeachHouse({ body: 'cream', roof: 'red', stories: 3 }), 4, 4.5, 0],
    [createBeachHouse({ body: 'blue', roof: 'navy', stories: 2 }), 15, 4.5, 0],
    [createBeachHouse({ body: 'yellow', roof: 'coral', stories: 2 }), 25, 4.5, 0],
    [createBeachHouse({ body: 'cream', roof: 'teal', stories: 2 }), -25, 18.5, Math.PI],
    [createBeachHouse({ body: 'pink', roof: 'red', stories: 2 }), -9, 18.5, Math.PI],
    [createBeachHouse({ body: 'teal', roof: 'navy', stories: 3 }), 8, 18.5, Math.PI],
    [createBeachHouse({ body: 'coral', roof: 'orange', stories: 2 }), 25, 18.5, Math.PI],
  ]
  buildings.forEach(([building, x, z, rot]) => {
    building.position.set(x, 0.08, z)
    building.rotation.y = rot
    world.add(building)
  })

  for (const [x, z] of [[-28, 1.5], [-20, 1.5], [-10, 1.5], [0, 1.5], [10, 1.5], [20, 1.5], [28, 1.5], [-27, 15], [-15, 15], [1, 15], [16, 15], [28, 15]] as const) {
    const palm = createPalmTree()
    palm.position.set(x, 0.06, z)
    world.add(palm)
  }
}

function createPeople(world: THREE.Group): void {
  const people: Array<[number, number, PersonColor, number]> = [
    [-23, -14, 'teal', 0.2], [-12, -12, 'yellow', -0.6], [4, -14.5, 'pink', 0.7], [18, -12, 'coral', 0.3],
    [-27, 2, 'coral', Math.PI], [-14, 2, 'blue', Math.PI], [-1, 2, 'green', Math.PI], [13, 2, 'orange', Math.PI], [27, 2, 'pink', Math.PI],
    [-19, 8, 'teal', 0], [1, 13, 'yellow', 1.4], [20, 17, 'blue', -0.5],
  ]
  people.forEach(([x, z, shirt, rot]) => {
    const person = createVoxelPerson(shirt)
    person.position.set(x, 0.08, z)
    person.rotation.y = rot
    world.add(person)
  })
}

function addCars(world: THREE.Group, cars: Array<[number, number, CarColor]>): void {
  cars.forEach(([x, z, color]) => {
    const car = createCar(color)
    car.position.set(x, 0.24, z)
    if (z > -3) car.rotation.y = Math.PI
    world.add(car)
  })
}
