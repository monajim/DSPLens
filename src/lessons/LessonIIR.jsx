import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { applyPoleZeroFilter } from '../core/operations.js'
import PoleZeroPlot from '../ui/plots/PoleZeroPlot.jsx'
import FreqRespPlot from '../ui/plots/FreqRespPlot.jsx'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import { Slider, PlayBtn, Explainer, Panel } from '../ui/controls/index.jsx'

const FS = 8000
const N  = 512

const DEFAULT_POLES = [{ re: 0.8, im: 0.4 }, { re: 0.8, im: -0.4 }]
const DEFAULT_ZEROS = [{ re: -1, im: 0 }]

export default function LessonIIR() {
  const [poles, setPoles] = useState(DEFAULT_POLES)
  const [zeros, setZeros] = useState(DEFAULT_ZEROS)
  const [freq,  setFreq]  = useState(400)

  const input  = useMemo(() => Sig.sine(freq, FS, N), [freq])
  const output = useMemo(() => applyPoleZeroFilter(input, poles, zeros), [input, poles, zeros])

  const unstable = poles.some((p) => Math.sqrt(p.re * p.re + p.im * p.im) >= 1)

  const dragPole = (i, v) => setPoles((ps) => ps.map((p, j) => (j === i ? v : p)))
  const dragZero = (i, v) => setZeros((zs) => zs.map((z, j) => (j === i ? v : z)))

  const reset = () => { setPoles(DEFAULT_POLES); setZeros(DEFAULT_ZEROS) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {unstable && (
        <div style={{ padding: '6px 10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, fontSize: 11, color: '#fbbf24' }}>
          ⚠ Unstable system — pole(s) lie outside the unit circle. Feedback grows without bound. Move them inside the dashed circle.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Slider label="Input frequency" value={freq} min={100} max={3000} onChange={setFreq} color="#fbbf24" unit="Hz" />
        <PlayBtn signal={input}  sampleRate={FS} label="Input" />
        <PlayBtn signal={output} sampleRate={FS} label="Filtered" />
        <button onClick={reset} style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer' }}>
          ↺ Reset
        </button>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6 }}>
          <div><span style={{ color: '#f87171' }}>✕</span> drag poles &nbsp; <span style={{ color: '#6ee7b7' }}>○</span> drag zeros</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
        <Panel><PoleZeroPlot poles={poles} zeros={zeros} onDragPole={dragPole} onDragZero={dragZero} /></Panel>
        <Panel><FreqRespPlot poles={poles} zeros={zeros} /></Panel>
        <Panel><WaveformPlot signal={input}  label="Input" color="#fbbf24" /></Panel>
        <Panel highlight={unstable ? 'warn' : null}>
          <WaveformPlot signal={output} label="IIR filtered output" color={unstable ? '#fbbf24' : '#c084fc'} />
        </Panel>
      </div>

      <Explainer
        text="Poles near the unit circle create resonant peaks (boost). Zeros place notches (cancel). Drag a pole to angle θ to boost the frequency θ/π × (fs/2). IIR filters are recursive — that's why a pole outside the circle causes unstable exponential growth."
      />
    </div>
  )
}
