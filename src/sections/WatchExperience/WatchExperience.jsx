import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import WatchScene from "../../three/WatchScene";
import MechanicalAudio from "../../components/effects/MechanicalAudio";

import "./WatchExperience.css";
import "../../components/effects/MechanicalAudio.css";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    at: 0,
    number: "00",
    label: "THE LAST SECOND",
    title: "TIME",
    italic: "is alive.",
    description:
      "Beneath every second lies an extraordinary world of mechanical precision.",
  },
  {
    at: 0.12,
    number: "01",
    label: "THE DISASSEMBLY",
    title: "LOOK",
    italic: "closer.",
    description:
      "What appears to be a single object is an intricate collection of carefully engineered components.",
  },
  {
    at: 0.2,
    number: "02",
    label: "THE PROTECTION",
    title: "SAPPHIRE",
    italic: "crystal.",
    description:
      "A transparent, highly scratch-resistant shield protecting the watch's delicate inner mechanism.",
  },
  {
    at: 0.34,
    number: "03",
    label: "THE POWER SOURCE",
    title: "STORED",
    italic: "energy.",
    description:
      "The mainspring stores energy when wound, releasing it gradually to power the mechanical movement.",
  },
  {
    at: 0.48,
    number: "04",
    label: "THE TRANSMISSION",
    title: "MOTION",
    italic: "transferred.",
    description:
      "The gear train transmits mechanical energy through interconnected wheels and pinions, driving the hands and supplying the escapement.",
  },
  {
    at: 0.62,
    number: "05",
    label: "THE ESCAPEMENT",
    title: "CONTROL",
    italic: "the moment.",
    description:
      "The escapement releases energy in controlled increments and supplies impulses to sustain the balance wheel's motion.",
  },
  {
    at: 0.75,
    number: "06",
    label: "THE HEARTBEAT",
    title: "THE",
    italic: "balance.",
    description:
      "Together with its hairspring, the oscillating balance establishes the rhythm of mechanical timekeeping.",
  },
  {
    at: 0.86,
    number: "07",
    label: "THE REASSEMBLY",
    title: "EVERYTHING",
    italic: "returns.",
    description:
      "The movement closes. Each component returns to its place. Precision becomes whole again.",
  },
  {
    at: 0.97,
    number: "08",
    label: "CHRONOS / THE FINALE",
    title: "ONE",
    italic: "moment.",
    description:
      "A thousand details. One purpose. The extraordinary machinery behind the passage of time.",
  },
];

function getActiveChapter(progress) {
  let index = 0;

  for (let i = 0; i < CHAPTERS.length; i++) {
    if (progress >= CHAPTERS[i].at) {
      index = i;
    }
  }

  return index;
}

export default function WatchExperience({ ready }) {
  const sectionRef = useRef(null);
  const progressRef = useRef({ value: 0 });

  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!ready) return;

    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,

        onUpdate: (self) => {
          const p = self.progress;

          progressRef.current.value = p;

          const percent = Math.round(p * 100);

          setProgress((previous) =>
            previous === percent ? previous : percent
          );

          const index = getActiveChapter(p);

          setActiveIndex((previous) =>
            previous === index ? previous : index
          );
        },
      });
    }, section);

    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
      context.revert();
    };
  }, [ready]);

  const chapter = CHAPTERS[activeIndex];
  const isFinale = progress >= 97;

  const macroStrength =
    progress >= 34 && progress <= 84
      ? Math.min(
          1,
          (progress - 34) / 8,
          (84 - progress) / 8
        )
      : 0;

  const finaleStrength = Math.max(
    0,
    Math.min(1, (progress - 90) / 10)
  );

  return (
    <section
      ref={sectionRef}
      className="watch-experience"
      id="home"
    >
      <div
        className={`watch-stage ${
          isFinale ? "watch-stage--finale" : ""
        }`}
        style={{
          "--macro-strength": macroStrength,
          "--finale-strength": finaleStrength,
        }}
      >
        <div className="watch-ambient" />

        <div className="watch-cinematic-glow" />

        <div className="watch-canvas">
          <WatchScene progressRef={progressRef} />
        </div>

        <div className="watch-vignette" />

        <MechanicalAudio progressRef={progressRef} />

        <div className="watch-content">
          <div
            key={activeIndex}
            className="watch-chapter"
          >
            <div className="watch-eyebrow">
              <span className="watch-eyebrow-line" />
              {chapter.label}
            </div>

            <h1>
              <span>{chapter.title}</span>
              <em>{chapter.italic}</em>
            </h1>

            <p>{chapter.description}</p>
          </div>
        </div>

        <div
          className={`watch-finale-signature ${
            isFinale
              ? "watch-finale-signature--visible"
              : ""
          }`}
          aria-hidden={!isFinale}
        >
          <span className="watch-finale-rule" />

          <span className="watch-finale-brand">
            CHRONOS
          </span>

          <span className="watch-finale-tagline">
            THE LAST SECOND
          </span>
        </div>

        <div className="watch-progress">
          <div className="watch-progress-track">
            <div
              className="watch-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span>
            {String(progress).padStart(2, "0")}%
          </span>
        </div>
      </div>
    </section>
  );
}