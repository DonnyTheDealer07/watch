
import * as THREE from "three";

const CRYSTAL_RADIUS = 0.637;

export default function WatchCrystal() {
  return (
    <group>
      {/* Ultra-thin sapphire surface */}
      <mesh renderOrder={2}>
        <circleGeometry args={[CRYSTAL_RADIUS, 128]} />

        <meshPhysicalMaterial
          color="#f4fcfa"
          metalness={0}
          roughness={0.025}
          transparent
          opacity={0.065}
          transmission={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          clearcoat={1}
          clearcoatRoughness={0.015}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* Delicate polished sapphire edge */}
      <mesh
        position={[0, 0, -0.002]}
        renderOrder={3}
      >
        <torusGeometry
          args={[CRYSTAL_RADIUS, 0.0035, 10, 128]}
        />

        <meshPhysicalMaterial
          color="#dceeea"
          metalness={0.08}
          roughness={0.055}
          transparent
          opacity={0.34}
          depthWrite={false}
          clearcoat={1}
          clearcoatRoughness={0.025}
        />
      </mesh>

      {/* Very subtle glass reflection */}
      <mesh
        position={[-0.17, 0.24, 0.001]}
        rotation={[0, 0, -0.52]}
        renderOrder={4}
      >
        <planeGeometry args={[0.025, 0.29]} />

        <meshBasicMaterial
          color="#e6f8f3"
          transparent
          opacity={0.025}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
