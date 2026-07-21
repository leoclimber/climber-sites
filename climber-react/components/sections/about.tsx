"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, type MotionValue, useMotionValueEvent, useTransform } from "framer-motion";

// Últimos 20% do scroll da imersão — mesmo ponto de WHITEOUT_START usado no
// canvas 3D (coffee-field.tsx, hyperspace-streaks.tsx, hero-canvas.tsx).
//
// Mecânica: um clip-path circular (iris wipe) cresce a partir do ponto de
// fuga das estrias (centro da tela) cobrindo a cena 3D escura com o creme
// do About — não é um fade de opacity, é uma revelação espacial. 150% de
// raio garante cobertura total da tela em qualquer aspect ratio (sempre
// maior que a distância até o canto mais longe, "farthest-corner").
const WHITEOUT_START = 0.8;
const MAX_CLIP_RADIUS = 150;

// As animações de entrada do conteúdo (kicker/título/foto/parágrafo) NÃO
// são scroll-scrubbed — elas disparam UMA VEZ, com durações/eases próprios
// (padrão GSAP ScrollTrigger "play once"), quando o wipe circular passa de
// 40% do próprio caminho.
const ENTRANCE_TRIGGER = WHITEOUT_START + (1 - WHITEOUT_START) * 0.4; // 0.88

// max-width:14ch quebra naturalmente em exatamente 2 linhas: "MADE BY
// HAND" / "EVERY MORNING" — wrap orgânico palavra a palavra, não é quebra
// manual fixa.
const TITLE_WORDS = ["MADE", "BY", "HAND", "EVERY", "MORNING"];

// Aproximações padrão GSAP em cubic-bezier.
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
const EASE_POWER4_INOUT: [number, number, number, number] = [0.83, 0, 0.17, 1];

const RULE_COLOR = "rgba(60,40,30,0.15)";

// Timing do reveal da foto (cortina + de-zoom) — reusado pra saber quando
// a legenda deve começar a aparecer (depois que o reveal termina).
const PHOTO_REVEAL_DELAY = 0.25;
const PHOTO_REVEAL_DURATION = 1.4;

export function AboutReveal({ progress }: { progress: MotionValue<number> }) {
  // useMotionValueEvent só dispara em CHANGE — se o componente montar (ex:
  // hot-reload em dev, ou reload real de página com o navegador
  // preservando o scroll) já em repouso além do trigger, sem nenhum scroll
  // novo o "change" nunca dispara e o conteúdo fica preso invisível pra
  // sempre. Inicializa lendo o valor atual, não assumindo false.
  const [entered, setEntered] = useState(() => progress.get() >= ENTRANCE_TRIGGER);

  useMotionValueEvent(progress, "change", (v) => {
    if (v >= ENTRANCE_TRIGGER) setEntered(true);
    else if (v < WHITEOUT_START) setEntered(false);
  });

  const clipPath = useTransform(progress, (p) => {
    const t = Math.max(0, Math.min(1, (p - WHITEOUT_START) / (1 - WHITEOUT_START)));
    return `circle(${t * MAX_CLIP_RADIUS}% at 50% 50%)`;
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Mobile (<768px) só: título+foto do desktop são posicionamento
          absoluto lado-a-lado com valores em vw/ch calibrados pra essa
          composição — em telas estreitas o título (width:15ch num
          clamp que já bate no mínimo de 3.2rem ali) fica bem mais largo
          que a coluna de 55vw, estourando por cima da foto/viewport. Em
          vez de tocar os valores desktop (proibido — TRAVA), sobrescreve
          só dentro do media query, via !important, os 3 blocos que
          precisam mudar de geometria: coluna de texto vira full-width no
          topo, título ganha wrap natural numa fonte menor, foto desce pra
          embaixo do texto em vez de ficar do lado — os dois juntos ainda
          cabem dentro dos ~100dvh do pin do Hero (56vh texto + 2vh
          respiro + 38vh foto = 96vh). Nenhuma regra aqui tem efeito em
          >=768px: cada seletor só existe dentro do media query. */}
      <style>{`
        @media (max-width: 767px) {
          .about-text-col {
            width: 100% !important;
            height: 56vh !important;
            padding-top: 5vh !important;
          }
          .about-title {
            width: 100% !important;
            max-width: 100% !important;
            font-size: clamp(2rem, 8.5vw, 2.6rem) !important;
          }
          .about-photo-wrap {
            left: 0 !important;
            top: 58vh !important;
            width: 100% !important;
            height: 38vh !important;
            aspect-ratio: auto !important;
          }
        }
      `}</style>
      <motion.div className="absolute inset-0 bg-[#EDE7DC]" style={{ clipPath }}>
        {/* Coluna esquerda: 55% da largura, altura até a base da foto
            (98vh = top:6vh + height:92vh dela) pra permitir ancorar o
            bloco EST. 2019 no fundo via margin-top:auto no flex. */}
        <div
          className="about-text-col absolute left-0 top-0 z-20 flex flex-col items-start px-8 sm:px-16"
          style={{ width: "55vw", height: "98vh", paddingTop: "14vh" }}
        >
          <motion.span
            className="font-mono uppercase text-[#151008]"
            style={{ fontSize: "0.7rem", letterSpacing: "0.35em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 0.45 : 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
          >
            (About us)
          </motion.span>

          {/* Régua editorial logo abaixo do kicker */}
          <motion.div
            className="mt-4 h-px w-full"
            style={{ backgroundColor: RULE_COLOR }}
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
          />

          <h2
            className="about-title mt-6 uppercase text-[#151008]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontSize: "clamp(3.2rem, 5.5vw, 6rem)",
              lineHeight: 0.88,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              // Medido: "EVERY MORNING" precisa de ~14.34ch nesta fonte/peso —
              // 14ch cortava. 15ch dá margem seguindo o pedido de 14ch.
              // width (não maxWidth): como é item flex com align-items
              // flex-start, maxWidth deixa o shrink-to-fit "greedy" quebrar
              // mais cedo do que precisaria — width força a caixa exata.
              width: "15ch",
            }}
          >
            {TITLE_WORDS.map((word, i) => (
              <span key={word} className="mr-[0.28em] inline-block overflow-hidden align-top">
                <motion.span
                  className="inline-block"
                  initial={{ y: "100%" }}
                  animate={{ y: entered ? "0%" : "100%" }}
                  transition={{
                    duration: 0.6,
                    ease: EASE_POWER3_OUT,
                    delay: entered ? i * 0.08 : 0,
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.p
            className="text-[#151008]"
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.75,
              maxWidth: "340px",
              // Mais perto do título (era 8vh) — pertence ao bloco do
              // título, o vazio fica todo embaixo, não flutuando solto.
              marginTop: "4vh",
              // Quebra de grid proposital: o parágrafo não alinha com o
              // título, é indentado à parte.
              marginLeft: "15%",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: entered ? 0.7 : 0, y: entered ? 0 : 20 }}
            transition={{
              duration: 0.5,
              ease: EASE_POWER3_OUT,
              delay: entered ? 0.7 : 0,
            }}
          >
            Every cup starts before sunrise. We pick the beans, dial in the
            grind, and pull shot after shot until it&apos;s right. No rush
            — just craft. You&apos;ll taste it in the first sip.
          </motion.p>

          {/* Bloco de ancoragem: margin-top:auto no flex-col empurra pro
              fundo do wrapper (98vh = base da foto), amarrando as duas
              colunas em vez de flutuar solto depois do parágrafo. */}
          <motion.div
            className="flex items-center gap-4 text-[#151008]"
            style={{ marginTop: "auto", fontSize: "0.75rem", letterSpacing: "0.25em" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: entered ? 0.4 : 0, y: entered ? 0 : 20 }}
            transition={{
              duration: 0.5,
              ease: EASE_POWER3_OUT,
              delay: entered ? 0.9 : 0,
            }}
          >
            <span className="uppercase">Est. 2019</span>
            <span className="h-4 w-px bg-current" />
            <span className="uppercase">100% Arabica</span>
          </motion.div>
        </div>

        {/* Foto: sangra pra fora do fluxo até a borda REAL da viewport —
            posicionada relativa ao próprio motion.div de fundo (100vw),
            não à coluna com padding, pra garantir zero absoluto de verdade. */}
        <div
          className="about-photo-wrap absolute right-0 overflow-hidden"
          style={{
            top: "6vh", // padding-top:14vh do texto, menos 8vh — invade a faixa superior
            width: "42vw",
            height: "92vh",
            aspectRatio: "3 / 4",
          }}
        >
          {/* Cortina: abre de baixo pra cima */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{
              clipPath: entered ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
            }}
            transition={{
              duration: PHOTO_REVEAL_DURATION,
              ease: EASE_POWER4_INOUT,
              delay: entered ? PHOTO_REVEAL_DELAY : 0,
            }}
          >
            {/* Simultâneo: a imagem de-zooma de 1.18 pra 1.0 */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.18 }}
              animate={{ scale: entered ? 1 : 1.18 }}
              transition={{
                duration: PHOTO_REVEAL_DURATION,
                ease: EASE_POWER4_INOUT,
                delay: entered ? PHOTO_REVEAL_DELAY : 0,
              }}
            >
              <Image
                src="/images/about/sobre.jpg"
                alt=""
                fill
                priority
                sizes="42vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Legenda: fora das camadas de cortina/de-zoom (não é clipada
              nem escalada com a foto) — nasce só depois que o reveal da
              foto termina de vez. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{
              duration: 0.6,
              ease: "linear",
              delay: entered ? PHOTO_REVEAL_DELAY + PHOTO_REVEAL_DURATION : 0,
            }}
          >
            {/* Gradiente de legibilidade — z-index explícito abaixo do
                caption, dentro do container da foto. */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 z-10"
              style={{
                width: "100%",
                height: "25%",
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 z-20 flex items-center gap-1"
              style={{
                padding: "2vw",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
              }}
            >
              <span>↳</span>
              <span>06:14 — first pour of the day</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
