import * as THREE from 'three'
import { createDeliveryBike, createVoxelPerson } from '../voxel/assets'
import { isRoad, isSidewalk, worldBounds } from '../voxel/layout'
import { updateVoxelWalkCycle } from '../voxel/characterAnimation'
import { resolvePlayerCollision } from './collisions'

const keys = new Set<string>()
const moveKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'e', ' '])

export class PlayerController {
  readonly object = new THREE.Group()
  readonly rider = createVoxelPerson('blue')
  readonly bike = createDeliveryBike()
  private readonly direction = new THREE.Vector3()
  private readonly velocity = new THREE.Vector3()
  private bikeMounted = false
  private speed = 0
  private deliveryScore = 0
  private deliveryTimer = 0
  private elapsed = 0
  private loggedFirstRide = false

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.object.name = 'player-character'
    this.object.position.set(0, 0.12, 4)
    this.rider.name = 'player-rider'
    this.rider.scale.setScalar(1.15)
    this.bike.position.set(0, 0, 1.35)
    this.bike.visible = false
    this.object.add(this.rider, this.bike)
    bindKeyboard()
    console.info('[VoxelBeach] Delivery player ready: WASD/arrows move camera-relative, E mounts the delivery bike, hold Space to sprint/boost')
  }

  update(deltaSeconds: number, trafficCars: THREE.Object3D[] = []): void {
    this.elapsed += deltaSeconds
    this.deliveryTimer += deltaSeconds
    if (consumeKey('e')) this.setBikeMounted(!this.bikeMounted)

    this.readCameraRelativeDirection()
    const desiredSpeed = this.getTargetSpeed()
    this.speed = THREE.MathUtils.lerp(this.speed, desiredSpeed, this.bikeMounted ? 0.08 : 0.18)
    this.velocity.copy(this.direction).multiplyScalar(this.speed * deltaSeconds)
    const desired = this.object.position.clone().add(this.velocity)
    this.object.position.copy(resolvePlayerCollision(this.object.position, desired, this.bikeMounted ? 0.62 : 0.42))
    this.clampToWorld()
    this.checkTrafficNearMiss(trafficCars)
    this.updateDeliveryScore(deltaSeconds)

    if (this.direction.lengthSq() > 0.01) this.object.rotation.y = Math.atan2(-this.direction.x, -this.direction.z)
    this.updatePose()
  }

  private setBikeMounted(mounted: boolean): void {
    this.bikeMounted = mounted
    this.bike.visible = mounted
    this.rider.position.set(0, mounted ? 0.35 : 0, mounted ? 0.18 : 0)
    this.rider.scale.setScalar(mounted ? 0.95 : 1.15)
    this.speed *= mounted ? 0.7 : 0.25
    console.info(`[VoxelBeach] ${mounted ? 'Mounted' : 'Dismounted'} delivery bike`)
  }

  isBikeMounted(): boolean {
    return this.bikeMounted
  }

  private readCameraRelativeDirection(): void {
    const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
    const z = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
    const forward = new THREE.Vector3()
    this.camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize()
    this.direction.copy(forward.multiplyScalar(z)).add(right.multiplyScalar(x))
    if (this.direction.lengthSq() > 0) this.direction.normalize()
  }

  private getTargetSpeed(): number {
    if (this.direction.lengthSq() === 0) return 0
    if (!this.bikeMounted) return this.isOnRoadOrSidewalk() ? 8.2 : 5.8
    const boost = keys.has(' ') ? 1.45 : 1
    const surface = this.isOnRoadOrSidewalk() ? 1 : 0.72
    return 15.5 * boost * surface
  }

  private updateDeliveryScore(deltaSeconds: number): void {
    if (!this.bikeMounted || this.speed < 7) return
    this.deliveryScore += this.speed * deltaSeconds
    if (this.deliveryTimer > 6) {
      this.deliveryTimer = 0
      console.info(`[VoxelBeach] Delivery pace score ${Math.floor(this.deliveryScore)}; faster safe riding increases payout`)
    }
  }

  private checkTrafficNearMiss(cars: THREE.Object3D[]): void {
    if (!this.bikeMounted) return
    cars.forEach((car) => {
      if (!car.visible) return
      const distance = this.object.position.distanceTo(car.position)
      if (distance < 1.7) {
        this.speed *= 0.25
        console.info('[VoxelBeach] Bike clipped traffic: speed penalty applied')
      } else if (distance < 3.2 && this.speed > 12 && !this.loggedFirstRide) {
        this.loggedFirstRide = true
        this.deliveryScore += 25
        console.info('[VoxelBeach] Near miss bonus: dodged traffic while riding fast')
      }
    })
  }

  private updatePose(): void {
    const movingSpeed = this.direction.lengthSq() > 0 ? this.speed : 0
    this.bike.visible = this.bikeMounted
    updateVoxelWalkCycle(this.rider, this.elapsed, this.bikeMounted ? 0 : movingSpeed)
    if (this.bikeMounted) {
      const lean = THREE.MathUtils.clamp(this.speed / 24, 0, 0.22)
      this.rider.rotation.x = -lean
      this.rider.position.y = 0.35 + Math.abs(Math.sin(this.elapsed * 14)) * 0.025
    } else {
      this.rider.rotation.x = 0
    }
  }

  private isOnRoadOrSidewalk(): boolean {
    const x = Math.round(this.object.position.x)
    const z = Math.round(this.object.position.z)
    return isRoad(x, z) || isSidewalk(x, z)
  }

  private clampToWorld(): void {
    this.object.position.x = THREE.MathUtils.clamp(this.object.position.x, worldBounds.minX + 1, worldBounds.maxX - 1)
    this.object.position.z = THREE.MathUtils.clamp(this.object.position.z, worldBounds.minZ + 1, worldBounds.maxZ - 1)
  }
}

function bindKeyboard(): void {
  if (window.document.body.dataset.playerControlsBound === 'true') return
  window.document.body.dataset.playerControlsBound = 'true'
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase()
    if (!moveKeys.has(key)) return
    keys.add(key)
    event.preventDefault()
  })
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()))
}

function consumeKey(key: string): boolean {
  if (!keys.has(key)) return false
  keys.delete(key)
  return true
}
