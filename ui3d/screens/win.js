// Win screen: the supply ship lands, stars pop in one by one, real mission log.
import { keycap, esc, SITES } from "../parts.js";

const STAR = "m12 2 3 6.2 6.8 1-4.9 4.8 1.1 6.7L12 17.5l-6 3.2 1.1-6.7-4.9-4.8 6.8-1z";

const lessonBox = (text) =>
  `<div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FFF1C9; border: 2px dashed #B8862A; color: #1E2430">` +
  `<svg role="img" aria-label="Mission lesson" width="30" height="30" viewBox="0 0 24 24" style="flex-shrink: 0"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>` +
  `<p style="margin: 0; font-size: 15px; line-height: 1.4"><b>Mission lesson:</b> ${esc(text)}</p></div>`;

export async function mount(root, ctx) {
  const st = ctx.store.state;
  const stars = Math.max(0, Math.min(3, ctx.engine.getStars(st)));
  const tasksDone = ctx.engine.getTasks(st).filter((t) => t.status === "done").length;
  const science = (st.stats && st.stats.scienceEarned) || 0;
  const facts = ctx.store.facts || 0;
  const dataText = ctx.dataLabel().text;
  const otherName = ctx.store.site === "moon" ? SITES.mars.name : SITES.moon.name;
  const labels = ["You survived", tasksDone >= 2 ? "Most goals done" : "Goals going", "All 3 goals done"];
  const timers = [];

  const starSlot = (i) => {
    const on = i < stars;
    const delay = (0.9 + i * 0.45).toFixed(2);
    return `<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border-radius: 14px; background: ${on ? "#1B2440" : "#141B30"}; border: 3px ${on ? "solid #F5C518" : "dashed #5A6478"}">
<svg aria-hidden="true" class="${on ? "dv-pop" : ""}" style="${on ? "animation-delay: " + delay + "s; opacity: 0" : ""}" width="62" height="62" viewBox="0 0 24 24"><path d="${STAR}" ${on ? 'fill="#F5C518" stroke="#1E2430"' : 'fill="none" stroke="#7C8592"'} stroke-width="1.4" stroke-linejoin="round"></path></svg>
<span style="font-size: 15px; font-weight: 600; text-align: center; ${on ? "" : "color: #9AA6BD"}">${labels[i]}</span></div>`;
  };

  const howMore = stars < 3
    ? `<p style="margin: 0; font-size: 15px; line-height: 1.4; color: #C9D2E3">Finish all three Mission Control goals for 3 stars.</p>` : "";
  const btn = (id, variant, size, pad, text) =>
    `<button type="button" id="${id}" class="dv-key" style="${keycap(variant, `display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: ${pad}; font-size: ${size}px`)}">${text}</button>`;

  root.innerHTML = `
<div style="width: 1280px; height: 800px; position: relative; overflow: hidden; background: #0E1424; font-family: Lexend, system-ui, sans-serif; color: #F3F4F6">
<svg role="img" aria-label="The supply ship has landed next to the base. Dust is settling, and Maya, Leo and Zuri wave hello." width="1280" height="800" viewBox="0 0 1280 800" style="position: absolute; left: 0; top: 0">
<g fill="#F3F4F6"><circle class="dv-twinkle" cx="90" cy="70" r="1.5" opacity="0.6"></circle><circle class="dv-twinkle-b" cx="420" cy="40" r="1.2" opacity="0.5"></circle><circle class="dv-twinkle" cx="640" cy="90" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="780" cy="30" r="1.6" opacity="0.6"></circle><circle class="dv-twinkle" cx="1180" cy="60" r="1.8" opacity="0.7"></circle><circle class="dv-twinkle-b" cx="1000" cy="160" r="1.2" opacity="0.4"></circle><circle class="dv-twinkle" cx="1240" cy="220" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="860" cy="200" r="1.3" opacity="0.5"></circle></g>
<g class="dv-bob" transform="translate(1150 130)"><circle r="40" fill="#3D7BD9" stroke="#1E2430" stroke-width="4"></circle><path d="M-28 -12 C-18 -26 -2 -22 0 -12 C2 -2 -8 2 -10 10 C-12 18 -24 14 -28 6Z" fill="#5CBF5A"></path><path d="M8 -30 C20 -28 26 -18 22 -10 C16 -4 8 -10 6 -18Z" fill="#5CBF5A"></path><g fill="none" stroke="#F3F4F6" stroke-width="3" stroke-linecap="round"><path d="M-32 0 C-20 -4 -8 0 0 -2"></path><path d="M-4 30 C6 26 16 32 26 28"></path></g><path d="M4 -40 A40 40 0 0 1 4 40 A30 40 0 0 0 4 -40Z" fill="#0E1424" opacity="0.4"></path></g>
<path d="M0 600 C220 576 460 610 700 590 C920 572 1100 600 1280 586 L1280 800 L0 800Z" fill="#B3B8C5"></path>
<path d="M0 660 C260 640 520 676 780 656 C1000 640 1150 664 1280 652 L1280 800 L0 800Z" fill="#CDD0D9"></path>
<g><ellipse cx="220" cy="740" rx="80" ry="12" fill="#9CA1B0"></ellipse><path d="M140 740 a80 12 0 0 1 160 0" fill="none" stroke="#E6E8EE" stroke-width="3"></path></g>
<g><ellipse cx="620" cy="760" rx="50" ry="8" fill="#9CA1B0"></ellipse></g>
<g transform="translate(640 560)">
<rect x="-10" y="40" width="250" height="16" rx="3" fill="#9CA1B0"></rect>
<path d="M0 44 a56 56 0 0 1 112 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="5"></path>
<clipPath id="w-dome"><path d="M0 44 a56 56 0 0 1 112 0z"></path></clipPath>
<g clip-path="url(#w-dome)" stroke="#B3B8C5" stroke-width="4"><path d="M-4 8h120M-4 20h120M-4 32h120"></path></g>
<path d="M0 44 a56 56 0 0 1 112 0z" fill="none" stroke="#1E2430" stroke-width="5"></path>
<circle class="dv-glow" cx="56" cy="22" r="7" fill="#F5C518" stroke="#1E2430" stroke-width="3"></circle>
<rect x="110" y="26" width="22" height="18" fill="#DDE1E6" stroke="#1E2430" stroke-width="3"></rect>
<path d="M130 44 a38 38 0 0 1 76 0z" fill="#DDF3D8" stroke="#1E2430" stroke-width="5"></path>
<path d="M146 44 v-12 M158 44 v-18 M170 44 v-20 M182 44 v-16 M194 44 v-10" stroke="#2F7A2C" stroke-width="3" stroke-linecap="round"></path>
<rect x="224" y="-40" width="6" height="84" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<g transform="rotate(-12 227 -44)"><rect x="190" y="-56" width="74" height="24" fill="#D9A43A" stroke="#1E2430" stroke-width="4"></rect><path d="M208 -56v24M227 -56v24M246 -56v24" stroke="#1E2430" stroke-width="2"></path></g>
</g>
<path class="dv-dust" d="M880 640 C920 600 1080 600 1140 640 C1100 660 920 662 880 640Z" fill="#E6E8EE" opacity="0.8"></path>
<path class="dv-dust" d="M860 650 C900 624 940 632 960 620 M1160 650 C1120 624 1090 630 1070 618" fill="none" stroke="#E6E8EE" stroke-width="6" stroke-linecap="round" opacity="0.8"></path>
<g class="dv-land" transform="translate(1010 560)">
<path class="dv-flame" d="M-18 -16 C-12 34 12 34 18 -16Z" fill="#F5C518" stroke="#1E2430" stroke-width="3"></path>
<path d="M0 -230 C40 -190 48 -120 48 -40 L-48 -40 C-48 -120 -40 -190 0 -230Z" fill="#F7F8F9" stroke="#1E2430" stroke-width="7"></path>
<path d="M-44 -110 h88" stroke="#F26A1B" stroke-width="12"></path>
<circle cx="0" cy="-160" r="18" fill="#4BA3F0" stroke="#1E2430" stroke-width="6"></circle>
<path d="M-6 -168 a8 8 0 0 1 10 -2" stroke="#F3F4F6" stroke-width="3" fill="none" stroke-linecap="round"></path>
<path d="M-48 -90 L-86 -30 L-48 -44Z M48 -90 L86 -30 L48 -44Z" fill="#F26A1B" stroke="#1E2430" stroke-width="6" stroke-linejoin="round"></path>
<rect x="-30" y="-40" width="60" height="26" fill="#9AA3AF" stroke="#1E2430" stroke-width="5"></rect>
<path d="M-36 -40 L-70 60 M36 -40 L70 60 M-86 60 h32 M54 60 h32" stroke="#1E2430" stroke-width="7" stroke-linecap="round"></path>
<rect x="-14" y="-90" width="28" height="40" rx="4" fill="#DDE1E6" stroke="#1E2430" stroke-width="4"></rect>
<path d="M14 -70 L44 60" stroke="#9AA3AF" stroke-width="10"></path>
<path d="M14 -70 L44 60" stroke="#1E2430" stroke-width="2" stroke-dasharray="6 6"></path>
</g>
<g class="dv-cheer" transform="translate(560 650)"><circle cx="0" cy="-58" r="14" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-62" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-14" y="-44" width="28" height="38" rx="8" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></rect><path d="M14 -38 l18 -24" stroke="#1E2430" stroke-width="6" stroke-linecap="round"></path><rect x="-12" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect></g>
<g class="dv-cheer-b" transform="translate(860 660)"><circle cx="0" cy="-58" r="14" fill="#8ED16C" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-62" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-14" y="-44" width="28" height="38" rx="8" fill="#8ED16C" stroke="#1E2430" stroke-width="3"></rect><path d="M-14 -38 l-18 -24 M14 -38 l18 -24" stroke="#1E2430" stroke-width="6" stroke-linecap="round"></path><rect x="-12" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect></g>
<g class="dv-cheer-c" transform="translate(920 670)"><circle cx="0" cy="-58" r="14" fill="#B99AF5" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-62" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-14" y="-44" width="28" height="38" rx="8" fill="#B99AF5" stroke="#1E2430" stroke-width="3"></rect><path d="M14 -38 l20 -16" stroke="#1E2430" stroke-width="6" stroke-linecap="round"></path><rect x="-12" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-8" width="10" height="28" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect></g>
<path d="M600 680 C680 690 760 690 840 676" fill="none" stroke="#9CA1B0" stroke-width="3" stroke-dasharray="3 7"></path>
</svg>

<div class="dv-rise" style="position: absolute; left: 72px; top: 40px; width: 640px; display: flex; flex-direction: column; gap: 12px">
<p style="margin: 0; font-size: 21px; font-weight: 600; color: #A8F5C2">Sol ${esc(st.sol)} · the supply ship has landed!</p>
<h1 style="margin: 0; font-weight: 800; font-size: 84px; line-height: 0.95; letter-spacing: -0.03em">Mission complete</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.5; color: #C9D2E3">Maya, Leo and Zuri all made it, Commander. You kept the base running for ${esc(st.sol)} sols.</p>
</div>

<div class="dv-rise dv-d6" style="position: absolute; left: 72px; top: 250px; width: 500px; display: flex; flex-direction: column; gap: 12px">
<div role="img" aria-label="You earned ${stars} of 3 stars" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">${[0, 1, 2].map(starSlot).join("")}</div>
${howMore}
<div style="padding: 14px 18px; border-radius: 14px; background: #13211D; box-shadow: inset 0 0 0 4px #2B3833; color: #A8F5C2; display: flex; flex-direction: column; gap: 8px">
<p style="margin: 0; font-weight: 700; font-size: 16px; color: #E4FFEC">Mission log</p>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; font-variant-numeric: tabular-nums">
<div><span style="display: block; font-size: 26px; font-weight: 800; color: #E4FFEC">${esc(st.sol)}</span><span style="font-size: 13px">sols survived</span></div>
<div><span style="display: block; font-size: 26px; font-weight: 800; color: #E4FFEC">${tasksDone} of 3</span><span style="font-size: 13px">goals done</span></div>
<div><span style="display: block; font-size: 26px; font-weight: 800; color: #E4FFEC">${esc(science)}</span><span style="font-size: 13px">science earned</span></div>
<div><span style="display: block; font-size: 26px; font-weight: 800; color: #E4FFEC">${esc(facts)}</span><span style="font-size: 13px">real facts seen</span></div>
</div>
<p style="margin: 0; padding-top: 8px; border-top: 2px solid #2B3833; font-size: 14px; line-height: 1.4">Weather and flares: <b style="color: #E4FFEC">${esc(dataText)}</b></p>
</div>
<div id="lesson" style="min-height: 74px">${lessonBox("Loading a lesson from mission control...")}</div>
</div>

<div class="dv-drop dv-d8" style="position: absolute; right: 64px; top: 56px; display: flex; gap: 14px; align-items: center">
${btn("title", "panel", 18, "12px 20px", "Title")}
${btn("other", "panel", 20, "14px 22px", "Try " + esc(otherName) + " next")}
${btn("again", "primary", 22, "16px 26px", "Play again")}
</div>
<p class="dv-pop" style="animation-delay: 2.4s; opacity: 0; position: absolute; left: 660px; top: 430px; margin: 0; padding: 10px 14px; border-radius: 16px 16px 16px 4px; background: #F7F8F9; border: 3px solid #1E2430; color: #1E2430; font-size: 16px; line-height: 1.4; max-width: 200px"><b>Leo:</b> Fresh food on the ship? Yes please!</p>
</div>`;

  const on = (id, fn) => root.querySelector("#" + id).addEventListener("click", fn);
  on("again", () => ctx.go("briefing"));
  on("other", () => { ctx.store.site = ctx.store.site === "moon" ? "mars" : "moon"; ctx.go("briefing"); });
  on("title", () => ctx.go("title"));

  // Stars pop one after another with a chime each.
  ctx.sfx("good");
  for (let i = 1; i < stars; i++) timers.push(setTimeout(() => ctx.sfx("good"), 900 + i * 450));

  let gone = false;
  (async () => {
    let text = "Careful planning keeps a crew safe, on Earth and far away.";
    try {
      const r = await fetch("./content/lessons.json");
      const data = await r.json();
      if (Array.isArray(data.won) && data.won.length) text = data.won[Math.floor(Math.random() * data.won.length)];
    } catch (e) { /* keep the fallback line */ }
    const el = root.querySelector("#lesson");
    if (!gone && el) el.innerHTML = lessonBox(text);
  })();

  return () => { gone = true; timers.forEach(clearTimeout); };
}
