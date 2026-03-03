import { useMemo, useState, useEffect, useRef } from 'react'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import { IconBtn, Explainer, Panel } from '../ui/controls/index.jsx'

const LEN = 80

const makeX = () => {
  const s = new Array(LEN).fill(0)
  for (let i = 10; i < 20; i++) s[i] = 0.8
  s[25] = 1; s[26] = 0.7; s[27] = 0.4
  return s
}

const makeH = () => {
  const s = new Array(LEN).fill(0)
  for (let i = 0; i < 12; i++) s[i] = Math.exp(-i * 0.32) * 0.9
  return s
}

const X = makeX()
const H = makeH()

export default function LessonConvolution() {
  const [n, setN] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)

  // h flipped and shifted to position n
  const hShifted = useMemo(() => {
    const s = new Array(LEN).fill(0)
    for (let k = 0; k < LEN; k++) {
      const idx = n - k
      if (idx >= 0 && idx < LEN) s[idx] = H[k]
    }
    return s
  }, [n])

  // pointwise product x[k] * h[n-k]
  const product = useMemo(() => X.map((v, i) => v * hShifted[i]), [hShifted])

  // output y accumulating up to n
  const yPartial = useMemo(() => {
    const y = new Array(LEN).fill(0)
    for (let nn = 0; nn <= n; nn++) {
      for (let k = 0; k < LEN; k++) {
        const idx = nn - k
        if (idx >= 0 && idx < LEN) y[nn] += X[idx] * H[k]
      }
    }
    return y
  }, [n])

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setN((v) => {
          if (v >= LEN - 1) { setPlaying(false); return v }
          return v + 1
        })
      }, 45)
    }
    return () => clearInterval(timer.current)
  }, [playing])

  const reset = () => { setN(0); setPlaying(false) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <IconBtn onClick={() => setN((v) => Math.max(0, v - 1))}>◀</IconBtn>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{
            padding: '4px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            background: playing ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.15)',
            border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa',
          }}
        >
          {playing ? '⏸ Pause' : '▶ Animate'}
        </button>
        <IconBtn onClick={() => setN((v) => Math.min(LEN - 1, v + 1))}>▶</IconBtn>
        <input
          type="range" min={0} max={LEN - 1} value={n}
          onChange={(e) => { setPlaying(false); setN(+e.target.value) }}
          style={{ flex: 1, height: 3, borderRadius: 2, appearance: 'none', background: `linear-gradient(to right,#a78bfa ${(n / (LEN - 1)) * 100}%,rgba(255,255,255,0.1) 0)`, accentColor: '#a78bfa', color: '#a78bfa' }}
        />
        <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: 'rgba(255,255,255,0.35)', minWidth: 44 }}>n = {n}</span>
        <IconBtn onClick={reset}>↺ Reset</IconBtn>
      </div>

      {/* 4-row signal stack */}
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(4,1fr)', gap: 6, minHeight: 0 }}>
        <Panel><WaveformPlot signal={X}        label="x[n] — input signal"                                            color="#fbbf24" highlightIdx={n} /></Panel>
        <Panel><WaveformPlot signal={hShifted} label="h[n−k] — impulse response flipped & shifted to n"              color="#c084fc" highlightIdx={n} /></Panel>
        <Panel><WaveformPlot signal={product}  label="x[k]·h[n−k] — pointwise product  (sum = y[n])"                color="#60a5fa" /></Panel>
        <Panel highlight="ok"><WaveformPlot signal={yPartial} label="y[n] = Σ x[k]·h[n−k] — output building up"    color="#6ee7b7" highlightIdx={n} /></Panel>
      </div>

      <Explainer
        text={`Step n=${n}: slide h over x, multiply pointwise, then sum. y[${n}] = ${yPartial[n]?.toFixed(3) ?? 0}. Each output sample is a weighted sum of past inputs — that's what makes a system LTI.`}
      />
    </div>
  )
}
