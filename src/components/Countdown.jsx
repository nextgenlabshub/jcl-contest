import { useEffect, useState } from 'react'

const pad = (n) => String(n).padStart(2, '0')

function remainingMs(endsAt) {
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(end)) return null
  return end - Date.now()
}

export default function Countdown({ endsAt }) {
  const [ms, setMs] = useState(() => remainingMs(endsAt))

  useEffect(() => {
    if (!endsAt) return
    setMs(remainingMs(endsAt))
    const id = setInterval(() => setMs(remainingMs(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (ms == null) return null

  if (ms <= 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 py-1.5 text-sm font-semibold text-paper">
        Peraduan telah tamat
      </span>
    )
  }

  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  const units = [
    { v: days, l: 'hari' },
    { v: hours, l: 'jam' },
    { v: mins, l: 'min' },
    { v: secs, l: 'saat' },
  ]

  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-xl border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]">
      <span className="flex items-center bg-ink px-3 text-xs font-bold uppercase tracking-[0.15em] text-paper">
        Tamat
      </span>
      <span className="flex items-center gap-2 bg-paper px-3 py-1.5">
        {units.map((u) => (
          <span key={u.l} className="flex flex-col items-center leading-none">
            <span className="nums font-display text-lg font-extrabold text-ink">
              {pad(u.v)}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-inksoft">
              {u.l}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
