(function initFacebookShield(global) {
  const shield = global.__minimalistShield?.api;
  if (!shield) {
    return;
  }

  const { MODES } = shield;
  const PLACEHOLDER_ID = "ms-facebook-placeholder";

  const css = `
    html[data-ms-site="facebook"][data-ms-mode="shorts"] a[href*="/reel/"],
    html[data-ms-site="facebook"][data-ms-mode="feed"] a[href*="/reel/"],
    html[data-ms-site="facebook"][data-ms-mode="search"] a[href*="/reel/"],
    html[data-ms-site="facebook"][data-ms-mode="shorts"] a[href*="/reels/"],
    html[data-ms-site="facebook"][data-ms-mode="feed"] a[href*="/reels/"],
    html[data-ms-site="facebook"][data-ms-mode="search"] a[href*="/reels/"] {
      display: none !important;
    }

    #${PLACEHOLDER_ID} {
      margin: 24px auto;
      max-width: 760px;
      padding: 30px 26px;
      border-radius: 24px;
      background:
        radial-gradient(circle at top left, rgba(53, 116, 208, 0.2), transparent 45%),
        linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(14, 20, 32, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f4f8ff;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.25);
    }

    #${PLACEHOLDER_ID} h2 {
      margin: 0 0 8px;
      font: 700 22px/1.15 Arial, sans-serif;
    }

    #${PLACEHOLDER_ID} p {
      margin: 0;
      font: 400 14px/1.55 Arial, sans-serif;
      color: rgba(244, 248, 255, 0.84);
    }
  `;

  function getRoute() {
    if (location.pathname === "/") {
      return "home";
    }
    if (location.pathname.startsWith("/reel") || location.pathname.startsWith("/watch")) {
      return "reels";
    }
    if (location.pathname.startsWith("/messages")) {
      return "messages";
    }
    return "other";
  }

  function getMainRoot() {
    return document.querySelector('div[role="main"]');
  }

  function toggleReelEntryPoints(mode, setNodeHidden) {
    const selectors = [
      'a[href*="/reel/"]',
      'a[href*="/reels/"]'
    ];

    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        setNodeHidden(node, mode !== MODES.OFF);
      }
    }
  }

  function toggleHomeFeed(mode, route, setNodeHidden) {
    const main = getMainRoot();
    if (!main) {
      return;
    }

    const shouldHideMain =
      (mode === MODES.FEED && route === "home") ||
      (mode === MODES.SEARCH && (route === "home" || route === "reels"));

    const children = Array.from(main.children).filter((node) => node.id !== PLACEHOLDER_ID);
    for (const child of children) {
      setNodeHidden(child, shouldHideMain);
    }
  }

  function ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder) {
    const shouldBlock =
      (mode === MODES.FEED && route === "home") ||
      (mode === MODES.SEARCH && (route === "home" || route === "reels"));

    if (!shouldBlock) {
      clearPlaceholder(PLACEHOLDER_ID);
      return;
    }

    const main = getMainRoot() || document.body;
    if (!main) {
      return;
    }

    upsertPlaceholder({
      id: PLACEHOLDER_ID,
      parent: main,
      title: mode === MODES.SEARCH ? "Search Only" : "Feed Block",
      copy:
        route === "reels"
          ? "Reels and discovery video are hidden here. Use search, messages, groups, or direct profile navigation instead."
          : mode === MODES.SEARCH
            ? "Facebook discovery surfaces are hidden. Use the native search bar and direct navigation when you need something specific."
            : "The Facebook home feed is hidden. Search and direct navigation remain available."
    });
  }

  shield.initSite({
    id: "facebook",
    css,
    apply({ mode, root, setNodeHidden, upsertPlaceholder, clearPlaceholder }) {
      const route = getRoute();
      root.dataset.msFacebookRoute = route;
      toggleReelEntryPoints(mode, setNodeHidden);
      toggleHomeFeed(mode, route, setNodeHidden);
      ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder);
    }
  });
})(globalThis);
