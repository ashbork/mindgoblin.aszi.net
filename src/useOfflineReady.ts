import { useEffect, useState } from "react";

/** whether a service worker is active. the app shell is precached; sheet images are cached as they load. */
export function useOfflineReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    navigator.serviceWorker?.ready.then(() => !disposed && setReady(true));
    return () => {
      disposed = true;
    };
  }, []);

  return ready;
}
