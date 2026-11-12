// Delta-V 26 minigames. One short task per job, like fixing things on a spaceship.
// playMinigame(actionId, mars) resolves to true (perfect), or false (missed or skipped).
// Losing a minigame never costs anything. Winning gives a small bonus.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// The shared card: title, instructions, a play area, a timer bar and a Skip button.
// build(area, win, lose) sets up the game and may return a cleanup function.
function frame({ title, how, seconds, build }) {
  return new Promise((done) => {
    const veil = document.createElement("div");
    veil.className = "veil";
    veil.innerHTML = `<section class="mini" role="dialog" aria-modal="true" aria-labelledby="mg-t">
<div class="mg-head"><h2 id="mg-t"></h2><button class="btn ghost small" data-skip>Skip</button></div>
<p class="mg-how"></p><div class="mg-timer"><i></i></div><div class="mg-area"></div><div class="mg-result" aria-live="assertive"></div></section>`;
    veil.querySelector("h2").textContent = title;
    veil.querySelector(".mg-how").textContent = how;
    veil.querySelector(".mg-timer i").style.animationDuration = seconds + "s";
    document.body.appendChild(veil);

    const area = veil.querySelector(".mg-area");
    let over = false, cleanup = null;
    const finish = async (won, text) => {
      if (over) return;
      over = true;
      clearTimeout(timer);
      if (cleanup) cleanup();
      veil.querySelector(".mg-timer i").style.animationPlayState = "paused";
      const result = veil.querySelector(".mg-result");
      result.textContent = text;
      result.className = "mg-result show " + (won ? "won" : "ok");
      area.classList.add("done");
      await wait(text ? 950 : 0);
      veil.remove();
      done(won);
    };
    const win = () => finish(true, "Perfect! Bonus earned!");
    const lose = () => finish(false, "Good enough! Job done.");
    const timer = setTimeout(lose, seconds * 1000);
    veil.querySelector("[data-skip]").addEventListener("click", () => finish(false, ""));
    cleanup = build(area, win, lose) || null;
  });
}

// Rest: line the solar panel up with the moving Sun, then lock it.
function alignPanels() {
  return frame({
    title: "Aim the solar panel", how: "Slide the panel under the Sun, then press Lock.", seconds: 9,
    build(area, win, lose) {
      area.innerHTML = `<div class="al-track"><span class="al-sun"></span><span class="al-panel"></span></div>
<input class="al-slider" type="range" min="0" max="100" value="10" aria-label="Panel position"><button class="btn" data-lock>Lock</button>`;
      const sun = area.querySelector(".al-sun"), panel = area.querySelector(".al-panel"), slider = area.querySelector("input");
      let pos = 70, dir = 1;
      const move = setInterval(() => { pos += dir * 1.1; if (pos > 92 || pos < 8) dir = -dir; sun.style.left = pos + "%"; }, 40);
      const sync = () => { panel.style.left = slider.value + "%"; };
      slider.addEventListener("input", sync); sync();
      area.querySelector("[data-lock]").addEventListener("click", () => (Math.abs(pos - slider.value) <= 8 ? win() : lose()));
      return () => clearInterval(move);
    },
  });
}

// Oxygen: open the four valves in number order.
function openValves() {
  return frame({
    title: "Open the valves", how: "Tap the valves in order: 1, 2, 3, 4.", seconds: 8,
    build(area, win) {
      area.innerHTML = `<div class="grid4">${shuffle([1, 2, 3, 4]).map((n) => `<button class="valve" data-n="${n}">${n}</button>`).join("")}</div>`;
      let want = 1;
      area.querySelectorAll(".valve").forEach((b) => b.addEventListener("click", () => {
        if (+b.dataset.n === want) { b.classList.add("open"); b.disabled = true; want += 1; if (want > 4) win(); }
        else {
          area.classList.remove("oops"); void area.offsetWidth; area.classList.add("oops");
          want = 1; area.querySelectorAll(".valve").forEach((v) => { v.classList.remove("open"); v.disabled = false; });
        }
      }));
    },
  });
}

// Shield: tap fast to shovel soil onto the roof.
function shovelSoil(mars) {
  const goal = 14;
  return frame({
    title: "Shovel the soil", how: "Tap the shovel fast to cover the roof with " + (mars ? "Mars" : "Moon") + " soil!", seconds: 6,
    build(area, win) {
      area.innerHTML = `<div class="sh-bar"><i></i></div><button class="btn big" data-dig>Dig!</button>`;
      let n = 0;
      area.querySelector("[data-dig]").addEventListener("click", () => {
        n += 1;
        area.querySelector(".sh-bar i").style.width = Math.min(100, (n / goal) * 100) + "%";
        if (n >= goal) win();
      });
    },
  });
}

// Garden: water each plant when it droops, before it dries out.
function waterPlants() {
  const rounds = 5, need = 4;
  return frame({
    title: "Water the plants", how: "Tap each thirsty plant before it dries out. Get " + need + " of " + rounds + ".", seconds: 9,
    build(area, win, lose) {
      area.innerHTML = `<div class="grid3">${Array.from({ length: 6 }, (_, i) => `<button class="plant" data-i="${i}" aria-label="Plant ${i + 1}"><i></i></button>`).join("")}</div><div class="mg-count">0 / ${need}</div>`;
      const plants = [...area.querySelectorAll(".plant")];
      let hits = 0, round = 0, live = null, t = null, stopped = false;
      const next = () => {
        if (stopped) return;
        if (live) live.classList.remove("thirsty");
        if (round >= rounds) { hits >= need ? win() : lose(); return; }
        round += 1;
        live = shuffle(plants.filter((p) => p !== live))[0];
        live.classList.add("thirsty");
        t = setTimeout(next, 1400);
      };
      plants.forEach((p) => p.addEventListener("click", () => {
        if (p !== live || !p.classList.contains("thirsty")) return;
        hits += 1;
        p.classList.remove("thirsty"); p.classList.add("happy");
        setTimeout(() => p.classList.remove("happy"), 400);
        area.querySelector(".mg-count").textContent = hits + " / " + need;
        clearTimeout(t);
        if (hits >= need) win(); else t = setTimeout(next, 250);
      }));
      t = setTimeout(next, 400);
      return () => { stopped = true; clearTimeout(t); };
    },
  });
}

// Science: spot the shiny sample among the plain rocks, three times.
function findSample(mars) {
  const need = 3;
  return frame({
    title: mars ? "Find the water rock" : "Find the ice", how: "Tap the shiny " + (mars ? "rock" : "ice") + ". Find " + need + " in a row.", seconds: 9,
    build(area, win, lose) {
      let found = 0;
      const round = () => {
        const shiny = Math.floor(Math.random() * 9);
        area.innerHTML = `<div class="grid3 rocks">${Array.from({ length: 9 }, (_, i) => `<button class="rock${i === shiny ? " shiny" : ""}" style="--r:${Math.floor(Math.random() * 40) - 20}deg" aria-label="${i === shiny ? "Shiny sample" : "Rock"}"></button>`).join("")}</div><div class="mg-count">${found} / ${need}</div>`;
        area.querySelectorAll(".rock").forEach((b) => b.addEventListener("click", () => {
          if (!b.classList.contains("shiny")) return lose();
          found += 1;
          if (found >= need) win(); else round();
        }));
      };
      round();
    },
  });
}

const GAMES = { rest: alignPanels, oxygen_gen: openValves, reinforce_shield: shovelSoil, grow_food: waterPlants, science: findSample };

export function playMinigame(actionId, mars) {
  const game = GAMES[actionId];
  return game ? game(mars) : Promise.resolve(false);
}
