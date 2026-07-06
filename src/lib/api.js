import { supabase } from './supabase'
import { contest } from '../contest.config'
import {
  cleanUsername,
  isValidUsername,
  cleanThreadsUrl,
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
 * Insert atau update penyertaan (username, pautan, no telefon SAHAJA).
 * `views` TIDAK dihantar dari sini — hanya admin set views (Admin Dashboard).
 * Konflik pada `threads_link` -> username & phone dikemas kini (upsert),
 * views dibiarkan seperti sedia ada.
 */
export async function submitEntry({ username, threads_link, phone }) {
  // Sanitasi semula di sini (defense-in-depth) walaupun borang sudah sahkan.
  const cleanName = cleanUsername(username)
  const cleanLink = cleanThreadsUrl(threads_link)
  const cleanTel = cleanPhone(phone)

  if (!isValidUsername(cleanName)) throw new Error('Username tidak sah.')
  if (!cleanLink) throw new Error('Pautan thread tidak sah.')
  if (!isValidPhone(cleanTel)) throw new Error('No telefon tidak sah.')

  // Hantar melalui fungsi pelayan (security definer). Ia buat upsert bagi
  // pihak peserta — jadi kolum `phone` kekal PRIVASI (anon tiada keizinan
  // tulis/baca terus pada jadual), dan upsert tidak memerlukan SELECT penuh.
  const { error } = await supabase.rpc('submit_entry', {
    p_username: cleanName,
    p_threads_link: cleanLink,
    p_phone: cleanTel,
  })

  if (error) throw error
}
