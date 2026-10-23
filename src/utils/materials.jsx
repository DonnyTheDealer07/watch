
import { COLORS } from "./watchConfig";

export function Metal({
  color = COLORS.steel,
  roughness = 0.24,
  ...props
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.9}
      roughness={roughness}
      {...props}
    />
  );
}

export function Disc({
  radius = 1,
  depth = 0.05,
  position = [0, 0, 0],
  color = COLORS.steel,
}) {
  return (
    <mesh
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, depth, 96]} />
      <Metal color={color} />
    </mesh>
  );
}

export function Ring({
  radius,
  tube = 0.025,
  position = [0, 0, 0],
  color = COLORS.champagne,
}) {
  return (
    <mesh position={position}>
      <torusGeometry args={[radius, tube, 12, 96]} />
      <Metal color={color} roughness={0.17} />
    </mesh>
  );
}
