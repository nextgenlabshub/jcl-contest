GAMBAR HADIAH — letak fail gambar di sini.

Setiap kad hadiah ada 2 gambar (boleh slide). Guna NAMA FAIL ini:

  tempat1-1  +  tempat1-2      →  Hadiah #1 (Emas Rose + Silver set)
  tempat2n3-1 + tempat2n3-2    →  Hadiah #2 & #3 (Silver) — kongsi gambar
  tempat4n5-1 + tempat4n5-2    →  Hadiah #4 & #5 (Silver) — kongsi gambar

Cara:
1. Salin gambar (.jpg/.jpeg/.png) ke folder ini, namakan ikut senarai atas.
2. Optimumkan: jalankan   npm run optimize:images
   -> ia kecilkan + tukar ke .webp, dan PADAM fail asal yang besar.
3. Refresh app — gambar muncul & boleh slide pada kad hadiah.
   (Hadiah #1 auto-slide sendiri.)

Nota:
- Enjin optimisasi: scripts/optimize-images.mjs (lebar maks 900px, WebP).
  Boleh laras: npm run optimize:images public/prizes 900 80
- Config gambar ada dalam src/contest.config.js -> prizes[].images
  (senarai 2 path .webp setiap hadiah).
- Saiz/dimensi apa-apa pun boleh — enjin auto-kecilkan & app auto-potong
  ke bentuk kad. Bentuk landskap atau segi empat paling cantik.
- Kalau gambar belum ada, kad tunjuk ikon pingat (🥇) — tiada gambar rosak.
