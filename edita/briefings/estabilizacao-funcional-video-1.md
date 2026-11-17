# Briefing de Vídeo — Autocorreção Estabilização Funcional, Vídeo 1

17/11/2026 · nova pasta da série (distinta de Correção Postural e Amputação) · modelo: vídeo do Google Drive enviado pelo usuário

| Item | Definição |
| --- | --- |
| Pasta | Autocorreção Estabilização Funcional |
| Posição | Sentada, mãos apoiadas nas coxas, mantendo crescimento axial e autocorreção das curvas |
| Exercício | 1) Eleva os MMSS à frente até a altura dos ombros · 2) com os MMSS parados à frente, inicia elevação alternada dos pés · 3) mantendo a elevação alternada dos pés, inicia elevação alternada dos MMSS · 4) retorna à posição inicial |
| Visual | Imagens geradas no Gemini (o usuário gera e envia) |
| Voz | ElevenLabs, Multilingual v2, Henrique, stability 70, similarity 75, style 0, speed 0.95 |
| Logos | LAB ORTORIO e ScolioFisio (abertura e encerramento), mesmo padrão dos vídeos 1-6 |

## Imagens (geradas no Gemini, aprovadas em 17/11/2026)

Correção do usuário: no vídeo-modelo os braços sobem uma vez e ficam parados o resto do exercício —
só as pernas alternam. `edita/projeto/public/esqueleto/estabilizacao1/`:

| Arquivo | Etapa |
| --- | --- |
| `posicao-inicial.jpg` | Mãos apoiadas nas coxas, pés no chão |
| `bracos-frente.jpg` | Braços elevados à frente, na altura dos ombros, pés no chão |
| `pe-esquerdo-elevado.jpg` | Braços à frente (parados) + pé esquerdo elevado |
| `pe-direito-elevado.jpg` | Braços à frente (parados) + pé direito elevado — espelho de `pe-esquerdo-elevado.jpg`, feito localmente (sem gastar geração no Gemini) |

## Narração (ElevenLabs, Henrique)

**Áudio 1 — Abertura**

```
Exercício de estabilização funcional, com autocorreção da postura. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Coloque as duas mãos sobre as coxas e apoie o peso nelas. <break time="2s" />
Cresça a coluna para cima e mantenha a autocorreção das suas curvas. <break time="2s" />
Agora, eleve os dois braços à frente, até a altura dos ombros. <break time="2s" />
Mantenha os braços parados nessa posição durante todo o exercício. <break time="2s" />
Comece a elevar os pés, um de cada vez, bem devagar. <break time="2s" />
Continue alternando os pés, sem parar, mantendo a coluna crescida. <break time="2s" />
Para terminar, pare os pés, abaixe os braços e volte para a posição inicial, com as mãos nas coxas.
```

**Áudio 3 — Encerramento**

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

## Decisões (17/11/2026)

- Vídeo único, sem versão espelhada.
- Padrão alternado cruzado (braço esquerdo + pé direito, depois braço direito + pé esquerdo), confirmado.
- Duração: 4 repetições só de pés, depois 4 repetições de braços+pés alternados (~2 s por troca de lado ≈ 32 s de movimento, fora abertura/encerramento). Ajusto depois de ver o vídeo-modelo.
