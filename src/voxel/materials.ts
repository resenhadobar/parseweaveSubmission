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
  sand: '#f1cf8b',
  sandDark: '#d4a75d',
  road: '#333846',
  sidewalk: '#cdd4dc',
  white: '#fff5df',
  cream: '#ffe6b3',
  coral: '#ff8b78',
  teal: '#34c8bd',
  blue: '#4ba3ff',
  navy: '#20537a',
  yellow: '#ffd561',
  orange: '#ff9f43',
  red: '#e84b57',
  green: '#4daf68',
  leaf: '#2fbf71',
  palm: '#33d17a',
  trunk: '#9c653e',
  wood: '#b77a45',
  glass: '#88d7ff',
  darkGlass: '#315b75',
  black: '#15171d',
  gray: '#8f98a3',
  rock: '#65707a',
  earth: '#7b5a3a',
  snow: '#eef6ff',
  metal: '#bcc6cf',
  skin: '#d99b72',
  pink: '#ff94c2',
}

export const palette = colors

const cache = new Map<string, THREE.MeshStandardMaterial>()

export function mat(key: PaletteKey, roughness = 0.72, metalness = 0.02): THREE.MeshStandardMaterial {
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
