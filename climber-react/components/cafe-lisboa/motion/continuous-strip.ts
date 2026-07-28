"use client";

import { useCallback, useEffect, useRef } from "react";

type UseContinuousStripArgs = {
  /** px/s do movimento de base, sempre rodando (mesmo parado). */
  baseSpeedPxPerSec: number;
  /** true = zera o rAF inteiro, mostra o track na posição de repouso. */
  reducedMotion: boolean;
  /** 1 = translateX negativo crescente (esquerda); -1 = inverso. */
  direction?: 1 | -1;
  /** teto do "extra" de velocidade somado pela interação, em múltiplos da base. */
  maxExtraMultiplier?: number;
  /** constante de tempo do retorno à base — ~3*tau até estabilizar, então
      tau = 0,2 faz o extra decair ~95% em 600ms depois que a entrada para. */
  tauSec?: number;
};

// Motor único de rolagem contínua (Fase 24) — usado pelo marquee do rodapé
// (footer.tsx, entrada = scroll da página) e pela esteira de avaliações
// (reviews.tsx, entrada = arraste do ponteiro). Mesma física nos dois: uma
// velocidade de base constante sempre soma progresso (nunca para sozinha),
// e cada fonte de entrada empurra um "extra" de velocidade que decai pra 0
// sozinho (suavização exponencial, não um contador com setTimeout) — por
// isso "soma e depois volta à base" é o MESMO cálculo em todo frame, com ou
// sem entrada nova (sem entrada, o alvo é 0 e o extra relaxa até lá).
// Só transform (translate3d) muda por frame; nunca left/margin/background-
// position. Um único requestAnimationFrame por instância do hook.
export function useContinuousStrip({
  baseSpeedPxPerSec,
  reducedMotion,
  direction = 1,
  maxExtraMultiplier = 2,
  tauSec = 0.2,
}: UseContinuousStripArgs) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const engine = useRef({
    progress: 0,
    extra: 0,
    half: 0,
    lastTime: 0,
    pendingDelta: 0,
  });

  // Fonte de entrada empurra px "instantâneos" aqui (scroll delta da página
  // ou movimento do ponteiro durante o arraste) — lido e zerado a cada frame.
  const pushDelta = useCallback((deltaPx: number) => {
    engine.current.pendingDelta += deltaPx;
  }, []);

  const getProgress = useCallback(() => engine.current.progress, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function measure() {
      // conteúdo duplicado (2 cópias idênticas lado a lado) — metade da
      // largura rolável é exatamente uma cópia, o ponto de reinício sem
      // emenda.
      engine.current.half = track!.scrollWidth / 2;
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    if (reducedMotion) {
      track.style.transform = "none";
      return () => observer.disconnect();
    }

    const maxExtra = maxExtraMultiplier * baseSpeedPxPerSec;
    let raf = 0;

    function tick(now: number) {
      const state = engine.current;
      if (!state.lastTime) state.lastTime = now;
      const dt = Math.min((now - state.lastTime) / 1000, 0.1);
      state.lastTime = now;

      const instantVelocity = state.pendingDelta / Math.max(dt, 1 / 240);
      state.pendingDelta = 0;
      const targetExtra = Math.max(-maxExtra, Math.min(maxExtra, instantVelocity));
      const alpha = 1 - Math.exp(-dt / tauSec);
      state.extra += (targetExtra - state.extra) * alpha;

      const speed = baseSpeedPxPerSec + state.extra;
      state.progress += speed * dt;
      if (state.half > 0) {
        state.progress = ((state.progress % state.half) + state.half) % state.half;
      }

      if (track) {
        // direction 1: translate vai de 0 a -half (conteúdo entra pela
        // direita, sai pela esquerda). direction -1: vai de -half a 0
        // (conteúdo entra pela esquerda, sai pela direita) — a 2ª cópia
        // ocupa o lugar de "o que ficaria à esquerda da 1ª" sem precisar
        // de uma 3ª cópia; quando o progresso completa `half` e volta a 0,
        // a tela mostra o mesmo recorte de pixel (a cópia é idêntica), daí
        // a emenda invisível nos dois sentidos.
        const translate = direction === 1 ? -state.progress : state.progress - state.half;
        track.style.transform = `translate3d(${translate.toFixed(2)}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [reducedMotion, baseSpeedPxPerSec, direction, maxExtraMultiplier, tauSec]);

  return { trackRef, pushDelta, getProgress };
}
