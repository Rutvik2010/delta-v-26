// Entry point for the toy-console UI: a fixed 1280x800 stage scaled to fit the window, plus a router.
import { createCtx } from "./ctx.js";

const SCREENS = {
  title: "./screens/title.js",
  choose: "./screens/choose.js",
  briefing: "./screens/briefing.js",
  landing: "./screens/landing.js",
  game: "./screens/game.js",
  win: "./screens/win.js",
  lose: "./screens/lose.js",
};

const app = document.getElementById("app");
app.innerHTML = `<div id="viewport"><div id="stage"><div id="screen"></div></div></div>
<div id="portrait" role="alert"><div><svg aria-hidden="true" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#F5C518" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2"></rect><path d="M3 9l-1 3 1 3M21 9l1 3-1 3"></path></svg><p>Turn your device sideways to play Delta-V 26.</p></div></div>`;
const stage = document.getElementById("stage");
const screen = document.getElementById("screen");

// Scale the whole stage to fit, with letterboxing. --ex / --ey are the letterbox sizes in stage
// pixels, so a screen that wants to go edge to edge (the game) can bleed into them.
function fit() {
  const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  stage.style.setProperty("--ex", Math.max(0, (window.innerWidth / s - 1280) / 2) + "px");
  stage.style.setProperty("--ey", Math.max(0, (window.innerHeight / s - 800) / 2) + "px");
}
window.addEventListener("resize", fit);
window.addEventListener("orientationchange", fit);
fit();

let cleanup = null;
let token = 0;
async function go(name, params) {
  const my = ++token;
  const path = SCREENS[name];
  if (!path) throw new Error("Unknown screen: " + name);
  const mod = await import(path);
  if (my !== token) return;
  if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
  stage.querySelectorAll(".dv-overlay").forEach((el) => el.remove());
  screen.innerHTML = "";
  const root = document.createElement("div");
  root.id = "screen-" + name;
  root.style.cssText = "position: absolute; inset: 0; overflow: hidden";
  screen.appendChild(root);
  ctx.root = root;
  const result = await mod.mount(root, ctx, params);
  if (my === token && typeof result === "function") cleanup = result;
}

const ctx = createCtx({ stage, go });
window.__dv = { ctx, go }; // handy for testing in the browser console
go("title");
