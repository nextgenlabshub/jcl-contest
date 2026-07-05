// Sanitasi & pengesahan input di pelayar.
// NOTA: guard sebenar ada di database (CHECK constraint dalam schema.sql) —
// ini lapisan pertama untuk UX & mengurangkan input buruk.

export const LIMITS = {
  usernameMax: 30,
  linkMax: 500,
  countMax: 1_000_000_000, // 1 bilion — jauh melebihi realiti, elak nombor mengarut
  phoneMax: 15,
}

// Username Threads: huruf, nombor, titik, garis bawah sahaja.
const USERNAME_RE = /^[A-Za-z0-9._]{1,30}$/
const THREADS_HOSTS = new Set([
  'threads.net',
  'www.threads.net',
  'threads.com',
  'www.threads.com',
])

/** Buang '@' & ruang, hadkan panjang. */
export function cleanUsername(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/^@+/, '')
    .slice(0, LIMITS.usernameMax)
}

export function isValidUsername(u) {
  return USERNAME_RE.test(u)
}

/**
 * Pulangkan URL Threads yang selamat & dinormalkan (https, tanpa query/hash),
 * atau null jika tidak sah. Menghalang skema berbahaya (javascript:, data:)
 * dan hos selain threads.
 */
export function cleanThreadsUrl(raw) {
  const s = String(raw ?? '').trim()
  if (!s || s.length > LIMITS.linkMax) return null

  let url
  try {
    url = new URL(s)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!THREADS_HOSTS.has(url.hostname.toLowerCase())) return null

  // Paksa https, kekalkan path sahaja (buang query/hash tracking).
  const host = url.hostname.toLowerCase()
  const path = url.pathname.replace(/\/+$/, '')
  return `https://${host}${path}`.slice(0, LIMITS.linkMax)
}

/**
 * Pulangkan integer count yang sah (kosong = 0), atau null jika tidak sah.
 * Digunakan untuk nilai metrik (cth views).
 */
export function cleanCount(raw) {
  if (raw === '' || raw === null || raw === undefined) return 0
  const n = Number(raw)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null
  if (n < 0 || n > LIMITS.countMax) return null
  return n
}

// No telefon format tempatan: mula dengan '0', diikuti 7–14 digit.
// Longgar dengan sengaja (sesetengah nombor lebih panjang) — yang penting
// TANPA '+60'. cleanPhone menukar +60/60 kembali kepada '0…'.
const PHONE_RE = /^0[0-9]{7,14}$/

/**
 * Buang semua bukan-digit (ruang, '-', kurungan, '+'). Jika pengguna taip
 * awalan antarabangsa (+60 / 60), tukar kembali kepada format tempatan (0…).
 */
export function cleanPhone(raw) {
  let s = String(raw ?? '').replace(/\D+/g, '')
  if (s.startsWith('60')) s = '0' + s.slice(2)
  return s.slice(0, LIMITS.phoneMax)
}

export function isValidPhone(p) {
  return PHONE_RE.test(p)
}

/** Untuk render href dengan selamat — elak javascript:/data: URL. */
export function safeHref(url) {
  return /^https?:\/\//i.test(String(url ?? '')) ? url : '#'
}
