
import { useEffect, useMemo } from "react";
import * as THREE from "three";

const GOLD = "#d9c49c";
const LIGHT_GOLD = "#f0dfb8";
const DARK_STEEL = "#344c50";
const SHADOW = "#102328";

const BEZEL_INNER = 0.642;
const BEZEL_OUTER = 0.697;
const CASE_OUTER = 0.713;

function Metal({
  color = GOLD,
  roughness = 0.22,
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.94}
      roughness={roughness}
    />
  );
}

function Ring({
  inner,
  outer,
  z = 0,
  depth = 0.04,
  color = GOLD,
  roughness = 0.22,
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    shape.absarc(
      0,
      0,
      outer,
      0,
      Math.PI * 2,
      false
    );

    const hole = new THREE.Path();

    hole.absarc(
      0,
      0,
      inner,
      0,
      Math.PI * 2,
      true
    );

    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
      curveSegments: 128,
    });
  }, [inner, outer, depth]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, z]}
      castShadow
      receiveShadow
    >
      <Metal
        color={color}
        roughness={roughness}
      />
    </mesh>
  );
}

function FineRing({
  radius,
  thickness,
  z,
  color = GOLD,
}) {
  return (
    <mesh position={[0, 0, z]}>
      <torusGeometry
        args={[radius, thickness, 8, 128]}
      />

      <Metal
        color={color}
        roughness={0.16}
      />
    </mesh>
  );
}

/*
  CHRONOS — REFINED INTEGRATED LUG

  The lug starts inside the circular case,
  follows its contour, and narrows toward
  the bracelet.

  No exposed pins or bulky rectangular ends.
*/

function Lug({ side, vertical }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    // Inner connection, hidden beneath the case.
    shape.moveTo(0.285, 0.555);

    // Rounded shoulder following the case.
    shape.quadraticCurveTo(
      0.325,
      0.54,
      0.365,
      0.57
    );

    // Taper inward toward the bracelet.
    shape.quadraticCurveTo(
      0.392,
      0.645,
      0.393,
      0.72
    );

    // Smooth, narrow end.
    shape.quadraticCurveTo(
      0.393,
      0.752,
      0.371,
      0.755
    );

    shape.lineTo(0.322, 0.755);

    shape.quadraticCurveTo(
      0.305,
      0.75,
      0.305,
      0.725
    );

    // Return along the inside edge.
    shape.quadraticCurveTo(
      0.305,
      0.63,
      0.285,
      0.555
    );

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.045,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 3,
      curveSegments: 16,
    });
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <group scale={[side, vertical, 1]}>
      <mesh
        geometry={geometry}
        position={[0, 0, -0.075]}
        castShadow
        receiveShadow
      >
        <Metal
          color={DARK_STEEL}
          roughness={0.28}
        />
      </mesh>
    </group>
  );
}

function Crown() {
  return (
    <group position={[0.747, 0, 0.015]}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[0.075, 0.075, 0.12, 48]}
        />

        <Metal
          color={GOLD}
          roughness={0.2}
        />
      </mesh>

      {Array.from({ length: 24 }, (_, i) => {
        const angle =
          (i / 24) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              0,
              Math.cos(angle) * 0.073,
              Math.sin(angle) * 0.073,
            ]}
          >
            <boxGeometry
              args={[0.105, 0.006, 0.006]}
            />

            <Metal
              color={LIGHT_GOLD}
              roughness={0.16}
            />
          </mesh>
        );
      })}

      <mesh
        position={[0.063, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <circleGeometry args={[0.062, 48]} />

        <Metal
          color={SHADOW}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function WatchCase() {
  return (
    <group>
      {/* Main watch case */}
      <Ring
        inner={0.64}
        outer={CASE_OUTER}
        depth={0.115}
        z={-0.075}
        color={DARK_STEEL}
        roughness={0.3}
      />

      {/* Champagne-gold bezel */}
      <Ring
        inner={BEZEL_INNER}
        outer={BEZEL_OUTER}
        depth={0.032}
        z={0.048}
        color={GOLD}
        roughness={0.2}
      />

      {/* Outer polished edge */}
      <FineRing
        radius={BEZEL_OUTER}
        thickness={0.007}
        z={0.084}
        color={LIGHT_GOLD}
      />

      {/* Inner polished edge */}
      <FineRing
        radius={BEZEL_INNER}
        thickness={0.005}
        z={0.085}
        color={GOLD}
      />

      {/* Caseback */}
      <FineRing
        radius={0.696}
        thickness={0.008}
        z={-0.082}
        color={DARK_STEEL}
      />

      {/* Four slim integrated lugs */}
      {[-1, 1].flatMap((vertical) =>
        [-1, 1].map((side) => (
          <Lug
            key={`${vertical}-${side}`}
            side={side}
            vertical={vertical}
          />
        ))
      )}

      {/* Winding crown */}
      <Crown />
    </group>
  );
}
