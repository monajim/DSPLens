import { useCallback } from 'react'
import { useCanvasDraw } from './useCanvasDraw.js'
import { drawGrid, drawLabel } from './plotUtils.js'
import { freqResponse } from '../../core/fft.js'

export default function FreqRespPlot({ poles, zeros, color = '#a78bfa' }) {
  const draw = useCallback(
    (ctx, W, H) => {
      ctx.fillStyle = '#060c14'
      ctx.fillRect(0, 0, W, H)
      drawGrid(ctx, W, H)

      const h = freqResponse(poles, zeros, W)
      const mx = Math.max(1e-10, ...h)

      // Fill
      ctx.beginPath()
      h.forEach((v, i) => {
        const x = (i / (h.length - 1)) * W
        const y = H - (v / mx) * (H - 4)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.fillStyle = color + '14'
      ctx.fill()

      // Line
      ctx.beginPath()
      h.forEach((v, i) => {
        const x = (i / (h.length - 1)) * W
        const y = H - (v / mx) * (H - 4)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      drawLabel(ctx, '|H(e^jω)|')

      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '9px "JetBrains Mono", monospace'
      ctx.fillText('0', 4, H - 3)
      ctx.fillText('π', W - 10, H - 3)
    },
    [poles, zeros, color],
  )

  const ref = useCanvasDraw(draw, [poles, zeros, color])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
}
