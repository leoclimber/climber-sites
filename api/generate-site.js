// ============================================================================
// THE POUR A — SHOWPIECE FRAME-SEQUENCE SCROLL-SCRUB (café, modo cinematic_a)
// Injetado via placeholder THE_POUR_A_PLACEHOLDER depois da geração do Opus.
//
// HISTÓRICO: passamos por PNGs flutuantes (GSAP) e por um frame-sequence
// antigo (canvas + scroll listener manual, sem GSAP), depois pelo vídeo
// âmbar pour_scene.mp4 original (apagado do banco). A versão atual —
// frame-sequence (130 .webp de pour_scene_dark.mp4, fundo preto,
// banco/cafe/frames_pour_dark/) — é desenhada num <canvas>, com GSAP
// ScrollTrigger fazendo o pin (pin:true) + scrub (scrub:1): mais robusto que
// sticky+scroll-listener pra manter o índice de frame sincronizado com o
// progresso do scroll. Fallback vanilla (sticky CSS + rAF+lerp) se o GSAP CDN
// falhar. As legendas (início/meio/clímax) usam painéis locais com
// backdrop-filter pra ficarem sempre legíveis, sem escurecer a tela toda.
// ============================================================================
function buildPourA(assets) {
  const FRAMES_BASE = assets.framesBase;
  const FRAME_COUNT = assets.frameCount;
  const POSTER = assets.poster;
  return `
<section class="pourA" id="pour" aria-label="The Pour">
  <div class="pourA__stage">
    <canvas class="pourA__canvas" id="pourACanvas" aria-hidden="true"></canvas>
    <img class="pourA__fallback" id="pourAFallback" src="${POSTER}" alt="" style="display:none"/>
    <div class="pourA__vignette" aria-hidden="true"></div>
    <div class="pourA__eyebrow">// THE POUR</div>
    <div class="pourA__side pourA__side--left" id="pourASide1"><div class="pourA__panel"><span>Every bean, a story</span></div></div>
    <div class="pourA__side pourA__side--right" id="pourASide2"><div class="pourA__panel"><span>Crafted, never rushed</span></div></div>
    <div class="pourA__caption" id="pourACaption">
      <div class="pourA__panel"><div class="pourA__ti">Poured with <em>intention</em></div></div>
    </div>
  </div>
</section>
<style>
  .pourA{position:relative;height:100vh;overflow:hidden;background:#080503}
  .pourA__stage{position:relative;height:100%;width:100%}
  .pourA__canvas,.pourA__fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.04);pointer-events:none}
  .pourA__vignette{position:absolute;inset:0;z-index:2;pointer-events:none;
    background:
      linear-gradient(180deg, rgba(8,5,3,1) 0%, rgba(8,5,3,.4) 14%, transparent 26%, transparent 60%, rgba(8,5,3,.5) 86%, rgba(8,5,3,1) 100%),
      radial-gradient(120% 90% at 50% 50%, transparent 48%, rgba(5,3,2,.55) 100%)}
  .pourA__eyebrow{position:absolute;top:38px;left:6vw;z-index:5;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#E8B36B;opacity:.75}

  /* painel "legenda de filme": fundo LOCALIZADO à frase (não a tela toda) —
     backdrop-filter borra+escurece só os pixels do vídeo atrás do texto, o
     que garante contraste seja qual for o momento da coreografia (grãos,
     leite ou gelo) atrás dele. rgba de fundo é o fallback pra navegadores
     sem backdrop-filter (aí ele fica mais opaco pra compensar). */
  .pourA__panel{display:inline-block;padding:16px 28px;border-radius:16px;
    background:rgba(8,5,3,.32);
    -webkit-backdrop-filter:blur(16px) brightness(.5) saturate(1.15);
    backdrop-filter:blur(16px) brightness(.5) saturate(1.15);
    box-shadow:0 0 46px 16px rgba(5,3,2,.2)}
  @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
    .pourA__panel{background:rgba(6,4,2,.64)}
  }

  .pourA__side{position:absolute;top:50%;transform:translateY(-50%);z-index:5;max-width:min(32%,360px);pointer-events:none;
    opacity:0;filter:blur(16px);
    transition:opacity 1.1s cubic-bezier(.16,1,.3,1),filter 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}
  .pourA__side--left{left:6vw;text-align:left;transform:translateY(-50%) translateX(-18px)}
  .pourA__side--right{right:6vw;text-align:right;transform:translateY(-50%) translateX(18px)}
  .pourA__side.show{opacity:1;filter:blur(0)}
  .pourA__side--left.show{transform:translateY(-50%) translateX(0)}
  .pourA__side--right.show{transform:translateY(-50%) translateX(0)}
  .pourA__side span{font-size:clamp(1.1rem,1.8vw,1.5rem);font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:500;color:#F2E4CE;letter-spacing:-.2px;text-shadow:0 3px 18px rgba(0,0,0,.75)}

  .pourA__caption{position:absolute;left:0;right:0;bottom:12vh;z-index:5;text-align:center;pointer-events:none;
    opacity:0;filter:blur(14px);transform:translateY(28px);
    transition:opacity 1.1s cubic-bezier(.16,1,.3,1),filter 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}
  .pourA__caption.show{opacity:1;filter:blur(0);transform:translateY(0)}
  .pourA__caption .pourA__panel{padding:20px 40px}
  .pourA__ti{font-size:clamp(1.8rem,3.4vw,3rem);font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;color:#FBF3E7;letter-spacing:-.3px;text-shadow:0 3px 20px rgba(0,0,0,.7)}
  .pourA__ti em{color:#E8B36B}
  @media(max-width:820px){ .pourA__side{max-width:64%} .pourA__side--left,.pourA__side--right{left:7vw;right:7vw;text-align:left;transform:translateY(-50%)} .pourA__panel{padding:13px 22px} }
  @media(prefers-reduced-motion:reduce){ .pourA__caption,.pourA__side{transition:none} }
</style>
<script>
(function(){
  var section=document.getElementById('pour');
  if(!section)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas=document.getElementById('pourACanvas');
  var ctx=canvas.getContext('2d');
  var fallback=document.getElementById('pourAFallback');
  var caption=document.getElementById('pourACaption');

  var FRAME_COUNT=${FRAME_COUNT};
  var FRAMES_BASE='${FRAMES_BASE}';
  var CAPTION_AT=0.78; // progresso a partir do qual o texto do clímax entra
  // cache-bust: raw.githubusercontent.com (Fastly) mantém cache por URL —
  // como os arquivos frame001..130.webp já foram sobrescritos mais de uma
  // vez com conteúdo de vídeos DIFERENTES sob o mesmo nome, um visitante
  // podia receber uma MISTURA de frames antigos (cache) e novos (fresh),
  // literalmente cortando de um vídeo pro outro no meio do scrub. O query
  // param força o browser/CDN a tratar como recurso novo. Bump este valor
  // sempre que o conteúdo de frames_pour_dark/ for regenerado de novo.
  var FRAMES_VERSION='3';

  // legendas laterais (início=esquerda, meio=direita) que entram/saem
  // conforme o scroll-scrub avança, cada uma com sua janela de progresso
  // [in,out] — fade+blur via a mesma classe .show usada no clímax central.
  var SIDE_CAPTIONS=[
    {id:'pourASide1', from:0.06, to:0.30},
    {id:'pourASide2', from:0.40, to:0.64},
  ].map(function(c){ c.el=document.getElementById(c.id); return c; });

  function frameUrl(i){ return FRAMES_BASE+'/frame'+String(i).padStart(3,'0')+'.webp?v='+FRAMES_VERSION; }
  var frames=[], failed=false, sized=false, revealed=false, dpr=Math.min(window.devicePixelRatio||1,2);

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

  function sizeCanvas(img){
    canvas.width=Math.round((img.naturalWidth||1280)*dpr);
    canvas.height=Math.round((img.naturalHeight||720)*dpr);
    sized=true;
  }

  function drawAt(p){
    if(failed)return;
    var fi=Math.max(0,Math.min(FRAME_COUNT-1,Math.round(p*(FRAME_COUNT-1))));
    var frame=frames[fi];
    if(frame && frame.complete && frame.naturalWidth){
      if(!sized) sizeCanvas(frame);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(frame,0,0,canvas.width,canvas.height);
      if(!revealed){ revealed=true; fallback.style.display='none'; }
    }
  }

  function paint(p){
    drawAt(p);
    caption.classList.toggle('show', p>=CAPTION_AT);
    for(var i=0;i<SIDE_CAPTIONS.length;i++){
      var c=SIDE_CAPTIONS[i];
      if(c.el) c.el.classList.toggle('show', p>=c.from && p<c.to);
    }
  }

  function clamp(v,a,b){return v<a?a:(v>b?b:v);}
  function computeProgress(){
    var rect=section.getBoundingClientRect();
    var total=section.offsetHeight-window.innerHeight;
    var passed=clamp(-rect.top,0,total);
    return total>0?passed/total:0;
  }

  if(reduce){
    paint(1);
    return;
  }

  var hasGsap=(typeof window.gsap!=='undefined' && typeof window.ScrollTrigger!=='undefined');

  if(hasGsap){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger:section, start:'top top', pin:true, scrub:1, anticipatePin:1,
      end:function(){ return '+='+Math.round(window.innerHeight*3.5); },
      invalidateOnRefresh:true,
      onUpdate:function(self){ paint(self.progress); },
    });
    paint(0);
  } else {
    // fallback vanilla — se o GSAP CDN falhar, sticky via CSS + scroll+rAF lerp
    section.style.position='relative';
    var stage=section.querySelector('.pourA__stage');
    stage.style.position='sticky'; stage.style.top='0';
    var target=0, current=0;
    function onScroll(){ target=computeProgress(); }
    function loop(){
      current += (target-current)*0.12;
      if(Math.abs(target-current)<0.0005) current=target;
      paint(current);
      requestAnimationFrame(loop);
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    onScroll();
    loop();
  }
})();
</script>`;
}

// ============================================================================
// CAPA — SHOWPIECE (café, modo cinematic_a)
// Injetado via placeholder CAPA_PLACEHOLDER depois da geração do Opus.
// Fundo de vapor: frame sequence (121 .webp de capa_vapor.mp4, banco/cafe/
// frames_capa/) desenhada num <canvas>, em loop PING-PONG (pra frente até o
// fim, pra trás até o início, repete) — trocar apenas o ÍNDICE do array de
// frames já carregados é instantâneo, sem seek/decode, então não trava e
// não tem pausa na virada (limitação que um <video> real teria com
// currentTime/playbackRate). 170 grãos de café (sprites recortados de uma
// única folha graos.png — 8
// grãos-fonte, bboxes extraídas por detecção de componentes conectados no
// canal alpha) em 3 camadas de profundidade, com repulsão de mouse (GSAP
// quickTo); nome/tagline/subtexto entrando em blur→foco.
// ============================================================================
function buildCapa(assets) {
  const FRAMES_BASE = assets.framesBase;
  const FRAME_COUNT = assets.frameCount;
  const POSTER = assets.poster;
  const SHEET_URL = assets.beansSheet;
  const CAFE_NAME_1 = assets.cafeName1;
  const CAFE_NAME_2 = assets.cafeName2;
  const TAGLINE = assets.tagline;
  const SUBTEXT = assets.subtext;
  const BRAND_LABEL = assets.brandLabel;
  const CITY_LABEL = assets.cityLabel;
  const CTA_HREF = assets.ctaHref;
  return `
<section class="capa" id="capa" aria-label="Capa">
  <div class="capa__videoWrap" id="capaVideoWrap">
    <canvas class="capa__video" id="capaVideoCanvas" aria-hidden="true"></canvas>
    <img class="capa__poster" src="${POSTER}" alt="" aria-hidden="true"/>
  </div>
  <div class="capa__textScrim" aria-hidden="true"></div>
  <div class="capa__bottomFade" aria-hidden="true"></div>
  <div class="capa__grain" aria-hidden="true"></div>
  <div class="capa__beans" id="capaBeans" aria-hidden="true"></div>

  <div class="capa__topbar">
    <div class="capa__brand" id="capaBrand"></div>
    <div class="capa__clock"><span id="capaClock">--:--:--</span> · <span id="capaCity"></span></div>
  </div>

  <div class="capa__stage">
    <h1 class="capa__name">
      <span class="cWord" id="cw1"></span>
      <span class="cWord cWord--gold" id="cw2"></span>
    </h1>
    <p class="capa__tagline" id="capaTagline"></p>
    <p class="capa__subtext" id="capaSubtext"></p>
  </div>

  <div class="capa__bottom">
    <a href="${CTA_HREF}" class="capa__cta" id="capaCta">View the menu</a>
    <div class="capa__scroll" id="capaScroll">
      <span>SCROLL</span>
      <div class="capa__scrollline"><i></i></div>
    </div>
  </div>
</section>
<style>
  .capa{position:relative;height:100vh;min-height:640px;overflow:hidden;background:#080503;color:#F5EBDD}

  .capa__videoWrap{position:absolute;inset:-3vh;z-index:0}
  .capa__video,.capa__poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .capa__poster{opacity:0;pointer-events:none;z-index:1}
  .capa__videoWrap--failed .capa__video{display:none}
  .capa__videoWrap--failed .capa__poster{opacity:1}

  .capa__textScrim{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:linear-gradient(100deg, rgba(4,2,1,.5) 0%, rgba(4,2,1,.26) 34%, transparent 60%)}

  /* ponte de continuidade: dissolve o vídeo em #080503 (mesma cor-base de
     TODAS as seções) nos últimos ~10vh da capa, pra rolar direto pra seção
     seguinte sem nenhum corte de cor perceptível — sensação de peça única.
     ALTURA REDUZIDA (era 16vh) + grãos ficam com y-max abaixo dessa faixa
     (ver biasedPos) pra essa faixa nunca "comer" grão nenhum por cima. */
  .capa__bottomFade{position:absolute;left:0;right:0;bottom:0;height:10vh;z-index:4;pointer-events:none;
    background:linear-gradient(180deg, transparent 0%, #080503 100%)}

  .capa__grain{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .capa__beans{position:absolute;inset:0;z-index:2;pointer-events:none}
  .grain{position:absolute;pointer-events:none}
  .grain__float{will-change:transform}
  .grain__repel{will-change:transform}
  .grain__sprite{will-change:transform;background-repeat:no-repeat}

  .capa__topbar{position:absolute;top:0;left:0;right:0;z-index:8;display:flex;justify-content:space-between;align-items:center;padding:34px 6vw;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#E8B36B;opacity:0;text-shadow:0 2px 6px rgba(0,0,0,.85)}
  .capa__clock{font-variant-numeric:tabular-nums;color:#CBB89A}
  .capa__clock span{color:#F2C879}

  .capa__stage{position:relative;z-index:5;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;padding:0 6vw}

  .capa__name{display:flex;flex-direction:column;gap:.02em;min-width:0;max-width:100%}
  .cWord{display:inline-block;font-size:clamp(3rem,13vw,10rem);line-height:.96;font-weight:700;letter-spacing:-.02em;color:#FFFBF4;
    text-shadow:0 4px 30px rgba(0,0,0,.7);
    opacity:0;filter:blur(14px);transform:translateY(36px)}
  .cWord--gold{font-style:italic;font-weight:600;color:#E8A64A}

  .capa__tagline{margin-top:.6em;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:500;font-size:clamp(1.05rem,2vw,1.6rem);color:#F2E4CE;text-shadow:0 3px 16px rgba(0,0,0,.75);
    opacity:0;transform:translateY(18px)}
  .capa__subtext{margin-top:.55em;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:#CBB89A;text-shadow:0 2px 10px rgba(0,0,0,.8);
    opacity:0;transform:translateY(14px)}

  .capa__bottom{position:absolute;bottom:0;left:0;right:0;z-index:8;display:flex;justify-content:space-between;align-items:center;padding:0 6vw 42px}

  .capa__cta{opacity:0;pointer-events:auto;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0c0805;background:#F2C879;padding:15px 28px;border-radius:999px;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease}
  .capa__cta:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5)}

  .capa__scroll{opacity:0;display:flex;flex-direction:column;align-items:center;gap:10px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:3px;color:#CBB89A;text-shadow:0 2px 8px rgba(0,0,0,.8)}
  .capa__scrollline{width:1px;height:34px;background:rgba(255,255,255,.3);position:relative;overflow:hidden}
  .capa__scrollline i{position:absolute;left:0;top:-40%;width:100%;height:40%;background:#F2C879;animation:capaScrollDrop 1.8s ease-in-out infinite}
  @keyframes capaScrollDrop{0%{top:-40%}100%{top:100%}}

  @media(max-width:820px){
    .capa__topbar{padding:26px 7vw;font-size:10px}
    .cWord{font-size:clamp(2.4rem,15vw,4.4rem)}
    .capa__tagline{font-size:1rem}
    .capa__bottom{padding:0 7vw 30px}
    .capa__scroll{display:none}
    .capa__textScrim{background:linear-gradient(180deg, rgba(4,2,1,.3) 0%, rgba(4,2,1,.55) 55%, rgba(4,2,1,.72) 100%)}
  }

  @media(prefers-reduced-motion:reduce){
    .cWord,.capa__tagline,.capa__subtext{opacity:1;filter:none;transform:none}
    .capa__topbar,.capa__cta,.capa__scroll{opacity:1}
    .capa__scrollline i{animation:none;display:none}
    .grain__float{animation:none!important}
  }
</style>
<script>
(function(){
  var CAFE_NAME_1 = ${JSON.stringify(CAFE_NAME_1)};
  var CAFE_NAME_2 = ${JSON.stringify(CAFE_NAME_2)};
  var TAGLINE     = ${JSON.stringify(TAGLINE)};
  var SUBTEXT     = ${JSON.stringify(SUBTEXT)};
  var BRAND_LABEL = ${JSON.stringify(BRAND_LABEL)};
  var CITY_LABEL  = ${JSON.stringify(CITY_LABEL)};

  document.getElementById('cw1').textContent = CAFE_NAME_1;
  document.getElementById('cw2').textContent = CAFE_NAME_2;
  document.getElementById('capaTagline').textContent = TAGLINE;
  document.getElementById('capaSubtext').textContent = SUBTEXT;
  document.getElementById('capaBrand').textContent = BRAND_LABEL;
  document.getElementById('capaCity').textContent = CITY_LABEL;

  // ---- loop PING-PONG via FRAME SEQUENCE + canvas (não <video>) ----
  // A primeira versão tentava ping-pong num <video> real via currentTime
  // decrescendo (rAF) — mas seek em vídeo força o decoder a buscar o
  // keyframe anterior e decodificar pra frente até o ponto exato, o que
  // trava MUITO (cada seek é caro) e cria uma pausa perceptível bem no
  // ponto de virada (quando currentTime chega em 0 e precisa retomar o
  // play nativo — há um delay de seek+buffer ali). Isso é uma limitação
  // conhecida de <video>, não um bug de lógica.
  // Fix definitivo: mesma técnica já aprovada e comprovadamente lisa do
  // THE POUR — decompor o vídeo em frames .webp pré-carregados como
  // Image() e desenhar no <canvas> via drawImage. "Reverter" vira só
  // andar o ÍNDICE do array pra trás — não há seek, não há decode, é só
  // trocar qual imagem (já decodificada) é desenhada. Zero stutter, zero
  // pausa na virada, movimento idêntico pra frente e pra trás.
  (function setupPingPongFrames(){
    var wrap=document.getElementById('capaVideoWrap');
    var canvas=document.getElementById('capaVideoCanvas');
    if(!canvas) return;
    var ctx=canvas.getContext('2d');
    var FRAME_COUNT=${FRAME_COUNT};
    var FRAMES_BASE='${FRAMES_BASE}';
    var FPS=24; // mesmo fps do vídeo original — movimento em velocidade natural
    var dpr=Math.min(window.devicePixelRatio||1,2);

    function frameUrl(i){ return FRAMES_BASE+'/frame'+String(i).padStart(3,'0')+'.webp'; }

    var frames=[], failed=false, sized=false;
    function onFrameError(){
      if(failed)return; failed=true;
      if(wrap) wrap.classList.add('capa__videoWrap--failed');
    }
    for(var i=1;i<=FRAME_COUNT;i++){
      var img=new Image();
      img.onerror=onFrameError;
      img.src=frameUrl(i);
      frames.push(img);
    }

    function sizeCanvas(img){
      canvas.width=Math.round((img.naturalWidth||1280)*dpr);
      canvas.height=Math.round((img.naturalHeight||720)*dpr);
      sized=true;
    }

    function draw(idx){
      if(failed)return;
      var frame=frames[idx];
      if(frame && frame.complete && frame.naturalWidth){
        if(!sized) sizeCanvas(frame);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(frame,0,0,canvas.width,canvas.height);
      }
    }

    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var idx=0, dir=1, acc=0, lastTs=null;
    var frameDuration=1000/FPS;

    function tick(ts){
      if(failed)return;
      if(lastTs===null) lastTs=ts;
      var dt=ts-lastTs;
      lastTs=ts;
      acc+=dt;
      while(acc>=frameDuration){
        acc-=frameDuration;
        idx+=dir;
        if(idx>=FRAME_COUNT){ idx=FRAME_COUNT-2; dir=-1; }
        else if(idx<0){ idx=1; dir=1; }
      }
      draw(idx);
      requestAnimationFrame(tick);
    }

    // espera o 1º frame carregar antes de começar (evita canvas em branco);
    // se falhar, o fallback (poster) já assume via onFrameError.
    var startCheck=setInterval(function(){
      if(failed){ clearInterval(startCheck); return; }
      if(frames[0] && frames[0].complete && frames[0].naturalWidth){
        clearInterval(startCheck);
        draw(0);
        if(!reduce) requestAnimationFrame(tick);
      }
    },40);
  })();

  // ---- relógio ao vivo ----
  var clockEl=document.getElementById('capaClock');
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var d=new Date();
    clockEl.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  }
  tick();
  setInterval(tick,1000);

  // ---- grãos interativos: 170 instâncias, 3 camadas de profundidade ----
  var SHEET_URL=${JSON.stringify(SHEET_URL)}, SHEET_W=505, SHEET_H=302;
  // bboxes re-medidas por flood-fill no canal alpha (tight bounding box de
  // cada componente conectada) — mais precisas que a estimativa visual
  // anterior, que tinha alguns px de folga a mais em cada grão.
  var BEAN_SPRITES=[
    {x:179,y:4,w:57,h:63}, {x:28,y:42,w:73,h:66}, {x:391,y:49,w:66,h:69}, {x:220,y:102,w:79,h:75},
    {x:329,y:180,w:67,h:69}, {x:106,y:184,w:76,h:67}, {x:430,y:221,w:71,h:63}, {x:3,y:232,w:58,h:67},
  ];
  var GRAIN_COUNT=150;
  // Um grão em foto real é um oval na diagonal — dentro do retângulo reto
  // que o contém, ~25-28% da área é naturalmente transparente (os cantos).
  // Isso é normal e não é bug, MAS em tamanhos muito pequenos (<15px) +
  // opacidade baixa + blur, esses cantos transparentes somem visualmente
  // no fundo escuro e o grão passa a impressão de estar cortado ao meio.
  // sizeMin elevado (nenhuma camada abaixo de 15px) + opacidade mais alta
  // garantem a silhueta OVAL completa sempre legível como "grão inteiro".
  var TIERS=[
    {sizeMin:15, sizeMax:22, opMin:.62, opMax:.76, z:1},
    {sizeMin:22, sizeMax:32, opMin:.78, opMax:.9,  z:2},
    {sizeMin:32, sizeMax:48, opMin:.9,  opMax:1,   z:3},
  ];
  var beansWrap=document.getElementById('capaBeans');
  var grains=[];

  function rand(a,b){ return a+Math.random()*(b-a); }

  // margem de segurança: os grãos nunca podem nascer perto o bastante da
  // borda pra que o float (amplitude) + repulsão do mouse (MAX_PUSH) os
  // empurre pra fora do .capa (overflow:hidden) — isso causava grãos
  // "cortados pela metade" perto das bordas. y-max fica ACIMA da faixa do
  // .capa__bottomFade (10vh, z-index maior que os grãos) — senão o
  // gradiente escurece por cima dos grãos na base e eles parecem cortados.
  //
  // ACHADO IMPORTANTE (via teste isolado): o "grão cortado" reportado NÃO
  // era um bug de crop — cada grão sozinho renderiza inteiro em qualquer
  // tamanho/rotação (confirmado testando 1 grão isolado, todas transforms).
  // O problema real é DOIS OU MAIS grãos nascendo perto o bastante pra se
  // sobreporem: dois ovais semitransparentes sobrepostos se fundem numa
  // silhueta ambígua — "meio grão colado com pedaço de outro" — exatamente
  // o efeito reportado (reproduzido isoladamente pra confirmar a causa).
  //
  // Fix: amostragem por rejeição EM PIXELS, sensível ao TAMANHO de cada
  // grão — a primeira versão usava um gap fixo em %, que não é suficiente
  // pra dois grãos GRANDES (tier 3, até 48px) e distorce entre eixo X/Y
  // porque a seção não é quadrada (100vw x 100vh). Aqui a distância mínima
  // exigida entre os CENTROS de dois grãos é a soma dos seus próprios
  // raios + uma margem — proporcional ao tamanho real de cada um.
  var VW=window.innerWidth||1280, VH=window.innerHeight||800;
  var placedPx=[]; // {xPx,yPx,radiusPx}
  var GAP_MARGIN=10;
  function biasedPos(radiusPx){
    var x,y,best=null,bestSlack=-Infinity;
    for(var t=0;t<40;t++){
      if(Math.random()<0.62){
        x = Math.random()<0.5 ? rand(5,30) : rand(70,95);
        y = rand(9,75);
      } else {
        x = rand(5,95);
        y = rand(9,75);
      }
      var xPx=x/100*VW, yPx=y/100*VH;
      var worstSlack=Infinity;
      for(var j=0;j<placedPx.length;j++){
        var dx=xPx-placedPx[j].xPx, dy=yPx-placedPx[j].yPx;
        var d=Math.sqrt(dx*dx+dy*dy);
        var need=radiusPx+placedPx[j].radiusPx+GAP_MARGIN;
        var slack=d-need; // >=0 significa livre de colisão
        if(slack<worstSlack) worstSlack=slack;
      }
      if(worstSlack>=0){ placedPx.push({xPx:xPx,yPx:yPx,radiusPx:radiusPx}); return {x:x,y:y}; }
      if(worstSlack>bestSlack){ bestSlack=worstSlack; best={x:x,y:y,xPx:xPx,yPx:yPx}; }
    }
    placedPx.push({xPx:best.xPx,yPx:best.yPx,radiusPx:radiusPx});
    return {x:best.x,y:best.y};
  }

  for(var i=0;i<GRAIN_COUNT;i++){
    var tier = TIERS[i % TIERS.length];
    var sp=BEAN_SPRITES[i%BEAN_SPRITES.length];
    var dispW=rand(tier.sizeMin,tier.sizeMax);
    var scale=dispW/sp.w;
    var dispH=sp.h*scale;
    var pos=biasedPos(Math.max(dispW,dispH)/2);
    var rot=rand(-30,30);
    var mirror=Math.random()<0.5?-1:1;
    var floatDur=rand(3,6.4);
    var floatDelay=rand(0,4.5);
    var floatAmp=rand(6,14);
    var op=rand(tier.opMin,tier.opMax);

    var home=document.createElement('div');
    home.className='grain';
    home.style.left=pos.x+'%';
    home.style.top=pos.y+'%';
    home.style.zIndex=tier.z;

    var floatEl=document.createElement('div');
    floatEl.className='grain__float';
    floatEl.style.animation='grainFloat'+(i%3)+' '+floatDur+'s ease-in-out '+floatDelay+'s infinite';
    floatEl.style.setProperty('--amp',floatAmp+'px');

    var repelEl=document.createElement('div');
    repelEl.className='grain__repel';

    var sprite=document.createElement('div');
    sprite.className='grain__sprite';
    sprite.style.width=dispW+'px';
    sprite.style.height=dispH+'px';
    sprite.style.opacity=op;
    sprite.style.filter = tier.z===1 ? 'blur(.5px) drop-shadow(0 3px 5px rgba(0,0,0,.4))' : 'drop-shadow(0 6px 10px rgba(0,0,0,.5))';
    sprite.style.backgroundImage='url("'+SHEET_URL+'")';
    sprite.style.backgroundSize=(SHEET_W*scale)+'px '+(SHEET_H*scale)+'px';
    sprite.style.backgroundPosition=(-sp.x*scale)+'px '+(-sp.y*scale)+'px';
    sprite.style.transform='rotate('+rot+'deg) scaleX('+mirror+')';

    repelEl.appendChild(sprite);
    floatEl.appendChild(repelEl);
    home.appendChild(floatEl);
    beansWrap.appendChild(home);

    grains.push({home:home, repel:repelEl, baseX:0, baseY:0, tier:tier.z});
  }

  var styleTag=document.createElement('style');
  styleTag.textContent=
    '@keyframes grainFloat0{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(var(--amp)) rotate(4deg)}}'+
    '@keyframes grainFloat1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(calc(var(--amp) * -1)) rotate(-5deg)}}'+
    '@keyframes grainFloat2{0%,100%{transform:translateX(0) translateY(0)}50%{transform:translateX(calc(var(--amp) * .6)) translateY(calc(var(--amp) * .8))}}';
  document.head.appendChild(styleTag);

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap=(typeof window.gsap!=='undefined' && typeof window.ScrollTrigger!=='undefined');

  function layoutGrains(){
    grains.forEach(function(g){
      var r=g.home.getBoundingClientRect();
      g.baseX=r.left; g.baseY=r.top;
    });
  }
  window.addEventListener('resize',layoutGrains);

  if(!reduce && hasGsap){
    gsap.registerPlugin(ScrollTrigger);

    grains.forEach(function(g){
      g.qx=gsap.quickTo(g.repel,'x',{duration:.5,ease:'power3.out'});
      g.qy=gsap.quickTo(g.repel,'y',{duration:.5,ease:'power3.out'});
    });
    layoutGrains();
    setTimeout(layoutGrains,600);

    var REPEL_R=130, MAX_PUSH=55;
    window.addEventListener('mousemove',function(e){
      grains.forEach(function(g){
        var dx=g.baseX-e.clientX, dy=g.baseY-e.clientY;
        var dist=Math.hypot(dx,dy)||0.0001;
        if(dist<REPEL_R){
          var strength=(1-dist/REPEL_R);
          strength = strength*strength*(3-2*strength);
          var push=strength*MAX_PUSH;
          g.qx(dx/dist*push); g.qy(dy/dist*push);
        } else {
          g.qx(0); g.qy(0);
        }
      });
    },{passive:true});

    var tl=gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('.capa__topbar',{opacity:.9,duration:.8},0)
      .to('#cw1',{opacity:1,filter:'blur(0px)',y:0,duration:1,ease:'power4.out'},.15)
      .to('#cw2',{opacity:1,filter:'blur(0px)',y:0,duration:1.1,ease:'power4.out'},.35)
      .to('#capaTagline',{opacity:1,y:0,duration:.8},.85)
      .to('#capaSubtext',{opacity:1,y:0,duration:.7},1.0)
      .to('#capaCta',{opacity:1,duration:.7},1.05)
      .to('#capaScroll',{opacity:.85,duration:.6},1.2);
    window.__capaTl=tl;
  } else {
    document.querySelectorAll('.cWord').forEach(function(w){ w.style.opacity=1; w.style.filter='none'; w.style.transform='none'; });
    document.getElementById('capaTagline').style.opacity=1;
    document.getElementById('capaTagline').style.transform='none';
    document.getElementById('capaSubtext').style.opacity=1;
    document.getElementById('capaSubtext').style.transform='none';
    document.querySelector('.capa__topbar').style.opacity=.9;
    document.getElementById('capaCta').style.opacity=1;
    document.getElementById('capaScroll').style.opacity=.85;
  }
})();
</script>`;
}

// ============================================================================
// STORY — SHOWPIECE (café, modo cinematic_a)
// Injetado via placeholder STORY_PLACEHOLDER depois da geração do Opus.
// Editorial simples: eyebrow numerado "01 / OUR STORY" + título serif +
// narrativa (variável — vem de aboutText do form, com fallback) ao lado de
// uma foto grande (ambiente.jpg por padrão). Mesmo fundo/paleta das outras
// seções pra fluir sem corte visual a partir da CAPA.
// ============================================================================
function buildStory(assets) {
  const NARRATIVE = assets.narrative;
  const PHOTO = assets.photo;
  return `
<section class="story" id="story" aria-label="Our Story">
  <div class="story__bg" aria-hidden="true"></div>
  <div class="story__grain" aria-hidden="true"></div>

  <div class="story__inner">
    <div class="story__text">
      <div class="story__eyebrow reveal">01 / OUR STORY</div>
      <h2 class="story__title reveal">Crafted for <em>the moment.</em></h2>
      <p class="story__narrative reveal">${NARRATIVE}</p>
    </div>
    <div class="story__media reveal">
      <img src="${PHOTO}" alt="" loading="lazy" decoding="async"/>
    </div>
  </div>
</section>
<style>
  .story{position:relative;background:#080503;color:#F5EBDD;padding:14vh 6vw;overflow:hidden}
  /* fundo CHAPADO #080503 (sem gradiente vertical) + glow radial recuado
     bem pra dentro (nunca toca y=0% nem y=100%) — garante que o topo e a
     base da seção batem PIXEL A PIXEL com a seção vizinha, sem nenhuma
     linha de corte na transição do scroll. */
  .story__bg{position:absolute;inset:0;z-index:0;background:
    radial-gradient(50% 40% at 80% 40%, rgba(210,140,60,.11) 0%, rgba(180,110,40,0) 68%),
    #080503}
  .story__grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .story__inner{position:relative;z-index:2;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:8vw;align-items:center}

  .story__eyebrow{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#E8B36B;text-transform:uppercase;margin-bottom:20px;opacity:.9}
  .story__title{font-size:clamp(2.2rem,4.6vw,3.6rem);font-weight:600;line-height:1.08;letter-spacing:-.01em;color:#FFFBF4;margin-bottom:4vh}
  .story__title em{font-style:italic;font-weight:500;color:#E8A64A}
  .story__narrative{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.05rem,1.4vw,1.25rem);line-height:1.75;color:#E8DCC8;max-width:52ch}

  .story__media{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:4/5;min-height:420px;
    box-shadow:0 30px 70px rgba(0,0,0,.45)}
  .story__media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}

  .reveal{opacity:0;transform:translateY(36px);will-change:transform,opacity}

  @media(max-width:900px){
    .story__inner{grid-template-columns:1fr;gap:6vh}
    .story__media{order:-1;min-height:320px}
    .story{padding:10vh 7vw}
  }

  @media(prefers-reduced-motion:reduce){
    .reveal{opacity:1;transform:none}
  }
</style>
<script>
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = (typeof window.gsap!=='undefined' && typeof window.ScrollTrigger!=='undefined');

  if(reduce || !hasGsap){
    document.querySelectorAll('#story .reveal').forEach(function(el){ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.batch('#story .reveal', {
    start:'top 85%',
    onEnter: function(batch){
      gsap.to(batch, {opacity:1, y:0, duration:1, ease:'power3.out', stagger:.12, clearProps:'willChange'});
    },
    once:true,
  });
})();
</script>`;
}

// ============================================================================
// GALLERY — SHOWPIECE (café, modo cinematic_a)
// Injetado via placeholder GALLERY_PLACEHOLDER depois da geração do Opus.
// Portado de teste-gallery.html (aprovado): mosaico masonry via CSS
// multi-column (cada foto com seu próprio aspect-ratio), revelado em blocos
// via ScrollTrigger.batch conforme entra na viewport, hover zoom+brilho em
// CSS puro.
// ============================================================================
function buildGallery(assets) {
  const PHOTOS = assets.photos; // array de até 6 URLs
  const ratios = ["3/4", "1/1", "4/5", "4/3", "1/1", "3/4"];
  const items = PHOTOS.slice(0, 6).map((url, i) =>
    `<figure class="g-item gal-reveal" style="--ar:${ratios[i % ratios.length]}"><img src="${url}" alt="" loading="lazy" decoding="async"/></figure>`
  ).join("\n    ");
  return `
<section class="gal" id="gal" aria-label="Gallery">
  <div class="gal__bg" aria-hidden="true"></div>
  <div class="gal__grain" aria-hidden="true"></div>

  <div class="gal__head">
    <div class="gal__eyebrow gal-reveal">04 / MOMENTS</div>
    <h2 class="gal__title gal-reveal">Every cup, <em>a moment.</em></h2>
  </div>

  <div class="gal__grid" id="galGrid">
    ${items}
  </div>
</section>
<style>
  .gal{position:relative;background:#080503;color:#F5EBDD;padding:12vh 6vw 14vh;overflow:hidden}

  /* fundo chapado + glow recuado — ver nota de continuidade em .story__bg */
  .gal__bg{position:absolute;inset:0;z-index:0;background:
    radial-gradient(50% 38% at 50% 32%, rgba(210,140,60,.13) 0%, rgba(180,110,40,0) 68%),
    #080503}

  .gal__grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .gal__head{position:relative;z-index:2;margin-bottom:7vh;max-width:640px}
  .gal__eyebrow{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#E8B36B;text-transform:uppercase;margin-bottom:18px;opacity:.9}
  .gal__title{font-size:clamp(2rem,4.4vw,3.6rem);font-weight:600;line-height:1.08;letter-spacing:-.01em;color:#FFFBF4}
  .gal__title em{font-style:italic;font-weight:500;color:#E8A64A}

  .gal__grid{position:relative;z-index:2;column-count:3;column-gap:28px}
  @media(max-width:1100px){ .gal__grid{column-count:2} }
  @media(max-width:640px){ .gal__grid{column-count:1} }

  .g-item{position:relative;margin:0 0 28px;break-inside:avoid;border-radius:6px;overflow:hidden;background:#15100c;
    aspect-ratio:var(--ar,4/5);
    content-visibility:auto;contain-intrinsic-size:400px 500px}
  .g-item img{display:block;width:100%;height:100%;object-fit:cover;
    transform:scale(1.001) translateZ(0);filter:brightness(1) saturate(1);
    transition:transform .7s cubic-bezier(.16,1,.3,1),filter .7s ease}
  @media(hover:hover) and (pointer:fine){
    .g-item:hover img{transform:scale(1.06) translateZ(0);filter:brightness(1.1) saturate(1.08);will-change:transform}
  }
  .g-item::after{content:'';position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}

  .gal-reveal{opacity:0;transform:translateY(44px) scale(.97);will-change:transform,opacity}

  @media(max-width:640px){
    .gal{padding:9vh 7vw 10vh}
    .gal__head{margin-bottom:5vh}
    .g-item{margin-bottom:20px}
  }

  @media(prefers-reduced-motion:reduce){
    .gal-reveal{opacity:1;transform:none}
    .g-item img{transition:none}
  }
</style>
<script>
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap=(typeof window.gsap!=='undefined' && typeof window.ScrollTrigger!=='undefined');

  if(reduce || !hasGsap){
    document.querySelectorAll('.gal-reveal').forEach(function(el){ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.batch('.gal__head .gal-reveal', {
    start:'top 88%',
    onEnter: function(batch){
      gsap.to(batch, {opacity:1, y:0, scale:1, duration:.9, ease:'power3.out', stagger:.12, clearProps:'willChange'});
    },
    once:true,
  });

  ScrollTrigger.batch('.gal__grid .gal-reveal', {
    start:'top 90%',
    onEnter: function(batch){
      gsap.to(batch, {opacity:1, y:0, scale:1, duration:1, ease:'power3.out', stagger:.1, clearProps:'willChange'});
    },
    once:true,
  });
})();
</script>`;
}

// ============================================================================
// MENU — SHOWPIECE (café, modo cinematic_a)
// Injetado via placeholder MENU_PLACEHOLDER depois da geração do Opus.
// Portado de teste-menu.html (aprovado): vitrine grande e espaçosa (refs
// Johnny's Dirty Soda / Duckbill Cookies) — 3-4 cards por vez, setas + drag
// com inércia (GSAP Draggable/InertiaPlugin). Passar o mouse (ou tocar no
// mobile) amplia o card, revela a descrição e embaça/apaga os irmãos —
// controlado no .menuCard__inner (filho), nunca no .menuCard (pai, área de
// hover FIXA) pra nunca reintroduzir o bug do tremor (ver comentários no
// CSS abaixo).
// ============================================================================
function buildMenu(assets) {
  const DRINKS = assets.drinks;
  const FOOD = assets.food;
  return `
<div class="menuPage" id="menu">
  <div class="menuPage__bg" aria-hidden="true"></div>
  <div class="menuPage__grain" aria-hidden="true"></div>

  <div class="menuRow" id="drinksRow"></div>
  <div class="menuRow" id="foodRow"></div>
</div>
<style>
  .menuPage{position:relative;background:#080503;color:#F5EBDD;padding:10vh 0 8vh;overflow:hidden}
  /* fundo chapado + glow recuado — ver nota de continuidade em .story__bg */
  .menuPage__bg{position:absolute;inset:0;z-index:0;background:
    radial-gradient(50% 32% at 50% 34%, rgba(210,140,60,.12) 0%, rgba(180,110,40,0) 68%),
    #080503}
  .menuPage__grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .menuRow{position:relative;z-index:2;margin-bottom:10vh}
  .menuRow:last-child{margin-bottom:0}

  .menuRow__head{display:flex;justify-content:space-between;align-items:flex-end;padding:0 6vw;margin-bottom:5vh;gap:24px}
  .menuRow__eyebrow{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#E8B36B;text-transform:uppercase;margin-bottom:16px;opacity:.9}
  .menuRow__title{font-size:clamp(1.9rem,3.6vw,3rem);font-weight:600;line-height:1.05;letter-spacing:-.01em;color:#FFFBF4}

  .menuRow__dragHint{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#CBB89A;opacity:.75;white-space:nowrap;padding-bottom:6px}
  .menuRow__dragHint i{display:inline-block;animation:dragNudge 1.6s ease-in-out infinite}
  @keyframes dragNudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}

  .menuRow__carousel{position:relative}

  /* setas: wrapper de tamanho fixo (56px, o <button> de verdade) + filho
     visual (48px, pointer-events:none) — impede o hit-test de hesitar
     entre pai/filho, o que causava tremor de hover na borda. */
  .menuRow__arrowHit{position:absolute;top:36%;transform:translateY(-50%);width:56px;height:56px;
    display:flex;align-items:center;justify-content:center;z-index:7;cursor:pointer;
    background:none;border:none;padding:0;appearance:none;-webkit-appearance:none}
  .menuRow__arrowHit--prev{left:1.2vw}
  .menuRow__arrowHit--next{right:1.2vw}
  .menuRow__arrowHit:disabled{cursor:default}

  .menuRow__arrow{width:48px;height:48px;border-radius:50%;pointer-events:none;
    background:rgba(18,13,8,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.14);color:#F5EBDD;font-size:20px;line-height:1;
    display:flex;align-items:center;justify-content:center;
    transition:background .3s ease,border-color .3s ease,transform .3s ease,opacity .3s ease}
  .menuRow__arrowHit:hover .menuRow__arrow{background:rgba(242,200,121,.16);border-color:rgba(242,200,121,.45);transform:scale(1.08)}
  .menuRow__arrowHit:disabled .menuRow__arrow{opacity:.22}

  .menuRow__track{overflow-x:hidden;overflow-y:visible;padding:3vh 0 5vh;
    -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 6vw,#000 94%,transparent 100%);
    mask-image:linear-gradient(90deg,transparent 0,#000 6vw,#000 94%,transparent 100%)}
  .menuRow__track--native{overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
  .menuRow__track--native::-webkit-scrollbar{display:none}

  .menuRow__cardsWrap{display:flex;gap:34px;width:max-content;padding:0 6vw;cursor:grab}
  .menuRow__cardsWrap:active{cursor:grabbing}

  /* card: .menuCard é a área de hover, TAMANHO FIXO, nunca se transforma.
     .menuCard__inner (filho) é quem o JS/GSAP escala/sobe/embaça — mesma
     lógica anti-tremor das setas. */
  .menuCard{position:relative;width:clamp(300px,27vw,392px);flex:0 0 auto;scroll-snap-align:center}
  .menuCard__inner{pointer-events:none;will-change:transform,opacity,filter}

  .menuCard__imgWrap{position:relative;aspect-ratio:6/5;border-radius:22px;overflow:hidden;background:#15100c;
    box-shadow:0 18px 42px rgba(0,0,0,.4);transition:box-shadow .5s ease}
  .menuCard.is-active .menuCard__imgWrap{box-shadow:0 30px 64px rgba(0,0,0,.6),0 0 0 1px rgba(242,200,121,.18)}
  .menuCard__imgWrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;pointer-events:none;user-select:none;-webkit-user-drag:none}

  .menuCard__body{padding:22px 6px 0}
  .menuCard__top{display:flex;justify-content:space-between;align-items:baseline;gap:14px}
  .menuCard__name{font-size:clamp(1.35rem,1.9vw,1.65rem);font-weight:600;color:#FFFBF4;letter-spacing:-.01em}
  .menuCard__price{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;color:#F2C879;white-space:nowrap}

  .menuCard__desc{margin-top:0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12.5px;line-height:1.7;letter-spacing:.2px;color:#B9A98D;
    max-height:0;opacity:0;overflow:hidden;
    transition:max-height .5s cubic-bezier(.16,1,.3,1),opacity .4s ease,margin-top .5s ease}
  .menuCard.is-active{z-index:5}
  .menuCard.is-active .menuCard__desc{max-height:6em;opacity:1;margin-top:10px}

  @media(max-width:820px){
    .menuRow{margin-bottom:7vh}
    .menuRow__head{padding:0 7vw;flex-direction:column;align-items:flex-start;gap:10px;margin-bottom:3.5vh}
    .menuRow__track{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 7vw,#000 96%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 7vw,#000 96%,transparent 100%)}
    .menuCard{width:78vw}
    .menuRow__arrow{display:none}
  }

  @media(prefers-reduced-motion:reduce){
    .menuRow__dragHint i{animation:none}
  }
</style>
<script>
(function(){
  var DRINKS = ${JSON.stringify(DRINKS)};
  var FOOD = ${JSON.stringify(FOOD)};

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasDrag = (typeof window.gsap!=='undefined' && typeof window.Draggable!=='undefined');
  if(hasDrag){ gsap.registerPlugin(Draggable, window.InertiaPlugin); }
  var hasInertia = hasDrag && typeof window.InertiaPlugin!=='undefined';

  function buildRow(mount, items, eyebrow, title){
    mount.innerHTML =
      '<div class="menuRow__head">'+
        '<div><div class="menuRow__eyebrow">'+eyebrow+'</div><h2 class="menuRow__title">'+title+'</h2></div>'+
        '<div class="menuRow__dragHint">DRAG <i>→</i></div>'+
      '</div>'+
      '<div class="menuRow__carousel">'+
        '<button class="menuRow__arrowHit menuRow__arrowHit--prev" aria-label="Previous"><span class="menuRow__arrow">‹</span></button>'+
        '<div class="menuRow__track"><div class="menuRow__cardsWrap"></div></div>'+
        '<button class="menuRow__arrowHit menuRow__arrowHit--next" aria-label="Next"><span class="menuRow__arrow">›</span></button>'+
      '</div>';

    var track=mount.querySelector('.menuRow__track');
    var wrap=mount.querySelector('.menuRow__cardsWrap');
    var prevHit=mount.querySelector('.menuRow__arrowHit--prev');
    var nextHit=mount.querySelector('.menuRow__arrowHit--next');

    items.forEach(function(item){
      var card=document.createElement('div');
      card.className='menuCard';
      card.innerHTML=
        '<div class="menuCard__inner">'+
          '<div class="menuCard__imgWrap"><img src="'+item.img+'" alt="'+item.name+'" loading="lazy" decoding="async"/></div>'+
          '<div class="menuCard__body">'+
            '<div class="menuCard__top"><span class="menuCard__name">'+item.name+'</span><span class="menuCard__price">'+item.price+'</span></div>'+
            '<p class="menuCard__desc">'+item.desc+'</p>'+
          '</div>'+
        '</div>';
      wrap.appendChild(card);
    });

    var cards=Array.prototype.slice.call(wrap.querySelectorAll('.menuCard'));
    var GAP=34;
    var step=cards[0].getBoundingClientRect().width + GAP;

    if(reduce || !hasDrag){
      track.classList.add('menuRow__track--native');
      prevHit.addEventListener('click',function(){ track.scrollBy({left:-step, behavior: reduce?'auto':'smooth'}); });
      nextHit.addEventListener('click',function(){ track.scrollBy({left:step, behavior: reduce?'auto':'smooth'}); });
      return;
    }

    var activeCard=null;
    var isTouch=window.matchMedia('(hover: none), (pointer: coarse)').matches;

    function setActive(card){
      if(activeCard===card) return;
      activeCard=card;
      card.classList.add('is-active');
      cards.forEach(function(c){
        var inner=c.querySelector('.menuCard__inner');
        if(c===card){
          gsap.set(c,{zIndex:5});
          gsap.to(inner,{scale:1.055, y:-16, opacity:1, filter:'blur(0px)', duration:.55, ease:'power3.out', overwrite:'auto'});
        } else {
          c.classList.remove('is-active');
          gsap.set(c,{zIndex:1});
          gsap.to(inner,{scale:0.94, y:0, opacity:.4, filter:'blur(4px)', duration:.55, ease:'power3.out', overwrite:'auto'});
        }
      });
    }

    function clearActive(){
      if(!activeCard) return;
      activeCard.classList.remove('is-active');
      activeCard=null;
      cards.forEach(function(c){
        gsap.set(c,{zIndex:1});
        var inner=c.querySelector('.menuCard__inner');
        gsap.to(inner,{scale:1, y:0, opacity:1, filter:'blur(0px)', duration:.5, ease:'power3.out', overwrite:'auto'});
      });
    }

    cards.forEach(function(card){
      if(isTouch){
        card.addEventListener('click',function(){
          if(activeCard===card){ clearActive(); } else { setActive(card); }
        });
      } else {
        card.addEventListener('mouseenter',function(){ setActive(card); });
        card.addEventListener('mouseleave',function(){ clearActive(); });
      }
    });
    if(isTouch){
      document.addEventListener('click',function(e){
        if(activeCard && !activeCard.contains(e.target)){ clearActive(); }
      });
    }

    var dragInst=Draggable.create(wrap,{
      type:'x',
      bounds:track,
      inertia:hasInertia,
      edgeResistance:0.75,
      dragClickables:true,
      onDragStart:clearActive,
      onDrag:updateArrowState,
      onThrowUpdate:updateArrowState,
      onDragEnd:updateArrowState,
    })[0];

    function updateArrowState(){
      var x=gsap.getProperty(wrap,'x');
      prevHit.disabled = x >= dragInst.maxX - 1;
      nextHit.disabled = x <= dragInst.minX + 1;
    }

    function go(dir){
      clearActive();
      var current=gsap.getProperty(wrap,'x');
      var target=current - dir*step;
      target=Math.max(dragInst.minX, Math.min(dragInst.maxX, target));
      gsap.to(wrap,{x:target, duration:.6, ease:'power3.out',
        onUpdate:function(){ dragInst.update(); },
        onComplete:updateArrowState});
    }
    prevHit.addEventListener('click',function(){ go(-1); });
    nextHit.addEventListener('click',function(){ go(1); });

    updateArrowState();
    window.addEventListener('resize',updateArrowState);
  }

  buildRow(document.getElementById('drinksRow'), DRINKS, '02 / DRINKS', 'Our craft');
  buildRow(document.getElementById('foodRow'), FOOD, '03 / FOOD', 'Fresh, always');
})();
</script>`;
}

// ============================================================================
// CONTACT — SHOWPIECE (café, modo cinematic_a), última seção do site.
// Injetado via placeholder CONTACT_PLACEHOLDER depois da geração do Opus.
// Portado de teste-contato.html (aprovado): iframe REAL do Google Maps
// (embed sem API key, "/maps?q=ENDEREÇO&output=embed") com dark mode via
// filtro CSS (invert+hue-rotate — a Maps Embed API simples não aceita
// estilo noturno nativo, isso só existe na Maps JS API paga). CTA "Get
// directions" e o mapa abrem o Google Maps de verdade. Entrada via
// ScrollTrigger.batch.
// ============================================================================
function buildContact(assets) {
  const ADDRESS = assets.address;
  const HOURS_LINES = assets.hoursLines; // array de strings
  const PHONE = assets.phone;
  const EMAIL = assets.email;
  const SOCIALS = assets.socials; // array de {label, url}
  const MAPS_URL = assets.mapsUrl;
  const MAP_EMBED_URL = assets.mapEmbedUrl;
  const TEL_HREF = assets.telHref;
  const MAILTO_HREF = assets.mailtoHref;
  return `
<section class="contact" id="contact" aria-label="Contact">
  <div class="contact__bg" aria-hidden="true"></div>
  <div class="contact__grain" aria-hidden="true"></div>

  <div class="contact__inner">
    <div class="contact__info">
      <div class="contact__eyebrow reveal">05 / VISIT US</div>
      <h2 class="contact__title reveal">Come say <em>hello.</em></h2>

      <div class="contact__block reveal">
        <div class="contact__label">Address</div>
        <p class="contact__text">${ADDRESS}</p>
      </div>

      <div class="contact__block reveal">
        <div class="contact__label">Hours</div>
        <div class="contact__hours">${HOURS_LINES.map(l => `<div><span>${l}</span></div>`).join("")}</div>
      </div>

      <div class="contact__block reveal">
        <div class="contact__label">Contact</div>
        <p class="contact__text">
          ${PHONE ? `<a class="contact__link" href="${TEL_HREF}">${PHONE}</a><br>` : ""}
          ${EMAIL ? `<a class="contact__link" href="${MAILTO_HREF}">${EMAIL}</a>` : ""}
        </p>
      </div>

      <a class="contact__cta reveal" href="${MAPS_URL}" target="_blank" rel="noopener">Get directions</a>

      <div class="contact__socials reveal">${SOCIALS.map((s, i) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>${i < SOCIALS.length - 1 ? '<span style="color:#4a4038">·</span>' : ""}`).join("")}</div>
    </div>

    <div class="contact__map reveal">
      <iframe class="contact__mapFrame" title="Map" src="${MAP_EMBED_URL}"
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen></iframe>
    </div>
  </div>
</section>
<style>
  .contact{position:relative;background:#080503;color:#F5EBDD;padding:12vh 6vw 10vh;overflow:hidden}
  /* fundo chapado + glow recuado — ver nota de continuidade em .story__bg */
  .contact__bg{position:absolute;inset:0;z-index:0;background:
    radial-gradient(48% 36% at 22% 38%, rgba(210,140,60,.13) 0%, rgba(180,110,40,0) 68%),
    #080503}
  .contact__grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}

  .contact__inner{position:relative;z-index:2;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:8vw;align-items:center}

  .contact__eyebrow{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:3px;color:#E8B36B;text-transform:uppercase;margin-bottom:18px;opacity:.9}
  .contact__title{font-size:clamp(2.2rem,4.6vw,3.6rem);font-weight:600;line-height:1.05;letter-spacing:-.01em;color:#FFFBF4;margin-bottom:6vh}
  .contact__title em{font-style:italic;font-weight:500;color:#E8A64A}

  .contact__block{margin-bottom:3.4vh}
  .contact__label{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:2.5px;text-transform:uppercase;color:#8a7a63;margin-bottom:8px}
  .contact__text{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;line-height:1.7;color:#E8DCC8}
  .contact__hours{display:flex;flex-direction:column;gap:4px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;color:#E8DCC8}

  .contact__link{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:14px;line-height:1.9;color:#E8DCC8;text-decoration:none;border-bottom:1px solid rgba(232,220,200,.25);transition:color .3s ease,border-color .3s ease}
  .contact__link:hover{color:#F2C879;border-color:rgba(242,200,121,.5)}

  .contact__cta{display:inline-block;margin-top:1vh;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0c0805;background:#F2C879;padding:15px 30px;border-radius:999px;text-decoration:none;box-shadow:0 10px 30px rgba(242,200,121,.2);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease}
  .contact__cta:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(242,200,121,.32)}

  .contact__socials{display:flex;gap:18px;margin-top:5vh}
  .contact__socials a{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7a63;text-decoration:none;transition:color .3s ease}
  .contact__socials a:hover{color:#F2C879}

  .contact__map{position:relative;display:block;aspect-ratio:1/1;border-radius:22px;overflow:hidden;
    background:#100b07;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 50px rgba(0,0,0,.4)}
  .contact__mapFrame{position:absolute;inset:0;width:100%;height:100%;border:0;
    filter:invert(90%) hue-rotate(180deg) brightness(.95) contrast(.88) saturate(.7);
    background:#100b07}

  .reveal{opacity:0;transform:translateY(34px)}

  @media(max-width:900px){
    .contact__inner{grid-template-columns:1fr;gap:7vh}
    .contact__map{aspect-ratio:16/11;order:-1}
    .contact{padding:9vh 7vw 8vh}
  }

  @media(prefers-reduced-motion:reduce){
    .reveal{opacity:1;transform:none}
  }
</style>
<script>
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = (typeof window.gsap!=='undefined' && typeof window.ScrollTrigger!=='undefined');

  if(reduce || !hasGsap){
    document.querySelectorAll('.reveal').forEach(function(el){ el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.batch('.reveal', {
    start:'top 88%',
    onEnter: function(batch){
      gsap.to(batch, {opacity:1, y:0, duration:1, ease:'power3.out', stagger:.1});
    },
    once:true,
  });
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
      vapor: `${bankBase}/capa_vapor.mp4`, // fundo da CAPA (café A)
    };

    // ---------- FRAME SEQUENCE (usado só pelo café B) ----------
    const bankFrames = {
      base: `${bankBase}/frames`,
      count: 40,
      pattern: `${bankBase}/frames/frame`,
      cupPattern: `${bankBase}/frames_cup/frame`,
      lattePattern: `${bankBase}/frames_latte/frame`,
      cafeCount: 40,
      cupReady: true,     // (café A usa PNGs animados via GSAP — cup/graos/leite/gelo — não usa frame sequence)
      latteReady: false,  // true quando frames_latte/ estiver no ar (efeito B)
    };

    // ---------- ASSETS DO SHOWPIECE THE POUR A (café) — FRAME SEQUENCE ----------
    // 130 frames .webp extraídos de pour_scene_dark.mp4 (10s, 1080p, fundo
    // PRETO — coreografia grãos→espiral de leite→gelo caindo), SOMENTE
    // desse vídeo — banco/cafe/pour_scene.mp4 (âmbar) e frames_pour/ antigos
    // foram apagados do banco pra nunca mais serem confundidos com este.
    // Amostrado a ~13fps (130 frames/10s), resolução CHEIA 1920x1080 (webp
    // q80, ~8.4MB total) — sem downscale, prioriza qualidade. poster =
    // frame001 (mesmo frame do início), fallback se os frames falharem em
    // carregar. FRAMES_VERSION (no script do buildPourA) cache-busta a URL
    // pra nunca servir frame antigo em cache do CDN sob o mesmo nome.
    const cafePourAssets = {
      framesBase: `${bankBase}/frames_pour_dark`,
      frameCount: 130,
      poster: `${bankBase}/frames_pour_dark/frame001.webp?v=3`,
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

    // ============================================================================
    // ASSETS + HTML CARIMBADO DAS 5 SEÇÕES NOVAS (CAPA, STORY, GALLERY, MENU,
    // CONTACT) — só pro café cinematográfico A. Mesma lógica do THE POUR A:
    // bloco determinístico, o Opus só deixa o marcador no lugar certo.
    // ============================================================================
    let CAPA_HTML = "", STORY_HTML = "", GALLERY_HTML = "", MENU_HTML = "", CONTACT_HTML = "";
    if (isCinematicCafeA) {
      // ---- CAPA ----
      // Nome do café dividido em 2 partes pro efeito "palavra normal + palavra
      // dourada em itálico" — se tiver "&"/"e"/"and" usamos como ponto de corte
      // natural (ex: "Ember & Oak" -> "Ember" / "& Oak"), senão corta na
      // primeira palavra (ex: "Grão Café" -> "Grão" / "Café").
      const nameParts = businessName.trim().split(/\s+/);
      let capaName1, capaName2;
      const ampIdx = nameParts.findIndex(w => /^(&|e|and)$/i.test(w));
      if (ampIdx > 0 && ampIdx < nameParts.length - 1) {
        capaName1 = nameParts.slice(0, ampIdx).join(" ");
        capaName2 = nameParts.slice(ampIdx).join(" ");
      } else if (nameParts.length > 1) {
        capaName1 = nameParts[0];
        capaName2 = nameParts.slice(1).join(" ");
      } else {
        capaName1 = businessName;
        capaName2 = "";
      }
      const capaAssets = {
        framesBase: `${bankBase}/frames_capa`,
        frameCount: 121,
        poster: `${bankBase}/hero.jpg`,
        beansSheet: `${bankBase}/graos.png`,
        cafeName1: capaName1,
        cafeName2: capaName2,
        tagline: heroSubtitle || "Your daily ritual, perfected.",
        subtext: `Artisan coffee roasters · ${city}`,
        brandLabel: `// ${businessName.toUpperCase()}`,
        cityLabel: city.toUpperCase(),
        ctaHref: "#menu",
      };
      CAPA_HTML = buildCapa(capaAssets);

      // ---- STORY ----
      // narrativa é variável (aboutText do form) com um fallback caloroso
      // padrão pra quando o form não preenche esse campo — sempre trocável
      // por cafeteria.
      const storyAssets = {
        narrative: aboutText || `At ${businessName}, every cup begins long before it reaches your hands. We source our beans with intention, roast them with care, and pour each cup as if it were our first. ${city.split(",")[0]} is more than our address — it's our community. Whether you're here for a quiet morning or a moment between meetings, you'll always find warmth in every cup.`,
        photo: `${bankBase}/ambiente.jpg`,
      };
      STORY_HTML = buildStory(storyAssets);

      // ---- GALLERY ----
      const galleryAssets = { photos: photoList.slice(0, 6) };
      GALLERY_HTML = buildGallery(galleryAssets);

      // ---- MENU ----
      // Itens de cardápio não fazem parte dos dados extraídos do negócio (nome,
      // endereço, telefone...) — usamos um cardápio realista de café artesanal
      // como ponto de partida (mesmo padrão de "invent realistic items" já
      // usado no resto do prompt), com as fotos reais já commitadas no banco.
      const menuAssets = {
        drinks: [
          { name: "Espresso", desc: "Rich, bold, and pulled to order — pure intensity in a single shot", price: "€2.80", img: `${bankBase}/espresso.png` },
          { name: "Cappuccino", desc: "Silky steamed milk over a double shot, crowned with delicate foam art", price: "€3.50", img: `${bankBase}/cappuccino.png` },
          { name: "Caffe Latte", desc: "Smooth espresso folded into velvety steamed milk, layered to perfection", price: "€3.80", img: `${bankBase}/latte.png` },
          { name: "Americano", desc: "Espresso met with hot water — clean, smooth, and honest", price: "€3.00", img: `${bankBase}/americano.png` },
          { name: "Flat White", desc: "Double ristretto under smooth microfoam — bold yet balanced", price: "€3.60", img: `${bankBase}/flatwhite.png` },
          { name: "Mocha", desc: "Espresso, rich chocolate, and steamed milk — indulgence in every sip", price: "€4.00", img: `${bankBase}/mocha.png` },
        ],
        food: [
          { name: "Croissant", desc: "Flaky, buttery layers baked fresh each morning", price: "€3.20", img: `${bankBase}/croissant.png` },
          { name: "Avocado Toast", desc: "Creamy smashed avocado on toasted sourdough, chilli flakes and a hint of lime", price: "€8.50", img: `${bankBase}/avocadotoast.png` },
          { name: "Carrot Cake", desc: "Moist spiced sponge under a blanket of cream cheese frosting", price: "€4.50", img: `${bankBase}/carrotcake.png` },
          { name: "Cookie", desc: "Golden edges, gooey centre, melting chocolate in every bite", price: "€2.80", img: `${bankBase}/cookie.png` },
          { name: "Toastie", desc: "Grilled to golden perfection, oozing with melted cheese", price: "€7.00", img: `${bankBase}/toastie.png` },
          { name: "Scone", desc: "Warm and crumbly, served with clotted cream and jam", price: "€3.50", img: `${bankBase}/scone.png` },
        ],
      };
      MENU_HTML = buildMenu(menuAssets);

      // ---- CONTACT ----
      const contactAddress = address || city;
      const hoursLines = hours
        ? hours.split(/[\n|;]+/).map(s => s.trim()).filter(Boolean)
        : ["Mon – Fri  7:00 – 19:00", "Sat – Sun  8:00 – 18:00"];
      const contactAssets = {
        address: contactAddress,
        hoursLines,
        phone: phone || "",
        email: email || "",
        telHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
        mailtoHref: `mailto:${email}`,
        socials: [
          { label: "Instagram", url: "https://instagram.com/" },
          { label: "Facebook", url: "https://facebook.com/" },
        ],
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactAddress)}`,
        mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(contactAddress)}&output=embed`,
      };
      CONTACT_HTML = buildContact(contactAssets);
    }

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
      const cinematicCafeABlock = isCinematicCafeA ? `

═══════════ CAFÉ A — STAMPED SHOWPIECE SHELL (DO NOT DESIGN THIS PAGE) ═══════════
★★★ CRITICAL — this page is NOT generated by you section-by-section. Every section is a locked, pre-built showpiece component that gets injected by the server after you respond. Your ONLY job is to output a minimal, valid HTML5 document (<!DOCTYPE html> ... <head> with charset/viewport/title only, no inline design CSS, no fonts, no nav, no custom sections) whose <body> contains EXACTLY these 6 placeholder tokens, each on its own line, in this EXACT order, and NOTHING else in the body:

CAPA_PLACEHOLDER
STORY_PLACEHOLDER
THE_POUR_A_PLACEHOLDER
MENU_PLACEHOLDER
GALLERY_PLACEHOLDER
CONTACT_PLACEHOLDER

Do NOT build a hero, story, origin, menu, gallery, reviews, faq, or contact section yourself. Do NOT add any CSS, JS, nav, or other markup. Do NOT wrap the tokens in extra elements. Do NOT add commentary. Output only: <!DOCTYPE html> + minimal <head> (charset, viewport, title "${businessName}") + <body> with exactly those 6 lines + </body></html>. The real design, palette, typography and every effect are already built server-side.
` : "";

      const cinematicCafeBlock = isCinematicCafeB ? `

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

      if (isCinematicCafeA) {
        userPrompt = `You are outputting a minimal HTML shell only. The real page (hero, THE POUR, gallery, menu, contact) is already fully designed and built server-side as locked components — you are NOT designing anything here, just providing the placeholder skeleton they get injected into.

Output ONLY raw HTML from <!DOCTYPE html> to </html>. No markdown, no code fences, no explanation.
${cinematicCafeABlock}`;
      } else {
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

    // Injeta GSAP 3 + ScrollTrigger via CDN (cdnjs) no <head> de todo site gerado.
    // Carimbado aqui (não pedido ao Opus) pra garantir que a tag sempre existe,
    // igual ao padrão do HERO_VIDEO_SRC/THE_POUR_A_PLACEHOLDER abaixo. Café A
    // carimbado usa 6 seções (capa+story+pour+menu+gallery+contact) e MENU precisa
    // de Draggable+InertiaPlugin também — só esses sites pagam esse peso extra
    // de JS (os outros nichos não usam nada de drag).
    const GSAP_CDN_TAGS = isCinematicCafeA
      ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Draggable.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/InertiaPlugin.min.js"></script>`
      : `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>`;
    // Café A carimbado usa Fraunces (serif) + JetBrains Mono (labels) em TODAS
    // as 6 seções, mas o shell mínimo que o Opus gera não inclui os <link> de
    // fonte nem um reset — sem isso cada seção cai pro fallback do sistema
    // (Georgia/monospace) e a margem padrão do <body> (8px) rompe a
    // continuidade visual entre seções. Carimbado aqui pra garantir sempre.
    const CAFE_A_HEAD_TAGS = isCinematicCafeA
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{background:#080503}body{font-family:'Fraunces',Georgia,serif}</style>`
      : "";
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${GSAP_CDN_TAGS}\n${CAFE_A_HEAD_TAGS}`);
    } else {
      html = GSAP_CDN_TAGS + "\n" + CAFE_A_HEAD_TAGS + "\n" + html;
    }

    // Injeta o vídeo real no placeholder (evita mandar base64 gigante no prompt)
    if (hasVideo) {
      html = html.split("HERO_VIDEO_SRC").join(heroVideoBase64);
    }

    // Injeta os 6 showpieces carimbados do café cinematográfico A, na ordem
    // final CAPA → STORY → THE POUR → MENU → GALLERY → CONTACT. Igual à
    // lógica do HERO_VIDEO_SRC: o Opus deixa os marcadores, o servidor troca
    // pelos blocos prontos — garante que os efeitos são IDÊNTICOS toda vez
    // e nunca travam.
    if (isCinematicCafeA) {
      html = html.split("CAPA_PLACEHOLDER").join(CAPA_HTML);
      html = html.split("STORY_PLACEHOLDER").join(STORY_HTML);
      html = html.split("THE_POUR_A_PLACEHOLDER").join(POUR_A_HTML);
      html = html.split("MENU_PLACEHOLDER").join(MENU_HTML);
      html = html.split("GALLERY_PLACEHOLDER").join(GALLERY_HTML);
      html = html.split("CONTACT_PLACEHOLDER").join(CONTACT_HTML);
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
