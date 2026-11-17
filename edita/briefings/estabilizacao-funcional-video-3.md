# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 3

17/11/2026 · modelo: `3_ESTABILIZAÇÃO_FUNCIONAL_-_AUTOCORREÇÃO_COM_UM_BASTÃO...mp4` (enviado pelo usuário, 32 s)

| Item | Definição |
| --- | --- |
| Posição | Sentada, mãos apoiadas nas coxas, mantendo crescimento axial e autocorreção das curvas |
| Exercício | Pega o bastão com os MMSS, horizontalizado, mãos na distância dos ombros; eleva o bastão para cima o máximo possível (crescimento axial); inclina o tronco em bloco para frente e levanta da cadeira, ficando em pé; mantém 30 s; senta novamente; retorna à posição inicial |
| Visual | Vista de PERFIL (igual aos vídeos 1 e 2), esqueleto 3D (Gemini), sem espelhamento |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo (antes de gerar qualquer imagem)

- f002: sentada, mãos à frente horizontais segurando o bastão, cotovelos esticados
- f007–f012: bastão sobe até ficar esticado acima da cabeça, crescimento axial
- f020–f025: inclina o tronco em bloco (sem curvar a coluna) e **levanta da cadeira**, ficando em pé, bastão continua elevado
- f030–f032: permanece em pé segurando o bastão no alto (fase de sustentação, igual ao "minuto" dos vídeos 1-6 de correção postural, mas aqui o texto pede 30 s)

Diferente dos vídeos 1 e 2: este tem uma fase **em pé**, então precisa de uma imagem nova nessa posição
(as sentadas reaproveitam a pose/banco dos vídeos anteriores).

## Imagens necessárias

Reaproveita `posicao-inicial.jpg` do vídeo 1 para abertura/fechamento. Preciso de 3 imagens novas em
`edita/projeto/public/esqueleto/estabilizacao3/`:

**1 — segurando o bastão, braços à frente (edite a `posicao-inicial.jpg` do vídeo 1)**

```
From this image, change only the arms: raise both arms straight forward, at shoulder height, holding a
horizontal wooden stick between both hands, hands shoulder-width apart, elbows fully extended. Keep the
skeleton, the side profile view, background and camera exactly the same.
```

**2 — bastão elevado acima da cabeça, ainda sentada (edite a imagem 1)**

```
From this image, keep the skeleton sitting on the stool exactly the same, and change only the arms: raise
the wooden stick straight up overhead, arms fully extended above the head, as if stretching upward (axial
growth). Keep the side profile view, background and camera exactly the same.
```

**3 — em pé, bastão elevado (edite a imagem 2)**

```
From this image, keep the arms and the stick exactly the same (fully extended overhead), and change the
body from sitting to standing: have the skeleton stand up fully from the stool, upright, keeping the torso
straight (leaning forward as a single block to rise, not curving the spine). Keep the stool, the side
profile view, background and camera exactly the same.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura**

```
Exercício de estabilização funcional, com autocorreção da postura e um bastão. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão, segurando um bastão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Coloque a mão sobre a coxa e apoie o peso nela. <break time="2s" />
Pegue o bastão com as duas mãos, na horizontal, com as mãos afastadas na largura dos ombros. <break time="2s" />
Agora, eleve o bastão para cima, o máximo que conseguir, crescendo a coluna. <break time="2s" />
Incline o tronco para frente, em bloco, sem curvar as costas, e levante-se da cadeira, ficando em pé. <break time="2s" />
Mantenha essa posição por trinta segundos e continue respirando. <break time="2s" />
Agora, sente-se novamente na cadeira, com calma. <break time="2s" />
Para terminar, abaixe o bastão e volte para a posição inicial.
```

**Áudio 3 — Encerramento** (igual aos vídeos 1 e 2)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Gerar as 3 imagens novas (braços com bastão sentada, bastão elevado sentada, em pé com bastão elevado)
- [ ] Confirmar se precisa de avisos de "faltam 10/20 segundos" durante os 30 s em pé (como nos vídeos 1-6 de correção postural)
