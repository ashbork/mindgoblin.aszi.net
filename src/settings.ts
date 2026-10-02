import { BY_NAME } from "./goblin";
import type { PlayerCount, Settings } from "./types";

const STORAGE_KEY = "stickerRoller.v1";
export const PLAYER_COUNTS: readonly PlayerCount[] = [1, 4];

export const DEFAULT_POOL: readonly string[] = [
  "Playable Delusionary Hydra",
  "Unsanctioned Ancient Juggler",
  "Unassuming Gelatinous Serpent",
  "Narrow-Minded Baloney Fireworks",
  "Eldrazi Guacamole Tightrope",
  "Phyrexian Midway Bamboozle",
  "Unglued Pea-Brained Dinosaur",
  "Ancestral Hot Dog Minotaur",
  "Misunderstood Trapeze Elf",
  "Trained Blessed Mind",
];

const defaults = (): Settings => ({
  playerCount: 1,
  tableMode: false,
  perPlayer: 3,
  pool: [...DEFAULT_POOL],
});

export function loadSettings(): Settings {
  const fallback = defaults();
  try {
    const saved: Partial<Settings> | null = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    if (!saved) return fallback;
    return {
      playerCount: PLAYER_COUNTS.includes(saved.playerCount!)
        ? saved.playerCount!
        : fallback.playerCount,
      tableMode:
        typeof saved.tableMode === "boolean"
          ? saved.tableMode
          : fallback.tableMode,
      perPlayer:
        Number.isInteger(saved.perPlayer) && saved.perPlayer! > 0
          ? saved.perPlayer!
          : fallback.perPlayer,
      pool: Array.isArray(saved.pool)
        ? saved.pool.filter((n) => BY_NAME.has(n))
        : fallback.pool,
    };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // whatevs
  }
}
