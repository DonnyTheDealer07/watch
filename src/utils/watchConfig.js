
export const COLORS = {
  midnight: "#071316",
  petrol: "#102b30",
  petrolLight: "#20454a",
  champagne: "#d9c49c",
  brightGold: "#f0d9a5",
  brass: "#b69a65",
  steel: "#a6b9b7",
  darkSteel: "#53696b",
  ivory: "#f0eee8",
};

export const ROOT_X = 1.15;
export const ROOT_SCALE = 0.93;

// Horizontal alignment of the circular watch assembly.
// The bracelet stays at x = 0.
const FACE_CENTER_X = -0.035;

export const WATCH_PARTS = [
  {
    id: "bracelet",
    base: [0, 0, -0.34],
    offset: [0, -0.45, -1.5],
    start: 0.32,
    end: 0.52,
  },
  {
    id: "case",
    base: [FACE_CENTER_X, 0, 0],
    offset: [0, 0, -0.75],
    start: 0.34,
    end: 0.52,
  },
  {
    id: "movement",
    base: [FACE_CENTER_X, 0, 0.22],
    offset: [0, 0, -0.12],
    start: 0.36,
    end: 0.52,
  },
  {
    id: "mainspring",
    base: [FACE_CENTER_X - 0.32, 0.27, 0.34],
    offset: [-1.05, 0.58, 0.8],
    start: 0.32,
    end: 0.4,
  },
  {
    id: "gears",
    base: [FACE_CENTER_X, 0, 0.37],
    offset: [0.35, -0.1, 0.95],
    start: 0.38,
    end: 0.49,
  },
  {
    id: "escapement",
    base: [FACE_CENTER_X + 0.35, -0.28, 0.4],
    offset: [1.2, -0.48, 1.2],
    start: 0.45,
    end: 0.61,
  },
  {
    id: "balance",
    base: [FACE_CENTER_X + 0.35, 0.35, 0.44],
    offset: [1.05, 0.85, 1.35],
    start: 0.51,
    end: 0.69,
  },
  {
    id: "dial",
    base: [FACE_CENTER_X, 0, 0.51],
    offset: [-2.85, 0.05, 1.8],
    start: 0.25,
    end: 0.35,
  },
  {
    id: "hands",
    base: [FACE_CENTER_X, 0, 0.66],
    offset: [-2.4, -0.8, 2.55],
    start: 0.19,
    end: 0.28,
  },
  {
    id: "crystal",
    base: [FACE_CENTER_X, 0, 0.715],
    offset: [-1.8, 1.25, 3.2],
    start: 0.12,
    end: 0.21,
  },
];

export const CAMERA_CHAPTERS = [
  { p: 0, target: "watch", distance: 8.1, fov: 35 },
  { p: 0.12, target: "watch", distance: 7.7, fov: 35 },
  { p: 0.22, target: "crystal", distance: 4.9, fov: 36 },
  { p: 0.3, target: "watch", distance: 6.3, fov: 36 },
  { p: 0.37, target: "mainspring", distance: 4.25, fov: 36 },
  { p: 0.51, target: "gears", distance: 4.35, fov: 36 },
  { p: 0.65, target: "escapement", distance: 4.15, fov: 36 },
  { p: 0.78, target: "balance", distance: 4.2, fov: 36 },
  { p: 0.87, target: "watch", distance: 7.2, fov: 35 },
  { p: 1, target: "watch", distance: 8.1, fov: 35 },
];
