// Task: "Patch the shield". The habitat sits under an arch of dirt made of 9 blocks. Blocks crack.
// Move the crane along its rail (arrow buttons, A/D or arrow keys, or drag on the scene) and Drop
// dirt to patch the glowing cracks. The Sun fires flares at open cracks: a dashed warning line, then
// a bright ray. Patch the crack before the ray arrives and the dirt blocks it; if it gets in, one
// safety light goes out. Patch GOAL cracks to win. Practice rounds have no flares.
const SEGS = 9;                 // dirt blocks across the arch
const CX = 406, CY = 470;       // arch centre (scene units, viewBox 812 x 548)
const R_OUT = 282, R_IN = 238;  // dirt arch outer and inner radius
const RAIL_Y = 74, X_MIN = 132, X_MAX = 680;
const SUN = [62, 150];

const rad = (d) => (d * Math.PI) / 180;
const pt = (r, a) => [CX + r * Math.cos(rad(a)), CY - r * Math.sin(rad(a))];
const segAngles = (i) => [180 - (i * 180) / SEGS, 180 - ((i + 1) * 180) / SEGS];
function segPath(i) {
  const [a0, a1] = segAngles(i);
  const [ox0, oy0] = pt(R_OUT, a0), [ox1, oy1] = pt(R_OUT, a1), [ix1, iy1] = pt(R_IN, a1), [ix0, iy0] = pt(R_IN, a0);
  const f = (n) => n.toFixed(1);
  return `M${f(ox0)} ${f(oy0)} A${R_OUT} ${R_OUT} 0 0 1 ${f(ox1)} ${f(oy1)} L${f(ix1)} ${f(iy1)} A${R_IN} ${R_IN} 0 0 0 ${f(ix0)} ${f(iy0)}Z`;
}
// the outer middle of a block (where rays hit and where the crack glows)
const segMid = (i) => { const [a0, a1] = segAngles(i); return pt(R_OUT - 8, (a0 + a1) / 2); };
// which block sits under the crane at x, and the height of the dirt surface there
function under(x) {
  const dx = x - CX;
  if (Math.abs(dx) > R_OUT) return { seg: -1, y: CY };
  const a = (Math.acos(Math.max(-1, Math.min(1, dx / ((R_OUT + R_IN) / 2)))) * 180) / Math.PI;
  return { seg: Math.max(0, Math.min(SEGS - 1, Math.floor(((180 - a) / 180) * SEGS))), y: CY - Math.sqrt(R_OUT * R_OUT - dx * dx) };
}
let GOAL = 6;

export function mount(api) {
  GOAL = api.practice ? 2 : api.easy ? 5 : 6;
  const mars = api.mars;
  const SOIL = mars ? ["#C27447", "#A9603A"] : ["#A9ADBB", "#8D93A3"];
  const flares = !api.practice;
  const rayEvery = api.easy ? 3.6 : 2.7;  // seconds between flares
  const rayTravel = api.easy ? 2.8 : 2.2; // seconds for a ray to fly in (after a 0.9 s warning)
  let lights = 3, patched = 0;
  const state = Array(SEGS).fill("ok"); // "ok" | "crack"
  let craneX = CX, craneTarget = null, vel = 0, hold = 0, dropping = false;
  const rays = []; // { seg, t, el, warn }

  // real shield numbers for the crew member doing this job (skill and tiredness count)
  let shieldNow = null, shieldGain = 0;
  try {
    const st = api.ctx.store.state;
    const act = api.ctx.engine.getActions(st, api.crew).find((x) => x.id === "reinforce_shield");
    shieldNow = st.shielding; shieldGain = (act && act.gain && act.gain.shielding) || 0;
  } catch (err) { shieldNow = null; }
  const bonus = (api.ctx.engine.BONUS && api.ctx.engine.BONUS.perfect) || 0;

  const KEY = "font-family: inherit; cursor: pointer; border: 4px solid #1E2430; border-radius: 22px; color: #1E2430; font-weight: 800;";
  api.body.innerHTML =
    `<div style="flex-grow: 1; display: flex; gap: 20px; min-height: 0">` +
    `<div id="ds-scene" style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: linear-gradient(#0B1020, #1A2240); overflow: hidden; touch-action: none; cursor: ew-resize">` +
    `<svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 812 548" preserveAspectRatio="xMidYMax meet" style="position: absolute; inset: 0; overflow: visible">` +
    `<g fill="#F3F4F6" opacity=".7"><circle cx="-120" cy="90" r="1.4"/><circle cx="-40" cy="200" r="1.1"/><circle cx="200" cy="40" r="1.6"/><circle cx="330" cy="120" r="1.1"/><circle cx="520" cy="30" r="1.4"/><circle cx="700" cy="150" r="1.2"/><circle cx="760" cy="60" r="1.6"/><circle cx="440" cy="180" r="1"/><circle cx="880" cy="110" r="1.3"/><circle cx="950" cy="230" r="1"/></g>` +
    // the Sun, low on the left: flares come from here
    `<g transform="translate(${SUN[0]} ${SUN[1]})"><circle r="44" fill="#FFE07A" opacity=".18"/><g class="dv-spin" stroke="#F5C518" stroke-width="5" stroke-linecap="round"><path d="M0 -40v-10M0 40v10M-40 0h-10M40 0h10M-28 -28l-7-7M28 28l7 7M-28 28l-7 7M28 -28l7-7"/></g><circle r="28" fill="#F5C518" stroke="#1E2430" stroke-width="4"/></g>` +
    `<g id="ds-rays"></g>` +
    // ground and the habitat inside the arch
    `<path d="M-500 466 C-200 476 0 458 200 456 C420 478 812 462 1000 470 C1150 476 1250 464 1312 468 L1312 600 L-500 600Z" fill="${mars ? "#D08458" : "#C9CCD6"}"/>` + /* wide: the scene letterboxes left and right */
    `<path d="M${CX - R_IN} ${CY} A${R_IN} ${R_IN} 0 0 1 ${CX + R_IN} ${CY}Z" fill="#2B3446"/>` +
    `<path d="M${CX - 196} ${CY} A196 196 0 0 1 ${CX + 196} ${CY}Z" fill="#F7F8F9" stroke="#1E2430" stroke-width="6"/>` +
    `<path d="M${CX - 172} ${CY} A172 172 0 0 1 ${CX + 172} ${CY}Z" fill="#3A4560"/>` +
    `<g fill="#FFE18A" stroke="#1E2430" stroke-width="3"><circle cx="${CX - 70}" cy="${CY - 90}" r="16"/><circle cx="${CX + 70}" cy="${CY - 90}" r="16"/><circle cx="${CX}" cy="${CY - 120}" r="16"/></g>` +
    `<g id="ds-crew">${[["#F79A6B", -60], ["#8ED16C", 0], ["#B99AF5", 60]].map(([c, dx]) => `<g transform="translate(${CX + dx} ${CY - 6})"><circle cy="-44" r="12" fill="${c}" stroke="#1E2430" stroke-width="3"/><rect x="-8" y="-48" width="16" height="8" rx="4" fill="#1E2430"/><rect x="-12" y="-32" width="24" height="32" rx="8" fill="${c}" stroke="#1E2430" stroke-width="3"/></g>`).join("")}</g>` +
    // the dirt arch: 9 blocks
    `<g id="ds-segs">${Array.from({ length: SEGS }, (_, i) => `<path data-seg="${i}" d="${segPath(i)}" fill="${SOIL[i % 2]}" stroke="#1E2430" stroke-width="4" stroke-linejoin="round"/>`).join("")}</g>` +
    `<g id="ds-cracks"></g>` +
    // where the dirt will land: an arrow over the arch under the crane
    `<g id="ds-aim" opacity="0"><path d="M-14 0 h28 l-14 18z" fill="#F5C518" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/></g>` +
    // the rail and the crane with its bucket
    `<rect x="40" y="${RAIL_Y - 10}" width="732" height="12" rx="6" fill="#7C8592" stroke="#1E2430" stroke-width="4"/>` +
    `<g id="ds-crane" transform="translate(${CX} ${RAIL_Y})"><rect x="-30" y="-24" width="60" height="22" rx="6" fill="${api.color || "#F79A6B"}" stroke="#1E2430" stroke-width="4"/><circle cx="-16" cy="-2" r="7" fill="#4A5363" stroke="#1E2430" stroke-width="3"/><circle cx="16" cy="-2" r="7" fill="#4A5363" stroke="#1E2430" stroke-width="3"/>` +
    `<g id="ds-bucket"><path d="M0 4 v34" stroke="#1E2430" stroke-width="4"/><path d="M-24 38 h48 l-8 30 h-32z" fill="#9AA3AF" stroke="#1E2430" stroke-width="4" stroke-linejoin="round"/><path d="M-20 40 C-10 30 10 30 20 40z" fill="${SOIL[0]}" stroke="#1E2430" stroke-width="3"/></g></g>` +
    `<g id="ds-fx"></g>` +
    `</svg>` +
    `<p style="position: absolute; left: 16px; bottom: 12px; margin: 0; padding: 8px 12px; border-radius: 10px; background: rgba(11,16,32,.86); color: #E4FFEC; font-size: 16px; font-weight: 600; pointer-events: none">Drag here, or use the arrows, to move the crane</p>` +
    `</div>` +
    `<div style="width: 340px; display: flex; flex-direction: column; gap: 14px">` +
    `<div style="padding: 16px 20px; border-radius: 16px; background: #13211D; box-shadow: inset 0 0 0 5px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 10px">` +
    `<span style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-weight: 700; font-size: 17px; color: #E4FFEC">Cracks patched</span><span id="ds-count" class="dv-bump-a" style="font-weight: 800; font-size: 40px; line-height: 1; color: #E4FFEC; font-variant-numeric: tabular-nums">0<small style="font-size: 20px; color: #A8F5C2"> of ${GOAL}</small></span></span>` +
    `<div id="ds-cells" style="display: flex; gap: 4px">${Array.from({ length: GOAL }, () => `<i style="flex: 1; height: 14px; border-radius: 4px; background: #2B3833"></i>`).join("")}</div>` +
    (flares ? `<span style="display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #E4FFEC">Safety<span id="ds-lights" style="display: flex; gap: 8px"></span></span>` : "") +
    (shieldNow == null ? "" : `<span style="font-size: 15px">Shield after this job: <b id="ds-after" style="color: #E4FFEC; font-variant-numeric: tabular-nums"></b></span>`) +
    `</div>` +
    `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">` +
    `<button type="button" id="ds-left" class="dv-key" aria-label="Move the crane left (Left arrow or A)" style="${KEY} height: 84px; background: #F7F8F9; box-shadow: 0 7px 0 #7C8592; font-size: 34px">◀</button>` +
    `<button type="button" id="ds-right" class="dv-key" aria-label="Move the crane right (Right arrow or D)" style="${KEY} height: 84px; background: #F7F8F9; box-shadow: 0 7px 0 #7C8592; font-size: 34px">▶</button></div>` +
    `<button type="button" id="ds-drop" class="dv-key" aria-label="Drop the dirt (Space or Enter)" style="${KEY} flex-grow: 1; min-height: 110px; background: #F26A1B; box-shadow: 0 9px 0 #8E3A0B; font-size: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px">Drop<span style="font-size: 16px; font-weight: 600">Space or Enter</span></button>` +
    `</div></div>`;
  api.foot.innerHTML =
    `<div role="status" aria-live="polite" style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 16px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p id="ds-hint" style="margin: 0; font-size: 17px; font-weight: 700"></p>` +
    `<p style="margin: 2px 0 0; font-size: 15px; color: #4A5363">Patch ${GOAL} cracks to win <b style="color: #1F7A35">extra shield</b>.</p></div>`;

  const $ = (id) => api.body.querySelector("#" + id);
  const hintEl = api.foot.querySelector("#ds-hint");
  const say = (t) => { if (hintEl.textContent !== t) hintEl.textContent = t; };
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  // ---- drawing ----
  function drawSegs() {
    state.forEach((st, i) => {
      const p = api.body.querySelector(`[data-seg="${i}"]`);
      p.setAttribute("fill", st === "crack" ? "#3A2A22" : SOIL[i % 2]);
    });
    const g = $("ds-cracks");
    g.innerHTML = state.map((st, i) => {
      if (st !== "crack") return "";
      const [x, y] = segMid(i);
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="18" fill="#F26A1B" opacity=".35" class="dv-glow"/><path d="M-12 -8 l7 5 -3 6 8 3 -2 6 M6 -10 l-2 7 6 2" fill="none" stroke="#F5C518" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }).join("");
  }
  function drawStatus() {
    $("ds-count").firstChild.nodeValue = String(patched);
    [...$("ds-cells").children].forEach((c, i) => { c.style.background = i < patched ? "#9B7BF7" : "#2B3833"; });
    const L = $("ds-lights");
    if (L) L.innerHTML = [0, 1, 2].map((i) => `<i aria-hidden="true" style="width: 22px; height: 22px; border-radius: 50%; border: 3px solid #1E2430; background: ${i < lights ? "#5CBF5A" : "#3A4252"}"></i>`).join("") + `<span class="sr-only" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%)">${lights} of 3 safety lights left</span>`;
    const after = $("ds-after");
    if (after) after.textContent = String(Math.min(100, Math.round(shieldNow + shieldGain + (patched >= GOAL ? bonus : 0))));
  }
  function drawCrane() {
    $("ds-crane").setAttribute("transform", `translate(${craneX.toFixed(1)} ${RAIL_Y})`);
    $("ds-bucket").setAttribute("transform", `rotate(${Math.max(-18, Math.min(18, -vel / 22)).toFixed(1)})`);
    const u = under(craneX);
    const aim = $("ds-aim");
    const onCrack = u.seg >= 0 && state[u.seg] === "crack";
    aim.setAttribute("opacity", u.seg >= 0 ? "1" : "0");
    aim.setAttribute("transform", `translate(${craneX.toFixed(1)} ${(u.y - 34).toFixed(1)})`);
    aim.querySelector("path").setAttribute("fill", onCrack ? "#5CBF5A" : "#F5C518");
    const drop = $("ds-drop");
    drop.style.background = onCrack ? "#5CBF5A" : "#F26A1B";
    drop.style.boxShadow = onCrack ? "0 9px 0 #1F7A35" : "0 9px 0 #8E3A0B";
    if (onCrack) say("You're over a crack. Drop!");
  }

  // ---- cracks ----
  function openCrack() {
    const free = state.map((s, i) => i).filter((i) => state[i] === "ok" && Math.abs(i - under(craneX).seg) >= 2);
    const pool = free.length ? free : state.map((s, i) => i).filter((i) => state[i] === "ok");
    if (!pool.length) return;
    state[pool[Math.floor(Math.random() * pool.length)]] = "crack";
    drawSegs(); drawCrane();
  }
  const openCount = () => state.filter((s) => s === "crack").length;
  const wantOpen = () => (api.practice ? 1 : patched >= 3 ? 3 : 2);

  // ---- dropping dirt ----
  function drop() {
    if (api.done || dropping) return;
    const u = under(craneX);
    dropping = true;
    api.sfx("click");
    const x = craneX, y0 = RAIL_Y + 60, y1 = u.y - 6;
    const clump = svgEl("g", { transform: `translate(${x} ${y0})` });
    clump.innerHTML = `<path d="M-16 0 C-14 -12 14 -12 16 0 C14 10 -14 10 -16 0z" fill="${SOIL[0]}" stroke="#1E2430" stroke-width="3"/>`;
    $("ds-fx").appendChild(clump);
    const t0 = performance.now(), dur = Math.max(160, (y1 - y0) * 1.1);
    const fall = () => {
      if (api.done) return;
      const k = Math.min(1, (performance.now() - t0) / dur);
      clump.setAttribute("transform", `translate(${x} ${(y0 + (y1 - y0) * k * k).toFixed(1)})`);
      if (k < 1) return requestAnimationFrame(fall);
      clump.remove();
      land(u, x, y1);
    };
    requestAnimationFrame(fall);
    // safety net in case animation frames are paused (background tab)
    api.later(() => { if (clump.isConnected) { clump.remove(); land(u, x, y1); } }, dur + 120);
  }
  function land(u, x, y) {
    if (!dropping) return;
    dropping = false;
    puff(x, y);
    if (u.seg >= 0 && state[u.seg] === "crack") {
      state[u.seg] = "ok";
      patched += 1;
      // a patched crack also blocks any ray already flying at it
      rays.filter((r) => r.seg === u.seg).forEach((r) => (r.blocked = true));
      api.sfx("scoop"); api.good();
      drawSegs(); drawStatus(); drawCrane();
      api.swap($("ds-count"), "dv-bump-a", "dv-bump-b");
      const fresh = api.body.querySelector(`[data-seg="${u.seg}"]`);
      fresh.setAttribute("fill", "#C9A27A");
      api.later(() => drawSegs(), 450);
      if (patched >= GOAL) { say("The shield is solid again!"); api.win(); return; }
      say(patched + " patched! " + (GOAL - patched) + " to go.");
      if (openCount() < wantOpen()) api.later(openCrack, 500);
    } else {
      api.sfx("miss");
      say(u.seg >= 0 ? "That block was fine. Aim for a glowing crack!" : "Missed the shield. Move over the dirt first.");
    }
  }
  function puff(x, y) {
    const g = svgEl("g", { transform: `translate(${x} ${y})` });
    g.innerHTML = [-1, 1].map((s) => `<circle cx="${s * 8}" cy="-4" r="9" fill="#D6D9E0" stroke="#1E2430" stroke-width="2.5" style="transition: transform 420ms ease-out, opacity 420ms ease-out"/>`).join("");
    $("ds-fx").appendChild(g);
    requestAnimationFrame(() => g.querySelectorAll("circle").forEach((c, i) => { c.style.transform = `translate(${(i ? 22 : -22)}px, -10px) scale(1.4)`; c.style.opacity = "0"; }));
    api.later(() => g.remove(), 450);
  }

  // ---- solar flares ----
  let nextRay = 3.5; // the first flare waits a little, so you can get your bearings
  function fireRay() {
    const open = state.map((s, i) => i).filter((i) => state[i] === "crack" && !rays.some((r) => r.seg === i));
    if (!open.length) return;
    const seg = open[Math.floor(Math.random() * open.length)];
    const [tx, ty] = segMid(seg);
    const warn = svgEl("line", { x1: SUN[0], y1: SUN[1], x2: tx, y2: ty, stroke: "#FF6A3D", "stroke-width": 4, "stroke-dasharray": "6 10", "stroke-linecap": "round", opacity: ".9" });
    const dot = svgEl("circle", { cx: SUN[0], cy: SUN[1], r: 11, fill: "#FFF3C4", stroke: "#FF6A3D", "stroke-width": 4, opacity: "0" });
    $("ds-rays").append(warn, dot);
    rays.push({ seg, t: 0, warn, dot, tx, ty });
    say("A flare is coming! Patch that crack!");
    api.sfx("warning");
  }
  function stepRays(dt) {
    for (const r of [...rays]) {
      r.t += dt;
      const k = Math.max(0, (r.t - 0.9) / rayTravel);
      if (k > 0) {
        r.dot.setAttribute("opacity", "1");
        r.dot.setAttribute("cx", (SUN[0] + (r.tx - SUN[0]) * Math.min(1, k)).toFixed(1));
        r.dot.setAttribute("cy", (SUN[1] + (r.ty - SUN[1]) * Math.min(1, k)).toFixed(1));
      }
      if (k >= 1 || (r.blocked && k > 0.6)) {
        rays.splice(rays.indexOf(r), 1);
        r.warn.remove(); r.dot.remove();
        if (r.blocked || state[r.seg] !== "crack") { flash(r.tx, r.ty, "Blocked!", "#5CBF5A"); continue; }
        lights -= 1;
        api.sfx("miss");
        flash(r.tx, r.ty, "Ouch!", "#FF6A3D");
        api.swap($("ds-crew"), "dv-shake-a", "dv-shake-b");
        drawStatus();
        if (lights <= 0) { say("Too many flares got in."); api.fail(); return; }
        say("A flare got in! " + lights + (lights === 1 ? " safety light" : " safety lights") + " left.");
      }
    }
  }
  function flash(x, y, text, color) {
    const t = svgEl("text", { x, y: y - 24, "text-anchor": "middle", "font-family": "Lexend, sans-serif", "font-weight": 800, "font-size": 24, fill: color, stroke: "#1E2430", "stroke-width": 1.5, style: "transition: transform 700ms ease-out, opacity 700ms ease-out" });
    t.textContent = text;
    $("ds-fx").appendChild(t);
    requestAnimationFrame(() => { t.style.transform = "translateY(-24px)"; t.style.opacity = "0"; });
    api.later(() => t.remove(), 750);
  }

  // ---- moving the crane: hold buttons/keys, or drag on the scene ----
  const SPEED = 380; // scene units per second
  const holdBtn = (btn, d) => {
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); hold = d; craneTarget = null; });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, () => { if (hold === d) hold = 0; }));
    btn.addEventListener("click", (e) => { if (e.detail === 0) { craneTarget = Math.max(X_MIN, Math.min(X_MAX, craneX + d * 60)); } }); // keyboard on the button
  };
  holdBtn($("ds-left"), -1);
  holdBtn($("ds-right"), 1);
  $("ds-drop").addEventListener("click", drop);
  const scene = $("ds-scene");
  const toScene = (e) => { const r = scene.getBoundingClientRect(); const k = Math.min(r.width / 812, r.height / 548); const ox = (r.width - 812 * k) / 2; return (e.clientX - r.left - ox) / k; };
  let dragging = false;
  scene.addEventListener("pointerdown", (e) => { dragging = true; scene.setPointerCapture(e.pointerId); craneTarget = Math.max(X_MIN, Math.min(X_MAX, toScene(e))); });
  scene.addEventListener("pointermove", (e) => { if (dragging) craneTarget = Math.max(X_MIN, Math.min(X_MAX, toScene(e))); });
  ["pointerup", "pointercancel"].forEach((ev) => scene.addEventListener(ev, () => { dragging = false; }));
  const keys = new Set();
  api.onKey((e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") { keys.add("L"); craneTarget = null; return true; }
    if (k === "ArrowRight" || k === "d" || k === "D") { keys.add("R"); craneTarget = null; return true; }
    if ((k === " " || k === "Enter") && !(e.target && e.target.tagName === "BUTTON")) { if (!e.repeat) drop(); return true; }
    return false;
  });
  const onUp = (e) => { if (["ArrowLeft", "a", "A"].includes(e.key)) keys.delete("L"); if (["ArrowRight", "d", "D"].includes(e.key)) keys.delete("R"); };
  document.addEventListener("keyup", onUp);

  // ---- the loop ----
  let last = performance.now();
  const loopId = setInterval(() => {
    if (api.done) { clearInterval(loopId); document.removeEventListener("keyup", onUp); return; }
    const now = performance.now(), dt = Math.min(0.12, (now - last) / 1000);
    last = now;
    const dir = hold || (keys.has("R") ? 1 : 0) - (keys.has("L") ? 1 : 0);
    const before = craneX;
    if (dir) craneX += dir * SPEED * dt;
    else if (craneTarget != null) {
      const d = craneTarget - craneX;
      craneX += Math.sign(d) * Math.min(Math.abs(d), SPEED * 1.3 * dt);
      if (Math.abs(d) < 1) craneTarget = null;
    }
    craneX = Math.max(X_MIN, Math.min(X_MAX, craneX));
    vel = vel * 0.7 + ((craneX - before) / (dt || 0.033)) * 0.3;
    drawCrane();
    if (flares) {
      nextRay -= dt;
      if (nextRay <= 0) { nextRay = rayEvery * (0.8 + Math.random() * 0.4); fireRay(); }
      stepRays(dt);
    }
  }, 33);

  // start: a couple of cracks
  for (let n = 0; n < wantOpen(); n++) openCrack();
  drawSegs(); drawStatus(); drawCrane();
  say(api.practice ? "Move the crane over the glowing crack, then press Drop." : "Patch the glowing cracks before the flares hit!");
  api.focus($("ds-drop"));
}
