// import { NOTES } from "./music";


export const NOTES = {
    "A": 220,
    "A#": 233,
    "B": 247,
    "C": 261,
    "C#": 277,
    "D": 294,
    "D#": 311,
    "E": 330,
    "F": 349,
    "F#": 370,
    "G": 392,
    "G#": 415
  }

const audioCtx = new (window['AudioContext'] || window['webkitAudioContext'])();

class Sound {
  private oscSfxSaw;
  private oscSfxSquare;
  private gainSfx;
  private noiseGain;

  constructor() {

    const len = 2 * audioCtx.sampleRate;
    const noise = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const output = noise.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < len; i++) {
      output[i] = prev * 0.5 + (Math.random() * 2 - 1) * 0.5;
      prev = output[i];
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noise;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    this.noiseGain = audioCtx.createGain();
    this.noiseGain.connect(audioCtx.destination);
    this.noiseGain.gain.setValueAtTime(0, audioCtx.currentTime);
    whiteNoise.connect(this.noiseGain);


    this.oscSfxSaw = audioCtx.createOscillator();
    this.oscSfxSaw.type = "sawtooth";
    this.oscSfxSaw.start();

    this.oscSfxSquare = audioCtx.createOscillator();
    this.oscSfxSquare.type = "square";
    this.oscSfxSquare.start();

    this.gainSfx = audioCtx.createGain();
    this.gainSfx.gain.setValueAtTime(0, audioCtx.currentTime);

    this.oscSfxSaw.connect(this.gainSfx);
    this.oscSfxSquare.connect(this.gainSfx);
    this.gainSfx.connect(audioCtx.destination);
  }
  public playSound(effect: Sfx): void {
    effect.sound(audioCtx.currentTime,
      this.oscSfxSaw,
      this.oscSfxSquare,
      this.gainSfx,
      this.noiseGain);
  }
}

// 2 concurrent SFX
const SOUNDS = [new Sound(), new Sound()];

class SoundPlayer {
  id: number = 0;
  public playSound(effect: Sfx): void {
    this.id = (this.id + 1) % SOUNDS.length;
    SOUNDS[this.id].playSound(effect);
  }

  public resume() {
    audioCtx.resume();
  }

}

export const SOUND = new SoundPlayer();

export interface Sfx {
  sound(currentTime: number,
    saw: OscillatorNode,
    square: OscillatorNode,
    gain: GainNode,
    noise: GainNode): void;
}

export const SFX_JUMP = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    saw.frequency.setValueAtTime(220, currentTime);
    saw.frequency.linearRampToValueAtTime(440, currentTime + 0.1);
    square.frequency.setValueAtTime(0, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime);
    gain.gain.linearRampToValueAtTime(0.5, currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.1);
  }
}

export const HIT_SMALL = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    saw.frequency.setValueAtTime(110, currentTime);
    square.frequency.setValueAtTime(110 + Math.random() * 55, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.04);
  }
}

export const MENU_MOVE = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    const r = Math.random();
    const offset = r*r * 100;
    square.frequency.setValueAtTime(260 + offset, currentTime);
    square.frequency.linearRampToValueAtTime(400 + offset, currentTime + 0.03);
    square.frequency.linearRampToValueAtTime(440 + offset, currentTime + 0.05);
    saw.frequency.setValueAtTime(0, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime);
    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.05);
  }
}

export const MENU_SELECT = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    square.frequency.setValueAtTime(800, currentTime);
    square.frequency.linearRampToValueAtTime(880, currentTime + 0.06);
    saw.frequency.setValueAtTime(0, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime);
    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.03);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.06);
  }
}

export const COLLECT = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    saw.frequency.setValueAtTime(260, currentTime);
    square.frequency.setValueAtTime(460, currentTime);
    saw.frequency.linearRampToValueAtTime(500, currentTime + 0.02);
    square.frequency.linearRampToValueAtTime(550, currentTime + 0.02);
    saw.frequency.linearRampToValueAtTime(600, currentTime + 0.05);
    square.frequency.linearRampToValueAtTime(380, currentTime + 0.05);
    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.linearRampToValueAtTime(0.2, currentTime + 0.005);
    gain.gain.setValueAtTime(0.2, currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, currentTime + 0.051);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.07);
  }
}

export const EXPLOSION = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    saw.frequency.setValueAtTime(100 + 40 * Math.random(), currentTime);
    square.frequency.setValueAtTime(0, currentTime);
    saw.frequency.linearRampToValueAtTime(30 + 20 * Math.random(), currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, currentTime);
    gain.gain.linearRampToValueAtTime(0.0, currentTime + 0.15 + 0.05 * Math.random());
    // noise
    noise.gain.setValueAtTime(0, currentTime);
    noise.gain.linearRampToValueAtTime(0.5, currentTime + 0.001);
    noise.gain.linearRampToValueAtTime(0.1, currentTime + 0.02);
    noise.gain.linearRampToValueAtTime(0.06, currentTime + 0.2);
    noise.gain.linearRampToValueAtTime(0, currentTime + 0.5 + 0.5 * Math.random());
  }
}


export const HURT = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // noise
    noise.gain.setValueAtTime(0.3, currentTime);
    saw.frequency.setValueAtTime(600, currentTime);
    gain.gain.setValueAtTime(0.2, currentTime);

    noise.gain.linearRampToValueAtTime(0, currentTime + 0.12);
    saw.frequency.linearRampToValueAtTime(200, currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.0, currentTime + 0.1);
  }
}

export const BLOOP = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // schedule values
    noise.gain.setValueAtTime(0, currentTime);
    noise.gain.setValueAtTime(0.2, currentTime + 0.05);
    noise.gain.setValueAtTime(0, currentTime + 0.1);

    saw.frequency.setValueAtTime(220, currentTime);
    saw.frequency.linearRampToValueAtTime(440, currentTime + 0.05);
    saw.frequency.linearRampToValueAtTime(660, currentTime + 0.11);
    square.frequency.setValueAtTime(0, currentTime);
    gain.gain.setValueAtTime(0.1, currentTime);
    gain.gain.linearRampToValueAtTime(0, currentTime + 0.1);
  }
}

export const WIN = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // clear saw
    saw.frequency.setValueAtTime(0, currentTime);
    // schedule values
    let t = currentTime;
    square.frequency.setValueAtTime(NOTES.C * 2, t);// c6
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0, t - 0.01);
    square.frequency.setValueAtTime(NOTES.G, t);// g5
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0, t - 0.01);
    square.frequency.setValueAtTime(NOTES.D, t);// d5
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0, t - 0.01);
    square.frequency.setValueAtTime(NOTES.C * 2, t);// c6
    gain.gain.setValueAtTime(0.2, t);
    t += 0.4;
    gain.gain.linearRampToValueAtTime(0, t - 0.01);
  }
}


export const SFX_DIE = new class implements Sfx {
  public sound(currentTime: number, saw: OscillatorNode, square: OscillatorNode, gain: GainNode, noise: GainNode): void {
    saw.frequency.cancelScheduledValues(currentTime);
    gain.gain.cancelScheduledValues(currentTime);
    noise.gain.cancelScheduledValues(currentTime);
    noise.gain.setValueAtTime(0, currentTime);
    square.frequency.cancelScheduledValues(currentTime);
    // clear saw
    saw.frequency.setValueAtTime(0, currentTime);
    // schedule values
    let t = currentTime;
    square.frequency.setValueAtTime(NOTES.C * 2, t);// c6
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0.05, t - 0.01);
    square.frequency.linearRampToValueAtTime(NOTES.G, t);// g5
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0.05, t - 0.01);
    square.frequency.linearRampToValueAtTime(NOTES.D, t);// d5
    gain.gain.setValueAtTime(0.2, t);
    t += 0.1;
    gain.gain.linearRampToValueAtTime(0.05, t - 0.01);
    square.frequency.linearRampToValueAtTime(NOTES.C, t);// c5
    gain.gain.setValueAtTime(0.2, t);
    t += 0.4;
    gain.gain.linearRampToValueAtTime(0, t - 0.01);
  }
}
