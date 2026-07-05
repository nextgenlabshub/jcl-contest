// Sanitasi & pengesahan input di pelayar.
// NOTA: guard sebenar ada di database (CHECK constraint dalam schema.sql) —
// ini lapisan pertama untuk UX & mengurangkan input buruk.

export const LIMITS = {
  usernameMax: 30,
  linkMax: 500,
  countMax: 1_000_000_000, // 1 bilion — jauh melebihi realiti, elak nombor mengarut
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

/** Untuk render href dengan selamat — elak javascript:/data: URL. */
export function safeHref(url) {
  return /^https?:\/\//i.test(String(url ?? '')) ? url : '#'
}
