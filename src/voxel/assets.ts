import * as THREE from 'three'
import { addBlock, addSign, addStripedAwning, centerGroup } from './blocks'
import type { PaletteKey } from './materials'

export type VoxelAsset = {
  label: string
  create: () => THREE.Group
}

type HouseOptions = {
  id?: string
  body?: PaletteKey
  roof?: PaletteKey
  trim?: PaletteKey
  stories?: number
  shop?: boolean
}

type WindowPattern = 'paired' | 'wide' | 'offset'

const houseBodies: PaletteKey[] = ['cream', 'white', 'coral', 'teal', 'blue', 'yellow']
const roofColors: PaletteKey[] = ['navy', 'orange', 'red', 'wood']
const trims: PaletteKey[] = ['white', 'wood', 'cream']

function variantFromId(id = 'beach-house'): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997
  return hash
}

export function createBeachHouse(options: HouseOptions = {}): THREE.Group {
  const variant = variantFromId(options.id)
  const group = new THREE.Group()
  group.name = options.id ?? (options.shop ? 'voxel-shop' : 'voxel-beach-house')

  const body = options.body ?? houseBodies[variant % houseBodies.length]
  const roof = options.roof ?? roofColors[variant % roofColors.length]
  const trim = options.trim ?? trims[variant % trims.length]
  const stories = options.stories ?? 2
  const width = options.shop ? 7.4 : 6.35
  const depth = options.shop ? 5.45 : 5.25
  const floorHeight = 2.25
  const bodyHeight = stories * floorHeight
  const roofStyle = options.shop ? 'flat' : 'malibu'

  addBlock(group, { color: body, position: [0, bodyHeight / 2, 0], scale: [width, bodyHeight, depth] })
  addBlock(group, { color: trim, position: [0, bodyHeight - 0.12, -depth / 2 - 0.05], scale: [width + 0.25, 0.18, 0.12] })
  addBlock(group, { color: trim, position: [0, 0.35, -depth / 2 - 0.06], scale: [width + 0.2, 0.22, 0.12] })

  if (!options.shop) {
    const wingSide = variant % 2 === 0 ? -1 : 1
    addBlock(group, { color: body, position: [wingSide * (width / 2 - 0.9), 1.15, 0.75], scale: [2.3, 2.3, 3.2] })
    addPorch(group, width, depth, trim, roof, variant)
    addBalcony(group, width, depth, trim, roof, variant)
    addHouseRoof(group, width, depth, bodyHeight, roof, trim, roofStyle)
    addHouseWindows(group, width, depth, stories, floorHeight, variant % 3 === 0 ? 'offset' : 'paired')
    addPlanters(group, width, depth, variant)
  } else {
    addShopfront(group, width, depth, bodyHeight, roof, trim, variant)
    addHouseWindows(group, width, depth, stories, floorHeight, 'wide')
    addRoofTerrace(group, width, depth, bodyHeight + 0.55, trim, roof, true)
  }

  return group
}

function addHouseRoof(group: THREE.Group, width: number, depth: number, y: number, roof: PaletteKey, trim: PaletteKey, style: string): void {
  if (style === 'malibu') {
    addMalibuRoof(group, width, depth, y, roof, trim)
    return
  }
  addBlock(group, { color: roof, position: [0, y + 0.2, 0], scale: [width + 0.42, 0.32, depth + 0.38] })
  addRoofTerrace(group, width, depth, y + 0.46, trim, roof, false)
}

function addMalibuRoof(group: THREE.Group, width: number, depth: number, y: number, roof: PaletteKey, trim: PaletteKey): void {
  addBlock(group, { color: 'wood', position: [0, y + 0.08, 0], scale: [width + 0.78, 0.16, depth + 0.62] })
  addBlock(group, { color: roof, position: [0, y + 0.24, 0], scale: [width + 0.52, 0.22, depth + 0.42] })
  addBlock(group, { color: roof, position: [0, y + 0.48, 0], scale: [width - 0.75, 0.2, depth - 0.25] })
  addBlock(group, { color: roof, position: [0, y + 0.7, 0], scale: [0.72, 0.2, depth - 0.5] })
  addBlock(group, { color: trim, position: [0, y + 0.36, -depth / 2 - 0.08], scale: [width + 0.58, 0.12, 0.12] })
  addBlock(group, { color: trim, position: [0, y + 0.36, depth / 2 + 0.08], scale: [width + 0.58, 0.12, 0.12] })
  for (const x of [-width / 2 + 1.35, -width / 2 + 2.45, width / 2 - 2.45, width / 2 - 1.35]) {
    addBlock(group, { color: 'wood', position: [x, y + 0.61, 0], scale: [0.12, 0.08, depth - 0.55] })
  }
}

function addPorch(group: THREE.Group, width: number, depth: number, trim: PaletteKey, roof: PaletteKey, variant: number): void {
  const porchX = variant % 2 === 0 ? -1.45 : 1.15
  const frontZ = -depth / 2 - 0.42
  addBlock(group, { color: 'wood', position: [porchX, 0.35, frontZ], scale: [3.05, 0.32, 1.05] })
  addBlock(group, { color: roof, position: [porchX, 2.35, frontZ], scale: [3.28, 0.28, 1.15] })
  for (const x of [porchX - 1.25, porchX + 1.25]) addBlock(group, { color: trim, position: [x, 1.28, frontZ - 0.36], scale: [0.16, 1.85, 0.16] })
  addBlock(group, { color: 'wood', position: [porchX, 0.18, frontZ - 0.82], scale: [2.05, 0.2, 0.32] })
  addBlock(group, { color: 'darkGlass', position: [porchX, 1.18, -depth / 2 - 0.08], scale: [0.82, 1.58, 0.1] })
}

function addBalcony(group: THREE.Group, width: number, depth: number, trim: PaletteKey, roof: PaletteKey, variant: number): void {
  const balconyX = variant % 2 === 0 ? 1.9 : -1.8
  const frontZ = -depth / 2 - 0.3
  addBlock(group, { color: 'wood', position: [balconyX, 2.95, frontZ], scale: [2.35, 0.2, 0.72] })
  addBlock(group, { color: roof, position: [balconyX, 3.28, frontZ - 0.35], scale: [2.45, 0.18, 0.14] })
  for (let i = -1; i <= 1; i += 1) addBlock(group, { color: trim, position: [balconyX + i * 0.72, 3.48, frontZ - 0.35], scale: [0.1, 0.5, 0.1] })
  addBlock(group, { color: 'glass', position: [balconyX, 3.82, -depth / 2 - 0.08], scale: [0.9, 0.62, 0.08] })
  addBlock(group, { color: trim, position: [balconyX, 4.24, -depth / 2 - 0.09], scale: [1.1, 0.14, 0.08] })
}

function addShopfront(group: THREE.Group, width: number, depth: number, height: number, roof: PaletteKey, trim: PaletteKey, variant: number): void {
  const frontZ = -depth / 2 - 0.08
  addStripedAwning(group, [0, 2.35, frontZ - 0.35], 7, [roof, 'white'])
  addBlock(group, { color: 'darkGlass', position: [-1.8, 1.18, frontZ], scale: [2.2, 1.55, 0.1] })
  addBlock(group, { color: 'darkGlass', position: [1.8, 1.18, frontZ], scale: [2.2, 1.55, 0.1] })
  addBlock(group, { color: trim, position: [0, 1.15, frontZ - 0.01], scale: [0.25, 1.72, 0.14] })
  addSign(group, ['teal', 'white', 'coral', 'yellow', 'blue'], [0, 3.2, frontZ - 0.05])
  addBlock(group, { color: roof, position: [0, height + 0.2, 0], scale: [width + 0.38, 0.34, depth + 0.35] })
  addSurfboardRack(group, width / 2 + 0.48, -depth / 2 + 0.15, variant)
}

function addHouseWindows(group: THREE.Group, width: number, depth: number, stories: number, floorHeight: number, pattern: WindowPattern): void {
  for (let floor = 0; floor < stories; floor += 1) {
    const y = 1.45 + floor * floorHeight
    const rowOffset = pattern === 'offset' && floor % 2 === 1 ? 0.55 : 0
    const frontZ = -depth / 2 - 0.08
    if (pattern === 'wide') {
      addBlock(group, { color: 'glass', position: [-2.25, y, frontZ], scale: [1.25, 0.65, 0.08] })
      addBlock(group, { color: 'glass', position: [2.25, y + 0.1, frontZ], scale: [1.15, 0.54, 0.08] })
    } else {
      for (const x of [-width / 2 + 1.2 + rowOffset, width / 2 - 1.2 - rowOffset]) addBlock(group, { color: 'glass', position: [x, y, frontZ], scale: [0.72, 0.58, 0.08] })
    }

    for (const z of [-depth / 2 + 1.45, depth / 2 - 1.45]) {
      addBlock(group, { color: 'glass', position: [-width / 2 - 0.06, y + 0.05, z], scale: [0.08, 0.5, 0.58] })
      addBlock(group, { color: 'glass', position: [width / 2 + 0.06, y - 0.05, z], scale: [0.08, 0.5, 0.58] })
    }
  }
}

function addPlanters(group: THREE.Group, width: number, depth: number, variant: number): void {
  const frontZ = -depth / 2 - 0.75
  for (const x of [-width / 2 + 0.8, width / 2 - 0.8]) {
    addBlock(group, { color: 'wood', position: [x, 0.44, frontZ], scale: [0.75, 0.32, 0.42] })
    addBlock(group, { color: variant % 2 === 0 ? 'pink' : 'yellow', position: [x - 0.18, 0.72, frontZ], scale: [0.18, 0.2, 0.18] })
    addBlock(group, { color: 'leaf', position: [x + 0.18, 0.72, frontZ], scale: [0.26, 0.24, 0.2] })
  }
}

function addRoofTerrace(group: THREE.Group, width: number, depth: number, y: number, trim: PaletteKey, accent: PaletteKey, shop: boolean): void {
  addBlock(group, { color: trim, position: [0, y + 0.28, -depth / 2 + 0.45], scale: [width - 1.15, 0.28, 0.16] })
  addBlock(group, { color: trim, position: [-width / 2 + 0.45, y + 0.28, 0], scale: [0.16, 0.28, depth - 1.2] })
  addBlock(group, { color: trim, position: [width / 2 - 0.45, y + 0.28, 0], scale: [0.16, 0.28, depth - 1.2] })
  addBlock(group, { color: accent, position: [width / 2 - 1.35, y + 0.22, depth / 2 - 1.15], scale: [1.2, 0.22, 0.95] })
  if (shop) addBlock(group, { color: 'glass', position: [-width / 2 + 1.35, y + 0.18, depth / 2 - 1.2], scale: [1.15, 0.14, 0.75] })
}

function addSurfboardRack(group: THREE.Group, x: number, z: number, variant: number): void {
  const colors: PaletteKey[] = ['teal', 'yellow', 'coral']
  for (let i = 0; i < 3; i += 1) {
    addBlock(group, { color: colors[(i + variant) % colors.length], position: [x, 0.82 + i * 0.06, z - i * 0.22], scale: [0.22, 1.55, 0.12] })
  }
  addBlock(group, { color: 'wood', position: [x, 0.38, z - 0.25], scale: [0.35, 0.18, 0.95] })
}

export function createPalmTree(variant = 0): THREE.Group {
  const group = new THREE.Group()
  group.name = 'voxel-palm-tree'
  const height = 4 + (variant % 3) * 0.45
  for (let i = 0; i < 5; i += 1) addBlock(group, { color: 'trunk', position: [Math.sin(i * 0.65 + variant) * 0.14, 0.48 + i * height / 5, 0], scale: [0.38, 0.82, 0.38] })
  const crownY = height + 0.45
  const fronds: THREE.Vector3Tuple[] = [[1.25, 0, 0], [-1.2, 0.08, 0], [0, 0.02, 1.25], [0, 0.1, -1.2], [0.85, -0.1, 0.85], [-0.85, -0.05, -0.85]]
  fronds.forEach((pos, index) => {
    addBlock(group, { color: index % 2 === 0 ? 'palm' : 'leaf', position: [pos[0] * (1 + variant * 0.03), crownY + pos[1], pos[2]], scale: [index < 2 ? 1.75 : 0.54, 0.24, index < 2 ? 0.54 : 1.75] })
  })
  addBlock(group, { color: 'orange', position: [0.24, crownY - 0.24, 0.18], scale: [0.22, 0.24, 0.22] })
  addBlock(group, { color: 'orange', position: [-0.2, crownY - 0.18, -0.12], scale: [0.2, 0.22, 0.2] })
  return group
}

export function createTropicalTree(variant = 0): THREE.Group {
  const group = new THREE.Group()
  group.name = 'voxel-tropical-tree'
  addBlock(group, { color: 'trunk', position: [0, 1.15, 0], scale: [0.58, 2.25, 0.58] })
  addBlock(group, { color: 'leaf', position: [0, 2.75, 0], scale: [3.25, 1.55, 3.05] })
  addBlock(group, { color: 'palm', position: [variant % 2 === 0 ? 0.9 : -0.9, 3.48, 0.2], scale: [1.9, 1.05, 1.75] })
  addBlock(group, { color: 'leaf', position: [-0.65, 3.15, -0.9], scale: [1.85, 1.05, 1.7] })
  return group
}

export function createCar(color: PaletteKey = 'red'): THREE.Group {
  const group = new THREE.Group()
  addBlock(group, { color, position: [0, 0.55, 0], scale: [2.6, 0.75, 1.3] })
  addBlock(group, { color: 'glass', position: [-0.25, 1.08, 0], scale: [1.15, 0.55, 1.05] })
  addBlock(group, { color: 'black', position: [-0.82, 0.2, -0.72], scale: [0.42, 0.42, 0.18] })
  addBlock(group, { color: 'black', position: [0.82, 0.2, -0.72], scale: [0.42, 0.42, 0.18] })
  addBlock(group, { color: 'black', position: [-0.82, 0.2, 0.72], scale: [0.42, 0.42, 0.18] })
  addBlock(group, { color: 'black', position: [0.82, 0.2, 0.72], scale: [0.42, 0.42, 0.18] })
  addBlock(group, { color: 'yellow', position: [1.35, 0.58, -0.42], scale: [0.1, 0.18, 0.22] })
  addBlock(group, { color: 'yellow', position: [1.35, 0.58, 0.42], scale: [0.1, 0.18, 0.22] })
  return group
}

export function createVoxelPerson(shirt: PaletteKey = 'teal'): THREE.Group {
  const group = new THREE.Group()
  group.name = 'voxel-person'
  addBlock(group, { color: 'skin', name: 'head', position: [0, 1.42, 0], scale: [0.4, 0.42, 0.38] })
  addBlock(group, { color: 'black', name: 'hair', position: [0, 1.68, 0.02], scale: [0.43, 0.16, 0.42] })
  addBlock(group, { color: 'black', position: [-0.1, 1.45, -0.21], scale: [0.05, 0.05, 0.04] })
  addBlock(group, { color: 'black', position: [0.1, 1.45, -0.21], scale: [0.05, 0.05, 0.04] })
  addBlock(group, { color: 'coral', position: [0, 1.32, -0.22], scale: [0.13, 0.04, 0.04] })
  addBlock(group, { color: shirt, name: 'body', position: [0, 0.9, 0], scale: [0.5, 0.62, 0.32] })
  addBlock(group, { color: 'white', position: [0, 1.12, -0.18], scale: [0.34, 0.12, 0.04] })
  addBlock(group, { color: 'wood', position: [0, 0.58, -0.18], scale: [0.48, 0.08, 0.05] })
  addCharacterLimb(group, 'left-leg', 'navy', [-0.14, 0.63, 0], [0.16, 0.54, 0.18], 'black')
  addCharacterLimb(group, 'right-leg', 'navy', [0.14, 0.63, 0], [0.16, 0.54, 0.18], 'black')
  addCharacterLimb(group, 'left-arm', shirt, [-0.38, 1.15, 0], [0.13, 0.46, 0.14], 'skin')
  addCharacterLimb(group, 'right-arm', shirt, [0.38, 1.15, 0], [0.13, 0.46, 0.14], 'skin')
  return group
}

function addCharacterLimb(parent: THREE.Group, name: string, color: PaletteKey, position: THREE.Vector3Tuple, scale: THREE.Vector3Tuple, endColor: PaletteKey): void {
  const limb = new THREE.Group()
  limb.name = name
  limb.position.set(...position)
  addBlock(limb, { color, position: [0, -scale[1] / 2, 0], scale })
  addBlock(limb, { color: endColor, position: [0, -scale[1] - 0.06, -0.02], scale: [scale[0] + 0.06, 0.12, scale[2] + 0.08] })
  parent.add(limb)
}

export function createDeliveryBike(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'delivery-skateboard'
  addBlock(group, { color: 'wood', name: 'skate-deck', position: [0, 0.16, 0], scale: [0.62, 0.12, 1.55] })
  addBlock(group, { color: 'teal', position: [0, 0.25, -0.52], scale: [0.54, 0.08, 0.32] })
  addBlock(group, { color: 'yellow', position: [0, 0.25, 0.52], scale: [0.54, 0.08, 0.32] })
  for (const x of [-0.34, 0.34]) for (const z of [-0.58, 0.58]) addBlock(group, { color: 'black', position: [x, 0.06, z], scale: [0.18, 0.18, 0.18] })
  addBlock(group, { color: 'metal', position: [0, 0.12, -0.58], scale: [0.88, 0.08, 0.08] })
  addBlock(group, { color: 'metal', position: [0, 0.12, 0.58], scale: [0.88, 0.08, 0.08] })
  return group
}

export function createBeachUmbrella(): THREE.Group {
  const group = new THREE.Group()
  addBlock(group, { color: 'wood', position: [0, 0.85, 0], scale: [0.16, 1.7, 0.16] })
  const colors: PaletteKey[] = ['coral', 'white', 'teal', 'white']
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2
    addBlock(group, { color: colors[i % colors.length], position: [Math.cos(angle) * 0.72, 1.75, Math.sin(angle) * 0.72], scale: [0.95, 0.2, 0.42] })
  }
  addBlock(group, { color: 'yellow', position: [0, 1.95, 0], scale: [0.42, 0.22, 0.42] })
  return group
}

export function createLifeguardTower(): THREE.Group {
  const group = new THREE.Group()
  addBlock(group, { color: 'wood', position: [0, 1, 0], scale: [3, 0.35, 2.5] })
  for (const x of [-1.1, 1.1]) for (const z of [-0.85, 0.85]) addBlock(group, { color: 'wood', position: [x, 0.55, z], scale: [0.22, 1.1, 0.22] })
  addBlock(group, { color: 'white', position: [0, 2.1, 0], scale: [2.6, 1.8, 2.1] })
  addBlock(group, { color: 'red', position: [0, 3.18, 0], scale: [3.2, 0.42, 2.7] })
  addBlock(group, { color: 'glass', position: [0, 2.2, -1.1], scale: [1.4, 0.65, 0.08] })
  addBlock(group, { color: 'red', position: [0, 2.95, -1.18], scale: [1.45, 0.2, 0.12] })
  addBlock(group, { color: 'white', position: [-1.7, 1.05, -1.15], scale: [0.7, 0.16, 0.22] })
  return group
}

export function createSurfShop(): THREE.Group {
  return createBeachHouse({ id: 'viewer-surf-shop', body: 'cream', roof: 'teal', stories: 2, shop: true })
}

export function createViewerAssets(): VoxelAsset[] {
  return [
    { label: 'Layered Beach House', create: () => centerGroup(createBeachHouse({ id: 'viewer-layered-house', body: 'coral', roof: 'navy' })) },
    { label: 'Surf Shop', create: () => centerGroup(createSurfShop()) },
    { label: 'Palm Tree Variant', create: () => centerGroup(createPalmTree(2)) },
    { label: 'Tropical Tree', create: () => centerGroup(createTropicalTree(1)) },
    { label: 'Lifeguard Tower', create: () => centerGroup(createLifeguardTower()) },
    { label: 'Beach Umbrella', create: () => centerGroup(createBeachUmbrella()) },
    { label: 'Voxel Car', create: () => centerGroup(createCar('teal')) },
    { label: 'Voxel Person', create: () => centerGroup(createVoxelPerson('pink')) },
  ]
}
