import { vi } from 'vitest'

vi.mock('three/webgpu', async (importOriginal) => {
  const original = await importOriginal<typeof import('three/webgpu')>()
  return {
    ...original,
    WebGPURenderer: vi.fn().mockImplementation(
      class {
        init = vi.fn().mockResolvedValue(undefined)
        setPixelRatio = vi.fn()
        setSize = vi.fn()
        render = vi.fn()
        domElement = document.createElement('canvas')
      } as any
    ),
  }
})
