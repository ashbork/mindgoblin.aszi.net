import { useEffect, useState } from "react";

/** keeps the screen on while the page is visible, so a phone left on the table doesn't lock */
export function useWakeLock(): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async () => {
      if (disposed || document.visibilityState !== "visible" || (lock && !lock.released)) return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (disposed) return void lock.release();
        setHeld(true);
        lock.addEventListener("release", () => setHeld(false));
      } catch {
        // whatevs
      }
    };

    // the browser drops the lock whenever the page is hidden, so take it again on return.
    // some browsers only grant it after a user gesture, so any tap retries too.
    acquire();
    document.addEventListener("visibilitychange", acquire);
    document.addEventListener("pointerdown", acquire);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      document.removeEventListener("pointerdown", acquire);
      lock?.release();
    };
  }, []);

  return held;
}
