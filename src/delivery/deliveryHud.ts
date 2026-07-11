import * as THREE from 'three'
import { lots, roads, worldBounds } from '../voxel/layout'

type HudPoint = { x: number; z: number }

type HudSnapshot = {
  active: boolean
  pickups: HudPoint[]
  target?: HudPoint
  cash: number
  timer: number
}

export class DeliveryHud {
  private readonly root = document.createElement('div')
  private readonly map = document.createElement('div')
  private readonly playerDot = document.createElement('div')
  private readonly pickupDots: HTMLDivElement[] = []
  private readonly targetDot = document.createElement('div')
  private readonly cashCounter = document.createElement('div')
  private readonly timerCounter = document.createElement('div')
  private readonly radText = document.createElement('div')
  private readonly arrowScene = new THREE.Scene()
  private readonly arrowCamera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    20
  )
  private readonly arrow = createHudArrow()
  private radTimer = 0

  constructor(private readonly mount: HTMLElement) {
    this.root.className = 'delivery-hud'
    this.map.className = 'delivery-map'
    this.playerDot.className = 'map-dot map-player'
    this.targetDot.className = 'map-dot map-target'
    this.cashCounter.className = 'cash-counter'
    this.timerCounter.className = 'timer-counter'
    this.radText.className = 'rad-text'
    this.radText.textContent = 'RAD!'
    this.addMapBackdrop()
    this.map.append(this.playerDot, this.targetDot)
    this.root.append(
      this.cashCounter,
      this.timerCounter,
      this.radText,
      this.map,
      this.createTutorialModal()
    )
    this.mount.append(this.root)
    this.arrowScene.add(this.arrow)
    this.arrowCamera.position.set(0, 0, 6)
    this.arrow.visible = false
  }

  update(snapshot: HudSnapshot, player: THREE.Object3D): void {
    this.syncPickupDots(snapshot.pickups)
    this.cashCounter.textContent = `$${snapshot.cash}`
    this.timerCounter.textContent = snapshot.active ? `TIME ${Math.ceil(snapshot.timer)}` : ''
    this.timerCounter.style.display = snapshot.active ? 'block' : 'none'
    this.placeDot(this.playerDot, { x: player.position.x, z: player.position.z })
    snapshot.pickups.forEach((point, index) => this.placeDot(this.pickupDots[index], point))
    this.targetDot.style.display = snapshot.target ? 'block' : 'none'
    if (snapshot.target) this.placeDot(this.targetDot, snapshot.target)

    this.arrow.visible = snapshot.active && !!snapshot.target
    if (snapshot.target) {
      const dx = snapshot.target.x - player.position.x
      const dz = snapshot.target.z - player.position.z
      this.arrow.rotation.z = Math.atan2(dx, dz) + player.rotation.y
      this.arrow.rotation.x = -0.82
      this.arrow.rotation.y = 0.62
    }

    this.radTimer = Math.max(0, this.radTimer - 1 / 60)
    this.radText.style.opacity = this.radTimer > 0 ? '1' : '0'
  }

  showRad(): void {
    this.radTimer = 0.9
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
    this.placeZone(
      beach,
      worldBounds.minX,
      worldBounds.maxX,
      worldBounds.minZ,
      worldBounds.beachEndZ
    )
    this.map.append(beach)

    lots.forEach((lot) => {
      const width = Math.abs(Math.sin(lot.rotation)) > 0.5 ? lot.depth : lot.width
      const depth = Math.abs(Math.sin(lot.rotation)) > 0.5 ? lot.width : lot.depth
      const block = document.createElement('div')
      block.className = 'map-zone map-block'
      this.placeZone(
        block,
        lot.x - width / 2,
        lot.x + width / 2,
        lot.z - depth / 2,
        lot.z + depth / 2
      )
      this.map.append(block)
    })

    roads.forEach((road) => {
      const street = document.createElement('div')
      street.className = 'map-zone map-road'
      this.placeZone(street, road.minX, road.maxX, road.minZ, road.maxZ)
      this.map.append(street)
    })
  }

  private placeZone(
    zone: HTMLElement,
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number
  ): void {
    const left = ((minX - worldBounds.minX) / (worldBounds.maxX - worldBounds.minX)) * 100
    const top = ((minZ - worldBounds.minZ) / (worldBounds.maxZ - worldBounds.minZ)) * 100
    const width = ((maxX - minX) / (worldBounds.maxX - worldBounds.minX)) * 100
    const height = ((maxZ - minZ) / (worldBounds.maxZ - worldBounds.minZ)) * 100
    zone.style.left = `${left}%`
    zone.style.top = `${top}%`
    zone.style.width = `${width}%`
    zone.style.height = `${height}%`
  }

  private createTutorialModal(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'tutorial-modal'
    const card = document.createElement('div')
    card.className = 'tutorial-card'
    card.innerHTML = `
      <h1>Welcome to VOXEL BEACH</h1>
      <p>Earn cash by taking delivery jobs while skating through Voxel Beach. Find green NPC markers on sidewalks, slow down near one to accept the job, then race to the red dropoff aura before the timer runs out.</p>
      <ul>
        <li><strong>WASD / Arrows</strong> move and steer.</li>
        <li><strong>E</strong> toggles your skateboard.</li>
        <li><strong>Space</strong> kickflips. Kickflips during deliveries are RAD and increase payout.</li>
        <li>Follow the red 3D arrow and red ground aura. Faster deliveries pay more cash.</li>
        <li>Avoid cars, people, buildings, and trees or you will bail and lose time.</li>
      </ul>
      <button type="button">Start Deliveries</button>
    `
    const close = () => {
      overlay.remove()
      console.info('[VoxelBeach] Tutorial modal dismissed')
    }
    card.querySelector('button')?.addEventListener('click', close)
    window.addEventListener('keydown', close, { once: true })
    overlay.append(card)
    return overlay
  }
}

function createHudArrow(): THREE.Group {
  const group = new THREE.Group()
  const red = new THREE.MeshStandardMaterial({
    color: '#e0453f',
    emissive: '#5a100d',
    emissiveIntensity: 0.25,
    roughness: 0.36,
  })
  const cream = new THREE.MeshStandardMaterial({ color: '#fff1c2', roughness: 0.42 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.45, 0.34), red)
  const outlineHead = new THREE.Mesh(new THREE.ConeGeometry(0.84, 0.98, 4), cream)
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.9, 4), red)
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.055, 8, 4), cream)
  body.position.y = -0.22
  outlineHead.position.y = 0.76
  head.position.y = 0.78
  outlineHead.rotation.y = Math.PI / 4
  head.rotation.y = Math.PI / 4
  trim.position.y = -0.86
  trim.scale.y = 0.55
  group.add(body, outlineHead, head, trim)
  const light = new THREE.DirectionalLight('#ffffff', 2.4)
  light.position.set(2, 3, 4)
  group.add(light)
  return group
}
