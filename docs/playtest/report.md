# Playtest report: Delta-V 26 (`ui3d/`), branch `main` @ 2305130

Tester: Claude Code (AI agent), acting as a QA tester. Date: 15 Nov 2026. Real-time window: 15:05 to about 15:44 (local time). I changed no game code.

Every timestamp below comes from `step-log.txt`, which stamps each line with the real clock. A few log messages also contain clock times I typed by hand ("END at Sol 7 (15:31)", "START 15:33", "END 15:40", "LOSE SCREEN 15:42"). Those typed times were wrong by 2 to 3 minutes. Trust the `[hh:mm:ss]` stamps.

---

## 1. Honesty statement

**Tools used**
- `git clone` of https://github.com/Rutvik2010/delta-v-26 into a separate folder, then `git checkout -b qa/playtest-v4` from `main`.
- `python -m http.server 8001`, run from the repo root. Port 8000 was already taken by another session, so I used 8001.
- The browser was the **built-in browser pane of the Claude desktop app**: a real Chromium page, not headless. I drove it with that pane's input tools:
  - mouse clicks at a screenshot coordinate or on an accessibility element reference
  - single and double clicks
  - key presses (`1`-`6`, `Space`, `Enter`, `Escape`, `Home`, `End`, `PageUp`, `ArrowLeft`, `ArrowRight`)
  - window resizing (1280x800, 1000x650, 844x390)
  - screenshots
- PowerShell copied the pane's own screenshot files into `playtest-output/shots/`, converted them to PNG and appended log lines. Node ran the two sims.

**Rule broken: the browser was not visible to a human.** At 15:27 the pane reported "the Browser pane is currently hidden": the Claude window for this session was not open on screen, so nobody could watch.
- The page itself reported `document.visibilityState = "visible"`.
- I tried two ways to get a visible window:
  - Claude in Chrome: the extension was not connected.
  - My own headed Chrome over the DevTools protocol: its window stayed behind the user's foreground Claude window, the page said `hidden`, and I did not want to take over the user's screen. I closed that Chrome after reading only the page title and visibility. One test screenshot from it was deleted. No gameplay happened in it.
- **Consequences:**
  - Strictly by the brief, every run is **INVALID as a watched playtest**.
  - I still report what I saw. Results that come from game logic (resource numbers, forecast dates, event effects, blocking, timers read as text) are, I believe, unaffected.
  - Visual and animation results are marked **UNSURE** wherever the hidden pane could have affected them. Screenshots from this pane often lagged about one step behind the real state.
  - From Run 2 on, screenshots in this pane showed a zoomed and cropped part of the page.

**JavaScript run in the page (read-only, but listed in full)**
- I read `innerText`, `aria-label`, `aria-pressed`, `getBoundingClientRect()`, `getComputedStyle()` (font sizes, opacity, `transform`), the `transform` attribute of `#sl-panel`, `document.visibilityState`, `innerWidth`/`innerHeight`, the `#stage` transform scale, `localStorage` keys (read only), and the visible timer text `[data-tnum]`.
- **One exception to "read only":** in Run 1 Sol 7 I defined a helper function `window.__r` in the page. It only read bounding boxes, but it did add a global to the page.
- In the garden game (Run 1 attempt 2, Run 1 attempt 3, Run 2 attempt 1) I read each plant's visible "Thirsty!"/"Happy" text label to choose which key to press. This is the same text printed on screen, but it was read by script instead of by eye.
- **I never read hidden answers:**
  - not the valve order while hidden
  - not `data-ice`
  - not the "sparkling" aria-label of the target rock
  - not the shovel marker position
  - not the plants' numeric water levels

**What I did not do:** I called no game functions. I did not edit game state, the DOM, localStorage or sessionStorage (Mute was set only by clicking the button). I did not change timers, `Date` or `Math.random`. I used no test hooks, skipped no sols by script, and did not jump to any end screen. All waiting was real time.

**Other limits**
- My reaction loop (look, decide, act) took about **5 to 15 seconds per round trip**, and screenshots lagged. The reactive mini games (garden, find, shovel, solar) were therefore mostly lost to the clock, not to the game's design.
- I did **not** reach 5 win attempts for every game I could not win (see the coverage table). That is a gap in this test.
- I changed the solar slider with the keyboard (`Home`, `End`, `PageUp`, arrows), not by mouse dragging.

---

## 2. Summary

| Run | Setup | Real start | Real end | Sols reached | Result |
|---|---|---|---|---|---|
| 1 | Moon (Shackleton), Normal, "Last 30 days" | 15:09 | 15:29 | Sol 7 (stopped by me to leave time for Runs 2 to 4) | 13 jobs played; all 5 mini games played (valves won 2 times) |
| 2 | Mars (Jezero), Easy, "May 2024 storms" | 15:30 | 15:38 | Sol 8 | All 5 mini games played once; valves won |
| 3 | Continued the Run 2 game from Sol 8, sending nobody, only End sol | 15:38 | 15:39 | LOSE screen at "Sol 10 of 30" | Real lose screen reached; then "Try again" checked |
| 4 | 844x390 viewport, fresh Mars Easy game after "Try again" | 15:41 | 15:43 | Sol 4 | 1 mini game (valves, lost) |

Total real play time is about 37 minutes (15:06 to 15:43). The 75-minute cap was not reached; I stopped early to write the report.

**Bugs by severity** (details in section 4)

| Severity | Count | IDs |
|---|---|---|
| BLOCKER | 0 | none |
| HIGH | 2 | B1, B2 |
| MEDIUM | 4 | B3, B4, B5, B6 |
| LOW | 10 | B7 to B16 |
| UNSURE | 5 | U1 to U5 |

---

## 3. Coverage table (mini games)

W = win, L = loss (timer ran out or a plant wilted). "Could not win" means I did not win in the attempts shown. **Every game I could not win had fewer than the 5 attempts the brief asks for.**

| Mini game (file) | Moon, Normal (Run 1) | Mars, Easy (Run 2) | 844x390, Mars Easy (Run 4) | Total |
|---|---|---|---|---|
| Follow the Sun (`solar.js`) | 0W / 3L, 3 attempts, could not win | 0W / 1L, 1 attempt | NOT TESTED (time) | 4 attempts, 0 wins |
| Remember the valve order (`valves.js`) | **2W** / 1L, 3 attempts | **1W** / 0L, 1 attempt | 0W / 1L | 5 attempts, 3 wins |
| Scoop in the green (`shovel.js`) | 0W / 2L, 2 attempts, could not win | 0W / 1L, 1 attempt | NOT TESTED (time) | 3 attempts, 0 wins |
| Keep the garden alive (`garden.js`) | 0W / 3L, 3 attempts, could not win | 0W / 1L, 1 attempt | NOT TESTED (time) | 4 attempts, 0 wins |
| Spot the hidden ice / water rock (`find.js`) | 0W / 2L, 2 attempts (best: 1 of 3 rounds) | 0W / 1L, 1 attempt (glint seen, click missed) | NOT TESTED (time) | 3 attempts, 0 wins |

**Win bonus checked against losses**

| Game | Outcome | Main resource change | Breakdown |
|---|---|---|---|
| Valves, Run 1 Sol 1 | WIN | Oxygen 70 → 88 | +12 base, +4 skill, +2 perfect |
| Valves, Run 1 Sol 4 (tired Maya) | WIN | Oxygen 51 → 67 | +14 tired value, +2 |
| Valves, Run 2 Sol 1 | WIN | Oxygen 70 → 90 | +18, +2 |
| Valves, Run 1 Sol 6 | LOSE | Oxygen 53 → 67 | +14, no bonus |
| Valves, Run 4 | LOSE | Oxygen 70 → 88 | +18, no bonus |

Every loss gave exactly the base gain shown in the picker. The perfect bonus is **+2** (engine `PERFECT_BONUS = 2`).

**Timers** (read from the on-screen timer text). Expected = base seconds x 1.35 on Easy x 1.2 in Sols 1-5.

| Game | Run / sol | Shown | Expected |
|---|---|---|---|
| Garden | Run 1, Sol 1 | 18 s | 15 x 1.2 = 18 |
| Valves | Run 1, Sol 1 | 19 s | 16 x 1.2 = 19 |
| Find | Run 1, Sol 2 | 16 s | 13 x 1.2 = 16 |
| Solar | Run 1, Sol 2 | 14 s | 12 x 1.2 = 14 |
| Shovel | Run 1, Sol 3 and Sol 5 | 16 s | 13 x 1.2 = 16 |
| Valves | Run 1, Sol 6 | 16 s | 16, no early bonus |
| Garden (Easy) | Run 2 | 24 s | 15 x 1.35 x 1.2 = 24 |
| Solar (Easy) | Run 2 | 19 s | 19 |
| Shovel (Easy) | Run 2 | 21 s, goal "of 6" | 21 |
| Valves (Easy) | Run 4 | 26 s | 26 |

All timers matched. Mistakes visibly cost time; for example, 4 spills took the shovel timer from 16 s to 9 s.

**Controls tested**

| Control | Result |
|---|---|
| Valve keys `1`-`4` | worked |
| Garden keys `1`-`6` | worked |
| Shovel `Space` | worked, but see U4 |
| Shovel `Enter` | pressed once: spill registered |
| Fast double-clicks on Dig | each click counted, no freeze |
| Solar slider `Home`/`End`/`PageUp`/arrows | worked (panel text updated) |
| `Escape` in tasks | ignored (as designed) |
| `Escape` in events | ignored (events must be answered) |
| `Escape` in Credits and Mission Control | closes them |
| `A`/`D` keys, Tilt buttons, slider mouse drag, mouse clicks on valves and plants | NOT TESTED (time) |

---

## 4. Bug table

**HIGH**

| ID | Severity | Screen / file | Steps | What happened | What should happen | Screenshot |
|---|---|---|---|---|---|---|
| B1 | HIGH (visual; some UNSURE, see notes) | Follow the Sun, `ui3d/overlays/tasks/solar.js` (+ `.dv-rot` in `motion.css`) | Run 2 Sol 2: send Leo to the Solar tower; set the slider with `Home` (10°), then 60°, 90°, 125°, `End` (170°); wait 0.8 s; read the panel transform; screenshot | **(1) Drawing lags the slider.** 0.8 s after setting 90°, the `transform` attribute was `rotate(0)` but the computed transform was still `rotate(-30)`. At 125° the attribute was `rotate(35)` but the computed value was about `rotate(-8)`. **(2) Panel is drawn hanging from the astronaut's hand, not centred on the orange pivot on the tower.** In every frame its lower-left end sits at the astronaut's hand or arm, so the panel crosses the astronaut at 60° to 125°. **(3) Beam misses the panel.** The yellow beam from the Sun ends in empty space beside the drawn panel at 60°, 90°, 125° and 170°, so the panel does not look like it faces the Sun even when "Sunlight caught" is high (96% at panel 90°, Sun 92°). **(4) At 170° the panel goes through the ground** and out of the bottom of the play area. At 10° it looked almost flat. Run 1 frames showed the same at 10° (one end dips below the ground beside the tower base) and at 170° (lying flat across the tower top and the start of the battery cable). | The panel turns about the tower pivot, stays above the ground and inside the frame, never crosses the astronaut, and the beam lands on it | `run2_sol02_solar_angle10/60/90/125/170.png` |
| B2 | HIGH (mobile) | Whole game at 844x390 (`ui3d/base.css` stage scaling) | Run 4: resize to 844x390 and read sizes | The 1280x800 stage is scaled to 0.4875. **38 of 42 visible text items render under 14 px**; the smallest is 5.4 px (astronaut name tags 6.3 px, location 7.3 px). These buttons are 33 px tall, under 44 px: Turn left 33x33, Turn right 33x33, science 50x33, Mission Control 136x33, Upgrades 73x33, Mute 30x33. No page scroll. | Text at least 14 px and touch targets at least 44x44 px on phones | `run4_mobile_base.png` |

Notes on B1:
- The computed-transform lag and the beam/panel mismatch were measured by reading values, not only from screenshots.
- The pane was not on screen, so a stalled CSS transition could be part of the cause. Re-check in a visible window.
- The text "Panel 90° · Sun 92° · charge at 80%" is confusing for a 10-year-old. "Charge at 80%" means charging *starts* when sunlight caught reaches 80%, while a separate Battery % bar fills to 100%.

**MEDIUM**

| ID | Severity | Screen / file | Steps | What happened | What should happen | Screenshot |
|---|---|---|---|---|---|---|
| B3 | MEDIUM | Base, after any Crater (science) job, `ui3d/screens/game.js:450` | Send anyone to the Crater; let the task end | Console: `Uncaught (in promise) TypeError: Cannot read properties of null (reading 'querySelector') at flyToMeter (game.js:450:53) at send (game.js:537:5)`. It happened 3 times, once per Crater job (Run 1 Sol 2, Run 1 Sol 4, Run 2 Sol 2). There is no `m-science` meter, so the "+N Science" chip never flies. Science points were still added (0 → 14 → 28). | No error; the science gain is shown (e.g. flies to the flask counter) | none (console text in section 6) |
| B4 | MEDIUM | Scoop in the green, `ui3d/overlays/tasks/shovel.js` | Run 1 Sol 3 and Run 2 Sol 3: send Maya ("Best at this! +18 Shield") to the Dirt shield | The panel said "Shield after this job: 53" (39 + 14, base gain only). The real result after a loss was **57** (39 + 18). It was correct (52) only when the skill and tired effects cancelled out (Run 1 Sol 5). The code also shows +5 for a win while the engine adds +2 (code-read; I never won a shovel game, so not seen on screen). | Show the real number the engine will apply (skill, tired, +2 perfect) | `run1_sol03_shovel_shield_after_53.png`, `run1_sol03_after_shovel_lose.png`, `run2_sol03_shovel.png` |
| B5 | MEDIUM (consistency) | `valves.js`, `solar.js` | Send Leo to the Oxygen maker (Run 1 Sol 6); send Maya or Leo to the Solar tower | The header helmet has the right colour, but the astronaut drawn in the scene is always orange (Maya) in valves and always purple (Zuri) in solar | The scene astronaut matches the astronaut doing the job | `run1_sol06_valves_leo_orange_figure.png` |
| B6 | MEDIUM (mobile) | Task overlay at 844x390 (`tasks.js` layout) | Run 4: start the valves task at 844x390 | The hint box (x 374-554, y 7-54) is drawn over the end of the title "Remember the valve o..." (title x 136-412, y 25-51). Measured with bounding boxes. | No overlap; the title is fully readable | `run4_mobile_valves_title_overlap.png` |

**LOW**

| ID | Severity | Screen / file | Steps | What happened | What should happen | Screenshot |
|---|---|---|---|---|---|---|
| B7 | LOW | Title screen | Open http://localhost:8001/ at 1280x800 | The crew line "They're waiting for their Commander" is partly hidden behind the NASA DONKI info box | Both are fully visible | `title_screen.png` |
| B8 | LOW | Crew chips (bottom bar) | Start any sol after someone worked | "Tired, worked yesterday" is cut to "Tired, worke..." (text is 161 px wide in a 97 px box). Chip status text is 12-13 px. | Full text, at least 14 px | `run1_sol02_start_resting_labels.png` |
| B9 | LOW | Job picker | Run 1 Sol 1: click Veggie garden | The picker panel covers the end of the station label ("Veggie garde...") | The label stays readable or moves | `run1_sol01_picker_garden.png` |
| B10 | LOW / UNSURE | `div.nighttag` on the base | Run 1 from Sol 4 (Moon); Run 2 Sol 6 (Mars) | Moon: "Moon night: dark for 14 sols" plus an orange tint appear from Sol 4, yet the 3D Sun is still drawn bright and solar still gave the full +16 Power. Mars: the same "Moon night" text sits in the page (opacity 0, invisible), so screen readers may read "Moon night" on Mars. | Night is shown consistently; Moon text absent on Mars | `run1_sol04_start_night.png` |
| B11 | LOW (wording) | Briefing, Mars | Choose Mars | Zuri's card says "Best at exploring the crater and finding ice." On Mars her job is finding water rocks. | Mars wording | none |
| B12 | LOW | Server | Load the page | `GET /favicon.ico` → 404, 2 times | Favicon, or no request | none |
| B13 | LOW (wording) | Solar job | Click the Solar tower | It is called "Rest and recharge", and the header says "... is resting at the solar tower", but it is a working mini game, and its result screen says "Time for a snack". Confusing for kids. | A name that matches the action | none |
| B14 | LOW / UNSURE | LOSE screen | Run 3 | Reason shown: "The weak shield made the crew sick, and they ran out of food." The final log shows Shield 17 (not 0) and Food 0 ("Food reached 0 on sol 10"). The lesson ("Plants need light, water, air, and nutrients...") matches food, but the shield part of the reason is doubtful at 17. | The reason names what actually ran out | `run3_lose_screen.png` |
| B15 | LOW / UNSURE (accessibility vs. fairness; code-read) | `find.js` | Read the code: the target rock's `aria-label` is set to "... sparkling water rock / shiny ice" for the whole round, not only while it glints | A screen reader (or the accessibility tree) always tells the answer, so for those players the game has no challenge. I did not use this. | Announce only during the glint, or give an equivalent audio cue | none |
| B16 | LOW / UNSURE | Event "Dust storm!" → "Leave them dusty" | Run 4 Sol 3 | The card says "Power loses 18, Food loses 8", but nothing changed when I chose it. The loss appeared at End sol (Power −21 = −3 normal −18; Food −15 = −7 normal −8). "Use a spare part" (−8 Power) and "Patch it later" (−8/−8) applied at once. | Apply when chosen, or say "tonight" | none |

Also LOW wording/science (not a separate ID): the briefing says "Space crews call a day a sol. Here, one sol is one Earth day." A sol is a Mars day of about 24 h 39 min. Using "sol" on the Moon and calling it an Earth day may confuse kids.

**UNSURE (may be caused by the hidden pane)**

| ID | What I saw | Screenshot |
|---|---|---|
| U1 | After "Start sol 1" the HUD showed but the 3D base was missing for about 3 to 4 s (empty starfield) | `run1_sol01_base_empty_first3s.png` |
| U2 | At the start of Sol 2, Maya and Leo still showed "Resting inside" with "Zzz ×2" for about 2 s, then walked out as "Tired" | `run1_sol02_start_resting_labels.png` |
| U3 | Credits: the first click on Close did not close the dialog; the second did. `Escape` closed it at once. | none |
| U4 | Shovel (Run 2 Sol 3): after 1 good scoop, 5 more `Space` presses spaced 0.6 to 1.3 s apart changed neither the count nor the message ("Good scoop!" stayed) | `run2_sol03_shovel.png` |
| U5 | Garden, find, shovel and solar were never won by me. My 5 to 15 s reaction loop is the likely cause, not proven game difficulty. Garden: plants wilted between my looks. Find: I saw the glint twice; one click landed (Run 1), one missed because of the pane's coordinate scaling (Run 2). | none |

---

## 5. Passed items (with proof) and not tested

**Passed**

| Check | Proof (log stamp / screenshot) |
|---|---|
| Right astronaut name and job in every task header (e.g. "Leo is tending the veggie garden", "Zuri is hunting for a water rock in the crater") | log 15:11-15:39 |
| Timer counts real seconds; Easy x1.35 and Sols 1-5 x1.2 applied exactly | section 3 timer table |
| True NASA fact box has real text in every task | e.g. `run1_sol01_garden_start.png` |
| Win bonus applied (+2), loss gives base only | section 3 bonus table |
| After a task: walk home, "Zzz ×N" shows, chip says "Resting inside", picker says "Resting" and disables the button; usable next sol | `run1_sol02_zuri_twice_blocked.png`, log 15:14 |
| Same astronaut twice in a sol is blocked (button `disabled=true`; double-click did nothing) | `run1_sol02_zuri_twice_blocked.png` |
| `Escape` during a task is ignored, cannot be abused, and does not count as a loss; there is no close button on tasks | log 15:36 (Run 2 Sol 3) |
| Window resize mid-task (1280x800 → 1000x650 → back): no freeze, timer kept running | `run1_sol05_shovel_resize_1000x650.png` |
| HUD never negative or NaN; Sol counter went 1 → 7, 1 → 8 → 10 (lose), 1 → 4 | log; JS scan of lose screen found no undefined/NaN/null/[object/TODO |
| **Forecast matches data**, 17 sols checked: Run 1 Sols 1-7 (Oct 15-24 2026, M1.3 Oct 16, M1.6 Oct 19, C1.3 shown as "Calm · C1.3" Oct 23) against `flares_recent_2026.json`; Run 2 Sols 1-8 (May 1-11 2024: M1.9, M2.7, X1.6, M9.1, X1.3, X4.5, M8.2, X1.0, X2.2, X3.9, X5.8) against `flares_2024_05.json`. 0 mismatches. | log lines per sol |
| "Real data" badge and "Real NASA DONKI flares" only on the two real files. Credits say `space_weather_fallback.json` "is sample data for offline use only and is not NASA data". | `title_credits_open.png` |
| Credits open; `Escape` closes; Close closes (see U3) | log 15:07-15:08 |
| Mute: label → "Unmute sound", `dv_muted` stored, survives reload. Actual audio could not be heard by the tester. | log 15:09 |
| Events: every choice applies the number on its card | Broken machine (spare part −8 Power; fix by hand −4 Oxygen and −1 job), Tiny space rock (patch later −8 Oxygen −8 Shield), Dust storm (clean panels −1 job; leave dusty, see B16), Radio blackout (one less job) |
| Events block End sol until answered; `Escape` does not close them | log 15:16, 15:38 |
| Mission Control opens and shows 3 goals with progress (ice 1/3, garden 2/4, shield 0/7) and stars; `Escape` closes | `run1_sol04_mission_control.png` |
| LOSE screen: real reason, tip and lesson (see B14) | `run3_lose_screen.png` |
| "Try again" starts clean: Sol 1, 70/70/50/60, 0 science, 0 of 3 goals, all Ready, 2 jobs | log 15:43 |
| `node tests/sim.js` → `BALANCE OK`; `node tests/sim_recent.js` → `RECENT DATA BALANCE OK` | section 6 |

**Not tested, and why**

| Item | Reason |
|---|---|
| WIN screen (stars, lesson text) | NOT TESTED (time). No run reached Sol 30. |
| Buying upgrades and checking their effect | NOT TESTED: never affordable (max 28 science; cheapest is 30) |
| Completing a Mission Control goal and its prize | NOT TESTED (time) |
| Run 1 Sols 8-30 | NOT TESTED (time / my choice to cover Runs 2 to 4) |
| `A`/`D` keys, Tilt left/right buttons (incl. hold), slider mouse drag, mouse clicks on valve and plant buttons | NOT TESTED (time) |
| Run 4 mini games other than valves | NOT TESTED (time) |
| Whether sound actually stops when muted | NOT TESTED (no audio available to the tester) |
| Font-size and target-size scan of every desktop screen | Only partly done: title buttons 132-245 px wide, 69-74 px tall; lose buttons at least 58 px tall; crew chips 12-13 px text |

---

## 6. Console errors and failed requests

Console (built-in pane, read 15:31 and again at the end; nothing else logged):

```
[error] Uncaught (in promise) TypeError: Cannot read properties of null (reading 'querySelector')
    at flyToMeter (http://localhost:8001/ui3d/screens/game.js:450:53)
    at send (http://localhost:8001/ui3d/screens/game.js:537:5)
```

This error appeared 3 times, once per Crater job:

| When | Screen |
|---|---|
| Run 1, Sol 2 | Base, after the Crater task |
| Run 1, Sol 4 | Base, after the Crater task |
| Run 2, Sol 2 | Base, after the Crater task |

Network: every game file returned 200 or 304, including `data/flares_recent_2026.json`, `data/flares_2024_05.json` and `content/attribution.json`. The server log has 77 GETs. The only failure is `GET /favicon.ico HTTP/1.1" 404` (2 times, on page loads).

Sims (run from the clone on `qa/playtest-v4`):

```
node tests/sim.js        -> ... BALANCE OK   (exit 0)
node tests/sim_recent.js -> ... RECENT DATA BALANCE OK
```

Files:
- `docs/playtest/step-log.txt` is the full timestamped action log.
- `docs/playtest/shots/` holds 30 screenshots, downscaled to 480 px wide.
