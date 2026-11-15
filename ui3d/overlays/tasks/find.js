// Task: spot the hidden ice (a water rock on Mars) 3 times. Every rock looks plain; the right one only
// glints for a moment now and then. A wrong pick costs time. Rocks are buttons.
const SHAPES = [
  { p: "M20 72 C14 52 30 30 52 28 C76 24 100 38 102 60 C104 80 82 88 60 86 C40 86 24 84 20 72Z", f: "M40 44 C50 36 64 34 74 38" },
  { p: "M16 66 C18 42 40 24 62 32 C84 38 104 52 98 70 C92 86 64 90 42 86 C26 82 14 78 16 66Z", f: "M36 40 L56 34" },
  { p: "M24 78 C12 62 26 36 46 34 C60 20 90 28 98 48 C108 66 96 84 74 86 C54 90 34 90 24 78Z", f: "M54 32 C66 28 80 32 88 42" },
  { p: "M18 68 L32 40 L62 30 L94 44 L100 66 L78 86 L40 86Z", f: "M32 40 L62 30 L94 44" },
];
const SPOTS = [
  [340, 300, 1], [460, 260, 0.8], [740, 270, 0.85], [870, 350, 1], [250, 420, 1.15], [400, 380, 1],
  [560, 330, 0.9], [700, 380, 1.05], [860, 430, 1.15], [520, 440, 1.2], [680, 470, 1.1], [1000, 460, 1],
];
const GREYS = ["#8D93A3", "#7C8292", "#9CA1B0"];
const SPARK = "M86 26l3 9 9 3-9 3-3 9-3-9-9-3 9-3zM36 50l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM70 64l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z";

export function mount(api) {
  const mars = api.mars;
  const thing = mars ? "water rock" : "shiny ice";
  const ROUNDS = 3;
  // pick three different rocks to hide the sparkle in
  const iceAt = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
  let round = 1;
  let miss = false;

  api.hx.innerHTML = `<span style="font-weight: 700; font-size: 16px">Round</span><span id="fd-pips" style="display: flex; gap: 8px"></span>`;
  api.hx.style.marginRight = "8px";
  api.body.innerHTML =
    `<div style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: #0B0F1C; overflow: hidden">` +
    `<svg aria-hidden="true" width="1172" height="548" viewBox="0 0 1172 548" style="position: absolute; left: 0; top: 0">` +
    `<g fill="#F3F4F6" opacity="0.6"><circle class="dv-twinkle" cx="80" cy="30" r="1.4"></circle><circle class="dv-twinkle-b" cx="420" cy="20" r="1"></circle><circle class="dv-twinkle" cx="760" cy="36" r="1.4"></circle><circle class="dv-twinkle-b" cx="1100" cy="24" r="1.2"></circle></g>` +
    `<path d="M0 90 C180 60 360 84 560 70 C760 56 960 80 1172 66 L1172 140 C960 160 760 130 560 146 C360 160 180 136 0 150Z" fill="#C9CCD6"></path>` +
    `<path d="M0 150 C180 136 360 160 560 146 C760 130 960 160 1172 140 L1172 200 C900 190 600 210 300 196 C180 190 80 196 0 200Z" fill="#6B7180"></path>` +
    `<rect x="0" y="196" width="1172" height="352" fill="#1A1F2E"></rect>` +
    `<path d="M120 548 L560 210 L700 210 L1100 548Z" fill="#3A4258" opacity="0.55"></path>` +
    `<path d="M260 548 L590 230 L670 230 L960 548Z" fill="#525C76" opacity="0.5"></path>` +
    `<g fill="#2A3044"><ellipse cx="160" cy="300" rx="50" ry="10"></ellipse><ellipse cx="1040" cy="340" rx="60" ry="12"></ellipse><ellipse cx="90" cy="470" rx="40" ry="8"></ellipse></g>` +
    `<g fill="none" stroke="#3A4258" stroke-width="3" stroke-linecap="round"><path d="M520 530 l8 -14 M548 520 l8 -14 M560 496 l8-14 M588 486 l8-14"></path></g>` +
    `<g class="dv-breathe" transform="translate(626 210)"><circle cx="0" cy="-40" r="14" fill="${api.color || "#B99AF5"}" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-44" width="20" height="10" rx="5" fill="#1E2430"></rect><circle class="dv-glow" cx="10" cy="-46" r="4" fill="#F5C518" stroke="#1E2430" stroke-width="2"></circle><rect x="-12" y="-26" width="24" height="30" rx="7" fill="${api.color || "#B99AF5"}" stroke="#1E2430" stroke-width="3"></rect><path d="M12 -18 l18 6" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path><rect x="28" y="-18" width="16" height="10" rx="2" fill="#13211D" stroke="#1E2430" stroke-width="2"></rect></g>` +
    `</svg>` +
    `<div style="position: absolute; left: 20px; top: 216px; width: 220px; padding: 12px 14px; border-radius: 12px; background: #13211D; box-shadow: inset 0 0 0 3px #2B3833; color: #A8F5C2; font-size: 14px; line-height: 1.45"><b style="color: #E4FFEC; font-size: 15px">Zuri's ${mars ? "rock" : "ice"} scanner</b><br>${mars ? "Water clue" : "Cold spot"}: <b class="dv-blink" style="color: #E4FFEC">nearby!</b><br>One rock glints now and then.</div>` +
    `<p style="position: absolute; right: 20px; top: 222px; margin: 0; padding: 8px 12px; border-radius: 10px; background: rgba(11,15,28,0.85); color: #C9D2E3; font-size: 14px; max-width: 220px; line-height: 1.4">${mars ? "Jezero was a lake long ago. Rocks that touched water look different!" : "This part of the crater never sees the Sun. It's extra cold!"}</p>` +
    `<div id="fd-rocks"></div>` +
    `</div>`;
  api.foot.innerHTML =
    `<div role="status" aria-live="polite" style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 16px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p id="fd-hint" style="margin: 0; font-size: 17px; font-weight: 700"></p>` +
    `<p style="margin: 2px 0 0; font-size: 15px; color: #4A5363">Wrong rocks cost time. Win: <b style="color: #1F7A35">extra science</b>.</p></div>`;

  const $ = (s) => (api.body ? api.body.querySelector(s) : null);
  const hintEl = api.foot ? api.foot.querySelector("#fd-hint") : null;
  const say = (t) => { if (hintEl) hintEl.textContent = t; };
  const rocksEl = $("#fd-rocks");

  function pips() {
    const el = api.hx ? api.hx.querySelector("#fd-pips") : null;
    if (!el) return;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", round > ROUNDS ? "All 3 rounds done" : "Round " + round + " of 3");
    el.innerHTML = [1, 2, 3].map((n) => `<span style="width: 22px; height: 22px; border-radius: 50%; border: 3px solid #1E2430; background: ${n < round ? "#5CBF5A" : (n === round ? "#F5C518" : "#F7F8F9")}"></span>`).join("");
  }

  function renderRocks() {
    const target = round > ROUNDS ? -1 : iceAt[round - 1];
    rocksEl.innerHTML = SPOTS.map((s, i) => {
      const ice = i === target;
      const sh = SHAPES[i % 4];
      const w = Math.round(120 * s[2]), h = Math.round(100 * s[2]);
      return `<button type="button" data-r="${i}" class="dv-key dv-pop dv-d${(i % 8) + 1}" aria-label="Rock ${i + 1}" style="position: absolute; left: ${s[0] - w / 2}px; top: ${s[1] - h / 2}px; min-width: 44px; min-height: 44px; padding: 0; border: none; background: transparent; cursor: pointer; border-radius: 16px">` +
        `<svg aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 120 100"><ellipse cx="60" cy="90" rx="46" ry="7" fill="#0B0F1C" opacity="0.6"></ellipse><path${ice ? ' data-ice' : ""} d="${sh.p}" fill="${GREYS[i % 3]}" stroke="#1E2430" stroke-width="5" stroke-linejoin="round" style="transition: fill 150ms ease"></path><path d="${sh.f}" fill="none" stroke="#B8BEC8" stroke-width="4" stroke-linecap="round"></path>${ice ? `<path data-spark d="${SPARK}" fill="#FFFFFF" opacity="0" style="transition: opacity 150ms ease"></path>` : ""}</svg>` +
        "" +
        `</button>`;
    }).join("");
    // The target rock is announced as sparkling only while it glints (see glint below).
    glint(target, 900);
  }

  // the hidden rock glints briefly, then looks plain again; the wait between glints is random
  let glintT = 0;
  function glint(target, wait) {
    clearTimeout(glintT);
    glintT = api.later(() => {
      if (api.done || round > ROUNDS || target !== iceAt[round - 1]) return;
      const body = rocksEl ? rocksEl.querySelector('[data-r="' + target + '"] [data-ice]') : null;
      const spark = rocksEl ? rocksEl.querySelector('[data-r="' + target + '"] [data-spark]') : null;
      if (!body) return;
      body.setAttribute("fill", "#BDEBFF");
      // screen readers hear "sparkling" only while it glints, like sighted players see it
      const btn = rocksEl ? rocksEl.querySelector('[data-r="' + target + '"]') : null;
      if (btn) btn.setAttribute("aria-label", "Rock " + (target + 1) + ", sparkling " + thing + "!");
      if (spark) spark.setAttribute("opacity", "1");
      api.sfx("glint");
      api.later(() => {
        if (api.done) return;
        if (body) body.setAttribute("fill", GREYS[target % 3]);
        if (btn) btn.setAttribute("aria-label", "Rock " + (target + 1));
        if (spark) spark.setAttribute("opacity", "0");
        if (round <= ROUNDS && target === iceAt[round - 1]) glint(target, 900 + Math.random() * 1300); // only while this rock is still the one
      }, Math.max(260, 520 - round * 80) + (api.easy ? 250 : 0)); // the glint gets shorter each round
    }, wait);
  }

  function pick(i) {
    if (api.done || round > ROUNDS) return;
    api.sfx("click");
    const btn = rocksEl ? rocksEl.querySelector('[data-r="' + i + '"]') : null;
    if (i === iceAt[round - 1]) {
      api.good();
      round += 1;
      miss = false;
      pips();
      if (round > ROUNDS) { say("You found all 3 " + (mars ? "water rocks" : "pieces of ice") + "!"); api.win(); return; }
      renderRocks();
      say("Round " + round + " of 3: watch for the next glint!");
      const first = rocksEl ? rocksEl.querySelector('[data-r="0"]') : null;
      if (first) first.focus();
    } else {
      miss = true;
      api.penalty(1.5);
      api.sfx("miss");
      say("Just plain rock! That cost you time. Watch for the glint.");
      if (btn) api.swap(btn, "dv-shake-a", "dv-shake-b");
    }
  }

  if (rocksEl) {
    rocksEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-r]");
      if (b) pick(Number(b.getAttribute("data-r")));
    });
  }
  pips();
  renderRocks();
  say("Round 1 of 3: one rock glints for a moment. Watch closely!");
  api.focus(rocksEl ? rocksEl.querySelector('[data-r="0"]') : null);
}
