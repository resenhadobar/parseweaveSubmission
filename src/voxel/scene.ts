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

export function createBeachBlockScene(): THREE.Group {
  const world = new THREE.Group()
  world.name = 'voxel-beach-block'

  addGrid(world, 'sand', -18, -18, 36, 14, -0.08)
  addGrid(world, 'sidewalk', -18, -4, 36, 2, 0)
  addGrid(world, 'road', -18, -2, 36, 6, 0)
  addGrid(world, 'sidewalk', -18, 4, 36, 2, 0)
  addGrid(world, 'green', -18, 6, 36, 8, -0.04)

  createBeachDetails(world)
  createOceanAvenue(world)
  createBuildings(world)
  createPeople(world)
  world.add(createOcean())

  console.info('[VoxelBeach] Created beach block scene with ocean, avenue, buildings, props, people, and trees')
  return world
}

function createBeachDetails(world: THREE.Group): void {
  for (let x = -16; x <= 16; x += 4) {
    addBlock(world, { color: 'sandDark', position: [x, 0.05, -17], scale: [2.2, 0.2, 0.8] })
    addBlock(world, { color: 'white', position: [x + 1.2, 0.12, -11.2], scale: [0.45, 0.12, 0.25] })
  }

  const lifeguard = createLifeguardTower()
  lifeguard.position.set(-12, 0, -10.5)
  world.add(lifeguard)

  const beachProps: Array<[THREE.Group, number, number, number]> = [
    [createBeachUmbrella(), -5, 0, -13],
    [createBeachUmbrella(), 3, 0, -10.5],
    [createBeachUmbrella(), 11, 0, -13.5],
  ]
  beachProps.forEach(([asset, x, y, z]) => {
    asset.position.set(x, y, z)
    world.add(asset)
  })

  for (const [x, z, color] of [
    [-8, -8.8, 'pink'],
    [-1, -12.2, 'teal'],
    [7, -9.6, 'yellow'],
    [14, -11.4, 'coral'],
  ] as const) {
    addBlock(world, { color, position: [x, 0.08, z], scale: [2.2, 0.08, 1.15] })
    addBlock(world, { color: 'white', position: [x - 0.55, 0.15, z + 0.22], scale: [0.5, 0.09, 0.28] })
  }

  addBlock(world, { color: 'wood', position: [9, 0.95, -7.2], scale: [0.16, 1.8, 0.16] })
  addBlock(world, { color: 'wood', position: [13, 0.95, -7.2], scale: [0.16, 1.8, 0.16] })
  addBlock(world, { color: 'white', position: [11, 1.85, -7.2], scale: [4.2, 0.12, 0.12] })
  for (let i = 0; i < 4; i += 1) addBlock(world, { color: 'white', position: [9.8 + i * 0.75, 1.05, -7.2], scale: [0.08, 1.45, 0.08] })
}

function createOceanAvenue(world: THREE.Group): void {
  for (let x = -17; x <= 17; x += 4) {
    addBlock(world, { color: 'yellow', position: [x, 0.14, 1], scale: [1.7, 0.05, 0.14] })
  }
  for (const x of [-15, 0, 15]) {
    for (let z = -1.7; z <= 3.2; z += 0.7) {
      addBlock(world, { color: 'white', position: [x, 0.16, z], scale: [2.2, 0.05, 0.25] })
    }
  }
  for (let x = -16; x <= 16; x += 4) {
    addBlock(world, { color: 'black', position: [x, 0.7, -4.7], scale: [0.16, 1.2, 0.16] })
    addBlock(world, { color: 'yellow', position: [x, 1.38, -4.7], scale: [0.38, 0.38, 0.38] })
    addBlock(world, { color: 'black', position: [x, 0.6, 5.6], scale: [0.14, 1.1, 0.14] })
    addBlock(world, { color: 'yellow', position: [x, 1.22, 5.6], scale: [0.32, 0.32, 0.32] })
  }
  const cars: Array<[number, number, string]> = [
    [-10, -0.7, 'red'],
    [-2, 2.8, 'blue'],
    [8, -0.8, 'yellow'],
    [14, 2.8, 'teal'],
  ]
  cars.forEach(([x, z, color]) => {
    const car = createCar(color as Parameters<typeof createCar>[0])
    car.position.set(x, 0.22, z)
    if (z > 0) car.rotation.y = Math.PI
    world.add(car)
  })
}

function createBuildings(world: THREE.Group): void {
  const buildings: Array<[THREE.Group, number, number, number, number]> = [
    [createBeachHouse({ body: 'coral', roof: 'navy', stories: 2 }), -13, 0, 9, 0],
    [createSurfShop(), -5, 0, 9, 0],
    [createBeachHouse({ body: 'teal', roof: 'orange', stories: 2 }), 4, 0, 9, 0],
    [createBeachHouse({ body: 'cream', roof: 'red', stories: 3 }), 13, 0, 9.2, 0],
  ]
  buildings.forEach(([building, x, y, z, rot]) => {
    building.position.set(x, y, z)
    building.rotation.y = rot
    world.add(building)
  })

  for (const x of [-17, -9, -1, 7, 16]) {
    const palm = createPalmTree()
    palm.position.set(x, 0, 5.8)
    world.add(palm)
  }
  for (const x of [-15.5, -11.5, -3.5, 1.5, 9.5, 14.5]) {
    addBlock(world, { color: 'wood', position: [x, 0.35, 5.2], scale: [1.45, 0.25, 0.28] })
    addBlock(world, { color: 'wood', position: [x - 0.55, 0.15, 5.2], scale: [0.16, 0.3, 0.16] })
    addBlock(world, { color: 'wood', position: [x + 0.55, 0.15, 5.2], scale: [0.16, 0.3, 0.16] })
  }
}

function createPeople(world: THREE.Group): void {
  const people: Array<[number, number, string, number]> = [
    [-7, -12, 'teal', 0.2],
    [0, -9.8, 'yellow', -0.6],
    [6, -12.5, 'pink', 0.7],
    [-14, 5.1, 'coral', Math.PI],
    [-1, 5.2, 'blue', Math.PI],
    [11, 5.2, 'green', Math.PI],
    [15, -4.2, 'orange', 0],
  ]
  people.forEach(([x, z, shirt, rot]) => {
    const person = createVoxelPerson(shirt as Parameters<typeof createVoxelPerson>[0])
    person.position.set(x, 0.08, z)
    person.rotation.y = rot
    world.add(person)
  })
}
