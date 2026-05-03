<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass, BlendFunction } from 'postprocessing';

const props = withDefaults(defineProps<{
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  enablePost?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  enableGyro?: boolean;
  scanOnClick?: boolean;
  snapBackDelay?: number;
}>(), {
  sensitivity: 0.55,
  lineThickness: 1,
  linesColor: '#2F293A',
  gridScale: 0.1,
  scanColor: '#FF9FFC',
  scanOpacity: 0.4,
  lineStyle: 'dashed',
  lineJitter: 0.1,
  scanDirection: 'pingpong',
  enablePost: true,
  bloomIntensity: 0.6,
  bloomThreshold: 0,
  bloomSmoothing: 0,
  chromaticAberration: 0.002,
  noiseIntensity: 0.01,
  scanGlow: 0.5,
  scanSoftness: 2,
  scanPhaseTaper: 0.9,
  scanDuration: 2.0,
  scanDelay: 2.0,
  enableGyro: false,
  scanOnClick: false,
  snapBackDelay: 250
});

const containerRef = ref<HTMLDivElement | null>(null);

// Three.js objects
let renderer: THREE.WebGLRenderer | null = null;
let material: THREE.ShaderMaterial | null = null;
let composer: EffectComposer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let bloom: BloomEffect | null = null;
let chroma: ChromaticAberrationEffect | null = null;
let rafId: number | null = null;

// Animation state
let startTime = 0;

// Interaction state
const lookTarget = new THREE.Vector2(0, 0);
const lookCurrent = new THREE.Vector2(0, 0);
const lookVel = new THREE.Vector2(0, 0);
let tiltTarget = 0;
let tiltCurrent = 0;
let tiltVel = 0;
let yawTarget = 0;
let yawCurrent = 0;
let yawVel = 0;

const MAX_SCANS = 8;
let scanStarts: number[] = [];

// Vertex shader
const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Fragment shader - exact match to React component
const fragmentShader = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uScanStarts[8];
uniform float uScanCount;
varying vec2 vUv;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    float cR = cos(uTilt), sR = sin(uTilt);
    rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
    float minT = 1e20;
    float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);

    float hitIsY = 1.0;
    for (int i = 0; i < 4; i++)
    {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

    float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
    if (jitterAmt > 0.0) {
        vec2 j = vec2(
        sin(gridUV.y * 2.7 + iTime * 1.8),
        cos(gridUV.x * 2.3 - iTime * 1.6)
        ) * (0.15 * jitterAmt);
        gridUV += j;
    }
    float fx = fract(gridUV.x);
    float fy = fract(gridUV.y);
    float ax = min(fx, 1.0 - fx);
    float ay = min(fy, 1.0 - fy);
    float wx = fwidth(gridUV.x);
    float wy = fwidth(gridUV.y);
    float halfPx = max(0.0, uLineThickness) * 0.5;

    float tx = halfPx * wx;
    float ty = halfPx * wy;

    float aax = wx;
    float aay = wy;

    float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
    float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
    if (uLineStyle > 0.5) {
        float dashRepeat = 4.0;
        float dashDuty = 0.5;
        float vy = fract(gridUV.y * dashRepeat);
        float vx = fract(gridUV.x * dashRepeat);
        float dashMaskY = step(vy, dashDuty);
        float dashMaskX = step(vx, dashDuty);
        if (uLineStyle < 1.5) {
        lineX *= dashMaskY;
        lineY *= dashMaskX;
        } else {
        float dotRepeat = 6.0;
        float dotWidth = 0.18;
        float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
        float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
        float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
        float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
        lineX *= dotMaskY;
        lineY *= dotMaskX;
        }
    }
    float primaryMask = max(lineX, lineY);

    vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
    if (jitterAmt > 0.0) {
        vec2 j2 = vec2(
        cos(gridUV2.y * 2.1 - iTime * 1.4),
        sin(gridUV2.x * 2.5 + iTime * 1.7)
        ) * (0.15 * jitterAmt);
        gridUV2 += j2;
    }
    float fx2 = fract(gridUV2.x);
    float fy2 = fract(gridUV2.y);
    float ax2 = min(fx2, 1.0 - fx2);
    float ay2 = min(fy2, 1.0 - fy2);
    float wx2 = fwidth(gridUV2.x);
    float wy2 = fwidth(gridUV2.y);
    float tx2 = halfPx * wx2;
    float ty2 = halfPx * wy2;
    float aax2 = wx2;
    float aay2 = wy2;
    float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
    float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
    if (uLineStyle > 0.5) {
        float dashRepeat2 = 4.0;
        float dashDuty2 = 0.5;
        float vy2m = fract(gridUV2.y * dashRepeat2);
        float vx2m = fract(gridUV2.x * dashRepeat2);
        float dashMaskY2 = step(vy2m, dashDuty2);
        float dashMaskX2 = step(vx2m, dashDuty2);
        if (uLineStyle < 1.5) {
        lineX2 *= dashMaskY2;
        lineY2 *= dashMaskX2;
        } else {
        float dotRepeat2 = 6.0;
        float dotWidth2 = 0.18;
        float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
        float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
        float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
        float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
        lineX2 *= dotMaskY2;
        lineY2 *= dotMaskX2;
        }
    }
    float altMask = max(lineX2, lineY2);

    float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
    float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
    float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
    float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
    altMask *= edgeGate;

    float lineMask = max(primaryMask, altMask);

    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float scanZMax = 2.0;
    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float sigmaA = sigma * 2.0;

    float combinedPulse = 0.0;
    float combinedAura = 0.0;

    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
    float phase = scanPhase;
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phase = 1.0 - phase;
    } else if (uScanDirection > 1.5) {
        float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
        phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    }
    float scanZ = phase * scanZMax;
    float dz = abs(hit.z - scanZ);
    float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
    float taper = clamp(uPhaseTaper, 0.0, 0.49);
    float headW = taper;
    float tailW = taper;
    float headFade = smoother01(0.0, headW, phase);
    float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
    float phaseWindow = headFade * tailFade;
    float pulseBase = lineBand * phaseWindow;
    combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
    float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
    combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

    for (int i = 0; i < MAX_SCANS; i++) {
        if (float(i) >= uScanCount) break;
        float tActiveI = iTime - uScanStarts[i];
        float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
        if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phaseI = 1.0 - phaseI;
        } else if (uScanDirection > 1.5) {
        phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
        }
        float scanZI = phaseI * scanZMax;
        float dzI = abs(hit.z - scanZI);
        float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
        float headFadeI = smoother01(0.0, headW, phaseI);
        float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
        float phaseWindowI = headFadeI * tailFadeI;
        combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
        float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
        combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    }

    float lineVis = lineMask;
    vec3 gridCol = uLinesColor * lineVis * fade;
    vec3 scanCol = uScanColor * combinedPulse;
    vec3 scanAura = uScanColor * combinedAura;

    color = gridCol + scanCol + scanAura;

    float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
    color = clamp(color, 0.0, 1.0);
    float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
    float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
    float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
    float halo = max(gx, gy) * fade;
    alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
    fragColor = vec4(color, alpha);
}

void main(){
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

// Utility functions
function srgbColor(hex: string): THREE.Color {
  const color = new THREE.Color(hex);
  return color.convertSRGBToLinear();
}

function smoothDampVec2(current: THREE.Vector2, target: THREE.Vector2, velocity: THREE.Vector2, smoothTime: number, maxSpeed: number, deltaTime: number): THREE.Vector2 {
  const out = current.clone();
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current.clone().sub(target);
  const originalTo = target.clone();

  const maxChange = maxSpeed * smoothTime;
  if (change.length() > maxChange) change.setLength(maxChange);

  target.copy(current.clone().sub(change));
  const temp = velocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
  velocity.sub(temp.clone().multiplyScalar(omega));
  velocity.multiplyScalar(exp);

  out.copy(target.clone().add(change.add(temp).multiplyScalar(exp)));

  const origMinusCurrent = originalTo.clone().sub(current);
  const outMinusOrig = out.clone().sub(originalTo);
  if (origMinusCurrent.dot(outMinusOrig) > 0) {
    out.copy(originalTo);
    velocity.set(0, 0);
  }
  return out;
}

function smoothDampFloat(current: number, target: number, velRef: { v: number }, smoothTime: number, maxSpeed: number, deltaTime: number): { value: number; v: number } {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = Math.sign(change) * Math.min(Math.abs(change), maxChange);

  target = current - change;
  const temp = (velRef.v + omega * change) * deltaTime;
  velRef.v = (velRef.v - omega * temp) * exp;

  let out = target + (change + temp) * exp;

  const origMinusCurrent = originalTo - current;
  const outMinusOrig = out - originalTo;
  if (origMinusCurrent * outMinusOrig > 0) {
    out = originalTo;
    velRef.v = 0;
  }
  return { value: out, v: velRef.v };
}

function pushScan(t: number) {
  const arr = scanStarts.slice();
  if (arr.length >= MAX_SCANS) arr.shift();
  arr.push(t);
  scanStarts = arr;
  
  if (material) {
    const buf = new Array(MAX_SCANS).fill(0);
    for (let i = 0; i < arr.length && i < MAX_SCANS; i++) {
      buf[i] = arr[i];
    }
    material.uniforms.uScanStarts.value = buf;
    material.uniforms.uScanCount.value = arr.length;
  }
}

function handleMouseMove(e: MouseEvent) {
  const el = containerRef.value;
  if (!el) return;
  
  const rect = el.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  lookTarget.set(nx, ny);
}

let leaveTimer: number | null = null;

function handleMouseLeave() {
  if (leaveTimer) clearTimeout(leaveTimer);
  leaveTimer = window.setTimeout(() => {
    lookTarget.set(0, 0);
    tiltTarget = 0;
    yawTarget = 0;
  }, Math.max(0, props.snapBackDelay));
}

function handleClick() {
  if (props.scanOnClick) {
    pushScan(performance.now() / 1000);
  }
}

function handleResize() {
  const el = containerRef.value;
  if (!el || !renderer || !material) return;
  
  renderer.setSize(el.clientWidth, el.clientHeight);
  material.uniforms.iResolution.value.set(el.clientWidth, el.clientHeight, renderer.getPixelRatio());
  if (composer) {
    composer.setSize(el.clientWidth, el.clientHeight);
  }
}

function tick() {
  const now = performance.now();
  const dt = Math.max(0, Math.min(0.1, (now - startTime) / 1000));

  // Calculate sensitivity-based values
  const s = Math.max(0, Math.min(1, props.sensitivity));
  const skewScale = THREE.MathUtils.lerp(0.06, 0.2, s);
  const tiltScale = THREE.MathUtils.lerp(0.12, 0.3, s);
  const yawScale = THREE.MathUtils.lerp(0.1, 0.28, s);
  const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, s);
  const yBoost = THREE.MathUtils.lerp(1.2, 1.6, s);

  // Smooth interpolation for look direction
  lookCurrent.copy(smoothDampVec2(lookCurrent, lookTarget, lookVel, smoothTime, Infinity, dt));

  // Tilt and yaw smoothing
  const tiltSm = smoothDampFloat(tiltCurrent, tiltTarget, { v: tiltVel }, smoothTime, Infinity, dt);
  tiltCurrent = tiltSm.value;
  tiltVel = tiltSm.v;

  const yawSm = smoothDampFloat(yawCurrent, yawTarget, { v: yawVel }, smoothTime, Infinity, dt);
  yawCurrent = yawSm.value;
  yawVel = yawSm.v;

  // Update shader uniforms
  if (material) {
    const skew = new THREE.Vector2(
      lookCurrent.x * skewScale,
      -lookCurrent.y * yBoost * skewScale
    );
    material.uniforms.uSkew.value.copy(skew);
    material.uniforms.uTilt.value = tiltCurrent * tiltScale;
    material.uniforms.uYaw.value = THREE.MathUtils.clamp(yawCurrent * yawScale, -0.6, 0.6);
    material.uniforms.iTime.value = (now - startTime) / 1000;
  }

  // Render
  if (renderer) {
    renderer.clear(true, true, true);
    if (composer) {
      composer.render(dt);
    } else if (scene && camera) {
      renderer.render(scene, camera);
    }
  }

  rafId = requestAnimationFrame(tick);
}

function initThree() {
  const el = containerRef.value;
  if (!el) return;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);

  // Create shader material
  const lineStyleValue = props.lineStyle === 'dashed' ? 1 : props.lineStyle === 'dotted' ? 2 : 0;
  const scanDirValue = props.scanDirection === 'backward' ? 1 : props.scanDirection === 'pingpong' ? 2 : 0;

  const uniforms: Record<string, THREE.IUniform> = {
    iResolution: { value: new THREE.Vector3(el.clientWidth, el.clientHeight, renderer.getPixelRatio()) },
    iTime: { value: 0 },
    uSkew: { value: new THREE.Vector2(0, 0) },
    uTilt: { value: 0 },
    uYaw: { value: 0 },
    uLineThickness: { value: props.lineThickness },
    uLinesColor: { value: srgbColor(props.linesColor) },
    uScanColor: { value: srgbColor(props.scanColor) },
    uGridScale: { value: props.gridScale },
    uLineStyle: { value: lineStyleValue },
    uLineJitter: { value: Math.max(0, Math.min(1, props.lineJitter)) },
    uScanOpacity: { value: props.scanOpacity },
    uNoise: { value: props.noiseIntensity },
    uBloomOpacity: { value: props.bloomIntensity },
    uScanGlow: { value: props.scanGlow },
    uScanSoftness: { value: props.scanSoftness },
    uPhaseTaper: { value: props.scanPhaseTaper },
    uScanDuration: { value: props.scanDuration },
    uScanDelay: { value: props.scanDelay },
    uScanDirection: { value: scanDirValue },
    uScanStarts: { value: new Array(MAX_SCANS).fill(0) },
    uScanCount: { value: 0 }
  };

  material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false
  });

  // Create scene
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  // Post-processing
  if (props.enablePost) {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloom = new BloomEffect({
      intensity: 1.0,
      luminanceThreshold: props.bloomThreshold,
      luminanceSmoothing: props.bloomSmoothing,
      blendFunction: BlendFunction.ADD
    });

    chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(props.chromaticAberration, props.chromaticAberration),
      radialModulation: true,
      modulationOffset: 0.0
    });

    const effectPass = new EffectPass(camera, bloom, chroma);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);
  } else {
    renderer.render(scene, camera);
  }

  // Start animation
  startTime = performance.now();
  rafId = requestAnimationFrame(tick);

  // Event listeners
  window.addEventListener('resize', handleResize);
}

// Watch for prop changes
watch(() => props.linesColor, (newVal) => {
  if (material) {
    material.uniforms.uLinesColor.value.copy(srgbColor(newVal));
  }
});

watch(() => props.scanColor, (newVal) => {
  if (material) {
    material.uniforms.uScanColor.value.copy(srgbColor(newVal));
  }
});

watch(() => props.scanOpacity, (newVal) => {
  if (material) {
    material.uniforms.uScanOpacity.value = newVal;
  }
});

watch(() => props.lineJitter, (newVal) => {
  if (material) {
    material.uniforms.uLineJitter.value = Math.max(0, Math.min(1, newVal));
  }
});

onMounted(() => {
  initThree();
  
  const el = containerRef.value;
  if (el) {
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);
  }
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  
  const el = containerRef.value;
  if (el) {
    el.removeEventListener('mousemove', handleMouseMove);
    el.removeEventListener('mouseleave', handleMouseLeave);
    el.removeEventListener('click', handleClick);
  }
  
  window.removeEventListener('resize', handleResize);
  
  if (leaveTimer) clearTimeout(leaveTimer);
  
  if (material) {
    material.dispose();
  }
  
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    if (el && renderer.domElement.parentNode === el) {
      el.removeChild(renderer.domElement);
    }
  }
  
  if (composer) {
    composer.dispose();
  }
});
</script>

<template>
  <div ref="containerRef" class="gridscan"></div>
</template>

<style scoped>
.gridscan {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
