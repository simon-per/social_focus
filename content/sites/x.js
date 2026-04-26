(function initXShield(global) {
  const shield = global.__minimalistShield?.api;
  if (!shield) {
    return;
  }

  const { MODES } = shield;
  const PLACEHOLDER_ID = "ms-x-placeholder";

  const css = `
    html[data-ms-site="x"][data-ms-mode="shorts"] a[href="/i/videos"],
    html[data-ms-site="x"][data-ms-mode="feed"] a[href="/i/videos"],
    html[data-ms-site="x"][data-ms-mode="search"] a[href="/i/videos"],
    html[data-ms-site="x"][data-ms-mode="shorts"] a[href$="/i/videos"],
    html[data-ms-site="x"][data-ms-mode="feed"] a[href$="/i/videos"],
    html[data-ms-site="x"][data-ms-mode="search"] a[href$="/i/videos"] {
      display: none !important;
    }

    #${PLACEHOLDER_ID} {
      margin: 20px 16px;
      padding: 28px 24px;
      border-radius: 22px;
      background:
        radial-gradient(circle at top left, rgba(32, 86, 75, 0.18), transparent 45%),
        linear-gradient(180deg, rgba(16, 18, 22, 0.96), rgba(21, 23, 28, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f4f4f4;
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
    }

    #${PLACEHOLDER_ID} h2 {
      margin: 0 0 8px;
      font: 700 22px/1.15 Arial, sans-serif;
    }

    #${PLACEHOLDER_ID} p {
      margin: 0;
      font: 400 14px/1.55 Arial, sans-serif;
      color: rgba(255, 255, 255, 0.8);
    }
  `;

  function getRoute() {
    if (location.pathname === "/home") {
      return "home";
    }
    if (location.pathname === "/explore" || location.pathname.startsWith("/search")) {
      return "explore";
    }
    if (location.pathname.startsWith("/messages")) {
      return "messages";
    }
    if (location.pathname.startsWith("/notifications")) {
      return "notifications";
    }
    if (location.pathname.startsWith("/i/bookmarks") || location.pathname.startsWith("/bookmarks")) {
      return "bookmarks";
    }
    if (location.pathname.startsWith("/i/videos")) {
      return "videos";
    }
    return "other";
  }

  function setHiddenForSelectors(selectors, hidden, setNodeHidden) {
    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        setNodeHidden(node, hidden);
      }
    }
  }

  function togglePrimaryTimelines(hidden, setNodeHidden) {
    const selectors = [
      'div[data-testid="primaryColumn"] div[aria-label^="Timeline:"]',
      'div[data-testid="primaryColumn"] section[aria-labelledby]',
      'div[data-testid="primaryColumn"] div[data-testid="ScrollSnap-List"]'
    ];

    setHiddenForSelectors(selectors, hidden, setNodeHidden);
  }

  function toggleSidebarDiscovery(hidden, setNodeHidden) {
    const selectors = [
      'div[data-testid="sidebarColumn"] section',
      'div[data-testid="sidebarColumn"] div[aria-label^="Timeline:"]',
      'div[data-testid="sidebarColumn"] div[data-testid="trend"]'
    ];

    setHiddenForSelectors(selectors, hidden, setNodeHidden);
  }

  function toggleShortVideoEntryPoints(mode, setNodeHidden) {
    const selectors = [
      'a[href="/i/videos"]',
      'a[href$="/i/videos"]',
      'a[href*="/i/videos"]'
    ];

    const shouldHide = mode !== MODES.OFF;
    setHiddenForSelectors(selectors, shouldHide, setNodeHidden);
  }

  function ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder) {
    const shouldBlockHome = mode === MODES.FEED && route === "home";
    const shouldBlockSearch =
      mode === MODES.SEARCH && (route === "home" || route === "explore" || route === "videos");

    if (!shouldBlockHome && !shouldBlockSearch) {
      clearPlaceholder(PLACEHOLDER_ID);
      return;
    }

    const parent = document.querySelector('div[data-testid="primaryColumn"]');
    if (!parent) {
      return;
    }

    const title = mode === MODES.SEARCH ? "Search Only" : "Feed Block";
    const copy =
      route === "videos"
        ? "Video discovery is hidden here. Use search or direct profiles if you need something specific."
        : mode === MODES.SEARCH
          ? "Discovery surfaces are hidden. Use search, messages, bookmarks, or direct profile navigation."
          : "The main timeline is hidden. Search, messages, bookmarks, and direct navigation remain available.";

    upsertPlaceholder({
      id: PLACEHOLDER_ID,
      parent,
      title,
      copy
    });
  }

  shield.initSite({
    id: "x",
    css,
    apply({ mode, root, setNodeHidden, upsertPlaceholder, clearPlaceholder }) {
      const route = getRoute();
      root.dataset.msXRoute = route;

      toggleShortVideoEntryPoints(mode, setNodeHidden);

      const hideTimelines =
        (mode === MODES.FEED && route === "home") ||
        (mode === MODES.SEARCH && (route === "home" || route === "explore" || route === "videos"));

      togglePrimaryTimelines(hideTimelines, setNodeHidden);
      toggleSidebarDiscovery(mode === MODES.SEARCH, setNodeHidden);
      ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder);
    }
  });
})(globalThis);
