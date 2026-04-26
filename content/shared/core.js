(function bootstrapMinimalistShield(global) {
  const MODES = Object.freeze({
    OFF: "off",
    SHORTS: "shorts",
    FEED: "feed",
    SEARCH: "search"
  });

  const MODE_KEY = "mode";
  const VALID_MODES = new Set(Object.values(MODES));

  function normalizeMode(value) {
    return VALID_MODES.has(value) ? value : MODES.OFF;
  }

  function ensureNamespace() {
    if (!global.__minimalistShield) {
      global.__minimalistShield = {};
    }
    return global.__minimalistShield;
  }

  function ensureStyle(styleId, cssText) {
    let node = document.getElementById(styleId);
    if (!node) {
      node = document.createElement("style");
      node.id = styleId;
      (document.head || document.documentElement).appendChild(node);
    }
    if (node.textContent !== cssText) {
      node.textContent = cssText;
    }
    return node;
  }

  async function getMode() {
    const result = await chrome.storage.local.get(MODE_KEY);
    return normalizeMode(result[MODE_KEY]);
  }

  function onModeChange(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[MODE_KEY]) {
        return;
      }
      callback(normalizeMode(changes[MODE_KEY].newValue));
    });
  }

  function watchUrlChanges(callback) {
    let previousUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href === previousUrl) {
        return;
      }
      previousUrl = location.href;
      callback(previousUrl);
    });

    const start = () => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    };

    if (document.documentElement) {
      start();
    } else {
      document.addEventListener("readystatechange", start, { once: true });
    }

    return () => observer.disconnect();
  }

  function removeNode(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  function setNodeHidden(node, hidden) {
    if (!node) {
      return;
    }

    const hiddenMarker = "msHiddenByShield";
    const displayMarker = "msDisplayBeforeShield";

    if (hidden) {
      if (!node.dataset[hiddenMarker]) {
        node.dataset[displayMarker] = node.style.getPropertyValue("display");
        node.dataset[hiddenMarker] = "1";
      }
      node.style.setProperty("display", "none", "important");
      return;
    }

    if (!node.dataset[hiddenMarker]) {
      return;
    }

    const previousDisplay = node.dataset[displayMarker];
    if (previousDisplay) {
      node.style.setProperty("display", previousDisplay);
    } else {
      node.style.removeProperty("display");
    }

    delete node.dataset[displayMarker];
    delete node.dataset[hiddenMarker];
  }

  function upsertPlaceholder({ id, parent, title, copy }) {
    if (!parent) {
      return null;
    }

    let placeholder = document.getElementById(id);
    if (!placeholder) {
      placeholder = document.createElement("section");
      placeholder.id = id;

      const heading = document.createElement("h2");
      heading.className = "ms-placeholder-title";

      const body = document.createElement("p");
      body.className = "ms-placeholder-copy";

      placeholder.append(heading, body);
    }

    if (placeholder.parentNode !== parent) {
      parent.prepend(placeholder);
    }

    const heading = placeholder.querySelector(".ms-placeholder-title");
    const body = placeholder.querySelector(".ms-placeholder-copy");

    if (heading) {
      heading.textContent = title;
    }

    if (body) {
      body.textContent = copy;
    }

    return placeholder;
  }

  function clearPlaceholder(id) {
    document.getElementById(id)?.remove();
  }

  function initSite(siteConfig) {
    const html = document.documentElement;
    const styleId = `minimalist-shield-style-${siteConfig.id}`;
    ensureStyle(styleId, siteConfig.css || "");

    let applyScheduled = false;

    async function apply() {
      const mode = await getMode();
      html.dataset.msMode = mode;
      html.dataset.msSite = siteConfig.id;
      siteConfig.apply({
        mode,
        root: html,
        ensureStyle,
        removeNode,
        setNodeHidden,
        upsertPlaceholder,
        clearPlaceholder
      });
    }

    function scheduleApply() {
      if (applyScheduled) {
        return;
      }

      applyScheduled = true;
      requestAnimationFrame(() => {
        applyScheduled = false;
        void apply();
      });
    }

    onModeChange(() => {
      scheduleApply();
    });

    watchUrlChanges(() => {
      scheduleApply();
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        scheduleApply();
      }, { once: true });
    }

    const observer = new MutationObserver(() => {
      scheduleApply();
    });

    const startObserver = () => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    };

    if (document.documentElement) {
      startObserver();
    } else {
      document.addEventListener("readystatechange", startObserver, { once: true });
    }

    scheduleApply();
  }

  const api = {
    MODES,
    initSite
  };

  ensureNamespace().api = api;
})(globalThis);
