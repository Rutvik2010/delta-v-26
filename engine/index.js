// Delta-V 26 engine.
// The engine never changes the state you pass in. It always returns a new object.
// The first four functions (newGame, getActions, applyAction, nextSol) are the
// original contract. Everything else is optional and adds challenge on top.

const RESOURCES = ["power", "oxygen", "shielding", "food"];
const WIN_SOL = 30;
const ACTIONS_PER_SOL = 2;

// ---- Balance numbers. Tuned with tests/sim.js. Rerun it after any change. ----

// Every resource drops a little each sol.
const DAILY_DRAIN = { power: 3, oxygen: 6, shielding: 4, food: 6 };

// Space weather wears the shield down faster.
const WEATHER_SHIELD_DRAIN = { calm: 0, active: 3, storm: 7 };

// Weak shield + bad weather = sick crew. Extra drain on food and oxygen.
const WEAK_SHIELD = 30;
const SICK_DRAIN = { calm: 0, active: 4, storm: 6 };

// Real weather plans can be much stormier than random weather. May 2024 was
// the stormiest month in 20 years. So in a real-weather game, each bit of
// storm damage is scaled down by this much to keep the mission fair.
const REAL_WEATHER_SCALE = 0.55;

// Chance of each kind of weather on a new sol. Must add up to 1.
const WEATHER_ODDS = { calm: 0.6, active: 0.28, storm: 0.12 };

// Chance that an event fires on a new sol.
const EVENT_CHANCE = 0.4;

// Moon: 14 sols of light, then 14 sols of night. Rest makes less power at night.
const MOON_DAY_LENGTH = 14;
const REST_GAIN = 16;
const REST_GAIN_MOON_NIGHT = 12;
const MARS_REST_LOSS = 3;

// Crew. Each one is best at some jobs. Working two sols in a row makes them tired.
const CREW_IDS = ["maya", "leo", "zuri"];
const SKILLS = { maya: ["oxygen_gen", "reinforce_shield"], leo: ["grow_food"], zuri: ["science"] };
const SKILL_BONUS = 4;    // added to the main gain when the job matches the skill
const TIRED_PENALTY = 4;  // taken off the main gain when the crew member is tired
const PERFECT_BONUS = 2;  // added when the player wins the job's minigame

const ACTIONS = [
  {
    id: "oxygen_gen",
    label: "Make Oxygen",
    cost: { power: 5 },
    gain: { oxygen: 14 },
    tip: "The oxygen machine gives the crew air to breathe. It uses power.",
  },
  {
    id: "reinforce_shield",
    label: "Fix the Shield",
    cost: { power: 5 },
    gain: { shielding: 14 },
    tip: "A strong shield keeps the crew safe from space rays. It uses power.",
  },
  {
    id: "grow_food",
    label: "Grow Food",
    cost: { power: 5 },
    gain: { food: 14 },
    tip: "Plants need light to grow. The grow lights use power.",
  },
  {
    id: "rest",
    label: "Rest",
    cost: { food: 6 },
    gain: { power: REST_GAIN },
    tip: "The crew is too tired to work. They rest while the batteries charge. They still need to eat.",
  },
  {
    id: "science",
    label: "Do Science",
    cost: { power: 5, oxygen: 4 },
    gain: { science: 10 },
    tip: "Science is why we came here! It uses power and air.",
  },
];

// Upgrades are bought with science points. They last for the whole mission.
const UPGRADES = [
  { id: "solar_array", label: "Bigger solar tower", cost: 30, text: "Resting gives 4 more power." },
  { id: "greenhouse2", label: "Second greenhouse", cost: 30, text: "Growing food gives 4 more food." },
  { id: "recycler", label: "Air recycler", cost: 40, text: "The crew uses 2 less oxygen every sol." },
  { id: "thick_shield", label: "Thicker soil shield", cost: 50, text: "Sun storms do half as much damage to the shield." },
];

// Mission Control tasks. "count" tasks count a job. "hold" tasks keep a level.
const TASKS = [
  { id: "science3", type: "count", action: "science", goal: 3, by: 10, reward: { food: 15 },
    label: (m) => (m ? "Collect rocks 3 times by sol 10" : "Hunt for ice 3 times by sol 10") },
  { id: "garden4", type: "count", action: "grow_food", goal: 4, by: 18, reward: { power: 10 },
    label: () => "Tend the garden 4 times by sol 18" },
  { id: "stormweek", type: "hold", resource: "shielding", above: 40, from: 9, to: 15, reward: { science: 20 },
    label: () => "Keep the shield above 40 from sol 9 to sol 15" },
];

// ---- Events ----
// weight(state) says how likely the event is. 0 means it cannot happen.
// realFact can be a string or a function of the site.
// Events with `choices` wait for the player. The second choice is the "do nothing" one.
const EVENTS = [
  {
    id: "solar_flare",
    title: "Solar flare coming!",
    text: "A huge burst of energy has left the Sun. It will hit the base today. What should the crew do?",
    realFact:
      "In August 1972, a huge solar storm hit between two Apollo Moon trips. Astronauts on the Moon would have been in danger.",
    choices: [
      { id: "shelter", label: "Hide in the shelter", text: "Everyone stays safe, but you lose one job today.", effects: { actionsLeft: -1 } },
      { id: "work", label: "Keep working", text: "You keep your jobs, but the shield takes the hit.", effects: { shielding: -15 } },
    ],
    weight: (s) => (s.weather === "storm" ? 5 : s.weather === "active" ? 3 : 0),
  },
  {
    id: "dust_storm",
    title: "Dust storm!",
    text: "Dust fills the sky and settles on the solar panels. The plants get less light too. What should the crew do?",
    realFact:
      "In 2018, a dust storm covered all of Mars. The Opportunity rover lost power and never woke up again.",
    choices: [
      { id: "clean", label: "Clean the panels", text: "The panels keep working, but you lose one job today.", effects: { actionsLeft: -1 } },
      { id: "leave", label: "Leave them dusty", text: "You keep your jobs, but you lose power and food.", effects: { power: -18, food: -8 } },
    ],
    weight: (s) => (s.site === "mars" ? 6 : 0),
  },
  {
    id: "micrometeorite",
    title: "Tiny space rock!",
    text: "A rock as small as a grain of sand hit the base. It made a small hole, and air is leaking. What should the crew do?",
    realFact:
      "The Moon has no air to burn up tiny space rocks. They hit the ground faster than a bullet.",
    choices: [
      { id: "patch", label: "Patch it right now", text: "The welder uses a lot of power, but the leak stops.", effects: { power: -10 } },
      { id: "later", label: "Patch it later", text: "You save power, but you lose air and some shield.", effects: { oxygen: -8, shielding: -8 } },
    ],
    weight: (s) => (s.site === "moon" ? 3 : 0),
  },
  {
    id: "equipment_failure",
    title: "Broken machine!",
    text: "The oxygen machine has stopped working. What should the crew do?",
    realFact:
      "The oxygen machine on the International Space Station has broken down before. The crew fixed it with spare parts.",
    choices: [
      { id: "spare", label: "Use a spare part", text: "A quick fix. Building the part uses power.", effects: { power: -8 } },
      { id: "hand", label: "Fix it by hand", text: "It takes a long time. You lose one job and a little air.", effects: { actionsLeft: -1, oxygen: -4 } },
    ],
    weight: () => 2,
  },
  {
    id: "comm_blackout",
    title: "Radio blackout!",
    text: "The radio to Earth is down. The crew must solve problems alone, so you get one less job this sol.",
    realFact: (site) =>
      site === "mars"
        ? "A radio message takes 4 to 24 minutes to go from Mars to Earth. About every two years the Sun gets in the way, and NASA stops sending commands for two weeks."
        : "The Moon blocks radio signals. Apollo astronauts lost contact with Earth each time they flew behind the Moon.",
    effects: { actionsLeft: -1 },
    weight: () => 2,
  },
];

// ---- Helpers ----

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

// Copy the state so the input is never changed.
function copy(state) {
  return { ...state, log: [...state.log] };
}

// Seeded random. Same seed = same numbers.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One random generator per sol, made from the seed and the sol number.
// This keeps the engine pure: no hidden random state between calls.
function rngForSol(seed, sol) {
  return mulberry32((seed + Math.imul(sol, 0x9e3779b1)) >>> 0);
}

// Moon only: sols 1-14 are day, 15-28 are night, then day again.
function isMoonNight(state) {
  if (state.site !== "moon") return false;
  return (state.sol - 1) % (MOON_DAY_LENGTH * 2) >= MOON_DAY_LENGTH;
}

function rollWeather(rng) {
  const r = rng();
  if (r < WEATHER_ODDS.calm) return "calm";
  if (r < WEATHER_ODDS.calm + WEATHER_ODDS.active) return "active";
  return "storm";
}

// Real weather plan: one entry per sol, { weather, class, date }. Null if there is none.
function plannedDay(state, sol) {
  const plan = state.weatherPlan;
  return (Array.isArray(plan) && plan[sol - 1]) || null;
}

function has(state, upgradeId) {
  return Array.isArray(state.upgrades) && state.upgrades.includes(upgradeId);
}

// How much of a Sun storm's shield damage gets through.
function stormScale(state, planned) {
  return (planned ? REAL_WEATHER_SCALE : 1) * (has(state, "thick_shield") ? 0.5 : 1);
}

// Maybe pick an event for this sol. Returns the event to hand to the UI, or null.
function rollEvent(state, rng) {
  if (rng() >= EVENT_CHANCE) return null;

  const pool = EVENTS.map((e) => ({ e, w: e.weight(state) })).filter((x) => x.w > 0);
  const total = pool.reduce((sum, x) => sum + x.w, 0);
  let r = rng() * total;
  for (const { e, w } of pool) {
    r -= w;
    if (r < 0) {
      const event = {
        id: e.id,
        title: e.title,
        text: e.text,
        realFact: typeof e.realFact === "function" ? e.realFact(state.site) : e.realFact,
        effects: { ...(e.effects || {}) },
      };
      if (e.choices) event.choices = e.choices.map((c) => ({ ...c, effects: { ...c.effects } }));
      return event;
    }
  }
  return null;
}

// Add or take away resources. Science is a score, so it has no top limit.
function applyEffects(state, effects) {
  for (const key in effects) {
    if (key === "actionsLeft") state.actionsLeft = Math.max(0, state.actionsLeft + effects[key]);
    else if (key === "science") {
      state.science += effects[key];
      if (effects[key] > 0) state.stats = { ...state.stats, scienceEarned: (state.stats.scienceEarned || 0) + effects[key] };
    } else state[key] = clamp(state[key] + effects[key]);
  }
}

// One short sentence for kids about why the game was lost.
function lossReasonFor(resource, info) {
  const ev = info.event;
  if (resource === "oxygen") {
    if (ev && ev.effects.oxygen) return "The crew ran out of oxygen after the outpost lost too much air.";
    if (info.sick) return "The weak shield made the crew sick, and they ran out of oxygen.";
    if (info.lowPower) return "The crew ran out of oxygen because there was not enough power to run the generator.";
    return "The crew ran out of oxygen because the oxygen machine was not used enough.";
  }
  if (resource === "power") {
    if (ev && ev.id === "dust_storm") return "A dust storm covered the solar panels, and the outpost ran out of power.";
    if (ev && ev.effects.power) return "Fixing the base used up the last of the power.";
    if (info.moonNight) return "The long Moon night came, and the outpost ran out of power.";
    return "The outpost ran out of power because the crew did not rest enough to charge the batteries.";
  }
  if (resource === "food") {
    if (info.sick) return "The weak shield made the crew sick, and they ran out of food.";
    return "The crew ran out of food because not enough plants were grown.";
  }
  // shielding
  if (ev && ev.effects.shielding) return "The shield was too weak to take another hit, and it broke.";
  return "The shield wore away, so the crew was not safe from space rays.";
}

// Set status to lost or won if the game is over. info is for the loss sentence.
function checkEnd(state, info) {
  const tag = "Sol " + state.sol + ": ";
  const empty = RESOURCES.find((key) => state[key] <= 0);
  if (empty) {
    state.status = "lost";
    state.pendingEvent = null;
    state.lossReason = lossReasonFor(empty, info);
    state.log.push(tag + state.lossReason);
  } else if (state.sol >= WIN_SOL && !state.pendingEvent) {
    state.status = "won";
    state.log.push(tag + "You did it! The crew is safe. Mission complete!");
  }
}

// "Hold" tasks fail the moment the level drops too low inside their window.
function noteHolds(state) {
  for (const t of TASKS) {
    if (t.type !== "hold" || state.sol < t.from || state.sol > t.to) continue;
    if (state[t.resource] <= t.above) state.stats = { ...state.stats, ["failed_" + t.id]: true };
  }
}

// Mark tasks done or failed, and hand out rewards.
function checkTasks(state) {
  const done = state.tasksDone || [];
  const failed = state.tasksFailed || [];
  for (const t of TASKS) {
    if (done.includes(t.id) || failed.includes(t.id)) continue;
    let result = null;
    if (t.type === "count") {
      if ((state.stats[t.action] || 0) >= t.goal && state.sol <= t.by) result = "done";
      else if (state.sol > t.by) result = "failed";
    } else {
      if (state.stats["failed_" + t.id]) result = "failed";
      else if (state.sol > t.to) result = "done";
    }
    if (result === "done") {
      state.tasksDone = [...(state.tasksDone || []), t.id];
      applyEffects(state, t.reward);
      state.log.push("Sol " + state.sol + ": Mission Control task done! " + t.label(state.site === "mars") + ".");
    } else if (result === "failed") {
      state.tasksFailed = [...(state.tasksFailed || []), t.id];
    }
  }
}

function freshCrew() {
  const crew = {};
  for (const id of CREW_IDS) crew[id] = { tired: false, job: null };
  return crew;
}

// ---- API: the original contract ----

// Start a new game. Same site + same seed = same game.
export function newGame(site, seed) {
  const place = site === "mars" ? "mars" : "moon";
  const name = place === "mars" ? "Mars" : "the Moon";
  const s = Number.isFinite(seed) ? seed >>> 0 : (Math.random() * 4294967296) >>> 0;
  return {
    sol: 1,
    power: 70,
    oxygen: 70,
    shielding: 50,
    food: 60,
    science: 0,
    actionsLeft: ACTIONS_PER_SOL,
    site: place,
    weather: "calm",
    log: ["Sol 1: Welcome to " + name + "! Keep your crew safe for 30 sols."],
    status: "playing",
    lossReason: null,
    // Extra fields, beyond the first contract:
    seed: s,
    crew: freshCrew(),
    upgrades: [],
    stats: {},
    tasksDone: [],
    tasksFailed: [],
    pendingEvent: null,
  };
}

// The 5 actions the player can pick, with the real numbers for this sol.
// Pass a crew id ("maya", "leo", "zuri") to get the numbers for that person:
// their skill and tiredness are already counted. Each action also carries
// main (the resource it mostly gives), skilled and tired.
export function getActions(state, crewId) {
  const night = isMoonNight(state);
  const member = crewId && state.crew ? state.crew[crewId] : null;
  return ACTIONS.map((a) => {
    const action = { ...a, cost: { ...a.cost }, gain: { ...a.gain } };
    const main = Object.keys(a.gain)[0];
    action.main = main;
    if (a.id === "rest") {
      if (night) {
        action.gain.power = REST_GAIN_MOON_NIGHT;
        action.tip = "It is night on the Moon, so the solar panels are dark. Resting gives less power. The crew still needs to eat.";
      }
      // The Sun is weaker on Mars, so the batteries charge more slowly.
      if (state.site === "mars") action.gain.power -= MARS_REST_LOSS;
      if (has(state, "solar_array")) action.gain.power += 4;
    }
    if (a.id === "grow_food" && has(state, "greenhouse2")) action.gain.food += 4;
    action.skilled = !!member && (SKILLS[crewId] || []).includes(a.id);
    action.tired = !!member && member.tired && a.id !== "rest";
    if (action.skilled) action.gain[main] += SKILL_BONUS;
    if (action.tired) action.gain[main] -= TIRED_PENALTY;
    return action;
  });
}

// Do one action. Returns a new state.
// opts.crew: who does the job. Each crew member can do one job per sol.
// opts.bonus: true if the player won the job's minigame. Adds a little extra.
// Blocked (state comes back the same) if the game is over, there are no
// actions left, an event is waiting for a choice, the id is not known, or
// that crew member is already busy.
export function applyAction(state, actionId, opts = {}) {
  const next = copy(state);
  if (next.status !== "playing") return next;
  if (next.actionsLeft <= 0) return next;
  if (next.pendingEvent) return next;

  const crewId = opts.crew || null;
  if (crewId && (!next.crew || !next.crew[crewId] || next.crew[crewId].job)) return next;

  const action = getActions(next, crewId).find((a) => a.id === actionId);
  if (!action) return next;
  if (opts.bonus) action.gain[action.main] += PERFECT_BONUS;

  next.stats = { ...(next.stats || {}), [actionId]: ((next.stats || {})[actionId] || 0) + 1 };
  applyEffects(next, Object.fromEntries(Object.entries(action.cost).map(([k, v]) => [k, -v])));
  applyEffects(next, action.gain);
  if (crewId) next.crew = { ...next.crew, [crewId]: { ...next.crew[crewId], job: actionId } };

  next.actionsLeft -= 1;
  next.log.push("Sol " + next.sol + ": " + action.label + ".");
  checkTasks(next);
  return next;
}

// End the sol. Returns { state, event }. event is null on quiet sols.
// If event.choices exists, the event is waiting: call resolveEvent() with the
// player's choice. Until then no actions can be taken.
export function nextSol(state) {
  let next = copy(state);
  if (next.status !== "playing") return { state: next, event: null };

  // An event nobody answered takes the "do nothing" choice.
  if (next.pendingEvent) {
    next = resolveEvent(next, null);
    if (next.status !== "playing") return { state: next, event: null };
  }
  next.stats = { ...(next.stats || {}) };

  const lowPower = next.power <= 15; // for the loss sentence
  const wasNight = isMoonNight(next);

  // Crew who worked today are tired tomorrow. Resting or a day off fixes it.
  const crew = {};
  for (const id of CREW_IDS) {
    const m = (next.crew || {})[id] || { tired: false, job: null };
    crew[id] = { tired: !!m.job && m.job !== "rest", job: null };
  }
  next.crew = crew;

  next.sol += 1;
  next.actionsLeft = ACTIONS_PER_SOL;
  const tag = "Sol " + next.sol + ": ";

  const rng = rngForSol(next.seed >>> 0, next.sol);
  const rolled = rollWeather(rng); // always roll, so events stay the same with or without a plan
  const planned = plannedDay(next, next.sol);
  next.weather = planned ? planned.weather : rolled;

  // Daily drain.
  for (const key of RESOURCES) {
    const saved = key === "oxygen" && has(next, "recycler") ? 2 : 0;
    next[key] = clamp(next[key] - (DAILY_DRAIN[key] - saved));
  }
  const sickScale = planned ? REAL_WEATHER_SCALE : 1;
  const scale = stormScale(next, planned);
  next.shielding = clamp(next.shielding - Math.round(WEATHER_SHIELD_DRAIN[next.weather] * scale));

  // Weak shield in bad weather makes the crew sick.
  const sick = next.shielding < WEAK_SHIELD && next.weather !== "calm";
  if (sick) {
    next.food = clamp(next.food - Math.round(SICK_DRAIN[next.weather] * sickScale));
    next.oxygen = clamp(next.oxygen - Math.round(SICK_DRAIN[next.weather] * sickScale));
  }

  // Maybe an event.
  const event = rollEvent(next, rng);
  if (event && event.id === "solar_flare") {
    const hit = event.choices.find((c) => c.effects.shielding);
    hit.effects.shielding = Math.round(hit.effects.shielding * scale);
    // Real weather: tell the UI which real flare this was.
    if (planned && planned.class) event.flare = { class: planned.class, date: planned.date };
  }
  if (event && event.choices) next.pendingEvent = event;
  else if (event) applyEffects(next, event.effects);

  // Log what happened.
  const nowNight = isMoonNight(next);
  if (next.weather === "active") next.log.push(tag + "The Sun is active today. The shield is working hard.");
  if (next.weather === "storm") next.log.push(tag + "A space storm is here! The shield is taking a beating.");
  if (sick) next.log.push(tag + "The shield is weak, and the crew feels sick. They need more food and air.");
  if (nowNight && !wasNight) next.log.push(tag + "Night has come to the Moon. It will be dark for 14 sols. Resting gives less power.");
  if (!nowNight && wasNight) next.log.push(tag + "The Sun is back! The solar panels are working again.");
  if (event) next.log.push(tag + event.title + " " + event.text);

  noteHolds(next);
  checkEnd(next, { event: event && !event.choices ? event : null, sick, lowPower, moonNight: nowNight });
  if (next.status !== "lost") checkTasks(next);

  return { state: next, event: next.status === "lost" && event && event.choices ? null : event };
}

// ---- API: extras ----

// Answer a waiting event. choiceId is one of event.choices[].id.
// An unknown id takes the second, "do nothing" choice. Returns a new state.
export function resolveEvent(state, choiceId) {
  const next = copy(state);
  const event = next.pendingEvent;
  if (!event || next.status !== "playing") return next;
  const choice = event.choices.find((c) => c.id === choiceId) || event.choices[1];
  next.stats = { ...(next.stats || {}) };
  next.pendingEvent = null;
  applyEffects(next, choice.effects);
  next.log.push("Sol " + next.sol + ": " + choice.label + ".");
  noteHolds(next);
  checkEnd(next, { event: { id: event.id, effects: choice.effects }, sick: false, lowPower: false, moonNight: isMoonNight(next) });
  if (next.status !== "lost") checkTasks(next);
  return next;
}

// Upgrades the player can buy with science. Each has { id, label, cost, text, owned, canBuy }.
export function getUpgrades(state) {
  return UPGRADES.map((u) => ({ ...u, owned: has(state, u.id), canBuy: !has(state, u.id) && state.science >= u.cost && state.status === "playing" }));
}

// Spend science on an upgrade. Does not use up a job. Returns a new state.
export function buyUpgrade(state, upgradeId) {
  const next = copy(state);
  const u = getUpgrades(next).find((x) => x.id === upgradeId);
  if (!u || !u.canBuy) return next;
  next.science -= u.cost;
  next.upgrades = [...(next.upgrades || []), u.id];
  next.log.push("Sol " + next.sol + ": Built an upgrade: " + u.label + ".");
  return next;
}

// Mission Control tasks: [{ id, label, progress, goal, reward, status }].
// status is "active", "done" or "failed".
export function getTasks(state) {
  const mars = state.site === "mars";
  const stats = state.stats || {};
  return TASKS.map((t) => {
    const status = (state.tasksDone || []).includes(t.id) ? "done" : (state.tasksFailed || []).includes(t.id) ? "failed" : "active";
    let progress, goal;
    if (t.type === "count") {
      goal = t.goal;
      progress = Math.min(goal, stats[t.action] || 0);
    } else {
      goal = t.to - t.from + 1;
      progress = status === "done" ? goal : Math.max(0, Math.min(goal, state.sol - t.from + (stats["failed_" + t.id] ? 0 : 1)));
      if (state.sol < t.from) progress = 0;
    }
    return { id: t.id, label: t.label(mars), progress, goal, reward: { ...t.reward }, status };
  });
}

// Stars for a finished mission: 0 if lost, 1 for surviving,
// 2 with two tasks done, 3 with all three.
export function getStars(state) {
  if (state.status !== "won") return 0;
  const done = (state.tasksDone || []).length;
  return 1 + (done >= 2 ? 1 : 0) + (done >= 3 ? 1 : 0);
}

// Use real space weather for this game. plan is a list with one entry per sol:
// { weather, class, date }. Get it from loadRealWeather() in donki.js.
// Returns a new state. Sol 1 takes the first entry's weather.
export function withRealWeather(state, plan) {
  const next = copy(state);
  if (!Array.isArray(plan) || plan.length === 0) return next;
  next.weatherPlan = plan.map((d) => ({ weather: d.weather, class: d.class || null, date: d.date || null }));
  next.weather = next.weatherPlan[0].weather;
  return next;
}

// The weather for the next few sols, so the player can plan ahead.
// Returns [{ sol, weather, flare: { class, date } | null, real }].
// real is true only when the entry comes from a real weather plan.
export function getForecast(state, count = 3) {
  const out = [];
  for (let sol = state.sol + 1; sol <= WIN_SOL && out.length < count; sol++) {
    const planned = plannedDay(state, sol);
    if (planned) {
      out.push({ sol, weather: planned.weather, flare: planned.class ? { class: planned.class, date: planned.date } : null, real: true });
    } else {
      out.push({ sol, weather: rollWeather(rngForSol(state.seed >>> 0, sol)), flare: null, real: false });
    }
  }
  return out;
}

// True during the Moon's 14-sol night. Always false on Mars.
export function isNight(state) {
  return isMoonNight(state);
}

// The sizes of the crew bonuses, for the UI to show.
export const BONUS = { perfect: PERFECT_BONUS, skill: SKILL_BONUS, tired: TIRED_PENALTY };
