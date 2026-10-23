
import { useEffect, useMemo } from "react";
import * as THREE from "three";

const GOLD = "#d9c49c";
const LIGHT_GOLD = "#f3e5c4";

const DIAL_FACE_Z = 0.105;
const DETAIL_Z = 0.119;

function useSunburstTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 1024;

    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const center = 512;

    const gradient = ctx.createRadialGradient(
      360,
      310,
      20,
      center,
      center,
      690
    );

    gradient.addColorStop(0, "#25565a");
    gradient.addColorStop(0.35, "#15393e");
    gradient.addColorStop(0.72, "#0c282d");
    gradient.addColorStop(1, "#06191e");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 1800; i++) {
      const angle = (i / 1800) * Math.PI * 2;

      ctx.beginPath();

      ctx.moveTo(
        center + Math.cos(angle) * 12,
        center + Math.sin(angle) * 12
      );

      ctx.lineTo(
        center + Math.cos(angle) * 520,
        center + Math.sin(angle) * 520
      );

      ctx.strokeStyle =
        i % 5 === 0
          ? "rgba(225,241,232,0.035)"
          : "rgba(225,241,232,0.012)";

      ctx.lineWidth = 0.55;
      ctx.stroke();
    }

    const result = new THREE.CanvasTexture(canvas);

    result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = 8;
    result.needsUpdate = true;

    return result;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}

function GoldMaterial({ roughness = 0.2 }) {
  return (
    <meshStandardMaterial
      color={GOLD}
      metalness={0.92}
      roughness={roughness}
    />
  );
}

function HourMarker({ index }) {
  const angle = (index / 12) * Math.PI * 2;

  const radius = 0.525;

  const x = Math.sin(angle) * radius;
  const y = Math.cos(angle) * radius;

  const major = index % 3 === 0;

  return (
    <group
      position={[x, y, DETAIL_Z]}
      rotation={[0, 0, -angle]}
    >
      <mesh>
        <boxGeometry
          args={[
            major ? 0.034 : 0.022,
            major ? 0.1 : 0.075,
            0.009,
          ]}
        />
        <GoldMaterial roughness={0.17} />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <boxGeometry
          args={[
            major ? 0.01 : 0.007,
            major ? 0.074 : 0.05,
            0.003,
          ]}
        />
        <meshStandardMaterial
          color={LIGHT_GOLD}
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
    </group>
  );
}

function DateWindow() {
  return (
    <group position={[0.355, 0, DETAIL_Z + 0.004]}>
      <mesh>
        <boxGeometry args={[0.132, 0.115, 0.008]} />
        <GoldMaterial roughness={0.2} />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[0.119, 0.101, 0.003]} />
        <meshStandardMaterial
          color="#ede9dd"
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Simple date numeral 1 */}
      <mesh position={[0, 0, 0.009]}>
        <boxGeometry args={[0.009, 0.055, 0.002]} />
        <meshBasicMaterial color="#172b30" />
      </mesh>
    </group>
  );
}

export default function WatchDial() {
  const texture = useSunburstTexture();

  return (
    <group>
      {/* Flat opaque backing. No cylinder. */}
      <mesh position={[0, 0, DIAL_FACE_Z - 0.012]}>
        <circleGeometry args={[0.639, 128]} />
        <meshBasicMaterial
          color="#07171b"
          side={THREE.DoubleSide}
          depthWrite
        />
      </mesh>

      {/* Actual deep-petrol sunburst dial */}
      <mesh
        position={[0, 0, DIAL_FACE_Z]}
        receiveShadow
      >
        <circleGeometry args={[0.632, 128]} />

        <meshBasicMaterial
          color="#ffffff"
          map={texture}
          side={THREE.DoubleSide}
          depthWrite
        />
      </mesh>

      {/* Restrained outer gold ring */}
      <mesh position={[0, 0, DIAL_FACE_Z + 0.006]}>
        <torusGeometry
          args={[0.615, 0.005, 8, 128]}
        />
        <GoldMaterial roughness={0.17} />
      </mesh>

      {/* Fine minute ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;

        const angle = (i / 60) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              Math.sin(angle) * 0.585,
              Math.cos(angle) * 0.585,
              DETAIL_Z,
            ]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[0.005, 0.024, 0.003]} />
            <GoldMaterial roughness={0.28} />
          </mesh>
        );
      })}

      {/* Twelve applied indices */}
      {Array.from({ length: 12 }, (_, i) => (
        <HourMarker key={i} index={i} />
      ))}

      {/* Minimal CHRONOS emblem */}
      <group position={[0, 0.25, DETAIL_Z + 0.004]}>
        <mesh>
          <torusGeometry args={[0.026, 0.004, 8, 48]} />
          <meshStandardMaterial
            color={LIGHT_GOLD}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        <mesh position={[0, -0.044, 0]}>
          <boxGeometry args={[0.12, 0.004, 0.003]} />
          <GoldMaterial roughness={0.17} />
        </mesh>
      </group>

      <DateWindow />

      {/* Central hand-mounting detail */}
      <mesh position={[0, 0, DETAIL_Z + 0.005]}>
        <circleGeometry args={[0.022, 32]} />
        <GoldMaterial roughness={0.15} />
      </mesh>
    </group>
  );
}
