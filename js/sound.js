// === Sound Effects Module (Web Audio API — no external files) ===

const SE = {
  _ctx: null,
  _initialized: false,
  _muted: false,
  _lastHeartbeat: 0,

  /**
   * Initialize AudioContext (must be triggered by user gesture on mobile)
   */
  init() {
    if (this._initialized) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  },

  /**
   * Resume AudioContext (required after user gesture on iOS/mobile)
   */
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  },

  // --- Helper: play a tone ---
  _tone(freq, duration, type = 'square', volume = 0.15, delay = 0) {
    if (!this._ctx || this._muted) return;
    const t = this._ctx.currentTime + delay;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  },

  // --- Helper: play noise burst ---
  _noise(duration, volume = 0.08, delay = 0) {
    if (!this._ctx || this._muted) return;
    const t = this._ctx.currentTime + delay;
    const bufferSize = this._ctx.sampleRate * duration;
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(gain);
    gain.connect(this._ctx.destination);
    source.start(t);
  },

  // =====================
  // Sound Effects
  // =====================

  /** Player moves one tile */
  move() {
    this._tone(440, 0.06, 'square', 0.08);
  },

  /** Player taps a wall / can't move */
  bump() {
    this._tone(150, 0.1, 'square', 0.1);
  },

  /** Donut placed on the ground */
  donutPlace() {
    this._tone(523, 0.08, 'sine', 0.15);
    this._tone(659, 0.08, 'sine', 0.12, 0.06);
    this._tone(784, 0.12, 'sine', 0.10, 0.12);
  },

  /** Game start (title → playing) */
  gameStart() {
    this._tone(392, 0.1, 'square', 0.12);
    this._tone(523, 0.1, 'square', 0.12, 0.1);
    this._tone(659, 0.1, 'square', 0.14, 0.2);
    this._tone(784, 0.2, 'square', 0.16, 0.3);
  },

  /** Level clear — victory fanfare */
  clear() {
    // C E G C (octave up) — classic fanfare
    this._tone(523, 0.15, 'square', 0.14);
    this._tone(659, 0.15, 'square', 0.14, 0.12);
    this._tone(784, 0.15, 'square', 0.14, 0.24);
    this._tone(1047, 0.4, 'square', 0.18, 0.36);
    // Harmony
    this._tone(392, 0.15, 'triangle', 0.08, 0.24);
    this._tone(523, 0.4, 'triangle', 0.10, 0.36);
  },

  /** Game over — caught by monster */
  gameOver() {
    this._tone(440, 0.15, 'sawtooth', 0.12);
    this._tone(370, 0.15, 'sawtooth', 0.12, 0.15);
    this._tone(311, 0.15, 'sawtooth', 0.12, 0.3);
    this._tone(220, 0.4, 'sawtooth', 0.14, 0.45);
  },

  /** Monster starts chasing the donut */
  monsterAttract() {
    this._tone(200, 0.08, 'square', 0.06);
    this._tone(280, 0.08, 'square', 0.06, 0.06);
  },

  /** Rank in! */
  rankIn() {
    // Ascending sparkle
    this._tone(784, 0.1, 'sine', 0.12);
    this._tone(988, 0.1, 'sine', 0.12, 0.08);
    this._tone(1175, 0.1, 'sine', 0.14, 0.16);
    this._tone(1319, 0.1, 'sine', 0.14, 0.24);
    this._tone(1568, 0.3, 'sine', 0.16, 0.32);
  },

  /** UI click / button press */
  click() {
    this._tone(600, 0.04, 'square', 0.06);
  },

  /** Reinforcement monster spawn warning */
  reinforcement() {
    this._tone(220, 0.15, 'sawtooth', 0.10);
    this._tone(330, 0.10, 'sawtooth', 0.08, 0.12);
    this._tone(220, 0.20, 'sawtooth', 0.12, 0.22);
  },

  /**
   * Heartbeat SE — "ドクドク" sound based on monster proximity
   * @param {number} rate - 0 (far/no beat) to 1 (adjacent/maximum panic)
   * Call this from game _update loop every frame
   */
  heartbeat(rate) {
    if (!this._ctx || this._muted || rate <= 0) return;

    const now = performance.now();
    // Interval: 800ms (calm) → 250ms (panic)
    const interval = 800 - rate * 550;

    if (now - this._lastHeartbeat < interval) return;
    this._lastHeartbeat = now;

    const volume = 0.06 + rate * 0.10; // Louder when closer

    // First beat: "ドク" (low thump)
    this._tone(60, 0.08, 'sine', volume);
    this._tone(80, 0.06, 'sine', volume * 0.7, 0.02);

    // Second beat: "ドク" (slightly higher, softer) — delayed
    this._tone(65, 0.06, 'sine', volume * 0.6, 0.12);
    this._tone(85, 0.05, 'sine', volume * 0.4, 0.14);
  },
};
