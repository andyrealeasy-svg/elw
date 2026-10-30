// Web Audio API Sound Effects Synthesizer for RPG Combat
// Pure synth-generated, warm, low-passed, velvety sound effects.
// Designed with soft attack envelopes and gentle filtering to prevent ear fatigue.

let audioCtx: AudioContext | null = null;
let isMuted: boolean = typeof localStorage !== 'undefined' ? localStorage.getItem('sfx_muted') === 'true' : false;

export const getSoundMuteState = (): boolean => isMuted;

export const setSoundMuteState = (muted: boolean) => {
  isMuted = muted;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sfx_muted', muted ? 'true' : 'false');
  }
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
};

// Helper to create a noise buffer for sweeps and ambient textures
let cachedNoiseBuffer: AudioBuffer | null = null;
const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
};

// Soft gain node helper: always ramps smoothly to prevent clicks and transients
const createSoftGain = (ctx: AudioContext, targetVol: number, startTime: number, attackDur: number = 0.015): GainNode => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(targetVol, startTime + attackDur);
  return gain;
};

/* ========================================================================== */
/* CORE COMBAT SFX (SOOTHING, VELVETY, LOW-PASSED, WARM)                      */
/* ========================================================================== */

// 1. Normal Attack SFX: quiet, rounded impact with a subdued low-pass swoosh
export const playNormalAttackSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Soft air whoosh (warm lowpass-filtered noise, no highpass sharpness)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 0.14);
  
  const noiseGain = createSoftGain(ctx, 0.025, now, 0.025);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  // Soft wooden / blunt impact thud
  const osc = ctx.createOscillator();
  const oscGain = createSoftGain(ctx, 0.035, now, 0.02);
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(95, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
  
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.17);
  osc.start(now);
  osc.stop(now + 0.17);
};

// 2. Elemental Skill (Skill1) SFX: Warm, harmonic dual chime (lowpass-filtered)
export const playElementalSkillSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dual warm sine/triangle chimes (smooth rising chord, no piercing treble)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = createSoftGain(ctx, 0.065, now, 0.02);
  const gain2 = createSoftGain(ctx, 0.05, now, 0.02);
  
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(261.63, now); // C4
  osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.22); // C5
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(329.63, now); // E4
  osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.22); // E5

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(750, now);
  filter.frequency.linearRampToValueAtTime(600, now + 0.24);

  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain1);
  filter.connect(gain2);
  
  gain1.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.28);
  osc2.stop(now + 0.28);
};

// 3. Elemental Burst Ultimate (Skill2) SFX: Cinematic warm riser + rounded sub-boom
export const playUltimateBurstSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Soft cinematic brass/pad riser (warm triangle lowpass-filtered, no screech)
  const riser = ctx.createOscillator();
  const riserGain = createSoftGain(ctx, 0.09, now, 0.04);
  
  riser.type = 'triangle';
  riser.frequency.setValueAtTime(95, now);
  riser.frequency.exponentialRampToValueAtTime(340, now + 0.35);
  
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(300, now);
  lowpass.frequency.exponentialRampToValueAtTime(550, now + 0.35);

  riserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  riser.connect(lowpass);
  lowpass.connect(riserGain);
  riserGain.connect(ctx.destination);

  riser.start(now);
  riser.stop(now + 0.45);

  // Soft rounded sub-boom (warm sine, no piercing highs)
  const explosionTime = now + 0.32;
  
  const subBoom = ctx.createOscillator();
  const subGain = createSoftGain(ctx, 0.16, explosionTime, 0.02);
  subBoom.type = 'sine';
  subBoom.frequency.setValueAtTime(85, explosionTime);
  subBoom.frequency.exponentialRampToValueAtTime(30, explosionTime + 0.45);
  
  subGain.gain.exponentialRampToValueAtTime(0.0001, explosionTime + 0.5);
  
  subBoom.connect(subGain);
  subGain.connect(ctx.destination);
  subBoom.start(explosionTime);
  subBoom.stop(explosionTime + 0.55);

  // Gentle low-frequency ambient rumble
  const rumble = ctx.createBufferSource();
  rumble.buffer = getNoiseBuffer(ctx);
  
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.setValueAtTime(220, explosionTime);
  rumbleFilter.frequency.exponentialRampToValueAtTime(60, explosionTime + 0.35);
  
  const rumbleGain = createSoftGain(ctx, 0.07, explosionTime, 0.02);
  rumbleGain.gain.exponentialRampToValueAtTime(0.0001, explosionTime + 0.4);
  
  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(ctx.destination);
  
  rumble.start(explosionTime);
  rumble.stop(explosionTime + 0.45);
};

// 4. Critical Hit SFX: soft lower-register chime with a muted impact
export const playCritSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Lower sine tones keep critical hits distinct without a sharp high-frequency spike.
  const chime1 = ctx.createOscillator();
  const chime2 = ctx.createOscillator();
  const chimeGain1 = createSoftGain(ctx, 0.026, now, 0.02);
  const chimeGain2 = createSoftGain(ctx, 0.016, now, 0.02);
  
  chime1.type = 'sine';
  chime1.frequency.setValueAtTime(587.33, now);
  chime1.frequency.exponentialRampToValueAtTime(575, now + 0.22);
  
  chime2.type = 'sine';
  chime2.frequency.setValueAtTime(739.99, now);
  chime2.frequency.exponentialRampToValueAtTime(725, now + 0.22);

  chimeGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  chimeGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  
  chime1.connect(chimeGain1);
  chime2.connect(chimeGain2);
  chimeGain1.connect(ctx.destination);
  chimeGain2.connect(ctx.destination);
  
  chime1.start(now);
  chime2.start(now);
  chime1.stop(now + 0.25);
  chime2.stop(now + 0.25);

  // Soft wooden knock underpinning the crit
  const knock = ctx.createOscillator();
  const knockGain = createSoftGain(ctx, 0.022, now, 0.02);
  knock.type = 'triangle';
  knock.frequency.setValueAtTime(120, now);
  knock.frequency.exponentialRampToValueAtTime(48, now + 0.1);

  knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  knock.connect(knockGain);
  knockGain.connect(ctx.destination);

  knock.start(now);
  knock.stop(now + 0.1);
};

let lastVictorySoundTimestamp = 0;

// 5. Victory Battle SFX: Warm, gentle acoustic arpeggio + peaceful major chord swell
export const playVictorySound = () => {
  if (isMuted) return;
  const nowWall = Date.now();
  if (nowWall - lastVictorySoundTimestamp < 3500) {
    return;
  }
  lastVictorySoundTimestamp = nowWall;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Gentle, soothing notes (C4, E4, G4, C5, E5, G5)
  const notes = [
    { pitch: 261.63, dur: 0.5, vol: 0.06 },
    { pitch: 329.63, dur: 0.5, vol: 0.06 },
    { pitch: 392.00, dur: 0.5, vol: 0.06 },
    { pitch: 523.25, dur: 0.7, vol: 0.07 },
    { pitch: 659.25, dur: 0.8, vol: 0.07 },
    { pitch: 783.99, dur: 1.0, vol: 0.07 }
  ];

  // Soft background pad
  const padFreqs = [196.00, 261.63, 329.63];
  padFreqs.forEach((freq) => {
    const padOsc = ctx.createOscillator();
    const padGain = createSoftGain(ctx, 0.035, now + 0.1, 0.3);
    
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(freq, now + 0.1);
    
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    
    padOsc.connect(padGain);
    padGain.connect(ctx.destination);
    
    padOsc.start(now + 0.1);
    padOsc.stop(now + 1.8);
  });

  // Play delicate chime arpeggios
  notes.forEach((note, index) => {
    const playTime = now + index * 0.12;
    const osc = ctx.createOscillator();
    const gain = createSoftGain(ctx, note.vol, playTime, 0.015);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.pitch, playTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, playTime + note.dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(playTime);
    osc.stop(playTime + note.dur + 0.1);
  });
};

// 6. Gacha Atmospheric Meteor Sound: Muffled cosmic ambient wind
export const playWishMeteorSound = (rarity: 'S' | 'A' | 'B' = 'B') => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Soft ambient lowpass wind sweep
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, now);
  filter.frequency.exponentialRampToValueAtTime(700, now + 1.0);
  filter.frequency.exponentialRampToValueAtTime(180, now + 2.2);

  const noiseGain = createSoftGain(ctx, 0.08, now, 0.4);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 2.5);

  // Deep soothing drone
  const subOsc = ctx.createOscillator();
  const subGain = createSoftGain(ctx, 0.08, now, 0.3);
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(65, now);
  subOsc.frequency.linearRampToValueAtTime(95, now + 1.2);
  subOsc.frequency.exponentialRampToValueAtTime(45, now + 2.2);

  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 2.5);

  // Soft warm chimes
  const chimes = rarity === 'S' 
    ? [392.00, 493.88, 587.33, 783.99]
    : rarity === 'A'
    ? [329.63, 392.00, 523.25, 659.25]
    : [261.63, 329.63, 392.00, 523.25];

  chimes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const g = createSoftGain(ctx, 0.04, now + 0.3 + idx * 0.16, 0.02);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + 0.3 + idx * 0.16);

    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.16);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + 0.3 + idx * 0.16);
    osc.stop(now + 1.3 + idx * 0.16);
  });
};

// 7. Gacha Impact / Starburst Sound
export const playWishImpactSound = (rarity: 'S' | 'A' | 'B' = 'B') => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Gentle impact thud
  const bass = ctx.createOscillator();
  const bassGain = createSoftGain(ctx, rarity === 'S' ? 0.15 : 0.10, now, 0.015);
  bass.type = 'sine';
  bass.frequency.setValueAtTime(110, now);
  bass.frequency.exponentialRampToValueAtTime(32, now + 0.35);

  bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  bass.connect(bassGain);
  bassGain.connect(ctx.destination);
  bass.start(now);
  bass.stop(now + 0.55);

  // Sweet warm chord
  const freqs = rarity === 'S' ? [523.25, 659.25, 783.99, 1046.50] : [392.00, 523.25, 659.25];
  freqs.forEach(f => {
    const o = ctx.createOscillator();
    const g = createSoftGain(ctx, 0.045, now, 0.02);
    o.type = 'sine';
    o.frequency.setValueAtTime(f, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.7);
  });
};

export const playRiftGachaMusic = (featuredHit: boolean): (() => void) => {
  if (isMuted) return () => {};
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const now = ctx.currentTime;
  const scheduled: { oscillator: OscillatorNode; endsAt: number }[] = [];
  const notes = featuredHit
    ? [392, 523.25, 659.25, 783.99, 659.25, 1046.5, 783.99, 1046.5]
    : [261.63, 329.63, 392, 523.25, 392, 523.25, 659.25, 523.25];
  const beat = 0.27;

  notes.forEach((frequency, index) => {
    const start = now + index * beat;
    const oscillator = ctx.createOscillator();
    const gain = createSoftGain(ctx, index % 2 === 0 ? 0.055 : 0.04, start, 0.025);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(featuredHit ? 1500 : 1100, start);
    oscillator.type = index % 3 === 0 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.27);
    scheduled.push({ oscillator, endsAt: start + 0.27 });
  });

  [130.81, 196, 261.63].forEach((frequency, index) => {
    const start = now + index * beat * 2;
    const oscillator = ctx.createOscillator();
    const gain = createSoftGain(ctx, 0.035, start, 0.04);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.48);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.5);
    scheduled.push({ oscillator, endsAt: start + 0.5 });
  });

  return () => {
    const stopAt = ctx.currentTime;
    scheduled.forEach(({ oscillator, endsAt }) => {
      if (stopAt < endsAt) oscillator.stop(stopAt);
    });
  };
};

export const playRiftGachaImpact = (featuredHit: boolean) => {
  if (isMuted) return;
  playWishImpactSound(featuredHit ? 'S' : 'A');
};

/* ========================================================================== */
/* VAYREN (ВАЙРЕН) PLEASANT & COZY COMBAT SFX                                 */
/* Organic, soothing, warm wood, gentle leaves, soft water droplets           */
/* ========================================================================== */

// 1. Basic Attack: «Шёпот чащи» (Whisper of the Thicket)
// Soft marimba tap + muffled autumn leaf rustle (velvety, completely painless to ears)
export const playVairenAttackSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Layer 1: Soft warm wooden marimba strike (pure sine/triangle, very gentle)
  const woodOsc = ctx.createOscillator();
  const woodGain = createSoftGain(ctx, 0.075, now, 0.01);
  woodOsc.type = 'sine';
  woodOsc.frequency.setValueAtTime(160, now);
  woodOsc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

  woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

  woodOsc.connect(woodGain);
  woodGain.connect(ctx.destination);

  woodOsc.start(now);
  woodOsc.stop(now + 0.15);

  // Layer 2: Muffled velvet leaf rustle (pink/lowpass-filtered noise, cutoff at 380Hz)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(380, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.14);

  const noiseGain = createSoftGain(ctx, 0.04, now, 0.015);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.16);

  // Layer 3: Warm quiet forest hum (comforting low sine undertone)
  const humOsc = ctx.createOscillator();
  const humGain = createSoftGain(ctx, 0.02, now, 0.02);
  humOsc.type = 'sine';
  humOsc.frequency.setValueAtTime(260, now);
  humOsc.frequency.exponentialRampToValueAtTime(160, now + 0.14);

  humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  humOsc.connect(humGain);
  humGain.connect(ctx.destination);

  humOsc.start(now);
  humOsc.stop(now + 0.17);
};

// 2. Elemental Skill (Skill1): «Лоза мрака» (Dark Vine)
// Deep gentle root plunge + smooth vine whoosh + cozy kalimba seed chime
export const playVairenSkillSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Layer 1: Warm subterranean root resonance (muffled sine, gentle attack)
  const rootThud = ctx.createOscillator();
  const rootGain = createSoftGain(ctx, 0.09, now, 0.015);
  rootThud.type = 'sine';
  rootThud.frequency.setValueAtTime(90, now);
  rootThud.frequency.exponentialRampToValueAtTime(40, now + 0.28);

  rootGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  rootThud.connect(rootGain);
  rootGain.connect(ctx.destination);

  rootThud.start(now);
  rootThud.stop(now + 0.35);

  // Layer 2: Gentle vine swoosh (warm lowpass noise, no harsh crack)
  const vineNoise = ctx.createBufferSource();
  vineNoise.buffer = getNoiseBuffer(ctx);
  const vineFilter = ctx.createBiquadFilter();
  vineFilter.type = 'lowpass';
  vineFilter.frequency.setValueAtTime(320, now);
  vineFilter.frequency.exponentialRampToValueAtTime(90, now + 0.18);

  const vineGain = createSoftGain(ctx, 0.045, now, 0.02);
  vineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  vineNoise.connect(vineFilter);
  vineFilter.connect(vineGain);
  vineGain.connect(ctx.destination);

  vineNoise.start(now);
  vineNoise.stop(now + 0.22);

  // Layer 3: Soft Kalimba / Music-Box Seed Chime (warm, comforting acoustic bell)
  const seedChimes = [
    { freq: 392.00, time: now + 0.08, dur: 0.26 }, // G4
    { freq: 493.88, time: now + 0.14, dur: 0.28 }  // B4
  ];

  seedChimes.forEach(n => {
    const sOsc = ctx.createOscillator();
    const sGain = createSoftGain(ctx, 0.045, n.time, 0.015);
    sOsc.type = 'sine';
    sOsc.frequency.setValueAtTime(n.freq, n.time);
    sOsc.frequency.exponentialRampToValueAtTime(n.freq * 1.02, n.time + n.dur);

    sGain.gain.exponentialRampToValueAtTime(0.0001, n.time + n.dur);

    sOsc.connect(sGain);
    sGain.connect(ctx.destination);

    sOsc.start(n.time);
    sOsc.stop(n.time + n.dur + 0.05);
  });
};

// 3. Elemental Burst (Skill2): «Сердце древнего леса» (Heart of the Ancient Forest)
// Relaxing, comforting forest heartbeat (double warm pulse) + lush ambient fantasy chord
export const playVairenUltimateSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Heartbeat Pulse 1: Warm, deep, muffled "thud" (sine 50Hz, soft attack)
  const pulse1 = ctx.createOscillator();
  const pulseGain1 = createSoftGain(ctx, 0.10, now, 0.02);
  pulse1.type = 'sine';
  pulse1.frequency.setValueAtTime(52, now);
  pulse1.frequency.exponentialRampToValueAtTime(30, now + 0.2);

  pulseGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  pulse1.connect(pulseGain1);
  pulseGain1.connect(ctx.destination);
  pulse1.start(now);
  pulse1.stop(now + 0.25);

  // Heartbeat Pulse 2: Second comforting pulse at +0.16s
  const pulse2Time = now + 0.16;
  const pulse2 = ctx.createOscillator();
  const pulseGain2 = createSoftGain(ctx, 0.12, pulse2Time, 0.025);
  pulse2.type = 'sine';
  pulse2.frequency.setValueAtTime(58, pulse2Time);
  pulse2.frequency.exponentialRampToValueAtTime(28, pulse2Time + 0.28);

  pulseGain2.gain.exponentialRampToValueAtTime(0.0001, pulse2Time + 0.3);

  pulse2.connect(pulseGain2);
  pulseGain2.connect(ctx.destination);
  pulse2.start(pulse2Time);
  pulse2.stop(pulse2Time + 0.35);

  // Soft atmospheric canopy swell (warm lowpass pad, relaxing and ambient)
  const pad = ctx.createOscillator();
  const padGain = createSoftGain(ctx, 0.04, now + 0.1, 0.2);
  pad.type = 'triangle';
  pad.frequency.setValueAtTime(164.81, now + 0.1); // E3
  
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(280, now);
  padGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  pad.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(ctx.destination);

  pad.start(now + 0.1);
  pad.stop(now + 0.75);

  // Beautiful, gentle forest music-box melody at now + 0.32s
  // E4, G4, B4, E5 (pure sines, low gain, sweet like a fantasy lullaby)
  const bloomTime = now + 0.32;
  const chimes = [
    { freq: 329.63, delay: 0.00, dur: 0.6, vol: 0.045 }, // E4
    { freq: 392.00, delay: 0.06, dur: 0.6, vol: 0.040 }, // G4
    { freq: 493.88, delay: 0.12, dur: 0.7, vol: 0.040 }, // B4
    { freq: 659.25, delay: 0.18, dur: 0.8, vol: 0.045 }  // E5
  ];

  chimes.forEach(c => {
    const playT = bloomTime + c.delay;
    const osc = ctx.createOscillator();
    const g = createSoftGain(ctx, c.vol, playT, 0.015);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(c.freq, playT);

    g.gain.exponentialRampToValueAtTime(0.0001, playT + c.dur);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(playT);
    osc.stop(playT + c.dur + 0.1);
  });
};

// 4. Dark Flower Bloom: «Раскрытие Цветка мрака»
// Soft rounded wooden bubble pop + cozy floral bell
export const playVairenFlowerBloomSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Soft wooden bubble pop
  const pop = ctx.createOscillator();
  const popGain = createSoftGain(ctx, 0.07, now, 0.008);
  pop.type = 'sine';
  pop.frequency.setValueAtTime(170, now);
  pop.frequency.exponentialRampToValueAtTime(70, now + 0.11);

  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  pop.connect(popGain);
  popGain.connect(ctx.destination);
  pop.start(now);
  pop.stop(now + 0.14);

  // Gentle flower chime (sweet warm sine)
  const chime = ctx.createOscillator();
  const chimeGain = createSoftGain(ctx, 0.035, now + 0.03, 0.015);
  chime.type = 'sine';
  chime.frequency.setValueAtTime(523.25, now + 0.03); // C5
  chime.frequency.exponentialRampToValueAtTime(659.25, now + 0.22); // E5

  chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

  chime.connect(chimeGain);
  chimeGain.connect(ctx.destination);
  chime.start(now + 0.03);
  chime.stop(now + 0.26);
};

// 5. Seed Absorption: «Семя поглощает Бутонизацию»
// ASMR-like soothing water droplet + delicate leafy sprout chime
export const playVairenSeedAbsorbSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Soothing water drop
  const drop = ctx.createOscillator();
  const dropGain = createSoftGain(ctx, 0.055, now, 0.01);
  drop.type = 'sine';
  drop.frequency.setValueAtTime(240, now);
  drop.frequency.exponentialRampToValueAtTime(420, now + 0.08);

  dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

  drop.connect(dropGain);
  dropGain.connect(ctx.destination);
  drop.start(now);
  drop.stop(now + 0.13);

  // Soft sprout tone
  const sprout = ctx.createOscillator();
  const sproutGain = createSoftGain(ctx, 0.03, now + 0.04, 0.015);
  sprout.type = 'sine';
  sprout.frequency.setValueAtTime(440, now + 0.04);
  sprout.frequency.exponentialRampToValueAtTime(554.37, now + 0.18);

  sproutGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  sprout.connect(sproutGain);
  sproutGain.connect(ctx.destination);
  sprout.start(now + 0.04);
  sprout.stop(now + 0.22);
};

// 6. Grand Bloom (C6): «Великое цветение»
// Warm ambient sub swell + gentle harp/celesta cascade
export const playVairenGrandBloomSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Warm ambient bass wave
  const sub = ctx.createOscillator();
  const subG = createSoftGain(ctx, 0.12, now, 0.04);
  sub.type = 'sine';
  sub.frequency.setValueAtTime(65, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + 0.55);

  subG.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

  sub.connect(subG);
  subG.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.7);

  // Gentle harp cascade (warm pentatonic sines)
  const notes = [329.63, 392.00, 493.88, 587.33, 659.25];
  notes.forEach((f, idx) => {
    const playT = now + idx * 0.06;
    const osc = ctx.createOscillator();
    const g = createSoftGain(ctx, 0.04, playT, 0.015);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, playT);

    g.gain.exponentialRampToValueAtTime(0.0001, playT + 0.5);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(playT);
    osc.stop(playT + 0.55);
  });
};

const playHofmannitaTone = (
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  waveform: OscillatorType = 'sine',
  endFrequency = frequency,
  destination: AudioNode = ctx.destination,
) => {
  const oscillator = ctx.createOscillator();
  const gain = createSoftGain(ctx, volume, startTime, 0.012);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, startTime);
  filter.frequency.exponentialRampToValueAtTime(650, startTime + duration);
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (endFrequency !== frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
};

type SignatureCombatCharacter = 'cmh' | 'iva' | 'nereus' | 'kairen' | 'aveline' | 'volta' | 'selina' | 'asher' | 'ineffa' | 'fenris' | 'zephyr' | 'aurum' | 'aelita' | 'maestro' | 'cyrus' | 'raven';
type SignatureCombatAction = 'attack' | 'skill' | 'ultimate';

const playSignatureNoise = (
  ctx: AudioContext,
  startTime: number,
  duration: number,
  volume: number,
  startCutoff: number,
  endCutoff: number,
) => {
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(startCutoff, startTime);
  filter.frequency.exponentialRampToValueAtTime(endCutoff, startTime + duration);
  const gain = createSoftGain(ctx, volume, startTime, 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
  noise.stop(startTime + duration + 0.02);
};

export const playSignatureCombatSound = (
  character: SignatureCombatCharacter,
  action: SignatureCombatAction,
) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const ultimate = action === 'ultimate';
  const skill = action === 'skill';
  const length = (attack: number, skillLength: number, ultimateLength: number) =>
    ultimate ? ultimateLength : skill ? skillLength : attack;

  if (character === 'cmh') {
    const beatCount = ultimate ? 4 : skill ? 2 : 1;
    for (let beat = 0; beat < beatCount; beat++) {
      const at = now + beat * (ultimate ? 0.12 : 0.075);
      playHofmannitaTone(ctx, ultimate ? 65.41 : 82.41, at, 0.12, ultimate ? 0.045 : 0.032, 'sine', 43.65);
      playHofmannitaTone(ctx, [220, 329.63, 440, 659.25][beat], at, length(0.09, 0.13, 0.18), 0.035, 'triangle');
    }
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.5 : 0.24, 0.018, 900, 180);
    return;
  }

  if (character === 'iva') {
    playSignatureNoise(ctx, now, length(0.13, 0.3, 0.55), ultimate ? 0.035 : 0.026, 650, 140);
    const notes = ultimate ? [329.63, 392, 493.88, 659.25, 783.99] : skill ? [392, 493.88, 587.33] : [493.88];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.085 : 0.06);
      playHofmannitaTone(ctx, frequency, at, length(0.18, 0.28, 0.48), 0.032 / (index > 2 ? 1.5 : 1), 'sine', frequency * (index % 2 ? 1.015 : 0.995));
    });
    return;
  }

  if (character === 'nereus') {
    playSignatureNoise(ctx, now, length(0.2, 0.42, 0.72), ultimate ? 0.04 : 0.032, 1200, 100);
    const notes = ultimate ? [293.66, 220, 164.81, 220] : skill ? [329.63, 246.94, 196] : [392, 293.66];
    notes.forEach((frequency, index) => {
      playHofmannitaTone(ctx, frequency, now + index * (ultimate ? 0.12 : 0.07), length(0.2, 0.3, 0.52), 0.033, 'sine', frequency * 0.78);
    });
    return;
  }

  if (character === 'kairen') {
    const notes = ultimate ? [174.61, 261.63, 349.23, 523.25, 698.46] : skill ? [349.23, 523.25, 698.46] : [523.25, 698.46];
    if (ultimate) playHofmannitaTone(ctx, 87.31, now, 0.5, 0.045, 'sine', 65.41);
    notes.forEach((frequency, index) => {
      playHofmannitaTone(ctx, frequency, now + index * (ultimate ? 0.085 : 0.06), length(0.2, 0.34, 0.58), 0.028, index === 0 ? 'triangle' : 'sine');
    });
    return;
  }

  if (character === 'aveline') {
    const notes = ultimate ? [220, 329.63, 440, 659.25, 880] : skill ? [440, 554.37, 659.25] : [659.25, 880];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.1 : 0.06);
      playHofmannitaTone(ctx, frequency, at, length(0.24, 0.38, 0.62), 0.026, index % 2 ? 'sine' : 'triangle');
      if (index < (ultimate ? 4 : skill ? 2 : 1)) {
        playHofmannitaTone(ctx, frequency * 1.5, at + 0.025, length(0.2, 0.3, 0.48), 0.012, 'sine');
      }
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.65 : 0.36, 0.015, 1100, 260);
    return;
  }

  if (character === 'selina') {
    const notes = ultimate
      ? [261.63, 349.23, 440, 523.25, 698.46]
      : skill ? [349.23, 440, 523.25] : [523.25, 698.46];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.085 : 0.055);
      playHofmannitaTone(ctx, frequency, at, length(0.11, 0.22, 0.38), 0.03, index % 2 ? 'sine' : 'triangle', frequency * (ultimate ? 1.01 : 1.025));
      if (ultimate || (skill && index === 1)) {
        playHofmannitaTone(ctx, frequency * 2, at + 0.025, length(0.05, 0.09, 0.15), 0.012, 'sine');
      }
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.42 : 0.22, 0.012, 1700, 420);
    return;
  }

  if (character === 'asher') {
    const notes = ultimate ? [73.42, 110, 146.83, 220] : skill ? [110, 146.83, 196] : [146.83, 196];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.11 : 0.065);
      playHofmannitaTone(ctx, frequency, at, length(0.1, 0.2, 0.36), ultimate ? 0.04 : 0.032, 'triangle', frequency * 0.94);
      playHofmannitaTone(ctx, frequency * 1.5, at + 0.018, length(0.045, 0.07, 0.12), 0.01, 'sine');
    });
    playSignatureNoise(ctx, now, ultimate ? 0.48 : skill ? 0.26 : 0.12, ultimate ? 0.02 : 0.013, 480, 90);
    return;
  }

  if (character === 'ineffa') {
    const notes = ultimate ? [196, 293.66, 392, 587.33, 783.99] : skill ? [293.66, 392, 587.33] : [392, 587.33];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.09 : 0.055);
      playHofmannitaTone(ctx, frequency, at, length(0.12, 0.22, 0.4), 0.03, 'sine', frequency * 1.008);
      playHofmannitaTone(ctx, frequency * 2.01, at + 0.02, length(0.055, 0.09, 0.16), 0.012, 'triangle');
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.44 : 0.24, 0.014, 2400, 500);
    return;
  }

  if (character === 'fenris') {
    const notes = ultimate ? [110, 146.83, 220, 293.66] : skill ? [146.83, 196, 246.94] : [196, 246.94];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.12 : 0.07);
      playHofmannitaTone(ctx, frequency, at, length(0.1, 0.18, 0.34), 0.035, 'triangle', frequency * 0.86);
      playHofmannitaTone(ctx, frequency * 2, at + 0.025, length(0.045, 0.07, 0.12), 0.009, 'sine');
    });
    playSignatureNoise(ctx, now, ultimate ? 0.4 : skill ? 0.23 : 0.13, 0.016, 720, 140);
    return;
  }

  if (character === 'zephyr') {
    const notes = ultimate ? [261.63, 392, 587.33, 783.99, 1046.5] : skill ? [392, 587.33, 783.99] : [587.33, 783.99];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.075 : 0.05);
      playHofmannitaTone(ctx, frequency, at, length(0.1, 0.2, 0.38), 0.026, 'sine', frequency * 1.035);
      playHofmannitaTone(ctx, frequency * 1.5, at + 0.018, length(0.06, 0.1, 0.16), 0.01, 'triangle');
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.38 : 0.2, 0.014, 3200, 800);
    return;
  }

  if (character === 'aurum') {
    const notes = ultimate ? [130.81, 196, 261.63, 392, 523.25] : skill ? [196, 261.63, 329.63] : [261.63, 392];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.1 : 0.065);
      playHofmannitaTone(ctx, frequency, at, length(0.16, 0.28, 0.5), 0.032, 'triangle', frequency * 1.01);
      if (index < (ultimate ? 4 : skill ? 2 : 1)) {
        playHofmannitaTone(ctx, frequency * 2, at + 0.035, length(0.08, 0.12, 0.2), 0.013, 'sine');
      }
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.42 : 0.22, 0.012, 900, 240);
    return;
  }

  if (character === 'aelita') {
    const notes = ultimate ? [164.81, 246.94, 329.63, 392, 493.88] : skill ? [246.94, 329.63, 392] : [329.63, 493.88];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.095 : 0.06);
      playHofmannitaTone(ctx, frequency, at, length(0.14, 0.24, 0.44), 0.028, 'sine', frequency * 0.995);
      if (skill || ultimate) {
        playHofmannitaTone(ctx, frequency * 1.5, at + 0.03, length(0.05, 0.08, 0.14), 0.01, 'triangle');
      }
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.4 : 0.22, 0.012, 780, 180);
    return;
  }

  if (character === 'maestro') {
    const notes = ultimate ? [196, 246.94, 293.66, 392, 493.88, 587.33] : skill ? [293.66, 369.99, 440] : [440, 587.33];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.085 : 0.055);
      playHofmannitaTone(ctx, frequency, at, length(0.11, 0.22, 0.42), 0.03, index % 2 ? 'sine' : 'triangle');
      if (ultimate || (skill && index === 1)) {
        playHofmannitaTone(ctx, frequency * 2, at + 0.025, length(0.05, 0.08, 0.14), 0.011, 'sine');
      }
    });
    if (ultimate) playSignatureNoise(ctx, now, 0.36, 0.01, 1600, 600);
    return;
  }

  if (character === 'cyrus') {
    const notes = ultimate ? [98, 146.83, 196, 293.66] : skill ? [146.83, 220, 293.66] : [220, 293.66];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.1 : 0.06);
      playHofmannitaTone(ctx, frequency, at, length(0.09, 0.16, 0.3), 0.034, 'triangle', frequency * 0.9);
      playHofmannitaTone(ctx, frequency * 3, at + 0.012, length(0.035, 0.055, 0.09), 0.012, 'sawtooth', frequency * 2.8);
    });
    playSignatureNoise(ctx, now, ultimate ? 0.34 : skill ? 0.18 : 0.1, 0.014, 2100, 260);
    return;
  }

  if (character === 'raven') {
    const notes = ultimate ? [155.56, 233.08, 311.13, 466.16, 622.25] : skill ? [233.08, 311.13, 466.16] : [311.13, 466.16];
    notes.forEach((frequency, index) => {
      const at = now + index * (ultimate ? 0.08 : 0.05);
      playHofmannitaTone(ctx, frequency, at, length(0.1, 0.19, 0.36), 0.027, 'sine', frequency * 0.97);
      playHofmannitaTone(ctx, frequency * 2.02, at + 0.015, length(0.045, 0.075, 0.13), 0.01, 'triangle');
    });
    if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.38 : 0.2, 0.015, 1900, 320);
    return;
  }

  const pulses = ultimate ? [65.41, 92.5, 130.81, 185] : skill ? [92.5, 130.81, 185] : [130.81, 185];
  pulses.forEach((frequency, index) => {
    const at = now + index * (ultimate ? 0.07 : 0.045);
    playHofmannitaTone(ctx, frequency, at, length(0.08, 0.1, 0.14), ultimate ? 0.034 : 0.028, 'triangle', frequency * 1.08);
    playHofmannitaTone(ctx, frequency * 2, at + 0.015, length(0.06, 0.08, 0.1), 0.012, 'sawtooth', frequency * 2.15);
  });
  if (skill || ultimate) playSignatureNoise(ctx, now, ultimate ? 0.32 : 0.18, 0.014, 1500, 220);
};

export const playSignatureSkillSound = (
  characterId: string,
  skillType: 'Attack' | 'Skill1' | 'Skill2',
  playUltimateImmediately: boolean,
): boolean => {
  switch (characterId) {
    case 'cmh':
    case 'iva':
    case 'nereus':
    case 'kairen':
    case 'aveline':
    case 'volta':
    case 'selina':
    case 'asher':
    case 'ineffa':
    case 'fenris':
    case 'zephyr':
    case 'aurum':
    case 'aelita':
    case 'maestro':
    case 'cyrus':
    case 'raven':
      if (skillType === 'Attack') playSignatureCombatSound(characterId, 'attack');
      else if (skillType === 'Skill1') playSignatureCombatSound(characterId, 'skill');
      else if (playUltimateImmediately) playSignatureCombatSound(characterId, 'ultimate');
      return true;
    default:
      return false;
  }
};

export const playHofmannitaAttackSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playHofmannitaTone(ctx, 196, now, 0.13, 0.055, 'triangle', 110);
  playHofmannitaTone(ctx, 587.33, now + 0.025, 0.18, 0.035, 'sine');
  playHofmannitaTone(ctx, 783.99, now + 0.07, 0.16, 0.022, 'sine');
};

export const playHofmannitaStageSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playHofmannitaTone(ctx, 73.42, now, 0.38, 0.075, 'sine', 55);
  [293.66, 369.99, 440, 587.33].forEach((frequency, index) => {
    playHofmannitaTone(ctx, frequency, now + 0.05 + index * 0.055, 0.38, 0.028, 'triangle');
  });
  playHofmannitaTone(ctx, 1174.66, now + 0.18, 0.24, 0.018, 'sine');
};

export const playHofmannitaUltimateSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playHofmannitaTone(ctx, 65.41, now, 0.58, 0.11, 'sine', 32.7);
  playHofmannitaTone(ctx, 130.81, now + 0.04, 0.42, 0.055, 'triangle', 196);
  [392, 493.88, 587.33, 783.99, 1174.66].forEach((frequency, index) => {
    playHofmannitaTone(ctx, frequency, now + 0.18 + index * 0.07, 0.62, 0.026, 'triangle');
  });
  playHofmannitaTone(ctx, 1567.98, now + 0.48, 0.45, 0.016, 'sine');
};

export const playHofmannitaDropSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playHofmannitaTone(ctx, 110, now, 0.24, 0.09, 'sine', 41.2);
  playHofmannitaTone(ctx, 659.25, now + 0.045, 0.22, 0.04, 'triangle');
  playHofmannitaTone(ctx, 987.77, now + 0.09, 0.2, 0.028, 'sine');
};

export const startHofmannitaStageMusic = (): (() => void) => {
  if (isMuted) return () => {};
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const master = ctx.createGain();
  const now = ctx.currentTime;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.16, now + 0.35);
  master.connect(ctx.destination);

  let stopped = false;
  let phraseTimer: ReturnType<typeof setInterval> | null = null;
  const phraseLength = 2.16;
  const melody = [659.25, 783.99, 987.77, 783.99, 587.33, 659.25, 1174.66, 987.77];
  const bass = [110, 130.81, 98, 146.83];

  const playPhrase = () => {
    if (stopped || ctx.state === 'closed') return;
    const phraseStart = ctx.currentTime + 0.035;
    melody.forEach((frequency, index) => {
      const noteTime = phraseStart + index * 0.27;
      playHofmannitaTone(ctx, frequency, noteTime, 0.19, 0.025, 'triangle', frequency * 0.985, master);
      if (index % 2 === 0) {
        playHofmannitaTone(ctx, bass[index / 2], noteTime, 0.42, 0.045, 'sine', bass[index / 2] * 0.72, master);
        playHofmannitaTone(ctx, 82.41, noteTime, 0.16, 0.035, 'sine', 43.65, master);
      }
    });
  };

  playPhrase();
  phraseTimer = setInterval(playPhrase, phraseLength * 1000);

  return () => {
    if (stopped) return;
    stopped = true;
    if (phraseTimer !== null) clearInterval(phraseTimer);
    const stopTime = ctx.currentTime;
    master.gain.cancelScheduledValues(stopTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), stopTime);
    master.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.18);
    setTimeout(() => {
      master.disconnect();
    }, 250);
  };
};
