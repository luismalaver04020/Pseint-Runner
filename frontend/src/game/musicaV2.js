// Banda sonora original sintetizada con Web Audio: no requiere archivos externos.
const THEMES = {
  menu:    { bpm: 108, root: 57, scale: [0, 3, 5, 7, 10, 12, 15], wave: 'triangle', bass: 'sine', groove: 0 },
  rocosa:  { bpm: 112, root: 55, scale: [0, 2, 4, 7, 9, 12, 14], wave: 'triangle', bass: 'triangle', groove: 1 },
  selva:   { bpm: 116, root: 52, scale: [0, 3, 5, 7, 10, 12, 15], wave: 'sine', bass: 'triangle', groove: 2 },
  costera: { bpm: 120, root: 60, scale: [0, 2, 4, 7, 9, 12, 14], wave: 'square', bass: 'triangle', groove: 3 },
  ciudad:  { bpm: 124, root: 50, scale: [0, 3, 5, 7, 10, 12, 15], wave: 'square', bass: 'sawtooth', groove: 4 },
};

let context;
let master;
let activeGain;
let activeNodes = [];
let scheduler;
let pendingTrackStart;
let unlocked = false;
let currentTrack = 'menu';
let enabled = readPreference();

function readPreference() {
  try { return localStorage.getItem('pseint-runner-musica') !== 'off'; }
  catch { return true; }
}

function getContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = enabled ? 0.72 : 0;
    master.connect(context.destination);
  }
  return context;
}

function noteFrequency(midi) { return 440 * (2 ** ((midi - 69) / 12)); }

function playTone(at, midi, duration, waveform, volume, destination, decay = 0.08) {
  const ctx = getContext();
  if (!ctx || !destination) return;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(noteFrequency(midi), at);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(at);
  oscillator.stop(at + duration + decay);
}

function playKick(at, destination, amount = 1) {
  const ctx = getContext();
  if (!ctx || !destination) return;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(105, at);
  oscillator.frequency.exponentialRampToValueAtTime(42, at + 0.12);
  envelope.gain.setValueAtTime(0.16 * amount, at);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(at);
  oscillator.stop(at + 0.15);
}

function playClick(at, destination, frequency = 1900, volume = 0.025) {
  const ctx = getContext();
  if (!ctx || !destination) return;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(volume, at);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(at);
  oscillator.stop(at + 0.04);
}

function stopScheduler() {
  if (scheduler) window.clearInterval(scheduler);
  scheduler = null;
}

function fadeOutActive(ctx) {
  if (!activeGain) return 0;
  const previous = activeGain;
  const previousNodes = activeNodes;
  previous.gain.cancelScheduledValues(ctx.currentTime);
  previous.gain.setTargetAtTime(0, ctx.currentTime, 0.018);
  activeGain = null;
  activeNodes = [];
  window.setTimeout(() => previousNodes.forEach((node) => { try { node.disconnect(); } catch { /* already disconnected */ } }), 90);
  return 100;
}

function startTrack() {
  const ctx = getContext();
  if (!ctx || !unlocked || !enabled) return;
  stopScheduler();
  const waitingForPrevious = Boolean(pendingTrackStart);
  if (pendingTrackStart) window.clearTimeout(pendingTrackStart);
  const wait = fadeOutActive(ctx) || (waitingForPrevious ? 100 : 0);
  if (wait) {
    pendingTrackStart = window.setTimeout(() => {
      pendingTrackStart = null;
      startTrack();
    }, wait);
    return;
  }

  const theme = THEMES[currentTrack] || THEMES.menu;
  const bus = ctx.createGain();
  bus.gain.value = 0.82;
  const output = ctx.createGain();
  output.gain.setValueAtTime(0.0001, ctx.currentTime);
  output.gain.setTargetAtTime(0.82, ctx.currentTime + 0.025, 0.16);
  output.connect(master);
  bus.connect(output);
  const echo = ctx.createDelay(0.45);
  const echoFeedback = ctx.createGain();
  const echoWet = ctx.createGain();
  echo.delayTime.value = theme.groove === 3 ? 0.19 : 0.145;
  echoFeedback.gain.value = 0.16;
  echoWet.gain.value = 0.12;
  bus.connect(echo);
  echo.connect(echoFeedback);
  echoFeedback.connect(echo);
  echo.connect(echoWet);
  echoWet.connect(output);
  activeGain = output;
  activeNodes = [bus, output, echo, echoFeedback, echoWet];

  const stepDuration = 60 / theme.bpm / 2;
  const melody = [0, 2, 4, 3, 1, 4, 2, 6, 4, 2, 3, 1, 0, 2, 4, 6];
  const bassPattern = [0, null, 0, null, 3, null, 4, null, 0, null, 0, null, 5, null, 3, null];
  const kickSteps = theme.groove === 2 ? [0, 5, 8, 13] : theme.groove === 3 ? [0, 4, 8, 12] : [0, 4, 8, 12];
  const startAt = ctx.currentTime + 0.06;
  let nextStep = 0;
  const schedule = () => {
    const horizon = ctx.currentTime + 0.13;
    while (startAt + nextStep * stepDuration < horizon) {
      const step = nextStep % 16;
      const bar = Math.floor(nextStep / 16);
      const at = startAt + nextStep * stepDuration;
      const scaleIndex = melody[(step + theme.groove * 3 + bar) % melody.length];
      const octave = (step === 3 || step === 11) ? 12 : 0;
      const melodicMidi = theme.root + 12 + theme.scale[scaleIndex] + octave;
      if (step === 0 || step === 8) {
        const chord = step === 0 ? [0, 2, 4] : [4, 6, 1];
        chord.forEach((degree) => playTone(at, theme.root + 12 + theme.scale[degree], stepDuration * 5.8, 'sine', 0.012, bus, 0.08));
      }
      if (step % 2 === 0 || (theme.groove === 2 && step % 4 === 3)) {
        playTone(at, melodicMidi, stepDuration * 0.78, theme.wave, 0.045, bus, 0.05);
      }
      const bassOffset = bassPattern[step];
      if (bassOffset !== null) {
        const degree = theme.scale[(bassOffset + theme.groove) % theme.scale.length];
        playTone(at, theme.root - 12 + degree, stepDuration * 0.88, theme.bass, 0.075, bus, 0.04);
      }
      if (kickSteps.includes(step)) playKick(at, bus, theme.groove === 4 ? 0.78 : 0.62);
      if ((theme.groove === 1 && (step === 4 || step === 12)) || (theme.groove === 2 && (step === 4 || step === 12))) {
        playClick(at, bus, 240, 0.035);
      }
      if (step % 2 === 1 && (theme.groove === 3 || theme.groove === 4)) playClick(at, bus, 2600, 0.012);
      nextStep += 1;
    }
  };
  schedule();
  scheduler = window.setInterval(schedule, 70);
}

export function unlockMusic() {
  const ctx = getContext();
  if (!ctx) return;
  unlocked = true;
  ctx.resume().then(() => {
    if (enabled && !scheduler) startTrack();
  }).catch(() => {});
}

export function setMusicTrack(track) {
  const nextTrack = track == null ? null : THEMES[track] ? track : 'menu';
  if (nextTrack === currentTrack) return;
  currentTrack = nextTrack;
  if (nextTrack === null) {
    stopScheduler();
    if (pendingTrackStart) window.clearTimeout(pendingTrackStart);
    pendingTrackStart = null;
    if (context) fadeOutActive(context);
    return;
  }
  if (unlocked && enabled) startTrack();
}

export function setMusicEnabled(value) {
  enabled = Boolean(value);
  try { localStorage.setItem('pseint-runner-musica', enabled ? 'on' : 'off'); } catch { /* storage can be unavailable */ }
  const ctx = getContext();
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(enabled ? 0.72 : 0, ctx.currentTime, 0.08);
  if (enabled && unlocked) startTrack();
  else if (!enabled) {
    stopScheduler();
    if (pendingTrackStart) window.clearTimeout(pendingTrackStart);
    pendingTrackStart = null;
    fadeOutActive(ctx);
  }
}

export function getMusicEnabled() { return enabled; }

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopScheduler();
    if (pendingTrackStart) window.clearTimeout(pendingTrackStart);
    activeNodes.forEach((node) => { try { node.disconnect(); } catch { /* already disconnected */ } });
    context?.close().catch(() => {});
  });
}
