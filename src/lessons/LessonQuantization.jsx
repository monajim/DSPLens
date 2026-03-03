import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { quantize, sqnr } from '../core/operations.js'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import SpectrumPlot from '../ui/plots/SpectrumPlot.jsx'
import { Slider, PlayBtn, Badge, Explainer, Panel, SectionLabel, ToggleGroup } from '../ui/controls/index.jsx'

const FS = 8000
const N  = 512

const SRC_OPTIONS = [
  { value: 'sine',     label: 'Sine' },
  { value: 'chord',    label: 'Chord' },
  { value: 'sawtooth', label: 'Sawtooth' },
]

export default function LessonQuantization() {
  const [bits, setBits] = useState(8)
  const [src,  setSrc]  = useState('sine')
  const [freq, setFreq] = useState(440)

  const signal = useMemo(() => {
    if (src === 'chord') return Sig.chord([440, 550, 660], [0.5, 0.35, 0.25], FS, N)
    if (src === 'sawtooth') return Sig.sawtooth(freq, FS, N)
    return Sig.sine(freq, FS, N)
  }, [src, freq])

  const quantized = useMemo(() => quantize(signal, bits), [signal, bits])
  const error     = useMemo(() => signal.map((v, i) => v - quantized[i]), [signal, quantized])

  const measuredSNR = useMemo(() => sqnr(signal, quantized), [signal, quantized])
  const theorySNR   = 6.02 * bits + 1.76
  const levels      = Math.pow(2, bits)

  const quality = bits >= 12 ? 'ok' : bits >= 6 ? 'warn' : 'error'
  const waveColor = bits <= 4 ? '#f87171' : bits <= 8 ? '#fbbf24' : '#6ee7b7'
  const panelHl   = bits <= 4 ? 'error' : bits <= 8 ? 'warn' : 'ok'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <SectionLabel>Source</SectionLabel>
          <div style={{ marginTop: 4 }}>
            <ToggleGroup options={SRC_OPTIONS} value={src} onChange={setSrc} activeColor="#fbbf24" />
          </div>
        </div>
        <Slider label="Bit depth" value={bits} min={1} max={16} onChange={setBits} color="#fbbf24" />
        {src !== 'chord' && (
          <Slider label="Frequency" value={freq} min={100} max={2000} onChange={setFreq} color="#60a5fa" unit="Hz" />
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Badge variant={quality}>SNR {measuredSNR.toFixed(1)} dB</Badge>
        <Badge>Theory {theorySNR.toFixed(1)} dB</Badge>
        <Badge>{levels.toLocaleString()} levels</Badge>
        <PlayBtn signal={quantized} sampleRate={FS} label={`${bits}‑bit`} />
        <PlayBtn signal={signal}    sampleRate={FS} label="Original" />
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(3,1fr)', gap: 6, minHeight: 0 }}>
        <Panel><WaveformPlot signal={signal}    label="Original — infinite precision" color="#fbbf24" /></Panel>
        <Panel highlight={panelHl}><WaveformPlot signal={quantized} label={`Quantized — ${bits} bits, ${levels} levels`} color={waveColor} /></Panel>
        <Panel><SpectrumPlot signal={error} fs={FS} label="Quantization noise spectrum" color="#f97316" N={512} /></Panel>
      </div>

      <Explainer
        text={`Each bit ≈ +6 dB SNR. At ${bits} bit${bits > 1 ? 's' : ''}: theory = ${theorySNR.toFixed(1)} dB, measured = ${measuredSNR.toFixed(1)} dB. Below 8 bits you can clearly hear the noise floor. At 1–3 bits the step size is so large the signal is barely recognisable. Press Play to compare.`}
      />
    </div>
  )
}
