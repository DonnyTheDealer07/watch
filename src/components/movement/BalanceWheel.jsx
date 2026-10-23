import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { COLORS } from "../../utils/watchConfig";

import {
  Metal,
  Jewel,
  WatchScrew,
} from "./GearTrain";

const OSCILLATION_RATE = Math.PI * 3.5;

export default function BalanceWheel() {
  const wheelRef = useRef(null);
  const springRef = useRef(null);

  const springGeometry = useMemo(() => {
    const points = [];

    for (let i = 0; i <= 240; i++) {
      const t = i / 240;
      const angle = t * Math.PI * 9;
      const radius = 0.02 + t * 0.17;

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
      );
    }

    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      320,
      0.004,
      5,
      false
    );
  }, []);

  useEffect(() => {
    return () => springGeometry.dispose();
  }, [springGeometry]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const oscillation =
      Math.sin(time * OSCILLATION_RATE);

    if (wheelRef.current) {
      wheelRef.current.rotation.z =
        oscillation * 0.58;
    }

    if (springRef.current) {
      springRef.current.rotation.z =
        oscillation * 0.2;

      const breathing =
        1 + oscillation * 0.045;

      springRef.current.scale.set(
        breathing,
        breathing,
        1
      );
    }
  });

  return (
    <group>
      <group ref={wheelRef}>
        {/* Main balance rim */}
        <mesh>
          <torusGeometry
            args={[0.345, 0.026, 12, 96]}
          />
          <Metal
            color={COLORS.champagne}
            roughness={0.13}
          />
        </mesh>

        {/* Inner wheel rim */}
        <mesh>
          <torusGeometry
            args={[0.115, 0.012, 8, 64]}
          />
          <Metal color={COLORS.steel} />
        </mesh>

        {/* Six machined spokes */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            rotation={[
              0,
              0,
              (i / 6) * Math.PI * 2,
            ]}
          >
            <boxGeometry
              args={[0.023, 0.65, 0.018]}
            />
            <Metal color={COLORS.champagne} />
          </mesh>
        ))}

        {/* Rim adjustment weights */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;

          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.345,
                Math.sin(angle) * 0.345,
                0.02,
              ]}
            >
              <sphereGeometry
                args={[0.027, 12, 8]}
              />
              <Metal color={COLORS.steel} />
            </mesh>
          );
        })}

        <Jewel
          position={[0, 0, 0.04]}
          radius={0.038}
        />
      </group>

      {/* Animated hairspring */}
      <mesh
        ref={springRef}
        geometry={springGeometry}
        position={[0, 0, 0.11]}
      >
        <Metal
          color={COLORS.brightGold}
          roughness={0.17}
        />
      </mesh>

      {/* Stationary balance bridge */}
      <mesh
        position={[0, -0.42, -0.04]}
        rotation={[0, 0, -0.12]}
      >
        <boxGeometry
          args={[0.45, 0.07, 0.045]}
        />
        <Metal color={COLORS.darkSteel} />
      </mesh>

      <WatchScrew
        position={[-0.17, -0.4, -0.005]}
        radius={0.03}
      />
    </group>
  );
}