
import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";

import Preloader from "./components/Preloader/Preloader";
import WatchExperience from "./sections/WatchExperience/WatchExperience";

import "./components/effects/HeavenlyReveal.css";
import "./components/effects/EntrancePolish.css";

const PRELOADER_EXIT_MS = 1100;
const HEAVENLY_REVEAL_MS = 4900;

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);
  const [revealFinished, setRevealFinished] = useState(false);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const startTimer = window.setTimeout(() => {
      setRevealStarted(true);
    }, PRELOADER_EXIT_MS);

    const finishTimer = window.setTimeout(() => {
      setRevealFinished(true);
    }, PRELOADER_EXIT_MS + HEAVENLY_REVEAL_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
    };
  }, [loaded]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    let frame;

    function animate(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const entranceComplete = loaded && revealFinished;

  useEffect(() => {
    if (entranceComplete) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const stopScroll = (event) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", stopScroll, {
      passive: false,
    });

    window.addEventListener("touchmove", stopScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("wheel", stopScroll);
      window.removeEventListener("touchmove", stopScroll);
    };
  }, [entranceComplete]);

  return (
    <div
      className={[
        "chronos-app",
        !revealFinished
          ? "chronos-arrival-active"
          : "chronos-arrival-complete",
        revealStarted
          ? "chronos-arrival-started"
          : "",
      ].join(" ")}
    >
      {!loaded && (
        <Preloader onComplete={handleLoaded} />
      )}

      <main>
        <WatchExperience ready={entranceComplete} />
      </main>

      {!revealFinished && (
        <div
          className={`heavenly-reveal ${
            revealStarted
              ? "heavenly-reveal--playing"
              : ""
          }`}
          aria-hidden="true"
        >
          <div className="heavenly-reveal__darkness" />

          <div className="heavenly-reveal__beam">
            <div className="heavenly-reveal__beam-core" />
            <div className="heavenly-reveal__beam-soft" />
          </div>

          <div className="heavenly-reveal__crown" />

          <div className="heavenly-reveal__particles">
            {Array.from({ length: 30 }, (_, index) => (
              <span
                key={index}
                style={{
                  "--particle-index": index,
                  "--particle-x": `${
                    ((index * 73) % 100) - 50
                  }%`,
                  "--particle-y": `${
                    (index * 47) % 100
                  }%`,
                  "--particle-delay": `${
                    (index % 11) * 0.17
                  }s`,
                  "--particle-duration": `${
                    2.5 + (index % 7) * 0.35
                  }s`,
                }}
              />
            ))}
          </div>

          <div className="heavenly-reveal__floor-glow" />

          <div className="heavenly-reveal__caption">
            <span className="heavenly-reveal__line" />
            <span>AN OBJECT BEYOND TIME</span>
            <span className="heavenly-reveal__line" />
          </div>
        </div>
      )}
    </div>
  );
}
