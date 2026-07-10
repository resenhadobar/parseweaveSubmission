import * as THREE from 'three/webgpu'
import './styles.css'

const mount = document.getElementById('app')
if (!mount) {
  throw new Error('Missing #app mount node')
}

const scene = new THREE.Scene()
scene.background = new THREE.Color('#020617')

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 3

const renderer = new THREE.WebGPURenderer({ antialias: true })
await renderer.init()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
mount.replaceChildren(renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshNormalMaterial()
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function resize(): void {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', resize)

function animate(): void {
  cube.rotation.x += 0.002
  cube.rotation.y += 0.003
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
