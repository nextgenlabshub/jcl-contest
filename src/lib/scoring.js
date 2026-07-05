import { contest } from '../contest.config'

// Bila hanya satu metrik (cth views sahaja), papar nama metrik itu terus
// dan sembunyikan pecahan yang berulang. Bila banyak, papar "Skor".
export const singleMetric =
  contest.metrics.length === 1 ? contest.metrics[0] : null
export const scoreLabel = singleMetric ? singleMetric.label : 'Skor'

/** Skor gabungan = Σ (nilai metrik × weight). */
export function computeScore(counts) {
  return contest.metrics.reduce(
    (sum, m) => sum + (Number(counts?.[m.key]) || 0) * m.weight,
    0,
  )
}

/**
 * Kira skor & susun. Seri dimenangi yang capai dahulu (updated_at paling awal).
 * Pulangkan salinan baharu dengan medan `score` ditambah pada setiap baris.
 */
export function rankEntries(entries) {
  return [...entries]
    .map((e) => ({ ...e, score: computeScore(e) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    )
}
