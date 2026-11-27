# Briefing de Vídeo — Autocorreção Estabilização Funcional Lombar, Vídeo 1

27/11/2026 · modelo: `AU0D19_1.MP4` (enviado pelo usuário, 34 s, sem título no arquivo — nome do
exercício confirmado pelo usuário)

| Item | Definição |
| --- | --- |
| Pasta | Autocorreção Estabilização Funcional Lombar (nova — primeiro vídeo) |
| Título | Ponte com perna alternada |
| Posição inicial | Deitada de costas (supina) em uma maca/mesa, joelhos dobrados a 90°, pés apoiados na maca, braços ao lado do corpo |
| Exercício | Eleva o quadril (ponte); mantendo a ponte, estende uma perna para cima (fisioterapeuta segura o pé/tornozelo); alterna entre as pernas |
| Retorno | Dobra a perna de volta, desce o quadril, volta para a posição inicial |
| Visual | **Novo**: esqueleto deitado de perfil sobre uma maca/mesa (em vez de sentado no banquinho), mesmo estilo visual (ossos cor marfim, fundo cinza-escuro de estúdio) |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |

## Análise do vídeo-modelo

Filmado de frente/baixo, com o fisioterapeuta em pé sobre a maca segurando a perna da paciente — ângulo
difícil de aproveitar diretamente. Decisão: manter o padrão visual da série (esqueleto 3D gerado no
Gemini), mas em vista de perfil, deitada sobre uma maca, já que é a forma mais clara de mostrar a ponte e
a perna se estendendo.

Sequência observada: deitada, joelhos dobrados, pés apoiados → eleva o quadril (ponte) → mantendo a
ponte, estende uma perna reta para cima → dobra a perna de volta, apoiando o pé → troca de perna
(alternada) → ao final, as duas pernas aparecem estendidas juntas por um instante → desce o quadril e
volta à posição inicial.

## Imagens necessárias (todas novas — pasta nova, estilo novo)

Pasta: `edita/projeto/public/esqueleto/estabilizacao-lombar1/`. Preciso de 3 imagens, geradas do zero no
Gemini, todas com o mesmo esqueleto/maca/fundo/câmera:

**1 — posição inicial, deitada, joelhos dobrados**

```
A 3D anatomical skeleton model with ivory-white bones, lying on its back (supine) on a backless wooden
massage table/bench, photographed in side profile. Both knees are bent at 90 degrees, both feet flat on the
table surface, arms resting flat at the sides of the body, palms down. The head rests on the table. Dark-gray
studio background, soft even studio lighting, photorealistic render, camera at table height, framing the
whole body and table from the side.
```

**2 — ponte (quadril elevado), joelhos dobrados**

```
From this image, keep the skeleton, table, side profile view, background and camera exactly the same, and
change only the pelvis and lower spine: lift the hips/pelvis straight up off the table into a bridge
position, so the body forms a straight diagonal line from the shoulders (still on the table) through the
hips to the knees. Knees stay bent at 90 degrees, both feet flat on the table. Arms stay flat on the table at
the sides.
```

**3 — ponte com uma perna estendida para cima**

```
From this image, keep the bridge position, the table, side profile view, background and camera exactly the
same, and change only one leg: extend it straight up from the hip, foot pointed toward the ceiling, while the
other knee stays bent with its foot flat on the table, still supporting the bridge. Keep everything else
exactly the same.
```

## Narração (ElevenLabs, Henrique) — rascunho

**Áudio 1 — Abertura**

```
Exercício de estabilização funcional lombar, com autocorreção da postura. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Deite de costas em uma maca ou no chão, com os joelhos dobrados e os pés apoiados. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Eleve o quadril, formando uma ponte. <break time="2s" />
Mantendo a ponte, estenda uma perna reta para cima. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Dobre a perna de volta, apoiando o pé na maca. <break time="2s" />
Agora, repita do outro lado: estenda a outra perna para cima. <break time="2s" />
Fique nessa posição por alguns segundos e continue respirando. <break time="2s" />
Dobre a perna de volta e desça o quadril, com calma, voltando para a posição inicial.
```

**Áudio 3 — Encerramento** (igual aos anteriores)

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Em aberto

- [ ] Aguardando as 3 imagens novas do Gemini (pasta e estilo visual totalmente novos — primeira vez com
  a maca em vez do banquinho).
- [ ] Confirmar com o usuário se a alternância de perna (vídeo real mostra o fisioterapeuta segurando o pé)
  deve aparecer só como ciclo perna-dobrada/perna-estendida repetido (igual ao padrão do vídeo 1 da outra
  série) ou se precisa de algo mais específico.
