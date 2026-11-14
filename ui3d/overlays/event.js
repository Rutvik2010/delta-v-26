// Event dialog: a Sun/space alert that sits over the live game screen.
import { COLORS, CREW, factBox, helmet, effectTexts, dateText, esc } from "../parts.js";

const ART = {
  solar_flare: `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><g class="dv-spin-fast" stroke="#1E2430" stroke-width="6" stroke-linecap="round"><path d="M60 6v14M60 100v14M6 60h14M100 60h14M22 22l10 10M88 88l10 10M22 98l10-10M88 32l10-10"></path></g><circle cx="60" cy="60" r="32" fill="#F5C518" stroke="#1E2430" stroke-width="5"></circle><path class="dv-glow" d="M80 34c14 6 20 18 16 30" stroke="#F26A1B" stroke-width="9" fill="none" stroke-linecap="round"></path><circle cx="50" cy="56" r="4" fill="#1E2430"></circle><circle cx="68" cy="56" r="4" fill="#1E2430"></circle><path d="M50 72c6-5 14-5 20 0" stroke="#1E2430" stroke-width="4" fill="none" stroke-linecap="round"></path></svg>`,
  dust_storm: `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><circle cx="60" cy="60" r="46" fill="#E8B88A" stroke="#1E2430" stroke-width="5"></circle><g class="dv-spin" style="transform-origin: 60px 60px" fill="none" stroke="#1E2430" stroke-width="6" stroke-linecap="round"><path d="M28 48c14-12 30-10 38 0s-2 20-12 14"></path><path d="M92 70c-14 12-30 10-38 0s2-20 12-14"></path></g><path d="M24 84c12 6 24 6 36 0" stroke="#B8862A" stroke-width="5" fill="none" stroke-linecap="round"></path><circle cx="46" cy="38" r="3" fill="#1E2430"></circle><circle cx="78" cy="86" r="3" fill="#1E2430"></circle></svg>`,
  micrometeorite: `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><g class="dv-glow" stroke="#F26A1B" stroke-width="8" stroke-linecap="round"><path d="M8 14l40 34"></path><path d="M6 48l30 20" stroke="#F5C518"></path><path d="M30 8l26 28" stroke="#F5C518"></path></g><path d="M62 44l22-8 20 14 4 24-14 22-26 4-18-16-2-22z" fill="#9AA3AF" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"></path><circle cx="76" cy="62" r="6" fill="#7C8592" stroke="#1E2430" stroke-width="3"></circle><circle cx="94" cy="76" r="4" fill="#7C8592" stroke="#1E2430" stroke-width="3"></circle></svg>`,
  equipment_failure: `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><g class="dv-spin" style="transform-origin: 52px 68px"><path d="M52 22l10 0 3 10 9 4 9-5 7 7-5 9 4 9 10 3v10l-10 3-4 9 5 9-7 7-9-5-9 4-3 10H52l-3-10-9-4-9 5-7-7 5-9-4-9-10-3V66l10-3 4-9-5-9 7-7 9 5 9-4z" transform="translate(52 68) scale(.78) translate(-52 -68)" fill="#C9CED6" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"></path></g><circle cx="52" cy="68" r="13" fill="#EEF0F2" stroke="#1E2430" stroke-width="5"></circle><path class="dv-glow" d="M96 12 84 36h12L84 62" fill="none" stroke="#F5C518" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M96 12 84 36h12L84 62" fill="none" stroke="#1E2430" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  comm_blackout: `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><path d="M24 78c0-26 18-44 44-44l-8 34z" fill="#EEF0F2" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"></path><path d="M60 68l-14 34M36 102h40" stroke="#1E2430" stroke-width="6" stroke-linecap="round"></path><circle cx="68" cy="34" r="6" fill="#F26A1B" stroke="#1E2430" stroke-width="3"></circle><g class="dv-glow" fill="none" stroke="#1E2430" stroke-width="5" stroke-linecap="round"><path d="M82 52c8 4 12 10 12 18"></path><path d="M92 40c12 6 18 16 18 30"></path></g><path d="M78 96l32-40" stroke="#B3261E" stroke-width="8" stroke-linecap="round"></path></svg>`,
};
const ART_FALLBACK = `<svg aria-hidden="true" width="120" height="120" viewBox="0 0 120 120" style="flex-shrink: 0"><circle cx="60" cy="60" r="44" fill="#F5C518" stroke="#1E2430" stroke-width="5"></circle><path d="M60 34v32" stroke="#1E2430" stroke-width="8" stroke-linecap="round"></path><circle cx="60" cy="84" r="5" fill="#1E2430"></circle></svg>`;

const SHELTER = `<path d="M3 11 12 4l9 7v9H3z"></path><path d="M9 20v-5h6v5"></path>`;
const WORK = `<path d="M14 4l6 6-9 9H5v-6z"></path><path d="M12 6l6 6"></path>`;
const choiceSvg = (i, id) =>
  `<svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0">${/shelter|hide|wait|safe|stay/i.test(id) || i === 0 ? SHELTER : WORK}</svg>`;

export function showEvent(ctx, event) {
  ctx.store.facts += 1;
  ctx.sfx(event.id === "solar_flare" ? "flare" : "warning");
  const sol = ctx.store.state.sol;
  const hasChoices = Array.isArray(event.choices) && event.choices.length > 0;
  const choices = hasChoices ? event.choices : [{ id: "ok", label: "Got it!", text: "", effects: {} }];
  const zuri = CREW.find((c) => c.id === "zuri");
  const art = ART[event.id] || ART_FALLBACK;

  return ctx.openOverlay((layer, close) => {
    const flare = event.flare
      ? `<div class="dv-pop dv-d5" style="flex-shrink: 0; padding: 14px 20px; border-radius: 14px; background: ${COLORS.screen}; box-shadow: inset 0 0 0 4px ${COLORS.screenRing}; color: ${COLORS.phosphor}; text-align: center">
<p style="margin: 0; font-size: 14px; font-weight: 600">Real flare</p>
<p style="margin: 0; font-size: 46px; font-weight: 800; line-height: 1.05; color: ${COLORS.phosphorBright}; font-variant-numeric: tabular-nums">${esc(event.flare.class)}</p>
<p style="margin: 0; font-size: 14px; font-weight: 600">${esc(dateText(event.flare.date))}</p></div>`
      : "";

    const keys = choices.map((c, i) => {
      const fx = effectTexts(c.effects || {});
      const fxHtml = fx.map((t) => `<span style="font-size: 18px; font-weight: 700; color: ${COLORS.cost}">${esc(t)}</span>`).join("");
      const look = hasChoices
        ? "align-items: flex-start; text-align: left; background: #F7F8F9; box-shadow: 0 7px 0 #7C8592"
        : "align-items: center; text-align: center; background: #F26A1B; box-shadow: 0 7px 0 #8E3A0B";
      return `<button type="button" class="dv-key" data-c="${esc(c.id)}" style="display: flex; flex-direction: column; ${look}; gap: 10px; padding: 20px 22px; min-height: 44px; border-radius: 18px; border: 3px solid #1E2430; color: #1E2430; font-family: inherit; cursor: pointer">
<span style="display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 28px">${hasChoices ? choiceSvg(i, c.id) : ""}${esc(c.label)}</span>
${c.text ? `<span style="font-size: 19px; line-height: 1.4">${esc(c.text)}</span>` : ""}
${fxHtml}</button>`;
    }).join("");

    const grid = hasChoices
      ? `<div style="display: grid; grid-template-columns: repeat(${Math.min(choices.length, 2)}, minmax(0, 1fr)); gap: 22px; padding-bottom: 8px">${keys}</div>`
      : `<div style="display: flex; justify-content: center; padding-bottom: 8px"><div style="width: 320px; display: flex; flex-direction: column">${keys}</div></div>`;

    const title = String(event.title || "");
    layer.innerHTML = `<div class="dv-dim" aria-hidden="true" style="position: absolute; inset: 0; background: rgba(30,36,48,.55)"></div>
<div class="dv-dialog" role="dialog" aria-modal="true" aria-labelledby="ev-title" style="position: absolute; left: 200px; top: 40px; width: 880px; height: 720px; box-sizing: border-box; border-radius: 24px; background: #EEF0F2; border: 4px solid #1E2430; box-shadow: 0 10px 0 #1E2430; overflow: hidden; display: flex; flex-direction: column; font-family: Lexend, system-ui, sans-serif; color: #1E2430">
<div class="dv-stripes" aria-hidden="true" style="height: 26px; flex-shrink: 0; border-bottom: 4px solid #1E2430; background: repeating-linear-gradient(-45deg, #F26A1B 0 22px, #1E2430 22px 44px)"></div>
<div style="padding: 24px 36px 26px; display: flex; flex-direction: column; gap: 18px; flex-grow: 1; min-height: 0">
<div style="display: flex; align-items: center; gap: 26px">
${art}
<div style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1; min-width: 0">
<p style="margin: 0; font-size: 20px; font-weight: 600; color: #4A5363">Sol ${esc(sol)} alert</p>
<h1 id="ev-title" style="margin: 0; font-weight: 800; font-size: ${title.length > 18 ? 46 : 64}px; line-height: 1.05; letter-spacing: -0.02em">${esc(title)}</h1>
</div>
${flare}
</div>
<p class="dv-rise dv-d4" style="margin: 0; font-size: 23px; line-height: 1.45">${esc(event.text)}</p>
${grid}
<div class="dv-rise dv-d8">${factBox(event.realFact || "", 17)}</div>
<div style="margin-top: auto; display: flex; align-items: center; gap: 12px">
${helmet(zuri.color, 40)}
<p style="margin: 0; font-size: 18px"><b>Zuri:</b> ${hasChoices ? "It's your call, Commander." : "Okay, Commander. We are ready for the next sol."}</p>
</div>
</div></div>`;

    layer.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => close(b.dataset.c)));
    const first = layer.querySelector("[data-c]");
    if (first) first.focus();
  }, { noEscape: hasChoices });
}
