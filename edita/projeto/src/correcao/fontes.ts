import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

// Inter (variável, OFL) guardada em public/fonts para o render não depender de internet.
export const fonteTexto = "Inter";

const inter = new FontFace(
  fonteTexto,
  `url(${staticFile("fonts/Inter-latin.woff2")}) format("woff2")`,
  { weight: "100 900" },
);
const espera = delayRender("Carregando fonte Inter");
inter
  .load()
  .then(() => {
    document.fonts.add(inter);
    continueRender(espera);
  })
  .catch((err) => cancelRender(err));
