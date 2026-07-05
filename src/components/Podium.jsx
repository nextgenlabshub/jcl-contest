import { formatViews } from '../lib/format'
import { safeHref } from '../lib/validate'
import { scoreLabel } from '../lib/scoring'
import { MetricBreakdown } from './ui'

const STYLES = {
  1: {
    bar: 'bg-gold',
    medal: '🥇',
    order: 'order-2 sm:order-2',
    lift: 'sm:-mt-3',
    hero: true,
  },
  2: {
    bar: 'bg-silver',
    medal: '🥈',
    order: 'order-1 sm:order-1',
    lift: 'sm:mt-4',
    hero: false,
  },
  3: {
    bar: 'bg-bronze',
    medal: '🥉',
    order: 'order-3 sm:order-3',
    lift: 'sm:mt-4',
    hero: false,
  },
}

function Card({ entry, rank }) {
  const s = STYLES[rank]
  return (
    <div
      className={`${s.order} ${s.lift} flex flex-1 flex-col overflow-hidden rounded-2xl bg-paper ${
        s.hero
          ? 'border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]'
          : 'border border-line'
      }`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="flex flex-1 flex-col items-center p-5 text-center">
        <div className="flex w-full items-center justify-between">
          <span className="nums font-display text-3xl font-extrabold text-ink/15">
            {rank}
          </span>
          <span className="text-3xl">{s.medal}</span>
        </div>

        <p
          className="mt-2 max-w-full truncate text-lg font-bold text-ink"
          title={entry.username}
        >
          @{entry.username}
        </p>
        <p className="nums mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">
          {formatViews(entry.score)}
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-inksoft">
          {scoreLabel}
        </p>
        <MetricBreakdown entry={entry} className="mt-3 justify-center" />

        <div className="mt-5 w-full">
          <a
            href={safeHref(entry.threads_link)}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg bg-ink py-2 text-sm font-semibold text-paper transition hover:bg-flame"
          >
            Buka thread ↗
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Podium({ top }) {
  if (!top.length) return null
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {top.map((entry, i) => (
        <Card key={entry.id} entry={entry} rank={i + 1} />
      ))}
    </div>
  )
}
