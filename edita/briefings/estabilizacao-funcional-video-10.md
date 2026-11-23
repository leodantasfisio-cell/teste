# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 10

23/11/2026 · modelo: `AUTOCORREÇÃO - ESTABILIZAÇÃO ABDOMINAL - CRESCIMENTO AXIAL MMSS ELEVADOS PARA CIMA COM BASTÃO, INCLINAÇÃO PARA TRÁS...mp4` (enviado pelo usuário, 21 s, só com o título)

| Item | Definição |
| --- | --- |
| Posição inicial | Sentada, mão apoiada na coxa, mantendo crescimento axial e autocorreção das curvas |
| Exercício | Pega o bastão, eleva o braço acima da cabeça (crescimento axial); mantendo o braço elevado com o bastão, inclina o tronco para trás (estabilização abdominal) |
| Retorno | Volta para a posição inicial |
| Visual | Vista de PERFIL, igual aos vídeos 1-6 e 9 |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

Mesma lógica do vídeo 9, mas com bastão e braço elevado acima da cabeça (em vez de braço à frente na
altura do ombro): sentada, mão na coxa → pega o bastão, braço à frente → eleva o braço com o bastão
acima da cabeça, crescimento axial → mantendo o braço elevado, inclina o tronco para trás, bem devagar
(estabilização abdominal, igual ao vídeo 9) → volta a endireitar o tronco → abaixa o braço e volta à
posição inicial. Sem levantar da cadeira (diferente do vídeo 3, que levanta).

## Imagens necessárias

Reaproveita `posicao-inicial.jpg` do vídeo 1 e `bracos-frente-bastao.jpg` + `bastao-elevado.jpg` do
vídeo 3. Só falta 1 imagem nova em `edita/projeto/public/esqueleto/estabilizacao10/`:

**1 — tronco inclinado para trás com o bastão elevado (edite `bastao-elevado.jpg` do vídeo 3)**

```
From this image, keep the arm and the stick exactly as they are (raised straight overhead, hand gripping
the stick), and change only the trunk: tilt the whole torso backward/upward slightly, leaning back a touch
from the hips while keeping the spine straight (not curved) — like a controlled abdominal lean-back, not a
big recline. The head tilts back very slightly with the torso. Keep the stool, the side profile view,
background and camera exactly the same.
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
Eleve o bastão para cima, o máximo que conseguir, crescendo a coluna. <break time="2s" />
Agora, mantendo o braço elevado, incline o tronco para trás, bem devagar, contraindo o abdômen. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
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
