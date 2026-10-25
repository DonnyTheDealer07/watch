
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { ROOT_X } from "../utils/watchConfig";

import {
  smooth,
  lerp,
  damp,
  getWorldPartPosition,
} from "../utils/animation";

const SHOTS = [
  { p: 0, target: "watch", distance: 8.1, fov: 35, offsetX: 0, angle: 0.035 },
  { p: 0.07, target: "watch", distance: 7.9, fov: 35, offsetX: 0, angle: 0.13 },
  { p: 0.12, target: "watch", distance: 7.7, fov: 35, offsetX: 0, angle: 0.045 },
  { p: 0.22, target: "crystal", distance: 4.4, fov: 35, offsetX: 0.3, angle: 0.12 },
  { p: 0.3, target: "watch", distance: 6.4, fov: 35, offsetX: 0.1, angle: -0.035 },
  { p: 0.37, target: "mainspring", distance: 3.5, fov: 35, offsetX: 0.45, angle: -0.12 },
  { p: 0.41, target: "mainspring", distance: 2.9, fov: 32, offsetX: 0.55, angle: -0.085 },
  { p: 0.455, target: "mainspring", distance: 3.1, fov: 33, offsetX: 0.55, angle: -0.045 },
  { p: 0.495, target: "gears", distance: 3.7, fov: 35, offsetX: 0.45, angle: 0.08 },
  { p: 0.55, target: "gears", distance: 3.4, fov: 33, offsetX: 0.55, angle: 0.12 },
  { p: 0.595, target: "gears", distance: 3.6, fov: 34, offsetX: 0.5, angle: 0.07 },
  { p: 0.635, target: "escapement", distance: 3.2, fov: 34, offsetX: 0.5, angle: 0.1 },
  { p: 0.69, target: "escapement", distance: 2.9, fov: 32, offsetX: 0.55, angle: 0.13 },
  { p: 0.725, target: "escapement", distance: 3.2, fov: 34, offsetX: 0.5, angle: 0.07 },
  { p: 0.765, target: "balance", distance: 3.2, fov: 34, offsetX: 0.5, angle: -0.09 },
  { p: 0.79, target: "balance", distance: 2.9, fov: 32, offsetX: 0.55, angle: -0.13 },
  { p: 0.82, target: "balance", distance: 3.2, fov: 34, offsetX: 0.5, angle: -0.075 },
  { p: 0.87, target: "watch", distance: 7.4, fov: 35, offsetX: 0, angle: 0.045 },
  { p: 0.94, target: "watch", distance: 7.9, fov: 35, offsetX: 0, angle: 0.16 },
  { p: 1, target: "watch", distance: 8.1, fov: 35, offsetX: 0, angle: 0.22 },
];

function getShotPair(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);

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

  const last = SHOTS[SHOTS.length - 1];

  return { from: last, to: last, t: 1 };
}

export default function CameraRig({
  progressRef,
  showroom = false,
}) {
  const { camera, size } = useThree();

  const currentProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  const initialized = useRef(false);

  const vectors = useMemo(
    () => ({
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      desiredPosition: new THREE.Vector3(),
      desiredLook: new THREE.Vector3(),
      currentLook: new THREE.Vector3(
        ROOT_X,
        0,
        0.35
      ),
      direction: new THREE.Vector3(),
    }),
    []
  );

  useFrame((state, delta) => {
    if (showroom) return;

    const dt = Math.min(delta, 0.05);

    const requested = THREE.MathUtils.clamp(
      progressRef?.current?.value ?? 0,
      0,
      1
    );

    currentProgress.current = damp(
      currentProgress.current,
      requested,
      5.2,
      dt
    );

    const p = currentProgress.current;
    const time = state.clock.elapsedTime;
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

    let angle = lerp(
      from.angle,
      to.angle,
      t
    );

    const mobile = size.width < 900;
    const finale = smooth(0.89, 1, p);
    const opening = 1 - smooth(0.07, 0.15, p);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (mobile) {
      distance *= 1.55;
      offsetX = 0;
      fov = Math.max(fov, 35);
    }

    if (!mobile) {
      distance = lerp(
        distance,
        7.15,
        finale
      );

      offsetX = lerp(
        offsetX,
        0.72,
        finale
      );

      fov = lerp(fov, 34, finale);
      angle = lerp(angle, 0.17, finale);
    } else {
      angle = lerp(angle, 0.1, finale);
    }

    const heroWeight = reducedMotion
      ? 0
      : Math.max(opening, finale);

    if (!reducedMotion) {
      angle +=
        Math.sin(time * 0.32) *
        0.015 *
        heroWeight;

      angle +=
        Math.sin(time * 0.18) *
        0.008 *
        smooth(0.32, 0.42, p) *
        (1 - smooth(0.81, 0.88, p));
    }

    const pointerEnabled =
      !mobile && !reducedMotion;

    pointer.current.x = damp(
      pointer.current.x,
      pointerEnabled ? state.pointer.x : 0,
      2.5,
      dt
    );

    pointer.current.y = damp(
      pointer.current.y,
      pointerEnabled ? state.pointer.y : 0,
      2.5,
      dt
    );

    angle +=
      pointer.current.x *
      0.025 *
      heroWeight;

    const elevation =
      0.045 +
      (reducedMotion
        ? 0
        : Math.sin(time * 0.23) *
          0.01 *
          heroWeight) +
      pointer.current.y *
        0.012 *
        heroWeight;

    vectors.desiredLook.set(
      vectors.focus.x - offsetX,
      vectors.focus.y,
      vectors.focus.z
    );

    vectors.desiredPosition.set(
      vectors.focus.x +
        Math.sin(angle) * distance,
      vectors.focus.y +
        Math.sin(elevation) * distance,
      vectors.focus.z +
        Math.cos(angle) * distance
    );

    const minimumDistance =
      mobile ? 4.5 : 2.65;

    if (
      vectors.desiredPosition.distanceTo(
        vectors.focus
      ) < minimumDistance
    ) {
      vectors.direction
        .copy(vectors.desiredPosition)
        .sub(vectors.focus)
        .normalize();

      vectors.desiredPosition
        .copy(vectors.focus)
        .addScaledVector(
          vectors.direction,
          minimumDistance
        );
    }

    if (!initialized.current) {
      camera.position.copy(
        vectors.desiredPosition
      );

      vectors.currentLook.copy(
        vectors.desiredLook
      );

      initialized.current = true;
    } else {
      const positionAlpha =
        1 - Math.exp(-4.2 * dt);

      const lookAlpha =
        1 - Math.exp(-5.5 * dt);

      camera.position.lerp(
        vectors.desiredPosition,
        positionAlpha
      );

      vectors.currentLook.lerp(
        vectors.desiredLook,
        lookAlpha
      );
    }

    camera.lookAt(vectors.currentLook);

    const nextFov = damp(
      camera.fov,
      fov,
      4.5,
      dt
    );

    if (
      Math.abs(camera.fov - nextFov) >
      0.0001
    ) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
