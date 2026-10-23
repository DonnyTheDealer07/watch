
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { ROOT_X } from "../utils/watchConfig";

import {
  smooth,
  lerp,
  damp,
  getFocusWeights,
  getWorldPartPosition,
} from "../utils/animation";

const SHOTS = [
  {
    p: 0,
    target: "watch",
    distance: 8.1,
    fov: 35,
    offsetX: 0,
    angle: 0,
  },
  {
    p: 0.12,
    target: "watch",
    distance: 7.7,
    fov: 35,
    offsetX: 0,
    angle: 0,
  },
  {
    p: 0.22,
    target: "crystal",
    distance: 4.4,
    fov: 35,
    offsetX: 0.3,
    angle: 0.07,
  },
  {
    p: 0.3,
    target: "watch",
    distance: 6.4,
    fov: 35,
    offsetX: 0.1,
    angle: 0,
  },
  {
    p: 0.37,
    target: "mainspring",
    distance: 3.5,
    fov: 35,
    offsetX: 0.45,
    angle: -0.06,
  },
  {
    p: 0.41,
    target: "mainspring",
    distance: 2.9,
    fov: 32,
    offsetX: 0.55,
    angle: -0.06,
  },
  {
    p: 0.455,
    target: "mainspring",
    distance: 3.1,
    fov: 33,
    offsetX: 0.55,
    angle: -0.05,
  },
  {
    p: 0.495,
    target: "gears",
    distance: 3.7,
    fov: 35,
    offsetX: 0.45,
    angle: 0.06,
  },
  {
    p: 0.55,
    target: "gears",
    distance: 3.4,
    fov: 33,
    offsetX: 0.55,
    angle: 0.08,
  },
  {
    p: 0.595,
    target: "gears",
    distance: 3.6,
    fov: 34,
    offsetX: 0.5,
    angle: 0.06,
  },
  {
    p: 0.635,
    target: "escapement",
    distance: 3.2,
    fov: 34,
    offsetX: 0.5,
    angle: 0.07,
  },
  {
    p: 0.69,
    target: "escapement",
    distance: 2.9,
    fov: 32,
    offsetX: 0.55,
    angle: 0.08,
  },
  {
    p: 0.725,
    target: "escapement",
    distance: 3.2,
    fov: 34,
    offsetX: 0.5,
    angle: 0.06,
  },
  {
    p: 0.765,
    target: "balance",
    distance: 3.2,
    fov: 34,
    offsetX: 0.5,
    angle: -0.06,
  },
  {
    p: 0.79,
    target: "balance",
    distance: 2.9,
    fov: 32,
    offsetX: 0.55,
    angle: -0.08,
  },
  {
    p: 0.82,
    target: "balance",
    distance: 3.2,
    fov: 34,
    offsetX: 0.5,
    angle: -0.06,
  },
  {
    p: 0.87,
    target: "watch",
    distance: 7.4,
    fov: 35,
    offsetX: 0,
    angle: 0,
  },
  {
    p: 1,
    target: "watch",
    distance: 8.1,
    fov: 35,
    offsetX: 0,
    angle: 0,
  },
];

function getShotPair(progress) {
  const p = THREE.MathUtils.clamp(
    progress,
    0,
    1
  );

  for (let i = 0; i < SHOTS.length - 1; i++) {
    const from = SHOTS[i];
    const to = SHOTS[i + 1];

    if (p >= from.p && p <= to.p) {
      return {
        from,
        to,
        t: smooth(from.p, to.p, p),
      };
    }
  }

  return {
    from: SHOTS[SHOTS.length - 1],
    to: SHOTS[SHOTS.length - 1],
    t: 1,
  };
}

export default function CameraRig({
  progressRef,
}) {
  const { camera, size } = useThree();

  const currentProgress = useRef(0);

  const vectors = useMemo(
    () => ({
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      watch: new THREE.Vector3(),
      desiredPosition: new THREE.Vector3(),
      desiredLook: new THREE.Vector3(),
      currentLook: new THREE.Vector3(
        ROOT_X,
        0,
        0.35
      ),
    }),
    []
  );

  useFrame((state, delta) => {
    const requested =
      progressRef?.current?.value ?? 0;

    currentProgress.current = damp(
      currentProgress.current,
      requested,
      7,
      delta
    );

    const p = currentProgress.current;

    const { from, to, t } = getShotPair(p);

    getWorldPartPosition(
      from.target,
      p,
      vectors.from
    );

    getWorldPartPosition(
      to.target,
      p,
      vectors.to
    );

    vectors.focus
      .copy(vectors.from)
      .lerp(vectors.to, t);

    let distance = lerp(
      from.distance,
      to.distance,
      t
    );

    let fov = lerp(
      from.fov,
      to.fov,
      t
    );

    let offsetX = lerp(
      from.offsetX,
      to.offsetX,
      t
    );

    const angle = lerp(
      from.angle,
      to.angle,
      t
    );

    const mobile = size.width < 900;

    if (mobile) {
      distance *= 1.55;
      offsetX = 0;
      fov = Math.max(fov, 35);
    }

    // The selected component is positioned to
    // the right of the camera's optical center.
    // This leaves space for the chapter typography.
    vectors.desiredLook.set(
      vectors.focus.x - offsetX,
      vectors.focus.y,
      vectors.focus.z
    );

    // Orbit around the current focus without
    // crossing through the mechanism.
    const orbitX = Math.sin(angle) * distance;
    const orbitZ = Math.cos(angle) * distance;

    vectors.desiredPosition.set(
      vectors.focus.x + orbitX,
      vectors.focus.y + distance * 0.045,
      vectors.focus.z + orbitZ
    );

    // Avoid camera clipping during macro shots.
    const minimumDistance = mobile ? 4.5 : 2.65;

    const separation =
      vectors.desiredPosition.distanceTo(
        vectors.focus
      );

    if (separation < minimumDistance) {
      const direction = vectors.desiredPosition
        .clone()
        .sub(vectors.focus)
        .normalize();

      vectors.desiredPosition
        .copy(vectors.focus)
        .addScaledVector(
          direction,
          minimumDistance
        );
    }

    const alpha = 1 - Math.exp(-5 * delta);

    camera.position.lerp(
      vectors.desiredPosition,
      alpha
    );

    vectors.currentLook.lerp(
      vectors.desiredLook,
      alpha
    );

    camera.lookAt(vectors.currentLook);

    const nextFov = damp(
      camera.fov,
      fov,
      5,
      delta
    );

    if (Math.abs(camera.fov - nextFov) > 0.0001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
