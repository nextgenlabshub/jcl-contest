import { useState } from 'react'
import { SectionHead } from './ui'

const METAL = [
  { bar: 'bg-gold', text: 'text-gold', tag: 'Emas' },
  { bar: 'bg-silver', text: 'text-silver', tag: 'Silver' },
  { bar: 'bg-bronze', text: 'text-bronze', tag: 'Silver' },
]

function PrizeCard({ prize, metal, hero }) {
  const [showImg, setShowImg] = useState(Boolean(prize.image))

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-paper ${
        hero
          ? 'border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] sm:-mt-2'
          : 'border border-line'
      }`}
    >
      <div className={`h-1.5 w-full ${metal.bar}`} />

      {showImg && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
          <img
            src={prize.image}
            alt={prize.label}
            loading="lazy"
            onError={() => setShowImg(false)}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-3 top-3 text-2xl">{prize.medal}</span>
          <span
            className={`absolute right-3 top-3 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${metal.text}`}
          >
            {metal.tag}
          </span>
        </div>
      )}

      <div className="p-5">
        {!showImg && (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-3xl">{prize.medal}</span>
            <span
              className={`rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${metal.text}`}
            >
              {metal.tag}
            </span>
          </div>
        )}
        <h3 className="font-display text-lg font-extrabold text-ink">
          {prize.label}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
          {prize.reward}
        </p>
      </div>
    </div>
  )
}

export default function Prizes({ prizes }) {
  if (!prizes?.length) return null
  return (
    <section>
      <SectionHead eyebrow="Ganjaran" title="Hadiah" />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {prizes.map((p, i) => (
          <PrizeCard
            key={p.place}
            prize={p}
            metal={METAL[i] ?? METAL[2]}
            hero={i === 0}
          />
        ))}
      </div>
    </section>
  )
}
