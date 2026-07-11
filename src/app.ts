import * as THREE from 'three'
import { AssetViewer } from './viewer/assetViewer'
import { createBeachBlockScene } from './voxel/scene'
import { updateOcean } from './voxel/ocean'
import { TrafficController } from './voxel/traffic'
import { PlayerController } from './player/playerController'
import { VisibilityCullingController } from './render/visibilityCulling'
import { OverShoulderCameraController } from './camera/overShoulderCamera'
import { DeliveryController } from './delivery/deliveryController'

export class VoxelBeachApp {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 180)
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true })
  private lastFrameSeconds = performance.now() / 1000
  private readonly beachBlock = createBeachBlockScene()
  private readonly cameraController: OverShoulderCameraController
  private readonly viewer: AssetViewer
  private readonly ocean: THREE.Object3D | undefined
  private readonly traffic: TrafficController
  private readonly player: PlayerController
  private readonly delivery: DeliveryController
  private readonly culling: VisibilityCullingController
  private mode: 'scene' | 'viewer' = 'scene'

  constructor(private readonly mount: HTMLElement) {
    this.scene.background = new THREE.Color('#b7ecff')
    this.scene.fog = new THREE.Fog('#b7ecff', 110, 240)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.mount.replaceChildren(this.renderer.domElement)

    this.addLights()
    this.scene.add(this.beachBlock)
    this.ocean = this.beachBlock.getObjectByName('animated-ocean-shader')
    this.traffic = new TrafficController(this.beachBlock)
    this.player = new PlayerController(this.camera)
    this.beachBlock.add(this.player.object)
    this.delivery = new DeliveryController(this.beachBlock)
    this.culling = new VisibilityCullingController(this.beachBlock)
    this.viewer = new AssetViewer(this.scene)
    this.cameraController = new OverShoulderCameraController(this.camera, this.renderer.domElement)
    this.bindEvents()
    this.resize()
    console.info('[VoxelBeach] Skate delivery game initialized. WASD/arrows steer and push, E toggles skate mode, Space kickflips, stop at green arrows to start deliveries.')
  }

  start(): void {
    this.renderer.setAnimationLoop(() => this.render())
  }

  private addLights(): void {
    const sun = new THREE.DirectionalLight('#fff1c7', 3.1)
    sun.position.set(-16, 28, 14)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
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
      if (this.mode === 'viewer' && (event.key === ']' || event.key === 'ArrowRight')) this.viewer.next()
      if (this.mode === 'viewer' && (event.key === '[' || event.key === 'ArrowLeft')) this.viewer.previous()
    })
  }

  private setMode(mode: 'scene' | 'viewer'): void {
    if (this.mode === mode) return
    this.mode = mode
    this.beachBlock.visible = mode === 'scene'
    this.viewer.setVisible(mode === 'viewer')
    if (mode === 'viewer') {
      this.camera.position.set(0, 6, 12)
      this.camera.lookAt(0, 1.6, 0)
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
    if (this.mode === 'scene') {
      this.traffic.update(delta)
      this.player.update(delta, [...this.traffic.getCarObjects(), ...this.traffic.getPedestrianObjects()])
      if (this.player.consumeFallPenalty()) this.delivery.applyFallPenalty()
      this.delivery.update(delta, this.player.object, this.player.isSkating(), this.player.getSpeed())
      this.cameraController.update(this.player.object, delta, this.player.isBikeMounted())
      this.culling.update(this.camera, delta)
    }
    this.viewer.update(delta)
    this.renderer.render(this.scene, this.camera)
  }
}
