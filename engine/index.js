// Delta-V 26 engine. REAL VERSION (Task 2).
// Same API as the mock. The engine never changes the state you pass in.
// It always returns a new object.

const RESOURCES = ["power", "oxygen", "shielding", "food"];
const WIN_SOL = 30;
const ACTIONS_PER_SOL = 2;

// ---- Balance numbers. Tune these in Task 3. ----

// Every resource drops a little each sol.
const DAILY_DRAIN = { power: 4, oxygen: 4, shielding: 2, food: 4 };

// Space weather wears the shield down faster.
const WEATHER_SHIELD_DRAIN = { calm: 0, active: 3, storm: 7 };

// Weak shield + bad weather = sick crew. Extra drain on food and oxygen.
const WEAK_SHIELD = 30;
const SICK_DRAIN = { calm: 0, active: 4, storm: 6 };

// Chance of each kind of weather on a new sol. Must add up to 1.
const WEATHER_ODDS = { calm: 0.6, active: 0.28, storm: 0.12 };

// Chance that an event fires on a new sol.
const EVENT_CHANCE = 0.35;

// Moon: 14 sols of light, then 14 sols of night. Rest makes less power at night.
const MOON_DAY_LENGTH = 14;
const REST_GAIN = 16;
const REST_GAIN_MOON_NIGHT = 11;

const ACTIONS = [
  {
    id: "oxygen_gen",
    label: "Make Oxygen",
    cost: { power: 8 },
    gain: { oxygen: 16 },
    tip: "The oxygen machine gives the crew air to breathe. It uses power.",
  },
  {
    id: "reinforce_shield",
    label: "Fix the Shield",
    cost: { power: 8 },
    gain: { shielding: 16 },
    tip: "A strong shield keeps the crew safe from space rays. It uses power.",
  },
  {
    id: "grow_food",
    label: "Grow Food",
    cost: { power: 8 },
    gain: { food: 16 },
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
    cost: { power: 8, oxygen: 4 },
    gain: { science: 10 },
    tip: "Science is why we came here! It uses power and air.",
  },
];

// ---- Events ----
// weight(state) says how likely the event is. 0 means it cannot happen.
// realFact can be a string or a function of the site.
const EVENTS = [
  {
    id: "solar_flare",
    title: "Solar Flare!",
    text: "The Sun shot out a burst of energy. It hit the outpost and hurt the shield.",
    realFact:
      "In August 1972, a huge solar storm hit between two Apollo Moon trips. Astronauts on the Moon would have been in danger.",
    effects: { shielding: -15 },
    weight: (s) => (s.weather === "storm" ? 5 : s.weather === "active" ? 3 : 0),
  },
  {
    id: "dust_storm",
    title: "Dust Storm!",
    text: "Dust fills the sky and covers the solar panels. They cannot make much power.",
    realFact:
      "In 2018, a dust storm covered all of Mars. The Opportunity rover lost power and never woke up again.",
    effects: { power: -18 },
    weight: (s) => (s.site === "mars" ? 3 : 0),
  },
  {
    id: "micrometeorite",
    title: "Tiny Space Rock!",
    text: "A rock as small as a grain of sand hit the outpost. It made a small hole. Some air leaked out.",
    realFact:
      "The Moon has no air to burn up tiny space rocks. They hit the ground faster than a bullet.",
    effects: { shielding: -8, oxygen: -8 },
    weight: (s) => (s.site === "moon" ? 3 : 0),
  },
  {
    id: "equipment_failure",
    title: "Broken Machine!",
    text: "The oxygen machine broke down. The crew lost some air before they fixed it.",
    realFact:
      "The oxygen machine on the International Space Station has broken down before. The crew fixed it with spare parts.",
    effects: { oxygen: -12 },
    weight: () => 2,
  },
  {
    id: "comm_blackout",
    title: "Radio Blackout!",
    text: "The radio to Earth is down. The crew must solve problems alone, so you get one less action this sol.",
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

// Maybe pick an event for this sol. Returns the event to hand to the UI, or null.
function rollEvent(state, rng) {
  if (rng() >= EVENT_CHANCE) return null;

  const pool = EVENTS.map((e) => ({ e, w: e.weight(state) })).filter((x) => x.w > 0);
  const total = pool.reduce((sum, x) => sum + x.w, 0);
  let r = rng() * total;
  for (const { e, w } of pool) {
    r -= w;
    if (r < 0) {
      return {
        id: e.id,
        title: e.title,
        text: e.text,
        realFact: typeof e.realFact === "function" ? e.realFact(state.site) : e.realFact,
        effects: { ...e.effects },
      };
    }
  }
  return null;
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

// ---- API ----

// Start a new game. Same site + same seed = same game.
// NOTE: state carries one extra field, `seed`, so the engine can stay pure.
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
    seed: s,
  };
}

// The 5 actions the player can pick, with the real numbers for this sol.
export function getActions(state) {
  const night = isMoonNight(state);
  return ACTIONS.map((a) => {
    const action = { ...a, cost: { ...a.cost }, gain: { ...a.gain } };
    if (a.id === "rest" && night) {
      action.gain.power = REST_GAIN_MOON_NIGHT;
      action.tip = "It is night on the Moon, so the solar panels are dark. Resting gives less power. The crew still needs to eat.";
    }
    return action;
  });
}

// Do one action. Returns a new state.
// Blocked (state comes back the same) if the game is over,
// there are no actions left, or the id is not known.
export function applyAction(state, actionId) {
  const next = copy(state);
  if (next.status !== "playing") return next;
  if (next.actionsLeft <= 0) return next;

  const action = getActions(next).find((a) => a.id === actionId);
  if (!action) return next;

  for (const key in action.cost) {
    next[key] = clamp(next[key] - action.cost[key]);
  }
  for (const key in action.gain) {
    // Science is a score, so it has no top limit.
    next[key] = key === "science" ? next[key] + action.gain[key] : clamp(next[key] + action.gain[key]);
  }

  next.actionsLeft -= 1;
  next.log.push("Sol " + next.sol + ": " + action.label + ".");
  return next;
}

// End the sol. Returns { state, event }. event is null on quiet sols.
export function nextSol(state) {
  const next = copy(state);
  if (next.status !== "playing") return { state: next, event: null };

  const lowPower = next.power <= 15; // for the loss sentence
  const wasNight = isMoonNight(next);

  next.sol += 1;
  next.actionsLeft = ACTIONS_PER_SOL;
  const tag = "Sol " + next.sol + ": ";

  const rng = rngForSol(next.seed >>> 0, next.sol);
  next.weather = rollWeather(rng);

  // Daily drain.
  for (const key of RESOURCES) {
    next[key] = clamp(next[key] - DAILY_DRAIN[key]);
  }
  next.shielding = clamp(next.shielding - WEATHER_SHIELD_DRAIN[next.weather]);

  // Weak shield in bad weather makes the crew sick.
  const sick = next.shielding < WEAK_SHIELD && next.weather !== "calm";
  if (sick) {
    next.food = clamp(next.food - SICK_DRAIN[next.weather]);
    next.oxygen = clamp(next.oxygen - SICK_DRAIN[next.weather]);
  }

  // Maybe an event.
  const event = rollEvent(next, rng);
  if (event) {
    for (const key in event.effects) {
      next[key] = key === "actionsLeft"
        ? Math.max(0, next[key] + event.effects[key])
        : clamp(next[key] + event.effects[key]);
    }
  }

  // Log what happened.
  const nowNight = isMoonNight(next);
  if (next.weather === "active") next.log.push(tag + "The Sun is active today. The shield is working hard.");
  if (next.weather === "storm") next.log.push(tag + "A space storm is here! The shield is taking a beating.");
  if (sick) next.log.push(tag + "The shield is weak, and the crew feels sick. They need more food and air.");
  if (nowNight && !wasNight) next.log.push(tag + "Night has come to the Moon. It will be dark for 14 sols. Resting gives less power.");
  if (!nowNight && wasNight) next.log.push(tag + "The Sun is back! The solar panels are working again.");
  if (event) next.log.push(tag + event.title + " " + event.text);

  // Check for a loss first, then for a win.
  const empty = RESOURCES.find((key) => next[key] <= 0);
  if (empty) {
    next.status = "lost";
    next.lossReason = lossReasonFor(empty, { event, sick, lowPower, moonNight: nowNight });
    next.log.push(tag + next.lossReason);
  } else if (next.sol >= WIN_SOL) {
    next.status = "won";
    next.log.push(tag + "You did it! The crew is safe. Mission complete!");
  }

  return { state: next, event };
}
