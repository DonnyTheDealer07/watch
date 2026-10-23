
import { useMemo, useEffect } from "react";
import * as THREE from "three";

const GOLD = "#d9c49c";
const LIGHT_GOLD = "#f0dfb8";
const DARK_STEEL = "#344c50";
const SHADOW = "#102328";

// All circular elements use the same center.
const DIAL_RADIUS = 0.632;
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

    const result = new THREE.ExtrudeGeometry(
      shape,
      {
        depth,
        steps: 1,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.002,
        bevelSegments: 2,
        curveSegments: 128,
      }
    );

    return result;
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
      <Metal color={color} roughness={roughness} />
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
      <Metal color={color} roughness={0.16} />
    </mesh>
  );
}

function Lug({ side, vertical }) {
  const x = side * 0.48;
  const y = vertical * 0.725;

  return (
    <group
      position={[x, y, -0.045]}
      rotation={[
        0,
        0,
        -side * vertical * 0.13,
      ]}
    >
      <mesh castShadow>
        <capsuleGeometry
          args={[0.052, 0.105, 4, 12]}
        />
        <Metal
          color={DARK_STEEL}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0, 0.048]}>
        <capsuleGeometry
          args={[0.033, 0.09, 4, 12]}
        />
        <Metal
          color={GOLD}
          roughness={0.2}
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
        <Metal color={GOLD} roughness={0.2} />
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
      {/* Main dark steel case wall */}
      <Ring
        inner={0.64}
        outer={CASE_OUTER}
        depth={0.115}
        z={-0.075}
        color={DARK_STEEL}
        roughness={0.3}
      />

      {/* Single machined champagne-gold bezel */}
      <Ring
        inner={BEZEL_INNER}
        outer={BEZEL_OUTER}
        depth={0.032}
        z={0.048}
        color={GOLD}
        roughness={0.2}
      />

      {/* Fine polished outer edge */}
      <FineRing
        radius={BEZEL_OUTER}
        thickness={0.007}
        z={0.084}
        color={LIGHT_GOLD}
      />

      {/* Fine inner edge, close to the dial */}
      <FineRing
        radius={BEZEL_INNER}
        thickness={0.005}
        z={0.085}
        color={GOLD}
      />

      {/* Subtle lower caseback outline */}
      <FineRing
        radius={0.696}
        thickness={0.008}
        z={-0.082}
        color={DARK_STEEL}
      />

      {/* Slim, symmetrical bracelet lugs */}
      {[-1, 1].flatMap((vertical) =>
        [-1, 1].map((side) => (
          <Lug
            key={`${vertical}-${side}`}
            side={side}
            vertical={vertical}
          />
        ))
      )}

      <Crown />
    </group>
  );
}
