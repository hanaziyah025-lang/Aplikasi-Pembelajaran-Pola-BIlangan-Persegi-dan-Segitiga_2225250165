import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null

function readLocalAttempts() {
  return JSON.parse(localStorage.getItem('attempts') || '[]')
}

async function getUserId() {
  const { data: { session }, error: sessionError } = await sb.auth.getSession()
  if (sessionError) throw new Error(`Gagal memeriksa sesi Supabase: ${sessionError.message}`)
  if (session) return session.user.id

  const { data, error } = await sb.auth.signInAnonymously()
  if (error) throw new Error(`Gagal membuat sesi Supabase anonim: ${error.message}`)
  if (!data.user) throw new Error('Supabase tidak mengembalikan pengguna untuk sesi anonim.')
  return data.user.id
}

export async function saveAttempt(rec) {
  const attempt = { id: crypto.randomUUID(), ...rec, at: new Date().toISOString() }
  const all = readLocalAttempts()
  all.push(attempt)
  localStorage.setItem('attempts', JSON.stringify(all))
  if (!sb) return

  const userId = await getUserId()
  const { error } = await sb.from('attempts').insert({
    id: attempt.id,
    user_id: userId,
    kode: rec.kode,
    soal_id: rec.soal_id,
    skor: rec.skor,
    hint_dipakai: rec.hint_dipakai,
  })
  if (error) throw new Error(`Gagal menyinkronkan skor ke Supabase: ${error.message}`)
}

export const loadAttempts = (kode) =>
  readLocalAttempts().filter((attempt) => attempt.kode === kode)

export async function loadStudentAttempts(kode) {
  const localAttempts = loadAttempts(kode)
  if (!sb) return localAttempts

  const userId = await getUserId()
  const { data, error } = await sb
    .from('attempts')
    .select('id, kode, soal_id, skor, hint_dipakai, created_at')
    .eq('user_id', userId)
    .eq('kode', kode)
  if (error) throw new Error(`Gagal memuat skor dari Supabase: ${error.message}`)

  const attempts = new Map()
  for (const attempt of localAttempts) {
    attempts.set(attempt.id || Symbol(), attempt)
  }
  for (const attempt of data) {
    attempts.set(attempt.id, attempt)
  }
  return [...attempts.values()]
}
