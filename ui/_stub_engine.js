// ui/_stub_engine.js
// Temporary engine stub used while engine/index.js is being built.

const DEFAULT_STATE = {
  sol: 3,
  maxSols: 30,
  site: "moon", // strictly "moon" or "mars" as per contract
  weather: "Clear / Low Rad",
  resources: {
    power: 75,
    oxygen: 60,
    shielding: 45,
    food: 80,
  },
  actionsLeft: 2,
  actions: [
    {
      id: "solar",
      label: "Deploy Solar Array",
      cost: { food: 5 },
      gain: { power: 15 },
      tip: "Unfurl auxiliary solar arrays to boost battery reserves."
    },
    {
      id: "scrubber",
      label: "Cycle Scrubbers",
      cost: { power: 10 },
      gain: { oxygen: 15 },
      tip: "Purge CO2 and cycle chemical oxygen filters."
    },
    {
      id: "reinforce",
      label: "Reinforce Shielding",
      cost: { power: 15 },
      gain: { shielding: 15 },
      tip: "Power magnetic deflection grid to deflect cosmic radiation."
    },
    {
      id: "hydroponics",
      label: "Harvest Crops",
      cost: { power: 10, oxygen: 5 },
      gain: { food: 20 },
      tip: "Tend hydroponic growth beds for fresh sustenance."
    }
  ],
  logs: [
    "Mission Sol 1: Landed safely at colony site.",
    "Mission Sol 2: Environmental life support initiated.",
    "Mission Sol 3: Power grid nominal. Awaiting crew commands."
  ],
  status: "playing" // 'playing' | 'won' | 'lost'
};

const SAMPLE_EVENTS = [
  {
    title: "Solar Flare Eruption",
    text: "Coronal mass ejection bombarded the local grid. Magnetic shielding degraded.",
    realFact: "Solar storms can disrupt satellites, spacecraft electronics, and increase radiation doses on planetary bodies without atmospheres.",
    cost: { shielding: 18, power: 8 },
    isGain: false
  },
  {
    title: "Orbital Supply Capsule Recovery",
    text: "Autonomous resupply pod touched down safely with fresh emergency nutrient packs.",
    realFact: "NASA relies on commercial cargo resupply flights (COTS/CRS) to maintain sustained space habitats.",
    gain: { food: 25, power: 10 },
    isGain: true
  },
  {
    title: "Micrometeorite Shower",
    text: "High-speed debris grazed the outer dome sector 4.",
    realFact: "NASA's Lunar Reconnaissance Orbiter has cataloged hundreds of new craters formed by recent impacts.",
    cost: { shielding: 12 },
    isGain: false
  }
];

let eventIndex = 0;
let currentState = JSON.parse(JSON.stringify(DEFAULT_STATE));

export function newGame(site = "moon") {
  currentState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  const normalized = (typeof site === "string" && site.toLowerCase().includes("mars")) ? "mars" : "moon";
  currentState.site = normalized;
  eventIndex = 0;
  return currentState;
}

export function getState() {
  return currentState;
}

export function applyAction(actionId) {
  if (currentState.actionsLeft <= 0) return currentState;

  const action = currentState.actions.find(a => a.id === actionId);
  if (!action) return currentState;

  // Deduct cost
  if (action.cost) {
    for (const [res, val] of Object.entries(action.cost)) {
      currentState.resources[res] = Math.max(0, currentState.resources[res] - val);
    }
  }

  // Add gain
  if (action.gain) {
    for (const [res, val] of Object.entries(action.gain)) {
      currentState.resources[res] = Math.min(100, currentState.resources[res] + val);
    }
  }

  currentState.actionsLeft -= 1;
  currentState.logs.push(`Executed: ${action.label}`);
  return currentState;
}

export function nextSol() {
  currentState.sol += 1;
  currentState.actionsLeft = 2;

  // Baseline Sol drain
  currentState.resources.oxygen = Math.max(0, currentState.resources.oxygen - 8);
  currentState.resources.power = Math.max(0, currentState.resources.power - 6);
  currentState.resources.food = Math.max(0, currentState.resources.food - 6);

  // Pick next event in rotation
  const sampleEvent = JSON.parse(JSON.stringify(SAMPLE_EVENTS[eventIndex % SAMPLE_EVENTS.length]));
  eventIndex += 1;

  // Apply event effects to resources
  if (sampleEvent.cost) {
    for (const [res, val] of Object.entries(sampleEvent.cost)) {
      currentState.resources[res] = Math.max(0, currentState.resources[res] - val);
    }
  }
  if (sampleEvent.gain) {
    for (const [res, val] of Object.entries(sampleEvent.gain)) {
      currentState.resources[res] = Math.min(100, currentState.resources[res] + val);
    }
  }

  // Check game over or win
  if (Object.values(currentState.resources).some(v => v <= 0)) {
    currentState.status = "lost";
  } else if (currentState.sol >= currentState.maxSols) {
    currentState.status = "won";
  }

  currentState.logs.push(`Sol ${currentState.sol}: ${sampleEvent.title}`);

  return {
    state: currentState,
    event: sampleEvent
  };
}
