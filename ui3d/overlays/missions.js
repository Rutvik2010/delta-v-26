// Mission Control dialog: the three extra goals, their progress, and stars.
import { COLORS, RES_INFO, esc, starPath } from "../parts.js";

const ICONS = {
  science: "M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-10V3",
  food: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l8-8",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z",
  star: starPath,
};
const iconFor = (t) => {
  const s = (t.id + " " + t.label).toLowerCase();
  if (/science|ice|rock/.test(s)) return ICONS.science;
  if (/garden|food|grow|plant/.test(s)) return ICONS.food;
  if (/shield/.test(s)) return ICONS.shield;
  return ICONS.star;
};
const rewardText = (r = {}) => Object.keys(r).map((k) => "+" + r[k] + " " + (RES_INFO[k] ? RES_INFO[k].name : k)).join(", ");

const STATUS = {
  done: { word: "Done", bg: "#DDF3D8", bd: "#1F7A35", fg: "#1F5A2A", icon: `<path d="M5 12l5 5 9-10"></path>` },
  failed: { word: "Missed", bg: "#FBDEDB", bd: "#B3261E", fg: "#7A1812", icon: `<path d="M6 6l12 12M18 6 6 18"></path>` },
  active: { word: "In progress", bg: "#FFE2D1", bd: "#F26A1B", fg: "#1E2430", icon: `<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>` },
};

export function showMissions(ctx) {
  return ctx.openOverlay((layer, close) => {
    const st = ctx.store.state;
    const tasks = ctx.engine.getTasks(st);
    const doneN = (st.tasksDone || []).length;
    const survived = st.status === "won";
    const earned = [survived, doneN >= 2, doneN >= 3];
    const starCount = earned.filter(Boolean).length;
    const starLines = ["Stay alive until sol 30", "Finish 2 Mission Control goals", "Finish all 3 goals"];

    const cards = tasks.map((t, i) => {
      const s = STATUS[t.status] || STATUS.active;
      const pct = Math.max(0, Math.min(100, Math.round((t.progress / Math.max(1, t.goal)) * 100)));
      const cardLook = t.status === "done" ? "background: #DDF3D8; border: 3px solid #1F7A35"
        : t.status === "failed" ? "background: #EEF0F2; border: 3px dashed #7C8592"
        : "background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 5px 0 #7C8592";
      const barColor = t.status === "done" ? "#1F7A35" : t.status === "failed" ? "#7C8592" : "#F26A1B";
      const rwd = rewardText(t.reward);
      const note = t.status === "done" ? `Done! You got ${rwd}.` : t.status === "failed" ? `Missed this time. The prize was ${rwd}.` : `Prize: ${rwd}`;
      return `<div class="dv-rise dv-d${i + 2}" style="display: flex; flex-direction: column; gap: 14px; padding: 20px 24px; border-radius: 18px; ${cardLook}">
<div style="display: flex; gap: 20px; align-items: center">
<svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0"><path d="${iconFor(t)}"></path></svg>
<div style="flex-grow: 1; min-width: 0"><h2 style="margin: 0; font-weight: 700; font-size: 23px; line-height: 1.2">${esc(t.label)}</h2><p style="margin: 4px 0 0; font-size: 18px; color: ${t.status === "done" ? "#1F5A2A" : COLORS.muted}">${esc(note)}</p></div>
<span class="${t.status === "active" ? "dv-glow" : ""}" style="flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; background: ${s.bg}; border: 2px solid ${s.bd}; color: ${s.fg}; font-weight: 800; font-size: 17px"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>${s.word}</span>
</div>
<div style="display: flex; align-items: center; gap: 14px">
<div role="progressbar" aria-label="${esc(t.label)}" aria-valuemin="0" aria-valuemax="${t.goal}" aria-valuenow="${Math.min(t.progress, t.goal)}" style="flex-grow: 1; height: 22px; border-radius: 11px; background: #DDE1E6; border: 3px solid #1E2430; overflow: hidden"><div style="width: ${pct}%; height: 100%; background: ${barColor}"></div></div>
<span style="min-width: 70px; text-align: right; font-weight: 800; font-size: 22px; font-variant-numeric: tabular-nums">${Math.min(t.progress, t.goal)} / ${t.goal}</span>
</div></div>`;
    }).join("");

    const starSvg = (on) => `<svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" style="flex-shrink: 0"><path d="${starPath}" fill="${on ? "#F5C518" : "none"}" stroke="${on ? "#E4FFEC" : "#6E8A7E"}" stroke-width="1.5" ${on ? "" : 'stroke-dasharray="3 2"'}></path></svg>`;
    const starRows = starLines.map((l, i) => `<li style="display: flex; gap: 12px; align-items: center">${starSvg(earned[i])}<span>${l}<span style="font-weight: 800; color: #E4FFEC"> · ${earned[i] ? "Earned" : "Not yet"}</span></span></li>`).join("");
    const soFar = doneN === 0 ? "No goals done yet. Finish 2 to earn another star!"
      : doneN === 1 ? "1 goal done. One more and you can earn 2 stars!"
      : doneN === 2 ? "2 goals done. Finish the last one for the third star!"
      : "All 3 goals done. Amazing work!";

    layer.innerHTML = `<div class="dv-dim" aria-hidden="true" style="position: absolute; inset: 0; background: rgba(30,36,48,.55)"></div>
<div class="dv-dialog" role="dialog" aria-modal="true" aria-labelledby="ms-title" style="position: absolute; left: 40px; top: 28px; width: 1200px; height: 744px; box-sizing: border-box; padding: 28px 36px; border-radius: 24px; background: #C9CED6; border: 4px solid #1E2430; box-shadow: 0 10px 0 #1E2430; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; gap: 28px; overflow: hidden">
<div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px">
<div style="display: flex; align-items: center; gap: 20px">
<div style="flex-grow: 1"><h1 id="ms-title" style="margin: 0; font-weight: 800; font-size: 44px; letter-spacing: -0.02em">Mission Control</h1><p style="margin: 0; font-size: 19px; color: #4A5363">Extra goals from Earth. Finish them for prizes and stars.</p></div>
<button type="button" id="ms-close" class="dv-key" style="min-width: 120px; height: 56px; padding: 0 22px; border-radius: 14px; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 5px 0 #7C8592; color: #1E2430; font-family: inherit; font-weight: 800; font-size: 20px; cursor: pointer">Close</button>
</div>
${cards}
</div>
<div class="dv-rise dv-d3" style="width: 340px; flex-shrink: 0; box-sizing: border-box; padding: 26px; border-radius: 18px; background: ${COLORS.screen}; box-shadow: inset 0 0 0 5px ${COLORS.screenRing}; color: ${COLORS.phosphor}; display: flex; flex-direction: column; gap: 18px">
<h2 style="margin: 0; font-weight: 700; font-size: 24px; color: ${COLORS.phosphorBright}">Your stars</h2>
<div role="img" aria-label="${starCount} of 3 stars so far" style="display: flex; gap: 8px">${earned.map((e) => starSvg(e).replace('width="36" height="36"', 'width="44" height="44"')).join("")}</div>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 16px; font-size: 18px; line-height: 1.35">${starRows}</ul>
<div style="margin-top: auto; padding: 14px; border-radius: 12px; background: #1F332C">
<p style="margin: 0; font-size: 17px; line-height: 1.45"><b style="color: ${COLORS.phosphorBright}">So far:</b> ${soFar}</p>
</div></div></div>`;

    const btn = layer.querySelector("#ms-close");
    btn.addEventListener("click", () => close());
    btn.focus();
  });
}
