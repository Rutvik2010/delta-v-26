// main.js - Core router and context for Delta-V 26

export const ctx = {
  site: null,
  finalState: null,
  showScreen: null,
  playSfx: null
};

/**
 * Safely plays a sound effect from assets/sfx-<name>.mp3.
 * Ignores missing files or audio play restrictions without throwing errors.
 * @param {string} name - Sound effect identifier
 */
export function playSfx(name) {
  try {
    const audio = new Audio(`assets/sfx-${name}.mp3`);
    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Safe ignore (file missing, user gesture required, autoplay blocked)
      });
    }
  } catch (err) {
    // Safe ignore
  }
}

ctx.playSfx = playSfx;

// Screen loaders mapping for lazy/dynamic loading
const screenLoaders = {
  start: () => import('./screens/start.js'),
  siteSelect: () => import('./screens/siteSelect.js'),
  tutorial: () => import('./screens/tutorial.js'),
  end: () => import('./screens/end.js')
};

/**
 * Clears #app and displays the requested screen.
 * @param {string} name - 'start' | 'siteSelect' | 'tutorial' | 'game' | 'end'
 * @param {any} [data] - Optional state data (e.g., finalState for 'end')
 */
export async function showScreen(name, data) {
  const app = document.getElementById('app');
  if (!app) return;

  // Clear #app
  app.innerHTML = '';

  if (data !== undefined) {
    ctx.finalState = data;
  }

  // Handle "game" screen
  if (name === 'game') {
    let mountGame = null;
    try {
      const gameModule = await import('./ui/game.js');
      mountGame = gameModule.mountGame || gameModule.default;
    } catch (err) {
      // ui/game.js does not exist yet
    }

    if (typeof mountGame === 'function') {
      mountGame(app, {
        site: ctx.site,
        onGameEnd: (finalState) => showScreen('end', finalState),
        playSfx
      });
    } else {
      // Placeholder until UI team provides ui/game.js
      app.innerHTML = '<div class="placeholder">Game here</div>';
    }
    return;
  }

  // Handle other screens (start, siteSelect, tutorial, end)
  const loader = screenLoaders[name];
  if (loader) {
    try {
      const mod = await loader();
      const renderFn = mod.render || (mod.default && mod.default.render);
      if (typeof renderFn === 'function') {
        renderFn(app, ctx);
      } else {
        app.innerHTML = `<div class="screen-placeholder">Screen "${name}" render function not found.</div>`;
      }
    } catch (err) {
      app.innerHTML = `<div class="screen-placeholder">Screen "${name}" not yet implemented.</div>`;
    }
  } else {
    app.innerHTML = `<div class="screen-placeholder">Screen "${name}" unknown.</div>`;
  }
}

ctx.showScreen = showScreen;

// Initialize on DOM ready
function init() {
  // Ensure screens stylesheet is loaded
  if (typeof document !== 'undefined' && !document.querySelector('link[href*="screens.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'screens/screens.css';
    document.head.appendChild(link);
  }

  const app = document.getElementById('app');
  if (app) {
    showScreen('start');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
