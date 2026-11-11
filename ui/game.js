// ui/game.js - Space Colony UI Controller & Renderer
// Handles DOM creation, reactive updates, Sol loop, events, action preview, sound hooks, accessibility, and engine binding.

import * as engine from './_stub_engine.js';

const SITE_NAMES = {
  moon: "Shackleton Crater",
  mars: "Jezero Crater"
};

const RESOURCE_ICONS = {
  power: "⚡",
  oxygen: "🫁",
  shielding: "🛡️",
  food: "🍞"
};

let latestState = null;
let previousResources = null;
let lastFocusedElement = null;

/**
 * Live region for screen reader announcements.
 */
let liveRegion = null;
function announce(message) {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "assertive");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = "";
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

/**
 * Returns accessible status indicator and styling.
 * > 50: NOMINAL (green)
 * 25-50: CAUTION (yellow)
 * < 25: CRITICAL (red)
 * Note: Never relies on color alone; includes status text and symbol.
 */
function getResourceStatus(value) {
  if (value > 50) {
    return {
      barClass: "bar-green",
      badgeClass: "nominal",
      text: "● NOMINAL",
      ariaLabel: "Nominal status"
    };
  }
  if (value >= 25) {
    return {
      barClass: "bar-yellow",
      badgeClass: "caution",
      text: "▲ CAUTION",
      ariaLabel: "Caution status"
    };
  }
  return {
    barClass: "bar-red",
    badgeClass: "critical",
    text: "✖ CRITICAL",
    ariaLabel: "Critical status"
  };
}

/**
 * Format costs and gains for action cards.
 */
function formatDeltas(cost = {}, gain = {}) {
  const parts = [];

  for (const [res, val] of Object.entries(cost)) {
    const icon = RESOURCE_ICONS[res] || res;
    parts.push(`<span class="delta-cost" aria-label="Cost ${val} ${res}">-${val} ${icon}</span>`);
  }

  for (const [res, val] of Object.entries(gain)) {
    const icon = RESOURCE_ICONS[res] || res;
    parts.push(`<span class="delta-gain" aria-label="Gain ${val} ${res}">+${val} ${icon}</span>`);
  }

  return parts.join(" ");
}

/**
 * Build rich descriptive aria-label for action cards.
 */
function buildActionAriaLabel(action) {
  const costDesc = Object.entries(action.cost || {})
    .map(([k, v]) => `${v} ${k}`)
    .join(", ") || "none";
  const gainDesc = Object.entries(action.gain || {})
    .map(([k, v]) => `${v} ${k}`)
    .join(", ") || "none";
  return `${action.label}. Cost: ${costDesc}. Gain: ${gainDesc}. ${action.tip || ""}`;
}

/**
 * Clear ghost markers and preview text strictly via opacity/visibility (never removing DOM elements).
 */
function clearPreview(container) {
  const previews = container.querySelectorAll(".res-col-preview");
  previews.forEach(el => {
    el.classList.add("res-col-preview--hidden");
    el.classList.remove("gain", "loss");
  });

  const ghosts = container.querySelectorAll(".bar-ghost");
  ghosts.forEach(el => {
    el.classList.add("bar-ghost--hidden");
    el.classList.remove("bar-ghost-gain", "bar-ghost-loss");
    el.style.width = "0%";
  });
}

/**
 * Display ghost markers on resource bars projecting results of an action.
 * Toggled strictly via visibility/opacity without DOM insertion/deletion.
 */
function showPreview(action, state, container) {
  clearPreview(container);
  if (!action || !state) return;

  const resources = ["power", "oxygen", "shielding", "food"];

  resources.forEach(res => {
    const cost = action.cost?.[res] || 0;
    const gain = action.gain?.[res] || 0;
    const delta = gain - cost;
    if (delta === 0) return;

    const current = state.resources[res] || 0;
    const projected = Math.max(0, Math.min(100, current + delta));

    const row = container.querySelector(`#res-${res}`);
    if (!row) return;

    const ghost = row.querySelector(".bar-ghost");
    const previewEl = row.querySelector(".res-col-preview");

    if (ghost) {
      const left = Math.min(current, projected);
      const width = Math.abs(projected - current);

      ghost.style.left = `${left}%`;
      ghost.style.width = `${width}%`;
      ghost.className = `bar-ghost ${delta > 0 ? "bar-ghost-gain" : "bar-ghost-loss"}`;
      ghost.classList.remove("bar-ghost--hidden");
    }

    if (previewEl) {
      previewEl.className = `res-col-preview ${delta > 0 ? "gain" : "loss"}`;
      previewEl.textContent = `➔ ${projected} (${delta > 0 ? '+' : ''}${delta})`;
      previewEl.classList.remove("res-col-preview--hidden");
    }
  });
}

/**
 * Display an accessible event or alert modal dialog with focus trapping and focus restore.
 */
function showModal({ title, text, realFact, buttonText = "Acknowledge", onClose, playSfx = () => {} }) {
  lastFocusedElement = document.activeElement;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-labelledby", "modal-title");

  backdrop.innerHTML = `
    <div class="modal-dialog">
      <h3 class="modal-title" id="modal-title">
        <span aria-hidden="true">🛰️</span> ${title}
      </h3>
      <div class="modal-body">${text}</div>
      ${realFact ? `
        <div class="nasa-fact-box">
          <strong>Real NASA fact:</strong>
          <span>${realFact}</span>
        </div>
      ` : ''}
      <button type="button" class="modal-ok-btn" aria-label="${buttonText}">${buttonText}</button>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Focus trap implementation
  const okBtn = backdrop.querySelector(".modal-ok-btn");
  const focusable = backdrop.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];

  function handleTrap(e) {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  backdrop.addEventListener("keydown", handleTrap);

  // Trigger smooth enter animation and focus initial button
  requestAnimationFrame(() => {
    backdrop.classList.add("open");
    if (okBtn) okBtn.focus();
  });

  const closeModal = () => {
    playSfx("click");
    backdrop.classList.remove("open");
    backdrop.removeEventListener("keydown", handleTrap);
    backdrop.addEventListener("transitionend", () => {
      backdrop.remove();
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
      if (typeof onClose === "function") onClose();
    }, { once: true });
  };

  okBtn.addEventListener("click", closeModal);

  backdrop.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter") {
      closeModal();
    }
  });
}

/**
 * Pure UI render function: synchronizes DOM with current state.
 */
function render(state, container, playSfx = () => {}) {
  latestState = state;
  clearPreview(container);

  // Sound hook & screen reader announcement: Check if any resource dropped below 25
  if (previousResources) {
    const dropped = [];
    for (const [key, val] of Object.entries(state.resources)) {
      if ((previousResources[key] ?? 100) >= 25 && val < 25) {
        dropped.push(key);
      }
    }
    if (dropped.length > 0) {
      playSfx("warning");
      announce(`Warning: Critical life support level on ${dropped.join(", ")}!`);
    }
  }
  previousResources = { ...state.resources };

  // Top bar updates
  const solCounter = container.querySelector("#sol-counter");
  const siteName = container.querySelector("#site-name");
  const weatherBadge = container.querySelector("#weather-badge");

  if (solCounter) solCounter.textContent = `Sol ${state.sol} / ${state.maxSols}`;
  // Use SITE_NAMES map strictly for display text
  if (siteName) siteName.textContent = SITE_NAMES[state.site] || state.site;
  if (weatherBadge) weatherBadge.innerHTML = `<span aria-hidden="true">☀️</span> ${state.weather}`;

  // Resource rows update with animation (fixed grid cells)
  for (const [key, val] of Object.entries(state.resources)) {
    const status = getResourceStatus(val);
    const row = container.querySelector(`#res-${key}`);
    if (row) {
      const numEl = row.querySelector(".res-num");
      const badgeEl = row.querySelector(".status-badge");
      const barFill = row.querySelector(".bar-fill");
      const track = row.querySelector(".bar-track");

      if (numEl) {
        numEl.textContent = `${val} / 100`;
      }
      if (badgeEl) {
        badgeEl.className = `status-badge ${status.badgeClass}`;
        badgeEl.textContent = status.text;
        badgeEl.setAttribute("aria-label", status.ariaLabel);
      }
      if (barFill) {
        barFill.style.width = `${Math.min(100, Math.max(0, val))}%`;
        barFill.className = `bar-fill ${status.barClass}`;
      }
      if (track) {
        track.setAttribute("aria-valuenow", val);
      }
    }
  }

  // Scene update
  const scene = container.querySelector(".scene-view");
  if (scene) {
    scene.dataset.planet = state.site || "moon";
    const overlay = scene.querySelector(".scene-overlay span");
    if (overlay) {
      const displayName = SITE_NAMES[state.site] || state.site;
      overlay.textContent = `Surface Art Viewport [${displayName}]`;
    }
  }

  // Actions counter
  const actionsCountEl = container.querySelector("#actions-left");
  if (actionsCountEl) {
    actionsCountEl.textContent = state.actionsLeft;
  }

  // Action cards
  const cardsContainer = container.querySelector("#action-cards");
  if (cardsContainer) {
    const isOut = state.actionsLeft <= 0;
    cardsContainer.innerHTML = state.actions.map(action => `
      <button 
        type="button" 
        class="action-card ${isOut ? 'disabled' : ''}" 
        data-action-id="${action.id}"
        ${isOut ? 'disabled' : ''}
        aria-disabled="${isOut}"
        aria-label="${buildActionAriaLabel(action)}"
      >
        <div class="action-card-header">${action.label}</div>
        <div class="action-deltas">
          ${formatDeltas(action.cost, action.gain)}
        </div>
        <div class="action-tip">${action.tip}</div>
      </button>
    `).join("");

    attachPreviewListeners(cardsContainer, container);
  }

  // Log panel (last 5 entries, auto-scrolled to bottom so it never grows page)
  const logList = container.querySelector("#log-list");
  if (logList) {
    const displayLogs = (state.logs || []).slice(-5);
    logList.innerHTML = displayLogs.map(entry => `<li class="log-entry">${entry}</li>`).join("");
    logList.scrollTop = logList.scrollHeight;
  }
}

/**
 * Attach hover, touch, and focus listeners to action cards for live preview.
 */
function attachPreviewListeners(cardsContainer, container) {
  const cards = cardsContainer.querySelectorAll(".action-card");

  cards.forEach(card => {
    const actionId = card.dataset.actionId;
    if (!actionId) return;

    const startPreview = () => {
      if (card.disabled || card.classList.contains("disabled")) return;
      if (!latestState) return;
      const action = latestState.actions.find(a => a.id === actionId);
      if (action) {
        showPreview(action, latestState, container);
      }
    };

    const stopPreview = () => {
      clearPreview(container);
    };

    // Pointer hover (mouse / stylus)
    card.addEventListener("pointerenter", startPreview);
    card.addEventListener("pointerleave", stopPreview);

    // Keyboard focus
    card.addEventListener("focus", startPreview);
    card.addEventListener("blur", stopPreview);

    // Touch tap-and-hold for mobile
    let touchTimer = null;
    card.addEventListener("touchstart", () => {
      touchTimer = setTimeout(startPreview, 120);
    }, { passive: true });

    card.addEventListener("touchend", () => {
      if (touchTimer) clearTimeout(touchTimer);
      setTimeout(stopPreview, 400);
    });

    card.addEventListener("touchcancel", () => {
      if (touchTimer) clearTimeout(touchTimer);
      stopPreview();
    });
  });
}

/**
 * Builds static shell and sets up event listeners.
 */
function setupDOM(container, { normalizedSite, onGameEnd, playSfx }) {
  container.innerHTML = `
    <!-- Top Bar -->
    <header class="top-bar" role="banner">
      <div class="sol-counter" id="sol-counter" aria-label="Sol progress"></div>
      <h1 class="site-name" id="site-name"></h1>
      <div class="weather-badge" id="weather-badge" aria-label="Weather status"></div>
    </header>

    <!-- Main Layout Grid -->
    <main class="main-content" role="main">
      <!-- Left: Resource Bars -->
      <aside class="resources-panel" aria-label="Colony Life Support and Resources">
        <h2 class="panel-title">Vital Systems</h2>
        
        ${["power", "oxygen", "shielding", "food"].map(key => `
          <div class="resource-row" id="res-${key}">
            <span class="res-col-icon" aria-hidden="true">${RESOURCE_ICONS[key]}</span>
            <span class="res-col-label-val">
              <span class="res-name">${key}</span>
              <span class="res-num">--</span>
            </span>
            <div class="bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="${key} level">
              <div class="bar-fill" style="width: 0%"></div>
              <div class="bar-ghost bar-ghost--hidden" aria-hidden="true"></div>
            </div>
            <span class="status-badge nominal" aria-label="Status">--</span>
            <span class="res-col-preview res-col-preview--hidden" aria-hidden="true"></span>
          </div>
        `).join("")}
      </aside>

      <!-- Center: Scene Viewport (Fixed height) -->
      <section class="scene-view" data-planet="${normalizedSite}" aria-label="Colony Surface Viewport">
        <div class="scene-overlay">
          <span>Surface Art Viewport</span>
        </div>
      </section>

      <!-- Right: Mission Log Panel (Fixed height) -->
      <aside class="log-panel" aria-label="Colony Activity Log">
        <h2 class="panel-title">Mission Log</h2>
        <ul class="log-list" id="log-list" role="log" aria-live="polite"></ul>
      </aside>
    </main>

    <!-- Bottom: Action Cards & Sol Controls -->
    <footer class="actions-container" aria-label="Colony Operations">
      <div class="actions-header">
        <span class="actions-left-badge">
          Actions Remaining: <strong class="actions-left-count" id="actions-left">0</strong>
        </span>
        <button type="button" class="end-sol-btn" id="end-sol-btn" aria-label="End current Sol and advance to next Sol">
          End Sol ➔
        </button>
      </div>

      <div class="action-cards-row" id="action-cards" role="group" aria-label="Colony Action Cards"></div>
    </footer>
  `;

  // Action cards click delegation
  const cardsContainer = container.querySelector("#action-cards");
  cardsContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".action-card");
    if (!card || card.disabled) return;

    const actionId = card.dataset.actionId;
    if (actionId) {
      playSfx("click");
      clearPreview(container);
      const newState = engine.applyAction(actionId);
      render(newState, container, playSfx);
    }
  });

  // End Sol button handler
  const endSolBtn = container.querySelector("#end-sol-btn");
  endSolBtn.addEventListener("click", async () => {
    endSolBtn.disabled = true;
    playSfx("click");
    clearPreview(container);

    try {
      // Advance Sol via engine
      const result = await Promise.resolve(engine.nextSol());
      const state = result.state || result;
      const event = result.event || null;

      // Render updated state (triggers playSfx("warning") and screen reader alerts if any bar < 25)
      render(state, container, playSfx);

      // Sound hook: Check event type (allowed sfx names: click, good, warning, flare, win, lose)
      if (event) {
        const titleAndText = `${event.title} ${event.text || ''}`.toLowerCase();
        if (titleAndText.includes("flare") || titleAndText.includes("solar")) {
          playSfx("flare");
        } else if (event.isGain || event.gain) {
          playSfx("good");
        }
      }

      // Check for event popup or game conclusion
      const checkEndStatus = () => {
        if (state.status && state.status !== "playing") {
          const isWin = state.status === "won";
          // Play win or lose sound
          if (isWin) {
            playSfx("win");
          } else {
            playSfx("lose");
          }

          if (typeof onGameEnd === "function") {
            onGameEnd(state);
          }

          const displaySite = SITE_NAMES[state.site] || state.site;
          showModal({
            title: isWin ? "🏆 Mission Completed!" : "💀 Habitat Depleted",
            text: isWin
              ? `Congratulations Commander! You survived all ${state.maxSols} Sols at ${displaySite}.`
              : "Vital systems dropped to 0%. Life support failed.",
            realFact: isWin
              ? "NASA's Artemis program plans to establish a permanent human presence on the Moon and prepare for Mars missions."
              : "In space, a loss of pressure or oxygen must be addressed in seconds to avoid catastrophic loss of life.",
            buttonText: "Restart Mission",
            playSfx,
            onClose: () => {
              mountGame(container, { site: normalizedSite, onGameEnd, playSfx });
            }
          });
        }
      };

      if (event) {
        showModal({
          title: event.title || "Colony Event",
          text: event.text || "An event occurred at the outpost.",
          realFact: event.realFact,
          buttonText: "Acknowledge",
          playSfx,
          onClose: checkEndStatus
        });
      } else {
        checkEndStatus();
      }
    } finally {
      endSolBtn.disabled = false;
    }
  });
}

/**
 * Mount the game UI into the specified DOM element.
 * Contract signature: mountGame(container, options)
 * @param {HTMLElement} container - Root element to mount into.
 * @param {Object} options - Configuration options:
 *   - site {string}: "moon" or "mars" (default: "moon")
 *   - onGameEnd {Function|null}: Callback triggered when state.status !== 'playing' (default: null)
 *   - playSfx {Function}: Sound effect trigger (default: () => {})
 */
export function mountGame(container, options = {}) {
  if (!container) {
    console.error("mountGame: container element not found");
    return;
  }

  // Destructure options with defaults as specified by the contract
  const {
    site = "moon",
    onGameEnd = null,
    playSfx = () => {}
  } = options || {};

  // Normalize site to "moon" or "mars" (default "moon")
  const normalizedSite = (typeof site === "string" && site.toLowerCase() === "mars") ? "mars" : "moon";
  const safePlaySfx = typeof playSfx === "function" ? playSfx : () => {};
  const safeOnGameEnd = typeof onGameEnd === "function" ? onGameEnd : null;

  // Reset tracking
  previousResources = null;

  // 1. Initialize new game state from engine (site is strictly "moon" or "mars")
  const initialState = engine.newGame(normalizedSite);

  // 2. Build DOM shell & wire handlers
  setupDOM(container, { normalizedSite, onGameEnd: safeOnGameEnd, playSfx: safePlaySfx });

  // 3. Render initial state
  render(initialState, container, safePlaySfx);
}
