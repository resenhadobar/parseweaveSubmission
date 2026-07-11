import * as THREE from 'three'
import { createVoxelPerson } from '../voxel/assets'
import { isSidewalk } from '../voxel/layout'
import { calculateDeliveryScore } from './scoring'

type DeliveryPoint = { x: number; z: number }

export type DeliveryCompletion = {
  position: THREE.Vector3
  payout: number
  cash: number
}

type DeliveryState = 'waiting' | 'active'

const pickupPoints: DeliveryPoint[] = createSidewalkPoints(931, 5)
const dropoffPoints: DeliveryPoint[] = createSidewalkPoints(1937, 5)

export class DeliveryController {
  private readonly group = new THREE.Group()
  private readonly pickupArrows: THREE.Group[] = []
  private readonly offerNpcs: THREE.Group[] = []
  private readonly targetArrow = createArrow('red')
  private readonly targetAura = createTargetAura()
  private state: DeliveryState = 'waiting'
  private activePickup = 0
  private activeDropoff = 0
  private randomSeed = 42069
  private timer = 0
  private completed = 0
  private cash = 0
  private radBonus = 0
  private completion: DeliveryCompletion | undefined

  constructor(world: THREE.Group) {
    this.group.name = 'delivery-pointers'
    pickupPoints.forEach((point, index) => {
      const arrow = createArrow('green')
      arrow.position.set(point.x, 2.65, point.z)
      arrow.scale.setScalar(0.72)
      const npc = createVoxelPerson(
        ['yellow', 'teal', 'pink', 'coral'][index] as 'yellow' | 'teal' | 'pink' | 'coral'
      )
      npc.name = 'delivery-offer-npc'
      npc.position.set(point.x, 0.12, point.z)
      npc.rotation.y = Math.PI
      this.offerNpcs[index] = npc
      this.pickupArrows[index] = arrow
      this.group.add(npc)
      this.group.add(arrow)
    })
    this.targetArrow.visible = false
    this.targetAura.visible = false
    this.group.add(this.targetArrow)
    this.group.add(this.targetAura)
    world.add(this.group)
    console.info(
      '[VoxelBeach] Skate delivery offers active: stop near green arrows to accept a run'
    )
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
    console.info(
      `[VoxelBeach] Delivery crash penalty: -5 seconds, ${Math.ceil(this.timer)} seconds left`
    )
  }

  recordKickflip(): boolean {
    if (this.state !== 'active') return false
    this.radBonus += 8
    console.info(
      `[VoxelBeach] RAD kickflip bonus added: delivery value +$8, current trick bonus $${this.radBonus}`
    )
    return true
  }

  consumeCompletion(): DeliveryCompletion | undefined {
    const completion = this.completion
    this.completion = undefined
    return completion
  }

  getHudSnapshot(): {
    active: boolean
    pickups: DeliveryPoint[]
    target?: DeliveryPoint
    cash: number
    timer: number
  } {
    return {
      active: this.state === 'active',
      pickups: pickupPoints,
      target: this.state === 'active' ? dropoffPoints[this.activeDropoff] : undefined,
      cash: this.cash,
      timer: this.state === 'active' ? this.timer : 0,
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
    this.activeDropoff = this.rollPoint(dropoffPoints, player.position)
    this.state = 'active'
    this.timer = 55
    this.radBonus = 0
    this.pickupArrows.forEach((arrow) => (arrow.visible = false))
    this.targetArrow.visible = true
    this.targetAura.visible = true
    console.info(`[VoxelBeach] Delivery started: ${this.timer}s to reach the red arrow`)
  }

  private updateActive(deltaSeconds: number, player: THREE.Object3D, speed: number): void {
    this.offerNpcs.forEach((npc) => (npc.visible = true))
    this.timer -= deltaSeconds * (speed > 14 ? 0.82 : 1)
    const target = dropoffPoints[this.activeDropoff]
    this.targetArrow.position.set(
      target.x,
      2.9 + Math.sin(performance.now() * 0.006) * 0.22,
      target.z
    )
    this.targetArrow.lookAt(player.position.x, this.targetArrow.position.y, player.position.z)
    this.targetAura.position.set(target.x, 0.13, target.z)
    this.targetAura.scale.setScalar(1 + Math.sin(performance.now() * 0.005) * 0.08)
    if (distanceTo(player, target) < 3.4) {
      this.completed += 1
      const score = calculateDeliveryScore(this.timer, speed, this.radBonus)
      this.cash += score.payout
      this.completion = {
        position: new THREE.Vector3(target.x, 0.2, target.z),
        payout: score.payout,
        cash: this.cash,
      }
      this.state = 'waiting'
      this.targetArrow.visible = false
      this.targetAura.visible = false
      this.rerollPickup(this.activePickup, player.position)
      this.rerollDropoff(this.activeDropoff, player.position)
      console.info(
        `[VoxelBeach] Delivery complete: payout $${score.payout} (base $${score.baseValue}, speed $${score.speedBonus}, RAD $${score.radBonus}), cash $${this.cash}, completed runs ${this.completed}`
      )
      return
    }
    if (this.timer <= 0) {
      this.state = 'waiting'
      this.targetArrow.visible = false
      this.targetAura.visible = false
      this.rerollPickup(this.activePickup, player.position)
      this.rerollDropoff(this.activeDropoff, player.position)
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

  private rerollPickup(index: number, avoid: THREE.Vector3): void {
    const point = this.rollSidewalkPoint(avoid, pickupPoints, dropoffPoints)
    pickupPoints[index] = point
    this.offerNpcs[index].position.set(point.x, 0.12, point.z)
    this.pickupArrows[index].position.set(point.x, 2.65, point.z)
    console.info(`[VoxelBeach] Delivery NPC ${index + 1} moved to sidewalk ${point.x}, ${point.z}`)
  }

  private rerollDropoff(index: number, avoid: THREE.Vector3): void {
    dropoffPoints[index] = this.rollSidewalkPoint(avoid, pickupPoints, dropoffPoints)
  }

  private rollPoint(points: DeliveryPoint[], avoid: THREE.Vector3): number {
    let best = Math.floor(this.nextRandom() * points.length)
    for (let i = 0; i < points.length; i += 1) {
      const candidate = Math.floor(this.nextRandom() * points.length)
      if (Math.hypot(points[candidate].x - avoid.x, points[candidate].z - avoid.z) > 18)
        return candidate
      best = candidate
    }
    return best
  }

  private rollSidewalkPoint(
    avoid: THREE.Vector3,
    ...occupiedGroups: DeliveryPoint[][]
  ): DeliveryPoint {
    for (let attempts = 0; attempts < 180; attempts += 1) {
      const x = Math.round(-56 + this.nextRandom() * 112)
      const z = Math.round(-12 + this.nextRandom() * 58)
      if (!isSidewalk(x, z)) continue
      if (Math.hypot(x - avoid.x, z - avoid.z) < 14) continue
      if (occupiedGroups.flat().some((point) => Math.hypot(point.x - x, point.z - z) < 9)) continue
      return { x, z }
    }
    return { x: -54 + this.nextRandom() * 108, z: -4 + this.nextRandom() * 38 }
  }

  private nextRandom(): number {
    this.randomSeed = (this.randomSeed * 1664525 + 1013904223) >>> 0
    return this.randomSeed / 4294967295
  }
}

function createArrow(color: 'green' | 'red'): THREE.Group {
  const group = new THREE.Group()
  const fill = color === 'green' ? '#65d66e' : '#e0453f'
  const glow = color === 'green' ? '#1b6d31' : '#66110e'
  const material = new THREE.MeshStandardMaterial({
    color: fill,
    emissive: glow,
    emissiveIntensity: 0.35,
    roughness: 0.38,
  })
  const trim = new THREE.MeshStandardMaterial({
    color: '#fff1c2',
    emissive: '#3b2d16',
    emissiveIntensity: 0.15,
    roughness: 0.42,
  })
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

function createTargetAura(): THREE.Mesh {
  const geometry = new THREE.RingGeometry(1.9, 2.75, 40)
  const material = new THREE.MeshBasicMaterial({
    color: '#ff2f2f',
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const aura = new THREE.Mesh(geometry, material)
  aura.name = 'delivery-red-ground-aura'
  aura.rotation.x = -Math.PI / 2
  return aura
}

function createSidewalkPoints(seed: number, count: number): DeliveryPoint[] {
  const points: DeliveryPoint[] = []
  let value = seed
  for (let attempts = 0; attempts < 220 && points.length < count; attempts += 1) {
    value = (value * 1664525 + 1013904223) >>> 0
    const x = Math.round(-56 + (value / 4294967295) * 112)
    value = (value * 1664525 + 1013904223) >>> 0
    const z = Math.round(-12 + (value / 4294967295) * 58)
    if (!isSidewalk(x, z)) continue
    if (points.some((point) => Math.hypot(point.x - x, point.z - z) < 12)) continue
    points.push({ x, z })
  }
  return points.length >= count
    ? points
    : [
        { x: -54, z: -4 },
        { x: -8, z: 8 },
        { x: 29, z: 14 },
        { x: 52, z: 27 },
        { x: -30, z: 34 },
      ]
}
