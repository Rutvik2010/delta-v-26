// Additional deterministic balance audit using only engine/README.md's public API.
import { newGame, getActions, applyAction, nextSol } from '../engine/index.js';
import { readFileSync, existsSync } from 'node:fs';

const GAMES = 1000;
const FALLBACK = JSON.parse(readFileSync(new URL('../data/space_weather_fallback.json', import.meta.url), 'utf8')).flares;
const MAY_FILE = new URL('../data/flares_2024_05.json', import.meta.url);
const FIX = { power: 'rest', oxygen: 'oxygen_gen', shielding: 'reinforce_shield', food: 'grow_food' };
const ROLES = {
  'power-first tie': ['power', 'oxygen', 'shielding', 'food'],
  'air-first tie': ['oxygen', 'power', 'shielding', 'food'],
  'shield-first tie': ['shielding', 'power', 'oxygen', 'food'],
};
function choose(state, priority) {
  const lowest = [...priority].sort((a, b) => state[a] - state[b])[0];
  return state[lowest] > 60 ? 'science' : FIX[lowest];
}
function play(site, seed, priority, firstWeather) {
  let state = newGame(site, seed);
  // README documents this override for the initial display only. nextSol rolls weather anew.
  if (firstWeather) state = { ...state, weather: firstWeather };
  while (state.status === 'playing') {
    while (state.actionsLeft > 0) {
      const id = choose(state, priority);
      if (!getActions(state).some(a => a.id === id)) throw new Error('Unknown public action');
      state = applyAction(state, id);
    }
    state = nextSol(state).state;
  }
  return state.status === 'won';
}
function rate(site, priority, weatherAtStart) {
  let wins = 0;
  for (let seed = 1; seed <= GAMES; seed++) wins += Number(play(site, seed, priority, weatherAtStart));
  return 100 * wins / GAMES;
}
const results = [];
for (const site of ['moon', 'mars']) {
  for (const [role, priority] of Object.entries(ROLES)) results.push({ group: `${site}; ${role} policy`, rate: rate(site, priority) });
}
// The data source is not a public engine parameter. These rows compare only the documented
// first-sol weather override and are deliberately excluded from the balance verdict.
const realAvailable = existsSync(MAY_FILE);
const mayWeather = 'storm'; // NASA CCMC recorded X-class flares in May 2024.
const fallbackWeather = FALLBACK.find(f => f.class.startsWith('C')) ? 'calm' : null;
const baseline = ROLES['power-first tie'];
for (const site of ['moon', 'mars']) {
  results.push({ group: `${site}; May 2024 X-class example (first-sol only)`, rate: rate(site, baseline, mayWeather), diagnostic: true });
  if (fallbackWeather) results.push({ group: `${site}; fallback C-class example (first-sol only)`, rate: rate(site, baseline, fallbackWeather), diagnostic: true });
}
console.log(`Extra balance audit: ${GAMES} seeds per row`);
for (const r of results) console.log(`${r.group}: ${r.rate.toFixed(1)}% wins${r.diagnostic ? ' [diagnostic]' : ''}`);
console.log(realAvailable ? 'May 2024 file exists; this test does not import it into the engine.' : 'May 2024 file absent; X-class example is sourced from NASA CCMC, not local records.');
console.log('No crew-choice API exists; policy rows are action-priority proxies, not crew-member results.');
const failures = results.filter(r => !r.diagnostic && (r.rate < 15 || r.rate > 85));
console.log(failures.length ? `FAIL: ${failures.map(r => r.group).join('; ')} outside 15–85%.` : 'PASS: all measured site/policy rows are within 15–85%.');
if (failures.length) process.exitCode = 1;
