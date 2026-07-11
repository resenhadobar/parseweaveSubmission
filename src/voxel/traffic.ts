import * as THREE from 'three'
import { createCar, createVoxelPerson } from './assets'
import type { PaletteKey } from './materials'

type RoutePoint = [number, number]
type MovingActor = {
  id: number
  object: THREE.Object3D
  route: RoutePoint[]
  speed: number
  distance: number
  height: number
  lookAhead: number
  recycleGap: number
  rotationMode: 'car' | 'person'
}

type CarSpec = { color: PaletteKey; route: RoutePoint[]; delay: number; speed: number }
type PersonSpec = { shirt: PaletteKey; route: RoutePoint[]; offset: number; speed: number }

const intersections: RoutePoint[] = [-36, 0, 36].flatMap((x) => [-8, 11.5, 30.5].map((z) => [x, z] as RoutePoint))

const carRoutes: RoutePoint[][] = [
  [[-61.5, -8.72], [61.5, -8.72]],
  [[61.5, -7.28], [-61.5, -7.28]],
  [[-61.5, 10.78], [61.5, 10.78]],
  [[61.5, 12.22], [-61.5, 12.22]],
  [[-61.5, 29.78], [61.5, 29.78]],
  [[-36.72, 51.5], [-36.72, -8.72], [-61.5, -8.72]],
  [[-61.5, 12.22], [-35.28, 12.22], [-35.28, 51.5]],
  [[-0.72, 51.5], [-0.72, 29.78], [61.5, 29.78]],
  [[61.5, 10.78], [35.28, 10.78], [35.28, 51.5]],
  [[0.72, 51.5], [0.72, -7.28], [61.5, -7.28]],
]

const pedestrianRoutes: RoutePoint[][] = [
  [[-58, -12.6], [-40, -12.6], [-40, 7.4], [-58, 7.4]],
  [[-32, -12.6], [-5, -12.6], [-5, 7.4], [-32, 7.4]],
  [[5, -12.6], [32, -12.6], [32, 7.4], [5, 7.4]],
  [[40, -12.6], [58, -12.6], [58, 7.4], [40, 7.4]],
  [[-32, 15.6], [-5, 15.6], [-5, 26.9], [-32, 26.9]],
  [[5, 15.6], [32, 15.6], [32, 26.9], [5, 26.9]],
  [[-4.6, -12.2], [-4.6, 49], [-6.4, 49], [-6.4, -12.2]],
  [[4.6, -12.2], [4.6, 49], [6.4, 49], [6.4, -12.2]],
]

const cars: CarSpec[] = [
  { color: 'teal', route: carRoutes[0], delay: 0, speed: 6.4 },
  { color: 'yellow', route: carRoutes[1], delay: 22, speed: 6.1 },
  { color: 'blue', route: carRoutes[2], delay: 7, speed: 5.8 },
  { color: 'red', route: carRoutes[3], delay: 28, speed: 5.7 },
  { color: 'orange', route: carRoutes[4], delay: 15, speed: 6 },
  { color: 'teal', route: carRoutes[5], delay: 4, speed: 5.5 },
  { color: 'blue', route: carRoutes[6], delay: 26, speed: 5.2 },
  { color: 'yellow', route: carRoutes[7], delay: 10, speed: 5.4 },
  { color: 'red', route: carRoutes[8], delay: 34, speed: 5.1 },
  { color: 'orange', route: carRoutes[9], delay: 18, speed: 5.3 },
]

const walkers: PersonSpec[] = [
  { shirt: 'teal', route: pedestrianRoutes[0], offset: 0, speed: 1.15 },
  { shirt: 'pink', route: pedestrianRoutes[1], offset: 16, speed: 1.05 },
  { shirt: 'green', route: pedestrianRoutes[2], offset: 7, speed: 0.95 },
  { shirt: 'yellow', route: pedestrianRoutes[3], offset: 2, speed: 1.1 },
  { shirt: 'blue', route: pedestrianRoutes[4], offset: 10, speed: 1 },
  { shirt: 'coral', route: pedestrianRoutes[5], offset: 16, speed: 0.9 },
  { shirt: 'teal', route: pedestrianRoutes[6], offset: 24, speed: 1.05 },
  { shirt: 'yellow', route: pedestrianRoutes[7], offset: 48, speed: 1 },
]

export class TrafficController {
  private readonly actors: MovingActor[] = []
  private readonly carActors: MovingActor[] = []

  constructor(world: THREE.Group) {
    cars.forEach((spec, index) => this.addCar(world, spec, index))
    walkers.forEach((spec, index) => this.addWalker(world, spec, cars.length + index))
    console.info(`[VoxelBeach] Traffic active: ${cars.length} cars yielding at intersections and ${walkers.length} sidewalk pedestrians`)
  }

  update(deltaSeconds: number): void {
    const delta = Math.min(deltaSeconds, 0.05)
    this.actors.forEach((actor) => {
      const nextDistance = actor.distance + actor.speed * delta
      if (actor.rotationMode !== 'car' || !shouldYield(actor, nextDistance, this.carActors)) actor.distance = nextDistance
      updateActor(actor)
    })
  }

  private addCar(world: THREE.Group, spec: CarSpec, id: number): void {
    const car = createCar(spec.color)
    car.name = 'moving-car'
    world.add(car)
    const actor = createActor(id, car, spec.route, spec.speed, -spec.delay, 0.24, 0.9, 18, 'car')
    this.actors.push(actor)
    this.carActors.push(actor)
    updateActor(actor)
  }

  private addWalker(world: THREE.Group, spec: PersonSpec, id: number): void {
    const person = createVoxelPerson(spec.shirt)
    person.name = 'walking-person'
    world.add(person)
    const actor = createActor(id, person, spec.route, spec.speed, spec.offset, 0.1, 0.25, 0, 'person')
    this.actors.push(actor)
    updateActor(actor)
  }
}

function createActor(id: number, object: THREE.Object3D, route: RoutePoint[], speed: number, distance: number, height: number, lookAhead: number, recycleGap: number, rotationMode: 'car' | 'person'): MovingActor {
  return { id, object, route, speed, distance, height, lookAhead, recycleGap, rotationMode }
}

function shouldYield(actor: MovingActor, nextDistance: number, carsInOrder: MovingActor[]): boolean {
  const point = nearestIntersection(sampleRoute(actor.route, Math.max(0, nextDistance)))
  if (!point) return false

  return carsInOrder.some((other) => {
    if (other === actor || !other.object.visible) return false
    const otherPoint = nearestIntersection([other.object.position.x, other.object.position.z])
    if (!otherPoint || otherPoint[0] !== point[0] || otherPoint[1] !== point[1]) return false
    if (actor.id < other.id && distance2d(actor.object.position, other.object.position) > 2.4) return false
    return distance2d(actor.object.position, other.object.position) < 6.2
  })
}

function nearestIntersection(point: RoutePoint): RoutePoint | undefined {
  return intersections.find(([x, z]) => Math.abs(point[0] - x) < 3.4 && Math.abs(point[1] - z) < 3.4)
}

function distance2d(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

function updateActor(actor: MovingActor): void {
  const length = routeLength(actor.route)
  if (actor.distance < 0 || actor.distance > length) {
    actor.object.visible = false
    if (actor.distance > length + actor.recycleGap) actor.distance = -actor.recycleGap
    return
  }
  actor.object.visible = true
  placeOnRoute(actor, actor.distance)
}

function placeOnRoute(actor: MovingActor, distance: number): void {
  const current = sampleRoute(actor.route, distance)
  const next = sampleRoute(actor.route, Math.min(distance + actor.lookAhead, routeLength(actor.route)))
  const dx = next[0] - current[0]
  const dz = next[1] - current[1]
  actor.object.position.set(current[0], actor.height, current[1])
  actor.object.rotation.y = actor.rotationMode === 'car' ? -Math.atan2(dz, dx) : Math.atan2(dx, dz)
}

function sampleRoute(route: RoutePoint[], distance: number): RoutePoint {
  let remaining = Math.max(0, Math.min(distance, routeLength(route)))
  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i]
    const b = route[i + 1]
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    remaining -= segment
  }
  return route[route.length - 1]
}

function routeLength(route: RoutePoint[]): number {
  let length = 0
  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i]
    const b = route[i + 1]
    length += Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  return length
}
