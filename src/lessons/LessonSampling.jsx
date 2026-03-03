import { useMemo, useState } from 'react'
import { Sig } from '../core/signals.js'
import { simulateSampling } from '../core/operations.js'
import WaveformPlot from '../ui/plots/WaveformPlot.jsx'
import { Slider, PlayBtn, Badge, Explainer, Panel } from '../ui/controls/index.jsx'

const FS_ORIG = 8000
const N = 512

export default function LessonSampling() {
  const [sigFreq, setSigFreq] = useState(200)
  const [fs, setFs] = useState(1000)

  const original = useMemo(() => Sig.sine(sigFreq, FS_ORIG, N), [sigFreq])
  const sampled = useMemo(() => simulateSampling(original, FS_ORIG / fs), [original, fs])

  const aliased = sigFreq > fs / 2
  const nyquist = fs / 2
  const aliasFreq = aliased ? Math.abs(sigFreq - fs * Math.round(sigFreq / fs)) : sigFreq

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Slider label="Signal frequency" value={sigFreq} min={50} max={2000} onChange={setSigFreq} color="#fbbf24" unit="Hz" />
        <Slider label="Sample rate fs" value={fs} min={200} max={4000} step={50} onChange={setFs} color="#60a5fa" unit="Hz" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge>Nyquist: <span style={{ color: '#60a5fa' }}>{nyquist}Hz</span></Badge>
        <Badge variant={aliased ? 'error' : 'ok'}>
          {aliased ? `ALIASED → appears as ${aliasFreq}Hz` : `✓ Below Nyquist — no aliasing`}
        </Badge>
        {aliased && <Badge variant="warn">Raise fs above {sigFreq * 2}Hz to fix</Badge>}
        <div style={{ marginLeft: 'auto' }}>
          <PlayBtn signal={sampled} sampleRate={fs} label="Play sampled" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
        <Panel><WaveformPlot signal={original} label="Original signal" color="#fbbf24" /></Panel>
        <Panel highlight={aliased ? 'error' : 'ok'}>
          <WaveformPlot signal={sampled} label="After sampling + ZOH reconstruction" color={aliased ? '#f87171' : '#6ee7b7'} />
        </Panel>
      </div>

      <Explainer
        icon={aliased ? '⚠' : '✓'}
        text={
          aliased
            ? `${sigFreq}Hz exceeds the Nyquist limit of ${nyquist}Hz. The signal folds back and appears as ${aliasFreq}Hz — a phantom frequency. You can hear it when you press Play. Raise fs or add a lowpass anti-alias filter before sampling.`
            : `${sigFreq}Hz < Nyquist (${nyquist}Hz). Shannon's sampling theorem guarantees exact reconstruction — every sample carries complete information about the original sine wave.`
        }
      />
    </div>
  )
}
