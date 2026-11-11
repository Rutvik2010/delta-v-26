// Delta-V 26 balance simulator.
// Plays 1000 games per strategy on each site and prints win rates.
// Run from the project root:  node tests/sim.js
// Needs Node 22.12 or newer. No packages.

import { newGame, getActions, applyAction, nextSol } from "../engine/index.js";

const GAMES = 1000;
const SITES = ["moon", "mars"];
const RESOURCES = ["power", "oxygen", "shielding", "food"];

// Which action fixes which resource.
const FIX = {
  power: "rest",
  oxygen: "oxygen_gen",
  shielding: "reinforce_shield",
  food: "grow_food",
};

// Seeded random for the random strategy, so every run prints the same numbers.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A strategy takes (state, rng) and returns an action id, or null to do nothing.
const STRATEGIES = {
  // Never does anything. Must lose.
  "do-nothing": () => null,

  // Picks any of the 5 actions. Like a kid mashing buttons.
  random: (state, rng) => {
    const actions = getActions(state);
    return actions[Math.floor(rng() * actions.length)].id;
  },

  // Always fixes the lowest resource. Does science only when all are high.
  greedy: (state) => {
    const lowest = [...RESOURCES].sort((a, b) => state[a] - state[b])[0];
    return state[lowest] > 60 ? "science" : FIX[lowest];
  },
};

// Play one full game. Returns the final state.
function playGame(site, seed, strategy) {
  const rng = mulberry32(seed * 7919);
  let state = newGame(site, seed);
  while (state.status === "playing") {
    while (state.actionsLeft > 0) {
      const id = strategy(state, rng);
      if (!id) break;
      state = applyAction(state, id);
    }
    state = nextSol(state).state;
  }
  return state;
}

// Quick engine checks, so a broken engine does not give fake balance numbers.
function checkEngine() {
  const problems = [];
  const start = newGame("mars", 99);
  const before = JSON.stringify(start);
  applyAction(start, "science");
  nextSol(start);
  if (JSON.stringify(start) !== before) problems.push("Engine changed the input state.");

  const a = JSON.stringify(playGame("moon", 5, STRATEGIES.greedy));
  const b = JSON.stringify(playGame("moon", 5, STRATEGIES.greedy));
  if (a !== b) problems.push("Same seed did not give the same game.");

  const ids = getActions(start).map((x) => x.id).join(",");
  if (ids !== "oxygen_gen,reinforce_shield,grow_food,rest,science") problems.push("Action ids are wrong: " + ids);
  return problems;
}

function pad(text, width) {
  return String(text).padEnd(width);
}

// ---- Run ----

const problems = checkEngine();
const results = {};

console.log("Delta-V 26 balance sim: " + GAMES + " games per strategy\n");
console.log(pad("site", 6) + pad("strategy", 12) + pad("win rate", 10) + pad("avg sols", 10) + pad("avg science", 13) + "top loss reason");

for (const site of SITES) {
  results[site] = {};
  for (const name in STRATEGIES) {
    let wins = 0;
    let sols = 0;
    let science = 0;
    const reasons = {};
    for (let seed = 1; seed <= GAMES; seed++) {
      const end = playGame(site, seed, STRATEGIES[name]);
      if (end.status === "won") wins++;
      sols += end.sol;
      science += end.science;
      if (end.lossReason) reasons[end.lossReason] = (reasons[end.lossReason] || 0) + 1;
    }
    const winRate = (100 * wins) / GAMES;
    const top = Object.entries(reasons).sort((x, y) => y[1] - x[1])[0];
    results[site][name] = { winRate, avgSols: sols / GAMES };
    console.log(
      pad(site, 6) + pad(name, 12) + pad(winRate.toFixed(1) + "%", 10) + pad((sols / GAMES).toFixed(1), 10) +
        pad((science / GAMES).toFixed(0), 13) + (top ? top[0] + " (" + top[1] + ")" : "-")
    );
  }
}

// ---- Balance verdict ----
// Goals: do-nothing loses. No strategy wins 100%. Careful play usually wins.
// Button mashing should last a while but rarely win. Sites should feel close.

for (const site of SITES) {
  const r = results[site];
  if (r["do-nothing"].winRate > 0) problems.push(site + ": do-nothing can win.");
  if (r.greedy.winRate >= 100) problems.push(site + ": greedy wins every game.");
  if (r.greedy.winRate < 60) problems.push(site + ": greedy wins under 60%. Too hard.");
  if (r.random.winRate >= r.greedy.winRate) problems.push(site + ": random does as well as greedy.");
  if (r.random.winRate > 25) problems.push(site + ": random wins over 25%. Too easy.");
  if (r.random.avgSols < 10) problems.push(site + ": random lasts under 10 sols on average. Too harsh for kids.");
}
const gap = Math.abs(results.moon.greedy.winRate - results.mars.greedy.winRate);
if (gap > 15) problems.push("Moon and Mars are " + gap.toFixed(1) + " points apart for greedy. Sites feel uneven.");

console.log("");
if (problems.length === 0) {
  console.log("BALANCE OK");
} else {
  console.log("BALANCE OFF:");
  for (const p of problems) console.log(" - " + p);
  process.exitCode = 1;
}
