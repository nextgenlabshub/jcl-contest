// Logik peraduan berpusat: fasa (live/tamat) & pemenang.

/** Adakah peraduan sudah tamat berdasarkan `endsAt` dan masa `nowMs`. */
export function isEnded(endsAt, nowMs) {
  if (!endsAt) return false
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(end)) return false
  return nowMs >= end
}

/**
 * Ambil `count` teratas sebagai pemenang, dan padankan dengan hadiah.
 * Kedudukan #4 (jika hadiah cuma 3 slot) kongsi hadiah slot terakhir —
 * bertepatan dengan "Tempat Ke-3 & Ke-4".
 *
 * NOTA: `entries` dijangka sudah disusun ikut skor menurun oleh
 * `rankEntries()` (lib/scoring) — seri dimenangi yang capai dahulu.
 */
export function getWinners(entries, count, prizes = []) {
  return entries.slice(0, count).map((entry, i) => {
    const rank = i + 1
    const prizeIdx = Math.min(rank, prizes.length) - 1
    return { ...entry, rank, prize: prizes[prizeIdx] ?? null }
  })
}
