// Lose screen: the loss should teach. Cause, reassurance, tip, lesson, final meters, timeline.
import { keycap, esc, RES, RES_INFO, SITES } from "../parts.js";

const TIPS = {
  power: "Rest when power gets low. Every machine at the base needs power.",
  oxygen: "Run the oxygen maker before the air gets thin. It needs power too.",
  shielding: "Check the forecast and pile dirt on the dome before a storm.",
  food: "Send someone to the garden often. Resting uses food too.",
};
const FALLBACK_LESSON = {
  power: "Power runs everything on a base, so space crews keep a reserve.",
  oxygen: "Air is the first thing a crew checks, because nothing else matters without it.",
  food: "Crews plan food long before the trip starts and grow fresh food when they can.",
  shielding: "Radiation shielding is built before a storm arrives, not during it.",
};

const lessonBox = (text) =>
  `<div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FFF1C9; border: 2px dashed #B8862A">` +
  `<svg role="img" aria-label="Mission lesson" width="30" height="30" viewBox="0 0 24 24" style="flex-shrink: 0"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>` +
  `<p style="margin: 0; font-size: 16px; line-height: 1.4"><b>Mission lesson:</b> ${esc(text)}</p></div>`;

export async function mount(root, ctx) {
  const st = ctx.store.state;
  const sol = Math.max(1, Number(st.sol) || 1);
  const empty = RES.find((k) => (st[k] ?? 1) <= 0) || null;
  const emptyName = empty ? RES_INFO[empty].name : "";
  const tip = empty ? TIPS[empty] : "Look at the four meters every sol. Fix the lowest one first.";
  const reason = st.lossReason || "The base could not keep the crew safe any longer.";
  const otherName = ctx.store.site === "moon" ? SITES.mars.name : SITES.moon.name;

  // Bar chart of the final value of all four meters.
  const bars = RES.map((k, i) => {
    const v = Math.max(0, Math.min(100, Math.round(st[k] || 0)));
    const x = 30 + i * 86;
    const h = Math.round((v / 100) * 140);
    const isEmpty = k === empty;
    const color = RES_INFO[k].color;
    return `<g>
<rect x="${x}" y="30" width="56" height="140" rx="6" fill="#0B1712" stroke="#2B3833" stroke-width="1.5"></rect>
${h > 0 ? `<rect x="${x}" y="${170 - h}" width="56" height="${h}" rx="6" fill="${color}" stroke="#E4FFEC" stroke-width="1.5"></rect>` : ""}
${isEmpty ? `<rect class="dv-pop" style="animation-delay: 0.8s" x="${x}" y="164" width="56" height="6" rx="3" fill="#F26A1B" stroke="#E4FFEC" stroke-width="2"></rect>` : ""}
<text x="${x + 28}" y="22" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="18" fill="${isEmpty ? "#FFB08A" : "#E4FFEC"}">${v}</text>
<text x="${x + 28}" y="192" text-anchor="middle" font-family="Lexend" font-weight="600" font-size="13" fill="${isEmpty ? "#FFB08A" : "#A8F5C2"}">${esc(RES_INFO[k].name)}${isEmpty ? " (empty)" : ""}</text>
</g>`;
  }).join("");

  // Timeline: sols 1..final, final sol marked.
  const tl = [];
  const span = 340;
  for (let s = 1; s <= sol; s++) {
    const x = 18 + (sol === 1 ? 0 : ((s - 1) / (sol - 1)) * span);
    const last = s === sol;
    tl.push(last
      ? `<circle class="dv-pop dv-d10" cx="${x}" cy="24" r="8" fill="#F26A1B" stroke="#E4FFEC" stroke-width="2"></circle>`
      : `<circle cx="${x}" cy="24" r="3.5" fill="#5E8E78"></circle>`);
  }
  const endX = 18 + (sol === 1 ? 0 : span);

  const btn = (id, variant, size, pad, text) =>
    `<button type="button" id="${id}" class="dv-key" style="${keycap(variant, `display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: ${pad}; font-size: ${size}px`)}">${text}</button>`;

  root.innerHTML = `
<div style="width: 1280px; height: 800px; box-sizing: border-box; padding: 32px 48px; background: #C9CED6; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; gap: 32px">
<div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px">
<p style="margin: 0; font-size: 20px; font-weight: 600; color: #4A5363">Sol ${esc(sol)} of 30 · the crew is flying home early</p>
<h1 class="dv-rise dv-d1" style="margin: 0; font-weight: 800; font-size: 60px; line-height: 1; letter-spacing: -0.03em">Mission over</h1>
<p class="dv-rise dv-d2" style="margin: 0; font-size: 26px; line-height: 1.3; font-weight: 600">${esc(reason)}</p>
<p class="dv-rise dv-d2" style="margin: 0; font-size: 17px; font-weight: 600; color: #4A5363">The crew always get home safely. Every real mission learns from days like this one.</p>

<div class="dv-rise dv-d3" style="position: relative; height: 210px; flex-shrink: 0; border-radius: 20px; border: 5px solid #1E2430; background: #070B16; overflow: hidden">
<svg role="img" aria-label="The base at night. The solar panel is dark, the battery and oxygen tank are empty, and the dome's emergency lights glow. Maya, Leo and Zuri walk safely along a footprint trail, with helmet lights on, to a small ship with its ramp down to fly home." width="100%" height="100%" viewBox="0 0 732 242" preserveAspectRatio="xMidYMax slice">
<g fill="#F3F4F6"><circle class="dv-twinkle" cx="30" cy="22" r="1.3" opacity="0.8"></circle><circle class="dv-twinkle-b" cx="74" cy="64" r="0.9" opacity="0.5"></circle><circle class="dv-twinkle" cx="170" cy="18" r="1.5" opacity="0.8"></circle><circle class="dv-twinkle-b" cx="212" cy="58" r="1" opacity="0.6"></circle><circle class="dv-twinkle" cx="268" cy="30" r="0.8" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="330" cy="14" r="1.4" opacity="0.8"></circle><circle class="dv-twinkle" cx="372" cy="72" r="0.9" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="430" cy="36" r="1.2" opacity="0.7"></circle><circle class="dv-twinkle" cx="480" cy="12" r="0.8" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="540" cy="52" r="1.3" opacity="0.7"></circle><circle class="dv-twinkle" cx="602" cy="22" r="1" opacity="0.6"></circle><circle class="dv-twinkle-b" cx="660" cy="66" r="1.4" opacity="0.8"></circle><circle class="dv-twinkle" cx="712" cy="30" r="0.9" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="120" cy="96" r="0.8" opacity="0.4"></circle><circle class="dv-twinkle" cx="300" cy="100" r="0.8" opacity="0.4"></circle></g>
<g class="dv-bob" transform="translate(96 54)"><circle r="26" fill="#2A5BA8" stroke="#1E2430" stroke-width="3"></circle><path d="M-18 -8 c8-10 18-6 16 4 s-10 8-14 4z" fill="#3F8F46"></path><path d="M6 8 c6-4 14-2 12 6 s-10 6-12 0z" fill="#3F8F46"></path><path d="M-22 4 c8-4 14 0 22-2" stroke="#DDE1E6" stroke-width="2.5" fill="none" stroke-linecap="round"></path><path d="M-6 -26 A26 26 0 0 0 -6 26 A20 26 0 0 1 -6 -26Z" fill="#070B16" opacity="0.7"></path><circle r="26" fill="none" stroke="#1E2430" stroke-width="3"></circle><g fill="#F5C518"><circle cx="10" cy="-10" r="1"></circle><circle cx="14" cy="-4" r="0.8"></circle></g></g>
<path d="M0 132 C90 120 170 128 250 122 C330 116 410 126 490 118 C580 110 650 124 732 116 L732 242 L0 242Z" fill="#232B40"></path>
<path d="M0 160 C120 150 240 164 380 156 C500 150 620 162 732 154 L732 242 L0 242Z" fill="#2E374F"></path>
<path d="M0 196 C150 186 330 202 480 194 C600 188 680 198 732 194 L732 242 L0 242Z" fill="#3A4460"></path>
<g><ellipse cx="96" cy="214" rx="34" ry="6" fill="#262E44"></ellipse><path d="M62 214 a34 6 0 0 1 68 0" fill="none" stroke="#4A5574" stroke-width="2"></path></g>
<g><ellipse cx="640" cy="222" rx="24" ry="4" fill="#262E44"></ellipse></g>
<g fill="#262E44"><path d="M300 200 l6 -6 l8 2 l2 6z"></path><path d="M560 204 l5 -5 l7 2 l1 5z"></path></g>
<g transform="translate(70 120)">
<rect x="-3" y="0" width="6" height="76" fill="#4A5574" stroke="#1E2430" stroke-width="2.5"></rect>
<g stroke="#1E2430" stroke-width="1.5"><path d="M-3 16h6M-3 32h6M-3 48h6"></path></g>
<g transform="rotate(10)"><rect x="-44" y="-20" width="88" height="22" fill="#1C2236" stroke="#1E2430" stroke-width="3"></rect><g stroke="#2E374F" stroke-width="1.5"><path d="M-22 -20v22M0 -20v22M22 -20v22M-44 -9h88"></path></g></g>
<path d="M-24 6 v14 M-8 6 v14" stroke="#4A5574" stroke-width="1.2"></path>
<rect x="-34" y="20" width="36" height="14" rx="2" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<text x="-16" y="31" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="9" fill="#1E2430">NO SUN</text>
</g>
<path d="M76 196 C110 204 130 204 150 196" fill="none" stroke="#1E2430" stroke-width="3"></path>
<g transform="translate(150 172)"><rect x="0" y="0" width="40" height="30" rx="4" fill="#4A5574" stroke="#1E2430" stroke-width="3"></rect><rect x="6" y="6" width="6" height="18" rx="1" fill="#F26A1B"></rect><rect x="15" y="6" width="6" height="18" rx="1" fill="#262E44"></rect><rect x="24" y="6" width="6" height="18" rx="1" fill="#262E44"></rect><circle class="dv-blink" cx="35" cy="6" r="2.5" fill="#F26A1B"></circle></g>
<g transform="translate(210 112)">
<rect x="-6" y="68" width="190" height="14" rx="2" fill="#262E44"></rect>
<path d="M0 72 a46 46 0 0 1 92 0z" fill="#4A5574" stroke="#1E2430" stroke-width="4"></path>
<clipPath id="ln-dome"><path d="M0 72 a46 46 0 0 1 92 0z"></path></clipPath>
<g clip-path="url(#ln-dome)" stroke="#3A4460" stroke-width="4"><path d="M-4 36h100M-4 46h100M-4 56h100"></path></g>
<path d="M0 72 a46 46 0 0 1 92 0z" fill="none" stroke="#1E2430" stroke-width="4"></path>
<rect class="dv-blink" x="34" y="44" width="24" height="16" rx="8" fill="#F26A1B" opacity="0.85" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="90" y="54" width="20" height="18" fill="#3A4460" stroke="#1E2430" stroke-width="3"></rect>
<circle class="dv-blink-b" cx="100" cy="50" r="3.5" fill="#E0445E" stroke="#1E2430" stroke-width="1.5"></circle>
<path d="M108 72 a30 30 0 0 1 60 0z" fill="#2E3A3A" stroke="#1E2430" stroke-width="4"></path>
<path d="M122 72 c0-8 6-10 6-14 M136 72 c0-8-6-10-4-16 M150 72 c0-6 6-8 6-12" fill="none" stroke="#6B7A3A" stroke-width="2.5" stroke-linecap="round"></path>
<g transform="translate(178 30)">
<rect class="dv-glow" x="0" y="0" width="22" height="44" rx="10" fill="#4A5574" stroke="#F26A1B" stroke-width="3.5"></rect>
<circle cx="11" cy="16" r="7" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></circle>
<path d="M11 16 L6 20" stroke="#E0445E" stroke-width="2" stroke-linecap="round"></path>
<text x="11" y="36" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="8" fill="#FFB08A">O₂</text>
<rect x="6" y="44" width="10" height="24" fill="#3A4460" stroke="#1E2430" stroke-width="2"></rect>
</g>
<path d="M-28 50 v18 M-36 40 a10 6 0 0 0 16 0z" fill="#4A5574" stroke="#1E2430" stroke-width="2.5"></path>
</g>
<g fill="none" stroke="#4A5574" stroke-width="2.5" stroke-linecap="round"><path d="M330 198 l5 -3 M346 200 l5 -3 M362 198 l5 -3 M378 200 l5 -3 M394 198 l5 -3 M410 200 l5 -3 M426 198 l5 -3 M442 200 l5 -3 M458 198 l5 -3 M474 200 l5 -3 M490 198 l5 -3 M506 200 l5 -3 M522 198 l5 -3 M538 196 l5 -3"></path></g>
<g class="dv-walk" fill="#F5C518" opacity="0.18"><path d="M396 168 L432 206 L452 206Z"></path><path d="M446 166 L480 206 L500 206Z"></path><path d="M496 164 L528 204 L548 204Z"></path></g>
<g class="dv-walk" transform="translate(392 196)"><circle cx="0" cy="-34" r="8" fill="#F79A6B" stroke="#1E2430" stroke-width="2"></circle><rect x="-6" y="-38" width="12" height="6" rx="3" fill="#1E2430"></rect><circle cx="5" cy="-38" r="2" fill="#F5C518"></circle><rect x="-8" y="-25" width="16" height="20" rx="5" fill="#F79A6B" stroke="#1E2430" stroke-width="2"></rect><rect x="-7" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><rect x="1" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><rect x="9" y="-14" width="12" height="9" rx="1.5" fill="#D9A43A" stroke="#1E2430" stroke-width="1.5"></rect></g>
<g class="dv-walk" transform="translate(442 194)"><circle cx="0" cy="-34" r="8" fill="#8ED16C" stroke="#1E2430" stroke-width="2"></circle><rect x="-6" y="-38" width="12" height="6" rx="3" fill="#1E2430"></rect><circle cx="5" cy="-38" r="2" fill="#F5C518"></circle><rect x="-8" y="-25" width="16" height="20" rx="5" fill="#8ED16C" stroke="#1E2430" stroke-width="2"></rect><rect x="-7" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><rect x="1" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><path d="M10 -18 h10 l-2 8 h-6z" fill="#C2582C" stroke="#1E2430" stroke-width="1.5"></path><path d="M15 -18 c-4-6 0-10 0-10 c2 4 4 6 0 10" fill="#5CBF5A" stroke="#1E2430" stroke-width="1.2"></path></g>
<g class="dv-walk" transform="translate(492 192)"><circle cx="0" cy="-34" r="8" fill="#B99AF5" stroke="#1E2430" stroke-width="2"></circle><rect x="-6" y="-38" width="12" height="6" rx="3" fill="#1E2430"></rect><circle cx="5" cy="-38" r="2" fill="#F5C518"></circle><rect x="-8" y="-25" width="16" height="20" rx="5" fill="#B99AF5" stroke="#1E2430" stroke-width="2"></rect><rect x="-7" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><rect x="1" y="-6" width="6" height="12" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="1.5"></rect><rect x="9" y="-16" width="11" height="11" rx="2" fill="#F7F8F9" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="14.5" cy="-10.5" r="2.5" fill="#BDEBFF"></circle></g>
<g transform="translate(626 120)">
<path d="M0 -76 C26 -60 32 -30 32 6 L-32 6 C-32 -30 -26 -60 0 -76Z" fill="#DDE1E6" stroke="#1E2430" stroke-width="4"></path>
<path d="M-30 -20 h60" stroke="#F26A1B" stroke-width="7"></path>
<circle class="dv-glow" cx="0" cy="-44" r="10" fill="#F5C518" stroke="#1E2430" stroke-width="3.5"></circle>
<rect x="-8" y="-12" width="16" height="18" rx="2" fill="#F5C518" stroke="#1E2430" stroke-width="2.5"></rect>
<path d="M-32 -8 L-50 26 L-32 18Z M32 -8 L50 26 L32 18Z" fill="#F26A1B" stroke="#1E2430" stroke-width="3.5" stroke-linejoin="round"></path>
<path d="M-22 6 L-42 72 M22 6 L42 72 M-52 72 h18 M34 72 h18" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path>
<path d="M-8 6 L-40 76" stroke="#9AA3AF" stroke-width="7"></path>
<path d="M-8 6 L-40 76" stroke="#1E2430" stroke-width="1.5" stroke-dasharray="4 4"></path>
<path d="M-8 8 L-70 80 L-20 80Z" fill="#F5C518" opacity="0.15"></path>
</g>
</svg>
<p style="position: absolute; right: 12px; top: 12px; margin: 0; padding: 6px 12px; border-radius: 8px; background: rgba(7,11,22,0.85); color: #F3F4F6; font-size: 14px; font-weight: 600">Everyone is safe and heading home.</p>
</div>

<div class="dv-rise dv-d5" style="display: flex; gap: 16px; align-items: flex-start; padding: 12px 20px; border-radius: 16px; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 5px 0 #7C8592">
<svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"></path></svg>
<div><h2 style="margin: 0; font-weight: 800; font-size: 20px">Tip for next time</h2><p style="margin: 2px 0 0; font-size: 18px; line-height: 1.4">${esc(tip)}</p></div>
</div>
<div id="lesson" class="dv-rise dv-d6">${lessonBox("Loading a lesson from mission control...")}</div>

<div style="margin-top: auto; display: flex; gap: 18px; align-items: center">
${btn("again", "primary", 24, "14px 32px", "Try again")}
${btn("other", "light", 20, "14px 26px", "Change world")}
${btn("title", "light", 20, "14px 26px", "Title")}
<p style="margin: 0 0 0 4px; font-size: 15px; line-height: 1.4; color: #4A5363"><b>Leo:</b> "We'll get it next time, Commander!" Next world: ${esc(otherName)}.</p>
</div>
</div>

<div class="dv-rise dv-d4" style="width: 420px; flex-shrink: 0; box-sizing: border-box; padding: 22px; border-radius: 18px; background: #13211D; box-shadow: inset 0 0 0 5px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 14px">
<h2 style="margin: 0; font-weight: 700; font-size: 22px; color: #E4FFEC">Mission log: what went wrong</h2>
<svg role="img" aria-label="Bar chart of the four meters at the end. ${RES.map((k) => RES_INFO[k].name + " " + Math.max(0, Math.round(st[k] || 0))).join(", ")}.${empty ? " " + emptyName + " is empty." : ""}" width="376" height="204" viewBox="0 0 376 204">
<g stroke="#2B3833" stroke-width="1.5"><path d="M10 170h356"></path></g>
${bars}
</svg>
<p style="margin: 0; font-size: 15px; line-height: 1.4">${empty ? "<b style=\"color: #FFB08A\">" + esc(emptyName) + " reached 0</b> on sol " + esc(sol) + ". That ended the mission." : "The base could not keep going on sol " + esc(sol) + "."}</p>
<div>
<p style="margin: 0 0 4px; font-size: 14px; font-weight: 600">Your mission, sol by sol</p>
<svg role="img" aria-label="Timeline from sol 1 to sol ${esc(sol)}. The mission ended on sol ${esc(sol)}." width="376" height="56" viewBox="0 0 376 56">
<path d="M18 24H${endX}" stroke="#2B3833" stroke-width="2"></path>
${tl.join("")}
<text x="18" y="50" font-family="Lexend" font-size="12" fill="#7FA894">Sol 1</text>
<text x="${Math.min(endX, 346)}" y="50" text-anchor="${endX > 300 ? "end" : "start"}" font-family="Lexend" font-weight="700" font-size="12" fill="#FFB08A">Sol ${esc(sol)}: the end</text>
</svg>
</div>
</div>
</div>`;

  const on = (id, fn) => root.querySelector("#" + id).addEventListener("click", fn);
  on("again", () => ctx.go("briefing"));
  on("other", () => { ctx.store.site = ctx.store.site === "moon" ? "mars" : "moon"; ctx.go("briefing"); });
  on("title", () => ctx.go("title"));

  ctx.sfx("warning");

  let gone = false;
  (async () => {
    let text = FALLBACK_LESSON[empty] || "Every crew learns from the day things went wrong.";
    try {
      const r = await fetch("./content/lessons.json");
      const data = await r.json();
      const list = empty ? data["lost_" + empty] : null;
      if (Array.isArray(list) && list.length) text = list[Math.floor(Math.random() * list.length)];
    } catch (e) { /* keep the fallback line */ }
    const el = root.querySelector("#lesson");
    if (!gone && el) el.innerHTML = lessonBox(text);
  })();

  return () => { gone = true; };
}
