class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      // Initialize on first user interaction usually, but we set up the object here
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private initCtx() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.enabled) return;
    this.initCtx();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playHover() {
    this.playTone(400, 'sine', 0.05, 0.05);
  }

  public playSelect() {
    this.playTone(800, 'square', 0.1, 0.1);
    setTimeout(() => this.playTone(1200, 'square', 0.1, 0.1), 50);
  }

  public playStart() {
    this.playTone(200, 'sawtooth', 0.1, 0.2);
    setTimeout(() => this.playTone(400, 'sawtooth', 0.1, 0.2), 100);
    setTimeout(() => this.playTone(600, 'sawtooth', 0.4, 0.2), 200);
  }

  public playWin() {
    this.playTone(523.25, 'triangle', 0.1, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.2, 0.2), 200); // G5
    setTimeout(() => this.playTone(1046.50, 'square', 0.4, 0.1), 300); // C6
  }

  public playLose() {
    this.playTone(400, 'sawtooth', 0.2, 0.1);
    setTimeout(() => this.playTone(300, 'sawtooth', 0.2, 0.1), 150);
    setTimeout(() => this.playTone(100, 'sawtooth', 0.4, 0.2), 300);
  }
}

export const soundManager = new SoundManager();