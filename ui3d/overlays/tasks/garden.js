// Task: keep the garden alive. Plants dry out at different speeds; water each one when it turns
// thirsty (below 40%), before it wilts. Watering a happy plant wastes time. Plants are buttons; keys 1-6 work too.
let GOAL = 8; // drinks to win (Easy: 6), set in mount
const DRY = 40;
const SP = [
  { name: "Lettuce", lvl: 80, leaf: "M60 82c-26-2-36-20-30-34 12 2 22 12 30 24-2-20 4-36 0-50-6 14-2 30 0 50 8-12 18-22 30-24 6 14-4 32-30 34z", fruit: "", ff: "none" },
  { name: "Radish", lvl: 18, leaf: "M60 82c-4-20-18-32-28-42 16 0 26 12 28 32 2-22 10-36 26-42-6 16-18 28-26 52z", fruit: "M50 80a10 9 0 1 0 20 0a10 9 0 1 0-20 0z", ff: "#E0445E" },
  { name: "Tomato", lvl: 70, leaf: "M58 82V34h4v48zM60 60c-14-4-22-12-22-24 12 0 20 8 22 24zM60 46c14-4 20-12 20-22-12 0-20 6-20 22z", fruit: "M36 64a8 8 0 1 0 16 0a8 8 0 1 0-16 0zM70 54a8 8 0 1 0 16 0a8 8 0 1 0-16 0zM64 70a6 6 0 1 0 12 0a6 6 0 1 0-12 0z", ff: "#E0445E" },
  { name: "Pepper", lvl: 12, leaf: "M58 82V40h4v42zM60 62c-16-2-24-12-22-22 12 0 20 10 22 22zM60 50c14-2 22-12 20-22-12 0-20 10-20 22z", fruit: "M70 56c6 0 8 6 6 14-2 8-6 12-8 12s-4-6-4-14 2-12 6-12z", ff: "#F26A1B" },
  { name: "Bean", lvl: 24, leaf: "M58 82c-8-12 8-20 0-32s8-20 0-30h4c8 10-8 18 0 30s-8 20 0 32zM58 66c-14 0-20-8-20-16 12 0 18 6 20 16zM62 44c14 0 20-8 20-16-12 0-18 6-20 16z", fruit: "M74 52c4 6 4 18 0 24-2-6-2-18 0-24zM42 58c-4 6-4 16 0 22 2-6 2-16 0-22z", ff: "#2F7A2C" },
  { name: "Kale", lvl: 90, leaf: "M60 82c-20-6-30-20-26-34 4 4 8 2 10 6 2-6 6-4 8-2 0-10 4-16 8-24 4 8 8 14 8 24 2-2 6-4 8 2 2-4 6-2 10-6 4 14-6 28-26 34z", fruit: "", ff: "none" },
];

export function mount(api) {
  GOAL = api.easy ? 6 : 8;
  // two random plants start out thirsty; every plant drains at its own speed
  const idxs = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
  const level = SP.map(() => 60 + Math.random() * 40);
  idxs.slice(0, 2).forEach((i) => { level[i] = 30 + Math.random() * 8; });
  const drain = SP.map(() => (7.5 + Math.random() * 6) * (api.easy ? 0.75 : 1) * (api.practice ? 0.5 : 1));
  let drinks = 0;

  const plantHtml = (i, entrance) => {
    const s = SP[i];
    const dry = level[i] < DRY;
    const lvl = Math.round(level[i]);
    const cls = "dv-key" + (entrance ? " dv-rise dv-d" + (i + 1) : "");
    const border = dry ? "#F26A1B" : "#1E2430";
    return `<button type="button" data-p="${i}" class="${cls}" aria-label="${s.name}, plant ${i + 1}, ${dry ? "thirsty. Press to water, or press " + (i + 1) : "happy"}" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 14px 12px; min-height: 44px; border-radius: 18px; cursor: pointer; background: rgba(247,248,249,0.9); border: 4px solid ${border}; box-shadow: 0 6px 0 ${dry ? "#8E3A0B" : "#7C8592"}; font-family: inherit; color: #1E2430">` +
      `<svg aria-hidden="true" width="136" height="136" viewBox="0 0 120 120">` +
      `<g class="${dry ? "dv-sway" : "dv-perk"}"${dry ? ' transform="rotate(16 60 84) translate(2 6)"' : ""}><path d="${s.leaf}" fill="${dry ? "#D9C24A" : "#5CBF5A"}" stroke="#1E2430" stroke-width="3.5" stroke-linejoin="round"></path><path d="${s.fruit || "M0 0"}" fill="${dry ? "#B8862A" : s.ff}" stroke="#1E2430" stroke-width="3"></path></g>` +
      `<path d="M30 84 C30 74 90 74 90 84 L84 112 H36Z" fill="#F7F8F9" stroke="#1E2430" stroke-width="4" stroke-linejoin="round"></path>` +
      `<path d="M36 84 C40 80 80 80 84 84" fill="none" stroke="${dry ? "#C9A27A" : "#6B4A2E"}" stroke-width="6" stroke-linecap="round"></path>` +
      `<path d="M50 96 h20" stroke="#9AA3AF" stroke-width="3" stroke-linecap="round"></path>` +
      `<g class="dv-tick" opacity="${dry ? 1 : 0}"><circle cx="98" cy="22" r="14" fill="#F26A1B" stroke="#1E2430" stroke-width="3"></circle><path d="M98 14v9M98 28v1" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path></g></svg>` +
      `<span style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-weight: 700; font-size: 17px"><span>${i + 1} · ${s.name}</span><span style="font-size: 14px; font-weight: 700; color: ${dry ? "#B3261E" : "#1F7A35"}">${dry ? "Thirsty!" : "Happy"}</span></span>` +
      `<span style="display: block; width: 100%; height: 12px; border-radius: 6px; background: #EEF0F2; border: 2px solid #1E2430; overflow: hidden"><span class="dv-fillbar" style="display: block; height: 100%; width: ${lvl}%; background: ${dry ? "#F26A1B" : "#4BA3F0"}"></span></span></button>`;
  };

  api.body.innerHTML =
    `<div style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: #E3EBE0; overflow: hidden; display: flex">` +
    `<svg aria-hidden="true" width="1172" height="548" viewBox="0 0 1172 548" style="position: absolute; left: 0; top: 0">` +
    `<g stroke="#C9D6C4" stroke-width="3" fill="none"><path d="M0 0 C300 60 600 60 900 0"></path><path d="M150 0v548M450 0v548M750 0v548"></path></g>` +
    `<rect x="30" y="14" width="800" height="16" rx="8" fill="#1E2430"></rect><rect class="dv-glow" x="44" y="19" width="772" height="6" rx="3" fill="#E55BB0"></rect>` +
    `<path d="M40 30 L10 250 L850 250 L820 30Z" fill="#E55BB0" opacity="0.10"></path>` +
    `<rect x="30" y="262" width="800" height="16" rx="8" fill="#1E2430"></rect><rect class="dv-glow" x="44" y="267" width="772" height="6" rx="3" fill="#E55BB0"></rect>` +
    `<path d="M40 278 L10 500 L850 500 L820 278Z" fill="#E55BB0" opacity="0.10"></path>` +
    `<rect x="24" y="236" width="812" height="16" rx="4" fill="#9AA3AF" stroke="#1E2430" stroke-width="4"></rect>` +
    `<rect x="24" y="486" width="812" height="16" rx="4" fill="#9AA3AF" stroke="#1E2430" stroke-width="4"></rect>` +
    `<path d="M60 502 v46 M800 502 v46" stroke="#1E2430" stroke-width="6"></path>` +
    `<path d="M836 120 h40 v-60" fill="none" stroke="#4BA3F0" stroke-width="8"></path>` +
    `<rect x="870" y="20" width="110" height="200" rx="18" fill="#F7F8F9" stroke="#1E2430" stroke-width="5"></rect>` +
    `<rect id="gd-tank" class="dv-geo" x="878" y="163" width="94" height="49" rx="12" fill="#4BA3F0"></rect>` +
    `<rect x="880" y="40" width="90" height="28" rx="5" fill="#1E2430"></rect>` +
    `<text x="925" y="60" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="16" fill="#F7F8F9">WATER</text>` +
    `<g class="dv-breathe" transform="translate(1060 470)"><circle cx="0" cy="-150" r="22" fill="${api.color || "#8ED16C"}" stroke="#1E2430" stroke-width="4"></circle><rect x="-16" y="-158" width="32" height="16" rx="8" fill="#1E2430"></rect><path d="M-6 -152 h10" stroke="#8FD9F0" stroke-width="4" stroke-linecap="round"></path><rect x="-24" y="-126" width="48" height="68" rx="14" fill="${api.color || "#8ED16C"}" stroke="#1E2430" stroke-width="4"></rect><rect x="-22" y="-62" width="18" height="62" rx="6" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"></rect><rect x="4" y="-62" width="18" height="62" rx="6" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"></rect><path d="M-24 -110 l-30 22" stroke="#1E2430" stroke-width="6" stroke-linecap="round"></path><g transform="translate(-92 -96)"><path d="M0 0 h44 v34 a6 6 0 0 1 -6 6 h-32 a6 6 0 0 1 -6 -6z" fill="#F26A1B" stroke="#1E2430" stroke-width="4"></path><path d="M0 8 l-30 -18" stroke="#1E2430" stroke-width="5" stroke-linecap="round"></path><path d="M44 6 a14 14 0 0 1 0 22" fill="none" stroke="#1E2430" stroke-width="4"></path><g fill="#4BA3F0"><circle class="dv-fall" cx="-36" cy="-6" r="3"></circle><circle class="dv-fall-b" cx="-40" cy="4" r="3"></circle><circle class="dv-fall-c" cx="-32" cy="10" r="3"></circle></g></g></g>` +
    `</svg>` +
    `<div id="gd-grid" style="position: relative; width: 860px; box-sizing: border-box; padding: 32px 40px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: 210px 210px; column-gap: 28px; row-gap: 38px">${SP.map((s, i) => plantHtml(i, true)).join("")}</div>` +
    `<div style="position: absolute; right: 180px; top: 236px; width: 120px; padding: 10px; border-radius: 12px; background: #13211D; box-shadow: inset 0 0 0 3px #2B3833; color: #A8F5C2; font-size: 13px; line-height: 1.4"><b style="color: #E4FFEC; font-size: 14px">Garden</b><br>Lights: on<br>Thirsty: <span id="gd-n" style="font-variant-numeric: tabular-nums">2</span></div>` +
    `</div>`;
  api.foot.innerHTML =
    `<div role="status" aria-live="polite" style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 16px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p id="gd-hint" style="margin: 0; font-size: 17px; font-weight: 700"></p>` +
    `<p style="margin: 2px 0 0; font-size: 15px; color: #4A5363">Do not let any plant wilt! Win: <b style="color: #1F7A35">extra food</b>.</p></div>`;

  const $ = (s) => api.body.querySelector(s);
  const hintEl = api.foot.querySelector("#gd-hint");
  const say = (t) => { hintEl.textContent = t; };
  const wasDry = level.map((l) => l < DRY);
  const thirstyN = () => level.filter((l) => l < DRY).length;

  function repaint(i) {
    const old = $('[data-p="' + i + '"]');
    const hadFocus = document.activeElement === old;
    old.outerHTML = plantHtml(i, false);
    if (hadFocus) $('[data-p="' + i + '"]').focus();
  }
  function counters() {
    $("#gd-n").textContent = String(thirstyN());
    const h = Math.round(140 * (0.25 + 0.75 * (drinks / GOAL)));
    const tank = $("#gd-tank");
    tank.setAttribute("height", String(h));
    tank.setAttribute("y", String(212 - h));
  }

  function water(i) {
    if (api.done) return;
    if (level[i] >= DRY) {
      api.penalty(0.5);
      api.sfx("miss");
      api.swap($('[data-p="' + i + '"]'), "dv-shake-a", "dv-shake-b");
      say(SP[i].name + " is not thirsty yet. Too much water drowns the roots!");
      return;
    }
    level[i] = 100;
    drinks += 1;
    api.sfx("splash");
    api.good();
    wasDry[i] = false;
    repaint(i);
    api.swap($('[data-p="' + i + '"]'), "dv-bump-a", "dv-bump-b");
    counters();
    if (drinks >= GOAL) { say("The whole garden is happy. Great job!"); api.win(); return; }
    say(drinks + " of " + GOAL + " drinks given. Watch for orange plants!");
  }

  let last = performance.now(), t = 0;
  const loop = (now) => {
    if (api.done) { clearInterval(loopId); return; }
    const dt = Math.min(0.12, (now - last) / 1000);
    last = now; t += dt;
    for (let i = 0; i < SP.length; i++) {
      level[i] = Math.max(0, level[i] - drain[i] * (1 + t * 0.05) * dt); // drying speeds up a little
      if (level[i] <= 0) { say("Oh no, the " + SP[i].name.toLowerCase() + " wilted!"); repaint(i); api.fail(); return; }
      const dry = level[i] < DRY;
      if (dry !== wasDry[i]) { wasDry[i] = dry; repaint(i); counters(); if (dry) { say(SP[i].name + " is thirsty!"); api.point($('[data-p="' + i + '"]')); } }
      else {
        const bar = $('[data-p="' + i + '"] .dv-fillbar');
        if (bar) bar.style.width = Math.round(level[i]) + "%";
      }
    }
  };

  $("#gd-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (b) water(Number(b.getAttribute("data-p")));
  });
  api.onKey((e) => {
    if (e.key >= "1" && e.key <= "6" && !e.ctrlKey && !e.metaKey && !e.altKey) { water(Number(e.key) - 1); return true; }
    return false;
  });
  counters();
  say("Water each plant when it turns orange, before it wilts. " + GOAL + " drinks to win!");
  const loopId = setInterval(() => loop(performance.now()), 33);
  api.focus($('[data-p="' + idxs[0] + '"]'));
}
