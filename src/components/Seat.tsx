import type { DealtSheet } from "../types";
import type { CSSProperties } from "react";
import { findShout } from "../shouts";
import { DEAL_STEP_MS, SheetCard } from "./SheetCard";

// the turn order runs clockwise
const GRID_AREAS = ["1 / 1", "1 / 2", "2 / 2", "2 / 1"];

interface Props {
  seat?: number;
  rollId: number;
  sheets: DealtSheet[];
  dealOffset: number;
  topMana: number;
  onReroll?: () => void;
}

export function Seat({
  seat,
  rollId,
  sheets,
  dealOffset,
  topMana,
  onReroll,
}: Props) {
  const inPod = seat !== undefined;
  const hit = sheets.findIndex((s) => s.best === topMana);
  const shout = findShout(sheets, topMana);
  const classes = [
    "seat",
    seat === 0 && "first",
    inPod && seat < 2 && "top",
    hit >= 0 && "hit",
    shout && `shout-${shout.tier}`,
  ]
    .filter(Boolean)
    .join(" ");
  const style: CSSProperties = inPod ? { gridArea: GRID_AREAS[seat] } : {};
  const vars = style as Record<string, string>;

  if (hit >= 0) vars["--hit-delay"] = `${(dealOffset + hit) * DEAL_STEP_MS}ms`;

  if (shout)
    vars["--shout-delay"] =
      `${(dealOffset + shout.lastIndex) * DEAL_STEP_MS}ms`;

  const shoutLabel = shout && (
    <span className={`shout shout-text-${shout.tier}`}>★ {shout.label}</span>
  );

  return (
    // keyed by roll, so every roll remounts the seat and replays the deal and jackpot animations.
    <section className={classes} style={style} key={rollId}>
      {inPod && (
        <header className="seat-head">
          <span className="seat-number">
            {String(seat + 1).padStart(2, "0")}
          </span>
          {seat === 0 && <span className="first-mark">← first</span>}
          {shoutLabel}
          <button
            type="button"
            className="reroll"
            onClick={onReroll}
            aria-label={`Re-roll seat ${seat + 1}`}
          >
            <span className="for-keys">[{seat + 1}] reroll</span>
            <span className="for-touch">↻</span>
          </button>
        </header>
      )}
      {!inPod && shoutLabel && <p className="solo-shout">{shoutLabel}</p>}
      {sheets.length ? (
        <div className="sheets">
          {sheets.map((sheet, i) => (
            <SheetCard
              key={sheet.name}
              sheet={sheet}
              dealIndex={dealOffset + i}
              jackpot={sheet.best === topMana}
            />
          ))}
        </div>
      ) : (
        <p className="empty">pool is empty — add sheets in settings</p>
      )}
    </section>
  );
}
