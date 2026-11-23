# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 7

23/11/2026 · modelo: `11_ESTABILIZAÇÃO_FUNCIONAL_-_AUTO_CORREÇÃO_COM_AS_DUAS_MÃOS_ATRÁS_DA_CABEÇA...mp4` (enviado pelo usuário, 35 s, com texto)

| Item | Definição |
| --- | --- |
| Posição inicial | Sentada, mãos apoiadas atrás da cabeça (nuca), mantendo crescimento axial e autocorreção das curvas |
| Exercício | Realiza o crescimento axial, com as mãos tracionando a cabeça superiormente (alonga o pescoço/coluna puxando a cabeça para cima) |
| Retorno | Volta para a posição inicial |
| Visual | Vista de PERFIL, igual aos vídeos 1-6 (o vídeo-modelo foi filmado de costas, mas mantenho o padrão visual da série) |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

Filmado de costas (fisioterapeuta ao lado explicando). Paciente sentada (de costas, pernas não aparecem no
enquadramento, mas o texto do usuário confirma "sentada"), mãos entrelaçadas atrás da nuca, cotovelos
abertos para os lados. O movimento é sutil: a partir dessa posição, ela traciona a cabeça para cima com as
mãos, alongando o pescoço/coluna (crescimento axial), e depois volta. Mais simples que o vídeo 6: só 2 poses,
sem inclinar tronco, sem levantar da cadeira.

## Imagens necessárias

Reaproveita `posicao-inicial.jpg` do vídeo 1 como base (sentada no banquinho, perfil). Preciso de 2 imagens
novas em `edita/projeto/public/esqueleto/estabilizacao7/`:

**1 — mãos atrás da cabeça (geração do zero)**

```
A 3D anatomical skeleton model with ivory-white bones, photographed in side profile (left side facing
camera), sitting upright on a backless wooden stool, feet flat on the floor, knees bent at 90 degrees, spine
straight and tall. Both arms are raised with hands clasped together behind the head at the base of the
skull, fingers interlaced, elbows pointing out to the sides, away from the head. Dark-gray studio background,
soft even studio lighting, photorealistic render, same camera framing and distance as a seated side-profile
shot.
```

**2 — crescimento axial, tracionando a cabeça para cima (edite a imagem 1)**

```
From this image, keep the hands clasped behind the head in exactly the same grip and the elbows in the same
position, and show the neck and spine slightly elongated upward, as if the hands are gently pulling the head
upward and the whole spine is growing taller — chin very slightly tucked, head raised a touch higher than
before. Keep the stool, the side profile view, background and camera exactly the same.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura** (igual aos anteriores)

```
Exercício de estabilização funcional, com autocorreção da postura. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Entrelace os dedos e apoie as mãos atrás da cabeça, na nuca, com os cotovelos abertos para os lados. <break time="2s" />
Agora, cresça a coluna para cima, tracionando a cabeça com as mãos, alongando o pescoço. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Para terminar, solte as mãos e volte para a posição inicial.
```

**Áudio 3 — Encerramento** (igual aos anteriores)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Aguardando as 2 imagens novas do Gemini.
