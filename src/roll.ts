import { rollFinish } from "./finishes";
import { BY_NAME } from "./goblin";
import type { DealtSheet } from "./types";

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

// roll distinct sheets for a player, each with a small chance of a rare finish
export function rollSheets(pool: readonly string[], count: number): DealtSheet[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).flatMap((name) => (BY_NAME.get(name) ? [{ ...BY_NAME.get(name)!, finish: rollFinish() }] : []));
}
