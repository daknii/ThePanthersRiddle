/**
 * The Panther's Riddle — procedural soundtrack engine.
 *
 * Everything here is synthesised with the Web Audio API (no assets needed):
 *  - a continuous dark ambience whose "mood" morphs between pages
 *  - a heartbeat whose rate/volume follow proximity to the hidden target
 *  - a dissonant tension layer driven by Page 2 click count
 *  - one-shot stingers (success / death) and click ticks
 *
 * Optional: drop your own file at `public/audio/theme.mp3` and it will be
 * layered on top of the generated ambience automatically (the ambience is
 * lowered underneath it). If the file doesn't exist, nothing breaks.
 */

export type MusicMood = 'hunt' | 'binary' | 'poem' | 'deep' | 'death' | 'life';
export type Stinger = 'success' | 'death';

/** Path (served from /public) of an optional custom music track. */
export const CUSTOM_TRACK_URL = '/audio/theme.mp3';

const MASTER_VOLUME = 0.9;
const CUSTOM_TRACK_VOLUME = 0.75;
/** Level of the generated ambience when a custom track is playing. */
const GENERATED_UNDER_TRACK = 0.4;

/** Moods for routes reachable directly by URL (the "/" route is driven by App). */
const ROUTE_MOODS: Record<string, MusicMood> = {
  '/page3': 'poem',
  '/pagina3': 'poem',
  '/klvnz': 'poem',
  '/poema': 'life',
  '/floresta': 'deep',
  '/raiz': 'deep',
  '/raizes': 'deep',
  '/subsolo': 'deep',
  '/xxxx': 'deep',
  '/iris': 'hunt',
  '/silencio': 'deep',
};

export function moodForPath(pathname: string): MusicMood | null {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return ROUTE_MOODS[normalized] ?? null;
}

interface MoodPreset {
  /** Drone root frequency (Hz). Changing it glides the whole drone. */
  root: number;
  /** Ratio of the drone's upper voice (1.5 = fifth, √2 = tritone). */
  upperRatio: number;
  droneLevel: number;
  droneCutoff: number;
  subLevel: number;
  windLevel: number;
  /** Sparse bell / chime notes. */
  bellRoot: number;
  bellLevel: number;
  bellEveryMs: [number, number];
  scale: number[];
  /** Emit little binary "bytes" of blips (Page 2). */
  blips: boolean;
  reverbSend: number;
  /** Low-pass applied to the custom track (muffles it in darker moods). */
  trackCutoff: number;
  /** Custom track volume multiplier for this mood (default 1). */
  trackLevel?: number;
}

const MOODS: Record<MusicMood, MoodPreset> = {
  hunt: {
    root: 55, upperRatio: 1.5,
    droneLevel: 0.2, droneCutoff: 360, subLevel: 0.22, windLevel: 0.05,
    bellRoot: 220, bellLevel: 0.09, bellEveryMs: [5000, 11000], scale: [0, 3, 7, 10, 12, 15],
    blips: false, reverbSend: 0.9, trackCutoff: 18000,
  },
  binary: {
    root: 55, upperRatio: 1.5,
    droneLevel: 0.16, droneCutoff: 650, subLevel: 0.16, windLevel: 0.03,
    bellRoot: 440, bellLevel: 0.06, bellEveryMs: [1400, 3400], scale: [0, 1, 5, 7, 8, 12],
    blips: true, reverbSend: 0.7, trackCutoff: 18000,
  },
  poem: {
    root: 73.42, upperRatio: 1.5,
    droneLevel: 0.15, droneCutoff: 520, subLevel: 0.12, windLevel: 0.04,
    bellRoot: 293.66, bellLevel: 0.12, bellEveryMs: [2600, 6000], scale: [0, 2, 3, 7, 9, 12, 14],
    blips: false, reverbSend: 1, trackCutoff: 18000,
  },
  deep: {
    root: 41.2, upperRatio: 1.498,
    droneLevel: 0.24, droneCutoff: 260, subLevel: 0.28, windLevel: 0.08,
    bellRoot: 164.81, bellLevel: 0.06, bellEveryMs: [7000, 14000], scale: [0, 1, 6, 7],
    blips: false, reverbSend: 1, trackCutoff: 2500,
  },
  death: {
    root: 36.71, upperRatio: Math.SQRT2,
    droneLevel: 0.28, droneCutoff: 200, subLevel: 0.32, windLevel: 0.1,
    bellRoot: 146.83, bellLevel: 0.05, bellEveryMs: [8000, 16000], scale: [0, 1, 6],
    blips: false, reverbSend: 1, trackCutoff: 600,
  },
  // PoemaPage: the drone steps aside for the "life" song (see LIFE_SONG).
  life: {
    root: 65.41, upperRatio: 1.5,
    droneLevel: 0, droneCutoff: 400, subLevel: 0, windLevel: 0.015,
    bellRoot: 523.25, bellLevel: 0, bellEveryMs: [4000, 8000], scale: [0],
    blips: false, reverbSend: 0.75, trackCutoff: 18000, trackLevel: 0.15,
  },
};

// ─────────────── "Life" — gentle, upbeat-but-slow piano piece ───────────────
// Original composition in C major: rolling piano arpeggios, warm pad, a bouncy
// bass line, soft brushed drums and a lyrical lead melody.

const LIFE_BPM = 84;
/** Arpeggio pattern over a 4-note chord (4+ = same note an octave up). */
const LIFE_ARP = [0, 1, 2, 3, 4, 3, 2, 1];
/** Bass pattern per bar: [eighth, semitones above root, length in eighths, velocity]. */
const LIFE_BASS: Array<[number, number, number, number]> = [
  [0, 0, 3, 1], [3, 0, 1, 0.6], [4, 0, 2, 0.85], [6, 7, 2, 0.6],
];

interface LifeBar {
  bass: number;
  chord: [number, number, number, number];
  /** [eighth within bar, MIDI note, length in eighths] */
  melody: Array<[number, number, number]>;
}

const LIFE_SONG: LifeBar[] = [
  { bass: 41, chord: [53, 57, 60, 64], melody: [[0, 72, 3], [3, 76, 1], [4, 77, 2], [6, 76, 2]] }, // Fmaj7
  { bass: 43, chord: [55, 59, 62, 67], melody: [[0, 74, 3], [3, 71, 1], [4, 74, 4]] },             // G
  { bass: 40, chord: [52, 55, 59, 62], melody: [[0, 71, 3], [3, 74, 1], [4, 79, 2], [6, 76, 2]] }, // Em7
  { bass: 45, chord: [57, 60, 64, 67], melody: [[0, 76, 6], [6, 72, 2]] },                         // Am7
  { bass: 38, chord: [53, 57, 60, 62], melody: [[0, 77, 3], [3, 76, 1], [4, 74, 2], [6, 72, 2]] }, // Dm7
  { bass: 43, chord: [55, 60, 62, 65], melody: [[0, 74, 3], [3, 72, 1], [4, 74, 2], [6, 79, 2]] }, // G7sus4
  { bass: 36, chord: [55, 59, 60, 64], melody: [[0, 76, 4], [4, 79, 2], [6, 83, 2]] },             // Cmaj7
  { bass: 40, chord: [52, 56, 59, 62], melody: [[0, 80, 4], [4, 76, 2], [6, 74, 2]] },             // E7
];

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const semitone = (base: number, st: number) => base * Math.pow(2, st / 12);
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

class AudioEngine {
  private ctx: AudioContext | null = null;

  private master!: GainNode;
  private musicBus!: GainNode;
  private generatedBus!: GainNode;
  private sfxBus!: GainNode;
  private reverbSend!: GainNode;
  private noiseBuffer!: AudioBuffer;

  private droneOscs: OscillatorNode[] = [];
  private droneFilter!: BiquadFilterNode;
  private droneLfoDepth!: GainNode;
  private droneGain!: GainNode;
  private subOsc!: OscillatorNode;
  private subGain!: GainNode;
  private windGain!: GainNode;
  private tensionGain!: GainNode;
  private tensionLfo!: OscillatorNode;
  private trackFilter!: BiquadFilterNode;
  private trackGain!: GainNode;
  private trackEl: HTMLAudioElement | null = null;
  private lifeBus!: GainNode;
  private lifeStep = 0;
  private lifeNextTime = 0;

  private mood: MusicMood = 'hunt';
  private tension = 0;
  private heartbeatTarget = 0;
  private heartbeatLevel = 0;
  private lastDuck = 1;
  private nextBeatTime = 0;
  private muted = false;
  private hasCustomTrack = false;
  private bellTimer: number | null = null;

  get started(): boolean {
    return this.ctx !== null;
  }

  /** Must be called from a user gesture (click / key press). Idempotent. */
  start(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    this.ctx = ctx;
    void ctx.resume();

    this.buildGraph(ctx);
    this.applyMood(true);
    this.setTension(this.tension);

    const now = ctx.currentTime;
    this.master.gain.setValueAtTime(0, now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : MASTER_VOLUME, now + 4);

    this.startCustomTrack(ctx);
    this.scheduleBell(2500);
    window.setInterval(() => this.tick(), 25);
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('keydown', this.handleKey);
  }

  setMood(mood: MusicMood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    if (!this.ctx) return;
    if (mood === 'life') {
      // Let the drone fade out for a moment before the song begins.
      this.lifeStep = 0;
      this.lifeNextTime = this.ctx.currentTime + 1.2;
    }
    this.applyMood();
    this.scheduleBell(rand(1200, 2600));
  }

  /** 0..1 — dissonant cluster + brighter drone (Page 2 clicks). */
  setTension(value: number): void {
    this.tension = clamp01(value);
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    this.tensionGain.gain.setTargetAtTime(Math.pow(this.tension, 1.4) * 0.06, now, 0.25);
    this.tensionLfo.frequency.setTargetAtTime(1.5 + this.tension * 9, now, 0.3);
    this.updateDroneCutoff(0.4);
  }

  /** 0..1 — 0 silences the heartbeat; higher = faster and louder. */
  setHeartbeat(intensity: number): void {
    this.heartbeatTarget = clamp01(intensity);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_VOLUME, this.ctx.currentTime, 0.15);
    }
    return this.muted;
  }

  playClick(count: number): void {
    const ctx = this.running();
    if (!ctx) return;
    const t = ctx.currentTime;
    const freq = semitone(520, count * 2);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.12);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.16 + count * 0.015, t + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(env);
    this.route(env, this.sfxBus, 0.5, rand(-0.25, 0.25));
    osc.start(t);
    osc.stop(t + 0.2);

    if (count >= 3) this.playThump(t, 0.2 + count * 0.08);
  }

  playVaultTick(): void {
    const ctx = this.running();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.045);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.18, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    osc.connect(env);
    this.route(env, this.sfxBus, 0.25, rand(-0.1, 0.1));
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playPantherRoar(): void {
    const ctx = this.running();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 1. Guttural sub-bass chest rumble
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(85, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 2.2);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(350, t);
    subFilter.frequency.exponentialRampToValueAtTime(70, t + 2.2);

    const subEnv = ctx.createGain();
    subEnv.gain.setValueAtTime(0, t);
    subEnv.gain.linearRampToValueAtTime(0.85, t + 0.15);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

    sub.connect(subFilter).connect(subEnv);
    this.route(subEnv, this.sfxBus, 0.75);
    sub.start(t);
    sub.stop(t + 2.6);

    // 2. Vocal cords formant growl (detuned sawtooth cluster)
    [92, 98, 142].forEach((baseFreq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.35, t + 0.28);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 2.3);

      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(580 + i * 140, t);
      formant.frequency.exponentialRampToValueAtTime(220, t + 2.1);
      formant.Q.value = 3.2;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.48, t + 0.16);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      osc.connect(formant).connect(env);
      this.route(env, this.sfxBus, 0.8, rand(-0.2, 0.2));
      osc.start(t);
      osc.stop(t + 2.5);
    });

    // 3. Ferocious breath / noise roar blast
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1350, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(360, t + 2.2);
      noiseFilter.Q.value = 1.9;

      const noiseEnv = ctx.createGain();
      noiseEnv.gain.setValueAtTime(0, t);
      noiseEnv.gain.linearRampToValueAtTime(0.72, t + 0.12);
      noiseEnv.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);

      noise.connect(noiseFilter).connect(noiseEnv);
      this.route(noiseEnv, this.sfxBus, 0.95);
      noise.start(t);
      noise.stop(t + 2.7);
    }
  }

  playStinger(kind: Stinger): void {
    const ctx = this.running();
    if (!ctx) return;
    const t = ctx.currentTime;

    if (kind === 'success') {
      [0, 7, 12, 19, 24].forEach((st, i) => {
        this.playBell(semitone(220, st), 0.13, t + i * 0.11, this.sfxBus, 6);
      });
      this.playNoiseSwell(t, 'highpass', 2200, 0.05, 0.6, 2.6);
      return;
    }

    // death: falling impact + dissonant cluster + noise burst
    this.heartbeatTarget = 0;
    this.heartbeatLevel = 0;

    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(95, t);
    boom.frequency.exponentialRampToValueAtTime(28, t + 1.8);
    const boomEnv = ctx.createGain();
    boomEnv.gain.setValueAtTime(0, t);
    boomEnv.gain.linearRampToValueAtTime(0.9, t + 0.01);
    boomEnv.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    boom.connect(boomEnv).connect(this.sfxBus);
    boom.start(t);
    boom.stop(t + 3.1);

    const clusterFilter = ctx.createBiquadFilter();
    clusterFilter.type = 'lowpass';
    clusterFilter.frequency.setValueAtTime(1100, t);
    clusterFilter.frequency.exponentialRampToValueAtTime(110, t + 3);
    const clusterEnv = ctx.createGain();
    clusterEnv.gain.setValueAtTime(0, t);
    clusterEnv.gain.linearRampToValueAtTime(0.22, t + 0.02);
    clusterEnv.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    clusterFilter.connect(clusterEnv);
    this.route(clusterEnv, this.sfxBus, 0.9);
    [55, 58.27, 77.78, 82.41].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(clusterFilter);
      o.start(t);
      o.stop(t + 4.6);
    });

    this.playNoiseSwell(t, 'lowpass', 1400, 0.35, 0.005, 1.4);
  }

  // ───────────────────────────── internals ─────────────────────────────

  private running(): AudioContext | null {
    return this.ctx && this.ctx.state === 'running' ? this.ctx : null;
  }

  private buildGraph(ctx: AudioContext): void {
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.attack.value = 0.01;
    comp.release.value = 0.3;
    comp.connect(this.master);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.createImpulse(ctx, 4.5, 2.8);
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.8;
    reverb.connect(reverbOut).connect(comp);
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(reverb);

    this.musicBus = ctx.createGain();
    this.musicBus.connect(comp);
    this.generatedBus = ctx.createGain();
    this.generatedBus.connect(this.musicBus);
    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(comp);

    this.noiseBuffer = this.createNoise(ctx, 2);
    const p = MOODS[this.mood];

    // Drone: detuned saws + upper voice + octave, through a slowly breathing low-pass.
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.Q.value = 1.2;
    this.droneFilter.frequency.value = p.droneCutoff;
    this.droneGain = ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneFilter.connect(this.droneGain);
    this.route(this.droneGain, this.generatedBus, 0.35);

    const voices: Array<[OscillatorType, number, number]> = [
      ['sawtooth', 0, 0.5],
      ['sawtooth', 8, 0.5],
      ['sine', 0, 0.6],
      ['triangle', -5, 0.25],
    ];
    this.droneOscs = voices.map(([type, detune, level]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = level;
      o.connect(g).connect(this.droneFilter);
      o.start();
      return o;
    });

    const droneLfo = ctx.createOscillator();
    droneLfo.frequency.value = 0.045;
    this.droneLfoDepth = ctx.createGain();
    droneLfo.connect(this.droneLfoDepth).connect(this.droneFilter.frequency);
    droneLfo.start();

    // Sub: slowly "breathing" sine.
    this.subOsc = ctx.createOscillator();
    this.subOsc.type = 'sine';
    const subBreath = ctx.createGain();
    subBreath.gain.value = 0.75;
    const breathLfo = ctx.createOscillator();
    breathLfo.frequency.value = 0.08;
    const breathDepth = ctx.createGain();
    breathDepth.gain.value = 0.25;
    breathLfo.connect(breathDepth).connect(subBreath.gain);
    breathLfo.start();
    this.subGain = ctx.createGain();
    this.subGain.gain.value = 0;
    this.subOsc.connect(subBreath).connect(this.subGain).connect(this.generatedBus);
    this.subOsc.start();

    // Wind: band-passed noise with a wandering centre frequency.
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.Q.value = 0.7;
    windFilter.frequency.value = 520;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.06;
    const windDepth = ctx.createGain();
    windDepth.gain.value = 340;
    windLfo.connect(windDepth).connect(windFilter.frequency);
    windLfo.start();
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    wind.connect(windFilter).connect(this.windGain);
    this.route(this.windGain, this.generatedBus, 0.6);
    wind.start();

    // Tension: dissonant high cluster with tremolo (kept even under a custom track).
    const tensionMix = ctx.createGain();
    tensionMix.gain.value = 0.25;
    const tremolo = ctx.createGain();
    tremolo.gain.value = 0.6;
    this.tensionLfo = ctx.createOscillator();
    this.tensionLfo.frequency.value = 1.5;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.4;
    this.tensionLfo.connect(tremoloDepth).connect(tremolo.gain);
    this.tensionLfo.start();
    this.tensionGain = ctx.createGain();
    this.tensionGain.gain.value = 0;
    tensionMix.connect(tremolo).connect(this.tensionGain);
    this.route(this.tensionGain, this.musicBus, 0.7);
    [466.16, 493.88, 698.46, 739.99].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.detune.value = rand(-6, 6);
      o.connect(tensionMix);
      o.start();
    });

    // Custom track chain.
    this.trackFilter = ctx.createBiquadFilter();
    this.trackFilter.type = 'lowpass';
    this.trackFilter.frequency.value = p.trackCutoff;
    this.trackGain = ctx.createGain();
    this.trackGain.gain.value = 0;
    this.trackFilter.connect(this.trackGain).connect(this.musicBus);

    // Life song bus (piano, pad, drums, bass for PoemaPage)
    this.lifeBus = ctx.createGain();
    this.lifeBus.gain.value = 0;
    this.lifeBus.connect(this.musicBus);
  }

  private applyMood(immediate = false): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const p = MOODS[this.mood];
    const now = ctx.currentTime;
    const tc = immediate ? 0.01 : 2.2;
    const glide = immediate ? 0.01 : 3.5;

    const [sawA, sawB, upper, octave] = this.droneOscs;
    sawA.frequency.setTargetAtTime(p.root, now, glide);
    sawB.frequency.setTargetAtTime(p.root, now, glide);
    upper.frequency.setTargetAtTime(p.root * p.upperRatio, now, glide);
    octave.frequency.setTargetAtTime(p.root * 2, now, glide);
    this.subOsc.frequency.setTargetAtTime(p.root, now, glide);

    this.droneGain.gain.setTargetAtTime(p.droneLevel, now, tc);
    this.droneLfoDepth.gain.setTargetAtTime(p.droneCutoff * 0.45, now, tc);
    this.subGain.gain.setTargetAtTime(p.subLevel, now, tc);
    this.windGain.gain.setTargetAtTime(p.windLevel, now, tc);
    this.reverbSend.gain.setTargetAtTime(p.reverbSend, now, tc);
    this.trackFilter.frequency.setTargetAtTime(p.trackCutoff, now, tc);

    const lifeTargetGain = this.mood === 'life' ? 0.95 : 0;
    this.lifeBus.gain.setTargetAtTime(lifeTargetGain, now, tc);

    if (this.hasCustomTrack) {
      const trackLevel = p.trackLevel ?? 1;
      this.trackGain.gain.setTargetAtTime(CUSTOM_TRACK_VOLUME * trackLevel, now, tc);
    }

    this.updateDroneCutoff(tc);
  }

  private updateDroneCutoff(timeConstant: number): void {
    if (!this.ctx) return;
    const cutoff = MOODS[this.mood].droneCutoff + this.tension * 900;
    this.droneFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, timeConstant);
  }

  private scheduleBell(delayMs?: number): void {
    if (this.bellTimer !== null) window.clearTimeout(this.bellTimer);
    if (this.mood === 'life') return;
    const [min, max] = MOODS[this.mood].bellEveryMs;
    this.bellTimer = window.setTimeout(() => {
      this.playAmbientNote();
      this.scheduleBell();
    }, delayMs ?? rand(min, max));
  }

  private playAmbientNote(): void {
    const ctx = this.running();
    if (!ctx) return;
    const p = MOODS[this.mood];
    const t = ctx.currentTime;

    if (p.blips && Math.random() < 0.6) {
      // A random "byte": 8 blips, low = 0, high = 1.
      for (let i = 0; i < 8; i++) {
        const bit = Math.random() < 0.5 ? 0 : 1;
        this.playBlip(bit ? p.bellRoot * 3 : p.bellRoot * 2, 0.035, t + i * 0.085);
      }
      return;
    }

    const st = p.scale[Math.floor(Math.random() * p.scale.length)];
    this.playBell(semitone(p.bellRoot, st), p.bellLevel * rand(0.6, 1), t, this.generatedBus, 4.5);
  }

  private playBell(freq: number, level: number, when: number, dest: AudioNode, decay: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(level, when + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    this.route(env, dest, 0.9, rand(-0.6, 0.6));

    // Slightly inharmonic partials for a cold, metallic tone.
    const partials: Array<[number, number]> = [[1, 1], [2.756, 0.32], [5.404, 0.1], [0.5, 0.22]];
    partials.forEach(([ratio, amp]) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.value = amp;
      o.connect(g).connect(env);
      o.start(when);
      o.stop(when + decay + 0.1);
    });
  }

  private playBlip(freq: number, level: number, when: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = freq;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(level, when + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
    o.connect(lp).connect(env);
    this.route(env, this.generatedBus, 0.6, rand(-0.5, 0.5));
    o.start(when);
    o.stop(when + 0.1);
  }

  private tick(): void {
    this.heartbeatTick();
    this.lifeTick();
  }

  private lifeTick(): void {
    const ctx = this.running();
    if (!ctx) return;
    if (this.mood !== 'life') return;

    const now = ctx.currentTime;
    const stepDuration = 60 / (LIFE_BPM * 2);

    if (this.lifeNextTime < now) {
      this.lifeNextTime = now + 0.05;
    }

    while (this.lifeNextTime < now + 0.2) {
      const totalSteps = LIFE_SONG.length * 8;
      const currentStep = this.lifeStep % totalSteps;
      const barIndex = Math.floor(currentStep / 8);
      const eighthIndex = currentStep % 8;

      this.scheduleLifeStep(barIndex, eighthIndex, this.lifeNextTime, stepDuration);

      this.lifeStep = (this.lifeStep + 1) % totalSteps;
      this.lifeNextTime += stepDuration;
    }
  }

  private scheduleLifeStep(
    barIndex: number,
    eighthIndex: number,
    when: number,
    stepDuration: number,
  ): void {
    const bar = LIFE_SONG[barIndex];
    if (!bar) return;

    // 1. Warm pad chord (sustained for 1 full bar)
    if (eighthIndex === 0) {
      this.playPadChord(bar.chord, when, stepDuration * 8);
    }

    // 2. Rolling piano arpeggio
    const arpIdx = LIFE_ARP[eighthIndex];
    const arpMidi = arpIdx < 4 ? bar.chord[arpIdx] : bar.chord[arpIdx - 4] + 12;
    const arpVel = (eighthIndex === 0 ? 0.32 : 0.24) + rand(-0.02, 0.02);
    this.playPianoNote(arpMidi, when, stepDuration * 1.8, arpVel, false);

    // 3. Bass pattern
    for (const [step, offset, durSteps, vel] of LIFE_BASS) {
      if (step === eighthIndex) {
        this.playBassNote(bar.bass + offset, when, durSteps * stepDuration * 0.9, vel * 0.45);
      }
    }

    // 4. Lead melody (poignant piano voice)
    for (const [step, midi, durSteps] of bar.melody) {
      if (step === eighthIndex) {
        this.playPianoNote(midi, when, durSteps * stepDuration * 0.95, 0.52, true);
      }
    }

    // 5. Soft drums / percussion for the upbeat drive
    if (eighthIndex === 0) {
      this.playDrum('kick', when, 0.36);
    } else if (eighthIndex === 4) {
      this.playDrum('kick', when, 0.28);
    } else if (eighthIndex === 5 && Math.random() < 0.6) {
      this.playDrum('kick', when, 0.16);
    }

    // Snare / rim on beat 2 and 4 (eighths 2 and 6)
    if (eighthIndex === 2 || eighthIndex === 6) {
      this.playDrum('snare', when, 0.24);
    }

    // Shaker / Hi-hat on every eighth note with upbeat swing accent
    const isUpbeat = eighthIndex % 2 === 1;
    const hatVel = isUpbeat ? 0.18 : 0.09;
    this.playDrum('hihat', when, hatVel);
  }

  private playPianoNote(
    midi: number,
    when: number,
    duration: number,
    velocity: number,
    isMelody = false,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const freq = midiToHz(midi);
    const env = ctx.createGain();
    const peak = velocity * (isMelody ? 0.7 : 0.45);

    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.004);
    env.gain.setTargetAtTime(peak * 0.4, when + 0.005, 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = (isMelody ? 3800 : 2600) + velocity * 1500;
    filter.frequency.setValueAtTime(cutoff, when);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, when + duration);

    env.connect(filter);
    const pan = isMelody ? 0.05 : rand(-0.35, 0.35);
    this.route(filter, this.lifeBus, isMelody ? 0.7 : 0.45, pan);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = freq;
    o1.connect(env);
    o1.start(when);
    o1.stop(when + duration + 0.1);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq;
    o2.detune.value = isMelody ? 3 : 5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.55;
    o2.connect(g2).connect(env);
    o2.start(when);
    o2.stop(when + duration + 0.1);

    const o3 = ctx.createOscillator();
    o3.type = 'sine';
    o3.frequency.value = freq * 2;
    const g3 = ctx.createGain();
    g3.gain.value = 0.28;
    o3.connect(g3).connect(env);
    o3.start(when);
    o3.stop(when + duration + 0.1);

    const o4 = ctx.createOscillator();
    o4.type = 'triangle';
    o4.frequency.value = freq;
    const g4 = ctx.createGain();
    g4.gain.value = 0.15;
    o4.connect(g4).connect(env);
    o4.start(when);
    o4.stop(when + duration + 0.1);
  }

  private playPadChord(chord: [number, number, number, number], when: number, duration: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(0.045, when + 0.3);
    env.gain.setValueAtTime(0.045, when + duration - 0.3);
    env.gain.linearRampToValueAtTime(0.0001, when + duration + 0.1);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    env.connect(filter);
    this.route(filter, this.lifeBus, 0.8, 0);

    for (const midi of chord) {
      const freq = midiToHz(midi);
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.connect(env);
      o.start(when);
      o.stop(when + duration + 0.2);
    }
  }

  private playBassNote(midi: number, when: number, duration: number, velocity: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const freq = midiToHz(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(velocity, when + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, when);
    filter.frequency.exponentialRampToValueAtTime(160, when + duration);
    env.connect(filter).connect(this.lifeBus);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = freq;
    o1.connect(env);
    o1.start(when);
    o1.stop(when + duration + 0.05);

    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = freq;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    o2.connect(g2).connect(env);
    o2.start(when);
    o2.stop(when + duration + 0.05);
  }

  private playDrum(type: 'kick' | 'snare' | 'hihat', when: number, velocity: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, when);
      osc.frequency.exponentialRampToValueAtTime(36, when + 0.09);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(velocity, when + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);

      osc.connect(env).connect(this.lifeBus);
      osc.start(when);
      osc.stop(when + 0.2);
    } else if (type === 'snare') {
      if (!this.noiseBuffer) return;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 1.2;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(velocity * 0.7, when + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.11);

      noise.connect(filter).connect(env);
      this.route(env, this.lifeBus, 0.4, rand(-0.15, 0.15));
      noise.start(when);
      noise.stop(when + 0.15);

      const pop = ctx.createOscillator();
      pop.type = 'sine';
      pop.frequency.setValueAtTime(180, when);
      pop.frequency.exponentialRampToValueAtTime(80, when + 0.04);
      const popEnv = ctx.createGain();
      popEnv.gain.setValueAtTime(velocity * 0.4, when);
      popEnv.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
      pop.connect(popEnv).connect(this.lifeBus);
      pop.start(when);
      pop.stop(when + 0.08);
    } else if (type === 'hihat') {
      if (!this.noiseBuffer) return;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(velocity, when + 0.002);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.038);

      noise.connect(filter).connect(env);
      this.route(env, this.lifeBus, 0.25, 0.2);
      noise.start(when);
      noise.stop(when + 0.06);
    }
  }

  private heartbeatTick(): void {
    const ctx = this.running();
    if (!ctx) return;
    this.heartbeatLevel += (this.heartbeatTarget - this.heartbeatLevel) * 0.08;

    // Duck the music slightly as the heartbeat takes over.
    const duck = 1 - this.heartbeatLevel * 0.45;
    if (Math.abs(duck - this.lastDuck) > 0.01) {
      this.lastDuck = duck;
      this.musicBus.gain.setTargetAtTime(duck, ctx.currentTime, 0.3);
    }

    if (this.heartbeatLevel < 0.02) {
      this.nextBeatTime = 0;
      return;
    }

    const now = ctx.currentTime;
    if (this.nextBeatTime < now) this.nextBeatTime = now + 0.05;
    while (this.nextBeatTime < now + 0.12) {
      const lvl = this.heartbeatLevel;
      const period = 60 / (46 + lvl * 104); // 46 → 150 BPM
      const vol = 0.25 + lvl * 0.75;
      this.playThump(this.nextBeatTime, vol);
      this.playThump(this.nextBeatTime + Math.min(0.24, period * 0.32), vol * 0.62);
      this.nextBeatTime += period;
    }
  }

  private playThump(when: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(vol * 0.85, when + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, when + 0.26);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    env.connect(lp).connect(this.sfxBus);

    // Fundamental + an octave so it's audible on small laptop/phone speakers.
    ([['sine', 1, 1], ['triangle', 2, 0.35]] as Array<[OscillatorType, number, number]>).forEach(
      ([type, mult, amp]) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(78 * mult, when);
        o.frequency.exponentialRampToValueAtTime(36 * mult, when + 0.14);
        const g = ctx.createGain();
        g.gain.value = amp;
        o.connect(g).connect(env);
        o.start(when);
        o.stop(when + 0.3);
      },
    );
  }

  private playNoiseSwell(
    when: number, type: BiquadFilterType, freq: number, level: number, attack: number, release: number,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(level, when + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, when + attack + release);
    src.connect(f).connect(env);
    this.route(env, this.sfxBus, 1);
    src.start(when);
    src.stop(when + attack + release + 0.1);
  }

  /** Connect a node to a destination (optionally panned) plus a reverb send. */
  private route(node: AudioNode, dest: AudioNode, reverbAmount: number, pan = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    let out: AudioNode = node;
    if (pan !== 0) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      node.connect(panner);
      out = panner;
    }
    out.connect(dest);
    if (reverbAmount > 0) {
      const send = ctx.createGain();
      send.gain.value = reverbAmount;
      out.connect(send).connect(this.reverbSend);
    }
  }

  private startCustomTrack(ctx: AudioContext): void {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.src = CUSTOM_TRACK_URL;
    this.trackEl = audio;

    // Routed through Web Audio from the start so it can never play un-mixed.
    // If the file is missing, this source just outputs silence.
    ctx.createMediaElementSource(audio).connect(this.trackFilter);

    audio.addEventListener('playing', () => {
      if (this.hasCustomTrack) return;
      this.hasCustomTrack = true;
      const now = ctx.currentTime;
      this.trackGain.gain.setValueAtTime(0, now);
      this.trackGain.gain.linearRampToValueAtTime(CUSTOM_TRACK_VOLUME, now + 4);
      this.generatedBus.gain.setTargetAtTime(GENERATED_UNDER_TRACK, now, 1.5);
    });

    // Called within the user gesture so autoplay policies allow it.
    // Rejects quietly when no custom track exists.
    audio.play().catch(() => undefined);
  }

  private handleVisibility = (): void => {
    if (!this.ctx) return;
    if (document.hidden) {
      void this.ctx.suspend();
      this.trackEl?.pause();
    } else {
      void this.ctx.resume();
      if (this.hasCustomTrack) this.trackEl?.play().catch(() => undefined);
    }
  };

  private handleKey = (e: KeyboardEvent): void => {
    if (e.key !== 'm' && e.key !== 'M') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    this.toggleMute();
  };

  private createNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private createImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
