-- =============================================================
--  MIGRASI: longgarkan format no telefon
--  Terima apa-apa panjang munasabah (8–15 digit), asalkan mula '0'
--  (tanpa +60). Jalankan di SQL Editor (role = postgres).
-- =============================================================

alter table public.threads_leaderboard
  drop constraint if exists threads_leaderboard_phone_check;

alter table public.threads_leaderboard
  add constraint threads_leaderboard_phone_check
  check (phone is null or phone ~ '^0[0-9]{7,14}$');
