import * as THREE from 'three'

type CullEntry = {
  object: THREE.Object3D
  center: THREE.Vector3
  radius: number
}

const dynamicNames = new Set([
  'animated-ocean-shader',
  'moving-car',
  'walking-person',
  'player-character',
  'delivery-pointers',
])

export class VisibilityCullingController {
  private readonly entries: CullEntry[] = []
  private readonly frustum = new THREE.Frustum()
  private readonly projectionView = new THREE.Matrix4()
  private elapsed = 0

  constructor(root: THREE.Group) {
    root.children.forEach((child) => this.collect(child))
    console.info(
      `[VoxelBeach] Camera culling registered ${this.entries.length} static scene sections`
    )
  }

  update(camera: THREE.PerspectiveCamera, deltaSeconds: number): void {
    this.elapsed += deltaSeconds
    if (this.elapsed < 0.12) return
    this.elapsed = 0
    camera.updateMatrixWorld()
    this.projectionView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    this.frustum.setFromProjectionMatrix(this.projectionView)
    this.entries.forEach((entry) => {
      const distance = camera.position.distanceTo(entry.center)
      entry.object.visible =
        distance < 170 &&
        this.frustum.intersectsSphere(new THREE.Sphere(entry.center, entry.radius + 10))
    })
  }

  private collect(object: THREE.Object3D): void {
    if (
      dynamicNames.has(object.name) ||
      object.name.includes('moving-car') ||
      object.name.includes('walking-person')
    )
      return
    if (object.type === 'Group' && object.name !== '') {
      this.addEntry(object)
      return
    }
    if ('isMesh' in object || 'isInstancedMesh' in object) this.addEntry(object)
  }

  private addEntry(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object)
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const radius = Math.max(1, box.getSize(new THREE.Vector3()).length() * 0.5)
    this.entries.push({ object, center, radius })
  }
}
