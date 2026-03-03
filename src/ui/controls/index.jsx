import { playSignal } from '../../core/audio.js'

// ─── Slider ───────────────────────────────────────────────────────────────────
export function Slider({ label, value, min, max, step = 1, onChange, color = '#a78bfa', unit = '', disabled = false }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex-1 min-w-[7rem]">
      <div className="flex justify-between items-baseline mb-1">
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color, fontFamily: '"JetBrains Mono", monospace' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
        style={{
          width: '100%',
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) 0)`,
          accentColor: color,
          color,
        }}
      />
    </div>
  )
}

// ─── Play button ──────────────────────────────────────────────────────────────
export function PlayBtn({ signal, sampleRate = 8000, label = 'Play' }) {
  return (
    <button
      onClick={() => playSignal(signal, sampleRate)}
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        background: 'rgba(139,92,246,0.15)',
        border: '1px solid rgba(139,92,246,0.35)',
        color: 'rgba(255,255,255,0.75)',
        fontSize: 11,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.35)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.15)')}
    >
      ▶ {label}
    </button>
  )
}

// ─── Icon button (prev / next / reset) ────────────────────────────────────────
export function IconBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ─── Toggle button row ────────────────────────────────────────────────────────
export function ToggleGroup({ options, value, onChange, activeColor = '#fbbf24' }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              background: active ? `${activeColor}22` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? activeColor + '55' : 'rgba(255,255,255,0.07)'}`,
              color: active ? activeColor : 'rgba(255,255,255,0.4)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {opt.label ?? opt.value}
          </button>
        )
      })}
    </div>
  )
}

// ─── Checkbox ────────────────────────────────────────────────────────────────
export function Checkbox({ label, checked, onChange, color = '#60a5fa' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: color }} />
      {label}
    </label>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const variantStyles = {
  default: { border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', bg: 'transparent' },
  ok:      { border: 'rgba(110,231,183,0.3)', color: '#6ee7b7',               bg: 'rgba(110,231,183,0.07)' },
  warn:    { border: 'rgba(251,191,36,0.3)',  color: '#fbbf24',               bg: 'rgba(251,191,36,0.07)' },
  error:   { border: 'rgba(248,113,113,0.3)', color: '#f87171',              bg: 'rgba(248,113,113,0.07)' },
}

export function Badge({ children, variant = 'default' }) {
  const s = variantStyles[variant] ?? variantStyles.default
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 4,
      border: `1px solid ${s.border}`,
      color: s.color,
      background: s.bg,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ─── Explainer panel ──────────────────────────────────────────────────────────
export function Explainer({ text, icon = '●' }) {
  return (
    <div style={{
      background: 'rgba(139,92,246,0.05)',
      border: '1px solid rgba(139,92,246,0.14)',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      lineHeight: 1.65,
      flexShrink: 0,
    }}>
      <span style={{ color: 'rgba(139,92,246,0.65)', marginRight: 6 }}>{icon}</span>
      {text}
    </div>
  )
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────
export function Panel({ children, className = '', highlight = null }) {
  const borderMap = {
    ok:    '1px solid rgba(110,231,183,0.15)',
    warn:  '1px solid rgba(251,191,36,0.15)',
    error: '1px solid rgba(248,113,113,0.2)',
  }
  return (
    <div
      className={className}
      style={{
        borderRadius: 6,
        border: borderMap[highlight] ?? '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
      {children}
    </span>
  )
}
