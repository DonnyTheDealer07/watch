
import * as THREE from "three";

import {
  WATCH_PARTS,
  ROOT_X,
  ROOT_SCALE,
} from "./watchConfig";

export function smooth(start, end, value) {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  const t = THREE.MathUtils.clamp(
    (value - start) / (end - start),
    0,
    1
  );

  return t * t * (3 - 2 * t);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function damp(current, target, speed, delta) {
  return THREE.MathUtils.damp(
    current,
    target,
    speed,
    delta
  );
}

export function getPartReveal(part, progress) {
  const opening = smooth(
    part.start,
    part.end,
    progress
  );

  const closing =
    1 - smooth(0.84, 0.99, progress);

  return opening * closing;
}

export function getPartPosition(part, progress) {
  const reveal = getPartReveal(part, progress);

  return [
    part.base[0] + part.offset[0] * reveal,
    part.base[1] + part.offset[1] * reveal,
    part.base[2] + part.offset[2] * reveal,
  ];
}

export function getExplosion(progress) {
  return (
    smooth(0.25, 0.52, progress) *
    (1 - smooth(0.84, 0.99, progress))
  );
}

// The internal parts occupy a compact arrangement
// inside the assembled case.
//
// The plate and mechanisms are never toggled
// invisible. The solid dial naturally covers them.
const PACKED_LAYOUT = {
  movement: {
    position: [0, 0, 0.22],
    scale: 0.84,
  },

  mainspring: {
    position: [-0.29, 0.24, 0.31],
    scale: 0.76,
  },

  gears: {
    position: [0.01, -0.015, 0.33],
    scale: 0.72,
  },

  escapement: {
    position: [0.29, -0.27, 0.35],
    scale: 0.69,
  },

  balance: {
    position: [0.27, 0.28, 0.38],
    scale: 0.68,
  },
};

// Keep everything packed while the dial comes off.
// Only after the mechanism is revealed do we
// smoothly transition to full inspection geometry.
export function getPackingBlend(progress) {
  const opening = smooth(
    0.325,
    0.405,
    progress
  );

  const closing =
    1 - smooth(0.845, 0.97, progress);

  return opening * closing;
}

export function getPartScale(part, progress) {
  const packed = PACKED_LAYOUT[part.id];

  if (!packed) {
    return 1;
  }

  return lerp(
    packed.scale,
    1,
    getPackingBlend(progress)
  );
}

// Existing macro focus choreography.
const FOCUS_STOPS = [
  { id: "mainspring", p: 0.41 },
  { id: "gears", p: 0.55 },
  { id: "escapement", p: 0.69 },
  { id: "balance", p: 0.79 },
];

const TRANSITIONS = [
  [0.455, 0.495],
  [0.595, 0.635],
  [0.725, 0.765],
];

export function getFocusWeights(progress) {
  const p = THREE.MathUtils.clamp(
    progress,
    0,
    1
  );

  const enter = smooth(0.34, 0.395, p);
  const exit =
    1 - smooth(0.82, 0.865, p);

  const strength = enter * exit;

  const a = smooth(
    TRANSITIONS[0][0],
    TRANSITIONS[0][1],
    p
  );

  const b = smooth(
    TRANSITIONS[1][0],
    TRANSITIONS[1][1],
    p
  );

  const c = smooth(
    TRANSITIONS[2][0],
    TRANSITIONS[2][1],
    p
  );

  return {
    mainspring: strength * (1 - a),
    gears: strength * a * (1 - b),
    escapement: strength * b * (1 - c),
    balance: strength * c,
  };
}

// Existing offscreen staging for macro inspections.
// These offsets are preserved so the focused
// mechanism remains isolated from other parts.
const STAGING = {
  bracelet: {
    mainspring: [-3.2, -1.6, -1.4],
    gears: [-3.4, -1.8, -1.5],
    escapement: [-3.5, -1.9, -1.5],
    balance: [-3.4, -1.8, -1.5],
  },

  case: {
    mainspring: [-3.1, -1.25, -1.2],
    gears: [-3.1, -1.25, -1.2],
    escapement: [-3.1, -1.25, -1.2],
    balance: [-3.1, -1.25, -1.2],
  },

  movement: {
    mainspring: [-2.7, -1.5, -0.9],
    gears: [-2.7, -1.5, -0.9],
    escapement: [-2.7, -1.5, -0.9],
    balance: [-2.7, -1.5, -0.9],
  },

  dial: {
    mainspring: [-4.2, -0.6, 0.1],
    gears: [-4.2, -0.6, 0.1],
    escapement: [-4.2, -0.6, 0.1],
    balance: [-4.2, -0.6, 0.1],
  },

  hands: {
    mainspring: [-4.0, -1.4, 0.3],
    gears: [-4.0, -1.4, 0.3],
    escapement: [-4.0, -1.4, 0.3],
    balance: [-4.0, -1.4, 0.3],
  },

  crystal: {
    mainspring: [-4.2, 1.8, 0.1],
    gears: [-4.2, 1.8, 0.1],
    escapement: [-4.2, 1.8, 0.1],
    balance: [-4.2, 1.8, 0.1],
  },

  mainspring: {
    gears: [-3.2, 1.0, -0.7],
    escapement: [-3.3, 1.0, -0.7],
    balance: [-3.3, 1.0, -0.7],
  },

  gears: {
    mainspring: [3.1, -1.0, -0.8],
    escapement: [-3.0, -1.3, -0.8],
    balance: [-3.0, -1.3, -0.8],
  },

  escapement: {
    mainspring: [3.2, -1.4, -0.7],
    gears: [3.2, -1.4, -0.7],
    balance: [-3.1, -1.3, -0.7],
  },

  balance: {
    mainspring: [3.2, 1.5, -0.7],
    gears: [3.2, 1.5, -0.7],
    escapement: [3.2, 1.5, -0.7],
  },
};

export function getAnimatedPartPosition(
  part,
  progress
) {
  const packed = PACKED_LAYOUT[part.id];
  const exploded = getPartPosition(
    part,
    progress
  );

  let position;

  if (packed) {
    const blend = getPackingBlend(progress);

    position = [
      lerp(
        packed.position[0],
        exploded[0],
        blend
      ),
      lerp(
        packed.position[1],
        exploded[1],
        blend
      ),
      lerp(
        packed.position[2],
        exploded[2],
        blend
      ),
    ];
  } else {
    position = [...exploded];
  }

  const weights = getFocusWeights(progress);
  const stage = STAGING[part.id];

  if (!stage) {
    return position;
  }

  for (const focus of FOCUS_STOPS) {
    if (focus.id === part.id) {
      continue;
    }

    const offset = stage[focus.id];
    const weight = weights[focus.id] || 0;

    if (!offset || weight <= 0) {
      continue;
    }

    position[0] += offset[0] * weight;
    position[1] += offset[1] * weight;
    position[2] += offset[2] * weight;
  }

  return position;
}

// CameraRig already calls this function.
// By using the same animated position calculation,
// camera targeting stays synchronized with assembly.
export function getWorldPartPosition(
  id,
  progress,
  result = new THREE.Vector3()
) {
  if (id === "watch") {
    return result.set(ROOT_X, 0, 0.35);
  }

  const part = WATCH_PARTS.find(
    (item) => item.id === id
  );

  if (!part) {
    return result.set(ROOT_X, 0, 0.35);
  }

  const local = getAnimatedPartPosition(
    part,
    progress
  );

  return result.set(
    ROOT_X + local[0] * ROOT_SCALE,
    local[1] * ROOT_SCALE,
    local[2] * ROOT_SCALE
  );
}
