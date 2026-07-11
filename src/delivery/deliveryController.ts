import * as THREE from 'three'
import { createVoxelPerson } from '../voxel/assets'
import { calculateDeliveryScore } from './scoring'

type DeliveryPoint = { x: number; z: number }

type DeliveryState = 'waiting' | 'active'

const pickupPoints: DeliveryPoint[] = [
  { x: -54, z: 7.2 },
  { x: -8, z: 7.3 },
  { x: 29, z: 15.6 },
  { x: 52, z: 27.1 },
]

const dropoffPoints: DeliveryPoint[] = [
  { x: 48, z: -12.5 },
  { x: -28, z: 26.9 },
  { x: 12, z: 34.8 },
  { x: -52, z: -12.4 },
]

export class DeliveryController {
  private readonly group = new THREE.Group()
  private readonly pickupArrows: THREE.Group[] = []
  private readonly offerNpcs: THREE.Group[] = []
  private readonly targetArrow = createArrow('red')
  private state: DeliveryState = 'waiting'
  private activePickup = 0
  private activeDropoff = 0
  private timer = 0
  private completed = 0
  private cash = 0
  private radBonus = 0

  constructor(world: THREE.Group) {
    this.group.name = 'delivery-pointers'
    pickupPoints.forEach((point, index) => {
      const arrow = createArrow('green')
      arrow.position.set(point.x, 2.65, point.z)
      arrow.scale.setScalar(0.72)
      const npc = createVoxelPerson(['yellow', 'teal', 'pink', 'coral'][index] as 'yellow' | 'teal' | 'pink' | 'coral')
      npc.name = 'delivery-offer-npc'
      npc.position.set(point.x, 0.12, point.z)
      npc.rotation.y = Math.PI
      this.offerNpcs[index] = npc
      this.pickupArrows[index] = arrow
      this.group.add(npc)
      this.group.add(arrow)
    })
    this.targetArrow.visible = false
    this.group.add(this.targetArrow)
    world.add(this.group)
    console.info('[VoxelBeach] Skate delivery offers active: stop near green arrows to accept a run')
  }

  update(deltaSeconds: number, player: THREE.Object3D, skating: boolean, speed: number): void {
    this.animateArrows(deltaSeconds)
    if (this.state === 'waiting') {
      this.updateWaiting(player, skating, speed)
      return
    }
    this.updateActive(deltaSeconds, player, speed)
  }

  applyFallPenalty(): void {
    if (this.state !== 'active') return
    this.timer = Math.max(1, this.timer - 5)
    console.info(`[VoxelBeach] Delivery crash penalty: -5 seconds, ${Math.ceil(this.timer)} seconds left`)
  }

  recordKickflip(): boolean {
    if (this.state !== 'active') return false
    this.radBonus += 8
    console.info(`[VoxelBeach] RAD kickflip bonus added: delivery value +$8, current trick bonus $${this.radBonus}`)
    return true
  }

  getHudSnapshot(): { active: boolean; pickups: DeliveryPoint[]; target?: DeliveryPoint; cash: number } {
    return {
      active: this.state === 'active',
      pickups: pickupPoints,
      target: this.state === 'active' ? dropoffPoints[this.activeDropoff] : undefined,
      cash: this.cash,
    }
  }

  private updateWaiting(player: THREE.Object3D, skating: boolean, speed: number): void {
    this.pickupArrows.forEach((arrow) => (arrow.visible = skating))
    this.offerNpcs.forEach((npc, index) => {
      npc.visible = true
      npc.rotation.y += 0.012
      npc.position.y = 0.12 + Math.sin(performance.now() * 0.004 + index) * 0.04
    })
    if (!skating || Math.abs(speed) > 0.8) return
    const index = pickupPoints.findIndex((point) => distanceTo(player, point) < 3.2)
    if (index < 0) return
    this.activePickup = index
    this.activeDropoff = (index + this.completed + 1) % dropoffPoints.length
    this.state = 'active'
    this.timer = 55
    this.radBonus = 0
    this.pickupArrows.forEach((arrow) => (arrow.visible = false))
    this.targetArrow.visible = true
    console.info(`[VoxelBeach] Delivery started: ${this.timer}s to reach the red arrow`)
  }

  private updateActive(deltaSeconds: number, player: THREE.Object3D, speed: number): void {
    this.offerNpcs.forEach((npc) => (npc.visible = true))
    this.timer -= deltaSeconds * (speed > 14 ? 0.82 : 1)
    const target = dropoffPoints[this.activeDropoff]
    this.targetArrow.position.set(target.x, 2.9 + Math.sin(performance.now() * 0.006) * 0.22, target.z)
    this.targetArrow.lookAt(player.position.x, this.targetArrow.position.y, player.position.z)
    if (distanceTo(player, target) < 3.4) {
      this.completed += 1
      const score = calculateDeliveryScore(this.timer, speed, this.radBonus)
      this.cash += score.payout
      this.state = 'waiting'
      this.targetArrow.visible = false
      console.info(`[VoxelBeach] Delivery complete: payout $${score.payout} (base $${score.baseValue}, speed $${score.speedBonus}, RAD $${score.radBonus}), cash $${this.cash}, completed runs ${this.completed}`)
      return
    }
    if (this.timer <= 0) {
      this.state = 'waiting'
      this.targetArrow.visible = false
      console.info('[VoxelBeach] Delivery failed: timer expired')
    }
  }

  private animateArrows(deltaSeconds: number): void {
    const spin = deltaSeconds * 2.2
    this.pickupArrows.forEach((arrow, index) => {
      arrow.rotation.y += spin
      arrow.position.y = 2.5 + Math.sin(performance.now() * 0.004 + index) * 0.12
    })
    this.targetArrow.rotation.y += spin * 1.8
  }
}

function createArrow(color: 'green' | 'red'): THREE.Group {
  const group = new THREE.Group()
  const fill = color === 'green' ? '#65d66e' : '#e0453f'
  const glow = color === 'green' ? '#1b6d31' : '#66110e'
  const material = new THREE.MeshStandardMaterial({ color: fill, emissive: glow, emissiveIntensity: 0.35, roughness: 0.38 })
  const trim = new THREE.MeshStandardMaterial({ color: '#fff1c2', emissive: '#3b2d16', emissiveIntensity: 0.15, roughness: 0.42 })
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 8, 28), trim)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.58, 12), material)
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.48, 4), material)
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.14, 4), trim)
  stem.position.y = 0.18
  head.position.y = -0.32
  cap.position.y = -0.58
  head.rotation.x = Math.PI
  cap.rotation.x = Math.PI
  halo.rotation.x = Math.PI / 2
  group.add(halo, stem, head, cap)
  return group
}

function distanceTo(player: THREE.Object3D, point: DeliveryPoint): number {
  return Math.hypot(player.position.x - point.x, player.position.z - point.z)
}
