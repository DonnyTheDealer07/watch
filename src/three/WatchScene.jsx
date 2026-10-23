import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import WatchAssembly from "./WatchAssembly";
import CameraRig from "./CameraRig";

import Atmosphere from "../components/effects/Atmosphere";
import EnergyFlow from "../components/effects/EnergyFlow";
import FocusHalo from "../components/effects/FocusHalo";

function CinematicLighting({ progressRef }) {
  const keyLight = useRef(null);
  const rimLight = useRef(null);
  const goldLight = useRef(null);
  const haloLight = useRef(null);

  const progress = useRef(0);

  useFrame((state, delta) => {
    const requested =
      progressRef?.current?.value ?? 0;

    progress.current = THREE.MathUtils.damp(
      progress.current,
      requested,
      5,
      delta
    );

    const p = progress.current;
    const time = state.clock.elapsedTime;

    const macro =
      THREE.MathUtils.smoothstep(p, 0.32, 0.4) *
      (1 - THREE.MathUtils.smoothstep(p, 0.82, 0.88));

    const finale = THREE.MathUtils.smoothstep(
      p,
      0.9,
      1
    );

    if (keyLight.current) {
      keyLight.current.intensity =
        THREE.MathUtils.damp(
          keyLight.current.intensity,
          4.5 + macro * 0.7 + finale * 0.6,
          3,
          delta
        );

      keyLight.current.position.x =
        4 + Math.sin(time * 0.15) * 0.35;
    }

    if (rimLight.current) {
      rimLight.current.intensity =
        THREE.MathUtils.damp(
          rimLight.current.intensity,
          3 + macro * 0.65,
          3,
          delta
        );
    }

    if (goldLight.current) {
      goldLight.current.intensity =
        THREE.MathUtils.damp(
          goldLight.current.intensity,
          15 + macro * 3 + finale * 4,
          3,
          delta
        );
    }

    if (haloLight.current) {
      haloLight.current.intensity =
        THREE.MathUtils.damp(
          haloLight.current.intensity,
          macro * 3.5 + finale * 4.5,
          3,
          delta
        );
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        ref={keyLight}
        position={[4, 6, 7]}
        intensity={4.5}
        color="#fff0d7"
      />

      <directionalLight
        ref={rimLight}
        position={[-5, 2, 4]}
        intensity={3}
        color="#4c9b9d"
      />

      <pointLight
        ref={goldLight}
        position={[2, -3, 5]}
        intensity={15}
        distance={15}
        color="#d9c49c"
      />

      <pointLight
        ref={haloLight}
        position={[1.8, 0.2, 3.5]}
        intensity={0}
        distance={8}
        color="#f0d9a5"
      />
    </>
  );
}

export default function WatchScene({ progressRef }) {
  return (
    <Canvas
      camera={{
        position: [0.1, 0, 8.8],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <CinematicLighting progressRef={progressRef} />

      <Atmosphere progressRef={progressRef} />

      <FocusHalo progressRef={progressRef} />

      <EnergyFlow progressRef={progressRef} />

      <WatchAssembly progressRef={progressRef} />

      <CameraRig progressRef={progressRef} />
    </Canvas>
  );
}