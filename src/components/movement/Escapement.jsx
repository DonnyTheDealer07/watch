import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { COLORS } from "../../utils/watchConfig";

import {
  Metal,
  Jewel,
  MechanicalGear,
  WatchScrew,
} from "./GearTrain";

const TICK_RATE = 3.5;
const ESCAPE_TEETH = 18;

export default function Escapement() {
  const leverRef = useRef(null);
  const escapeWheelRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const ticks = time * TICK_RATE;

    const wholeTicks = Math.floor(ticks);
    const fraction = ticks - wholeTicks;

    // A brief, smooth mechanical advance after
    // each release, followed by a locked pause.
    const release = Math.min(fraction / 0.16, 1);

    const eased =
      release * release * (3 - 2 * release);

    const wheelAngle =
      (wholeTicks + eased) *
      (Math.PI * 2 / ESCAPE_TEETH);

    if (escapeWheelRef.current) {
      escapeWheelRef.current.rotation.z = wheelAngle;
    }

    // Alternate the pallet fork between two
    // stable positions on successive ticks.
    const previousSide =
      wholeTicks % 2 === 0 ? -1 : 1;

    const nextSide = -previousSide;

    if (leverRef.current) {
      leverRef.current.rotation.z =
        (previousSide +
          (nextSide - previousSide) * eased) *
        0.18;
    }
  });

  return (
    <group>
      {/* Escape wheel — indexed rather than
          continuously rotating */}
      <group ref={escapeWheelRef}>
        <MechanicalGear
          radius={0.295}
          teeth={18}
          thickness={0.025}
          speed={0}
          color={COLORS.champagne}
        />
      </group>

      {/* Pallet fork */}
      <group
        ref={leverRef}
        position={[0.05, -0.36, 0.105]}
      >
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.038, 0.34, 0.025]} />
          <Metal color={COLORS.steel} />
        </mesh>

        <mesh position={[0, 0.33, 0]}>
          <boxGeometry args={[0.27, 0.038, 0.025]} />
          <Metal color={COLORS.steel} />
        </mesh>

        {/* Ruby pallet stones */}
        {[-0.12, 0.12].map((x) => (
          <mesh
            key={x}
            position={[x, 0.33, 0.021]}
          >
            <boxGeometry
              args={[0.065, 0.05, 0.018]}
            />
            <meshPhysicalMaterial
              color="#b91f44"
              metalness={0.18}
              roughness={0.08}
              clearcoat={1}
              clearcoatRoughness={0.03}
            />
          </mesh>
        ))}

        <Jewel
          position={[0, 0, 0.03]}
          radius={0.028}
        />
      </group>

      {/* Stationary movement bridge */}
      <mesh
        position={[0.05, -0.43, -0.025]}
        rotation={[0, 0, -0.12]}
      >
        <boxGeometry args={[0.38, 0.07, 0.04]} />
        <Metal color={COLORS.darkSteel} />
      </mesh>

      <WatchScrew
        position={[-0.11, -0.41, 0.008]}
        radius={0.027}
      />
    </group>
  );
}