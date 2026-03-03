/**
 * Signal generators.
 * All functions return plain number arrays.
 */

export const Sig = {
  /** Pure sine wave */
  sine: (freq, fs, N, amp = 1, phase = 0) =>
    Array.from({ length: N }, (_, i) => amp * Math.sin(2 * Math.PI * freq * (i / fs) + phase)),

  /** Square wave (via sign of sine) */
  square: (freq, fs, N, amp = 1) =>
    Array.from({ length: N }, (_, i) => amp * Math.sign(Math.sin(2 * Math.PI * freq * (i / fs)))),

  /** Sawtooth wave */
  sawtooth: (freq, fs, N, amp = 1) =>
    Array.from({ length: N }, (_, i) => amp * (2 * (((i * freq) / fs) % 1) - 1)),

  /** Linear chirp from f0 to f1 */
  chirp: (f0, f1, fs, N) =>
    Array.from({ length: N }, (_, i) => {
      const t = i / fs
      const T = N / fs
      return Math.sin(2 * Math.PI * (f0 + ((f1 - f0) * t) / T) * t)
    }),

  /** White noise */
  noise: (N, amp = 1) =>
    Array.from({ length: N }, () => amp * (Math.random() * 2 - 1)),

  /** Sum of sines (chord) */
  chord: (freqs, amps, fs, N) => {
    const out = new Array(N).fill(0)
    freqs.forEach((f, k) => {
      const a = amps[k] ?? 1
      for (let i = 0; i < N; i++) out[i] += a * Math.sin(2 * Math.PI * f * (i / fs))
    })
    return out
  },

  /** Unit impulse at sample 0 */
  impulse: (N) => {
    const s = new Array(N).fill(0)
    s[0] = 1
    return s
  },
}
