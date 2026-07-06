// =============================================================
//  Engine optimisasi gambar (resize + tukar ke WebP).
//  Guna: node scripts/optimize-images.mjs [folder] [maxWidth] [quality]
//  Default: public/prizes, lebar maks 900px, kualiti 80.
//
//  Untuk setiap .jpg/.jpeg/.png dalam folder:
//   • kecilkan supaya lebar <= maxWidth (tak membesar jika dah kecil),
//   • encode semula sebagai .webp (jauh lebih kecil untuk foto),
//   • PADAM fail asal, ganti dengan .webp nama sama.
//  Fail .webp sedia ada dilangkau (idempotent — selamat run banyak kali).
// =============================================================
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const dir = join(ROOT, process.argv[2] || 'public/prizes')
const maxWidth = Number(process.argv[3]) || 900
const quality = Number(process.argv[4]) || 80

const SRC_EXT = new Set(['.jpg', '.jpeg', '.png'])
const kb = (n) => `${(n / 1024).toFixed(1)} KB`

async function run() {
  const files = await readdir(dir)
  const targets = files.filter((f) => SRC_EXT.has(extname(f).toLowerCase()))

  if (!targets.length) {
    console.log(`Tiada gambar .jpg/.jpeg/.png untuk dioptimum dalam ${dir}`)
    return
  }

  console.log(`Optimum ${targets.length} gambar dalam ${dir} `)
  console.log(`(lebar maks ${maxWidth}px, WebP kualiti ${quality})\n`)

  let before = 0
  let after = 0

  for (const file of targets) {
    const src = join(dir, file)
    const out = join(dir, `${basename(file, extname(file))}.webp`)

    const { size: srcSize } = await stat(src)
    const meta = await sharp(src).metadata()

    await sharp(src)
      .rotate() // hormati EXIF orientation sebelum buang metadata
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out)

    const { size: outSize } = await stat(out)
    await unlink(src) // padam asal

    before += srcSize
    after += outSize
    const pct = Math.round((1 - outSize / srcSize) * 100)
    console.log(
      `  ${file} (${meta.width}×${meta.height}, ${kb(srcSize)}) ` +
        `-> ${basename(out)} (${kb(outSize)}, -${pct}%)`,
    )
  }

  const pct = Math.round((1 - after / before) * 100)
  console.log(
    `\nSiap. Jumlah ${kb(before)} -> ${kb(after)} (jimat ${pct}%).`,
  )
}

run().catch((err) => {
  console.error('Ralat optimisasi:', err)
  process.exit(1)
})
