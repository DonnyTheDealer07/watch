import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import WatchAssembly from "./WatchAssembly";
import CameraRig from "./CameraRig";
import ShowroomControls from "./ShowroomControls";

import Atmosphere from "../components/effects/Atmosphere";
import EnergyFlow from "../components/effects/EnergyFlow";
import FocusHalo from "../components/effects/FocusHalo";

const LIGHT_SCENES = [
  {
    at: 0,
    key: "#fff0d7",
    rim: "#4c9b9d",
    gold: "#d9c49c",
    halo: "#f0d9a5",
    keyPower: 4.5,
    rimPower: 3,
    goldPower: 15,
    haloPower: 0,
    ambient: 1.5,
  },
  {
    at: 0.12,
    key: "#d0e9e6",
    rim: "#267e92",
    gold: "#b9a17b",
    halo: "#58a9aa",
    keyPower: 4.2,
    rimPower: 4.2,
    goldPower: 12,
    haloPower: 1.4,
    ambient: 1.25,
  },
  {
    at: 0.34,
    key: "#ffcf98",
    rim: "#ba5c2b",
    gold: "#ffae59",
    halo: "#ff8c36",
    keyPower: 4.8,
    rimPower: 3.2,
    goldPower: 19,
    haloPower: 2.8,
    ambient: 1.3,
  },
  {
    at: 0.62,
    key: "#ffffff",
    rim: "#b8d3d4",
    gold: "#f5dfb8",
    halo: "#d7e4e4",
    keyPower: 4.8,
    rimPower: 3.3,
    goldPower: 12,
    haloPower: 1.2,
    ambient: 2,
  },
  {
    at: 0.86,
    key: "#ffe0be",
    rim: "#b33d55",
    gold: "#eab17c",
    halo: "#bc425a",
    keyPower: 4.6,
    rimPower: 3.6,
    goldPower: 17,
    haloPower: 2.2,
    ambient: 1.3,
  },
  {
    at: 0.97,
    key: "#fff0cf",
    rim: "#2e927c",
    gold: "#f3d49b",
    halo: "#d9b779",
    keyPower: 5.1,
    rimPower: 3.8,
    goldPower: 19,
    haloPower: 4.5,
    ambient: 1.4,
  },
];

const colorA = new THREE.Color();
const colorB = new THREE.Color();

function sampleLighting(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);

  let index = LIGHT_SCENES.findIndex(
    (scene) => scene.at > p
  );

  if (index === -1) index = LIGHT_SCENES.length;

  const left = LIGHT_SCENES[Math.max(0, index - 1)];
  const right =
    LIGHT_SCENES[
      Math.min(index, LIGHT_SCENES.length - 1)
    ];

  const start = Math.max(
    left.at,
    right.at - 0.055
  );

  const raw =
    left === right
      ? 0
      : THREE.MathUtils.clamp(
          (p - start) /
            Math.max(0.001, right.at - start),
          0,
          1
        );

  const t = raw * raw * (3 - 2 * raw);

  const mix = (property) =>
    THREE.MathUtils.lerp(
      left[property],
      right[property],
      t
    );

  const color = (property, target) => {
    colorA.set(left[property]);
    colorB.set(right[property]);

    target.copy(colorA).lerp(colorB, t);
  };

  return { mix, color };
}

function CinematicLighting({ progressRef }) {
  const ambientLight = useRef(null);
  const keyLight = useRef(null);
  const rimLight = useRef(null);
  const goldLight = useRef(null);
  const haloLight = useRef(null);

  const progress = useRef(0);

  const targetKey = useRef(new THREE.Color());
  const targetRim = useRef(new THREE.Color());
  const targetGold = useRef(new THREE.Color());
  const targetHalo = useRef(new THREE.Color());

  useFrame((state, delta) => {
    const requested =
      progressRef?.current?.value ?? 0;

    progress.current = THREE.MathUtils.damp(
      progress.current,
      requested,
      4,
      delta
    );

    const p = progress.current;
    const time = state.clock.elapsedTime;
    const lighting = sampleLighting(p);

    const macro =
      THREE.MathUtils.smoothstep(p, 0.32, 0.4) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.82,
          0.88
        ));

    const finale = THREE.MathUtils.smoothstep(
      p,
      0.9,
      1
    );

    const pulse =
      Math.sin(time * 1.8) * 0.08 * macro;

    lighting.color("key", targetKey.current);
    lighting.color("rim", targetRim.current);
    lighting.color("gold", targetGold.current);
    lighting.color("halo", targetHalo.current);

    if (ambientLight.current) {
      ambientLight.current.intensity =
        THREE.MathUtils.damp(
          ambientLight.current.intensity,
          lighting.mix("ambient"),
          3,
          delta
        );
    }

    if (keyLight.current) {
      keyLight.current.color.lerp(
        targetKey.current,
        1 - Math.exp(-3 * delta)
      );

      keyLight.current.intensity =
        THREE.MathUtils.damp(
          keyLight.current.intensity,
          lighting.mix("keyPower") +
            macro * 0.4 +
            finale * 0.4,
          3,
          delta
        );

      keyLight.current.position.x =
        4 + Math.sin(time * 0.15) * 0.35;
    }

    if (rimLight.current) {
      rimLight.current.color.lerp(
        targetRim.current,
        1 - Math.exp(-3 * delta)
      );

      rimLight.current.intensity =
        THREE.MathUtils.damp(
          rimLight.current.intensity,
          lighting.mix("rimPower"),
          3,
          delta
        );
    }

    if (goldLight.current) {
      goldLight.current.color.lerp(
        targetGold.current,
        1 - Math.exp(-3 * delta)
      );

      goldLight.current.intensity =
        THREE.MathUtils.damp(
          goldLight.current.intensity,
          lighting.mix("goldPower") +
            pulse +
            finale * 2,
          3,
          delta
        );
    }

    if (haloLight.current) {
      haloLight.current.color.lerp(
        targetHalo.current,
        1 - Math.exp(-3 * delta)
      );

      haloLight.current.intensity =
        THREE.MathUtils.damp(
          haloLight.current.intensity,
          lighting.mix("haloPower") +
            finale * 0.8,
          3,
          delta
        );
    }
  });

  return (
    <>
      <ambientLight
        ref={ambientLight}
        intensity={1.5}
      />

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

export default function WatchScene({
  progressRef,
  showroom = false,
  resetView = 0,
}) {
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

      <CameraRig
        progressRef={progressRef}
        showroom={showroom}
      />

      {showroom && (
        <ShowroomControls resetView={resetView} />
      )}
    </Canvas>
  );
}
