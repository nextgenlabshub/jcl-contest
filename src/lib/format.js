const numberFmt = new Intl.NumberFormat('ms-MY')

export function formatViews(n) {
  return numberFmt.format(Number(n) || 0)
}

/** "3 jam lalu", "semalam", dsb. */
export function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const sec = Math.round(diff / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)

  if (sec < 60) return 'baru sahaja'
  if (min < 60) return `${min} minit lalu`
  if (hr < 24) return `${hr} jam lalu`
  if (day === 1) return 'semalam'
  if (day < 30) return `${day} hari lalu`
  return new Date(iso).toLocaleDateString('ms-MY')
}
