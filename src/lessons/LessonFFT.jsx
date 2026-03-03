import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { applyWindow } from '../core/operations.js'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import SpectrumPlot from '../ui/plots/SpectrumPlot.jsx'
import { Slider, PlayBtn, Checkbox, Explainer, Panel, SectionLabel, ToggleGroup } from '../ui/controls/index.jsx'

const FS = 8000
const N = 1024

const WAVE_OPTIONS = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'chirp', label: 'Chirp' },
]

const WIN_OPTIONS = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'hann', label: 'Hann' },
  { value: 'hamming', label: 'Hamming' },
  { value: 'blackman', label: 'Blackman' },
]

export default function LessonFFT() {
  const [wave, setWave] = useState('sine')
  const [freq, setFreq] = useState(440)
  const [freq2, setFreq2] = useState(660)
  const [twoTones, setTwoTones] = useState(false)
  const [win, setWin] = useState('rectangular')
  const [logScale, setLogScale] = useState(false)

  const raw = useMemo(() => {
    let s
    switch (wave) {
      case 'square':   s = Sig.square(freq, FS, N); break
      case 'sawtooth': s = Sig.sawtooth(freq, FS, N); break
      case 'chirp':    s = Sig.chirp(100, 2000, FS, N); break
      default:         s = Sig.sine(freq, FS, N)
    }
    if (twoTones) {
      const s2 = Sig.sine(freq2, FS, N)
      s = s.map((v, i) => v + s2[i])
    }
    return s
  }, [wave, freq, freq2, twoTones])

  const windowed = useMemo(() => applyWindow(raw, win), [raw, win])

  const leakage = win === 'rectangular'

  const winExplain = {
    rectangular: 'Rectangular: abrupt cutoff at both ends creates spectral leakage — energy bleeds into all bins. Best frequency resolution but worst leakage.',
    hann:        'Hann: smooth taper to zero eliminates most leakage. The standard choice for general spectral analysis.',
    hamming:     'Hamming: slightly different cosine taper. Better main-lobe width than Hann, similar sidelobe suppression.',
    blackman:    'Blackman: three-term cosine. Widest main lobe but excellent sidelobe rejection (−74dB). Best for finding weak nearby tones.',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <SectionLabel>Waveform</SectionLabel>
          <div style={{ marginTop: 4 }}>
            <ToggleGroup options={WAVE_OPTIONS} value={wave} onChange={setWave} activeColor="#fbbf24" />
          </div>
        </div>
        <div>
          <SectionLabel>Window</SectionLabel>
          <div style={{ marginTop: 4 }}>
            <ToggleGroup options={WIN_OPTIONS} value={win} onChange={setWin} activeColor="#a78bfa" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Slider label="Frequency" value={freq} min={100} max={3000} onChange={setFreq} color="#fbbf24" unit="Hz" disabled={wave === 'chirp'} />
        <Checkbox label="Add 2nd tone" checked={twoTones} onChange={setTwoTones} color="#60a5fa" />
        {twoTones && <Slider label="Frequency 2" value={freq2} min={100} max={3000} onChange={setFreq2} color="#60a5fa" unit="Hz" />}
        <Checkbox label="Log scale" checked={logScale} onChange={setLogScale} color="#a78bfa" />
        <PlayBtn signal={windowed} sampleRate={FS} label="Play" />
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
        <Panel>
          <WaveformPlot signal={windowed} label={`Signal × ${win} window`} color="#fbbf24" />
        </Panel>
        <Panel highlight={leakage ? 'warn' : 'ok'}>
          <SpectrumPlot signal={windowed} fs={FS} label="Spectrum |X(f)|" color="#a78bfa" logScale={logScale} N={N} />
        </Panel>
      </div>

      <Explainer text={winExplain[win]} icon={leakage ? '⚠' : '✓'} />
    </div>
  )
}
