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

// Esqueleto 3D rigged (Lowpoly Human Skeleton, Void, CC BY 4.0) sentado num banco.
// Pose, destaques, setas e câmera são calculados por quadro a partir do repouso (determinístico).
// Espaço do modelo: Y para cima, esqueleto de frente para +Z.
// Visto de costas (câmera em -Z), o lado esquerdo anatômico (+X) fica à esquerda da tela.

export type Pose3D = {
  /** 0–1: coluna em "S" (abertura) */
  curva: number;
  /** 0–1: crescimento axial */
  crescer: number;
  /** 0–1: cotovelos à frente */
  cotovelos: number;
  /** 0–1: tronco desliza para a esquerda */
  deslocar: number;
  /** 0–1: rotação do tronco para a esquerda */
  girar: number;
  /** 0–1: ombros baixos */
  ombros: number;
  /** 0–1: respiração (expansão suave do tórax) */
  respirar: number;
};

export type Destaques3D = {
  coluna?: number;
  maos?: number;
  pes?: number;
  costelasEsquerda?: number;
  escapulas?: number;
  cotovelos?: number;
  lombar?: number;
};

export type Setas3D = {
  cima?: number;
  esquerda?: number;
  giro?: number;
  maos?: number;
  chao?: number;
};

const ESCALA = 1 / 20;
const AMBAR = new THREE.Color("#F2B84B");
const AZUL = new THREE.Color("#4DA3FF");
const VERDE = new THREE.Color("#4CC38A");

const PREFIXOS = {
  pelve: "Bone019_00",
  coluna1: "Bone020_01",
  coluna2: "Bone021_02",
  coluna3: "Bone022_03",
  pescoco: "Bone023_04",
  cabeca: "Bone024_05",
  claviculaEsq: "Bone025(mirrored)_06",
  bracoEsq: "Bone001(mirrored)_07",
  antebracoEsq: "Bone002(mirrored)_08",
  maoEsq: "Bone003(mirrored)_09",
  claviculaDir: "Bone025_030",
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
type Chave = keyof typeof PREFIXOS;

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

// ---------- Destaques pintados no material ----------

const uniformesDestaque = {
  uD1: { value: new THREE.Vector4() }, // coluna, mãos, pés, costelas esquerdas
  uD2: { value: new THREE.Vector4() }, // escápulas, cotovelos, lombar, —
};

const criarMaterial = () => {
  const material = new THREE.MeshStandardMaterial({
    color: "#E9E1CF",
    roughness: 0.62,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniformesDestaque);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec4 aD1;\nattribute vec4 aD2;\nvarying vec4 vD1;\nvarying vec4 vD2;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvD1 = aD1;\nvD2 = aD2;",
      );
    const cor = (c: THREE.Color) =>
      `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec4 uD1;\nuniform vec4 uD2;\nvarying vec4 vD1;\nvarying vec4 vD2;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
vec4 dA = clamp(vD1 * uD1, 0.0, 1.0);
vec4 dB = clamp(vD2 * uD2, 0.0, 1.0);
vec3 corDestaque = ${cor(AMBAR)} * (dA.x + dA.y + dA.z + dB.x + dB.y) + ${cor(AZUL)} * dA.w + ${cor(VERDE)} * dB.z;
float pesoDestaque = clamp(dA.x + dA.y + dA.z + dA.w + dB.x + dB.y + dB.z, 0.0, 1.0);
if (pesoDestaque > 0.001) corDestaque /= max(dA.x + dA.y + dA.z + dA.w + dB.x + dB.y + dB.z, 1e-3);
diffuseColor.rgb = mix(diffuseColor.rgb, corDestaque, pesoDestaque);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += corDestaque * pesoDestaque * 0.45;",
      );
  };
  return material;
};

/** Calcula, por vértice, o quanto ele pertence a cada região de destaque. */
const marcarRegioes = (
  malha: THREE.SkinnedMesh,
  ossos: Record<Chave, THREE.Bone>,
) => {
  const geo = malha.geometry;
  const pos = geo.getAttribute("position");
  const indices = geo.getAttribute("skinIndex");
  const pesos = geo.getAttribute("skinWeight");
  const lista = malha.skeleton.bones;
  const centroColuna = ossos.coluna1.getWorldPosition(new THREE.Vector3());
  const cotoveloEsq = ossos.antebracoEsq.getWorldPosition(new THREE.Vector3());
  const cotoveloDir = ossos.antebracoDir.getWorldPosition(new THREE.Vector3());

  const descendentes = (raiz: THREE.Object3D) => {
    const s = new Set<THREE.Object3D>();
    raiz.traverse((o) => s.add(o));
    return s;
  };
  const maos = new Set([
    ...descendentes(ossos.antebracoEsq),
    ...descendentes(ossos.antebracoDir),
    ossos.coxaEsq,
    ossos.coxaDir,
  ]);
  const pes = new Set([ossos.peEsq, ossos.peDir]);
  const tronco = new Set<THREE.Object3D>([
    ossos.coluna1,
    ossos.coluna2,
    ossos.coluna3,
    ossos.pescoco,
  ]);
  const torax = new Set<THREE.Object3D>([ossos.coluna2, ossos.coluna3]);
  const claviculas = new Set<THREE.Object3D>([
    ossos.claviculaEsq,
    ossos.claviculaDir,
  ]);

  const a1 = new Float32Array(pos.count * 4);
  const a2 = new Float32Array(pos.count * 4);
  const v = new THREE.Vector3();
  malha.updateMatrixWorld(true);
  malha.skeleton.update();
  for (let i = 0; i < pos.count; i++) {
    // Posição real do vértice no repouso, já deformado pelos ossos, em coordenadas do mundo.
    v.fromBufferAttribute(pos, i);
    malha.applyBoneTransform(i, v);
    v.applyMatrix4(malha.matrixWorld);
    const somar = (conjunto: Set<THREE.Object3D>) => {
      let s = 0;
      for (let k = 0; k < 4; k++) {
        const osso = lista[indices.getComponent(i, k)];
        if (osso && conjunto.has(osso)) s += pesos.getComponent(i, k);
      }
      return s;
    };
    const dx = v.x - centroColuna.x;
    const naColuna = Math.abs(dx) < 1.1 && v.z < centroColuna.z + 0.9 ? 1 : 0;
    const coluna = somar(tronco) * naColuna;
    const lombar = somar(new Set([ossos.coluna1])) * naColuna;
    const costelasEsq = somar(torax) * (dx > 1.15 ? 1 : 0) * (1 - naColuna);
    const perto = (p: THREE.Vector3) => Math.max(0, 1 - v.distanceTo(p) / 1.4);
    a1.set([coluna, somar(maos), somar(pes), costelasEsq], i * 4);
    a2.set(
      [
        somar(claviculas),
        Math.max(perto(cotoveloEsq), perto(cotoveloDir)),
        lombar,
        0,
      ],
      i * 4,
    );
  }
  geo.setAttribute("aD1", new THREE.BufferAttribute(a1, 4));
  geo.setAttribute("aD2", new THREE.BufferAttribute(a2, 4));
};

// ---------- Carregamento ----------

type Modelo = {
  raiz: THREE.Group;
  ossos: Record<Chave, THREE.Bone>;
  repouso: Map<THREE.Bone, { q: THREE.Quaternion; p: THREE.Vector3 }>;
};

const useModelo = () => {
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [espera] = useState(() => delayRender("Carregando esqueleto 3D"));
  useEffect(() => {
    new GLTFLoader().load(
      staticFile("modelos3d/lowpoly/skeleton.glb"),
      (gltf) => {
        const material = criarMaterial();
        const ossos = {} as Record<Chave, THREE.Bone>;
        const repouso = new Map<
          THREE.Bone,
          { q: THREE.Quaternion; p: THREE.Vector3 }
        >();
        const malhas: THREE.SkinnedMesh[] = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          o.frustumCulled = false;
          if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
            const malha = o as THREE.SkinnedMesh;
            malha.material = material;
            malha.castShadow = true;
            malhas.push(malha);
          }
          if ((o as THREE.Bone).isBone) {
            const osso = o as THREE.Bone;
            repouso.set(osso, {
              q: osso.quaternion.clone(),
              p: osso.position.clone(),
            });
            for (const [chave, prefixo] of Object.entries(PREFIXOS)) {
              if (osso.name.startsWith(prefixo)) ossos[chave as Chave] = osso;
            }
          }
        });
        const faltando = (Object.keys(PREFIXOS) as Chave[]).filter(
          (k) => !ossos[k],
        );
        if (faltando.length) {
          cancelRender(
            new Error(`Ossos não encontrados: ${faltando.join(", ")}`),
          );
          return;
        }
        for (const malha of malhas) marcarRegioes(malha, ossos);
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

// ---------- Pose ----------

const POSE_NEUTRA: Pose3D = {
  curva: 0,
  crescer: 0,
  cotovelos: 0,
  deslocar: 0,
  girar: 0,
  ombros: 0,
  respirar: 0,
};

const aplicarPose = (m: Modelo, pose: Pose3D) => {
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
  // Mãos nas coxas; "cotovelos à frente" leva o braço um pouco mais adiante.
  for (const lado of ["Esq", "Dir"] as const) {
    girarNoMundo(o[`braco${lado}`], X, grau(-8 - 16 * pose.cotovelos));
    girarNoMundo(o[`antebraco${lado}`], X, grau(-40 + 10 * pose.cotovelos));
  }
  // A cabeça vem levemente virada no arquivo original: alinha com o tronco.
  girarNoMundo(o.cabeca, Y, grau(CORRECAO_CABECA));

  // Abertura: coluna em "S" (curvas laterais alternadas), que se desfaz na posição inicial.
  girarNoMundo(o.coluna1, Z, grau(16) * pose.curva);
  girarNoMundo(o.coluna2, Z, grau(-28) * pose.curva);
  girarNoMundo(o.coluna3, Z, grau(15) * pose.curva);
  girarNoMundo(o.pescoco, Z, grau(-4) * pose.curva);

  // Cresça: alonga os segmentos da coluna (sem esticar a cabeça).
  const alonga = 1 + 0.1 * pose.crescer;
  for (const k of ["coluna2", "coluna3", "pescoco"] as const)
    o[k].position.multiplyScalar(alonga);

  // Tronco para a esquerda (+X): lombar inclina e o tórax corrige → deslize lateral.
  girarNoMundo(o.coluna1, Z, grau(-14) * pose.deslocar);
  girarNoMundo(o.coluna3, Z, grau(12) * pose.deslocar);
  girarNoMundo(o.pescoco, Z, grau(2) * pose.deslocar);

  // Girar para a esquerda, dividido entre lombar alta e tórax; a cabeça acompanha o tronco.
  girarNoMundo(o.coluna2, Y, grau(8) * pose.girar);
  girarNoMundo(o.coluna3, Y, grau(9) * pose.girar);
  // Os braços giram de volta para as mãos continuarem apoiadas nas coxas.
  girarNoMundo(o.bracoEsq, Y, grau(-17) * pose.girar);
  girarNoMundo(o.bracoDir, Y, grau(-17) * pose.girar);

  // Ombros baixos: clavículas descem.
  girarNoMundo(o.claviculaEsq, Z, grau(-7) * pose.ombros);
  girarNoMundo(o.claviculaDir, Z, grau(7) * pose.ombros);

  // Respiração: o tórax se expande levemente.
  const r = 1 + 0.025 * pose.respirar;
  o.coluna3.scale.set(1, r, r);

  m.raiz.updateMatrixWorld(true);
};

// ---------- Setas em 3D (cor chapada, no estilo das setas 2D) ----------

const MaterialSeta: React.FC<{ cor: THREE.Color; opacidade: number }> = ({
  cor,
  opacidade,
}) => (
  <meshBasicMaterial
    color={cor}
    transparent
    opacity={opacidade}
    depthTest={false}
    toneMapped={false}
  />
);

const Seta: React.FC<{
  de: THREE.Vector3;
  para: THREE.Vector3;
  cor: THREE.Color;
  opacidade: number;
  espessura?: number;
}> = ({ de, para, cor, opacidade, espessura = 0.022 }) => {
  const dir = para.clone().sub(de);
  const comprimento = dir.length();
  if (comprimento < 1e-4 || opacidade <= 0) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(
    Y,
    dir.clone().normalize(),
  );
  const ponta = 0.09;
  const corpo = Math.max(0.001, comprimento - ponta);
  const meio = de.clone().add(
    dir
      .clone()
      .normalize()
      .multiplyScalar(corpo / 2),
  );
  const base = de.clone().add(
    dir
      .clone()
      .normalize()
      .multiplyScalar(corpo + ponta / 2),
  );
  return (
    <group renderOrder={10}>
      <mesh position={meio} quaternion={q} renderOrder={10}>
        <cylinderGeometry args={[espessura, espessura, corpo, 16]} />
        <MaterialSeta cor={cor} opacidade={opacidade} />
      </mesh>
      <mesh position={base} quaternion={q} renderOrder={10}>
        <coneGeometry args={[espessura * 3, ponta, 24]} />
        <MaterialSeta cor={cor} opacidade={opacidade} />
      </mesh>
    </group>
  );
};

/** Arco horizontal em volta dos ombros com ponta: rotação para a esquerda. */
const SetaGiro: React.FC<{
  centro: THREE.Vector3;
  opacidade: number;
  progresso: number;
}> = ({ centro, opacidade, progresso }) => {
  if (opacidade <= 0 || progresso <= 0.02) return null;
  const raio = 0.42;
  // Visto de costas, o arco de trás (perto da câmera, z < 0) anda da direita (-X) para a esquerda (+X).
  const inicio = Math.PI * 1.28;
  const fim = inicio + Math.PI * 0.44 * progresso;
  const pontos: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = inicio + ((fim - inicio) * i) / 40;
    pontos.push(
      new THREE.Vector3(
        centro.x + raio * Math.cos(a),
        centro.y,
        centro.z + raio * Math.sin(a),
      ),
    );
  }
  const curva = new THREE.CatmullRomCurve3(pontos);
  const ultimo = pontos[pontos.length - 1];
  const tangente = curva.getTangent(1);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, tangente);
  return (
    <group renderOrder={10}>
      <mesh renderOrder={10}>
        <tubeGeometry args={[curva, 64, 0.02, 12, false]} />
        <MaterialSeta cor={AMBAR} opacidade={opacidade} />
      </mesh>
      <mesh position={ultimo} quaternion={q} renderOrder={10}>
        <coneGeometry args={[0.06, 0.1, 24]} />
        <MaterialSeta cor={AMBAR} opacidade={opacidade} />
      </mesh>
    </group>
  );
};

// ---------- Cena ----------

const Cena: React.FC<{
  modelo: Modelo;
  pose: Pose3D;
  destaques: Destaques3D;
  setas: Setas3D;
  /** 0 = de costas, 1 = de lado (lado esquerdo do esqueleto) */
  lado: number;
  espera: number;
}> = ({ modelo, pose, destaques, setas, lado, espera }) => {
  const { camera, gl, scene } = useThree();

  const ajuste = useMemo(() => {
    aplicarPose(modelo, POSE_NEUTRA);
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

  uniformesDestaque.uD1.value.set(
    destaques.coluna ?? 0,
    destaques.maos ?? 0,
    destaques.pes ?? 0,
    destaques.costelasEsquerda ?? 0,
  );
  uniformesDestaque.uD2.value.set(
    destaques.escapulas ?? 0,
    destaques.cotovelos ?? 0,
    destaques.lombar ?? 0,
    0,
  );

  // Câmera: orbita das costas (-Z) para o lado esquerdo (+X) do esqueleto.
  const angulo = (Math.PI / 2) * lado;
  const distancia = 3.9;
  camera.position.set(
    distancia * Math.sin(angulo),
    0.85,
    -distancia * Math.cos(angulo) + 0.25 * lado,
  );
  camera.lookAt(0, 0.7, 0.25 * lado);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.render(scene, camera);
    continueRender(espera);
  }, [camera, gl, scene, espera]);

  const o = modelo.ossos;
  const mundo = (osso: THREE.Bone) =>
    osso.getWorldPosition(new THREE.Vector3());
  const cabeca = mundo(o.cabeca);
  const torax = mundo(o.coluna3);
  const h = ajuste.alturaAssento;

  return (
    <>
      <primitive object={modelo.raiz} />
      {/* Banco */}
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      {/* Seta para cima sobre a cabeça */}
      <Seta
        de={new THREE.Vector3(cabeca.x, cabeca.y + 0.16, cabeca.z)}
        para={
          new THREE.Vector3(
            cabeca.x,
            cabeca.y + 0.16 + 0.2 * (setas.cima ?? 0),
            cabeca.z,
          )
        }
        cor={AMBAR}
        opacidade={Math.min(1, (setas.cima ?? 0) * 3)}
      />
      {/* Seta para a esquerda ao lado do tórax */}
      <Seta
        de={new THREE.Vector3(torax.x - 0.05, torax.y + 0.1, torax.z - 0.25)}
        para={
          new THREE.Vector3(
            torax.x - 0.05 + 0.45 * (setas.esquerda ?? 0),
            torax.y + 0.1,
            torax.z - 0.25,
          )
        }
        cor={AZUL}
        opacidade={Math.min(1, (setas.esquerda ?? 0) * 3)}
        espessura={0.026}
      />
      {/* Arco de rotação em volta dos ombros */}
      <SetaGiro
        centro={new THREE.Vector3(torax.x, torax.y + 0.12, torax.z)}
        opacidade={Math.min(1, (setas.giro ?? 0) * 3)}
        progresso={setas.giro ?? 0}
      />
      {/* Setas para baixo nas mãos: apoie o peso */}
      {(["Esq", "Dir"] as const).map((lado) => {
        const mao = mundo(o[`mao${lado}`]);
        const s = setas.maos ?? 0;
        return (
          <Seta
            key={lado}
            de={new THREE.Vector3(mao.x, mao.y + 0.28, mao.z - 0.06)}
            para={
              new THREE.Vector3(mao.x, mao.y + 0.28 - 0.2 * s, mao.z - 0.06)
            }
            cor={AMBAR}
            opacidade={Math.min(1, s * 3)}
            espessura={0.016}
          />
        );
      })}
      {/* Linhas de contato com o chão sob os pés */}
      {(["Esq", "Dir"] as const).map((lado) => {
        const pe = mundo(o[`pe${lado}`]);
        const s = setas.chao ?? 0;
        if (s <= 0) return null;
        return (
          <mesh
            key={lado}
            position={[pe.x, 0.004, pe.z + 0.04]}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={10}
          >
            <planeGeometry args={[0.2 * Math.min(1, s * 1.5), 0.03]} />
            <MaterialSeta cor={AMBAR} opacidade={Math.min(1, s)} />
          </mesh>
        );
      })}
    </>
  );
};

export const Esqueleto3D: React.FC<{
  pose: Partial<Pose3D>;
  destaques?: Destaques3D;
  setas?: Setas3D;
  lado?: number;
}> = ({ pose, destaques = {}, setas = {}, lado = 0 }) => {
  const { width, height } = useVideoConfig();
  const { modelo, espera } = useModelo();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 0.85, -3.9], fov: 30 }}
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
          pose={{ ...POSE_NEUTRA, ...pose }}
          destaques={destaques}
          setas={setas}
          lado={lado}
          espera={espera}
        />
      ) : null}
    </ThreeCanvas>
  );
};
