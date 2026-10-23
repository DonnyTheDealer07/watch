
import { COLORS } from "../../utils/watchConfig";

import {
  Metal,
  Jewel,
  WatchScrew,
} from "./GearTrain";

export { default as Mainspring } from "./Mainspring";
export { default as GearTrain } from "./GearTrain";
export { default as Escapement } from "./Escapement";
export { default as BalanceWheel } from "./BalanceWheel";

const BRIDGES = [
  {
    position: [-0.29, 0.28, 0.055],
    rotation: 0.48,
    width: 0.42,
  },
  {
    position: [0.26, 0.23, 0.055],
    rotation: -0.5,
    width: 0.4,
  },
  {
    position: [-0.22, -0.32, 0.055],
    rotation: -0.3,
    width: 0.43,
  },
  {
    position: [0.24, -0.35, 0.055],
    rotation: 0.3,
    width: 0.4,
  },
];

export function MovementPlate() {
  return (
    <group>
      {/* Solid movement foundation, facing +Z */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[0.74, 0.74, 0.07, 128]}
        />
        <Metal
          color={COLORS.petrol}
          roughness={0.35}
        />
      </mesh>

      {/* Circular machined grooves */}
      {[0.69, 0.61, 0.52, 0.4].map(
        (radius, index) => (
          <mesh
            key={radius}
            position={[0, 0, 0.039]}
          >
            <torusGeometry
              args={[radius, 0.003, 6, 128]}
            />
            <meshStandardMaterial
              color={
                index % 2 === 0
                  ? COLORS.champagne
                  : COLORS.darkSteel
              }
              metalness={0.95}
              roughness={0.28}
            />
          </mesh>
        )
      )}

      {/* Fine radial machining */}
      {Array.from({ length: 48 }, (_, i) => {
        const angle =
          (i / 48) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.65,
              Math.sin(angle) * 0.65,
              0.04,
            ]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry
              args={[0.065, 0.003, 0.002]}
            />
            <meshStandardMaterial
              color={COLORS.steel}
              metalness={0.9}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* Supporting movement bridges */}
      {BRIDGES.map((bridge, index) => (
        <group
          key={index}
          position={bridge.position}
          rotation={[
            0,
            0,
            bridge.rotation,
          ]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry
              args={[
                bridge.width,
                0.065,
                0.034,
              ]}
            />
            <Metal
              color={COLORS.steel}
              roughness={0.22}
            />
          </mesh>

          <WatchScrew
            position={[
              -bridge.width * 0.4,
              0,
              0.024,
            ]}
            radius={0.023}
          />

          <WatchScrew
            position={[
              bridge.width * 0.4,
              0,
              0.024,
            ]}
            radius={0.023}
          />
        </group>
      ))}

      {/* Jewel bearings */}
      {[
        [-0.39, 0.37],
        [0.37, 0.35],
        [-0.36, -0.39],
        [0.37, -0.36],
        [0.03, 0.12],
        [-0.05, -0.14],
      ].map(([x, y], index) => (
        <Jewel
          key={index}
          position={[x, y, 0.084]}
          radius={0.027}
        />
      ))}

      {/* Perimeter retaining screws */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle =
          (i / 8) * Math.PI * 2;

        return (
          <WatchScrew
            key={i}
            position={[
              Math.cos(angle) * 0.69,
              Math.sin(angle) * 0.69,
              0.048,
            ]}
            radius={0.022}
          />
        );
      })}
    </group>
  );
}

export default MovementPlate;
