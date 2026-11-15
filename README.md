# Delta-V 26

**Delta-V 26** is a kid-friendly "Junior Astronaut Mission Trainer" browser game created for **NASA Space Apps 2026**. Built with vanilla JavaScript (no framework, no build step), the player takes command of an outpost on the Moon (Shackleton crater) or Mars (Jezero crater), managing a crew of three astronauts (Maya the Engineer, Leo the Botanist, and Zuri the Scientist) across a 30-sol mission. The game integrates real solar flare data from NASA's DONKI database to simulate space weather challenges.

The live game is in ui3d/.

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
node tests/sim_recent.js
```

A healthy run will output simulated win rates and print `BALANCE OK` and `RECENT DATA BALANCE OK`.

---

## Folder Map

```
delta-v-26/
├── assets/          # Graphic assets
├── content/         # Educational lessons, terms, attribution, and events
│   ├── attribution.json
│   ├── events.json
│   ├── lessons.json
│   ├── terms.json
│   └── tooltips.js
├── data/            # Real DONKI flare data replayed from saved snapshots, plus offline fallback
│   ├── flares_2024_05.json         # Real May 2024 solar storm snapshot
│   ├── flares_recent_2026.json     # Real 30-day snapshot (15 Oct to 13 Nov 2026)
│   └── space_weather_fallback.json # Made-up offline fallback used only if data files fail to load
├── docs/            # Documentation & design verification screenshots
│   └── ui-shots/    # Screen captures across desktop and mobile viewports
├── engine/          # Game logic & space weather replay engine
│   ├── donki.js     # Real DONKI flare snapshot loader & fallback
│   └── index.js     # State machine, action resolution, and balance rules
├── tests/           # Engine simulation & test suite
│   ├── sim.js       # Strategy simulation test runner
│   └── sim_recent.js # Strategy simulation runner for recent 2026 data
├── ui3d/            # Live 3D isometric spacecraft console interface
│   ├── base.css     # Base stage layout & responsive scaling
│   ├── ctx.js       # Shared application context & audio mute system
│   ├── game3d.css   # 3D isometric base, lighting, and HUD styling
│   ├── main.js      # Main router and entry point
│   ├── motion.css   # Animation keyframes
│   ├── parts.js     # Color palette, icons, crew and site constants
│   ├── overlays/    # Modal overlays (missions, upgrades, minigames, events)
│   └── screens/     # Screen modules (title, choose, briefing, game, win, lose)
├── ui/              # Legacy 2D frontend interface
└── index.html       # Entry point loading ./ui3d/main.js
```

---

## Data Credits

- **NASA CCMC DONKI (Space Weather Database Of Notifications, Knowledge, Information):** Solar flare (FLR) records replayed from saved snapshots: historic May 2024 solar storms and a 30-day snapshot to 13 Nov 2026. A made-up offline fallback is used only if data files fail to load.
- **NASA Space Apps 2026 Challenge:** Mission scenario concepts for lunar south pole exploration (Artemis program) and Mars Jezero crater exploration (Perseverance rover).

---

## Attribution

Delta-V 26 uses real solar flare data from NASA's DONKI database, lunar and martian exploration data from NASA science missions, the Lexend font (SIL Open Font License), and procedural Web Audio synthesizers. See the in-game Credits screen (accessible from the title screen) or [content/attribution.json](content/attribution.json) for full details. This project was built for NASA Space Apps 2026 and is not endorsed by NASA.
