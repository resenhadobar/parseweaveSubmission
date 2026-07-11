import * as THREE from 'three'

type DeliveryParticle = {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  age: number
  lifetime: number
}

const colors = ['#ffef42', '#65d66e', '#ff8a4a', '#ffffff']

export class DeliveryEffects {
  private readonly group = new THREE.Group()
  private readonly particles: DeliveryParticle[] = []

  constructor(world: THREE.Group) {
    this.group.name = 'delivery-completion-particles'
    world.add(this.group)
  }

  burst(position: THREE.Vector3): void {
    for (let i = 0; i < 30; i += 1) {
      const geometry = new THREE.BoxGeometry(0.22, 0.22, 0.22)
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 1,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(position.x, 1.1 + (i % 5) * 0.08, position.z)
      const angle = (i / 30) * Math.PI * 2
      const speed = 3.4 + (i % 7) * 0.24
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        3.8 + (i % 6) * 0.32,
        Math.sin(angle) * speed
      )
      this.group.add(mesh)
      this.particles.push({ mesh, velocity, age: 0, lifetime: 0.85 + (i % 4) * 0.08 })
    }
    console.info('[VoxelBeach] Delivery completion particle burst spawned')
  }

  update(deltaSeconds: number): void {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i]
      particle.age += deltaSeconds
      particle.velocity.y -= 8.5 * deltaSeconds
      particle.mesh.position.addScaledVector(particle.velocity, deltaSeconds)
      particle.mesh.rotation.x += deltaSeconds * 8
      particle.mesh.rotation.y += deltaSeconds * 10
      const alpha = Math.max(0, 1 - particle.age / particle.lifetime)
      ;(particle.mesh.material as THREE.MeshBasicMaterial).opacity = alpha
      if (particle.age >= particle.lifetime) {
        this.group.remove(particle.mesh)
        particle.mesh.geometry.dispose()
        ;(particle.mesh.material as THREE.Material).dispose()
        this.particles.splice(i, 1)
      }
    }
  }
}
