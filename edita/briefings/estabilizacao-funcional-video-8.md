# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 8

23/11/2026 · modelo: `12_ESTABILIZAÇÃO_FUNCIONAL_-_AUTO_CORREÇÃO_COM_UMA_MÃO_ATRÁS_DA_CABEÇA_E_A_OUTRA_MÃO_NO_ÁPICE_DA_CURVA...mp4` (enviado pelo usuário, 42 s, com texto)

| Item | Definição |
| --- | --- |
| Posição inicial | Sentada; mão do lado côncavo da curva atrás da cabeça; mão do lado convexo da curva apoiada no ápice da curva |
| Exercício | Mantém crescimento axial e autocorreção das curvas: mão da concavidade traciona a cabeça superiormente, mão da convexidade empurra a curva |
| Retorno | Volta para a posição inicial |
| Visual | Vista DE COSTAS, igual ao vídeo 7 |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

Filmado de costas, igual ao vídeo 7 (fisioterapeuta ao lado posicionando as mãos da paciente). Sentada,
uma das mãos (lado côncavo da curva) vai atrás da cabeça/nuca, cotovelo aberto — igual ao vídeo 7, mas só
um lado. A outra mão (lado convexo da curva) fica apoiada contra as costas, na altura do ápice da curva
(região das costelas/lombar, no lado oposto à mão que está na nuca). A partir dessa posição, cresce a
coluna: a mão na nuca traciona a cabeça para cima, e a mão nas costas empurra a curva, ajudando a
correção. Sem informação de lateralidade específica do paciente no vídeo-modelo — uso o mesmo lado do
vídeo-modelo (mão direita na nuca, mão esquerda nas costas, do ponto de vista de quem olha de costas para
a paciente).

## Imagens necessárias

Reaproveita a vista de costas do vídeo 7. 2 imagens novas em
`edita/projeto/public/esqueleto/estabilizacao8/`, editando a `maos-cabeca.jpg` do vídeo 7:

**1 — uma mão atrás da cabeça, outra no ápice da curva (edite `maos-cabeca.jpg` do vídeo 7)**

```
From this image, change the arms: keep the right arm exactly as it is, hand resting behind the head at the
back of the skull, elbow pointing out to the side. Change the left arm: instead of also going up behind the
head, bring it down so the left hand rests flat against the back, at mid-back height (around the lower ribs /
upper lumbar area), elbow bent and pointing out to the left side. The skeleton keeps sitting on the stool,
same back view, same camera, same background.
```

**2 — crescimento axial, tracionando e empurrando a curva (edite a imagem 1)**

```
From this image, keep both hands in exactly the same positions and grips (right hand behind the head, left
hand flat on the mid-back), and show a very slight change: the spine and neck elongated a touch upward, as
if the right hand is gently pulling the head upward while the left hand presses slightly into the back.
Shoulders relax slightly down while the head rises a touch higher than before. Keep the stool, the back view,
background and camera exactly the same.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura** (igual aos anteriores)

```
Exercício de estabilização funcional, com autocorreção da postura. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Apoie uma das mãos atrás da cabeça, na nuca, com o cotovelo aberto para o lado. <break time="2s" />
Com a outra mão, apoie a palma nas costas, no ápice da curva. <break time="2s" />
Agora, cresça a coluna para cima: traciona a cabeça com a mão na nuca, e empurra a curva com a outra mão. <break time="2s" />
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
- [ ] Vídeo abre com a posição sentada de lado (`posicao-inicial-lado.jpg`, reaproveitada do vídeo 7) antes do corte para a vista de costas, mesmo padrão adotado no vídeo 7.
