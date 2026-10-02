import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Seat } from "./components/Seat";
import { DEAL_STEP_MS } from "./components/SheetCard";
import { SettingsDialog } from "./components/SettingsDialog";
import { BY_NAME } from "./goblin";
import { preload } from "./preload";
import { rollSheets } from "./roll";
import { findShout, louder, type Shout } from "./shouts";
import { PLAYER_COUNTS, loadSettings, saveSettings } from "./settings";
import type { DealtSheet, PlayerCount, Settings } from "./types";
import { useOfflineReady } from "./useOfflineReady";
import { useWakeLock } from "./useWakeLock";

interface Roll {
  id: number;
  sheets: DealtSheet[];
  dealOffset: number;
  deal: number;
}

let nextRollId = 0;
let nextDeal = 0;

const newRoll = (settings: Settings, dealOffset = 0, deal = nextDeal++): Roll => ({
  id: nextRollId++,
  deal,
  sheets: rollSheets(settings.pool, settings.perPlayer),
  dealOffset,
});

const newRolls = (settings: Settings, count: number, deal = nextDeal++) =>
  Array.from({ length: count }, (_, i) => newRoll(settings, i * settings.perPlayer, deal));

const rollKey = (s: Settings) => JSON.stringify([s.perPlayer, [...s.pool].sort()]);

export function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [rolls, setRolls] = useState<Roll[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const keyWhenOpened = useRef("");
  const latestShow = useRef(0);
  const pendingRolls = useRef<Roll[]>([]);

  const awake = useWakeLock();
  const offlineReady = useOfflineReady();
  useEffect(() => saveSettings(settings), [settings]);

  const topMana = useMemo(
    () => Math.max(0, ...settings.pool.map((name) => BY_NAME.get(name)?.best ?? 0)),
    [settings.pool],
  );

  // preload images for the pool
  useEffect(() => {
    for (const name of settings.pool) {
      const sheet = BY_NAME.get(name);
      if (sheet) preload(sheet.image);
    }
  }, [settings.pool]);

  const show = async (update: (current: Roll[]) => Roll[]) => {
    const token = ++latestShow.current;
    const next = update(pendingRolls.current);
    pendingRolls.current = next;
    await Promise.all(next.flatMap((r) => r.sheets.map((s) => preload(s.image))));
    if (token === latestShow.current) setRolls(next);
  };

  useEffect(() => {
    show(() => newRolls(settings, settings.playerCount));
  }, []);

  const rollAll = () => show(() => newRolls(settings, settings.playerCount));
  const rollSeat = (i: number) => show((r) => r.map((roll, j) => (j === i ? newRoll(settings) : roll)));

  const setPlayerCount = (playerCount: PlayerCount) => {
    if (playerCount === settings.playerCount) return;
    setSettings((s) => ({ ...s, playerCount }));
    show((r) => [...r.slice(0, 1), ...newRolls(settings, playerCount - 1)].slice(0, playerCount));
  };

  const toggleTableMode = () => setSettings((s) => ({ ...s, tableMode: !s.tableMode }));

  const openSettings = () => {
    keyWhenOpened.current = rollKey(settings);
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    if (rollKey(settings) !== keyWhenOpened.current) rollAll();
  };

  const pod = settings.playerCount > 1;

  const isJackpot = (s: DealtSheet) => s.best === topMana;
  const dealEnd = (roll: Roll) =>
    Math.max(...(rolls ?? []).filter((r) => r.deal === roll.deal).map((r) => r.dealOffset + r.sheets.length - 1));
  const afterDeal = (roll: Roll) => ({ "--hit-delay": `${dealEnd(roll) * DEAL_STEP_MS}ms` }) as CSSProperties;
  const topRoll = rolls?.filter((r) => r.sheets.some(isJackpot)).sort((a, b) => a.id - b.id)[0];
  const topStyle = topRoll ? afterDeal(topRoll) : undefined;

  // best shout at the table
  const tableShout = (rolls ?? []).reduce<{ shout: Shout; seat: number; roll: Roll } | null>((best, roll, seat) => {
    const shout = findShout(roll.sheets, topMana);
    return shout && louder(best?.shout ?? null, shout) === shout ? { shout, seat, roll } : best;
  }, null);

  const onKey = useRef<(e: KeyboardEvent) => void>(undefined);
  onKey.current = (e) => {
    if (settingsOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    const onControl = e.target instanceof Element && e.target.closest("button, a, input, select, textarea");
    
    if (e.key === " ") {
      if (onControl) return;
      e.preventDefault();
      rollAll();
    } else if (pod && e.key >= "1" && e.key <= String(settings.playerCount)) {
      rollSeat(Number(e.key) - 1);
    } else if (pod && e.key === "t") {
      toggleTableMode();
    } else if (e.key === "s") {
      e.preventDefault();
      openSettings();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey.current?.(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="topbar">
        <h1>mindgoblin</h1>
        <nav>
          <div className="modes" role="group" aria-label="Number of players">
            {PLAYER_COUNTS.map((n) => (
              <button key={n} type="button" aria-pressed={settings.playerCount === n} onClick={() => setPlayerCount(n)}>
                {n === 1 ? "solo" : "four"}
              </button>
            ))}
          </div>
          {pod && (
            <button
              type="button"
              role="switch"
              aria-checked={settings.tableMode}
              className="check"
              onClick={toggleTableMode}
              title="Turn the top seats upside down for a phone lying in the middle of the table"
            >
              [{settings.tableMode ? "x" : " "}] table
            </button>
          )}
          <button type="button" onClick={openSettings}>
            settings
          </button>
        </nav>
        <button type="button" className="roll" onClick={rollAll}>
          roll <kbd className="for-keys">space</kbd>
        </button>
      </header>

      <main className={pod ? `pod${settings.tableMode ? " table" : ""}` : "solo"}>
        {rolls === null ? (
          <p className="empty">dealing…</p>
        ) : (
          rolls.map((roll, i) => (
            <Seat
              key={i}
              seat={pod ? i : undefined}
              rollId={roll.id}
              sheets={roll.sheets}
              dealOffset={roll.dealOffset}
              topMana={topMana}
              onReroll={() => rollSeat(i)}
            />
          ))
        )}
      </main>

      <footer className="status">
        <span className="mode">{pod ? "FOUR" : "SOLO"}</span>
        <span className="pool">
          <span className="pool-info">
            pool {settings.pool.length} · {settings.perPlayer} each ·{" "}
          </span>
          <span key={topRoll ? `max-${topRoll.id}` : "top"} className={topRoll ? "top maxed" : "top"} style={topStyle}>
            max {topMana}r
          </span>
        </span>
        {tableShout && (
          <span
            key={`shout-${tableShout.roll.id}`}
            className={`status-shout shout-text-${tableShout.shout.tier}`}
            style={afterDeal(tableShout.roll)}
          >
            ★ {tableShout.shout.label}
            {pod && ` · seat ${tableShout.seat + 1}`}
          </span>
        )}
        {pod && settings.tableMode && <span className="for-touch">table</span>}
        <span className="spacer" />
        <span className="hints for-keys">
          <kbd>space</kbd> roll {pod && <><kbd>1-4</kbd> seat <kbd>t</kbd> table </>}<kbd>s</kbd> settings
        </span>
        <span className={offlineReady ? "ok" : "off"} title={offlineReady ? "Cached for offline use" : "Not cached for offline use yet"}>
          {offlineReady ? "●" : "○"}<span className="label"> {offlineReady ? "offline-ready" : "online-only"}</span>
        </span>
        <span className={awake ? "ok" : "off"} title={awake ? "Keeping the screen awake" : "The screen may sleep"}>
          {awake ? "☀" : "☾"}<span className="label"> {awake ? "awake" : "may sleep"}</span>
        </span>
      </footer>

      <SettingsDialog open={settingsOpen} settings={settings} onChange={setSettings} onClose={closeSettings} />
    </>
  );
}
