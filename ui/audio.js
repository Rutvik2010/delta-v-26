// ui/audio.js - Web Audio SFX Synthesizer
// Provides zero-dependency sound effects for clicks, alerts, gains, and cosmic flares.

let audioCtx = null;

/**
 * Returns or initializes the browser AudioContext lazily on user gesture.
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a synthesized frequency tone with an envelope.
 */
function playTone(freq, duration, type = "sine", opts = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    if (opts.sweep) {
      osc.frequency.setValueAtTime(opts.sweep[0], ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.sweep[1]), ctx.currentTime + duration);
    }

    const maxGain = opts.gain ?? 0.1;
    gain.gain.setValueAtTime(maxGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio error:", err);
  }
}

/**
 * Plays synthesized filtered noise (used for flares and atmospheric rumbles).
 */
function playNoise(duration, filterFreq, opts = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);

    const gain = ctx.createGain();
    const maxGain = opts.gain ?? 0.12;
    gain.gain.setValueAtTime(maxGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSrc.start();
    noiseSrc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio error:", err);
  }
}

/**
 * Play a game sound effect by name.
 * Supported names: "click", "good", "warning", "flare"
 * @param {"click" | "good" | "warning" | "flare"} name
 */
export function playSfx(name) {
  switch (name) {
    case "click":
      // Short crisp interface click
      playTone(900, 0.05, "sine", { sweep: [900, 450], gain: 0.08 });
      break;

    case "good":
      // Bright ascending two-note chime
      playTone(523.25, 0.12, "sine", { gain: 0.1 }); // C5
      setTimeout(() => {
        playTone(659.25, 0.18, "sine", { gain: 0.12 }); // E5
      }, 70);
      break;

    case "warning":
      // Three pulsed square-wave caution beeps
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          playTone(240, 0.07, "square", { gain: 0.09 });
        }, i * 110);
      }
      break;

    case "flare":
      // Deep low-frequency solar rumble
      playNoise(0.6, 280, { gain: 0.15 });
      break;

    default:
      console.log(`[SFX] ${name}`);
      break;
  }
}

// Unlock audio context on initial pointer interaction
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => getAudioContext(), { once: true });
}
