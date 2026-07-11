import * as THREE from 'three'

export function createSkyDome(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(700, 32, 16)
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color('#86dcff') },
      horizonColor: { value: new THREE.Color('#ffd98a') },
      lowColor: { value: new THREE.Color('#fff0bb') },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 lowColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 lower = mix(lowColor, horizonColor, smoothstep(-0.35, 0.18, h));
        vec3 color = mix(lower, topColor, smoothstep(0.18, 0.95, h));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })
  const dome = new THREE.Mesh(geometry, material)
  dome.name = 'seamless-beach-sky-dome'
  dome.renderOrder = -1000
  return dome
}
