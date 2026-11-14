# Engine

Game rules for Delta-V 26. No UI, no sound, just state in and state out.

This is the **real engine**. It has the same API as the mock, so nothing
that used the mock needs to change.

## State

```js
state = {
  sol: 1, power: 70, oxygen: 70, shielding: 50, food: 60,
  science: 0, actionsLeft: 2, site: "moon" | "mars",
  weather: "calm" | "active" | "storm",
  log: [string], status: "playing" | "won" | "lost", lossReason: null | string,
  seed: number
}
```

- `power`, `oxygen`, `shielding`, `food` stay between 0 and 100.
- Lose if any of those four hits 0. `lossReason` is one short sentence for kids.
- Win by reaching sol 30.
- `seed` is the one field added to the contract. The engine needs it to stay
  pure and still give the same game for the same seed. The UI can ignore it.

## API

Import from `engine/index.js`. The engine **never mutates** the state you pass in.
Every function returns a new object.

| Function | Returns | What it does |
| --- | --- | --- |
| `newGame(site, seed?)` | `state` | Starts a game. `site` is `"moon"` or `"mars"`. No seed = a random one. |
| `getActions(state)` | `[{id, label, cost, gain, tip}]` | The 5 actions, with the real numbers for this sol. |
| `applyAction(state, actionId)` | `state` | Pays the cost, adds the gain, `actionsLeft - 1`. |
| `nextSol(state)` | `{state, event}` | Ends the sol. Rolls weather, drains resources, may fire an event, checks win/loss. |

Action ids: `oxygen_gen`, `reinforce_shield`, `grow_food`, `rest`, `science`.

`event` is `null` or `{id, title, text, realFact, effects}`.
`effects` uses state field names, for example `{ shielding: -15 }`.
The engine has already applied the effects to the state it returns.

### Good to know

- `applyAction` does nothing (returns an unchanged copy) if `actionsLeft` is 0,
  the game is over, or the action id is unknown.
- Win and loss are only checked in `nextSol`.
- Always call `getActions(state)` with the current state. The rest gain
  changes during the Moon night.
- After a radio blackout, `actionsLeft` starts the sol at 1 instead of 2.

## Rules

| Action | Cost | Gain |
| --- | --- | --- |
| `oxygen_gen` | power 5 | oxygen 14 |
| `reinforce_shield` | power 5 | shielding 14 |
| `grow_food` | power 5 | food 14 |
| `rest` | food 6 | power 16 (11 in the Moon night) |
| `science` | power 5, oxygen 4 | science 10 |

Each sol:

- **Daily drain:** power 3, oxygen 7, food 7, shielding 4.
- **Weather:** with real weather, each sol takes that day's real flare class. With practice (random) weather: calm 74%, active 23%, storm 3%. Active drains 3 more shielding, storm 7 more.
- **Sick crew:** if shielding is under 30 in active or storm weather, food and
  oxygen drop by 4 more (active) or 6 more (storm).
- **Moon:** sols 1-14 are day, sols 15-28 are night. Rest gives less power at night.
- **Events:** 40% chance per sol.

| Event | Where | Effect |
| --- | --- | --- |
| `solar_flare` | both, only in active or storm weather | shielding -15 |
| `dust_storm` | Mars | power -14, food -6 |
| `micrometeorite` | Moon | shielding -8, oxygen -6 |
| `equipment_failure` | both | oxygen -12 |
| `comm_blackout` | both | one less action this sol |

All the numbers are constants at the top of `index.js`. They were tuned with
`node tests/sim.js` (needs Node 22.12+). Rerun it after changing any number.

## Example

```js
import { newGame, getActions, applyAction, nextSol } from "./engine/index.js";

let state = newGame("moon", 1234); // same seed = same game

// Show the buttons.
for (const a of getActions(state)) {
  console.log(a.id, a.label, a.cost, a.gain, a.tip);
}

// The player picks two actions.
state = applyAction(state, "grow_food");
state = applyAction(state, "rest");

// End the sol.
const result = nextSol(state);
state = result.state;
if (result.event) {
  console.log(result.event.title, result.event.text);
  console.log("Real fact:", result.event.realFact);
}

if (state.status === "won") console.log("Mission complete!");
if (state.status === "lost") console.log(state.lossReason);
```

Run it with a static server, for example `python -m http.server`, because
ES modules do not load from `file://`.

## Space weather (`engine/donki.js`)

```js
import { getSpaceWeather } from "./engine/donki.js";

const { weather, source } = await getSpaceWeather();
// weather: "calm" | "active" | "storm"
// source:  "live" | "embedded"
```

- Tries NASA's live DONKI solar flare feed for the last 3 days and takes the
  strongest flare. C class or no flares = calm, M = active, X = storm.
- On any failure (offline, timeout, bad answer) it picks a record from
  `data/space_weather_fallback.json` and returns `source: "embedded"`.
- That file is **SAMPLE data**, not real measurements. Do not show embedded
  weather as live. Show the player which one they got.
- It never throws.
- The engine does not call it. To start a game with today's weather:
  `state = { ...newGame(site), weather }`. After sol 1 the engine rolls its own.

## Real space weather

```js
import { newGame, withRealWeather, getForecast, isNight } from "./engine/index.js";
import { loadRealWeather } from "./engine/donki.js";

const plan = await loadRealWeather("recent"); // or "may2024"; null if the file cannot be read
let state = newGame("moon");
if (plan) state = withRealWeather(state, plan);
getForecast(state, 3); // [{ sol, weather, flare: { class, date } | null, real }]
```

Two real months are saved in `/data`. Each is the strongest flare NASA DONKI
recorded on each day, one day per sol:

| Name | File | Days | Calm / active / storm |
| --- | --- | --- | --- |
| `"recent"` (the briefing screen's default) | `flares_recent_2026.json` | 15 Oct to 13 Nov 2026 | 24 / 6 / 0 |
| `"may2024"` | `flares_2024_05.json` | 1 to 30 May 2024 | 5 / 13 / 12 |

- Autumn 2026 was quiet: no X-class flares, so no storm days. That is the real
  Sun, so it is not made stormier. May 2024 was the strongest storm in 20 years.
- `withRealWeather(state, plan)` adds `weatherPlan` and `weatherScale` to the
  state. `nextSol` then uses that day's real weather, not a random roll.
- **Storm scale:** the engine works out how stormy the month is. A quiet month
  hits at full strength (`weatherScale` 1). A very stormy month (more than 20
  "storm points", where an active day is 1 and a storm day is 2) is softened to
  0.3 (`STORMY_MONTH_SCALE`), so a careful crew can still win. May 2024 has 37
  points, autumn 2026 has 6.
- A `solar_flare` event in a real-weather game carries `event.flare`
  (`{ class, date }`) so the UI can show which real flare it was. Flare events
  only happen on active or storm days, so in a quiet month they are rare.
- `getForecast` also works without a plan. Then `real` is `false`.
- `isNight(state)` is true during the Moon's 14-sol night.

## Crew, choices, upgrades and tasks

These are optional. Old calls (`applyAction(state, id)` with no crew, never
answering an event) still work.

```js
import { newGame, getActions, applyAction, nextSol, resolveEvent,
         getUpgrades, buyUpgrade, getTasks, getStars } from "./engine/index.js";

let state = newGame("moon");
getActions(state, "leo");                 // numbers for Leo: skill and tiredness counted
state = applyAction(state, "grow_food", { crew: "leo", bonus: true });

const out = nextSol(state);
state = out.state;
if (out.event && out.event.choices) {     // the event waits for the player
  state = resolveEvent(state, out.event.choices[0].id);
}
state = buyUpgrade(state, "recycler");    // costs science, uses no job
getTasks(state);                          // [{ id, label, progress, goal, reward, status }]
getStars(state);                          // 0-3, once the mission is won
```

- **Crew:** `maya` is best at `oxygen_gen` and `reinforce_shield`, `leo` at
  `grow_food`, `zuri` at `science`. A matching skill adds 4 to the main gain.
  Each crew member can do one job per sol.
- **Tired:** someone who worked (not rested) last sol gives 4 less. A rest or
  a sol off fixes it. With 3 crew and 2 jobs, someone can always sit out.
- **Bonus:** `opts.bonus` (the player won the job's minigame) adds 2.
- **Choice events:** `solar_flare`, `dust_storm`, `micrometeorite` and
  `equipment_failure` come back with `choices: [{ id, label, text, effects }]`
  and nothing is applied yet. `state.pendingEvent` holds the event. Call
  `resolveEvent` to answer it. If `applyAction` or `nextSol` is called first,
  the second ("do nothing") choice is taken, so a caller that does not know about
  choices can never get stuck. `comm_blackout` has no choice.
- **Upgrades** (science cost): `solar_array` 30 (rest +4 power),
  `greenhouse2` 30 (grow food +4), `recycler` 40 (2 less oxygen drain per
  sol), `thick_shield` 50 (Sun storms do half the shield damage).
- **Tasks:** do 3 science jobs by sol 10 (+15 food), tend the garden 4 times
  by sol 18 (+10 power), keep the shield above 40 from sol 9 to 15
  (+20 science). Stars: 1 for surviving, 2 with two tasks, 3 with all three.
- **Mars:** rest gives 3 less power, because the Sun is weaker there.
- **New state fields:** `crew`, `upgrades`, `stats`, `tasksDone`,
  `tasksFailed`, `pendingEvent`.

### Balance now (1000 games each, `node tests/sim.js`)

Daily drain is power 3, oxygen 7, food 7, shielding 4. Practice weather is
74% calm, 23% active, 3% storm, to match a quiet real month. Moon night rest
gives 12. The storm scale is set per month (see above).

| Weather | Site | Random | Greedy |
| --- | --- | --- | --- |
| Real recent (autumn 2026) | Moon | 0% | 82.8% |
| Real recent (autumn 2026) | Mars | 0% | 77.8% |
| Real May 2024 | Moon | 0% | 87.5% |
| Real May 2024 | Mars | 0% | 84.3% |
| Practice (random) | Moon | 0% | 77.4% |
| Practice (random) | Mars | 0% | 74.7% |

"Greedy" sends the best-matched crew member and picks the better event choice.
A player who also wins every minigame wins almost every game. The tables near
the top of this file show older numbers from before these changes.
