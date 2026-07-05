import { SectionHead } from './ui'
import { formatViews } from '../lib/format'
import { safeHref } from '../lib/validate'
import { scoreLabel } from '../lib/scoring'

function ThreadLink({ entry, dark }) {
  return (
    <a
      href={safeHref(entry.threads_link)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        dark
          ? 'rounded-lg border-2 border-paper/30 px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-paper/10'
          : 'rounded-lg border-2 border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink'
      }
    >
      Buka Thread ↗
    </a>
  )
}

export default function Results({
  winners,
  finalized,
  isAdmin,
  finalizing,
  onFinalize,
}) {
  if (!winners.length) return null

  const champ = winners[0]
  const rest = winners.slice(1)

  return (
    <section className="rounded-2xl border-2 border-ink bg-cream/60 p-5 shadow-[5px_5px_0_0_var(--color-ink)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHead
          eyebrow="Keputusan"
          title={finalized ? 'Pemenang Rasmi 🏆' : 'Keputusan Sementara'}
        />
        <span
          className={`rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            finalized
              ? 'border-ink bg-ink text-paper'
              : 'border-gold bg-gold/15 text-gold'
          }`}
        >
          {finalized ? '● Disahkan' : '⏳ Menunggu sahkan'}
        </span>
      </div>

      <p className="mt-2 text-sm text-inksoft">
        {finalized
          ? 'Keputusan telah disahkan oleh penganjur — engagement setiap pemenang disemak melalui pautan thread.'
          : 'Peraduan telah tamat & leaderboard dikunci. Penganjur sedang menyemak engagement pemenang melalui pautan thread sebelum keputusan dimuktamadkan.'}
      </p>

      {/* Juara */}
      <div className="mt-5 overflow-hidden rounded-xl border-2 border-ink bg-ink text-paper">
        <div className="h-1.5 w-full bg-gold" />
        <div className="flex flex-wrap items-center gap-4 p-5">
          <span className="text-4xl">🥇</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {champ.prize?.label || 'Juara'}
            </p>
            <p className="truncate font-display text-2xl font-extrabold">
              @{champ.username}
            </p>
            {champ.prize?.reward && (
              <p className="mt-0.5 text-sm text-paper/70">{champ.prize.reward}</p>
            )}
          </div>
          <div className="text-right">
            <p className="nums font-display text-3xl font-extrabold">
              {formatViews(champ.score)}
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-paper/60">
              {scoreLabel}
            </p>
          </div>
          <ThreadLink entry={champ} dark />
        </div>
      </div>

      {/* Naib & selebihnya */}
      <div className="mt-3 space-y-3">
        {rest.map((w) => (
          <div
            key={w.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper p-4"
          >
            <span className="nums font-display text-2xl font-extrabold text-ink/30">
              {w.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-inksoft">
                {w.prize?.label || `Tempat Ke-${w.rank}`}
              </p>
              <p className="truncate font-semibold text-ink">@{w.username}</p>
              {w.prize?.reward && (
                <p className="truncate text-xs text-inksoft">{w.prize.reward}</p>
              )}
            </div>
            <div className="text-right">
              <p className="nums font-display text-lg font-bold text-ink">
                {formatViews(w.score)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-inksoft">
                {scoreLabel}
              </p>
            </div>
            <ThreadLink entry={w} />
          </div>
        ))}
      </div>

      {isAdmin && !finalized && (
        <div className="mt-5 border-t border-line pt-4">
          <button
            onClick={onFinalize}
            disabled={finalizing}
            className="w-full rounded-xl border-2 border-ink bg-flame py-3 font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            {finalizing ? 'Mengesahkan…' : '✓ Sahkan Rasmi (Pentadbir)'}
          </button>
          <p className="mt-2 text-center text-xs text-inksoft">
            Tekan hanya selepas semak Top {winners.length} melalui pautan thread
            masing-masing.
          </p>
        </div>
      )}
    </section>
  )
}
