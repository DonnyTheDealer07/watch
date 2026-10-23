import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { COLORS } from "../../utils/watchConfig";

import {
  Metal,
  Jewel,
  WatchScrew,
} from "./GearTrain";

export default function Mainspring() {
  const springRef = useRef(null);

  const springGeometry = useMemo(() => {
    const points = [];

    for (let i = 0; i <= 350; i++) {
      const t = i / 350;
      const angle = t * Math.PI * 13;
      const radius = 0.028 + t * 0.275;

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
      );
    }

    const curve = new THREE.CatmullRomCurve3(
      points
    );

    return new THREE.TubeGeometry(
      curve,
      450,
      0.006,
      6,
      false
    );
  }, []);

  useEffect(() => {
    return () => springGeometry.dispose();
  }, [springGeometry]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (springRef.current) {
      const winding =
        Math.sin(time * 0.55);

      springRef.current.rotation.z =
        winding * 0.055;

      const compression =
        1 - winding * 0.025;

      springRef.current.scale.set(
        compression,
        compression,
        1
      );
    }
  });

  return (
    <group>
      {/* Barrel base */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[0.36, 0.36, 0.085, 96]}
        />
        <Metal color={COLORS.darkSteel} />
      </mesh>

      {/* Machined barrel rim */}
      <mesh position={[0, 0, 0.06]}>
        <torusGeometry
          args={[0.345, 0.023, 12, 96]}
        />
        <Metal
          color={COLORS.champagne}
          roughness={0.14}
        />
      </mesh>

      {/* Dark recess */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.316, 96]} />
        <meshStandardMaterial
          color="#081518"
          metalness={0.72}
          roughness={0.3}
        />
      </mesh>

      {/* Animated spiral mainspring */}
      <mesh
        ref={springRef}
        geometry={springGeometry}
        position={[0, 0, 0.071]}
      >
        <Metal
          color={COLORS.brightGold}
          roughness={0.18}
        />
      </mesh>

      {/* Winding arbor */}
      <mesh
        position={[0, 0, 0.105]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.047, 0.047, 0.045, 32]}
        />
        <Metal color={COLORS.steel} />
      </mesh>

      <Jewel
        position={[0, 0, 0.135]}
        radius={0.025}
      />

      {Array.from({ length: 6 }, (_, i) => {
        const angle =
          (i / 6) * Math.PI * 2;

        return (
          <WatchScrew
            key={i}
            position={[
              Math.cos(angle) * 0.326,
              Math.sin(angle) * 0.326,
              0.078,
            ]}
            radius={0.016}
          />
        );
      })}
    </group>
  );
}