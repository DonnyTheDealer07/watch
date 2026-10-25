
import { useEffect, useRef } from "react";
import "./CinematicEnvironment.css";

const SCENES = [
  {
    at: 0,
    name: "Obsidian Void",
    base: [3, 5, 7],
    glow: [24, 20, 16],
    accent: [175, 139, 86],
    strength: 0.18,
  },
  {
    at: 0.12,
    name: "Engineering Chamber",
    base: [4, 16, 21],
    glow: [14, 53, 62],
    accent: [79, 151, 150],
    strength: 0.46,
  },
  {
    at: 0.34,
    name: "Amber Furnace",
    base: [25, 11, 7],
    glow: [105, 44, 15],
    accent: [225, 135, 58],
    strength: 0.65,
  },
  {
    at: 0.62,
    name: "White Laboratory",
    base: [146, 154, 153],
    glow: [210, 205, 190],
    accent: [125, 108, 86],
    strength: 0.22,
  },
  {
    at: 0.86,
    name: "Crimson Atelier",
    base: [25, 6, 12],
    glow: [85, 18, 32],
    accent: [185, 111, 80],
    strength: 0.46,
  },
  {
    at: 0.97,
    name: "Emerald Gallery",
    base: [2, 12, 11],
    glow: [8, 39, 32],
    accent: [187, 152, 91],
    strength: 0.34,
  },
];

const clamp = (value) =>
  Math.min(1, Math.max(0, value));

const lerp = (a, b, t) => a + (b - a) * t;

const ease = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const rgb = (values) =>
  `rgb(${values.map(Math.round).join(",")})`;

function sampleScene(progress) {
  const p = clamp(progress);

  let index = SCENES.findIndex(
    (scene) => scene.at > p
  );

  if (index === -1) index = SCENES.length;

  const a = SCENES[Math.max(0, index - 1)];
  const b = SCENES[
    Math.min(index, SCENES.length - 1)
  ];

  const range = b.at - a.at;

  const t = range <= 0
    ? 0
    : ease((p - a.at) / range);

  const color = (key) =>
    a[key].map((value, i) =>
      lerp(value, b[key][i], t)
    );

  return {
    base: color("base"),
    glow: color("glow"),
    accent: color("accent"),
    strength: lerp(a.strength, b.strength, t),
    name: t < 0.5 ? a.name : b.name,
  };
}

export default function CinematicEnvironment({
  progressRef,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame;
    let lastTime = 0;
    let displayedProgress =
      progressRef?.current?.value ?? 0;

    const update = (time) => {
      const dt = lastTime
        ? Math.min((time - lastTime) / 1000, 0.05)
        : 1 / 60;

      lastTime = time;

      const target = clamp(
        progressRef?.current?.value ?? 0
      );

      const alpha = 1 - Math.exp(-4.5 * dt);

      displayedProgress = lerp(
        displayedProgress,
        target,
        alpha
      );

      if (
        Math.abs(displayedProgress - target) <
        0.00001
      ) {
        displayedProgress = target;
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

    return () => cancelAnimationFrame(frame);
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
