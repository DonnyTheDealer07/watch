
import { useEffect, useState } from "react";
import "./Preloader.css";

export default function Preloader({ onComplete }) {
  const [phase, setPhase] = useState("loading");

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setPhase("exiting");
      onComplete?.();
    }, 2200);

    const finishTimer = window.setTimeout(() => {
      setPhase("finished");
    }, 3300);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  if (phase === "finished") {
    return null;
  }

  return (
    <div
      className={`preloader ${
        phase === "exiting" ? "preloader-exiting" : ""
      }`}
      aria-label="Loading CHRONOS"
    >
      <div className="preloader-inner">
        <div className="preloader-brand">
          CHRONOS<span>.</span>
        </div>

        <p>AN EXPLORATION OF TIME</p>

        <div className="preloader-track">
          <div className="preloader-progress" />
        </div>
      </div>

      <span className="preloader-bottom">
        EST. MMXXVI
      </span>
    </div>
  );
}
