import * as THREE from 'three'
import { addBlock, addGrid, createBlockBatch } from './blocks'
import { createBeachHouse, createBeachUmbrella, createLifeguardTower, createPalmTree, createTropicalTree } from './assets'
import { createOcean } from './ocean'
import { createPerimeterScenery } from './scenery'
import { isRoad, isSidewalk, lots, roads, worldBounds, type Lot } from './layout'
import type { PaletteKey } from './materials'
import { registerPalmForWind } from './palmWind'

export function createBeachBlockScene(): THREE.Group {
  const world = new THREE.Group()
  world.name = 'voxel-beach-block'

  createGround(world)
  createBeachDetails(world)
  createRoadDetails(world)
  createBuildings(world)
  createLandscape(world)
  world.add(createPerimeterScenery())
  world.add(createOcean())

  console.info('[VoxelBeach] Applied Malibu roofs, fuller lawn planting, and animated traffic-ready scene props')
  return world
}

function createGround(world: THREE.Group): void {
  const ground = createBlockBatch('playable-ground')
  for (let x = worldBounds.minX; x <= worldBounds.maxX; x += 1) {
    for (let z = worldBounds.minZ; z <= worldBounds.maxZ; z += 1) {
      ground.add({ color: getGroundColor(x, z), position: [x, 0, z], scale: [1, 0.18, 1] })
    }
  }
  ground.build(world)
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
  for (let x = -58; x <= 58; x += 4) addBlock(world, { color: (x / 4) % 2 === 0 ? 'sand' : 'sandDark', position: [x, 0.12, -28], scale: [2.2, 0.08, 1.6] })

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

  addBeachTowels(world)
  addBeachActivityProps(world)
  addVolleyballNet(world)
}

function addBeachTowels(world: THREE.Group): void {
  const towelColors: PaletteKey[] = ['pink', 'teal', 'yellow', 'coral', 'blue']
  for (let i = 0; i < 18; i += 1) {
    const x = -55 + i * 6.4
    const z = -25 + (i % 4) * 3
    addBlock(world, { color: towelColors[i % towelColors.length], position: [x, 0.12, z], scale: [2.4, 0.1, 1.25] })
    addBlock(world, { color: 'white', position: [x - 0.65, 0.22, z + 0.22], scale: [0.55, 0.1, 0.3] })
  }
}

function addBeachActivityProps(world: THREE.Group): void {
  addFoodCart(world, -33, -15.7)
  addBeachShower(world, 34, -15.4)
  addSurfRack(world, -51, -14.9)
  addTinyBoat(world, 51, -27)
  for (const [x, z] of [[-6, -17], [6, -17], [42, -16]] as const) addBicycle(world, x, z)
}

function addVolleyballNet(world: THREE.Group): void {
  addBlock(world, { color: 'wood', position: [17, 1, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'wood', position: [25, 1, -20], scale: [0.18, 2, 0.18] })
  addBlock(world, { color: 'white', position: [21, 1.95, -20], scale: [8.2, 0.12, 0.12] })
  for (let i = 0; i < 8; i += 1) addBlock(world, { color: 'white', position: [18 + i * 0.9, 1.08, -20], scale: [0.08, 1.45, 0.08] })
}

function createRoadDetails(world: THREE.Group): void {
  for (const road of roads) {
    if (road.direction === 'horizontal') {
      const z = (road.minZ + road.maxZ) / 2
      for (let x = road.minX + 4; x <= road.maxX - 4; x += 7) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [1.55, 0.05, 0.11] })
      for (let x = road.minX + 8; x <= road.maxX - 8; x += 12) addStreetLight(world, x, road.minZ - 1.55)
    } else {
      const x = (road.minX + road.maxX) / 2
      for (let z = road.minZ + 4; z <= road.maxZ - 4; z += 7) addBlock(world, { color: 'yellow', position: [x, 0.18, z], scale: [0.11, 0.05, 1.55] })
      for (let z = road.minZ + 8; z <= road.maxZ - 8; z += 12) addStreetLight(world, road.maxX + 1.55, z)
    }
  }

  for (const horizontal of roads.filter((road) => road.direction === 'horizontal')) {
    for (const vertical of roads.filter((road) => road.direction === 'vertical')) {
      addCrosswalk(world, (vertical.minX + vertical.maxX) / 2, (horizontal.minZ + horizontal.maxZ) / 2, 'horizontal')
      addCrosswalk(world, (vertical.minX + vertical.maxX) / 2, (horizontal.minZ + horizontal.maxZ) / 2, 'vertical')
    }
  }
  addRoadEndTunnels(world)
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
  group.name = lot.id
  const isHotel = lot.stories >= 8
  const floorHeight = isHotel ? 2 : 2.3
  const height = lot.stories * floorHeight
  addBlock(group, { color: lot.body, position: [0, height / 2, 0], scale: [lot.width, height, lot.depth] })
  addBlock(group, { color: lot.body, position: [-lot.width / 2 + 1.05, Math.min(3.4, height / 2), -0.55], scale: [1.7, Math.min(6, height * 0.62), lot.depth + 0.2] })
  addBlock(group, { color: 'wood', position: [0, height + 0.08, 0], scale: [lot.width + 0.55, 0.14, lot.depth + 0.45] })
  addBlock(group, { color: lot.roof, position: [0, height + 0.22, 0], scale: [lot.width + 0.28, isHotel ? 0.18 : 0.24, lot.depth + 0.24] })
  addBlock(group, { color: lot.roof, position: [0, height + 0.44, 0], scale: [lot.width - 1.05, 0.16, lot.depth - 0.68] })
  addBlock(group, { color: 'white', position: [0, height + 0.52, -lot.depth / 2 + 0.48], scale: [lot.width - 1.1, 0.1, 0.12] })
  addStreetFacingDoor(group, lot)
  addLargeBuildingWindows(group, lot, floorHeight, isHotel)
  addStackedBalconies(group, lot, floorHeight)
  addRooftopPersonality(group, lot, height, isHotel)
  if (isHotel) addBlock(group, { color: 'metal', position: [0, height + 1.05, 0], scale: [0.28, 1.6, 0.28] })
  return group
}

function addStreetFacingDoor(group: THREE.Group, lot: Lot): void {
  const frontZ = lot.rotation === Math.PI ? lot.depth / 2 + 0.04 : -lot.depth / 2 - 0.04
  addBlock(group, { color: 'darkGlass', position: [0, 1.18, frontZ], scale: [0.9, 1.72, 0.08] })
  addBlock(group, { color: lot.roof, position: [0, 2.18, frontZ - Math.sign(frontZ) * 0.18], scale: [2.1, 0.28, 1.05] })
  addBlock(group, { color: 'metal', position: [0, 0.26, frontZ + (frontZ > 0 ? 0.03 : -0.03)], scale: [1.25, 0.16, 0.18] })
}

function addLargeBuildingWindows(group: THREE.Group, lot: Lot, floorHeight: number, isHotel: boolean): void {
  for (let floor = 0; floor < lot.stories; floor += 1) {
    const y = 1.55 + floor * floorHeight
    const cols = Math.floor(lot.width / 2.4)
    for (let col = 0; col < cols; col += 1) {
      const x = -lot.width / 2 + 1.3 + col * 2.2
      const size = floor % 2 === 0 || isHotel ? 0.72 : 0.55
      addBlock(group, { color: isHotel ? 'darkGlass' : 'glass', position: [x, y, -lot.depth / 2 - 0.05], scale: [size, 0.58, 0.08] })
      addBlock(group, { color: isHotel ? 'darkGlass' : 'glass', position: [x, y, lot.depth / 2 + 0.05], scale: [size, 0.58, 0.08] })
    }
    for (let row = 0; row < Math.max(2, Math.floor(lot.depth / 2.2)); row += 1) {
      const z = -lot.depth / 2 + 1.2 + row * 2
      addBlock(group, { color: isHotel ? 'darkGlass' : 'glass', position: [lot.width / 2 + 0.05, y, z], scale: [0.08, 0.5, 0.62] })
      addBlock(group, { color: isHotel ? 'darkGlass' : 'glass', position: [-lot.width / 2 - 0.05, y, z], scale: [0.08, 0.5, 0.62] })
    }
  }
}

function addStackedBalconies(group: THREE.Group, lot: Lot, floorHeight: number): void {
  for (let floor = 1; floor < Math.min(lot.stories, 6); floor += 1) {
    const y = 0.8 + floor * floorHeight
    for (const x of [-lot.width / 2 + 1.4, lot.width / 2 - 1.4]) {
      addBlock(group, { color: 'wood', position: [x, y, -lot.depth / 2 - 0.32], scale: [1.38, 0.16, 0.52] })
      addBlock(group, { color: 'white', position: [x, y + 0.32, -lot.depth / 2 - 0.58], scale: [1.38, 0.12, 0.1] })
    }
  }
}

function addRooftopPersonality(group: THREE.Group, lot: Lot, height: number, isHotel: boolean): void {
  addBlock(group, { color: 'white', position: [-lot.width / 2 + 1.05, height + 0.58, 0], scale: [0.12, 0.36, lot.depth - 1.05] })
  addBlock(group, { color: 'white', position: [lot.width / 2 - 1.05, height + 0.58, 0], scale: [0.12, 0.36, lot.depth - 1.05] })
  addBlock(group, { color: 'metal', position: [lot.width / 2 - 1.5, height + 0.48, lot.depth / 2 - 1.15], scale: [0.95, 0.2, 0.62] })
  addBlock(group, { color: isHotel ? 'glass' : 'teal', position: [-lot.width / 2 + 1.55, height + 0.48, lot.depth / 2 - 1.1], scale: [1.05, 0.14, 0.62] })
  if (isHotel) addBlock(group, { color: lot.roof, position: [0, height + 0.68, -lot.depth / 2 + 1.05], scale: [2.2, 0.14, 0.78] })
}

function createLandscape(world: THREE.Group): void {
  const palms = [[-56, -13], [-44, -13], [-28, -13], [-8, -13], [8, -13], [28, -13], [44, -13], [56, -13], [-57, 7], [-43, 7], [-20, 16], [20, 16], [43, 8], [56, 8], [-45, 36], [-28, 36], [24, 36], [44, 37]] as const
  palms.forEach(([x, z], index) => {
    const palm = createPalmTree(index % 3)
    palm.position.set(x, 0.08, z)
    palm.rotation.y = index * 0.55
    registerPalmForWind(palm)
    world.add(palm)
  })

  for (const [x, z] of [[-50, 17], [-42, 20], [-31, 7], [-14, 17], [-5, 7], [14, 17], [27, 7], [50, 17], [-54, 38], [-48, 40], [-35, 39], [-16, 37], [6, 38], [31, 39], [48, 40], [55, 35]] as const) {
    const tree = createTropicalTree((x + z) % 3)
    tree.position.set(x, 0.08, z)
    world.add(tree)
  }

  for (const [x, z] of [[-18, 6], [18, 6], [-20, 25], [18, 25], [-51, 26], [51, 26]] as const) addBench(world, x, z)
}

function addCrosswalk(world: THREE.Group, x: number, z: number, direction: 'horizontal' | 'vertical'): void {
  const offset = 2.35
  if (direction === 'horizontal') {
    for (const dz of [-offset, offset]) addBlock(world, { color: 'white', position: [x, 0.2, z + dz], scale: [3.7, 0.05, 0.16] })
  } else {
    for (const dx of [-offset, offset]) addBlock(world, { color: 'white', position: [x + dx, 0.2, z], scale: [0.16, 0.05, 3.7] })
  }
}

function addRoadEndTunnels(world: THREE.Group): void {
  roads.forEach((road) => {
    if (road.direction === 'horizontal') {
      const z = (road.minZ + road.maxZ) / 2
      addTunnelPortal(world, road.minX - 0.65, z, 'horizontal')
      addTunnelPortal(world, road.maxX + 0.65, z, 'horizontal')
    } else {
      const x = (road.minX + road.maxX) / 2
      addTunnelPortal(world, x, road.maxZ - 1.15, 'vertical')
    }
  })
}

function addTunnelPortal(world: THREE.Group, x: number, z: number, direction: 'horizontal' | 'vertical'): void {
  const horizontal = direction === 'horizontal'
  addBlock(world, { color: 'black', position: [x, 1.05, z], scale: horizontal ? [0.28, 2.1, 3.55] : [3.55, 2.1, 0.28] })
  addBlock(world, { color: 'rock', position: [x, 2.35, z], scale: horizontal ? [0.45, 0.55, 4.25] : [4.25, 0.55, 0.45] })
  addBlock(world, { color: 'rock', position: horizontal ? [x, 1.05, z - 1.95] : [x - 1.95, 1.05, z], scale: horizontal ? [0.48, 2.1, 0.5] : [0.5, 2.1, 0.48] })
  addBlock(world, { color: 'rock', position: horizontal ? [x, 1.05, z + 1.95] : [x + 1.95, 1.05, z], scale: horizontal ? [0.48, 2.1, 0.5] : [0.5, 2.1, 0.48] })
}

function addStreetLight(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'black', position: [x, 0.74, z], scale: [0.15, 1.3, 0.15] })
  addBlock(world, { color: 'yellow', position: [x, 1.48, z], scale: [0.34, 0.34, 0.34] })
}

function addBench(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'wood', position: [x, 0.36, z], scale: [2.1, 0.26, 0.35] })
  addBlock(world, { color: 'wood', position: [x - 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
  addBlock(world, { color: 'wood', position: [x + 0.8, 0.16, z], scale: [0.18, 0.32, 0.18] })
}

function addFoodCart(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'coral', position: [x, 0.65, z], scale: [1.7, 0.9, 1] })
  addBlock(world, { color: 'white', position: [x, 1.32, z], scale: [1.95, 0.18, 1.15] })
  addBlock(world, { color: 'yellow', position: [x - 0.55, 1.55, z], scale: [0.3, 0.35, 0.12] })
  addBlock(world, { color: 'black', position: [x - 0.65, 0.22, z - 0.55], scale: [0.25, 0.25, 0.1] })
  addBlock(world, { color: 'black', position: [x + 0.65, 0.22, z - 0.55], scale: [0.25, 0.25, 0.1] })
}

function addBeachShower(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'metal', position: [x, 1.05, z], scale: [0.14, 2, 0.14] })
  addBlock(world, { color: 'metal', position: [x + 0.34, 1.95, z], scale: [0.65, 0.12, 0.12] })
  addBlock(world, { color: 'glass', position: [x + 0.72, 1.78, z], scale: [0.18, 0.22, 0.18] })
}

function addSurfRack(world: THREE.Group, x: number, z: number): void {
  for (let i = 0; i < 4; i += 1) addBlock(world, { color: ['teal', 'yellow', 'coral', 'blue'][i] as PaletteKey, position: [x + i * 0.36, 0.9, z], scale: [0.18, 1.6, 0.12] })
  addBlock(world, { color: 'wood', position: [x + 0.55, 0.3, z], scale: [1.9, 0.18, 0.2] })
}

function addTinyBoat(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'white', position: [x, 0.26, z], scale: [3.3, 0.32, 1.1] })
  addBlock(world, { color: 'blue', position: [x, 0.55, z], scale: [2.2, 0.22, 0.65] })
  addBlock(world, { color: 'wood', position: [x - 0.35, 1, z], scale: [0.12, 1.3, 0.12] })
  addBlock(world, { color: 'white', position: [x + 0.15, 1.2, z], scale: [0.9, 1.1, 0.08] })
}

function addBicycle(world: THREE.Group, x: number, z: number): void {
  addBlock(world, { color: 'black', position: [x - 0.55, 0.32, z], scale: [0.45, 0.45, 0.12] })
  addBlock(world, { color: 'black', position: [x + 0.55, 0.32, z], scale: [0.45, 0.45, 0.12] })
  addBlock(world, { color: 'teal', position: [x, 0.55, z], scale: [0.95, 0.12, 0.12] })
  addBlock(world, { color: 'metal', position: [x + 0.35, 0.82, z], scale: [0.12, 0.52, 0.12] })
}
