import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useMemo, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Esqueleto 3D rigged (Lowpoly Human Skeleton, Void, CC BY 4.0) sentado num banco,
// com a pose controlada por parâmetros a cada quadro.
// Espaço do modelo: Y para cima, esqueleto de frente para +Z.
// Visto de costas (câmera em -Z), o lado esquerdo anatômico (+X) fica à esquerda da tela.

export type PoseExercicio = {
  /** 0–1: crescimento axial (coluna alonga) */
  crescer: number;
  /** 0–1: tronco desliza para a esquerda com a pelve parada */
  deslocar: number;
  /** 0–1: rotação do tronco para a esquerda */
  girar: number;
};

const ESCALA = 1 / 20; // modelo tem ~37 unidades de altura → ~1,85 m

type Ossos = Record<string, THREE.Bone>;

const PREFIXOS = {
  coluna1: "Bone020_01",
  coluna2: "Bone021_02",
  coluna3: "Bone022_03",
  pescoco: "Bone023_04",
  cabeca: "Bone024_05",
  // "(mirrored)" fica no lado +X, que é o esquerdo anatômico.
  bracoEsq: "Bone001(mirrored)_07",
  antebracoEsq: "Bone002(mirrored)_08",
  maoEsq: "Bone003(mirrored)_09",
  bracoDir: "Bone001_031",
  antebracoDir: "Bone002_032",
  maoDir: "Bone003_033",
  // Os nomes de perna vêm trocados no arquivo: "R" está em +X (esquerdo anatômico).
  coxaEsq: "bone_Leg_R_thig",
  pernaEsq: "bone_Leg_R_calf",
  peEsq: "bone_R_foot",
  coxaDir: "bone_Leg_L_thig",
  pernaDir: "bone_Leg_L_calf",
  peDir: "bone_L_foot",
};

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const grau = THREE.MathUtils.degToRad;
const CORRECAO_CABECA = -14;

/** Gira o osso em torno de um eixo do mundo, preservando a hierarquia. */
const girarNoMundo = (
  osso: THREE.Bone,
  eixo: THREE.Vector3,
  angulo: number,
) => {
  if (!osso.parent || angulo === 0) return;
  osso.parent.updateWorldMatrix(true, false);
  const pai = osso.parent.getWorldQuaternion(new THREE.Quaternion());
  const eixoLocal = eixo.clone().applyQuaternion(pai.invert()).normalize();
  osso.quaternion.premultiply(
    new THREE.Quaternion().setFromAxisAngle(eixoLocal, angulo),
  );
  osso.updateMatrixWorld(true);
};

type Modelo = {
  raiz: THREE.Group;
  ossos: Ossos;
  repouso: Map<THREE.Bone, { q: THREE.Quaternion; p: THREE.Vector3 }>;
};

const useModelo = () => {
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [espera] = useState(() => delayRender("Carregando esqueleto 3D"));
  useEffect(() => {
    new GLTFLoader().load(
      staticFile("modelos3d/lowpoly/skeleton.glb"),
      (gltf) => {
        const material = new THREE.MeshStandardMaterial({
          color: "#E9E1CF",
          roughness: 0.62,
          metalness: 0,
        });
        const ossos: Ossos = {};
        const repouso = new Map<
          THREE.Bone,
          { q: THREE.Quaternion; p: THREE.Vector3 }
        >();
        gltf.scene.traverse((o) => {
          o.frustumCulled = false;
          if ((o as THREE.Mesh).isMesh) {
            const malha = o as THREE.Mesh;
            malha.material = material;
            malha.castShadow = true;
          }
          if ((o as THREE.Bone).isBone) {
            const osso = o as THREE.Bone;
            repouso.set(osso, {
              q: osso.quaternion.clone(),
              p: osso.position.clone(),
            });
            for (const [chave, prefixo] of Object.entries(PREFIXOS)) {
              if (osso.name.startsWith(prefixo)) ossos[chave] = osso;
            }
          }
        });
        const faltando = Object.keys(PREFIXOS).filter((k) => !ossos[k]);
        if (faltando.length) {
          cancelRender(
            new Error(`Ossos não encontrados: ${faltando.join(", ")}`),
          );
          return;
        }
        const raiz = new THREE.Group();
        raiz.add(gltf.scene);
        raiz.scale.setScalar(ESCALA);
        setModelo({ raiz, ossos, repouso });
      },
      undefined,
      (erro) => cancelRender(erro),
    );
  }, []);
  return { modelo, espera };
};

/** Pose sentada + exercício. Sempre parte do repouso, então é determinística por quadro. */
const aplicarPose = (m: Modelo, pose: PoseExercicio) => {
  for (const [osso, r] of m.repouso) {
    osso.quaternion.copy(r.q);
    osso.position.copy(r.p);
  }
  const o = m.ossos;
  m.raiz.updateMatrixWorld(true);

  // Sentado: coxas para a frente, pernas para baixo.
  for (const lado of ["Esq", "Dir"] as const) {
    girarNoMundo(o[`coxa${lado}`], X, grau(-88));
    girarNoMundo(o[`perna${lado}`], X, grau(86));
  }
  // Mãos nas coxas: braço um pouco à frente, antebraço apontando para a coxa.
  for (const lado of ["Esq", "Dir"] as const) {
    girarNoMundo(o[`braco${lado}`], X, grau(-8));
    girarNoMundo(o[`antebraco${lado}`], X, grau(-40));
  }

  // A cabeça vem levemente virada no arquivo original: alinha com o tronco.
  girarNoMundo(o.cabeca, Y, grau(CORRECAO_CABECA));

  // Cresça: alonga os segmentos da coluna (sem esticar a cabeça).
  const alonga = 1 + 0.05 * pose.crescer;
  for (const k of ["coluna2", "coluna3", "pescoco"])
    o[k].position.multiplyScalar(alonga);

  // Tronco para a esquerda (+X): lombar inclina, tórax corrige → deslize lateral.
  girarNoMundo(o.coluna1, Z, grau(-7) * pose.deslocar);
  girarNoMundo(o.coluna3, Z, grau(7) * pose.deslocar);
  girarNoMundo(o.pescoco, Z, grau(0) * pose.deslocar);

  // Girar para a esquerda: em torno do eixo vertical, dividido entre tórax e lombar.
  girarNoMundo(o.coluna2, Y, grau(7) * pose.girar);
  girarNoMundo(o.coluna3, Y, grau(8) * pose.girar);

  m.raiz.updateMatrixWorld(true);
};

const Cena: React.FC<{
  modelo: Modelo;
  pose: PoseExercicio;
  espera: number;
  vistaLado: boolean;
}> = ({ modelo, pose, espera, vistaLado }) => {
  const { camera, gl, scene } = useThree();

  // Posiciona o esqueleto sentado com os pés no chão (y = 0) e centrado em x/z.
  const ajuste = useMemo(() => {
    aplicarPose(modelo, { crescer: 0, deslocar: 0, girar: 0 });
    const caixa = new THREE.Box3().setFromObject(modelo.raiz, true);
    const quadril = modelo.ossos.coxaEsq.getWorldPosition(new THREE.Vector3());
    const centro = caixa.getCenter(new THREE.Vector3());
    return {
      deslocamento: new THREE.Vector3(-centro.x, -caixa.min.y, -quadril.z),
      alturaAssento: quadril.y - caixa.min.y - 0.06,
    };
  }, [modelo]);

  modelo.raiz.position.copy(ajuste.deslocamento);
  aplicarPose(modelo, pose);

  useEffect(() => {
    camera.lookAt(0, 0.7, vistaLado ? 0.25 : 0);
    camera.updateProjectionMatrix();
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.render(scene, camera);
    continueRender(espera);
  }, [camera, gl, scene, espera, vistaLado]);

  const h = ajuste.alturaAssento;
  return (
    <>
      <primitive object={modelo.raiz} />
      {/* Banco: assento redondo e quatro pernas, cinza como nas imagens */}
      <group position={[0, 0, 0.03]}>
        <mesh position={[0, h - 0.025, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 48]} />
          <meshStandardMaterial color="#8E8E92" roughness={0.85} />
        </mesh>
        {[
          [0.13, 0.13],
          [-0.13, 0.13],
          [0.13, -0.13],
          [-0.13, -0.13],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, (h - 0.05) / 2, z]} castShadow>
            <cylinderGeometry args={[0.018, 0.022, h - 0.05, 16]} />
            <meshStandardMaterial color="#7E7E82" roughness={0.85} />
          </mesh>
        ))}
      </group>
      {/* Chão invisível que só recebe sombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </>
  );
};

export const Esqueleto3D: React.FC<{
  pose: PoseExercicio;
  vista?: "costas" | "lado";
}> = ({ pose, vista = "costas" }) => {
  const { width, height } = useVideoConfig();
  const { modelo, espera } = useModelo();
  const posicao: [number, number, number] =
    vista === "costas" ? [0, 0.85, -3.9] : [3.9, 0.85, 0.25];
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: posicao, fov: 30 }}
      shadows
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#3a3a3a", 0.5]} />
      <directionalLight
        position={[-2.5, 4, -3]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[3, 2, -1]} intensity={0.5} />
      {modelo ? (
        <Cena
          modelo={modelo}
          pose={pose}
          espera={espera}
          vistaLado={vista === "lado"}
        />
      ) : null}
    </ThreeCanvas>
  );
};
