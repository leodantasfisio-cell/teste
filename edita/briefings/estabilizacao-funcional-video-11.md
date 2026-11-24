# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 11

24/11/2026 · modelo: `AUTOCORREÇÃO - ESTABILIZAÇÃO ABDOMINAL - CRESCIMENTO AXIAL MMSS ELEVADOS PARA CIMA COM BASTÃO, INCLINAÇÃO PARA TRÁS E REALIZAR ROTAÇÃO DE TRONCO...mp4` (enviado pelo usuário, 30 s, só com o título)

| Item | Definição |
| --- | --- |
| Posição inicial | Sentada, mão apoiada na coxa, mantendo crescimento axial e autocorreção das curvas |
| Exercício | Pega o bastão, eleva o braço acima da cabeça (crescimento axial); inclina o tronco para trás; mantendo a inclinação, gira o tronco (rotação) |
| Retorno | Desfaz a rotação, endireita o tronco, abaixa o bastão e volta para a posição inicial |
| Visual | Vista de PERFIL para a maior parte do vídeo (igual aos vídeos 1-6, 9 e 10); na rotação, o tronco gira em direção à câmera |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

É o mesmo exercício do vídeo 10 (bastão elevado + inclinação para trás), com um passo a mais no final:
mantendo o braço elevado e o tronco inclinado para trás, ela gira o tronco em direção à câmera (rotação),
olhando praticamente de frente por um instante, e depois desfaz a rotação, volta a olhar de perfil,
endireita o tronco e abaixa o bastão.

## Imagens necessárias

Reaproveita `posicao-inicial.jpg` do vídeo 1, `bastao-elevado.jpg` do vídeo 3 e `bastao-inclinado-atras.jpg`
do vídeo 10. Só falta 1 imagem nova em `edita/projeto/public/esqueleto/estabilizacao11/`:

**1 — tronco girado, mantendo a inclinação para trás e o bastão elevado (edite `bastao-inclinado-atras.jpg` do vídeo 10)**

Edição não funcionou em 3 tentativas (o Gemini sempre devolve o esqueleto em perfil puro, sem girar os
ombros). Mudando para geração do zero, igual ao que resolveu o vídeo 5 e o vídeo 6:

```
A 3D anatomical skeleton model with ivory-white bones, sitting on a backless wooden stool, knees bent at 90
degrees, feet flat on the floor. The pelvis and legs face directly sideways (full side profile, like someone
sitting side-on to the camera), but the spine twists above the waist: the ribcage and shoulders are rotated
about 45 degrees from that side-facing pelvis, turning toward the camera, so the collarbones and front of
the ribcage/sternum are visible at an angle instead of a flat side silhouette — like a seated torso twist.
The head and face follow the same rotation, turned mostly toward the camera. Both arms are raised straight
overhead, hands together gripping a horizontal wooden stick above the head. The torso also leans back
slightly from the hips, a controlled backward lean (not a big recline), spine straight. Dark-gray studio
background, soft even studio lighting, photorealistic render, same camera framing and distance as the other
seated shots in this series.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura** (igual ao vídeo 10)

```
Exercício de estabilização funcional, com autocorreção da postura e um bastão. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão, segurando um bastão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Coloque a mão sobre a coxa e apoie o peso nela. <break time="2s" />
Eleve o bastão para cima, o máximo que conseguir, crescendo a coluna. <break time="2s" />
Agora, mantendo o braço elevado, incline o tronco para trás, bem devagar, contraindo o abdômen. <break time="2s" />
Mantendo essa posição, gire o tronco para o lado, bem devagar. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Agora, desfaça a rotação, voltando o tronco para o centro. <break time="2s" />
Volte devagar, endireitando o tronco. <break time="2s" />
Para terminar, abaixe o bastão e volte para a posição inicial.
```

**Áudio 3 — Encerramento** (igual aos anteriores)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Aguardando a imagem nova do Gemini.
