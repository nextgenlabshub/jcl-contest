import { SectionHead } from './ui'
import { safeHref } from '../lib/validate'

const steps = [
  {
    n: '01',
    title: 'Quote',
    desc: 'Buka post utama, kemudian Quote Post — kongsikan bagaimana App Junior Code Lab boleh membantu anak-anak belajar. Boleh sertakan video, tips atau apa sahaja.',
  },
  {
    n: '02',
    title: 'Sebar',
    desc: 'Kongsikan Quote Post anda ke komuniti niche yang sama untuk meningkatkan views.',
  },
  {
    n: '03',
    title: 'Daftar',
    desc: 'Masukkan pautan thread & jumlah views anda di sini, dan kemas kini bila-bila ia bertambah.',
  },
]

export default function HowToJoin({ mainPostUrl }) {
  return (
    <section>
      <SectionHead
        eyebrow="Panduan"
        title="Cara Sertai"
        right={
          mainPostUrl ? (
            <a
              href={safeHref(mainPostUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-[3px_3px_0_0_var(--color-flame)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              📌 Buka Post Utama
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-ink/25 px-4 py-2 text-sm text-inksoft"
              title="Set mainPostUrl dalam src/contest.config.js"
            >
              📌 Post utama belum ditetapkan
            </span>
          )
        }
      />

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
