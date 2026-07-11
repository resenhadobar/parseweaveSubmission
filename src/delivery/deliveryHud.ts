import * as THREE from 'three'
import { worldBounds } from '../voxel/layout'

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
}

function createHudArrow(): THREE.Group {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({ color: '#e0453f', emissive: '#66110e', roughness: 0.45 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.45, 0.22), material)
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.78, 4), material)
  body.position.y = -0.25
  head.position.y = 0.75
  head.rotation.z = Math.PI / 4
  group.add(body, head)
  group.rotation.x = -0.15
  group.add(new THREE.DirectionalLight('#ffffff', 2.2))
  return group
}
