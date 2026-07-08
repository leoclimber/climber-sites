// ============================================================================
// THE POUR A — SHOWPIECE SCROLL-SCRUB (café, modo cinematic_a)
// Injetado via placeholder THE_POUR_A_PLACEHOLDER depois da geração do Opus.
//
// EFEITO (igual à referência noirpixel): a cena do café (frame sequence extraída
// de pour_scene.mp4 — xícara centralizada + grãos→leite→gelo se transformando de
// forma fluida) fica CENTRALIZADA, sem fundo/moldura. O SCROLL controla qual
// frame é desenhado. Rolar pra baixo avança a cena; rolar pra cima rebobina.
// Movimento único e contínuo, nunca slide. A xícara desce de leve conforme rola.
//
// POR QUE FRAME SEQUENCE (e não vídeo scrubado): setar video.currentTime no
// scroll é a abordagem antiga — trava/engasga em Safari/iPhone mesmo com
// interpolação. Frame sequence (estilo Apple) é 100% confiável em qualquer
// device: são só imagens pré-carregadas trocadas num <canvas>, sem decode de
// vídeo envolvido. O loop rAF interpola (lerp) o progresso alvo do scroll pro
// índice de frame desenhado, então o movimento continua liso mesmo pulando
// frames. Copy dos 3 atos aparece em sincronia (editável).
// ============================================================================
function buildPourA(assets) {
  const FRAMES_BASE = assets.framesBase;
  const FRAME_COUNT = assets.frameCount;
  const POSTER = assets.poster;
  return `
<section class="pourA" id="pour" aria-label="The Pour">
  <div class="pourA__stage">
    <div class="pourA__eyebrowtop">// THE POUR</div>
    <canvas class="pourA__canvas" id="pourACanvas" aria-hidden="true"></canvas>
    <img class="pourA__fallback" id="pourAFallback" src="${POSTER}" alt=""/>
    <div class="pourA__scrim" aria-hidden="true"></div>
    <div class="pourA__acts">
      <div class="pourA__act" data-a="0">
        <div class="pourA__eb">01 / Origin</div>
        <h3 class="pourA__ti">It starts with the <em>bean.</em></h3>
        <p class="pourA__li">Single-origin beans, roasted in small batches. Every cup begins long before the pour.</p>
      </div>
      <div class="pourA__act" data-a="1">
        <div class="pourA__eb">02 / Craft</div>
        <h3 class="pourA__ti">Poured with <em>intention.</em></h3>
        <p class="pourA__li">Steamed to silk, poured by hand. The kind of care you can taste in the first sip.</p>
      </div>
      <div class="pourA__act" data-a="2">
        <div class="pourA__eb">03 / Ritual</div>
        <h3 class="pourA__ti">Made to <em>slow you down.</em></h3>
        <p class="pourA__li">More than a drink — a pause in your day. Come sit, stay a while.</p>
      </div>
    </div>
    <div class="pourA__dots">
      <span class="pourA__dot" data-d="0"></span>
      <span class="pourA__dot" data-d="1"></span>
      <span class="pourA__dot" data-d="2"></span>
    </div>
  </div>
</section>
<style>
  .pourA{position:relative;height:420vh}
  .pourA__stage{position:sticky;top:0;height:100vh;overflow:hidden}
  .pourA__canvas,.pourA__fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform;pointer-events:none;filter:saturate(1.12) contrast(1.04);transform:scale(1.12)}
  .pourA__scrim{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(100deg, rgba(246,240,231,.62) 0%, rgba(246,240,231,.32) 26%, transparent 56%)}
  .pourA__acts{position:absolute;left:6vw;top:50%;transform:translateY(-50%);z-index:5;width:min(420px,74vw);min-height:200px}
  .pourA__act{position:absolute;top:0;left:0;width:100%;opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1);pointer-events:none}
  .pourA__act.on{opacity:1;transform:translateY(0)}
  .pourA__eb{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#B5793F;margin-bottom:16px;text-transform:uppercase}
  .pourA__ti{font-size:clamp(2rem,3.4vw,3rem);line-height:1.04;font-weight:700;margin-bottom:14px;letter-spacing:-.5px;color:#2A1D14;text-shadow:0 1px 20px rgba(255,255,255,.5)}
  .pourA__ti em{font-style:normal;color:#B5793F}
  .pourA__li{font-size:16px;line-height:1.7;color:#5a4a3a;max-width:380px}
  .pourA__eyebrowtop{position:absolute;top:38px;left:6vw;z-index:5;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#B5793F;opacity:.9}
  .pourA__dots{position:absolute;bottom:44px;left:6vw;z-index:5;display:flex;gap:10px}
  .pourA__dot{width:26px;height:3px;border-radius:2px;background:rgba(42,29,20,.2);transition:background .4s}
  .pourA__dot.on{background:#B5793F}
  @media(max-width:820px){
    .pourA{height:380vh}
    .pourA__scrim{background:linear-gradient(180deg, rgba(246,240,231,.2) 0%, rgba(246,240,231,.5) 62%, rgba(246,240,231,.78) 100%)}
    .pourA__acts{left:0;right:0;top:auto;width:auto;bottom:14vh;transform:none;padding:0 8vw;max-width:none}
    .pourA__ti{text-shadow:0 1px 24px rgba(255,255,255,.7)}
  }
  @media(prefers-reduced-motion:reduce){
    .pourA{height:auto}
    .pourA__stage{position:relative;height:auto;min-height:100vh}
  }
</style>
<script>
(function(){
  var section=document.getElementById('pour');
  if(!section)return;
  var canvas=document.getElementById('pourACanvas');
  var ctx=canvas.getContext('2d');
  var fallback=document.getElementById('pourAFallback');
  var acts=section.querySelectorAll('.pourA__act');
  var dots=section.querySelectorAll('.pourA__dot');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FRAME_COUNT=${FRAME_COUNT};
  var FRAMES_BASE='${FRAMES_BASE}';
  function frameUrl(i){ return FRAMES_BASE+'/frame'+String(i).padStart(3,'0')+'.webp'; }
  var frames=[], failed=false, sized=false, revealed=false;
  var progress=0;      // alvo vindo do scroll (0..1)
  var current=0;       // valor interpolado (0..1) — o que vira índice de frame
  var dy=0;            // deslocamento vertical da cena
  var dpr=Math.min(window.devicePixelRatio||1,2);
  function clamp(v,a,b){return v<a?a:(v>b?b:v);}

  function sizeCanvas(img){
    canvas.width=Math.round((img.naturalWidth||1280)*dpr);
    canvas.height=Math.round((img.naturalHeight||720)*dpr);
    sized=true;
  }
  function onFrameError(){
    if(failed)return; failed=true;
    canvas.style.display='none'; fallback.style.display='block';
  }
  for(var i=1;i<=FRAME_COUNT;i++){
    var img=new Image();
    img.onerror=onFrameError;
    img.src=frameUrl(i);
    frames.push(img);
  }

  function onScroll(){
    var rect=section.getBoundingClientRect();
    var total=section.offsetHeight-window.innerHeight;
    var passed=clamp(-rect.top,0,total);
    progress=total>0?passed/total:0;
  }

  function paint(){
    // atos por terço (baseado no alvo pra reagir rápido)
    var idx=clamp(Math.floor(progress*3),0,2);
    for(var i=0;i<acts.length;i++){ acts[i].classList.toggle('on', i===idx); }
    for(var k=0;k<dots.length;k++){ dots[k].classList.toggle('on', k===idx); }
    // cena desce de leve (movimento único e contínuo). O scale(1.12) na base
    // (CSS) dá margem de sobra pra esse translateY nunca expor borda vazia
    // — full-bleed sempre coberto, mesmo com o drift.
    var ndy=(-18 + current*36);
    if(Math.abs(ndy-dy)>0.1){ dy=ndy; var t='translateY('+dy.toFixed(1)+'px) scale(1.12)'; canvas.style.transform=t; if(fallback)fallback.style.transform=t; }
    if(failed)return;
    // índice de frame vem do valor JÁ INTERPOLADO (current), não do alvo bruto —
    // é isso que faz a troca de frame ficar lisa em vez de saltada.
    var fi=clamp(Math.round(current*(FRAME_COUNT-1)),0,FRAME_COUNT-1);
    var frame=frames[fi];
    if(frame && frame.complete && frame.naturalWidth){
      if(!sized) sizeCanvas(frame);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(frame,0,0,canvas.width,canvas.height);
      if(!revealed){ revealed=true; fallback.style.display='none'; }
    }
  }

  function loop(){
    // interpola current -> progress (suaviza a troca de frame)
    current += (progress-current)*0.12;
    if(Math.abs(progress-current)<0.0005) current=progress;
    paint();
    requestAnimationFrame(loop);
  }

  if(reduce){
    // sem scrub: mostra um frame representativo e o último ato, sem animar
    acts[acts.length-1].classList.add('on');
    dots[dots.length-1].classList.add('on');
    current=progress=0.6;
    (function paintStill(){
      var frame=frames[Math.floor(FRAME_COUNT*0.6)];
      if(frame && frame.complete && frame.naturalWidth){
        sizeCanvas(frame); ctx.drawImage(frame,0,0,canvas.width,canvas.height); fallback.style.display='none';
      } else if(!failed){ requestAnimationFrame(paintStill); }
    })();
  } else {
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    onScroll();
    loop();
  }
})();
</script>`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });

  // Marca se já enviamos os headers da resposta (streaming). Depois disso, NENHUM
  // caminho pode usar res.status().json() — só res.write()/res.end() — senão o
  // Node estoura ERR_HTTP_HEADERS_SENT. O catch final usa esta flag pra decidir.
  let headersSent = false;

  try {
    const body = req.body || {};
    const businessName = (body.businessName || "").substring(0, 100);
    const businessType = (body.businessType || "").substring(0, 100);
    const city = (body.city || "Dublin, Ireland").substring(0, 100);
    const phone = (body.phone || "").substring(0, 50);
    const email = (body.email || "").substring(0, 100);
    const address = (body.address || "").substring(0, 200);
    const rating = (body.rating || "4.9").substring(0, 10);
    const reviewCount = (body.reviewCount || "100+").substring(0, 20);
    const hours = (body.hours || "").substring(0, 300);
    const services = (body.services || "").substring(0, 600);
    const whatsapp = (body.whatsapp || "").substring(0, 30);
    const bookingLink = (body.bookingLink || "").substring(0, 300);
    const vibe = (body.vibe || "").substring(0, 200);
    const colors = (body.colors || "").substring(0, 200);
    const logoUrl = (body.logoUrl || "").substring(0, 500);
    const clientPhotos = (body.clientPhotos || "").substring(0, 3000);
    const referenceUrl = (body.referenceUrl || "").substring(0, 300);
    const heroVideoBase64 = body.heroVideoBase64 || "";
    const heroHeadline = (body.heroHeadline || "").substring(0, 200);
    const heroSubtitle = (body.heroSubtitle || "").substring(0, 300);
    const aboutText = (body.aboutText || "").substring(0, 1000);
    const suggestedColors = (body.suggestedColors || "").substring(0, 200);
    const suggestedFonts = (body.suggestedFonts || "").substring(0, 200);
    const editInstruction = (body.editInstruction || "").substring(0, 500);
    const previousHtml = (body.previousHtml || "").substring(0, 60000);
    // MODO DE GERAÇÃO — SISTEMA DE 3 SLOTS UNIVERSAL:
    //   "clean"        -> versão elegante e sóbria (todo nicho tem)
    //   "cinematic_a"  -> cinematográfico principal do nicho (slot A)
    //   "cinematic_b"  -> cinematográfico variação do nicho (slot B)
    // Retrocompatível: o valor antigo "cinematic" vira "cinematic_a".
    // Default: "clean" (mais seguro/rápido/garantido).
    let mode = (body.mode || "clean").toLowerCase();
    if (mode === "cinematic") mode = "cinematic_a"; // retrocompat
    if (mode !== "clean" && mode !== "cinematic_a" && mode !== "cinematic_b") mode = "clean";
    // flag genérica: é algum modo cinematográfico?
    const isCinematic = (mode === "cinematic_a" || mode === "cinematic_b");

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

    // ---------- CATEGORIZAÇÃO ----------
    const t = businessType.toLowerCase();
    let category = "generic";
    // ===== ALIMENTAÇÃO =====
    if (t.includes("burger") || t.includes("smash") || t.includes("hamburg")) category = "burger";
    else if (t.includes("pizza")) category = "pizza";
    else if (t.includes("sushi") || t.includes("japan") || t.includes("ramen") || t.includes("japon")) category = "japanese";
    else if (t.includes("arab") || t.includes("lebanes") || t.includes("kebab") || t.includes("shawarma") || t.includes("árab")) category = "arabic";
    else if (t.includes("africa") || t.includes("afric")) category = "african";
    else if (t.includes("brazil") || t.includes("brasil")) category = "brazilian";
    else if (t.includes("ital") || t.includes("pasta") || t.includes("trattoria")) category = "italian";
    else if (t.includes("steak") || t.includes("grill") || t.includes("bbq") || t.includes("churrasc")) category = "steak";
    else if (t.includes("cafe") || t.includes("coffee") || t.includes("bakery") || t.includes("padaria") || t.includes("café")) category = "cafe";
    else if (t.includes("confeit") || t.includes("doce") || t.includes("dessert") || t.includes("patisser") || t.includes("cake")) category = "confectionery";
    else if (t.includes("food truck") || t.includes("foodtruck")) category = "foodtruck";
    else if (t.includes("pub") || t.includes("bar")) category = "pub";
    else if (t.includes("fine dining") || t.includes("restaurant") || t.includes("food") || t.includes("bistro") || t.includes("dining") || t.includes("restaurante")) category = "restaurant";
    // ===== BELEZA & ESTÉTICA =====
    else if (t.includes("barb")) category = "barber";
    else if (t.includes("nail") || t.includes("unha")) category = "nail";
    else if (t.includes("brow") || t.includes("sobrancelha") || t.includes("lash") || t.includes("cílios") || t.includes("cilios")) category = "brows";
    else if (t.includes("tan") || t.includes("bronze")) category = "tanning";
    else if (t.includes("aesthet") || t.includes("botox") || t.includes("skin") || t.includes("estetic") || t.includes("estétic") || t.includes("harmoniz") || t.includes("facial")) category = "aesthetic";
    else if (t.includes("body") || t.includes("drenag") || t.includes("criolip") || t.includes("corporal")) category = "bodyaesthetic";
    else if (t.includes("salon") || t.includes("hair") || t.includes("beauty") || t.includes("cabelo") || t.includes("salão") || t.includes("salao")) category = "salon";
    else if (t.includes("spa") || t.includes("massage") || t.includes("massag")) category = "spa";
    else if (t.includes("tattoo") || t.includes("tatuage") || t.includes("tatua")) category = "tattoo";
    // ===== SAÚDE =====
    else if (t.includes("dental") || t.includes("dentist") || t.includes("dentista") || t.includes("odonto")) category = "dental";
    else if (t.includes("physio") || t.includes("fisio")) category = "physio";
    else if (t.includes("nutri")) category = "nutrition";
    else if (t.includes("psico") || t.includes("psych") || t.includes("terap") || t.includes("therap")) category = "psychology";
    else if (t.includes("vet") || t.includes("veterin")) category = "vet";
    else if (t.includes("clinic") || t.includes("health") || t.includes("clínica") || t.includes("clinica")) category = "clinic";
    // ===== FITNESS =====
    else if (t.includes("yoga") || t.includes("pilates")) category = "yoga";
    else if (t.includes("gym") || t.includes("fitness") || t.includes("crossfit") || t.includes("box") || t.includes("personal") || t.includes("academia")) category = "gym";
    // ===== SERVIÇOS =====
    else if (t.includes("laundr") || t.includes("lavand")) category = "laundry";
    else if (t.includes("auto") || t.includes("garage") || t.includes("mechanic") || t.includes("car ") || t.includes("oficina") || t.includes("mecânic")) category = "auto";
    else if (t.includes("groom") || t.includes("tosa") || t.includes("banho e tosa")) category = "petgrooming";
    else if (t.includes("pet")) category = "pet";
    else if (t.includes("locksmith") || t.includes("chaveiro")) category = "locksmith";
    else if (t.includes("electric") || t.includes("plumb") || t.includes("eletric") || t.includes("encanad")) category = "handyman";
    // ===== OUTROS PREMIUM =====
    else if (t.includes("boutique") && t.includes("hotel")) category = "hotel";
    else if (t.includes("jewel") || t.includes("joalher") || t.includes("joia")) category = "jewelry";
    else if (t.includes("cloth") || t.includes("boutique") || t.includes("fashion") || t.includes("roupa") || t.includes("moda")) category = "clothing";
    else if (t.includes("photo") || t.includes("fotograf") || t.includes("studio") || t.includes("estúdio")) category = "photography";
    else if (t.includes("construction") || t.includes("build") || t.includes("real estate") || t.includes("imobili") || t.includes("property") || t.includes("construtora")) category = "construction";

    // ---------- FLAG DO SHOWPIECE THE POUR A ----------
    // Declarada AQUI no topo (não dentro do bloco else) para ficar visível também
    // na etapa de injeção do bloco carimbado lá embaixo. Se ficar dentro do else,
    // dá "isCinematicCafeA is not defined" na hora de injetar (bug corrigido).
    const isCinematicCafeA = category === "cafe" && mode === "cinematic_a";

    // ---------- KITS DE DIREÇÃO DE ARTE POR NICHO ----------
    const kits = {
      burger: {
        palette: "ink #12100E / ember #E4551F / cream #F3EDE1 / char #1E1A15 / gold-line #C9A24B",
        fonts: "Display: 'Anton' or heavy condensed grotesque, tight tracking; Body: 'Inter'; huge bold display for burger names",
        mood: "close-up cinematic smash burger, melted cheese dripping, char-grilled edges, deep shadow, warm rim light, steam, appetite-driven macro",
        signature: "hero with the signature burger filling the screen, cheese pull / sizzle / steam, menu prices as a bold typographic list (never emoji icons)",
        tone: "bold, hungry, unapologetic — swagger and flavor, describe the char and the crunch",
      },
      steak: {
        palette: "charcoal #17130F / ember #B4472E / bone #EDE7DB / smoke #33291F / brass #B08D57",
        fonts: "Display: strong serif or condensed grotesque with weight; Body: 'Inter'",
        mood: "seared steak with grill marks, flame, smoke, dark moody steakhouse, warm dramatic light, premium cut close-up",
        signature: "hero with the sizzling cut / flame-kissed sear, smoke rising, dark and premium",
        tone: "premium, primal, confident — fire, craft, the perfect cut",
      },
      restaurant: {
        palette: "ink #12100E / ember #E4551F / cream #F3EDE1 / char #1E1A15 / gold-line #C9A24B",
        fonts: "Display: 'Anton' or condensed grotesque, tight; Body: 'Inter'; use heavy display for food names",
        mood: "close-up cinematic food, deep shadow, warm rim light, steam, appetite-driven macro shots",
        signature: "hero with the signature dish filling the screen, sizzle/steam, menu prices as bold typographic list (never emoji icons)",
        tone: "confident, sensory, hungry — describe flavor and craft, not 'we serve quality food'",
      },
      japanese: {
        palette: "sumi-black #14110F / washi #EFEAE1 / vermilion #B4472E / stone #6E6A63 / gold #B08D57",
        fonts: "Display: elegant high-contrast serif or refined sans with wide tracking; Body: 'Inter' or 'Noto Sans'",
        mood: "minimal, negative space, single piece of sushi lit precisely, dark calm background, zen restraint",
        signature: "extreme minimalism, one hero image with huge negative space, precise plating, quiet luxury",
        tone: "restrained, precise, reverent — omakase energy, craft and silence",
      },
      pizza: {
        palette: "charcoal #171310 / tomato #C7362B / basil #3C6B3F / cream #F4EEE2 / crust #D9A441",
        fonts: "Display: warm bold serif or vintage script; Body: 'Inter'",
        mood: "wood-fired oven glow, melting cheese pull, rustic wood, flour dust, artisan hands",
        signature: "hero with the cheese pull / oven flame, artisanal warmth",
        tone: "artisanal, warm, family-craft — fire, dough, tradition",
      },
      pub: {
        palette: "forest #14231A / brass #C9933E / oat #EDE4D3 / oak #3A2C1E / stout #0E0B08",
        fonts: "Display: traditional serif with character (e.g. Playfair-style but restrained); Body: 'Inter'",
        mood: "warm amber pub interior, pint with backlight, dark wood, cozy low light, live atmosphere",
        signature: "hero with the perfect pint being pulled, warm amber glow, heritage feel",
        tone: "welcoming, heritage, community — the local everyone loves",
      },
      barber: {
        palette: "obsidian #0C0C0C / brass #B8923F / bone #F0ECE0 / leather #2A2018 / steel #8A8A8A",
        fonts: "Display: strong condensed uppercase (e.g. 'Oswald'/'Bebas'); Body: 'Inter'",
        mood: "moody masculine, close-up of clean fade, straight razor, leather chair, dramatic side light",
        signature: "before/after transition of a sharp cut, razor/scissors motion, dark and precise",
        tone: "sharp, confident, masculine — craft and precision, not 'we cut hair'",
      },
      cafe: {
        palette: "espresso #2A1D14 / caramel #B5793F / oat-milk #F6F0E7 / sage #7C8471 / cocoa #4A342260",
        fonts: "Display: friendly modern serif or warm sans; Body: 'Inter'",
        mood: "morning light, latte art top-down, warm textures, croissant flake, calm cozy",
        signature: "hero with pour / latte art from above, warm inviting light",
        tone: "warm, slow-morning, neighborly — ritual and comfort",
      },
      salon: {
        palette: "porcelain #F7F2EE / mauve #B27C71 / espresso #3A2B26 / blush #E3C4B8 / gold #C29A5B",
        fonts: "Display: elegant modern serif with flair; Body: 'Inter'",
        mood: "soft editorial beauty, hair movement, glossy finish, clean bright studio, feminine luxury",
        signature: "before/after transformation, hair in motion, editorial glamour",
        tone: "elevated, feminine, transformative — glow-up and confidence",
      },
      nail: {
        palette: "petal #FBF4F1 / rose #E0919F / plum #4A2C3A / cream #F3E7E0 / gilt #CB9E6B",
        fonts: "Display: delicate high-contrast serif; Body: 'Inter'",
        mood: "macro of manicure detail, soft pastel, delicate hands, clean bright, dainty",
        signature: "macro close-up of flawless nail art, soft pastel gradient shifts",
        tone: "delicate, pampering, detail-obsessed",
      },
      tattoo: {
        palette: "void #0A0A0A / blood #B21F1F / ash #EDEDED / smoke #2E2E2E / bone #CFC9BE",
        fonts: "Display: bold blackletter-adjacent or heavy condensed; Body: 'Inter'",
        mood: "dark studio, ink close-up, needle detail, dramatic single light, skin texture, artistic",
        signature: "a line/tattoo drawing itself as you scroll (SVG path reveal), dark and artistic",
        tone: "bold, artistic, permanent — commitment and craft",
      },
      gym: {
        palette: "black #0D0D0D / volt #E4FF3A / steel #7A7F86 / concrete #1C1E20 / white #F4F5F6",
        fonts: "Display: heavy condensed uppercase, aggressive; Body: 'Inter'",
        mood: "high-contrast bodies in motion, sweat, chalk, dramatic gym light, energy and power",
        signature: "kinetic hero, motion blur of movement, bold stat callouts, high energy",
        tone: "driven, intense, no-excuses — transformation and discipline",
      },
      spa: {
        palette: "clay #EBE3D9 / sand #C7B49B / umber #5A4A3A / eucalyptus #8A9A85 / ivory #FBF8F3",
        fonts: "Display: light airy serif with wide spacing; Body: 'Inter', generous line-height",
        mood: "calm water, steam, oil drop, soft natural light, stones, slow and serene",
        signature: "flowing water / oil ripple, color temperature shifts warm→calm as you scroll",
        tone: "serene, restorative, unhurried — the reader should feel calm just reading",
      },
      aesthetic: {
        palette: "pearl #F6F1EC / champagne #C9A87C / mocha #4A3B32 / rose-nude #E4C7B8 / bronze #A87E52",
        fonts: "Display: refined luxury serif; Body: 'Inter', clean clinical spacing",
        mood: "soft-focus beauty, glowing skin, clean clinical luxury, subtle before/after, radiant",
        signature: "elegant before/after reveal, glowing skin close-up, quiet clinical luxury",
        tone: "refined, confidence-building, expert — natural results and trust",
      },
      dental: {
        palette: "clean-white #F9FBFC / sky #3E8FB0 / navy #1E3A4C / mint #BFE3DD / slate #55636B",
        fonts: "Display: clean modern sans, trustworthy; Body: 'Inter'",
        mood: "bright clean clinic, calm patient, soft light, fresh and reassuring, professional",
        signature: "calm confident smile reveal, bright airy clinical space, trust-first",
        tone: "reassuring, gentle, expert — comfort and confidence, never clinical-cold",
      },
      clinic: {
        palette: "off-white #F7F9F9 / teal #2E8B8B / deep #1F3B3B / soft-green #C6E0DA / grey #5C6A6A",
        fonts: "Display: clean humanist sans; Body: 'Inter'",
        mood: "calm professional care, soft light, human warmth, clean and trustworthy",
        signature: "calm reassuring hero, human-centered care, trust markers",
        tone: "caring, professional, human — wellbeing first",
      },
      auto: {
        palette: "graphite #161718 / amber #E0A829 / steel #8A8F94 / carbon #0E0F10 / white #ECEEEF",
        fonts: "Display: industrial condensed; Body: 'Inter'",
        mood: "detailed machinery, dramatic garage light, chrome, precision engineering, powerful",
        signature: "engine/part detail with dramatic light, precision and power",
        tone: "precise, dependable, expert — engineering and trust",
      },
      pet: {
        palette: "cream #F6F0E6 / coral #E88B6A / forest #3E5C48 / sky #8FB8C9 / warm-grey #6B655C",
        fonts: "Display: friendly rounded; Body: 'Inter'",
        mood: "joyful pets, natural light, warm caring hands, playful and clean",
        signature: "happy pet hero, warmth and care, playful motion",
        tone: "caring, warm, playful — love for animals",
      },
      construction: {
        palette: "concrete #E7E4DF / graphite #1C1C1A / blueprint #2C5A7A / amber #C88A3C / steel #6E7377",
        fonts: "Display: architectural grotesque, wide; Body: 'Inter', technical spacing",
        mood: "architectural models, structure detail, clean daylight, precision, materiality",
        signature: "the building CONSTRUCTS itself as you scroll (foundation → frame → structure → finished home), each stage with a copy line",
        tone: "solid, crafted, engineered — built to last, made for you",
      },
      generic: {
        palette: "midnight #0F1729 / azure #3B7DD8 / cloud #E8EEF6 / slate #334155 / mint #4FD1C5",
        fonts: "Display: strong modern sans; Body: 'Inter'",
        mood: "clean professional, confident light, modern and premium",
        signature: "bold confident hero, clean modern premium feel",
        tone: "professional, confident, modern",
      },
    };

    const kit = kits[category] || kits.generic;

    // ---------- BANCO DE IMAGENS POR NICHO ----------
    const BANK_REPO = "leoclimber/climber-sites";
    const BANK_BRANCH = "main";
    const bankBase = `https://raw.githubusercontent.com/${BANK_REPO}/${BANK_BRANCH}/banco/${category}`;
    const bankPhotos = [
      `${bankBase}/hero.jpg`,
      `${bankBase}/1.jpg`,
      `${bankBase}/2.jpg`,
      `${bankBase}/3.jpg`,
      `${bankBase}/4.jpg`,
      `${bankBase}/ambiente.jpg`,
    ];

    // ---------- BANCO DE VÍDEOS POR NICHO ----------
    const bankVideos = {
      stack: `${bankBase}/stack.mp4`,
      sear: `${bankBase}/sear.mp4`,
      // CAFÉ:
      pour: `${bankBase}/pour.mp4`,
      roast: `${bankBase}/roast.mp4`,
    };

    // ---------- FRAME SEQUENCE (usado só pelo café B) ----------
    const bankFrames = {
      base: `${bankBase}/frames`,
      count: 40,
      pattern: `${bankBase}/frames/frame`,
      cupPattern: `${bankBase}/frames_cup/frame`,
      lattePattern: `${bankBase}/frames_latte/frame`,
      cafeCount: 40,
      cupReady: true,     // (café A usa seu próprio frame sequence carimbado — frames_pour/ — não este bankFrames)
      latteReady: false,  // true quando frames_latte/ estiver no ar (efeito B)
    };

    // ---------- ASSETS DO SHOWPIECE THE POUR A (café) — FRAME SEQUENCE SCROLL-SCRUB ----------
    // A cena única (xícara + grãos→leite→gelo fluido) foi extraída do vídeo do
    // Seedance (pour_scene.mp4) em 90 frames .webp (banco/cafe/frames_pour/).
    // O scroll controla qual frame é desenhado num <canvas> — estilo Apple,
    // nunca engasga (não há decode de vídeo/seek envolvido).
    // poster = um frame estático de fallback (hero do café) caso os frames falhem.
    const cafePourAssets = {
      framesBase: `${bankBase}/frames_pour`,
      frameCount: 90,
      poster:     `${bankBase}/hero.jpg`,
    };
    // HTML carimbado do showpiece (idêntico toda geração, scroll-scrub liso).
    const POUR_A_HTML = buildPourA(cafePourAssets);

    // ---------- ASSETS DO CLIENTE ----------
    const realPhotos = clientPhotos.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).slice(0, 8);
    const hasRealPhotos = realPhotos.length > 0;
    const hasEnoughRealPhotos = realPhotos.length >= 4;
    const photoList = hasEnoughRealPhotos
      ? realPhotos
      : [...realPhotos, ...bankPhotos].slice(0, 8);
    const usingBank = !hasEnoughRealPhotos;
    const hasVideo = heroVideoBase64 && heroVideoBase64.startsWith("data:video");
    const bookingHref = bookingLink || (whatsapp ? `https://wa.me/${whatsapp}` : (phone ? `tel:${phone}` : "#contact"));
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : (phone ? `tel:${phone}` : "#contact");

    // ---------- MODO EDIÇÃO ----------
    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `You are refining an existing premium website. Here is the current HTML:

${previousHtml}

Apply this change exactly, keeping everything else intact and keeping the same premium quality: "${editInstruction}"

Return the COMPLETE updated HTML only, from <!DOCTYPE html> to </html>. No markdown, no explanation.`;
    } else {
      // ---------- BLOCOS DE CONTEXTO ----------
      const photoBlock = `APPROVED IMAGES — use ONLY these image URLs in the site (hero if no video, gallery, about, backgrounds). ${usingBank ? "These come from our curated premium image bank for this niche — they are high-quality and on-brand." : "These are the client's REAL photos — authentic and top priority."}
${photoList.map((u, i) => `${i + 1}. ${u}`).join("\n")}

ABSOLUTE IMAGE RULES:
- Use ONLY the URLs listed above. NEVER invent, guess, or pull any other image URL (no Unsplash/Pexels/stock searches, no placeholder services). Any image not in this list is forbidden.
- Every <img> src must be EXACTLY one of the URLs above, copied verbatim.
- For robustness, add onerror fallback that swaps .jpg for .png on each bank image, e.g. onerror="if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.png');}". This way images load whether stored as .jpg or .png.
- If you have fewer images than a layout wants, reuse the ones above in different crops, or replace image slots with typographic/color panels. NEVER leave a broken or empty image.
- All images: object-fit: cover, descriptive alt text, no stretching.
- Do not introduce images that clash in style — the list above is already curated to be coherent.`;

      const videoBlock = hasVideo
        ? `A 3D HERO VIDEO is provided by the client. Embed it as a full-screen autoplaying, muted, looping background video in the hero using this exact placeholder src: "HERO_VIDEO_SRC". Structure: <video autoplay muted loop playsinline> with a dark gradient overlay on top and the headline/CTA above it. This is the centerpiece — make the hero cinematic around it.`
        : `No hero video. Build a cinematic hero using the signature concept below, strong typography, and CSS (gradients, subtle motion, scroll-reveal). ${kit.signature}`;

      const refBlock = referenceUrl
        ? `VISUAL REFERENCE for quality bar: "${referenceUrl}". Match that LEVEL of polish and taste (spacing, motion, restraint) — do not copy it, and do not fetch it. Just aim for that tier of quality.`
        : "";

      const logoBlock = logoUrl ? `Client logo (use in the nav header): ${logoUrl}` : "";
      const brandColorBlock = (colors || suggestedColors) ? `Client-stated brand colors to respect: ${colors || suggestedColors}. Blend with the art-direction palette below, letting the client colors lead where they conflict.` : "";
      const fontHint = suggestedFonts ? `Suggested fonts from research: ${suggestedFonts} (use if they fit the direction).` : "";
      const headlineHint = heroHeadline ? `Suggested hero headline: "${heroHeadline}" (refine it, don't use verbatim if you can do better).` : "";
      const aboutHint = aboutText ? `Research notes about the business for the About section: ${aboutText}` : "";

      // ---------- BLOCO DA JORNADA CINEMATOGRÁFICA (BURGER + MODO CINEMATOGRÁFICO) ----------
      const isCinematicBurger = category === "burger" && isCinematic;
      const burgerJourneyBlock = isCinematicBurger ? `

═══════════ BURGER PREMIUM PAGE — CLEAN EDITORIAL LAYOUT + CINEMATIC MOMENTS ═══════════
Build a premium single-page site that is CLEAN, ELEGANT and BREATHABLE as its foundation — generous negative space, confident condensed display typography, strong section rhythm, dark warm palette (ink/ember/cream/gold) — AND injects four genuine "wow" cinematic moments at the right places. The goal is a site that is BOTH elegant AND impressive: an award-winner that never feels cluttered. Do not overload scenes; let each one breathe. Clean layout is the base; the cinematic moments are the seasoning, not the whole meal.

Section eyebrows use small mono labels (e.g. "// THE CUT", "// THE SEAR"). Dark background throughout, warm ember/amber glow as connective tissue between sections. A subtle glowing golden light-ring motif can sit under key product shots.

★★★ GLOBAL FOOD-PHOTO SIZING LAW — STRICT, APPLIES TO THE WHOLE PAGE (this is critical — in past versions the cinematic sections shrank the food photos and killed the appetite; a burger site LIVES on big, generous, appetite-driving food photos, exactly like the clean editorial version): Every food photograph on this page must be LARGE, GENEROUS and APPETITE-DRIVING — the food is the hero of this business, never a small thumbnail. Videos, gauges, counters and interactive widgets must NEVER cause a food image to shrink. Concretely:
- Any burger/food photo used as a feature or hero-adjacent visual must render at a MINIMUM height of 560px on desktop (min-height:560px) and fill its container edge to edge with object-fit:cover — a big, close, mouth-watering crop where the cheese, char and texture are clearly visible. Never letterbox a food photo into a short strip.
- Food photos must dominate their section — a food image should occupy at least ~48% of the section width on desktop when paired with text, and go full-width/near-full-width when standing alone.
- Prefer TIGHT, CLOSE crops (the cheese pull, the sear, the stacked patties) over wide/distant shots. Zoom in on the food. Distant, small-in-frame food is forbidden.
- Never surround a food photo with large empty dark voids that make it look small. If there is dark space, the PHOTO grows to use it, not the void.
This sizing law overrides any layout instinct to shrink images for the sake of widgets. Big food, always.

BUILD THESE SECTIONS IN THIS EXACT ORDER (use the section ids given so nav + CTAs resolve):

★ CINEMATIC MOMENT 1 ★ — SECTION 1: HERO WITH THE STACK VIDEO (id="hero")
   ★ FULL-BLEED HERO VIDEO (like the docmo reference — this is the signature first impression): The STACK VIDEO fills the ENTIRE hero viewport as a full-screen background. ${bankVideos.stack ? `Use the video "${bankVideos.stack}" as a TRUE FULL-BLEED background: <video autoplay muted loop playsinline preload="auto" poster="${photoList[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"> covering the whole hero edge-to-edge, the exploding burger LARGE, CLOSE and clearly visible filling the screen (the food must read big and appetising, not small or distant).
   ★★★ VIDEO ROBUSTNESS — CRITICAL (prevents the wrong image flashing while the video loads): (1) MANDATORY: put a poster on the <video> equal to the hero burger image ${photoList[0]}, AND also render that same image ${photoList[0]} as a full-bleed <img> layer positioned absolutely BEHIND the video (lower z-index), object-fit:cover, so before/while the video loads the user always sees a big appetising BURGER (never a blank/black box, never fries). (2) The fallback that hides the video must ONLY trigger on a REAL failure — attach it to the "error" event of the <video> (onerror), NOT to "stalled", NOT to "waiting", NOT to a timeout. Do NOT use onstalled or any timer-based swap: a slow network makes the video 'stall' briefly then recover, and swapping on stall wrongly kills a working video (this exact bug happened before). On a genuine error event, hide the <video> so the burger <img> behind it shows through. (3) Let the video load calmly (preload="auto"); if it takes a moment, the poster/img burger is already showing, so there is no ugly flash. Result: burger image instantly, video takes over when ready, and it only ever falls back to the burger image (never fries) on a true load error.` : `Use the hero burger image ${photoList[0]} as a full-bleed, object-fit:cover background — a big, close, appetising crop.`}
   ★ KEEP THE BURGER BRIGHT, BIG & VISIBLE — BUT TEXT MUST BE PERFECTLY LEGIBLE: The video/food stays bright and vivid, BUT the headline and text must ALWAYS be effortlessly readable over it — legibility is non-negotiable on a premium site. Achieve BOTH with a DIRECTIONAL gradient scrim, not a flat wash: place a dark scrim concentrated ONLY in the TEXT ZONE (lower-left, roughly the left 50% and lower portion where the eyebrow, headline, subtitle, CTAs and stats sit), fading QUICKLY to transparent toward the right/top so the burger stays bright, vivid and unobstructed there. Concretely, layer a gradient like linear-gradient(105deg, rgba(10,8,6,0.78) 0%, rgba(10,8,6,0.42) 34%, rgba(10,8,6,0.08) 56%, transparent 72%) OVER the video (a dedicated overlay div, z-index between video and text) — note the scrim clears to fully transparent by ~72% so most of the frame shows the video at full vividness. Give the headline a soft text-shadow (0 2px 24px rgba(0,0,0,0.6)) so it reads even over bright cheese. ★★★ VIDEO VIVIDNESS (CRITICAL — the hero video must look as ALIVE and crisp as a high-res photo, not a dull washed-out background): apply a CSS filter to the hero <video> to make it pop: filter: saturate(1.18) contrast(1.10) brightness(1.04); and render the video at natural scale (object-fit:cover but do NOT scale it up beyond ~1.0 — upscaling softens it). The result must feel vivid and sharp, like the crisp photo version, NOT a muted second-plane backdrop. No border, no box — the video bleeds to all four edges.
   TEXT OVER THE VIDEO: eyebrow ("// STONEYBATTER · DUBLIN"), then the headline, a short subtitle, two CTAs (primary "CALL TO ORDER" → ${bookingHref}, secondary "SEE THE MENU" → #services), and a row of animated stat counters (${rating}★ · ${reviewCount} reviews · 100% fresh) — all left-aligned and ANCHORED TO THE LEFT MARGIN of the page (the same left margin/gutter as the nav logo, e.g. matching the site's horizontal padding of ~5-6vw), stacked and sitting in the lower-left. The whole text column starts flush against that left margin line — it must NOT float detached in the middle-left; it aligns to the same left edge as the logo above it, so everything shares one clean vertical line. z-index above the video. A tiny "SCROLL TO BEGIN" cue at the bottom. Big brand wordmark in the nav.
   ★ HEADLINE SIZING — STRICT, FOR CONSISTENCY (this is critical — past versions came out either too small or absurdly huge with one word per line; it must be CONSISTENT and BALANCED every time): The hero headline must be BOLD and confident but MUST fit comfortably within the hero viewport WITHOUT the user needing to scroll to read it, and WITHOUT becoming one giant word per line. Target: the headline reads in 2 to 3 balanced lines total, each line containing multiple words. Use a responsive clamp so it scales with the screen but never overflows — e.g. font-size: clamp(2.5rem, 5.5vw, 5rem); line-height: ~1.0; and constrain the headline block to about max-width: 60% of the hero (max ~640px) so it wraps into tidy multi-word lines on the left, never spanning huge single words down the whole screen. The entire hero (headline + subtitle + CTAs + stats) must be visible in one screen without scrolling. Balanced, premium, legible — a confident headline, NOT a wall of oversized words. One accent word in ember, the rest cream.
SECTION 2: THE STORY (id="about")  [clean editorial — this is the elegant base]
   Just above or below this section, add an ELEGANT MARQUEE (the moving strip Leo liked): a slow, smooth, seamless infinite horizontal loop of short flavour keywords separated by small dots, e.g. "Smoky Bacon • Cheese Pull • Loaded Fries • Vegan & Proud • Smash Burgers • Char-Grilled •" repeating. Keep it refined — thin/medium weight, tasteful, lower-key (not a loud promo banner), pauses on hover. This is a premium detail.
   Two-column editorial story. LEFT: mono eyebrow "// THE STORY", a strong headline with one phrase in ember accent, then 2 short warm paragraphs about the place (soul, not "founded in"). RIGHT: the interior/ambience image (${photoList.length > 5 ? photoList[5] : photoList[photoList.length-1]}) rendered LARGE (min-height:560px on desktop, object-fit:cover, filling its column edge to edge) with a small ember-orange address badge overlapping a corner (e.g. "55 PRUSSIA ST · D07"). Generous whitespace around the pair, but the image itself must be big and immersive — never a small inset. Calm, premium, confident. This clean section is the backbone — keep it uncluttered.

★ CINEMATIC MOMENT 2 ★ — SECTION 3: // THE CUT (id="cut")
   The "spec sheet" moment — clean and elegant, NO scroll deconstruction, and NO floating ingredient labels around the burger (in the last version the labels overlapped the spec table text and looked cluttered — DO NOT add ingredient callout labels/lines around the burger). Mono eyebrow "// THE CUT". LEFT: a big static "230°C" callout in ember + a clean spec table (Patty/Grind, Sear/Surface · 230°C, Cheese, Bun, Origin) in mono type with the values right-aligned + one short line of copy below. RIGHT: the WHOLE hero burger ${photoList[0]} shown intact and beautiful — a single clean image rendered LARGE (min-height:560px on desktop, ideally 600–680px, object-fit:cover, a big close crop) with steam, sitting in generous dark space, NO labels, NO callout lines, NO annotations over or around it. The burger must be BIG and mouth-watering — fill the right column, do not shrink it into a small centered thumbnail surrounded by void. Just the gorgeous, large burger and the clean spec table on the left. Uncluttered, premium, lots of breathing room. The burger image can gently fade/scale in on scroll, but nothing overlaps it and it never renders small.

★ CINEMATIC MOMENT 3 ★ — SECTION 4: // THE SEAR (id="sear")
   The fire scene with the sear video + the heat gauge. ${bankVideos.sear ? `Use the video "${bankVideos.sear}" as a TRUE FULL-BLEED background of this section: <video autoplay muted loop playsinline preload="auto" poster="${photoList[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"> covering the whole section edge-to-edge (min-height:640px so the fire fills the frame), dark scrim on top for readability.
   ★★★ VIDEO ROBUSTNESS — CRITICAL (same rule as the hero — this is where the wrong image showed before): (1) MANDATORY poster on the <video> = a grill/meat image ${photoList[0]}, AND also render that same image ${photoList[0]} as a full-bleed <img> layer BEHIND the video (lower z-index), object-fit:cover, so while the sear video loads the user sees grilled meat (never fries, never a blank box). (2) The fallback must ONLY trigger on the REAL "error" event of the <video> (onerror) — NEVER on "stalled", "waiting", or a timeout. Do NOT use onstalled or any timer: a brief network stall must NOT swap out a working video (this exact bug happened here — the sear video was fine but got replaced by the burger photo because of an onstalled/timeout swap). On a genuine error, hide the <video> so the meat <img> behind shows. (3) preload="auto" so it loads calmly behind the poster/img. Result: grilled-meat image instantly, the fire video takes over when ready, fallback to the meat image (never fries) only on a true load error.` : `Full-bleed grill background using ${photoList[0]} with a fire-glow gradient, min-height:640px, object-fit:cover.`}
   Over the video: four LIVE COUNTERS across the top counting up from 0 on enter (mono, amber glow): 490G (patty weight) · 28 (days aged) · 258° (sear temp) · 7 (layers). Headline "EVERY LAYER. UNCOMPROMISED." Small "SCROLL TO RAISE THE HEAT" cue.
   ★ SCROLL-LINKED HEAT GAUGE (MANDATORY — do not skip): On the RIGHT side, inside a CLEAN, ELEGANT CONTAINER (a slim vertical panel/card with a subtle dark background, a little padding, and a soft border or glow — NOT loose numbers floating over the burger). Inside the container: a label "SEAR TEMP" on top, a large temperature number tied to SCROLL PROGRESS through this section (NOT a one-shot counter): as the user scrolls down through SEAR it climbs 0 → 258 and back down on scroll up. Next to the number, a thin VERTICAL BAR (slim track, amber/orange fill) whose height goes 0%→100% in sync, glowing hotter (yellow-white) near the top — a rising thermometer. The whole gauge sits neatly in its container on the right edge, visually contained and premium — never numbers scattered over the food. Map the section scroll progress (0→1) to the number 0→258 and the bar height 0%→100%. This makes "SCROLL TO RAISE THE HEAT" literal. (prefers-reduced-motion: snap to 258.) The gauge container is slim and sits to the SIDE — it must NOT shrink or crop the background fire/food; the video/photo behind stays full-bleed and large.

SECTION 5: THE MENU (id="services")  [clean typographic menu — elegant base]
   A refined TYPOGRAPHIC menu list, NOT bulky cards. Each item is a full-width row: a small index number (01, 02, 03…), the item name in strong display type on the left, a one-line description under it, and the price in ember on the far right, with a thin divider line between rows. Hover highlights the row. Items (or from services if given: ${services || "invent realistic items"}): e.g. 01 Classic Smash €12, 02 Vegan Burger €12, 03 Bacon Cheeseburger €14, 04 Loaded Cheese Fries €6, 05 Bacon & Cheese Fries €7. Keep prices in € (Dublin). This clean list reads as premium and confident — lots of breathing room.

★ CINEMATIC MOMENT 4 ★ — SECTION 6: BUILD YOUR PRIME (id="build")  [the interactive signature → WhatsApp]
   A REAL, FULLY FUNCTIONAL burger builder (not decorative). Two columns:
   LEFT = options. Step 1 "CHOOSE YOUR SIZE" — three size options (Single €12 / Double €16 / Triple €20) as selectable cards (radio behaviour). Step 2 "ADD TOPPINGS" — a grid of toggleable topping chips (Truffle Mayo +€4, Smoked Bacon +€3, Caramelised Onion +€2, Extra Cheese +€2, Prime Pickles free, Fried Egg +€2), each with a small image tile where possible.
   RIGHT = a preview panel: a burger image (rendered LARGE — min-height:520px, object-fit:cover, a big appetising crop) under a soft light-ring with rising smoke, and a live "TOTAL BUILD" figure that UPDATES ON EVERY CLICK with a smooth count animation, plus a line listing the current build (e.g. "Triple · Smoked Bacon + Extra Cheese"). Below it, a primary button "ORDER THIS BUILD" that opens ${whatsappHref} with a PREFILLED message describing the exact configured build (e.g. "Hi! I'd like to build my Prime: Double + Truffle Mayo + Smoked Bacon — total €34"). Build with real vanilla JS: clicking sizes/toppings recomputes the total AND updates the WhatsApp link text live. This MUST actually work — it is the centerpiece. No checkout/payment — CTA hands off to WhatsApp. Running total aria-live="polite".

SECTION 7: THE GALLERY (id="gallery")  [clean mosaic — elegant base, BIG photos]
   Headline "LOOK. THEN COME HUNGRY" (or similar), mono eyebrow "// THE GOODS". A cinematic MOSAIC grid of food shots that is DENSE and GENEROUS — big tiles, tight dark gaps, NO large empty black voids between or around tiles. Each tile fades+scales in on scroll, subtle hover zoom. Use images: ${photoList.slice(1).join(", ") || photoList.join(", ")}.
   ★ GALLERY SIZING — STRICT (match the clean editorial version, which looked bigger and more appetising than the cinematic one): Build it as a CSS grid that fills its width edge to edge (the mosaic spans the full content width, e.g. grid-template-columns: repeat(12, 1fr); gap:10px;). The FEATURE tile (a burger) spans a large area and is TALL — min-height:620px on desktop. Secondary tiles are also substantial — min-height:300px each, never tiny. Every tile uses width:100%; height:100%; object-fit:cover so photos fill their cells completely with no letterboxing and no dead space. The grid must read as a full, dense, immersive wall of big food — tight gaps, generous tile sizes, zero large black gaps. Do NOT scatter small images with lots of black space between them (that was the mistake in the cinematic version). Big, tight, appetite-driving mosaic.
   IMAGE CURATION (whole site): BURGER shots are the stars — give burgers the largest/prominent tiles (the feature tile is always a burger). Fries/sides and drinks are SUPPORT — smaller, secondary, never the biggest tile, never repeated as a hero across multiple sections. The largest tiles must be burgers.

SECTION 8: REVIEWS (id="reviews")  [clean 3-column — elegant base]
   Mono eyebrow "// WORD ON PRUSSIA ST". A big headline with the rating ("${rating} STARS, ${reviewCount} REVIEWS" — the ${rating} and number animate as counters). Below, THREE clean testimonial columns (not a carousel), each: five amber stars, a short quote, a realistic Irish name + Dublin neighbourhood (e.g. Stoneybatter, Phibsborough, Smithfield). Calm, spacious, trustworthy.

SECTION 9: FAQ (id="faq")  [clean minimalist accordion — elegant base]
   Mono eyebrow "// BEFORE YOU BITE", headline "THE QUESTIONS". A minimalist accordion, 4 rows with a + toggle: "Do you take bookings?", "Is the vegan burger actually good?", "What are your opening hours?", "Where exactly are you?" — thin dividers, lots of space, smooth expand.

SECTION 10: CONTACT (id="contact")  [clean close with map — elegant base]
   Headline "FIND US. FEED YOU." LEFT: address (${address || city}), phone (${phone || "—"}), opening hours (${hours || "Mon–Sun, kitchen hours"}), and a "CALL TO ORDER" CTA → ${bookingHref}. RIGHT: a Google Maps iframe for the address. Dark, clean, confident close.

LAYOUT DISCIPLINE (this is what keeps the nota 10):
- The CLEAN sections (Story, Menu, Gallery, Reviews, FAQ, Contact) must stay uncluttered, spacious, editorial — this elegance is the foundation and must not be sacrificed. Headline + supporting content + whitespace. Do not cram. BUT whitespace never means small food photos — food images stay big per the sizing law above.
- The FOUR cinematic moments (hero video, THE CUT deconstruction, THE SEAR video+gauge, BUILD YOUR PRIME) are the highlights — make each genuinely impressive but self-contained, surrounded by calm, and never at the cost of shrinking the food.
- Every non-static number animates (stats, rating, review count, build total, sear counters, heat gauge). The 230°C is static.
- The result should feel like ONE cohesive premium piece: clean and breathable, punctuated by four unforgettable moments, with big appetite-driving food throughout. Elegant first, cinematic second.

JOURNEY MOTION RULES (on top of the global motion system below):
- Sections connect via the shared dark background and a warm ember glow that shifts scene to scene (cooler → hot at THE SEAR → cooling after).
- The deconstruction (THE CUT), the sear video + heat gauge (THE SEAR), the hero video, and the BUILD builder are the four showpieces. Make them impressive; keep everything else clean and disciplined.
- Every numeric value (230°C is static; but 490G, 28, 258°, 7, the rating, the review count, and the live build total) — all the NON-static ones animate.
- Respect prefers-reduced-motion: disable scroll-linked separation and heavy motion, but keep the site fully usable and the builder fully functional.

NOTE: Required section ids: hero, about (story), cut, sear, services (menu), build, gallery, reviews, faq, contact. Use those exact ids so nav and CTAs resolve. Nav labels can read: STORY, MENU, GALLERY, REVIEWS, VISIT, plus the cinematic anchors (THE CUT, THE SEAR, BUILD).
` : "";

      // ---------- BLOCO CLEAN (BURGER + MODO CLEAN) ----------
      const isCleanBurger = category === "burger" && mode === "clean";
      const cleanBurgerBlock = isCleanBurger ? `

═══════════ BURGER PREMIUM PAGE — CLEAN ELEGANT LAYOUT (NO HEAVY VIDEO/ANIMATION) ═══════════
Build a premium single-page burger site that is CLEAN, ELEGANT and BREATHABLE — generous negative space, confident condensed display typography, strong section rhythm, dark warm palette (ink/ember/cream/gold), big appetite-driving food photos. This is the SOBER, FAST, GUARANTEED version: NO hero video, NO scroll-linked heat gauge, NO ingredient deconstruction, NO interactive builder. Just a beautifully art-directed, photo-led premium page. Elegant and confident, like a top restaurant site.

★★★ FOOD-PHOTO SIZING LAW (same as always — big, close, appetite-driving): Every food photo must be LARGE and mouth-watering. Hero/feature photos min-height:560px on desktop, object-fit:cover, tight close crops of the cheese/char. Food dominates its section (a paired food image ≥48% of section width; standalone images near full-width). Never small thumbnails, never big empty dark voids around a small photo — the photo grows to fill the space. Burgers are the stars (largest tiles); fries/drinks are support.

BUILD THESE SECTIONS IN THIS EXACT ORDER (use the section ids given so nav + CTAs resolve):

SECTION 1: HERO (id="hero") — PHOTO, NOT VIDEO
   Full-bleed hero using the hero burger image ${photoList[0]} as a big, close, appetising background (object-fit:cover, filling the viewport). ${hasVideo ? `(A client hero video was provided — you MAY use it here as a simple full-bleed background video with a light scrim, but keep it calm; no elaborate cinematic treatment.)` : `No video — the big photo IS the hero.`} Minimal dark scrim concentrated behind the text zone so the burger stays bright and visible. Over it: eyebrow ("// STONEYBATTER · DUBLIN"), a bold headline, short subtitle, two CTAs (primary "CALL TO ORDER" → ${bookingHref}, secondary "SEE THE MENU" → #services), and a row of animated stat counters (${rating}★ · ${reviewCount} reviews · 100% fresh) — all left-aligned and ANCHORED TO THE LEFT MARGIN of the page (the same left margin/gutter as the nav logo, matching the site's horizontal padding ~5-6vw), sitting lower-left and sharing one clean vertical line with the logo above. The text column starts flush against that left margin — it must NOT float detached in the middle. Big brand wordmark in the nav.
   ★ HEADLINE SIZING — STRICT, FOR CONSISTENCY: bold and confident but MUST fit within the hero without scrolling and WITHOUT one giant word per line. Target 2–3 balanced multi-word lines. Use font-size: clamp(2.5rem, 5.5vw, 5rem); line-height:~1.0; constrain the headline block to about max-width:60% of the hero (max ~640px) so it wraps into tidy multi-word lines on the left. One accent word in ember, rest cream.

SECTION 2: THE STORY (id="about") — clean editorial
   Optional elegant marquee (slow, seamless, refined) with flavour keywords. Two-column editorial story: LEFT mono eyebrow "// THE STORY", a headline with one ember accent phrase, 2 short warm paragraphs (soul, not "founded in"). RIGHT the interior/ambience image (${photoList.length > 5 ? photoList[5] : photoList[photoList.length-1]}) rendered LARGE (min-height:560px, object-fit:cover, filling its column) with a small ember address badge in a corner. Generous whitespace, big image.

SECTION 3: THE MENU (id="services") — clean typographic menu
   A refined TYPOGRAPHIC menu list (NOT bulky cards). Each item a full-width row: index number (01, 02…), item name in strong display type, one-line description under it, price in ember on the far right, thin divider between rows, hover highlights the row. Items (or from services: ${services || "invent realistic items"}): e.g. 01 Classic Smash €12, 02 Vegan Burger €12, 03 Bacon Cheeseburger €14, 04 Loaded Cheese Fries €6, 05 Bacon & Cheese Fries €7. Prices in € (Dublin).

SECTION 4: THE GALLERY (id="gallery") — clean mosaic, BIG photos
   Headline "LOOK. THEN COME HUNGRY", mono eyebrow "// THE GOODS". A DENSE, GENEROUS mosaic that fills its width edge to edge (e.g. grid-template-columns: repeat(12, 1fr); gap:10px;). The FEATURE tile (a burger) is large and TALL — min-height:620px on desktop. Secondary tiles substantial — min-height:300px, never tiny. Every tile width:100%; height:100%; object-fit:cover so photos fill cells with no letterboxing and no dead space. Tight gaps, generous tiles, zero large black gaps. Burgers get the biggest tiles; fries/drinks are support. Use images: ${photoList.slice(1).join(", ") || photoList.join(", ")}. Each tile fades+scales in on scroll, subtle hover zoom.

SECTION 5: REVIEWS (id="reviews") — clean 3-column
   Mono eyebrow "// WORD ON PRUSSIA ST". A big headline with the rating ("${rating} STARS, ${reviewCount} REVIEWS" — the ${rating} and number animate as counters). THREE clean testimonial columns (not a carousel): five amber stars, a short quote, a realistic Irish name + Dublin neighbourhood (Stoneybatter, Phibsborough, Smithfield). Calm, spacious, trustworthy.

SECTION 6: FAQ (id="faq") — clean minimalist accordion
   Mono eyebrow "// BEFORE YOU BITE", headline "THE QUESTIONS". Minimalist accordion, 4 rows with a + toggle: "Do you take bookings?", "Is the vegan burger actually good?", "What are your opening hours?", "Where exactly are you?" — thin dividers, lots of space, smooth expand.

SECTION 7: CONTACT (id="contact") — clean close with map
   Headline "FIND US. FEED YOU." LEFT: address (${address || city}), phone (${phone || "—"}), opening hours (${hours || "Mon–Sun, kitchen hours"}), and a "CALL TO ORDER" CTA → ${bookingHref}. RIGHT: a Google Maps iframe for the address. Dark, clean, confident close.

CLEAN MODE DISCIPLINE:
- This is the elegant, restrained version. Keep every section uncluttered, spacious, editorial — headline + supporting content + whitespace, with BIG food photos throughout.
- Animated number counters stay (stats, rating, review count). The custom ember cursor and section color journey stay (they are lightweight and premium). But NO hero video treatment, NO heat gauge, NO deconstruction, NO interactive builder — those belong to the cinematic mode only.
- Nav labels: STORY, MENU, GALLERY, REVIEWS, VISIT. Required section ids: hero, about, services, gallery, reviews, faq, contact.
` : "";

      // ---------- BLOCO CLEAN (CAFÉ + MODO CLEAN) ----------
      const isCleanCafe = category === "cafe" && mode === "clean";
      const cleanCafeBlock = isCleanCafe ? `

═══════════ CAFÉ PREMIUM PAGE — CLEAN ELEGANT LAYOUT (COZY, SLOW-MORNING) ═══════════
Build a premium single-page coffee shop site that is CLEAN, ELEGANT, WARM and INVITING — the feeling of "I want that coffee RIGHT NOW", any time of day. Generous negative space, refined typography, warm palette (espresso/caramel/oat-milk/cream with soft golden light), big appetite-driving coffee photos. This is the SOBER, FAST, GUARANTEED version: NO hero video, NO scroll-linked cup animation, NO interactive builder. A beautifully art-directed, photo-led premium page with a calm, cozy, morning-light mood. Think top specialty coffee brand.

★★★ FOOD-PHOTO SIZING LAW: Every coffee/food photo must be LARGE and mouth-watering — big, close, warm, steam visible where possible. Hero/feature photos min-height:560px on desktop, object-fit:cover, tight inviting crops (the latte art, the crema, the pour). Coffee dominates its section (paired image ≥48% of section width; standalone near full-width). Never small thumbnails, never big empty voids — the photo grows to fill the space. The signature cappuccino/latte art shots are the stars (largest tiles); pastries/beans/interior are support.

BUILD THESE SECTIONS IN THIS EXACT ORDER (use the section ids given so nav + CTAs resolve):

SECTION 1: HERO (id="hero") — PHOTO, NOT VIDEO
   Full-bleed hero using the hero coffee image ${photoList[0]} as a big, close, inviting background (object-fit:cover, filling the viewport) — steam, latte art, warm light. ${hasVideo ? `(A client hero video was provided — you MAY use it as a calm full-bleed background with a light scrim; keep it gentle, no elaborate treatment.)` : `No video — the big warm photo IS the hero.`}
   ★★★ HERO TEXT PLACEMENT — STRICT & MECHANICAL (this MUST be followed exactly — the text has been wrongly landing centered on top of the cup): Put ALL hero text inside ONE container positioned like this: position:absolute; left:5vw; top:50%; transform:translateY(-50%); max-width:min(46%, 560px); text-align:left; z-index:5. This forces the entire text block to the LEFT edge, vertically centered, never wider than 46% of the screen — so it physically CANNOT reach the cup in the center/right. Do NOT use flex/grid centering that could push it to the middle; use the absolute-left container above. LEFT half = text; CENTER/RIGHT half = the cup, bright and unobstructed. A DIRECTIONAL scrim darkens ONLY the left ~50% (e.g. linear-gradient(90deg, rgba(20,14,10,0.82) 0%, rgba(20,14,10,0.5) 34%, transparent 55%)) so text is legible while the cup stays bright; plus a soft text-shadow on the headline. Inside the container stack: eyebrow ("// FRESHLY BREWED" or neighbourhood tag), headline, subtitle, two CTAs (primary "VIEW THE MENU" → #services, secondary "FIND US" → #contact), stat counters (${rating}★ · ${reviewCount} reviews · e.g. "OPEN FROM 7AM") — all left-aligned. NEVER center the hero text, NEVER let it sit on top of the cup. Big brand wordmark in the nav.
   ★ HEADLINE SIZING — STRICT: bold and confident but MUST fit within the hero without scrolling and WITHOUT one giant word per line. Target 2–3 balanced multi-word lines. font-size: clamp(2.4rem, 5vw, 4.6rem); line-height:~1.05; constrain the headline block to about max-width:58% (max ~620px). One accent word in caramel/espresso accent, the rest cream. Warm, welcoming copy (e.g. "Your morning ritual, done right." — but write something original and specific).

SECTION 2: THE STORY (id="about") — clean editorial, cozy
   Optional elegant marquee (slow, seamless, refined) with warm keywords ("Freshly Roasted • Latte Art • Slow Mornings • House Blend • Oat & Almond •"). Two-column editorial story: LEFT mono/refined eyebrow "// OUR STORY", a headline with one accent phrase, 2 short warm paragraphs about the cafe's soul (the ritual, the roast, the neighbourhood — not "founded in"). RIGHT the interior/ambience image (${photoList.length > 5 ? photoList[5] : photoList[photoList.length-1]}) rendered LARGE (min-height:560px, object-fit:cover, filling its column) with a small accent address badge in a corner. Generous whitespace, big cozy image.

SECTION 3: THE MENU (id="services") — clean typographic menu
   A refined TYPOGRAPHIC menu list (NOT bulky cards). Full-width rows: index number (01, 02…), item name in strong display type, one-line description under it, price in accent on the far right, thin divider between rows, hover highlights the row. Items (or from services: ${services || "invent realistic cafe items"}): e.g. 01 Espresso €2.8, 02 Flat White €3.6, 03 Cappuccino €3.6, 04 Iced Latte €4.2, 05 Butter Croissant €3.2, 06 Matcha Latte €4.5. Prices in € (Dublin). Optionally group under small headers (COFFEE / COLD / BAKERY) but keep it clean and typographic.

SECTION 4: THE GALLERY (id="gallery") — clean mosaic, BIG photos
   Headline like "COME FOR THE COFFEE. STAY A WHILE." with a refined eyebrow "// THE GOODS". A DENSE, GENEROUS mosaic filling its width edge to edge (e.g. grid-template-columns: repeat(12, 1fr); gap:10px;). The FEATURE tile (a cappuccino/latte art shot) is large and TALL — min-height:620px. Secondary tiles substantial — min-height:300px, never tiny. Every tile width:100%; height:100%; object-fit:cover, no letterboxing, no dead space. Tight gaps, generous tiles, zero large black gaps. Coffee/latte-art shots get the biggest tiles; pastries/beans/interior are support. Use images: ${photoList.slice(1).join(", ") || photoList.join(", ")}. Each tile fades+scales in on scroll, subtle hover zoom.

SECTION 5: REVIEWS (id="reviews") — clean 3-column
   Refined eyebrow "// WORD ON THE STREET". A big headline with the rating ("${rating} STARS, ${reviewCount} REVIEWS" — the ${rating} and number animate as counters). THREE clean testimonial columns (not a carousel): five stars, a short warm quote, a realistic Irish name + Dublin neighbourhood (Stoneybatter, Rathmines, Portobello, Ranelagh). Calm, spacious, trustworthy.

SECTION 6: FAQ (id="faq") — clean minimalist accordion
   Refined eyebrow "// GOOD TO KNOW", headline "THE QUESTIONS". Minimalist accordion, 4 rows with a + toggle: "Do you have oat/almond milk?", "Is there wifi / space to work?", "What are your opening hours?", "Do you do takeaway?" — thin dividers, lots of space, smooth expand.

SECTION 7: CONTACT (id="contact") — clean close with map
   Headline like "COME SAY HELLO." LEFT: address (${address || city}), phone (${phone || "—"}), opening hours (${hours || "Mon–Sun, 7am–6pm"}), and a "FIND US" CTA → ${bookingHref}. RIGHT: a Google Maps iframe for the address. Warm, clean, confident close.

CLEAN MODE DISCIPLINE:
- Elegant, restrained, WARM version. Every section uncluttered, spacious, editorial — headline + supporting content + whitespace, with BIG cozy coffee photos throughout.
- Animated number counters stay. The custom cursor and section color journey stay (lightweight, premium) — tune the color journey to warm golden/caramel washes fitting coffee. But NO hero video treatment, NO cup gauge, NO builder — those belong to cinematic mode.
- Nav labels: STORY, MENU, GALLERY, REVIEWS, VISIT. Required section ids: hero, about, services, gallery, reviews, faq, contact.

★★★ PREMIUM POLISH — PUSH THIS CLEAN BUILD TOWARD PERFECT (do all, tastefully):
- STRONG SCROLL REVEALS: make the "content appears as you scroll" effect clearly felt (this is what elevates it). Gallery tiles and images should fade + rise (from ~28px) + slightly scale (from 0.94) as they enter, staggered one-by-one (~90ms apart) so the mosaic assembles gracefully, not all at once. Headings clip-reveal upward line by line. Use a smooth cubic-bezier(0.16,1,0.3,1). It should feel choreographed and alive.
- HERO PARALLAX: the hero coffee photo drifts slightly slower than the text on scroll, and shifts a few px on mouse move (desktop) for living depth — a flat hero reads cheaper.
- IMAGE HOVER: gallery images get a slow, refined zoom (scale ~1.05 over ~600ms) with a subtle warm overlay lift on hover.
- NAV: sticky nav gains a solid warm backdrop-blur after ~80px scroll; animated underline on links; a slim top scroll-progress bar in accent colour is welcome.
- STEAM/AMBIENCE: a very subtle, slow, tasteful steam or warm light drift near the hero cup adds life (CSS only, low opacity, never distracting).
- MICRO-DETAILS: buttons have a refined hover (slight lift + soft shadow bloom or fill-sweep). Everything transform/opacity based, 60fps, respect prefers-reduced-motion. These 2% details are what separate "very good" from "perfect" — do them with restraint.
` : "";

      // ---------- BLOCO CINEMATOGRÁFICO (CAFÉ + MODO CINEMATOGRÁFICO A/B) ----------
      // Jornada cinematográfica do café, feita UMA vez para todos os cafés:
      //   1) HERO com vídeo do POUR
      //   2) THE ORIGIN — grãos + contadores
      //   3) THE POUR — showpiece scroll-linked
      //        · slot A = xícara descendo + grãos/leite/gelo (bloco CARIMBADO, injetado)
      //        · slot B = latte art se formando (frame sequence)
      //   4) menu, THE RITUAL (gallery), reviews, faq, contact.
      // isCinematicCafeA já declarado no topo (fica visível na injeção lá embaixo)
      const isCinematicCafeB = category === "cafe" && mode === "cinematic_b";
      const isCinematicCafe = isCinematicCafeA || isCinematicCafeB;
      // Configuração do frame sequence do slot B (o slot A não usa frames — é carimbado):
      const pourFramePattern = bankFrames.lattePattern;
      const pourFrameCount = bankFrames.cafeCount;
      const pourFramesReady = bankFrames.latteReady;
      const cinematicCafeBlock = isCinematicCafe ? `

═══════════ CAFÉ PREMIUM PAGE — CINEMATIC JOURNEY (AWWWARDS-TIER, COZY & CRAFT) ═══════════
★★★ CRITICAL — GENERATE THE COMPLETE SITE FROM <!DOCTYPE html> TO </html>, ALL SECTIONS INCLUDED, ending with the CONTACT section (with the Google Maps iframe) and the closing </body></html>. Do NOT stop early, do NOT leave sections empty. Every section listed below MUST be fully built and filled with real content. Keep each section reasonably compact so the whole page fits — favor completeness over any single section being huge. If you must trade off, make sections shorter but ALWAYS include every one of them through to the contact/map and the final closing tags.

Build a premium single-page coffee site that is CLEAN and ELEGANT as its foundation — warm palette (espresso/caramel/oat-milk/cream, soft golden light), refined typography, generous negative space — AND injects a few genuine "wow" cinematic moments. The feeling: craft, origin, ritual — "I want that coffee right now, any time of day." Elegant first, cinematic second. NO order builder (that belongs to burger, wrong for coffee). Dark-warm background throughout with a golden/caramel ambient glow connecting sections.

★★★ FOOD-PHOTO SIZING LAW (same as always): every coffee/food photo is LARGE, close, warm, appetite-driving (min-height:560px on desktop, object-fit:cover, tight inviting crops — the crema, the foam, the pour). Coffee/latte-art shots are the stars (largest tiles); beans/pastry/interior are support. Never small thumbnails, never big empty voids.

BUILD THESE SECTIONS IN THIS EXACT ORDER (use the section ids given so nav + CTAs resolve):

★ CINEMATIC MOMENT 1 ★ — SECTION 1: HERO WITH THE POUR VIDEO (id="hero")
   ★ FULL-BLEED HERO VIDEO: ${bankVideos.pour ? `Use the video "${bankVideos.pour}" as a TRUE FULL-BLEED background: <video autoplay muted loop playsinline preload="auto" poster="${photoList[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"> covering the whole hero edge-to-edge — steamed milk being poured, latte art forming, steam rising, warm and inviting, LARGE and close.
   ★★★ VIDEO ROBUSTNESS — CRITICAL: (1) MANDATORY poster on the <video> = ${photoList[0]}, AND render that same image ${photoList[0]} as a full-bleed <img> BEHIND the video (lower z-index), object-fit:cover, so while the pour video loads the user sees a beautiful cappuccino (never a blank/black box). (2) The fallback must ONLY trigger on the REAL "error" event (onerror) — NEVER "stalled"/"waiting"/timeout. Do NOT use onstalled or any timer (a brief network stall must not kill a working video). On a genuine error, hide the <video> so the coffee <img> behind shows. (3) preload="auto" so it loads calmly behind the poster/img.` : `Use the hero coffee image ${photoList[0]} as a full-bleed, object-fit:cover background — a big, close, inviting cappuccino with steam and latte art.`}
   ★ KEEP COFFEE WARM & VIVID, TEXT PERFECTLY LEGIBLE: DIRECTIONAL gradient scrim concentrated ONLY in the TEXT ZONE (lower-left, ~left 50%), fading QUICKLY to transparent toward the right/top so the coffee stays warm, bright and vivid there. e.g. linear-gradient(105deg, rgba(20,14,10,0.76) 0%, rgba(20,14,10,0.4) 36%, transparent 66%) OVER the video — the scrim clears to fully transparent by ~66% so most of the frame shows the video vividly. Soft text-shadow (0 2px 24px rgba(0,0,0,0.55)) on the headline. ★★★ VIDEO VIVIDNESS (CRITICAL — the hero video must look as ALIVE and crisp as the high-res photo, NOT a dull washed-out background): apply a CSS filter to the hero <video> so it pops: filter: saturate(1.18) contrast(1.10) brightness(1.04); render at natural scale (object-fit:cover but do NOT upscale beyond ~1.0 — upscaling softens it). It must feel vivid and sharp like a 4K photo, never a muted second-plane backdrop. Do NOT wash the whole video dark. Video bleeds to all four edges — no border, no frame.
   ★★★ HERO TEXT PLACEMENT — STRICT & MECHANICAL (this MUST be followed exactly — the text has been wrongly landing centered on top of the cup): Put ALL hero text inside ONE container positioned like this: position:absolute; left:5vw; top:50%; transform:translateY(-50%); max-width:min(46%, 560px); text-align:left; z-index:5. This forces the entire text block to the LEFT edge, vertically centered, never wider than 46% of the screen — so it physically CANNOT reach the cup in the center/right. Do NOT use flex/grid centering that could push it to the middle; use the absolute-left container above. LEFT half = text; CENTER/RIGHT half = the coffee/pour, bright and unobstructed. The directional scrim darkens ONLY the left ~50%. Headline gets a soft text-shadow. Inside the container stack: eyebrow, headline, subtitle, two CTAs, stat counters — all left-aligned. NEVER center the hero text, NEVER let it overlap the cup.
   TEXT OVER THE VIDEO: eyebrow ("// FRESHLY BREWED · DUBLIN" or a neighbourhood tag), the headline, a short subtitle, two CTAs (primary "VIEW THE MENU" → #services, secondary "FIND US" → #contact), and a row of animated stat counters (${rating}★ · ${reviewCount} reviews · e.g. "OPEN FROM 7AM"). ALL left-aligned in that left column, sharing one clean vertical line with the logo. z-index above the video. A tiny "SCROLL TO SIP" cue at the bottom. Big brand wordmark in the nav.
   ★ HEADLINE SIZING — STRICT: bold but MUST fit within the hero without scrolling and WITHOUT one giant word per line. Target 2–3 balanced multi-word lines. font-size: clamp(2.4rem, 5vw, 4.6rem); line-height:~1.05; constrain the headline block to about max-width:58% (max ~620px). One accent word in caramel/amber, rest cream. Warm original copy (write something specific, e.g. play on ritual, morning, craft — not generic).

SECTION 2: THE STORY (id="about")  [clean editorial — the elegant base]
   Optional elegant marquee (slow, seamless, refined): "Freshly Roasted • Latte Art • Slow Mornings • House Blend • Oat & Almond • Single Origin •". Two-column editorial story: LEFT refined eyebrow "// OUR STORY", a headline with one accent phrase, 2 short warm paragraphs (the ritual, the roast, the neighbourhood — soul, not "founded in"). RIGHT the interior/ambience image (${photoList.length > 5 ? photoList[5] : photoList[photoList.length-1]}) rendered LARGE (min-height:560px, object-fit:cover) with a small accent address badge in a corner. Generous whitespace, big cozy image.

★ CINEMATIC MOMENT 2 ★ — SECTION 3: // THE ORIGIN (id="origin")
   The "craft spec" moment — the equivalent of the burger's THE CUT, but for coffee. Refined eyebrow "// THE ORIGIN". LEFT: a big static accent callout (e.g. "1,800M" altitude in caramel/amber) + a clean spec table in mono type with values right-aligned (Origin · Ethiopia Yirgacheffe / Altitude · 1,800m / Roast · Medium, 220°C / Process · Washed / Rest · 14 days / Notes · Floral, citrus, honey) + one short line of copy below. RIGHT: a big beautiful macro of roasted coffee beans ${photoList.length > 1 ? photoList[1] : photoList[0]} shown LARGE (min-height:560px, ideally 600–680px, object-fit:cover, a close glossy crop) sitting in generous dark space, NO labels/callout lines over it. ${bankVideos.roast ? `OPTIONALLY, instead of the static bean image, you MAY use the video "${bankVideos.roast}" here as a contained background of the right panel with poster="${photoList.length>1?photoList[1]:photoList[0]}" and the same onerror-only robustness rules (no onstalled/timer) — but keep it calm and contained, the spec table on the left stays the focus.` : ``} The image/video can gently fade/scale in on scroll; nothing overlaps it. The altitude/roast-temp numbers animate as counters on enter. Uncluttered, premium, lots of breathing room.

★ CINEMATIC MOMENT 3 (THE SHOWPIECE) ★ — SECTION 4: // THE POUR (id="pour")
${isCinematicCafeA
  ? `   OUTPUT EXACTLY this token on its OWN LINE where SECTION 4 goes, and build NOTHING else for this section — it is injected afterwards as a locked, pre-built showpiece (do NOT create a <section id="pour"> yourself, do NOT add any pour markup, just the token):
   THE_POUR_A_PLACEHOLDER`
  : (pourFramesReady
    ? `   THE HYPNOTIC SCROLL-LINKED MOMENT — the signature "wow", built as an APPLE-STYLE FRAME SEQUENCE (silky on every device, never janks — do NOT scrub an mp4; use a preloaded image sequence swapped by scroll progress).
   ★ THE EFFECT: LATTE ART FORMING — the cup sits pinned/centered, viewed from above, and as the user scrolls the rosetta latte art DRAWS ITSELF on the milk surface, from blank crema to finished rosetta. Scrolling down forms the art; scrolling up unforms it. Minimal, zen, mesmerising.
   Layout: a sticky/pinned stage (~220vh tall section; the visual pins in the viewport center while scrolling). Center: one <img> showing one frame at a time. Around it, short copy lines fade in/out. Warm golden glow, gentle steam.
   ★ FRAME SEQUENCE (implement exactly): ${pourFrameCount} frames at "${pourFramePattern}" + 3-digit zero-padded number + ".jpg" (${pourFramePattern}001.jpg … ${pourFramePattern}${String(pourFrameCount).padStart(3,"0")}.jpg); build the URL list in JS 1→${pourFrameCount}. PRELOAD all into Image objects; show ${photoList.length>3?photoList[3]:photoList[0]} as the poster while preloading. On scroll compute section progress 0→1 and map to frame index = clamp(round(progress*(${pourFrameCount}-1)),0,${pourFrameCount}-1); set <img>.src to that frame inside a requestAnimationFrame loop (scroll handler only stores progress; never swap directly in it). Pure image swap, 60fps; will-change:contents; decoding="async". If frames error out, fall back to the finished photo ${photoList.length>3?photoList[3]:photoList[0]} with a soft scroll reveal. (prefers-reduced-motion: show the finished frame.)
   The result: as the user scrolls, the scene animates frame-by-frame — mesmerising and buttery smooth.`
    : `   THE POUR — a clean, standard, NORMAL-HEIGHT section (NOT sticky, NOT pinned, NOT tall — just a regular section like the others). Two-column layout: LEFT a refined eyebrow "// THE POUR", a headline like "Every cup, poured with care.", and 2 short lines about the craft (the pour, the microfoam, the ritual). RIGHT a single large beautiful coffee image ${photoList.length>3?photoList[3]:photoList[0]} (min-height:520px, object-fit:cover, a close latte-art crop) with a soft warm glow and gentle steam, fading + slightly scaling in on scroll. Keep it simple, warm and premium — a normal editorial section, nothing sticky or scroll-scrubbed. Do NOT make this section taller than a normal section; do NOT pin it.`)}

SECTION 5: THE MENU (id="services")  [clean typographic menu — elegant base]
   A refined TYPOGRAPHIC menu list (NOT bulky cards). Full-width rows: index (01, 02…), item name in strong display type, one-line description, price in accent on the far right, thin divider, hover highlights the row. Items (or from services: ${services || "invent realistic cafe items"}): e.g. 01 Espresso €2.8, 02 Flat White €3.6, 03 Cappuccino €3.6, 04 Iced Latte €4.2, 05 Butter Croissant €3.2, 06 Matcha Latte €4.5. Prices in € (Dublin). May group under small headers (COFFEE / COLD / BAKERY), kept clean.

SECTION 6: THE RITUAL / GALLERY (id="gallery")  [clean mosaic — BIG photos]
   Headline like "COME FOR THE COFFEE. STAY A WHILE." with eyebrow "// THE RITUAL". A DENSE, GENEROUS mosaic filling its width edge to edge (grid-template-columns: repeat(12, 1fr); gap:10px;). FEATURE tile (a latte-art/pour shot) large and TALL — min-height:620px. Secondary tiles substantial — min-height:300px, never tiny. Every tile width:100%; height:100%; object-fit:cover, no letterboxing, no dead space. Tight gaps, zero large black gaps. Coffee/latte-art shots get the biggest tiles; pastry/beans/interior support. Use images: ${photoList.slice(1).join(", ") || photoList.join(", ")}. Each tile fades+scales in on scroll, subtle hover zoom.

SECTION 7: REVIEWS (id="reviews")  [clean 3-column]
   Refined eyebrow "// WORD ON THE STREET". Big headline with the rating ("${rating} STARS, ${reviewCount} REVIEWS" — ${rating} and number animate as counters). THREE clean testimonial columns (not a carousel): five stars, a short warm quote, a realistic Irish name + Dublin neighbourhood (Stoneybatter, Rathmines, Portobello, Ranelagh). Calm, spacious, trustworthy.

SECTION 8: FAQ (id="faq")  [clean minimalist accordion]
   Refined eyebrow "// GOOD TO KNOW", headline "THE QUESTIONS". Minimalist accordion, 4 rows with a + toggle: "Do you have oat/almond milk?", "Is there space to work / wifi?", "What are your opening hours?", "Do you do takeaway?" — thin dividers, lots of space, smooth expand.

SECTION 9: CONTACT (id="contact")  [clean close with map]
   Headline like "COME SAY HELLO." LEFT: address (${address || city}), phone (${phone || "—"}), opening hours (${hours || "Mon–Sun, 7am–6pm"}), and a "FIND US" CTA → ${bookingHref}. RIGHT: a Google Maps iframe for the address. Warm, clean, confident close.

LAYOUT DISCIPLINE (keeps the nota 10):
- The CLEAN sections (Story, Menu, Gallery, Reviews, FAQ, Contact) stay uncluttered, spacious, editorial — with BIG warm coffee photos. Do not cram.
- The THREE cinematic moments (hero pour video, THE ORIGIN spec, THE POUR showpiece) are the highlights — each impressive but self-contained, surrounded by calm.
- Every non-static number animates (stats, rating, review count, altitude, roast temp). Any single "hero number" (e.g. 1,800M) can be static.
- Custom cursor + section color journey stay, tuned to warm golden/caramel washes. Respect prefers-reduced-motion (disable scrubbing/heavy motion, keep usable).
- Nav labels can read: STORY, ORIGIN, THE POUR, MENU, GALLERY, REVIEWS, VISIT. Required section ids: hero, about, origin, pour, services, gallery, reviews, faq, contact.
` : "";

      const sectionHierarchyRule = isCinematicBurger
        ? `7. Follow the BURGER PREMIUM PAGE (cinematic) architecture defined above (clean editorial layout + four cinematic moments). Keep the required section ids: hero, about, cut, sear, services, build, gallery, reviews, faq, contact.`
        : isCleanBurger
        ? `7. Follow the BURGER PREMIUM PAGE (clean elegant) architecture defined above — photo hero, story, menu, gallery, reviews, faq, contact. NO video treatment, NO heat gauge, NO deconstruction, NO builder. Required section ids: hero, about, services, gallery, reviews, faq, contact.`
        : isCinematicCafe
        ? `7. Follow the CAFÉ PREMIUM PAGE (cinematic) architecture defined above (clean editorial base + hero pour video + THE ORIGIN spec + THE POUR showpiece + ritual gallery). NO order builder. Required section ids: hero, about, origin, pour, services, gallery, reviews, faq, contact.`
        : isCleanCafe
        ? `7. Follow the CAFÉ PREMIUM PAGE (clean elegant) architecture defined above — warm photo hero, story, menu, gallery, reviews, faq, contact. NO video treatment, NO cup gauge, NO builder. Required section ids: hero, about, services, gallery, reviews, faq, contact.`
        : `7. Real hierarchy: hero → brand story/about (with soul, not "founded in 2010") → services (premium cards, no emoji) → gallery → reviews (3 testimonials, realistic Irish names) → FAQ (accordion, 4 items) → contact (with address, hours, map embed via Google Maps iframe using the address, and the booking CTA).`;

      const sectionIdsLine = (isCinematicBurger)
        ? `Section ids required: hero, about, cut, sear, services, build, gallery, reviews, faq, contact.`
        : (isCinematicCafe)
        ? `Section ids required: hero, about, origin, pour, services, gallery, reviews, faq, contact.`
        : (isCleanBurger || isCleanCafe)
        ? `Section ids required: hero, about, services, gallery, reviews, faq, contact.`
        : `Section ids required: about, services, gallery, reviews, faq, contact.`;

      // CURSOR POR NICHO
      const cursorBlock = (category === "burger")
        ? `H. CUSTOM CURSOR — EMBER WITH A SMOKE TRAIL (desktop only, ≥1024px): Replace the default cursor with a glowing ember that leaves a SMOKE TRAIL as it moves. Two parts:
   (1) The ember tip: a small bright hot core (pale gold/near-white) wrapped in a soft warm amber radial glow that bleeds outward — like a live coal, not a flat dot.
   (2) The smoke trail: as the pointer moves, it emits soft smoke particles along its recent path that drift slightly upward, fade out, and dissipate over ~0.6-1s. Spawn small blurred warm semi-transparent particle divs at the pointer position, each animating opacity 0.5→0 + slight upward/outward drift + scale up, then removed.
   ★ PERFORMANCE IS CRITICAL — the cursor MUST NOT cause jank or lag. Implement all: THROTTLE particle spawn to ~60-80ms; update the ember position inside a requestAnimationFrame loop (mousemove only stores x/y); move with transform: translate3d() only, will-change: transform,opacity; cap active particles ~12-15; remove particles via animationend (no setInterval); pointer-events:none on cursor elements; only init if window.matchMedia('(pointer: fine)').matches && innerWidth >= 1024 (touch/coarse keeps normal cursor). Silky 60fps. This smoke-trail ember is THE signature bespoke touch — evocative of grill smoke, tasteful, and above all SMOOTH.`
        : (category === "cafe")
        ? `H. CUSTOM CURSOR — SOFT & ELEGANT (desktop only, ≥1024px): Do NOT use a fire/ember/smoke cursor (wrong mood for coffee). Instead, keep it refined and calm: replace the default cursor with a small, tasteful custom dot — a soft cream/caramel glowing dot with a gentle, slightly-lagging follower ring (a second, larger, semi-transparent circle that eases toward the pointer with a smooth spring), giving a premium, calm feel. Optionally the dot subtly scales up on hover over links/buttons. NO smoke, NO particles, NO fire. Move everything with transform: translate3d() inside a requestAnimationFrame loop (mousemove only stores x/y), will-change: transform, pointer-events:none. Only init if window.matchMedia('(pointer: fine)').matches && innerWidth >= 1024 (touch/coarse keeps normal cursor). Must be silky at 60fps and never laggy. Understated, warm, premium.`
        : `H. CUSTOM CURSOR (desktop only, ≥1024px): a tasteful, minimal custom cursor fitting the niche's mood — e.g. a small accent-coloured dot with a soft easing follower ring. NO fire/smoke unless the niche is about grilling. Move with transform: translate3d() inside a requestAnimationFrame loop, will-change: transform, pointer-events:none, only init if window.matchMedia('(pointer: fine)').matches && innerWidth >= 1024. Silky 60fps, never laggy. Keep it understated and premium.`;

      userPrompt = `You are the design lead at an award-winning web studio (Awwwards Site of the Day level). A client is paying premium for a website that must look like a €50,000 agency build — NOT like an AI template. Build a complete, single-page, production-ready website.

Output ONLY raw HTML from <!DOCTYPE html> to </html>. No markdown, no code fences, no explanation. All CSS and JS inline.

═══════════ THE BUSINESS ═══════════
Name: ${businessName}
Type: ${businessType}
City: ${city}
Phone: ${phone || "—"}
Email: ${email || "—"}
Address: ${address || city}
Rating: ${rating} stars (${reviewCount} reviews)
Hours: ${hours || "Mon–Fri 9–18 · Sat 10–17 · Sun closed"}
Services / menu: ${services || "(invent 6 realistic offerings appropriate to this business, with prices in € where natural)"}
Booking link (primary CTA target): ${bookingHref}
WhatsApp link: ${whatsappHref}
${logoBlock}

═══════════ ART DIRECTION (follow precisely) ═══════════
Palette (named hex — derive every color from these): ${kit.palette}
Typography: ${kit.fonts}
Photographic mood: ${kit.mood}
SIGNATURE MOMENT (the one thing this site is remembered by): ${kit.signature}
Copy tone: ${kit.tone}
${brandColorBlock}
${fontHint}
${vibe ? `Client vibe keywords: ${vibe}` : ""}
${headlineHint}

═══════════ ASSETS ═══════════
${videoBlock}

${photoBlock}

${refBlock}
${aboutHint}
${burgerJourneyBlock}
${cleanBurgerBlock}
${cleanCafeBlock}
${cinematicCafeBlock}

═══════════ MOTION SYSTEM (this is what separates award-winners from templates) ═══════════
The site must feel ALIVE and cinematic — not a static page. Build ALL of the following, orchestrated and tasteful (never gimmicky). Everything must respect prefers-reduced-motion (wrap motion in a media query and disable it there).

A. PAGE LOAD SEQUENCE: On load, the hero animates in as a choreographed sequence, not all at once. Eyebrow fades+slides first, then the big headline reveals line-by-line (each line clip-masked, rising up with a slight stagger ~120ms apart), then subtext, then CTAs, then stats. Use a smooth cubic-bezier ease (e.g. cubic-bezier(0.16, 1, 0.3, 1)). This first ~1.2s is the "wow".

B. HERO PARALLAX & DEPTH: The hero background image/video must have depth. On mouse move (desktop), the hero image shifts subtly (translate a few px, opposite to cursor) for a living parallax. On scroll, the hero image moves slower than the text (parallax layers) and can subtly scale up (1.0→1.08) as you scroll past. The headline can drift up slightly faster than the image. This layered depth is critical — a flat hero reads as cheap.

C. SCROLL-TRIGGERED REVEALS: Every section's content animates in as it enters the viewport (IntersectionObserver, trigger ~15% visible, animate once). Vary the reveal per element type: headings clip-reveal upward, body text fades+rises, images/cards fade+rise+slight-scale (from 0.96), and stagger children so items in a row appear one after another (~80-100ms apart), never all together.

D. NUMBER COUNTERS: Any stat/number (rating, review count, years, "100%") counts up from 0 to its value when it scrolls into view (~1.2s, ease-out). This always reads as premium.

E. SIGNATURE SCROLL MOMENT: Deliver the signature concept from the art direction as a real scroll-driven moment. For product businesses, the hero/feature image can scale, rotate slightly, or have layered elements move at different speeds as you scroll through the section (scroll-linked, using scroll progress). For the construction/real-estate kit specifically, implement the build-up: swap/cross-fade through stages as the user scrolls the section. Make this ONE moment genuinely impressive.

F. MICRO-INTERACTIONS: Buttons have a refined hover (subtle lift + shadow bloom, or a fill-sweep). Gallery images zoom slightly (scale 1.05) with an overlay tint on hover. Nav links have an animated underline. The sticky nav shrinks/gains a backdrop blur + solid background after scrolling ~80px. A slim scroll-progress bar at the very top is welcome.

G. If a HERO VIDEO is present, it plays behind a gradient scrim with the load sequence layered on top; the parallax applies to the scrim/text, and the video stays cinematic (object-fit cover, full-bleed).

═══════════ AWARD-TIER DIFFERENTIATORS (these push it from "very good" to top-tier — implement ALL) ═══════════

${cursorBlock}

I. SECTION COLOR JOURNEY — MAKE IT FELT: The background must visibly shift as the user scrolls — not a subtle near-invisible change. Since the base is dark, use PERCEPTIBLE warm ambient glows: as the user enters key sections, introduce a visible radial glow/gradient of the accent color (ember/amber) bleeding from an edge or behind content, then receding. Think of light sources warming the room as you move through it. The shift between sections should be noticeable (a warm amber wash appearing behind the story section, cooling again, etc.) while keeping text readable. If the change isn't clearly felt when scrolling, it's too weak — make it stronger.

J. NUMBER COUNTERS ARE MANDATORY, NOT OPTIONAL: EVERY numeric stat (rating like 4.9, review counts like 170, percentages like 100%, years) MUST animate counting up from 0 to its final value when it first scrolls into view (~1.2s ease-out). This is required on every generation — never skip it. Preserve decimals (4.9 counts to 4.9, not 5). Trigger via IntersectionObserver, once.

K. REFINED MARQUEE: If a scrolling marquee of menu items / keywords is used, make it ELEGANT not cheap: slow, smooth, seamless infinite loop, subtle (lower opacity or thin refined type), pauses on hover. It should feel like a premium detail, never like a promo banner. If it can't be elegant, omit it.

L. COHESIVE POLISH: Section transitions connect rather than just appear. The whole thing should feel like ONE cinematic piece, not stacked blocks. Every interactive element has a considered hover state. Nothing is left at browser defaults.

Motion must be smooth (transform & opacity only, GPU-friendly, will-change where needed), never janky, never blocking scroll. If in doubt, make it subtle — restraint reads as expensive.

═══════════ NON-NEGOTIABLE QUALITY RULES ═══════════
1. NEVER use emoji as service/feature icons. This is the #1 tell of AI sites. Use clean inline SVG line icons, or numbered/typographic markers, or no icons at all.
2. Typography is the personality. Import the right Google Fonts. Set a real type scale with intentional weights, tight letter-spacing on big display, generous line-height on body. Big confident headlines.
3. Generous negative space. Premium sites breathe. Cheap sites cram. Use large section padding.
4. The MOTION SYSTEM and AWARD-TIER DIFFERENTIATORS above are mandatory and orchestrated on EVERY generation — but tasteful. The custom cursor, section color journey, and animated number counters must ALWAYS be present (never skip them). An elegant, coherent set of motions beats scattered flashy effects. Everything transform/opacity based and respecting prefers-reduced-motion.
5. Avoid the generic AI look: do NOT default to cream background + serif + terracotta (#D97757) unless the palette above says so.
6. Sticky nav that turns solid + backdrop-blur on scroll. Smooth scroll to anchors.
${sectionHierarchyRule}
8. Floating WhatsApp/booking button fixed at bottom-right linking to ${whatsappHref}. MAKE IT POLISHED AND NON-INTRUSIVE: it must have its OWN solid pill background (a strong accent-colour fill with enough contrast that its label is always legible — never rely on the page behind it, so it stays readable even over a light map or photo), a subtle shadow to lift it off the page, a comfortable size (not oversized), and sit with margin from the edges (e.g. bottom:24px; right:24px). It must NEVER overlap or cover important content, text, or CTAs — keep it compact and give it a high z-index so it floats cleanly above sections without colliding with headings or buttons. On mobile, keep it small and out of the way (icon + short label or icon-only). Refined hover (slight lift). It should feel like a tasteful floating action button, not a banner.
9. Fully mobile responsive. Visible keyboard focus states.
10. Copy must be specific and brand-voiced, never filler. Write like a copywriter, in ${city.includes("Ireland") ? "English" : "the appropriate local language"}.

${sectionIdsLine}

Build it to win an award. Every color and type choice must come from the art direction above. Every section must move.`;
    }

    // ---------- CHAMADA À API COM STREAMING (Opus para criação, Sonnet para edição) ----------
    const isEdit = editInstruction && previousHtml;
    const useModel = isEdit ? "claude-sonnet-4-6" : "claude-opus-4-8";
    const maxTokens = isEdit ? 32000 : 64000;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: maxTokens,
        stream: true,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text();
      return res.status(502).json({ error: "AI failed", detail: err.substring(0, 500) });
    }

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    headersSent = true;

    const heartbeat = setInterval(() => {
      try { res.write(" "); } catch (_) {}
    }, 10000);

    let html = "";
    let streamError = "";

    try {
      const reader = anthropicResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        try { res.write(" "); } catch (_) {}

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === "content_block_delta" && evt.delta && evt.delta.type === "text_delta") {
              html += evt.delta.text;
            } else if (evt.type === "error") {
              streamError = (evt.error && evt.error.message) || "Stream error";
            }
          } catch (_) { /* linha parcial, ignora e espera o resto */ }
        }
      }
    } catch (e) {
      streamError = streamError || String(e).substring(0, 200);
    } finally {
      clearInterval(heartbeat);
    }

    if (streamError) {
      res.write(JSON.stringify({ error: "AI failed", detail: streamError }));
      return res.end();
    }

    html = html.trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    // Injeta o vídeo real no placeholder (evita mandar base64 gigante no prompt)
    if (hasVideo) {
      html = html.split("HERO_VIDEO_SRC").join(heroVideoBase64);
    }

    // Injeta o showpiece THE POUR A carimbado (só no café cinematográfico A).
    // Igual à lógica do HERO_VIDEO_SRC: o Opus deixa o marcador, o servidor troca
    // pelo bloco pronto — garante que o efeito é IDÊNTICO toda vez e nunca trava.
    if (isCinematicCafeA) {
      html = html.split("THE_POUR_A_PLACEHOLDER").join(POUR_A_HTML);
    }

    if (!html.includes("</html>")) {
      res.write(JSON.stringify({ error: "Incomplete HTML, try again" }));
      return res.end();
    }

    res.write(JSON.stringify({ html }));
    return res.end();

  } catch (e) {
    // Se os headers já foram enviados (estávamos em streaming), NÃO dá pra usar
    // res.status().json() — isso estoura ERR_HTTP_HEADERS_SENT (foi o bug do log).
    // Nesse caso respondemos pelo mesmo canal já aberto: res.write + res.end.
    const msg = String((e && e.message) || e).substring(0, 200);
    if (headersSent || res.headersSent || res.writableEnded) {
      try { res.write(JSON.stringify({ error: "Server error", detail: msg })); } catch (_) {}
      try { return res.end(); } catch (_) { return; }
    }
    return res.status(500).json({ error: "Server error", detail: msg });
  }
}
