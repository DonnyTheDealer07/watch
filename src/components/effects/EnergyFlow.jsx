import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  getFocusWeights,
  getWorldPartPosition,
} from "../../utils/animation";

const PARTS = [
  "mainspring",
  "gears",
  "escapement",
  "balance",
];

const COUNT = 18;

export default function EnergyFlow({ progressRef }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const progress = useRef(0);

  const focus = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);

    const result = new THREE.BufferGeometry();

    result.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    return result;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;

    if (!group || !material) return;

    progress.current = THREE.MathUtils.damp(
      progress.current,
      progressRef?.current?.value ?? 0,
      7,
      delta
    );

    const p = progress.current;
    const weights = getFocusWeights(p);

    let strongest = 0;
    let activePart = "mainspring";

    for (const part of PARTS) {
      const weight = weights[part] ?? 0;

      if (weight > strongest) {
        strongest = weight;
        activePart = part;
      }
    }

    if (strongest < 0.025) {
      group.visible = false;
      return;
    }

    group.visible = true;

    getWorldPartPosition(activePart, p, focus);

    group.position.copy(focus);
    group.position.z += 0.11;

    const time = state.clock.elapsedTime;
    const positions =
      geometry.attributes.position;

    const radius =
      activePart === "gears" ? 0.56 : 0.39;

    for (let i = 0; i < COUNT; i++) {
      const phase =
        (i / COUNT) * Math.PI * 2;

      const angle =
        phase + time * 0.24;

      const variation =
        Math.sin(phase * 3 + time * 0.7) * 0.025;

      const r = radius + variation;

      positions.setXYZ(
        i,
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        Math.sin(time + phase) * 0.025
      );
    }

    positions.needsUpdate = true;

    material.opacity =
      0.23 *
      THREE.MathUtils.smoothstep(
        strongest,
        0,
        0.7
      );
  });

  return (
    <group ref={groupRef} visible={false}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          color="#f0d9a5"
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}