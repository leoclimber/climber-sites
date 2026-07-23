"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  // MOBILE-ONLY: o bloco empilhado (kicker/título/parágrafo/rodapé/foto)
  // é mais alto que os ~100vh disponíveis dentro do pin (a foto sozinha,
  // em largura total e proporção real 3:4, já pede ~78vh) — impossível
  // caber tudo de uma vez sem cortar. Em vez de cortar (bug relatado: a
  // foto perdia a xícara pro overflow-hidden do wrapper), o bloco todo
  // PANA verticalmente — a MESMA técnica de scroll-scrub já usada pro
  // clip-path acima, só que aplicada como translateY no conteúdo em vez
  // de crescer um raio. Mede a altura real do conteúdo via ref (não
  // chuta um valor em vh) pra funcionar em qualquer largura/fonte/
  // quebra de linha sem recalibrar manualmente. Em telas >=768px este
  // ref nunca é medido de verdade (o wrapper que o contém fica
  // display:none via media query, ver <style> abaixo — offsetHeight de
  // elemento display:none é 0), então panDistance fica 0 e o transform
  // não tem efeito nenhum no desktop.
  const panContentRef = useRef<HTMLDivElement>(null);
  const panViewportRef = useRef<HTMLDivElement>(null);
  const [panDistance, setPanDistance] = useState(0);
  useEffect(() => {
    function measure() {
      const content = panContentRef.current;
      const viewport = panViewportRef.current;
      if (!content || !viewport) return;
      setPanDistance(Math.max(0, content.scrollHeight - viewport.offsetHeight));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const panY = useTransform(progress, [WHITEOUT_START, 1], [0, -panDistance]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Mobile (<768px) só: a versão desktop (texto+foto lado a lado,
          absolute posicionado em vw/ch calibrados pra essa composição)
          simplesmente não cabe numa tela estreita sem cortar algo — uma
          leva anterior tentou empurrar a foto pra full-width mantendo o
          resto igual, e o excesso de altura (foto sozinha pede ~78vh
          numa largura de 390px, na proporção real 3:4) estourava o
          fundo dos ~100vh do pin e era cortado pelo overflow-hidden do
          wrapper — sumia a metade de baixo da foto (a xícara, bug
          relatado). Em vez de cortar, esconde os blocos desktop aqui
          (.about-text-col/.about-photo-wrap) e mostra, só em mobile, o
          bloco empilhado abaixo (kicker → título → parágrafo → rodapé →
          foto, todos em fluxo normal, mais alto que os 100vh
          disponíveis) que PANA verticalmente (panY, calculado acima) em
          vez de tentar caber tudo de uma vez. Nenhuma regra aqui afeta
          >=768px: cada seletor só existe dentro do media query. */}
      <style>{`
        @media (max-width: 767px) {
          .about-text-col,
          .about-photo-wrap {
            display: none !important;
          }
          .about-mobile-pan-viewport {
            display: block !important;
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
                sizes="(max-width: 767px) 100vw, 42vw"
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

        {/* MOBILE-ONLY: bloco empilhado com pan vertical — ver comentário
            grande acima do <style>. display:none por padrão (regra
            inline abaixo), só vira display:block dentro do media query
            (max-width:767px) definido no <style> acima. Ocupa a MESMA
            posição/tamanho do pin (absolute inset-0, ~100vh) — é a
            JANELA (overflow:hidden) através da qual o conteúdo mais alto
            pana. */}
        <div
          ref={panViewportRef}
          className="about-mobile-pan-viewport absolute inset-0 overflow-hidden"
          style={{ display: "none" }}
        >
          <motion.div ref={panContentRef} className="px-6" style={{ y: panY, paddingTop: "15vh", paddingBottom: "6vh" }}>
            <motion.div
              className="uppercase text-[#151008]"
              style={{ fontSize: "0.7rem", letterSpacing: "0.35em" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 0.45 : 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
            >
              (About us)
            </motion.div>
            <motion.div
              className="mt-4 h-px w-full"
              style={{ backgroundColor: RULE_COLOR }}
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
            />

            <h2
              className="mt-6 uppercase text-[#151008]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: "clamp(2.2rem, 9vw, 2.8rem)",
                lineHeight: 0.95,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                maxWidth: "14ch",
              }}
            >
              {TITLE_WORDS.map((word, i) => (
                <span key={word} className="mr-[0.24em] inline-block overflow-hidden align-top">
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
              style={{ fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "44ch", marginTop: "3vh" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: entered ? 0.7 : 0, y: entered ? 0 : 20 }}
              transition={{ duration: 0.5, ease: EASE_POWER3_OUT, delay: entered ? 0.7 : 0 }}
            >
              Every cup starts before sunrise. We pick the beans, dial in the
              grind, and pull shot after shot until it&apos;s right. No rush
              — just craft. You&apos;ll taste it in the first sip.
            </motion.p>

            <motion.div
              className="flex items-center gap-4 text-[#151008]"
              style={{ marginTop: "4vh", fontSize: "0.75rem", letterSpacing: "0.25em" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: entered ? 0.4 : 0, y: entered ? 0 : 20 }}
              transition={{ duration: 0.5, ease: EASE_POWER3_OUT, delay: entered ? 0.9 : 0 }}
            >
              <span className="uppercase">Est. 2019</span>
              <span className="h-4 w-px bg-current" />
              <span className="uppercase">100% Arabica</span>
            </motion.div>

            {/* Foto: largura total, proporção real (3:4, medida no
                arquivo: 3456x4608 = exatamente 3/4 — confirmado via
                header do JPEG) — zero object-fit:cover cortando nada,
                já que a caixa bate exatamente na proporção da imagem.
                Fica alcançável porque o bloco INTEIRO pana (acima), não
                porque a foto encolheu. */}
            <motion.div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "3 / 4", marginTop: "5vh" }}
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: entered ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
              transition={{ duration: PHOTO_REVEAL_DURATION, ease: EASE_POWER4_INOUT, delay: entered ? PHOTO_REVEAL_DELAY : 0 }}
            >
              <Image src="/images/about/sobre.jpg" alt="" fill sizes="100vw" className="object-cover" />
              <div
                className="pointer-events-none absolute bottom-0 left-0 z-10"
                style={{ width: "100%", height: "25%", background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
              />
              <motion.div
                className="absolute bottom-0 left-0 z-20 flex items-center gap-1"
                style={{ padding: "4vw", fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.9)", fontWeight: 400 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: entered ? 1 : 0 }}
                transition={{ duration: 0.6, ease: "linear", delay: entered ? PHOTO_REVEAL_DELAY + PHOTO_REVEAL_DURATION : 0 }}
              >
                <span>↳</span>
                <span>06:14 — first pour of the day</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
