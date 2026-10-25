
import { useEffect, useRef } from "react";
import "./CinematicEnvironment.css";

/*
 * CHRONOS — CINEMATIC ENVIRONMENT ENGINE
 *
 * Smooth color interpolation across all six scenes.
 * No hard scene switching.
 * No sudden atmospheric intensity changes.
 */

const SCENES = [
  {
    at: 0,
    name: "Obsidian Void",
    base: [5, 7, 10],
    glow: [65, 49, 32],
    accent: [214, 177, 119],
    strength: 0.32,
  },
  {
    at: 0.12,
    name: "Engineering Chamber",
    base: [5, 24, 32],
    glow: [20, 81, 90],
    accent: [91, 176, 173],
    strength: 0.48,
  },
  {
    at: 0.34,
    name: "Amber Furnace",
    base: [30, 12, 9],
    glow: [128, 53, 18],
    accent: [245, 155, 76],
    strength: 0.75,
  },
  {
    at: 0.62,
    name: "White Laboratory",
    base: [188, 194, 192],
    glow: [242, 234, 217],
    accent: [137, 111, 80],
    strength: 0.2,
  },
  {
    at: 0.86,
    name: "Crimson Atelier",
    base: [32, 8, 17],
    glow: [117, 29, 47],
    accent: [227, 163, 117],
    strength: 0.55,
  },
  {
    at: 0.97,
    name: "Emerald Gallery",
    base: [3, 24, 22],
    glow: [16, 86, 67],
    accent: [213, 185, 121],
    strength: 0.72,
  },
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (a, b, t) => a + (b - a) * t;

const smoothstep = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const rgb = (values) =>
  `rgb(${values.map((v) => Math.round(v)).join(",")})`;

/*
 * Interpolate across the entire distance between
 * scene anchors instead of the final 5.5%.
 */
function sampleScene(progress) {
  const p = clamp(progress);

  let index = SCENES.findIndex(
    (scene) => scene.at > p
  );

  if (index === -1) {
    index = SCENES.length;
  }

  const left = SCENES[Math.max(0, index - 1)];
  const right =
    SCENES[Math.min(index, SCENES.length - 1)];

  const distance = right.at - left.at;

  const raw =
    distance <= 0
      ? 0
      : clamp((p - left.at) / distance);

  const t = smoothstep(raw);

  const blendColor = (key) =>
    left[key].map((value, i) =>
      lerp(value, right[key][i], t)
    );

  return {
    base: blendColor("base"),
    glow: blendColor("glow"),
    accent: blendColor("accent"),
    strength: lerp(
      left.strength,
      right.strength,
      t
    ),
    name: t < 0.5 ? left.name : right.name,
  };
}

export default function CinematicEnvironment({
  progressRef,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let lastTime = 0;

    // Smoothed progress follows the real scroll position.
    let displayedProgress =
      progressRef?.current?.value ?? 0;

    const update = (time) => {
      const delta = lastTime
        ? Math.min((time - lastTime) / 1000, 0.05)
        : 1 / 60;

      lastTime = time;

      const targetProgress = clamp(
        progressRef?.current?.value ?? 0
      );

      /*
       * Frame-rate-independent damping.
       *
       * Larger values = faster response.
       * Smaller values = softer cinematic movement.
       */
      const smoothing = 1 - Math.exp(-5 * delta);

      displayedProgress = lerp(
        displayedProgress,
        targetProgress,
        smoothing
      );

      if (
        Math.abs(displayedProgress - targetProgress) <
        0.00001
      ) {
        displayedProgress = targetProgress;
      }

      const scene = sampleScene(displayedProgress);

      root.style.setProperty(
        "--env-base",
        rgb(scene.base)
      );

      root.style.setProperty(
        "--env-glow",
        rgb(scene.glow)
      );

      root.style.setProperty(
        "--env-accent",
        rgb(scene.accent)
      );

      root.style.setProperty(
        "--env-strength",
        scene.strength.toFixed(4)
      );

      root.dataset.environment = scene.name;

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [progressRef]);

  return (
    <div
      ref={rootRef}
      className="cinematic-environment"
      aria-hidden="true"
    >
      <div className="cinematic-environment__glow" />

      <div className="cinematic-environment__haze">
        <div className="cinematic-environment__cloud cloud-one" />
        <div className="cinematic-environment__cloud cloud-two" />
        <div className="cinematic-environment__cloud cloud-three" />
      </div>

      <div className="cinematic-environment__shafts">
        <div className="light-shaft shaft-one" />
        <div className="light-shaft shaft-two" />
      </div>

      <div className="cinematic-environment__grid" />
      <div className="cinematic-environment__grain" />
    </div>
  );
}
