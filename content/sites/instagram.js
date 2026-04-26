(function initInstagramShield(global) {
  const shield = global.__minimalistShield?.api;
  if (!shield) {
    return;
  }

  const { MODES } = shield;
  const PLACEHOLDER_ID = "ms-instagram-placeholder";

  const css = `
    html[data-ms-site="instagram"][data-ms-mode="shorts"] a[href="/reels/"],
    html[data-ms-site="instagram"][data-ms-mode="feed"] a[href="/reels/"],
    html[data-ms-site="instagram"][data-ms-mode="search"] a[href="/reels/"],
    html[data-ms-site="instagram"][data-ms-mode="shorts"] a[href^="/reel/"],
    html[data-ms-site="instagram"][data-ms-mode="feed"] a[href^="/reel/"],
    html[data-ms-site="instagram"][data-ms-mode="search"] a[href^="/reel/"],
    html[data-ms-site="instagram"][data-ms-mode="shorts"] a[href^="/reels/"],
    html[data-ms-site="instagram"][data-ms-mode="feed"] a[href^="/reels/"],
    html[data-ms-site="instagram"][data-ms-mode="search"] a[href^="/reels/"] {
      display: none !important;
    }

    #${PLACEHOLDER_ID} {
      margin: 28px auto;
      max-width: 720px;
      padding: 32px 28px;
      border-radius: 24px;
      background:
        radial-gradient(circle at top right, rgba(179, 79, 62, 0.22), transparent 40%),
        linear-gradient(180deg, rgba(23, 20, 20, 0.96), rgba(31, 24, 24, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f7f3f1;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
    }

    #${PLACEHOLDER_ID} h2 {
      margin: 0 0 8px;
      font: 700 22px/1.1 Arial, sans-serif;
    }

    #${PLACEHOLDER_ID} p {
      margin: 0;
      font: 400 14px/1.55 Arial, sans-serif;
      color: rgba(247, 243, 241, 0.82);
    }
  `;

  function getRoute() {
    if (location.pathname === "/") {
      return "home";
    }
    if (location.pathname.startsWith("/explore")) {
      return "explore";
    }
    if (location.pathname.startsWith("/reels") || location.pathname.startsWith("/reel/")) {
      return "reels";
    }
    if (location.pathname.startsWith("/direct")) {
      return "direct";
    }
    return "other";
  }

  function getMainRoot() {
    return document.querySelector('main[role="main"]') || document.querySelector("main");
  }

  function toggleMainDiscovery(mode, route, setNodeHidden) {
    const main = getMainRoot();
    if (!main) {
      return;
    }

    const shouldHideMain =
      (mode === MODES.FEED && route === "home") ||
      (mode === MODES.SEARCH && (route === "home" || route === "explore" || route === "reels"));

    const children = Array.from(main.children).filter((node) => node.id !== PLACEHOLDER_ID);
    for (const child of children) {
      setNodeHidden(child, shouldHideMain);
    }
  }

  function toggleReelEntryPoints(mode, setNodeHidden) {
    const selectors = [
      'a[href="/reels/"]',
      'a[href^="/reels/"]',
      'a[href^="/reel/"]'
    ];

    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        setNodeHidden(node, mode !== MODES.OFF);
      }
    }
  }

  function ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder) {
    const shouldBlock =
      (mode === MODES.FEED && route === "home") ||
      (mode === MODES.SEARCH && (route === "home" || route === "explore" || route === "reels"));

    if (!shouldBlock) {
      clearPlaceholder(PLACEHOLDER_ID);
      return;
    }

    const main = getMainRoot();
    if (!main) {
      return;
    }

    upsertPlaceholder({
      id: PLACEHOLDER_ID,
      parent: main,
      title: mode === MODES.SEARCH ? "Search Only" : "Feed Block",
      copy:
        route === "reels"
          ? "Reels are hidden here. Use search, messages, or direct profile navigation instead."
          : mode === MODES.SEARCH
            ? "Instagram discovery surfaces are hidden. Use the native Search entry in the sidebar when you need something specific."
            : "The home feed is hidden. Navigation, messages, and direct profile visits remain available."
    });
  }

  shield.initSite({
    id: "instagram",
    css,
    apply({ mode, root, setNodeHidden, upsertPlaceholder, clearPlaceholder }) {
      const route = getRoute();
      root.dataset.msInstagramRoute = route;
      toggleReelEntryPoints(mode, setNodeHidden);
      toggleMainDiscovery(mode, route, setNodeHidden);
      ensurePlaceholder(mode, route, upsertPlaceholder, clearPlaceholder);
    }
  });
})(globalThis);
