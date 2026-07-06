import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  adminSignIn,
  adminSignOut,
  getAdminSession,
  onAdminAuthChange,
  adminListEntries,
  adminUpdateViews,
  adminDeleteEntry,
} from '../lib/admin'
import { fetchContestState, setContestFinalized } from '../lib/api'
import { formatViews, timeAgo } from '../lib/format'
import { safeHref } from '../lib/validate'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-flame px-5 py-2.5 font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0'
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-paper px-4 py-2.5 font-semibold text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60'

function Notice({ children }) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-md rounded-2xl border-2 border-ink bg-cream/60 p-6 text-center shadow-[5px_5px_0_0_var(--color-ink)]">
        {children}
      </div>
    </div>
  )
}

// ---- Skrin log masuk ----------------------------------------
function LoginScreen({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = await adminSignIn(email, password)
      onSignedIn(session)
    } catch (err) {
      setError(err?.message || 'Log masuk gagal.')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border-2 border-ink/15 bg-paper px-4 py-3 text-ink placeholder-inksoft/70 outline-none transition focus:border-ink'

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border-2 border-ink bg-cream/60 p-6 shadow-[5px_5px_0_0_var(--color-ink)]"
      >
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-flame font-display text-lg font-extrabold text-paper shadow-[2px_2px_0_0_var(--color-ink)]">
            N
          </span>
          <div>
            <p className="font-display text-lg font-extrabold leading-none">
              Admin Dashboard
            </p>
            <p className="mt-0.5 text-xs text-inksoft">NextGen Labs</p>
          </div>
        </div>

        <label className="mb-1 block text-sm font-semibold text-ink">Email</label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="admin@contoh.com"
          required
        />

        <label className="mb-1 mt-4 block text-sm font-semibold text-ink">
          Kata Laluan
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
          placeholder="••••••••"
          required
        />

        {error && (
          <p className="mt-4 rounded-lg border-2 border-flame/40 bg-flame/10 px-3 py-2 text-sm text-flamedark">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${btnPrimary} mt-5 w-full`}>
          {busy ? 'Log masuk…' : 'Log Masuk'}
        </button>

        <a
          href={window.location.pathname}
          className="mt-4 block text-center text-xs text-inksoft underline"
        >
          ← Kembali ke leaderboard
        </a>
      </form>
    </div>
  )
}

// ---- Satu baris peserta -------------------------------------
function EntryRow({ entry, rank, draft, onDraft, onSave, onDelete, saving }) {
  const dirty = draft !== '' && Number(draft) !== entry.views
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-3 text-center nums font-display font-bold text-ink/40">
        {rank}
      </td>
      <td className="px-3 py-3">
        <p className="font-semibold text-ink">@{entry.username}</p>
        <a
          href={safeHref(entry.threads_link)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-flame underline"
        >
          Buka thread ↗
        </a>
      </td>
      <td className="px-3 py-3 nums text-sm text-inksoft whitespace-nowrap">
        {entry.phone || '—'}
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={draft}
          onChange={(e) => onDraft(entry.id, e.target.value)}
          className={`w-28 rounded-lg border-2 bg-paper px-3 py-2 text-right nums text-ink outline-none transition focus:border-ink ${
            dirty ? 'border-flame' : 'border-ink/15'
          }`}
        />
        <p className="mt-1 text-[11px] text-inksoft">
          asal: {formatViews(entry.views)} · {timeAgo(entry.updated_at)}
        </p>
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap">
        <button
          onClick={() => onSave(entry.id)}
          disabled={!dirty || saving}
          className="rounded-lg border-2 border-ink bg-flame px-3 py-1.5 text-sm font-semibold text-paper shadow-[2px_2px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Simpan
        </button>
        <button
          onClick={() => onDelete(entry)}
          disabled={saving}
          className="ml-2 rounded-lg border-2 border-ink/20 px-3 py-1.5 text-sm font-semibold text-inksoft transition hover:border-flame hover:text-flame disabled:opacity-40"
          title="Padam penyertaan"
        >
          Padam
        </button>
      </td>
    </tr>
  )
}

// ---- Dashboard utama ----------------------------------------
function Dashboard({ session, onSignOut }) {
  const [entries, setEntries] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [savingAll, setSavingAll] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [rows, state] = await Promise.all([
        adminListEntries(),
        fetchContestState().catch(() => null),
      ])
      setEntries(rows)
      // Selaraskan draf dengan nilai terkini dari server.
      setDrafts(Object.fromEntries(rows.map((r) => [r.id, String(r.views)])))
      setFinalized(Boolean(state?.finalized))
    } catch (err) {
      setError(err?.message || 'Gagal memuatkan data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setDraft = useCallback((id, value) => {
    setDrafts((d) => ({ ...d, [id]: value }))
  }, [])

  const dirtyIds = useMemo(
    () =>
      entries
        .filter((e) => drafts[e.id] !== '' && Number(drafts[e.id]) !== e.views)
        .map((e) => e.id),
    [entries, drafts],
  )

  async function saveOne(id) {
    const value = Math.max(0, Math.floor(Number(drafts[id]) || 0))
    setSavingId(id)
    setError('')
    try {
      await adminUpdateViews(id, value)
      setEntries((list) =>
        list.map((e) => (e.id === id ? { ...e, views: value } : e)),
      )
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan.')
    } finally {
      setSavingId(null)
    }
  }

  async function saveAll() {
    if (!dirtyIds.length) return
    setSavingAll(true)
    setError('')
    try {
      for (const id of dirtyIds) {
        const value = Math.max(0, Math.floor(Number(drafts[id]) || 0))
        await adminUpdateViews(id, value)
        setEntries((list) =>
          list.map((e) => (e.id === id ? { ...e, views: value } : e)),
        )
      }
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan sebahagian.')
    } finally {
      setSavingAll(false)
    }
  }

  async function removeEntry(entry) {
    if (!window.confirm(`Padam penyertaan @${entry.username}?`)) return
    setSavingId(entry.id)
    setError('')
    try {
      await adminDeleteEntry(entry.id)
      setEntries((list) => list.filter((e) => e.id !== entry.id))
    } catch (err) {
      setError(err?.message || 'Gagal memadam.')
    } finally {
      setSavingId(null)
    }
  }

  async function finalize() {
    if (!window.confirm('Sahkan keputusan sebagai RASMI? Tindakan ini menanda pemenang muktamad.')) return
    setFinalizing(true)
    setError('')
    try {
      await setContestFinalized(true)
      setFinalized(true)
    } catch (err) {
      setError(err?.message || 'Gagal mengesahkan.')
    } finally {
      setFinalizing(false)
    }
  }

  const busy = savingId != null || savingAll

  return (
    <div className="min-h-screen">
      <div className="border-b border-line bg-cream/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-flame font-display text-lg font-extrabold text-paper shadow-[2px_2px_0_0_var(--color-ink)]">
              N
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-inksoft sm:inline">
              {session?.user?.email}
            </span>
            <button onClick={onSignOut} className={btnGhost}>
              Log Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Kemas Kini Views
            </h1>
            <p className="mt-1 text-sm text-inksoft">
              {entries.length} penyertaan · ubah nombor views, kemudian Simpan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={load} disabled={busy} className={btnGhost}>
              ↻ Segarkan
            </button>
            <button
              onClick={saveAll}
              disabled={!dirtyIds.length || busy}
              className={btnPrimary}
            >
              {savingAll
                ? 'Menyimpan…'
                : `Simpan Semua${dirtyIds.length ? ` (${dirtyIds.length})` : ''}`}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border-2 border-flame/40 bg-flame/10 p-4 text-flamedark">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-inksoft">Memuatkan…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-line bg-paper py-16 text-center text-inksoft">
            Belum ada penyertaan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--color-ink)]">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b-2 border-ink bg-cream/50 text-xs font-bold uppercase tracking-wider text-inksoft">
                  <th className="px-3 py-3 text-center">#</th>
                  <th className="px-3 py-3">Peserta</th>
                  <th className="px-3 py-3">No Telefon</th>
                  <th className="px-3 py-3">Views</th>
                  <th className="px-3 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    rank={i + 1}
                    draft={drafts[entry.id] ?? ''}
                    onDraft={setDraft}
                    onSave={saveOne}
                    onDelete={removeEntry}
                    saving={busy}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sahkan keputusan rasmi */}
        <div className="mt-8 rounded-2xl border-2 border-ink bg-cream/60 p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-ink">Status Keputusan</p>
              <p className="mt-0.5 text-sm text-inksoft">
                {finalized
                  ? 'Keputusan telah disahkan RASMI.'
                  : 'Belum disahkan. Sahkan hanya selepas semua views betul.'}
              </p>
            </div>
            {finalized ? (
              <span className="rounded-full border-2 border-ink bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-paper">
                ● Disahkan
              </span>
            ) : (
              <button
                onClick={finalize}
                disabled={finalizing}
                className={btnPrimary}
              >
                {finalizing ? 'Mengesahkan…' : '✓ Sahkan Rasmi'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Root: pilih login atau dashboard -----------------------
export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      return
    }
    getAdminSession().then((s) => {
      setSession(s)
      setReady(true)
    })
    const unsub = onAdminAuthChange((s) => setSession(s))
    return unsub
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <Notice>
        <p className="font-display font-bold text-ink">Supabase belum disambung</p>
        <p className="mt-2 text-sm text-inksoft">
          Admin dashboard perlukan sambungan Supabase. Isi{' '}
          <code className="rounded bg-ink/10 px-1">VITE_SUPABASE_URL</code> &{' '}
          <code className="rounded bg-ink/10 px-1">VITE_SUPABASE_ANON_KEY</code>{' '}
          (lihat README.md).
        </p>
      </Notice>
    )
  }

  if (!ready) {
    return <Notice>Memuatkan…</Notice>
  }

  if (!session) {
    return <LoginScreen onSignedIn={setSession} />
  }

  return (
    <Dashboard
      session={session}
      onSignOut={async () => {
        await adminSignOut()
        setSession(null)
      }}
    />
  )
}
