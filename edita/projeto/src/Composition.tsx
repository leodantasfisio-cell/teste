import { CalculateMetadataFunction, Composition } from "remotion";
import { Teste } from "./Teste";
import { CorrecaoPostural } from "./correcao/CorrecaoPostural";
import { criarRoteiro } from "./correcao/roteiro";
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
