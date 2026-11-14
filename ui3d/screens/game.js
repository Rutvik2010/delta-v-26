// Main game screen: the planet, five stations, job popover, meters, forecast, crew dock, End sol.
// Look ported from Game.dc.html (scene SVG lives in ./game/scene.js, generated from the design).
import { sceneSvg } from "./game/scene.js";
import { RES_INFO, CREW, JOBS, JOB_ORDER, WARN, esc, factBox, dateText } from "../parts.js";

const MINUS = "−";
const fmt = (n) => (n >= 0 ? "+" + n : MINUS + Math.abs(n));
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

// Palettes copied from the design (Moon and Mars).
const PAL = {
  mars: { sky: "#1A1016", edge: "#9C4A26", night: "#1A0A10", daySky: "#C98B5A", haze: "#E8A878", moonOp: "1", top: "#E09A68", speck: "#B8643A", craterIn: "#A4471F", rim: "#E4A27A", path: "#8E3F1C", pad: "#C47A52", soil: "#C2582C", soilDark: "#8E3F1C", earthOp: "0", place: "Mars · Jezero crater" },
  moon: { sky: "#0B1020", edge: "#8D93A3", night: "#070B1A", daySky: "#141C36", haze: "#0B1020", moonOp: "0", top: "#D6D9E1", speck: "#A9ADBB", craterIn: "#A0A5B3", rim: "#E2E4EA", path: "#8D93A3", pad: "#B3B8C5", soil: "#A9ADBB", soilDark: "#7C8292", earthOp: "1", place: "Moon · Shackleton crater" },
};

// Station layout and icons from the design.
const STN = {
  rest: { x: 164, y: 247, soft: "#FFF1C9", icon: "M13 2 4 14h7l-1 8 9-12h-7z" },
  oxygen_gen: { x: 394, y: 237, soft: "#DCEEFF", icon: "M4 14a5 5 0 1 0 10 0 5 5 0 1 0-10 0M14 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0" },
  reinforce_shield: { x: 640, y: 155, soft: "#EAE2FF", icon: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" },
  grow_food: { x: 883, y: 244, soft: "#DDF3D8", icon: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l8-8" },
  science: { x: 1059, y: 370, soft: "#FFF1C9", icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" },
};
const METERS = [
  { key: "power", soft: "#FFF1C9", icon: "M13 2 4 14h7l-1 8 9-12h-7z" },
  { key: "oxygen", soft: "#DCEEFF", icon: "M4 14a5 5 0 1 0 10 0 5 5 0 1 0-10 0M14 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0" },
  { key: "shielding", soft: "#EAE2FF", icon: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" },
  { key: "food", soft: "#DDF3D8", icon: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l8-8" },
];
const CREW_BY_ID = Object.fromEntries(CREW.map((c) => [c.id, c]));
const SR_ONLY = "position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap";

const resText = (obj, sign) => Object.keys(obj || {}).filter((k) => obj[k]).map((k) => (sign === -1 ? MINUS + Math.abs(obj[k]) : fmt(obj[k])) + " " + (RES_INFO[k] ? RES_INFO[k].name : k)).join(", ");

export function mount(root, ctx) {
  const store = ctx.store;
  const eng = ctx.engine;
  const mars = () => store.site === "mars";
  const S = () => store.state;

  let alive = true;
  let busy = false;
  let openJob = null;       // station id with the popover open
  let preview = null;       // { gain, cost } hovered crew card
  let say = null;           // { who, text, fact? } last speech line, null = automatic
  let sceneKey = "";
  const walking = {};       // crewId -> job id while someone walks to a station
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  // ---------- static frame ----------
  const pal0 = PAL[mars() ? "mars" : "moon"];
  root.innerHTML = `<div id="gm" style="width: 1280px; height: 800px; position: relative; overflow: hidden; font-family: Lexend, system-ui, sans-serif; color: #F3F4F6; background: ${pal0.sky}">
<div id="scene"></div>
<div id="dust" aria-hidden="true"></div>
<div id="fc" class="dv-rise dv-d4" style="position: absolute; right: 16px; top: 158px; width: 244px; box-sizing: border-box; padding: 12px 14px; border-radius: 14px; background: #13211D; box-shadow: inset 0 0 0 4px #2B3833, 0 4px 0 #000; color: #A8F5C2; display: flex; flex-direction: column; gap: 4px"></div>
<div id="tb" class="dv-drop" style="position: absolute; left: 16px; top: 12px; right: 16px; height: 54px; display: flex; align-items: center; gap: 14px"></div>
<div id="mt" class="dv-drop dv-d2" style="position: absolute; left: 16px; right: 16px; top: 76px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px"></div>
<div id="bonus" class="dv-drop dv-d3" style="position: absolute; left: 16px; top: 148px"></div>
<div id="dk" class="dv-rise dv-d5" style="position: absolute; left: 16px; right: 16px; bottom: 12px; height: 76px; display: flex; gap: 12px; align-items: stretch"></div>
<div id="stations"></div>
<div id="float" style="position: absolute; left: 0; top: 0; width: 1280px; height: 0; pointer-events: none"></div>
<div id="fact" style="position: absolute; left: 16px; bottom: 100px; width: 560px"></div>
<div id="pop"></div>
</div>`;
  const $ = (id) => root.querySelector("#" + id);
  const gm = $("gm");

  // ---------- scene ----------
  const zzCloud = (id) => (S().crew && S().crew[id] && S().crew[id].tired)
    ? `<g class="dv-zz" transform="translate(16 -112)"><path d="M0 10 a10 8 0 0 1 4 -16 a12 10 0 0 1 22 2 a8 8 0 0 1 2 14z" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></path><text x="13" y="7" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="11" fill="#1E2430">zz</text></g>`
    : "";
  function drawScene() {
    const s = S();
    const key = store.site + "|" + CREW.map((c) => (s.crew[c.id].tired ? 1 : 0)).join("");
    if (key !== sceneKey) {
      sceneKey = key;
      const pal = PAL[mars() ? "mars" : "moon"];
      $("scene").innerHTML = sceneSvg(pal, zzCloud);
      gm.style.background = pal.sky;
      $("dust").innerHTML = mars()
        ? `<svg width="1280" height="800" viewBox="0 0 1280 800" style="position: absolute; left: 0; top: 0; pointer-events: none"><g class="dv-drift" fill="#E8A878" opacity="0.28"><ellipse cx="200" cy="300" rx="90" ry="10"></ellipse><ellipse cx="620" cy="250" rx="120" ry="12"></ellipse><ellipse cx="980" cy="330" rx="100" ry="9"></ellipse><ellipse cx="420" cy="460" rx="70" ry="7"></ellipse><ellipse cx="1120" cy="470" rx="80" ry="8"></ellipse></g></svg>`
        : "";
    }
    // Day or night: frozen moment of the 30 second loop.
    const night = eng.isNight(s) && !mars();
    gm.style.setProperty("--dv-cd", night ? "-22.5s" : "-7.5s");
    gm.style.setProperty("--dv-cs", "paused");
  }

  // ---------- top bar ----------
  function dayNote() {
    if (mars()) return "Dusty season";
    const s = S();
    const n = eng.isNight(s);
    let k = 0;
    for (let sol = s.sol; sol <= 30 && eng.isNight({ ...s, sol }) === n; sol++) k++;
    const w = n ? "dark" : "sunny";
    return k > 1 ? (n ? "Night" : "Sunny") + " " + (k - 1) + " more sol" + (k - 1 > 1 ? "s" : "") : "Last " + w + " sol";
  }
  function drawTop() {
    const s = S();
    const pal = PAL[mars() ? "mars" : "moon"];
    const night = eng.isNight(s) && !mars();
    let ticks = "";
    for (let n = 1; n <= 30; n++) {
      const dark = !mars() && eng.isNight({ ...s, sol: n });
      let bg = dark ? "#2B3833" : "#4A6458";
      if (n < s.sol) bg = "#A8F5C2";
      if (n === s.sol) bg = "#F26A1B";
      ticks += `<span style="width: 6px; height: ${n === s.sol ? 18 : 12}px; border-radius: 2px; background: ${bg}"></span>`;
    }
    const tasks = eng.getTasks(s);
    const done = tasks.filter((t) => t.status === "done").length;
    const canBuy = eng.getUpgrades(s).some((u) => u.canBuy);
    const btn = "height: 44px; box-sizing: border-box; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 4px 0 #7C8592; color: #1E2430; font-family: inherit; cursor: pointer; font-weight: 700; font-size: 15px";
    $("tb").innerHTML = `<h1 style="margin: 0; font-weight: 800; font-size: 24px; letter-spacing: -0.02em; color: #F26A1B">Delta-V 26</h1>
<span style="padding: 6px 12px; border-radius: 999px; background: rgba(247,248,249,0.12); border: 2px solid rgba(247,248,249,0.25); font-weight: 700; font-size: 14px; white-space: nowrap">${esc(pal.place)}</span>
<div style="height: 50px; box-sizing: border-box; padding: 0 14px; border-radius: 12px; background: #13211D; box-shadow: inset 0 0 0 3px #2B3833; display: flex; align-items: center; gap: 12px; color: #A8F5C2; white-space: nowrap">
<span style="font-size: 14px; font-weight: 600">Sol <b style="font-size: 24px; color: #E4FFEC; font-variant-numeric: tabular-nums">${s.sol}</b> of 30</span>
<div role="img" aria-label="Day ${s.sol} of 30" style="display: flex; gap: 2px; align-items: center">${ticks}</div>
<span style="display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: ${night ? "#BFD4FF" : "#F5C518"}">${night
      ? `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"></path></svg>Night`
      : `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>Sun up`}</span>
<span style="font-size: 13px; font-weight: 600">${esc(dayNote())}</span>
</div>
<div style="margin-left: auto; display: flex; gap: 10px; align-items: center">
<span aria-label="Science points: ${s.science}" style="height: 44px; box-sizing: border-box; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 12px; background: #FFF1C9; border: 3px solid #1E2430; color: #1E2430; font-weight: 800; font-size: 19px; font-variant-numeric: tabular-nums"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>${s.science}</span>
<button type="button" id="b-tasks" class="dv-key" aria-label="Tasks, ${done} of ${tasks.length} done" style="${btn}">Tasks <span style="color: #1F7A35; font-weight: 800">${done}/${tasks.length}</span></button>
<button type="button" id="b-up" class="dv-key${canBuy ? " dv-ring" : ""}" aria-label="Upgrades${canBuy ? ", you can buy something" : ""}" style="${btn}${canBuy ? "; background: #FFF1C9; border-color: #F26A1B" : ""}">Upgrades${canBuy ? ` <span style="color: #B34A0C; font-weight: 800">NEW</span>` : ""}</button>
</div>`;
    $("b-tasks").addEventListener("click", async () => {
      ctx.sfx("click");
      const m = await import("../overlays/missions.js");
      await m.showMissions(ctx);
      if (alive) redraw();
    });
    $("b-up").addEventListener("click", async () => {
      ctx.sfx("click");
      const m = await import("../overlays/upgrades.js");
      await m.showUpgrades(ctx);
      if (alive) redraw();
    });
    const on = store.minigames;
    $("bonus").innerHTML = `<button type="button" id="b-bonus" class="dv-key" aria-pressed="${on}" style="height: 44px; box-sizing: border-box; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 12px; background: ${on ? "#DDF3D8" : "#EEF0F2"}; border: 3px solid #1E2430; box-shadow: 0 4px 0 #7C8592; color: #1E2430; font-family: inherit; cursor: pointer; font-weight: 700; font-size: 14px">Bonus tasks: ${on ? "on" : "off"}</button>`;
    $("b-bonus").addEventListener("click", () => { ctx.sfx("click"); store.minigames = !store.minigames; drawTop(); $("b-bonus").focus(); });
  }

  // ---------- meters ----------
  function drawMeters() {
    const s = S();
    const pv = preview;
    $("mt").innerHTML = METERS.map((m) => {
      const info = RES_INFO[m.key];
      const v = s[m.key];
      const low = v < 30;
      const d = pv ? (pv.gain[m.key] || 0) - (pv.cost[m.key] || 0) : 0;
      const nv = clamp(v + d, 0, 100);
      const a = Math.round(v / 10), b = Math.round(nv / 10);
      let segs = "";
      for (let i = 0; i < 10; i++) {
        let bg = i < a ? info.color : "#DDE1E6";
        let extra = "";
        if (d > 0 && i >= a && i < b) { bg = info.color; extra = "; opacity: 0.45; border-style: dashed"; }
        if (d < 0 && i >= b && i < a) { bg = "#F0A7A0"; extra = "; border-style: dashed"; }
        segs += `<span style="flex: 1; height: 12px; border-radius: 2px; border: 1.5px solid #1E2430; background: ${bg}${extra}"></span>`;
      }
      const level = v >= 70 ? "Good" : v >= 30 ? "OK" : "LOW";
      const right = d
        ? `<span style="font-size: 13px; font-weight: 800; color: ${d > 0 ? "#1F7A35" : "#B3261E"}">${fmt(d)}</span>`
        : low
          ? `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800; color: #B3261E"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20z"></path><path d="M12 10v5M12 18v.5"></path></svg>LOW</span>`
          : `<span style="font-size: 12px; font-weight: 600; color: #4A5363">${level}</span>`;
      const warnStyle = low ? "#FFE2D1" : "#EEF0F2";
      return `<div role="img" class="${low ? "dv-ring" : ""}" aria-label="${info.name} ${v} out of 100${low ? ", LOW" : ""}" style="height: 60px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-radius: 14px; color: #1E2430; background: ${warnStyle}; border: 3px solid ${low ? "#F26A1B" : "#1E2430"}; box-shadow: 0 4px 0 ${low ? "#8E3A0B" : "#7C8592"}">
<span style="flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; border: 2px solid #1E2430; display: flex; align-items: center; justify-content: center; color: #1E2430; background: ${m.soft}"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${m.icon}"></path></svg></span>
<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0"><div style="display: flex; align-items: baseline; justify-content: space-between"><span style="font-weight: 700; font-size: 15px">${info.name}</span>${right}</div><div style="display: flex; gap: 2px">${segs}</div></div>
<span style="font-weight: 800; font-size: 26px; width: 42px; text-align: right; font-variant-numeric: tabular-nums">${v}</span></div>`;
    }).join("");
  }

  // ---------- forecast ----------
  function drawForecast() {
    const s = S();
    const lab = ctx.dataLabel();
    const real = lab.real && !!store.plan;
    const today = (s.weatherPlan && s.weatherPlan[s.sol - 1]) || null;
    const rows = [{ label: "Today", weather: s.weather, cls: today && today.class, date: today && today.date, real: !!today }]
      .concat(eng.getForecast(s, 3).map((f) => ({ label: "Sol " + f.sol, weather: f.weather, cls: f.flare && f.flare.class, date: f.flare && f.flare.date, real: f.real })));
    const bg = { storm: "#F26A1B", active: "#F5C518", calm: "#4A6458" };
    const name = { storm: "Storm", active: "Active", calm: "Calm" };
    const rowsHtml = rows.map((f, i) => {
      const sub = f.real ? (f.date ? dateText(f.date) : "No flare") : "Made up";
      return `<div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 8px; background: ${i === 0 ? "#1F332C; box-shadow: inset 0 0 0 2px #A8F5C2" : "#18291F"}">
<div style="display: flex; flex-direction: column; width: 76px"><span style="font-weight: 700; font-size: 13px; color: #E4FFEC">${f.label}</span><span style="font-size: 11px; white-space: nowrap">${esc(sub)}</span></div>
<span style="padding: 2px 7px; border-radius: 6px; font-weight: 800; font-size: 11px; color: ${f.weather === "calm" ? "#E4FFEC" : "#1E2430"}; background: ${bg[f.weather]}">${name[f.weather]}</span>
<span style="margin-left: auto; font-weight: 800; font-size: 15px; color: #E4FFEC; font-variant-numeric: tabular-nums">${f.cls ? esc(f.cls) : "–"}</span></div>`;
    }).join("");
    $("fc").setAttribute("aria-label", "Sun forecast");
    $("fc").innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center"><h2 style="margin: 0; font-weight: 700; font-size: 16px; color: #E4FFEC">Sun forecast</h2>${real
      ? `<span style="padding: 2px 8px; border-radius: 6px; background: #5CBF5A; color: #0E2A12; font-weight: 800; font-size: 11px">REAL DATA</span>`
      : `<span style="padding: 2px 8px; border-radius: 6px; background: #F26A1B; color: #1E2430; font-weight: 800; font-size: 11px">PRACTICE</span>`}</div>
${rowsHtml}
${real
      ? `<p style="margin: 0; font-size: 11px; line-height: 1.3">${esc(lab.text)}</p>`
      : `<p style="margin: 2px 0 0; padding: 4px 8px; border-radius: 6px; background: #F26A1B; color: #1E2430; font-size: 11px; font-weight: 800; line-height: 1.25">PRACTICE WEATHER, made up, not real NASA data</p>`}`;
  }

  // ---------- stations ----------
  const stationEls = {};
  function buildStations() {
    $("stations").innerHTML = JOB_ORDER.map((id, idx) => `<button type="button" id="st-${id}" class="dv-pill dv-pop dv-d${6 + idx}" aria-expanded="false" aria-haspopup="dialog"><span data-badge style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid #1E2430; display: flex; align-items: center; justify-content: center; color: #1E2430; background: ${STN[id].soft}"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${STN[id].icon}"></path></svg></span><span>${esc(JOBS[id].short)}</span><span data-who></span></button>`).join("");
    JOB_ORDER.forEach((id) => {
      const el = $("st-" + id);
      stationEls[id] = el;
      el.addEventListener("click", () => { if (busy) return; ctx.sfx("click"); setOpen(openJob === id ? null : id); });
    });
  }
  const canAct = () => !busy && S().status === "playing" && S().actionsLeft > 0;
  function updateStations() {
    const s = S();
    JOB_ORDER.forEach((id) => {
      const el = stationEls[id];
      const j = STN[id];
      const open = openJob === id;
      const whoId = CREW.find((c) => s.crew[c.id].job === id);
      const dis = !canAct();
      el.disabled = dis;
      el.setAttribute("aria-expanded", String(open));
      el.setAttribute("aria-label", JOBS[id].short + ": " + JOBS[id].label(mars()) + (whoId ? ", " + whoId.name + " did this today" : "") + (dis && !busy ? (s.actionsLeft <= 0 ? ", no jobs left today" : "") : ""));
      el.style.cssText = `position: absolute; left: ${j.x - 76}px; top: ${j.y}px; width: 152px; height: 40px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 0 8px 0 5px; border-radius: 999px; cursor: ${dis ? "not-allowed" : "pointer"}; font-family: Lexend, sans-serif; font-weight: 700; font-size: 14px; color: ${open ? "#1E2430" : "#F3F4F6"}; background: ${open ? "#F26A1B" : whoId ? "#1E2430" : "rgba(20,26,44,0.88)"}; border: 3px solid ${whoId ? "#F26A1B" : "#1E2430"}; box-shadow: 0 3px 0 #000; opacity: ${dis && !whoId ? 0.6 : 1}`;
      el.querySelector("[data-who]").style.cssText = whoId ? `width: 16px; height: 16px; border-radius: 50%; border: 2px solid #F7F8F9; background: ${whoId.color}` : "";
    });
  }

  // ---------- popover ----------
  function setOpen(id) {
    openJob = id;
    preview = null;
    drawMeters();
    drawPopover();
    updateStations();
    if (id) { const f = $("pop").querySelector("[data-crew]:not([disabled])") || $("pop").querySelector("[data-close]"); if (f) f.focus(); }
  }
  function drawPopover() {
    const host = $("pop");
    if (!openJob || busy) { host.innerHTML = ""; return; }
    const id = openJob;
    const s = S();
    const j = STN[id];
    const base = eng.getActions(s).find((a) => a.id === id);
    const fitsRight = j.x + 90 + 320 <= 1264;
    const left = fitsRight ? j.x + 90 : j.x - 410;
    const top = clamp(j.y - 10, 158, 316);
    const origin = fitsRight ? "0 30px" : "100% 30px";
    const cards = CREW.map((c) => {
      const act = eng.getActions(s, c.id).find((a) => a.id === id);
      const st = s.crew[c.id];
      const isBusy = !!st.job;
      const tags = [];
      if (isBusy) tags.push(`<span style="font-size: 13px; font-weight: 800; color: #4A5363">Busy</span>`);
      else {
        if (act.skilled) tags.push(`<span style="font-size: 13px; font-weight: 800; color: #1F7A35">Best at this!</span>`);
        if (act.tired) tags.push(`<span style="font-size: 13px; font-weight: 800; color: #B3261E">Tired</span>`);
        if (!act.skilled && !act.tired) tags.push(`<span style="font-size: 13px; font-weight: 700; color: #4A5363">Ready</span>`);
      }
      const gain = resText(act.gain), cost = resText(act.cost, -1);
      const nums = isBusy ? `<span style="font-size: 13px; color: #4A5363">Already did a job today</span>`
        : `<span style="font-size: 13px; font-weight: 800; color: #1F7A35">${esc(gain || "no gain")}</span>${cost ? `<span style="font-size: 13px; font-weight: 800; color: #B3261E">${esc(cost)}</span>` : ""}`;
      return `<button type="button" data-crew="${c.id}" class="dv-key" ${isBusy ? "disabled" : ""} aria-label="${esc(c.name)}: ${esc((isBusy ? "busy, already did a job today" : (act.skilled ? "best at this, " : "") + (act.tired ? "tired, " : "") + "gets " + gain + (cost ? ", costs " + cost : "")))}" style="display: flex; flex-direction: column; gap: 2px; min-height: 52px; padding: 6px 12px; border-radius: 12px; font-family: Lexend, sans-serif; text-align: left; color: #1E2430; cursor: ${isBusy ? "not-allowed" : "pointer"}; opacity: ${isBusy ? 0.55 : 1}; background: ${act.skilled && !act.tired && !isBusy ? "#DDF3D8" : "#EEF0F2"}; border: 2px solid #1E2430">
<span style="display: flex; align-items: center; gap: 10px; width: 100%"><span style="flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #1E2430; background: ${c.color}"></span><span style="font-weight: 700; font-size: 16px">${c.name}</span><span style="margin-left: auto; display: flex; gap: 8px">${tags.join("")}</span></span>
<span style="display: flex; gap: 12px; padding-left: 32px; flex-wrap: wrap">${nums}</span></button>`;
    }).join("");
    host.innerHTML = `<div role="dialog" class="dv-popover" aria-label="${esc(JOBS[id].label(mars()))}" style="position: absolute; left: ${left}px; top: ${top}px; width: 320px; box-sizing: border-box; padding: 16px; border-radius: 18px; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 8px 0 #000; color: #1E2430; display: flex; flex-direction: column; gap: 10px; transform-origin: ${origin}">
<div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px">
<div><p style="margin: 0; font-size: 14px; font-weight: 600; color: #4A5363">Job at the ${esc(JOBS[id].short.toLowerCase())}</p><h2 style="margin: 0; font-weight: 800; font-size: 22px; line-height: 1.15">${esc(JOBS[id].label(mars()))}</h2></div>
<button type="button" data-close class="dv-key" aria-label="Close" style="flex-shrink: 0; width: 44px; height: 44px; border-radius: 10px; cursor: pointer; background: #EEF0F2; border: 2px solid #1E2430; color: #1E2430; display: flex; align-items: center; justify-content: center"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
</div>
<div style="display: flex; gap: 10px">
<span style="flex: 1; padding: 8px 10px; border-radius: 10px; background: #DDF3D8; border: 2px solid #1F7A35; color: #1F5A2A; font-weight: 800; font-size: 15px">Gets ${esc(resText(base.gain) || "nothing")}</span>
<span style="flex: 1; padding: 8px 10px; border-radius: 10px; background: #FFE2D1; border: 2px solid #B3261E; color: #8A1C15; font-weight: 800; font-size: 15px">${Object.keys(base.cost || {}).length ? "Costs " + esc(resText(base.cost, -1)) : "Costs nothing"}</span>
</div>
<p style="margin: 0; font-size: 15px; font-weight: 700">Who goes?</p>
<div style="display: flex; flex-direction: column; gap: 8px">${cards}</div>
${base.tip ? `<p style="margin: 0; font-size: 13px; color: #4A5363">${esc(base.tip)}</p>` : ""}
</div>`;
    host.querySelector("[data-close]").addEventListener("click", () => { ctx.sfx("click"); const sid = openJob; setOpen(null); if (sid && stationEls[sid]) stationEls[sid].focus(); });
    host.querySelectorAll("[data-crew]").forEach((b) => {
      const cid = b.getAttribute("data-crew");
      const act = eng.getActions(s, cid).find((a) => a.id === id);
      const on = () => { if (b.disabled) return; preview = { gain: act.gain || {}, cost: act.cost || {} }; drawMeters(); };
      const off = () => { preview = null; drawMeters(); };
      b.addEventListener("mouseenter", on); b.addEventListener("focus", on);
      b.addEventListener("mouseleave", off); b.addEventListener("blur", off);
      b.addEventListener("click", () => send(id, cid));
    });
  }

  // ---------- dock ----------
  function idleSay() {
    const s = S();
    if (s.status !== "playing") return { who: "maya", text: "The mission is over." };
    const low = ["power", "oxygen", "shielding", "food"].filter((k) => s[k] < 30).sort((a, b) => s[a] - s[b])[0];
    if (low) return { who: WARN[low][0], text: WARN[low][1] };
    if (s.actionsLeft <= 0) return { who: "maya", text: "Plan set! End the sol when you are ready." };
    return { who: "maya", text: "Tap a place on the base to send someone." };
  }
  function drawDock() {
    const s = S();
    const sp = say || idleSay();
    const spk = CREW_BY_ID[sp.who] || CREW[0];
    const cards = CREW.map((c) => {
      const st = s.crew[c.id];
      let status = "Ready", col = "#4A5363";
      const w = walking[c.id];
      if (w) { status = "Working: " + JOBS[w].where.toLowerCase().replace(/^at the /, "at the "); col = "#B34A0C"; }
      else if (st.job) { status = "Done: " + JOBS[st.job].short; col = "#1F7A35"; }
      else if (st.tired) { status = "zz Tired, rest first"; col = "#B3261E"; }
      return `<div style="width: 206px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-radius: 16px; color: #1E2430; background: #F7F8F9; border: 3px solid ${w ? "#F26A1B" : "#1E2430"}">
<svg aria-hidden="true" class="${w ? "dv-walk" : ""}" width="46" height="46" viewBox="0 0 46 46" style="flex-shrink: 0"><circle cx="23" cy="23" r="20" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></circle><path d="M9 24 a14 11 0 0 1 28 0 a14 9 0 0 1 -28 0z" fill="#D9A43A" stroke="#1E2430" stroke-width="2.5"></path><path d="M14 19 a8 4 0 0 1 9 -3" stroke="#FFF6D8" stroke-width="2.5" fill="none" stroke-linecap="round"></path><rect x="19" y="3" width="8" height="5" rx="1.5" fill="${c.color}" stroke="#1E2430" stroke-width="1.5"></rect><path d="M8 34 h30" stroke="${c.color}" stroke-width="5"></path></svg>
<div style="display: flex; flex-direction: column; min-width: 0"><span style="font-weight: 800; font-size: 16px">${c.name}</span><span style="font-size: 13px; font-weight: 600; color: ${col}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${esc(status)}</span></div></div>`;
    }).join("");
    const total = Math.max(2, s.actionsLeft);
    let pips = "";
    for (let i = 0; i < total; i++) pips += `<span style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid #1E2430; background: ${i < s.actionsLeft ? "#F5C518" : "#4A5366"}"></span>`;
    const jl = s.actionsLeft <= 0 ? "No jobs left" : s.actionsLeft + (s.actionsLeft === 1 ? " job left" : " jobs left");
    $("dk").innerHTML = `${cards}
<div style="flex-grow: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-radius: 16px; background: #F7F8F9; border: 3px solid #1E2430; color: #1E2430">
<p id="say" aria-live="polite" style="margin: 0; font-size: 14px; line-height: 1.3"><b>${esc(spk.name)}:</b> ${esc(sp.text)}${sp.fact ? `<span style="${SR_ONLY}"> True NASA fact: ${esc(sp.fact)}</span>` : ""}</p></div>
<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 84px"><div style="display: flex; gap: 5px">${pips}</div><span style="font-size: 12px; font-weight: 600; color: #C9D2E3; text-align: center">${jl}</span></div>
<button type="button" id="b-end" class="dv-key" ${busy || s.status !== "playing" ? "disabled" : ""} style="width: 180px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 16px; background: #F26A1B; border: 3px solid #1E2430; box-shadow: 0 6px 0 #8E3A0B; color: #1E2430; font-family: inherit; font-weight: 800; font-size: 22px; cursor: ${busy ? "not-allowed" : "pointer"}; opacity: ${busy ? 0.6 : 1}">
<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"></path></svg>End sol</button>`;
    $("b-end").addEventListener("click", endSol);
    const f = $("fact");
    f.innerHTML = say && say.fact ? `<div class="dv-rise">${factBox(say.fact, 15)}</div>` : "";
  }

  // ---------- floating results ----------
  function floatText(id, parts, perfect) {
    const j = STN[id];
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = `position: absolute; left: ${j.x - 100}px; width: 200px; top: ${j.y + 48}px; text-align: center; font-weight: 800; font-size: 22px; text-shadow: 0 2px 0 #000; display: flex; flex-direction: column; gap: 2px; align-items: center`;
    el.innerHTML = (perfect ? `<span style="color: #F5C518; font-size: 24px">Perfect!</span>` : "") + parts.map((p) => `<span style="color: ${p.good ? "#7BE08A" : "#FF9A8F"}">${esc(p.text)}</span>`).join("");
    $("float").appendChild(el);
    try {
      const a = el.animate([{ opacity: 0, translate: "0 8px" }, { opacity: 1, translate: "0 0", offset: 0.15 }, { opacity: 1, translate: "0 -10px", offset: 0.7 }, { opacity: 0, translate: "0 -30px" }], { duration: 2800, easing: "ease-out", fill: "forwards" });
      a.onfinish = () => el.remove();
    } catch (e) { /* animation is optional */ }
    later(() => el.remove(), 3000);
  }

  // ---------- actions ----------
  async function send(id, crewId) {
    if (busy || !alive) return;
    const before = S();
    if (before.status !== "playing" || before.actionsLeft <= 0 || before.crew[crewId].job) return;
    busy = true;
    openJob = null; preview = null;
    walking[crewId] = id;
    ctx.sfx("click");
    redrawLight();
    let won = false;
    if (store.minigames) {
      try { const m = await import("../overlays/tasks.js"); won = !!(await m.runTask(ctx, id, crewId)); } catch (e) { won = false; }
    } else {
      await ctx.sleep(700);
    }
    if (!alive) return;
    const after = eng.applyAction(store.state, id, { crew: crewId, bonus: won });
    store.state = after;
    delete walking[crewId];
    const did = after !== before && after.crew[crewId].job === id;
    const parts = [];
    if (did) {
      const keys = ["power", "oxygen", "shielding", "food", "science"];
      const main = JOBS[id].res;
      const dm = (after[main] || 0) - (before[main] || 0);
      parts.push({ text: fmt(dm) + " " + RES_INFO[main].name, good: dm >= 0 });
      keys.filter((k) => k !== main).forEach((k) => {
        const d = (after[k] || 0) - (before[k] || 0);
        if (d) parts.push({ text: fmt(d) + " " + RES_INFO[k].name, good: d > 0 });
      });
      ctx.sfx(won ? "good" : "click");
      if (won) later(() => ctx.sfx("good"), 150);
      floatText(id, parts, won);
      say = { who: crewId, text: JOBS[id].line(mars()), fact: JOBS[id].real(mars()) };
      later(() => { if (say && say.fact) { say = { ...say, fact: null }; drawDock(); } }, 9000);
    } else {
      say = { who: crewId, text: "That did not work. Try another job." };
    }
    busy = false;
    redraw();
    if (after.status !== "playing") await finish(after.status);
  }

  async function finish(status) {
    busy = true;
    redrawLight();
    await ctx.sleep(600);
    if (!alive) return;
    ctx.go(status === "won" ? "win" : "lose");
  }

  async function endSol() {
    if (busy || !alive || S().status !== "playing") return;
    busy = true;
    openJob = null; preview = null; say = null;
    ctx.sfx("click");
    redrawLight();
    const out = eng.nextSol(store.state);
    store.state = out.state;
    redraw(true);
    if (out.event) {
      ctx.sfx(out.event.flare ? "flare" : "warning");
      const { showEvent } = await import("../overlays/event.js");
      const choice = await showEvent(ctx, out.event);
      if (!alive) return;
      if (out.event.choices) store.state = eng.resolveEvent(store.state, choice);
    }
    busy = false;
    redraw();
    const st = S().status;
    if (st === "won" || st === "lost") await finish(st);
  }

  // ---------- redraw ----------
  function redrawLight() { drawMeters(); drawDock(); drawPopover(); updateStations(); }
  function redraw() {
    drawScene(); drawTop(); drawMeters(); drawForecast(); drawDock(); drawPopover(); updateStations();
  }

  const onKey = (e) => {
    if (e.key === "Escape" && openJob && !document.querySelector(".dv-overlay")) {
      const sid = openJob; setOpen(null); if (stationEls[sid]) stationEls[sid].focus();
    }
  };
  document.addEventListener("keydown", onKey);

  buildStations();
  redraw();

  return () => {
    alive = false;
    document.removeEventListener("keydown", onKey);
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
  };
}
