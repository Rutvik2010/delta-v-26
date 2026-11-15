// Shared context for every screen and overlay. Screens never import each other; they use ctx.
import * as engine from "../engine/index.js";
import { loadRealWeather } from "../engine/donki.js";
import { playSfx } from "./audio.js";
import { esc } from "./parts.js";

function getInitialMuted() {
  try {
    return localStorage.getItem("dv_muted") === "true";
  } catch (e) {
    return false;
  }
}

// One shared session. Screens read and write this.
export const store = {
  site: "moon",          // "moon" | "mars"
  planMode: "recent",    // "recent" (last 30 days, autumn 2026) | "may2024"
  plan: null,            // the real-weather plan for the mode, or null (practice weather)
  state: null,           // the engine state for the mission in progress
  facts: 0,              // how many real facts the player has seen (events)
  minigames: true,       // kept for old callers; every job now always plays its task
  difficulty: "normal",  // "easy" | "normal": mini game timers and goals (set on the briefing screen)
  streak: 0,             // mini games won in a row
  muted: getInitialMuted(),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createCtx({ stage, go }) {
  const muteListeners = new Set();
  const ctx = {
    stage, store, engine, go, esc, sleep, loadRealWeather,
    root: null, // set by the router to the current screen's container
    get muted() {
      return store.muted;
    },
    set muted(val) {
      store.muted = !!val;
      try {
        localStorage.setItem("dv_muted", String(store.muted));
      } catch (e) { /* ignore */ }
      muteListeners.forEach((fn) => {
        try { fn(store.muted); } catch (e) { /* listener error */ }
      });
    },
    isMuted() {
      return store.muted;
    },
    toggleMute() {
      ctx.muted = !store.muted;
      return store.muted;
    },
    onMuteChange(fn) {
      muteListeners.add(fn);
      return () => muteListeners.delete(fn);
    },
    sfx(name) {
      if (store.muted) return;
      try { playSfx(name); } catch (e) { /* sound is optional */ }
    },

    // Start a new mission with the chosen site and data mode. Returns the engine state.
    async startGame(site = store.site, mode = store.planMode) {
      store.site = site; store.planMode = mode;
      store.plan = await loadRealWeather(mode); // null if the file cannot load
      let s = engine.newGame(site);
      if (store.plan) s = engine.withRealWeather(s, store.plan);
      store.state = s; store.facts = 0; store.streak = 0;
      return s;
    },

    // What to print about where the weather comes from. { real: boolean, text: string, short: string }
    dataLabel() {
      const plan = store.plan;
      if (!plan || !plan.length) return { real: false, text: "Practice weather: made up, not real NASA data", short: "PRACTICE" };
      const M = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const a = plan[0].date.split("-").map(Number), b = plan[plan.length - 1].date.split("-").map(Number);
      const span = a[1] === b[1] ? M[a[1] - 1] : M[a[1] - 1] + "–" + M[b[1] - 1];
      return { real: true, text: "Real NASA DONKI flares, " + span + " " + b[0], short: "REAL NASA " + span + " " + b[0] };
    },

    // Open a full-stage layer above the screen. build(layer, close) fills it; close(value) removes it and
    // resolves the returned promise with value. Escape closes it too, unless opts.noEscape.
    openOverlay(build, opts = {}) {
      if (stage && stage.querySelector(".dv-overlay")) return Promise.resolve();
      return new Promise((resolve) => {
        const layer = document.createElement("div");
        layer.className = "dv-overlay";
        stage.appendChild(layer);
        const prev = document.activeElement;
        const onKey = (e) => { if (e.key === "Escape" && !opts.noEscape) close(undefined); };
        const close = (value) => {
          document.removeEventListener("keydown", onKey);
          layer.remove();
          if (prev && prev.focus) { try { prev.focus(); } catch (e) { /* element is gone */ } }
          resolve(value);
        };
        document.addEventListener("keydown", onKey);
        build(layer, close);
      });
    },
  };
  return ctx;
}
