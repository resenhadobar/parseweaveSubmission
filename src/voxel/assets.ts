import * as THREE from 'three'
import { addBlock, addSign, addStripedAwning, addWindowGrid, centerGroup } from './blocks'
import type { PaletteKey } from './materials'

export type VoxelAsset = {
  id: string
  label: string
  create: () => THREE.Group
}

type HouseOptions = {
  id?: string
  body: PaletteKey
  roof: PaletteKey
  trim?: PaletteKey
  stories?: number
  shop?: boolean
}

export function createBeachHouse(options: HouseOptions): THREE.Group {
  const group = new THREE.Group()
  group.name = options.id ?? 'beach-house'
  const stories = options.stories ?? 2
  const floorHeight = 2.3
  const bodyHeight = floorHeight * stories
  const roofY = bodyHeight + 0.28
  addBlock(group, { color: options.body, position: [0, bodyHeight / 2, 0], scale: [5.4, bodyHeight, 3.9] })
  addBlock(group, { color: options.roof, position: [0, roofY, 0], scale: [6.05, 0.56, 4.45] })
  addBlock(group, { color: options.roof, position: [0, roofY + 0.44, -0.45], scale: [4.95, 0.4, 2.55] })
  addBlock(group, { color: options.trim ?? 'white', position: [0, 1.05, -2.02], scale: [1.1, 1.7, 0.12] })
  addBlock(group, { color: 'darkGlass', position: [0, 1.18, -2.1], scale: [0.6, 1.05, 0.08] })
  addWindowGrid(group, -1.75, 1.7, -2.1, 2, stories)
  addWindowGrid(group, 1.25, 1.7, -2.1, 2, stories)
  addBlock(group, { color: 'wood', position: [0, 0.24, -2.25], scale: [5.6, 0.26, 1.45] })
  for (let i = 0; i < 5; i += 1) {
    addBlock(group, { color: 'white', position: [-2 + i, 0.82, -2.72], scale: [0.12, 0.85, 0.12] })
  }
  if (options.shop) {
    addStripedAwning(group, [0, Math.min(2.1, bodyHeight - 0.45), -1.96], 6, ['teal', 'white'])
    addSign(group, ['blue', 'yellow', 'red', 'teal'], [0, bodyHeight + 0.95, -2.04])
  }
  return group
}

export function createPalmTree(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'palm-tree'
  for (let i = 0; i < 6; i += 1) {
    addBlock(group, { color: 'trunk', position: [Math.sin(i * 0.48) * 0.2, 0.36 + i * 0.68, 0], scale: [0.46, 0.72, 0.46] })
  }
  const crownY = 4.25
  const fronds: Array<[number, number, number, number, number, number, number]> = [
    [0, 0, -1, 0, 0.2, 1.1, 1.75],
    [0, 0, 1, 0, 0.2, 1.1, 1.75],
    [-1, 0, 0, 0, 1.75, 1.1, 0.2],
    [1, 0, 0, 0, 1.75, 1.1, 0.2],
    [-0.7, 0, -0.7, -0.15, 1.35, 0.95, 1.35],
    [0.7, 0, -0.7, -0.15, 1.35, 0.95, 1.35],
    [-0.7, 0, 0.7, -0.15, 1.35, 0.95, 1.35],
    [0.7, 0, 0.7, -0.15, 1.35, 0.95, 1.35],
  ]
  addBlock(group, { color: 'palm', position: [0, crownY + 0.12, 0], scale: [1.1, 0.34, 1.1] })
  fronds.forEach(([x, y, z, drop, sx, sy, sz]) => {
    addBlock(group, { color: 'palm', position: [x, crownY + y + drop, z], scale: [sx, sy, sz] })
    addBlock(group, { color: 'leaf', position: [x * 1.75, crownY - 0.28 + drop, z * 1.75], scale: [Math.max(0.55, sx * 0.7), 0.18, Math.max(0.55, sz * 0.7)] })
  })
  addBlock(group, { color: 'trunk', position: [0.14, crownY - 0.12, 0], scale: [0.54, 0.42, 0.54] })
  addBlock(group, { color: 'wood', position: [-0.28, crownY - 0.28, -0.18], scale: [0.2, 0.2, 0.2] })
  addBlock(group, { color: 'wood', position: [0.25, crownY - 0.32, 0.24], scale: [0.2, 0.2, 0.2] })
  return group
}

export function createCar(color: PaletteKey = 'red'): THREE.Group {
  const group = new THREE.Group()
  group.name = `${color}-car`
  addBlock(group, { color, position: [0, 0.45, 0], scale: [2.6, 0.7, 1.25] })
  addBlock(group, { color, position: [-0.25, 1.05, 0], scale: [1.35, 0.65, 1.05] })
  addBlock(group, { color: 'glass', position: [-0.25, 1.13, -0.55], scale: [0.86, 0.36, 0.08] })
  addBlock(group, { color: 'glass', position: [-0.25, 1.13, 0.55], scale: [0.86, 0.36, 0.08] })
  for (const x of [-0.86, 0.86]) {
    for (const z of [-0.66, 0.66]) {
      addBlock(group, { color: 'black', position: [x, 0.05, z], scale: [0.42, 0.42, 0.18] })
      addBlock(group, { color: 'metal', position: [x, 0.05, z * 1.02], scale: [0.18, 0.18, 0.08] })
    }
  }
  addBlock(group, { color: 'yellow', position: [1.35, 0.48, -0.36], scale: [0.08, 0.2, 0.24] })
  addBlock(group, { color: 'yellow', position: [1.35, 0.48, 0.36], scale: [0.08, 0.2, 0.24] })
  return group
}

export function createVoxelPerson(shirt: PaletteKey = 'teal'): THREE.Group {
  const group = new THREE.Group()
  group.name = `${shirt}-beach-person`
  addBlock(group, { color: 'skin', position: [0, 1.38, 0], scale: [0.34, 0.34, 0.34] })
  addBlock(group, { color: shirt, position: [0, 0.88, 0], scale: [0.42, 0.6, 0.28] })
  addBlock(group, { color: 'skin', position: [-0.31, 0.88, 0], scale: [0.11, 0.48, 0.12] })
  addBlock(group, { color: 'skin', position: [0.31, 0.88, 0], scale: [0.11, 0.48, 0.12] })
  addBlock(group, { color: 'navy', position: [-0.13, 0.34, 0], scale: [0.13, 0.62, 0.16] })
  addBlock(group, { color: 'navy', position: [0.13, 0.34, 0], scale: [0.13, 0.62, 0.16] })
  addBlock(group, { color: 'black', position: [0, 1.58, -0.02], scale: [0.38, 0.12, 0.38] })
  return group
}

export function createBeachUmbrella(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'beach-umbrella'
  addBlock(group, { color: 'wood', position: [0, 0.98, 0], scale: [0.12, 1.95, 0.12] })
  const colors: PaletteKey[] = ['yellow', 'coral', 'teal', 'white']
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8
    addBlock(group, {
      color: colors[i % colors.length],
      position: [Math.cos(angle) * 0.58, 2.05, Math.sin(angle) * 0.58],
      scale: [0.9, 0.18, 0.9],
    })
  }
  addBlock(group, { color: 'white', position: [0, 2.18, 0], scale: [0.42, 0.2, 0.42] })
  return group
}

export function createLifeguardTower(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'lifeguard-tower'
  for (const x of [-1, 1]) {
    for (const z of [-0.72, 0.72]) {
      addBlock(group, { color: 'wood', position: [x, 0.8, z], scale: [0.18, 1.6, 0.18] })
    }
  }
  addBlock(group, { color: 'wood', position: [0, 1.55, 0], scale: [2.55, 0.22, 1.9] })
  addBlock(group, { color: 'white', position: [0, 2.25, 0], scale: [2.2, 1.2, 1.55] })
  addBlock(group, { color: 'red', position: [0, 2.95, -0.82], scale: [2.55, 0.36, 1.88] })
  addSign(group, ['red', 'red', 'white', 'red'], [0, 2.37, -0.88])
  addBlock(group, { color: 'blue', position: [-1.45, 1.05, -0.95], scale: [0.22, 0.18, 1.5] })
  return group
}

export function createSurfShop(): THREE.Group {
  const group = createBeachHouse({ id: 'surf-shop', body: 'cream', roof: 'teal', stories: 1, shop: true })
  addBlock(group, { color: 'blue', position: [-2.55, 1.05, -2.15], scale: [0.18, 1.9, 0.32] })
  addBlock(group, { color: 'yellow', position: [-2.78, 1.1, -2.15], scale: [0.18, 1.65, 0.28] })
  addBlock(group, { color: 'pink', position: [2.55, 1.05, -2.15], scale: [0.18, 1.9, 0.32] })
  return group
}

export function createViewerAssets(): VoxelAsset[] {
  return [
    { id: 'beach-house', label: 'Pastel Beach House', create: () => centerGroup(createBeachHouse({ body: 'coral', roof: 'navy' })) },
    { id: 'surf-shop', label: 'Surf Shop', create: () => centerGroup(createSurfShop()) },
    { id: 'small-apartment', label: 'Small Apartment', create: () => centerGroup(createBeachHouse({ body: 'blue', roof: 'red', stories: 3 })) },
    { id: 'palm-tree', label: 'Voxel Palm Tree', create: () => centerGroup(createPalmTree()) },
    { id: 'lifeguard', label: 'Lifeguard Tower', create: () => centerGroup(createLifeguardTower()) },
    { id: 'car', label: 'Ocean Avenue Car', create: () => centerGroup(createCar('yellow')) },
    { id: 'person', label: 'Beach Person', create: () => centerGroup(createVoxelPerson('pink')) },
    { id: 'umbrella', label: 'Beach Umbrella', create: () => centerGroup(createBeachUmbrella()) },
  ]
}
