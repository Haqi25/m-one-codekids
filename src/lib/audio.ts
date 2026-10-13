// Audio synthesis using Web Audio API for cross-browser, zero-dependency sound effects.
// Respects soundOn preference (FR-MISI-10).

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ck_sound");
      if (saved !== null) {
        this.enabled = saved === "true";
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== "undefined") {
      localStorage.setItem("ck_sound", String(val));
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    return next;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.15) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Cheerful victory fanfare when mission succeeds */
  public playVictoryFanfare() {
    if (!this.enabled) return;
    // C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046.5Hz)
    this.playTone(523.25, "triangle", 0.16, 0, 0.2);
    this.playTone(659.25, "triangle", 0.16, 0.13, 0.2);
    this.playTone(783.99, "triangle", 0.18, 0.26, 0.22);
    this.playTone(1046.5, "triangle", 0.55, 0.40, 0.25);
  }

  /** Sparkle ding for each revealed star */
  public playStar(starIndex: number) {
    if (!this.enabled) return;
    const freqs = [783.99, 987.77, 1318.5]; // G5, B5, E6
    const freq = freqs[starIndex] || 1046.5;
    this.playTone(freq, "sine", 0.35, 0, 0.18);
  }

  /** Special fanfare when a new badge is unlocked */
  public playBadgeUnlocked() {
    if (!this.enabled) return;
    this.playTone(659.25, "triangle", 0.12, 0, 0.2);
    this.playTone(783.99, "triangle", 0.12, 0.1, 0.2);
    this.playTone(987.77, "triangle", 0.15, 0.2, 0.22);
    this.playTone(1318.5, "triangle", 0.5, 0.35, 0.25);
  }

  /** Subtle playful click */
  public playClick() {
    if (!this.enabled) return;
    this.playTone(880, "sine", 0.05, 0, 0.06);
  }
}

export const soundEngine = new SoundEngine();

