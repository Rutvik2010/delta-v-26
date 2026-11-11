# Engine

Game rules for Delta-V 26. No UI, no sound, just state in and state out.

**This is the MOCK engine.** The API is final, but the logic is simple:
no events, no weather changes, no random, and the seed is ignored.
The real engine will replace the insides without changing the API.

## State

```js
state = {
  sol: 1, power: 70, oxygen: 70, shielding: 50, food: 60,
  science: 0, actionsLeft: 2, site: "moon" | "mars",
  weather: "calm" | "active" | "storm",
  log: [string], status: "playing" | "won" | "lost", lossReason: null | string
}
```

- `power`, `oxygen`, `shielding`, `food` stay between 0 and 100.
- Lose if any of those four hits 0. `lossReason` is one short sentence for kids.
- Win by reaching sol 30.

## API

Import from `engine/index.js`. The engine **never mutates** the state you pass in.
Every function returns a new object.

| Function | Returns | What it does |
| --- | --- | --- |
| `newGame(site, seed?)` | `state` | Starts a game. `site` is `"moon"` or `"mars"`. |
| `getActions(state)` | `[{id, label, cost, gain, tip}]` | The 5 actions the player can pick. |
| `applyAction(state, actionId)` | `state` | Pays the cost, adds the gain, `actionsLeft - 1`. |
| `nextSol(state)` | `{state, event}` | Ends the sol. Drains resources, resets `actionsLeft` to 2, checks win/loss. |

Action ids: `oxygen_gen`, `reinforce_shield`, `grow_food`, `rest`, `science`.

`event` is `null` or `{id, title, text, realFact, effects}`. In the mock it is always `null`.

### Good to know

- `applyAction` does nothing (returns an unchanged copy) if `actionsLeft` is 0,
  the game is over, or the action id is unknown.
- Win and loss are only checked in `nextSol`.
- Mock numbers: each sol drains 3 from every resource.

| Action | Cost | Gain |
| --- | --- | --- |
| `oxygen_gen` | power 10 | oxygen 15 |
| `reinforce_shield` | power 10 | shielding 15 |
| `grow_food` | power 10 | food 15 |
| `rest` | food 5 | power 15 |
| `science` | power 10, oxygen 5 | science 10 |

## Example

```js
import { newGame, getActions, applyAction, nextSol } from "./engine/index.js";

let state = newGame("moon");

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
if (result.event) console.log(result.event.title, result.event.text);

if (state.status === "won") console.log("Mission complete!");
if (state.status === "lost") console.log(state.lossReason);
```

Run it with a static server, for example `python -m http.server`, because
ES modules do not load from `file://`.
