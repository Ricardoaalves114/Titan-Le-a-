// Standalone replacement for the window.storage API (only available inside
// Claude.ai artifacts). Here we back it with the browser's localStorage, so
// the app works the same way once published on GitHub Pages.
//
// IMPORTANT: localStorage is per-browser, per-device. Data entered here does
// NOT sync between different coaches or different devices — each person who
// opens the site has their own local copy. See README.md for how to upgrade
// this to a real shared/cloud database later.

const PREFIX = "titan-leca:";

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) throw new Error(`key not found: ${key}`);
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      const existed = localStorage.getItem(PREFIX + key) !== null;
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + prefix))
        .map((k) => k.slice(PREFIX.length));
      return { keys, prefix, shared: false };
    },
  };
}
