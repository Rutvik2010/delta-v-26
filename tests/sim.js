// Delta-V 26 balance simulator.
// Plays 1000 games per strategy on each site, with random weather and with
// the real May 2024 weather, and prints win rates.
// Run from the project root:  node tests/sim.js
// Needs Node 22.12 or newer. No packages.

import { newGame, getActions, applyAction, nextSol, resolveEvent, getUpgrades, buyUpgrade, getTasks, getStars, withRealWeather } from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";

const GAMES = 1000;
const SITES = ["moon", "mars"];
const RESOURCES = ["power", "oxygen", "shielding", "food"];
const CREW = ["maya", "leo", "zuri"];
const FIX = { power: "rest", oxygen: "oxygen_gen", shielding: "reinforce_shield", food: "grow_food" };

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

const lowest = (s) => Math.min(...RESOURCES.map((k) => s[k]));
const freeCrew = (s) => CREW.filter((id) => !s.crew[id].job);

// A strategy has: act(state, rng) -> { action, crew } or null, choose(state, event, rng) -> choice id,
// and shop(state) -> state (buy upgrades).
const STRATEGIES = {
  // Never does anything. Must lose.
  "do-nothing": { act: () => null, choose: () => null, shop: (s) => s },

  // Picks any crew, any job, any choice. Like a kid mashing buttons.
  random: {
    act: (s, rng) => {
      const free = freeCrew(s);
      const actions = getActions(s);
      return { crew: free[Math.floor(rng() * free.length)], action: actions[Math.floor(rng() * actions.length)].id };
    },
    choose: (s, ev, rng) => ev.choices[Math.floor(rng() * ev.choices.length)].id,
    shop: (s) => s,
  },

  // Fixes the lowest resource, sends the best rested crew member,
  // picks the gentler choice and buys upgrades when it can.
  greedy: {
    act: (s) => {
      const low = [...RESOURCES].sort((a, b) => s[a] - s[b])[0];
      const action = s[low] > 60 ? "science" : FIX[low];
      const score = (id) => {
        const a = getActions(s, id).find((x) => x.id === action);
        return (a.skilled ? 2 : 0) - (a.tired ? 3 : 0);
      };
      const crew = freeCrew(s).sort((a, b) => score(b) - score(a))[0];
      return { crew, action };
    },
    // Try each choice and keep the one that leaves the base in the best shape.
    choose: (s, ev) => {
      const worth = (id) => { const r = resolveEvent(s, id); return r.status === "lost" ? -999 : lowest(r) + r.actionsLeft * 6; };
      return [...ev.choices].sort((a, b) => worth(b.id) - worth(a.id))[0].id;
    },
    shop: (s) => {
      const u = getUpgrades(s).find((x) => x.canBuy);
      return u ? buyUpgrade(s, u.id) : s;
    },
  },
};
// The same careful player, but one who also wins every minigame.
STRATEGIES["greedy+bonus"] = { ...STRATEGIES.greedy, bonus: true };

// Play one full game. Returns the final state.
function playGame(site, seed, strategy, plan) {
  const rng = mulberry32(seed * 7919);
  let state = newGame(site, seed);
  if (plan) state = withRealWeather(state, plan);
  while (state.status === "playing") {
    state = strategy.shop(state);
    while (state.actionsLeft > 0 && state.status === "playing") {
      const move = strategy.act(state, rng);
      if (!move || !move.crew) break;
      state = applyAction(state, move.action, { crew: move.crew, bonus: !!strategy.bonus });
    }
    const out = nextSol(state);
    state = out.state;
    if (out.event && out.event.choices && state.status === "playing") {
      state = resolveEvent(state, strategy.choose(state, out.event, rng));
    }
  }
  return state;
}

// Quick engine checks, so a broken engine does not give fake balance numbers.
function checkEngine() {
  const problems = [];
  const start = newGame("mars", 99);
  const before = JSON.stringify(start);
  applyAction(start, "science", { crew: "zuri", bonus: true });
  nextSol(start);
  buyUpgrade({ ...start, science: 99 }, "recycler");
  if (JSON.stringify(start) !== before) problems.push("Engine changed the input state.");

  const a = JSON.stringify(playGame("moon", 5, STRATEGIES.greedy));
  const b = JSON.stringify(playGame("moon", 5, STRATEGIES.greedy));
  if (a !== b) problems.push("Same seed did not give the same game.");

  const ids = getActions(start).map((x) => x.id).join(",");
  if (ids !== "oxygen_gen,reinforce_shield,grow_food,rest,science") problems.push("Action ids are wrong: " + ids);

  // Old-style calls (no crew, no choices answered) must still work.
  let old = newGame("moon", 3);
  for (let i = 0; i < 40 && old.status === "playing"; i++) { old = applyAction(old, "rest"); old = nextSol(old).state; }
  if (old.status === "playing") problems.push("Old-style calls got stuck.");

  // Skill and tiredness.
  const skilled = getActions(start, "zuri").find((x) => x.id === "science").gain.science;
  const plain = getActions(start, "leo").find((x) => x.id === "science").gain.science;
  if (skilled <= plain) problems.push("Skill gives no bonus.");
  const twice = applyAction(applyAction(start, "science", { crew: "zuri" }), "rest", { crew: "zuri" });
  if (twice.actionsLeft !== 1) problems.push("A crew member did two jobs in one sol.");
  return problems;
}

function pad(text, width) {
  return String(text).padEnd(width);
}

// ---- Run ----

const problems = checkEngine();
const plan = await loadRealWeather();
if (!plan) problems.push("Could not load data/flares_2024_05.json.");
const results = {};

console.log("Delta-V 26 balance sim: " + GAMES + " games per strategy\n");
console.log(pad("weather", 9) + pad("site", 6) + pad("strategy", 14) + pad("win rate", 10) + pad("avg sols", 10) + pad("stars", 7) + pad("tasks", 7) + "top loss reason");

for (const mode of plan ? ["random", "real"] : ["random"]) {
  results[mode] = {};
  for (const site of SITES) {
    results[mode][site] = {};
    for (const name in STRATEGIES) {
      let wins = 0, sols = 0, stars = 0, tasks = 0;
      const reasons = {};
      for (let seed = 1; seed <= GAMES; seed++) {
        const end = playGame(site, seed, STRATEGIES[name], mode === "real" ? plan : null);
        if (end.status === "won") wins++;
        sols += end.sol;
        stars += getStars(end);
        tasks += getTasks(end).filter((t) => t.status === "done").length;
        if (end.lossReason) reasons[end.lossReason] = (reasons[end.lossReason] || 0) + 1;
      }
      const winRate = (100 * wins) / GAMES;
      const top = Object.entries(reasons).sort((x, y) => y[1] - x[1])[0];
      results[mode][site][name] = { winRate, avgSols: sols / GAMES };
      console.log(
        pad(mode, 9) + pad(site, 6) + pad(name, 14) + pad(winRate.toFixed(1) + "%", 10) + pad((sols / GAMES).toFixed(1), 10) +
          pad((stars / GAMES).toFixed(2), 7) + pad((tasks / GAMES).toFixed(2), 7) + (top ? top[0] + " (" + top[1] + ")" : "-")
      );
    }
  }
}

// ---- Balance verdict ----
// Goals: do-nothing loses. No strategy wins 100%. Careful play usually wins.
// Button mashing should last a while but rarely win. Sites should feel close.

for (const mode in results) {
  for (const site of SITES) {
    const r = results[mode][site];
    const at = mode + " " + site + ": ";
    if (r["do-nothing"].winRate > 0) problems.push(at + "do-nothing can win.");
    if (r["greedy+bonus"].winRate < r.greedy.winRate) problems.push(at + "winning minigames does not help.");
    if (r.greedy.winRate < 60) problems.push(at + "greedy wins under 60%. Too hard.");
    if (r.greedy.winRate > 92) problems.push(at + "greedy wins over 92%. Too easy.");
    if (r.random.winRate >= r.greedy.winRate) problems.push(at + "random does as well as greedy.");
    if (r.random.winRate > 25) problems.push(at + "random wins over 25%. Too easy.");
    if (r.random.avgSols < 9) problems.push(at + "random lasts under 9 sols on average. Too harsh for kids.");
  }
  const gap = Math.abs(results[mode].moon.greedy.winRate - results[mode].mars.greedy.winRate);
  if (gap > 15) problems.push(mode + ": Moon and Mars are " + gap.toFixed(1) + " points apart for greedy. Sites feel uneven.");
}

console.log("");
if (problems.length === 0) {
  console.log("BALANCE OK");
} else {
  console.log("BALANCE OFF:");
  for (const p of problems) console.log(" - " + p);
  process.exitCode = 1;
}
