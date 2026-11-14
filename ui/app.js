// Delta-V 26 UI entry: title, site pick, briefing, credits and end screens.
// The game screen itself is in play.js. The rules come from /engine.

import { getStars, getTasks } from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";
import { playSfx } from "./audio.js";
import { astro, sceneSvg, esc } from "./scene.js";
import { startGame, SITES, CREW, RES } from "./play.js";
import { addTooltips } from "../content/tooltips.js";

const app = document.getElementById("app");
const sfx = (name) => { try { playSfx(name); } catch (e) { /* sound is optional */ } };

let lessonsData = null;
async function getLessons() {
  if (lessonsData) return lessonsData;
  try {
    const res = await fetch("./content/lessons.json");
    if (res.ok) lessonsData = await res.json();
  } catch (e) { /* ignore */ }
  return lessonsData || {};
}

const STAR = "M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z";

let navSeq = 0;
function menu(inner, wide) {
  app.innerHTML = `<main class="menu manual-page${wide ? " wide" : ""}">${inner}</main>`;
  try { addTooltips(app); } catch (e) {}
}

function bindGo() {
  const go = { title: showTitle, sites: showSites, credits: showCredits };
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { sfx("click"); go[b.dataset.go](); }));
}

const ROLE_CODES = { Engineer: "ENG", Botanist: "BOT", Scientist: "SCI" };

const crewCards = (withAbout) => `<div class="crewrow">${CREW.map((c) => (
  `<div class="crewcard">` +
    `<div class="crewhead">` +
      `<span class="swatch" style="background:${c.color}" aria-hidden="true"></span>` +
      `<span class="rolecode mono">${ROLE_CODES[c.job] || "CREW"}</span>` +
    `</div>` +
    `<div class="fig" aria-hidden="true">${astro(c.color)}</div>` +
    `<b>${c.name}</b>` +
    `<i>${c.job}</i>` +
    `${withAbout ? `<span>${c.about}</span>` : ""}` +
  `</div>`
)).join("")}</div>`;

function showTitle() {
  const seq = ++navSeq;
  menu(`<div class="kicker">NASA SPACE APPS 2026 // FLIGHT MANUAL</div>
<h1>Delta-V 26</h1>
<p>Junior Astronaut Mission Trainer. Lead a crew of three on the Moon or Mars. Every choice has a cost!</p>
<h2>1.0 CREW COMPLEMENT</h2>
${crewCards(false)}
<div class="row"><button class="btn" data-go="sites">Start mission</button><button class="btn ghost" data-go="credits">Credits</button></div>`);
  bindGo();
}

function showSites() {
  const seq = ++navSeq;
  menu(`<div class="kicker">MISSION PLANNING // SITE SELECTION</div>
<h1>1.0 Where will you land?</h1>
<div class="sites">${["moon", "mars"].map((s) => `<button class="site" data-site="${s}">${sceneSvg(s, SITES[s].place)}<b>${SITES[s].name}</b><span>${SITES[s].place}. ${SITES[s].blurb}</span></button>`).join("")}</div>
<div class="row"><button class="btn ghost" data-go="title">Back</button></div>`, true);
  app.querySelectorAll("[data-site]").forEach((b) => b.addEventListener("click", () => { sfx("click"); showBriefing(b.dataset.site); }));
  bindGo();
}

async function showBriefing(site) {
  const seq = ++navSeq;
  const s = SITES[site];
  const plan = await loadRealWeather();
  if (seq !== navSeq) return;
  menu(`<div class="kicker">MISSION SPECIFICATION // FLIGHT DIRECTIVE</div>
<h1>1.0 ${s.mission}</h1>
<p>${s.story}</p>
<h2>2.0 CREW ASSIGNMENT</h2>
${crewCards(true)}
<h2>3.0 OPERATIONAL PROCEDURES</h2>
<div class="note"><div><b>Standard Operating Procedure</b>Tap a building, then pick who to send. Each astronaut is best at their own job, and gets tired if they work two sols in a row. Win the little task for a bonus!</div></div>
<div class="note"><div>${plan
    ? `<b>Telemetry Verification</b>Every solar flare you face was recorded by NASA DONKI in autumn 2026.`
    : `<b>Simulated Atmospheric Data</b>The real NASA records could not be loaded, so this mission uses made-up Sun weather.`}</div></div>
<div class="row"><button class="btn ghost" data-go="sites">Back</button><button class="btn" id="go">Start the mission</button></div>`);
  bindGo();
  app.querySelector("#go").addEventListener("click", () => { sfx("good"); startGame(app, site, plan, showEnd); });
}

async function showCredits() {
  const seq = ++navSeq;
  let list = [];
  try { list = await (await fetch("./content/attribution.json")).json(); } catch (e) { /* show the basics only */ }
  if (seq !== navSeq) return;
  menu(`<div class="kicker">DOCUMENTATION // ATTRIBUTION</div>
<h1>1.0 Credits</h1>
<p>Built for NASA Space Apps 2026. Sun weather comes from NASA's DONKI space weather database.</p>
<h2>2.0 DATA SOURCES & ASSETS</h2>
<ul class="credits"><li><a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener">NASA CCMC DONKI: solar flare records</a></li>${list.filter((a) => String(a.url).startsWith("https://")).map((a) => `<li><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a></li>`).join("")}</ul>
<div class="row"><button class="btn ghost" data-go="title">Back</button></div>`);
  bindGo();
}

async function showEnd(g, site, facts) {
  const seq = ++navSeq;
  const lessons = await getLessons();
  if (seq !== navSeq) return;
  const won = g.status === "won";
  const empty = RES.find((k) => g[k] <= 0) || "power";
  const tasks = getTasks(g).filter((t) => t.status === "done").length;
  const stars = getStars(g);
  const stats = `<div class="stats"><div class="stat"><b style="color:var(--amber)">${g.sol}</b><span>sols survived</span></div><div class="stat"><b style="color:var(--green)">${tasks} / 3</b><span>tasks done</span></div><div class="stat"><b style="color:var(--red)">${(g.stats && g.stats.scienceEarned) || 0}</b><span>science earned</span></div><div class="stat"><b style="color:var(--blue)">${facts}</b><span>real facts seen</span></div></div>`;
  if (won) {
    sfx("good");
    const wonList = lessons?.won || [];
    const lesson = wonList[Math.floor(Math.random() * wonList.length)] || "Great teamwork keeping your crew safe!";
    menu(`<div class="starrow" role="img" aria-label="${stars} out of 3 stars">${[1, 2, 3].map((n) => `<svg class="star${n <= stars ? " on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`).join("")}</div>
<div class="kicker" style="text-align:center">MISSION STATUS // 30 SOLS REACHED</div>
<h1 style="text-align:center">1.0 Junior Astronaut</h1>
<p style="text-align:center">You kept Maya, Leo and Zuri safe at ${SITES[site].place} for 30 sols. The supply ship has landed!${stars < 3 ? " Finish all three Mission Control tasks to earn 3 stars." : ""}</p>
<h2>2.0 TELEMETRY SUMMARY</h2>
${stats}
<h2>3.0 MISSION DEBRIEFING</h2>
<div class="note"><div><b>NASA Mission Lesson</b>${esc(lesson)}</div></div>
<div class="row"><button class="btn ghost" data-go="sites">Try the other world</button><button class="btn" id="again">Play again</button></div>`);
  } else {
    sfx("warning");
    const lossKey = "lost_" + empty;
    const lossList = lessons?.[lossKey] || [];
    const tip = lossList[Math.floor(Math.random() * lossList.length)] || "Keep your supplies balanced.";
    menu(`<div class="kicker" style="color:var(--red)">CRITICAL FAILURE // SOL ${g.sol}</div>
<h1>1.0 Mission Terminated</h1>
<p class="reason">${esc(g.lossReason || "The mission ended early.")}</p>
<h2>2.0 TELEMETRY RECORD</h2>
${stats}
<h2>3.0 POST-FLIGHT ANALYSIS</h2>
<div class="note"><div><b>NASA Mission Lesson</b>${esc(tip)}</div></div>
<div class="row"><button class="btn ghost" data-go="sites">Change world</button><button class="btn" id="again">Try again</button></div>`);
  }
  bindGo();
  app.querySelector("#again").addEventListener("click", () => { sfx("click"); showBriefing(site); });
}

showTitle();

export { showTitle, showTitle as mount };
