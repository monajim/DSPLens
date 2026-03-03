import { useCallback } from 'react'
import { useCanvasDraw } from './useCanvasDraw.js'
import { drawGrid, drawLabel } from './plotUtils.js'
import { magnitudeSpectrum } from '../../core/fft.js'

export default function SpectrumPlot({
  signal,
  fs = 8000,
  label = '',
  color = '#a78bfa',
  logScale = false,
  N = 1024,
  overlay = null,     // optional second signal (muted amber)
}) {
  const draw = useCallback(
    (ctx, W, H) => {
      ctx.fillStyle = '#060c14'
      ctx.fillRect(0, 0, W, H)
      drawGrid(ctx, W, H)

      if (!signal || signal.length === 0) return

      const mag = magnitudeSpectrum(signal, N)
      const mx = Math.max(1e-10, ...mag)

      const ty = (v) => {
        const norm = logScale ? (20 * Math.log10(v / mx + 1e-10) + 80) / 80 : v / mx
        return H - Math.max(0, Math.min(1, norm)) * (H - 4)
      }

      // Overlay
      if (overlay && overlay.length) {
        const om = magnitudeSpectrum(overlay, N)
        const omx = Math.max(1e-10, ...om)
        const tyO = (v) => {
          const norm = logScale ? (20 * Math.log10(v / omx + 1e-10) + 80) / 80 : v / omx
          return H - Math.max(0, Math.min(1, norm)) * (H - 4)
        }
        ctx.strokeStyle = 'rgba(251,191,36,0.3)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        om.forEach((v, i) => {
          const x = (i / om.length) * W
          i === 0 ? ctx.moveTo(x, tyO(v)) : ctx.lineTo(x, tyO(v))
        })
        ctx.stroke()
      }

      // Filled area
      ctx.beginPath()
      mag.forEach((v, i) => {
        const x = (i / mag.length) * W
        i === 0 ? ctx.moveTo(x, ty(v)) : ctx.lineTo(x, ty(v))
      })
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.fillStyle = color + '18'
      ctx.fill()

      // Line
      ctx.beginPath()
      mag.forEach((v, i) => {
        const x = (i / mag.length) * W
        i === 0 ? ctx.moveTo(x, ty(v)) : ctx.lineTo(x, ty(v))
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.stroke()

      drawLabel(ctx, label)

      // Freq axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '9px "JetBrains Mono", monospace'
      ctx.fillText('0', 4, H - 3)
      ctx.fillText(`${(fs / 2000).toFixed(0)}kHz`, W - 32, H - 3)
    },
    [signal, fs, label, color, logScale, N, overlay],
  )

  const ref = useCanvasDraw(draw, [signal, fs, label, color, logScale, N, overlay])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
}
