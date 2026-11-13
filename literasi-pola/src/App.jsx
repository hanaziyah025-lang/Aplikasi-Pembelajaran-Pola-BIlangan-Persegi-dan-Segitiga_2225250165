import { useEffect, useRef, useState } from 'react'
import Pattern3D from './Pattern3D.jsx'
import { materi, soal } from './data.js'
import { saveAttempt, loadAttempts, loadStudentAttempts } from './store.js'
import { sfx, isMuted, setMuted } from './sound.js'

const imut = {
  pop: sfx.klik,
  benar: sfx.benar,
  salah: sfx.salah,
  bintang: sfx.selesai,
}

export default function App() {
  const [kode, setKode] = useState(localStorage.getItem('kode') || '')
  const [layar, setLayar] = useState(kode ? 'home' : 'login')
  useEffect(() => {
    const modeSoal = layar === 'latihan' || layar === 'literasi'
    document.body.classList.toggle('mode-soal', modeSoal)
    return () => document.body.classList.remove('mode-soal')
  }, [layar])

  const masuk = (k) => { localStorage.setItem('kode', k); setKode(k); setLayar('home') }
  return (
    <main className="app" onClick={(event) => {
      if (event.target.closest('button')) imut.pop()
    }}>
      {layar === 'login' && <Login onMasuk={masuk} />}
      {layar === 'home' && <Home kode={kode} go={setLayar} keluar={() => { localStorage.removeItem('kode'); setKode(''); setLayar('login') }} />}
      {layar === 'materi' && <Materi back={() => setLayar('home')} />}
      {layar === 'latihan' && <Latihan kode={kode} daftar={soal.filter((s) => s.tipe === 'latihan')} back={() => setLayar('home')} />}
      {layar === 'literasi' && <Latihan kode={kode} daftar={soal.filter((s) => s.tipe === 'literasi')} back={() => setLayar('home')} />}
    </main>
  )
}

function Login({ onMasuk }) {
  const [v, setV] = useState('')
  const nama = v.trim()
  const ok = /^[A-Za-z ]{2,20}$/.test(nama)
  return (
    <section className="card">
      <h1>Yuk, Kenali Pola Bilangan!</h1>
      <p>Tulis namamu untuk mulai petualangan berhitungmu.</p>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Contoh: Alya" inputMode="text" />
      <button disabled={!ok} onClick={() => onMasuk(nama)}>Mulai Belajar</button>
    </section>
  )
}

function Home({ kode, go, keluar }) {
  const [attempts, setAttempts] = useState(() => loadAttempts(kode))
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    let active = true
    loadStudentAttempts(kode).then((loadedAttempts) => {
      if (active) setAttempts(loadedAttempts)
    }).catch((error) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Skor gagal dimuat dari Supabase.')
    })
    return () => { active = false }
  }, [kode])
  const skor = attempts.reduce((total, attempt) => total + (attempt.skor || 0), 0)
  return (
    <section className="home-screen">
      <header className="welcome-header">
        <p className="welcome-eyebrow">PETUALANGAN POLA BILANGAN</p>
        <h1>Halo, {kode}! Siap jadi detektif pola hari ini?</h1>
        <AudioToggle />
      </header>
      <div className="score-card">
        <span className="score-star" aria-hidden="true">★</span>
        <span className="score-label">Skor kamu</span>
        <strong className="score-value">{skor}</strong>
      </div>
      {loadError && <p className="warn">{loadError} Skor lokal tetap ditampilkan.</p>}
      <nav className="menu-list" aria-label="Menu belajar">
        <button className="menu-card menu-materi" onClick={() => go('materi')}>
          <span className="menu-icon" aria-hidden="true">📘</span>
          <span className="menu-copy">
            <span className="menu-title">Belajar Materi</span>
            <span className="menu-description">Kenali pola persegi dan segitiga langkah demi langkah</span>
          </span>
          <span className="menu-arrow" aria-hidden="true">›</span>
        </button>
        <button className="menu-card menu-latihan" onClick={() => go('latihan')}>
          <span className="menu-icon" aria-hidden="true">✏️</span>
          <span className="menu-copy">
            <span className="menu-title">Latihan Mandiri</span>
            <span className="menu-description">Coba sendiri, petunjuk siap membantu</span>
          </span>
          <span className="menu-arrow" aria-hidden="true">›</span>
        </button>
        <button className="menu-card menu-literasi" onClick={() => go('literasi')}>
          <span className="menu-icon" aria-hidden="true">🧠</span>
          <span className="menu-copy">
            <span className="menu-title">Cerita Pola</span>
            <span className="menu-description">Pecahkan masalah dari kehidupan sehari-hari</span>
          </span>
          <span className="menu-arrow" aria-hidden="true">›</span>
        </button>
      </nav>
      <button className="ghost logout-button" onClick={keluar}>Ganti nama</button>
    </section>
  )
}

function Materi({ back }) {
  const [i, setI] = useState(0)
  const m = materi[i]
  const [n, setN] = useState(m.n)
  const pindah = (j) => { setI(j); setN(materi[j].n) }
  return (
    <section className="card">
      <h2>{m.judul}</h2>
      <Pattern3D type={m.type} n={n} />
      <label className="slider">Gambar ke-{n}
        <input type="range" min="1" max="8" value={n} onChange={(e) => setN(+e.target.value)} />
      </label>
      <p className="rumus">{m.rumus(n)}</p>
      <p>{m.teks}</p>
      {i === materi.length - 1 && <p className="material-finish">Kamu sudah paham dasarnya! Saatnya berlatih.</p>}
      <nav className="row">
        <button className="ghost" disabled={i === 0} onClick={() => pindah(i - 1)}>← Ulangi</button>
        {i < materi.length - 1 ? <button onClick={() => pindah(i + 1)}>Lanjut →</button> : <button onClick={back}>Kembali ke beranda</button>}
      </nav>
    </section>
  )
}

function Latihan({ kode, daftar, back }) {
  const [i, setI] = useState(0)
  const [tandai, setTandai] = useState({})
  const [jwb, setJwb] = useState('')
  const [hint, setHint] = useState(0)
  const [status, setStatus] = useState(null) // null | 'salah' | 'benar'
  const [alasan, setAlasan] = useState('')
  const [evaluasi, setEvaluasi] = useState('')
  const [saveError, setSaveError] = useState('')
  const streak = useRef(0)
  const s = daftar[i]
  if (!s) return <section className="card"><h2>Kerja bagus! Kamu sudah menyelesaikan semua soal.</h2><button onClick={back}>Kembali ke beranda</button></section>

  const cek = async () => {
    const benar = Number(jwb) === s.jawab && (!s.evaluasi || evaluasi === s.evaluasi.jawab)
    setStatus(benar ? 'benar' : 'salah')
    if (benar) {
      const nextStreak = streak.current + 1
      streak.current = nextStreak
      imut.benar(nextStreak)
      if (nextStreak === 3) imut.bintang()
      try {
        await saveAttempt({ kode, soal_id: s.id, skor: Math.max(1, 3 - hint), hint_dipakai: hint })
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Skor gagal disimpan.')
      }
    } else {
      streak.current = 0
      imut.salah()
    }
  }
  const lanjut = () => {
    setI(i + 1)
    setJwb('')
    setHint(0)
    setStatus(null)
    setAlasan('')
    setEvaluasi('')
    setSaveError('')
    setTandai({})
  }

  return (
    <>
      <div className="question-progress" aria-label={`Soal ${i + 1} dari ${daftar.length}`}>
        <div className="progress-label">Soal {i + 1} dari {daftar.length}</div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={daftar.length}
          aria-valuenow={i + 1}
          aria-label="Progres soal"
        >
          <span style={{ width: `${((i + 1) / daftar.length) * 100}%` }} />
        </div>
      </div>
      <section className="card question-card">
        <div className="question-tools">
          <small className="question-indicator">{s.indikator || 'Latihan'}</small>
          <AudioToggle />
        </div>
        <Pattern3D type={s.visual.type} n={s.visual.n} />
        <div className="konteks">
          {s.konteks.map((k, idx) => (
            <p key={idx} className={tandai[idx] ? 'mark' : ''} onClick={() => setTandai({ ...tandai, [idx]: !tandai[idx] })}>{k}</p>
          ))}
          <small className="mark-instruction">Tandai informasi pentingnya dulu, ya.</small>
        </div>
        <h3>{s.tanya}</h3>
        <input type="number" inputMode="numeric" value={jwb} onChange={(e) => setJwb(e.target.value)} disabled={status === 'benar'} placeholder="Jawabanmu" />
        {s.evaluasi && (
          <div className="evaluation">
            <p>{s.evaluasi.tanya}</p>
            <div className="row">
              {['ya', 'tidak'].map((pilihan) => (
                <button
                  key={pilihan}
                  type="button"
                  className={evaluasi === pilihan ? '' : 'ghost'}
                  aria-pressed={evaluasi === pilihan}
                  disabled={status === 'benar'}
                  onClick={() => setEvaluasi(pilihan)}
                >
                  {pilihan === 'ya' ? 'Ya' : 'Tidak'}
                </button>
              ))}
            </div>
          </div>
        )}
        {status !== 'benar' && <button disabled={jwb === '' || (s.evaluasi && evaluasi === '')} onClick={cek}>Cek Jawabanku</button>}
        {status === 'salah' && <p className="warn">Belum tepat, tidak apa-apa! Coba lagi atau minta petunjuk.</p>}
        {saveError && <p className="warn">{saveError} Skor tetap tersimpan di perangkat.</p>}
        {status !== 'benar' && hint < s.hints.length && (
          <>
            <p className="hint-prompt">Butuh petunjuk? Aku bantu sedikit-sedikit.</p>
            <button className="ghost hint-button" onClick={() => setHint(hint + 1)}>💡 Petunjuk ({hint}/{s.hints.length})</button>
          </>
        )}
        {s.hints.slice(0, hint).map((h, k) => <p key={k} className="hint">💡 {h}</p>)}
        {status === 'benar' && (
          <div className="ok">
            <div className="correct-heading">
              <span className="checkmark" aria-hidden="true">✓</span>
              <p>Mantap! Jawabanmu benar 🎉</p>
            </div>
            {streak.current >= 3 && <p className="streak-badge">⭐ {streak.current} jawaban benar beruntun!</p>}
            <p className="solution-title">Ini langkah penyelesaiannya:</p>
            <ol>{s.langkah.map((l, k) => <li key={k}>{l}</li>)}</ol>
            <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Kenapa menurutmu jawabannya masuk akal? (boleh dilewati)" />
            <button onClick={lanjut}>Lanjut →</button>
          </div>
        )}
        <button className="ghost back-button" onClick={back}>Kembali</button>
      </section>
    </>
  )
}

function AudioToggle() {
  const [muted, setMutedState] = useState(isMuted)
  const toggle = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    setMutedState(nextMuted)
  }

  return (
    <button className="ghost sound-toggle" type="button" onClick={toggle} aria-pressed={!muted} aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}>
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
