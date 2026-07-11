import * as THREE from 'three'
import { createCar, createVoxelPerson } from './assets'
import type { PaletteKey } from './materials'

type RoutePoint = [number, number]
type MovingActor = {
  object: THREE.Object3D
  route: RoutePoint[]
  speed: number
  distance: number
  height: number
  lookAhead: number
}

type CarSpec = { color: PaletteKey; route: RoutePoint[]; offset: number; speed: number }
type PersonSpec = { shirt: PaletteKey; route: RoutePoint[]; offset: number; speed: number }

const carRoutes: RoutePoint[][] = [
  [[-55, -9.15], [-8, -9.15], [-8, 10.65], [34.7, 10.65], [34.7, 29.65], [-55, 29.65]],
  [[55, -6.85], [7, -6.85], [7, 12.35], [-34.7, 12.35], [-34.7, 31.35], [55, 31.35]],
  [[-36.9, 46], [-36.9, 14.8], [-4.7, 14.8], [-4.7, -8.7], [-56, -8.7], [-56, 46]],
  [[36.9, -8.7], [36.9, 27.2], [4.7, 27.2], [4.7, 11.8], [56, 11.8], [56, -8.7]],
]

const pedestrianRoutes: RoutePoint[][] = [
  [[-54, -12.4], [-12, -12.4], [-12, 7.2], [-54, 7.2]],
  [[-30, 7.1], [-6, 7.1], [-6, 15.7], [-30, 15.7]],
  [[8, 7.2], [31, 7.2], [31, 15.7], [8, 15.7]],
  [[40, -12.4], [56, -12.4], [56, 7.2], [40, 7.2]],
  [[-52, 34.7], [-14, 34.7], [-14, 27.1], [-52, 27.1]],
  [[11, 34.7], [53, 34.7], [53, 27.1], [11, 27.1]],
]

const cars: CarSpec[] = [
  { color: 'teal', route: carRoutes[0], offset: 0, speed: 5.4 },
  { color: 'yellow', route: carRoutes[0], offset: 48, speed: 5.4 },
  { color: 'blue', route: carRoutes[1], offset: 12, speed: 5.1 },
  { color: 'red', route: carRoutes[1], offset: 62, speed: 5.1 },
  { color: 'orange', route: carRoutes[2], offset: 20, speed: 4.7 },
  { color: 'teal', route: carRoutes[3], offset: 38, speed: 4.9 },
]

const walkers: PersonSpec[] = [
  { shirt: 'teal', route: pedestrianRoutes[0], offset: 0, speed: 1.15 },
  { shirt: 'pink', route: pedestrianRoutes[0], offset: 19, speed: 1.05 },
  { shirt: 'green', route: pedestrianRoutes[1], offset: 7, speed: 0.95 },
  { shirt: 'yellow', route: pedestrianRoutes[2], offset: 2, speed: 1.1 },
  { shirt: 'blue', route: pedestrianRoutes[3], offset: 10, speed: 1 },
  { shirt: 'coral', route: pedestrianRoutes[4], offset: 16, speed: 0.9 },
  { shirt: 'teal', route: pedestrianRoutes[5], offset: 24, speed: 1.05 },
]

export class TrafficController {
  private readonly actors: MovingActor[] = []

  constructor(world: THREE.Group) {
    cars.forEach((spec) => this.addCar(world, spec))
    walkers.forEach((spec) => this.addWalker(world, spec))
    console.info(`[VoxelBeach] Traffic active: ${cars.length} cars on separated lanes and ${walkers.length} pedestrians on sidewalk loops`)
  }

  update(deltaSeconds: number): void {
    const delta = Math.min(deltaSeconds, 0.05)
    this.actors.forEach((actor) => {
      actor.distance = wrapDistance(actor.route, actor.distance + actor.speed * delta)
      placeOnRoute(actor, actor.distance)
    })
  }

  private addCar(world: THREE.Group, spec: CarSpec): void {
    const car = createCar(spec.color)
    car.name = 'moving-car'
    world.add(car)
    const actor = { object: car, route: spec.route, speed: spec.speed, distance: spec.offset, height: 0.24, lookAhead: 0.9 }
    this.actors.push(actor)
    placeOnRoute(actor, spec.offset)
  }

  private addWalker(world: THREE.Group, spec: PersonSpec): void {
    const person = createVoxelPerson(spec.shirt)
    person.name = 'walking-person'
    world.add(person)
    const actor = { object: person, route: spec.route, speed: spec.speed, distance: spec.offset, height: 0.1, lookAhead: 0.25 }
    this.actors.push(actor)
    placeOnRoute(actor, spec.offset)
  }
}

function placeOnRoute(actor: MovingActor, distance: number): void {
  const current = sampleRoute(actor.route, distance)
  const next = sampleRoute(actor.route, distance + actor.lookAhead)
  actor.object.position.set(current[0], actor.height, current[1])
  actor.object.rotation.y = Math.atan2(next[0] - current[0], next[1] - current[1])
}

function sampleRoute(route: RoutePoint[], distance: number): RoutePoint {
  let remaining = wrapDistance(route, distance)
  for (let i = 0; i < route.length; i += 1) {
    const a = route[i]
    const b = route[(i + 1) % route.length]
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    remaining -= segment
  }
  return route[0]
}

function wrapDistance(route: RoutePoint[], distance: number): number {
  const length = routeLength(route)
  return ((distance % length) + length) % length
}

function routeLength(route: RoutePoint[]): number {
  let length = 0
  for (let i = 0; i < route.length; i += 1) {
    const a = route[i]
    const b = route[(i + 1) % route.length]
    length += Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  return length
}
