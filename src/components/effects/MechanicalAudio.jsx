import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const AUDIO_FILES = {
  wristwatch:
    "/audio/arunangshubanerjee-fossil-wrist-watch-ticking-studio-quality-timepiece-sound-fx-326607.mp3",

  closeup:
    "/audio/mixkit-tick-tock-clock-close-up-1059.wav",

  mechanical:
    "/audio/spinopel-mechanical-clock-ticking-for-one-minute-364933.mp3",

  oldClock:
    "/audio/universfield-old-clock-ticking-352288.mp3",
};

const AUDIO_SETTINGS = {
  // Main, authentic wristwatch ticking.
  wristwatch: {
    volume: 0.38,
    fadeSpeed: 1.8,
  },

  // Slightly closer and more detailed ticking.
  closeup: {
    volume: 0.2,
    fadeSpeed: 1.5,
  },

  // Subtle movement atmosphere.
  mechanical: {
    volume: 0.15,
    fadeSpeed: 1.2,
  },

  // Deeper, dramatic clock sound.
  oldClock: {
    volume: 0.1,
    fadeSpeed: 1,
  },
};

const FADE_OUT_SPEED = 2.4;

const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

function smoothstep(edge0, edge1, value) {
  const t = clamp(
    (value - edge0) / (edge1 - edge0)
  );

  return t * t * (3 - 2 * t);
}

function getAudioMix(progress) {
  const p = clamp(progress);

  // Main wristwatch recording remains the
  // foundation of the entire experience.
  const wristwatch = 1;

  // Close-up ticking fades in as we enter
  // the exposed mechanical movement.
  const macroIn = smoothstep(0.3, 0.43, p);
  const macroOut =
    1 - smoothstep(0.8, 0.94, p);

  const macro = macroIn * macroOut;

  // The deeper mechanical recording is most
  // noticeable during the gear train and
  // escapement chapters.
  const movementIn = smoothstep(0.43, 0.54, p);
  const movementOut =
    1 - smoothstep(0.77, 0.88, p);

  const movement = movementIn * movementOut;

  // The old clock adds a very restrained
  // cinematic weight during the balance
  // wheel and final reassembly.
  const dramaticIn = smoothstep(0.7, 0.82, p);
  const dramaticOut =
    1 - smoothstep(0.94, 1, p);

  const dramatic = dramaticIn * dramaticOut;

  return {
    wristwatch:
      wristwatch *
      (1 - macro * 0.22),

    closeup: macro,

    mechanical: movement,

    oldClock: dramatic,
  };
}

function createAudioTrack(src) {
  const audio = new Audio(src);

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.muted = false;

  return audio;
}

export default function MechanicalAudio({
  progressRef,
}) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tracksRef = useRef(null);
  const frameRef = useRef(null);
  const enabledRef = useRef(false);
  const startingRef = useRef(false);
  const sessionRef = useRef(0);
  const lastFrameRef = useRef(null);

  const currentVolumesRef = useRef({
    wristwatch: 0,
    closeup: 0,
    mechanical: 0,
    oldClock: 0,
  });

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    lastFrameRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    sessionRef.current += 1;

    enabledRef.current = false;
    startingRef.current = false;

    stopFrame();

    const tracks = tracksRef.current;

    if (tracks) {
      Object.values(tracks).forEach((audio) => {
        audio.pause();
        audio.volume = 0;
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      });
    }

    tracksRef.current = null;

    currentVolumesRef.current = {
      wristwatch: 0,
      closeup: 0,
      mechanical: 0,
      oldClock: 0,
    };
  }, [stopFrame]);

  const updateAudio = useCallback(
    (timestamp) => {
      if (!enabledRef.current) {
        frameRef.current = null;
        return;
      }

      const tracks = tracksRef.current;

      if (!tracks) {
        frameRef.current = null;
        return;
      }

      const previousTimestamp =
        lastFrameRef.current ?? timestamp;

      const delta = clamp(
        (timestamp - previousTimestamp) / 1000,
        0,
        0.05
      );

      lastFrameRef.current = timestamp;

      const progress =
        progressRef?.current?.value ?? 0;

      const mix = getAudioMix(progress);

      const isPageVisible =
        document.visibilityState === "visible";

      Object.entries(tracks).forEach(
        ([name, audio]) => {
          const settings = AUDIO_SETTINGS[name];

          if (!settings) return;

          const targetVolume = isPageVisible
            ? settings.volume * (mix[name] ?? 0)
            : 0;

          const current =
            currentVolumesRef.current[name] ?? 0;

          const fadeSpeed =
            targetVolume < current
              ? FADE_OUT_SPEED
              : settings.fadeSpeed;

          const blend =
            1 - Math.exp(-fadeSpeed * delta);

          const nextVolume =
            current +
            (targetVolume - current) * blend;

          currentVolumesRef.current[name] =
            nextVolume;

          audio.volume = clamp(nextVolume);
        }
      );

      frameRef.current =
        requestAnimationFrame(updateAudio);
    },
    [progressRef]
  );

  const startAudio = useCallback(async () => {
    if (enabledRef.current || startingRef.current) {
      return;
    }

    startingRef.current = true;
    setLoading(true);
    setError("");

    const session = ++sessionRef.current;

    const tracks = Object.fromEntries(
      Object.entries(AUDIO_FILES).map(
        ([name, src]) => [
          name,
          createAudioTrack(src),
        ]
      )
    );

    tracksRef.current = tracks;

    try {
      // The main wristwatch track is essential.
      // Start it directly from the button click
      // so browser autoplay restrictions allow it.
      await tracks.wristwatch.play();

      if (session !== sessionRef.current) {
        return;
      }

      // Supporting recordings are optional.
      // If one fails, the primary watch still
      // plays normally.
      const supportingTracks = [
        tracks.closeup,
        tracks.mechanical,
        tracks.oldClock,
      ];

      supportingTracks.forEach((audio) => {
        audio.play().catch((playError) => {
          console.warn(
            "CHRONOS: Supporting audio unavailable:",
            playError
          );
        });
      });

      enabledRef.current = true;
      startingRef.current = false;

      setEnabled(true);
      setLoading(false);

      lastFrameRef.current = null;

      frameRef.current =
        requestAnimationFrame(updateAudio);
    } catch (playError) {
      if (session !== sessionRef.current) {
        return;
      }

      console.error(
        "CHRONOS: Unable to start watch audio:",
        playError
      );

      stopAudio();

      setEnabled(false);
      setLoading(false);
      setError(
        "Unable to play audio. Check that the files exist in public/audio."
      );
    }
  }, [stopAudio, updateAudio]);

  const toggleAudio = useCallback(() => {
    if (enabledRef.current || startingRef.current) {
      stopAudio();

      setEnabled(false);
      setLoading(false);
      setError("");

      return;
    }

    void startAudio();
  }, [startAudio, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return (
    <>
      <button
        type="button"
        className={`chronos-audio-toggle ${
          enabled
            ? "chronos-audio-toggle--active"
            : ""
        }`}
        onClick={toggleAudio}
        aria-label={
          enabled
            ? "Mute mechanical watch audio"
            : loading
              ? "Cancel loading watch audio"
              : "Enable mechanical watch audio"
        }
        aria-pressed={enabled}
        aria-busy={loading}
        title={
          enabled
            ? "Mute sound"
            : loading
              ? "Loading audio"
              : "Enable sound"
        }
      >
        <span
          className="chronos-audio-toggle__icon"
          aria-hidden="true"
        >
          {enabled ? (
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="m16 9 5 6" />
              <path d="m21 9-5 6" />
            </svg>
          )}
        </span>

        <span className="chronos-audio-toggle__text">
          {loading
            ? "LOADING"
            : `SOUND ${enabled ? "ON" : "OFF"}`}
        </span>

        <span
          className={`chronos-audio-toggle__indicator ${
            enabled
              ? "chronos-audio-toggle__indicator--active"
              : ""
          }`}
        />
      </button>

      {error && (
        <div
          role="alert"
          style={{
            position: "absolute",
            zIndex: 21,
            top: "90px",
            right: "6%",
            maxWidth: "260px",
            padding: "10px 14px",
            color: "#f0d9a5",
            background: "rgba(7,19,22,0.94)",
            border:
              "1px solid rgba(217,196,156,0.35)",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}