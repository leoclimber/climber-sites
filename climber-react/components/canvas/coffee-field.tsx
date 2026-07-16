"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";

// Menos grãos, mecânica toda em GPU (shader) — é isso que faz a cena ser
// leve. A versão anterior recalculava matriz por grão em JS a cada frame,
// o que travava com muitos grãos de geometria real (14.981 vértices cada).
const COUNT = 170;
const CAMERA_START_Z = 8;
const TRAVEL_DISTANCE = 260;

// Coreografia em 3 fases, iguais em coffee-field.tsx, hyperspace-streaks.tsx
// e hero-canvas.tsx:
// Fase 1 (0-25%): textos saindo, grãos parados, câmera parada.
// Fase 2 (25-80%): imersão de verdade — câmera acelera, fundo continua escuro.
// Fase 3 (80-100%): lavagem pra branco.
const IMMERSION_START = 0.25;
const IMMERSION_END = 0.8;
const WHITEOUT_START = 0.8;

// Túnel curto e sempre à frente da câmera — mesma faixa de distância "bem
// perto" da versão que foi aprovada (era isso que fazia a maioria dos
// grãos ficar do tamanho certo), só que agora com um piso de segurança
// (nunca encosta na câmera) pra eliminar o grão gigante.
const TUNNEL_NEAR = 1.6;
const TUNNEL_LENGTH = 5.5;

const FOV_DEG = 60;
const TAN_HALF_FOV = Math.tan((FOV_DEG / 2) * (Math.PI / 180));
const ASPECT = 1.7;

// Redução exata de 10% sobre o valor aprovado anterior (0.28-0.46).
const SCALE_MIN = 0.252;
const SCALE_MAX = 0.414;

// Rotação individual lenta e elegante: uma volta completa em ~20-30s.
const ROTATION_PERIOD_MIN = 20;
const ROTATION_PERIOD_MAX = 30;

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX_SHADER = /* glsl */ `
attribute vec3 aBase;
attribute float aPhase;
attribute float aScale;
attribute vec3 aRotAxis;
attribute float aRotSpeed;
attribute float aRotPhase;

uniform float uTime;
uniform float uCameraZ;
uniform float uTunnelNear;
uniform float uTunnelLength;
uniform float uDive;
uniform vec3 uMouseWorld;
uniform float uMouseStrength;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPos;

${NOISE_GLSL}

vec3 rotateAxisAngle(vec3 v, vec3 axis, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

void main() {
  vUv = uv;

  float n1 = snoise(vec3(aBase.x * 0.4, aBase.y * 0.4, uTime * 0.1 + aPhase));
  float n2 = snoise(vec3(aBase.y * 0.4 + 30.0, aBase.x * 0.4, uTime * 0.1 + aPhase));
  vec2 drift = vec2(n1, n2) * (0.35 * (1.0 - uDive));

  vec2 toMouse = (aBase.xy + drift) - uMouseWorld.xy;
  float distM = length(toMouse);
  float falloff = smoothstep(2.2, 0.0, distM);
  vec2 mouseForce = (toMouse / (distM + 0.0001)) * falloff * 1.1 * uMouseStrength;

  vec2 xy = aBase.xy + drift + mouseForce;

  // Túnel de profundidade sempre à frente da câmera — nunca atrás, nunca
  // mais perto que uTunnelNear (é isso que elimina o grão gigante).
  float distFromCam = uCameraZ - aBase.z;
  float wrappedDist = mod(distFromCam - uTunnelNear, uTunnelLength) + uTunnelNear;
  float z = uCameraZ - wrappedDist;

  float angle = uTime * aRotSpeed + aRotPhase;
  vec3 tumbled = rotateAxisAngle(position, aRotAxis, angle);
  vNormalW = rotateAxisAngle(normal, aRotAxis, angle);

  // O grão em si NÃO estica nem vira estria — ele continua visível e
  // reconhecível o tempo todo. As estrias douradas são um sistema à parte
  // (HyperspaceStreaks), que aparece entre os grãos, não em cima deles.
  vec3 objectPosition = vec3(xy, z) + tumbled * aScale;
  vWorldPos = objectPosition;

  vec4 mvPosition = modelViewMatrix * vec4(objectPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Luz e material re-derivados dos valores exatos da versão aprovada
// (MeshStandardMaterial color #caa27a / roughness 0.62 / metalness 0, +
// hemisphereLight e as duas directionalLight de hero-canvas.tsx daquele
// momento). Como a posição de cada grão agora é calculada no shader (por
// performance), a luz precisou virar Blinn-Phong escrito à mão em vez de
// depender do pipeline PBR embutido do MeshStandardMaterial — mas os
// números de entrada são os mesmos.
const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform sampler2D uMap;
uniform vec3 uCameraPosition;
uniform float uWhiteout;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPos;

const vec3 uBaseColor = vec3(0.792, 0.635, 0.478); // #caa27a
const float uRoughness = 0.62;

const vec3 uSkyColor = vec3(0.290, 0.200, 0.133);   // #4a3322
const vec3 uGroundColor = vec3(0.039, 0.020, 0.012); // #0a0503
const float uHemiIntensity = 0.55;

const vec3 uLight1Dir = vec3(0.4570, 0.5712, 0.6854); // normalize([4,5,6])
const vec3 uLight1Color = vec3(1.0, 0.863, 0.690);     // #ffdcb0
const float uLight1Intensity = 2.2;

const vec3 uLight2Dir = vec3(-0.8452, -0.3381, -0.4152); // normalize([-5,-2,-3])
const vec3 uLight2Color = vec3(1.0, 0.702, 0.361);        // #ffb35c
const float uLight2Intensity = 0.5;

void main() {
  vec3 n = normalize(vNormalW);
  vec3 texColor = texture2D(uMap, vUv).rgb * uBaseColor;

  float hemiMix = n.y * 0.5 + 0.5;
  vec3 ambient = mix(uGroundColor, uSkyColor, hemiMix) * uHemiIntensity;

  float diff1 = max(dot(n, uLight1Dir), 0.0);
  float diff2 = max(dot(n, uLight2Dir), 0.0);
  vec3 diffuse = uLight1Color * diff1 * uLight1Intensity + uLight2Color * diff2 * uLight2Intensity;

  vec3 viewDir = normalize(uCameraPosition - vWorldPos);
  float shininess = mix(4.0, 90.0, 1.0 - uRoughness);
  vec3 half1 = normalize(uLight1Dir + viewDir);
  float spec1 = pow(max(dot(n, half1), 0.0), shininess);
  vec3 half2 = normalize(uLight2Dir + viewDir);
  float spec2 = pow(max(dot(n, half2), 0.0), shininess);
  vec3 specular = uLight1Color * spec1 * uLight1Intensity * 0.5
                 + uLight2Color * spec2 * uLight2Intensity * 0.5;

  vec3 base = texColor * (ambient + diffuse) + specular;

  // Lavagem final pra branco, junto com o fundo da cena — não altera a
  // pintura/luz do grão em si, só se sobrepõe no fim do scroll.
  vec3 finalColor = mix(base, vec3(1.0), uWhiteout);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Textura de cor procedural: marrom torrado com manchas mais claras e mais
// escuras (baseado em referencias/grao-referencia-cor.png), já que o modelo
// comprado veio só com geometria, sem nenhum mapa de textura.
function createColorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#4a2a17";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 320; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 10 + Math.random() * 46;
    const lighter = Math.random() > 0.45;
    const color = lighter
      ? `rgba(150, 96, 56, ${0.06 + Math.random() * 0.14})`
      : `rgba(18, 9, 5, ${0.08 + Math.random() * 0.18})`;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function randomPositionAtDepth(camZ: number, depth: number): THREE.Vector2 {
  const halfHeight = depth * TAN_HALF_FOV;
  const halfWidth = halfHeight * ASPECT;
  return new THREE.Vector2(
    (Math.random() * 2 - 1) * halfWidth,
    (Math.random() * 2 - 1) * halfHeight
  );
}

function buildAttributes() {
  const aBase = new Float32Array(COUNT * 3);
  const aPhase = new Float32Array(COUNT);
  const aScale = new Float32Array(COUNT);
  const aRotAxis = new Float32Array(COUNT * 3);
  const aRotSpeed = new Float32Array(COUNT);
  const aRotPhase = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const depth = TUNNEL_NEAR + Math.random() * TUNNEL_LENGTH;
    const xy = randomPositionAtDepth(CAMERA_START_Z, depth);
    aBase[i * 3 + 0] = xy.x;
    aBase[i * 3 + 1] = xy.y;
    aBase[i * 3 + 2] = CAMERA_START_Z - depth;

    aPhase[i] = Math.random() * 100;
    aScale[i] = SCALE_MIN + Math.random() * (SCALE_MAX - SCALE_MIN);

    const axis = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    aRotAxis[i * 3 + 0] = axis.x;
    aRotAxis[i * 3 + 1] = axis.y;
    aRotAxis[i * 3 + 2] = axis.z;

    const period =
      ROTATION_PERIOD_MIN + Math.random() * (ROTATION_PERIOD_MAX - ROTATION_PERIOD_MIN);
    aRotSpeed[i] = ((Math.PI * 2) / period) * (Math.random() < 0.5 ? 1 : -1);
    aRotPhase[i] = Math.random() * Math.PI * 2;
  }

  return { aBase, aPhase, aScale, aRotAxis, aRotSpeed, aRotPhase };
}

export function CoffeeField({ progress }: { progress: MotionValue<number> }) {
  const { scene } = useGLTF("/models/coffee-bean.gltf");
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const hasPointerMoved = useRef(false);

  useEffect(() => {
    const onPointerMove = () => {
      hasPointerMoved.current = true;
    };
    gl.domElement.addEventListener("pointermove", onPointerMove);
    return () => gl.domElement.removeEventListener("pointermove", onPointerMove);
  }, [gl]);

  const geometry = useMemo(() => {
    let found: THREE.BufferGeometry | null = null;
    scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) {
        found = (child as THREE.Mesh).geometry;
      }
    });
    const geo = found ? (found as THREE.BufferGeometry).clone() : new THREE.IcosahedronGeometry(0.4, 2);
    geo.center();

    // O export do Cinema4D veio numa unidade minúscula (bounding box ~0.01).
    // Normaliza pelo maior eixo para que o grão tenha ~1 unidade de
    // comprimento, o mesmo padrão que o resto da cena assume.
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const normalizeFactor = 1 / maxDimension;
    geo.scale(normalizeFactor, normalizeFactor, normalizeFactor);

    const { aBase, aPhase, aScale, aRotAxis, aRotSpeed, aRotPhase } = buildAttributes();
    geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(aBase, 3));
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(aPhase, 1));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(aScale, 1));
    geo.setAttribute("aRotAxis", new THREE.InstancedBufferAttribute(aRotAxis, 3));
    geo.setAttribute("aRotSpeed", new THREE.InstancedBufferAttribute(aRotSpeed, 1));
    geo.setAttribute("aRotPhase", new THREE.InstancedBufferAttribute(aRotPhase, 1));

    return geo;
  }, [scene]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uCameraZ: { value: CAMERA_START_Z },
        uTunnelNear: { value: TUNNEL_NEAR },
        uTunnelLength: { value: TUNNEL_LENGTH },
        uDive: { value: 0 },
        uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
        uMouseStrength: { value: 0 },
        uMap: { value: createColorTexture() },
        uCameraPosition: { value: new THREE.Vector3() },
        uWhiteout: { value: 0 },
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.uniforms.uMap.value?.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    camera.position.set(0, 0, CAMERA_START_Z);
  }, [camera]);

  useFrame((state, delta) => {
    const p = progress.get();
    // t = 0 durante toda a fase 1 (câmera parada) e chega a 1 exatamente no
    // fim da fase 2 (25%-80%) — a fase 3 (branco) não acelera mais a câmera.
    const t = THREE.MathUtils.clamp(
      (p - IMMERSION_START) / (IMMERSION_END - IMMERSION_START),
      0,
      1
    );

    const targetZ = CAMERA_START_Z - t * TRAVEL_DISTANCE;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta);
    const camZ = camera.position.z;

    if (hasPointerMoved.current) {
      plane.constant = -(camZ - TUNNEL_NEAR - 1);
      raycaster.setFromCamera(state.pointer, camera);
      raycaster.ray.intersectPlane(plane, mouseWorld);
    }

    const wRaw = THREE.MathUtils.clamp((p - WHITEOUT_START) / (1 - WHITEOUT_START), 0, 1);
    const whiteout = wRaw * wRaw * (3 - 2 * wRaw);

    const uniforms = material.uniforms;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uCameraZ.value = camZ;
    uniforms.uDive.value = t;
    uniforms.uMouseStrength.value = hasPointerMoved.current ? 1 - t : 0;
    uniforms.uMouseWorld.value.copy(mouseWorld);
    uniforms.uCameraPosition.value.copy(camera.position);
    uniforms.uWhiteout.value = whiteout;
  });

  return <instancedMesh args={[geometry, material, COUNT]} frustumCulled={false} />;
}

useGLTF.preload("/models/coffee-bean.gltf");
