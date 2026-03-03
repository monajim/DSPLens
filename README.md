# DSPLens — Interactive Signal Processing

> **See and hear what the math is doing.**

DSPLens is an open-source, browser-native DSP learning tool. Every concept lives in a single instrument-panel layout: signal source → operation chain → time + frequency views + live explanation. No backend, no build server — all DSP runs in the browser.

---

## ✨ Features

| Lesson | What you learn |
|--------|---------------|
| **Sampling & Aliasing** | Nyquist theorem, spectrum folding, ZOH reconstruction |
| **Convolution** | Animated step-by-step LTI convolution with all 4 signal rows |
| **FFT & Windowing** | Spectral leakage, Hann/Hamming/Blackman windows, log scale |
| **FIR Filtering** | Windowed-sinc design, impulse response, tap count vs roll-off |
| **IIR & Pole-Zero** | Draggable poles/zeros, frequency response, stability |
| **Quantization** | Bit depth, SQNR, noise floor spectrum |
| **Playground** | Chain any operations freely, hear the result |

All audio via WebAudio API — press **▶ Play** on any lesson to hear the signal.

---

## 🚀 Quick start

```bash
git clone https://github.com/YOUR_USERNAME/dsplens.git
cd dsplens
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🏗 Tech stack

- **React 18** + **Vite 5**
- **Canvas API** for all plots (no chart library dependency)
- **WebAudio API** for real-time audio playback
- **Tailwind CSS** (utility classes only)
- Pure JS DSP engine — Cooley-Tukey FFT, windowed-sinc FIR, pole-zero IIR

---

## 📦 Build & deploy

```bash
npm run build    # outputs to dist/
npm run preview  # serve dist/ locally
```

### Netlify (one-click)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/dsplens)

Build command: `npm run build` · Publish directory: `dist`

### Vercel
```bash
npx vercel
```

### GitHub Pages
Push to `main` — the included Actions workflow builds and deploys automatically.
Enable Pages in **Settings → Pages → Source: GitHub Actions**.

---

## 📁 Project structure

```
dsplens/
├── src/
│   ├── core/
│   │   ├── fft.js          # Cooley-Tukey FFT + freq response
│   │   ├── signals.js      # Sine, square, chirp, noise generators
│   │   ├── operations.js   # Window, FIR, IIR, quantize, noise
│   │   └── audio.js        # WebAudio playback
│   ├── ui/
│   │   ├── plots/          # WaveformPlot, SpectrumPlot, PoleZeroPlot, FreqRespPlot
│   │   └── controls/       # Slider, Badge, Explainer, PlayBtn …
│   ├── lessons/            # One file per lesson module
│   ├── App.jsx             # Shell + sidebar nav
│   └── main.jsx
├── public/
│   └── favicon.svg
├── netlify.toml
├── vercel.json
└── .github/workflows/deploy.yml
```

---

## 🤝 Contributing

PRs welcome! Good first issues:
- Add a spectrogram / STFT lesson
- Touch/mobile drag support for pole-zero plot
- Export pipeline as JSON
- Add AM/FM modulation lesson

---

## 📄 License

MIT
