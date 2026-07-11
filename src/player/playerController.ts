import * as THREE from 'three'
import { createVoxelPerson } from '../voxel/assets'
import { isRoad, isSidewalk, worldBounds } from '../voxel/layout'
import { updateVoxelWalkCycle } from '../voxel/characterAnimation'
import { resolvePlayerCollision } from './collisions'

const keys = new Set<string>()
const moveKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

export class PlayerController {
  readonly object = createVoxelPerson('blue')
  private readonly direction = new THREE.Vector3()
  private readonly velocity = new THREE.Vector3()
  private elapsed = 0
  private loggedFirstMove = false

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.object.name = 'player-character'
    this.object.position.set(0, 0.12, 4)
    this.object.scale.setScalar(1.15)
    bindKeyboard()
    console.info('[VoxelBeach] Player ready: WASD or arrow keys walk isometrically around the beach block')
  }

  update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds
    this.readInputDirection()
    const speed = this.isOnRoadOrSidewalk() ? 8.6 : 6.2
    this.velocity.copy(this.direction).multiplyScalar(speed * deltaSeconds)
    const desired = this.object.position.clone().add(this.velocity)
    this.object.position.copy(resolvePlayerCollision(this.object.position, desired))
    this.clampToWorld()

    const movingSpeed = this.direction.lengthSq() > 0 ? speed : 0
    if (movingSpeed > 0) {
      this.object.rotation.y = Math.atan2(this.direction.x, this.direction.z)
      if (!this.loggedFirstMove) {
        this.loggedFirstMove = true
        console.info('[VoxelBeach] Player movement detected; camera now follows the controllable voxel character')
      }
    }
    updateVoxelWalkCycle(this.object, this.elapsed, movingSpeed)
  }

  private readInputDirection(): void {
    const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
    const z = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
    this.direction.set(x + z, 0, z - x)
    if (this.direction.lengthSq() > 0) this.direction.normalize()
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
