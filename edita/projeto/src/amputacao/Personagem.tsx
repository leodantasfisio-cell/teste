import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Personagem do Mixamo (Ch01) com amputação transtibial direita e a prótese do Sketchfab
// ("leg prosthesis", victorghys, CC-BY-4.0). Unidades em centímetros, chão em y = 0.
// O lado direito do personagem fica em x negativo; de frente, aparece à esquerda da tela.

const PREFIXO = "mixamorig12";

export const OSSOS = [
  "Hips",
  "Spine",
  "Spine1",
  "Spine2",
  "Neck",
  "Head",
  "RightUpLeg",
  "RightLeg",
  "RightFoot",
  "LeftUpLeg",
  "LeftLeg",
  "LeftFoot",
  "RightArm",
  "RightForeArm",
  "RightHand",
  "LeftArm",
  "LeftForeArm",
  "LeftHand",
] as const;
export type Osso = (typeof OSSOS)[number];

/** Altura do corte da perna direita (logo abaixo do joelho, que fica em y ≈ 51). */
const CORTE_PERNA = 40;
/** Barra da calça na perna direita (dobrada logo abaixo do joelho, sobre o encaixe da prótese). */
const BARRA_DIREITA = 42;
/** Altura do topo do encaixe da prótese, em relação ao chão. */
const TOPO_ENCAIXE = 50;

export type Modelo = {
  pessoa: THREE.Group;
  protese: THREE.Group;
  ossos: Record<Osso, THREE.Bone>;
  repouso: Map<THREE.Bone, THREE.Quaternion>;
  hipsRepouso: THREE.Vector3;
  /** Prótese no espaço do osso da perna direita (joelho), medido na pose de repouso. */
  proteseNoJoelho: THREE.Matrix4;
};

/** Mantém só os triângulos cujos três vértices passam no teste (posição no mundo, pose de repouso). */
const recortar = (malha: THREE.Mesh, manter: (p: THREE.Vector3) => boolean) => {
  const geo = malha.geometry;
  const pos = geo.attributes.position;
  const p = new THREE.Vector3();
  const ok = new Uint8Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(malha.matrixWorld);
    ok[i] = manter(p) ? 1 : 0;
  }
  const antigo = geo.index
    ? Array.from(geo.index.array as ArrayLike<number>)
    : Array.from({ length: pos.count }, (_, i) => i);
  const novo: number[] = [];
  for (let i = 0; i < antigo.length; i += 3) {
    const [a, b, c] = [antigo[i], antigo[i + 1], antigo[i + 2]];
    if (ok[a] && ok[b] && ok[c]) novo.push(a, b, c);
  }
  geo.setIndex(novo);
  // Os grupos de material apontavam para a lista antiga de triângulos.
  geo.clearGroups();
};

const prepararPessoa = (pessoa: THREE.Group) => {
  pessoa.updateMatrixWorld(true);
  pessoa.traverse((o) => {
    o.frustumCulled = false;
    const m = o as THREE.SkinnedMesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
    if (Array.isArray(m.material)) m.material = m.material[0];
    if (m.name.endsWith("Body"))
      recortar(m, (v) => !(v.x < -1 && v.y < CORTE_PERNA));
    // O corpo do Mixamo não tem pernas por baixo da calça: a perna esquerda fica coberta
    // e a direita termina na barra, sobre o encaixe da prótese.
    if (m.name.endsWith("Pants"))
      recortar(m, (v) => !(v.x < -1 && v.y < BARRA_DIREITA));
    if (m.name.endsWith("Sneakers")) recortar(m, (v) => v.x > 0);
  });
};

const prepararProtese = (cena: THREE.Group) => {
  cena.updateMatrixWorld(true);
  const caixa = new THREE.Box3().setFromObject(cena);
  const tamanho = caixa.getSize(new THREE.Vector3());
  const escala = TOPO_ENCAIXE / tamanho.y;
  const centro = caixa.getCenter(new THREE.Vector3());
  // Pé no chão, encaixe centrado no eixo vertical.
  cena.position.set(
    -centro.x * escala,
    -caixa.min.y * escala,
    -centro.z * escala,
  );
  cena.scale.setScalar(escala);
  cena.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  const grupo = new THREE.Group();
  grupo.add(cena);
  return grupo;
};

export const useModelo = () => {
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [espera] = useState(() =>
    delayRender("Carregando personagem e prótese"),
  );
  useEffect(() => {
    Promise.all([
      new FBXLoader().loadAsync(
        staticFile("modelos3d/amputacao/personagem.fbx"),
      ),
      new GLTFLoader().loadAsync(
        staticFile("modelos3d/amputacao/protese/scene.gltf"),
      ),
    ])
      .then(([pessoa, gltf]) => {
        prepararPessoa(pessoa);
        const ossos = {} as Record<Osso, THREE.Bone>;
        for (const nome of OSSOS) {
          const osso = pessoa.getObjectByName(
            `${PREFIXO}${nome}`,
          ) as THREE.Bone;
          if (!osso) throw new Error(`Osso não encontrado: ${nome}`);
          ossos[nome] = osso;
        }
        const repouso = new Map<THREE.Bone, THREE.Quaternion>();
        for (const nome of OSSOS)
          repouso.set(ossos[nome], ossos[nome].quaternion.clone());

        const protese = prepararProtese(gltf.scene);
        // Posição da prótese sob o joelho direito, na pose de repouso: pé no chão, sob o joelho.
        const joelho = new THREE.Vector3();
        ossos.RightLeg.getWorldPosition(joelho);
        const tornozelo = new THREE.Vector3();
        ossos.RightFoot.getWorldPosition(tornozelo);
        const naCena = new THREE.Matrix4().makeTranslation(
          tornozelo.x,
          0,
          tornozelo.z,
        );
        const proteseNoJoelho = ossos.RightLeg.matrixWorld
          .clone()
          .invert()
          .multiply(naCena);
        setModelo({
          pessoa,
          protese,
          ossos,
          repouso,
          hipsRepouso: ossos.Hips.position.clone(),
          proteseNoJoelho,
        });
      })
      .catch((e) => {
        throw e;
      });
  }, []);
  return { modelo, espera, liberar: () => continueRender(espera) };
};

const eixoX = new THREE.Vector3(1, 0, 0);
const eixoY = new THREE.Vector3(0, 1, 0);
const eixoZ = new THREE.Vector3(0, 0, 1);
export const EIXOS = { x: eixoX, y: eixoY, z: eixoZ };

/** Gira um osso em torno de um eixo do mundo, a partir da rotação atual. */
export const girarNoMundo = (
  osso: THREE.Bone,
  eixo: THREE.Vector3,
  angulo: number,
) => {
  if (!angulo) return;
  osso.parent?.updateMatrixWorld(true);
  const pai = new THREE.Quaternion();
  osso.parent?.getWorldQuaternion(pai);
  const delta = new THREE.Quaternion().setFromAxisAngle(eixo, angulo);
  // q_local' = pai⁻¹ · delta · pai · q_local
  const q = pai
    .clone()
    .invert()
    .multiply(delta)
    .multiply(pai)
    .multiply(osso.quaternion);
  osso.quaternion.copy(q);
  osso.updateMatrixWorld(true);
};

export type Pose = {
  /** deslocamento lateral da pelve em cm (positivo = para a direita do personagem, x negativo) */
  deslocamento: number;
  /** onde as mãos (punhos) apoiam: distância lateral do centro, altura e profundidade (cm) */
  maoX: number;
  maoY: number;
  maoZ: number;
};

export const POSE_INICIAL: Pose = {
  deslocamento: 0,
  maoX: 43,
  maoY: 95,
  maoZ: 2,
};

const posMundo = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());

/** Gira um osso no mundo para levar a direção `de` até `para`. */
const apontar = (osso: THREE.Bone, de: THREE.Vector3, para: THREE.Vector3) => {
  const q = new THREE.Quaternion().setFromUnitVectors(
    de.normalize(),
    para.normalize(),
  );
  const eixo = new THREE.Vector3(q.x, q.y, q.z);
  const s = eixo.length();
  if (s < 1e-6) return;
  girarNoMundo(osso, eixo.divideScalar(s), 2 * Math.atan2(s, q.w));
};

/** IK de dois ossos (braço e antebraço) para o punho chegar ao alvo; o cotovelo aponta para `polo`. */
const alcancar = (
  braco: THREE.Bone,
  antebraco: THREE.Bone,
  mao: THREE.Bone,
  alvo: THREE.Vector3,
  polo: THREE.Vector3,
) => {
  const ombro = posMundo(braco);
  const l1 = posMundo(antebraco).distanceTo(ombro);
  const l2 = posMundo(mao).distanceTo(posMundo(antebraco));
  const paraAlvo = alvo.clone().sub(ombro);
  const d = Math.min(paraAlvo.length(), l1 + l2 - 0.01);
  const dir = paraAlvo.normalize();
  const a = Math.acos(
    Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))),
  );
  // Plano do cotovelo: contém a direção ao alvo e o polo.
  const normal = new THREE.Vector3().crossVectors(dir, polo).normalize();
  let u = dir.clone().applyAxisAngle(normal, a);
  if (u.dot(polo) < dir.dot(polo)) u = dir.clone().applyAxisAngle(normal, -a);
  apontar(braco, posMundo(antebraco).sub(ombro), u);
  const cotovelo = posMundo(antebraco);
  apontar(antebraco, posMundo(mao).sub(cotovelo), alvo.clone().sub(cotovelo));
};

/** Aplica a pose no esqueleto: pelve desloca de lado, pernas inclinam com os pés fixos. */
export const aplicarPose = (m: Modelo, pose: Pose) => {
  const { ossos } = m;
  for (const [osso, q] of m.repouso) osso.quaternion.copy(q);
  ossos.Hips.position.copy(m.hipsRepouso);
  m.pessoa.updateMatrixWorld(true);

  // Pelve vai para a direita do personagem (x negativo no mundo).
  const d = -pose.deslocamento;
  // Comprimento quadril → tornozelo (cm), para inclinar as pernas e manter os pés no lugar.
  const perna = 82;
  const ang = Math.asin(Math.max(-0.5, Math.min(0.5, d / perna)));
  // Hips: posição local está na escala do FBX; converte cm do mundo pela escala do pai.
  const escalaPai = ossos.Hips.parent
    ? ossos.Hips.parent.getWorldScale(new THREE.Vector3()).x
    : 1;
  ossos.Hips.position.x += d / escalaPai;
  ossos.Hips.position.y -= (perna * (1 - Math.cos(ang))) / escalaPai;
  m.pessoa.updateMatrixWorld(true);
  // Pernas inclinam em torno do eixo frontal (z) para os pés ficarem onde estavam.
  for (const lado of ["Right", "Left"] as const) {
    girarNoMundo(ossos[`${lado}UpLeg`], eixoZ, -ang);
    girarNoMundo(ossos[`${lado}Foot`], eixoZ, ang);
  }

  // Mãos sobre os encostos das cadeiras: as mãos ficam paradas enquanto o corpo desloca.
  for (const [lado, sinal] of [
    ["Right", -1],
    ["Left", 1],
  ] as const) {
    alcancar(
      ossos[`${lado}Arm`],
      ossos[`${lado}ForeArm`],
      ossos[`${lado}Hand`],
      new THREE.Vector3(sinal * pose.maoX, pose.maoY, pose.maoZ),
      new THREE.Vector3(sinal, -0.3, -1).normalize(),
    );
  }
  m.pessoa.updateMatrixWorld(true);

  // Prótese acompanha o joelho direito.
  m.protese.matrixAutoUpdate = false;
  m.protese.matrix.copy(ossos.RightLeg.matrixWorld).multiply(m.proteseNoJoelho);
  m.protese.matrixWorldNeedsUpdate = true;
};
