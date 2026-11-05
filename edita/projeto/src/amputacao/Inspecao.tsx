import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Quadro de inspeção: personagem do Mixamo e prótese do Sketchfab, com medidas na tela.
export const InspecaoAmputacao: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [espera] = useState(() => delayRender("Carregando modelos"));
  const [cena, setCena] = useState<{
    pessoa: THREE.Group;
    protese: THREE.Group;
    info: string[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      new FBXLoader().loadAsync(
        staticFile("modelos3d/amputacao/personagem.fbx"),
      ),
      new GLTFLoader().loadAsync(
        staticFile("modelos3d/amputacao/protese/scene.gltf"),
      ),
    ]).then(([pessoa, gltf]) => {
      const info: string[] = [];
      pessoa.updateMatrixWorld(true);
      const caixa = new THREE.Box3().setFromObject(pessoa);
      info.push(
        `pessoa min ${caixa.min.toArray().map((v) => v.toFixed(1))} max ${caixa.max.toArray().map((v) => v.toFixed(1))}`,
      );
      for (const nome of [
        "Hips",
        "RightUpLeg",
        "RightLeg",
        "RightFoot",
        "LeftLeg",
        "LeftFoot",
        "Head",
      ]) {
        const osso =
          pessoa.getObjectByName(`mixamorig12${nome}`) ??
          pessoa.getObjectByName(`mixamorig12:${nome}`);
        if (osso) {
          const p = new THREE.Vector3();
          osso.getWorldPosition(p);
          info.push(`${nome}: ${p.toArray().map((v) => v.toFixed(1))}`);
        } else info.push(`${nome}: ?`);
      }
      const protese = gltf.scene;
      protese.updateMatrixWorld(true);
      const cp = new THREE.Box3().setFromObject(protese);
      info.push(
        `protese min ${cp.min.toArray().map((v) => v.toFixed(1))} max ${cp.max.toArray().map((v) => v.toFixed(1))}`,
      );
      pessoa.traverse((o) => {
        const m = o as THREE.SkinnedMesh;
        if (m.isMesh) {
          const n = m.geometry.attributes.position.count;
          const mats = (Array.isArray(m.material) ? m.material : [m.material])
            .map((x) => x.name)
            .join("/");
          info.push(`malha ${m.name} v=${n} mat=${mats}`);
        }
      });
      pessoa.traverse((o) => {
        o.frustumCulled = false;
      });
      setCena({ pessoa, protese, info });
    });
  }, [espera]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#2b2b2b" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 30, position: [0, 95, 430], near: 1, far: 5000 }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[200, 300, 400]} intensity={2} />
        {cena ? (
          <>
            <primitive object={cena.pessoa} position={[-40, 0, 0]} />
            <group position={[70, 0, 0]} scale={0.11}>
              <primitive object={cena.protese} position={[-22, -38.5, 7]} />
            </group>
            <Pronto espera={espera} />
          </>
        ) : null}
      </ThreeCanvas>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 20,
          color: "#fff",
          fontSize: 22,
          fontFamily: "monospace",
        }}
      >
        {cena?.info.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Desenha a cena uma vez e libera o render quando os modelos já estão no canvas.
const Pronto: React.FC<{ espera: number }> = ({ espera }) => {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    camera.lookAt(0, 95, 0);
    camera.updateMatrixWorld();
    gl.render(scene, camera);
    continueRender(espera);
  }, [camera, espera, gl, scene]);
  return null;
};
