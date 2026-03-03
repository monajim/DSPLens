import { useCallback } from 'react'
import { useCanvasDraw } from './useCanvasDraw.js'
import { drawGrid, drawLabel } from './plotUtils.js'
import { downsample } from '../../core/operations.js'

/**
 * Canvas waveform plot.
 *
 * Props:
 *   signal      number[]  — primary signal
 *   secondary   number[]  — optional ghost overlay (muted yellow)
 *   label       string
 *   color       string    — CSS colour for primary line
 *   highlightIdx number   — draw a vertical playhead at this sample index
 */
export default function WaveformPlot({
  signal,
  secondary = null,
  label = '',
  color = '#6ee7b7',
  highlightIdx = null,
}) {
  const draw = useCallback(
    (ctx, W, H) => {
      ctx.fillStyle = '#060c14'
      ctx.fillRect(0, 0, W, H)
      drawGrid(ctx, W, H)

      if (!signal || signal.length === 0) return

      const pts = downsample(signal, W)
      const mx = Math.max(1e-10, ...pts.map(Math.abs))
      const ty = (v) => H / 2 - (v / mx) * (H / 2 - 6)

      // Secondary (ghost) signal
      if (secondary && secondary.length) {
        const sPts = downsample(secondary, W)
        ctx.strokeStyle = 'rgba(251,191,36,0.25)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        sPts.forEach((v, i) => {
          const x = (i / (sPts.length - 1)) * W
          i === 0 ? ctx.moveTo(x, ty(v)) : ctx.lineTo(x, ty(v))
        })
        ctx.stroke()
      }

      // Primary signal
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.beginPath()
      pts.forEach((v, i) => {
        const x = (i / (pts.length - 1)) * W
        i === 0 ? ctx.moveTo(x, ty(v)) : ctx.lineTo(x, ty(v))
      })
      ctx.stroke()

      // Playhead
      if (highlightIdx !== null) {
        const x = (highlightIdx / signal.length) * W
        ctx.strokeStyle = 'rgba(251,191,36,0.75)'
        ctx.lineWidth = 1.2
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(251,191,36,0.9)'
        ctx.beginPath()
        ctx.arc(x, ty(signal[highlightIdx] ?? 0), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }

      drawLabel(ctx, label)
    },
    [signal, secondary, label, color, highlightIdx],
  )

  const ref = useCanvasDraw(draw, [signal, secondary, label, color, highlightIdx])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
}
