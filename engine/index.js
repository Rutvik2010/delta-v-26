// Delta-V 26 engine. MOCK VERSION (Task 1).
// Same API as the real engine, but simple logic: no events, no weather, no random.
// The engine never changes the state you pass in. It always returns a new object.

const RESOURCES = ["power", "oxygen", "shielding", "food"];
const WIN_SOL = 30;
const ACTIONS_PER_SOL = 2;
const DAILY_DRAIN = 3;

// MOCK: hardcoded costs and gains.
const ACTIONS = [
  {
    id: "oxygen_gen",
    label: "Make Oxygen",
    cost: { power: 10 },
    gain: { oxygen: 15 },
    tip: "The oxygen machine gives the crew air to breathe. It uses power.",
  },
  {
    id: "reinforce_shield",
    label: "Fix the Shield",
    cost: { power: 10 },
    gain: { shielding: 15 },
    tip: "A strong shield keeps the crew safe from space rays. It uses power.",
  },
  {
    id: "grow_food",
    label: "Grow Food",
    cost: { power: 10 },
    gain: { food: 15 },
    tip: "Plants need light to grow. The grow lights use power.",
  },
  {
    id: "rest",
    label: "Rest",
    cost: { food: 5 },
    gain: { power: 15 },
    tip: "The crew rests while the batteries charge. They still need to eat.",
  },
  {
    id: "science",
    label: "Do Science",
    cost: { power: 10, oxygen: 5 },
    gain: { science: 10 },
    tip: "Science is why we came here! It uses power and air.",
  },
];

// Kid-friendly reasons for losing, one per resource.
const LOSS_REASONS = {
  power: "The outpost ran out of power, so nothing could run.",
  oxygen: "The crew ran out of oxygen to breathe.",
  shielding: "The shield broke, so the crew was not safe.",
  food: "The crew ran out of food.",
};

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

// Copy the state so the input is never changed.
function copy(state) {
  return { ...state, log: [...state.log] };
}

// Deep copy of one action, so callers cannot change our list.
function copyAction(a) {
  return { ...a, cost: { ...a.cost }, gain: { ...a.gain } };
}

// Start a new game. MOCK: seed is ignored for now.
export function newGame(site, seed) {
  const place = site === "mars" ? "mars" : "moon";
  const name = place === "mars" ? "Mars" : "the Moon";
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
  };
}

// The 5 actions the player can pick.
export function getActions(state) {
  return ACTIONS.map(copyAction);
}

// Do one action. Returns a new state.
// Blocked (state comes back the same) if the game is over,
// there are no actions left, or the id is not known.
export function applyAction(state, actionId) {
  const next = copy(state);
  if (next.status !== "playing") return next;
  if (next.actionsLeft <= 0) return next;

  const action = ACTIONS.find((a) => a.id === actionId);
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

// End the sol. Returns { state, event }.
// MOCK: every resource drops by 3. No events, so event is always null.
export function nextSol(state) {
  const next = copy(state);
  if (next.status !== "playing") return { state: next, event: null };

  next.sol += 1;
  next.actionsLeft = ACTIONS_PER_SOL;
  for (const key of RESOURCES) {
    next[key] = clamp(next[key] - DAILY_DRAIN);
  }

  // Check for a loss first, then for a win.
  const empty = RESOURCES.find((key) => next[key] <= 0);
  if (empty) {
    next.status = "lost";
    next.lossReason = LOSS_REASONS[empty];
    next.log.push("Sol " + next.sol + ": " + next.lossReason);
  } else if (next.sol >= WIN_SOL) {
    next.status = "won";
    next.log.push("Sol " + next.sol + ": You did it! The crew is safe. Mission complete!");
  } else {
    next.log.push("Sol " + next.sol + ": A new sol begins.");
  }

  return { state: next, event: null };
}
