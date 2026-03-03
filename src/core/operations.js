import { fftInPlace, freqResponse } from './fft.js'

// ─── Window functions ─────────────────────────────────────────────────────────
export const Windows = {
  rectangular: (_i, _N) => 1,
  hann: (i, N) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1))),
  hamming: (i, N) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)),
  blackman: (i, N) =>
    0.42 -
    0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) +
    0.08 * Math.cos((4 * Math.PI * i) / (N - 1)),
}

/** Apply a named window to a signal. */
export function applyWindow(signal, type = 'hann') {
  const fn = Windows[type] ?? Windows.rectangular
  const N = signal.length
  return signal.map((v, i) => v * fn(i, N))
}

// ─── Noise ────────────────────────────────────────────────────────────────────
/** Add AWGN at a target SNR (dB). */
export function addNoise(signal, snrDb) {
  const pSig = signal.reduce((a, b) => a + b * b, 0) / signal.length || 1e-10
  const pNoise = pSig / Math.pow(10, snrDb / 10)
  const amp = Math.sqrt(pNoise)
  return signal.map((s) => s + amp * (Math.random() * 2 - 1))
}

// ─── Quantization ─────────────────────────────────────────────────────────────
/** Uniform mid-tread quantizer. */
export function quantize(signal, bits) {
  const L = Math.pow(2, bits)
  return signal.map((s) => Math.round((s * L) / 2) / (L / 2))
}

/** Compute signal-to-quantization-noise ratio (dB). */
export function sqnr(original, quantized) {
  const pSig = original.reduce((a, b) => a + b * b, 0) / original.length || 1e-10
  const pErr =
    original.reduce((a, b, i) => a + Math.pow(b - quantized[i], 2), 0) / original.length || 1e-20
  return 10 * Math.log10(pSig / pErr)
}

// ─── FIR filtering ───────────────────────────────────────────────────────────
/**
 * Windowed-sinc lowpass FIR filter.
 * @param {number[]} signal
 * @param {number} fc  Normalized cutoff [0..1] where 1 = Nyquist
 * @param {number} taps  Number of taps (odd recommended)
 */
export function firLowpass(signal, fc, taps = 51) {
  const h = Array.from({ length: taps }, (_, i) => {
    const n = i - (taps - 1) / 2
    const sinc = n === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * n) / (Math.PI * n)
    const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (taps - 1)) // Hamming
    return sinc * w
  })
  return signal.map((_, i) =>
    h.reduce((sum, hk, k) => sum + (i - k >= 0 ? hk * signal[i - k] : 0), 0),
  )
}

/** Highpass via spectral inversion. */
export function firHighpass(signal, fc, taps = 51) {
  const lp = firLowpass(signal, fc, taps)
  return signal.map((v, i) => v - lp[i])
}

// ─── IIR (pole-zero in frequency domain) ──────────────────────────────────────
/**
 * Apply a pole-zero filter via FFT convolution.
 * Approximate but visually accurate for teaching.
 */
export function applyPoleZeroFilter(signal, poles, zeros) {
  const N = signal.length
  const re = new Float64Array(N)
  const im = new Float64Array(N)
  for (let i = 0; i < N; i++) re[i] = signal[i]

  fftInPlace(re, im)

  const H = freqResponse(poles, zeros, N)
  for (let i = 0; i < N >> 1; i++) {
    re[i] *= H[i]
    im[i] *= H[i]
  }
  for (let i = N >> 1; i < N; i++) {
    const j = N - i
    const hv = H[j < H.length ? j : 0]
    re[i] *= hv
    im[i] *= hv
  }

  // Inverse FFT (conjugate, forward, conjugate)
  for (let i = 0; i < N; i++) im[i] = -im[i]
  fftInPlace(re, im)
  return Array.from(re, (v) => v / N)
}

// ─── Sampling / ZOH ──────────────────────────────────────────────────────────
/**
 * Downsample then zero-order hold reconstruct to original length.
 * Simulates what happens when you sample at fs < fs_original.
 */
export function simulateSampling(signal, decimation) {
  const dec = Math.max(1, Math.round(decimation))
  const sampled = signal.filter((_, i) => i % dec === 0)
  const out = []
  sampled.forEach((v) => {
    for (let k = 0; k < dec; k++) out.push(v)
  })
  return out.slice(0, signal.length)
}

// ─── Utility ──────────────────────────────────────────────────────────────────
/** Downsample an array for display (keep visual shape). */
export function downsample(arr, maxPts = 800) {
  if (arr.length <= maxPts) return arr
  const step = arr.length / maxPts
  return Array.from({ length: maxPts }, (_, i) => arr[Math.floor(i * step)])
}

/** Normalize a signal to [-1, 1]. */
export function normalize(signal) {
  const mx = Math.max(1e-10, ...signal.map(Math.abs))
  return signal.map((v) => v / mx)
}
