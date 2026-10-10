import { CalculateMetadataFunction, Composition } from "remotion";
import { Teste } from "./Teste";
import { Previa } from "./correcao/Previa";

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
        id="CorrecaoPrevia"
        component={Previa}
        durationInFrames={300}
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
