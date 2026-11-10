// ui/game.js
// Exports mountGame to render the game layout into the given container.

// Importing engine stub (will switch to '../engine/index.js' when it is ready)
import * as engine from './_stub_engine.js';

const RESOURCE_ICONS = {
  power: "⚡",
  oxygen: "🫁",
  shielding: "🛡️",
  food: "🍞"
};

/**
 * Helper to determine CSS class for resource value.
 * Green > 50, Yellow 25-50, Red < 25
 */
function getBarColorClass(value) {
  if (value > 50) return "bar-green";
  if (value >= 25) return "bar-yellow";
  return "bar-red";
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
 * Mount the game UI into the specified DOM element.
 * @param {HTMLElement} container - Root element to mount into.
 */
export function mountGame(container) {
  if (!container) {
    console.error("mountGame: container element not found");
    return;
  }

  const state = engine.getState();

  // Pick the last 5 logs
  const displayLogs = (state.logs || []).slice(-5);

  container.innerHTML = `
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="sol-counter" id="sol-counter" aria-label="Sol progress">
        Sol ${state.sol} / ${state.maxSols}
      </div>
      <h1 class="site-name" id="site-name">${state.site}</h1>
      <div class="weather-badge" id="weather-badge" aria-label="Weather status">
        <span aria-hidden="true">☀️</span> ${state.weather}
      </div>
    </header>

    <!-- Main Layout Grid -->
    <main class="main-content">
      <!-- Left: Resource Bars -->
      <aside class="resources-panel" aria-label="Colony Life Support and Resources">
        <h2 class="panel-title">Vital Systems</h2>
        
        ${Object.entries(state.resources).map(([key, val]) => `
          <div class="resource-bar-wrapper" id="res-${key}">
            <div class="resource-header">
              <span class="resource-icon-label">
                <span aria-hidden="true">${RESOURCE_ICONS[key] || "📦"}</span>
                <span style="text-transform: capitalize;">${key}</span>
              </span>
              <span class="resource-number">${val} / 100</span>
            </div>
            <div class="bar-track" role="progressbar" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="100" aria-label="${key} level">
              <div class="bar-fill ${getBarColorClass(val)}" style="width: ${val}%"></div>
            </div>
          </div>
        `).join("")}
      </aside>

      <!-- Center: Scene Viewport -->
      <section class="scene-view" data-planet="${state.planet || 'moon'}" aria-label="Colony Surface Viewport">
        <div class="scene-overlay">
          <span>Surface Art Viewport [${state.planet === 'mars' ? 'Mars' : 'Lunar'} Outpost]</span>
        </div>
      </section>

      <!-- Right: Mission Log Panel -->
      <aside class="log-panel" aria-label="Colony Activity Log">
        <h2 class="panel-title">Mission Log</h2>
        <ul class="log-list" id="log-list" role="log" aria-live="polite">
          ${displayLogs.map(entry => `<li class="log-entry">${entry}</li>`).join("")}
        </ul>
      </aside>
    </main>

    <!-- Bottom: Action Cards & Sol Controls -->
    <footer class="actions-container" aria-label="Colony Operations">
      <div class="actions-header">
        <span class="actions-left-badge">
          Actions Remaining: <strong class="actions-left-count" id="actions-left">${state.actionsLeft}</strong>
        </span>
        <button type="button" class="end-sol-btn" id="end-sol-btn">
          End Sol ➔
        </button>
      </div>

      <div class="action-cards-row" id="action-cards">
        ${state.actions.map(action => `
          <button type="button" class="action-card" data-action-id="${action.id}">
            <div class="action-card-header">${action.label}</div>
            <div class="action-deltas">
              ${formatDeltas(action.cost, action.gain)}
            </div>
            <div class="action-tip">${action.tip}</div>
          </button>
        `).join("")}
      </div>
    </footer>
  `;
}
