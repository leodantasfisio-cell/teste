// Transcrição local com whisper.cpp (nunca serviço pago).
// Uso: node scripts/transcrever.mjs <arquivo de áudio/vídeo> <saida.json>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const [entrada, saida] = process.argv.slice(2);
const whisperPath = path.join(process.cwd(), "whisper.cpp");
const modelo = "medium";

await installWhisperCpp({ to: whisperPath, version: "1.7.5" });
await downloadWhisperModel({ model: modelo, folder: whisperPath });

const wav = path.join(process.cwd(), ".tmp", path.basename(entrada) + ".16k.wav");
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", entrada, "-ar", "16000", "-ac", "1", wav]);

const resultado = await transcribe({
  inputPath: wav,
  whisperPath,
  whisperCppVersion: "1.7.5",
  model: modelo,
  language: "pt",
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput: resultado });
fs.writeFileSync(saida, JSON.stringify(captions, null, 2));
console.log(captions.map((c) => c.text).join(""));
