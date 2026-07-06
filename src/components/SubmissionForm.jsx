import { useEffect, useState } from 'react'
import { submitEntry } from '../lib/api'
import { contest } from '../contest.config'
import {
  cleanUsername,
  isValidUsername,
  cleanThreadsUrl,
  cleanPhone,
  isValidPhone,
  LIMITS,
} from '../lib/validate'

const emptyForm = () => ({
  phone: '',
  username: '',
  threads_link: '',
})

export default function SubmissionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !submitting && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e = {}

    const phone = cleanPhone(form.phone)
    if (!phone) e.phone = 'Wajib diisi.'
    else if (!isValidPhone(phone))
      e.phone = 'Guna format tempatan tanpa +60 — cth 0123456789.'

    const username = cleanUsername(form.username)
    if (!username) e.username = 'Wajib diisi.'
    else if (!isValidUsername(username))
      e.username = 'Guna huruf, nombor, titik (.) dan garis bawah (_) sahaja.'

    if (!form.threads_link.trim()) {
      e.threads_link = 'Wajib diisi.'
    } else if (!cleanThreadsUrl(form.threads_link)) {
      e.threads_link = 'Pautan mesti URL threads.net / threads.com yang sah.'
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
      await submitEntry({
        username: cleanUsername(form.username),
        threads_link: cleanThreadsUrl(form.threads_link),
        phone: cleanPhone(form.phone),
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
            Sertai Peraduan
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
          Daftar penyertaan anda. Views akan dikira & dikemas kini oleh penganjur
          sepanjang peraduan. 
        </p>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            No. Telefon <span className="text-inksoft">(untuk dihubungi jika menang)</span>
          </span>
          <input
            className={field}
            type="tel"
            inputMode="numeric"
            placeholder="cth: 0123456789"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            maxLength={LIMITS.phoneMax}
            autoComplete="tel"
            disabled={submitting}
          />
          {errors.phone && (
            <span className="mt-1 block text-xs font-medium text-flame">
              {errors.phone}
            </span>
          )}
        </label>

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

        {contest.terms?.length > 0 && (
          <div className="mt-3 text-center text-xs text-inksoft">
            <p>
              Dengan menghantar, anda bersetuju dengan{' '}
              <button
                type="button"
                onClick={() => setShowTerms((v) => !v)}
                className="font-semibold text-ink underline underline-offset-2"
              >
                Terma &amp; Syarat
              </button>
              .
            </p>
            {showTerms && (
              <ol className="mt-2 list-decimal space-y-1 rounded-lg border border-line bg-cream/50 px-5 py-3 text-left leading-relaxed">
                {contest.terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
