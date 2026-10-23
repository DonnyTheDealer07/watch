
import * as THREE from "three";

export default function WatchCrystal() {
  return (
    <group>
      {/* Thin transparent crystal */}
      <mesh>
        <circleGeometry args={[0.648, 128]} />
        <meshPhysicalMaterial
          color="#e6f7f4"
          metalness={0}
          roughness={0.035}
          transparent
          opacity={0.13}
          transmission={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>

      {/* Sapphire perimeter */}
      <mesh position={[0, 0, -0.005]}>
        <torusGeometry args={[0.646, 0.008, 10, 128]} />
        <meshPhysicalMaterial
          color="#b9e0dc"
          metalness={0.15}
          roughness={0.08}
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>

      {/* Single slim retaining rim */}
      <mesh position={[0, 0, -0.015]}>
        <torusGeometry args={[0.658, 0.007, 8, 128]} />
        <meshStandardMaterial
          color="#d9c49c"
          metalness={0.96}
          roughness={0.17}
        />
      </mesh>
    </group>
  );
}
