// Task: memorise the order, then open the four valves from memory. A wrong valve shuts them all.
// Buttons, or press 1-4 (left to right).
const S = {
  circle: "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z",
  tri: "M12 3 22 20H2z",
  square: "M4 4h16v16H4z",
  star: "m12 2 3 6.2 6.8 1-4.9 4.8 1.1 6.7L12 17.5l-6 3.2 1.1-6.7-4.9-4.8 6.8-1z",
};
const NAMES = { circle: "circle", tri: "triangle", square: "square", star: "star" };
const ROW = ["circle", "square", "tri", "star"];
const XS = [309, 469, 629, 789];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function mount(api) {
  const row = shuffle(ROW); // the valves stand in a new order every time
  const order = shuffle(ROW);
  let done = 0;
  let showing = true; // the order is on screen only while this is true
  let wrong = -1, wn = 0;

  api.body.innerHTML =
    `<div style="position: relative; flex-grow: 1; border-radius: 24px; border: 6px solid #1E2430; background: #E4E7EC; overflow: hidden">` +
    `<svg aria-hidden="true" width="1172" height="548" viewBox="0 0 1172 548" style="position: absolute; left: 0; top: 0">` +
    `<g stroke="#CDD2D9" stroke-width="2"><path d="M0 120h1172M0 250h1172M0 380h1172M200 0v548M480 0v548M760 0v548M1040 0v548"></path></g>` +
    `<g fill="#B8BEC8"><circle cx="210" cy="130" r="4"></circle><circle cx="470" cy="130" r="4"></circle><circle cx="770" cy="130" r="4"></circle><circle cx="1030" cy="130" r="4"></circle><circle cx="210" cy="370" r="4"></circle><circle cx="1030" cy="370" r="4"></circle></g>` +
    `<rect x="0" y="500" width="1172" height="48" fill="#9AA3AF"></rect><rect x="0" y="494" width="1172" height="12" fill="#1E2430"></rect>` +
    `<g fill="#F5C518"><path d="M0 494h30l-12 12H-12zM60 494h30l-12 12H48zM120 494h30l-12 12h-30zM180 494h30l-12 12h-30zM980 494h30l-12 12h-30zM1040 494h30l-12 12h-30zM1100 494h30l-12 12h-30zM1160 494h30l-12 12h-30z"></path></g>` +
    `<path d="M60 70 h150 l-40 70 h-70z" fill="#9AA3AF" stroke="#1E2430" stroke-width="5" stroke-linejoin="round"></path>` +
    `<g fill="#7C8592"><circle cx="100" cy="66" r="9"></circle><circle cx="124" cy="60" r="11"></circle><circle cx="150" cy="66" r="9"></circle><circle cx="172" cy="64" r="7"></circle></g>` +
    `<rect x="118" y="140" width="34" height="40" fill="#B8BEC8" stroke="#1E2430" stroke-width="4"></rect>` +
    `<rect x="60" y="180" width="150" height="250" rx="22" fill="#F7F8F9" stroke="#1E2430" stroke-width="6"></rect>` +
    `<rect x="84" y="220" width="102" height="70" rx="10" fill="#3A1A08" stroke="#1E2430" stroke-width="4"></rect>` +
    `<rect class="dv-glow" x="92" y="228" width="86" height="54" rx="6" fill="#F26A1B"></rect>` +
    `<g class="dv-flicker" fill="none" stroke="#F5C518" stroke-width="3" stroke-linecap="round"><path d="M104 270 c4-10-4-14 0-24"></path><path d="M134 272 c4-12-4-16 0-28"></path><path d="M164 270 c4-10-4-14 0-24"></path></g>` +
    `<rect x="80" y="310" width="110" height="26" rx="5" fill="#1E2430"></rect>` +
    `<text x="135" y="328" text-anchor="middle" font-family="Lexend" font-weight="700" font-size="15" fill="#F7F8F9">HOT OVEN</text>` +
    `<g fill="#B8BEC8" stroke="#1E2430" stroke-width="2"><circle cx="90" cy="370" r="10"></circle><circle cx="122" cy="370" r="10"></circle></g>` +
    `<circle class="dv-blink" cx="90" cy="370" r="4" fill="#5CBF5A"></circle><circle class="dv-blink-b" cx="122" cy="370" r="4" fill="#F26A1B"></circle>` +
    `<rect x="150" y="358" width="40" height="24" rx="4" fill="#13211D"></rect>` +
    `<path d="M60 430 h150 v20 h-150z" fill="#7C8592" stroke="#1E2430" stroke-width="4"></path>` +
    `<rect x="208" y="280" width="770" height="44" fill="#B8BEC8" stroke="#1E2430" stroke-width="6"></rect><path d="M208 292 h770" stroke="#DDE1E6" stroke-width="5"></path>` +
    `<g fill="#9AA3AF" stroke="#1E2430" stroke-width="4"><rect x="380" y="270" width="18" height="64" rx="3"></rect><rect x="540" y="270" width="18" height="64" rx="3"></rect><rect x="700" y="270" width="18" height="64" rx="3"></rect><rect x="860" y="270" width="18" height="64" rx="3"></rect><rect x="910" y="270" width="18" height="64" rx="3"></rect></g>` +
    `<g class="dv-blink" fill="#4BA3F0" opacity="0.9"><path d="M222 302 l10 0 l-5 -6z"></path><path d="M246 302 l10 0 l-5 -6z"></path></g>` +
    `<rect x="976" y="120" width="140" height="350" rx="60" fill="#F7F8F9" stroke="#1E2430" stroke-width="6"></rect>` +
    `<clipPath id="tank"><rect x="982" y="126" width="128" height="338" rx="54"></rect></clipPath>` +
    `<g clip-path="url(#tank)"><circle class="dv-bubble" cx="1010" cy="452" r="6" fill="#DCEEFF"></circle><circle class="dv-bubble-b" cx="1050" cy="456" r="4" fill="#DCEEFF"></circle><circle class="dv-bubble-c" cx="1080" cy="452" r="5" fill="#DCEEFF"></circle><rect id="vl-tank" class="dv-geo" x="976" y="460" width="140" height="360" fill="#4BA3F0"></rect><path id="vl-wave" d="M976 460 c20 -8 40 8 70 0 s50 -8 70 0" fill="#7DC0F7"></path></g>` +
    `<g stroke="#1E2430" stroke-width="3"><path d="M1100 200h16M1100 260h16M1100 320h16M1100 380h16"></path></g>` +
    `<rect x="996" y="474" width="100" height="22" fill="#7C8592" stroke="#1E2430" stroke-width="4"></rect>` +
    `<rect x="1000" y="150" width="92" height="34" rx="6" fill="#1E2430"></rect>` +
    `<text x="1046" y="174" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="20" fill="#F7F8F9">OXYGEN</text>` +
    `<g transform="translate(940 214)"><rect x="-6" y="30" width="12" height="40" fill="#B8BEC8" stroke="#1E2430" stroke-width="3"></rect><circle r="38" fill="#F7F8F9" stroke="#1E2430" stroke-width="5"></circle><path d="M-26 14 A30 30 0 0 1 26 14" fill="none" stroke="#F26A1B" stroke-width="6"></path><path d="M-26 14 A30 30 0 0 1 -10 -26" fill="none" stroke="#9AA3AF" stroke-width="6"></path><path id="vl-needle" d="M0 0 L0 0" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path><circle r="5" fill="#1E2430"></circle></g>` +
    `<g class="dv-breathe" transform="translate(250 420)"><circle cx="0" cy="-58" r="14" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></circle><rect x="-10" y="-62" width="20" height="10" rx="5" fill="#1E2430"></rect><rect x="-14" y="-44" width="28" height="40" rx="8" fill="#F79A6B" stroke="#1E2430" stroke-width="3"></rect><rect x="-12" y="-6" width="10" height="30" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><rect x="2" y="-6" width="10" height="30" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect><path d="M14 -36 l22 -20" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path><path d="M32 -62 a7 7 0 1 1 8 10" fill="none" stroke="#1E2430" stroke-width="4" stroke-linecap="round"></path></g>` +
    `</svg>` +
    `<div id="vl-seq" class="dv-drop dv-d2" role="group" style="position: absolute; left: 380px; top: 26px; display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 16px; background: #13211D; box-shadow: inset 0 0 0 4px #2B3833, 0 4px 0 #1E2430"></div>` +
    `<div id="vl-valves"></div>` +
    `</div>`;
  api.foot.innerHTML =
    `<div role="status" aria-live="polite" style="width: 330px; display: flex; flex-direction: column; justify-content: center; padding: 10px 16px; border-radius: 12px; background: #F7F8F9; border: 3px solid #1E2430">` +
    `<p id="vl-hint" style="margin: 0; font-size: 17px; font-weight: 700"></p>` +
    `<p style="margin: 2px 0 0; font-size: 15px; color: #4A5363">A wrong valve shuts them all. Win: <b style="color: #1F7A35">extra oxygen</b>.</p></div>`;

  const $ = (s) => api.body.querySelector(s);
  const hintEl = api.foot.querySelector("#vl-hint");

  function render() {
    // order list
    const seqEl = $("#vl-seq");
    seqEl.setAttribute("aria-label", showing ? "Remember this order: " + order.map((k, i) => (i + 1) + " " + NAMES[k]).join(", then ") : "Order hidden. " + done + " of 4 open.");
    seqEl.innerHTML = `<span style="font-weight: 700; font-size: 16px; color: #A8F5C2; margin-right: 4px">${showing ? "Remember<br>this order!" : "Open them<br>from memory"}</span>` +
      order.map((k, i) => {
        const bg = i < done ? "#5CBF5A" : (showing ? "#F5C518" : "#A8F5C2");
        const see = showing || i < done;
        return `<span style="width: 50px; height: 58px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; background: ${bg}"><span style="font-size: 12px; font-weight: 800; color: #13211D">${i + 1}</span>${see ? `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24"><path d="${S[k]}" fill="#13211D"></path></svg>` : `<span style="font-size: 24px; font-weight: 800; line-height: 26px; color: #13211D">?</span>`}</span>`;
      }).join("");

    const hadFocus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-v");
    $("#vl-valves").innerHTML = row.map((k, i) => {
      const idx = order.indexOf(k);
      const open = idx < done;
      const shake = wrong === k ? (wn % 2 ? " dv-shake-a" : " dv-shake-b") : "";
      const wheel = open ? "#5CBF5A" : "#F26A1B";
      return `<button type="button" data-v="${i}" class="dv-key${shake}" aria-label="Valve ${i + 1}, ${NAMES[k]}, ${open ? "open" : "closed"}. Press ${i + 1}." style="position: absolute; left: ${XS[i] - 70}px; top: 232px; width: 140px; min-height: 44px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0; cursor: pointer; background: transparent; border: none">` +
        `<svg aria-hidden="true" width="132" height="132" viewBox="0 0 132 132"><circle cx="66" cy="66" r="58" fill="none" stroke="#1E2430" stroke-width="16"></circle><circle cx="66" cy="66" r="58" fill="none" stroke="${wheel}" stroke-width="9"></circle><g class="${idx === done - 1 ? "dv-turn" : ""}"${open ? ' transform="rotate(45 66 66)"' : ""}><path d="M66 14v104M14 66h104M29 29l74 74M103 29l-74 74" stroke="#1E2430" stroke-width="9" stroke-linecap="round"></path><path d="M66 14v104M14 66h104M29 29l74 74M103 29l-74 74" stroke="${wheel}" stroke-width="3" stroke-linecap="round"></path></g><circle cx="66" cy="66" r="26" fill="#F7F8F9" stroke="#1E2430" stroke-width="6"></circle><g transform="translate(51 51) scale(1.25)"><path d="${S[k]}" fill="#1E2430"></path></g></svg>` +
        `<span style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 8px; background: #1E2430; color: #F7F8F9; font-family: Lexend, sans-serif; font-weight: 700; font-size: 16px"><span style="width: 10px; height: 10px; border-radius: 50%; background: ${wheel}"></span>${i + 1} · ${open ? "Open" : "Closed"}</span></button>`;
    }).join("");
    // tank and gauge
    const level = done / 4;
    const top = Math.round(460 - level * 300);
    $("#vl-tank").setAttribute("y", String(top));
    $("#vl-wave").setAttribute("d", "M976 " + top + " c20 -8 40 8 70 0 s50 -8 70 0");
    const ang = Math.PI * (0.85 + level * 1.1);
    $("#vl-needle").setAttribute("d", "M0 0 L" + Math.round(Math.cos(ang) * 28) + " " + Math.round(Math.sin(ang) * 28));
    if (hadFocus != null) { const b = $('[data-v="' + hadFocus + '"]'); if (b) b.focus(); }
  }
  function say(t) { hintEl.textContent = t; }

  function peek(ms, after) {
    showing = true;
    render();
    api.later(() => { showing = false; render(); say(after); }, ms);
  }

  function press(i) {
    if (api.done) return;
    if (showing) { say("Wait for it... remember the order first!"); return; }
    const k = row[i];
    const idx = order.indexOf(k);
    if (idx < done) return; // already open
    api.sfx("click");
    if (idx === done) {
      done += 1;
      wrong = -1;
      if (done >= 4) { say("All open! Oxygen is flowing."); render(); api.win(); return; }
      say(done + " of 4 open. Which shape comes next?");
      render();
    } else {
      wrong = k; wn += 1;
      done = 0; // the pressure drops and every valve slams shut
      api.penalty(1);
      api.sfx("warning");
      say("Wrong valve! They all shut. Look again, quick!");
      peek(1300, "Go! Open them from memory.");
    }
  }
  $("#vl-valves").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]");
    if (b) press(Number(b.getAttribute("data-v")));
  });
  api.onKey((e) => {
    if (e.key >= "1" && e.key <= "4" && !e.ctrlKey && !e.metaKey && !e.altKey) { press(Number(e.key) - 1); return true; }
    return false;
  });

  say("Remember the order on the screen. It will hide soon!");
  peek(3000, "Go! Open them from memory.");
  api.focus($('[data-v="0"]'));
}
