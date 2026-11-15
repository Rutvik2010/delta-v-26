// Interactive base tour ("training mission"). Zuri walks the player through the REAL game screen:
// a spotlight shows where to look, a demo hand shows what to do, and most steps only move on when
// the player actually does it (a little quiz, a tap, a turn). Each success gets a "Nice!" moment.
// Lives inside the game screen (#g3) so it follows the full-screen layout.
//
// startTour(ctx, g3, probe) -> stop()
//   probe = { state(), yaw(), cardOpen(), busy() }  read-only peeks at the game screen
import { helmet } from "../parts.js";

const KEY = "dv26-tour-done";
export const tourDone = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
const markDone = () => { try { localStorage.setItem(KEY, "1"); } catch (e) { /* private mode */ } };
const overlayOpen = () => !!document.querySelector(".dv-overlay");
const missionsOpen = () => !!document.querySelector(".dv-overlay #ms-title");

export function startTour(ctx, g3, probe) {
  const mars = ctx.store.site === "mars";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const low = () => { const s = probe.state(); return ["power", "oxygen", "shielding", "food"].reduce((a, k) => (s[k] < s[a] ? k : a), "power"); };
  const busyDays = () => [...g3.querySelectorAll("#fc .fday")].filter((d) => d.querySelector(".wx-active, .wx-storm"));
  let mark = {}; // values remembered when a step starts

  // Each step: say (static markup), target (what the spotlight rings), hand (where the demo hand goes and
  // how: "tap" or "swipe"), and how it ends: next (a button), until (the game reached a state), or
  // click (a quiz: return true for right, a hint string for wrong).
  const steps = [
    { say: `Welcome to ${mars ? "Jezero" : "Shackleton"} Base, Commander! I'm <b>Zuri</b>. Let's do a quick training mission together.`, next: "Let's go", skip: "I know how to play", dim: true },
    { target: "#meters", say: "These 4 bars keep us alive. If one hits <b>zero</b>, the mission is over. Quick quiz: <b>tap the lowest bar!</b>",
      click: (e) => { const m = e.target.closest(".meter"); if (!m) return null; return m.id === "m-" + low() ? true : "Not that one. Look for the smallest number."; } },
    { corner: true, hand: { sel: ".board", mode: "swipe" }, say: "This is our base. <b>Drag it</b> to spin it around, or tap the arrow buttons. Give it a spin!",
      start: () => { mark.yaw = probe.yaw(); }, until: () => Math.abs(probe.yaw() - mark.yaw) > 20 },
    { target: "#st-grow_food", hand: { sel: "#st-grow_food .lbl", mode: "tap" }, say: "Every building is a job. Food matters most, so <b>tap the Veggie garden</b>.",
      until: () => probe.cardOpen() === "grow_food" },
    { target: "#card", hand: { sel: () => [...g3.querySelectorAll("#card .pick")].find((b) => /Leo/.test(b.getAttribute("aria-label") || "")), mode: "tap" },
      say: "Who should go? <b>Leo</b> is the plant expert. See his bigger number? <b>Send Leo!</b>",
      start: () => { mark.left = probe.state().actionsLeft; }, until: () => probe.state().actionsLeft < mark.left || probe.busy() },
    { wait: () => probe.busy() || overlayOpen(), target: "#m-food", say: "Look, <b>Food went up!</b> But jobs cost something too. Power went down a little.", next: "Got it" },
    { target: ".jobs", say: "You get <b>2 jobs</b> every sol (that's a day). You have 1 left. Whoever doesn't work gets to rest.", next: "Next" },
    { target: "#fc", say: busyDays().length ? "This is the <b>Sun forecast</b>, with real NASA data. Yellow or red means flares that hurt the Shield. <b>Tap a busy Sun day.</b>" : "This is the <b>Sun forecast</b>, with real NASA data. Yellow or red days have flares that hurt the Shield.",
      click: busyDays().length ? (e) => { const d = e.target.closest(".fday"); if (!d) return null; return d.querySelector(".wx-active, .wx-storm") ? true : "That day is calm. Find a yellow or red one."; } : null,
      next: busyDays().length ? null : "Next" },
    { target: "#b-tasks", hand: { sel: "#b-tasks", mode: "tap" }, say: "Earth sends us bonus goals. <b>Tap Mission Control</b> to see them.", until: missionsOpen },
    { wait: () => false, target: null, say: "Finish goals to earn stars. Close this when you're ready.", until: () => !missionsOpen(), quiet: true },
    { target: "#b-end", hand: { sel: "#b-end", mode: "tap" }, say: "Use your last job, or tap <b>End sol</b>. The crew sleeps, and the Sun does what the forecast said.",
      start: () => { mark.sol = probe.state().sol; }, until: () => probe.state().sol > mark.sol },
    { wait: () => probe.busy() || overlayOpen(), say: "Training complete! Keep everyone safe for <b>30 sols</b> until the supply ship lands. You've got this!", next: "Start the mission", dim: true, party: true },
  ];
  const total = steps.length - 1;

  const layer = document.createElement("div");
  layer.className = "coach";
  layer.innerHTML = `<div class="co-dim" aria-hidden="true"></div><div class="co-spot" aria-hidden="true"></div>
<div class="co-hand" aria-hidden="true"><svg width="70" height="80" viewBox="0 0 32 36"><path d="M12 34c-3-2-7-7-8-10-1-2 1-4 3-3l3 3V6c0-2 1-3 2.5-3S15 4 15 6v8c0-1.5 1-2.5 2.5-2.5S20 12.5 20 14v1c0-1.5 1-2.5 2.5-2.5S25 13.5 25 15v1c.2-1.3 1.2-2 2.3-2 1.4 0 2.2 1 2.2 2.6V24c0 5-3 10-8 10z" fill="#F7F8F9" stroke="#1E2430" stroke-width="2" stroke-linejoin="round"/></svg></div>
<div class="co-bubble" role="dialog" aria-label="Training mission">
  <div class="co-who">${helmet("#B99AF5", 64)}<span>Zuri</span></div>
  <div class="co-body">
    <div class="co-dots" aria-hidden="true">${steps.slice(1).map(() => "<i></i>").join("")}</div>
    <p class="co-text" aria-live="polite"></p><p class="co-hint" aria-live="polite"></p>
    <div class="co-btns"><button type="button" class="co-skip"></button><button type="button" class="co-next"></button></div>
  </div>
  <div class="co-yay" aria-hidden="true">Nice!</div>
</div>`;
  g3.appendChild(layer);
  const q = (s) => layer.querySelector(s);
  const spot = q(".co-spot"), dim = q(".co-dim"), bubble = q(".co-bubble"), handEl = q(".co-hand");
  const $t = q(".co-text"), $hint = q(".co-hint"), $next = q(".co-next"), $skip = q(".co-skip"), dots = [...layer.querySelectorAll(".co-dots i")];
  let i = -1, raf = 0, tick = 0, stopped = false, hintTimer = 0, cheering = false;

  const find = (sel) => !sel ? null : typeof sel === "function" ? sel() : g3.querySelector(sel);
  function place() {
    if (stopped) return;
    raf = requestAnimationFrame(place);
    const st = steps[i];
    const away = (st.wait && st.wait()) || (overlayOpen() && !st.quiet);
    layer.classList.toggle("away", !!away);
    layer.classList.toggle("quiet", !!st.quiet);
    if (away) return;
    const gr = g3.getBoundingClientRect();
    const k = gr.width / g3.offsetWidth || 1;
    const W = g3.offsetWidth, H = g3.offsetHeight;
    const local = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - gr.left) / k, y: (r.top - gr.top) / k, w: r.width / k, h: r.height / k }; };
    const el = find(st.target);
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    dim.classList.toggle("on", !!st.dim);
    // demo hand
    const h = st.hand && find(st.hand.sel);
    if (h && !cheering) {
      const b = local(h);
      handEl.className = "co-hand on " + st.hand.mode;
      handEl.style.translate = `${Math.round(b.x + b.w / 2 - 18)}px ${Math.round(b.y + b.h / 2 - 8)}px`;
    } else handEl.className = "co-hand";
    if (!el) {
      spot.style.opacity = "0";
      // corner steps park the bubble top-left, under the meters, so the base and arrows stay clear
      if (st.corner) bubble.style.translate = `24px 190px`;
      else bubble.style.translate = `${Math.round((W - bw) / 2)}px ${Math.round(st.quiet ? H - bh - 24 : (H - bh) / 2)}px`;
      return;
    }
    const r = local(el), pad = 10;
    spot.style.opacity = "1";
    spot.style.translate = `${Math.round(r.x - pad)}px ${Math.round(r.y - pad)}px`;
    spot.style.width = Math.round(r.w + pad * 2) + "px";
    spot.style.height = Math.round(r.h + pad * 2) + "px";
    // bubble: below the target if there's room, else above, else beside it; always on screen
    let bx = r.x + r.w / 2 - bw / 2, by = r.y + r.h + pad + 22;
    if (by + bh > H - 16) by = r.y - pad - 22 - bh;
    if (by < 16) { by = Math.max(16, Math.min(H - bh - 16, r.y + r.h / 2 - bh / 2)); bx = r.x + r.w + pad + 22; if (bx + bw > W - 16) bx = r.x - pad - 22 - bw; }
    bx = Math.max(16, Math.min(W - bw - 16, bx));
    bubble.style.translate = `${Math.round(bx)}px ${Math.round(by)}px`;
  }

  function show(n) {
    i = n;
    clearTimeout(hintTimer);
    const st = steps[i];
    if (!st) return finish();
    if (st.start) st.start();
    dots.forEach((d, j) => { d.className = j < i - 1 ? "done" : j === i - 1 ? "now" : ""; });
    $t.innerHTML = st.say;
    $hint.textContent = "";
    $next.hidden = !st.next;
    $next.textContent = st.next || "";
    $skip.textContent = st.skip || "Skip training";
    bubble.classList.remove("pop", "cheer"); void bubble.offsetWidth; bubble.classList.add("pop");
    // stuck? after a while, offer a hint and a way past the step
    if (!st.next) hintTimer = setTimeout(() => {
      if (steps[i] !== st) return;
      $hint.textContent = "Stuck? Follow the hand, or tap “Skip this step”.";
      $next.hidden = false; $next.textContent = "Skip this step"; $next.classList.add("soft");
    }, 9000);
    $next.classList.toggle("soft", false);
    if (st.next) setTimeout(() => { if (steps[i] === st) $next.focus({ preventScroll: true }); }, 60);
  }
  // a short "Nice!" celebration, then the next step
  function cheer() {
    if (cheering) return;
    cheering = true;
    ctx.sfx("good");
    bubble.classList.remove("pop"); bubble.classList.add("cheer");
    handEl.className = "co-hand";
    setTimeout(() => { cheering = false; if (!stopped) show(i + 1); }, reduced ? 300 : 750);
  }
  function finish() {
    if (steps[i] && steps[i].party && !reduced) confetti();
    markDone();
    setTimeout(stop, steps[i] && steps[i].party && !reduced ? 900 : 0);
  }
  function confetti() {
    const box = document.createElement("div");
    box.className = "tk-confetti co-confetti";
    const C = ["#F26A1B", "#F5C518", "#5CBF5A", "#4BA3F0", "#B99AF5", "#FF7AD9"];
    box.innerHTML = Array.from({ length: 40 }, (_, n) => { const a = (n / 40) * Math.PI * 2, d = 240 + Math.random() * 280; return `<i style="--dx: ${Math.round(Math.cos(a) * d)}px; --dy: ${Math.round(Math.sin(a) * d * 0.7 - 140)}px; --r: ${Math.round(Math.random() * 720 - 360)}deg; background: ${C[n % 6]}"></i>`; }).join("");
    g3.appendChild(box);
    setTimeout(() => box.remove(), 1500);
  }
  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf); clearInterval(tick); clearTimeout(hintTimer);
    document.removeEventListener("click", onClick, true);
    layer.remove();
    ctx.store.tutorial = false;
  }

  // quiz taps on the real screen
  function onClick(e) {
    const st = steps[i];
    if (!st || !st.click || cheering || layer.contains(e.target)) return;
    const r = st.click(e);
    if (r === true) cheer();
    else if (typeof r === "string") { $hint.textContent = r; ctx.sfx("miss"); bubble.classList.remove("nudge"); void bubble.offsetWidth; bubble.classList.add("nudge"); }
  }
  document.addEventListener("click", onClick, true);
  $next.addEventListener("click", () => { ctx.sfx("click"); if (steps[i] && steps[i].party) finish(); else show(i + 1); });
  $skip.addEventListener("click", () => { ctx.sfx("click"); markDone(); stop(); });
  tick = setInterval(() => {
    const st = steps[i];
    if (st && st.until && !cheering && st.until()) { if (st.quiet) show(i + 1); else cheer(); }
  }, 150);

  show(0);
  place();
  return stop;
}
