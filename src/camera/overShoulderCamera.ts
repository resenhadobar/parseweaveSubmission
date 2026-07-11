import * as THREE from 'three'

export class OverShoulderCameraController {
  private yaw = Math.PI
  private pitch = -0.2
  private isDragging = false
  private lastX = 0
  private lastY = 0
  private readonly target = new THREE.Vector3()
  private readonly desired = new THREE.Vector3()

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.bindEvents()
  }

  update(focus: THREE.Object3D, deltaSeconds: number, mounted: boolean): void {
    const distance = mounted ? 8.5 : 6.2
    const height = mounted ? 3.2 : 2.6
    this.target.copy(focus.position).add(new THREE.Vector3(0, mounted ? 1.25 : 1.45, 0))
    const behind = new THREE.Vector3(Math.sin(this.yaw) * distance, height, Math.cos(this.yaw) * distance)
    this.desired.copy(this.target).add(behind)
    this.camera.position.lerp(this.desired, 1 - Math.pow(0.001, deltaSeconds))
    const lookTarget = this.target.clone().add(new THREE.Vector3(0, this.pitch * 3, 0))
    this.camera.lookAt(lookTarget)
  }

  getYaw(): number {
    return this.yaw
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.isDragging = true
      this.lastX = event.clientX
      this.lastY = event.clientY
      this.canvas.setPointerCapture(event.pointerId)
    })

    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.isDragging) return
      const dx = event.clientX - this.lastX
      const dy = event.clientY - this.lastY
      this.lastX = event.clientX
      this.lastY = event.clientY
      this.yaw -= dx * 0.006
      this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.003, -0.55, 0.25)
    })

    this.canvas.addEventListener('pointerup', (event) => {
      this.isDragging = false
      this.canvas.releasePointerCapture(event.pointerId)
    })

    this.canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault()
        this.pitch = THREE.MathUtils.clamp(this.pitch + event.deltaY * 0.0008, -0.55, 0.25)
      },
      { passive: false },
    )
  }
}
