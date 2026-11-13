let ctx, timer
const muted = () => localStorage.getItem('mute') === '1'
const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start = 0, dur = 0.15, o = {}) {
  if (muted()) return
  const { type = 'triangle', vol = 0.18, slideTo } = o
  const c = ac(), t = c.currentTime + start
  const osc = c.createOscillator(), g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t); osc.stop(t + dur + 0.05)
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 }

export const sfx = {
  klik: () => tone(700, 0, 0.08, { type: 'sine', slideTo: 1000, vol: 0.12 }),
  mulai: () => tone(400, 0, 0.3, { type: 'sine', slideTo: 1200, vol: 0.14 }),
  benar: (streak = 0) => {
    const k = Math.pow(2, Math.min(streak, 5) / 12) // makin tinggi tiap benar beruntun
    ;[N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f * k, i * 0.09, 0.18))
    tone(N.E6 * k, 0.4, 0.25, { type: 'sine', vol: 0.1 })
  },
  salah: () => {
    tone(400, 0, 0.2, { type: 'sine', slideTo: 300, vol: 0.15 })
    tone(330, 0.2, 0.3, { type: 'sine', slideTo: 250, vol: 0.15 })
  },
  petunjuk: () => { tone(N.G5, 0, 0.12, { type: 'sine' }); tone(N.C6, 0.1, 0.2, { type: 'sine' }) },
  selesai: () => [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.12, 0.22)),
}

// Musik kotak musik pelan, opsional (mati secara bawaan)
const skala = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6]
export const musik = {
  start() {
    if (timer || muted()) return
    timer = setInterval(() => tone(skala[Math.floor(Math.random() * skala.length)], 0, 0.5, { type: 'sine', vol: 0.04 }), 700)
  },
  stop() { clearInterval(timer); timer = null },
  nyala: () => !!timer,
}

export const isMuted = muted
export const setMuted = (v) => { localStorage.setItem('mute', v ? '1' : '0'); if (v) musik.stop() }