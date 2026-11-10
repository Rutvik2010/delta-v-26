// ui/game.js - Space Colony UI Controller & Renderer
// Handles DOM creation, reactive updates, and engine event binding.

import * as engine from './_stub_engine.js';

const RESOURCE_ICONS = {
  power: "⚡",
  oxygen: "🫁",
  shielding: "🛡️",
  food: "🍞"
};

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
 * Pure UI render function: synchronizes DOM with current state.
 */
function render(state, container) {
  // Top bar updates
  const solCounter = container.querySelector("#sol-counter");
  const siteName = container.querySelector("#site-name");
  const weatherBadge = container.querySelector("#weather-badge");

  if (solCounter) solCounter.textContent = `Sol ${state.sol} / ${state.maxSols}`;
  if (siteName) siteName.textContent = state.site;
  if (weatherBadge) weatherBadge.innerHTML = `<span aria-hidden="true">☀️</span> ${state.weather}`;

  // Resource bars update
  for (const [key, val] of Object.entries(state.resources)) {
    const status = getResourceStatus(val);
    const wrapper = container.querySelector(`#res-${key}`);
    if (wrapper) {
      const numEl = wrapper.querySelector(".resource-number");
      const barFill = wrapper.querySelector(".bar-fill");
      const track = wrapper.querySelector(".bar-track");

      if (numEl) {
        numEl.innerHTML = `
          <span>${val} / 100</span>
          <span class="status-badge ${status.badgeClass}" aria-label="${status.ariaLabel}">${status.text}</span>
        `;
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
    scene.dataset.planet = state.planet || "moon";
    const overlay = scene.querySelector(".scene-overlay span");
    if (overlay) {
      overlay.textContent = `Surface Art Viewport [${state.planet === 'mars' ? 'Mars' : 'Lunar'} Outpost]`;
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
      >
        <div class="action-card-header">${action.label}</div>
        <div class="action-deltas">
          ${formatDeltas(action.cost, action.gain)}
        </div>
        <div class="action-tip">${action.tip}</div>
      </button>
    `).join("");
  }

  // Log panel (last 5 entries)
  const logList = container.querySelector("#log-list");
  if (logList) {
    const displayLogs = (state.logs || []).slice(-5);
    logList.innerHTML = displayLogs.map(entry => `<li class="log-entry">${entry}</li>`).join("");
  }
}

/**
 * Builds static shell and sets up event listeners.
 */
function setupDOM(container) {
  container.innerHTML = `
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="sol-counter" id="sol-counter" aria-label="Sol progress"></div>
      <h1 class="site-name" id="site-name"></h1>
      <div class="weather-badge" id="weather-badge" aria-label="Weather status"></div>
    </header>

    <!-- Main Layout Grid -->
    <main class="main-content">
      <!-- Left: Resource Bars -->
      <aside class="resources-panel" aria-label="Colony Life Support and Resources">
        <h2 class="panel-title">Vital Systems</h2>
        
        ${["power", "oxygen", "shielding", "food"].map(key => `
          <div class="resource-bar-wrapper" id="res-${key}">
            <div class="resource-header">
              <span class="resource-icon-label">
                <span aria-hidden="true">${RESOURCE_ICONS[key]}</span>
                <span style="text-transform: capitalize;">${key}</span>
              </span>
              <span class="resource-number">--</span>
            </div>
            <div class="bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="${key} level">
              <div class="bar-fill" style="width: 0%"></div>
            </div>
          </div>
        `).join("")}
      </aside>

      <!-- Center: Scene Viewport -->
      <section class="scene-view" data-planet="moon" aria-label="Colony Surface Viewport">
        <div class="scene-overlay">
          <span>Surface Art Viewport</span>
        </div>
      </section>

      <!-- Right: Mission Log Panel -->
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
        <button type="button" class="end-sol-btn" id="end-sol-btn">
          End Sol ➔
        </button>
      </div>

      <div class="action-cards-row" id="action-cards"></div>
    </footer>
  `;

  // Attach event listener once to the container using delegation
  const cardsContainer = container.querySelector("#action-cards");
  cardsContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".action-card");
    if (!card || card.disabled) return;

    const actionId = card.dataset.actionId;
    if (actionId) {
      const newState = engine.applyAction(actionId);
      render(newState, container);
    }
  });
}

/**
 * Mount the game UI into the specified DOM element.
 * @param {HTMLElement} container - Root element to mount into.
 * @param {string} site - Initial site name (default: "Shackleton Crater").
 */
export function mountGame(container, site = "Shackleton Crater") {
  if (!container) {
    console.error("mountGame: container element not found");
    return;
  }

  // 1. Initialize new game state from engine
  const initialState = engine.newGame(site);

  // 2. Build DOM shell
  setupDOM(container);

  // 3. Render initial state
  render(initialState, container);
}
