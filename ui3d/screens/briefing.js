// Briefing screen, ported from Briefing.dc.html, plus the Sun data toggle.
import { SITES, CREW, helmet, esc } from "../parts.js";

const DATA_LINE = {
  recent: "Real NASA flares from the last 30 days (15 Oct to 13 Nov 2026), one day per sol.",
  may2024: "Real NASA flares from May 2024, the strongest storm in 20 years, one day per sol.",
};
const BEST = {
  maya: "Best at <b>making oxygen</b> and <b>fixing the shield</b>.",
  leo: "Best at <b>growing food</b>. He gets hungry first!",
  zuri: "Best at <b>exploring the crater</b> and finding ice.",
};
const SWING = ["dv-swing dv-d2", "dv-swing dv-d4", "dv-swing dv-d6"];
const KEYBASE = "font-family: inherit; cursor: pointer; border: 3px solid #1E2430; border-radius: 12px; color: #1E2430; font-weight: 800; font-size: 15px; min-height: 48px; padding: 4px 6px; line-height: 1.2;";

function crewCard(c, i) {
  return `<div class="${SWING[i]}" style="position: relative; border-radius: 18px; background: #F7F8F9; border: 3px solid #1E2430; overflow: hidden; display: flex; flex-direction: column">
<div style="height: 54px; background: ${c.color}; border-bottom: 3px solid #1E2430; display: flex; justify-content: center; align-items: center"><span aria-hidden="true" style="width: 64px; height: 14px; border-radius: 999px; background: #C9CED6; border: 3px solid #1E2430"></span></div>
<div style="padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; align-items: center; gap: 16px">
${helmet(c.color, 80, c.name + " in " + (c.id === "leo" ? "his" : "her") + " helmet")}
<div><h2 style="margin: 0; font-weight: 800; font-size: 34px">${esc(c.name)}</h2><p style="margin: 0; font-size: 18px; color: #4A5363">${esc(c.role)}</p></div>
</div>
<p style="margin: 0; font-size: 19px; line-height: 1.45">${BEST[c.id] || "Best at <b>" + esc(c.best) + "</b>."}</p>
<p style="margin: 0; font-size: 19px; line-height: 1.45; color: #4A5363">"${esc(c.quote)}"</p>
</div>
</div>`;
}

export function mount(root, ctx) {
  const store = ctx.store;
  if (store.planMode !== "may2024") store.planMode = "recent";
  const site = SITES[store.site] || SITES.moon;

  root.innerHTML = `<div style="width: 1280px; height: 800px; box-sizing: border-box; padding: 36px 48px; background: #C9CED6; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; flex-direction: column; gap: 22px">
<div class="dv-drop" style="display: flex; flex-direction: column; gap: 4px">
<p style="margin: 0; font-size: 20px; font-weight: 600; color: #4A5363">${esc(site.base)}</p>
<h1 style="margin: 0; font-weight: 800; font-size: 48px; letter-spacing: -0.02em">Commander, meet your crew</h1>
</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px">
${CREW.map(crewCard).join("")}
</div>
<div style="display: flex; gap: 28px; flex-grow: 1; min-height: 0">
<div class="dv-rise dv-d7" style="flex-grow: 1; padding: 22px 28px; border-radius: 16px; background: #13211D; box-shadow: inset 0 0 0 5px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 14px">
<h3 style="margin: 0; font-weight: 700; font-size: 24px; color: #E4FFEC">How to win</h3>
<ol style="margin: 0; padding-left: 28px; display: flex; flex-direction: column; gap: 8px; font-size: 20px; line-height: 1.4">
<li>Keep Power, Oxygen, Shield and Food above zero.</li>
<li>Each day you get 2 jobs. Someone always gets to rest.</li>
<li>The supply ship lands on day 30. Hold on until then!</li>
</ol>
</div>
<div class="dv-rise dv-d8" style="width: 320px; display: flex; flex-direction: column; justify-content: flex-end; gap: 10px">
<p style="margin: 0; font-size: 14px; line-height: 1.4; color: #4A5363">Space crews call a day a <b>sol</b>. A sol on Mars is about 40 minutes longer than a day on Earth.</p>
<div role="group" aria-label="Sun data" style="display: flex; gap: 8px">
<button type="button" id="b-recent" class="dv-key" style="${KEYBASE} flex: 1; background: #F7F8F9; box-shadow: 0 4px 0 #7C8592;">Last 30 days</button>
<button type="button" id="b-may" class="dv-key" style="${KEYBASE} flex: 1; background: #F7F8F9; box-shadow: 0 4px 0 #7C8592;">May 2024 storms</button>
</div>
<p id="b-line" aria-live="polite" style="margin: 0; padding: 8px 10px; border-radius: 8px; background: #13211D; color: #A8F5C2; font-size: 12px; line-height: 1.4; min-height: 34px"></p>
<button type="button" id="b-start" class="dv-key" style="display: flex; justify-content: center; padding: 18px; border-radius: 16px; background: #F26A1B; border: 3px solid #1E2430; box-shadow: 0 7px 0 #8E3A0B; color: #1E2430; font-family: inherit; cursor: pointer; font-weight: 800; font-size: 28px">Start sol 1</button>
</div>
</div>
</div>`;

  const btns = { recent: root.querySelector("#b-recent"), may2024: root.querySelector("#b-may") };
  const line = root.querySelector("#b-line");
  const start = root.querySelector("#b-start");

  function paint() {
    const m = store.planMode;
    for (const k of Object.keys(btns)) {
      const on = k === m;
      btns[k].setAttribute("aria-pressed", on ? "true" : "false");
      btns[k].style.background = on ? "#F3D23A" : "#F7F8F9";
      btns[k].style.boxShadow = on ? "0 1px 0 #7C8592" : "0 4px 0 #7C8592";
      btns[k].style.translate = on ? "0 3px" : "";
    }
    line.textContent = DATA_LINE[m];
  }
  for (const k of Object.keys(btns)) {
    btns[k].addEventListener("click", () => { ctx.sfx("click"); store.planMode = k; paint(); });
  }
  paint();

  let starting = false;
  start.addEventListener("click", async () => {
    if (starting) return;
    starting = true;
    start.disabled = true;
    start.setAttribute("aria-busy", "true");
    start.textContent = "Starting...";
    start.style.opacity = "0.7";
    ctx.sfx("click");
    try {
      await ctx.startGame(store.site, store.planMode);
      ctx.go("game");
    } catch (e) {
      starting = false;
      start.disabled = false;
      start.removeAttribute("aria-busy");
      start.textContent = "Start sol 1";
      start.style.opacity = "";
    }
  });
}
