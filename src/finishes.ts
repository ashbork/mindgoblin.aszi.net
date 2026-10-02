import type { Finish } from "./types";

/** rare finishes a dealt sheet can come with, checked independently for every card dealt. odds are "1 in N" per card; a full 4-player roll (12 cards) shows any finish about 11% of the time. each also has a look on the card itself: see the .fx-* and .miscut rules in style.css. */
export const FINISHES: readonly { id: Finish; label: string; symbol: string; oneIn: number }[] = [
  { id: "galaxy", label: "Galaxy foil", symbol: "✷", oneIn: 1500 },
  { id: "etched", label: "Etched foil", symbol: "≋", oneIn: 1000 },
  { id: "miscut", label: "Miscut", symbol: "✂", oneIn: 600 },
  { id: "holo", label: "Holo", symbol: "◈", oneIn: 500 },
  { id: "foil", label: "Foil", symbol: "✦", oneIn: 250 },
];

export const FINISH_BY_ID = new Map(FINISHES.map((f) => [f.id, f]));

/** picks a finish for one card, or null for a plain one  */
export function rollFinish(): Finish | null {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  let roll = buf[0] / 2 ** 32;
  // walk the finishes rarest first, so each owns its own slice of the odds.
  for (const finish of FINISHES) {
    if (roll < 1 / finish.oneIn) return finish.id;
    roll -= 1 / finish.oneIn;
  }
  return null;
}
