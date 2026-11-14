// Choose base screen, ported from ChooseBase.dc.html.
import { SITES, screws, factBox, esc } from "../parts.js";

const ICON = (inner, extra = 'stroke-linecap="round"') =>
  `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E2430" stroke-width="2.4" ${extra}>${inner}</svg>`;

const BULLET_ICONS = {
  moon: [
    ICON(`<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>`),
    ICON(`<circle cx="9" cy="15" r="4"></circle><path d="M13 11l7-7"></path>`),
    ICON(`<circle cx="9" cy="14" r="5"></circle><circle cx="17" cy="7" r="3"></circle>`, ""),
  ],
  mars: [
    ICON(`<circle cx="12" cy="12" r="3"></circle><path d="M12 4v1M12 19v1M4 12h1M19 12h1"></path>`),
    ICON(`<path d="M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h9"></path>`),
    ICON(`<circle cx="9" cy="14" r="5"></circle><circle cx="17" cy="7" r="3"></circle>`, ""),
  ],
};

const WINDOWS = {
  moon: `<svg role="img" aria-label="Window view of the Moon's grey surface" width="170" height="170" viewBox="0 0 170 170" style="flex-shrink: 0"><circle cx="85" cy="85" r="82" fill="#1E2430"></circle><circle cx="85" cy="85" r="70" fill="#0E1424"></circle><clipPath id="mw"><circle cx="85" cy="85" r="70"></circle></clipPath><g clip-path="url(#mw)"><circle class="dv-bob" cx="122" cy="52" r="14" fill="#3D7BD9"></circle><path d="M10 112 C50 98 90 112 160 100 L160 170 L10 170Z" fill="#C9CCD6"></path><ellipse cx="60" cy="134" rx="20" ry="5" fill="#A9ADBB"></ellipse><ellipse cx="118" cy="128" rx="14" ry="4" fill="#A9ADBB"></ellipse></g><circle class="dv-spin" cx="85" cy="85" r="76" fill="none" stroke="#7C8592" stroke-width="4" stroke-dasharray="2 14"></circle></svg>`,
  mars: `<svg role="img" aria-label="Window view of Mars' red, dusty ground" width="170" height="170" viewBox="0 0 170 170" style="flex-shrink: 0"><circle cx="85" cy="85" r="82" fill="#1E2430"></circle><circle cx="85" cy="85" r="70" fill="#E8B48A"></circle><clipPath id="rw"><circle cx="85" cy="85" r="70"></circle></clipPath><g clip-path="url(#rw)"><circle class="dv-glow" cx="58" cy="54" r="8" fill="#FFF3DC"></circle><path d="M10 104 C40 92 70 100 100 92 C130 86 150 96 160 92 L160 170 L10 170Z" fill="#C2582C"></path><path d="M10 128 C60 118 110 132 160 120 L160 170 L10 170Z" fill="#A4471F"></path><ellipse cx="112" cy="140" rx="10" ry="5" fill="#7E3517"></ellipse></g><circle class="dv-spin" cx="85" cy="85" r="76" fill="none" stroke="#7C8592" stroke-width="4" stroke-dasharray="2 14"></circle></svg>`,
};

function card(id, anim, btnStyle) {
  const s = SITES[id];
  const tag = s.tag
    ? `<span class="dv-pop dv-d8" style="position: absolute; right: 34px; top: 30px; transform: rotate(6deg); padding: 8px 14px; border-radius: 8px; background: #F3D23A; border: 3px solid #1E2430; font-weight: 800; font-size: 16px">${esc(s.tag)}</span>`
    : "";
  return `<div class="${anim}" style="position: relative; padding: 28px; border-radius: 18px; background: #EEF0F2; box-shadow: 0 4px 0 #9AA3AF; display: flex; flex-direction: column; gap: 18px">
${screws()}
<div style="display: flex; gap: 24px; align-items: center">
${WINDOWS[id]}
<div style="display: flex; flex-direction: column; gap: 4px">
<h2 style="margin: 0; font-weight: 800; font-size: 44px; letter-spacing: -0.02em">${esc(s.name)}</h2>
<p style="margin: 0; font-size: 20px; color: #4A5363">${esc(s.place)}</p>
</div>
</div>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 20px">
${s.bullets.map((b, i) => `<li style="display: flex; gap: 12px; align-items: center">${BULLET_ICONS[id][i]}${esc(b)}</li>`).join("")}
</ul>
${factBox(s.fact)}
<button type="button" data-site="${id}" class="dv-key" style="margin-top: auto; display: flex; justify-content: center; padding: 18px; border-radius: 16px; ${btnStyle} border: 3px solid #1E2430; color: #1E2430; font-family: inherit; cursor: pointer; font-weight: 800; font-size: 26px">${esc(s.button)}</button>
${tag}
</div>`;
}

export function mount(root, ctx) {
  root.innerHTML = `<div style="width: 1280px; height: 800px; box-sizing: border-box; padding: 36px 48px; background: #C9CED6; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; flex-direction: column; gap: 24px">
<div style="display: flex; align-items: center; gap: 20px">
<button type="button" id="c-back" aria-label="Back to title" style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: #EEF0F2; border: 3px solid #1E2430; box-shadow: 0 5px 0 #7C8592; color: #1E2430; cursor: pointer; padding: 0">
<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>
<h1 class="dv-drop" style="margin: 0; font-weight: 800; font-size: 48px; letter-spacing: -0.02em">Where will you build your base?</h1>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; flex-grow: 1">
${card("moon", "dv-rise dv-d2", "background: #F26A1B; box-shadow: 0 6px 0 #8E3A0B;")}
${card("mars", "dv-rise dv-d4", "background: #F7F8F9; box-shadow: 0 6px 0 #7C8592;")}
</div>
</div>`;

  root.querySelector("#c-back").addEventListener("click", () => { ctx.sfx("click"); ctx.go("title"); });
  root.querySelectorAll("[data-site]").forEach((b) => b.addEventListener("click", () => {
    ctx.sfx("click");
    ctx.store.site = b.dataset.site;
    ctx.go("briefing");
  }));
}
