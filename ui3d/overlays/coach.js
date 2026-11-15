// Interactive base tour: a spotlight on the real controls plus a talking bubble. Steps either have a
// Next button or wait until the player actually does the thing (tap the garden, pick Leo, turn the
// base, end the sol). Lives inside the game screen (#g3) so it follows the full-screen layout.
//
// startTour(ctx, g3, probe) -> stop()
//   probe = { state(), yaw(), cardOpen(), busy() }  read-only peeks at the game screen
import { helmet } from "../parts.js";

const KEY = "dv26-tour-done";
export const tourDone = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
const markDone = () => { try { localStorage.setItem(KEY, "1"); } catch (e) { /* private mode */ } };

export function startTour(ctx, g3, probe) {
  const mars = ctx.store.site === "mars";
  const startSol = probe.state().sol;
  let startLeft = probe.state().actionsLeft, startYaw = probe.yaw(), startFood = probe.state().food;
  const steps = [
    { text: `Welcome to ${mars ? "Jezero" : "Shackleton"} Base, Commander! I'm Zuri. Want a quick tour? You'll learn by doing.`, next: "Show me", skip: "I know how" },
    { target: "#meters", text: "These four bars keep us alive: Power, Oxygen, Shield and Food. If any bar reaches zero, the mission ends.", next: "Got it" },
    { target: ".turn", text: "This is our base. Drag it, or tap an arrow, to turn it around. Try it now!", until: () => Math.abs(probe.yaw() - startYaw) > 5, hint: "Drag the base or tap an arrow." },
    { target: "#st-grow_food", text: "Let's grow some food. Tap the Veggie garden.", until: () => probe.cardOpen() === "grow_food", hint: "Tap the pink greenhouse or its label." },
    { target: "#card", text: "Now pick who goes. Leo is the plant expert, so he grows the most food!", until: () => probe.state().actionsLeft < startLeft || probe.busy(), hint: "Tap a crew member's button." },
    { hideWhile: () => probe.busy() || !!document.querySelector(".dv-overlay"), target: "#m-food", text: "Food went up! Every job also costs something. Watch the small numbers on the bars.", next: "Next" },
    { target: ".jobs", text: "You get 2 jobs every sol. One is left today. The third crew member gets to rest.", next: "Next" },
    { target: "#fc", text: "This is the Sun forecast. It uses real NASA flare data. On storm days the Shield drops, so build it up first.", next: "Next" },
    { target: "#b-tasks", text: "Mission Control gives you bonus goals. Science points buy upgrades. Check them any time.", next: "Next" },
    { target: "#b-end", text: "When you're done for the day, press End sol. The crew sleeps and a new sol begins.", until: () => probe.state().sol > startSol, hint: "Use your last job, or just press End sol." },
    { hideWhile: () => probe.busy() || !!document.querySelector(".dv-overlay"), text: "You've got it! Keep everyone safe for 30 sols until the supply ship lands. Good luck, Commander!", next: "Let's go" },
  ];

  const layer = document.createElement("div");
  layer.className = "coach";
  layer.innerHTML = `<div class="co-spot" aria-hidden="true"></div>
<div class="co-bubble" role="dialog" aria-label="Tour" aria-live="polite">
  <div class="co-who">${helmet("#B99AF5", 44)}</div>
  <div class="co-body"><p class="co-step"></p><p class="co-text"></p><p class="co-hint"></p>
  <div class="co-btns"><button type="button" class="co-skip"></button><button type="button" class="co-next"></button></div></div>
</div>`;
  g3.appendChild(layer);
  const spot = layer.querySelector(".co-spot"), bubble = layer.querySelector(".co-bubble");
  const $t = layer.querySelector(".co-text"), $hint = layer.querySelector(".co-hint"), $step = layer.querySelector(".co-step");
  const $next = layer.querySelector(".co-next"), $skip = layer.querySelector(".co-skip");
  let i = -1, raf = 0, tick = 0, stopped = false, hintTimer = 0;

  // place the ring on the target and the bubble next to it, every frame (targets move as the base turns)
  function place() {
    if (stopped) return;
    raf = requestAnimationFrame(place);
    const st = steps[i];
    const hidden = st.hideWhile && st.hideWhile();
    layer.classList.toggle("away", !!hidden);
    if (hidden) return;
    const gr = g3.getBoundingClientRect();
    const k = gr.width / g3.offsetWidth || 1;
    const W = g3.offsetWidth, H = g3.offsetHeight;
    const el = st.target && g3.querySelector(st.target);
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    if (!el) {
      spot.style.opacity = "0";
      bubble.style.translate = `${Math.round((W - bw) / 2)}px ${Math.round(H * 0.3)}px`;
      return;
    }
    const r = el.getBoundingClientRect();
    const x = (r.left - gr.left) / k, y = (r.top - gr.top) / k, w = r.width / k, h = r.height / k;
    const pad = 10;
    spot.style.opacity = "1";
    spot.style.translate = `${Math.round(x - pad)}px ${Math.round(y - pad)}px`;
    spot.style.width = Math.round(w + pad * 2) + "px";
    spot.style.height = Math.round(h + pad * 2) + "px";
    // bubble: below the target if there is room, else above, else beside; always on screen
    let bx = x + w / 2 - bw / 2, by = y + h + pad + 18;
    if (by + bh > H - 20) by = y - pad - 18 - bh;
    if (by < 20) { by = Math.max(20, Math.min(H - bh - 20, y + h / 2 - bh / 2)); bx = x + w + pad + 18; if (bx + bw > W - 20) bx = x - pad - 18 - bw; }
    bx = Math.max(20, Math.min(W - bw - 20, bx));
    bubble.style.translate = `${Math.round(bx)}px ${Math.round(by)}px`;
  }

  function show(n) {
    i = n;
    clearTimeout(hintTimer);
    const st = steps[i];
    if (!st) return finish();
    if (i === 4) startLeft = probe.state().actionsLeft;
    if (i === 2) startYaw = probe.yaw();
    $step.textContent = i === 0 ? "Tour" : `Step ${i} of ${steps.length - 1}`;
    $t.textContent = st.text;
    $hint.textContent = "";
    $next.hidden = !st.next;
    $next.textContent = st.next || "";
    $skip.textContent = st.skip || "Skip tour";
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
    if (st.until) hintTimer = setTimeout(() => { if (steps[i] === st) $hint.textContent = st.hint || ""; }, 6000);
    if (st.next) setTimeout(() => { if (steps[i] === st && !layer.classList.contains("away")) $next.focus({ preventScroll: true }); }, 50);
  }
  function finish() { markDone(); stop(); }
  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf); clearInterval(tick); clearTimeout(hintTimer);
    layer.remove();
    ctx.store.tutorial = false;
  }

  $next.addEventListener("click", () => { ctx.sfx("click"); show(i + 1); });
  $skip.addEventListener("click", () => { ctx.sfx("click"); finish(); });
  // action-gated steps advance on their own once the player does the thing
  tick = setInterval(() => {
    const st = steps[i];
    if (st && st.until && st.until()) { ctx.sfx("good"); show(i + 1); }
  }, 150);

  show(0);
  place();
  return stop;
}
