// Shared pieces for the Delta-V 26 "toy spacecraft console" UI. READ-ONLY for screen authors:
// import from here, and put anything extra in your own file.

export const COLORS = {
  ink: "#1E2430", hull: "#C9CED6", panel: "#EEF0F2", key: "#F7F8F9", signal: "#F26A1B",
  screen: "#13211D", screenRing: "#2B3833", phosphor: "#A8F5C2", phosphorBright: "#E4FFEC",
  fact: "#FFF1C9", factBorder: "#B8862A", gain: "#1F7A35", cost: "#B3261E", muted: "#4A5363",
  spaceMoon: "#0B1020", spaceMars: "#1A1016", focus: "#F5C518",
};

export const RES = ["power", "oxygen", "shielding", "food"];
// Stroke icons (viewBox 0 0 24 24, stroke 2.4, round caps).
export const RES_INFO = {
  power: { name: "Power", color: "#F5C518", icon: "M13 2 4 14h7l-1 8 9-12h-7z" },
  oxygen: { name: "Oxygen", color: "#4BA3F0", icon: "M9 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM17.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
  shielding: { name: "Shield", color: "#9B7BF7", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" },
  food: { name: "Food", color: "#5CBF5A", icon: "M5 19c0-9 5-14 15-14 0 10-5 15-14 14zM5 19l8-8" },
  science: { name: "Science", color: "#F26A1B", icon: "M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-10V3" },
};
export const iconSvg = (key, size = 26, color = "currentColor") =>
  `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${RES_INFO[key].icon}"/></svg>`;

export const speakerSvg = (muted, size = 24, color = "currentColor") =>
  muted
    ? `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="${color}"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
    : `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="${color}"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;


export const CREW = [
  { id: "maya", name: "Maya", role: "Engineer", color: "#F79A6B", best: "making oxygen and fixing the shield", quote: "If it beeps, I can fix it." },
  { id: "leo", name: "Leo", role: "Plant expert (botanist)", color: "#8ED16C", best: "growing food", quote: "Plants first. Then snacks." },
  { id: "zuri", name: "Zuri", role: "Scientist", color: "#B99AF5", best: "exploring the crater and finding ice", quote: "Every rock has a story." },
];

export const SITES = {
  moon: {
    name: "The Moon", place: "Shackleton crater, near the south pole", base: "Shackleton Base, the Moon", button: "Build on the Moon",
    bullets: ["14 days of sun, then 14 days of night", "Tiny space rocks can poke holes", "Oxygen comes from moon dirt"],
    fact: "Some parts of Shackleton crater never get sunlight. Ice may be hiding there.",
    tag: "Best first mission!",
  },
  mars: {
    name: "Mars", place: "Jezero crater, an old lake bed", base: "Jezero Base, Mars", button: "Build on Mars",
    bullets: ["The Sun is weaker, so less power", "Dust storms come often", "Oxygen comes from the thin air"],
    fact: "The Perseverance rover landed in Jezero crater in 2021. Long ago, it was a lake.",
  },
};

// The five jobs. Ids match the engine's action ids. `res` is the meter the job mainly fills.
export const JOBS = {
  rest: { res: "power", short: "Solar tower", where: "Resting", label: () => "Rest and recharge",
    line: () => "The solar tower is charging the batteries. Time for a snack.",
    real: (m) => m ? "Mars landers run on solar panels, and dust is their enemy." : "At the Moon's south pole, tall solar towers catch the low Sun." },
  oxygen_gen: { res: "oxygen", short: "Oxygen maker", where: "At the oxygen maker", label: (m) => m ? "Make oxygen from air" : "Make oxygen from dirt",
    line: (m) => m ? "The maker is pulling oxygen out of the Mars air!" : "The maker is baking oxygen out of moon dirt!",
    real: (m) => m ? "NASA's MOXIE made oxygen from Mars air in 2021." : "About 40% of moon dirt's weight is oxygen." },
  reinforce_shield: { res: "shielding", short: "Dirt shield", where: "Fixing the shield", label: () => "Pile dirt on the dome",
    line: (m) => "More " + (m ? "Mars" : "moon") + " dirt on the roof. That blocks the Sun's rays.",
    real: () => "Piling dirt on a base can block harmful radiation." },
  grow_food: { res: "food", short: "Veggie garden", where: "In the garden", label: () => "Tend the veggie garden",
    line: () => "The lettuce is growing under the pink lights!",
    real: () => "In 2015, astronauts on the ISS ate lettuce grown in the Veggie garden." },
  science: { res: "science", short: "Crater", where: "In the crater", label: (m) => m ? "Collect rocks" : "Hunt for ice",
    line: (m) => m ? "This rock was shaped by water long ago!" : "I found ice in a crater that never sees the Sun!",
    real: (m) => m ? "The Perseverance rover collects rocks in Jezero crater." : "In 2009, LCROSS hit a dark crater near the Moon's south pole and found water ice." },
};
export const JOB_ORDER = ["rest", "oxygen_gen", "reinforce_shield", "grow_food", "science"];

export const WARN = {
  power: ["maya", "The lights are dimming, Commander. Someone should rest and recharge."],
  oxygen: ["zuri", "The air feels thin. Can someone run the oxygen maker?"],
  shielding: ["maya", "The shield is thin. A Sun storm could make us sick!"],
  food: ["leo", "My tummy is rumbling, Commander! The garden needs me."],
};
export const WEATHER_LABEL = { calm: "Calm", active: "Active", storm: "Storm" };

// ---- small markup helpers (return HTML strings) ----
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Keycap button style. variant: "primary" (orange), "light", "panel".
export function keycap(variant = "light", extra = "") {
  const v = {
    primary: "background: #F26A1B; box-shadow: 0 7px 0 #8E3A0B;",
    light: "background: #F7F8F9; box-shadow: 0 6px 0 #7C8592;",
    panel: "background: #EEF0F2; box-shadow: 0 6px 0 #7C8592;",
  }[variant];
  return `${v} border: 3px solid #1E2430; border-radius: 16px; color: #1E2430; font-family: inherit; font-weight: 800; cursor: pointer; ${extra}`;
}

export const screws = () =>
  ["left: 12px; top: 12px", "right: 12px; top: 12px", "left: 12px; bottom: 12px", "right: 12px; bottom: 12px"]
    .map((p) => `<span aria-hidden="true" style="position: absolute; ${p}; width: 9px; height: 9px; border-radius: 50%; background: #B8BEC8"></span>`).join("");

// The cream, dashed "True NASA fact" box.
export const factBox = (text, size = 17) =>
  `<div style="display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 12px; background: #FFF1C9; border: 2px dashed #B8862A">` +
  `<svg role="img" aria-label="True NASA fact" width="30" height="30" viewBox="0 0 24 24" style="flex-shrink: 0"><circle cx="12" cy="12" r="11" fill="#D9A43A"></circle><path d="m12 5 2 4.2 4.5.6-3.3 3.1.8 4.5L12 15.3 8 17.4l.8-4.5-3.3-3.1L10 9.2z" fill="#1E2430"></path></svg>` +
  `<p style="margin: 0; font-size: ${size}px; line-height: 1.45"><b>True NASA fact:</b> ${esc(text)}</p></div>`;

// A crew helmet badge. color = crew colour.
export const helmet = (color, size = 52, label = "") =>
  `<svg ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} width="${size}" height="${size}" viewBox="0 0 84 84"><circle cx="42" cy="42" r="39" fill="${color}" stroke="#1E2430" stroke-width="4"></circle><rect x="16" y="24" width="52" height="34" rx="17" fill="#1E2430"></rect><path d="M25 33h12" stroke="#8FD9F0" stroke-width="5" stroke-linecap="round"></path></svg>`;

export const starPath = "m12 2.5 2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z";

// { power: -8, actionsLeft: -1 } -> ["Power −8", "1 job lost today"]
export const effectTexts = (fx = {}) => Object.keys(fx).map((k) => {
  const n = fx[k];
  if (k === "actionsLeft") return n < 0 ? "You lose " + Math.abs(n) + " job" + (Math.abs(n) > 1 ? "s" : "") + " today" : "+" + n + " job today";
  return (RES_INFO[k] ? RES_INFO[k].name : k) + " " + (n > 0 ? "gains " : "loses ") + Math.abs(n);
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function dateText(iso) { // "2024-05-11" -> "May 11, 2024"
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return MONTHS[m - 1] + " " + d + ", " + y;
}
