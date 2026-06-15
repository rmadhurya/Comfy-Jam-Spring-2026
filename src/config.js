// ── GAME CONFIGURATION ────────────────────────────────────────────────────────
// Change your magic numbers here instead of hunting through files

export const FLOOR = {
  WIDTH:  80, // total width of beach (x axis)
  DEPTH:  40,   // total depth of beach (z axis)
};

export const PLAYER = {
  SPEED:        0.2,
  PICKUP_RANGE: 100.0,   // how close player needs to be to collect a worm
};

export const CAMERA = {
  HEIGHT:       30,
  OFFSET_Z:    -20,
};

export const WORM = {
  // How long a worm stays above ground (ms), randomized between min/max
  UP_TIME_MIN:   2000,
  UP_TIME_MAX:   5000,
  // How long a worm stays underground before re-emerging
  DOWN_TIME_MIN: 1000,
  DOWN_TIME_MAX: 4000,
  // Animation speed for popping up/down
  RISE_SPEED:    0.08,
  // How high the worm sticks out of the ground
  UP_HEIGHT:     0.6,
  // Worm size
  RADIUS:        0.3,
  HEIGHT:        1,
};

export const SPAWNER = {
  MAX_WORMS:      20,   // max worms alive at once
  SPAWN_INTERVAL: 800,  // ms between spawn checks
  // Beach spawn area (slightly inset from edges)
  SPAWN_X_MIN: -40,
  SPAWN_X_MAX:  40,
  SPAWN_Z_MIN:  -12,    // keep worms on the sand, not in water
  SPAWN_Z_MAX:   20,
};