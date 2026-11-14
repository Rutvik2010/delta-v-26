# Event fact check

All 15 original facts were reviewed against NASA pages. The status describes the revised `realFact`; each fact now has support. Story text is fictional and was not fact-checked as a literal forecast.

| ID | Title | Fact check | Source |
| --- | --- | --- | --- |
| evt-01 | Lunar Night Freeze | Clarified; corrected | [NASA source](https://science.nasa.gov/wp-content/uploads/2024/01/lrolitho7temperaturevariation27may2014.pdf) |
| evt-02 | Martian Dust Devil | Removed unsupported Earth comparison; corrected | [NASA source](https://science.nasa.gov/photojournal/large-martian-dust-devils-caught-in-the-act/) |
| evt-03 | Solar Flare Incoming | Corrected waves versus particles and variable travel time; corrected | [NASA source](https://science.nasa.gov/sun/solar-storms-and-flares/) |
| evt-04 | Micrometeoroid Hail | Removed unverified speed comparison; corrected | [NASA source](https://science.nasa.gov/moon/weather-on-the-moon/) |
| evt-05 | Earth Communication Delay | Removed unsupported fixed range; corrected | [NASA source](https://www.nasa.gov/solar-system/whats-mars-solar-conjunction-and-why-does-it-matter/) |
| evt-06 | Abrasive Moon Dust | Clarified; corrected | [NASA source](https://www.nasa.gov/reference/moonbase-environment/) |
| evt-07 | Planet-Wide Mars Dust Storm | Removed unverified 99% claim; corrected | [NASA source](https://www.nasa.gov/missions/martian-dust-could-help-explain-water-loss-plus-other-learnings-from-global-storm/) |
| evt-08 | Oxygen Scrubber Alarm | Clarified; corrected | [NASA source](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) |
| evt-09 | Shadowed Lunar Crater Ice | Removed unsupported age generalization; corrected | [NASA source](https://science.nasa.gov/moon/weather-on-the-moon/) |
| evt-10 | Perchlorates in the Soil | Removed unverified required treatment method; corrected | [NASA source](https://science.nasa.gov/biological-physical/investigations/efri-elis-kpmsg/) |
| evt-11 | Galactic Cosmic Ray Burst | Corrected overly narrow origin; corrected | [NASA source](https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/matter-and-energy-in-the-most-extreme-environments/) |
| evt-12 | Lunar Noon Heatwave | Clarified temperature and removed water analogy; corrected | [NASA source](https://science.nasa.gov/moon/facts/) |
| evt-13 | Thin Atmosphere Shiver | Clarified; corrected | [NASA source](https://science.nasa.gov/mars/facts/) |
| evt-14 | Hydroponic Greenhouse Blight | Removed claim that LED lights are always required; corrected | [NASA source](https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/) |
| evt-15 | Solar Conjunction Blackout | Corrected all-communications claim; applies to Mars; corrected | [NASA source](https://science.nasa.gov/blog/hunkering-down-for-solar-conjunction/) |

`content/events.json` is not imported by `engine/index.js`. Its entries have `id`, `title`, `text`, `realFact`, and `site`; three also have `verify`. The engine instead defines five events in an internal `EVENTS` array. Its events include `effects` and a `weight(state)` function; event ids and titles differ. The engine’s returned event has `effects` but no `site` or `verify`. No runtime wiring was changed.
