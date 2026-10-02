import type { CSSProperties } from "react";
import { FINISH_BY_ID } from "../finishes";
import type { DealtSheet } from "../types";
import { ManaCount } from "./ManaCount";

// delay after the previous card
export const DEAL_STEP_MS = 90;

// random-seeming tilts and offsets
const TILTS = [-1.4, 0.9, -0.5, 1.2, -1.1, 0.4, 0.7, -1.3, 1.0, -0.8, 1.5, -0.3];
const OFFSETS = [2, -1.5, 0.5, -1, 2.5, -2, 0, 1.5, -2.5, 1, -0.5, 2];

interface Props {
  sheet: DealtSheet;
  dealIndex: number;
  jackpot: boolean;
}

export function SheetCard({ sheet, dealIndex, jackpot }: Props) {
  const bestSticker = sheet.stickers[sheet.mana.indexOf(sheet.best)];
  const finish = sheet.finish && FINISH_BY_ID.get(sheet.finish);

  const style = {
    "--deal-delay": `${dealIndex * DEAL_STEP_MS}ms`,
    "--tilt": `${TILTS[dealIndex % TILTS.length]}deg`,
    "--offset": `${OFFSETS[dealIndex % OFFSETS.length]}px`,
  } as CSSProperties;

  return (
    <article className={`sheet${jackpot ? " jackpot" : ""}`} title={finish ? `${finish.label} ${sheet.name}` : sheet.name} style={style}>
      <a href={sheet.url} target="_blank" rel="noopener" className="sheet-image">
        <div className="flipper">
          {finish?.id === "miscut" ? (
            // it's the same card but they're never gonna see enough of it to notice ;)
            <div
              className="face miscut"
              role="img"
              aria-label={sheet.name}
              style={{ backgroundImage: `url("${sheet.image}")` }}
            />
          ) : (
            <img className="face" src={sheet.image} alt={sheet.name} />
          )}
          <div className="card-back" aria-hidden="true" />
        </div>
        {finish && finish.id !== "miscut" && <div className={`finish-fx fx-${finish.id}`} aria-hidden="true" />}
        {jackpot && <div className="glint" aria-hidden="true" />}
      </a>
      <p className="best-sticker">
        <span className="best-name">
          {finish && (
            <span className={`finish finish-${finish.id}`} title={`${finish.label} (1 in ${finish.oneIn})`}>
              {finish.symbol}{" "}
            </span>
          )}
          {bestSticker.toLowerCase()}
        </span>{" "}
        <ManaCount count={sheet.best} />
        {jackpot && <span className="max">max</span>}
      </p>
    </article>
  );
}
