import { contest } from '../contest.config'
import { formatViews } from '../lib/format'

// Pecahan metrik: ❤️ 8.2k · 💬 1.4k · 🔁 980 · 🗨️ 430
// (Tersembunyi bila satu metrik sahaja — nombor utama sudah wakili ia.)
export function MetricBreakdown({ entry, className = '' }) {
  if (contest.metrics.length <= 1) return null
  return (
    <div
      className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-inksoft ${className}`}
    >
      {contest.metrics.map((m) => (
        <span key={m.key} className="nums whitespace-nowrap">
          {m.emoji} {formatViews(entry[m.key] ?? 0)}
        </span>
      ))}
    </div>
  )
}

// Tajuk seksyen konsisten: kotak flame kecil + eyebrow + tajuk, kiri-jajar.
export function SectionHead({ eyebrow, title, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-inksoft">
            <span className="h-3 w-3 rounded-[3px] border border-ink bg-flame" />
            {eyebrow}
          </span>
        )}
        <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {right}
    </div>
  )
}
