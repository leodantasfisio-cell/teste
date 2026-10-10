# Briefing de Vídeo — Correção Postural Lado Esquerdo

Oct 10, 2026 · @Léo

## Visão geral

Vídeo de YouTube que guia o espectador em um exercício de correção postural para o lado esquerdo, com narração gerada no ElevenLabs e um esqueleto 3D sentado, visto de costas.

| Item | Definição |
| --- | --- |
| Exercício | Correção postural para o lado esquerdo, sentado |
| Personagem | Esqueleto humano anatômico 3D, visto de costas |
| Formato | 16:9, 1080p |
| Duração estimada | 2 min 30 s (cerca de 1 min de instruções + 1 min de sustentação + abertura e encerramento) |
| Tom de voz | Firme, claro, pausado e direto, sem variações melódicas |
| Ferramenta de voz | ElevenLabs |

A câmera de costas foi escolhida porque o lado esquerdo do esqueleto aparece no lado esquerdo da tela, igual ao do espectador. Assim ninguém precisa inverter o movimento mentalmente.

## Voz no ElevenLabs

Gere a narração em 3 áudios separados, com o modelo Multilingual v2, que aceita as marcações de pausa.

| Configuração | Valor | Motivo |
| --- | --- | --- |
| Modelo | Eleven Multilingual v2 | Aceita a marcação `<break>` |
| Voz | Português brasileiro, timbre grave e firme | Combina com o tom de instrução |
| Stability | 75 a 80% | Voz constante, sem variações melódicas |
| Similarity | 75% | Mantém a identidade da voz |
| Style | 0% | Evita interpretação exagerada |
| Speed | 0.9 | Ritmo pausado, fácil de acompanhar |

**Limites a respeitar**

- Cada pausa `<break>` aceita no máximo 3 segundos. O minuto de sustentação é feito na edição, com silêncio entre o áudio 2 e o áudio 3.
- Muitas pausas em um único texto longo podem fazer a voz acelerar ou distorcer. Por isso o roteiro está dividido em 3 blocos.
- Nunca cole instruções como "\[Pausa de 2 segundos\]" no texto: a voz lê em voz alta.

## Textos de narração

Copie cada bloco exatamente como está e cole no ElevenLabs, um áudio por vez.

**Áudio 1 — Abertura**

```
Exercício de correção postural para o lado esquerdo. Faça os movimentos com calma, no seu ritmo. Se sentir dor, interrompa o exercício. <break time="2s" />
Sente-se em um banco, com os pés apoiados no chão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Mantenha as duas mãos apoiadas contra as coxas. Use esse apoio como base para a postura. <break time="2s" />
Agora, cresça a coluna. Estique bem o corpo para cima, como se fosse tocar o teto com o topo da cabeça. <break time="2s" />
Atenção à parte alta das costas. Posicione os cotovelos um pouco para a frente. Isso ajuda a manter a curvatura natural da região torácica. <break time="2s" />
Agora, atenção à base da coluna. Mantenha a curvatura natural da sua lombar, evitando deixar as costas retas. <break time="2s" />
Vamos para a respiração e o tórax. Encha de ar e expanda o tórax do lado esquerdo. Ao mesmo tempo, faça um movimento de fuga, afastando o tronco em direção ao lado esquerdo. <break time="2s" />
Em seguida, rotacione o tronco também para o lado esquerdo. <break time="2s" />
Para finalizar, continue crescendo a cabeça em direção ao teto, mantendo os ombros estabilizados. <break time="2s" />
Mantenha essa posição por um minuto e continue respirando.
```

**Áudio 3 — Encerramento** (entra depois dos 60 segundos de silêncio)

```
Pode relaxar. <break time="1s" />
Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

**Áudios avulsos opcionais** (posicionados dentro do minuto de sustentação)

```
Faltam trinta segundos.
```

```
Faltam dez segundos.
```

## Visual

Use a mesma descrição do esqueleto em todas as cenas, palavra por palavra, para que a aparência não mude entre os trechos.

**Descrição fixa do esqueleto**

```
Esqueleto humano anatômico realista em 3D, cor branco-marfim, sentado em um banco de madeira sem encosto, visto de costas. Pés apoiados no chão, joelhos a 90 graus, mãos apoiadas sobre as coxas. Fundo cinza-escuro liso, iluminação suave de estúdio, câmera fixa na altura do tronco.
```

De costas não dá para ver as curvaturas da coluna. Nas cenas 4 e 5, use um quadro pequeno no canto da tela com o esqueleto em vista lateral.

**Roteiro de cenas**

| Cena | Narração | Visual | Gráfico / texto na tela |
| --- | --- | --- | --- |
| 1 | Abertura | Esqueleto parado na posição inicial | Título do exercício + "Pare se sentir dor" |
| 2 | Mãos nas coxas | Destaque nas mãos e nos fêmures | "Apoio das mãos" |
| 3 | Crescimento axial | Coluna se alonga levemente para cima | Seta vertical sobre a cabeça; coluna destacada |
| 4 | Cotovelos à frente | Cotovelos avançam um pouco | Quadro lateral com a curva torácica destacada |
| 5 | Lordose lombar | Lombar mantida | Quadro lateral com a curva lombar em verde; "Não deixe as costas retas" |
| 6 | Expansão e fuga | Costelas do lado esquerdo se abrem; tronco desloca para a esquerda | Costelas esquerdas em azul; seta horizontal para a esquerda |
| 7 | Rotação | Tronco gira para a esquerda | Seta curva indicando a rotação |
| 8 | Crescer e estabilizar ombros | Postura final completa | Seta para cima + destaque nas escápulas |
| 9 | Sustentação (60 s) | Esqueleto parado na postura, leve movimento de respiração nas costelas | Cronômetro regressivo de 1:00 |
| 10 | Encerramento | Esqueleto volta à posição inicial | "Inscreva-se" |

## Edição e acabamento

Na montagem, junte os 3 áudios na ordem, insira 60 segundos de silêncio entre o áudio 2 e o áudio 3 e sincronize cada cena com a frase correspondente.

- Música de fundo calma, sem melodia marcante, em volume baixo para não competir com a voz
- Legendas embutidas acompanhando a narração
- Áudios "Faltam trinta segundos" e "Faltam dez segundos" aos 30 s e aos 50 s da sustentação
- Exportação em 16:9, 1080p

## Checklist para os próximos exercícios

Para reaproveitar este briefing como modelo, troque apenas o que muda de um exercício para outro.

- [ ] Nome do exercício e lado trabalhado na abertura
- [ ] Posição inicial (sentado, em pé, deitado) na abertura e na descrição do esqueleto
- [ ] Instruções do áudio 2, uma frase de comando por linha, com `<break time="2s" />` no final
- [ ] Conferir que nenhuma pausa passa de 3 segundos
- [ ] Tempo de sustentação e cronômetro na tela
- [ ] Tabela de cenas: uma linha por instrução, com o gráfico que mostra o movimento
- [ ] Quadro lateral sempre que a instrução falar de curvatura da coluna

---

## Decisões (10/10/2026)

- Público: adolescentes com escoliose. Narração reescrita com palavras simples, mantendo a técnica.
- Visual: esqueleto vetorial animado no Remotion (opção B), mesmo desenho em todas as cenas.
- Formato: 16:9 1080p (principal) + versão vertical 1080 × 1920 depois.
- Rótulos ESQUERDO / DIREITO sob o esqueleto, aprovados.
- Sustentação: cronômetro, respiração nas costelas, avisos aos 30 s e 10 s e mudança visual a cada 10 s.
- Voz: ElevenLabs, Multilingual v2, voz "Henrique – Clear and Knowledgeable" (aprovada).
- Visual (atualizado): imagens 3D do Gemini; abertura com a coluna curva dissolvendo para a reta; ossos acendem por passo.
- Vista lateral em "evite × faça" nos passos 2, 3, 4 e 7.
- Logo LAB ORTORIO no vídeo, sem nenhuma alteração.
- Volume final: −14 LUFS (scripts/finalizar.sh).

## Narração v2 (linguagem para adolescentes)

**Áudio 1 — Abertura**

```
Exercício de correção postural para o lado esquerdo. Faça tudo com calma, no seu tempo. Se sentir dor, pare o exercício. <break time="2s" />
Sente-se em um banco, com os pés bem apoiados no chão. <break time="2s" />
```

**Áudio 2 — Exercício**

```
Coloque as duas mãos sobre as coxas e apoie o peso nelas. Esse apoio é a base da sua postura. <break time="2s" />
Agora, cresça. Estique o corpo para cima, como se o topo da sua cabeça quisesse tocar o teto. <break time="2s" />
Agora, a parte de cima das costas. Leve os cotovelos um pouco para a frente. Isso ajuda a manter a curva natural dessa região. <break time="2s" />
Agora, a parte de baixo das costas. Mantenha a curvinha natural da lombar. Não deixe as costas retas. <break time="2s" />
Hora de respirar. Puxe o ar e encha o lado esquerdo do peito, como se fosse um balão. Ao mesmo tempo, leve o tronco um pouco para o lado esquerdo. <break time="2s" />
Agora, gire o tronco também para o lado esquerdo. <break time="2s" />
Para terminar, continue crescendo a cabeça em direção ao teto, sem deixar os ombros subirem. <break time="2s" />
Fique nessa posição por um minuto e continue respirando.
```

**Áudio 3 — Encerramento**

```
Pode relaxar. <break time="1s" />
Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.
```

**Avulsos:** "Faltam trinta segundos." · "Faltam dez segundos."
