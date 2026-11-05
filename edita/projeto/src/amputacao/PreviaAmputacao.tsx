import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Sala } from "./Sala";
import {
  aplicarPose,
  POSE_INICIAL,
  useModelo,
  type Modelo,
  type Pose,
} from "./Personagem";

// Quadro de calibração do personagem amputado: pose escolhida por props.
export const PreviaAmputacao: React.FC<{
  pose?: Partial<Pose>;
  camera?: [number, number, number];
  alvo?: [number, number, number];
}> = ({ pose = {}, camera = [0, 100, 430], alvo = [0, 85, 0] }) => {
  const { width, height } = useVideoConfig();
  const { modelo, liberar } = useModelo();
  return (
    <AbsoluteFill style={{ backgroundColor: "#d9d4cc" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 30, position: camera, near: 1, far: 5000 }}
        shadows
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#8a7f70", 0.6]} />
        <directionalLight
          position={[150, 300, 300]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-250}
          shadow-camera-right={250}
          shadow-camera-top={250}
          shadow-camera-bottom={-50}
          shadow-camera-far={1200}
        />
        <Sala />
        {modelo ? (
          <Cena
            modelo={modelo}
            pose={{ ...POSE_INICIAL, ...pose }}
            alvo={alvo}
            liberar={liberar}
          />
        ) : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Cena: React.FC<{
  modelo: Modelo;
  pose: Pose;
  alvo: [number, number, number];
  liberar: () => void;
}> = ({ modelo, pose, alvo, liberar }) => {
  const { camera, gl, scene } = useThree();
  aplicarPose(modelo, pose);
  useEffect(() => {
    camera.lookAt(...alvo);
    camera.updateMatrixWorld();
    gl.shadowMap.enabled = true;
    gl.render(scene, camera);
    liberar();
  }, [alvo, camera, gl, liberar, scene]);
  return (
    <>
      <primitive object={modelo.pessoa} />
      <primitive object={modelo.protese} />
    </>
  );
};
