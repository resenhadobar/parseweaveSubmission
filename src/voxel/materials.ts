import * as THREE from 'three'

export type PaletteKey =
  | 'sand'
  | 'sandDark'
  | 'road'
  | 'sidewalk'
  | 'white'
  | 'cream'
  | 'coral'
  | 'teal'
  | 'blue'
  | 'navy'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'green'
  | 'leaf'
  | 'palm'
  | 'trunk'
  | 'wood'
  | 'glass'
  | 'darkGlass'
  | 'black'
  | 'gray'
  | 'rock'
  | 'earth'
  | 'snow'
  | 'metal'
  | 'skin'
  | 'pink'

const colors: Record<PaletteKey, string> = {
  sand: '#e8c889',
  sandDark: '#c99f62',
  road: '#2f343a',
  sidewalk: '#c8c2b8',
  white: '#f2eadc',
  cream: '#d8c09a',
  coral: '#c76f5d',
  teal: '#4f9a94',
  blue: '#4f7899',
  navy: '#2f5368',
  yellow: '#d6aa55',
  orange: '#c7833d',
  red: '#a94f44',
  green: '#4f8b58',
  leaf: '#36794a',
  palm: '#3f8f5a',
  trunk: '#7b5638',
  wood: '#9a6a3e',
  glass: '#7fb1c5',
  darkGlass: '#263f4d',
  black: '#17191d',
  gray: '#7e8588',
  rock: '#5f696d',
  earth: '#6f5137',
  snow: '#e6eef2',
  metal: '#a9b0b2',
  skin: '#bf8568',
  pink: '#c9858d',
}

export const palette = colors

const cache = new Map<string, THREE.MeshStandardMaterial>()

export function mat(
  key: PaletteKey,
  roughness = 0.72,
  metalness = 0.02
): THREE.MeshStandardMaterial {
  const id = `${key}:${roughness}:${metalness}`
  const cached = cache.get(id)
  if (cached) return cached

  const material = new THREE.MeshStandardMaterial({
    color: colors[key],
    roughness,
    metalness,
  })
  cache.set(id, material)
  return material
}

export function emissiveMat(key: PaletteKey, strength = 0.35): THREE.MeshStandardMaterial {
  const id = `emissive:${key}:${strength}`
  const cached = cache.get(id)
  if (cached) return cached

  const material = new THREE.MeshStandardMaterial({
    color: colors[key],
    emissive: new THREE.Color(colors[key]),
    emissiveIntensity: strength,
    roughness: 0.45,
  })
  cache.set(id, material)
  return material
}
