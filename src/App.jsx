
import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";

import Preloader from "./components/Preloader/Preloader";
import WatchExperience from "./sections/WatchExperience/WatchExperience";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

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

  return (
    <>
      {!loaded && (
        <Preloader onComplete={handleLoaded} />
      )}

      <main>
        <WatchExperience ready={loaded} />
      </main>
    </>
  );
}
