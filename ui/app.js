// Delta-V 26 UI. Every screen lives here: title, site pick, briefing, game, end.
// The rules come from /engine. This file only draws and animates.

import { newGame, getActions, applyAction, nextSol, withRealWeather, getForecast, isNight } from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";
import { playSfx } from "./audio.js";

const app = document.getElementById("app");
const RES = ["power", "oxygen", "shielding", "food"];
const NAMES = { power: "Power", oxygen: "Oxygen", shielding: "Shield", food: "Food", science: "Science" };
const ICONS = {
  power: "M13 2 4 14h7l-1 8 9-12h-7z",
  oxygen: "M9 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM17.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  shielding: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  food: "M5 19c0-9 5-14 15-14 0 10-5 15-14 14zM5 19l8-8",
};
const WEATHER = { calm: { label: "Calm", color: "#6edc8c" }, active: { label: "Active", color: "#ffc93c" }, storm: { label: "Storm", color: "#ff9a5c" } };
const SITES = {
  moon: { name: "The Moon", place: "Shackleton crater", mission: "Mission Ice Hunt",
    story: "Your crew has landed at Shackleton crater, near the Moon's south pole, to look for water ice. The supply ship lands on Sol 30. Keep everyone safe until then.",
    blurb: "A crater so deep the Sun never reaches the bottom. Ice may hide there. Watch out for the 14-sol night!" },
  mars: { name: "Mars", place: "Jezero crater", mission: "Mission Red Rock",
    story: "Your crew has landed in Jezero crater on Mars. A lake filled it long ago. Collect rocks and stay alive until the supply ship lands on Sol 30.",
    blurb: "An old lake bed where NASA's Perseverance rover explores. Dust storms can cover your solar panels!" },
};
const CREW = [
  { id: "maya", name: "Maya", job: "Engineer", color: "#5cc8ff", about: "Runs the oxygen plant and fixes the shield.", home: [418, 378] },
  { id: "leo", name: "Leo", job: "Botanist", color: "#6edc8c", about: "Grows the food. Gets hungry first.", home: [464, 386] },
  { id: "zuri", name: "Zuri", job: "Scientist", color: "#ff9edb", about: "Explores the crater and makes discoveries.", home: [510, 378] },
];
// Where each job happens in the scene (a 1024 x 436 picture), and what the crew says.
const JOBS = {
  rest: { feet: [205, 322], tag: [196, 92], where: "Resting", label: () => "Rest and recharge",
    line: () => "The solar tower is charging the batteries. Time for a snack.",
    real: (m) => m ? "Real: Mars landers run on solar panels, and dust is their enemy." : "Real: at the Moon's south pole, tall solar towers catch the low Sun." },
  oxygen_gen: { feet: [338, 320], tag: [190, 322], where: "At oxygen plant", label: (m) => m ? "Oxygen from Mars air" : "Oxygen from Moon soil",
    line: (m) => m ? "The plant is pulling oxygen out of the Mars air!" : "The plant is baking oxygen out of Moon soil!",
    real: (m) => m ? "Real: NASA's MOXIE made oxygen from Mars air in 2021." : "Real plan: NASA wants to make oxygen from Moon soil." },
  reinforce_shield: { feet: [572, 316], tag: [384, 150], where: "Fixing shield", label: () => "Pile soil on the base",
    line: (m) => "More " + (m ? "Mars" : "Moon") + " soil on the roof. That blocks the Sun's rays.",
    real: () => "Real plan: soil piled on a base can block radiation." },
  grow_food: { feet: [706, 320], tag: [540, 322], where: "In the garden", label: () => "Tend the veggie garden",
    line: () => "The lettuce is growing under the pink lights!",
    real: () => "Real: astronauts grow lettuce on the Space Station." },
  science: { feet: [880, 322], tag: [800, 176], where: "In the crater", label: (m) => m ? "Collect crater rocks" : "Hunt for ice in the crater",
    line: (m) => m ? "This rock was shaped by water long ago!" : "I found ice in a crater that never sees the Sun!",
    real: (m) => m ? "Real: the Perseverance rover collects rocks in Jezero crater." : "Real: Artemis crews will look for ice near the south pole." },
};
const WARN = {
  power: ["Maya", "The lights are dimming, Commander. Someone should rest and recharge."],
  oxygen: ["Zuri", "The air feels thin. Can someone run the oxygen plant?"],
  shielding: ["Maya", "The shield is thin. A Sun storm could make us sick!"],
  food: ["Leo", "My tummy is rumbling, Commander! The garden needs me."],
};
const TIPS = {
  power: "Rest when power gets low. Every machine at the base needs power to run.",
  oxygen: "Run the oxygen plant before the air gets thin. It needs power, so keep the batteries charged.",
  shielding: "Check the Sun forecast. Pile soil on the base before a storm arrives.",
  food: "Send someone to the garden often. Resting uses up food too.",
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sfx = (name) => { try { playSfx(name); } catch (e) { /* sound is optional */ } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (v, of) => (v / of * 100).toFixed(2) + "%";

// ---------- Drawings ----------

function astro(color) {
  return `<svg class="astro" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa"/><circle cx="8.5" cy="46" r="4.2" fill="#aeb4c4"/><circle cx="35.5" cy="46" r="4.2" fill="#aeb4c4"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa"/><rect x="11" y="62" width="11" height="6" rx="2" fill="#8a90a0"/><rect x="22" y="62" width="11" height="6" rx="2" fill="#8a90a0"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa"/><rect x="17" y="26" width="10" height="6" rx="1.5" fill="#c9cedb"/><rect x="12" y="35" width="20" height="4" fill="${color}"/><rect x="13" y="52" width="8.5" height="3" fill="${color}"/><rect x="22.5" y="52" width="8.5" height="3" fill="${color}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#d9a441"/><path d="M17 10h5" stroke="#ffe7a8" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

function stars() {
  const pts = [[210, 40], [330, 86], [470, 34], [560, 120], [640, 60], [800, 44], [880, 170], [1000, 80], [40, 70], [420, 160], [130, 130], [720, 130], [270, 170], [960, 30], [600, 180]];
  return [0, 1, 2].map((g) => `<g class="tw${g + 1}" fill="#fff">${pts.filter((_, i) => i % 3 === g).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.2 + (i % 3) * 0.4}"/>`).join("")}</g>`).join("");
}

// The whole base, drawn for the Moon or for Mars.
function sceneSvg(site, label) {
  const m = site === "mars";
  const c = m
    ? { sky: "#c99a6b", far: "#a8643e", mid: "#8f4e2c", near: "#74391f", rim: "#a8643e", pit: "#5a2a16", berm: "#8f4e2c" }
    : { sky: "#05070f", far: "#a3a9b8", mid: "#868c9b", near: "#666c7b", rim: "#a3a9b8", pit: "#0a0c12", berm: "#868c9b" };
  return `<svg viewBox="0 0 1024 436" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">
<rect width="1024" height="436" fill="${c.sky}"/>
${m ? "" : stars() + `<line class="shoot" x1="980" y1="20" x2="560" y2="190" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`}
<g class="sun"><circle class="sunglow" cx="70" cy="212" r="44" fill="#fff6d6" opacity=".18"/><circle cx="70" cy="212" r="${m ? 17 : 26}" fill="#fff6d6"/>
<g class="streaks" stroke="#ffb27a" stroke-width="3" stroke-linecap="round"><line x1="90" y1="200" x2="520" y2="120"/><line x1="90" y1="214" x2="540" y2="190"/><line x1="90" y1="226" x2="500" y2="250"/><line x1="90" y1="190" x2="460" y2="60"/></g></g>
${m ? "" : `<g><circle cx="940" cy="118" r="24" fill="#3f8fe8"/><ellipse cx="932" cy="112" rx="10" ry="7" fill="#58c27a"/><ellipse cx="948" cy="128" rx="7" ry="4" fill="#58c27a"/><circle cx="954" cy="108" r="24" fill="${c.sky}"/></g>`}
<path d="M0 236 120 214 260 228 420 206 600 226 760 204 900 222 1024 210V436H0z" fill="${c.far}"/>
${m ? `<g fill="#e3b58a" opacity=".35"><rect class="dust" x="0" y="150" width="2048" height="34" rx="17"/><rect class="dust d2" x="0" y="196" width="2048" height="20" rx="10"/></g>` : ""}
<path d="M0 262Q300 240 620 258T1024 250V436H0z" fill="${c.mid}"/>
<path d="M0 330Q400 300 1024 326V436H0z" fill="${c.near}"/>
<ellipse cx="850" cy="300" rx="162" ry="36" fill="${c.rim}"/><ellipse cx="850" cy="304" rx="150" ry="30" fill="${c.pit}"/>
<path d="M704 232 696 240M708 232 716 240" stroke="#aeb4c4" stroke-width="3" stroke-linecap="round"/>
<path d="M692 232 697 192Q706 168 715 192L720 232z" fill="#dadfea"/><circle class="beacon" cx="706" cy="176" r="3.5" fill="#ff5a5a"/>
<path d="M150 302 430 314V320L150 308z" fill="#000" opacity=".35"/>
<path d="M150 302V104M136 302l14-16 14 16" stroke="#c9cedb" stroke-width="5" stroke-linecap="round" fill="none"/>
<rect x="122" y="98" width="56" height="132" rx="3" fill="#2f5bd8"/><path d="M122 131h56M122 164h56M122 197h56M150 98v132" stroke="#0b1026" stroke-width="2"/>
<rect class="glint" x="122" y="98" width="56" height="132" rx="3" fill="#fff"/>
<ellipse cx="282" cy="310" rx="52" ry="7" fill="#000" opacity=".3"/>
<rect x="240" y="280" width="46" height="28" rx="3" fill="#dadfea"/><path d="M248 280l6-14h18l6 14z" fill="#aeb4c4"/>
<circle cx="302" cy="290" r="17" fill="#f2f4fa"/><path d="M286 296h-6M302 273v-8h14" stroke="#aeb4c4" stroke-width="4" stroke-linecap="round" fill="none"/>
<g fill="#fff"><circle class="puff" cx="316" cy="262" r="5"/><circle class="puff p2" cx="320" cy="262" r="4"/><circle class="puff p3" cx="313" cy="262" r="4.5"/></g>
<ellipse cx="465" cy="308" rx="104" ry="9" fill="#000" opacity=".3"/>
<rect x="380" y="250" width="170" height="56" rx="28" fill="#eef1f8"/>
<path d="M370 278Q400 226 465 222 530 226 560 278 465 256 370 278z" fill="${c.berm}"/>
<rect x="452" y="272" width="26" height="34" rx="4" fill="#4a5063"/>
<circle class="win" cx="412" cy="290" r="7" fill="#9fd8ff"/><circle class="win" cx="518" cy="290" r="7" fill="#9fd8ff"/>
<ellipse class="dome" cx="465" cy="306" rx="150" ry="118" fill="#c3aeff" fill-opacity=".12" stroke="#c3aeff" stroke-width="3" stroke-dasharray="10 8"/>
<ellipse cx="635" cy="308" rx="52" ry="7" fill="#000" opacity=".3"/>
<path d="M590 306V280a45 45 0 0 1 90 0V306z" fill="#f2f4fa"/>
<rect class="grow" x="602" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/><rect class="grow" x="626" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/><rect class="grow" x="650" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/>
<g class="rover"><rect x="745" y="350" width="50" height="16" rx="4" fill="#eef1f8"/><path d="M782 350v-16h10" stroke="#c9cedb" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="756" cy="370" r="7" fill="#2a2e3a"/><circle cx="784" cy="370" r="7" fill="#2a2e3a"/></g>
<rect class="nightshade" width="1024" height="436" fill="#02030a"/>
</svg>`;
}

function skyBackdrop() {
  return `<svg class="sky" viewBox="0 0 1024 436" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1024" height="436" fill="#05070f"/>${stars()}<line class="shoot" x1="980" y1="20" x2="560" y2="190" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
}

// ---------- Menu screens ----------

function menu(inner, wide) {
  app.innerHTML = `<main class="menu">${skyBackdrop()}<section class="card${wide ? " wide" : ""}">${inner}</section></main>`;
}

function showTitle() {
  menu(`<div class="kicker">NASA SPACE APPS 2026</div>
<h1>Delta-V 26</h1>
<p>Junior Astronaut Mission Trainer. Lead a crew of three on the Moon or Mars. Every choice has a cost!</p>
<div class="crewrow">${CREW.map((c) => `<div class="crewcard"><div class="fig">${astro(c.color)}</div><b style="color:${c.color}">${c.name}</b><i>${c.job}</i></div>`).join("")}</div>
<div class="row"><button class="btn" data-go="sites">Start mission</button><button class="btn ghost" data-go="credits">Credits</button></div>`);
  bindGo();
}

function showSites() {
  menu(`<div class="kicker">STEP 1</div><h1>Where will you land?</h1>
<div class="sites">${["moon", "mars"].map((s) => `<button class="site" data-site="${s}">${sceneSvg(s, SITES[s].place)}<b>${SITES[s].name}</b><span>${SITES[s].place}. ${SITES[s].blurb}</span></button>`).join("")}</div>
<div class="row"><button class="btn ghost" data-go="title">Back</button></div>`, true);
  app.querySelectorAll("[data-site]").forEach((b) => b.addEventListener("click", () => { sfx("click"); showBriefing(b.dataset.site); }));
  bindGo();
}

async function showBriefing(site) {
  const s = SITES[site];
  const plan = await loadRealWeather();
  menu(`<div class="kicker">YOUR MISSION, COMMANDER</div><h1>${s.mission}</h1><p>${s.story}</p>
<h2>Meet your crew</h2>
<div class="crewrow">${CREW.map((c) => `<div class="crewcard"><div class="fig">${astro(c.color)}</div><b style="color:${c.color}">${c.name}</b><i>${c.job}</i><span>${c.about}</span></div>`).join("")}</div>
<div class="note"><div>${plan
    ? `<b>The Sun in this mission is real</b>Every Sun storm you face really happened in May 2024. NASA recorded them all.`
    : `<b>Practice weather</b>The real NASA records could not be loaded, so this mission uses made-up Sun weather.`}</div></div>
<div class="row"><button class="btn ghost" data-go="sites">Back</button><button class="btn" id="go">Start the mission</button></div>`);
  bindGo();
  app.querySelector("#go").addEventListener("click", () => { sfx("good"); startGame(site, plan); });
}

async function showCredits() {
  let list = [];
  try { list = await (await fetch("./content/attribution.json")).json(); } catch (e) { /* show the basics only */ }
  menu(`<h1>Credits</h1><p>Built for NASA Space Apps 2026. Sun weather comes from NASA's DONKI space weather database.</p>
<ul class="credits"><li><a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener">NASA CCMC DONKI: solar flare records</a></li>${list.filter((a) => String(a.url).startsWith("https://")).map((a) => `<li><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a></li>`).join("")}</ul>
<div class="row"><button class="btn ghost" data-go="title">Back</button></div>`);
  bindGo();
}

function bindGo() {
  const go = { title: showTitle, sites: showSites, credits: showCredits };
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { sfx("click"); go[b.dataset.go](); }));
}

// ---------- Game ----------

function startGame(site, plan) {
  const mars = site === "mars";
  let g = newGame(site);
  if (plan) g = withRealWeather(g, plan);
  let sel = CREW[0].id;
  let at = {};        // crew id -> action id, for this sol
  let busy = false;   // true while something is animating
  let say = null;
  let facts = 0;

  app.innerHTML = `<main class="game">
<header class="hud">
  <div class="hudtop"><span class="logo">Delta-V 26</span><span class="pill">${SITES[site].name}: ${SITES[site].place}</span>
    <span class="solnum">Sol <b id="sol">1</b> <small>of 30</small></span><div class="path" id="path" aria-hidden="true">${"<i></i>".repeat(30)}</div>
    <span class="pill" id="sci" style="color:var(--science)">Science 0</span><span class="pill" id="night" hidden>Moon night</span></div>
  <div class="meters">${RES.map((k) => `<div class="meter" id="m-${k}" style="--c:var(--${k})"><div class="top"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[k]}"/></svg><span class="nm">${NAMES[k]}</span><span class="lowtxt"></span><span class="val">0</span><span class="delta"></span></div><div class="track"><div class="ghost"></div><div class="fill"></div></div></div>`).join("")}</div>
</header>
<div class="stage">
  <div class="scene" id="scene">${sceneSvg(site, "The base at " + SITES[site].place + ": solar tower, oxygen plant, home covered in soil, greenhouse, rover and crater")}
    ${CREW.map((c) => `<div class="walker" id="w-${c.id}" style="color:${c.color}"><span class="nm">${c.name}</span><div class="fig">${astro(c.color)}</div></div>`).join("")}
  </div>
  <div class="jobs" id="jobs"></div>
</div>
<footer class="dock">
  <div class="picker"><span>1. Pick who to send &nbsp; 2. Tap a job</span><div class="crewbtns">${CREW.map((c) => `<button class="crewbtn" id="c-${c.id}" style="--c:${c.color}"><span class="helm"><i></i></span><b>${c.name}</b><small>${c.job}</small><em></em></button>`).join("")}</div></div>
  <div class="bubble" id="bubble" aria-live="polite"><div class="who"></div><div class="say"></div><div class="real"></div></div>
  <div class="fore"><div class="hd">Sun forecast <span class="tagreal${plan ? "" : " practice"}">${plan ? "REAL NASA" : "PRACTICE"}</span></div><div class="src">${plan ? "Real flare records, May 2024" : "Made-up weather, not real records"}</div><div class="days" id="days"></div></div>
  <div class="next"><div class="left" id="left"></div><button class="btn" id="next">Next sol</button></div>
</footer></main>`;

  const $ = (id) => app.querySelector("#" + id);
  const scene = $("scene");
  const place = (el, [x, y]) => { el.style.left = pct(x, 1024); el.style.top = pct(y, 436); };
  const person = (id) => CREW.find((c) => c.id === id);
  const firstFree = () => (CREW.find((c) => !at[c.id]) || {}).id || null;

  // Job tags are built once. Their numbers are refreshed in draw().
  $("jobs").innerHTML = Object.keys(JOBS).map((id) => `<button class="job" data-job="${id}" style="left:${pct(JOBS[id].tag[0], 1024)};top:${pct(JOBS[id].tag[1], 436)}"><b>${JOBS[id].label(mars)}</b><span><span class="g"></span> <span class="c"></span></span></button>`).join("");
  const jobColor = { rest: "power", oxygen_gen: "oxygen", reinforce_shield: "shielding", grow_food: "food", science: "science" };
  app.querySelectorAll(".job").forEach((b) => {
    const id = b.dataset.job;
    b.style.setProperty("--c", `var(--${jobColor[id]})`);
    b.addEventListener("click", () => send(id));
    const on = () => preview(id), off = () => preview(null);
    b.addEventListener("pointerenter", on); b.addEventListener("focus", on);
    b.addEventListener("pointerleave", off); b.addEventListener("blur", off);
  });
  CREW.forEach((c) => {
    place($("w-" + c.id), c.home);
    $("c-" + c.id).addEventListener("click", () => { if (!at[c.id] && !busy) { sel = c.id; sfx("click"); draw(); } });
  });
  $("next").addEventListener("click", endSol);

  function line(obj, sign) { return Object.keys(obj).map((k) => sign + obj[k] + " " + NAMES[k]).join(", "); }

  // Show what a job would change, before the player commits.
  function preview(id) {
    const a = id && getActions(g).find((x) => x.id === id);
    RES.forEach((k) => {
      const m = $("m-" + k), d = m.querySelector(".delta"), ghost = m.querySelector(".ghost");
      const change = a ? (a.gain[k] || 0) - (a.cost[k] || 0) : 0;
      d.textContent = change ? (change > 0 ? "+" : "−") + Math.abs(change) : "";
      d.className = "delta " + (change > 0 ? "up" : "down");
      ghost.style.width = change > 0 ? Math.min(100, g[k] + change) + "%" : "0%";
    });
  }

  function speak() {
    const lowest = [...RES].sort((x, y) => g[x] - g[y])[0];
    let s = say;
    if (!s && g[lowest] < 30) s = { who: WARN[lowest][0], line: WARN[lowest][1], real: "" };
    if (!s && g.actionsLeft === 0) s = { who: "Mission Control", line: "Good work today. Tap Next sol when you are ready.", real: "" };
    if (!s && g.weather === "storm") s = { who: "Maya", line: "Sun storm today! The shield is taking hits.", real: "" };
    if (!s && g.weather === "active") s = { who: "Zuri", line: "The Sun is active today. Keep an eye on the shield.", real: "" };
    if (!s) s = { who: sel ? person(sel).name : "Leo", line: sel ? "I am ready, Commander. Tap a job to send me!" : "Good morning, Commander!", real: "" };
    const b = $("bubble");
    const changed = b.querySelector(".say").textContent !== s.line;
    b.querySelector(".who").textContent = s.who + " says";
    b.querySelector(".say").textContent = s.line;
    b.querySelector(".real").textContent = s.real || "";
    if (changed) { b.classList.remove("new"); void b.offsetWidth; b.classList.add("new"); }
  }

  function draw() {
    const canAct = g.actionsLeft > 0 && !!sel && !busy && g.status === "playing";
    $("sol").textContent = g.sol;
    $("sci").textContent = "Science " + g.science;
    $("night").hidden = !isNight(g);
    $("path").querySelectorAll("i").forEach((d, i) => { d.className = i + 1 < g.sol ? "done" : i + 1 === g.sol ? "now" : ""; });
    RES.forEach((k) => {
      const m = $("m-" + k), low = g[k] < 30;
      m.classList.toggle("low", low);
      m.querySelector(".lowtxt").textContent = low ? "LOW!" : "";
      m.querySelector(".val").textContent = g[k];
      m.querySelector(".fill").style.width = g[k] + "%";
    });
    const actions = getActions(g);
    app.querySelectorAll(".job").forEach((b) => {
      const a = actions.find((x) => x.id === b.dataset.job);
      b.querySelector(".g").textContent = line(a.gain, "+");
      b.querySelector(".c").textContent = line(a.cost, "−");
      b.disabled = !canAct;
      b.classList.toggle("ready", canAct);
    });
    const worried = RES.some((k) => g[k] < 30);
    CREW.forEach((c) => {
      const btn = $("c-" + c.id), job = at[c.id];
      btn.disabled = !!job;
      btn.classList.toggle("picked", sel === c.id && !job);
      btn.querySelector("em").textContent = job ? JOBS[job].where : sel === c.id ? "Picked!" : "Tap to pick";
      const w = $("w-" + c.id);
      w.classList.toggle("picked", sel === c.id && !job);
      w.classList.toggle("sad", worried);
    });
    scene.className = "scene weather-" + g.weather + (isNight(g) ? " night" : "");
    const dome = scene.querySelector(".dome");
    dome.style.opacity = (0.15 + g.shielding / 100 * 0.85).toFixed(2);
    dome.classList.toggle("weak", g.shielding < 30);
    $("days").innerHTML = getForecast(g, 3).map((f) => `<div class="day" style="--c:${WEATHER[f.weather].color}"><small>Sol ${f.sol}</small><b>${WEATHER[f.weather].label}</b><i>${f.flare ? esc(f.flare.class) + " flare" : f.real ? "no flare" : "&nbsp;"}</i></div>`).join("") || `<div class="day" style="grid-column:1/-1"><b style="color:var(--gold)">Supply ship arrives!</b></div>`;
    $("left").innerHTML = [0, 1].map((i) => `<i class="${i < g.actionsLeft ? "on" : ""}"></i>`).join("") + (g.actionsLeft === 1 ? "1 job left" : g.actionsLeft + " jobs left");
    $("next").classList.toggle("go", g.actionsLeft === 0 && !busy);
    speak();
  }

  function floatText(text, [x, y], color) {
    const f = document.createElement("div");
    f.className = "float"; f.textContent = text; f.style.color = color;
    place(f, [x, y - 78]);
    scene.appendChild(f);
    setTimeout(() => f.remove(), 1500);
  }

  // Send the picked crew member to a job.
  async function send(id) {
    if (busy || !sel || at[sel] || g.actionsLeft <= 0 || g.status !== "playing") return;
    busy = true;
    const who = person(sel), job = JOBS[id], a = getActions(g).find((x) => x.id === id);
    const w = $("w-" + who.id);
    at[who.id] = id;
    sel = firstFree();
    preview(null);
    sfx("click");
    say = { who: who.name, line: "On my way!", real: "" };
    draw();
    w.classList.add("walking");
    place(w, job.feet);
    await wait(1150);
    w.classList.remove("walking"); w.classList.add("working");
    g = applyAction(g, id);
    sfx("good");
    floatText(line(a.gain, "+"), job.feet, `var(--${jobColor[id]})`);
    say = { who: who.name, line: job.line(mars), real: job.real(mars) };
    busy = false;
    draw();
  }

  async function endSol() {
    if (busy || g.status !== "playing") return;
    busy = true;
    sfx("click");
    say = null;
    CREW.forEach((c) => { const w = $("w-" + c.id); w.classList.remove("working"); w.classList.add("walking"); place(w, c.home); });
    const { state, event } = nextSol(g);
    const banner = document.createElement("div");
    banner.className = "solbanner"; banner.textContent = "Sol " + state.sol;
    scene.appendChild(banner);
    await wait(900);
    CREW.forEach((c) => $("w-" + c.id).classList.remove("walking"));
    g = state; at = {}; sel = CREW[0].id;
    draw();
    await wait(600);
    banner.remove();
    if (event) await showEvent(event);
    busy = false;
    draw();
    if (g.status !== "playing") { await wait(700); showEnd(g, site, facts); }
  }

  // The event card. Resolves when the player closes it.
  function showEvent(ev) {
    facts += 1;
    sfx(ev.id === "solar_flare" ? "flare" : "warning");
    scene.classList.add("shake");
    setTimeout(() => scene.classList.remove("shake"), 500);
    const chips = Object.keys(ev.effects).map((k) => k === "actionsLeft" ? "−1 job today" : NAMES[k] + " −" + Math.abs(ev.effects[k]));
    const date = ev.flare ? new Date(ev.flare.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
    const veil = document.createElement("div");
    veil.className = "veil";
    veil.innerHTML = `<section class="event" role="dialog" aria-modal="true" aria-labelledby="evt">
<div class="head"><svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="26" fill="#ffc93c"/><path d="M48 10V2M48 94v-8M10 48H2M94 48h-8M21 21l-6-6M81 81l-6-6M21 75l-6 6M81 15l-6 6" stroke="#ff9a5c" stroke-width="6" stroke-linecap="round"/><path d="M48 34v18M48 60v3" stroke="#0b1026" stroke-width="7" stroke-linecap="round"/></svg>
<div><div class="kicker" style="color:var(--warn)">SOL ${g.sol} EVENT</div><h2 id="evt">${esc(ev.title)}</h2></div></div>
<p>${esc(ev.text)}</p>
<div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
${ev.flare ? `<div class="realline"><span class="tagreal">REAL NASA DATA</span><span>Class ${esc(ev.flare.class)} flare, recorded on ${esc(date)}</span></div>` : ""}
<div class="fact"><b>Did you know? This is real!</b><span>${esc(ev.realFact)}</span></div>
<button class="btn">Got it! Back to the base</button></section>`;
    document.body.appendChild(veil);
    const btn = veil.querySelector("button");
    btn.focus();
    return new Promise((done) => btn.addEventListener("click", () => { sfx("click"); veil.remove(); done(); }));
  }

  draw();
}

// ---------- End screen ----------

function showEnd(g, site, facts) {
  const won = g.status === "won";
  const empty = RES.find((k) => g[k] <= 0) || "power";
  const stats = `<div class="stats"><div class="stat"><b style="color:var(--gold)">${g.sol}</b><span>sols survived</span></div><div class="stat"><b style="color:var(--science)">${g.science}</b><span>science points</span></div><div class="stat"><b style="color:var(--oxygen)">${facts}</b><span>real facts seen</span></div></div>`;
  if (won) {
    sfx("good");
    menu(`<svg class="badge" viewBox="0 0 150 150" role="img" aria-label="Junior Astronaut badge"><path d="M75 6l16 12 20-2 8 18 18 8-2 20 12 16-12 16 2 20-18 8-8 18-20-2-16 12-16-12-20 2-8-18-18-8 2-20L3 78l12-16-2-20 18-8 8-18 20 2z" fill="#ffc93c"/><circle cx="75" cy="78" r="46" fill="#0b1026"/><path d="M75 44c12 10 16 26 12 42H63c-4-16 0-32 12-42z" fill="#eef1ff"/><circle cx="75" cy="66" r="6" fill="#5cc8ff"/><path d="M63 80l-10 12h12zM87 80l10 12H85z" fill="#ff9a5c"/><path d="M69 90h12l-6 16z" fill="#ffc93c"/></svg>
<div class="kicker" style="text-align:center">MISSION COMPLETE</div><h1 style="text-align:center">Junior Astronaut</h1>
<p style="text-align:center">You kept Maya, Leo and Zuri safe at ${SITES[site].place} for 30 sols. The supply ship has landed!</p>${stats}
<div class="row"><button class="btn ghost" data-go="sites">Try the other world</button><button class="btn" id="again">Play again</button></div>`);
  } else {
    sfx("warning");
    menu(`<div class="kicker" style="color:var(--muted)">MISSION OVER ON SOL ${g.sol}</div><h1>Time to head home</h1>
<p class="reason">${esc(g.lossReason || "The mission ended early.")}</p>
<div class="note"><div><b>Tip for next time</b>${TIPS[empty]}</div></div>${stats}
<div class="row"><button class="btn ghost" data-go="sites">Change world</button><button class="btn" id="again">Try again</button></div>`);
  }
  bindGo();
  app.querySelector("#again").addEventListener("click", () => { sfx("click"); showBriefing(site); });
}

showTitle();
