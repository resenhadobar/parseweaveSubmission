import * as THREE from 'three'

export function createOcean(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(150, 34, 96, 24)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#04658f') },
      uMid: { value: new THREE.Color('#08a6c3') },
      uShallow: { value: new THREE.Color('#54e0dd') },
      uFoam: { value: new THREE.Color('#f8ffff') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uMid;
      uniform vec3 uShallow;
      uniform vec3 uFoam;
      varying vec2 vUv;
      void main() {
        float shoreDepth = smoothstep(0.0, 0.42, vUv.y);
        vec3 water = mix(uShallow, uMid, shoreDepth);
        water = mix(water, uDeep, smoothstep(0.42, 1.0, vUv.y));

        float rippleA = sin(vUv.x * 54.0 + uTime * 1.8 + sin(vUv.y * 9.0) * 0.7);
        float rippleB = sin((vUv.x + vUv.y) * 38.0 - uTime * 1.25);
        float texture = (rippleA + rippleB) * 0.035;

        float shoreFoam = smoothstep(0.06, 0.0, abs(vUv.y - 0.08 + sin(vUv.x * 18.0 + uTime) * 0.015));
        float waveFoam = smoothstep(0.92, 0.99, sin(vUv.y * 30.0 - uTime * 2.2 + sin(vUv.x * 12.0) * 0.45));
        waveFoam *= 1.0 - smoothstep(0.0, 0.55, vUv.y);
        float foam = max(shoreFoam, waveFoam * 0.55);

        vec3 color = mix(water + texture, uFoam, foam * 0.82);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })
  const ocean = new THREE.Mesh(geometry, material)
  ocean.name = 'animated-ocean-shader'
  ocean.rotation.x = -Math.PI / 2
  ocean.position.set(0, 0.16, -49)
  ocean.receiveShadow = false
  return ocean
}

export function updateOcean(ocean: THREE.Object3D, elapsed: number): void {
  const mesh = ocean as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  if ('uniforms' in mesh.material && mesh.material.uniforms.uTime) {
    mesh.material.uniforms.uTime.value = elapsed
  }
}
