
import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ROOT_X } from "../utils/watchConfig";

const TARGET = new THREE.Vector3(ROOT_X, 0, 0.25);
const HOME_OFFSET = new THREE.Vector3(2.1, 1.15, 6.7);

export default function ShowroomControls({
  resetView = 0,
  dragging = false,
}) {
  const controls = useRef(null);
  const { camera, size } = useThree();

  const moving = useRef(true);
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(TARGET.clone());

  useEffect(() => {
    const mobile = size.width < 900;

    desiredPosition.current
      .copy(TARGET)
      .addScaledVector(
        HOME_OFFSET,
        mobile ? 1.5 : 1
      );

    desiredTarget.current.copy(TARGET);
    moving.current = true;
  }, [resetView, size.width]);

  useFrame((_, delta) => {
    const control = controls.current;
    if (!control) return;

    if (!moving.current) {
      control.enabled = !dragging;
      return;
    }

    control.enabled = false;

    const alpha =
      1 - Math.exp(-4.8 * Math.min(delta, 0.05));

    camera.position.lerp(
      desiredPosition.current,
      alpha
    );

    control.target.lerp(
      desiredTarget.current,
      alpha
    );

    camera.fov = THREE.MathUtils.damp(
      camera.fov,
      35,
      5,
      delta
    );

    camera.updateProjectionMatrix();
    control.update();

    if (
      camera.position.distanceTo(
        desiredPosition.current
      ) < 0.012 &&
      control.target.distanceTo(
        desiredTarget.current
      ) < 0.012
    ) {
      moving.current = false;
      control.enabled = !dragging;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={!dragging && !moving.current}
      enableDamping
      dampingFactor={0.075}
      enablePan={false}
      enableRotate
      enableZoom
      rotateSpeed={0.65}
      zoomSpeed={0.7}
      minDistance={3.4}
      maxDistance={12}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI - 0.15}
      target={[ROOT_X, 0, 0.25]}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
    />
  );
}
