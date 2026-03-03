/**
 * Minimal WebAudio playback engine.
 * Lazily creates AudioContext on first use (satisfies browser autoplay policy).
 */

let ctx = null

function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/**
 * Play an array of samples.
 * @param {number[]} signal  PCM samples (any range — auto-normalised)
 * @param {number} sampleRate
 */
export function playSignal(signal, sampleRate = 8000) {
  const audioCtx = getContext()
  const buffer = audioCtx.createBuffer(1, signal.length, sampleRate)
  const data = buffer.getChannelData(0)
  const mx = Math.max(1e-10, ...signal.map(Math.abs))
  for (let i = 0; i < signal.length; i++) data[i] = (signal[i] / mx) * 0.7
  const src = audioCtx.createBufferSource()
  src.buffer = buffer
  src.connect(audioCtx.destination)
  src.start()
}
