"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { MotionValue } from "framer-motion";
import { CoffeeField } from "./coffee-field";
import { HyperspaceStreaks } from "./hyperspace-streaks";

const DARK_COLOR = "#150c07";
const LIGHT_COLOR = "#EDE7DC"; // mesma cor do fundo da seção "Sobre"
// Precisa bater com o mesmo valor em coffee-field.tsx e
// hyperspace-streaks.tsx — janela final do scroll (fase 3) em que a cena
// lava pra branco (a própria cena 3D, não um corte/fade de div). O fundo
// fica 100% escuro até aqui — nada de branco durante a imersão (fase 2).
const WHITEOUT_START = 0.8;

function SceneWhiteout({ progress }: { progress: MotionValue<number> }) {
  const { scene } = useThree();
  const dark = useMemo(() => new THREE.Color(DARK_COLOR), []);
  const light = useMemo(() => new THREE.Color(LIGHT_COLOR), []);
  const bg = useRef(new THREE.Color(DARK_COLOR));

  useEffect(() => {
    scene.background = bg.current;
  }, [scene]);

  useFrame(() => {
    const p = progress.get();
    const wRaw = THREE.MathUtils.clamp((p - WHITEOUT_START) / (1 - WHITEOUT_START), 0, 1);
    const w = wRaw * wRaw * (3 - 2 * wRaw);
    bg.current.copy(dark).lerp(light, w);
  });

  return null;
}

export function HeroCanvas({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 60, near: 0.1, far: 200 }}
    >
      <SceneWhiteout progress={progress} />

      <Suspense fallback={null}>
        <CoffeeField progress={progress} />
      </Suspense>
      <HyperspaceStreaks progress={progress} />
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.42}
          luminanceSmoothing={0.3}
          intensity={0.4}
          radius={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
