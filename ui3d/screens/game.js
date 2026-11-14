// Main game screen: a big isometric base floating in space that you can turn.
// Buildings are real CSS 3D models (boxes and cylinders) on a tilted square slab; crew, flags and
// the round dome are upright billboards (see ui3d/game3d.css).
import { RES, RES_INFO, CREW, JOBS, JOB_ORDER, WARN, WEATHER_LABEL, esc, helmet, iconSvg, dateText } from "../parts.js";

const MINUS = "−";
const sign = (n) => (n >= 0 ? "+" : MINUS) + Math.abs(n);
const CREW_BY = Object.fromEntries(CREW.map((c) => [c.id, c]));
const H = 340; // half the slab size in px

// Where things stand on the slab (px from the centre). With the default 45° turn,
// screen-front is (x + y) > 0 and screen-right is (x − y) > 0.
const POS = { rest: [-220, 150], oxygen_gen: [10, 238], reinforce_shield: [-30, -30], grow_food: [205, -205], science: [236, 36] };
const FEET = { rest: [-160, 178], oxygen_gen: [82, 196], reinforce_shield: [70, -64], grow_food: [136, -146], science: [142, 72] };
const HOME = { maya: [84, 132], leo: [120, 120], zuri: [132, 84] };
const DOOR = { maya: [58, 72], leo: [65, 65], zuri: [72, 58] };
const PAD = [-40, -238];
const DOOR_C = [65, 65];
// how tall each model is, so its label floats just above it
const LIFT = { rest: 150, oxygen_gen: 96, reinforce_shield: 120, grow_food: 92 };

// ---- CSS 3D building blocks ----
// box: w × d footprint, h tall, centred at (x, y) inside its parent, sitting at height z.
// Faces: t (top), py/ny (+y / −y sides), px/nx (+x / −x sides). Extra HTML can go on any face.
function box(w, d, h, o = {}) {
  const { x = 0, y = 0, z = 0, cls = "", t = "", py = "", px = "", ny = "", nx = "" } = o;
  const side = (ww, extra, tf, body) => `<i class="f ${extra}" style="width: ${ww}px; height: ${h}px; left: ${(w - ww) / 2}px; top: ${(d - h) / 2}px; transform: translateZ(${h / 2}px) ${tf}">${body}</i>`;
  return `<div class="cube ${cls}" style="width: ${w}px; height: ${d}px; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%) translateZ(${z}px)">
<i class="f t" style="width: ${w}px; height: ${d}px; transform: translateZ(${h}px)">${t}</i>
${side(w, "py", `rotateX(-90deg) translateZ(${d / 2}px)`, py)}${side(w, "ny", `rotateX(90deg) translateZ(${d / 2}px)`, ny)}
${side(d, "px", `rotateZ(-90deg) rotateX(-90deg) translateZ(${w / 2}px)`, px)}${side(d, "nx", `rotateZ(90deg) rotateX(-90deg) translateZ(${w / 2}px)`, nx)}</div>`;
}
// cylinder: radius r, h tall, n sides, centred at (x, y), sitting at height z. Sides are shaded toward the Sun.
function cyl(r, h, o = {}) {
  const { x = 0, y = 0, z = 0, n = 14, cls = "", t = "" } = o;
  const s = 2 * r * Math.tan(Math.PI / n) + 1.5, ap = r * Math.cos(Math.PI / n);
  let sides = "";
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n, lit = 0.72 + 0.28 * Math.max(0, Math.cos(((a - 200) * Math.PI) / 180));
    sides += `<i class="f s" style="width: ${s}px; height: ${h}px; left: ${r - s / 2}px; top: ${r - h / 2}px; filter: brightness(${lit.toFixed(2)}); transform: translateZ(${h / 2}px) rotateZ(${a}deg) rotateX(-90deg) translateZ(${ap}px)"></i>`;
  }
  return `<div class="cyl ${cls}" style="width: ${2 * r}px; height: ${2 * r}px; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%) translateZ(${z}px)">${sides}<i class="f t" style="width: ${2 * r}px; height: ${2 * r}px; transform: translateZ(${h}px)">${t}</i></div>`;
}
// the five buildings
const MODEL = {
  rest: () => `${box(30, 30, 22, { x: 34, y: 24, cls: "white" , py: `<b class="bolt"></b>` })}
${box(12, 12, 124, { cls: "white" })}
<div class="track" style="transform: translateZ(128px)"><div class="tilt">${box(150, 80, 6, { cls: "panel", t: `<b class="grid"></b>` })}</div></div>`,
  oxygen_gen: () => `${box(96, 74, 62, { cls: "white", py: `<b class="slot"></b><b class="lights"><u></u><u></u><u></u></b>`, px: `<b class="winbox"></b><b class="winbox two"></b>` })}
${cyl(10, 40, { x: 18, y: -12, z: 62, n: 10, cls: "white" })}
${cyl(20, 92, { x: -38, y: 62, n: 14, cls: "tank", t: `<b class="shine"></b>` })}`,
  reinforce_shield: () => `${cyl(92, 18, { n: 20, cls: "plinth" })}
${box(40, 40, 46, { x: 66, y: 66, z: 0, cls: "white airlock", py: `<b class="door"></b>`, px: `<b class="door"></b>` })}`,
  grow_food: () => `${box(128, 100, 70, { cls: "glass", t: `<b class="roof"></b>`, py: `<b class="frame"></b>`, px: `<b class="frame"></b>`, ny: `<b class="frame"></b>`, nx: `<b class="frame"></b>` })}
${box(128, 10, 10, { z: 70, cls: "ridge" })}`,
};

// ---- flat sprites (toy style: 3px ink outlines, flat fills); only the crater flag is still one ----
const SPR = {
  science: (m) => `<svg width="140" height="160" viewBox="0 0 120 140" aria-hidden="true">
<path d="M30 132V30" stroke="#1E2430" stroke-width="5" stroke-linecap="round"/><path class="flag" d="M32 30h44l-10 14 10 14H32z" fill="#F26A1B" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path d="M76 124l10-22 10 22-10 10z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path d="M52 130l7-15 7 15-7 7z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path class="sparkle" d="M100 94l2-7 2 7 7 2-7 2-2 7-2-7-7-2z" fill="#fff"/><path class="sparkle s2" d="M66 108l1.5-5 1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5z" fill="#fff"/></svg>`,
};
const rover = () => `<svg width="90" height="70" viewBox="0 0 90 70" aria-hidden="true">
<path class="beam" d="M70 28 140 6v46z" fill="#FFF3C4" opacity=".5"/>
<rect x="12" y="24" width="56" height="24" rx="5" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"/>
<rect x="20" y="30" width="16" height="10" rx="2" fill="#4BA3F0" stroke="#1E2430" stroke-width="2"/>
<path d="M54 24V8" stroke="#1E2430" stroke-width="3"/><circle class="blink" cx="54" cy="7" r="4" fill="#F26A1B" stroke="#1E2430" stroke-width="2"/>
<rect x="64" y="24" width="10" height="9" rx="2" fill="#4BA3F0" stroke="#1E2430" stroke-width="2"/>
<circle cx="22" cy="54" r="9" fill="#4A5363" stroke="#1E2430" stroke-width="3"/><circle cx="58" cy="54" r="9" fill="#4A5363" stroke="#1E2430" stroke-width="3"/></svg>`;
// the habitat dome is round, so a camera-facing billboard looks right from every side
const DOME = () => `<svg width="250" height="200" viewBox="0 0 250 200" aria-hidden="true">
<ellipse class="dome" cx="125" cy="128" rx="120" ry="112" fill="#9B7BF7" fill-opacity=".14" stroke="#9B7BF7" stroke-width="4" stroke-dasharray="10 8" style="opacity: var(--shield-op, .8)"/>
<path d="M39 196 a86 86 0 0 1 172 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"/>
<path d="M58 196 a67 67 0 0 1 36 -58" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<path d="M48 166 h154" stroke="#9AA3AF" stroke-width="7" stroke-dasharray="15 10"/>
<circle class="win" cx="160" cy="140" r="11" stroke="#1E2430" stroke-width="3"/><circle class="win" cx="92" cy="146" r="8" stroke="#1E2430" stroke-width="3"/>
<g class="dish"><path d="M125 112V90" stroke="#1E2430" stroke-width="4"/><path d="M104 84a21 10 0 0 0 42 0z" fill="#EEF0F2" stroke="#1E2430" stroke-width="3"/><circle class="blink" cx="125" cy="74" r="4.5" fill="#F26A1B"/></g></svg>`;
const plant = (i) => `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><g class="sway" style="animation-delay: ${-i * 0.6}s"><path d="M17 44V22" stroke="#2F7A2C" stroke-width="4" stroke-linecap="round"/><circle cx="17" cy="16" r="12" fill="#5CBF5A" stroke="#1E2430" stroke-width="2.5"/>${i % 2 ? `<circle cx="13" cy="13" r="3" fill="#FF7AD9"/>` : ""}</g></svg>`;
const shipFlag = () => `<svg width="56" height="90" viewBox="0 0 56 90" aria-hidden="true"><path d="M10 88V10" stroke="#1E2430" stroke-width="4" stroke-linecap="round"/><rect x="12" y="6" width="40" height="28" rx="4" fill="#F5C518" stroke="#1E2430" stroke-width="3"/><text id="shipn" x="32" y="27" text-anchor="middle" font-family="Lexend, sans-serif" font-weight="800" font-size="17" fill="#1E2430"></text></svg>`;
const astro = (color) => `<svg class="fig" width="50" height="74" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb" stroke="#1E2430" stroke-width="2"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="34" width="20" height="5" fill="${color}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#E9B44C" stroke="#1E2430" stroke-width="1.5"/><path d="M17 9h5" stroke="#FFF3C4" stroke-width="2" stroke-linecap="round"/></svg>`;

function skySvg(mars) {
  const stars = [];
  for (let i = 0; i < 70; i++) stars.push([(i * 397) % 1280, (i * 211 + 40) % 800, 0.8 + (i % 3) * 0.6]);
  return `<svg class="sky" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
${stars.map(([x, y, r], i) => `<circle class="twinkle ${"abc"[i % 3]}" cx="${x}" cy="${y}" r="${r}" fill="${mars ? "#F6D9C4" : "#F3F4F6"}"/>`).join("")}
<line class="shoot" x1="980" y1="180" x2="620" y2="320" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<line class="shoot s2" x1="420" y1="160" x2="120" y2="300" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
${mars ? `<g fill="#E8A878" opacity=".22"><rect class="dust" x="-200" y="420" width="1700" height="34" rx="17"/><rect class="dust d2" x="-200" y="500" width="1700" height="22" rx="11"/></g>`
    : `<g class="earth"><g transform="translate(520 180)"><circle r="20" fill="#3D7BD9" stroke="#1E2430" stroke-width="3"/><path d="M-14 -6 C-8 -13 0 -11 1 -5 C2 1 -4 2 -5 7 C-6 12 -12 9 -14 5Z" fill="#5CBF5A"/><path d="M2 -20 A20 20 0 0 1 2 20 A15 20 0 0 0 2 -20Z" fill="#0B1020" opacity=".4"/></g></g>`}
<g class="sun"><g transform="translate(108 250)"><circle r="${mars ? 40 : 56}" fill="#FFE07A" opacity=".18"/>
<g class="rays" stroke="#F5C518" stroke-width="6" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, r1 = mars ? 32 : 46, r2 = mars ? 42 : 60; return `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}"/>`; }).join("")}</g>
<circle r="${mars ? 24 : 36}" fill="#F5C518" stroke="#1E2430" stroke-width="3"/></g></g>
<g class="streaks s-active" stroke="#F5C518" stroke-width="3" stroke-linecap="round"><line x1="108" y1="250" x2="560" y2="420"/><line x1="108" y1="250" x2="640" y2="330"/><line x1="108" y1="250" x2="480" y2="520"/></g>
<g class="streaks s-storm" stroke="#FF6A3D" stroke-width="5" stroke-linecap="round"><line x1="108" y1="250" x2="640" y2="440"/><line x1="108" y1="250" x2="700" y2="320"/><line x1="108" y1="250" x2="540" y2="560"/></g></svg>`;
}

export function mount(root, ctx) {
  const store = ctx.store, eng = ctx.engine;
  const mars = store.site === "mars";
  const S = () => store.state;
  let busy = false, openJob = null, say = null, yaw = 45, alive = true;
  const walking = {};           // crewId -> job id while walking/working
  const inside = new Set();     // crew resting inside the habitat after their shift
  const tokens = { maya: 0, leo: 0, zuri: 0 };
  const shown = {};             // meter numbers currently on screen (for count-up)
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const wait = (ms) => new Promise((r) => later(r, ms));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slabs = Array.from({ length: 12 }, (_, i) => `<div class="slab${i % 4 === 2 ? " band" : ""}${i === 11 ? " base" : ""}" style="transform: translateZ(${-(i + 1) * 4}px)"></div>`).join("");
  const pt = (p) => `${H + p[0]} ${H + p[1]}`;
  const paths = [...JOB_ORDER.map((id) => FEET[id]), [PAD[0] + 40, PAD[1] + 40]].map((f, i) => `<path id="pa-${JOB_ORDER[i] || "pad"}" d="M${pt(DOOR_C)} L${pt(f)}"/>`).join("");
  const bbAt = (p) => `--x: ${p[0]}; --y: ${p[1]}; --yaw: ${yaw}deg`;

  root.innerHTML = `<div id="g3" class="${mars ? "mars" : "moon"}${reduced ? "" : " intro"}">
<div class="world" id="world">
  ${skySvg(mars)}
  <div class="stage3d"><div class="board" id="board" style="--yaw: ${yaw}deg">
    ${slabs}<div class="top"></div>
    <div class="flat crater" style="left: ${H + POS.science[0]}px; top: ${H + POS.science[1]}px"></div>
    ${[[82, 164], [551, 562], [140, 550], [420, 90], [600, 330]].map(([x, y]) => `<div class="flat pit" style="left: ${x}px; top: ${y}px"></div>`).join("")}
    ${[[47, 351], [610, 140], [351, 638], [250, 470], [470, 300]].map(([x, y]) => `<div class="flat rock" style="left: ${x}px; top: ${y}px"></div>`).join("")}
    <div class="model padm" style="left: ${H + PAD[0]}px; top: ${H + PAD[1]}px">${cyl(76, 10, { n: 20, cls: "plinth" })}</div>
    <div class="flat pad" style="left: ${H + PAD[0]}px; top: ${H + PAD[1]}px; transform: translate(-50%, -50%) translateZ(11px)"></div>
    <svg class="paths" viewBox="0 0 ${H * 2} ${H * 2}" aria-hidden="true">${paths}</svg>
    <div class="flat flood" style="left: ${H + POS.reinforce_shield[0]}px; top: ${H + POS.reinforce_shield[1]}px"></div><div class="flat flood" style="left: ${H + POS.grow_food[0]}px; top: ${H + POS.grow_food[1]}px"></div>
    ${JOB_ORDER.map((id) => `<div class="flat shadow" style="left: ${H + POS[id][0] + 14}px; top: ${H + POS[id][1] - 14}px"></div>`).join("")}
    ${JOB_ORDER.map((id) => `<div class="flat ring" id="ring-${id}" style="left: ${H + POS[id][0]}px; top: ${H + POS[id][1]}px"></div>`).join("")}
    <div class="shade"></div>
    <div class="bb" style="${bbAt([PAD[0] + 55, PAD[1] - 10])}" aria-hidden="true">${shipFlag()}</div>
    <div class="bb rover" style="--yaw: ${yaw}deg" aria-hidden="true">${rover()}</div>
    ${JOB_ORDER.filter((id) => MODEL[id]).map((id, i) => `<div class="model bld" id="md-${id}" data-job="${id}" style="left: ${H + POS[id][0]}px; top: ${H + POS[id][1]}px; --i: ${i}" aria-hidden="true">${MODEL[id]()}</div>`).join("")}
    <div class="bb domebb" style="${bbAt(POS.reinforce_shield)}" aria-hidden="true"><div class="domewrap">${DOME()}</div></div>
    ${[[-34, -22], [8, -26], [-20, 18], [30, 14]].map(([dx, dy], i) => `<div class="bb plant" style="${bbAt([POS.grow_food[0] + dx, POS.grow_food[1] + dy])}" aria-hidden="true">${plant(i)}</div>`).join("")}
    <div class="bb puffbb" style="${bbAt([POS.oxygen_gen[0] + 18, POS.oxygen_gen[1] - 12])}" aria-hidden="true"><svg width="40" height="60" viewBox="0 0 40 60"><g fill="#fff" stroke="#C9CED6" stroke-width="1.5"><circle class="puff" cx="20" cy="50" r="8"/><circle class="puff p2" cx="23" cy="50" r="6"/><circle class="puff p3" cx="17" cy="50" r="7"/></g></svg><div style="height: 102px"></div></div>
    ${JOB_ORDER.map((id, i) => `<button type="button" class="bb station${id === "reinforce_shield" ? " hab" : ""}${MODEL[id] ? " has3d" : ""}" id="st-${id}" data-job="${id}" style="${bbAt(POS[id])}; --i: ${i}; --c: ${RES_INFO[JOBS[id].res].color}" aria-label="${esc(JOBS[id].label(mars))}">
      <span class="lbl"><i>${iconSvg(JOBS[id].res, 18, "#1E2430")}</i>${esc(JOBS[id].short)}</span>${MODEL[id] ? `<span class="lift" style="height: ${LIFT[id]}px"></span>` : `<span class="art">${SPR[id](mars)}</span>`}${id === "reinforce_shield" ? `<span class="zzz" id="zzz" hidden></span>` : ""}</button>`).join("")}
    ${CREW.map((c, i) => `<div class="bb walker" id="w-${c.id}" style="${bbAt(HOME[c.id])}; --i: ${i}"><span class="tag" style="border-color: ${c.color}">${c.name}</span>${astro(c.color)}<span class="kick" aria-hidden="true"><i></i><i></i><i></i></span><span class="zz" hidden>zz</span></div>`).join("")}
  </div></div>
</div>
<div class="nighttag">Moon night: dark for 14 sols</div>
<button type="button" class="key turn l" id="t-l" aria-label="Turn the base left"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 0 5-5"/></svg></button>
<button type="button" class="key turn r" id="t-r" aria-label="Turn the base right"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 7 5 5-5 5M20 12H9a5 5 0 0 1-5-5"/></svg></button>
<div class="hint">Drag to turn the base, or press Q and E</div>
<header class="hud">
  <div class="logo">Delta-V 26</div><div class="place">${mars ? "Mars · Jezero crater" : "Moon · Shackleton crater"}</div>
  <div class="solbox" role="group" aria-label="Mission day"><span class="sl">Sol<strong id="sol"></strong>of 30</span><div class="path" id="path" aria-hidden="true"></div><span class="wx" id="wx"></span></div>
  <button type="button" class="key tbtn sci" id="b-sci" aria-label="Science points">${iconSvg("science", 20, "#1E2430")}<span id="sci"></span></button>
  <button type="button" class="key tbtn" id="b-tasks"></button>
  <button type="button" class="key tbtn" id="b-up">Upgrades</button>
  <button type="button" class="key tbtn bonus" id="b-bonus" aria-pressed="true"></button>
</header>
<div class="meters" id="meters">${RES.map((k) => `<div class="meter" id="m-${k}" role="img" style="--c: ${RES_INFO[k].color}">
  <span class="ic">${iconSvg(k, 22, "#1E2430")}</span>
  <div class="row"><span class="nm">${RES_INFO[k].name}</span><span class="note"></span></div>
  <span class="val"></span>
  <div class="bar"><div class="ghost" style="background: var(--c)"></div><div class="fill" style="background: var(--c)"></div></div></div>`).join("")}</div>
<section class="fc" id="fc" aria-label="Sun forecast"></section>
<section class="jobpanel" id="card" aria-hidden="true" aria-label="Send someone to this job"></section>
<footer class="dock">
  <div class="crew" id="crew"></div>
  <div class="say" id="say" aria-live="polite"><div class="line"></div><div class="fact"></div></div>
  <div class="jobs"><div class="dots" id="dots"></div><span id="left"></span></div>
  <button type="button" class="key endsol" id="b-end"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#1E2430"/></svg>End sol</button>
</footer>
</div>`;

  const $ = (id) => root.querySelector("#" + id);
  const g3 = $("g3"), world = $("world"), board = $("board");
  // let the game bleed into the letterbox so it fills the whole window
  const stageEl = document.getElementById("stage");
  if (stageEl) stageEl.classList.add("bleed");
  root.style.overflow = "visible";

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
    const bld = e.target.closest(".bld");
    drag = { x: e.clientX, yaw, moved: false, job: bld ? bld.dataset.job : null };
    world.setPointerCapture(e.pointerId);
  });
  world.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > 6) drag.moved = true;
    if (drag.moved) setYaw(drag.yaw + (e.clientX - drag.x) * 0.35, true);
  });
  // tapping a 3D building (without dragging) is the same as tapping its label
  const endDrag = (e) => {
    if (!drag) return;
    const d = drag; drag = null; world.classList.remove("dragging");
    if (e && e.type === "pointerup" && !d.moved && d.job) { const b = $("st-" + d.job); if (b && !b.disabled) b.click(); }
  };
  world.addEventListener("pointerup", endDrag);
  world.addEventListener("pointercancel", endDrag);
  $("t-l").addEventListener("click", () => setYaw(yaw - 45));
  $("t-r").addEventListener("click", () => setYaw(yaw + 45));
  const closeJob = () => { const id = openJob; openJob = null; preview(null, null); draw(); if (id) $("st-" + id).focus(); };
  const onKey = (e) => {
    if (document.querySelector(".dv-overlay") || e.target.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === "q") setYaw(yaw - 30);
    else if (k === "e") setYaw(yaw + 30);
    else if (e.key === "Escape" && openJob) closeJob();
  };
  document.addEventListener("keydown", onKey);

  // entrance: spin the base into place while it rises
  if (!reduced) {
    setYaw(yaw + 120);
    later(() => setYaw(45), 60);
    later(() => g3.classList.remove("intro"), 2600);
  }

  // ---------- drawing ----------
  function preview(gain, cost) {
    RES.forEach((k) => {
      const m = $("m-" + k), ch = ((gain && gain[k]) || 0) - ((cost && cost[k]) || 0);
      m.querySelector(".ghost").style.transform = `scaleX(${ch > 0 ? Math.min(100, S()[k] + ch) / 100 : 0})`;
      m.dataset.preview = ch ? sign(ch) : "";
    });
    drawNotes();
  }
  function drawNotes() {
    const s = S();
    RES.forEach((k) => {
      const m = $("m-" + k), note = m.querySelector(".note"), p = m.dataset.preview;
      if (p) { note.innerHTML = `<span class="delta ${p[0] === "+" ? "up" : "down"}">${p} if sent</span>`; return; }
      note.textContent = s[k] < 30 ? (k === "shielding" ? "Low for storms!" : "Running low!") : "";
    });
  }

  function countTo(el, from, to) {
    if (reduced || from === to || from === undefined || document.hidden) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 650;
    const step = (t) => {
      if (!alive) return;
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const pulse = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  function speech() {
    const s = S();
    let v = say;
    if (!v) {
      const low = [...RES].sort((a, b) => s[a] - s[b])[0];
      if (s[low] < 30) v = { who: WARN[low][0], line: WARN[low][1] };
      else if (s.actionsLeft === 0) v = { who: "zuri", line: "All jobs are done for today. Press End sol when you're ready." };
      else if (s.weather === "storm") v = { who: "maya", line: "Big Sun storm today! The shield is taking hits." };
      else if (s.weather === "active") v = { who: "zuri", line: "The Sun is busy today. Keep an eye on the shield." };
      else v = { who: "leo", line: s.actionsLeft === 2 ? "Morning, Commander! Tap a place on the base to send someone." : "One more job today. Who's next?" };
    }
    const el = $("say"), name = CREW_BY[v.who] ? CREW_BY[v.who].name : "Mission Control";
    const html = `<b>${esc(name)}:</b> ${esc(v.line)}`;
    const line = el.querySelector(".line");
    const changed = line.innerHTML !== html;
    line.innerHTML = html;
    el.querySelector(".fact").textContent = v.fact ? "True NASA fact: " + v.fact : "";
    if (changed) pulse(el, "new");
  }

  function drawForecast() {
    const s = S(), label = ctx.dataLabel();
    const plan = (n) => s.weatherPlan && s.weatherPlan[n - 1];
    const todayPlan = plan(s.sol);
    const days = [{ sol: s.sol, weather: s.weather, flare: todayPlan && todayPlan.class ? { class: todayPlan.class } : null, today: true }, ...eng.getForecast(s, 3)];
    $("fc").innerHTML = `<h2>Sun forecast <span class="chip${label.real ? "" : " practice"}">${label.real ? "Real data" : "Practice"}</span></h2>
${days.map((d) => { const p = plan(d.sol); return `<div class="fday${d.today ? " today" : ""}"><b>${d.today ? "Today" : "Sol " + d.sol}</b><small>${p && p.date ? esc(dateText(p.date)) : d.flare ? esc(d.flare.class) + " flare" : "No flares"}</small><span class="pill wx-${d.weather}">${WEATHER_LABEL[d.weather]}${d.flare ? " · " + esc(d.flare.class) : ""}</span></div>`; }).join("")}
${label.real ? `<p>${esc(label.text)}</p>` : `<div class="practice-banner">Practice weather: made up, not real NASA data</div>`}`;
  }

  const fx = (obj, neg) => Object.keys(obj).map((k) => (neg ? MINUS + obj[k] : sign(obj[k])) + " " + RES_INFO[k].name).join(", ");

  let cardFor = null;
  function drawCard() {
    const s = S(), card = $("card");
    card.setAttribute("aria-hidden", openJob ? "false" : "true");
    $("fc").classList.toggle("away", !!openJob);
    if (!openJob) { cardFor = null; return; }
    if (cardFor === openJob + s.actionsLeft) return;
    cardFor = openJob + s.actionsLeft;
    const job = JOBS[openJob];
    const base = eng.getActions(s).find((a) => a.id === openJob);
    card.style.setProperty("--c", RES_INFO[job.res].color);
    card.innerHTML = `<div class="head"><i>${iconSvg(job.res, 26, "#1E2430")}</i><h3>${esc(job.label(mars))}</h3></div>
<p class="muted">Gets <b style="color: #1F7A35">${esc(fx(base.gain))}</b>, costs <b style="color: #B3261E">${esc(fx(base.cost, true))}</b></p>
<p style="font-weight: 800; font-size: 16px">Who goes?</p>
${CREW.map((c) => {
      const a = eng.getActions(s, c.id).find((x) => x.id === openJob), m = s.crew[c.id];
      const off = m.job || walking[c.id] || inside.has(c.id);
      const word = off ? "Busy" : a.skilled && !a.tired ? "Best at this!" : a.tired ? "Tired" : "Ready";
      const cls = off ? "busy" : a.skilled && !a.tired ? "best" : a.tired ? "tired" : "";
      return `<button type="button" class="key pick" data-crew="${c.id}" ${off ? "disabled" : ""} aria-label="Send ${esc(c.name)}. ${esc(word)}. ${esc(fx(a.gain))}. ${esc(fx(a.cost, true))}.">${helmet(c.color, 48)}<span class="who">${esc(c.name)} <span class="badge ${cls}">${esc(word)}</span></span><span class="nums"><span class="g">${esc(fx(a.gain))}</span> · <span class="c">${esc(fx(a.cost, true))}</span></span></button>`;
    }).join("")}
<button type="button" class="key" id="b-cancel" style="height: 46px; font-weight: 700; font-size: 16px">Not now</button>`;
    card.querySelectorAll(".pick").forEach((b) => {
      const a = () => eng.getActions(S(), b.dataset.crew).find((x) => x.id === openJob);
      b.addEventListener("click", () => send(openJob, b.dataset.crew));
      const on = () => { const x = a(); if (x) preview(x.gain, x.cost); };
      b.addEventListener("pointerenter", on); b.addEventListener("focus", on);
      b.addEventListener("pointerleave", () => preview(null, null)); b.addEventListener("blur", () => preview(null, null));
    });
    $("b-cancel").addEventListener("click", closeJob);
    const first = card.querySelector(".pick:not(:disabled)");
    if (first) first.focus({ preventScroll: true });
  }

  function crewStatus(c) {
    const s = S(), m = s.crew[c.id], w = walking[c.id];
    if (w && w.at) return ["Working: " + JOBS[w.id].short, "busy active"];
    if (w) return ["Going to: " + JOBS[w.id].short, "busy active"];
    if (inside.has(c.id)) return ["Resting inside", "home"];
    if (m.job) return ["Done: " + JOBS[m.job].short, "home"];
    if (m.tired) return ["Tired, worked yesterday", "tired"];
    return ["Ready", ""];
  }

  function draw() {
    const s = S(), night = eng.isNight(s) && !mars;
    $("sol").textContent = s.sol;
    $("path").innerHTML = Array.from({ length: 30 }, (_, i) => {
      const n = i + 1, cls = n < s.sol ? "done" : n === s.sol ? "now" : n === 30 ? "ship" : (!mars && eng.isNight({ ...s, sol: n }) ? "night" : "");
      return `<i class="${cls}"></i>`;
    }).join("");
    const wx = $("wx");
    wx.textContent = WEATHER_LABEL[s.weather] + " Sun today";
    wx.className = "wx wx-" + s.weather;
    const done = eng.getTasks(s).filter((t) => t.status === "done").length;
    const canBuy = eng.getUpgrades(s).some((u) => u.canBuy);
    if (shown.sci !== undefined && shown.sci !== s.science) pulse($("b-sci"), "bump");
    countTo($("sci"), shown.sci, s.science); shown.sci = s.science;
    $("b-sci").setAttribute("aria-label", `${s.science} science points`);
    $("b-tasks").innerHTML = `Mission Control <span class="n">${done}/3</span>`;
    $("b-tasks").setAttribute("aria-label", `Mission Control goals, ${done} of 3 done`);
    $("b-up").setAttribute("aria-label", `Upgrades${canBuy ? ". You can build one now" : ""}`);
    $("b-up").classList.toggle("glow", canBuy);
    $("b-bonus").textContent = "Bonus games " + (store.minigames ? "on" : "off");
    $("b-bonus").setAttribute("aria-pressed", String(store.minigames));
    RES.forEach((k) => {
      const m = $("m-" + k), v = s[k], was = shown[k];
      m.classList.toggle("is-low", v < 30);
      countTo(m.querySelector(".val"), was, v);
      if (was !== undefined && v < was - 1) pulse(m, "hurt");
      shown[k] = v;
      m.querySelector(".fill").style.transform = `scaleX(${v / 100})`;
      m.setAttribute("aria-label", `${RES_INFO[k].name} ${v} out of 100${v < 30 ? ", low" : ""}`);
    });
    drawNotes();
    g3.classList.toggle("night", night);
    g3.classList.remove("wx-calm", "wx-active", "wx-storm");
    g3.classList.add("wx-" + s.weather);
    g3.style.setProperty("--shield-op", (0.15 + s.shielding / 100 * 0.85).toFixed(2));
    board.querySelectorAll(".dome").forEach((d) => d.classList.toggle("weak", s.shielding < 30));
    const shipn = root.querySelector("#shipn"); if (shipn) shipn.textContent = Math.max(0, 31 - s.sol);
    const ready = !busy && s.status === "playing" && s.actionsLeft > 0 && !s.pendingEvent;
    JOB_ORDER.forEach((id) => {
      const b = $("st-" + id);
      b.disabled = !ready && openJob !== id;
      b.classList.toggle("ready", ready && !openJob);
      b.classList.toggle("open", openJob === id);
      $("ring-" + id).classList.toggle("on", openJob === id);
      const p = $("pa-" + id); if (p) p.classList.toggle("lit", openJob === id || Object.values(walking).some((w) => w.id === id));
    });
    const hab = $("st-reinforce_shield"), zzz = $("zzz");
    hab.classList.toggle("occupied", inside.size > 0);
    $("md-reinforce_shield").classList.toggle("occupied", inside.size > 0);
    zzz.hidden = inside.size === 0;
    zzz.textContent = "Zzz ×" + inside.size;
    $("crew").innerHTML = CREW.map((c) => {
      const [st, cls] = crewStatus(c);
      return `<div class="cchip ${cls}">${helmet(c.color, 46)}<span><b>${c.name}</b><em>${esc(st)}</em></span></div>`;
    }).join("");
    CREW.forEach((c) => { $("w-" + c.id).querySelector(".zz").hidden = !s.crew[c.id].tired || inside.has(c.id); });
    const used = Math.max(0, 2 - s.actionsLeft);
    $("dots").innerHTML = [0, 1].map((i) => `<i class="${i < used ? "used" : ""}"></i>`).join("");
    $("left").textContent = s.actionsLeft === 1 ? "1 job left" : s.actionsLeft + " jobs left";
    $("b-end").disabled = busy || s.status !== "playing";
    $("b-end").classList.toggle("go", s.actionsLeft === 0 && !busy);
    drawForecast();
    drawCard();
    speech();
  }

  function placeWalker(id, pos, ...cls) {
    const w = $("w-" + id);
    w.style.setProperty("--x", pos[0]); w.style.setProperty("--y", pos[1]);
    w.classList.remove("walking", "working", "tired-walk", "entering", "exiting");
    cls.filter(Boolean).forEach((c) => w.classList.add(c));
  }

  // a chip carrying the gain flies from the building into its meter
  async function flyToMeter(res, text, fromEl, perfect) {
    const m = $("m-" + res);
    const sr = g3.getBoundingClientRect(), scale = sr.width / g3.offsetWidth;
    const a = fromEl.getBoundingClientRect(), b = m.querySelector(".val").getBoundingClientRect();
    const x0 = (a.left + a.width / 2 - sr.left) / scale, y0 = (a.top - sr.top) / scale;
    const x1 = (b.left + b.width / 2 - sr.left) / scale, y1 = (b.top + b.height / 2 - sr.top) / scale;
    const f = document.createElement("div");
    f.className = "fly" + (perfect ? " perfect" : "");
    f.style.setProperty("--c", RES_INFO[res].color);
    f.innerHTML = `<i>${iconSvg(res, 16, "#1E2430")}</i>${esc(text)}`;
    g3.appendChild(f);
    const w = f.offsetWidth, h = f.offsetHeight;
    const at = (x, y, s, o) => ({ transform: `translate(${x - w / 2}px, ${y - h / 2}px) scale(${s})`, opacity: o });
    if (reduced) { m.classList.add("bump"); later(() => f.remove(), 600); return; }
    const anim = f.animate([
      at(x0, y0, .6, 0), at(x0, y0 - 40, 1.1, 1), at(x0, y0 - 50, 1, 1),
      at((x0 + x1) / 2, Math.min(y0, y1) - 60, .9, 1), at(x1, y1, .5, .2),
    ], { duration: 1300, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" });
    await anim.finished.catch(() => {});
    f.remove();
    if (alive) pulse(m, "bump");
  }

  // after a shift the astronaut walks home, then into the habitat to rest (from main's crew-shift-home)
  async function retireToHab(crewId) {
    const token = ++tokens[crewId];
    const ok = () => alive && token === tokens[crewId];
    if (reduced) { placeWalker(crewId, DOOR[crewId]); inside.add(crewId); $("w-" + crewId).classList.add("inside"); draw(); return; }
    placeWalker(crewId, HOME[crewId], "walking", "tired-walk");
    await wait(1300); if (!ok()) return;
    await wait(80 + CREW.findIndex((c) => c.id === crewId) * 60); if (!ok()) return;
    placeWalker(crewId, DOOR[crewId], "walking");
    await wait(1000); if (!ok()) return;
    placeWalker(crewId, DOOR[crewId], "entering");
    pulse($("md-reinforce_shield"), "flash");
    await wait(420); if (!ok()) return;
    $("w-" + crewId).classList.add("inside");
    inside.add(crewId);
    draw();
  }

  // ---------- actions ----------
  JOB_ORDER.forEach((id) => $("st-" + id).addEventListener("click", () => {
    if (busy) return;
    ctx.sfx("click");
    pulse($("md-" + id) || $("st-" + id), "bounce");
    openJob = openJob === id ? null : id;
    preview(null, null);
    draw();
  }));
  $("b-tasks").addEventListener("click", async () => { ctx.sfx("click"); await (await import("../overlays/missions.js")).showMissions(ctx); if (alive) draw(); });
  $("b-up").addEventListener("click", async () => { ctx.sfx("click"); await (await import("../overlays/upgrades.js")).showUpgrades(ctx); if (alive) draw(); });
  $("b-sci").addEventListener("click", async () => { ctx.sfx("click"); await (await import("../overlays/upgrades.js")).showUpgrades(ctx); if (alive) draw(); });
  $("b-bonus").addEventListener("click", () => { store.minigames = !store.minigames; ctx.sfx("click"); draw(); });

  async function send(id, crewId) {
    const s0 = S();
    if (busy || s0.status !== "playing" || s0.actionsLeft <= 0 || s0.crew[crewId].job || walking[crewId] || inside.has(crewId)) return;
    busy = true; openJob = null; walking[crewId] = { id };
    tokens[crewId]++;
    preview(null, null);
    ctx.sfx("click");
    say = { who: crewId, line: "On my way to the " + JOBS[id].short.toLowerCase() + "!" };
    placeWalker(crewId, FEET[id], "walking");
    draw();
    await wait(1150);
    if (!alive) return;
    walking[crewId].at = true;
    placeWalker(crewId, FEET[id], "working");
    draw();
    let won = false;
    if (store.minigames) {
      try { won = !!(await (await import("../overlays/tasks.js")).runTask(ctx, id, crewId)); } catch (e) { won = false; }
    } else await wait(700);
    if (!alive) return;
    const res = JOBS[id].res, before = S()[res];
    store.state = eng.applyAction(S(), id, { crew: crewId, bonus: won });
    ctx.sfx("good");
    flyToMeter(res, (won ? "Perfect! " : "") + sign(S()[res] - before) + " " + RES_INFO[res].name, $("st-" + id).querySelector(".lbl"), won);
    say = { who: crewId, line: JOBS[id].line(mars), fact: JOBS[id].real(mars) };
    delete walking[crewId];
    busy = false;
    later(() => { if (alive) draw(); }, 700); // let the chip land before the meter counts
    retireToHab(crewId);
  }

  $("b-end").addEventListener("click", async () => {
    if (busy || S().status !== "playing") return;
    busy = true; openJob = null; say = null;
    ctx.sfx("click");
    // anyone still out goes straight inside for the night
    CREW.forEach((c) => {
      tokens[c.id]++;
      if (S().crew[c.id].job || inside.has(c.id)) { placeWalker(c.id, DOOR[c.id]); $("w-" + c.id).classList.add("inside"); inside.add(c.id); }
    });
    const wasInside = new Set(inside);
    const out = eng.nextSol(S());
    store.state = out.state;
    if (!reduced) { const sw = document.createElement("div"); sw.className = "sweep"; g3.appendChild(sw); later(() => sw.remove(), 1600); }
    const ban = document.createElement("div");
    ban.className = "banner";
    ban.innerHTML = `Sol ${S().sol}<small>${esc(WEATHER_LABEL[S().weather])} Sun today</small>`;
    g3.appendChild(ban);
    draw();
    await wait(reduced ? 600 : 900);
    if (!alive) return;
    // morning: the crew come out of the habitat and walk to their spots
    inside.clear();
    CREW.forEach((c) => {
      const w = $("w-" + c.id);
      w.classList.remove("inside");
      if (wasInside.has(c.id) && !reduced) placeWalker(c.id, DOOR[c.id], "exiting");
      else placeWalker(c.id, HOME[c.id]);
    });
    await wait(200);
    CREW.forEach((c) => { if (wasInside.has(c.id) && !reduced) placeWalker(c.id, HOME[c.id], "walking"); });
    draw();
    await wait(reduced ? 300 : 800);
    if (!alive) return;
    CREW.forEach((c) => $("w-" + c.id).classList.remove("walking"));
    ban.remove();
    if (out.event) {
      pulse(world, "shake");
      if (!reduced && (out.event.flare || /storm|flare|meteor/i.test(out.event.id || out.event.title || ""))) { const hit = document.createElement("div"); hit.className = "hit"; g3.appendChild(hit); later(() => hit.remove(), 950); }
      const { showEvent } = await import("../overlays/event.js");
      const choice = await showEvent(ctx, out.event);
      if (!alive) return;
      if (out.event.choices && S().status === "playing") store.state = eng.resolveEvent(S(), choice);
    }
    busy = false;
    draw();
    const st = S().status;
    if (st !== "playing") { await wait(700); if (alive) ctx.go(st === "won" ? "win" : "lose"); }
  });

  draw();
  return () => { alive = false; document.removeEventListener("keydown", onKey); timers.forEach(clearTimeout); if (stageEl) stageEl.classList.remove("bleed"); };
}
