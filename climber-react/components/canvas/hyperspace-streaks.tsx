"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";

// Precisa bater com os mesmos valores de components/canvas/coffee-field.tsx
// (mesma câmera, mesmo início de mergulho) pra estrias e grãos ocuparem o
// mesmo túnel — só que estrias são um sistema à parte, nunca o próprio grão.
const CAMERA_START_Z = 8;
const TRAVEL_DISTANCE = 260;
const TUNNEL_NEAR = 1.6;
const TUNNEL_LENGTH = 5.5;

// Mesma coreografia de 3 fases de coffee-field.tsx e hero-canvas.tsx:
// Fase 1 (0-25%): textos saindo, estrias já nascendo, câmera parada.
// Fase 2 (25-80%): imersão de verdade — câmera acelera, fundo escuro.
// Fase 3 (80-100%): lavagem pra branco.
const IMMERSION_START = 0.25;
const IMMERSION_END = 0.8;
const WHITEOUT_START = 0.8;

const STREAK_COUNT = 90;
const FOV_DEG = 60;
const TAN_HALF_FOV = Math.tan((FOV_DEG / 2) * (Math.PI / 180));
const ASPECT = 1.7;

const STREAK_VERTEX_SHADER = /* glsl */ `
precision mediump float;

attribute vec3 aBase;

uniform float uCameraZ;
uniform float uTunnelNear;
uniform float uTunnelLength;
uniform float uAmount;
uniform float uWhiteout;

varying float vGlow;
varying float vAlongLength;

void main() {
  float distFromCam = uCameraZ - aBase.z;
  float wrappedDist = mod(distFromCam - uTunnelNear, uTunnelLength) + uTunnelNear;
  float z = uCameraZ - wrappedDist;

  // Vai de um pontinho parado (repouso) a um traço fino e comprido
  // conforme uAmount (velocidade de scroll) sobe. Durante a lavagem final
  // pro branco, garante um mínimo mesmo que a velocidade instantânea caia
  // — senão as estrias encolhem e somem bem no momento em que precisam
  // ficar visíveis sobre o fundo claro.
  float effectiveAmount = max(uAmount, uWhiteout * 0.55);
  float len = mix(0.03, 3.6, effectiveAmount);
  float thin = mix(0.012, 0.022, effectiveAmount);
  vGlow = effectiveAmount;
  vAlongLength = position.z;

  vec3 local = vec3(position.x * thin, position.y * thin, position.z * len);
  vec3 objectPosition = vec3(aBase.xy, z) + local;

  vec4 mvPosition = modelViewMatrix * vec4(objectPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const STREAK_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform vec3 uColorGold;
uniform vec3 uColorDark;
uniform float uWhiteout;

varying float vGlow;
varying float vAlongLength;

void main() {
  // Some suavemente nas pontas do traço, não corta seco.
  float edgeFade = 1.0 - smoothstep(0.35, 0.5, abs(vAlongLength));
  float alpha = vGlow * edgeFade * 0.85;
  // Na lavagem final pro branco as estrias não somem — só trocam de
  // douradas pra escuras/sutis, lendo por cima do fundo claro.
  vec3 color = mix(uColorGold, uColorDark, uWhiteout);
  gl_FragColor = vec4(color, alpha);
}
`;

function randomPositionAtDepth(depth: number): THREE.Vector2 {
  const halfHeight = depth * TAN_HALF_FOV;
  const halfWidth = halfHeight * ASPECT;
  return new THREE.Vector2(
    (Math.random() * 2 - 1) * halfWidth,
    (Math.random() * 2 - 1) * halfHeight
  );
}

function buildStreakBase(): Float32Array {
  const aBase = new Float32Array(STREAK_COUNT * 3);
  for (let i = 0; i < STREAK_COUNT; i++) {
    const depth = TUNNEL_NEAR + Math.random() * TUNNEL_LENGTH;
    const xy = randomPositionAtDepth(depth);
    aBase[i * 3 + 0] = xy.x;
    aBase[i * 3 + 1] = xy.y;
    aBase[i * 3 + 2] = CAMERA_START_Z - depth;
  }
  return aBase;
}

function createGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 214, 156, 0.9)");
  grad.addColorStop(0.35, "rgba(255, 179, 92, 0.45)");
  grad.addColorStop(1, "rgba(255, 179, 92, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export function HyperspaceStreaks({ progress }: { progress: MotionValue<number> }) {
  const { camera } = useThree();
  const speedRef = useRef(0);
  const glowRef = useRef<THREE.Sprite>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(buildStreakBase(), 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STREAK_VERTEX_SHADER,
        fragmentShader: STREAK_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        // Aditivo só soma luz — funciona pro dourado sobre fundo escuro,
        // mas deixa a estria escura invisível sobre o fundo branco no fim
        // do whiteout. Blending normal funciona corretamente nos dois.
        blending: THREE.NormalBlending,
        uniforms: {
          uCameraZ: { value: CAMERA_START_Z },
          uTunnelNear: { value: TUNNEL_NEAR },
          uTunnelLength: { value: TUNNEL_LENGTH },
          uAmount: { value: 0 },
          uColorGold: { value: new THREE.Color("#ffb35c") },
          uColorDark: { value: new THREE.Color("#3a2a1c") },
          uWhiteout: { value: 0 },
        },
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: createGlowTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      glowMaterial.map?.dispose();
      glowMaterial.dispose();
    };
  }, [geometry, material, glowMaterial]);

  useFrame((state, delta) => {
    const p = progress.get();
    const t = THREE.MathUtils.clamp(
      (p - IMMERSION_START) / (IMMERSION_END - IMMERSION_START),
      0,
      1
    );
    const targetZ = CAMERA_START_Z - t * TRAVEL_DISTANCE;
    // A câmera já é movida por CoffeeField no mesmo frame; aqui só lemos.
    const camZ = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta);

    const rawSpeed = Math.abs(progress.getVelocity());
    speedRef.current = THREE.MathUtils.damp(speedRef.current, Math.min(rawSpeed, 6), 5, delta);

    // Fase 1 (0-25%): nascimento das estrias JUNTO com a saída dos textos —
    // independente de velocidade/câmera, que ainda não se moveu. Sobe até
    // 0.35 conforme o scroll avança dentro da fase 1.
    const textExitRaw = THREE.MathUtils.clamp(p / IMMERSION_START, 0, 1);
    const textExit = textExitRaw * textExitRaw * (3 - 2 * textExitRaw);
    const phase1Birth = textExit * 0.35;

    // Fase 2 (25-80%): imersão de verdade — combina velocidade instantânea
    // (traços aparecem ao acelerar) com o progresso do mergulho.
    const phase2Amount = THREE.MathUtils.clamp(speedRef.current * 0.9 + t * 0.5, 0, 1);

    const amount = Math.max(phase1Birth, phase2Amount);

    // Lavagem final pra branco — janela curta no fim do scroll.
    const wRaw = THREE.MathUtils.clamp((p - WHITEOUT_START) / (1 - WHITEOUT_START), 0, 1);
    const whiteout = wRaw * wRaw * (3 - 2 * wRaw);

    material.uniforms.uCameraZ.value = camZ;
    material.uniforms.uAmount.value = amount;
    material.uniforms.uWhiteout.value = whiteout;

    if (glowRef.current) {
      glowRef.current.position.set(0, 0, camZ - 26);
      // O glow só existe como ponto de fuga durante a imersão de verdade
      // (fase 2) — não deve acender ainda no nascimento das estrias (fase 1).
      const glowIntensity = phase2Amount * phase2Amount;
      const glowScale = THREE.MathUtils.lerp(4, 20, glowIntensity);
      glowRef.current.scale.setScalar(glowScale);
      glowMaterial.opacity = glowIntensity * 0.85 * (1 - whiteout);
    }
  });

  return (
    <>
      <instancedMesh args={[geometry, material, STREAK_COUNT]} frustumCulled={false} />
      <sprite ref={glowRef} material={glowMaterial} />
    </>
  );
}
