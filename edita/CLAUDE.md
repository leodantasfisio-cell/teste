# EDITA — edição de vídeos verticais com Remotion

## Estrutura de pastas

```
edita/
├── CLAUDE.md          este arquivo
├── .claude/launch.json  configuração "studio" (npm run dev em projeto/, porta 3000)
├── originais/         brutos do usuário — NUNCA alterados
├── referencias/       vídeos que o usuário quer estudar
├── estilos/           fichas de estilo (.md)
├── briefings/         um .md por projeto
├── exports/           vídeos finais
└── projeto/           projeto Remotion (1080 × 1920, 30 fps)
    ├── .claude/skills/remotion-*   skills oficiais (remotion-dev/skills)
    ├── src/           composições (Root.tsx, Composition.tsx, Teste.tsx)
    ├── public/sfx/    whoosh, pop, impacto, ding, notificacao, clique (CC0, ver LICENSE.txt)
    ├── public/fonts/  fontes locais (Anton, OFL)
    └── .tmp/          TEMP/TMP/TMPDIR do render (definidos em remotion.config.ts)
```

## Regras

- **Os arquivos em `originais/` nunca são alterados**: não editar, converter no lugar, renomear, mover nem apagar.
  Qualquer derivado (proxy, áudio extraído, corte) vai para `projeto/public/` ou `projeto/.tmp/`.
- **A transcrição é sempre local**, nunca por serviço pago ou API externa.
  Usar `@remotion/install-whisper-cpp` (whisper.cpp na máquina) e, se existir, whisper/faster-whisper em Python.
- **Toda produção começa por um briefing** em `briefings/<projeto>.md`.
- **Validar um trecho curto antes do todo**: renderizar e aprovar alguns segundos antes de montar e exportar o vídeo inteiro.
- Os vídeos finais vão para `exports/`.
- Antes de escrever código Remotion, consultar as skills em `projeto/.claude/skills/` (comece por `remotion-best-practices`).

## Proibido na edição

- Tremida de câmera (camera shake).
- Elementos pulsando (escala ou opacidade em loop).
- Seguir o rosto quadro a quadro (tracking/reenquadramento frame a frame).
- Sons empilhados (vários SFX tocando ao mesmo tempo).
- Nada parado mais de 2 s em vídeo falado: sempre há corte, texto, zoom ou outra mudança visual em até 2 s.
