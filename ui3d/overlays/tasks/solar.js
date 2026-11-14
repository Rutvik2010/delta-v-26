// Task: aim the solar panel at the Sun (reach 90%, then lock).
import { keycap } from "../../parts.js";

const rad = (d) => (d * Math.PI) / 180;
const KEY = "display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; height: 92px; border-radius: 20px; cursor: pointer; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 7px 0 #7C8592; color: #1E2430; font-family: Lexend, sans-serif; font-weight: 800; font-size: 20px";

export function mount(api) {
  const sun = 30 + Math.floor(Math.random() * 121); // 30..150 degrees
  let a = Math.max(10, Math.min(170, sun < 90 ? sun + 44 : sun - 44));
  const sx = Math.round(406 - 330 * Math.cos(rad(sun)));
  const sy = Math.round(420 - 330 * Math.sin(rad(sun)));

  api.body.innerHTML =
    `<div style="flex-grow: 1; display: flex; gap: 20px; min-height: 0">` +
    `<div style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: #0B1020; overflow: hidden">` +
    `<svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 812 548" preserveAspectRatio="xMidYMax slice" style="position: absolute; left: 0; top: 0">` +
    `<g fill="#F3F4F6"><circle class="dv-twinkle" cx="40" cy="30" r="1.4" opacity="0.7"></circle><circle class="dv-twinkle-b" cx="140" cy="90" r="1" opacity="0.5"></circle><circle class="dv-twinkle" cx="250" cy="40" r="1.5" opacity="0.7"></circle><circle class="dv-twinkle-b" cx="400" cy="20" r="1" opacity="0.5"></circle><circle class="dv-twinkle" cx="560" cy="60" r="1.3" opacity="0.6"></circle><circle class="dv-twinkle-b" cx="700" cy="30" r="1.6" opacity="0.7"></circle><circle class="dv-twinkle" cx="770" cy="140" r="1" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="60" cy="200" r="1.1" opacity="0.5"></circle></g>` +
    `<path d="M76 420 A330 330 0 0 1 736 420" fill="none" stroke="#3A4258" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"></path>` +
    `<g stroke="#5A6478" stroke-width="3" stroke-linecap="round"><path d="M100 330 l12 6"></path><path d="M180 200 l10 9"></path><path d="M300 118 l6 11"></path><path d="M406 88 v12"></path><path d="M512 118 l-6 11"></path><path d="M632 200 l-10 9"></path><path d="M712 330 l-12 6"></path></g>` +
    `<g class="dv-bob" transform="translate(700 404)"><circle r="20" fill="#3D7BD9" stroke="#1E2430" stroke-width="3"></circle><path d="M-12 -6 c6-8 14-4 12 4s-10 6-12 0z" fill="#5CBF5A"></path><path d="M2 -20 A20 20 0 0 1 2 20 A14 20 0 0 0 2 -20Z" fill="#0B1020" opacity="0.45"></path></g>` +
    `<polygon id="sl-beam" points="" fill="#F5C518" opacity="0.2"></polygon>` +
    `<g transform="translate(${sx} ${sy})"><g class="dv-spin-fast" stroke="#F5C518" stroke-width="5" stroke-linecap="round"><path d="M0 -44v-12M0 44v12M-44 0h-12M44 0h12M-31 -31l-8-8M31 31l8 8M-31 31l-8 8M31 -31l8-8"></path></g><circle r="34" fill="#F5C518" stroke="#1E2430" stroke-width="5"></circle><circle class="dv-spin" r="22" fill="none" stroke="#F9DC6A" stroke-width="3" stroke-dasharray="4 4"></circle></g>` +
    `<path d="M0 446 C160 430 300 452 460 440 C600 430 720 448 812 440 L812 548 L0 548Z" fill="#B3B8C5"></path>` +
    `<path d="M0 486 C200 470 420 494 812 478 L812 548 L0 548Z" fill="#CDD0D9"></path>` +
    `<g><ellipse cx="120" cy="506" rx="44" ry="8" fill="#9CA1B0"></ellipse><path d="M76 506 a44 8 0 0 1 88 0" fill="none" stroke="#E6E8EE" stroke-width="2"></path></g>` +
    `<g><ellipse cx="690" cy="520" rx="30" ry="6" fill="#9CA1B0"></ellipse></g>` +
    `<g fill="none" stroke="#9CA1B0" stroke-width="3" stroke-linecap="round"><path d="M250 520 l6 -8 M270 512 l6 -8 M282 528 l6 -8 M300 518 l6 -8"></path></g>` +
    `<rect x="378" y="420" width="16" height="70" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"></rect>` +
    `<g stroke="#1E2430" stroke-width="2"><path d="M378 436h16M378 452h16M378 468h16"></path></g>` +
    `<path d="M356 492 h60 l-8 -10 h-44z" fill="#7C8592" stroke="#1E2430" stroke-width="4" stroke-linejoin="round"></path>` +
    `<g id="sl-panel" class="dv-rot" transform="translate(386 420) rotate(0)">` +
    `<rect x="-110" y="-14" width="220" height="22" rx="3" fill="#D9A43A" stroke="#1E2430" stroke-width="5"></rect>` +
    `<g stroke="#1E2430" stroke-width="2"><path d="M-82 -14v22M-55 -14v22M-27 -14v22M0 -14v22M27 -14v22M55 -14v22M82 -14v22M-110 -3h220"></path></g>` +
    `<path d="M-108 -12 h40" stroke="#F9DC6A" stroke-width="3" stroke-linecap="round"></path>` +
    `<rect x="-8" y="8" width="16" height="10" fill="#9AA3AF" stroke="#1E2430" stroke-width="3"></rect></g>` +
    `<circle cx="386" cy="420" r="10" fill="#F26A1B" stroke="#1E2430" stroke-width="4"></circle>` +
    `<path d="M394 488 C440 500 480 500 520 488" fill="none" stroke="#1E2430" stroke-width="4"></path>` +
    `<rect x="520" y="440" width="76" height="56" rx="6" fill="#F7F8F9" stroke="#1E2430" stroke-width="5"></rect>` +
    `<rect x="530" y="450" width="56" height="12" rx="2" fill="#13211D"></rect>` +
    `<g><rect id="sl-b1" x="532" y="468" width="10" height="20" rx="2" fill="#2B3833" stroke="#1E2430" stroke-width="2"></rect><rect id="sl-b2" x="546" y="468" width="10" height="20" rx="2" fill="#2B3833" stroke="#1E2430" stroke-width="2"></rect><rect id="sl-b3" x="560" y="468" width="10" height="20" rx="2" fill="#2B3833" stroke="#1E2430" stroke-width="2"></rect><rect id="sl-b4" x="574" y="468" width="10" height="20" rx="2" fill="#2B3833" stroke="#1E2430" stroke-width="2"></rect></g>` +
    `<text x="558" y="460" text-anchor="middle" font-family="Lexend" font-weight="700" font-size="9" fill="#A8F5C2">BATTERY</text>` +
    `<g transform="translate(250 490)"><rect x="18" y="-48" width="30" height="28" rx="4" fill="#DDE1E6" stroke="#1E2430" stroke-width="3"></rect><path d="M33 -48 v-12" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path><circle class="dv-blink" cx="33" cy="-62" r="5" fill="#F26A1B" stroke="#1E2430" stroke-width="2"></circle><path d="M33 -20 v20" stroke="#1E2430" stroke-width="4"></path><circle cx="0" cy="-86" r="14" fill="#B99AF5" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-90" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-14" y="-71" width="28" height="40" rx="8" fill="#B99AF5" stroke="#1E2430" stroke-width="3"></rect><path d="M12 -60 l18 -2" stroke="#1E2430" stroke-width="5" stroke-linecap="round"></path><rect x="-12" y="-33" width="10" height="33" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-33" width="10" height="33" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect></g>` +
    `</svg>` +
    `<p style="position: absolute; left: 18px; top: 16px; margin: 0; padding: 8px 12px; border-radius: 10px; background: rgba(11,16,32,0.85); color: #C9D2E3; font-size: 15px; line-height: 1.4; max-width: 300px">The Sun slides along the dotted path. Turn the gold panel so it faces the Sun.</p>` +
    `</div>` +
    `<div class="dv-rise dv-d2" style="width: 340px; display: flex; flex-direction: column; gap: 12px">` +
    `<div style="padding: 14px 20px; border-radius: 16px; background: #13211D; box-shadow: inset 0 0 0 5px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 8px">` +
    `<span style="font-weight: 700; font-size: 17px; color: #E4FFEC">Sunlight caught</span>` +
    `<span id="sl-pct" class="dv-bump-a" style="font-weight: 800; font-size: 50px; line-height: 1; color: #E4FFEC; font-variant-numeric: tabular-nums">0%</span>` +
    `<div style="position: relative; height: 20px; border-radius: 6px; background: #2B3833; overflow: hidden"><div id="sl-bar" class="dv-fillbar" style="height: 20px; width: 0%; background: #F5C518"></div><div style="position: absolute; left: 90%; top: 0; bottom: 0; border-left: 3px dashed #E4FFEC"></div></div>` +
    `<span id="sl-nums" style="font-size: 15px; font-variant-numeric: tabular-nums"></span></div>` +
    `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">` +
    `<button type="button" id="sl-left" class="dv-key" aria-label="Tilt left (Left arrow or A)" style="${KEY}"><svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 0-8 8"></path><path d="M4 7v5h5"></path></svg>Tilt left</button>` +
    `<button type="button" id="sl-right" class="dv-key" aria-label="Tilt right (Right arrow or D)" style="${KEY}"><svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 1 8 8"></path><path d="M20 7v5h-5"></path></svg>Tilt right</button></div>` +
    `<div style="padding: 10px 14px; border-radius: 14px; background: #F7F8F9; border: 3px solid #1E2430; display: flex; flex-direction: column; gap: 4px"><label for="angle" style="font-weight: 700; font-size: 16px">Or slide to turn the panel</label><input id="angle" type="range" min="10" max="170" step="1" value="${a}" style="width: 100%; height: 30px; accent-color: #F26A1B"></div>` +
    `<button type="button" id="sl-lock" class="dv-key" aria-label="Lock the panel (Enter)" style="${keycap("primary", "height: 60px; font-size: 22px; box-shadow: 0 7px 0 #8E3A0B; display: flex; align-items: center; justify-content: center; gap: 10px")}">Lock it in <span style="font-size: 15px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: #F7F8F9; border: 2px solid #1E2430">Enter</span></button>` +
    `</div></div>`;
  api.foot.innerHTML =
    `<div role="status" aria-live="polite" style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 14px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p id="sl-hint" style="margin: 0; font-size: 17px; font-weight: 700"></p>` +
    `<p style="margin: 2px 0 0; font-size: 15px; color: #4A5363">Win: <b style="color: #1F7A35">extra power</b>. Missing costs nothing.</p></div>`;

  const $ = (id) => api.body.querySelector("#" + id);
  const slider = $("angle");
  const hintEl = api.foot.querySelector("#sl-hint");
  let lastHint = "", lastPct = -1;

  const calc = () => Math.max(0, Math.round(100 - Math.abs(a - sun) * 2.2));
  const update = () => {
    const pct = calc();
    const rot = a - 90, half = 110;
    const ex = Math.cos(rad(rot)) * half, ey = Math.sin(rad(rot)) * half;
    $("sl-beam").setAttribute("points", [sx, sy, 386 - ex, 420 - ey, 386 + ex, 420 + ey].map((n) => Math.round(n)).join(" "));
    $("sl-beam").setAttribute("opacity", (0.08 + (pct / 100) * 0.3).toFixed(2));
    $("sl-panel").setAttribute("transform", "translate(386 420) rotate(" + rot + ")");
    const charge = Math.ceil(pct / 25);
    for (let i = 1; i <= 4; i++) $("sl-b" + i).setAttribute("fill", i <= charge ? "#5CBF5A" : "#2B3833");
    const pctEl = $("sl-pct");
    pctEl.textContent = pct + "%";
    if (pct !== lastPct) api.swap(pctEl, "dv-bump-a", "dv-bump-b");
    const bar = $("sl-bar");
    bar.style.width = pct + "%";
    bar.style.background = pct >= 90 ? "#5CBF5A" : "#F5C518";
    $("sl-nums").textContent = "Panel " + a + "° · Sun " + sun + "° · reach 90%";
    let hint = "Turn the panel until the bar passes the dashed line, then lock it in.";
    if (pct >= 90) hint = "Lined up at " + pct + "%! Press Lock it in.";
    else if (pct >= 60) hint = "Almost there. A little more!";
    if (hint !== lastHint) { lastHint = hint; hintEl.textContent = hint; }
    lastPct = pct;
    if (Number(slider.value) !== a) slider.value = String(a);
  };
  const set = (v) => { a = Math.max(10, Math.min(170, Math.round(v))); update(); };
  const tilt = (d) => { api.sfx("click"); set(a + d); };
  const lock = () => {
    api.sfx("click");
    if (calc() >= 90) api.win();
    else { lastHint = "Not yet. Reach 90% first (past the dashed line)."; hintEl.textContent = lastHint; }
  };

  $("sl-left").addEventListener("click", () => tilt(-4));
  $("sl-right").addEventListener("click", () => tilt(4));
  $("sl-lock").addEventListener("click", lock);
  slider.addEventListener("input", () => set(Number(slider.value)));

  api.onKey((e) => {
    const onRange = e.target === slider;
    const onButton = e.target && e.target.tagName === "BUTTON";
    const k = e.key;
    if (k === "a" || k === "A") { tilt(-4); return true; }
    if (k === "d" || k === "D") { tilt(4); return true; }
    if (!onRange && (k === "ArrowLeft")) { tilt(-4); return true; }
    if (!onRange && (k === "ArrowRight")) { tilt(4); return true; }
    if (k === "Enter" && !onButton) { lock(); return true; }
    return false;
  });

  update();
  api.focus(slider);
}
