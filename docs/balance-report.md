# Extra balance audit

`node tests/extra.js` runs 1,000 fixed seeds for each site and action-priority policy through the documented engine API. The policies choose the lowest resource; their names only change tie order. They are **not** crew members: the public API has no crew choice or worker assignment.

| Site | Action priority in ties | Wins | 15–85% rule |
| --- | --- | ---: | --- |
| Moon | power first | 86.8% | FAIL |
| Moon | air first | 86.7% | FAIL |
| Moon | shield first | 87.0% | FAIL |
| Mars | power first | 83.9% | PASS |
| Mars | air first | 83.8% | PASS |
| Mars | shield first | 84.3% | PASS |

**Verdict: FAIL.** Every measured Moon policy exceeds the 85% ceiling. The existing `node tests/sim.js` still prints `BALANCE OK` because it uses different criteria. For a future engine tuning pass, slightly increase Moon-night resource pressure or reduce the Moon-night rest gain, then rerun both simulations; no engine values were changed here.

The requested May 2024 versus fallback comparison cannot be measured as separate data-driven runs with the public API. `data/flares_2024_05.json` is absent, and `nextSol` replaces the initial `weather` value with its own roll. The diagnostic uses a [NASA CCMC May 2024 X-class flare](https://ccmc.gsfc.nasa.gov/TP/2024-05-TP-02/) as a first-sol `storm` example and a C-class fallback sample as `calm`. Both yield the same rates as their site baseline: Moon 86.8% and Mars 83.9%. This confirms only that the initial override does not change these runs; it does not compare data sources across a full game.
