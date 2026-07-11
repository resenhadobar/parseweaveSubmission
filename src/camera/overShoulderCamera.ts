import * as THREE from 'three'

export class OverShoulderCameraController {
  private yaw = 0
  private readonly target = new THREE.Vector3()
  private readonly desired = new THREE.Vector3()

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    _canvas: HTMLCanvasElement,
  ) {}

  update(focus: THREE.Object3D, deltaSeconds: number, mounted: boolean): void {
    const distance = mounted ? 8.5 : 6.2
    const height = mounted ? 3.2 : 2.6
    this.yaw = lerpAngle(this.yaw, focus.rotation.y, 1 - Math.pow(0.0008, deltaSeconds))
    this.target.copy(focus.position).add(new THREE.Vector3(0, mounted ? 1.25 : 1.45, 0))
    const behind = new THREE.Vector3(Math.sin(this.yaw) * distance, height, Math.cos(this.yaw) * distance)
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw))
    this.desired.copy(this.target).add(behind)
    this.camera.position.lerp(this.desired, 1 - Math.pow(0.001, deltaSeconds))
    const lookTarget = this.target.clone().add(forward.multiplyScalar(mounted ? 9 : 6)).add(new THREE.Vector3(0, 0.35, 0))
    this.camera.lookAt(lookTarget)
  }
}

function lerpAngle(from: number, to: number, alpha: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * alpha
}
