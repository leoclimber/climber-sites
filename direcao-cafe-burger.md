# DIREÇÃO DE ARTE — CAFÉ E HAMBURGUERIA

Formato de referência. Se algum campo faltar aqui, adicionar antes
de escrever os 38 nichos restantes.

---

# NICHO 01 — CAFÉ / PADARIA
Pasta: `cafe`

## 1. O que o cliente decide ao olhar
"Quero passar tempo nesse lugar?"

Ele não agenda, não compara antes/depois, não pesquisa credencial.
Ele quer saber se o lugar é bonito, o que tem pra comer, onde fica e
se está aberto agora. O produto é a ATMOSFERA.

## 2. Paleta

### Clean A "Editorial"
| Papel | Hex | Uso |
|---|---|---|
| Fundo | `#FAF8F5` | Base, quase branco com calor mínimo |
| Texto | `#1C1917` | Quase preto, nunca #000 |
| Secundário | `#78716C` | Legenda, label, metadado |
| Acento | `#8B4A2F` | Terracota queimada — CTA e detalhe |
| Linha | `#E7E2DB` | Divisórias, hairline |

Nota: o acento é escuro e dessaturado de propósito, para não cair no
terracota claro que é default de IA (~#D97757).

### Clean B "Vitrine"
| Papel | Hex | Uso |
|---|---|---|
| Fundo | `#14110F` | Marrom-preto profundo |
| Texto | `#F5F1EC` | Off-white quente |
| Secundário | `#A8A29E` | Legenda |
| Acento | `#E8A33D` | Âmbar — CTA e número |
| Superfície | `#241F1B` | Cards e blocos elevados |

Duas personalidades opostas de propósito. O cliente sente a
diferença antes de ler qualquer coisa.

## 3. Tipografia

**Clean A:**
- Display: **Newsreader** (400 e 500) — serifada de leitura, calma,
  editorial. Não é a serifada de alto contraste que a IA usa.
- Texto: **Inter** (400, 500)
- Utilitária: **Inter** (500), letter-spacing `0.08em`, caixa alta,
  para eyebrow e label

**Clean B:**
- Display: **Instrument Serif** (400 + itálico)
- Texto: **Archivo** (400, 500, 600)
- Utilitária: **Archivo** (600), caixa alta, `0.1em`

### Escala (ambos)
```
hero:    clamp(2.75rem, 8vw, 6rem)     line-height 0.95  ls -0.03em
seção:   clamp(2rem, 5vw, 3.5rem)      line-height 1.05  ls -0.02em
subtít:  clamp(1.25rem, 3vw, 1.75rem)  line-height 1.3   ls -0.01em
corpo:   clamp(1rem, 2vw, 1.125rem)    line-height 1.65  ls 0
label:   0.75rem                        line-height 1.2   ls 0.1em
```
Peso 600 é o máximo em display. Nunca 700 em corpo.

## 4. Fotografia

**Mood:** luz natural lateral, hora do dia visível, sombra suave mas
presente. Nada de flash, nada de fundo branco de estúdio.

**Proporção dominante:** horizontal (3:2) para ambiente, quadrada
(1:1) para produto, vertical (4:5) para detalhe.

**Presença humana:** mãos sim, rosto raramente e desfocado. O
protagonista é o lugar, não a pessoa.

### Os 13 papéis
| Arquivo | O que mostra | Proporção |
|---|---|---|
| `hero.jpg` | O espaço em luz natural, ângulo largo, vida acontecendo | 16:9 |
| `atmosphere-01.jpg` | Mesa junto à janela, luz entrando | 3:2 |
| `atmosphere-02.jpg` | Vista do balcão, máquina, movimento | 3:2 |
| `atmosphere-03.jpg` | Canto de leitura, poltrona, planta | 3:2 |
| `atmosphere-04.jpg` | Vista de dentro para a rua | 3:2 |
| `product-01.jpg` | Xícara em close, latte art, vapor | 1:1 |
| `product-02.jpg` | Café coado sendo servido, jarra | 1:1 |
| `product-03.jpg` | Doce ou bolo, corte visível | 1:1 |
| `product-04.jpg` | Sanduíche ou prato salgado | 1:1 |
| `detail-01.jpg` | Grão de café, textura, macro | 4:5 |
| `detail-02.jpg` | Mão do barista, gesto, movimento | 4:5 |
| `detail-03.jpg` | Louça empilhada, textura de material | 4:5 |
| `facade.jpg` | Fachada, placa, entrada, contexto de rua | 3:2 |

**Vídeo (só Clean B):** 4–6s, silencioso, loop. Vapor subindo da
xícara, ou leite sendo despejado formando latte art. Sem corte.

## 5. Ordem das seções

**Clean A "Editorial"**
1. Hero — foto tela cheia, nome em display grande, uma linha
2. Manifesto — 2–3 parágrafos curtos, muito respiro, foto sangrando
   à direita (assimétrico)
3. Cardápio — tipográfico, filtro por categoria, sem foto em card
4. A rotina — sticky com troca: grão → torra → método → xícara
5. O espaço — mosaico de fotos, pesos diferentes
6. Horários + localização — mapa, endereço, horário por dia
7. Avaliações — 3 curtas, do Google
8. Rodapé — Instagram, telefone, delivery

**Clean B "Vitrine"**
1. Hero — vídeo em loop, nome sobreposto, CTA
2. Barra de destaque — 3 números (anos, cafés servidos, nota)
3. Cardápio — carrossel de arraste com foto, preço em destaque
4. O espaço — grade densa, mosaico
5. Delivery — logos das plataformas
6. A rotina — foto + texto alternado, ritmo rápido
7. Horários + localização
8. Avaliações
9. Rodapé

## 6. Destaques (2–3, não mais)

**Clean A:** reveal forte com stagger, parallax no hero,
sticky com troca em "A rotina"

**Clean B:** carrossel de arraste no cardápio, contador na barra de
destaque, vídeo curto no hero

## 7. Tom de copy

**Voz:** primeira pessoa do plural, calma, específica. Fala de
lugar e de rotina, não de "experiência" nem de "excelência".

**Proibido:** "bem-vindo", "aconchegante", "o melhor café da
cidade", "venha nos conhecer", "qualidade e sabor".

**Obrigatório:** o bairro pelo nome, o ano de abertura, de onde vem
o grão, o horário de abertura, o nome de quem faz.

**Exemplos de headline que funcionam:**
- "Torrado em Dublin 8, servido desde 2019."
- "Abrimos às sete. O primeiro bule sai às sete e dez."

**Exemplo do que não funciona:**
- "Um espaço aconchegante para momentos especiais."

**CTA:** "Ver o cardápio", "Como chegar", "Pedir no Deliveroo".
Nunca "Saiba mais".

## 8. Obrigações do nicho
- Preço exibido com VAT incluído (obrigação legal irlandesa)
- 14 alergênicos declarados no cardápio
- Links de delivery quando houver
- Horário por dia da semana, incluindo feriado

## 9. Detalhe assinado
**Clean A:** régua tipográfica — uma linha vertical fina à esquerda
de cada seção, com o número da seção em caixa alta pequena.

**Clean B:** o vapor. Um elemento gráfico de vapor que reaparece
como divisória entre seções, sempre no âmbar do acento.

---

# NICHO 02 — HAMBURGUERIA
Pasta: `burger`

## 1. O que o cliente decide
"Bate a vontade agora?"

Decisão rápida, movida por apetite. O produto é o PRODUTO — o
hambúrguer em si. Ninguém entra no site de hamburgueria para
contemplar o ambiente.

## 2. Paleta

### Clean A "Editorial"
| Papel | Hex | Uso |
|---|---|---|
| Fundo | `#F2EFE9` | Papel manteiga, quase creme |
| Texto | `#171412` | Quase preto |
| Secundário | `#6B6259` | Legenda |
| Acento | `#B3341C` | Vermelho-tijolo queimado |
| Linha | `#DDD7CD` | Divisórias |

### Clean B "Vitrine"
| Papel | Hex | Uso |
|---|---|---|
| Fundo | `#0D0B0A` | Preto carvão |
| Texto | `#F7F4F0` | Off-white |
| Secundário | `#948B82` | Legenda |
| Acento | `#FF4D1F` | Laranja-brasa |
| Superfície | `#1A1614` | Cards |

Laranja-brasa em vez do vermelho genérico: remete a fogo e carvão,
que é o mundo do nicho, e não é o vermelho de botão padrão.

## 3. Tipografia

**Clean A:**
- Display: **Fraunces** (600, com `SOFT` e `WONK` ativados) —
  serifada com personalidade, um pouco americana, sem ser retrô
- Texto: **Archivo** (400, 500)
- Utilitária: **Archivo** (600), caixa alta, `0.12em`

**Clean B:**
- Display: **Archivo Expanded** (700, caixa alta) — grotesk larga,
  peso alto, impacto direto
- Texto: **Archivo** (400, 500)
- Utilitária: **Archivo** (600), caixa alta, `0.14em`

Aqui o Clean B abandona a serifada de propósito. Hambúrguer denso
pede grotesk pesada, não elegância.

### Escala
```
hero:    clamp(3rem, 10vw, 7rem)       line-height 0.9   ls -0.04em
seção:   clamp(2.25rem, 6vw, 4rem)     line-height 1.0   ls -0.03em
subtít:  clamp(1.25rem, 3vw, 1.75rem)  line-height 1.25  ls -0.01em
corpo:   clamp(1rem, 2vw, 1.125rem)    line-height 1.6   ls 0
label:   0.75rem                        line-height 1.2   ls 0.14em
```

## 4. Fotografia

**Mood:** luz dura lateral ou contraluz, sombra marcada, textura
visível. Gordura brilhando, queijo derretendo, fumaça. O oposto da
luz suave do café.

**Proporção dominante:** quadrada (1:1) para produto, horizontal
(3:2) para processo.

**Presença humana:** mãos segurando o hambúrguer, sim. Rosto, não.

### Os 13 papéis
| Arquivo | O que mostra | Proporção |
|---|---|---|
| `hero.jpg` | O hambúrguer principal, close, camadas visíveis | 16:9 |
| `product-01.jpg` | Hambúrguer clássico, corte lateral | 1:1 |
| `product-02.jpg` | Segundo hambúrguer, ângulo alto | 1:1 |
| `product-03.jpg` | Batata, textura, sal visível | 1:1 |
| `product-04.jpg` | Bebida ou milkshake | 1:1 |
| `process-01.jpg` | Carne na chapa, marca de grelha, fumaça | 3:2 |
| `process-02.jpg` | Montagem, mão colocando camada | 3:2 |
| `process-03.jpg` | Queijo derretendo, close macro | 3:2 |
| `detail-01.jpg` | Corte transversal, camadas | 4:5 |
| `detail-02.jpg` | Mão segurando, mordida ausente | 4:5 |
| `detail-03.jpg` | Ingrediente cru, textura | 4:5 |
| `space-01.jpg` | Balcão, cozinha aberta | 3:2 |
| `facade.jpg` | Fachada, placa | 3:2 |

**Vídeo (só Clean B):** 4–6s, cortado, rápido. Carne na chapa com
som visual de sear, ou hambúrguer sendo montado em stop-motion.

## 5. Ordem das seções

**Clean A "Editorial"**
1. Hero — foto tela cheia, nome, uma linha
2. O método — o que faz esse hambúrguer ser esse, assimétrico
3. Cardápio — tipográfico, filtro (clássicos / especiais /
   acompanhamentos / bebidas)
4. Os ingredientes — sticky com troca: pão → carne → queijo → molho
5. O lugar — mosaico
6. Horários + localização
7. Delivery
8. Rodapé

**Clean B "Vitrine"**
1. Hero — vídeo, nome grande, CTA de delivery
2. Barra de destaque — 3 números
3. Configurador — monte seu hambúrguer, preço atualiza
4. Cardápio — carrossel de arraste
5. O método — foto + texto alternado
6. Delivery — logos
7. Horários + localização
8. Avaliações
9. Rodapé

## 6. Destaques

**Clean A:** reveal forte, parallax no hero, sticky em "Os
ingredientes"

**Clean B:** configurador, contador, vídeo curto

## 7. Tom de copy

**Voz:** direta, curta, com atitude. Frase de três a seis palavras.
Sem adjetivo vazio.

**Proibido:** "suculento", "irresistível", "o melhor da cidade",
"feito com amor", "experiência gastronômica".

**Obrigatório:** o peso da carne em gramas, o tipo de corte, o nome
do pão, o tempo na chapa, o produtor da carne.

**Exemplos que funcionam:**
- "180g de peito bovino. Chapa a 250°."
- "Pão brioche assado aqui, todo dia às cinco."

**O que não funciona:**
- "Um hambúrguer suculento e irresistível."

**CTA:** "Pedir no Deliveroo", "Ver o cardápio", "Montar o meu".

## 8. Obrigações do nicho
- Preço com VAT
- 14 alergênicos declarados
- Links de delivery (crítico neste nicho — é o canal principal)
- Horário por dia

## 9. Detalhe assinado
**Clean A:** numeração tipográfica grande e translúcida atrás de
cada seção (01, 02, 03) — só onde a sequência é real.

**Clean B:** a brasa. Rastro de toque que deixa um brilho laranja
que esfria em ~600ms. Reaparece como divisória entre seções.
