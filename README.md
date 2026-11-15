# Delta-V 26

**Delta-V 26** is a kid-friendly "Junior Astronaut Mission Trainer" browser game created for **NASA Space Apps 2026**. Built with vanilla JavaScript (no framework, no build step), the player takes command of an outpost on the Moon (Shackleton crater) or Mars (Jezero crater), managing a crew of three astronauts (Maya the Engineer, Leo the Botanist, and Zuri the Scientist) across a 30-sol mission. The game integrates real solar flare data from NASA's DONKI database to simulate space weather challenges.

The live game is in ui3d/.

### What's in the game

- **Rocket landing intro:** after the briefing, the crew lift off from Earth, cruise through space and touch down on the Moon or Mars, then hop out of the rocket (skippable).
- **A 3D base you can turn:** a round, rocky chunk of Moon or Mars with buildings, a rover, craters and hills. Drag it, use the arrow buttons, or press Q and E.
- **Hands-on training tour:** on the first game (or from "How to play"), Zuri walks you through the real screen with a spotlight, a demo hand, quick quizzes and a "Nice!" for every step you get right. It works with a keyboard too.
- **Five mini games:** every job has one (follow the Sun, remember the valve order, scoop in the green, keep the garden alive, spot the hidden ice). The first time, each starts with a practice round that has no clock. Winning adds a small bonus, and Easy mode gives more time.
- **Real space weather:** the Sun forecast and solar flare events come from saved NASA DONKI flare records (May 2024 storms, or the last 30 days).

> **Disclaimer:** This is a NASA Space Apps Challenge 2026 project and is not endorsed by NASA.

---

## AI use

AI tools helped write the code, text, mission patch and logo; the team tested the game and made the decisions.

- **Coding and UI:** Claude (Anthropic), Gemini (Google), and Carbon, the coding agent in Google Antigravity.
- **Content, tests, and docs:** A teammate on team Delta V used a GPT-based assistant; this README was also AI-made.
- **Artwork and audio:** The Delta V mission patch and logo were AI-made. Sound effects are synthesized in code using the Web Audio API (not sound files).
- **Data and NASA disclaimer:** Only the two DONKI solar flare files are real NASA data; `data/space_weather_fallback.json` is made-up sample data for offline use only. No NASA logo, flag, or mission identifier is used, and the game is not endorsed by NASA.

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
│   ├── game3d.css   # 3D isometric base, lighting, HUD, tour and mini game styling
│   ├── landing.css  # Rocket landing intro animation
│   ├── main.js      # Main router and entry point
│   ├── motion.css   # Animation keyframes
│   ├── parts.js     # Color palette, icons, crew and site constants
│   ├── overlays/    # Overlays: missions, upgrades, events, mini games (tasks/), training tour (coach.js)
│   └── screens/     # Screens: title, choose, briefing, landing (rocket intro), game, win, lose
└── index.html       # Entry point loading ./ui3d/main.js
```

---

## Data Credits

- **NASA CCMC DONKI (Space Weather Database Of Notifications, Knowledge, Information):** Solar flare (FLR) records replayed from saved snapshots: historic May 2024 solar storms and a 30-day snapshot to 13 Nov 2026. A made-up offline fallback is used only if data files fail to load.
- Moon and Mars setting: Shackleton Crater and Jezero Crater. The in-game facts are written by the team and reference NASA's Moon and Mars web pages (science.nasa.gov/moon and mars.nasa.gov).

---

## Attribution

Delta-V 26 uses real solar flare data from NASA's DONKI database, lunar and martian exploration data from NASA science missions, the Lexend font (SIL Open Font License), and procedural Web Audio synthesizers. See the in-game Credits screen (accessible from the title screen) or [content/attribution.json](content/attribution.json) for full details. This project was built for NASA Space Apps 2026 and is not endorsed by NASA.
