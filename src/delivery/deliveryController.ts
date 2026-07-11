import * as THREE from 'three'
import { addBlock } from '../voxel/blocks'
import { createVoxelPerson } from '../voxel/assets'

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

  constructor(world: THREE.Group) {
    this.group.name = 'delivery-pointers'
    pickupPoints.forEach((point, index) => {
      const arrow = createArrow('green')
      arrow.position.set(point.x, 3.6, point.z)
      arrow.scale.setScalar(1.45)
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

  getHudSnapshot(): { active: boolean; pickups: DeliveryPoint[]; target?: DeliveryPoint } {
    return {
      active: this.state === 'active',
      pickups: this.state === 'waiting' ? pickupPoints : [],
      target: this.state === 'active' ? dropoffPoints[this.activeDropoff] : undefined,
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
    this.pickupArrows.forEach((arrow) => (arrow.visible = false))
    this.targetArrow.visible = true
    console.info(`[VoxelBeach] Delivery started: ${this.timer}s to reach the red arrow`)
  }

  private updateActive(deltaSeconds: number, player: THREE.Object3D, speed: number): void {
    this.offerNpcs.forEach((npc) => (npc.visible = true))
    this.timer -= deltaSeconds * (speed > 14 ? 0.82 : 1)
    const target = dropoffPoints[this.activeDropoff]
    this.targetArrow.position.set(target.x, 3.1 + Math.sin(performance.now() * 0.006) * 0.35, target.z)
    this.targetArrow.lookAt(player.position.x, this.targetArrow.position.y, player.position.z)
    if (distanceTo(player, target) < 3.4) {
      this.completed += 1
      const payout = Math.max(10, Math.floor(this.timer + Math.abs(speed) * 2))
      this.state = 'waiting'
      this.targetArrow.visible = false
      console.info(`[VoxelBeach] Delivery complete: payout ${payout}, completed runs ${this.completed}`)
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
      arrow.position.y = 2.4 + Math.sin(performance.now() * 0.004 + index) * 0.18
    })
    this.targetArrow.rotation.y += spin * 1.8
  }
}

function createArrow(color: 'green' | 'red'): THREE.Group {
  const group = new THREE.Group()
  addBlock(group, { color, position: [0, 0.35, 0], scale: [0.35, 0.7, 0.35] })
  addBlock(group, { color, position: [0, -0.15, -0.42], scale: [1.15, 0.28, 0.38] })
  addBlock(group, { color, position: [0, -0.15, 0.18], scale: [0.55, 0.28, 0.85] })
  return group
}

function distanceTo(player: THREE.Object3D, point: DeliveryPoint): number {
  return Math.hypot(player.position.x - point.x, player.position.z - point.z)
}
