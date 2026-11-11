// screens/end.js - Mission debrief & end screen for Delta-V 26

// Fallback lessons in case content/lessons.json is loading or unavailable
const FALLBACK_LESSONS = {
  won: [
    "Balancing life support systems is vital: saving resources early creates a buffer for unforeseen space anomalies.",
    "Every operational decision in space exploration carries a cost in power, oxygen, or shielding.",
    "Scientific research thrives when astronauts maintain robust, resilient colony infrastructure."
  ],
  lost_oxygen: [
    "Oxygen recycling requires constant system maintenance; leaks and scrubber faults demand immediate intervention.",
    "Without breathable air, human cognitive function and survival rapidly diminish in extraterrestrial habitats.",
    "Back-up oxygen reserves and airtight seals are humanity's first line of defense."
  ],
  lost_power: [
    "Solar arrays on the Moon and Mars are vulnerable to dust accumulation, eclipse nights, and extreme cold.",
    "Power grid management requires ruthlessly prioritizing life support over non-essential equipment.",
    "Battery reserves must be carefully husbanded to survive long planetary nights."
  ],
  lost_food: [
    "Hydroponic greenhouses require balanced temperature, water recycling, and stable radiation shielding.",
    "Food supplies cannot be resupplied quickly across hundreds of thousands of miles of void.",
    "Caloric intake and crew morale are directly linked to mission longevity."
  ],
  lost_shielding: [
    "Galactic cosmic rays and solar particle events pierce habitats lacking sufficient magnetic or regolith shielding.",
    "Radiation damage steadily degrades sensitive computer avionics and threatens crew biological safety.",
    "Storm shelters and regolith banking are essential passive shields on planetary surfaces."
  ]
};

/**
 * Loads lessons from content/lessons.json or returns fallbacks.
 * @returns {Promise<object>}
 */
async function loadLessons() {
  try {
    const res = await fetch('content/lessons.json');
    if (res.ok) {
      const data = await res.json();
      return { ...FALLBACK_LESSONS, ...data };
    }
  } catch (err) {
    // Return default fallbacks if fetch fails
  }
  return FALLBACK_LESSONS;
}

/**
 * Renders the mission debrief / end screen into rootEl.
 * @param {HTMLElement} rootEl
 * @param {object} ctx - Shared context containing finalState, showScreen, playSfx
 */
export async function render(rootEl, ctx) {
  const state = ctx.finalState || {};
  const isWon = state.won === true || state.status === 'won';
  const solReached = state.solReached ?? state.sol ?? (isWon ? 10 : 4);
  const scienceScore = state.scienceScore ?? state.score ?? 0;
  const lossReason = state.lossReason || (isWon ? null : 'Vital life support reserves dropped below critical survival thresholds.');

  // Determine lesson key
  let outcomeKey = 'won';
  if (!isWon) {
    const reasonLower = (lossReason + ' ' + (state.lossResource || '')).toLowerCase();
    if (reasonLower.includes('oxygen') || reasonLower.includes('air')) {
      outcomeKey = 'lost_oxygen';
    } else if (reasonLower.includes('power') || reasonLower.includes('battery') || reasonLower.includes('energy')) {
      outcomeKey = 'lost_power';
    } else if (reasonLower.includes('food') || reasonLower.includes('hydroponic') || reasonLower.includes('ration')) {
      outcomeKey = 'lost_food';
    } else if (reasonLower.includes('shield') || reasonLower.includes('radiation') || reasonLower.includes('flare')) {
      outcomeKey = 'lost_shielding';
    } else {
      outcomeKey = 'lost_oxygen';
    }
  }

  const lessonsDatabase = await loadLessons();
  const lessons = lessonsDatabase[outcomeKey] || lessonsDatabase.won;

  rootEl.innerHTML = `
    <div class="screen-container">
      <!-- Win / Lose Banner -->
      ${isWon ? `
        <div class="banner-win" role="alert">
          🚀 MISSION ACCOMPLISHED: COLONY SECURED!
        </div>
      ` : `
        <div class="banner-lose" role="alert">
          ⚠️ MISSION COMPROMISED: CRITICAL FAILURE
        </div>
      `}

      <!-- Performance Metrics -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Sols Reached</div>
          <div class="stat-value">${solReached} Sols</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Science Discovered</div>
          <div class="stat-value">${scienceScore} PTS</div>
        </div>
      </div>

      <!-- Failure Reason if Lost -->
      ${!isWon && lossReason ? `
        <div class="loss-reason-box">
          <strong>Failure Cause:</strong> ${lossReason}
        </div>
      ` : ''}

      <!-- What You Learned (2-3 lines from lessons) -->
      <div class="learned-box">
        <div class="learned-title">📖 What You Learned</div>
        <ul class="learned-list">
          ${lessons.slice(0, 3).map(line => `<li>${line}</li>`).join('')}
        </ul>
      </div>

      <!-- Replay Button (minimum 44px) -->
      <button id="btn-replay" class="btn btn-primary" style="width: 100%;">
        🔄 Replay Mission
      </button>

      <!-- NASA Data Attribution Line -->
      <div class="attribution-line">
        Planetary environmental constants & mission science adapted from NASA Solar System Exploration and Artemis / Mars 2020 open data archives.
      </div>
    </div>
  `;

  // Replay handler
  const btnReplay = rootEl.querySelector('#btn-replay');
  btnReplay.addEventListener('click', () => {
    if (ctx.playSfx) ctx.playSfx('click');
    ctx.finalState = null;
    ctx.site = null;
    ctx.showScreen('siteSelect');
  });
}

export default { render };
