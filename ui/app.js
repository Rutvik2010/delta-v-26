// Delta-V 26 UI entry: title, site pick, briefing, credits and end screens.
// The game screen itself is in play.js. The rules come from /engine.

import { getStars, getTasks } from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";
import { playSfx } from "./audio.js";
import { astro, sceneSvg, skyBackdrop, esc } from "./scene.js";
import { startGame, SITES, CREW, RES } from "./play.js";

const app = document.getElementById("app");
const sfx = (name) => { try { playSfx(name); } catch (e) { /* sound is optional */ } };
const TIPS = {
  power: "Rest when power gets low. Every machine at the base needs power to run.",
  oxygen: "Run the oxygen plant before the air gets thin. It needs power, so keep the batteries charged.",
  shielding: "Check the Sun forecast. Pile soil on the base before a storm arrives.",
  food: "Send someone to the garden often. Resting uses up food too.",
};
const STAR = "M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z";

function menu(inner, wide) {
  app.innerHTML = `<main class="menu">${skyBackdrop()}<section class="card${wide ? " wide" : ""}">${inner}</section></main>`;
}

function bindGo() {
  const go = { title: showTitle, sites: showSites, credits: showCredits };
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { sfx("click"); go[b.dataset.go](); }));
}

const crewCards = (withAbout) => `<div class="crewrow">${CREW.map((c) => `<div class="crewcard"><div class="fig">${astro(c.color)}</div><b style="color:${c.color}">${c.name}</b><i>${c.job}</i>${withAbout ? `<span>${c.about}</span>` : ""}</div>`).join("")}</div>`;

function showTitle() {
  menu(`<div class="kicker">NASA SPACE APPS 2026</div>
<h1>Delta-V 26</h1>
<p>Junior Astronaut Mission Trainer. Lead a crew of three on the Moon or Mars. Every choice has a cost!</p>
${crewCards(false)}
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
${crewCards(true)}
<div class="note"><div><b>How to play</b>Tap a building, then pick who to send. Each astronaut is best at their own job, and gets tired if they work two sols in a row. Win the little task for a bonus!</div></div>
<div class="note"><div>${plan
    ? `<b>The Sun in this mission is real</b>Every Sun storm you face really happened in May 2024. NASA recorded them all.`
    : `<b>Practice weather</b>The real NASA records could not be loaded, so this mission uses made-up Sun weather.`}</div></div>
<div class="row"><button class="btn ghost" data-go="sites">Back</button><button class="btn" id="go">Start the mission</button></div>`);
  bindGo();
  app.querySelector("#go").addEventListener("click", () => { sfx("good"); startGame(app, site, plan, showEnd); });
}

async function showCredits() {
  let list = [];
  try { list = await (await fetch("./content/attribution.json")).json(); } catch (e) { /* show the basics only */ }
  menu(`<h1>Credits</h1><p>Built for NASA Space Apps 2026. Sun weather comes from NASA's DONKI space weather database.</p>
<ul class="credits"><li><a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener">NASA CCMC DONKI: solar flare records</a></li>${list.filter((a) => String(a.url).startsWith("https://")).map((a) => `<li><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a></li>`).join("")}</ul>
<div class="row"><button class="btn ghost" data-go="title">Back</button></div>`);
  bindGo();
}

function showEnd(g, site, facts) {
  const won = g.status === "won";
  const empty = RES.find((k) => g[k] <= 0) || "power";
  const tasks = getTasks(g).filter((t) => t.status === "done").length;
  const stars = getStars(g);
  const stats = `<div class="stats"><div class="stat"><b style="color:var(--gold)">${g.sol}</b><span>sols survived</span></div><div class="stat"><b style="color:var(--food)">${tasks} / 3</b><span>tasks done</span></div><div class="stat"><b style="color:var(--science)">${(g.stats && g.stats.scienceEarned) || 0}</b><span>science earned</span></div><div class="stat"><b style="color:var(--oxygen)">${facts}</b><span>real facts seen</span></div></div>`;
  if (won) {
    sfx("good");
    menu(`<div class="starrow" role="img" aria-label="${stars} out of 3 stars">${[1, 2, 3].map((n) => `<svg class="star${n <= stars ? " on" : ""}" style="animation-delay:${n * 0.25}s" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`).join("")}</div>
<div class="kicker" style="text-align:center">MISSION COMPLETE</div><h1 style="text-align:center">Junior Astronaut</h1>
<p style="text-align:center">You kept Maya, Leo and Zuri safe at ${SITES[site].place} for 30 sols. The supply ship has landed!${stars < 3 ? " Finish all three Mission Control tasks to earn 3 stars." : ""}</p>${stats}
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
