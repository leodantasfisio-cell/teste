import { AbsoluteFill } from "remotion";
import { cores } from "../correcao/cores";
import {
  Esqueleto3D,
  type Destaques3D,
  type Pose3D,
  type Setas3D,
} from "./Esqueleto3D";

// Quadro de calibração: pose, destaques e setas escolhidos por props.
export const Previa3D: React.FC<{
  pose?: Partial<Pose3D>;
  destaques?: Destaques3D;
  setas?: Setas3D;
  lado?: number;
}> = ({ pose = {}, destaques = {}, setas = {}, lado = 0 }) => (
  <AbsoluteFill style={{ backgroundColor: cores.fundo }}>
    <Esqueleto3D pose={pose} destaques={destaques} setas={setas} lado={lado} />
  </AbsoluteFill>
);
