import * as THREE from 'three'
import { lots, roads, worldBounds } from '../voxel/layout'

type HudPoint = { x: number; z: number }

type HudSnapshot = {
  active: boolean
  pickups: HudPoint[]
  target?: HudPoint
}

export class DeliveryHud {
  private readonly root = document.createElement('div')
  private readonly map = document.createElement('div')
  private readonly playerDot = document.createElement('div')
  private readonly pickupDots: HTMLDivElement[] = []
  private readonly targetDot = document.createElement('div')
  private readonly arrowScene = new THREE.Scene()
  private readonly arrowCamera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 20)
  private readonly arrow = createHudArrow()

  constructor(private readonly mount: HTMLElement) {
    this.root.className = 'delivery-hud'
    this.map.className = 'delivery-map'
    this.playerDot.className = 'map-dot map-player'
    this.targetDot.className = 'map-dot map-target'
    this.addMapBackdrop()
    this.map.append(this.playerDot, this.targetDot)
    this.root.append(this.map)
    this.mount.append(this.root)
    this.arrowScene.add(this.arrow)
    this.arrowCamera.position.set(0, 0, 6)
    this.arrow.visible = false
  }

  update(snapshot: HudSnapshot, player: THREE.Object3D): void {
    this.syncPickupDots(snapshot.pickups)
    this.placeDot(this.playerDot, { x: player.position.x, z: player.position.z })
    snapshot.pickups.forEach((point, index) => this.placeDot(this.pickupDots[index], point))
    this.targetDot.style.display = snapshot.target ? 'block' : 'none'
    if (snapshot.target) this.placeDot(this.targetDot, snapshot.target)

    this.arrow.visible = snapshot.active && !!snapshot.target
    if (snapshot.target) {
      const dx = snapshot.target.x - player.position.x
      const dz = snapshot.target.z - player.position.z
      this.arrow.rotation.z = -Math.atan2(dx, dz)
    }
  }

  render(renderer: THREE.WebGLRenderer): void {
    if (!this.arrow.visible) return
    renderer.autoClear = false
    renderer.clearDepth()
    const size = renderer.getSize(new THREE.Vector2())
    renderer.setViewport(size.x * 0.39, size.y * 0.74, size.x * 0.22, size.y * 0.22)
    renderer.render(this.arrowScene, this.arrowCamera)
    renderer.setViewport(0, 0, size.x, size.y)
    renderer.autoClear = true
  }

  resize(): void {
    this.arrowCamera.aspect = window.innerWidth / window.innerHeight
    this.arrowCamera.updateProjectionMatrix()
  }

  private syncPickupDots(points: HudPoint[]): void {
    while (this.pickupDots.length < points.length) {
      const dot = document.createElement('div')
      dot.className = 'map-dot map-pickup'
      this.pickupDots.push(dot)
      this.map.append(dot)
    }
  }

  private placeDot(dot: HTMLElement, point: HudPoint): void {
    const x = ((point.x - worldBounds.minX) / (worldBounds.maxX - worldBounds.minX)) * 100
    const z = ((point.z - worldBounds.minZ) / (worldBounds.maxZ - worldBounds.minZ)) * 100
    dot.style.left = `${x}%`
    dot.style.top = `${z}%`
  }

  private addMapBackdrop(): void {
    const beach = document.createElement('div')
    beach.className = 'map-zone map-beach'
    this.placeZone(beach, worldBounds.minX, worldBounds.maxX, worldBounds.minZ, worldBounds.beachEndZ)
    this.map.append(beach)

    lots.forEach((lot) => {
      const block = document.createElement('div')
      block.className = 'map-zone map-block'
      this.placeZone(block, lot.x - lot.width / 2, lot.x + lot.width / 2, lot.z - lot.depth / 2, lot.z + lot.depth / 2)
      this.map.append(block)
    })

    roads.forEach((road) => {
      const street = document.createElement('div')
      street.className = 'map-zone map-road'
      this.placeZone(street, road.minX, road.maxX, road.minZ, road.maxZ)
      this.map.append(street)
    })
  }

  private placeZone(zone: HTMLElement, minX: number, maxX: number, minZ: number, maxZ: number): void {
    const left = ((minX - worldBounds.minX) / (worldBounds.maxX - worldBounds.minX)) * 100
    const top = ((minZ - worldBounds.minZ) / (worldBounds.maxZ - worldBounds.minZ)) * 100
    const width = ((maxX - minX) / (worldBounds.maxX - worldBounds.minX)) * 100
    const height = ((maxZ - minZ) / (worldBounds.maxZ - worldBounds.minZ)) * 100
    zone.style.left = `${left}%`
    zone.style.top = `${top}%`
    zone.style.width = `${width}%`
    zone.style.height = `${height}%`
  }
}

function createHudArrow(): THREE.Group {
  const group = new THREE.Group()
  const shape = new THREE.Shape()
  shape.moveTo(0, 1.05)
  shape.lineTo(0.72, 0.18)
  shape.lineTo(0.32, 0.18)
  shape.lineTo(0.32, -1.05)
  shape.lineTo(-0.32, -1.05)
  shape.lineTo(-0.32, 0.18)
  shape.lineTo(-0.72, 0.18)
  shape.lineTo(0, 1.05)
  const outline = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: '#fff1c2', side: THREE.DoubleSide }))
  const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: '#e0453f', side: THREE.DoubleSide }))
  outline.scale.setScalar(1.12)
  fill.position.z = 0.015
  group.add(outline, fill)
  group.rotation.x = -0.1
  group.add(new THREE.DirectionalLight('#ffffff', 2.2))
  return group
}
