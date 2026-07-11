import * as THREE from 'three'

export class OrbitCameraController {
  private readonly target = new THREE.Vector3(0, 1.5, 0)
  private distance = 34
  private yaw = -0.65
  private pitch = 0.82
  private isDragging = false
  private lastX = 0
  private lastY = 0

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.bindEvents()
    this.update()
  }

  setTarget(target: THREE.Vector3Tuple, distance = this.distance): void {
    this.target.set(...target)
    this.distance = distance
    this.update()
  }

  followTarget(target: THREE.Vector3Tuple): void {
    this.target.set(...target)
    this.update()
  }

  setAngles(yaw: number, pitch: number): void {
    this.yaw = yaw
    this.pitch = pitch
    this.update()
  }

  update(): void {
    this.pitch = THREE.MathUtils.clamp(this.pitch, 0.18, 1.42)
    this.distance = THREE.MathUtils.clamp(this.distance, 5, 140)
    const radiusXZ = Math.cos(this.pitch) * this.distance
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * radiusXZ,
      this.target.y + Math.sin(this.pitch) * this.distance,
      this.target.z + Math.cos(this.yaw) * radiusXZ,
    )
    this.camera.lookAt(this.target)
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
      this.pitch -= dy * 0.006
      this.update()
    })

    this.canvas.addEventListener('pointerup', (event) => {
      this.isDragging = false
      this.canvas.releasePointerCapture(event.pointerId)
    })

    this.canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault()
        this.distance += event.deltaY * 0.025
        this.update()
      },
      { passive: false },
    )
  }
}
