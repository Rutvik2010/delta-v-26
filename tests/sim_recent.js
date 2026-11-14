// Delta-V 26 balance simulator for recent 2026 DONKI weather snapshot.
// Run from the project root:  node tests/sim_recent.js
// Needs Node 22.12 or newer. No packages.

import { newGame, getActions, applyAction, nextSol, resolveEvent, getUpgrades, buyUpgrade, getTasks, getStars, withRealWeather } from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";

const GAMES = 1000;
const SITES = ["moon", "mars"];
const RESOURCES = ["power", "oxygen", "shielding", "food"];
const CREW = ["maya", "leo", "zuri"];
const FIX = { power: "rest", oxygen: "oxygen_gen", shielding: "reinforce_shield", food: "grow_food" };

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

const STRATEGIES = {
  "do-nothing": { act: () => null, choose: () => null, shop: (s) => s },
  random: {
    act: (s, rng) => {
      const free = freeCrew(s);
      const actions = getActions(s);
      return { crew: free[Math.floor(rng() * free.length)], action: actions[Math.floor(rng() * actions.length)].id };
    },
    choose: (s, ev, rng) => ev.choices[Math.floor(rng() * ev.choices.length)].id,
    shop: (s) => s,
  },
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
STRATEGIES["greedy+bonus"] = { ...STRATEGIES.greedy, bonus: true };

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

function pad(text, width) {
  return String(text).padEnd(width);
}

const problems = [];
const plan = await loadRealWeather("recent");
if (!plan) problems.push("Could not load data/flares_recent_2026.json.");
if (plan && plan.length !== 30) problems.push("Recent dataset length is not 30: " + plan?.length);
if (plan && plan[0].date !== "2026-10-15") problems.push("First date is not 2026-10-15: " + plan[0].date);
if (plan && plan[29].date !== "2026-11-13") problems.push("Last date is not 2026-11-13: " + plan[29].date);

const results = {};
console.log("Delta-V 26 balance sim (RECENT 2026 DATA): " + GAMES + " games per strategy\n");
console.log(pad("weather", 9) + pad("site", 6) + pad("strategy", 14) + pad("win rate", 10) + pad("avg sols", 10) + pad("stars", 7) + pad("tasks", 7) + "top loss reason");

for (const site of SITES) {
  results[site] = {};
  for (const name in STRATEGIES) {
    let wins = 0, sols = 0, stars = 0, tasks = 0;
    const reasons = {};
    for (let seed = 1; seed <= GAMES; seed++) {
      const end = playGame(site, seed, STRATEGIES[name], plan);
      if (end.status === "won") wins++;
      sols += end.sol;
      stars += getStars(end);
      tasks += getTasks(end).filter((t) => t.status === "done").length;
      if (end.lossReason) reasons[end.lossReason] = (reasons[end.lossReason] || 0) + 1;
    }
    const winRate = (100 * wins) / GAMES;
    const top = Object.entries(reasons).sort((x, y) => y[1] - x[1])[0];
    results[site][name] = { winRate, avgSols: sols / GAMES };
    console.log(
      pad("recent", 9) + pad(site, 6) + pad(name, 14) + pad(winRate.toFixed(1) + "%", 10) + pad((sols / GAMES).toFixed(1), 10) +
        pad((stars / GAMES).toFixed(2), 7) + pad((tasks / GAMES).toFixed(2), 7) + (top ? top[0] + " (" + top[1] + ")" : "-")
    );
  }
}

for (const site of SITES) {
  const r = results[site];
  const at = "recent " + site + ": ";
  if (r["do-nothing"].winRate > 0) problems.push(at + "do-nothing can win.");
  if (r.greedy.winRate < 60) problems.push(at + "greedy wins under 60%. Too hard.");
  if (r.random.winRate >= r.greedy.winRate) problems.push(at + "random does as well as greedy.");
  if (r.random.winRate > 25) problems.push(at + "random wins over 25%. Too easy.");
  if (r.random.avgSols < 9) problems.push(at + "random lasts under 9 sols on average.");
}

console.log("");
if (problems.length === 0) {
  console.log("RECENT DATA BALANCE OK");
} else {
  console.log("RECENT DATA BALANCE PROBLEMS:");
  for (const p of problems) console.log(" - " + p);
  process.exitCode = 1;
}
