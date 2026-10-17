import { CalculateMetadataFunction, Composition } from "remotion";
import { Teste } from "./Teste";
import { CorrecaoPostural } from "./correcao/CorrecaoPostural";
import { Exercicio3 } from "./correcao/Exercicio3";
import { criarRoteiro } from "./correcao/roteiro";
import { DURACAO_3, DURACAO_4 } from "./correcao/roteiro3";
import { Exercicio5 } from "./correcao/Exercicio5";
import { DURACAO_5 } from "./correcao/roteiro5";
import { Exercicio6 } from "./correcao/Exercicio6";
import { DURACAO_6 } from "./correcao/roteiro6";
import { ModeloTeste } from "./modelo3d/ModeloTeste";
import { Previa3D } from "./modelo3d/Previa3D";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComponent}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="Teste"
        component={Teste}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CorrecaoPostural"
        component={CorrecaoPostural}
        durationInFrames={criarRoteiro("esquerdo").DURACAO * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lado: "esquerdo" as const }}
      />
      <Composition
        id="CorrecaoPosturalDireito"
        component={CorrecaoPostural}
        durationInFrames={criarRoteiro("direito").DURACAO * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lado: "direito" as const }}
      />
      <Composition
        id="Exercicio3"
        component={Exercicio3}
        durationInFrames={DURACAO_3 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lado: "direito" as const }}
      />
      <Composition
        id="Exercicio4"
        component={Exercicio3}
        durationInFrames={DURACAO_4 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lado: "esquerdo" as const }}
      />
      <Composition
        id="Exercicio5"
        component={Exercicio5}
        durationInFrames={DURACAO_5 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Exercicio6"
        component={Exercicio6}
        durationInFrames={DURACAO_6 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ModeloTeste"
        component={ModeloTeste}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          arquivo: "modelos3d/lowpoly/skeleton.glb",
          vista: "costas" as const,
          marfim: false,
        }}
      />
      <Composition
        id="Previa3D"
        component={Previa3D}
        durationInFrames={14 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

export const MyComponent: React.FC<Props> = () => {
  return null;
};
