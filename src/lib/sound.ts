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

// 1. Normal Attack SFX: Soft, muffled organic swoosh + warm thud (zero harsh hiss)
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
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 0.12);
  
  const noiseGain = createSoftGain(ctx, 0.08, now, 0.015);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  // Soft wooden / blunt impact thud
  const osc = ctx.createOscillator();
  const oscGain = createSoftGain(ctx, 0.09, now, 0.01);
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);
  
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.15);
  osc.start(now);
  osc.stop(now + 0.15);
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

// 4. Critical Hit SFX: Sweet crystal celesta / vibraphone chime (zero piercing 2400Hz screech)
export const playCritSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sweet, warm vibraphone chimes: A5 (880Hz) & C6 (1046.5Hz) pure sines
  const chime1 = ctx.createOscillator();
  const chime2 = ctx.createOscillator();
  const chimeGain1 = createSoftGain(ctx, 0.08, now, 0.008);
  const chimeGain2 = createSoftGain(ctx, 0.05, now, 0.008);
  
  chime1.type = 'sine';
  chime1.frequency.setValueAtTime(880, now);
  chime1.frequency.exponentialRampToValueAtTime(860, now + 0.22);
  
  chime2.type = 'sine';
  chime2.frequency.setValueAtTime(1046.5, now);
  chime2.frequency.exponentialRampToValueAtTime(1020, now + 0.22);

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
  const knockGain = createSoftGain(ctx, 0.05, now, 0.005);
  knock.type = 'triangle';
  knock.frequency.setValueAtTime(180, now);
  knock.frequency.exponentialRampToValueAtTime(60, now + 0.08);

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
