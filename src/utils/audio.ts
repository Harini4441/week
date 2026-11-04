// Web Audio API Sound Generator & Synthesizer for 화이팅 🌸

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
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
 * Plays a delicate, soothing Korean pastel chime (harp / temple bell)
 */
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
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

    const melody = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.1 },
      { freq: 659.25, time: 0.2 },
      { freq: 880, time: 0.3 },
      { freq: 1108.73, time: 0.45 },
    ];

    melody.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.15, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.9);
    });
  } catch (err) {
    console.warn('Celebration audio error:', err);
  }
}

/**
 * Ambient Sound Generator for Focus Sessions
 */
class AmbientSoundManager {
  private activeSource: AudioNode | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;

  public start(type: 'rain' | 'cafe' | 'pink_noise' | 'windchime') {
    this.stop();
    const ctx = getAudioContext();
    this.currentType = type;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    if (type === 'rain' || type === 'pink_noise') {
      // Generate noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'rain' ? 800 : 450;

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.activeSource = whiteNoise;
    } else if (type === 'cafe') {
      // Warm vinyl brown noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      source.connect(filter);
      filter.connect(this.gainNode);
      source.start();
      this.activeSource = source;
    }
  }

  public stop() {
    if (this.activeSource) {
      try {
        (this.activeSource as any).stop?.();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
    this.currentType = null;
  }

  public isPlaying(): boolean {
    return this.activeSource !== null;
  }

  public getType(): string | null {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundManager();
