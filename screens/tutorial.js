// screens/tutorial.js - Brief 3-step mission briefing for Delta-V 26
import { addTooltips } from '../content/tooltips.js';

/**
 * Renders the tutorial screen into rootEl.
 * @param {HTMLElement} rootEl
 * @param {object} ctx - Shared context
 */
export function render(rootEl, ctx) {
  let currentStep = 1;
  const totalSteps = 3;

  const stepsData = [
    {
      tag: 'Step 1 of 3: Colony Life Support',
      title: 'Keep Your Astronauts Alive',
      text: 'You command a planetary outpost. Your priority is maintaining 4 vital systems: <strong>Oxygen</strong>, <strong>Power</strong>, <strong>Food</strong>, and <strong>Radiation Shielding</strong>. If any system hits 0, the mission will fail.',
      lesson: null
    },
    {
      tag: 'Step 2 of 3: Sol Hazards',
      title: 'Real Space Emergencies',
      text: 'Each <strong>Sol</strong> (mission day), your outpost faces unexpected events like solar flares, meteor showers, or system freezes. Read the scientific facts carefully to pick the safest course of action.',
      lesson: null
    },
    {
      tag: 'Step 3 of 3: Strategic Trade-Offs',
      title: 'Master the Trade-Offs',
      text: 'Upgrading research tools might burn precious battery power. Fortifying habitat shielding may exhaust your emergency reserves. Always remember the fundamental rule of space flight:',
      lesson: 'Every choice costs something.'
    }
  ];

  function updateStepView() {
    const data = stepsData[currentStep - 1];

    rootEl.innerHTML = `
      <div class="screen-container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 class="screen-title" style="text-align: left; font-size: 24px;">Mission Briefing</h2>
          <button id="btn-skip" class="btn btn-secondary" style="min-height: 44px; padding: 6px 16px; font-size: 15px;" aria-label="Skip Tutorial">
            Skip Tutorial
          </button>
        </div>

        <div class="tutorial-box">
          <div class="tutorial-step-tag">${data.tag}</div>
          <h3 style="font-size: 20px; color: var(--text-main); margin-bottom: 10px;">${data.title}</h3>
          <p class="tutorial-text">${data.text}</p>
          ${data.lesson ? `<div class="key-lesson-banner">${data.lesson}</div>` : ''}
        </div>

        <div class="tutorial-nav">
          ${currentStep > 1 
            ? `<button id="btn-prev" class="btn btn-secondary" style="min-width: 120px;">&larr; Previous</button>` 
            : `<button id="btn-back-site" class="btn btn-secondary" style="min-width: 120px;">Change Site</button>`}
          
          ${currentStep < totalSteps 
            ? `<button id="btn-next" class="btn btn-primary" style="min-width: 120px;">Next &rarr;</button>` 
            : `<button id="btn-start-game" class="btn btn-accent" style="min-width: 140px;">Launch Mission</button>`}
        </div>
      </div>
    `;

    // Hook up buttons
    const btnSkip = rootEl.querySelector('#btn-skip');
    btnSkip.addEventListener('click', () => {
      if (ctx.playSfx) ctx.playSfx('click');
      ctx.showScreen('game');
    });

    const btnPrev = rootEl.querySelector('#btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (ctx.playSfx) ctx.playSfx('click');
        currentStep--;
        updateStepView();
      });
    }

    const btnBackSite = rootEl.querySelector('#btn-back-site');
    if (btnBackSite) {
      btnBackSite.addEventListener('click', () => {
        if (ctx.playSfx) ctx.playSfx('click');
        ctx.showScreen('siteSelect');
      });
    }

    const btnNext = rootEl.querySelector('#btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (ctx.playSfx) ctx.playSfx('click');
        currentStep++;
        updateStepView();
      });
    }

    const btnStartGame = rootEl.querySelector('#btn-start-game');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', () => {
        if (ctx.playSfx) ctx.playSfx('launch');
        ctx.showScreen('game');
      });
    }

    // Apply interactive tooltips for glossary terms
    try {
      addTooltips(rootEl);
    } catch (err) {
      // Ignore if tooltips unavailable
    }
  }

  updateStepView();
}

export default { render };
