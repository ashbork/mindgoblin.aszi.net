import { useEffect, useRef } from "react";
import { RANKED } from "../goblin";
import { DEFAULT_POOL } from "../settings";
import type { Settings } from "../types";
import { ManaCount } from "./ManaCount";

interface Props {
  open: boolean;
  settings: Settings;
  onChange: (update: (s: Settings) => Settings) => void;
  onClose: () => void;
}

export function SettingsDialog({ open, settings, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  const inPool = new Set(settings.pool);
  const setPool = (pool: readonly string[]) => onChange((s) => ({ ...s, pool: [...pool] }));
  const toggle = (name: string, checked: boolean) =>
    onChange((s) => ({
      ...s,
      pool: RANKED.filter((r) => (r.name === name ? checked : s.pool.includes(r.name))).map((r) => r.name),
    }));

  const { pool, perPlayer } = settings;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
    >
      <form method="dialog">
        <header className="settings-head">
          <h2>settings</h2>
          <button type="submit">
            done <kbd>esc</kbd>
          </button>
        </header>

        <label className="field">
          sheets per player
          <input
            type="number"
            min={1}
            max={RANKED.length}
            value={perPlayer}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (value >= 1 && value <= RANKED.length) onChange((s) => ({ ...s, perPlayer: value }));
            }}
          />
        </label>

        <div className="pool-head">
          <h3>
            pool{" "}
            <span className="pool-count">
              {pool.length}/{RANKED.length}
            </span>
          </h3>
          <div className="pool-actions">
            <button type="button" onClick={() => setPool(DEFAULT_POOL)}>
              default
            </button>
            <button type="button" onClick={() => setPool(RANKED.map((s) => s.name))}>
              all
            </button>
            <button type="button" onClick={() => setPool([])}>
              none
            </button>
          </div>
        </div>
        {pool.length < perPlayer && (
          <p className="warning">
            {pool.length
              ? `! only ${pool.length} sheet${pool.length === 1 ? "" : "s"} in the pool, so players get fewer than ${perPlayer}`
              : "! the pool is empty — tick at least one sheet"}
          </p>
        )}

        <ul className="pool-list">
          {RANKED.map((sheet) => {
            const checked = inPool.has(sheet.name);
            return (
              <li key={sheet.name}>
                <label className={checked ? "checked" : undefined}>
                  <input type="checkbox" checked={checked} onChange={(e) => toggle(sheet.name, e.target.checked)} />
                  <span className="box" aria-hidden="true">
                    [{checked ? "x" : " "}]
                  </span>
                  <span className="pool-name">{sheet.name}</span>
                  <span className="pool-best" title={`best sticker: ${sheet.stickers[sheet.mana.indexOf(sheet.best)]}`}>
                    <ManaCount count={sheet.best} />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </form>
    </dialog>
  );
}
