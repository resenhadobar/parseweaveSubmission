import * as THREE from 'three'
import { OrbitCameraController } from './camera/orbitCamera'
import { AssetViewer } from './viewer/assetViewer'
import { createBeachBlockScene } from './voxel/scene'
import { updateOcean } from './voxel/ocean'

export class VoxelBeachApp {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 180)
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true })
  private lastFrameSeconds = performance.now() / 1000
  private readonly beachBlock = createBeachBlockScene()
  private readonly controller: OrbitCameraController
  private readonly viewer: AssetViewer
  private readonly ocean: THREE.Object3D | undefined
  private mode: 'scene' | 'viewer' = 'scene'

  constructor(private readonly mount: HTMLElement) {
    this.scene.background = new THREE.Color('#b7ecff')
    this.scene.fog = new THREE.Fog('#b7ecff', 110, 240)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.mount.replaceChildren(this.renderer.domElement)

    this.addLights()
    this.scene.add(this.beachBlock)
    this.ocean = this.beachBlock.getObjectByName('animated-ocean-shader')
    this.viewer = new AssetViewer(this.scene)
    this.controller = new OrbitCameraController(this.camera, this.renderer.domElement)
    this.controller.setTarget([0, 1.4, 10], 92)
    this.controller.setAngles(-0.18, 0.74)
    this.bindEvents()
    this.resize()
    console.info('[VoxelBeach] App initialized. Press V for asset viewer, B for beach block, [/] to cycle assets.')
  }

  start(): void {
    this.renderer.setAnimationLoop(() => this.render())
  }

  private addLights(): void {
    const sun = new THREE.DirectionalLight('#fff1c7', 3.1)
    sun.position.set(-16, 28, 14)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -90
    sun.shadow.camera.right = 90
    sun.shadow.camera.top = 90
    sun.shadow.camera.bottom = -90
    this.scene.add(sun)
    this.scene.add(new THREE.HemisphereLight('#dff8ff', '#d9a86d', 1.55))
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'v') this.setMode('viewer')
      if (event.key.toLowerCase() === 'b') this.setMode('scene')
      if (event.key === ']' || event.key === 'ArrowRight') this.viewer.next()
      if (event.key === '[' || event.key === 'ArrowLeft') this.viewer.previous()
    })
  }

  private setMode(mode: 'scene' | 'viewer'): void {
    if (this.mode === mode) return
    this.mode = mode
    this.beachBlock.visible = mode === 'scene'
    this.viewer.setVisible(mode === 'viewer')
    if (mode === 'viewer') this.controller.setTarget([0, 1.8, 0], 12)
    else {
      this.controller.setTarget([0, 1.4, 10], 92)
      this.controller.setAngles(-0.18, 0.74)
    }
    document.body.dataset.mode = mode
  }

  private resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private render(): void {
    const now = performance.now() / 1000
    const delta = now - this.lastFrameSeconds
    this.lastFrameSeconds = now
    const elapsed = now
    if (this.ocean) updateOcean(this.ocean, elapsed)
    this.viewer.update(delta)
    this.renderer.render(this.scene, this.camera)
  }
}
