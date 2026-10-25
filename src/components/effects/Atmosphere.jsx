
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 140;

const ATMOSPHERES = [
  { at: 0, color: "#d9c49c", opacity: 0.13 },
  { at: 0.12, color: "#76b8b6", opacity: 0.19 },
  { at: 0.34, color: "#ffb36b", opacity: 0.32 },
  { at: 0.62, color: "#9e9180", opacity: 0.11 },
  { at: 0.86, color: "#e2a17d", opacity: 0.2 },
  { at: 0.97, color: "#d9c49c", opacity: 0.29 },
];

function getAtmosphere(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);

  let index = ATMOSPHERES.findIndex(
    (scene) => scene.at > p
  );

  if (index === -1) index = ATMOSPHERES.length;

  const left = ATMOSPHERES[Math.max(0, index - 1)];
  const right =
    ATMOSPHERES[
      Math.min(index, ATMOSPHERES.length - 1)
    ];

  const start = Math.max(left.at, right.at - 0.055);

  const raw =
    left === right
      ? 0
      : THREE.MathUtils.clamp(
          (p - start) /
            Math.max(0.001, right.at - start),
          0,
          1
        );

  const t = raw * raw * (3 - 2 * raw);

  return {
    colorA: left.color,
    colorB: right.color,
    t,
    opacity: THREE.MathUtils.lerp(
      left.opacity,
      right.opacity,
      t
    ),
  };
}

export default function Atmosphere({ progressRef }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const currentProgress = useRef(0);

  const colorA = useMemo(() => new THREE.Color(), []);
  const colorB = useMemo(() => new THREE.Color(), []);
  const targetColor = useMemo(
    () => new THREE.Color(),
    []
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const index = i * 3;

      positions[index] = (Math.random() - 0.5) * 13;
      positions[index + 1] =
        (Math.random() - 0.5) * 8;
      positions[index + 2] =
        -2 + Math.random() * 4.5;
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
    const requested =
      progressRef?.current?.value ?? 0;

    currentProgress.current = THREE.MathUtils.damp(
      currentProgress.current,
      requested,
      3,
      delta
    );

    const p = currentProgress.current;
    const time = state.clock.elapsedTime;
    const atmosphere = getAtmosphere(p);

    if (pointsRef.current) {
      pointsRef.current.rotation.z =
        Math.sin(time * 0.055) * 0.025;

      pointsRef.current.position.y =
        Math.sin(time * 0.12) * 0.14;

      pointsRef.current.position.x =
        Math.sin(time * 0.07) * 0.09;
    }

    if (materialRef.current) {
      colorA.set(atmosphere.colorA);
      colorB.set(atmosphere.colorB);

      targetColor
        .copy(colorA)
        .lerp(colorB, atmosphere.t);

      materialRef.current.color.lerp(
        targetColor,
        1 - Math.exp(-3 * delta)
      );

      const macro =
        THREE.MathUtils.smoothstep(p, 0.32, 0.4) *
        (1 -
          THREE.MathUtils.smoothstep(
            p,
            0.82,
            0.88
          ));

      const targetOpacity =
        atmosphere.opacity + macro * 0.04;

      materialRef.current.opacity =
        THREE.MathUtils.damp(
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
        opacity={0.13}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
