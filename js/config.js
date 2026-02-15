// === Game Configuration ===
const CONFIG = {
  // Grid
  COLS: 10,
  ROWS: 12,

  // Speeds (tiles per second)
  PLAYER_SPEED: 5,
  MONSTER_SPEED: 1.8,
  MONSTER_CHASE_SPEED: 2.8,
  DASH_MONSTER_SPEED: 4.0,        // Dash monster speed (2x normal)
  DASH_MONSTER_MOVE_INTERVAL: 2,  // Moves every 2 update cycles

  // Monster AI
  PATROL_CHANGE_DIR_INTERVAL: 2000, // ms
  CHASE_SIGHT_RANGE: 5, // tiles
  DEFAULT_LURE_RADIUS: 3, // tiles
  DEFAULT_EAT_DURATION: 3000, // ms

  // Donut effects
  DONUTS: {
    strawberry: {
      name: "イチゴ",
      lureRadiusMultiplier: 1.5,
      eatDurationMultiplier: 2,
      instantSleep: false,
      color: "#CC3377",
      highlight: "#FF69B4",
    },
  },

  // Donut lifetime (frames, ~5 seconds at 60fps)
  DONUT_LIFETIME: 300,

  // Reinforcement (spawn new monsters over time)
  REINFORCEMENT_INTERVAL: 15000, // ms between reinforcement spawns
  REINFORCEMENT_MAX_MONSTERS: 8, // Max monsters on field

  // Starting inventory
  STARTING_DONUTS: {
    strawberry: 12, // Increased from 9 for higher difficulty balance
  },

  // Tile types
  TILE: {
    FLOOR: 0,
    WALL: 1,
    PLAYER_START: 2,
    GOAL: 3,
    MONSTER_START: 4,
    DASH_MONSTER_START: 5, // New: dash monster spawn
  },

  // Colors
  COLORS: {
    BG: "#1a0a2e",
    FLOOR: "#F5E6C8",
    FLOOR_ALT: "#EDD9B5",
    WALL: "#C4935A",
    WALL_DARK: "#9E7040",
    WALL_LIGHT: "#D4A76A",
    GOAL: "#FF88AA",
    GRID_LINE: "rgba(0,0,0,0.06)",
  },
};

// === Level Data ===
// 0=floor, 1=wall, 2=player start, 3=goal, 4=monster, 5=dash monster
const LEVELS = [
  {
    name: "ステージ 1: パニック・エスケープ",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 1, 0, 1],
      [1, 4, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 4, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 4, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    donuts: { choco: 3, strawberry: 12, matcha: 3 },
  },
];
