// Task: a marker sweeps across a meter; dig when it is in the green zone. A miss spills a scoop.
// The marker speeds up and the zone shrinks with every good scoop.
let GOAL = 8; // set per game in mount (Easy: 6)

export function mount(api) {
  GOAL = api.easy ? 6 : 8;
  let count = 0;
  // Real shield numbers when the engine can tell us; otherwise the line is left out.
  let shieldNow = null, shieldGain = 0;
  try {
    const st = api.ctx.store.state;
    const act = api.ctx.engine.getActions(st).find((x) => x.id === "reinforce_shield");
    shieldNow = st.shielding;
    shieldGain = (act && act.gain && act.gain.shielding) || 0;
  } catch (err) { shieldNow = null; }
  const bonus = 5;

  api.body.innerHTML =
    `<div style="flex-grow: 1; display: flex; gap: 20px; min-height: 0">` +
    `<div style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: #0E1424; overflow: hidden">` +
    `<svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 812 548" preserveAspectRatio="xMidYMax slice" style="position: absolute; left: 0; top: 0">` +
    `<g fill="#F3F4F6" opacity="0.6"><circle class="dv-twinkle" cx="40" cy="40" r="1.5"></circle><circle class="dv-twinkle-b" cx="300" cy="26" r="1.2"></circle><circle class="dv-twinkle" cx="520" cy="60" r="1"></circle><circle class="dv-twinkle-b" cx="760" cy="120" r="1.5"></circle><circle class="dv-twinkle" cx="180" cy="120" r="1"></circle></g>` +
    `<g transform="translate(70 70)"><circle r="30" fill="#F5C518" stroke="#1E2430" stroke-width="4"></circle><g class="dv-spin" stroke="#F5C518" stroke-width="4" stroke-linecap="round"><path d="M0 -40v-10M0 40v10M-40 0h-10M40 0h10M-28 -28l-7-7M28 28l7 7M-28 28l-7 7M28 -28l7-7"></path></g></g>` +
    `<g class="dv-march" stroke="#F26A1B" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 8" fill="none"><path id="sh-r1" d="M110 100 L250 300"></path><path id="sh-r2" d="M120 80 L360 230"></path><path id="sh-r3" d="M106 116 L180 350"></path></g>` +
    `<g class="dv-glow" fill="#F26A1B"><circle id="sh-d1" cx="250" cy="300" r="7"></circle><circle id="sh-d2" cx="360" cy="230" r="7"></circle><circle id="sh-d3" cx="180" cy="350" r="7"></circle></g>` +
    `<path d="M0 470 C200 452 420 476 812 456 L812 548 L0 548Z" fill="#C9CCD6"></path>` +
    `<ellipse cx="90" cy="510" rx="40" ry="7" fill="#A9ADBB"></ellipse>` +
    `<clipPath id="roof"><path d="M120 470 a280 280 0 0 1 560 0z"></path></clipPath>` +
    `<path d="M120 470 a280 280 0 0 1 560 0z" fill="#3A4252"></path>` +
    `<g clip-path="url(#roof)"><rect id="sh-soil" class="dv-geo" x="100" y="460" width="600" height="340" fill="#A9ADBB"></rect>` +
    `<g fill="#8D93A3"><circle cx="230" cy="420" r="6"></circle><circle cx="300" cy="380" r="5"></circle><circle cx="520" cy="400" r="7"></circle><circle cx="610" cy="440" r="5"></circle><circle cx="400" cy="330" r="6"></circle><circle cx="180" cy="455" r="4"></circle><circle cx="470" cy="300" r="5"></circle></g></g>` +
    `<path d="M120 470 a280 280 0 0 1 560 0" fill="none" stroke="#F26A1B" stroke-width="4" stroke-dasharray="12 10"></path>` +
    `<path d="M160 470 a240 240 0 0 1 480 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="7"></path>` +
    `<path d="M190 470 a210 210 0 0 1 420 0z" fill="#2B3446"></path>` +
    `<rect x="250" y="330" width="300" height="140" fill="#2B3446"></rect>` +
    `<path d="M210 470 h380" stroke="#4A5366" stroke-width="4"></path>` +
    `<rect x="230" y="400" width="90" height="18" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect>` +
    `<rect x="230" y="370" width="90" height="18" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect>` +
    `<rect x="420" y="410" width="80" height="10" fill="#9AA3AF" stroke="#1E2430" stroke-width="3"></rect>` +
    `<path d="M436 420 v40 M484 420 v40" stroke="#1E2430" stroke-width="4"></path>` +
    `<g class="dv-breathe" transform="translate(430 404)"><circle cx="0" cy="-26" r="9" fill="#8ED16C" stroke="#1E2430" stroke-width="2.5"></circle><rect x="-9" y="-16" width="18" height="24" rx="6" fill="#8ED16C" stroke="#1E2430" stroke-width="2.5"></rect></g>` +
    `<g class="dv-breathe" transform="translate(492 404)"><circle cx="0" cy="-26" r="9" fill="#B99AF5" stroke="#1E2430" stroke-width="2.5"></circle><rect x="-9" y="-16" width="18" height="24" rx="6" fill="#B99AF5" stroke="#1E2430" stroke-width="2.5"></rect></g>` +
    `<rect x="452" y="398" width="16" height="12" rx="2" fill="#F5C518" stroke="#1E2430" stroke-width="2"></rect>` +
    `<g transform="translate(540 330)"><rect x="0" y="0" width="34" height="80" rx="4" fill="#DDF3D8" stroke="#1E2430" stroke-width="3"></rect><path d="M8 70 v-16 M17 70 v-24 M26 70 v-14" stroke="#2F7A2C" stroke-width="4" stroke-linecap="round"></path></g>` +
    `<circle class="dv-glow" cx="400" cy="300" r="14" fill="#F5C518" stroke="#1E2430" stroke-width="3"></circle>` +
    `<path d="M388 314 h24" stroke="#1E2430" stroke-width="3"></path>` +
    `<rect x="640" y="436" width="40" height="34" fill="#DDE1E6" stroke="#1E2430" stroke-width="4"></rect>` +
    `<path d="M600 470 c20 -40 70 -40 100 -18 c20 6 40 4 50 18z" fill="#A9ADBB" stroke="#1E2430" stroke-width="4"></path>` +
    `<g transform="translate(730 470)"><circle cx="0" cy="-92" r="15" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-96" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-15" y="-77" width="30" height="42" rx="9" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></rect><rect x="-13" y="-38" width="11" height="38" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-38" width="11" height="38" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><g class="dv-scoop" transform="rotate(-40 -10 -60)"><rect x="-14" y="-140" width="8" height="90" fill="#D9A43A" stroke="#1E2430" stroke-width="3"></rect><path d="M-28 -50 h36 l-6 26 h-24z" fill="#9AA3AF" stroke="#1E2430" stroke-width="4"></path></g></g>` +
    `<g id="sh-toss" class="dv-burst-a" fill="#A9ADBB" stroke="#1E2430" stroke-width="2.5"><circle cx="672" cy="300" r="8"></circle><circle cx="650" cy="276" r="6"></circle><circle cx="692" cy="270" r="5"></circle><circle cx="630" cy="300" r="4"></circle></g>` +
    `</svg>` +
    `<div style="position: absolute; left: 20px; bottom: 20px; display: flex; gap: 10px; align-items: center; padding: 8px 14px; border-radius: 10px; background: rgba(14,20,36,0.88); color: #F3F4F6; font-size: 16px; font-weight: 600"><span style="width: 26px; border-top: 4px dashed #F26A1B"></span>Fill to the dashed line<span style="width: 14px; height: 14px; border-radius: 50%; background: #F26A1B; margin-left: 8px"></span>Sun rays stop at the dirt</div>` +
    `</div>` +
    `<div style="width: 340px; display: flex; flex-direction: column; gap: 16px">` +
    `<div role="status" aria-live="polite" style="padding: 18px 20px; border-radius: 16px; background: #13211D; box-shadow: inset 0 0 0 5px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 10px">` +
    `<span style="font-weight: 700; font-size: 17px; color: #E4FFEC">Scoops</span>` +
    `<span id="sh-count" class="dv-bump-a" style="font-weight: 800; font-size: 54px; line-height: 1; color: #E4FFEC; font-variant-numeric: tabular-nums">0 <span style="font-size: 24px; color: #A8F5C2">of ${GOAL}</span></span>` +
    `<div id="sh-cells" style="display: flex; gap: 3px"></div>` +
    (shieldNow == null ? "" : `<span style="font-size: 15px">Shield after this job: <b id="sh-after" style="color: #E4FFEC; font-variant-numeric: tabular-nums"></b></span>`) +
    `</div>` +
    `<div aria-hidden="true" style="padding: 10px 12px; border-radius: 16px; background: #F7F8F9; border: 3px solid #1E2430; display: flex; flex-direction: column; gap: 6px"><span style="font-weight: 800; font-size: 16px">Dig when the arrow is in the green</span><div id="sh-track" style="position: relative; height: 44px; border-radius: 10px; background: #DDE1E6; border: 3px solid #1E2430; overflow: hidden"><div id="sh-zone" style="position: absolute; top: 0; bottom: 0; background: #5CBF5A; border-left: 3px solid #1F7A35; border-right: 3px solid #1F7A35"></div><div id="sh-mark" style="position: absolute; top: -2px; bottom: -2px; left: 0; width: 8px; margin-left: -4px; border-radius: 4px; background: #1E2430; box-shadow: 0 0 0 2px #F7F8F9"></div></div></div>` +
    `<button type="button" id="sh-dig" class="dv-key dv-bump-a" aria-label="Dig! Scoop once. Tap, click, Enter or Space." style="flex-grow: 1; min-height: 100px; border-radius: 28px; cursor: pointer; background: #F26A1B; border: 4px solid #1E2430; box-shadow: 0 10px 0 #8E3A0B; color: #1E2430; font-family: Lexend, sans-serif; font-weight: 800; font-size: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px">` +
    `<svg aria-hidden="true" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6M17 7l-8 8M5 15l4 4-3 1-2-2z"></path></svg>` +
    `<span id="sh-label">Dig!</span><span id="sh-sub" style="font-size: 16px; font-weight: 600">Tap, click, or press Space</span></button>` +
    `</div></div>`;
  api.foot.innerHTML =
    `<div style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 16px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p style="margin: 0; font-size: 15px; color: #4A5363">Only green scoops count. A miss spills one. Win: <b style="color: #1F7A35">extra shield</b>.</p></div>`;

  const $ = (id) => api.body.querySelector("#" + id);
  const cellsEl = $("sh-cells");
  cellsEl.innerHTML = Array.from({ length: GOAL }, () => `<span style="flex: 1; height: 16px; border-radius: 3px; background: #2B3833"></span>`).join("");
  const cells = [...cellsEl.children];

  function update() {
    const top = 460 - Math.round(Math.min(count, GOAL) * (260 / GOAL));
    $("sh-soil").setAttribute("y", String(top));
    [["sh-r1", "sh-d1", 300], ["sh-r2", "sh-d2", 230], ["sh-r3", "sh-d3", 350]].forEach(([r, d, lim], i) => {
      const y = Math.max(top, lim) - 4;
      const p = $(r), dot = $(d);
      const x1 = [250, 360, 180][i], y0 = [100, 80, 116][i], x0 = [110, 120, 106][i];
      p.setAttribute("d", "M" + x0 + " " + y0 + " L" + x1 + " " + y);
      dot.setAttribute("cy", String(y));
    });
    const c = $("sh-count");
    c.firstChild.nodeValue = count + " ";
    cells.forEach((el, i) => { el.style.background = i < count ? "#9B7BF7" : "#2B3833"; });
    $("sh-label").textContent = count >= GOAL ? "Roof full!" : "Dig!";
    const after = $("sh-after");
    if (after) after.textContent = String(Math.min(100, Math.round(shieldNow + shieldGain + (count >= GOAL ? bonus : 0))));
  }

  // the sweeping marker
  let pos = 0, dir = 1, speed = 70; // percent of the track per second
  let zw = api.easy ? 32 : 26, zx = 40; // green zone width and left edge, in percent
  const placeZone = () => {
    zx = 4 + Math.random() * (92 - zw);
    const z = $("sh-zone");
    z.style.left = zx + "%"; z.style.width = zw + "%";
  };
  let last = performance.now();
  const loop = (now) => {
    if (api.done) { clearInterval(loopId); return; }
    const dt = Math.min(0.12, (now - last) / 1000);
    last = now;
    pos += dir * speed * dt;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    $("sh-mark").style.left = pos + "%";
  };

  function scoop() {
    if (api.done || count >= GOAL) return;
    const hit = pos >= zx - 1 && pos <= zx + zw + 1;
    if (!hit) {
      count = Math.max(0, count - 1);
      api.swap($("sh-track"), "dv-shake-a", "dv-shake-b");
      $("sh-sub").textContent = "Spilled! Wait for the green.";
      api.penalty(0.5);
      api.sfx("miss");
      update();
      return;
    }
    count += 1;
    api.sfx("scoop");
    api.good();
    speed += api.easy ? 8 : 14;
    zw = Math.max(13, zw - 1.8);
    placeZone();
    $("sh-sub").textContent = count >= GOAL ? "Roof full!" : "Good scoop!";
    update();
    api.swap($("sh-count"), "dv-bump-a", "dv-bump-b");
    api.swap($("sh-toss"), "dv-burst-a", "dv-burst-b");
    api.swap($("sh-dig"), "dv-bump-a", "dv-bump-b");
    if (count >= GOAL) api.win();
  }

  const dig = $("sh-dig");
  dig.addEventListener("click", scoop);
  api.onKey((e) => {
    // On a focused button, Enter/Space already click it, so only handle them elsewhere.
    if ((e.key === "Enter" || e.key === " ") && !(e.target && e.target.tagName === "BUTTON")) {
      if (!e.repeat) scoop();
      return true;
    }
    return false;
  });
  placeZone();
  update();
  const loopId = setInterval(() => loop(performance.now()), 33);
  api.focus(dig);
}
