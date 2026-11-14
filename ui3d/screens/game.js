// Main game screen: a 3D diorama of the base you can turn, inside a toy spacecraft console.
// Stations and crew are upright billboards on a tilted disc (pure CSS 3D, see ui3d/game3d.css).
import { RES, RES_INFO, CREW, JOBS, JOB_ORDER, WARN, WEATHER_LABEL, esc, helmet, iconSvg, dateText } from "../parts.js";

const MINUS = "−";
const sign = (n) => (n >= 0 ? "+" : MINUS) + Math.abs(n);
const CREW_BY = Object.fromEntries(CREW.map((c) => [c.id, c]));

// Where things stand on the disc (px from the centre; the disc is 640 across).
const POS = { rest: [-205, -40], oxygen_gen: [-120, 150], reinforce_shield: [10, -40], grow_food: [170, 115], science: [175, -150] };
const HOME = { maya: [-40, 95], leo: [0, 115], zuri: [40, 95] };
const FEET = { rest: [-160, -10], oxygen_gen: [-80, 170], reinforce_shield: [70, 0], grow_food: [120, 150], science: [150, -110] };

// ---- sprites (toy style: 3px ink outlines, flat fills) ----
const SPR = {
  rest: () => `<svg width="150" height="190" viewBox="0 0 150 190" aria-hidden="true">
<rect x="70" y="60" width="10" height="120" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"/>
<path d="M52 180 75 160 98 180" fill="none" stroke="#1E2430" stroke-width="4" stroke-linecap="round"/>
<g transform="rotate(-16 75 46)"><rect x="12" y="22" width="126" height="48" rx="4" fill="#D9A43A" stroke="#1E2430" stroke-width="4"/>
<path d="M43 22v48M75 22v48M107 22v48M12 46h126" stroke="#1E2430" stroke-width="2.5"/><rect x="14" y="24" width="28" height="20" fill="#FFF3C4" opacity=".45"/></g>
<rect x="96" y="150" width="40" height="30" rx="5" fill="#EEF0F2" stroke="#1E2430" stroke-width="3"/><path d="M118 155 110 166h7l-3 9 9-12h-7z" fill="#F5C518" stroke="#1E2430" stroke-width="1.5"/></svg>`,
  oxygen_gen: () => `<svg width="170" height="140" viewBox="0 0 170 140" aria-hidden="true">
<g fill="#fff"><circle class="puff" cx="128" cy="30" r="8"/><circle class="puff p2" cx="132" cy="30" r="6"/><circle class="puff p3" cx="124" cy="30" r="7"/></g>
<rect x="18" y="56" width="70" height="76" rx="18" fill="#DCEEFF" stroke="#1E2430" stroke-width="4"/>
<path d="M30 76h46M30 92h46" stroke="#9CC4EA" stroke-width="5" stroke-linecap="round"/>
<path d="M88 100h26v-58h14" fill="none" stroke="#1E2430" stroke-width="6" stroke-linejoin="round"/>
<rect x="108" y="96" width="52" height="36" rx="6" fill="#EEF0F2" stroke="#1E2430" stroke-width="4"/>
<circle cx="134" cy="114" r="11" fill="#4BA3F0" stroke="#1E2430" stroke-width="3"/><path d="M134 103v22M123 114h22" stroke="#1E2430" stroke-width="2.5"/></svg>`,
  reinforce_shield: () => `<svg width="250" height="170" viewBox="0 0 250 170" aria-hidden="true">
<ellipse class="dome" cx="125" cy="120" rx="118" ry="106" fill="#9B7BF7" fill-opacity=".14" stroke="#9B7BF7" stroke-width="4" stroke-dasharray="10 8" style="opacity: var(--shield-op, .8)"/>
<path d="M30 160 a95 70 0 0 1 190 0z" fill="var(--soil)" stroke="#1E2430" stroke-width="4"/>
<path d="M58 160 a67 58 0 0 1 134 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"/>
<path d="M70 132h110M80 116h90" stroke="#C9CED6" stroke-width="4"/>
<rect x="111" y="124" width="28" height="36" rx="6" fill="#4A5363" stroke="#1E2430" stroke-width="3"/>
<circle class="win" cx="86" cy="140" r="8" stroke="#1E2430" stroke-width="2.5"/><circle class="win" cx="164" cy="140" r="8" stroke="#1E2430" stroke-width="2.5"/>
<path d="M125 102V62l20 8" fill="none" stroke="#1E2430" stroke-width="4" stroke-linecap="round"/><circle class="blink" cx="125" cy="60" r="5" fill="#F26A1B"/></svg>`,
  grow_food: () => `<svg width="180" height="130" viewBox="0 0 180 130" aria-hidden="true">
<path d="M14 122 a76 76 0 0 1 152 0z" fill="#DDF3D8" stroke="#1E2430" stroke-width="4"/>
<path d="M30 122 a60 60 0 0 1 120 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>
<rect class="grow" x="48" y="64" width="22" height="10" rx="3" fill="#FF7AD9" stroke="#1E2430" stroke-width="2"/><rect class="grow g2" x="80" y="58" width="22" height="10" rx="3" fill="#FF7AD9" stroke="#1E2430" stroke-width="2"/><rect class="grow" x="112" y="64" width="22" height="10" rx="3" fill="#FF7AD9" stroke="#1E2430" stroke-width="2"/>
<path d="M50 122v-22M50 108c-9 0-12-9-12-9M70 122v-28M70 102c10 0 13-10 13-10M92 122v-24M110 122v-30M110 100c10 0 12-9 12-9M130 122v-20" stroke="#2F7A2C" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
  science: (m) => `<svg width="120" height="140" viewBox="0 0 120 140" aria-hidden="true">
<path d="M30 132V30" stroke="#1E2430" stroke-width="5" stroke-linecap="round"/><path d="M32 30h44l-10 14 10 14H32z" fill="#F26A1B" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<g class="grow"><path d="M78 118l10-22 10 22-10 10z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/></g>
<path d="M60 128l7-15 7 15-7 7z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path class="blink" d="M98 92l4-6M104 100l7-2" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
};
const astro = (color) => `<svg class="fig" width="44" height="64" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb" stroke="#1E2430" stroke-width="2"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="34" width="20" height="5" fill="${color}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#1E2430"/><path d="M17 10h5" stroke="#8FD9F0" stroke-width="2" stroke-linecap="round"/></svg>`;
const WARN_ICON = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B3261E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20zM12 10v5M12 18v.5"/></svg>`;

function skySvg(mars) {
  const stars = [[60, 40], [150, 90], [240, 30], [330, 70], [420, 24], [520, 60], [610, 30], [700, 80], [790, 40], [880, 70], [100, 160], [860, 170], [470, 120], [40, 230], [900, 240]];
  return `<svg class="sky" viewBox="0 0 932 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
${mars ? "" : stars.map(([x, y], i) => `<circle class="twinkle${i % 2 ? " b" : ""}" cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.5}" fill="#F3F4F6"/>`).join("")}
${mars ? `<circle cx="160" cy="90" r="22" fill="#FFF3DC" opacity=".9"/><g fill="#E8A878" opacity=".25"><rect class="dust" x="-200" y="150" width="1300" height="28" rx="14"/><rect class="dust d2" x="-200" y="200" width="1300" height="18" rx="9"/></g>`
    : `<g transform="translate(800 90)"><circle r="34" fill="#3D7BD9" stroke="#1E2430" stroke-width="3"/><path d="M-24 -10 C-14 -22 0 -18 2 -8 C4 2 -6 4 -8 12 C-10 20 -20 16 -24 8Z" fill="#5CBF5A"/><path d="M8 -26 C18 -24 22 -16 18 -8 C14 -2 6 -6 4 -12Z" fill="#5CBF5A"/><path d="M4 -34 A34 34 0 0 1 4 34 A26 34 0 0 0 4 -34Z" fill="#0B1020" opacity=".4"/></g>
<g class="sunsym" transform="translate(110 80)"><circle r="20" fill="#FFF6D6"/><circle r="34" fill="#FFF6D6" opacity=".18"/></g>`}
<g class="streaks s-active" stroke="#F5C518" stroke-width="3" stroke-linecap="round"><line x1="110" y1="80" x2="560" y2="40"/><line x1="110" y1="88" x2="600" y2="140"/><line x1="110" y1="74" x2="460" y2="10"/></g>
<g class="streaks s-storm" stroke="#FF6A3D" stroke-width="5" stroke-linecap="round"><line x1="110" y1="80" x2="680" y2="60"/><line x1="110" y1="92" x2="700" y2="200"/><line x1="110" y1="70" x2="560" y2="0"/></g></svg>`;
}

export function mount(root, ctx) {
  const store = ctx.store, eng = ctx.engine;
  const mars = store.site === "mars";
  const S = () => store.state;
  let busy = false, openJob = null, say = null, yaw = -12, alive = true;
  const walking = {};
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  const slabs = Array.from({ length: 7 }, (_, i) => `<div class="slab" style="transform: translateZ(${-(i + 1) * 5}px); filter: brightness(${(1 - i * 0.07).toFixed(2)})"></div>`).join("");
  root.innerHTML = `<div id="g3" class="${mars ? "mars" : "moon"}">
<header class="top">
  <div class="logo">Delta-V <b>26</b></div><div class="place">${mars ? "Jezero Base, Mars" : "Shackleton Base, the Moon"}</div>
  <div class="solbox" role="group" aria-label="Mission day"><span>Sol</span><strong id="sol"></strong><span>of 30</span><div class="path" id="path" aria-hidden="true"></div></div>
  <button type="button" class="key tbtn" id="b-tasks"></button>
  <button type="button" class="key tbtn" id="b-up"></button>
  <button type="button" class="key tbtn" id="b-bonus" aria-pressed="true"></button>
</header>
<div class="meters" id="meters">${RES.map((k) => `<div class="meter" id="m-${k}" role="img" style="--c: ${RES_INFO[k].color}">
  <div class="row">${iconSvg(k, 24, "#1E2430")}<span class="nm">${RES_INFO[k].name}</span><span class="low">${WARN_ICON}LOW</span><span class="delta"></span><span class="val"></span></div>
  <div class="bar"><div class="ghost" style="background: var(--c)"></div><div class="fill" style="background: var(--c)"></div></div></div>`).join("")}</div>
<div class="world" id="world">
  ${skySvg(mars)}
  <div class="wxtag" id="wxtag"></div><div class="nighttag">Moon night: dark for 14 sols</div>
  <div class="stage3d"><div class="board" id="board" style="--yaw: ${yaw}deg">
    ${slabs}<div class="disc"></div>
    <div class="flat crater" style="left: ${320 + 175 - 75}px; top: ${320 - 150 - 35}px"></div>
    <div class="flat rock" style="left: 150px; top: 470px"></div><div class="flat rock" style="left: 470px; top: 520px"></div><div class="flat rock" style="left: 520px; top: 300px"></div>
    <div class="path3d"></div>
    <div class="flat flood" style="left: ${320 + 10}px; top: ${320 - 40}px"></div><div class="flat flood" style="left: ${320 + 170}px; top: ${320 + 115}px"></div>
    ${JOB_ORDER.map((id) => `<div class="flat shadow" style="left: ${320 + POS[id][0]}px; top: ${320 + POS[id][1]}px"></div>`).join("")}
    <div class="shade"></div>
    ${JOB_ORDER.map((id) => `<button type="button" class="bb station" id="st-${id}" data-job="${id}" style="--x: ${POS[id][0]}; --y: ${POS[id][1]}; --yaw: ${yaw}deg; --c: ${RES_INFO[JOBS[id].res].color}" aria-label="${esc(JOBS[id].label(mars))}">
      <span class="lbl"><i></i>${esc(JOBS[id].short)}</span>${SPR[id](mars)}</button>`).join("")}
    ${CREW.map((c) => `<div class="bb walker" id="w-${c.id}" style="--x: ${HOME[c.id][0]}; --y: ${HOME[c.id][1]}; --yaw: ${yaw}deg"><span class="tag" style="border-color: ${c.color}">${c.name}</span>${astro(c.color)}<span class="zz" hidden>zz</span></div>`).join("")}
  </div></div>
  <button type="button" class="key turn l" id="t-l" aria-label="Turn the base left"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 0 5-5"/></svg></button>
  <button type="button" class="key turn r" id="t-r" aria-label="Turn the base right"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 7 5 5-5 5M20 12H9a5 5 0 0 1-5-5"/></svg></button>
  <div class="hint">Drag to spin the base · Q / E to turn</div>
</div>
<aside class="side">
  <section class="screen" id="fc" aria-label="Sun forecast"></section>
  <section class="card" id="card"></section>
</aside>
<footer class="dock">
  <div class="crew" id="crew"></div>
  <div class="say" id="say" aria-live="polite"><div class="who"></div><div class="line"></div><div class="fact"></div></div>
  <button type="button" class="key endsol" id="b-end">End sol<small id="left"></small></button>
</footer>
</div>`;

  const $ = (id) => root.querySelector("#" + id);
  const g3 = $("g3"), world = $("world"), board = $("board");

  // ---------- turning the base ----------
  function setYaw(v, instant) {
    yaw = v;
    world.classList.toggle("dragging", !!instant);
    board.style.setProperty("--yaw", yaw + "deg");
    board.querySelectorAll(".bb").forEach((el) => el.style.setProperty("--yaw", yaw + "deg"));
  }
  let drag = null;
  world.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    drag = { x: e.clientX, yaw };
    world.setPointerCapture(e.pointerId);
  });
  world.addEventListener("pointermove", (e) => { if (drag) setYaw(drag.yaw + (e.clientX - drag.x) * 0.35, true); });
  const endDrag = () => { if (drag) { drag = null; world.classList.remove("dragging"); } };
  world.addEventListener("pointerup", endDrag);
  world.addEventListener("pointercancel", endDrag);
  $("t-l").addEventListener("click", () => setYaw(yaw - 45));
  $("t-r").addEventListener("click", () => setYaw(yaw + 45));
  const onKey = (e) => {
    if (document.querySelector(".dv-overlay") || e.target.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === "q") setYaw(yaw - 30);
    else if (k === "e") setYaw(yaw + 30);
    else if (e.key === "Escape" && openJob) { const id = openJob; openJob = null; preview(null, null); draw(); $("st-" + id).focus(); }
  };
  document.addEventListener("keydown", onKey);

  // ---------- drawing ----------
  function preview(gain, cost) {
    RES.forEach((k) => {
      const m = $("m-" + k), ch = ((gain && gain[k]) || 0) - ((cost && cost[k]) || 0);
      const d = m.querySelector(".delta");
      d.textContent = ch ? sign(ch) : "";
      d.className = "delta " + (ch > 0 ? "up" : "down");
      m.querySelector(".ghost").style.transform = `scaleX(${ch > 0 ? Math.min(100, S()[k] + ch) / 100 : 0})`;
    });
  }

  function speech() {
    const s = S();
    let v = say;
    if (!v) {
      const low = [...RES].sort((a, b) => s[a] - s[b])[0];
      if (s[low] < 30) v = { who: WARN[low][0], line: WARN[low][1] };
      else if (s.actionsLeft === 0) v = { who: "zuri", line: "All jobs are done for today. Press End sol when you're ready." };
      else if (s.weather === "storm") v = { who: "maya", line: "Big Sun storm today! The shield is taking hits." };
      else if (s.weather === "active") v = { who: "zuri", line: "The Sun is busy today. Keep an eye on the shield." };
      else v = { who: "leo", line: s.actionsLeft === 2 ? "Morning, Commander! Tap a building to give someone a job." : "One more job today. Who's next?" };
    }
    const el = $("say"), name = CREW_BY[v.who] ? CREW_BY[v.who].name : "Mission Control";
    const changed = el.querySelector(".line").textContent !== v.line;
    el.querySelector(".who").textContent = name;
    el.querySelector(".line").textContent = v.line;
    el.querySelector(".fact").textContent = v.fact ? "True NASA fact: " + v.fact : "";
    if (changed) { el.classList.remove("new"); void el.offsetWidth; el.classList.add("new"); }
  }

  function drawForecast() {
    const s = S(), label = ctx.dataLabel();
    const todayPlan = s.weatherPlan && s.weatherPlan[s.sol - 1];
    const days = [{ sol: s.sol, weather: s.weather, flare: todayPlan && todayPlan.class ? { class: todayPlan.class, date: todayPlan.date } : null, today: true }, ...eng.getForecast(s, 3)];
    $("fc").innerHTML = `<h2>Sun forecast <span class="chip${label.real ? "" : " practice"}">${label.real ? "REAL NASA DATA" : "PRACTICE"}</span></h2>
<div class="days">${days.map((d) => `<div class="day${d.today ? " today" : ""}"><small>${d.today ? "Today" : "Sol " + d.sol}</small><b class="wx-${d.weather}">${WEATHER_LABEL[d.weather]}</b><span>${d.flare ? esc(d.flare.class) + " flare" : "no flare"}</span></div>`).join("")}</div>
${label.real ? `<p style="margin: 8px 0 0; font-size: 12px; color: #7FA894">${esc(label.text)}${todayPlan && todayPlan.date ? " · today is " + esc(dateText(todayPlan.date)) : ""}</p>` : `<div class="practice-banner">Practice weather: made up, not real NASA data</div>`}`;
  }

  const fx = (obj, neg) => Object.keys(obj).map((k) => (neg ? MINUS + obj[k] : sign(obj[k])) + " " + RES_INFO[k].name).join(", ");

  function drawCard() {
    const s = S(), card = $("card");
    if (openJob) {
      const job = JOBS[openJob];
      const base = eng.getActions(s).find((a) => a.id === openJob);
      card.innerHTML = `<div class="pop-in" style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: center; gap: 10px">${iconSvg(job.res, 28, "#1E2430")}<h3>${esc(job.label(mars))}</h3></div>
<p class="muted">Gets <b style="color: #1F7A35">${esc(fx(base.gain))}</b>, costs <b style="color: #B3261E">${esc(fx(base.cost, true))}</b></p>
<p style="font-weight: 800; font-size: 15px">Who goes?</p>
${CREW.map((c) => {
        const a = eng.getActions(s, c.id).find((x) => x.id === openJob), m = s.crew[c.id];
        const word = m.job ? "Busy" : a.skilled && !a.tired ? "Best at this!" : a.tired ? "Tired" : "Ready";
        const cls = m.job ? "busy" : a.skilled && !a.tired ? "best" : a.tired ? "tired" : "";
        return `<button type="button" class="key pick" data-crew="${c.id}" ${m.job ? "disabled" : ""} aria-label="Send ${esc(c.name)}. ${esc(word)}. ${esc(fx(a.gain))}. ${esc(fx(a.cost, true))}.">${helmet(c.color, 48)}<span class="who">${esc(c.name)} <span class="badge ${cls}">${esc(word)}</span></span><span class="nums"><span class="g">${esc(fx(a.gain))}</span> · <span class="c">${esc(fx(a.cost, true))}</span></span></button>`;
      }).join("")}
<button type="button" class="key" id="b-cancel" style="height: 46px; font-weight: 700; font-size: 16px">Not now</button></div>`;
      card.querySelectorAll(".pick").forEach((b) => {
        const a = () => eng.getActions(S(), b.dataset.crew).find((x) => x.id === openJob);
        b.addEventListener("click", () => send(openJob, b.dataset.crew));
        const on = () => { const x = a(); if (x) preview(x.gain, x.cost); };
        b.addEventListener("pointerenter", on); b.addEventListener("focus", on);
        b.addEventListener("pointerleave", () => preview(null, null)); b.addEventListener("blur", () => preview(null, null));
      });
      $("b-cancel").addEventListener("click", () => { const id = openJob; openJob = null; preview(null, null); draw(); $("st-" + id).focus(); });
      const first = card.querySelector(".pick:not(:disabled)");
      if (first) first.focus();
      return;
    }
    const tasks = eng.getTasks(s);
    const mark = { done: "Done", failed: "Missed", active: "" };
    card.innerHTML = `<h3>Today's plan</h3>
<p class="muted">${s.actionsLeft > 0 ? `Tap a building on the base, then pick who goes. You have <b>${s.actionsLeft} job${s.actionsLeft === 1 ? "" : "s"}</b> left today.` : "All jobs are done. Press <b>End sol</b> to start the next day."}</p>
<p style="font-weight: 800; font-size: 15px; margin-top: 4px">Mission Control goals</p>
${tasks.map((t) => `<div class="goal"><span style="flex: 0 0 150px; font-size: 13px; line-height: 1.25">${esc(t.label)}</span><span class="gbar" role="img" aria-label="${t.progress} of ${t.goal}"><i style="width: ${Math.round(t.progress / t.goal * 100)}%"></i></span><b style="font-size: 13px; font-variant-numeric: tabular-nums; min-width: 44px; text-align: right">${mark[t.status] || t.progress + "/" + t.goal}</b></div>`).join("")}`;
  }

  function draw() {
    const s = S(), night = eng.isNight(s) && !mars;
    $("sol").textContent = s.sol;
    $("path").innerHTML = Array.from({ length: 30 }, (_, i) => {
      const n = i + 1, cls = n < s.sol ? "done" : n === s.sol ? "now" : (!mars && eng.isNight({ ...s, sol: n }) ? "night" : "");
      return `<i class="${cls}"></i>`;
    }).join("");
    const done = eng.getTasks(s).filter((t) => t.status === "done").length;
    const canBuy = eng.getUpgrades(s).some((u) => u.canBuy);
    $("b-tasks").innerHTML = `Goals <span class="n">${done}/3</span>`;
    $("b-tasks").setAttribute("aria-label", `Mission Control goals, ${done} of 3 done`);
    $("b-up").innerHTML = `${iconSvg("science", 20, "#1E2430")}Upgrades <span class="n">${s.science}</span>`;
    $("b-up").setAttribute("aria-label", `Upgrades. ${s.science} science points${canBuy ? ". You can build one now" : ""}`);
    $("b-up").classList.toggle("glow", canBuy);
    $("b-bonus").textContent = "Bonus games: " + (store.minigames ? "on" : "off");
    $("b-bonus").setAttribute("aria-pressed", String(store.minigames));
    RES.forEach((k) => {
      const m = $("m-" + k), v = s[k];
      m.classList.toggle("is-low", v < 30);
      m.querySelector(".val").textContent = v;
      m.querySelector(".fill").style.transform = `scaleX(${v / 100})`;
      m.setAttribute("aria-label", `${RES_INFO[k].name} ${v} out of 100${v < 30 ? ", low" : ""}`);
    });
    g3.classList.toggle("night", night);
    g3.classList.remove("wx-calm", "wx-active", "wx-storm");
    g3.classList.add("wx-" + s.weather);
    g3.style.setProperty("--shield-op", (0.15 + s.shielding / 100 * 0.85).toFixed(2));
    board.querySelectorAll(".dome").forEach((d) => d.classList.toggle("weak", s.shielding < 30));
    $("wxtag").textContent = "Today: " + WEATHER_LABEL[s.weather] + " Sun";
    const ready = !busy && s.status === "playing" && s.actionsLeft > 0 && !s.pendingEvent;
    JOB_ORDER.forEach((id) => {
      const b = $("st-" + id);
      b.disabled = !ready;
      b.classList.toggle("ready", ready && !openJob);
      b.classList.toggle("open", openJob === id);
    });
    $("crew").innerHTML = CREW.map((c) => {
      const m = s.crew[c.id], w = walking[c.id];
      const st = w ? "Working…" : m.job ? "Done: " + JOBS[m.job].short : m.tired ? "Tired" : "Ready";
      return `<div class="cchip${m.tired && !m.job ? " tired" : ""}${m.job || w ? " busy" : ""}">${helmet(c.color, 46)}<span><b>${c.name}</b><em>${esc(st)}</em></span></div>`;
    }).join("");
    CREW.forEach((c) => { $("w-" + c.id).querySelector(".zz").hidden = !s.crew[c.id].tired; });
    $("left").textContent = s.actionsLeft === 1 ? "1 job left" : s.actionsLeft + " jobs left";
    $("b-end").disabled = busy || s.status !== "playing";
    $("b-end").classList.toggle("go", s.actionsLeft === 0 && !busy);
    drawForecast();
    drawCard();
    speech();
  }

  function placeWalker(id, pos, cls) {
    const w = $("w-" + id);
    w.style.setProperty("--x", pos[0]); w.style.setProperty("--y", pos[1]);
    w.classList.remove("walking", "working");
    if (cls) w.classList.add(cls);
  }

  function floatText(text, el, color) {
    const sr = g3.getBoundingClientRect(), r = el.getBoundingClientRect();
    const scale = sr.width / 1280;
    const f = document.createElement("div");
    f.className = "float"; f.textContent = text; f.style.color = color;
    f.style.left = ((r.left + r.width / 2 - sr.left) / scale) + "px";
    f.style.top = ((r.top - sr.top) / scale - 10) + "px";
    g3.appendChild(f);
    later(() => f.remove(), 1600);
  }

  // ---------- actions ----------
  JOB_ORDER.forEach((id) => $("st-" + id).addEventListener("click", () => {
    if (busy) return;
    ctx.sfx("click");
    openJob = openJob === id ? null : id;
    preview(null, null);
    draw();
  }));
  $("b-tasks").addEventListener("click", async () => { ctx.sfx("click"); await (await import("../overlays/missions.js")).showMissions(ctx); if (alive) draw(); });
  $("b-up").addEventListener("click", async () => { ctx.sfx("click"); await (await import("../overlays/upgrades.js")).showUpgrades(ctx); if (alive) draw(); });
  $("b-bonus").addEventListener("click", () => { store.minigames = !store.minigames; ctx.sfx("click"); draw(); });

  async function send(id, crewId) {
    const s0 = S();
    if (busy || s0.status !== "playing" || s0.actionsLeft <= 0 || s0.crew[crewId].job) return;
    busy = true; openJob = null; walking[crewId] = id;
    preview(null, null);
    ctx.sfx("click");
    say = { who: crewId, line: "On my way!" };
    placeWalker(crewId, FEET[id], "walking");
    draw();
    await ctx.sleep(1100);
    if (!alive) return;
    placeWalker(crewId, FEET[id], "working");
    let won = false;
    if (store.minigames) {
      try { won = !!(await (await import("../overlays/tasks.js")).runTask(ctx, id, crewId)); } catch (e) { won = false; }
    } else await ctx.sleep(500);
    if (!alive) return;
    const res = JOBS[id].res, before = S()[res];
    store.state = eng.applyAction(S(), id, { crew: crewId, bonus: won });
    delete walking[crewId];
    ctx.sfx("good");
    floatText((won ? "Perfect! " : "") + sign(S()[res] - before) + " " + RES_INFO[res].name, $("st-" + id), "#1E2430");
    say = { who: crewId, line: JOBS[id].line(mars), fact: JOBS[id].real(mars) };
    busy = false;
    draw();
  }

  $("b-end").addEventListener("click", async () => {
    if (busy || S().status !== "playing") return;
    busy = true; openJob = null; say = null;
    ctx.sfx("click");
    CREW.forEach((c) => placeWalker(c.id, HOME[c.id], "walking"));
    const out = eng.nextSol(S());
    store.state = out.state;
    const ban = document.createElement("div");
    ban.className = "banner"; ban.textContent = "Sol " + S().sol;
    g3.appendChild(ban);
    draw();
    await ctx.sleep(1200);
    if (!alive) return;
    ban.remove();
    CREW.forEach((c) => placeWalker(c.id, HOME[c.id], null));
    if (out.event) {
      world.classList.remove("shake"); void world.offsetWidth; world.classList.add("shake");
      const { showEvent } = await import("../overlays/event.js");
      const choice = await showEvent(ctx, out.event);
      if (!alive) return;
      if (out.event.choices && S().status === "playing") store.state = eng.resolveEvent(S(), choice);
    }
    busy = false;
    draw();
    const st = S().status;
    if (st !== "playing") { await ctx.sleep(700); if (alive) ctx.go(st === "won" ? "win" : "lose"); }
  });

  draw();
  return () => { alive = false; document.removeEventListener("keydown", onKey); timers.forEach(clearTimeout); };
}
