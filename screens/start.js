// screens/start.js - Start screen for Delta-V 26

/**
 * Renders the start screen into rootEl.
 * @param {HTMLElement} rootEl
 * @param {object} ctx - Shared context containing showScreen and playSfx
 */
export function render(rootEl, ctx) {
  rootEl.innerHTML = `
    <div class="screen-container start-screen">
      <div class="start-header">
        <span class="start-badge">Mission Simulation</span>
        <h1 class="screen-title">Delta-V 26: Junior Astronaut Mission Trainer</h1>
        <p class="screen-subtitle">Survive, explore, and balance life support on the Moon & Mars</p>
      </div>

      <div class="btn-group">
        <button id="btn-play" class="btn btn-primary" aria-label="Start Game">Launch Mission</button>
        <button id="btn-how-to-play" class="btn btn-secondary" aria-label="How to play instructions">How to Play</button>
        <button id="btn-credits" class="btn btn-secondary" aria-label="View mission credits">Credits</button>
      </div>

      <div id="modal-container"></div>
    </div>
  `;

  const btnPlay = rootEl.querySelector('#btn-play');
  const btnHowToPlay = rootEl.querySelector('#btn-how-to-play');
  const btnCredits = rootEl.querySelector('#btn-credits');
  const modalContainer = rootEl.querySelector('#modal-container');

  btnPlay.addEventListener('click', () => {
    if (ctx.playSfx) ctx.playSfx('click');
    ctx.showScreen('siteSelect');
  });

  btnHowToPlay.addEventListener('click', () => {
    if (ctx.playSfx) ctx.playSfx('click');
    modalContainer.innerHTML = `
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-content">
          <h3 id="modal-title">How to Play</h3>
          <p>Welcome, Junior Astronaut! Your task is to keep humanity's colony alive and gather valuable scientific research.</p>
          <ul>
            <li><strong>Manage 4 Life Support Systems:</strong> Oxygen, Power, Food, and Radiation Shielding.</li>
            <li><strong>Daily Dilemmas (Sols):</strong> Encounter real space hazards like solar storms, meteor showers, and equipment wear.</li>
            <li><strong>Every Choice Costs Something:</strong> Diverting power to shields may save your crew, but risks depleting your batteries.</li>
            <li><strong>Survive the Target Sols:</strong> Keep all vitals above zero and maximize your Science score!</li>
          </ul>
          <button id="btn-close-modal" class="btn btn-primary" style="width: 100%;">Got it!</button>
        </div>
      </div>
    `;

    rootEl.querySelector('#btn-close-modal').addEventListener('click', () => {
      if (ctx.playSfx) ctx.playSfx('click');
      modalContainer.innerHTML = '';
    });
  });

  btnCredits.addEventListener('click', () => {
    if (ctx.playSfx) ctx.playSfx('click');
    modalContainer.innerHTML = `
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="credits-title">
        <div class="modal-content">
          <h3 id="credits-title">Mission Credits</h3>
          <p><strong>Delta-V 26: Junior Astronaut Mission Trainer</strong></p>
          <p>Created for students, educators, and space explorers of tomorrow.</p>
          <ul>
            <li><strong>Scientific Grounding:</strong> NASA Goddard Space Flight Center, NASA Jet Propulsion Laboratory (JPL), and ESA Solar System Exploration.</li>
            <li><strong>Development:</strong> Delta-V 26 Mission Operations Crew.</li>
            <li><strong>Audio & Assets:</strong> Junior Astronaut Educational Sound Library.</li>
          </ul>
          <button id="btn-close-credits" class="btn btn-primary" style="width: 100%;">Close</button>
        </div>
      </div>
    `;

    rootEl.querySelector('#btn-close-credits').addEventListener('click', () => {
      if (ctx.playSfx) ctx.playSfx('click');
      modalContainer.innerHTML = '';
    });
  });
}

export default { render };
