// Landing intro: the crew ride a rocket from Earth and touch down at the base site.
// Three scenes on one CSS timeline (see ui3d/landing.css): liftoff, cruise through space, landing.
// Everything is transform/opacity animation, so it stays smooth. Skippable at any time; with
// reduced motion it jumps straight to the last frame.
import { esc } from "../parts.js";

const CREW = [["Maya", "#F79A6B"], ["Leo", "#8ED16C"], ["Zuri", "#B99AF5"]];

// The rocket, pointing up. Windows show the three crew helmets.
const rocket = (id = "") => `<svg ${id} class="la-rocket-svg" width="150" height="330" viewBox="-75 -175 150 330" aria-hidden="true">
<path d="M-34 70 L-62 120 L-62 140 L-30 112Z" fill="#F26A1B" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"/>
<path d="M34 70 L62 120 L62 140 L30 112Z" fill="#F26A1B" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"/>
<path d="M-34 -100 C-34 -140 -16 -164 0 -172 C16 -164 34 -140 34 -100 L34 118 L-34 118Z" fill="#F7F8F9" stroke="#1E2430" stroke-width="6" stroke-linejoin="round"/>
<path d="M-34 -100 C-34 -140 -16 -164 0 -172 C16 -164 34 -140 34 -100Z" fill="#F26A1B" stroke="#1E2430" stroke-width="6" stroke-linejoin="round"/>
<path d="M-26 -120 C-24 -138 -14 -152 -4 -158" fill="none" stroke="#FFB27A" stroke-width="5" stroke-linecap="round"/>
<rect x="-34" y="74" width="68" height="16" fill="#F26A1B" stroke="#1E2430" stroke-width="5"/>
${CREW.map(([, c], i) => `<g transform="translate(0 ${-72 + i * 46})"><circle r="17" fill="#13211D" stroke="#1E2430" stroke-width="5"/><circle r="11" fill="${c}"/><rect x="-8" y="-6" width="16" height="9" rx="4.5" fill="#1E2430"/><path d="M-4 -3h5" stroke="#9FD8FF" stroke-width="2" stroke-linecap="round"/></g>`).join("")}
<path d="M-22 118 L-18 134 L18 134 L22 118Z" fill="#7C8592" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"/>
<g class="la-legs" stroke="#1E2430" stroke-width="5" stroke-linecap="round"><path d="M-30 100 L-58 150 M-66 150 L-50 150 M30 100 L58 150 M50 150 L66 150"/></g>
<rect x="-16" y="40" width="32" height="32" rx="6" fill="#13211D" stroke="#1E2430" stroke-width="4"/><rect class="la-hatch" x="-16" y="40" width="32" height="32" rx="6" fill="#C9CED6" stroke="#1E2430" stroke-width="4"/>
</svg>`;

// A flame that flickers. Placed under the rocket nozzle.
const flame = (cls) => `<svg class="la-flame ${cls}" width="90" height="190" viewBox="-45 0 90 190" aria-hidden="true">
<path d="M-26 0 C-30 60 -12 120 0 186 C12 120 30 60 26 0Z" fill="#F26A1B"/>
<path d="M-17 0 C-19 44 -8 92 0 140 C8 92 19 44 17 0Z" fill="#F5C518"/>
<path d="M-8 0 C-9 26 -4 56 0 84 C4 56 9 26 8 0Z" fill="#FFF6C8"/></svg>`;

// A little astronaut (same toy style as the base screen)
const astro = (c) => `<svg width="46" height="68" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb" stroke="#1E2430" stroke-width="2"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="12" y="34" width="20" height="5" fill="${c}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa" stroke="#1E2430" stroke-width="2"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#E9B44C" stroke="#1E2430" stroke-width="1.5"/></svg>`;

const planet = (mars, cls) => mars
  ? `<svg class="${cls}" width="300" height="300" viewBox="-150 -150 300 300" aria-hidden="true"><circle r="140" fill="#D9774A" stroke="#1E2430" stroke-width="6"/><path d="M-120 -40 C-60 -70 20 -30 120 -60" fill="none" stroke="#B25A33" stroke-width="16" stroke-linecap="round"/><path d="M-130 40 C-50 20 30 60 125 30" fill="none" stroke="#B25A33" stroke-width="12" stroke-linecap="round"/><circle cx="40" cy="-80" r="16" fill="#B25A33"/><circle cx="-50" cy="70" r="20" fill="#C76A40"/><path d="M20 -140 A140 140 0 0 1 20 140 A110 140 0 0 0 20 -140Z" fill="#0B1020" opacity=".3"/></svg>`
  : `<svg class="${cls}" width="300" height="300" viewBox="-150 -150 300 300" aria-hidden="true"><circle r="140" fill="#C9CED6" stroke="#1E2430" stroke-width="6"/><circle cx="-40" cy="-50" r="30" fill="#A9AEBC"/><circle cx="50" cy="20" r="22" fill="#A9AEBC"/><circle cx="-20" cy="70" r="36" fill="#B4B9C6"/><circle cx="70" cy="-70" r="14" fill="#A9AEBC"/><path d="M20 -140 A140 140 0 0 1 20 140 A110 140 0 0 0 20 -140Z" fill="#0B1020" opacity=".3"/></svg>`;

const earth = (cls) => `<svg class="${cls}" width="300" height="300" viewBox="-150 -150 300 300" aria-hidden="true"><circle r="140" fill="#3D7BD9" stroke="#1E2430" stroke-width="6"/><path d="M-100 -60 C-60 -100 -10 -80 -20 -40 C-30 0 -80 10 -90 50 C-110 20 -120 -20 -100 -60Z" fill="#5CBF5A"/><path d="M30 -110 C70 -100 100 -60 90 -20 C60 -40 30 -60 30 -110Z" fill="#5CBF5A"/><path d="M10 40 C50 30 90 50 80 100 C50 110 20 90 10 40Z" fill="#5CBF5A"/><path d="M20 -140 A140 140 0 0 1 20 140 A110 140 0 0 0 20 -140Z" fill="#0B1020" opacity=".35"/></svg>`;

export function mount(root, ctx) {
  const mars = ctx.store.site === "mars";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const where = mars ? "Jezero crater" : "Shackleton crater";
  const trip = mars ? "Seven months later…" : "Three days later…";

  root.innerHTML = `<div id="la" class="${mars ? "mars" : "moon"}${reduced ? " still" : ""}" role="region" aria-label="The crew fly to ${mars ? "Mars" : "the Moon"}">
<p class="la-sr" aria-live="polite" id="la-live"></p>

<div class="la-scene la-a" aria-hidden="true">
  <div class="la-sky-a"></div>
  <div class="la-clouds"><i></i><i></i><i></i></div>
  <div class="la-ground-a"></div>
  <svg class="la-tower" width="70" height="330" viewBox="0 0 70 330"><path d="M10 330 V20 M60 330 V20 M10 20 H60" stroke="#1E2430" stroke-width="6" fill="none"/><path d="M10 40 L60 80 M60 80 L10 120 M10 120 L60 160 M60 160 L10 200 M10 200 L60 240 M60 240 L10 280 M10 280 L60 320" stroke="#F26A1B" stroke-width="4" fill="none"/><rect x="0" y="12" width="70" height="12" rx="3" fill="#7C8592" stroke="#1E2430" stroke-width="4"/></svg>
  <div class="la-smoke">${Array.from({ length: 10 }, (_, i) => `<i style="--i: ${i}; --s: ${i % 2 ? 1 : -1}"></i>`).join("")}</div>
  <div class="la-rocket la-rocket-a">${flame("fa")}${rocket()}</div>
  <div class="la-count" ><span>3</span><span>2</span><span>1</span><span class="go">Liftoff!</span></div>
</div>

<div class="la-scene la-b" aria-hidden="true">
  <div class="la-stars s1"></div><div class="la-stars s2"></div><div class="la-stars s3"></div>
  ${earth("la-earth-b")}
  ${planet(mars, "la-dest-b")}
  <div class="la-rocket la-rocket-b">${flame("fb")}${rocket()}</div>
  <p class="la-cap la-cap-b">${trip}</p>
</div>

<div class="la-scene la-c" aria-hidden="true">
  <div class="la-stars still"></div>
  ${mars ? `<div class="la-sun-c"></div>` : earth("la-earth-c")}
  <svg class="la-ground-c" viewBox="0 0 1600 360" preserveAspectRatio="none"><path d="M0 60 C200 30 380 70 600 50 C820 30 1000 64 1220 44 C1400 30 1500 50 1600 40 V360 H0Z" class="g1"/><path d="M0 140 C260 120 520 150 800 132 C1060 116 1340 146 1600 128 V360 H0Z" class="g2"/>
    <ellipse cx="260" cy="200" rx="90" ry="20" class="pit"/><ellipse cx="1320" cy="230" rx="120" ry="26" class="pit"/><ellipse cx="1050" cy="300" rx="70" ry="14" class="pit"/></svg>
  <div class="la-pad-c"></div>
  <div class="la-dust">${Array.from({ length: 12 }, (_, i) => `<i style="--i: ${i}; --s: ${i % 2 ? 1 : -1}"></i>`).join("")}</div>
  <div class="la-rocket la-rocket-c">${flame("fc")}${rocket()}</div>
  <div class="la-ladder"></div>
  ${CREW.map(([n, c], i) => `<div class="la-crew" style="--i: ${i}; --x: ${[-190, -110, 130][i]}px"><span>${n}</span>${astro(c)}</div>`).join("")}
  <svg class="la-flag" width="60" height="110" viewBox="0 0 60 110"><path d="M8 108 V8" stroke="#1E2430" stroke-width="5" stroke-linecap="round"/><path d="M10 8 h44 l-10 14 l10 14 h-44z" fill="#F5C518" stroke="#1E2430" stroke-width="4" stroke-linejoin="round"/><text x="30" y="27" text-anchor="middle" font-family="Lexend, sans-serif" font-weight="800" font-size="12" fill="#1E2430">DV26</text></svg>
  <p class="la-cap la-cap-c">Touchdown! Welcome to ${esc(where)}.</p>
</div>

<button type="button" class="la-skip" id="la-skip">Skip</button>
<button type="button" class="la-go" id="la-go">Start sol 1</button>
</div>`;

  const stageEl = ctx.stage;
  if (stageEl) stageEl.classList.add("bleed");
  const live = root.querySelector("#la-live");
  const go = root.querySelector("#la-go");
  let left = false;
  const start = () => { if (left) return; left = true; ctx.sfx("click"); ctx.go("game"); };
  root.querySelector("#la-skip").addEventListener("click", start);
  go.addEventListener("click", start);

  // story beats for screen readers, plus the two sound moments
  const say = (t) => { live.textContent = t; };
  if (reduced) {
    say("The crew landed safely at " + where + ".");
    go.focus();
  } else {
    say("Three, two, one, liftoff!");
    later(() => ctx.sfx("flare"), 1200);
    later(() => say(trip), 3200);
    later(() => ctx.sfx("flare"), 6600);
    later(() => { ctx.sfx("good"); say("Touchdown! Welcome to " + where + "."); }, 9000);
    later(() => go.focus({ preventScroll: true }), 11000);
    root.querySelector("#la-skip").focus({ preventScroll: true });
  }
  const onKey = (e) => {
    if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      start();
    }
  };
  document.addEventListener("keydown", onKey);
  return () => { timers.forEach(clearTimeout); document.removeEventListener("keydown", onKey); if (stageEl) stageEl.classList.remove("bleed"); };
}
