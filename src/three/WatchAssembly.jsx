
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import WatchBracelet from "../components/WatchBracelet";
import WatchCase from "../components/WatchCase";
import WatchDial from "../components/WatchDial";
import WatchHands from "../components/WatchHands";
import WatchCrystal from "../components/WatchCrystal";

import {
  MovementPlate,
  Mainspring,
  GearTrain,
  Escapement,
  BalanceWheel,
} from "../components/movement/Movement";

import {
  ROOT_X,
  ROOT_SCALE,
  WATCH_PARTS,
} from "../utils/watchConfig";

import {
  damp,
  getAnimatedPartPosition,
  getPartScale,
} from "../utils/animation";

const COMPONENTS = {
  bracelet: WatchBracelet,
  case: WatchCase,
  movement: MovementPlate,
  mainspring: Mainspring,
  gears: GearTrain,
  escapement: Escapement,
  balance: BalanceWheel,
  dial: WatchDial,
  hands: WatchHands,
  crystal: WatchCrystal,
};

export default function WatchAssembly({
  progressRef,
}) {
  const groups = useRef({});
  const currentProgress = useRef(0);

  useFrame((state, delta) => {
    const requested =
      progressRef?.current?.value ?? 0;

    currentProgress.current = damp(
      currentProgress.current,
      requested,
      7,
      delta
    );

    const progress = currentProgress.current;

    for (const part of WATCH_PARTS) {
      const group = groups.current[part.id];

      if (!group) continue;

      const position = getAnimatedPartPosition(
        part,
        progress
      );

      const scale = getPartScale(
        part,
        progress
      );

      group.position.set(
        position[0],
        position[1],
        position[2]
      );

      group.scale.setScalar(scale);

      // No abrupt show/hide logic.
      // Every part remains in the scene.
      group.visible = true;
    }
  });

  return (
    <group
      position={[ROOT_X, 0, 0]}
      scale={ROOT_SCALE}
    >
      {WATCH_PARTS.map((part) => {
        const Component = COMPONENTS[part.id];

        if (!Component) return null;

        return (
          <group
            key={part.id}
            ref={(node) => {
              if (node) {
                groups.current[part.id] = node;
              } else {
                delete groups.current[part.id];
              }
            }}
            position={getAnimatedPartPosition(
              part,
              0
            )}
            scale={getPartScale(part, 0)}
          >
            <Component />
          </group>
        );
      })}
    </group>
  );
}
