# 🏆 Threads Contest Leaderboard

Leaderboard awam yang telus untuk peraduan Threads. Pemenang ditentukan
oleh jumlah **Views (Impressions)** tertinggi pada Quote Thread (QRT) peserta.

Sistem ini **semi-automatik & crowdsourced**: peserta memasukkan sendiri jumlah
views mereka dan memuat naik screenshot Insights sebagai bukti. Sesiapa boleh
klik **"Lihat Bukti"** untuk mengesahkan — ketelusan dipandu komuniti.

> **Kenapa manual?** Threads API tidak mendedahkan view count post orang lain
> (sekatan privasi Meta). Jadi input peserta + bukti screenshot ialah jalan
> penyelesaian paling praktikal.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Backend:** Supabase (Postgres + Storage)

---

## Persediaan (Setup)

### 1. Pasang dependency
```bash
npm install
```

### 2. Buat projek Supabase
1. Pergi ke [supabase.com](https://supabase.com) → **New project** (percuma).
2. Buka **SQL Editor** → **New query** → tampal isi
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Ini cipta jadual, RLS policy, dan bucket storage `proofs`.

### 3. Isi kunci API
1. Salin fail contoh:
   ```bash
   cp .env.example .env.local
   ```
2. Di Supabase: **Project Settings → API**. Salin **Project URL** dan
   **anon public key** ke dalam `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   > Guna **anon public** key sahaja — jangan letak service_role key di frontend.

### 4. Jalankan
```bash
npm run dev
```
Buka pautan yang dipaparkan (biasanya http://localhost:5173).

---

## Struktur

```
src/
  App.jsx                    Susun atur utama + state
  lib/
    supabase.js              Klien Supabase
    api.js                   Fetch, upload screenshot, upsert
    format.js                Format nombor & masa
  components/
    Podium.jsx               Paparan Top 3
    LeaderboardTable.jsx     Senarai #4 ke bawah
    SubmissionForm.jsx       Borang hantar/kemas kini (+ validasi & upload)
    ProofModal.jsx           Modal lihat screenshot bukti
supabase/
  schema.sql                 Skema DB + RLS + bucket storage
```

## Cara ia berfungsi

- **Hantar/Kemas kini:** borang upsert pada `threads_link`. Jika pautan sudah
  wujud, baris dikemas kini (`view_count`, `screenshot_url`, `updated_at`);
  jika tidak, baris baru dicipta.
- **Leaderboard:** `SELECT * ORDER BY view_count DESC, updated_at ASC`. Top 3
  dipaparkan podium, selebihnya dalam jadual. Seri dimenangi yang capai dahulu.
- **Bukti:** setiap baris ada butang **Lihat Bukti** yang membuka screenshot.

## Keputusan automatik di saat tamat

Bila masa `endsAt` (dalam `src/contest.config.js`) tiba:

1. **Borang auto-kunci** — butang bertukar "🔒 Peraduan Telah Tamat". Di server,
   RLS (`contest_is_open()`) menolak sebarang insert/update selepas `ends_at`.
2. **Skrin Keputusan** muncul automatik — Top `winnersCount` pemenang + hadiah,
   berlabel **"Keputusan Sementara — menunggu sahkan"**.
3. **Sahkan Rasmi** — buka app dengan `?admin=KUNCI` (padan `contest.adminKey`),
   semak bukti, tekan **✓ Sahkan Rasmi**. Status bertukar **"Pemenang Rasmi"**
   untuk semua (disimpan dalam jadual `contest_state`).

> ⚠️ **Penting:** Set `ends_at` dalam `contest_state` (SQL) **sama** dengan
> `endsAt` dalam config. Kunci server ikut `contest_state.ends_at`.

### Mod Demo
Selagi Supabase belum disambung, app papar **data contoh** supaya anda boleh
lihat leaderboard, podium & skrin keputusan. Sambung Supabase untuk data sebenar.

## 🔐 Sebelum go-live (hadiah sebenar)

`?admin=KUNCI` hanya *gate* di frontend — **tidak selamat** untuk melindungi
"Sahkan Rasmi" sepenuhnya. Sebelum edar hadiah sebenar (emas/silver), naik taraf
kepada **Supabase Auth**: log masuk pentadbir, dan policy `state_update` sudah
dihadkan kepada `authenticated` sahaja. Beritahu saya bila nak tambah Auth.

---

## ⚠️ Nota keselamatan (baca sebelum go-live)

Peraduan ini **terbuka tanpa login** (ikut reka bentuk crowdsourced). Maksudnya:

- Sesiapa yang tahu pautan thread boleh **mengemas kini** baris itu (termasuk
  menukar nombor / screenshot). Ini sengaja — bukti screenshot yang jaga
  ketelusan.
- Nombor **tidak disahkan automatik**. Rujuk screenshot untuk validasi manual
  sebelum mengesahkan pemenang.

Jika kemudian anda mahu lebih ketat (elak sabotaj/spam), pilihan:
- Wajibkan peserta **login** (Supabase Auth magic link) + hadkan update kepada
  pemilik baris melalui RLS.
- Atau tukar kepada model **admin sahaja input** — peserta hantar bukti, admin
  masukkan nombor.

Beritahu saya bila anda nak naik taraf ke salah satu model itu.
