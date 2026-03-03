/**
 * In-place radix-2 Cooley-Tukey FFT.
 * @param {Float64Array} re - Real parts (modified in place)
 * @param {Float64Array} im - Imaginary parts (modified in place)
 */
export function fftInPlace(re, im) {
  const n = re.length

  // Bit-reversal permutation
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }

  // Butterfly passes
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cRe = 1,
        cIm = 0
      for (let k = 0; k < len >> 1; k++) {
        const uRe = re[i + k]
        const uIm = im[i + k]
        const vRe = re[i + k + (len >> 1)] * cRe - im[i + k + (len >> 1)] * cIm
        const vIm = re[i + k + (len >> 1)] * cIm + im[i + k + (len >> 1)] * cRe
        re[i + k] = uRe + vRe
        im[i + k] = uIm + vIm
        re[i + k + (len >> 1)] = uRe - vRe
        im[i + k + (len >> 1)] = uIm - vIm
        const nextCRe = cRe * wRe - cIm * wIm
        cIm = cRe * wIm + cIm * wRe
        cRe = nextCRe
      }
    }
  }
}

/**
 * Compute one-sided magnitude spectrum.
 * @param {number[]} signal
 * @param {number} N - FFT size (power of 2)
 * @returns {Float64Array} Magnitude array of length N/2
 */
export function magnitudeSpectrum(signal, N = 1024) {
  const re = new Float64Array(N)
  const im = new Float64Array(N)
  const len = Math.min(signal.length, N)
  for (let i = 0; i < len; i++) re[i] = signal[i]
  fftInPlace(re, im)
  return Float64Array.from({ length: N >> 1 }, (_, i) =>
    Math.sqrt(re[i] * re[i] + im[i] * im[i]) / N,
  )
}

/**
 * Evaluate H(e^jω) magnitude response for a pole-zero model.
 * @param {{re:number,im:number}[]} poles
 * @param {{re:number,im:number}[]} zeros
 * @param {number} numPts - Number of frequency points (0 to π)
 * @returns {number[]}
 */
export function freqResponse(poles, zeros, numPts = 512) {
  return Array.from({ length: numPts }, (_, k) => {
    const w = (Math.PI * k) / numPts
    const ejw = { re: Math.cos(w), im: Math.sin(w) }

    let nRe = 1, nIm = 0
    zeros.forEach((z) => {
      const r = ejw.re - z.re
      const s = ejw.im - z.im
      ;[nRe, nIm] = [nRe * r - nIm * s, nRe * s + nIm * r]
    })

    let dRe = 1, dIm = 0
    poles.forEach((p) => {
      const r = ejw.re - p.re
      const s = ejw.im - p.im
      ;[dRe, dIm] = [dRe * r - dIm * s, dRe * s + dIm * r]
    })

    const dm = Math.sqrt(dRe * dRe + dIm * dIm)
    return dm < 1e-10 ? 0 : Math.sqrt(nRe * nRe + nIm * nIm) / dm
  })
}
