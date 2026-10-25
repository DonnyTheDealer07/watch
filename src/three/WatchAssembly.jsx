
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const plane = new THREE.Plane();
const intersection = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const rootWorldPosition = new THREE.Vector3();
const rootQuaternion = new THREE.Quaternion();
const rootScale = new THREE.Vector3();
const inverseQuaternion = new THREE.Quaternion();
const dragStartWorld = new THREE.Vector3();
const localDelta = new THREE.Vector3();

export default function WatchAssembly({
  progressRef,
  showroom = false,
  disassemble = false,
  reassembleVersion = 0,
  onDraggingChange,
  onPartSelect,
}) {
  const root = useRef(null);
  const groups = useRef({});
  const currentProgress = useRef(0);

  const { camera, gl } = useThree();

  const offsets = useRef({});
  const targets = useRef({});
  const dragging = useRef(null);

  const interactionRef = useRef({
    showroom,
    disassemble,
    onDraggingChange,
    onPartSelect,
  });

  interactionRef.current = {
    showroom,
    disassemble,
    onDraggingChange,
    onPartSelect,
  };

  useEffect(() => {
    for (const part of WATCH_PARTS) {
      targets.current[part.id] = new THREE.Vector3();
      offsets.current[part.id] = new THREE.Vector3();
    }
  }, []);

  useEffect(() => {
    if (!showroom) {
      dragging.current = null;

      for (const part of WATCH_PARTS) {
        targets.current[part.id]?.set(0, 0, 0);
      }

      onDraggingChange?.(false);
      onPartSelect?.(null);
    }
  }, [showroom, onDraggingChange, onPartSelect]);

  useEffect(() => {
    dragging.current = null;

    for (const part of WATCH_PARTS) {
      targets.current[part.id]?.set(0, 0, 0);
    }

    onDraggingChange?.(false);
    onPartSelect?.(null);
  }, [
    reassembleVersion,
    onDraggingChange,
    onPartSelect,
  ]);

  useEffect(() => {
    if (disassemble) return;

    if (dragging.current) {
      dragging.current = null;
      onDraggingChange?.(false);
    }
  }, [disassemble, onDraggingChange]);

  useEffect(() => {
    const element = gl.domElement;

    const getIntersection = (event, output) => {
      const bounds = element.getBoundingClientRect();

      pointer.set(
        ((event.clientX - bounds.left) /
          bounds.width) *
          2 -
          1,
        -(
          (event.clientY - bounds.top) /
          bounds.height
        ) *
          2 +
          1
      );

      raycaster.setFromCamera(pointer, camera);

      return raycaster.ray.intersectPlane(
        plane,
        output
      );
    };

    const onPointerMove = (event) => {
      const active = dragging.current;

      if (!active || !root.current) return;

      if (!getIntersection(event, intersection)) {
        return;
      }

      root.current.getWorldPosition(
        rootWorldPosition
      );

      root.current.getWorldQuaternion(
        rootQuaternion
      );

      root.current.getWorldScale(rootScale);

      inverseQuaternion
        .copy(rootQuaternion)
        .invert();

      localDelta
        .copy(intersection)
        .sub(active.startWorld)
        .applyQuaternion(inverseQuaternion);

      localDelta.set(
        localDelta.x / rootScale.x,
        localDelta.y / rootScale.y,
        localDelta.z / rootScale.z
      );

      targets.current[active.id]
        .copy(active.startOffset)
        .add(localDelta);

      targets.current[active.id].clamp(
        new THREE.Vector3(-5, -4, -3),
        new THREE.Vector3(5, 4, 5)
      );
    };

    const endDrag = () => {
      if (!dragging.current) return;

      const id = dragging.current.id;
      dragging.current = null;

      const offset = targets.current[id];

      // Magnetic snapping when a component
      // returns close to its original position.
      if (
        offset &&
        offset.length() < 0.35
      ) {
        offset.set(0, 0, 0);
      }

      interactionRef.current
        .onDraggingChange?.(false);
    };

    element.addEventListener(
      "pointermove",
      onPointerMove
    );

    window.addEventListener(
      "pointerup",
      endDrag
    );

    window.addEventListener(
      "pointercancel",
      endDrag
    );

    return () => {
      element.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerup",
        endDrag
      );

      window.removeEventListener(
        "pointercancel",
        endDrag
      );
    };
  }, [camera, gl]);

  const beginDrag = (event, id) => {
    const settings = interactionRef.current;

    if (!settings.showroom) return;

    event.stopPropagation();

    settings.onPartSelect?.(id);

    if (!settings.disassemble) return;
    if (!root.current) return;

    const group = groups.current[id];
    if (!group) return;

    // Disable camera orbiting while
    // the user moves a component.
    settings.onDraggingChange?.(true);

    root.current.updateWorldMatrix(
      true,
      true
    );

    camera.getWorldDirection(planeNormal);

    group.getWorldPosition(dragStartWorld);

    plane.setFromNormalAndCoplanarPoint(
      planeNormal,
      dragStartWorld
    );

    dragging.current = {
      id,
      startWorld: new THREE.Vector3(),
      startOffset:
        targets.current[id].clone(),
    };

    const bounds =
      gl.domElement.getBoundingClientRect();

    pointer.set(
      ((event.clientX - bounds.left) /
        bounds.width) *
        2 -
        1,
      -(
        (event.clientY - bounds.top) /
        bounds.height
      ) *
        2 +
        1
    );

    raycaster.setFromCamera(
      pointer,
      camera
    );

    if (
      raycaster.ray.intersectPlane(
        plane,
        dragging.current.startWorld
      ) === null
    ) {
      dragging.current.startWorld.copy(
        dragStartWorld
      );
    }

    gl.domElement.setPointerCapture?.(
      event.pointerId
    );
  };

  useFrame((state, delta) => {
    // IMPORTANT:
    // Lock the animation to the fully assembled
    // position while the showroom is active.
    //
    // Zooming must only affect the camera,
    // never the watch's component positions.

    const requested = showroom
      ? 1
      : progressRef?.current?.value ?? 0;

    currentProgress.current = showroom
      ? 1
      : damp(
          currentProgress.current,
          requested,
          7,
          delta
        );

    const progress = currentProgress.current;

    for (const part of WATCH_PARTS) {
      const group =
        groups.current[part.id];

      if (!group) continue;

      const position =
        getAnimatedPartPosition(
          part,
          progress
        );

      const scale =
        getPartScale(
          part,
          progress
        );

      if (!offsets.current[part.id]) {
        offsets.current[part.id] =
          new THREE.Vector3();
      }

      if (!targets.current[part.id]) {
        targets.current[part.id] =
          new THREE.Vector3();
      }

      const currentOffset =
        offsets.current[part.id];

      const targetOffset =
        targets.current[part.id];

      // Smooth movement when dragging,
      // releasing, or reassembling parts.
      const alpha =
        1 -
        Math.exp(
          -12 *
            Math.min(delta, 0.05)
        );

      currentOffset.lerp(
        targetOffset,
        alpha
      );

      group.position.set(
        position[0] +
          currentOffset.x,
        position[1] +
          currentOffset.y,
        position[2] +
          currentOffset.z
      );

      group.scale.setScalar(scale);
      group.visible = true;
    }
  });

  return (
    <group
      ref={root}
      position={[ROOT_X, 0, 0]}
      scale={ROOT_SCALE}
    >
      {WATCH_PARTS.map((part) => {
        const Component =
          COMPONENTS[part.id];

        if (!Component) return null;

        return (
          <group
            key={part.id}
            ref={(node) => {
              if (node) {
                groups.current[part.id] =
                  node;
              } else {
                delete groups.current[
                  part.id
                ];
              }
            }}
            position={getAnimatedPartPosition(
              part,
              0
            )}
            scale={getPartScale(
              part,
              0
            )}
            onPointerDown={(event) =>
              beginDrag(event, part.id)
            }
            onPointerOver={(event) => {
              if (!showroom) return;

              event.stopPropagation();

              gl.domElement.style.cursor =
                disassemble
                  ? "grab"
                  : "pointer";
            }}
            onPointerOut={() => {
              if (!dragging.current) {
                gl.domElement.style.cursor =
                  "";
              }
            }}
          >
            <Component />
          </group>
        );
      })}
    </group>
  );
}
