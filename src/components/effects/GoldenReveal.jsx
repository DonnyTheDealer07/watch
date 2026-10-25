
import { useEffect, useRef } from "react";
import "./GoldenReveal.css";

const clamp = (value) =>
  Math.max(0, Math.min(1, value));

const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export default function GoldenReveal({ progressRef }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let displayedProgress =
      progressRef?.current?.value ?? 0;
    let previousTime = 0;

    const update = (time) => {
      const dt = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 1 / 60;

      previousTime = time;

      const target = clamp(
        progressRef?.current?.value ?? 0
      );

      displayedProgress +=
        (target - displayedProgress) *
        (1 - Math.exp(-5 * dt));

      const p = displayedProgress;

      const sweep = smoothstep(0.93, 0.985, p);
      const entrance = smoothstep(0.925, 0.94, p);
      const exit = 1 - smoothstep(0.982, 0.998, p);

      const intensity = entrance * exit;

      const x = -30 + sweep * 160;

      root.style.setProperty(
        "--reveal-x",
        `${x.toFixed(2)}%`
      );

      root.style.setProperty(
        "--reveal-opacity",
        intensity.toFixed(3)
      );

      root.style.setProperty(
        "--reveal-halo",
        smoothstep(0.94, 1, p).toFixed(3)
      );

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, [progressRef]);

  return (
    <div
      ref={rootRef}
      className="golden-reveal"
      aria-hidden="true"
    >
      <div className="golden-reveal__sweep" />
      <div className="golden-reveal__halo" />
    </div>
  );
}
