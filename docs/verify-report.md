# Verification Report: Resting Label & Ready Badge Fixes

## 1. Summary of Changes
- **Branch**: `fix/resting-label`
- **Commit**: `0d70abb`
- **Files Modified**:
  - `ui/play.js`:
    - Updated `openSheet(id)` to check `insideCrew.has(c.id) || !!m.job`. If resting/busy, badge text is `"Resting"` (and button is disabled).
    - Replaced empty string fallback (`&nbsp;`) for free, non-tired crew with `"Ready"`.
    - Maintained `"Best at this!"` (green) for skilled, non-tired crew and `"Tired"` (red) for exhausted crew.
    - Added test hook `window.__grantAction()` for deterministic 3-crew single-sol test scenarios.
    - Verified `"Busy"` does not appear in any user-facing UI string anywhere in the codebase.
  - `ui/app.css`:
    - Added neutral 1975 NASA styling (`background: var(--paper); color: var(--ink); border: 1px solid var(--ink);`) to `.pick .badge` so the `"Ready"` badge renders cleanly without empty bordered boxes.
    - Added `max-width: 100%; white-space: normal; box-sizing: border-box;` to `.fore.open .tagreal` on mobile viewports so long NASA dataset labels fit neatly without overflowing the viewport.

---

## 2. Browser Verification Matrix (8 Checks)

All 8 automated browser checks passed completely with zero console errors.

| # | Check Description | Status | Proof Screenshot(s) |
|---|---|:---:|---|
| 1 | Desktop (1280x800) & Mobile (390x844), Moon & Mars, both data modes (MAY 2024 STORMS and LAST 30 DAYS). Zero console errors. | **PASS** | `docs/ui-shots/verify/01_desktop_moon_may2024.png`<br>`docs/ui-shots/verify/02_mobile_moon_may2024.png`<br>`docs/ui-shots/verify/03_desktop_moon_recent.png`<br>`docs/ui-shots/verify/04_mobile_moon_recent.png`<br>`docs/ui-shots/verify/05_desktop_mars_may2024.png`<br>`docs/ui-shots/verify/06_mobile_mars_may2024.png`<br>`docs/ui-shots/verify/07_desktop_mars_recent.png`<br>`docs/ui-shots/verify/08_mobile_mars_recent.png` |
| 2 | Send Maya to a job: walk to facility, execute 3s work timer, walk back to home, walk to hab door, enter hab, Zzz cue appears (`Zzz x1`), top chip reads `"Resting"`. | **PASS** | `docs/ui-shots/verify/09_maya_walk_to_job.png`<br>`docs/ui-shots/verify/10_maya_working.png`<br>`docs/ui-shots/verify/11_maya_walk_home.png`<br>`docs/ui-shots/verify/12_maya_walk_to_door.png`<br>`docs/ui-shots/verify/13_maya_entering_door.png`<br>`docs/ui-shots/verify/14_maya_inside_resting_zzz.png`<br>*(also full frame sequence `check2_maya_seq_01.png` to `check2_maya_seq_16.png`)* |
| 3 | Re-open job picker: Maya displays `"Resting"` (disabled), Zuri displays `"Ready"` (neutral Paper/Ink box), and on Sol 2 Maya displays `"Tired"`. No `"Busy"` anywhere. | **PASS** | `docs/ui-shots/verify/15_picker_sol1_resting_ready.png`<br>`docs/ui-shots/verify/16_picker_sol2_tired_badge.png` |
| 4 | Send all 3 astronauts out in one sol: all 3 retire inside hab, none stuck on map, Zzz cue displays `Zzz x3`. | **PASS** | `docs/ui-shots/verify/17_all_3_inside_hab_zzz3.png` |
| 5 | Advance sol: all 3 exit hab back to their home spots, available for new sol, sol counter increments. | **PASS** | `docs/ui-shots/verify/18_sol2_all_out_ready.png` |
| 6 | Full 30-sol mission playthrough to end screen: mission debriefing, NASA lesson card, stats summary, and glossary popup verification. | **PASS** | `docs/ui-shots/verify/19_mission_end_screen.png`<br>`docs/ui-shots/verify/20_tooltips_glossary.png` |
| 7 | Mobile 390px viewport picker check: text fully readable, no clipping or horizontal overflow, all fonts $\ge$ 14px. | **PASS** | `docs/ui-shots/verify/21_mobile_picker_layout.png` |
| 8 | Mobile 390px data badge check: both MAY 2024 and LAST 30 DAYS labels match mode and fit without overflowing. | **PASS** | `docs/ui-shots/verify/22_mobile_databadge_may.png`<br>`docs/ui-shots/verify/23_mobile_databadge_recent.png` |

---

## 3. Automated Balance & Syntax Verification
- `node --check ui/*.js engine/*.js`: **PASSED** (all files valid ECMAScript syntax)
- `node tests/sim.js`: **PASSED** (`BALANCE OK`)
- `node tests/sim_recent.js`: **PASSED** (`RECENT DATA BALANCE OK`)

---

## 4. Console Errors Observed
- **None** across all 8 configurations, all gameplay interactions, mobile & desktop viewports, and full 30-sol playthrough.

---

## 5. Edge Cases & Trade-offs
1. **Rest Job Tiredness Exemption**: In `engine/index.js`, the `"rest"` facility is specifically exempted from the tired penalty (`a.id !== "rest"`). Viewing the picker for the Solar Tower (`rest`) intentionally does not label crew as "Tired" because resting restores energy. To verify the `"Tired"` badge, the picker was verified on functional facilities (e.g., `grow_food`, `oxygen_gen`, `science`) where `a.tired` correctly triggers the `"Tired"` badge.
2. **Mobile Data Badge Text Length**: The dataset label for recent data (`REAL NASA DATA: OCT–NOV 2026 (LAST 30 DAYS)`) spans 44 characters. Adding `white-space: normal; max-width: 100%; box-sizing: border-box;` in `ui/app.css` ensures it wraps cleanly within mobile viewports without overflowing while maintaining the 14px font minimum and 1975 NASA color palette.
