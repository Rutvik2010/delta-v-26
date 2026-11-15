// The five job tasks (every job plays one; winning earns the bonus). runTask(ctx, actionId, crewId?) -> Promise<boolean> (true only on a win).
// crewId (maya | leo | zuri) is the astronaut doing the job; it sets the name and helmet colour.
import { helmet, factBox, esc, JOBS } from "../parts.js";

const LOADERS = {
  rest: () => import("./tasks/solar.js"),
  oxygen_gen: () => import("./tasks/valves.js"),
  reinforce_shield: () => import("./tasks/shovel.js"),
  grow_food: () => import("./tasks/garden.js"),
  science: () => import("./tasks/find.js"),
};

const WHO = { maya: ["Maya", "#F79A6B"], leo: ["Leo", "#8ED16C"], zuri: ["Zuri", "#B99AF5"] };
const DOING = {
  rest: "is aiming the solar panel", oxygen_gen: "is making oxygen", reinforce_shield: "is piling dirt on the roof",
  grow_food: "is tending the veggie garden", science: "is hunting in the crater",
};
function meta(id, mars, crewId) {
  const m = baseMeta(id, mars);
  const who = WHO[crewId];
  if (who) {
    m.color = who[1];
    m.kicker = who[0] + " " + (id === "science" ? (mars ? "is hunting for a water rock in the crater" : "is hunting for ice in the crater") : DOING[id]);
  }
  return m;
}
function baseMeta(id, mars) {
  switch (id) {
    case "rest":
      return { color: "#B99AF5", kicker: "Zuri is aiming the solar panel", title: "Follow the Sun", secs: 12,
        fact: "The International Space Station's giant solar wings turn to follow the Sun. Pointing straight at the Sun makes the most power." };
    case "oxygen_gen":
      return { color: "#F79A6B", kicker: "Maya is making oxygen", title: "Remember the valve order", secs: 16,
        fact: mars ? JOBS.oxygen_gen.real(true) : "About 40% of moon dirt's weight is oxygen. It's locked inside the rocks. Heating the dirt can set it free." };
    case "reinforce_shield":
      return { color: "#F79A6B", kicker: "Maya is piling dirt on the roof", title: "Scoop in the green", secs: 13,
        fact: mars ? JOBS.reinforce_shield.real() : "The Moon has no thick air to block harmful rays from the Sun. NASA has studied covering moon bases with moon dirt to keep crews safe." };
    case "grow_food":
      return { color: "#8ED16C", kicker: "Leo is tending the veggie garden", title: "Keep the garden alive", secs: 15,
        fact: "In 2015, astronauts on the space station ate lettuce they grew in space. The garden is called Veggie, and its lights glow pink." };
    default:
      return { color: "#B99AF5", kicker: mars ? "Zuri is hunting for a water rock in the crater" : "Zuri is hunting for ice in the crater",
        title: mars ? "Spot the water rock" : "Spot the hidden ice", secs: 13,
        fact: mars ? JOBS.science.real(true) : "In 2009, NASA crashed its LCROSS probe into a dark crater near the Moon's south pole. The cloud it kicked up had water ice in it!" };
  }
}

// What the practice coach says for each game, where the demo hand points, and how many good moves
// finish the practice round. Practice has no clock and can't be lost.
const PRACTICE = {
  rest: { how: "The Sun moves across the sky. Tap the tilt buttons (or slide) to point the gold panel at the Sun until the bar passes the dashed line.", hand: "#sl-right", goal: 1, done: "That's it! In the real round, keep the panel on the Sun until the battery is full." },
  oxygen_gen: { how: "Look at the order at the top, then open the valves in that order. In the real round the order hides after a few seconds, so remember it!", hand: "#vl-seq", goal: 2, more: "Good! Now the next one.", done: "Great memory! In the real round a wrong valve shuts them all." },
  reinforce_shield: { how: "Watch the black arrow slide. Tap Dig when it is inside the green zone. Try two good scoops!", hand: "#sh-dig", goal: 2, more: "Nice scoop! One more.", done: "Perfect timing! In the real round the arrow gets faster." },
  grow_food: { how: "Plants with an orange border are thirsty. Tap them to water. Don't water happy plants!", hand: "[data-p][aria-label*='thirsty']", goal: 2, more: "Good! Find another thirsty one.", done: "Nice gardening! In the real round, don't let any plant wilt.", retry: "That plant wilted. Let's try again!" },
  science: { how: "Watch the rocks closely. One of them glints blue for a moment. Tap that one!", hand: "#fd-rocks", goal: 1, done: "Sharp eyes! In the real round you need to find it three times." },
};
const PKEY = "dv26-practiced-";
const practiced = (id) => { try { return localStorage.getItem(PKEY + id) === "1"; } catch (e) { return false; } };
const markPracticed = (id) => { try { localStorage.setItem(PKEY + id, "1"); } catch (e) { /* private mode */ } };

export function runTask(ctx, actionId, crewId) {
  const load = LOADERS[actionId];
  if (!load) return Promise.resolve(false);
  const mars = !!(ctx.store && ctx.store.site === "mars");
  const m = meta(actionId, mars, crewId);
  // Difficulty: Easy gives more time and smaller goals; the first five sols are gentler for everyone.
  const easy = !!(ctx.store && ctx.store.difficulty === "easy");
  const sol = (ctx.store && ctx.store.state && ctx.store.state.sol) || 1;
  const early = sol <= 5;
  m.secs = Math.round(m.secs * (easy ? 1.35 : 1) * (early ? 1.2 : 1));
  return load().then((mod) => new Promise((resolve) => {
    // noEscape: Escape is handled here so timers are always cleaned up.
    ctx.openOverlay((layer, close) => {
      let done = false;
      const timeouts = new Set();
      let tickId = 0;
      let keyFn = null;
      layer.innerHTML =
        `<div data-root role="dialog" aria-modal="true" aria-label="${esc(m.title)}. Job task." tabindex="-1" style="position: absolute; left: 0; top: 0; width: 1280px; height: 800px; box-sizing: border-box; padding: 24px 48px; background: #C9CED6; font-family: Lexend, system-ui, sans-serif; color: #1E2430; display: flex; flex-direction: column; gap: 16px; outline: none">` +
        `<div style="display: flex; align-items: center; gap: 16px">${helmet(m.color, 60)}` +
        `<div><p style="margin: 0; font-size: 18px; font-weight: 600; color: #4A5363">Job task · ${esc(m.kicker)}</p><h1 style="margin: 0; font-weight: 800; font-size: 38px; letter-spacing: -0.02em">${esc(m.title)}</h1></div>` +
        `<div data-hx style="margin-left: auto; display: flex; align-items: center; gap: 8px"></div>` +
        `<div role="timer" data-timer aria-label="${m.secs} seconds left" style="position: relative; overflow: hidden; width: 96px; height: 64px; border-radius: 14px; background: #13211D; box-shadow: inset 0 0 0 4px #2B3833; color: #E4FFEC; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 32px; font-variant-numeric: tabular-nums"><span data-tnum style="margin-top: -6px">${m.secs} s</span><span aria-hidden="true" style="position: absolute; left: 8px; right: 8px; bottom: 7px; height: 7px; border-radius: 4px; background: #2B3833; overflow: hidden"><span data-tbar style="display: block; height: 100%; background: #A8F5C2; transform-origin: left center; transform: scaleX(1)"></span></span></div>` +
        `</div>` +
        `<div data-body style="flex-grow: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px"></div>` +
        `<div class="tk-row" style="display: flex; gap: 20px; align-items: stretch"><div class="tk-fact" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center">${factBox(m.fact)}</div><div data-foot style="display: contents"></div></div>` +
        `<div data-result></div>` +
        `</div>`;
      const root = layer.querySelector("[data-root]");
      const q = (s) => layer.querySelector(s);
      const timerEl = q("[data-timer]"), tnum = q("[data-tnum]"), tbar = q("[data-tbar]");

      const body = q("[data-body]"), foot = q("[data-foot]"), hx = q("[data-hx]");
      const coach = document.createElement("div");
      coach.className = "tk-coach";
      coach.hidden = true;
      root.appendChild(coach);
      const hand = document.createElement("div");
      hand.className = "tk-hand";
      hand.setAttribute("aria-hidden", "true");
      hand.innerHTML = `<svg width="64" height="72" viewBox="0 0 32 36"><path d="M12 34c-3-2-7-7-8-10-1-2 1-4 3-3l3 3V6c0-2 1-3 2.5-3S15 4 15 6v8c0-1.5 1-2.5 2.5-2.5S20 12.5 20 14v1c0-1.5 1-2.5 2.5-2.5S25 13.5 25 15v1c.2-1.3 1.2-2 2.3-2 1.4 0 2.2 1 2.2 2.6V24c0 5-3 10-8 10z" fill="#F7F8F9" stroke="#1E2430" stroke-width="2" stroke-linejoin="round"/></svg>`;
      root.appendChild(hand);

      const closeAll = (value) => {
        done = true;
        clearInterval(tickId);
        timeouts.forEach(clearTimeout);
        timeouts.clear();
        document.removeEventListener("keydown", onKey, true);
        close(!!value);
        resolve(!!value);
      };
      const finish = (win) => {
        if (done) return;
        done = true;
        clearInterval(tickId);
        if (win) { ctx.sfx("fanfare"); ctx.store.streak = (ctx.store.streak || 0) + 1; } else ctx.store.streak = 0;
        const streak = ctx.store.streak || 0;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // confetti: little paper bits that burst out and fall (skipped for reduced motion)
        const COLORS = ["#F26A1B", "#F5C518", "#5CBF5A", "#4BA3F0", "#B99AF5", "#FF7AD9"];
        const confetti = win && !reduced ? `<div aria-hidden="true" class="tk-confetti">${Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2 + Math.random() * 0.3, d = 220 + Math.random() * 260;
          return `<i style="--dx: ${Math.round(Math.cos(a) * d)}px; --dy: ${Math.round(Math.sin(a) * d * 0.7 - 120)}px; --r: ${Math.round(Math.random() * 720 - 360)}deg; background: ${COLORS[i % 6]}; animation-delay: ${Math.round(Math.random() * 120)}ms"></i>`;
        }).join("")}</div>` : "";
        q("[data-result]").innerHTML =
          `<div role="status" style="position: absolute; left: 0; top: 0; width: 1280px; height: 800px; background: rgba(30,36,48,0.55); display: flex; align-items: center; justify-content: center">` +
          `<div class="dv-pop" style="padding: 36px 56px; border-radius: 28px; background: #F7F8F9; border: 5px solid #1E2430; box-shadow: 0 10px 0 #7C8592; text-align: center; max-width: 760px">` +
          (win
            ? `<p style="margin: 0; font-size: 72px; font-weight: 800; letter-spacing: -0.02em; color: #1F7A35">Perfect!</p><p style="margin: 6px 0 0; font-size: 24px; font-weight: 600">Bonus earned. Nice work, Commander!</p>${streak >= 2 ? `<p class="dv-pop" style="margin: 12px auto 0; display: inline-block; padding: 6px 16px; border-radius: 999px; background: #F5C518; border: 3px solid #1E2430; font-size: 22px; font-weight: 800">${streak} perfects in a row!</p>` : ""}`
            : `<p style="margin: 0; font-size: 44px; font-weight: 800; letter-spacing: -0.02em">Good enough! The job still gets done.</p><p style="margin: 8px 0 0; font-size: 22px; font-weight: 600; color: #4A5363">No bonus this time, and that is okay.</p>`) +
          `</div>${confetti}</div>`;
        timeouts.add(setTimeout(() => closeAll(win), win ? 1400 : 1000));
      };

      // ---- the countdown clock (runs only in the real round) ----
      let start = 0, lost = 0, lastShown = m.secs;
      const setClock = (txt, label) => { tnum.textContent = txt; timerEl.setAttribute("aria-label", label); };
      const startClock = () => {
        start = performance.now(); lost = 0; lastShown = m.secs;
        tbar.style.transform = "scaleX(1)";
        setClock(m.secs + " s", m.secs + " seconds left");
        clearInterval(tickId);
        tickId = setInterval(() => {
          if (done) return;
          const left = m.secs - lost - (performance.now() - start) / 1000;
          tbar.style.transform = "scaleX(" + Math.max(0, left / m.secs).toFixed(3) + ")";
          const n = Math.max(0, Math.ceil(left));
          if (n !== lastShown) { lastShown = n; setClock(n + " s", n + " second" + (n === 1 ? "" : "s") + " left"); }
          if (left <= 0) finish(false);
        }, 100);
      };

      const onKey = (e) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); return; } // every job plays its task
        if (e.key === "Tab") { // keep focus inside the dialog
          const items = [...root.querySelectorAll("button:not([disabled]), input")].filter((el) => el.offsetParent !== null);
          if (items.length) {
            const first = items[0], last = items[items.length - 1];
            if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
            else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
          e.stopPropagation();
          return;
        }
        if (!done && keyFn && keyFn(e)) e.preventDefault();
        e.stopPropagation();
      };
      document.addEventListener("keydown", onKey, true);

      // ---- the demo hand: floats to a target and taps it ----
      const pointAt = (el) => {
        if (!el) { hand.classList.remove("on"); return; }
        const rr = root.getBoundingClientRect(), k = rr.width / root.offsetWidth || 1, r = el.getBoundingClientRect();
        hand.style.translate = `${Math.round((r.left - rr.left) / k + r.width / 2 - 14)}px ${Math.round((r.top - rr.top) / k + r.height / 2 - 6)}px`;
        hand.classList.add("on");
      };

      // ---- rounds: a practice round (no clock, can't be lost), then the real one ----
      const P = PRACTICE[actionId];
      let round = null; // the api of the round running now
      function newRound(practice) {
        if (round) round.dead = true;
        timeouts.forEach(clearTimeout); timeouts.clear();
        clearInterval(tickId);
        keyFn = null;
        counting = false;
        root.querySelectorAll(".tk-count").forEach((el) => el.remove());
        body.innerHTML = ""; foot.innerHTML = ""; hx.innerHTML = "";
        hx.style.cssText = "margin-left: auto; display: flex; align-items: center; gap: 8px";
        q("[data-result]").innerHTML = "";
        root.classList.toggle("practicing", practice);
        coach.hidden = !practice;
        hand.classList.remove("on");
        let goods = 0;
        const me = {
          dead: false,
          ctx, mars, secs: m.secs, easy, early, practice, crew: crewId, color: m.color,
          body, foot, hx, root,
          get done() { return done || me.dead; },
          win: () => { if (me.dead) return; if (practice) practiceDone(); else finish(true); },
          fail: () => {
            if (me.dead) return;
            if (!practice) return finish(false);
            me.dead = true;
            say(P.retry || "Oops! Let's try that again.");
            timeouts.add(setTimeout(() => { if (!done) newRound(true); }, 1300));
          },
          good: () => {
            if (me.dead || !practice) return;
            goods += 1;
            if (goods >= (P.goal || 1)) practiceDone();
            else {
              say(P.more || "Nice! Once more.", null, goods); stamp(); ctx.sfx("good");
              // move the demo hand to the next thing to do (or hide it if there is none yet)
              hand.classList.remove("on");
              timeouts.add(setTimeout(() => { if (round === me && !me.dead && P.hand) pointAt(body.querySelector(P.hand)); }, 350));
            }
          },
          penalty: (sec) => {
            if (me.dead || practice || done) return;
            lost += sec;
            timerEl.style.background = "#5A1A14";
            const t = setTimeout(() => { timeouts.delete(t); timerEl.style.background = "#13211D"; }, 350);
            timeouts.add(t);
          },
          point: (el) => { if (practice && !me.dead) pointAt(el); },
          sfx: (n) => ctx.sfx(n),
          onKey: (fn) => { keyFn = fn; },
          later: (fn, ms) => { const t = setTimeout(() => { timeouts.delete(t); if (!me.done) fn(); }, ms); timeouts.add(t); return t; },
          focus: (el) => { try { (el || root).focus(); } catch (err) { /* ignore */ } },
          swap: (el, a, b) => { // restart a one-shot animation by swapping the -a / -b classes
            const was = el.classList.contains(a);
            el.classList.remove(a, b);
            void el.getBoundingClientRect();
            el.classList.add(was ? b : a);
          },
        };
        round = me;
        try { mod.mount(me); } catch (err) { console.error(err); }
        if (practice) {
          setClock("Try", "Practice: no timer");
          tbar.style.transform = "scaleX(1)";
          say(P.how, null, 0);
          // point at the main control once the game has drawn it
          timeouts.add(setTimeout(() => { if (round === me && P.hand && !me.dead) pointAt(body.querySelector(P.hand)); }, 450));
        } else startClock();
        if (!root.contains(document.activeElement) || document.activeElement === root) root.focus();
      }
      function say(text, btn, got) {
        const goal = (P && P.goal) || 1;
        const dots = got == null ? "" : `<span class="tk-coach-dots" aria-label="${got} of ${goal} done">${Array.from({ length: goal }, (_, n) => `<i class="${n < got ? "on" : ""}"></i>`).join("")}</span>`;
        coach.innerHTML = `<div class="tk-coach-who">${helmet("#B99AF5", 52)}</div><div class="tk-coach-main"><p class="tk-coach-head"><b>${btn ? "You did it!" : "Practice"}</b>${dots}</p><p class="tk-coach-text">${esc(text)}</p></div><span class="tk-stamp" aria-hidden="true">Nice!</span>` +
          (btn ? `<button type="button" class="tk-coach-go dv-key">${esc(btn)}</button>` : `<button type="button" class="tk-coach-skip">Skip practice</button>`);
        const b = coach.querySelector("button");
        b.addEventListener("click", countdown);
        if (btn) b.focus({ preventScroll: true });
      }
      function stamp() {
        const st = coach.querySelector(".tk-stamp");
        if (st) { st.classList.remove("go"); void st.offsetWidth; st.classList.add("go"); }
      }
      function practiceDone() {
        if (!round || round.dead) return;
        round.dead = true;
        hand.classList.remove("on");
        ctx.sfx("good");
        markPracticed(actionId);
        say(P.done || "You've got it! Now the real one, with the clock running.", "I'm ready!", (P && P.goal) || 1);
        stamp();
      }
      let counting = false; // one countdown at a time (a double-click must not start two)
      function countdown() {
        if (done || counting) return;
        counting = true;
        if (round) round.dead = true;
        coach.hidden = true; hand.classList.remove("on");
        markPracticed(actionId);
        const c = document.createElement("div");
        c.className = "tk-count";
        c.setAttribute("role", "status");
        root.appendChild(c);
        const steps = ["3", "2", "1", "Go!"];
        steps.forEach((t, n) => timeouts.add(setTimeout(() => { c.textContent = t; c.classList.remove("tick"); void c.offsetWidth; c.classList.add("tick"); ctx.sfx(n === 3 ? "charge" : "click"); }, n * 550)));
        timeouts.add(setTimeout(() => { c.remove(); counting = false; newRound(false); }, steps.length * 550));
      }
      // a "?" button in the header replays the practice round any time
      const helpBtn = document.createElement("button");
      helpBtn.type = "button";
      helpBtn.className = "tk-help dv-key";
      helpBtn.setAttribute("aria-label", "How to play this game");
      helpBtn.textContent = "?";
      helpBtn.addEventListener("click", () => { if (!done) { ctx.sfx("click"); newRound(true); } });
      timerEl.parentElement.insertBefore(helpBtn, timerEl);

      newRound(!!(ctx.store.tutorial || !practiced(actionId)));
    }, { noEscape: true });
  }));
}
