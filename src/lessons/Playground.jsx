import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { addNoise, firLowpass, firHighpass, quantize, applyWindow } from '../core/operations.js'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import SpectrumPlot from '../ui/plots/SpectrumPlot.jsx'
import { Slider, PlayBtn, Explainer, Panel, SectionLabel, ToggleGroup } from '../ui/controls/index.jsx'

const FS = 8000
const N  = 1024

const SRC_OPTIONS = [
  { value: 'sine',     label: 'Sine' },
  { value: 'square',   label: 'Square' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'chirp',    label: 'Chirp' },
  { value: 'noise',    label: 'Noise' },
]

const BLOCKS = [
  { id: 'noise',   label: '+ White noise',  color: '#f87171' },
  { id: 'lp800',   label: 'LPF 800Hz',      color: '#60a5fa' },
  { id: 'hp800',   label: 'HPF 800Hz',      color: '#818cf8' },
  { id: 'q4',      label: 'Quantize 4-bit', color: '#fb923c' },
  { id: 'q8',      label: 'Quantize 8-bit', color: '#fdba74' },
  { id: 'hann',    label: 'Hann window',    color: '#a78bfa' },
  { id: 'reverse', label: 'Reverse',        color: '#6ee7b7' },
]

function applyOp(sig, opId, freq) {
  switch (opId) {
    case 'noise':   return addNoise(sig, 12)
    case 'lp800':   return firLowpass(sig, 800 / (FS / 2), 31)
    case 'hp800':   return firHighpass(sig, 800 / (FS / 2), 31)
    case 'q4':      return quantize(sig, 4)
    case 'q8':      return quantize(sig, 8)
    case 'hann':    return applyWindow(sig, 'hann')
    case 'reverse': return [...sig].reverse()
    default:        return sig
  }
}

export default function Playground() {
  const [src,   setSrc]   = useState('sine')
  const [freq,  setFreq]  = useState(440)
  const [chain, setChain] = useState([])

  const base = useMemo(() => {
    switch (src) {
      case 'square':   return Sig.square(freq, FS, N)
      case 'sawtooth': return Sig.sawtooth(freq, FS, N)
      case 'chirp':    return Sig.chirp(100, 2000, FS, N)
      case 'noise':    return Sig.noise(N, 0.7)
      default:         return Sig.sine(freq, FS, N)
    }
  }, [src, freq])

  const processed = useMemo(
    () => chain.reduce((s, opId) => applyOp(s, opId, freq), base),
    [base, chain, freq],
  )

  const addBlock  = (id) => setChain((c) => [...c, id])
  const undoLast  = () => setChain((c) => c.slice(0, -1))
  const clearAll  = () => setChain([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Source */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <SectionLabel>Source signal</SectionLabel>
          <div style={{ marginTop: 4 }}>
            <ToggleGroup options={SRC_OPTIONS} value={src} onChange={setSrc} activeColor="#6ee7b7" />
          </div>
        </div>
        <Slider label="Frequency" value={freq} min={100} max={3000} onChange={setFreq} color="#6ee7b7" unit="Hz" disabled={src === 'chirp' || src === 'noise'} />
      </div>

      {/* Chain display */}
      <div>
        <SectionLabel>Operation chain</SectionLabel>
        <div style={{
          marginTop: 6,
          minHeight: 34,
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 6,
          padding: '6px 10px',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {chain.length === 0 ? (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>empty — add blocks below</span>
          ) : (
            chain.map((opId, idx) => {
              const b = BLOCKS.find((x) => x.id === opId)
              return (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: b?.color + '20', border: `1px solid ${b?.color}40`, color: b?.color }}>
                    {b?.label}
                  </span>
                  {idx < chain.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>→</span>}
                </span>
              )
            })
          )}
          {chain.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button onClick={undoLast} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.6)', cursor: 'pointer' }}>↩ undo</button>
              <button onClick={clearAll} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>clear</button>
            </div>
          )}
        </div>

        {/* Block palette */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
          {BLOCKS.map((b) => (
            <button
              key={b.id}
              onClick={() => addBlock(b.id)}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: b.color + '10', border: `1px solid ${b.color}30`, color: b.color + 'cc', cursor: 'pointer', transition: 'all 0.12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = b.color + '25')}
              onMouseLeave={(e) => (e.currentTarget.style.background = b.color + '10')}
            >
              + {b.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <PlayBtn signal={processed} sampleRate={FS} label="▶ Result" />
          </div>
        </div>
      </div>

      {/* Output plots */}
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
        <Panel><WaveformPlot signal={processed} label="Output — time domain"      color="#6ee7b7" /></Panel>
        <Panel><SpectrumPlot signal={processed} fs={FS} label="Output — frequency domain" color="#a78bfa" N={1024} /></Panel>
      </div>
    </div>
  )
}
