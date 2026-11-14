// Upgrades dialog: spend science points to build base upgrades.
import { esc } from "../parts.js";

const ART = {
  solar_array: "M12 22V10M8 22h8M3 4l9 4 9-4M5 9l7 3 7-3M3 4v5M21 4v5",
  greenhouse2: "M3 20h18M5 20v-7a7 7 0 0 1 14 0v7M12 20v-6M12 14c-2 0-3-1.5-3-3 2 0 3 1 3 3zM12 14c2 0 3-1.5 3-3-2 0-3 1-3 3z",
  recycler: "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4",
  thick_shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM12 7 7 9v3c0 3 2 5 5 6 3-1 5-3 5-6V9z",
};
const STAR = `<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>`;

export function showUpgrades(ctx) {
  return ctx.openOverlay((layer, close) => {
    let first = true;
    let justBought = null;

    function render(focusSel) {
      const st = ctx.store.state;
      const have = Math.floor(st.science || 0);
      const list = ctx.engine.getUpgrades(st);
      const cards = list.map((u, i) => {
        const need = Math.max(0, Math.ceil(u.cost - (st.science || 0)));
        const anim = first ? `dv-rise dv-d${i + 2}` : (u.id === justBought ? "dv-pop" : "");
        let action;
        if (u.owned) {
          action = `<div class="${u.id === justBought ? "dv-bump-a" : ""}" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 14px; min-height: 44px; border-radius: 14px; background: #DDF3D8; border: 3px solid #1F7A35; color: #1F5A2A; font-weight: 800; font-size: 20px"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"></path></svg>Built</div>`;
        } else if (u.canBuy) {
          action = `<button type="button" class="dv-key" data-build="${esc(u.id)}" aria-label="Build ${esc(u.label)} for ${u.cost} science points" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 14px; min-height: 44px; border-radius: 14px; cursor: pointer; background: #F26A1B; border: 3px solid #1E2430; box-shadow: 0 6px 0 #8E3A0B; color: #1E2430; font-family: inherit; font-weight: 800; font-size: 20px">Build for ${u.cost}</button>`;
        } else {
          action = `<button type="button" disabled aria-disabled="true" data-build="${esc(u.id)}" style="display: flex; justify-content: center; text-align: center; padding: 14px; min-height: 44px; border-radius: 14px; background: #DDE1E6; border: 3px dashed #7C8592; color: #4A5363; font-family: inherit; font-weight: 700; font-size: 18px">Costs ${u.cost} · need ${need} more</button>`;
        }
        return `<div class="${anim}" style="position: relative; padding: 20px; border-radius: 18px; background: #EEF0F2; box-shadow: 0 4px 0 #9AA3AF; display: flex; flex-direction: column; gap: 14px">
<div style="height: 160px; border-radius: 14px; background: #1D3A66; box-shadow: inset 0 0 0 4px #2E5590; display: flex; align-items: center; justify-content: center">
<svg class="dv-breathe" aria-hidden="true" width="116" height="116" viewBox="0 0 24 24" fill="none" stroke="#CFE3FF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="${ART[u.id] || ART.thick_shield}"></path></svg>
</div>
<h2 style="margin: 0; font-weight: 800; font-size: 24px; line-height: 1.15">${esc(u.label)}</h2>
<p style="margin: 0; font-size: 18px; line-height: 1.45">${esc(u.text)}</p>
<div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px">
<p style="margin: 0; font-size: 17px; font-weight: 700; color: #4A5363">Cost: ${u.cost} science points</p>
${action}
</div></div>`;
      }).join("");

      const dialogCls = first ? "dv-dialog" : "";
      layer.innerHTML = `<div class="dv-dim" aria-hidden="true" style="${first ? "" : "animation: none; "}position: absolute; inset: 0; background: rgba(30,36,48,.55)"></div>
<div class="${dialogCls}" role="dialog" aria-modal="true" aria-labelledby="up-title" style="position: absolute; left: 40px; top: 28px; width: 1200px; height: 744px; box-sizing: border-box; padding: 28px 36px; border-radius: 24px; background: #C9CED6; border: 4px solid #1E2430; box-shadow: 0 10px 0 #1E2430; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; flex-direction: column; gap: 22px; overflow: hidden">
<div style="display: flex; align-items: center; gap: 20px">
<div style="display: flex; flex-direction: column"><h1 id="up-title" style="margin: 0; font-weight: 800; font-size: 44px; letter-spacing: -0.02em">Build an upgrade</h1><p style="margin: 0; font-size: 19px; color: #4A5363">Spend science points to make your base stronger.</p></div>
<div id="up-sci" class="${justBought ? "dv-bump-b" : ""}" role="status" aria-label="You have ${have} science points" style="margin-left: auto; height: 60px; box-sizing: border-box; padding: 0 20px; border-radius: 14px; background: #FFF1C9; border: 3px solid #1E2430; display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 30px; font-variant-numeric: tabular-nums">${STAR}${have} <span style="font-size: 17px; font-weight: 600">to spend</span></div>
<button type="button" id="up-close" class="dv-key" style="min-width: 120px; height: 60px; padding: 0 22px; border-radius: 14px; background: #F7F8F9; border: 3px solid #1E2430; box-shadow: 0 5px 0 #7C8592; color: #1E2430; font-family: inherit; font-weight: 800; font-size: 20px; cursor: pointer">Close</button>
</div>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; flex-grow: 1; min-height: 0">${cards}</div>
<div style="display: flex; gap: 12px; align-items: flex-start; padding: 14px 18px; border-radius: 12px; background: #FFF1C9; border: 2px dashed #B8862A">
<svg role="img" aria-label="True NASA fact" width="30" height="30" viewBox="0 0 24 24" style="flex-shrink: 0"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>
<p style="margin: 0; font-size: 18px; line-height: 1.45"><b>True NASA fact:</b> The International Space Station recycles about 98% of its water. Even sweat gets cleaned and turned back into drinking water!</p>
</div></div>`;

      layer.querySelector("#up-close").addEventListener("click", () => close());
      layer.querySelectorAll("button[data-build]:not([disabled])").forEach((b) => b.addEventListener("click", () => {
        ctx.store.state = ctx.engine.buyUpgrade(ctx.store.state, b.dataset.build);
        ctx.sfx("good");
        justBought = b.dataset.build;
        first = false;
        render("#up-close");
      }));
      first = false;
      const target = (focusSel && layer.querySelector(focusSel)) || layer.querySelector("button[data-build]:not([disabled])") || layer.querySelector("#up-close");
      if (target) target.focus();
    }
    render();
  });
}
