import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import {
  fetchLeaderboard,
  fetchContestState,
  setContestFinalized,
} from './lib/api'
import { contest } from './contest.config'
import { DEMO_ENTRIES } from './lib/demo'
import { isEnded, getWinners } from './lib/contest'
import { rankEntries } from './lib/scoring'
import Podium from './components/Podium'
import LeaderboardTable from './components/LeaderboardTable'
import SubmissionForm from './components/SubmissionForm'
import HowToJoin from './components/HowToJoin'
import Tips from './components/Tips'
import Prizes from './components/Prizes'
import Countdown from './components/Countdown'
import Results from './components/Results'
import { SectionHead } from './components/ui'

// Adakah pelawat seorang pentadbir? Buka guna ?admin=KUNCI pada URL.
function checkAdmin() {
  const param = new URLSearchParams(window.location.search).get('admin')
  if (param == null) return false
  return contest.adminKey ? param === contest.adminKey : true
}

function DemoNote() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gold/60 bg-gold/10 p-4 text-sm text-ink">
      <p className="font-display font-bold">Mod Demo — data contoh</p>
      <p className="mt-1 text-inksoft">
        Angka & peserta di bawah adalah contoh. Sambung Supabase (lihat{' '}
        <code className="rounded bg-ink/10 px-1">README.md</code>) untuk data
        sebenar peserta anda.
      </p>
    </div>
  )
}

export default function App() {
  const configured = isSupabaseConfigured
  const isAdmin = useMemo(checkAdmin, [])

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  // Auto-tukar ke mod keputusan bila masa tamat. Semakan berkala kasar —
  // setEnded(false) berulang tidak re-render (React bailout); ia flip ke
  // true sekali sahaja tepat selepas tamat. Selamat untuk kiraan > 24 hari.
  const [ended, setEnded] = useState(() => isEnded(contest.endsAt, Date.now()))
  useEffect(() => {
    if (!contest.endsAt) return
    const check = () => setEnded(isEnded(contest.endsAt, Date.now()))
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(async () => {
    if (!configured) {
      setEntries(DEMO_ENTRIES)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [rows, state] = await Promise.all([
        fetchLeaderboard(),
        fetchContestState().catch(() => null),
      ])
      setEntries(rows)
      setFinalized(Boolean(state?.finalized))
    } catch (err) {
      setError(err?.message || 'Gagal memuatkan leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [configured])

  useEffect(() => {
    load()
  }, [load])

  async function handleFinalize() {
    setFinalizing(true)
    try {
      if (configured) await setContestFinalized(true)
      setFinalized(true)
    } catch (err) {
      setError(err?.message || 'Gagal mengesahkan keputusan.')
    } finally {
      setFinalizing(false)
    }
  }

  // Kira skor & susun (seri: yang capai dahulu). Dilakukan di app.
  const ranked = useMemo(() => rankEntries(entries), [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '')
    if (!q) return ranked
    return ranked.filter((e) => e.username.toLowerCase().includes(q))
  }, [ranked, query])

  const searching = query.trim().length > 0
  const top3 = searching ? [] : filtered.slice(0, 3)
  const rest = searching ? filtered : filtered.slice(3)
  const winners = getWinners(ranked, contest.winnersCount || 4, contest.prizes)

  const hasData = configured ? entries.length > 0 : true

  const btnPrimary =
    'inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-flame px-5 py-2.5 font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]'
  const btnGhost =
    'inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-paper px-4 py-2.5 font-semibold text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]'
  const btnLocked =
    'inline-flex items-center gap-2 rounded-xl border-2 border-ink/20 bg-ink/5 px-5 py-2.5 font-semibold text-inksoft cursor-not-allowed'

  return (
    <div className="min-h-screen">
      {/* Bar jenama */}
      <div className="border-b border-line bg-cream/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-flame font-display text-lg font-extrabold text-paper shadow-[2px_2px_0_0_var(--color-ink)]">
              N
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              NextGen Labs
            </span>
            <span className="text-sm text-inksoft">/ marketing</span>
          </div>
          <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-inksoft sm:inline">
            {ended ? 'Keputusan' : 'Peraduan Threads'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-flame">
            <span className="relative flex h-2 w-2">
              {!ended && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame opacity-70" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
            </span>
            {ended ? 'Peraduan Tamat' : 'Peraduan Mikroinfluencer'}
          </span>

          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            {contest.title}
          </h1>

          <svg
            className="mx-auto mt-2 h-3 w-56 text-flame"
            viewBox="0 0 240 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 8c40-5 92-6 140-4 34 1 62 3 94 5"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>

          <p className="mx-auto mt-5 max-w-lg text-lg text-inksoft">
            {contest.subtitle}
          </p>

          {contest.endsAt && (
            <div className="mt-5">
              <Countdown endsAt={contest.endsAt} />
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {ended ? (
              <span className={btnLocked}>🔒 Peraduan Telah Tamat</span>
            ) : (
              <button onClick={() => setShowForm(true)} className={btnPrimary}>
                Hantar / Kemas Kini Views
              </button>
            )}
            <button onClick={load} className={btnGhost}>
              ↻ Segarkan
            </button>
          </div>
        </header>

        <div className="mb-10 space-y-10">
          <HowToJoin mainPostUrl={contest.mainPostUrl} />
          <Tips tips={contest.tips} />
          <Prizes prizes={contest.prizes} />
        </div>

        {/* Skrin keputusan — muncul automatik bila peraduan tamat */}
        {ended && hasData && (
          <div className="mb-10">
            <Results
              winners={winners}
              finalized={finalized}
              isAdmin={isAdmin}
              finalizing={finalizing}
              onFinalize={handleFinalize}
            />
          </div>
        )}

        <SectionHead
          eyebrow={ended ? 'Kedudukan Akhir' : 'Ranking Langsung'}
          title="Leaderboard"
          right={
            hasData && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari username…"
                className="w-44 rounded-lg border-2 border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder-inksoft/70 outline-none transition focus:border-ink"
              />
            )
          }
        />

        {!configured && (
          <div className="mt-5">
            <DemoNote />
          </div>
        )}

        <div className="mt-5">
          {loading && (
            <p className="py-16 text-center text-inksoft">Memuatkan…</p>
          )}

          {error && !loading && (
            <div className="rounded-2xl border-2 border-flame/40 bg-flame/10 p-4 text-center text-flamedark">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-line bg-paper py-16 text-center text-inksoft">
              {searching
                ? 'Tiada peserta sepadan.'
                : 'Belum ada penyertaan. Jadilah yang pertama 🚀'}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-8">
              {top3.length > 0 && <Podium top={top3} />}
              <LeaderboardTable
                rows={rest}
                startRank={searching ? 1 : top3.length + 1}
              />
            </div>
          )}
        </div>

        <footer className="mt-14 border-t border-line pt-6 text-center text-xs text-inksoft">
          Kedudukan berdasarkan input peserta. Buka thread setiap peserta untuk
          menyemak · dikuasakan NextGen Labs
        </footer>
      </div>

      {showForm && !ended && (
        <SubmissionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            load()
          }}
        />
      )}
    </div>
  )
}
