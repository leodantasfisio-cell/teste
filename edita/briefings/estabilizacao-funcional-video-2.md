# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 2

17/11/2026 · modelo: `2_ESTABILIZAÇÃO_FUNCIONAL_-_AUTOCORREÇÃO_COM_BOLA_NAS_MÃOS_E_JOGAR_NO_CHÃO.mp4` (enviado pelo usuário, 44 s)

| Item | Definição |
| --- | --- |
| Posição | Sentada, mãos apoiadas nas coxas, mantendo crescimento axial e autocorreção das curvas |
| Exercício | Eleva os MMSS à frente até a altura dos ombros segurando uma bola inflável com os cotovelos estendidos; realiza movimentos circulares com a bola; retorna à posição inicial |
| Visual | Vista de PERFIL (igual ao vídeo 1), esqueleto 3D (Gemini), sem espelhamento |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo (antes de gerar qualquer coisa, lição do vídeo 1)

- f001: bola apoiada no chão ao lado do pé, mãos ainda na região do pescoço/ombro (ajuste do terapeuta)
- f008–f043: braços estendidos à frente, segurando a bola com as duas mãos, cotovelos esticados, altura do ombro
- Pequeno movimento circular da bola (sobe/desce/vai e volta) enquanto os braços ficam praticamente na mesma altura — não é um círculo grande, é uma oscilação suave
- O título menciona "jogar no chão": a bola começa e deve voltar ao chão no final (não aparece no vídeo o momento exato de soltar, mas a lógica é: pega no chão → eleva → movimento circular → devolve ao chão)

## Imagens necessárias

Reaproveita `posicao-inicial.jpg` do vídeo 1 (mesma pose, mãos na coxa, sem bola) para a abertura e o
fechamento. Preciso de 3 imagens novas, em `edita/projeto/public/esqueleto/estabilizacao2/`:

**1 — braços à frente com a bola (edite a `bracos-frente.jpg` do vídeo 1, para manter o mesmo braço)**

```
From this image, keep the arm position exactly the same (straight forward at shoulder height), and add
a purple inflatable ball held between both hands, elbows fully extended, arms reaching forward at
shoulder height. Keep the skeleton, the side profile view, background and camera exactly the same.
```

**2 — bola para cima (edite a imagem 1)**

```
From this image, keep the skeleton and the ball exactly the same, and move only the arms and the ball
slightly upward and forward, as if making a small circular motion, elbows still extended. Keep the
side profile view, background and camera exactly the same.
```

**3 — bola para baixo (edite a imagem 1)**

```
From this image, keep the skeleton and the ball exactly the same, and move only the arms and the ball
slightly downward and forward, as if making a small circular motion, elbows still extended. Keep the
side profile view, background and camera exactly the same.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura** (igual ao vídeo 1, só troca o nome do exercício)

```
Exercício de estabilização funcional, com autocorreção da postura e uma bola. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão, com a bola ao lado do pé. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Coloque a mão sobre a coxa e apoie o peso nela. <break time="2s" />
Cresça a coluna para cima e mantenha a autocorreção das suas curvas. <break time="2s" />
Agora, pegue a bola com as duas mãos e eleve o braço à frente, até a altura do ombro, com o cotovelo esticado. <break time="2s" />
Faça pequenos movimentos circulares com a bola, bem devagar. <break time="2s" />
Continue repetindo esse movimento, mantendo a coluna crescida. <break time="2s" />
Para terminar, devolva a bola para o chão e volte para a posição inicial.
```

**Áudio 3 — Encerramento** (igual ao vídeo 1)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Gerar as 3 imagens novas (bola) e conferir se ficaram parecidas o suficiente com o vídeo 1 (mesmo personagem/fundo)
- [ ] Decidir se a bola "cai"/aparece no chão nos frames de abertura e encerramento (imagem com a bola no chão) ou só é mencionada na narração
