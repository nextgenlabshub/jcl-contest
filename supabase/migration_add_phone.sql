-- =============================================================
--  MIGRASI: tambah kolum `phone` (no telefon peserta)
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query
--  Selamat dijalankan berulang (idempotent).
-- =============================================================

-- 1) Tambah kolum phone + sahkan format (01X, 7–9 digit, tanpa '+6').
alter table public.threads_leaderboard
  add column if not exists phone varchar(15);

alter table public.threads_leaderboard
  drop constraint if exists threads_leaderboard_phone_check;
alter table public.threads_leaderboard
  add constraint threads_leaderboard_phone_check
  check (phone is null or phone ~ '^01[0-9]{7,9}$');

-- 2) Keizinan peringkat-KOLUM: anon boleh TULIS phone tapi TAK boleh BACA.
--    (Buang keizinan seluruh-jadual dulu, kemudian beri per-kolum.)
revoke select, insert, update on public.threads_leaderboard from anon, authenticated;

grant select (id, created_at, username, threads_link, views, updated_at)
  on public.threads_leaderboard to anon, authenticated;
grant insert (username, threads_link, views, phone, updated_at)
  on public.threads_leaderboard to anon, authenticated;
grant update (username, threads_link, views, phone, updated_at)
  on public.threads_leaderboard to anon, authenticated;

-- Untuk lihat no telefon peserta: buka Table Editor / SQL Editor
-- (guna service_role Supabase). Anon key TIDAK boleh baca kolum phone.
