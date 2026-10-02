/** An official Unfinity sticker sheet, as pulled from Scryfall. */
export interface Sheet {
  name: string;
  /** The sheet's three name stickers; together they spell the sheet's name. */
  stickers: string[];
  image: string;
  url: string;
}

/** A sheet with its goblin mana output worked out. */
export interface ScoredSheet extends Sheet {
  mana: number[];
  best: number;
  total: number;
}

/** a rare finish a dealt sheet can come with */
export type Finish = "foil" | "holo" | "etched" | "galaxy" | "miscut";

/** a sheet as dealt to a player in one roll */
export interface DealtSheet extends ScoredSheet {
  finish: Finish | null;
}

export type PlayerCount = 1 | 4;

export interface Settings {
  playerCount: PlayerCount;
  /** turn the top seats upside down, for a phone lying in the middle of the table */
  tableMode: boolean;
  perPlayer: number;
  /** names of the sheets players roll from */
  pool: string[];
}
