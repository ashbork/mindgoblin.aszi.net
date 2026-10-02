import { SHEETS } from "./sheets";
import type { ScoredSheet } from "./types";

export const goblinMana = (sticker: string): number =>
  new Set(sticker.toUpperCase().match(/[AEIOUY]/g) ?? []).size;

const scored: ScoredSheet[] = SHEETS.map((sheet) => {
  const mana = sheet.stickers.map(goblinMana);
  return { ...sheet, mana, best: Math.max(...mana), total: mana.reduce((a, b) => a + b, 0) };
});

export const RANKED: readonly ScoredSheet[] = [...scored].sort(
  (a, b) => b.best - a.best || b.total - a.total || a.name.localeCompare(b.name),
);

export const BY_NAME: ReadonlyMap<string, ScoredSheet> = new Map(scored.map((s) => [s.name, s]));
