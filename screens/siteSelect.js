// screens/siteSelect.js - Destination selection screen for Delta-V 26
import { addTooltips } from '../content/tooltips.js';

/**
 * Renders the site selection screen into rootEl.
 * @param {HTMLElement} rootEl
 * @param {object} ctx - Shared context
 */
export function render(rootEl, ctx) {
  rootEl.innerHTML = `
    <div class="screen-container">
      <div>
        <h2 class="screen-title">Select Mission Site</h2>
        <p class="screen-subtitle">Choose where to establish your outpost</p>
      </div>

      <div class="cards-grid">
        <!-- Moon Card -->
        <div class="site-card moon" id="card-moon" role="button" tabindex="0" aria-label="Select Moon Outpost">
          <div>
            <h3 class="site-card-title">🌙 The Moon (Artemis Base)</h3>
            <ul class="site-facts">
              <li>A lunar night lasts about 14 Earth days, creating intense 350-hour freezing cold stretches.</li>
              <li>Temperatures swing violently from a blistering 120°C (250°F) in sunlight to -130°C (-208°F) in shadow.</li>
              <li>Radio communications with Earth take only ~1.3 seconds, giving you nearly instant mission support.</li>
            </ul>
          </div>
          <button class="btn btn-primary" id="btn-select-moon">Deploy to Moon</button>
        </div>

        <!-- Mars Card -->
        <div class="site-card mars" id="card-mars" role="button" tabindex="0" aria-label="Select Mars Outpost">
          <div>
            <h3 class="site-card-title">🔴 Mars (Ares Base)</h3>
            <ul class="site-facts">
              <li>Mars radio signals take 4 to 24 minutes to reach Earth, requiring crews to solve emergencies on their own.</li>
              <li>A Martian day is called a "sol" and lasts 24 hours, 39 minutes, and 35 seconds.</li>
              <li>Global dust storms can cover the entire planet for weeks, blocking out up to 99% of sunlight for solar power.</li>
            </ul>
          </div>
          <button class="btn btn-primary" id="btn-select-mars">Deploy to Mars</button>
        </div>
      </div>

      <button class="btn btn-secondary" id="btn-back" style="align-self: center; margin-top: 8px;">
        &larr; Back to Title
      </button>
    </div>
  `;

  function chooseSite(site) {
    ctx.site = site;
    if (ctx.playSfx) ctx.playSfx('click');
    ctx.showScreen('tutorial');
  }

  // Moon triggers
  const btnSelectMoon = rootEl.querySelector('#btn-select-moon');
  const cardMoon = rootEl.querySelector('#card-moon');
  btnSelectMoon.addEventListener('click', (e) => {
    e.stopPropagation();
    chooseSite('moon');
  });
  cardMoon.addEventListener('click', () => chooseSite('moon'));
  cardMoon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') chooseSite('moon');
  });

  // Mars triggers
  const btnSelectMars = rootEl.querySelector('#btn-select-mars');
  const cardMars = rootEl.querySelector('#card-mars');
  btnSelectMars.addEventListener('click', (e) => {
    e.stopPropagation();
    chooseSite('mars');
  });
  cardMars.addEventListener('click', () => chooseSite('mars'));
  cardMars.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') chooseSite('mars');
  });

  // Back button
  rootEl.querySelector('#btn-back').addEventListener('click', () => {
    if (ctx.playSfx) ctx.playSfx('click');
    ctx.showScreen('start');
  });

  // Apply glossary tooltips
  try {
    addTooltips(rootEl);
  } catch (err) {
    // Safe ignore
  }
}

export default { render };
