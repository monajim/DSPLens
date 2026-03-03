import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { addNoise, firLowpass } from '../core/operations.js'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import { Slider, PlayBtn, Badge, Explainer, Panel } from '../ui/controls/index.jsx'

const FS = 8000
const N = 512

export default function LessonFIR() {
  const [sigFreq, setSigFreq] = useState(300)
  const [snrDb, setSnrDb]     = useState(20)
  const [cutoffHz, setCutoffHz] = useState(800)
  const [taps, setTaps]       = useState(31)

  const fc = cutoffHz / (FS / 2)  // normalised [0..1]

  const noisy    = useMemo(() => addNoise(Sig.sine(sigFreq, FS, N), snrDb), [sigFreq, snrDb])
  const filtered = useMemo(() => firLowpass(noisy, fc, taps), [noisy, fc, taps])
  const impulse  = useMemo(() => {
    const imp = new Array(N).fill(0); imp[0] = 1
    return firLowpass(imp, fc, taps).slice(0, taps + 8)
  }, [fc, taps])

  const passbandOk = cutoffHz > sigFreq

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Slider label="Signal freq"   value={sigFreq}   min={100}  max={1500}         onChange={setSigFreq}    color="#fbbf24" unit="Hz" />
        <Slider label="Input SNR"     value={snrDb}     min={0}    max={40}           onChange={setSnrDb}      color="#f87171" unit="dB" />
        <Slider label="Cutoff freq"   value={cutoffHz}  min={50}   max={3000}         onChange={setCutoffHz}   color="#60a5fa" unit="Hz" />
        <Slider label="Filter taps"   value={taps}      min={5}    max={101} step={2} onChange={setTaps}       color="#a78bfa" />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <PlayBtn signal={noisy}    sampleRate={FS} label="Noisy" />
        <PlayBtn signal={filtered} sampleRate={FS} label="Filtered" />
        <Badge variant={passbandOk ? 'ok' : 'warn'}>
          {passbandOk ? `✓ Cutoff (${cutoffHz}Hz) above ${sigFreq}Hz` : `⚠ Signal outside passband`}
        </Badge>
        <Badge>Delay: {Math.floor(taps / 2)} samples</Badge>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(3,1fr)', gap: 6, minHeight: 0 }}>
        <Panel highlight="error"><WaveformPlot signal={noisy}    label="Noisy input"                                           color="#f87171" /></Panel>
        <Panel highlight="ok">   <WaveformPlot signal={filtered} label="FIR filtered output"                                  color="#6ee7b7" secondary={Sig.sine(sigFreq, FS, N)} /></Panel>
        <Panel>                  <WaveformPlot signal={impulse}  label={`Impulse response h[n] — ${taps} taps (IS the filter)`} color="#a78bfa" /></Panel>
      </div>

      <Explainer
        text={`FIR: output = convolution of input with h[n]. ${taps} taps → cutoff at ${cutoffHz}Hz. More taps = sharper roll-off, but adds ${Math.floor(taps / 2)} sample latency. The ghost yellow line in the middle row is the clean sine — compare how close the filtered output gets.`}
      />
    </div>
  )
}
