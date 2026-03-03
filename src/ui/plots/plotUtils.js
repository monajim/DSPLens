/** Draw a subtle background grid. */
export function drawGrid(ctx, W, H, rows = 4, cols = 6) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let i = 1; i < rows; i++) {
    const y = (H * i) / rows
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (let i = 1; i < cols; i++) {
    const x = (W * i) / cols
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  // Centre line
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.stroke()
  ctx.restore()
}

/** Draw a label in the top-left corner. */
export function drawLabel(ctx, text, color = 'rgba(255,255,255,0.3)') {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.fillText(text, 6, 14)
  ctx.restore()
}
