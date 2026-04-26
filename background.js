const DEFAULT_MODE = "off";
const MODE_KEY = "mode";
const THEME_KEY = "theme";
const DEFAULT_THEME = "auto";

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get([MODE_KEY, THEME_KEY]);
  if (typeof stored[MODE_KEY] !== "string") {
    await chrome.storage.local.set({ [MODE_KEY]: DEFAULT_MODE });
  }
  if (typeof stored[THEME_KEY] !== "string") {
    await chrome.storage.local.set({ [THEME_KEY]: DEFAULT_THEME });
  }
});
