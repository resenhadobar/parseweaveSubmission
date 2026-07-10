import * as THREE from 'three'
import { mat, type PaletteKey } from './materials'

export type BlockOptions = {
  color?: PaletteKey
  position?: THREE.Vector3Tuple
  scale?: THREE.Vector3Tuple
  name?: string
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

export function block(options: BlockOptions = {}): THREE.Mesh {
  const mesh = new THREE.Mesh(boxGeometry, mat(options.color ?? 'white'))
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.set(...(options.position ?? [0, 0, 0]))
  mesh.scale.set(...(options.scale ?? [1, 1, 1]))
  if (options.name) mesh.name = options.name
  return mesh
}

export function addBlock(parent: THREE.Group, options: BlockOptions = {}): THREE.Mesh {
  const mesh = block(options)
  parent.add(mesh)
  return mesh
}

export function addGrid(
  parent: THREE.Group,
  color: PaletteKey,
  startX: number,
  startZ: number,
  width: number,
  depth: number,
  y = 0,
): void {
  for (let x = 0; x < width; x += 1) {
    for (let z = 0; z < depth; z += 1) {
      addBlock(parent, {
        color,
        position: [startX + x, y, startZ + z],
        scale: [0.96, 0.18, 0.96],
      })
    }
  }
}

export function addStripedAwning(
  parent: THREE.Group,
  position: THREE.Vector3Tuple,
  width: number,
  colors: PaletteKey[],
): void {
  const awning = new THREE.Group()
  awning.position.set(...position)
  for (let i = 0; i < width; i += 1) {
    addBlock(awning, {
      color: colors[i % colors.length],
      position: [i - width / 2 + 0.5, 0, 0],
      scale: [0.92, 0.28, 1.15],
    })
  }
  parent.add(awning)
}

export function addWindowGrid(parent: THREE.Group, x: number, y: number, z: number, cols: number, rows: number): void {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      addBlock(parent, {
        color: 'glass',
        position: [x + col * 0.8, y + row * 0.75, z],
        scale: [0.46, 0.42, 0.08],
      })
    }
  }
}

export function addSign(parent: THREE.Group, labelBlocks: PaletteKey[], position: THREE.Vector3Tuple): void {
  const sign = new THREE.Group()
  sign.position.set(...position)
  addBlock(sign, { color: 'wood', position: [0, 0, 0], scale: [2.5, 0.62, 0.16] })
  labelBlocks.forEach((color, index) => {
    addBlock(sign, { color, position: [-0.88 + index * 0.44, 0.02, -0.12], scale: [0.22, 0.24, 0.08] })
  })
  parent.add(sign)
}

export function centerGroup(group: THREE.Group): THREE.Group {
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.position.sub(center)
  return group
}
