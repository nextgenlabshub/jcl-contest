import { formatViews, timeAgo } from '../lib/format'
import { safeHref } from '../lib/validate'
import { scoreLabel } from '../lib/scoring'
import { MetricBreakdown } from './ui'

/** Baris kedudukan #4 ke bawah. `startRank` = kedudukan baris pertama. */
export default function LeaderboardTable({ rows, startRank }) {
  if (!rows.length) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs font-semibold uppercase tracking-[0.12em] text-inksoft">
          <tr>
            <th className="px-4 py-3 sm:px-5">#</th>
            <th className="px-4 py-3 sm:px-5">Peserta</th>
            <th className="px-4 py-3 text-right sm:px-5">{scoreLabel}</th>
            <th className="hidden px-5 py-3 md:table-cell">Kemas kini</th>
            <th className="px-4 py-3 text-right sm:px-5">Thread</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((entry, i) => (
            <tr key={entry.id} className="transition hover:bg-cream/60">
              <td className="nums px-4 py-3 font-display text-base font-extrabold text-ink/40 sm:px-5">
                {startRank + i}
              </td>
              <td className="px-4 py-3 sm:px-5">
                <a
                  href={safeHref(entry.threads_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline-offset-2 hover:text-flame hover:underline"
                >
                  @{entry.username}
                </a>
                <MetricBreakdown entry={entry} className="mt-1" />
              </td>
              <td className="nums px-4 py-3 text-right font-display font-bold text-ink sm:px-5">
                {formatViews(entry.score)}
              </td>
              <td className="hidden px-5 py-3 text-inksoft md:table-cell">
                {timeAgo(entry.updated_at)}
              </td>
              <td className="px-4 py-3 text-right sm:px-5">
                <a
                  href={safeHref(entry.threads_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border-2 border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink hover:bg-cream"
                >
                  Buka ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
