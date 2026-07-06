import { useEffect, useRef, useState } from 'react'
import { SectionHead } from './ui'

const METAL = [
  { bar: 'bg-gold', text: 'text-gold', tag: 'Emas' },
  { bar: 'bg-silver', text: 'text-silver', tag: 'Silver' },
  { bar: 'bg-bronze', text: 'text-bronze', tag: 'Silver' },
]

// Slider gambar ringan (tiada library). Dots + anak panah + swipe.
// `auto` = tukar gambar sendiri (guna untuk hadiah #1 sahaja).
function ImageSlider({ srcs, setSrcs, alt, auto, badge }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(0)

  const count = srcs.length
  const idx = count ? i % count : 0

  useEffect(() => {
    if (!auto || paused || count < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % count), 3000)
    return () => clearInterval(t)
  }, [auto, paused, count])

  if (!count) return null

  const go = (n) => setI(((n % count) + count) % count)

  return (
    <div
      className="group relative aspect-[4/3] w-full overflow-hidden bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX
        setPaused(true)
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - startX.current
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1))
        setPaused(false)
      }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {srcs.map((src) => (
          <img
            key={src}
            src={src}
            alt={alt}
            loading="lazy"
            draggable={false}
            onError={() => setSrcs((s) => s.filter((x) => x !== src))}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {badge}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Gambar sebelum"
            onClick={() => go(idx - 1)}
            className="absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-paper/90 pb-0.5 font-bold text-ink opacity-100 transition hover:bg-paper sm:opacity-0 sm:group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Gambar seterusnya"
            onClick={() => go(idx + 1)}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-paper/90 pb-0.5 font-bold text-ink opacity-100 transition hover:bg-paper sm:opacity-0 sm:group-hover:opacity-100"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {srcs.map((_, d) => (
              <button
                key={d}
                type="button"
                aria-label={`Ke gambar ${d + 1}`}
                onClick={() => go(d)}
                className={`h-1.5 rounded-full border border-ink transition-all ${
                  d === idx ? 'w-4 bg-ink' : 'w-1.5 bg-paper/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PrizeCard({ prize, metal, hero, auto }) {
  const initial = (
    prize.images ?? (prize.image ? [prize.image] : [])
  ).filter(Boolean)
  const [srcs, setSrcs] = useState(initial)
  const hasImg = srcs.length > 0

  const badge = (
    <>
      <span
        className={`absolute left-3 top-3 drop-shadow ${hero ? 'text-3xl' : 'text-2xl'}`}
      >
        {prize.medal}
      </span>
      <span
        className={`absolute right-3 top-3 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${metal.text}`}
      >
        {metal.tag}
      </span>
    </>
  )

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-paper transition ${
        hero
          ? 'border-2 border-ink shadow-[5px_5px_0_0_var(--color-ink)]'
          : 'border-2 border-ink/60 shadow-[3px_3px_0_0_var(--color-ink)]'
      }`}
    >
      <div className={`${hero ? 'h-2' : 'h-1.5'} w-full ${metal.bar}`} />

      {hasImg && (
        <ImageSlider
          srcs={srcs}
          setSrcs={setSrcs}
          alt={prize.label}
          auto={auto}
          badge={badge}
        />
      )}

      <div className={hero ? 'p-5' : 'p-4'}>
        {!hasImg && (
          <div className="mb-3 flex items-center justify-between">
            <span className={hero ? 'text-4xl' : 'text-3xl'}>{prize.medal}</span>
            <span
              className={`rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${metal.text}`}
            >
              {metal.tag}
            </span>
          </div>
        )}
        <h3
          className={`font-display font-extrabold text-ink ${
            hero ? 'text-xl' : 'text-base'
          }`}
        >
          {prize.label}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
          {prize.reward}
        </p>
      </div>
    </div>
  )
}

// Setiap kad ambil lebar sepertiga baris (tolak jurang gap-4 = 1rem).
const COL = 'sm:basis-[calc((100%_-_2rem)_/_3)] sm:shrink-0'

// #1 di TENGAH: pada desktop, susunan jadi [#2] [#1] [#3]; #1 diangkat naik.
// Pada mobil (flex-col) susunan ikut nombor: #1, #2, #3.
const PODIUM = [
  { order: 'order-1 sm:order-2', lift: 'sm:-mt-4' }, // #1 — tengah, naik
  { order: 'order-2 sm:order-1', lift: 'sm:mt-4' }, // #2 — kiri
  { order: 'order-3 sm:order-3', lift: 'sm:mt-4' }, // #3 — kanan
]

export default function Prizes({ prizes }) {
  if (!prizes?.length) return null

  const podium = prizes.slice(0, 3) // #1..#3 (podium)
  const rest = prizes.slice(3) // #4, #5, ... (baris bawah)

  return (
    <section>
      <SectionHead eyebrow="Ganjaran" title="Hadiah" />

      <div className="mx-auto mt-6 max-w-3xl">
        {/* Baris podium: #2  #1(tengah, tertinggi, auto-slide)  #3 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center">
          {podium.map((p, i) => (
            <div
              key={p.place}
              className={`${PODIUM[i].order} ${PODIUM[i].lift} ${COL}`}
            >
              <PrizeCard
                prize={p}
                metal={METAL[i] ?? METAL[2]}
                hero={i === 0}
                auto={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Baris bawah: #4, #5, ... (di tengah) */}
        {rest.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {rest.map((p) => (
              <div key={p.place} className={COL}>
                <PrizeCard prize={p} metal={METAL[2]} hero={false} auto={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
