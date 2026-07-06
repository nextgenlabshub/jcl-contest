import { SectionHead } from './ui'
import { safeHref } from '../lib/validate'

const steps = [
  {
    n: '01',
    title: 'Quote',
    desc: 'Buka post utama, kemudian Quote Post — kongsikan bagaimana App 2ndschool boleh membantu anak-anak belajar. Boleh sertakan video, tips atau apa sahaja.',
  },
  {
    n: '02',
    title: 'Sebar',
    desc: 'Kongsikan Quote Post anda ke komuniti niche yang sama untuk meningkatkan views.',
  },
  {
    n: '03',
    title: 'Daftar',
    desc: 'Copy & paste link Quote Post anda sendiri di sini. Setiap hari ranking akan keluar — anda tak perlu kira apa-apa.',
  },
]

export default function HowToJoin({ mainPostUrl }) {
  return (
    <section>
      <SectionHead eyebrow="Panduan" title="Cara Sertai" />

      {mainPostUrl ? (
        <a
          href={safeHref(mainPostUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex flex-col items-center gap-2 rounded-2xl border-2 border-ink bg-ink px-6 py-6 text-center text-paper shadow-[6px_6px_0_0_var(--color-flame)] transition-transform hover:-translate-y-1 active:translate-y-0 sm:flex-row sm:justify-center sm:gap-5"
        >
          <span className="text-5xl">📌</span>
          <span className="flex flex-col sm:items-start">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Langkah 1 — Klik di sini
            </span>
            <span className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              Buka &amp; <span className="text-flame">QUOTE POST INI</span>
            </span>
          </span>
        </a>
      ) : (
        <span
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/25 px-6 py-6 text-center text-inksoft"
          title="Set mainPostUrl dalam src/contest.config.js"
        >
          📌 Post utama belum ditetapkan
        </span>
      )}

      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className="relative rounded-2xl border border-line bg-paper p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="nums font-display text-4xl font-extrabold text-flame">
                {s.n}
              </span>
              {i < steps.length - 1 && (
                <span className="text-2xl text-line">→</span>
              )}
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">
              {s.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-4 flex gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
        <span aria-hidden>⚠️</span>
        <span>
          <strong className="font-semibold">Penting:</strong> Pastikan post anda
          ialah <strong className="font-semibold">Quote kepada post utama</strong>{' '}
          di atas — bukan post berasingan. Jika tidak, penyertaan tidak dikira
          dalam peraduan.
        </span>
      </p>
    </section>
  )
}
