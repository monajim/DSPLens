import { useRef, useEffect, useCallback } from 'react'

export default function PoleZeroPlot({ poles, zeros, onDragPole, onDragZero }) {
  const canvasRef = useRef(null)
  const drag = useRef(null)

  // Convert z-plane coords → canvas pixels
  const toCanvas = useCallback((re, im) => {
    const c = canvasRef.current
    if (!c) return { x: 0, y: 0 }
    const W = c.offsetWidth
    const H = c.offsetHeight
    return { x: W / 2 + re * W * 0.38, y: H / 2 - im * H * 0.38 }
  }, [])

  // Convert canvas pixels → z-plane coords
  const toZPlane = useCallback((x, y) => {
    const c = canvasRef.current
    if (!c) return { re: 0, im: 0 }
    const W = c.offsetWidth
    const H = c.offsetHeight
    return { re: (x - W / 2) / (W * 0.38), im: -(y - H / 2) / (H * 0.38) }
  }, [])

  const redraw = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const W = c.offsetWidth
    const H = c.offsetHeight
    c.width = W * dpr
    c.height = H * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#060c14'
    ctx.fillRect(0, 0, W, H)

    // Unit-circle disk
    const r = W * 0.38
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r)
    grad.addColorStop(0, 'rgba(139,92,246,0.07)')
    grad.addColorStop(1, 'rgba(139,92,246,0.01)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2)
    ctx.fill()

    // Unit circle
    ctx.strokeStyle = 'rgba(139,92,246,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillText('+1', W / 2 + r - 14, H / 2 - 4)
    ctx.fillText('-1', W / 2 - r + 2, H / 2 - 4)
    ctx.fillText('+j', W / 2 + 4, H / 2 - r + 12)
    ctx.fillText('-j', W / 2 + 4, H / 2 + r - 4)

    // Zeros (circles)
    zeros.forEach((z) => {
      const { x, y } = toCanvas(z.re, z.im)
      ctx.strokeStyle = '#6ee7b7'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.stroke()
    })

    // Poles (crosses)
    poles.forEach((p) => {
      const { x, y } = toCanvas(p.re, p.im)
      const mag = Math.sqrt(p.re * p.re + p.im * p.im)
      ctx.strokeStyle = mag >= 1 ? '#fbbf24' : '#f87171'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x - 7, y - 7)
      ctx.lineTo(x + 7, y + 7)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + 7, y - 7)
      ctx.lineTo(x - 7, y + 7)
      ctx.stroke()
    })

    // Legend
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText('POLE-ZERO', 4, 12)
    ctx.fillStyle = 'rgba(248,113,113,0.7)'
    ctx.fillText('✕ poles', W - 52, 12)
    ctx.fillStyle = 'rgba(110,231,183,0.7)'
    ctx.fillText('○ zeros', W - 52, 24)
  }, [poles, zeros, toCanvas])

  useEffect(() => {
    redraw()
  }, [redraw])

  const clientPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onMouseDown = (e) => {
    const { x, y } = clientPos(e)
    poles.forEach((p, i) => {
      const c = toCanvas(p.re, p.im)
      if (Math.hypot(x - c.x, y - c.y) < 14) drag.current = { t: 'pole', i }
    })
    zeros.forEach((z, i) => {
      const c = toCanvas(z.re, z.im)
      if (Math.hypot(x - c.x, y - c.y) < 14) drag.current = { t: 'zero', i }
    })
  }

  const onMouseMove = (e) => {
    if (!drag.current) return
    const { x, y } = clientPos(e)
    const z = toZPlane(x, y)
    if (drag.current.t === 'pole') onDragPole?.(drag.current.i, z)
    if (drag.current.t === 'zero') onDragZero?.(drag.current.i, z)
  }

  const onMouseUp = () => { drag.current = null }

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  )
}
