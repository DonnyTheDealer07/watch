
import * as THREE from "three";

const GOLD = "#d9c49c";
const LIGHT = "#f0dfb8";
const STEEL = "#6b8283";
const DARK = "#263d41";

function RoundedLink({
  width,
  height,
  depth,
  color,
  roughness = 0.3,
}) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(height * 0.2, width * 0.1);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  );
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  );
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  );
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return (
    <mesh castShadow receiveShadow>
      <extrudeGeometry
        args={[
          shape,
          {
            depth,
            bevelEnabled: true,
            bevelThickness: 0.008,
            bevelSize: 0.008,
            bevelSegments: 2,
            curveSegments: 6,
          },
        ]}
      />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={roughness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Link({ width, height = 0.145 }) {
  const outerWidth = width * 0.29;
  const centerWidth = width * 0.38;

  return (
    <group>
      {/* Dark articulation gap underneath */}
      <mesh position={[0, 0, -0.014]}>
        <boxGeometry args={[width * 0.96, height * 0.92, 0.045]} />
        <meshStandardMaterial
          color={DARK}
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Left and right brushed steel links */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[
            side * (centerWidth / 2 + outerWidth / 2 + 0.009),
            0,
            0.015,
          ]}
        >
          <RoundedLink
            width={outerWidth}
            height={height * 0.91}
            depth={0.048}
            color={STEEL}
            roughness={0.31}
          />
        </group>
      ))}

      {/* Polished central gold link */}
      <group position={[0, 0, 0.029]}>
        <RoundedLink
          width={centerWidth}
          height={height * 0.95}
          depth={0.051}
          color={GOLD}
          roughness={0.18}
        />
      </group>

      {/* Fine reflection on the center link */}
      <mesh position={[0, 0, 0.089]}>
        <boxGeometry
          args={[centerWidth * 0.62, height * 0.65, 0.002]}
        />
        <meshStandardMaterial
          color={LIGHT}
          metalness={0.95}
          roughness={0.17}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function Half({ direction }) {
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => {
        const t = i / 6;
        const width = THREE.MathUtils.lerp(0.83, 0.62, t);
        const y = direction * (0.77 + i * 0.15);
        const z = -0.03 - t * t * 0.16;

        return (
          <group
            key={i}
            position={[0, y, z]}
            rotation={[direction * t * 0.1, 0, 0]}
          >
            <Link width={width} />
          </group>
        );
      })}
    </group>
  );
}

export default function WatchBracelet() {
  return (
    <group>
      <Half direction={1} />
      <Half direction={-1} />
    </group>
  );
}
