#!/usr/bin/env bash
# Ajusta o volume do vídeo renderizado para o padrão do YouTube (-14 LUFS), sem mexer na imagem.
# Uso: scripts/finalizar.sh entrada.mp4 saida.mp4
set -euo pipefail
ffmpeg -v error -y -i "$1" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "$2"
