import * as THREE from 'three'
import { createCar, createVoxelPerson } from './assets'
import { updateVoxelWalkCycle } from './characterAnimation'
import type { PaletteKey } from './materials'

type RoutePoint = [number, number]
type Actor = {
  object: THREE.Object3D
  route: RoutePoint[]
  speed: number
  distance: number
  length: number
  height: number
  lookAhead: number
  kind: 'car' | 'person'
  phaseOffset: number
}

type CarSpec = { color: PaletteKey; route: RoutePoint[]; delay: number; speed: number }
type PersonSpec = { shirt: PaletteKey; route: RoutePoint[]; offset: number; speed: number }

const signalCycle = 8
const carRoutes: RoutePoint[][] = [
  [[-61.5, -8.72], [-36, -8.72], [0, -8.72], [36, -8.72], [61.5, -8.72]],
  [[61.5, 12.22], [36, 12.22], [0, 12.22], [-36, 12.22], [-61.5, 12.22]],
  [[-36.72, 51.5], [-36.72, 30.5], [-36.72, 11.5], [-36.72, -8], [-61.5, -8]],
  [[0.72, 51.5], [0.72, 30.5], [0.72, 11.5], [0.72, -7.28], [61.5, -7.28]],
]

const pedestrianRoutes: RoutePoint[][] = [
  [[-58, -12.6], [-40, -12.6], [-40, 7.4], [-58, 7.4]],
  [[-32, -12.6], [-5, -12.6], [-5, 7.4], [-32, 7.4]],
  [[5, -12.6], [32, -12.6], [32, 7.4], [5, 7.4]],
  [[40, -12.6], [58, -12.6], [58, 7.4], [40, 7.4]],
  [[-4.6, -12.2], [-4.6, 49], [-6.4, 49], [-6.4, -12.2]],
  [[4.6, -12.2], [4.6, 49], [6.4, 49], [6.4, -12.2]],
]

const cars: CarSpec[] = [
  { color: 'teal', route: carRoutes[0], delay: 0, speed: 6.2 },
  { color: 'yellow', route: carRoutes[1], delay: 18, speed: 5.9 },
  { color: 'blue', route: carRoutes[2], delay: 8, speed: 5.4 },
  { color: 'red', route: carRoutes[3], delay: 24, speed: 5.2 },
]

const walkers: PersonSpec[] = [
  { shirt: 'teal', route: pedestrianRoutes[0], offset: 0, speed: 1.15 },
  { shirt: 'pink', route: pedestrianRoutes[1], offset: 16, speed: 1.05 },
  { shirt: 'green', route: pedestrianRoutes[2], offset: 7, speed: 0.95 },
  { shirt: 'yellow', route: pedestrianRoutes[3], offset: 2, speed: 1.1 },
  { shirt: 'blue', route: pedestrianRoutes[4], offset: 10, speed: 1 },
  { shirt: 'coral', route: pedestrianRoutes[5], offset: 16, speed: 0.9 },
]

export class TrafficController {
  private readonly actors: Actor[] = []
  private readonly cars: Actor[] = []
  private elapsed = 0

  constructor(world: THREE.Group) {
    cars.forEach((spec) => this.addCar(world, spec))
    walkers.forEach((spec) => this.addWalker(world, spec))
    console.info(`[VoxelBeach] Traffic active: ${cars.length} signal-timed cars and ${walkers.length} animated pedestrians; cars recycle instead of jamming`)
  }

  update(deltaSeconds: number): void {
    const delta = Math.min(deltaSeconds, 0.05)
    this.elapsed += delta
    this.actors.forEach((actor) => {
      const movingSpeed = this.canMove(actor) ? actor.speed : 0
      actor.distance += movingSpeed * delta
      if (actor.distance > actor.length + 20) actor.distance = -actor.phaseOffset
      updateActor(actor)
      if (actor.kind === 'person') updateVoxelWalkCycle(actor.object, this.elapsed + actor.phaseOffset, movingSpeed)
    })
  }

  private canMove(actor: Actor): boolean {
    if (actor.kind !== 'car' || actor.distance < 0 || actor.distance > actor.length) return true
    if (!greenForActor(actor)) return false
    return !this.cars.some((other) => other !== actor && other.object.visible && aheadDistance(actor, other) > 0 && aheadDistance(actor, other) < 7)
  }

  private addCar(world: THREE.Group, spec: CarSpec): void {
    const car = createCar(spec.color)
    car.name = 'moving-car'
    world.add(car)
    const actor = makeActor(car, spec.route, spec.speed, -spec.delay, 0.24, 0.9, 'car', spec.delay)
    this.actors.push(actor)
    this.cars.push(actor)
    updateActor(actor)
  }

  private addWalker(world: THREE.Group, spec: PersonSpec): void {
    const person = createVoxelPerson(spec.shirt)
    person.name = 'walking-person'
    world.add(person)
    const actor = makeActor(person, spec.route, spec.speed, spec.offset, 0.1, 0.25, 'person', spec.offset)
    this.actors.push(actor)
    updateActor(actor)
  }
}

function greenForActor(actor: Actor): boolean {
  const position = sampleRoute(actor.route, actor.distance)
  const nearIntersection = [-36, 0, 36].some((x) => Math.abs(position[0] - x) < 3.5) && [-8, 11.5, 30.5].some((z) => Math.abs(position[1] - z) < 3.5)
  if (!nearIntersection) return true
  const movingMostlyHorizontal = Math.abs(Math.cos(actor.object.rotation.y)) > 0.45
  const cycle = (performance.now() / 1000) % signalCycle
  return movingMostlyHorizontal ? cycle < signalCycle * 0.55 : cycle >= signalCycle * 0.45
}

function aheadDistance(actor: Actor, other: Actor): number {
  if (actor.route !== other.route) return Infinity
  return other.distance - actor.distance
}

function makeActor(object: THREE.Object3D, route: RoutePoint[], speed: number, distance: number, height: number, lookAhead: number, kind: 'car' | 'person', phaseOffset: number): Actor {
  return { object, route, speed, distance, length: routeLength(route), height, lookAhead, kind, phaseOffset }
}

function updateActor(actor: Actor): void {
  if (actor.distance < 0 || actor.distance > actor.length) {
    actor.object.visible = false
    return
  }
  actor.object.visible = true
  const current = sampleRoute(actor.route, actor.distance)
  const next = sampleRoute(actor.route, Math.min(actor.distance + actor.lookAhead, actor.length))
  actor.object.position.set(current[0], actor.height, current[1])
  const dx = next[0] - current[0]
  const dz = next[1] - current[1]
  actor.object.rotation.y = actor.kind === 'car' ? -Math.atan2(dz, dx) : Math.atan2(dx, dz)
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
