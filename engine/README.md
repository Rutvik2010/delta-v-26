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

- **Daily drain:** power 2, oxygen 5, food 5, shielding 3.
- **Weather:** calm 60%, active 28%, storm 12%. Active drains 3 more shielding, storm 7 more.
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
- The real dataset mapping comes after 13 Nov. See the TODO comments.
