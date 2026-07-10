import * as THREE from 'three'

export function createOcean(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(72, 34, 96, 48)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#0875a7') },
      uShallow: { value: new THREE.Color('#42d9e8') },
      uFoam: { value: new THREE.Color('#f4ffff') },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 0.45 + uTime * 1.4) * 0.16;
        wave += sin(pos.y * 0.9 + uTime * 2.1) * 0.07;
        pos.z += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uFoam;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        float shore = smoothstep(0.0, 0.38, vUv.y);
        vec3 water = mix(uShallow, uDeep, shore);
        float foamLines = sin((vUv.y * 42.0) - uTime * 2.8 + sin(vUv.x * 12.0) * 0.8);
        float foam = smoothstep(0.78, 0.98, foamLines) * (1.0 - smoothstep(0.0, 0.55, vUv.y));
        float sparkle = smoothstep(0.13, 0.2, vWave) * 0.25;
        vec3 color = mix(water + sparkle, uFoam, foam * 0.75);
        gl_FragColor = vec4(color, 0.88);
      }
    `,
    transparent: true,
  })
  const ocean = new THREE.Mesh(geometry, material)
  ocean.name = 'animated-ocean-shader'
  ocean.rotation.x = -Math.PI / 2
  ocean.position.set(0, 0.05, -25)
  ocean.receiveShadow = true
  return ocean
}

export function updateOcean(ocean: THREE.Object3D, elapsed: number): void {
  const mesh = ocean as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  if ('uniforms' in mesh.material && mesh.material.uniforms.uTime) {
    mesh.material.uniforms.uTime.value = elapsed
  }
}
