// Web Audio API Sound Generator & Synthesizer for 화이팅 🌸

export type ChimeType = 'pastel' | 'temple' | 'marimba' | 'crystal';

let audioCtx: AudioContext | null = null;
let isUnlocked = false;

const STORAGE_KEYS = {
  VOLUME: 'hwaiting_alarm_volume_v1',
  CHIME_TYPE: 'hwaiting_alarm_chime_type_v1',
};

// Retrieve user's configured alarm volume (0.1 - 1.0, default 0.85)
export function getAlarmVolume(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0.1 && val <= 1.0) return val;
    }
  } catch (e) {}
  return 0.85;
}

export function setAlarmVolume(vol: number): void {
  const clamped = Math.max(0.1, Math.min(1.0, vol));
  try {
    localStorage.setItem(STORAGE_KEYS.VOLUME, clamped.toString());
  } catch (e) {}
}

export function getChimeType(): ChimeType {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHIME_TYPE) as ChimeType;
    if (saved && ['pastel', 'temple', 'marimba', 'crystal'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'pastel';
}

export function setChimeType(type: ChimeType): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHIME_TYPE, type);
  } catch (e) {}
}

export function isAudioUnlocked(): boolean {
  return isUnlocked && audioCtx !== null && audioCtx.state === 'running';
}

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Proactively unlocks AudioContext on first user interaction so background alarms trigger smoothly
 */
export function unlockAudioContext(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'running') {
        isUnlocked = true;
        resolve(true);
        return;
      }

      ctx.resume().then(() => {
        // Play an inaudible buffer to ensure the audio hardware is engaged
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        isUnlocked = true;
        resolve(true);
      }).catch((e) => {
        console.warn('AudioContext resume failed:', e);
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

// Auto-attach unlock listeners on document interaction
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    unlockAudioContext();
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
  };
  window.addEventListener('click', handleInteraction, { once: true, passive: true });
  window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
  window.addEventListener('keydown', handleInteraction, { once: true, passive: true });
}

/**
 * Synthesizes a high-fidelity bell note with realistic acoustic decay and overtones
 */
function playSynthesizedBell(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainLevel: number,
  type: OscillatorType = 'sine'
) {
  // Fundamental oscillator
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Subtle overtone harmonic oscillator for crystalline realism
  const overtone = ctx.createOscillator();
  const overtoneGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(freq * 2.01, startTime); // Slight chorus detune

  // Attack & Exponential Decay Envelope
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  overtoneGain.gain.setValueAtTime(0.0001, startTime);
  overtoneGain.gain.linearRampToValueAtTime(gainLevel * 0.35, startTime + 0.02);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);

  osc.connect(gain);
  overtone.connect(overtoneGain);

  gain.connect(ctx.destination);
  overtoneGain.connect(ctx.destination);

  osc.start(startTime);
  overtone.start(startTime);

  osc.stop(startTime + duration + 0.05);
  overtone.stop(startTime + duration + 0.05);
}

/**
 * 1. Pastel Glockenspiel / Music Box Melody (달콤한 파스텔 차임)
 */
function playPastelChimePreset(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime;
  // Sequence of pleasant chime tones: C5, E5, G5, C6, G6
  const notes1 = [523.25, 659.25, 783.99, 1046.50];
  notes1.forEach((freq, idx) => {
    playSynthesizedBell(ctx, freq, now + idx * 0.09, 0.9, masterVolume * 0.28, 'sine');
  });

  // Second resolving harmony 0.45s later (E5, G5, C6, E6)
  const notes2 = [659.25, 783.99, 1046.50, 1318.51];
  notes2.forEach((freq, idx) => {
    playSynthesizedBell(ctx, freq, now + 0.45 + idx * 0.08, 1.2, masterVolume * 0.32, 'triangle');
  });
}

/**
 * 2. Temple Brass Bell (한국의 맑은 사찰 종소리 / 윈드차임)
 */
function playTempleBellPreset(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime;
  // Fundamental 440Hz + 880Hz + 1320Hz deep resonant bell
  const partials = [
    { freq: 440, gain: 0.35, decay: 2.2 },
    { freq: 659.25, gain: 0.25, decay: 1.8 },
    { freq: 880, gain: 0.2, decay: 1.5 },
    { freq: 1108.73, gain: 0.12, decay: 1.0 },
  ];

  partials.forEach((p) => {
    playSynthesizedBell(ctx, p.freq, now, p.decay, masterVolume * p.gain, 'sine');
  });

  // Second softer strike
  setTimeout(() => {
    try {
      const now2 = ctx.currentTime;
      partials.forEach((p) => {
        playSynthesizedBell(ctx, p.freq * 1.25, now2, p.decay * 0.9, masterVolume * p.gain * 0.85, 'sine');
      });
    } catch (e) {}
  }, 480);
}

/**
 * 3. Warm Marimba Melody (따뜻한 마림바 알림)
 */
function playMarimbaPreset(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime;
  const notes = [
    { freq: 440.00, time: 0 },
    { freq: 554.37, time: 0.08 },
    { freq: 659.25, time: 0.16 },
    { freq: 880.00, time: 0.24 },
  ];

  notes.forEach((n) => {
    playSynthesizedBell(ctx, n.freq, now + n.time, 0.6, masterVolume * 0.38, 'triangle');
  });

  setTimeout(() => {
    try {
      const now2 = ctx.currentTime;
      const notesResolving = [
        { freq: 554.37, time: 0 },
        { freq: 659.25, time: 0.08 },
        { freq: 880.00, time: 0.16 },
        { freq: 1108.73, time: 0.24 },
      ];
      notesResolving.forEach((n) => {
        playSynthesizedBell(ctx, n.freq, now2 + n.time, 0.8, masterVolume * 0.4, 'triangle');
      });
    } catch (e) {}
  }, 400);
}

/**
 * 4. Crystal Shimmer Bell (크리스탈 벨)
 */
function playCrystalPreset(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime;
  const notes = [1046.50, 1318.51, 1567.98, 2093.00];
  notes.forEach((freq, idx) => {
    playSynthesizedBell(ctx, freq, now + idx * 0.07, 1.1, masterVolume * 0.25, 'sine');
  });
  setTimeout(() => {
    try {
      const now2 = ctx.currentTime;
      notes.forEach((freq, idx) => {
        playSynthesizedBell(ctx, freq * 1.12, now2 + idx * 0.07, 1.3, masterVolume * 0.28, 'sine');
      });
    } catch (e) {}
  }, 360);
}

/**
 * Master Task Alarm Trigger:
 * Synthesizes an unmistakably audible, pleasing alert chime using the Web Audio API
 */
export function playTaskAlarm(forcedType?: ChimeType) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const type = forcedType || getChimeType();
    const volume = getAlarmVolume();

    switch (type) {
      case 'temple':
        playTempleBellPreset(ctx, volume);
        break;
      case 'marimba':
        playMarimbaPreset(ctx, volume);
        break;
      case 'crystal':
        playCrystalPreset(ctx, volume);
        break;
      case 'pastel':
      default:
        playPastelChimePreset(ctx, volume);
        break;
    }
  } catch (err) {
    console.warn('Web Audio API playback error:', err);
  }
}

/**
 * Plays a soft chime for minor actions (e.g. check subtask)
 */
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = getAlarmVolume();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      playSynthesizedBell(ctx, freq, now + idx * 0.07, 0.7, vol * 0.2, 'sine');
    });
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

/**
 * Plays a joyful celebration fanfare for completing a habit or goal
 */
export function playCelebration() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = getAlarmVolume();

    const melody = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.1 },
      { freq: 659.25, time: 0.2 },
      { freq: 880, time: 0.3 },
      { freq: 1108.73, time: 0.45 },
    ];

    melody.forEach(({ freq, time }) => {
      playSynthesizedBell(ctx, freq, now + time, 0.8, vol * 0.25, 'triangle');
    });
  } catch (err) {
    console.warn('Celebration audio error:', err);
  }
}

/**
 * Web Audio Ambient Background Sound Generator (Rain, Pink Noise, Cafe)
 */
let activeAmbientSource: AudioNode | null = null;
let activeAmbientGain: GainNode | null = null;

export const ambientSound = {
  start: (type: 'none' | 'rain' | 'cafe' | 'pink_noise') => {
    ambientSound.stop();
    if (type === 'none') return;

    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'pink_noise') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
          b6 = white * 0.115926;
        }
      } else if (type === 'rain') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }
      } else {
        // Cafe warm murmur
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.12;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.8);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      activeAmbientSource = whiteNoise;
      activeAmbientGain = gain;
    } catch (e) {
      console.warn('Ambient sound error:', e);
    }
  },
  stop: () => {
    try {
      if (activeAmbientGain && audioCtx) {
        activeAmbientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      }
      if (activeAmbientSource) {
        setTimeout(() => {
          try {
            (activeAmbientSource as any)?.stop?.();
            (activeAmbientSource as any)?.disconnect?.();
          } catch (e) {}
        }, 250);
        activeAmbientSource = null;
        activeAmbientGain = null;
      }
    } catch (e) {
      console.warn('Ambient stop error:', e);
    }
  },
};
