import { supabase } from './supabase'
import { contest } from '../contest.config'
import {
  cleanUsername,
  isValidUsername,
  cleanThreadsUrl,
  cleanCount,
  cleanPhone,
  isValidPhone,
} from './validate'

const TABLE = 'threads_leaderboard'
const STATE_TABLE = 'contest_state'

// Kolum awam sahaja — SENGAJA tanpa `phone` (data peribadi). Anon tiada
// keizinan SELECT pada kolum phone (lihat schema.sql), jadi jangan guna '*'.
const PUBLIC_COLS = [
  'id',
  'created_at',
  'username',
  'threads_link',
  'updated_at',
  ...contest.metrics.map((m) => m.key),
].join(',')

/** Baca status peraduan (satu baris, id = 1). */
export async function fetchContestState() {
  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Tandakan keputusan sebagai RASMI (guna oleh pentadbir sahaja). */
export async function setContestFinalized(finalized) {
  const { data, error } = await supabase
    .from(STATE_TABLE)
    .update({ finalized, finalized_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/** Ambil semua penyertaan. Skor & susunan dikira di app (lihat lib/scoring). */
export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PUBLIC_COLS)
    .order('updated_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Insert atau update penyertaan.
 * Konflik pada `threads_link` -> baris sedia ada dikemas kini (upsert).
 */
export async function submitEntry({ username, threads_link, phone, counts }) {
  // Sanitasi semula di sini (defense-in-depth) walaupun borang sudah sahkan.
  const cleanName = cleanUsername(username)
  const cleanLink = cleanThreadsUrl(threads_link)
  const cleanTel = cleanPhone(phone)

  if (!isValidUsername(cleanName)) throw new Error('Username tidak sah.')
  if (!cleanLink) throw new Error('Pautan thread tidak sah.')
  if (!isValidPhone(cleanTel)) throw new Error('No telefon tidak sah.')

  const payload = {
    username: cleanName,
    threads_link: cleanLink,
    phone: cleanTel,
    updated_at: new Date().toISOString(),
  }
  for (const m of contest.metrics) {
    const value = cleanCount(counts?.[m.key])
    if (value === null) throw new Error(`Nilai ${m.label} tidak sah.`)
    payload[m.key] = value
  }

  // Jangan pulangkan '*' — anon tiada SELECT pada kolum phone.
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'threads_link' })
    .select(PUBLIC_COLS)

  if (error) throw error
  return data?.[0]
}
