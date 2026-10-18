class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private bgmVolume = 0.15;
  private sfxVolume = 0.3;
  private sfxMuted = false;
  private bgmMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.bgmGainNode = this.ctx.createGain();
        this.sfxGainNode = this.ctx.createGain();

        this.bgmGainNode.gain.setValueAtTime(this.bgmMuted ? 0 : this.bgmVolume, this.ctx.currentTime);
        this.sfxGainNode.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);

        this.bgmGainNode.connect(this.ctx.destination);
        this.sfxGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClick() {
    if (this.sfxMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio not supported or blocked
    }
  }

  public playCorrect() {
    if (this.sfxMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + index * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // ignore
    }
  }

  public playWrong() {
    if (this.sfxMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const notes = [311.13, 261.63]; // Eb4, C4
      notes.forEach((freq, index) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + index * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // ignore
    }
  }

  public playVictory() {
    if (this.sfxMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const melody = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.35 }, // C6
        { f: 880.0, d: 0.15 },  // A5
        { f: 1046.5, d: 0.5 }   // C6
      ];

      let t = this.ctx.currentTime;
      melody.forEach((note) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.9;
      });
    } catch {
      // ignore
    }
  }

  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.playBgmLoop();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGainNode) return;

    // Peaceful pleasant kalimba / chime educational background melody
    // Key of F Major: F4, A4, C5, D5, G4, Bb4, C5, E5
    const chords = [
      [349.23, 440.0, 523.25], // F, A, C
      [392.0, 466.16, 587.33], // G, Bb, D
      [329.63, 392.0, 523.25], // E, G, C
      [349.23, 440.0, 698.46]  // F, A, F5
    ];

    let offset = 0;
    const stepDuration = 0.32; // seconds per note
    const now = this.ctx.currentTime;

    chords.forEach((chord) => {
      chord.forEach((freq) => {
        if (!this.ctx || !this.bgmGainNode || !this.isBgmPlaying) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.07, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.6);

        osc.connect(gain);
        gain.connect(this.bgmGainNode);

        osc.start(now + offset);
        osc.stop(now + offset + 0.65);

        offset += stepDuration;
      });
    });

    const loopTimeMs = offset * 1000 + 400;
    this.bgmTimer = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.playBgmLoop();
      }
    }, loopTimeMs);
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public toggleMuteSFX(): boolean {
    this.sfxMuted = !this.sfxMuted;
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    return this.sfxMuted;
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }

  public isSfxOff(): boolean {
    return this.sfxMuted;
  }
}

export const audioManager = new AudioManager();
