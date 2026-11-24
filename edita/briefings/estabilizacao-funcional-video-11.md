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

```
Take this exact skeleton, stool, stick, pose and backward lean, but change the CAMERA-FACING ANGLE of the
ribcage, shoulders and skull: instead of the pure side-profile view (one shoulder directly behind the
other), rotate the whole upper body — ribcage, shoulders, skull — about 45 degrees around the spine's
vertical axis, so roughly HALF of the chest and HALF of the face now face the camera, like a person twisting
at the waist to look back over toward the viewer. This must look visibly different from a side profile: both
eyes and both shoulders should be at least partly visible to the camera, not just one. The hips, legs and
stool stay facing the original side direction, unchanged — only the spine above the pelvis twists. Keep the
arms, the stick overhead, the backward lean angle, the lighting and the background exactly the same.
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
