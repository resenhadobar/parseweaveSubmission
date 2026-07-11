import * as THREE from 'three'

const animatedLimbNames = ['left-leg', 'right-leg', 'left-arm', 'right-arm']

export function updateVoxelWalkCycle(character: THREE.Object3D, elapsedSeconds: number, speed: number): void {
  const moving = speed > 0.05
  const stride = Math.sin(elapsedSeconds * 9.5) * (moving ? Math.min(0.55, speed * 0.06) : 0)
  const bob = moving ? Math.abs(Math.sin(elapsedSeconds * 9.5)) * 0.045 : 0

  const body = character.getObjectByName('body')
  const head = character.getObjectByName('head')
  if (body) body.position.y = 0.9 + bob
  if (head) head.position.y = 1.42 + bob

  setLimb(character, 'left-leg', stride, bob)
  setLimb(character, 'right-leg', -stride, bob)
  setLimb(character, 'left-arm', -stride * 0.75, bob)
  setLimb(character, 'right-arm', stride * 0.75, bob)
}

export function resetVoxelWalkCycle(character: THREE.Object3D): void {
  animatedLimbNames.forEach((name) => {
    const limb = character.getObjectByName(name)
    if (limb) {
      limb.rotation.x = 0
      limb.position.z = 0
    }
  })
}

function setLimb(character: THREE.Object3D, name: string, swing: number, bob: number): void {
  const limb = character.getObjectByName(name)
  if (!limb) return
  limb.rotation.x = swing
  limb.position.y = baseY(name) + bob * 0.45
  limb.position.z = swing * 0.08
}

function baseY(name: string): number {
  if (name.includes('leg')) return 0.36
  return 0.92
}
