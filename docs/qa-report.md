# Delta-V 26 - Comprehensive QA Test Report

**Date**: 2026-11-15  
**Tester**: Autonomous QA Test Agent  
**Repository**: `delta-v-26`  
**Branch Tested**: `qa/bug-report` (based on `main`)  
**Target Audience**: Junior Astronaut Mission Trainer (ages 8-14, classroom & home browser play)

---

## 1. Executive Summary

A comprehensive quality assurance cycle was conducted for **Delta-V 26**, a vanilla JavaScript browser game with no build step. The entire game was played across multiple devices, viewports, platforms, data modes, and edge-case stress conditions.

### Test Matrix Executed:
- **Pre-flight Code Validation**:
  - `node --check` across all `ui/*.js`, `ui3d/**/*.js`, and `engine/*.js`: **PASSED** (0 syntax errors).
  - `node tests/sim.js`: **PASSED** (`BALANCE OK`).
  - `node tests/sim_recent.js`: **PASSED** (`RECENT DATA BALANCE OK`).
- **Run A (Desktop 1280x800, Moon Base, "MAY 2024 STORMS")**: Completed all 30 sols to victory end screen.
- **Run B (Desktop 1280x800, Mars Base, "LAST 30 DAYS")**: Completed all 30 sols to victory end screen.
- **Run C (Mobile 390x844, Moon Base)**: Evaluated in both portrait and landscape orientation. Completed all 30 sols in landscape.
- **Run D (Mobile 390x844, Mars Base)**: Played 12+ sols to verify Mars assets and balance on mobile viewports.
- **Run E (Stress & Edge Cases)**: Rapid-fire clicks, double clicks, picker toggling, sending tired crew, mid-game reload, responsive resizing (1024x600, 1440x900), keyboard navigation (Tab/Enter/Esc), and deliberate resource starvation to verify the game over / defeat screen.

### Summary of Bug Counts by Severity:
| Severity | Count | Description |
| :--- | :---: | :--- |
| **BLOCKER** | 1 | Complete loss of core functionality or unplayable game state |
| **HIGH** | 6 | Major accessibility, UI specification, or content omissions |
| **MEDIUM** | 3 | Usability degradations, styling inconsistencies, or lifecycle bugs |
| **LOW** | 2 | Minor visual or input responsiveness polish items |
| **Total** | **12** | |

---

## 2. Bug Findings Table

| ID | Severity | Area / File | Steps to Reproduce | What Happened | Expected Behaviour | Visual Proof |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **BLOCKER** | `ui3d/base.css` (`#portrait`) | Open game on mobile viewport (390x844 portrait) at `http://localhost:8000`. | A full-screen blocking overlay `#portrait` with z-index 100 appears ("Turn your device sideways to play Delta-V 26."). The game is completely unplayable in portrait orientation. | The game should either provide a responsive portrait layout or adaptively fit portrait aspect ratios without hard-locking standard phone orientation. | `18-runC-portrait-blocked.png` |
| **BUG-02** | **HIGH** | `ui3d/base.css` (`#stage` scale) | Rotate mobile device to landscape (844x390). Inspect typography and buttons. | Stage scales down by `scale(0.4875)` to fit 1280x800 in 390px height. Base 14px typography renders at ~6.8px effective size on screen. Text is unreadable for kids on mobile screens. | UI elements should reflow or maintain minimum legible text sizes (>= 14px rendered) on mobile screens. | `21-runC-landscape-game.png` |
| **BUG-03** | **HIGH** | `ui3d/screens/title.js` | Launch game, observe title screen action buttons. | Title screen only provides `#t-start` ("Start mission") and `#t-how` ("How to play"). The Credits / NASA Attribution screen is completely missing from the UI3D implementation. | A Credits / Attribution modal should be accessible from the title screen acknowledging NASA open data, NOAA SWPC, and team contributions. | `01-title.png` |
| **BUG-04** | **HIGH** | `content/terms.json`, `content/tooltips.js` | Inspect Sol events, briefing text, and HUD panels during gameplay. | None of the scientific terms (e.g. Coronal Mass Ejection, Solar Flare, Magnetosphere, Regolith) trigger tooltips or link to the glossary defined in `content/terms.json`. | Technical aerospace and heliophysics terminology should have interactive hover/tap tooltips with kid-friendly definitions. | `05-runA-sol1-main.png` |
| **BUG-05** | **HIGH** | `ui3d/game3d.css`, `ui3d/screens/hud.js` | Inspect HUD controls during Sol gameplay. | There is no mute/unmute button or audio volume control anywhere in the UI3D interface. | A persistent mute / audio toggle button should be available in the top bar to respect classroom environments. | `05-runA-sol1-main.png` |
| **BUG-06** | **HIGH** | `ui3d/game3d.css` (`#fc`) | Click or tap on the Space Weather Forecast panel (`#fc`). | The forecast panel is static and cannot be collapsed or expanded, obscuring 3D base elements on smaller viewports. | Clicking `#fc` or a collapse chevron should toggle forecast details to free up screen real estate. | `05-runA-sol1-main.png` |
| **BUG-07** | **HIGH** | `ui3d/parts.js` (Color Palette) | Inspect 3D asset material shaders and color hex values. | Uses non-NASA palette values: Shield `#9B7BF7` (purple), Power `#F5C518` (bright yellow), Oxygen `#4BA3F0`, Food `#5CBF5A`, Hull `#F26A1B`. Astronaut colors use non-standard tints (`#F79A6B`, `#8ED16C`, `#B99AF5`). | Should adhere strictly to the NASA 1975 Graphics Standards palette: Ink `#101820`, Paper `#EDEAE2`, Red `#E4402A`, Blue `#1B4F9C`, Amber `#F2A900`, Steel `#8A8D91`, Green `#2E8B57`. | `05-runA-sol1-main.png` |
| **BUG-08** | **MEDIUM** | `ui3d/game3d.css`, `ui3d/screens/win.js`, `ui3d/screens/lose.js` | Inspect CSS font declarations across `ui3d`. | Multiple sub-14px font declarations exist: `.walker .tag` (13px), `.meter .note` (12px), `.chip` (11px), `.pick .badge` (12px), win/lose stats labels (12-13px), task minigames (12-13px). | Project typography guidelines require no font under 14px to maintain legibility for young learners. | `06-runA-job-card-rest.png`, `09-runA-picker-badges.png` |
| **BUG-09** | **MEDIUM** | `ui3d/screens/win.js`, `ui3d/screens/lose.js` | Finish Sol 30 or allow a resource to hit 0 to reach the end screen on a slower connection. | Briefing lesson card initially flashes `"Loading a lesson from mission control..."` before the async `fetch("./content/lessons.json")` finishes. | Lessons should either be pre-loaded or display a structured skeleton card without raw placeholder text jumping. | `30-stress-lose-screen.png`, `31-win-screen.png` |
| **BUG-10** | **MEDIUM** | `engine/index.js`, `ui3d/index.js` | Start a mission, advance to Sol 14, and reload the browser tab. | Reloading resets the game entirely back to Title screen; active Sol state, upgrades, and crew stamina are completely lost. | Game state should automatically persist to `localStorage` per Sol so students don't lose mission progress on accidental refresh. | `29-stress-midgame-reload.png` |
| **BUG-11** | **LOW** | `ui3d/screens/hud.js` | Rapidly multi-click "ADVANCE SOL" button during the 600ms transition. | Can trigger duplicated click events before the button state finishes transitioning. | Button should immediately set `disabled = true` synchronously on first click event. | `25-stress-multiclick-end.png` |
| **BUG-12** | **LOW** | `ui3d/index.js` (Canvas focus) | Tab through interface using keyboard navigation. | 3D interactive building meshes on the canvas cannot receive native tab focus or keyboard activation (Enter/Space) without mouse interaction. | Building selections should have accessible keyboard shortcuts (e.g. 1-6 keys or accessible roving tabindex). | `26-stress-keyboard.png` |

---

## 3. Verified Features (Pass Checklist with Visual Proof)

Every feature listed below was actively tested in a real Chromium browser and verified to function correctly:

1. **Title Screen & Instructions**:
   - **PASS**: Title screen loads cleanly with hero illustration and clear call to action buttons.
   - **Proof**: `docs/ui-shots/qa/01-title.png`, `docs/ui-shots/qa/02-title-how-to-play.png`
2. **Base & Data Mode Selection**:
   - **PASS**: Players can toggle between Moon (Shackleton Crater) and Mars (Jezero Crater), and select "MAY 2024 STORMS" or "LAST 30 DAYS".
   - **Proof**: `docs/ui-shots/qa/03-choose-base.png`, `docs/ui-shots/qa/04-briefing-moon-may2024.png`, `docs/ui-shots/qa/13-briefing-mars-recent.png`
3. **Space Weather Data Accuracy**:
   - **PASS**: May 2024 mode accurately references the severe G5 geomagnetic storms and X-class solar flares of May 2024.
   - **PASS**: "LAST 30 DAYS" mode displays real dates (15 Oct to 13 Nov 2026) with zero "autumn 2026" leaks or placeholder errors.
   - **Proof**: `docs/ui-shots/qa/04-briefing-moon-may2024.png`, `docs/ui-shots/qa/13-briefing-mars-recent.png`
4. **Astronaut Shift-Done & Habitation Cycle**:
   - **PASS**: When an astronaut finishes their job timer, they walk to the Hab door, enter the building, and display an animated floating "Zzz" cue.
   - **PASS**: Astronaut stays inside the Hab for the remainder of the Sol.
   - **PASS**: The crew chip in the top HUD updates to display "Resting".
   - **PASS**: On "NEXT SOL", resting astronauts exit the Hab door and return to their designated home coordinates ready for duty.
   - **Proof**: `docs/ui-shots/qa/08-runA-maya-resting-inside.png`
5. **Job Picker Badge Consistency**:
   - **PASS**: Astronauts who have completed their shift show "Resting" badge with button disabled.
   - **PASS**: Free astronauts show a neutral "Ready" badge (paper background, ink text/border, no empty bordered box).
   - **PASS**: Astronauts needing rest show "Tired" in red.
   - **PASS**: Astronauts with job affinity show "Best at this!" in green.
   - **Proof**: `docs/ui-shots/qa/09-runA-picker-badges.png`
6. **Task Minigames**:
   - **PASS**: All 4 task minigames (Solar panel alignment, greenhouse crop harvest, oxygen scrubber valve adjustment, and shield calibration) load and complete without script exceptions.
   - **Proof**: `docs/ui-shots/qa/07-runA-minigame-solar.png`
7. **3D Base Rendering & Camera Orbit Controls**:
   - **PASS**: Interactive 3D scene renders buildings, terrain, and atmospheric lighting.
   - **PASS**: Left and right rotation arrows smoothly rotate the 3D isometric base angle without visual artifacts.
   - **Proof**: `docs/ui-shots/qa/14-runB-mars-sol1.png`, `docs/ui-shots/qa/15-runB-rotate-left.png`, `docs/ui-shots/qa/16-runB-rotate-right.png`
8. **Missions & Upgrades Overlays**:
   - **PASS**: Missions modal correctly lists milestone objectives and updates progress.
   - **PASS**: Upgrades modal shows technology improvements with dynamic cost calculations and tier levels.
   - **Proof**: `docs/ui-shots/qa/10-runA-missions-overlay.png`, `docs/ui-shots/qa/11-runA-upgrades-overlay.png`
9. **Victory / Mission Win Screen**:
   - **PASS**: Completing Sol 30 triggers the mission victory debrief with star ratings, total score, survival statistics, and educational NASA lessons.
   - **Proof**: `docs/ui-shots/qa/12-runA-end-screen.png`, `docs/ui-shots/qa/17-runB-mars-end-screen.png`, `docs/ui-shots/qa/31-win-screen.png`
10. **Game Over / Resource Starvation (Lose Condition)**:
    - **PASS**: Allowing Oxygen, Water, or Power to reach 0 immediately halts the mission and transitions to the Defeat Screen, showing final telemetry, cause of failure, and tactical recovery tips.
    - **Proof**: `docs/ui-shots/qa/30-stress-lose-screen.png`
11. **Responsive Viewport Resizing**:
    - **PASS**: Dynamically resizing browser between 1024x600, 1280x800, and 1440x900 maintains aspect-ratio scaling without HUD clipping.
    - **Proof**: `docs/ui-shots/qa/27-stress-resize-1024x600.png`, `docs/ui-shots/qa/28-stress-resize-1440x900.png`

---

## 4. Testing Limitations & Untestable Items

The following items could not be validated during automated testing:
1. **Acoustic Fidelity & Audio Tone Variations**:
   - Web Audio synthesizer calls were verified not to throw errors, but exact acoustic volume balances and pitch variations could not be auditioned by a human ear in the headless browser environment. Manual listening verification on real speakers is recommended.
2. **Physical Touch & Gesture Interactions**:
   - Mobile runs were executed using Chrome Device Emulation (390x844). Native mobile device behaviors such as physical multi-touch zoom, device orientation sensor events, and iOS Safari bottom address bar reflows require physical device verification.

---

## 5. Console & Network Diagnostics

- **JavaScript Console Errors**: `0`
- **JavaScript Warnings**: `0`
- **Network HTTP 404 / Failed Asset Requests**: `0`
- **Simulation Checks**:
  - `node tests/sim.js`: `BALANCE OK`
  - `node tests/sim_recent.js`: `RECENT DATA BALANCE OK`
