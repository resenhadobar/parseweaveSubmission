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
  readonly skate = createDeliveryBike()
  private readonly direction = new THREE.Vector3()
  private readonly velocity = new THREE.Vector3()
  private skateMode = false
  private speed = 0
  private jumpTimer = 0
  private fallTimer = 0
  private elapsed = 0
  private fallPenaltyQueued = false

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.object.name = 'player-character'
    this.object.position.set(0, 0.12, 4)
    this.rider.name = 'player-rider'
    this.rider.scale.setScalar(1.15)
    this.addBackpack()
    this.skate.position.set(0, 0.02, 0.1)
    this.skate.visible = false
    this.object.add(this.rider, this.skate)
    bindKeyboard()
    console.info('[VoxelBeach] Skater ready: WASD/arrows steer and push, E toggles skate mode, Space kickflips while skating')
  }

  update(deltaSeconds: number, hazards: THREE.Object3D[] = []): void {
    this.elapsed += deltaSeconds
    if (consumeKey('e')) this.setSkateMode(!this.skateMode)
    if (this.skateMode && consumeKey(' ') && this.jumpTimer <= 0 && this.fallTimer <= 0) this.startKickflip()

    this.readMovement(deltaSeconds)
    const previous = this.object.position.clone()
    const desired = previous.clone().add(this.velocity.copy(this.direction).multiplyScalar(this.speed * deltaSeconds))
    const resolved = resolvePlayerCollision(previous, desired, this.skateMode ? 0.62 : 0.42)
    this.object.position.copy(resolved)
    this.clampToWorld()

    if (this.skateMode && this.fallTimer <= 0 && this.jumpTimer <= 0) {
      const hitStatic = desired.distanceTo(resolved) > 0.08 && this.speed > 6
      const hitHazard = hazards.some((hazard) => hazard.visible && hazard.position.distanceTo(this.object.position) < 1.45)
      if (hitStatic || hitHazard) this.startFall()
    }

    this.updatePose(deltaSeconds)
  }

  isBikeMounted(): boolean {
    return this.skateMode
  }

  isSkating(): boolean {
    return this.skateMode && this.fallTimer <= 0
  }

  getSpeed(): number {
    return this.speed
  }

  consumeFallPenalty(): boolean {
    if (!this.fallPenaltyQueued) return false
    this.fallPenaltyQueued = false
    return true
  }

  private setSkateMode(enabled: boolean): void {
    this.skateMode = enabled
    this.skate.visible = enabled
    this.rider.position.set(0, enabled ? 0.28 : 0, 0)
    this.rider.scale.setScalar(enabled ? 0.98 : 1.15)
    this.speed *= enabled ? 0.75 : 0.2
    console.info(`[VoxelBeach] ${enabled ? 'Stepped onto' : 'Stepped off'} delivery skateboard`)
  }

  private startKickflip(): void {
    this.jumpTimer = 0.72
    this.speed += 2.2
    console.info('[VoxelBeach] Kickflip started')
  }

  private startFall(): void {
    this.fallTimer = 1.25
    this.speed = 0
    this.fallPenaltyQueued = true
    console.info('[VoxelBeach] Skater bailed: collision caused a time penalty')
  }

  private readMovement(deltaSeconds: number): void {
    const turn = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
    const push = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
    if (this.fallTimer > 0) {
      this.direction.set(0, 0, 0)
      this.speed = 0
      return
    }

    const turnRate = this.skateMode ? 2.35 : 3.8
    this.object.rotation.y -= turn * turnRate * deltaSeconds
    const forward = new THREE.Vector3(-Math.sin(this.object.rotation.y), 0, -Math.cos(this.object.rotation.y))
    this.direction.copy(forward)

    if (this.skateMode) {
      const surface = this.isOnRoadOrSidewalk() ? 1 : 0.68
      this.speed += push * 18 * surface * deltaSeconds
      this.speed *= Math.pow(push === 0 ? 0.9 : 0.965, deltaSeconds * 8)
      this.speed = THREE.MathUtils.clamp(this.speed, -5, 22 * surface)
    } else {
      this.speed = push === 0 ? 0 : (this.isOnRoadOrSidewalk() ? 7.2 : 5.3) * push
    }
  }

  private updatePose(deltaSeconds: number): void {
    this.skate.visible = this.skateMode
    if (this.fallTimer > 0) {
      this.fallTimer = Math.max(0, this.fallTimer - deltaSeconds)
      this.rider.rotation.set(Math.PI / 2, 0, 0.35)
      this.rider.position.set(0, 0.18, 0.15)
      this.skate.rotation.set(0, this.elapsed * 5, 0.45)
      return
    }

    if (this.skate.rotation.y !== 0 || Math.abs(this.skate.rotation.z) > 0.01) {
      this.skate.rotation.y = THREE.MathUtils.lerp(this.skate.rotation.y, 0, 0.28)
      this.skate.rotation.z = THREE.MathUtils.lerp(this.skate.rotation.z, 0, 0.28)
    }
    const jumpProgress = this.jumpTimer > 0 ? 1 - this.jumpTimer / 0.72 : 1
    if (this.jumpTimer > 0) this.jumpTimer = Math.max(0, this.jumpTimer - deltaSeconds)
    const jumpHeight = this.jumpTimer > 0 ? Math.sin(jumpProgress * Math.PI) * 1.25 : 0
    this.rider.rotation.set(this.skateMode ? -THREE.MathUtils.clamp(Math.abs(this.speed) / 34, 0, 0.2) : 0, 0, 0)
    this.rider.position.y = (this.skateMode ? 0.28 : 0) + jumpHeight + Math.abs(Math.sin(this.elapsed * 13)) * (this.skateMode && Math.abs(this.speed) > 2 ? 0.025 : 0)
    this.skate.position.y = 0.02 + jumpHeight
    this.skate.rotation.z = this.jumpTimer > 0 ? jumpProgress * Math.PI * 2 : THREE.MathUtils.lerp(this.skate.rotation.z, 0, 0.2)
    updateVoxelWalkCycle(this.rider, this.elapsed, this.skateMode ? 0 : Math.abs(this.speed))
  }

  private addBackpack(): void {
    const material = new THREE.MeshStandardMaterial({ color: '#d6aa55', roughness: 0.75 })
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.16), material)
    bag.name = 'yellow-delivery-backpack'
    bag.position.set(0, 0.92, 0.24)
    bag.castShadow = true
    bag.receiveShadow = true
    this.rider.add(bag)
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
