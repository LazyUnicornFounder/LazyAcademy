const SOUNDS = {
  ding: { freq: 880, duration: 0.15, type: "sine" as OscillatorType },
  whoosh: { freq: 400, duration: 0.3, type: "sawtooth" as OscillatorType, sweep: 100 },
  applause: { freq: 600, duration: 0.5, type: "triangle" as OscillatorType },
  levelUp: { freq: 523, duration: 0.6, type: "sine" as OscillatorType, arpeggio: [523, 659, 784, 1047] },
};

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function isMuted(): boolean {
  return localStorage.getItem("la_sound_muted") === "true";
}

export function setMuted(muted: boolean) {
  localStorage.setItem("la_sound_muted", muted ? "true" : "false");
}

export function getMuted(): boolean {
  return isMuted();
}

function playTone(freq: number, duration: number, type: OscillatorType, volume = 0.15) {
  if (isMuted()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playDing() {
  playTone(SOUNDS.ding.freq, SOUNDS.ding.duration, SOUNDS.ding.type, 0.12);
  // Second tone slightly higher for a pleasant ding
  setTimeout(() => playTone(1100, 0.12, "sine", 0.08), 80);
}

export function playWhoosh() {
  if (isMuted()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playApplause() {
  if (isMuted()) return;
  // Simulate with multiple random tones
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      playTone(300 + Math.random() * 800, 0.1, "triangle", 0.04);
    }, i * 60);
  }
}

export function playLevelUp() {
  if (isMuted()) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.1), i * 120);
  });
}
