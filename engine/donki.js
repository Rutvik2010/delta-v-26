// Space weather for Delta-V 26.
// Tries NASA's live DONKI solar flare feed first.
// On ANY failure it falls back to the SAMPLE file in /data.
// source is "live" only when the answer came from NASA just now.
// Embedded sample data is never called live.

// Two addresses for the same NASA DONKI FLR feed. Tried in order.
// 1. NASA CCMC, the home of DONKI. No key needed.
// 2. api.nasa.gov. On 11 Nov 2026 its FLR path answered 404, so it is only a backup.
// TODO: swap DEMO_KEY for the team's own key. DEMO_KEY is limited to a few calls per hour.
const API_KEY = "DEMO_KEY";
const DONKI_FLR_URLS = [
  "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?",
  "https://api.nasa.gov/DONKI/FLR?api_key=" + API_KEY + "&",
];
const FALLBACK_URL = new URL("../data/space_weather_fallback.json", import.meta.url);

const LOOKBACK_DAYS = 3; // how far back to look for live flares
const TIMEOUT_MS = 5000; // give up on NASA after this long

// Flare class letter -> game weather. A and B flares are tiny, so they count as calm.
// TODO: real dataset mapping comes after 13 Nov. Update this table then.
const CLASS_TO_WEATHER = { A: "calm", B: "calm", C: "calm", M: "active", X: "storm" };
const RANK = { calm: 0, active: 1, storm: 2 };

// "M1.2" -> "active". Unknown classes count as calm.
function weatherForClass(flareClass) {
  const letter = String(flareClass || "").trim().charAt(0).toUpperCase();
  return CLASS_TO_WEATHER[letter] || "calm";
}

// The strongest weather in a list of flare classes. No flares = calm.
function strongest(classes) {
  let best = "calm";
  for (const c of classes) {
    const w = weatherForClass(c);
    if (RANK[w] > RANK[best]) best = w;
  }
  return best;
}

// Date -> "YYYY-MM-DD" in UTC.
function day(date) {
  return date.toISOString().slice(0, 10);
}

// Ask NASA for the flares of the last few days. Tries each address in turn.
async function fetchLive() {
  const end = new Date();
  const start = new Date(end.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const dates = "startDate=" + day(start) + "&endDate=" + day(end);

  let lastError;
  for (const base of DONKI_FLR_URLS) {
    try {
      return await fetchFlares(base + dates);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// One call to one DONKI address. Returns the game weather.
async function fetchFlares(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error("DONKI answered " + res.status);

  // DONKI sends an empty body when there were no flares.
  const body = (await res.text()).trim();
  const flares = body ? JSON.parse(body) : [];
  if (!Array.isArray(flares)) throw new Error("DONKI sent something that is not a list");

  return strongest(flares.map((f) => f.classType));
}

// Read the SAMPLE file. Works in the browser and in Node.
async function loadFallback() {
  let data;
  if (FALLBACK_URL.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    data = JSON.parse(await readFile(FALLBACK_URL, "utf8"));
  } else {
    const res = await fetch(FALLBACK_URL);
    if (!res.ok) throw new Error("Fallback file answered " + res.status);
    data = await res.json();
  }
  return data.flares;
}

// Pick one sample record at random, so offline games still get some variety.
// TODO: after 13 Nov, pick from the real dataset by date instead.
async function fromEmbedded() {
  const flares = await loadFallback();
  const pick = flares[Math.floor(Math.random() * flares.length)];
  return weatherForClass(pick.class);
}

// REAL DATA: solar flare records from NASA DONKI.
// Two datasets available: "may2024" (default) and "recent" (last 30 days).
// Returns one entry per sol: [{ weather, class, date }], or null if the file
// cannot be read. Pass it to withRealWeather() in index.js.
const DATASET_URLS = {
  may2024: new URL("../data/flares_2024_05.json", import.meta.url),
  recent: new URL("../data/flares_recent_2026.json", import.meta.url),
};

export async function loadRealWeather(dataset = "may2024") {
  try {
    const targetUrl = DATASET_URLS[dataset] || DATASET_URLS.may2024;
    let data;
    if (targetUrl.protocol === "file:") {
      const { readFile } = await import("node:fs/promises");
      data = JSON.parse(await readFile(targetUrl, "utf8"));
    } else {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("Real weather file answered " + res.status);
      data = await res.json();
    }
    return data.days.map((d) => ({ weather: weatherForClass(d.class), class: d.class, date: d.date }));
  } catch (error) {
    return null;
  }
}

// Returns { weather: "calm" | "active" | "storm", source: "live" | "embedded" }.
// Never throws.
export async function getSpaceWeather() {
  try {
    return { weather: await fetchLive(), source: "live" };
  } catch (liveError) {
    try {
      return { weather: await fromEmbedded(), source: "embedded" };
    } catch (fallbackError) {
      // Even the sample file failed. Calm is the safe default.
      return { weather: "calm", source: "embedded" };
    }
  }
}
