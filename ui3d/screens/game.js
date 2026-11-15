// Main game screen: a big isometric base floating in space that you can turn.
// Buildings are real CSS 3D models (boxes and cylinders) on a tilted square slab; crew, flags and
// the round dome are upright billboards (see ui3d/game3d.css).
import { RES, RES_INFO, CREW, JOBS, JOB_ORDER, WARN, WEATHER_LABEL, esc, helmet, iconSvg, dateText, speakerSvg } from "../parts.js";

const MINUS = "−";
const sign = (n) => (n >= 0 ? "+" : MINUS) + Math.abs(n);
const CREW_BY = Object.fromEntries(CREW.map((c) => [c.id, c]));
const H = 340; // half the slab size in px

// Where things stand on the slab (px from the centre). With the default 45° turn,
// screen-front is (x + y) > 0 and screen-right is (x − y) > 0.
const POS = { rest: [-220, 150], oxygen_gen: [10, 238], reinforce_shield: [-30, -30], grow_food: [160, -160], science: [236, 36] };
const FEET = { rest: [-160, 178], oxygen_gen: [82, 196], reinforce_shield: [70, -64], grow_food: [104, -112], science: [142, 72] };
const HOME = { maya: [70, 150], leo: [118, 118], zuri: [150, 70] };
const DOOR = { maya: [58, 72], leo: [65, 65], zuri: [72, 58] };
const PAD = [-40, -238];
const ROVER = [-235, -30]; // the rover patrols an empty corner, away from the crew (loop in game3d.css)
const DOOR_C = [65, 65];
// how tall each model is, so its label floats just above it
const LIFT = { rest: 150, oxygen_gen: 96, reinforce_shield: 146, grow_food: 92 };

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
    sides += `<i class="f s" style="width: ${s}px; height: ${h}px; left: ${r - s / 2}px; top: ${r - h / 2}px; --sh: ${(1 - lit).toFixed(2)}; transform: translateZ(${h / 2}px) rotateZ(${a}deg) rotateX(-90deg) translateZ(${ap}px)"></i>`;
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
  // the habitat buried under rings of piled-up dirt (a stepped dome), with an airlock poking out
  reinforce_shield: () => `${cyl(94, 12, { n: 14, cls: "plinth" })}
${[[86, 26, 12], [72, 22, 38], [54, 18, 60], [33, 14, 78]].map(([r, h, z], i) => cyl(r, h, { z, n: 14, cls: "dirt" + (i % 2 ? " d2" : ""), t: `<b class="clods"></b>` })).join("")}
${cyl(17, 8, { z: 92, n: 8, cls: "white", t: `<b class="hatch"></b>` })}
${box(4, 4, 30, { x: 6, y: -6, z: 100, cls: "white" })}${box(10, 10, 4, { x: 6, y: -6, z: 130, cls: "beacon" })}
${box(44, 46, 50, { x: 70, y: 70, z: 12, cls: "white airlock", py: `<b class="door"></b>`, px: `<b class="door"></b>`, t: `<b class="vent"></b>` })}`,
  grow_food: () => `${box(128, 100, 70, { cls: "glass", t: `<b class="roof"></b>`, py: `<b class="frame"></b>`, px: `<b class="frame"></b>`, ny: `<b class="frame"></b>`, nx: `<b class="frame"></b>` })}
${box(128, 10, 10, { z: 70, cls: "ridge" })}`,
};

// ---- the ground: a round, lumpy chunk of Moon or Mars floating in space ----
// The outline wobbles (a few sine waves around a circle) so the edge looks rocky. The layers underneath
// get smaller as they go down, like the underside of a rock, and each wobbles a little differently.
function blobPath(R, phase = 0, n = 90) {
  let d = "";
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * Math.PI * 2;
    const r = R * (1 + 0.03 * Math.sin(5 * t + phase) + 0.018 * Math.sin(9 * t + 2 + phase * 1.7) + 0.01 * Math.sin(15 * t + phase * 0.6));
    d += (k ? "L" : "M") + (H + r * Math.cos(t)).toFixed(1) + " " + (H + r * Math.sin(t)).toFixed(1);
  }
  return d + "Z";
}
const TOP_R = 322;
const TOP_D = blobPath(TOP_R);
// gentle hills and dips painted on the ground: light on the Sun side, shadow on the other
const HILLS = [[110, 300, 70], [250, 560, 60], [470, 140, 64], [600, 420, 52], [330, 470, 44], [180, 160, 46], [420, 600, 40], [290, 270, 55], [510, 320, 48]];
function groundSvg(mars) {
  const v = (n) => `style="fill: var(${n})"`;
  const patches = mars
    ? [0, 1, 2, 3, 4, 5].map((n) => `<path d="M${60 + n * 20} ${150 + n * 80} C${200 + n * 10} ${120 + n * 80} ${360 - n * 6} ${190 + n * 80} ${620 - n * 22} ${140 + n * 82}" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="5" stroke-linecap="round"/>`).join("")
    : [[230, 250, 110, 0.3], [470, 470, 95, 2.1], [420, 220, 65, 4], [140, 380, 75, 1.2], [540, 280, 80, 3.4]].map(([x, y, r, ph]) => {
      let d = ""; for (let k = 0; k <= 40; k++) { const t = (k / 40) * Math.PI * 2, rr = r * (1 + 0.18 * Math.sin(3 * t + ph) + 0.1 * Math.sin(5 * t + ph * 2)); d += (k ? "L" : "M") + (x + rr * Math.cos(t)).toFixed(1) + " " + (y + rr * 0.8 * Math.sin(t)).toFixed(1); }
      return `<path d="${d}Z" fill="#141824" fill-opacity=".11"/>`; }).join("");

  // Sinuous lunar rilles (grooves/canyons formed by ancient lava tubes)
  const rilles = mars ? "" : `
<path d="M 90 200 Q 180 250 260 230 T 370 330 T 450 430" fill="none" stroke="#080c16" stroke-opacity=".28" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 91 199 Q 181 249 261 229 T 371 329 T 451 429" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 380 110 Q 420 190 490 230 T 570 310" fill="none" stroke="#080c16" stroke-opacity=".22" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 381 109 Q 421 189 491 229 T 571 309" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="1" stroke-linecap="round"/>`;

  return `<svg class="top" viewBox="0 0 ${H * 2} ${H * 2}" aria-hidden="true"><defs>
<radialGradient id="gr-g" cx="35%" cy="30%" r="80%"><stop offset="0" style="stop-color: var(--ground)"/><stop offset=".55" style="stop-color: var(--ground)"/><stop offset="1" style="stop-color: var(--ground2)"/></radialGradient>
<radialGradient id="gr-hl" cx="38%" cy="36%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="gr-sh" cx="62%" cy="66%" r="60%"><stop offset=".15" stop-color="#000" stop-opacity=".34"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<pattern id="gr-dots" width="46" height="38" patternUnits="userSpaceOnUse">
  <circle cx="5" cy="6" r="1.8" fill="#000" fill-opacity=".18"/><circle cx="27" cy="19" r="1.4" fill="#fff" fill-opacity=".35"/>
  <circle cx="38" cy="33" r="2.4" fill="#000" fill-opacity=".14"/><circle cx="14" cy="29" r="1.2" fill="#fff" fill-opacity=".3"/>
  <circle cx="22" cy="8" r="0.9" fill="#000" fill-opacity=".12"/><circle cx="43" cy="14" r="1.1" fill="#fff" fill-opacity=".22"/>
  <circle cx="9" cy="35" r="0.8" fill="#fff" fill-opacity=".25"/><circle cx="31" cy="2" r="1.5" fill="#000" fill-opacity=".16"/>
</pattern>
<clipPath id="gr-clip"><path d="${TOP_D}"/></clipPath></defs>
<path d="${TOP_D}" fill="url(#gr-g)"/>
<g clip-path="url(#gr-clip)">${patches}${rilles}
${HILLS.map(([x, y, r]) => `<ellipse cx="${x + r * 0.18}" cy="${y + r * 0.2}" rx="${r}" ry="${r * 0.82}" fill="url(#gr-sh)"/><ellipse cx="${x - r * 0.12}" cy="${y - r * 0.14}" rx="${r * 0.9}" ry="${r * 0.74}" fill="url(#gr-hl)"/>`).join("")}
<rect width="${H * 2}" height="${H * 2}" fill="url(#gr-dots)"/>
<path d="${TOP_D}" fill="none" ${v("--rim").replace("fill", "stroke")} stroke-width="26"/>
<path d="${blobPath(TOP_R - 13)}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/></g>
<path d="${TOP_D}" fill="none" stroke="#1E2430" stroke-width="4"/></svg>`;
}
// rock layers under the top: a cliff band first (almost full size), then an underside that narrows
const LAYERS = [[1, 8], [0.99, 16], [0.975, 24], [0.93, 36], [0.85, 50], [0.73, 66], [0.56, 84]];
const slabSvg = (i) => { const [sc, z] = LAYERS[i]; return `<svg class="slab${i % 2 ? " band" : ""}${i >= 3 ? " under" : ""}" viewBox="0 0 ${H * 2} ${H * 2}" style="transform: translateZ(${-z}px)" aria-hidden="true"><path d="${blobPath(TOP_R * sc, i * 0.9)}" stroke="#1E2430" stroke-width="3"/></svg>`; };

// ---- ground decorations: craters, boulders, building shadows and rover tracks ----
// All painted into ONE flat SVG on the ground (shared with the walking paths). Every separate 3D layer
// costs frame time, because the whole scene is recomposited whenever anything on screen moves.
// Coordinates are slab pixels (0..680); craters fake a raised rim with a lit edge and a shadowed edge.
// ---- 3D ground features (real CSS 3D, kept low-poly so the frame rate holds) ----
// positions are from the centre of the base; chosen to stay clear of buildings, paths and the rover loop
const HILLS3D = [[-190, 50, 40], [-130, 220, 46]];
const ROCKS3D = [[-293, 11, 16, 20], [130, 270, 15, 64], [-110, 90, 12, 35], [250, -110, 14, 80]];
function terrain3d() {
  const at = (x, y, inner, rot = 0) => `<div class="model terrain" style="left: ${H + x}px; top: ${H + y}px${rot ? `; rotate: z ${rot}deg` : ""}">${inner}</div>`;
  // hills: three low, wide steps, so they read as gentle mounds
  const hill = (r) => [[1, 0, ""], [0.66, 6, " t2"], [0.34, 12, " t3"]].map(([k, z, c], i) => cyl(Math.round(r * k), 6, { z, x: i * 2, y: i, n: 8, cls: "hill" + c, t: i === 2 ? `<b class="hilltop"></b>` : "" })).join("");
  // rocks: a squat, wide base with a smaller cap set off to one side
  const rock = (r) => cyl(r, Math.round(r * 0.5), { n: 5, cls: "rockc" }) + cyl(Math.round(r * 0.66), Math.round(r * 0.42), { z: Math.round(r * 0.5), x: -3, y: 2, n: 4, cls: "rockc", t: `<b class="rocktop"></b>` });
  return HILLS3D.map(([x, y, r]) => at(x, y, hill(r))).join("")
    + ROCKS3D.map(([x, y, r, rot]) => at(x, y, rock(r), rot)).join("");
}
const CRATERS = [
  [POS.science[0] + H, POS.science[1] + H, 76],
  [150, 140, 26], [520, 530, 30], [150, 560, 20], [420, 84, 22], [610, 270, 18], [250, 610, 14], [560, 470, 12],
  [85, 270, 16], [380, 580, 15], [580, 150, 14], [200, 390, 11], [490, 360, 13]
];
const BOULDERS = [[47, 351, 12], [470, 610, 11], [230, 430, 8], [590, 230, 10], [330, 500, 6], [165, 175, 7], [435, 120, 9]];
function decals() {
  const v = (n) => `style="fill: var(${n})"`;
  const defs = `<defs>
<radialGradient id="dc-pit" cx="42%" cy="40%" r="62%">
  <stop offset="0" stop-color="#0a0e18"/>
  <stop offset="65%" style="stop-color: var(--pit2)"/>
  <stop offset="100%" style="stop-color: var(--pit1)"/>
</radialGradient>
<linearGradient id="dc-rim-grad" x1="25%" y1="20%" x2="75%" y2="80%">
  <stop offset="0" stop-color="#ffffff" stop-opacity=".45"/>
  <stop offset="50%" style="stop-color: var(--rim)" stop-opacity=".7"/>
  <stop offset="100%" stop-color="#080c16" stop-opacity=".3"/>
</linearGradient>
<linearGradient id="dc-crescent-sh" x1="20%" y1="20%" x2="80%" y2="80%">
  <stop offset="0" stop-color="#060912" stop-opacity=".85"/>
  <stop offset="55%" stop-color="#080d1a" stop-opacity=".6"/>
  <stop offset="100%" stop-color="#000" stop-opacity="0"/>
</linearGradient>
<linearGradient id="dc-crescent-hl" x1="20%" y1="20%" x2="80%" y2="80%">
  <stop offset="0" stop-color="#fff" stop-opacity="0"/>
  <stop offset="60%" stop-color="#fff" stop-opacity=".15"/>
  <stop offset="100%" stop-color="#fff" stop-opacity=".55"/>
</linearGradient>
<radialGradient id="dc-rock" cx="34%" cy="30%" r="70%"><stop offset="0" style="stop-color: var(--rock2)"/><stop offset="1" style="stop-color: var(--rock)"/></radialGradient>
<radialGradient id="dc-shadow"><stop offset=".6" stop-color="#050814" stop-opacity=".3"/><stop offset="1" stop-color="#050814" stop-opacity="0"/></radialGradient></defs>`;

  const crat = ([x, y, r]) => {
    // Natural sunken lunar impact crater
    return `<g class="crat-bowl">`
      // Subtle raised rim outer lip
      + `<ellipse cx="${x}" cy="${y}" rx="${r + 4}" ry="${(r + 4) * 0.94}" fill="url(#dc-rim-grad)"/>`
      // Dark crater interior bowl
      + `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.94}" fill="url(#dc-pit)"/>`
      // Sun-cast shadow on inner sunward wall
      + `<ellipse cx="${x - r * 0.1}" cy="${y - r * 0.12}" rx="${r * 0.88}" ry="${r * 0.82}" fill="url(#dc-crescent-sh)"/>`
      // Soft sunlight catch on opposing inner wall
      + `<ellipse cx="${x + r * 0.08}" cy="${y + r * 0.1}" rx="${r * 0.86}" ry="${r * 0.8}" fill="none" stroke="url(#dc-crescent-hl)" stroke-width="${Math.max(2, r * 0.12)}"/>`
      // Sunken flat floor
      + `<ellipse cx="${x + r * 0.03}" cy="${y + r * 0.04}" rx="${r * 0.48}" ry="${r * 0.44}" style="fill: var(--pit2)"/>`
      + `</g>`;
  };
  const rock = ([x, y, r]) => `<ellipse cx="${x + 4}" cy="${y + 5}" rx="${r}" ry="${r * 0.8}" fill="#050814" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="url(#dc-rock)" stroke="#1E2430" stroke-width="2"/>`
    + `<ellipse cx="${x + r + 8}" cy="${y + 4}" rx="${Math.max(3.5, r / 2)}" ry="${Math.max(2.5, r * 0.35)}" fill="url(#dc-rock)" stroke="#1E2430" stroke-width="2"/>`;
  const shadow = (id) => `<ellipse cx="${H + POS[id][0] + 14}" cy="${H + POS[id][1] - 14}" rx="65" ry="35" fill="url(#dc-shadow)"/>`;
  // clipped to the round ground outline, so nothing can hang over the edge into space
  const shadow3d = HILLS3D.map(([x, y, r]) => `<ellipse cx="${H + x + 10}" cy="${H + y + 8}" rx="${r + 8}" ry="${r * 0.8}" fill="url(#dc-shadow)"/>`).join("")
    + ROCKS3D.map(([x, y, r]) => `<ellipse cx="${H + x + 6}" cy="${H + y + 6}" rx="${r + 6}" ry="${r}" fill="#050814" opacity=".22"/>`).join("");
  return defs.replace("</defs>", `<clipPath id="dc-clip"><path d="${TOP_D}"/></clipPath></defs>`) + `<g clip-path="url(#dc-clip)">` + shadow3d + CRATERS.map(crat).join("") + BOULDERS.map(rock).join("") + JOB_ORDER.map(shadow).join("")
    + `<rect x="${H + ROVER[0] - 10}" y="${H + ROVER[1] - 110}" width="120" height="120" rx="14" fill="none" stroke="rgba(30,36,48,.16)" stroke-width="6" stroke-dasharray="1 10" stroke-linecap="round"/></g>`;
}

// ---- flat sprites (toy style: 3px ink outlines, flat fills); only the crater flag is still one ----
const SPR = {
  science: (m) => `<svg width="140" height="160" viewBox="0 0 120 140" aria-hidden="true">
<path d="M30 132V30" stroke="#1E2430" stroke-width="5" stroke-linecap="round"/><path class="flag" d="M32 30h44l-10 14 10 14H32z" fill="#F26A1B" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path d="M76 124l10-22 10 22-10 10z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path d="M52 130l7-15 7 15-7 7z" fill="${m ? "#E9C9A8" : "#BFE9FF"}" stroke="#1E2430" stroke-width="3" stroke-linejoin="round"/>
<path class="sparkle" d="M100 94l2-7 2 7 7 2-7 2-2 7-2-7-7-2z" fill="#fff"/><path class="sparkle s2" d="M66 108l1.5-5 1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5z" fill="#fff"/></svg>`,
};
// the rover is a little 3D model too: a body, a cab, a mast and four wheels standing on their edges
const wheel = (x, y) => `<div class="wheel" style="left: ${x}px; top: ${y}px"><i class="disc"></i></div>`;
const rover = () => `<div class="rv">${wheel(-17, -21)}${wheel(17, -21)}${wheel(-17, 14)}${wheel(17, 14)}
${box(58, 34, 14, { z: 9, cls: "white", px: `<b class="hl"></b>`, py: `<b class="stripe"></b>`, ny: `<b class="stripe"></b>` })}
${box(24, 30, 15, { x: 10, z: 23, cls: "white", px: `<b class="cabwin"></b>`, py: `<b class="sidewin"></b>`, ny: `<b class="sidewin"></b>` })}
${box(26, 30, 3, { x: -15, z: 23, cls: "panel", t: `<b class="grid"></b>` })}
${box(3, 3, 22, { x: 18, y: -12, z: 38, cls: "white" })}${box(8, 8, 4, { x: 18, y: -12, z: 60, cls: "beacon" })}
<div class="rvbeam"></div></div>`;
// the shield bubble is round, so a camera-facing billboard looks right from every side
const DOME = () => `<svg width="270" height="230" viewBox="0 0 270 230" aria-hidden="true">
<ellipse class="dome" cx="135" cy="138" rx="128" ry="124" fill="#9B7BF7" fill-opacity=".12" stroke="#9B7BF7" stroke-width="4" stroke-dasharray="10 8" style="opacity: var(--shield-op, .8)"/>
<path class="dome" d="M40 120 a96 96 0 0 1 64 -80" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" style="opacity: calc(var(--shield-op, .8) * .6)"/></svg>`;
const plant = (i) => `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true" style="animation-delay: ${-i * 0.6}s"><g><path d="M17 44V22" stroke="#2F7A2C" stroke-width="4" stroke-linecap="round"/><circle cx="17" cy="16" r="12" fill="#5CBF5A" stroke="#1E2430" stroke-width="2.5"/>${i % 2 ? `<circle cx="13" cy="13" r="3" fill="#FF7AD9"/>` : ""}</g></svg>`;
const shipFlag = () => `<svg width="56" height="90" viewBox="0 0 56 90" aria-hidden="true"><path d="M10 88V10" stroke="#1E2430" stroke-width="4" stroke-linecap="round"/><rect x="12" y="6" width="40" height="28" rx="4" fill="#F5C518" stroke="#1E2430" stroke-width="3"/><text id="shipn" x="32" y="27" text-anchor="middle" font-family="Lexend, sans-serif" font-weight="800" font-size="17" fill="#1E2430"></text></svg>`;
const astro = (color) => `<svg class="fig" width="50" height="74" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb" stroke="#1E2430" stroke-width="2"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="34" width="20" height="5" fill="${color}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#E9B44C" stroke="#1E2430" stroke-width="1.5"/><path d="M17 9h5" stroke="#FFF3C4" stroke-width="2" stroke-linecap="round"/></svg>`;

// The sky: one still SVG (stars, flare rays) plus small moving pieces placed on top of it.
// Moving pieces are kept SMALL on purpose: the browser redraws only the area that changed, so a
// full-screen layer that moves would redraw the whole 3D base every frame (that was the lag).
// --ox / --oy / --k (set in mount) map the sky's 1280x800 picture onto the screen ("slice" fit),
// so at(x, y) puts an element exactly on a point of the picture.
const at = (x, y, w, h) => `left: calc(var(--ox) + var(--k) * ${x - w / 2}px); top: calc(var(--oy) + var(--k) * ${y - h / 2}px); width: calc(var(--k) * ${w}px); height: calc(var(--k) * ${h}px)`;
function skySvg(mars) {
  const stars = [];
  for (let i = 0; i < 70; i++) stars.push([(i * 397) % 1280, (i * 211 + 40) % 800, 0.8 + (i % 3) * 0.6]);
  const fill = mars ? "#F6D9C4" : "#F3F4F6";
  const tw = (i, y) => i % 4 === 0 && y < 200; // a few stars high in the sky twinkle (each its own tiny element, away from the base)
  const r1 = mars ? 32 : 46, r2 = mars ? 42 : 60;
  const layer = (cls, body) => `<svg class="sky ${cls}" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
  return layer("base", stars.map(([x, y, r], i) => tw(i, y) ? "" : `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${[0.5, 0.8, 0.65][i % 3]}"/>`).join(""))
    + layer("streaks s-active", `<g stroke="#F5C518" stroke-width="3" stroke-linecap="round"><line x1="108" y1="250" x2="560" y2="420"/><line x1="108" y1="250" x2="640" y2="330"/><line x1="108" y1="250" x2="480" y2="520"/></g>`)
    + layer("streaks s-storm", `<g stroke="#FF6A3D" stroke-width="5" stroke-linecap="round"><line x1="108" y1="250" x2="640" y2="440"/><line x1="108" y1="250" x2="700" y2="320"/><line x1="108" y1="250" x2="540" y2="560"/></g>`)
    + `<div class="skybits" aria-hidden="true">`
    + stars.map(([x, y, r], i) => tw(i, y) ? `<i class="star ${"abc"[(i / 4) % 3]}" style="${at(x, y, r * 2, r * 2)}; background: ${fill}"></i>` : "").join("")
    + `<i class="shoot" style="${at(940, 195, 90, 3)}"></i><i class="shoot s2" style="${at(385, 176, 76, 2)}"></i>`
    + (mars ? `<i class="dust" style="${at(640, 437, 1700, 34)}"></i><i class="dust d2" style="${at(640, 511, 1700, 22)}"></i>`
      : `<svg class="earth" viewBox="-26 -26 52 52" style="${at(520, 180, 52, 52)}"><circle r="20" fill="#3D7BD9" stroke="#1E2430" stroke-width="3"/><path d="M-14 -6 C-8 -13 0 -11 1 -5 C2 1 -4 2 -5 7 C-6 12 -12 9 -14 5Z" fill="#5CBF5A"/><path d="M2 -20 A20 20 0 0 1 2 20 A15 20 0 0 0 2 -20Z" fill="#0B1020" opacity=".4"/></svg>`)
    + `<div class="sun" style="${at(108, 250, 140, 140)}"><svg class="rays" viewBox="-70 -70 140 140"><circle r="${mars ? 40 : 56}" fill="#FFE07A" opacity=".18"/><g stroke="#F5C518" stroke-width="6" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => { const an = i * Math.PI / 4; return `<line x1="${(Math.cos(an) * r1).toFixed(1)}" y1="${(Math.sin(an) * r1).toFixed(1)}" x2="${(Math.cos(an) * r2).toFixed(1)}" y2="${(Math.sin(an) * r2).toFixed(1)}"/>`; }).join("")}</g></svg>`
    + `<svg class="disc" viewBox="-70 -70 140 140"><circle r="${mars ? 24 : 36}" fill="#F5C518" stroke="#1E2430" stroke-width="3"/></svg></div>`
    + `</div>`;
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

  const slabs = Array.from({ length: 7 }, (_, i) => slabSvg(i)).join("");
  const pt = (p) => `${H + p[0]} ${H + p[1]}`;
  const paths = [...JOB_ORDER.map((id) => FEET[id]), [PAD[0] + 40, PAD[1] + 40]].map((f, i) => `<path id="pa-${JOB_ORDER[i] || "pad"}" d="M${pt(DOOR_C)} L${pt(f)}"/>`).join("");
  const bbAt = (p) => `--x: ${p[0]}; --y: ${p[1]}; --yaw: ${yaw}deg`;

  root.innerHTML = `<div id="g3" class="${mars ? "mars" : "moon"}${reduced ? "" : " intro"}">
<div class="world" id="world">
  ${skySvg(mars)}
  <div class="stage3d"><div class="board" id="board" style="--yaw: ${yaw}deg">
    ${slabs}${groundSvg(mars)}
    <div class="model padm" style="left: ${H + PAD[0]}px; top: ${H + PAD[1]}px">${cyl(76, 10, { n: 12, cls: "plinth" })}</div>
    <div class="flat pad" style="left: ${H + PAD[0]}px; top: ${H + PAD[1]}px; transform: translate(-50%, -50%) translateZ(11px)"></div>
    <svg class="paths" viewBox="0 0 ${H * 2} ${H * 2}" aria-hidden="true">${decals()}${paths}</svg>
    ${terrain3d()}
    <div class="flat flood" style="left: ${H + POS.reinforce_shield[0]}px; top: ${H + POS.reinforce_shield[1]}px"></div><div class="flat flood" style="left: ${H + POS.grow_food[0]}px; top: ${H + POS.grow_food[1]}px"></div>
    ${JOB_ORDER.map((id) => `<div class="flat ring" id="ring-${id}" style="left: ${H + POS[id][0]}px; top: ${H + POS[id][1]}px"></div>`).join("")}
    <div class="shade" style="clip-path: path('${TOP_D}')"></div>
    <div class="bb" style="${bbAt([PAD[0] + 55, PAD[1] - 10])}" aria-hidden="true">${shipFlag()}</div>
    <div class="model rover" style="left: ${H + ROVER[0]}px; top: ${H + ROVER[1]}px" aria-hidden="true">${rover()}</div>
    ${JOB_ORDER.filter((id) => MODEL[id]).map((id, i) => `<div class="model bld" id="md-${id}" data-job="${id}" style="left: ${H + POS[id][0]}px; top: ${H + POS[id][1]}px; --i: ${i}" aria-hidden="true">${MODEL[id]()}</div>`).join("")}
    <div class="bb domebb" style="${bbAt(POS.reinforce_shield)}" aria-hidden="true"><div class="domewrap">${DOME()}</div></div>
    ${[[-34, -22], [8, -26], [-20, 18], [30, 14]].map(([dx, dy], i) => `<div class="bb plant" style="${bbAt([POS.grow_food[0] + dx, POS.grow_food[1] + dy])}" aria-hidden="true">${plant(i)}</div>`).join("")}
    <div class="bb puffbb" style="${bbAt([POS.oxygen_gen[0] + 18, POS.oxygen_gen[1] - 12])}" aria-hidden="true"><svg width="40" height="60" viewBox="0 0 40 60"><g fill="#fff" stroke="#C9CED6" stroke-width="1.5"><circle class="puff" cx="20" cy="50" r="8"/><circle class="puff p2" cx="23" cy="50" r="6"/><circle class="puff p3" cx="17" cy="50" r="7"/></g></svg><div style="height: 102px"></div></div>
    ${JOB_ORDER.map((id, i) => `<button type="button" class="bb station${id === "reinforce_shield" ? " hab" : ""}${MODEL[id] ? " has3d" : ""}" id="st-${id}" data-job="${id}" style="${bbAt(POS[id])}; --i: ${i}; --c: ${RES_INFO[JOBS[id].res].color}" aria-label="${esc(JOBS[id].label(mars))}">
      <span class="lbl"><i>${iconSvg(JOBS[id].res, 18, "#1E2430")}</i>${esc(JOBS[id].short)}</span>${MODEL[id] ? `<span class="lift" style="height: ${LIFT[id]}px"></span>` : `<span class="art">${SPR[id](mars)}</span>`}${id === "reinforce_shield" ? `<span class="zzz" id="zzz" hidden></span>` : ""}</button>`).join("")}
    ${CREW.map((c, i) => `<div class="bb walker" id="w-${c.id}" style="${bbAt(HOME[c.id])}; --i: ${i}"><span class="tag" style="border-color: ${c.color}">${c.name}</span>${astro(c.color)}<span class="kick" aria-hidden="true"><i></i><i></i><i></i></span><span class="zz" hidden>zz</span></div>`).join("")}
  </div></div>
</div>
${mars ? "" : `<div class="nighttag">Moon night: dark for 14 sols</div>`}
<button type="button" class="key turn l" id="t-l" aria-label="Turn the base left"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 0 5-5"/></svg></button>
<button type="button" class="key turn r" id="t-r" aria-label="Turn the base right"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 7 5 5-5 5M20 12H9a5 5 0 0 1-5-5"/></svg></button>
<div class="hint">Drag to turn the base, or press Q and E</div>
<header class="hud">
  <div class="logo">Delta&#8209;V 26</div><div class="place">${mars ? "Mars · Jezero crater" : "Moon · Shackleton crater"}</div>
  <div class="solbox" role="group" aria-label="Mission day"><span class="sl">Sol<strong id="sol"></strong>of 30</span><div class="path" id="path" aria-hidden="true"></div><span class="wx" id="wx"></span></div>
  <button type="button" class="key tbtn sci" id="b-sci" aria-label="Science points">${iconSvg("science", 20, "#1E2430")}<span id="sci"></span></button>
  <button type="button" class="key tbtn" id="b-tasks"></button>
  <button type="button" class="key tbtn" id="b-up">Upgrades</button>
  <button type="button" class="key tbtn" id="b-mute" aria-label="${ctx.muted ? "Unmute sound" : "Mute sound"}" title="${ctx.muted ? "Unmute sound" : "Mute sound"}" style="min-width: 48px; width: 48px; height: 52px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">${speakerSvg(ctx.muted, 22, "#1E2430")}</button>
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
  // map the sky picture (1280x800, "slice" fit) onto the screen for the small sky pieces
  const placeSun = () => {
    const W = g3.offsetWidth, Hh = g3.offsetHeight;
    if (!W || !Hh) return;
    const k = Math.max(W / 1280, Hh / 800);
    g3.style.setProperty("--k", k.toFixed(4));
    g3.style.setProperty("--ox", (W / 2 - 640 * k).toFixed(1) + "px");
    g3.style.setProperty("--oy", (Hh / 2 - 400 * k).toFixed(1) + "px");
  };
  placeSun();
  window.addEventListener("resize", placeSun);
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
    if (drag.moved) setYaw(drag.yaw - (e.clientX - drag.x) * 0.35, true);
  });
  // tapping a 3D building (without dragging) is the same as tapping its label
  const endDrag = (e) => {
    if (!drag) return;
    const d = drag; drag = null; world.classList.remove("dragging");
    if (e && e.type === "pointerup" && !d.moved && d.job) { const b = $("st-" + d.job); if (b && !b.disabled) b.click(); }
  };
  world.addEventListener("pointerup", endDrag);
  world.addEventListener("pointercancel", endDrag);
  $("t-l").addEventListener("click", () => setYaw(yaw + 45));
  $("t-r").addEventListener("click", () => setYaw(yaw - 45));
  const closeJob = () => { const id = openJob; openJob = null; preview(null, null); draw(); if (id) $("st-" + id).focus(); };
  const onKey = (e) => {
    if (document.querySelector(".dv-overlay") || e.target.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === "q") setYaw(yaw + 30);
    else if (k === "e") setYaw(yaw - 30);
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
      // same words as main's PR #9: out on a job = Working, done for the day = Resting
      const off = m.job || walking[c.id] || inside.has(c.id);
      const word = walking[c.id] ? "Working" : off ? "Resting" : a.skilled && !a.tired ? "Best at this!" : a.tired ? "Tired" : "Ready";
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
    if (m.tired) return ["Tired today", "tired"];
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
    // science has no meter: its gains fly to the science counter at the top instead
    const m = res === "science" ? $("b-sci") : $("m-" + res);
    if (!m || !fromEl) return;
    const sr = g3.getBoundingClientRect(), scale = sr.width / g3.offsetWidth;
    const a = fromEl.getBoundingClientRect(), b = (m.querySelector(".val") || m).getBoundingClientRect();
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

  const bMute = $("b-mute");
  const updateMuteBtn = () => {
    if (!bMute) return;
    const m = ctx.muted;
    bMute.setAttribute("aria-label", m ? "Unmute sound" : "Mute sound");
    bMute.title = m ? "Unmute sound" : "Mute sound";
    bMute.innerHTML = speakerSvg(m, 22, "#1E2430");
  };
  bMute.addEventListener("click", () => {
    const isMuted = ctx.toggleMute();
    if (!isMuted) ctx.sfx("click");
    updateMuteBtn();
  });
  const unsubMute = ctx.onMuteChange?.(updateMuteBtn);

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
    try { won = !!(await (await import("../overlays/tasks.js")).runTask(ctx, id, crewId)); } catch (e) { won = false; }
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
  // first game ever (or "How to play" on the title): the interactive tour starts after the intro
  let stopTour = null;
  import("../overlays/coach.js").then(({ startTour, tourDone }) => {
    if (!alive || (!store.tutorial && tourDone())) return;
    later(() => {
      if (alive) stopTour = startTour(ctx, g3, { state: S, yaw: () => yaw, cardOpen: () => openJob, busy: () => busy });
    }, reduced ? 300 : 2600);
  });
  return () => { if (stopTour) stopTour(); alive = false; unsubMute?.(); document.removeEventListener("keydown", onKey); timers.forEach(clearTimeout); if (stageEl) stageEl.classList.remove("bleed"); window.removeEventListener("resize", placeSun); };
}
