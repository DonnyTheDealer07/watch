import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getFocusWeights,
  getWorldPartPosition,
} from "../../utils/animation";

const GOLD = "#d9c49c";
const BRIGHT_GOLD = "#f0d9a5";
const SOFT_TEAL = "#8ab4ae";

const FOCUS_PARTS = [
  "mainspring",
  "gears",
  "escapement",
  "balance",
];

const TWO_PI = Math.PI * 2;

function OrbitalRing({
  radius,
  width,
  color = GOLD,
  opacity = 0.1,
}) {
  return (
    <mesh>
      <ringGeometry
        args={[
          radius - width,
          radius + width,
          160,
        ]}
      />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function OrbitalMarkings({
  radius,
  count,
  length,
  width,
  opacity,
  color = GOLD,
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * TWO_PI;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const major = index % 5 === 0;

        return (
          <mesh
            key={index}
            position={[x, y, 0]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry
              args={[
                major ? length * 1.8 : length,
                width,
              ]}
            />

            <meshBasicMaterial
              color={color}
              transparent
              opacity={major ? opacity : opacity * 0.55}
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function OrbitNodes({
  radius,
  count,
  size,
  color = BRIGHT_GOLD,
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * TWO_PI;

        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0.003,
            ]}
          >
            <circleGeometry args={[size, 12]} />

            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.55}
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function FocusHalo({ progressRef }) {
  const rootRef = useRef(null);
  const innerOrbitRef = useRef(null);
  const outerOrbitRef = useRef(null);
  const detailOrbitRef = useRef(null);
  const heartbeatRef = useRef(null);
  const innerMaterialRef = useRef(null);
  const outerMaterialRef = useRef(null);

  const progress = useRef(0);
  const visibility = useRef(0);

  const focusPositions = useMemo(
    () =>
      FOCUS_PARTS.map(
        () => new THREE.Vector3()
      ),
    []
  );

  const targetPosition = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const activeWeights = useRef({
    mainspring: 0,
    gears: 0,
    escapement: 0,
    balance: 0,
  });

  useFrame((state, delta) => {
    const root = rootRef.current;

    if (!root) return;

    const requested =
      progressRef?.current?.value ?? 0;

    progress.current = THREE.MathUtils.damp(
      progress.current,
      requested,
      7,
      delta
    );

    const p = progress.current;
    const time = state.clock.elapsedTime;

    const weights = getFocusWeights(p);

    let totalWeight = 0;

    targetPosition.set(0, 0, 0);

    FOCUS_PARTS.forEach((part, index) => {
      const weight = weights[part] ?? 0;

      activeWeights.current[part] = weight;

      if (weight <= 0) return;

      getWorldPartPosition(
        part,
        p,
        focusPositions[index]
      );

      targetPosition.addScaledVector(
        focusPositions[index],
        weight
      );

      totalWeight += weight;
    });

    const targetVisibility = THREE.MathUtils.smoothstep(
      totalWeight,
      0.02,
      0.65
    );

    visibility.current = THREE.MathUtils.damp(
      visibility.current,
      targetVisibility,
      5,
      delta
    );

    const fade = visibility.current;

    if (fade < 0.001) {
      root.visible = false;
      return;
    }

    root.visible = true;

    if (totalWeight > 0.0001) {
      targetPosition.multiplyScalar(
        1 / totalWeight
      );

      targetPosition.z -= 0.28;

      root.position.lerp(
        targetPosition,
        1 - Math.exp(-8 * delta)
      );
    }

    // ------------------------------------------------
    // MECHANICAL HEARTBEAT
    // ------------------------------------------------

    // A restrained double pulse gives the rings
    // a mechanical rhythm rather than a random
    // breathing animation.
    const beatPhase =
      (time * 1.75) % TWO_PI;

    const primaryBeat = Math.pow(
      Math.max(0, Math.sin(beatPhase)),
      12
    );

    const secondaryBeat = Math.pow(
      Math.max(
        0,
        Math.sin(beatPhase - 0.72)
      ),
      16
    );

    const heartbeat =
      primaryBeat * 0.7 +
      secondaryBeat * 0.3;

    const slowBreathing =
      Math.sin(time * 0.45) * 0.008;

    const pulseScale =
      1 +
      slowBreathing +
      heartbeat * 0.018;

    root.scale.setScalar(pulseScale);

    // ------------------------------------------------
    // ORBITAL ROTATION
    // ------------------------------------------------

    if (innerOrbitRef.current) {
      innerOrbitRef.current.rotation.z =
        time * 0.045;
    }

    if (outerOrbitRef.current) {
      outerOrbitRef.current.rotation.z =
        -time * 0.022;
    }

    if (detailOrbitRef.current) {
      detailOrbitRef.current.rotation.z =
        time * 0.075;
    }

    // ------------------------------------------------
    // CHAPTER-SPECIFIC CHARACTER
    // ------------------------------------------------

    const mainspring =
      activeWeights.current.mainspring;

    const gears =
      activeWeights.current.gears;

    const escapement =
      activeWeights.current.escapement;

    const balance =
      activeWeights.current.balance;

    const mechanicalActivity =
      gears * 0.15 +
      escapement * 0.3 +
      balance * 0.45;

    const innerSpeed =
      0.045 + mechanicalActivity * 0.09;

    const outerSpeed =
      0.022 + mechanicalActivity * 0.045;

    if (innerOrbitRef.current) {
      innerOrbitRef.current.rotation.z =
        time * innerSpeed;
    }

    if (outerOrbitRef.current) {
      outerOrbitRef.current.rotation.z =
        -time * outerSpeed;
    }

    if (detailOrbitRef.current) {
      detailOrbitRef.current.rotation.z =
        time *
        (0.075 + gears * 0.08);
    }

    // The balance-wheel chapter receives a
    // slightly stronger heartbeat.
    const heartbeatStrength =
      0.012 +
      balance * 0.026 +
      escapement * 0.012;

    if (heartbeatRef.current) {
      heartbeatRef.current.scale.setScalar(
        1 + heartbeat * heartbeatStrength
      );
    }

    // ------------------------------------------------
    // LIGHT INTENSITY
    // ------------------------------------------------

    const goldIntensity =
      1 +
      heartbeat * (0.18 + balance * 0.45) +
      mainspring * 0.06;

    if (innerMaterialRef.current) {
      innerMaterialRef.current.opacity =
        0.095 * fade * goldIntensity;
    }

    if (outerMaterialRef.current) {
      outerMaterialRef.current.opacity =
        0.045 * fade * goldIntensity;
    }

    // All decorative materials fade smoothly
    // with the focus chapter.
    root.traverse((object) => {
      if (!object.isMesh) return;

      const material = object.material;

      if (!material || !material.userData) {
        return;
      }

      if (
        material === innerMaterialRef.current ||
        material === outerMaterialRef.current
      ) {
        return;
      }

      if (
        material.userData.baseOpacity === undefined
      ) {
        material.userData.baseOpacity =
          material.opacity;
      }

      material.opacity =
        material.userData.baseOpacity * fade;
    });
  });

  return (
    <group
      ref={rootRef}
      visible={false}
    >
      {/* Main recognizable CHRONOS rings */}
      <group ref={heartbeatRef}>
        <mesh>
          <ringGeometry
            args={[0.715, 0.785, 160]}
          />

          <meshBasicMaterial
            ref={innerMaterialRef}
            color={GOLD}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <ringGeometry
            args={[0.943, 0.957, 160]}
          />

          <meshBasicMaterial
            ref={outerMaterialRef}
            color={GOLD}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Inner orbital detail */}
      <group ref={innerOrbitRef}>
        <OrbitalMarkings
          radius={0.82}
          count={60}
          length={0.018}
          width={0.0025}
          opacity={0.22}
        />

        <OrbitNodes
          radius={0.82}
          count={6}
          size={0.008}
        />
      </group>

      {/* Outer orbital detail */}
      <group ref={outerOrbitRef}>
        <OrbitalMarkings
          radius={1.005}
          count={80}
          length={0.014}
          width={0.002}
          opacity={0.15}
          color={SOFT_TEAL}
        />

        <OrbitNodes
          radius={1.005}
          count={4}
          size={0.006}
          color={GOLD}
        />
      </group>

      {/* Fine intermediate orbit */}
      <group ref={detailOrbitRef}>
        <OrbitalRing
          radius={0.885}
          width={0.0015}
          color={SOFT_TEAL}
          opacity={0.055}
        />

        <OrbitalMarkings
          radius={0.885}
          count={24}
          length={0.028}
          width={0.0025}
          opacity={0.17}
        />
      </group>

      {/* Small stationary central accent */}
      <OrbitalRing
        radius={0.64}
        width={0.0015}
        color={GOLD}
        opacity={0.035}
      />
    </group>
  );
}