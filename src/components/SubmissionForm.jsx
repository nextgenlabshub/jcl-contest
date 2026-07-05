import { useEffect, useState } from 'react'
import { submitEntry } from '../lib/api'
import { contest } from '../contest.config'
import { computeScore, singleMetric } from '../lib/scoring'
import { formatViews } from '../lib/format'
import {
  cleanUsername,
  isValidUsername,
  cleanThreadsUrl,
  cleanCount,
  LIMITS,
} from '../lib/validate'

const emptyForm = () => ({
  username: '',
  threads_link: '',
  ...Object.fromEntries(contest.metrics.map((m) => [m.key, ''])),
})

export default function SubmissionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !submitting && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const liveScore = computeScore(form)

  function validate() {
    const e = {}

    const username = cleanUsername(form.username)
    if (!username) e.username = 'Wajib diisi.'
    else if (!isValidUsername(username))
      e.username = 'Guna huruf, nombor, titik (.) dan garis bawah (_) sahaja.'

    if (!form.threads_link.trim()) {
      e.threads_link = 'Wajib diisi.'
    } else if (!cleanThreadsUrl(form.threads_link)) {
      e.threads_link = 'Pautan mesti URL threads.net / threads.com yang sah.'
    }

    for (const m of contest.metrics) {
      const v = form[m.key]
      if (v !== '' && cleanCount(v) === null) {
        const n = Number(v)
        if (!Number.isInteger(n)) e[m.key] = 'Nombor bulat sahaja.'
        else if (n < 0) e[m.key] = 'Tidak boleh negatif.'
        else e[m.key] = 'Nombor terlalu besar.'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const counts = Object.fromEntries(
        contest.metrics.map((m) => [m.key, cleanCount(form[m.key])]),
      )
      await submitEntry({
        username: cleanUsername(form.username),
        threads_link: cleanThreadsUrl(form.threads_link),
        counts,
      })
      onSuccess?.()
    } catch (err) {
      setServerError(err?.message || 'Gagal menghantar. Cuba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const field =
    'w-full rounded-lg border-2 border-ink/15 bg-cream/50 px-3 py-2.5 text-ink placeholder-inksoft/70 outline-none transition focus:border-ink focus:bg-paper'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_0_var(--color-ink)]"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Hantar / Kemas Kini
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-inksoft transition hover:bg-cream hover:text-ink disabled:opacity-40"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <p className="mb-5 text-sm text-inksoft">
          Isi angka dari Insights post anda. Jika pautan sudah wujud, ia dikemas
          kini automatik.
        </p>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Username Threads
          </span>
          <input
            className={field}
            placeholder="cth: khalifrizal"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            maxLength={LIMITS.usernameMax}
            autoComplete="off"
            disabled={submitting}
          />
          {errors.username && (
            <span className="mt-1 block text-xs font-medium text-flame">
              {errors.username}
            </span>
          )}
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Pautan Thread (QRT)
          </span>
          <input
            className={field}
            placeholder="https://www.threads.net/@user/post/..."
            value={form.threads_link}
            onChange={(e) => update('threads_link', e.target.value)}
            maxLength={LIMITS.linkMax}
            inputMode="url"
            autoComplete="off"
            disabled={submitting}
          />
          {errors.threads_link && (
            <span className="mt-1 block text-xs font-medium text-flame">
              {errors.threads_link}
            </span>
          )}
        </label>

        {singleMetric ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Jumlah {singleMetric.label} (Impressions)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={field}
              placeholder="cth: 15230"
              value={form[singleMetric.key]}
              onChange={(e) => update(singleMetric.key, e.target.value)}
              disabled={submitting}
            />
            {errors[singleMetric.key] && (
              <span className="mt-1 block text-xs font-medium text-flame">
                {errors[singleMetric.key]}
              </span>
            )}
          </label>
        ) : (
          <>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Engagement <span className="text-inksoft">(kosong = 0)</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              {contest.metrics.map((m) => (
                <label key={m.key} className="block">
                  <span className="mb-1 block text-xs font-medium text-inksoft">
                    {m.emoji} {m.label}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    className={field}
                    placeholder="0"
                    value={form[m.key]}
                    onChange={(e) => update(m.key, e.target.value)}
                    disabled={submitting}
                  />
                  {errors[m.key] && (
                    <span className="mt-1 block text-xs font-medium text-flame">
                      {errors[m.key]}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-ink bg-ink px-4 py-3 text-paper">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold">
                Anggaran Skor
              </span>
              <span className="nums font-display text-2xl font-extrabold">
                {formatViews(liveScore)}
              </span>
            </div>
          </>
        )}

        {serverError && (
          <div className="mt-4 rounded-lg border-2 border-flame/40 bg-flame/10 px-3 py-2 text-sm font-medium text-flamedark">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-xl border-2 border-ink bg-flame py-3 font-semibold text-paper shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Menghantar…' : 'Hantar Penyertaan'}
        </button>
      </form>
    </div>
  )
}
