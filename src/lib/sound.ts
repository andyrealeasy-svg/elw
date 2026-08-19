// Web Audio API Sound Effects Synthesizer for RPG Combat
// Provides pure synth-generated SFX for skill casting, landing critical strikes, and battle victory.

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
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume context if suspended (browser security autoplay policies)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
};

// Helper to create a noise buffer for sweeps and explosions
let cachedNoiseBuffer: AudioBuffer | null = null;
const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  if (cachedNoiseBuffer) return cachedNoiseBuffer;
  const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
};

// 1. Normal Attack SFX: Sword Swing / Swift impact swoosh
export const playNormalAttackSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Sword slice swish (high pass filtered noise sweep + triangle wave)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  // Swoosh bass impact (triangle pitch sweep)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.10);
  
  oscGain.gain.setValueAtTime(0.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.10);
  
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.15);
  osc.start(now);
  osc.stop(now + 0.15);
};

// 2. Elemental Skill (Skill1) SFX: High-tech/magic dual-pitch rising sweep
export const playElementalSkillSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dual magic chime oscillators
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25);
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(440, now);
  osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(1500, now + 0.25);
  filter.Q.setValueAtTime(2.0, now);

  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  gain2.gain.setValueAtTime(0.1, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain1);
  filter.connect(gain2);
  
  gain1.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.3);
  osc2.stop(now + 0.3);
  
  // Subtler wind-chime spark
  const spark = ctx.createOscillator();
  const sparkGain = ctx.createGain();
  spark.type = 'sine';
  spark.frequency.setValueAtTime(1500, now);
  spark.frequency.setValueAtTime(2200, now + 0.08);
  sparkGain.gain.setValueAtTime(0.05, now);
  sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  spark.connect(sparkGain);
  sparkGain.connect(ctx.destination);
  spark.start(now);
  spark.stop(now + 0.25);
};

// 3. Elemental Burst Ultimate (Skill2) SFX: Mega Charge sweep + explosion boom
export const playUltimateBurstSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sound part 1: Majestic charging riser wave
  const riser = ctx.createOscillator();
  const riserGain = ctx.createGain();
  
  riser.type = 'sawtooth';
  riser.frequency.setValueAtTime(120, now);
  riser.frequency.exponentialRampToValueAtTime(650, now + 0.4);
  
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(200, now);
  lowpass.frequency.exponentialRampToValueAtTime(2000, now + 0.4);

  riserGain.gain.setValueAtTime(0.01, now);
  riserGain.gain.linearRampToValueAtTime(0.18, now + 0.35);
  riserGain.gain.setValueAtTime(0.18, now + 0.35);
  riserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  riser.connect(lowpass);
  lowpass.connect(riserGain);
  riserGain.connect(ctx.destination);

  riser.start(now);
  riser.stop(now + 0.5);

  // Sound part 2: Dynamic shockwave explosion (triggers at now + 0.35s)
  const explosionTime = now + 0.35;
  
  const subBoom = ctx.createOscillator();
  const subGain = ctx.createGain();
  subBoom.type = 'sine';
  subBoom.frequency.setValueAtTime(120, explosionTime);
  subBoom.frequency.exponentialRampToValueAtTime(30, explosionTime + 0.5);
  
  subGain.gain.setValueAtTime(0.35, explosionTime);
  subGain.gain.exponentialRampToValueAtTime(0.005, explosionTime + 0.5);
  
  subBoom.connect(subGain);
  subGain.connect(ctx.destination);
  subBoom.start(explosionTime);
  subBoom.stop(explosionTime + 0.6);

  // Noise rumble of the explosion (fireball/shatter feeling)
  const rumble = ctx.createBufferSource();
  rumble.buffer = getNoiseBuffer(ctx);
  
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'bandpass';
  rumbleFilter.frequency.setValueAtTime(300, explosionTime);
  rumbleFilter.frequency.exponentialRampToValueAtTime(60, explosionTime + 0.4);
  rumbleFilter.Q.setValueAtTime(1.5, explosionTime);
  
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(0.25, explosionTime);
  rumbleGain.gain.exponentialRampToValueAtTime(0.005, explosionTime + 0.45);
  
  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(ctx.destination);
  
  rumble.start(explosionTime);
  rumble.stop(explosionTime + 0.5);
};

// 4. Critical Hit SFX: Sharp high-volume metal/crystal chime clash
export const playCritSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Ultra-bright glass chime wave (the signature crit "DING")
  const chime = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chime.type = 'sine';
  chime.frequency.setValueAtTime(2400, now);
  chime.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
  
  chimeGain.gain.setValueAtTime(0.35, now);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  
  chime.connect(chimeGain);
  chimeGain.connect(ctx.destination);
  chime.start(now);
  chime.stop(now + 0.25);

  // Sharp metallic clashing slash (harmonics)
  const metal = ctx.createOscillator();
  const metalGain = ctx.createGain();
  metal.type = 'sawtooth';
  metal.frequency.setValueAtTime(600, now);
  metal.frequency.linearRampToValueAtTime(1200, now + 0.08);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, now);

  metalGain.gain.setValueAtTime(0.18, now);
  metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  metal.connect(filter);
  filter.connect(metalGain);
  metalGain.connect(ctx.destination);

  metal.start(now);
  metal.stop(now + 0.15);
};

// 5. Victory Battle SFX: Epic rising arpeggio + majestic major chord swell
export const playVictorySound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // C major chords arpeggio notes
  // C5: 523Hz, E5: 659Hz, G5: 784Hz, C6: 1046Hz, E6: 1318Hz, G6: 1568Hz
  const notes = [
    { pitch: 523.25, type: 'triangle' as OscillatorType, start: 0, dur: 0.4, vol: 0.15 },
    { pitch: 659.25, type: 'sine' as OscillatorType, start: 0.12, dur: 0.4, vol: 0.15 },
    { pitch: 783.99, type: 'sine' as OscillatorType, start: 0.24, dur: 0.4, vol: 0.15 },
    { pitch: 1046.50, type: 'sine' as OscillatorType, start: 0.36, dur: 0.6, vol: 0.18 },
    { pitch: 1318.51, type: 'sine' as OscillatorType, start: 0.48, dur: 0.8, vol: 0.20 },
    { pitch: 1567.98, type: 'sine' as OscillatorType, start: 0.60, dur: 1.0, vol: 0.22 }
  ];

  // Warm background chord support (C major synth swell)
  const chordSupport = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  chordSupport.forEach((freq, index) => {
    const chordOsc = ctx.createOscillator();
    const chordGain = ctx.createGain();
    
    chordOsc.type = 'triangle';
    chordOsc.frequency.setValueAtTime(freq, now + 0.2);
    
    chordGain.gain.setValueAtTime(0.001, now + 0.2);
    chordGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
    chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    
    chordOsc.connect(chordGain);
    chordGain.connect(ctx.destination);
    
    chordOsc.start(now + 0.2);
    chordOsc.stop(now + 1.8);
  });

  // Play individual arpeggiated bright chimes
  notes.forEach((note, index) => {
    const playTime = now + note.start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.pitch, playTime);
    
    gain.gain.setValueAtTime(note.vol, playTime);
    // Mimic quick attack + smooth decay
    gain.gain.exponentialRampToValueAtTime(0.001, playTime + note.dur);
    
    // Slight delay imitation/echo effect
    const delay = ctx.createDelay ? ctx.createDelay() : null;
    const feedback = ctx.createGain ? ctx.createGain() : null;
    
    if (delay && feedback) {
      delay.delayTime.value = 0.15;
      feedback.gain.value = 0.25;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Feed to echo path
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(ctx.destination);
      // feedback loop
      feedback.connect(delay);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
    }
    
    osc.start(playTime);
    osc.stop(playTime + note.dur + 0.5);
  });
};
