import * as THREE from 'three'
import { addBlock, addGrid } from './blocks'
import { createBeachHouse, createBeachUmbrella, createCar, createLifeguardTower, createPalmTree, createVoxelPerson } from './assets'
import { createOcean } from './ocean'
import { createPerimeterScenery } from './scenery'
import { isRoad, isSidewalk, lots, people, roads, vehicles, worldBounds, type Lot } from './layout'
import type { PaletteKey } from './materials'

export function createBeachBlockScene(): THREE.Group {
  const world = new THREE.Group()
  world.name = 'voxel-beach-block'

  createGround(world)
  createBeachDetails(world)
  createRoadDetails(world)
  createBuildings(world)
  createLandscape(world)
  createPeople(world)
  world.add(createPerimeterScenery())
  world.add(createOcean())

  console.info('[VoxelBeach] Rendered optimized beach-front voxel city board with 2x-height rock horseshoe mountains')
  return world
}

function createGround(world: THREE.Group): void {
  for (let x = worldBounds.minX; x <= worldBounds.maxX; x += 1) {
    for (let z = worldBounds.minZ; z <= worldBounds.maxZ; z += 1) {
      addBlock(world, { color: getGroundColor(x, z), position: [x, 0, z], scale: [1, 0.18, 1] })
    }
  }
  addGrid(world, 'wood', worldBounds.minX, worldBounds.beachEndZ - 1, worldBounds.maxX - worldBounds.minX + 1, 1, 0.04)
  addGrid(world, 'sidewalk', worldBounds.minX, worldBounds.beachEndZ, worldBounds.maxX - worldBounds.minX + 1, 1, 0.05)
}

function getGroundColor(x: number, z: number): PaletteKey {
  if (isRoad(x, z)) return 'road'
  if (isSidewalk(x, z)) return 'sidewalk'
  if (z <= worldBounds.beachEndZ) return (x + z) % 5 === 0 ? 'sandDark' : 'sand'
  return (x * 3 + z) % 11 === 0 ? 'leaf' : 'green'
}

function createBeachDetails(world: THREE.Group): void {
  for (let x = -58; x <= 58; x += 4) {
    addBlock(world, { color: (x / 4) % 2 === 0 ? 'sand' : 'sandDark', position: [x, 0.12, -28], scale: [2.2, 0.08, 1.6] })
  }

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

  addBlock(world, { color: 'wood', position: [17, 1, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'wood', position: [25, 1, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'white', position: [21, 1.95, -20], scale: [8.2, 0.12, 0.12] })
  for (let i = 0; i < 8; i += 1) addBlock(world, { color: 'white', position: [18 + i * 0.9, 1.08, -20], scale: [0.08, 1.45, 0.08] })
}

function createRoadDetails(world: THREE.Group): void {
  for (const road of roads) {
    if (road.direction === 'horizontal') {
      const z = (road.minZ + road.maxZ) / 2
      for (let x = road.minX + 4; x <= road.maxX - 4; x += 6) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [2.3, 0.05, 0.13] })
      for (let x = road.minX + 8; x <= road.maxX - 8; x += 12) addStreetLight(world, x, road.minZ - 2.2)
    } else {
      const x = (road.minX + road.maxX) / 2
      for (let z = road.minZ + 4; z <= road.maxZ - 4; z += 6) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [0.13, 0.05, 2.3] })
      for (let z = road.minZ + 8; z <= road.maxZ - 8; z += 12) addStreetLight(world, road.maxX + 2.2, z)
    }
  }

  for (const horizontal of roads.filter((road) => road.direction === 'horizontal')) {
    for (const vertical of roads.filter((road) => road.direction === 'vertical')) {
      addCrosswalk(world, (vertical.minX + vertical.maxX) / 2, (horizontal.minZ + horizontal.maxZ) / 2, 'horizontal')
      addCrosswalk(world, (vertical.minX + vertical.maxX) / 2, (horizontal.minZ + horizontal.maxZ) / 2, 'vertical')
    }
  }

  vehicles.forEach((vehicle) => {
    const car = createCar(vehicle.color)
    car.position.set(vehicle.x, 0.24, vehicle.z)
    car.rotation.y = vehicle.rotation
    world.add(car)
  })
}

function createBuildings(world: THREE.Group): void {
  lots.forEach((lot) => {
    const building = lot.kind === 'large' ? createLargeBuilding(lot) : createSmallBuilding(lot)
    building.position.set(lot.x, 0.08, lot.z)
    building.rotation.y = lot.rotation
    world.add(building)
  })
}

function createSmallBuilding(lot: Lot): THREE.Group {
  return createBeachHouse({ id: lot.id, body: lot.body, roof: lot.roof, stories: lot.stories, shop: lot.kind === 'shop' })
}

function createLargeBuilding(lot: Lot): THREE.Group {
  const group = new THREE.Group()
  const isSkyscraper = lot.stories >= 8
  const floorHeight = isSkyscraper ? 2 : 2.3
  const height = lot.stories * floorHeight
  addBlock(group, { color: lot.body, position: [0, height / 2, 0], scale: [lot.width, height, lot.depth] })
  addBlock(group, { color: lot.roof, position: [0, height + 0.25, 0], scale: [lot.width + 0.8, isSkyscraper ? 0.34 : 0.66, lot.depth + 0.8] })
  addStreetFacingDoor(group, lot)
  for (let floor = 0; floor < lot.stories; floor += 1) {
    addBuildingWindows(group, lot, floor, floorHeight, isSkyscraper)
  }
  if (isSkyscraper) addBlock(group, { color: 'metal', position: [0, height + 1.05, 0], scale: [0.28, 1.6, 0.28] })
  return group
}

function addStreetFacingDoor(group: THREE.Group, lot: Lot): void {
  const frontZ = lot.rotation === Math.PI ? lot.depth / 2 + 0.04 : -lot.depth / 2 - 0.04
  addBlock(group, { color: 'darkGlass', position: [0, 1.18, frontZ], scale: [0.9, 1.72, 0.08] })
  addBlock(group, { color: 'metal', position: [0, 0.26, frontZ + (frontZ > 0 ? 0.03 : -0.03)], scale: [1.25, 0.16, 0.18] })
}

function addBuildingWindows(group: THREE.Group, lot: Lot, floor: number, floorHeight: number, isSkyscraper: boolean): void {
  const y = 1.55 + floor * floorHeight
  const cols = Math.floor(lot.width / 2.4)
  for (let col = 0; col < cols; col += 1) {
    const x = -lot.width / 2 + 1.3 + col * 2.2
    addBlock(group, { color: 'glass', position: [x, y, -lot.depth / 2 - 0.05], scale: [0.72, 0.58, 0.08] })
    addBlock(group, { color: 'glass', position: [x, y, lot.depth / 2 + 0.05], scale: [0.72, 0.58, 0.08] })
  }
  const sideRows = Math.max(2, Math.floor(lot.depth / 2.2))
  for (let row = 0; row < sideRows; row += 1) {
    const z = -lot.depth / 2 + 1.2 + row * 2
    addBlock(group, { color: isSkyscraper ? 'darkGlass' : 'glass', position: [lot.width / 2 + 0.05, y, z], scale: [0.08, 0.5, 0.62] })
    addBlock(group, { color: isSkyscraper ? 'darkGlass' : 'glass', position: [-lot.width / 2 - 0.05, y, z], scale: [0.08, 0.5, 0.62] })
  }
}

function createLandscape(world: THREE.Group): void {
  for (const [x, z] of [[-56, -13], [-44, -13], [-28, -13], [-8, -13], [8, -13], [28, -13], [44, -13], [56, -13], [-20, 16], [20, 16], [-45, 36], [24, 36]] as const) {
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
  people.forEach((data) => {
    const person = createVoxelPerson(data.shirt)
    person.position.set(data.x, 0.1, data.z)
    person.rotation.y = data.rotation
    world.add(person)
  })
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
