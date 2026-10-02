const cache = new Map<string, Promise<void>>();

/** resolves once the image is downloaded and decoded (or failed, so a bad URL never blocks a roll). */
export function preload(url: string): Promise<void> {
  let ready = cache.get(url);
  if (!ready) {
    const img = new Image();
    img.src = url;
    ready = img.decode().catch(() => {});
    cache.set(url, ready);
  }
  return ready;
}
