export default function Tips({ tips }) {
  if (!tips?.length) return null
  return (
    <section className="rounded-xl border border-line bg-paper/60 px-4 py-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-inksoft">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-flame" />
        Tips naikkan views
      </p>
      <ul className="space-y-1.5">
        {tips.map((t, i) => (
          <li
            key={i}
            className="flex gap-2 text-[13px] leading-snug text-inksoft"
          >
            <span className="font-bold text-flame">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
