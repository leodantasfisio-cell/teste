// Sala de estar simples (geometria própria): piso de madeira, paredes, janela, sofá e
// duas cadeiras de madeira, uma de cada lado do paciente, com o encosto virado para ele.
// Unidades em centímetros; o paciente fica na origem, de frente para +z.

const MADEIRA = "#8a5a36";
const MADEIRA_CLARA = "#a8774c";
const PAREDE = "#e8e2d8";
const SOFA = "#c9bfae";

const Caixa: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  cor: string;
  rugosidade?: number;
}> = ({ pos, tam, cor, rugosidade = 0.8 }) => (
  <mesh position={pos} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={rugosidade} />
  </mesh>
);

/** Cadeira com o encosto do lado de x = 0 (perto do paciente) quando `lado` = 1 ou -1. */
const Cadeira: React.FC<{ x: number; lado: 1 | -1 }> = ({ x, lado }) => {
  const assento = 46;
  const largura = 42;
  const profundidade = 42;
  // O encosto fica na borda do assento mais próxima do paciente.
  const xEncosto = x - lado * (profundidade / 2 - 2);
  const pernas: [number, number][] = [
    [x - profundidade / 2 + 3, -largura / 2 + 3],
    [x - profundidade / 2 + 3, largura / 2 - 3],
    [x + profundidade / 2 - 3, -largura / 2 + 3],
    [x + profundidade / 2 - 3, largura / 2 - 3],
  ];
  return (
    <group>
      <Caixa pos={[x, assento, 0]} tam={[profundidade, 4, largura]} cor={MADEIRA_CLARA} />
      {pernas.map(([px, pz]) => (
        <Caixa key={`${px}-${pz}`} pos={[px, assento / 2, pz]} tam={[4, assento, 4]} cor={MADEIRA} />
      ))}
      {/* montantes e travessa do encosto (topo a 88 cm, onde as mãos apoiam) */}
      {[-largura / 2 + 3, largura / 2 - 3].map((pz) => (
        <Caixa key={pz} pos={[xEncosto, 67, pz]} tam={[4, 42, 4]} cor={MADEIRA} />
      ))}
      <Caixa pos={[xEncosto, 85, 0]} tam={[5, 7, largura]} cor={MADEIRA_CLARA} />
      <Caixa pos={[xEncosto, 72, 0]} tam={[3, 5, largura - 6]} cor={MADEIRA} />
    </group>
  );
};

export const ALTURA_ENCOSTO = 88;
export const X_CADEIRA = 62;

export const Sala: React.FC = () => (
  <group>
    {/* piso */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1200, 1200]} />
      <meshStandardMaterial color="#9b6b43" roughness={0.6} />
    </mesh>
    {/* tábuas do piso */}
    {Array.from({ length: 40 }, (_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-600 + i * 30, 0.05, 0]}>
        <planeGeometry args={[0.6, 1200]} />
        <meshStandardMaterial color="#7a5230" />
      </mesh>
    ))}
    {/* parede do fundo e rodapé */}
    <mesh position={[0, 150, -230]} receiveShadow>
      <planeGeometry args={[1200, 300]} />
      <meshStandardMaterial color={PAREDE} roughness={0.95} />
    </mesh>
    <Caixa pos={[0, 6, -228]} tam={[1200, 12, 3]} cor="#f4f1ec" />
    {/* janela com luz natural */}
    <group position={[150, 150, -229]}>
      <Caixa pos={[0, 0, 0]} tam={[130, 150, 3]} cor="#f6f3ee" />
      <mesh position={[0, 0, 2]}>
        <planeGeometry args={[116, 136]} />
        <meshStandardMaterial color="#dfeaf0" emissive="#cfe3ee" emissiveIntensity={0.9} />
      </mesh>
      <Caixa pos={[0, 0, 3]} tam={[4, 136, 2]} cor="#f6f3ee" />
      <Caixa pos={[0, 0, 3]} tam={[116, 4, 2]} cor="#f6f3ee" />
      <Caixa pos={[0, -80, 6]} tam={[150, 5, 14]} cor="#f6f3ee" />
    </group>
    {/* sofá encostado na parede */}
    <group position={[-170, 0, -185]}>
      <Caixa pos={[0, 25, 0]} tam={[220, 30, 80]} cor={SOFA} />
      <Caixa pos={[0, 55, -32]} tam={[220, 50, 18]} cor={SOFA} />
      <Caixa pos={[-104, 42, 0]} tam={[14, 34, 80]} cor={SOFA} />
      <Caixa pos={[104, 42, 0]} tam={[14, 34, 80]} cor={SOFA} />
      <Caixa pos={[-52, 45, 4]} tam={[100, 12, 68]} cor="#d3c9b8" />
      <Caixa pos={[52, 45, 4]} tam={[100, 12, 68]} cor="#d3c9b8" />
    </group>
    {/* cadeiras de apoio, uma de cada lado */}
    <Cadeira x={-X_CADEIRA} lado={-1} />
    <Cadeira x={X_CADEIRA} lado={1} />
  </group>
);
