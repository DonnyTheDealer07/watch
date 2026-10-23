import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { COLORS } from "../../utils/watchConfig";

const TAU = Math.PI * 2;
const CLOCK_SPEED = 0.11;

export function Metal({
  color = COLORS.brass,
  roughness = 0.24,
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.92}
      roughness={roughness}
    />
  );
}

export function Jewel({
  position = [0, 0, 0],
  radius = 0.045,
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[radius * 1.4, radius * 1.4, 0.018, 24]}
        />
        <Metal color={COLORS.champagne} />
      </mesh>

      <mesh position={[0, 0, 0.017]}>
        <circleGeometry args={[radius, 32]} />
        <meshPhysicalMaterial
          color="#a61938"
          metalness={0.2}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.03}
        />
      </mesh>

      <mesh position={[0, 0, 0.023]}>
        <sphereGeometry args={[radius * 0.37, 12, 8]} />
        <meshBasicMaterial
          color="#ff8ca1"
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

export function WatchScrew({
  position = [0, 0, 0],
  radius = 0.038,
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[radius, radius, 0.018, 24]}
        />
        <Metal color={COLORS.steel} roughness={0.16} />
      </mesh>

      <mesh position={[0, 0, 0.013]}>
        <boxGeometry
          args={[radius * 1.25, 0.009, 0.004]}
        />
        <meshStandardMaterial
          color="#243438"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function makeGearGeometry(radius, teeth, thickness) {
  const shape = new THREE.Shape();
  const rootRadius = radius * 0.87;
  const steps = teeth * 4;

  for (let i = 0; i <= steps; i++) {
    const index = i % steps;
    const phase = index % 4;
    const angle = (i / steps) * TAU;

    const r =
      phase === 1 || phase === 2
        ? radius
        : rootRadius;

    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: Math.min(thickness * 0.15, 0.006),
    bevelThickness: Math.min(thickness * 0.12, 0.004),
    curveSegments: 2,
  });

  geometry.translate(0, 0, -thickness / 2);
  geometry.computeVertexNormals();

  return geometry;
}

export function MechanicalGear({
  radius = 0.25,
  teeth = 24,
  thickness = 0.028,
  speed = CLOCK_SPEED,
  direction = 1,
  color = COLORS.brass,
  phase = 0,
  jewel = true,
  clockRef,
}) {
  const group = useRef(null);

  const geometry = useMemo(
    () => makeGearGeometry(radius, teeth, thickness),
    [radius, teeth, thickness]
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((state) => {
    if (!group.current) return;

    const time =
      clockRef?.current ?? state.clock.elapsedTime;

    group.current.rotation.z =
      phase + time * speed * direction;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <Metal color={color} roughness={0.21} />
      </mesh>

      <mesh position={[0, 0, thickness / 2 + 0.002]}>
        <ringGeometry
          args={[radius * 0.18, radius * 0.69, 64]}
        />
        <meshStandardMaterial
          color="#0b1d20"
          metalness={0.8}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, 0, thickness / 2 + 0.009]}>
        <torusGeometry
          args={[radius * 0.66, radius * 0.025, 8, 64]}
        />
        <Metal color={color} roughness={0.16} />
      </mesh>

      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * TAU;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius * 0.4,
              Math.sin(angle) * radius * 0.4,
              thickness / 2 + 0.012,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry
              args={[radius * 0.54, radius * 0.09, 0.014]}
            />
            <Metal color={color} roughness={0.17} />
          </mesh>
        );
      })}

      <mesh
        position={[0, 0, thickness / 2 + 0.018]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[
            radius * 0.18,
            radius * 0.18,
            0.035,
            32,
          ]}
        />
        <Metal color={COLORS.steel} roughness={0.14} />
      </mesh>

      {jewel && (
        <Jewel
          position={[0, 0, thickness / 2 + 0.041]}
          radius={Math.max(radius * 0.11, 0.022)}
        />
      )}
    </group>
  );
}

export default function GearTrain() {
  const clockRef = useRef(0);

  useFrame((state, delta) => {
    // Slow, constant mechanical motion.
    // Every gear reads from the same clock.
    clockRef.current += Math.min(delta, 0.05);
  });

  return (
    <group>
      <group position={[-0.27, 0.24, 0]}>
        <MechanicalGear
          radius={0.25}
          teeth={36}
          speed={0.12}
          direction={1}
          color={COLORS.champagne}
          clockRef={clockRef}
        />
      </group>

      <group position={[0.26, 0.12, 0.035]}>
        <MechanicalGear
          radius={0.205}
          teeth={30}
          speed={0.144}
          direction={-1}
          color={COLORS.steel}
          phase={0.05}
          clockRef={clockRef}
        />
      </group>

      <group position={[0.08, -0.34, 0.075]}>
        <MechanicalGear
          radius={0.265}
          teeth={40}
          speed={0.108}
          direction={1}
          color={COLORS.brass}
          clockRef={clockRef}
        />
      </group>

      <group position={[-0.36, -0.31, 0.11]}>
        <MechanicalGear
          radius={0.155}
          teeth={22}
          speed={0.196}
          direction={-1}
          color={COLORS.brightGold}
          clockRef={clockRef}
        />
      </group>

      <group position={[0.02, 0.05, 0.15]}>
        <MechanicalGear
          radius={0.092}
          teeth={12}
          speed={0.359}
          direction={-1}
          color={COLORS.steel}
          clockRef={clockRef}
        />
      </group>
    </group>
  );
}