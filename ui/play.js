// Delta-V 26 game screen. Draws and animates. All rules come from /engine.

import { newGame, getActions, applyAction, nextSol, resolveEvent, getUpgrades, buyUpgrade, getTasks, withRealWeather, getForecast, isNight } from "../engine/index.js";
import { playSfx } from "./audio.js";
import { playMinigame } from "./minigames.js";
import { astro, sceneSvg, esc } from "./scene.js";
import { addTooltips } from "../content/tooltips.js";

export const RES = ["power", "oxygen", "shielding", "food"];
export const ALL_RES = ["power", "oxygen", "shielding", "food", "science"];
export const NAMES = { power: "Power", oxygen: "Oxygen", shielding: "Shield", food: "Food", science: "Science" };
const ROLE_CODES = { maya: "ENG", leo: "BOT", zuri: "SCI" };
const ICONS = {
  power: "M13 2 4 14h7l-1 8 9-12h-7z",
  oxygen: "M9 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM17.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  shielding: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  food: "M5 19c0-9 5-14 15-14 0 10-5 15-14 14zM5 19l8-8",
  science: "M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-10V3",
};
const WEATHER = {
  calm: { label: "Calm", color: "#2E8B57" },
  active: { label: "Active", color: "#F2A900" },
  storm: { label: "Storm", color: "#E4402A" }
};
export const SITES = {
  moon: { name: "The Moon", place: "Shackleton crater", mission: "Mission Ice Hunt",
    story: "Your crew has landed at Shackleton crater, near the Moon's south pole, to look for water ice. The supply ship lands on Sol 30. Keep everyone safe until then.",
    blurb: "A crater so deep the Sun never reaches the bottom. Ice may hide there. Watch out for the 14-sol night!" },
  mars: { name: "Mars", place: "Jezero crater", mission: "Mission Red Rock",
    story: "Your crew has landed in Jezero crater on Mars. A lake filled it long ago. Collect rocks and stay alive until the supply ship lands on Sol 30.",
    blurb: "An old lake bed where NASA's Perseverance rover explores. The Sun is weaker here, and dust storms can cover your solar panels!" },
};
export const CREW = [
  { id: "maya", name: "Maya", job: "Engineer", color: "#1B4F9C", about: "Best at making oxygen and fixing the shield.", home: [418, 378] },
  { id: "leo", name: "Leo", job: "Botanist", color: "#2E8B57", about: "Best at growing food. Gets hungry first.", home: [464, 386] },
  { id: "zuri", name: "Zuri", job: "Scientist", color: "#E4402A", about: "Best at exploring the crater.", home: [510, 378] },
];
// Each job: its building (spot), where the astronaut stands (feet), and what the crew says.
const JOBS = {
  rest: { res: "power", spot: [150, 172], feet: [205, 322], short: "Solar tower", where: "Resting", label: () => "Rest and recharge",
    line: () => "The solar tower is charging the batteries. Time for a snack.",
    real: (m) => m ? "Real: Mars landers run on solar panels, and dust is their enemy." : "Real: at the Moon's south pole, tall solar towers catch the low Sun." },
  oxygen_gen: { res: "oxygen", spot: [285, 248], feet: [338, 320], short: "Oxygen plant", where: "At oxygen plant", label: (m) => m ? "Make oxygen from Mars air" : "Make oxygen from Moon soil",
    line: (m) => m ? "The plant is pulling oxygen out of the Mars air!" : "The plant is baking oxygen out of Moon soil!",
    real: (m) => m ? "Real: NASA's MOXIE made oxygen from Mars air in 2021." : "Real plan: NASA wants to make oxygen from Moon soil." },
  reinforce_shield: { res: "shielding", spot: [465, 206], feet: [572, 316], short: "Soil shield", where: "Fixing shield", label: () => "Pile soil on the base",
    line: (m) => "More " + (m ? "Mars" : "Moon") + " soil on the roof. That blocks the Sun's rays.",
    real: () => "Real plan: soil piled on a base can block radiation." },
  grow_food: { res: "food", spot: [635, 226], feet: [706, 320], short: "Garden", where: "In the garden", label: () => "Tend the veggie garden",
    line: () => "The lettuce is growing under the pink lights!",
    real: () => "Real: astronauts grow lettuce on the Space Station." },
  science: { res: "science", spot: [860, 262], feet: [880, 322], short: "Crater", where: "In the crater", label: (m) => m ? "Collect crater rocks" : "Hunt for ice in the crater",
    line: (m) => m ? "This rock was shaped by water long ago!" : "I found ice in a crater that never sees the Sun!",
    real: (m) => m ? "Real: the Perseverance rover collects rocks in Jezero crater." : "Real: Artemis crews will look for ice near the south pole." },
};
const WARN = {
  power: ["Maya", "The lights are dimming, Commander. Someone should rest and recharge."],
  oxygen: ["Zuri", "The air feels thin. Can someone run the oxygen plant?"],
  shielding: ["Maya", "The shield is thin. A Sun storm could make us sick!"],
  food: ["Leo", "My tummy is rumbling, Commander! The garden needs me."],
};

const sfx = (name) => { try { playSfx(name); } catch (e) { /* sound is optional */ } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (v, of) => (v / of * 100).toFixed(2) + "%";
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;
const sign = (n) => (n > 0 ? "+" : "−") + Math.abs(n);
// { power: -8, actionsLeft: -1 } -> ["−8 Power", "−1 job today"]
export const effectList = (fx = {}) => Object.keys(fx || {}).map((k) => (k === "actionsLeft" ? sign(fx[k]) + " job today" : sign(fx[k]) + " " + (NAMES[k] || k)));

let minigamesOn = true;

export function startGame(app, site, plan, onEnd) {
  const mars = site === "mars";
  let g = newGame(site);
  if (plan) g = withRealWeather(g, plan);
  let busy = false;   // true while something is animating
  let say = null;
  let facts = 0;
  let openJob = null;

  app.innerHTML = `<main class="game">
<header class="hud">
  <div class="hudtop"><span class="logo">Delta-V 26</span><span class="pill">${SITES[site].name}: ${SITES[site].place}</span>
    <span class="solnum">Sol <b id="sol">1</b> <small>of 30</small></span><div class="path" id="path" aria-hidden="true">${"<i></i>".repeat(30)}</div>
    <span class="pill" id="night" hidden>Moon night</span>
    <button class="hbtn" id="b-tasks">Tasks <b id="taskn">0/3</b></button>
    <button class="hbtn" id="b-up" style="--c:var(--science)">Upgrades <b id="sci">0</b></button>
    <button class="hbtn" id="b-mg" aria-pressed="true">Minigames: on</button></div>
  <div class="meters">${ALL_RES.map((k) => `<div class="meter" id="m-${k}" style="--c:var(--${k})"><div class="top">${icon(k)}<span class="nm">${NAMES[k]}</span><span class="lowtxt"></span><span class="val">0</span><span class="delta"></span></div><div class="track"><div class="ghost"></div><div class="fill"></div></div></div>`).join("")}</div>
</header>
<div class="stage">
  <div class="fore" id="fore" role="region" aria-label="Sun forecast">
    <div class="hd" id="fore-hd">
      <span class="fore-title">Sun forecast</span>
      <span class="tagreal${plan ? "" : " practice"}">${plan ? "REAL NASA 2026" : "PRACTICE"}</span>
      <span class="fore-summary" id="fore-sum"></span>
      <button class="fore-toggle" id="fore-toggle" type="button" aria-expanded="false" aria-label="Toggle forecast details">▼</button>
    </div>
    <div class="days" id="days"></div>
  </div>
  <div class="scene" id="scene">${sceneSvg(site, "The base at " + SITES[site].place + ": solar tower, oxygen plant, home covered in soil, greenhouse, rover and crater")}
    ${Object.keys(JOBS).map((id) => `<button class="spot" data-job="${id}" style="left:${pct(JOBS[id].spot[0], 1024)};top:${pct(JOBS[id].spot[1], 436)};--c:var(--${JOBS[id].res})"><span class="ring">${icon(JOBS[id].res)}</span><span class="lbl">${JOBS[id].short}</span></button>`).join("")}
    ${CREW.map((c) => `<div class="walker" id="w-${c.id}" style="color:${c.color}"><span class="w-timer" hidden><i class="w-fill"></i><b class="w-sec"></b></span><span class="nm">${c.name}</span><div class="fig">${astro(c.color)}</div></div>`).join("")}
    <div class="sheet" id="sheet" hidden></div>
  </div>
</div>
<footer class="bar">
  <div class="chips">${CREW.map((c) => `<div class="chip2" id="c-${c.id}" style="--c:${c.color}"><span class="swatch" style="background:${c.color}" aria-hidden="true"></span><span class="rolecode mono">${ROLE_CODES[c.id]}</span><span><b>${c.name}</b><em></em></span></div>`).join("")}</div>
  <div class="bubble" id="bubble" aria-live="polite"><div class="who"></div><div class="say"></div><div class="real"></div></div>
  <div class="next"><div class="left" id="left"></div><button class="btn" id="next">Next sol</button></div>
</footer>
<aside class="drawer" id="drawer" hidden></aside><div class="toast" id="toast" role="status"></div></main>`;

  const $ = (id) => app.querySelector("#" + id);
  const scene = $("scene");
  const place = (el, [x, y]) => { el.style.left = pct(x, 1024); el.style.top = pct(y, 436); };
  const person = (id) => CREW.find((c) => c.id === id);
  const canPlay = () => !busy && g.status === "playing" && !g.pendingEvent;

  CREW.forEach((c) => place($("w-" + c.id), c.home));
  app.querySelectorAll(".spot").forEach((b) => b.addEventListener("click", () => { if (canPlay()) { sfx("click"); openSheet(b.dataset.job); } }));
  $("next").addEventListener("click", endSol);
  $("b-tasks").addEventListener("click", () => { sfx("click"); openDrawer("tasks"); });
  $("b-up").addEventListener("click", () => { sfx("click"); openDrawer("upgrades"); });
  $("b-mg").addEventListener("click", () => {
    minigamesOn = !minigamesOn;
    $("b-mg").textContent = "Minigames: " + (minigamesOn ? "on" : "off");
    $("b-mg").setAttribute("aria-pressed", minigamesOn);
  });
  $("b-mg").textContent = "Minigames: " + (minigamesOn ? "on" : "off");

  const foreEl = $("fore");
  const foreToggle = $("fore-toggle");
  $("fore-hd").addEventListener("click", () => {
    const open = foreEl.classList.toggle("open");
    foreToggle.setAttribute("aria-expanded", String(open));
  });

  const line = (obj, s) => Object.keys(obj).map((k) => s + obj[k] + " " + NAMES[k]).join(", ");

  // Show what a job would change, before the player commits.
  function preview(a) {
    ALL_RES.forEach((k) => {
      const m = $("m-" + k);
      if (!m) return;
      const d = m.querySelector(".delta"), ghost = m.querySelector(".ghost");
      const change = a ? (a.gain[k] || 0) - (a.cost[k] || 0) : 0;
      d.textContent = change ? sign(change) : "";
      d.className = "delta " + (change > 0 ? "up" : "down");
      const currentVal = k === "science" ? g.science : g[k];
      ghost.style.width = change > 0 ? Math.min(100, Math.max(0, currentVal + change)) + "%" : "0%";
    });
  }

  function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  }

  // Run a change to the game state, then celebrate any task it finished.
  function change(fn) {
    const before = g.tasksDone.length;
    g = fn(g);
    if (g.tasksDone.length > before) {
      const t = getTasks(g).find((x) => x.id === g.tasksDone[g.tasksDone.length - 1]);
      sfx("good");
      toast("Task done! " + t.label + ". Reward: " + effectList(t.reward).join(", "));
    }
  }

  function speak() {
    const lowest = [...RES].sort((x, y) => g[x] - g[y])[0];
    let s = say;
    if (!s && g[lowest] < 30) s = { who: WARN[lowest][0], line: WARN[lowest][1], real: "" };
    if (!s && g.actionsLeft === 0) s = { who: "Mission Control", line: "Good work today. Tap Next sol when you are ready.", real: "" };
    if (!s && g.weather === "storm") s = { who: "Maya", line: "Sun storm today! The shield is taking hits.", real: "" };
    if (!s && g.weather === "active") s = { who: "Zuri", line: "The Sun is active today. Keep an eye on the shield.", real: "" };
    if (!s) s = { who: "Leo", line: "Good morning, Commander! Tap a building to give someone a job.", real: "" };
    const b = $("bubble");
    const changed = b.querySelector(".say").textContent !== s.line;
    b.querySelector(".who").textContent = s.who + " says";
    b.querySelector(".say").textContent = s.line;
    b.querySelector(".real").textContent = s.real || "";
    if (changed) { b.classList.remove("new"); void b.offsetWidth; b.classList.add("new"); }
  }

  function draw() {
    const ready = canPlay() && g.actionsLeft > 0;
    $("sol").textContent = g.sol;
    $("sci").textContent = g.science;
    $("taskn").textContent = g.tasksDone.length + "/3";
    $("b-up").classList.toggle("glow", getUpgrades(g).some((u) => u.canBuy));
    $("night").hidden = !isNight(g);
    $("path").querySelectorAll("i").forEach((d, i) => { d.className = i + 1 < g.sol ? "done" : i + 1 === g.sol ? "now" : ""; });
    ALL_RES.forEach((k) => {
      const m = $("m-" + k);
      if (!m) return;
      const val = k === "science" ? g.science : g[k];
      const low = k !== "science" && val < 30;
      m.classList.toggle("low", low);
      m.querySelector(".lowtxt").textContent = low ? "LOW" : "";
      m.querySelector(".val").textContent = val;
      m.querySelector(".fill").style.width = Math.min(100, Math.max(0, val)) + "%";
    });
    app.querySelectorAll(".spot").forEach((b) => { b.disabled = !ready; b.classList.toggle("ready", ready); });
    const worried = RES.some((k) => g[k] < 30);
    CREW.forEach((c) => {
      const m = g.crew[c.id], w = $("w-" + c.id);
      $("c-" + c.id).querySelector("em").textContent = m.job ? ("Done: " + JOBS[m.job].short) : m.tired ? "Tired" : "Ready";
      $("c-" + c.id).classList.toggle("off", !!m.job);
      $("c-" + c.id).classList.toggle("tired", m.tired && !m.job);
      w.classList.toggle("sad", worried || m.tired);
    });
    scene.className = "scene site-" + site + " weather-" + g.weather + (isNight(g) ? " night" : "") + g.upgrades.map((u) => " has-" + u).join("");
    const dome = scene.querySelector(".dome");
    dome.style.opacity = (0.15 + g.shielding / 100 * 0.85).toFixed(2);
    dome.classList.toggle("weak", g.shielding < 30);
    const fcast = getForecast(g, 3);
    $("fore-sum").innerHTML = "NEXT 3 SOLS: " + (fcast.map((f) => `<span class="tag-weather tag-${f.weather}">${WEATHER[f.weather].label}</span>`).join(" / ") || "FINAL SOL");
    $("days").innerHTML = fcast.map((f) => `<div class="day weather-${f.weather}"><small>Sol ${f.sol}</small><b>${WEATHER[f.weather].label}</b><i>${f.flare ? esc(f.flare.class) + " flare" : f.real ? "no flare" : "&nbsp;"}</i></div>`).join("") || `<div class="day wide"><b class="tag-weather tag-active">Supply ship arrives!</b></div>`;
    $("left").innerHTML = [0, 1].map((i) => `<i class="${i < g.actionsLeft ? "on" : ""}"></i>`).join("") + (g.actionsLeft === 1 ? "1 job left" : g.actionsLeft + " jobs left");
    $("next").classList.toggle("go", g.actionsLeft === 0 && canPlay());
    if (!$("drawer").hidden) fillDrawer();
    speak();
  }

  // ---- Job panel: tap a building, then pick who to send ----

  function openSheet(id) {
    openJob = id;
    const job = JOBS[id], sheet = $("sheet");
    sheet.style.setProperty("--c", `var(--${job.res})`);
    sheet.innerHTML = `<div class="sh-head"><span class="ring">${icon(job.res)}</span><div><h2>${job.label(mars)}</h2><p>${job.real(mars)}</p></div><button class="x" aria-label="Close">&times;</button></div>
<div class="sh-ask">Who should go?</div>
<div class="sh-crew">${CREW.map((c) => {
      const a = getActions(g, c.id).find((x) => x.id === id), m = g.crew[c.id];
      const badge = m.job ? "Busy" : a.skilled && !a.tired ? "Best at this!" : a.tired ? "Tired" : "";
      return `<button class="pick${a.skilled ? " best" : ""}" data-crew="${c.id}" style="--cc:${c.color}"${m.job ? " disabled" : ""}><span class="fig">${astro(c.color)}</span><b>${c.name}</b><small>${c.job}</small><span class="badge${a.tired ? " bad" : ""}">${badge || "&nbsp;"}</span><span class="g">${line(a.gain, "+")}</span><span class="c">${line(a.cost, "−")}</span></button>`;
    }).join("")}</div>`;
    sheet.hidden = false;
    sheet.querySelector(".x").addEventListener("click", closeSheet);
    sheet.querySelectorAll(".pick").forEach((b) => {
      const a = () => getActions(g, b.dataset.crew).find((x) => x.id === id);
      b.addEventListener("click", () => send(id, b.dataset.crew));
      b.addEventListener("pointerenter", () => preview(a())); b.addEventListener("focus", () => preview(a()));
      b.addEventListener("pointerleave", () => preview(null)); b.addEventListener("blur", () => preview(null));
    });
    const first = sheet.querySelector(".pick:not(:disabled)");
    if (first) first.focus();
  }

  function closeSheet() {
    openJob = null;
    $("sheet").hidden = true;
    preview(null);
  }

  function floatText(text, [x, y], color) {
    const f = document.createElement("div");
    f.className = "float"; f.textContent = text; f.style.color = color;
    place(f, [x, y - 78]);
    scene.appendChild(f);
    setTimeout(() => f.remove(), 1500);
  }

  // Send a crew member to a job: walk there, play the minigame, do the work.
  async function send(id, crewId) {
    if (!canPlay() || g.actionsLeft <= 0 || g.crew[crewId].job) return;
    busy = true;
    const who = person(crewId), job = JOBS[id];
    const w = $("w-" + crewId);
    closeSheet();
    sfx("click");
    say = { who: who.name, line: "On my way!", real: "" };
    draw();
    w.classList.add("walking");
    place(w, job.feet);
    await wait(1150);
    w.classList.remove("walking"); w.classList.add("working");
    const bonus = minigamesOn ? await playMinigame(id, mars) : false;
    const timer = w.querySelector(".w-timer");
    const fill = timer.querySelector(".w-fill");
    const sec = timer.querySelector(".w-sec");
    const chipEm = $("c-" + crewId).querySelector("em");
    timer.hidden = false;
    fill.style.transition = "none";
    fill.style.width = "0%";
    void fill.offsetWidth;
    fill.style.transition = "width 3s linear";
    fill.style.width = "100%";
    for (let s = 3; s >= 1; s--) {
      sec.textContent = `${s}s`;
      chipEm.textContent = `Working (${s}s)...`;
      await wait(1000);
    }
    sec.textContent = "Done!";
    chipEm.textContent = "Done: " + job.short;
    const before = g[job.res];
    change((s) => applyAction(s, id, { crew: crewId, bonus }));
    sfx("good");
    floatText((bonus ? "Perfect! " : "") + sign(g[job.res] - before) + " " + NAMES[job.res], job.feet, `var(--${job.res})`);
    say = { who: who.name, line: job.line(mars), real: job.real(mars) };
    busy = false;
    draw();
    await wait(600);
    timer.hidden = true;
  }

  async function endSol() {
    if (!canPlay()) return;
    busy = true;
    closeSheet();
    sfx("click");
    say = null;
    CREW.forEach((c) => { const w = $("w-" + c.id); w.classList.remove("working"); w.classList.add("walking"); w.querySelector(".w-timer").hidden = true; place(w, c.home); });
    let event = null;
    change((s) => { const out = nextSol(s); event = out.event; return out.state; });
    const banner = document.createElement("div");
    banner.className = "solbanner"; banner.textContent = "Sol " + g.sol;
    scene.appendChild(banner);
    await wait(900);
    CREW.forEach((c) => $("w-" + c.id).classList.remove("walking"));
    draw();
    await wait(600);
    banner.remove();
    if (event) await showEvent(event);
    busy = false;
    draw();
    if (g.status !== "playing") { await wait(700); onEnd(g, site, facts); }
  }

  // The event card. Events with choices wait for the player to pick one.
  function showEvent(ev = {}) {
    facts += 1;
    sfx(ev.id === "solar_flare" ? "flare" : "warning");
    scene.classList.add("shake");
    setTimeout(() => scene.classList.remove("shake"), 500);
    const date = ev.flare ? new Date(ev.flare.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
    const chips = (fx) => effectList(fx || {}).map((c) => `<span class="chip">${esc(c)}</span>`).join("");
    const choices = ev.choices || [{ label: "Continue", effects: ev.effects || {} }];
    const hasChoices = Boolean(ev.choices && Array.isArray(ev.choices) && ev.choices.length > 0);
    const veil = document.createElement("div");
    veil.className = "veil";
    veil.innerHTML = `<section class="event" role="dialog" aria-modal="true" aria-labelledby="evt">
<div class="alert-bar"><span class="alert-tag">ALERT</span><span>MISSION CONTROL // NOTIFICATION</span></div>
<div class="head"><svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="26" fill="var(--amber)"/><path d="M48 10V2M48 94v-8M10 48H2M94 48h-8M21 21l-6-6M81 81l-6-6M21 75l-6 6M81 15l-6 6" stroke="var(--red)" stroke-width="6" stroke-linecap="round"/><path d="M48 34v18M48 60v3" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/></svg>
<div><div class="kicker" style="color:var(--red)">SOL ${g.sol} EVENT</div><h2 id="evt">${esc(ev.title || "Mission Event")}</h2></div></div>
<p>${esc(ev.text || "")}</p>
${ev.flare ? `<div class="realline"><span class="tagreal">REAL NASA DONKI DATA</span><span>Solar flare class ${esc(ev.flare.class)}, recorded by NASA DONKI on ${esc(date)}</span></div>` : ""}
${hasChoices
    ? `<div class="choices">${choices.map((c) => `<button class="choice" data-choice="${esc(c.id || "continue")}"><b>${esc(c.label || "Continue")}</b><span>${esc(c.text || "")}</span><span class="chips">${chips(c.effects || {})}</span></button>`).join("")}</div>`
    : `<div class="chips">${chips(ev.effects || {})}</div>`}
<div class="fact"><b>Did you know? This is real!</b><span>${esc(ev.realFact || "")}</span></div>
${hasChoices ? "" : `<button class="btn" data-ok>Got it! Back to the base</button>`}</section>`;
    document.body.appendChild(veil);
    try { addTooltips(veil); } catch (e) {}
    const firstBtn = veil.querySelector("button");
    if (firstBtn) firstBtn.focus();
    return new Promise((done) => {
      const close = () => { sfx("click"); veil.remove(); done(); };
      veil.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => { change((s) => resolveEvent(s, b.dataset.choice)); close(); }));
      const ok = veil.querySelector("[data-ok]");
      if (ok) ok.addEventListener("click", close);
    });
  }

  // ---- Drawers: Mission Control tasks and science upgrades ----

  let drawerKind = null;
  function openDrawer(kind) {
    const d = $("drawer");
    if (!d.hidden && drawerKind === kind) { d.hidden = true; return; }
    drawerKind = kind;
    d.hidden = false;
    fillDrawer();
  }

  function fillDrawer() {
    const d = $("drawer");
    if (drawerKind === "tasks") {
      d.innerHTML = `<div class="dr-head"><h2>Mission Control tasks</h2><button class="x" aria-label="Close">&times;</button></div><p>Finish tasks to earn rewards and stars.</p>
${getTasks(g).map((t) => `<div class="task ${t.status}"><b>${esc(t.label)}</b><div class="track"><div class="fill" style="width:${t.progress / t.goal * 100}%"></div></div><span>${t.status === "done" ? "Done!" : t.status === "failed" ? "Missed" : t.progress + " / " + t.goal} &middot; Reward: ${effectList(t.reward).join(", ")}</span></div>`).join("")}`;
    } else {
      d.innerHTML = `<div class="dr-head"><h2>Upgrades</h2><button class="x" aria-label="Close">&times;</button></div><p>Spend science points to make the base better. You have <b style="color:var(--science)">${g.science}</b>.</p>
${getUpgrades(g).map((u) => `<div class="upcard${u.owned ? " owned" : ""}"><b>${esc(u.label)}</b><span>${esc(u.text)}</span><button class="btn small" data-up="${u.id}"${u.canBuy ? "" : " disabled"}>${u.owned ? "Built" : "Build for " + u.cost}</button></div>`).join("")}`;
      d.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => {
        if (!canPlay()) return;
        const label = getUpgrades(g).find((u) => u.id === b.dataset.up).label;
        change((s) => buyUpgrade(s, b.dataset.up));
        sfx("good");
        toast("Built: " + label + "!");
        say = { who: "Maya", line: "The new " + label.toLowerCase() + " is up and running!", real: "" };
        draw();
      }));
    }
    try { addTooltips(d); } catch (e) {}
    d.querySelector(".x").addEventListener("click", () => { d.hidden = true; });
  }

  draw();
}
