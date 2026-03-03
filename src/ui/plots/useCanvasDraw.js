import { useRef, useEffect } from 'react'

/**
 * Runs a draw callback on a canvas whenever deps change.
 * Handles HiDPI scaling automatically.
 *
 * @param {(ctx: CanvasRenderingContext2D, W: number, H: number) => void} draw
 * @param {any[]} deps
 */
export function useCanvasDraw(draw, deps) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (W === 0 || H === 0) return

    canvas.width = W * dpr
    canvas.height = H * dpr

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    draw(ctx, W, H)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
