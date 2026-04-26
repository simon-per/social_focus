const MODE_KEY = "mode";
const THEME_KEY = "theme";
const MODES = ["off", "shorts", "feed", "search"];
const THEMES = ["auto", "light", "dark"];
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

const cards = Array.from(document.querySelectorAll("[data-mode]"));
const themeChips = Array.from(document.querySelectorAll("[data-theme]"));
const statusNode = document.getElementById("status");

function normalizeMode(value) {
  return MODES.includes(value) ? value : "off";
}

function normalizeTheme(value) {
  return THEMES.includes(value) ? value : "auto";
}

function labelForMode(mode) {
  switch (mode) {
    case "shorts":
      return "Shorts Only";
    case "feed":
      return "Feed Block";
    case "search":
      return "Search Only";
    default:
      return "Off";
  }
}

function labelForTheme(theme) {
  switch (theme) {
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default:
      return "Auto";
  }
}

function resolveDisplayedTheme(theme) {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return systemThemeQuery.matches ? "dark" : "light";
}

function renderActive(mode) {
  for (const card of cards) {
    card.classList.toggle("is-active", card.dataset.mode === mode);
  }

  const theme = normalizeTheme(document.documentElement.dataset.themePreference);
  statusNode.textContent = `${labelForMode(mode)} | ${labelForTheme(theme)}`;
}

function renderTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  const displayedTheme = resolveDisplayedTheme(nextTheme);

  document.documentElement.dataset.themePreference = nextTheme;

  for (const chip of themeChips) {
    chip.classList.toggle("is-active", chip.dataset.theme === displayedTheme);
  }

  const modeCard = document.querySelector(".mode-card.is-active");
  renderActive(normalizeMode(modeCard?.dataset.mode));
}

async function loadMode() {
  const result = await chrome.storage.local.get([MODE_KEY, THEME_KEY]);
  renderTheme(normalizeTheme(result[THEME_KEY]));
  renderActive(normalizeMode(result[MODE_KEY]));
}

async function setMode(mode) {
  const nextMode = normalizeMode(mode);
  await chrome.storage.local.set({ [MODE_KEY]: nextMode });
  renderActive(nextMode);
}

async function setTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  await chrome.storage.local.set({ [THEME_KEY]: nextTheme });
  renderTheme(nextTheme);
}

for (const card of cards) {
  card.addEventListener("click", () => {
    void setMode(card.dataset.mode);
  });
}

for (const chip of themeChips) {
  chip.addEventListener("click", () => {
    void setTheme(chip.dataset.theme);
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes[THEME_KEY]) {
    renderTheme(normalizeTheme(changes[THEME_KEY].newValue));
  }

  if (changes[MODE_KEY]) {
    renderActive(normalizeMode(changes[MODE_KEY].newValue));
  }
});

systemThemeQuery.addEventListener("change", () => {
  const currentTheme = normalizeTheme(document.documentElement.dataset.themePreference);
  if (currentTheme === "auto") {
    renderTheme(currentTheme);
  }
});

void loadMode();
