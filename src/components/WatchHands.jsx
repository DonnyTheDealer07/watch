
import { useMemo, useEffect } from "react";
import * as THREE from "three";

const GOLD = "#d9c49c";
const GOLD_LIGHT = "#f5e6bf";
const LUME = "#e2ebe2";

function WatchHand({
  length,
  width,
  angle,
  z,
  luminous = false,
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-width * 0.38, -0.055);
    shape.lineTo(-width * 0.5, length * 0.55);
    shape.lineTo(-width * 0.24, length * 0.82);
    shape.lineTo(0, length);
    shape.lineTo(width * 0.24, length * 0.82);
    shape.lineTo(width * 0.5, length * 0.55);
    shape.lineTo(width * 0.38, -0.055);
    shape.closePath();

    const result = new THREE.ExtrudeGeometry(shape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });

    result.translate(0, 0, -0.006);

    return result;
  }, [length, width]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <group
      position={[0, 0, z]}
      rotation={[0, 0, angle]}
    >
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={GOLD}
          metalness={0.92}
          roughness={0.19}
        />
      </mesh>

      {/* Narrow polished center ridge */}
      <mesh
        position={[
          0,
          length * 0.49,
          0.009,
        ]}
      >
        <boxGeometry
          args={[0.004, length * 0.64, 0.003]}
        />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={0.95}
          roughness={0.13}
        />
      </mesh>

      {luminous && (
        <mesh
          position={[
            0,
            length * 0.52,
            0.012,
          ]}
        >
          <boxGeometry
            args={[
              width * 0.23,
              length * 0.28,
              0.003,
            ]}
          />
          <meshStandardMaterial
            color={LUME}
            emissive="#8daea1"
            emissiveIntensity={0.12}
            roughness={0.48}
          />
        </mesh>
      )}
    </group>
  );
}

function SecondsHand() {
  return (
    <group
      position={[0, 0, 0.055]}
      rotation={[0, 0, -Math.PI / 4]}
    >
      {/* Fine forward needle */}
      <mesh position={[0, 0.205, 0]}>
        <boxGeometry args={[0.007, 0.41, 0.006]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={0.96}
          roughness={0.14}
        />
      </mesh>

      {/* Small, balanced tail */}
      <mesh position={[0, -0.072, 0]}>
        <boxGeometry args={[0.012, 0.144, 0.007]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.94}
          roughness={0.17}
        />
      </mesh>

      {/* Tiny gold counterweight, not a black disc */}
      <mesh position={[0, -0.135, 0.004]}>
        <sphereGeometry args={[0.014, 16, 12]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={0.96}
          roughness={0.14}
        />
      </mesh>
    </group>
  );
}

export default function WatchHands() {
  return (
    <group>
      {/* Hour hand */}
      <WatchHand
        length={0.295}
        width={0.064}
        angle={-Math.PI / 3}
        z={0}
        luminous
      />

      {/* Minute hand */}
      <WatchHand
        length={0.46}
        width={0.044}
        angle={Math.PI / 5}
        z={0.026}
        luminous
      />

      {/* Seconds hand */}
      <SecondsHand />

      {/* Single clean central mounting pin */}
      <mesh position={[0, 0, 0.075]}>
        <sphereGeometry args={[0.024, 24, 16]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={0.96}
          roughness={0.12}
        />
      </mesh>
    </group>
  );
}
