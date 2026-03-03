import { useState } from 'react'
import LessonSampling    from './lessons/LessonSampling.jsx'
import LessonConvolution from './lessons/LessonConvolution.jsx'
import LessonFFT         from './lessons/LessonFFT.jsx'
import LessonFIR         from './lessons/LessonFIR.jsx'
import LessonIIR         from './lessons/LessonIIR.jsx'
import LessonQuantization from './lessons/LessonQuantization.jsx'
import Playground        from './lessons/Playground.jsx'

const LESSONS = [
  { id: 'sampling',   icon: '〜', label: 'Sampling',      sub: 'Nyquist & aliasing',    Component: LessonSampling    },
  { id: 'conv',       icon: '✦', label: 'Convolution',   sub: 'LTI systems',            Component: LessonConvolution },
  { id: 'fft',        icon: '◈', label: 'FFT',           sub: 'Leakage & windowing',    Component: LessonFFT         },
  { id: 'fir',        icon: '◎', label: 'FIR Filter',    sub: 'Windowed-sinc design',   Component: LessonFIR         },
  { id: 'iir',        icon: '⬡', label: 'IIR & Poles',   sub: 'Pole-zero analysis',     Component: LessonIIR         },
  { id: 'quant',      icon: '▦', label: 'Quantization',  sub: 'Bits, SNR & noise',      Component: LessonQuantization },
  { id: 'playground', icon: '⊕', label: 'Playground',    sub: 'Free exploration',       Component: Playground        },
]

export default function App() {
  const [active, setActive] = useState('sampling')
  const { Component } = LESSONS.find((l) => l.id === active) ?? LESSONS[0]

  return (
    <div style={{ background: '#060c14', color: '#e2e8f0', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
      {/* ── Top bar ── */}
      <header style={{
        height: 44,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: 16, color: '#e2e8f0' }}>DSP</span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: 16, color: '#a78bfa' }}>Lens</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
          Interactive Signal Processing
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['Click ▶ to hear', 'Drag poles & zeros'].map((tip) => (
            <span key={tip} style={{ padding: '2px 7px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono", monospace' }}>
              {tip}
            </span>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* ── Sidebar ── */}
        <nav style={{
          width: 175,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          {LESSONS.map((l) => {
            const isActive = l.id === active
            return (
              <button
                key={l.id}
                onClick={() => setActive(l.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 5,
                  border: 'none',
                  borderLeft: `2px solid ${isActive ? 'rgba(139,92,246,0.7)' : 'transparent'}`,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(139,92,246,0.14)' : 'transparent',
                  transition: 'background 0.12s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.28)' }}>
                    {l.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: isActive ? '#e2e8f0' : 'rgba(255,255,255,0.48)' }}>
                      {l.label}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 1, letterSpacing: '0.03em' }}>
                      {l.sub}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {/* ── Author credit ── */}
          <div style={{
            marginTop: 'auto',
            padding: '12px 10px 8px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}>
              Built by
            </div>
            <a
              href="https://github.com/monajim"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#a78bfa',
                fontWeight: 600,
                fontFamily: '"JetBrains Mono", monospace',
                flexShrink: 0,
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>monajim</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>github.com</div>
              </div>
            </a>
          </div>

        </nav>

        {/* ── Lesson area ── */}
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: 16 }}>
          <div style={{ height: '100%', minHeight: 520 }}>
            <Component key={active} />
          </div>
        </main>
      </div>
    </div>
  )
}