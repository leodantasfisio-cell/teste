# Briefing de Vídeo — Autocorreção Estabilização Funcional Lombar, Vídeo 1

27/11/2026 · modelo: `AU0D19_1.MP4` (enviado pelo usuário, 34 s, sem título no arquivo — nome do
exercício confirmado pelo usuário)

| Item | Definição |
| --- | --- |
| Pasta | Autocorreção Estabilização Funcional Lombar (nova — primeiro vídeo) |
| Título | Perna alternada (deitada) |
| Posição inicial | Deitada de costas (supina) no chão, joelhos dobrados a 90°, pés apoiados no chão, braços ao lado do corpo, quadril apoiado no chão |
| Exercício | Mantendo o quadril apoiado no chão (sem elevar), estende uma perna para cima (fisioterapeuta segura o pé/tornozelo); alterna entre as pernas |
| Retorno | Dobra a perna de volta, volta para a posição inicial |
| Visual | **Novo**: esqueleto deitado de perfil no chão (em vez de sentado no banquinho), mesmo estilo visual (ossos cor marfim, fundo cinza-escuro de estúdio) |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

Filmado de frente/baixo, com o fisioterapeuta em pé sobre a maca segurando a perna da paciente — ângulo
difícil de aproveitar diretamente. Decisão: manter o padrão visual da série (esqueleto 3D gerado no
Gemini), em vista de perfil, deitada no chão.

**Correção (27/11/2026)**: no vídeo-modelo NÃO tem elevação de quadril — o quadril fica apoiado no chão o
tempo todo, só a perna se estende e volta, alternando de lado. Removida a etapa de "ponte" do roteiro.

Sequência: deitada, joelhos dobrados, pés apoiados → estende uma perna reta para cima (quadril continua
no chão) → dobra a perna de volta, apoiando o pé → troca de perna (alternada) → volta à posição inicial.

## Imagens necessárias (pasta nova, estilo novo)

Pasta: `edita/projeto/public/esqueleto/estabilizacao-lombar1/`. 2 imagens, no mesmo
esqueleto/chão/fundo/câmera:

**1 — posição inicial, deitada, joelhos dobrados** ✅ aprovada (`posicao-inicial.jpg`)

```
A 3D anatomical skeleton model with ivory-white bones, lying on its back (supine) on the floor,
photographed in side profile. Both knees are bent at 90 degrees, both feet flat on the floor, arms resting
flat at the sides of the body, palms down. The head rests on the floor. Dark-gray studio background, soft
even studio lighting, photorealistic render, camera at floor height, framing the whole body from the side.
```

**2 — uma perna estendida para cima, quadril no chão (edite a imagem 1 — `posicao-inicial.jpg`)**

```
From this image, keep the hips/pelvis and shoulders flat on the floor exactly as they are — do NOT lift the
hips — and keep the floor, side profile view, background and camera exactly the same.

Change ONLY the leg closer to the camera, and only by straightening its knee: its thigh must stay at the
EXACT SAME ANGLE at the hip as it already is in this image (hip flexed the same amount), like simply
unbending the knee. Do NOT swing the leg up and over, do NOT point it past vertical or back toward the head —
it should look like a simple knee extension, the lower leg/shin now in a straight line with that same thigh,
foot pointing up and away from the hip at that same thigh angle, not hyperextended. The OTHER leg (farther
from the camera) stays exactly as it is, knee bent, foot flat on the floor.
```

(A imagem de "ponte" gerada antes — `ponte.jpg` — não é usada neste vídeo; fica guardada caso sirva pra
outro exercício da mesma pasta.)

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura**

```
Exercício de estabilização funcional lombar, com autocorreção da postura. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Deite de costas no chão, com os joelhos dobrados e os pés apoiados. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Mantendo o quadril apoiado no chão, estenda uma perna reta para cima. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Dobre a perna de volta, apoiando o pé no chão. <break time="2s" />
Agora, repita do outro lado: estenda a outra perna para cima. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Dobre a perna de volta, com calma, voltando para a posição inicial.
```

**Áudio 3 — Encerramento** (igual aos anteriores)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Aguardando a imagem 2 nova do Gemini (perna estendida, sem ponte).
