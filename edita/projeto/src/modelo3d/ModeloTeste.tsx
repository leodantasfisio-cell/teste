import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Teste de modelos 3D: carrega, normaliza para 2 unidades de altura e mostra de costas ou de lado.
export type ModeloTesteProps = {
  arquivo: string;
  vista: "costas" | "lado";
  marfim: boolean;
};

const useModelo = (arquivo: string, marfim: boolean) => {
  const [cena, setCena] = useState<THREE.Object3D | null>(null);
  const [espera] = useState(() => delayRender(`Carregando ${arquivo}`));
  useEffect(() => {
    new GLTFLoader().load(
      staticFile(arquivo),
      (gltf) => {
        const raiz = gltf.scene;
        raiz.traverse((o) => {
          // Malhas com ossos têm caixa de recorte errada: não descartar.
          o.frustumCulled = false;
        });
        if (marfim) {
          const material = new THREE.MeshStandardMaterial({
            color: "#E8DFCB",
            roughness: 0.7,
          });
          raiz.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
          });
        }
        const caixa = new THREE.Box3().setFromObject(raiz);
        const tamanho = caixa.getSize(new THREE.Vector3());
        const centro = caixa.getCenter(new THREE.Vector3());
        const escala = 2 / tamanho.y;
        raiz.position.sub(centro.multiplyScalar(escala));
        raiz.scale.setScalar(escala);
        const grupo = new THREE.Group();
        grupo.add(raiz);
        setCena(grupo);
      },
      undefined,
      (erro) => cancelRender(erro),
    );
  }, [arquivo, marfim, espera]);
  return { cena, espera };
};

// Aponta a câmera para o centro e só libera o quadro depois de desenhar com o modelo.
const Camera: React.FC<{ pronto: boolean; espera: number }> = ({
  pronto,
  espera,
}) => {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (pronto) {
      gl.render(scene, camera);
      continueRender(espera);
    }
  }, [camera, gl, scene, pronto, espera]);
  return null;
};

export const ModeloTeste: React.FC<ModeloTesteProps> = ({
  arquivo,
  vista,
  marfim,
}) => {
  const { width, height } = useVideoConfig();
  const { cena, espera } = useModelo(arquivo, marfim);
  const posicao: [number, number, number] =
    vista === "costas" ? [0, 0.1, -4.2] : [4.2, 0.1, 0];
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ backgroundColor: "#343434" }}
      camera={{ position: posicao, fov: 30 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 4, -5]} intensity={1.6} />
      <directionalLight position={[4, 2, 3]} intensity={0.6} />
      <Camera pronto={cena !== null} espera={espera} />
      {cena ? <primitive object={cena} /> : null}
    </ThreeCanvas>
  );
};
