(function initYouTubeShield(global) {
  const shield = global.__minimalistShield?.api;
  if (!shield) {
    return;
  }

  const { MODES, initSite } = shield;
  const HOME_PLACEHOLDER_ID = "ms-youtube-home-placeholder";
  const SHORTS_PLACEHOLDER_ID = "ms-youtube-shorts-placeholder";

  const css = `
    html[data-ms-site="youtube"][data-ms-mode="shorts"] a[href^="/shorts"],
    html[data-ms-site="youtube"][data-ms-mode="shorts"] ytd-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="shorts"] ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="shorts"] ytd-reel-shelf-renderer,
    html[data-ms-site="youtube"][data-ms-mode="shorts"] ytd-rich-shelf-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="shorts"] ytd-video-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="feed"] a[href^="/shorts"],
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-reel-shelf-renderer,
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-rich-shelf-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-video-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="search"] a[href^="/shorts"],
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-reel-shelf-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-rich-shelf-renderer:has(a[href^="/shorts"]),
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-video-renderer:has(a[href^="/shorts"]) {
      display: none !important;
    }

    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer,
    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer {
      display: none !important;
    }

    html[data-ms-site="youtube"][data-ms-mode="feed"] ytd-watch-next-secondary-results-renderer,
    html[data-ms-site="youtube"][data-ms-mode="feed"] #secondary.ytd-watch-flexy,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-watch-next-secondary-results-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] #secondary.ytd-watch-flexy {
      display: none !important;
    }

    html[data-ms-site="youtube"][data-ms-mode="search"] #comments,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-comments#comments,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-watch-metadata #description-inline-expander,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-video-description-transcript-section-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-engagement-panel-section-list-renderer {
      display: none !important;
    }

    html[data-ms-site="youtube"][data-ms-mode="shorts"][data-ms-youtube-route="shorts"] #content.ytd-app,
    html[data-ms-site="youtube"][data-ms-mode="feed"][data-ms-youtube-route="shorts"] #content.ytd-app,
    html[data-ms-site="youtube"][data-ms-mode="search"][data-ms-youtube-route="shorts"] #content.ytd-app {
      display: none !important;
    }

    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-guide-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-mini-guide-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-merch-shelf-renderer,
    html[data-ms-site="youtube"][data-ms-mode="search"] #chips-wrapper,
    html[data-ms-site="youtube"][data-ms-mode="search"] ytd-rich-metadata-renderer {
      display: none !important;
    }

    #${HOME_PLACEHOLDER_ID},
    #${SHORTS_PLACEHOLDER_ID} {
      margin: 24px auto;
      max-width: 840px;
      padding: 32px 28px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background:
        linear-gradient(180deg, rgba(17, 18, 22, 0.94), rgba(26, 27, 33, 0.98));
      color: #f5f5f5;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.32);
    }

    #${HOME_PLACEHOLDER_ID} h2,
    #${SHORTS_PLACEHOLDER_ID} h2 {
      margin: 0 0 10px;
      font: 700 24px/1.1 Arial, sans-serif;
    }

    #${HOME_PLACEHOLDER_ID} p,
    #${SHORTS_PLACEHOLDER_ID} p {
      margin: 0;
      font: 400 14px/1.6 Arial, sans-serif;
      color: rgba(255, 255, 255, 0.78);
    }
  `;

  function getRoute() {
    if (location.pathname === "/") {
      return "home";
    }
    if (location.pathname === "/watch") {
      return "watch";
    }
    if (location.pathname === "/results") {
      return "search-results";
    }
    if (location.pathname.startsWith("/shorts")) {
      return "shorts";
    }
    if (location.pathname.startsWith("/feed/subscriptions")) {
      return "subscriptions";
    }
    if (location.pathname.startsWith("/feed/explore")) {
      return "explore";
    }
    return "other";
  }

  function ensureHomePlaceholder(mode, upsertPlaceholder, clearPlaceholder) {
    const isActive = mode === MODES.FEED || mode === MODES.SEARCH;
    const isHome = getRoute() === "home";

    if (!isActive || !isHome) {
      clearPlaceholder(HOME_PLACEHOLDER_ID);
      return;
    }

    const homeRoot =
      document.querySelector('ytd-browse[page-subtype="home"] #primary') ||
      document.querySelector('ytd-browse[page-subtype="home"] #contents');

    if (!homeRoot) {
      return;
    }

    upsertPlaceholder({
      id: HOME_PLACEHOLDER_ID,
      parent: homeRoot,
      title: mode === MODES.SEARCH ? "Search Only" : "Feed Block",
      copy:
        mode === MODES.SEARCH
          ? "Home recommendations are hidden. Use YouTube search or open a direct URL."
          : "The home feed is hidden. Search and direct video visits remain available."
    });
  }

  function ensureShortsPlaceholder(mode, upsertPlaceholder, clearPlaceholder) {
    const route = getRoute();
    const isBlocked = route === "shorts" && mode !== MODES.OFF;

    if (!isBlocked) {
      clearPlaceholder(SHORTS_PLACEHOLDER_ID);
      return;
    }

    const parent = document.querySelector("ytd-app") || document.body;
    if (!parent) {
      return;
    }

    upsertPlaceholder({
      id: SHORTS_PLACEHOLDER_ID,
      parent,
      title: "Shorts Blocked",
      copy: "This Shorts page is hidden. Use search or open a direct long-form video instead."
    });
  }

  initSite({
    id: "youtube",
    css,
    apply({ mode, root, upsertPlaceholder, clearPlaceholder }) {
      root.dataset.msYoutubeRoute = getRoute();
      ensureHomePlaceholder(mode, upsertPlaceholder, clearPlaceholder);
      ensureShortsPlaceholder(mode, upsertPlaceholder, clearPlaceholder);
    }
  });
})(globalThis);
