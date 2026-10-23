import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 90;

export default function Atmosphere({ progressRef }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const currentProgress = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const index = i * 3;

      positions[index] = (Math.random() - 0.5) * 12;
      positions[index + 1] = (Math.random() - 0.5) * 7;
      positions[index + 2] = -1.5 + Math.random() * 4;
    }

    const result = new THREE.BufferGeometry();

    result.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    return result;
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((state, delta) => {
    const requested = progressRef?.current?.value ?? 0;

    currentProgress.current = THREE.MathUtils.damp(
      currentProgress.current,
      requested,
      3,
      delta
    );

    const p = currentProgress.current;
    const time = state.clock.elapsedTime;

    if (pointsRef.current) {
      pointsRef.current.rotation.z =
        Math.sin(time * 0.08) * 0.035;

      pointsRef.current.position.y =
        Math.sin(time * 0.17) * 0.12;
    }

    if (materialRef.current) {
      const inspection =
        THREE.MathUtils.smoothstep(p, 0.3, 0.42) *
        (1 - THREE.MathUtils.smoothstep(p, 0.82, 0.9));

      const finale = THREE.MathUtils.smoothstep(
        p,
        0.92,
        1
      );

      const targetOpacity =
        0.16 + inspection * 0.12 + finale * 0.17;

      materialRef.current.opacity = THREE.MathUtils.damp(
        materialRef.current.opacity,
        targetOpacity,
        3,
        delta
      );
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        color="#d9c49c"
        size={0.014}
        sizeAttenuation
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}