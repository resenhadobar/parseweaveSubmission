import * as THREE from 'three'
import { createViewerAssets, type VoxelAsset } from '../voxel/viewerAssets'

export class AssetViewer {
  private readonly assets: VoxelAsset[] = createViewerAssets()
  private readonly root = new THREE.Group()
  private activeIndex = 0
  private active?: THREE.Group

  constructor(private readonly scene: THREE.Scene) {
    this.root.name = 'individual-asset-viewer-root'
    this.root.visible = false
    this.scene.add(this.root)
    this.showAsset(0)
  }

  get labels(): string[] {
    return this.assets.map((asset, index) => `${index + 1}. ${asset.label}`)
  }

  get activeLabel(): string {
    return this.assets[this.activeIndex]?.label ?? 'Unknown Asset'
  }

  setVisible(visible: boolean): void {
    this.root.visible = visible
    console.info(`[VoxelBeach] Asset viewer ${visible ? 'opened' : 'closed'}: ${this.activeLabel}`)
  }

  next(): void {
    this.showAsset((this.activeIndex + 1) % this.assets.length)
  }

  previous(): void {
    this.showAsset((this.activeIndex - 1 + this.assets.length) % this.assets.length)
  }

  showAsset(index: number): void {
    this.activeIndex = THREE.MathUtils.euclideanModulo(index, this.assets.length)
    if (this.active) this.root.remove(this.active)
    this.active = this.assets[this.activeIndex].create()
    this.active.position.set(0, 1.4, 0)
    this.root.add(this.active)
    console.info(`[VoxelBeach] Inspecting asset: ${this.activeLabel}`)
  }

  update(delta: number): void {
    if (!this.root.visible || !this.active) return
    this.active.rotation.y += delta * 0.55
  }
}
