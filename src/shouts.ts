import { FINISH_BY_ID } from "./finishes";
import type { DealtSheet } from "./types";

export type ShoutTier = "rare" | "mythic" | "legendary";

export interface Shout {
  tier: ShoutTier;
  label: string;
  lastIndex: number;
}

const COUNT_WORDS = ["", "single", "double", "triple", "quadruple", "quintuple"];

// find the rarest combination in the sheets
export function findShout(sheets: readonly DealtSheet[], topMana: number): Shout | null {
  const treated = sheets.map((s, i) => [s, i] as const).filter(([s]) => s.finish);
  const lastIndex = treated.at(-1)?.[1] ?? 0;
  const ids = new Set(treated.map(([s]) => s.finish));
  // "triple holo" when they all match, "triple finish" otherwise
  const kind = ids.size === 1 ? FINISH_BY_ID.get([...ids][0]!)!.label.toLowerCase() : "finish";
  const count = (n: number) => COUNT_WORDS[n] ?? `${n}×`;

  if (treated.length >= 3 && treated.length === sheets.length) {
    return { tier: "legendary", label: `${count(treated.length)} ${kind}`, lastIndex };
  }
  const galaxyJackpot = sheets.findIndex((s) => s.finish === "galaxy" && s.best === topMana);
  if (galaxyJackpot >= 0) return { tier: "mythic", label: "galaxy jackpot", lastIndex: galaxyJackpot };
  if (treated.length >= 2) return { tier: "rare", label: `${count(treated.length)} ${kind}`, lastIndex };
  return null;
}

const RANK: Record<ShoutTier, number> = { rare: 1, mythic: 2, legendary: 3 };
export const louder = (a: Shout | null, b: Shout | null) => (!a ? b : !b ? a : RANK[b.tier] > RANK[a.tier] ? b : a);
