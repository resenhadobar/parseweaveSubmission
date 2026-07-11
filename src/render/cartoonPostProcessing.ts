import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const cartoonShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;

    vec3 saturateColor(vec3 color, float amount) {
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(luma), color, amount);
    }

    void main() {
      vec2 texel = 1.0 / resolution;
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      vec3 north = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
      vec3 south = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
      vec3 east = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
      vec3 west = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;

      vec3 boosted = saturateColor(color, 1.34);
      boosted = pow(boosted, vec3(0.88));
      boosted = floor(boosted * 7.0) / 7.0;

      float edge = length(north - south) + length(east - west);
      float ink = smoothstep(0.2, 0.62, edge);
      vec2 centered = vUv - 0.5;
      float vignette = smoothstep(0.82, 0.28, dot(centered, centered));
      vec3 finalColor = mix(boosted, boosted * 0.42, ink * 0.48);
      finalColor *= mix(0.82, 1.08, vignette);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
}

export class CartoonPostProcessing {
  private readonly composer: EffectComposer
  private readonly cartoonPass: ShaderPass

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer)
    this.composer.addPass(new RenderPass(scene, camera))
    this.cartoonPass = new ShaderPass(cartoonShader)
    this.composer.addPass(this.cartoonPass)
    this.composer.addPass(new OutputPass())
    console.info('[VoxelBeach] Cartoon post-processing enabled: posterized color and soft ink edges')
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height)
    this.cartoonPass.uniforms.resolution.value.set(width, height)
  }

  render(): void {
    this.composer.render()
  }
}
