import { centerGroup } from './blocks'
import {
  createBeachHouse,
  createBeachUmbrella,
  createCar,
  createLifeguardTower,
  createPalmTree,
  createSurfShop,
  createTropicalTree,
  createVoxelPerson,
  type VoxelAsset,
} from './assets'

export function createViewerAssets(): VoxelAsset[] {
  return [
    {
      label: 'Layered Beach House',
      create: () =>
        centerGroup(createBeachHouse({ id: 'viewer-layered-house', body: 'coral', roof: 'navy' })),
    },
    { label: 'Surf Shop', create: () => centerGroup(createSurfShop()) },
    { label: 'Palm Tree Variant', create: () => centerGroup(createPalmTree(2)) },
    { label: 'Tropical Tree', create: () => centerGroup(createTropicalTree(1)) },
    { label: 'Lifeguard Tower', create: () => centerGroup(createLifeguardTower()) },
    { label: 'Beach Umbrella', create: () => centerGroup(createBeachUmbrella()) },
    { label: 'Voxel Car', create: () => centerGroup(createCar('teal')) },
    { label: 'Voxel Person', create: () => centerGroup(createVoxelPerson('pink')) },
  ]
}
