# Delta-V 26

**Delta-V 26** is a kid-friendly "Junior Astronaut Mission Trainer" browser game created for **NASA Space Apps 2026**. Built with vanilla JavaScript (no framework, no build step), the player takes command of an outpost on the Moon (Shackleton crater) or Mars (Jezero crater), managing a crew of three astronauts (Maya the Engineer, Leo the Botanist, and Zuri the Scientist) across a 30-sol mission. The game integrates real solar flare data from NASA's DONKI database to simulate space weather challenges.

> **Disclaimer:** This is a NASA Space Apps Challenge 2026 project and is not endorsed by NASA.

---

## How to Run

Because Delta-V 26 uses standard browser ES modules (`type="module"`), it must be served via a local HTTP server:

```bash
# Using Python
python -m http.server 8080

# Or using Node
npx serve . -p 8080
```

Open your browser to `http://localhost:8080` to play.

---

## How to Run Tests

The game balance and engine strategies can be verified using the simulation runner:

```bash
node tests/sim.js
```

A healthy run will output simulated win rates and print `BALANCE OK`.

---

## Folder Map

```
delta-v-26/
├── assets/          # Graphic assets (e.g. bg-mars.png)
├── content/         # Educational lessons, terms, attribution, and events
│   ├── attribution.json
│   ├── events.json
│   ├── lessons.json
│   ├── terms.json
│   └── tooltips.js
├── data/            # Real DONKI flare data replayed from saved snapshots, plus offline fallback
│   ├── flares_2024_05.json       # Real May 2024 solar storm snapshot
│   ├── flares_recent_2026.json   # Real 30-day snapshot (Oct–Nov 2026)
│   └── space_weather_fallback.json # Made-up offline fallback used only if data files fail to load
├── docs/            # Documentation & design verification screenshots
│   └── ui-shots/    # Screen captures at 390px and 1366px viewports
├── engine/          # Game logic & solar flare simulation engine
│   ├── donki.js     # NASA DONKI live API fetcher & fallback loader
│   └── index.js     # State machine, action resolution, and balance rules
├── tests/           # Engine simulation & test suite
│   └── sim.js       # Strategy simulation test runner
├── ui/              # Vanilla JS frontend interface
│   ├── app.css      # 1975 NASA Graphics Standards Manual stylesheet
│   ├── app.js       # Main menu screens (Title, Sites, Briefing, Credits, End)
│   ├── audio.js     # Web Audio SFX synth
│   ├── minigames.js # Station minigames (Valves, Solar alignment, Shoveling, etc.)
│   ├── play.js      # In-game HUD, telemetry meters, crew walkers, alert popups
│   └── scene.js     # Procedural SVG lunar & martian horizons and habitats
└── index.html       # Entry point loading ./ui/app.js
```

---

## Data Credits

- **NASA CCMC DONKI (Space Weather Database Of Notifications, Knowledge, Information):** Solar flare (FLR) records replayed from saved snapshots: historic May 2024 solar storms and a 30-day snapshot to 13 Nov 2026. A made-up offline fallback is used only if data files fail to load.
- **NASA Space Apps 2026 Challenge:** Mission scenario concepts for lunar south pole exploration (Artemis program) and Mars Jezero crater exploration (Perseverance rover).

---

## Known Issues

- `content/events.json` is currently unused by the active mission engine (events are defined directly in `engine/index.js`).
- Mobile UI verified fully responsive across viewports (360px to 844px portrait & landscape) with 44px touch targets and single-line expandable Sun forecast strip.
