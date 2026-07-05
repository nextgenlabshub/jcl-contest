-- =============================================================
--  Threads Contest Leaderboard — Skema Supabase
--  Jalankan sekali dalam: Supabase Dashboard > SQL Editor > New query
-- =============================================================

-- 1) JADUAL ----------------------------------------------------
create table if not exists public.threads_leaderboard (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  -- Sanitasi dikuatkuasakan di sini juga (CHECK) — tak boleh dipintas
  -- walaupun seseorang panggil API terus dengan anon key.
  username      varchar(30) not null
    check (char_length(username) between 1 and 30
           and username ~ '^[A-Za-z0-9._]+$'),
  threads_link  text        not null
    check (char_length(threads_link) <= 500
           and threads_link ~* '^https://(www\.)?threads\.(net|com)/'),
  -- Views (impressions) — nombor yang menentukan pemenang.
  views         integer     not null default 0 check (views between 0 and 2000000000),
  -- No telefon peserta (data peribadi). Format tempatan (mula '0'), tanpa
  -- '+60'. Longgar: 8–15 digit. Anon boleh TULIS tapi TAK boleh BACA.
  phone         varchar(15)
    check (phone is null or phone ~ '^0[0-9]{7,14}$'),
  updated_at    timestamptz not null    default now(),
  -- Kunci untuk upsert: satu baris setiap pautan thread.
  constraint threads_leaderboard_link_key unique (threads_link)
);

-- Skor dikira di app, jadi cukup index masa kemas kini untuk fetch stabil.
create index if not exists idx_leaderboard_updated
  on public.threads_leaderboard (updated_at);

-- 1b) STATUS PERADUAN -----------------------------------------
--  Satu baris (id = 1). `ends_at` menguatkan kunci auto di server;
--  `finalized` menanda keputusan sudah RASMI.
create table if not exists public.contest_state (
  id           int         primary key default 1 check (id = 1),
  ends_at      timestamptz,
  finalized    boolean     not null default false,
  finalized_at timestamptz,
  updated_at   timestamptz not null default now()
);

-- Cipta baris tunggal. GANTIKAN ends_at dengan tarikh tamat sebenar
-- (SAMA dengan contest.endsAt dalam src/contest.config.js).
insert into public.contest_state (id, ends_at)
values (1, '2026-07-16T00:00:00+08:00')
on conflict (id) do nothing;

-- 2) ROW LEVEL SECURITY ---------------------------------------
--  Peraduan ini terbuka (crowdsourced): sesiapa boleh baca,
--  tambah, dan kemas kini. Angka disahkan komuniti melalui
--  pautan thread awam. Ketatkan policy kemudian jika perlu.
alter table public.threads_leaderboard enable row level security;

drop policy if exists "public_read"   on public.threads_leaderboard;
drop policy if exists "public_insert" on public.threads_leaderboard;
drop policy if exists "public_update" on public.threads_leaderboard;

-- Kunci masa tamat: benarkan tulis hanya jika belum tamat.
-- (Jika ends_at belum diset, tulis dibenarkan.)
create or replace function public.contest_is_open()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select now() < ends_at from public.contest_state where id = 1),
    true
  );
$$;

create policy "public_read"
  on public.threads_leaderboard for select
  to anon, authenticated
  using (true);

create policy "public_insert"
  on public.threads_leaderboard for insert
  to anon, authenticated
  with check (public.contest_is_open());

create policy "public_update"
  on public.threads_leaderboard for update
  to anon, authenticated
  using (public.contest_is_open())
  with check (public.contest_is_open());

-- (Sengaja TIADA policy DELETE — anon tidak boleh padam baris.)

-- Status peraduan: sesiapa boleh BACA (untuk papar keputusan).
-- Kemas kini (Sahkan Rasmi) dihadkan kepada authenticated sahaja —
-- gunakan Supabase Auth untuk log masuk pentadbir sebelum go-live.
alter table public.contest_state enable row level security;

drop policy if exists "state_read"   on public.contest_state;
drop policy if exists "state_update" on public.contest_state;

create policy "state_read"
  on public.contest_state for select
  to anon, authenticated
  using (true);

create policy "state_update"
  on public.contest_state for update
  to authenticated
  using (true) with check (true);

-- 3) GRANTS ---------------------------------------------------
--  Kebenaran peringkat-table (berasingan dari RLS). RLS tentukan
--  BARIS mana; GRANT tentukan OPERASI mana yang dibenarkan.
grant usage on schema public to anon, authenticated;
-- KEIZINAN PERINGKAT-KOLUM untuk threads_leaderboard:
--  Anon boleh BACA semua kolum KECUALI `phone` (data peribadi).
--  Anon boleh TULIS `phone` (insert/update) tapi tak boleh baca balik.
--  Untuk lihat no telefon: guna Supabase Dashboard (service_role) sahaja.
grant select (id, created_at, username, threads_link, views, updated_at)
  on public.threads_leaderboard to anon, authenticated;
grant insert (username, threads_link, views, phone, updated_at)
  on public.threads_leaderboard to anon, authenticated;
grant update (username, threads_link, views, phone, updated_at)
  on public.threads_leaderboard to anon, authenticated;
grant select on public.contest_state to anon, authenticated;
grant update on public.contest_state to authenticated;
grant execute on function public.contest_is_open() to anon, authenticated;

-- 4) FUNGSI HANTAR PENYERTAAN ---------------------------------
--  Upsert (ON CONFLICT DO UPDATE) memerlukan SELECT peringkat-jadual
--  penuh — yang akan mendedahkan `phone`. Jadi anon panggil fungsi ini
--  (security definer) yang buat upsert sebagai PEMILIK jadual; phone
--  kekal privasi. CHECK constraint jadual masih menapis data buruk.
create or replace function public.submit_entry(
  p_username     text,
  p_threads_link text,
  p_phone        text,
  p_views        integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.contest_is_open() then
    raise exception 'Peraduan telah tamat.';
  end if;

  insert into public.threads_leaderboard (username, threads_link, phone, views, updated_at)
  values (p_username, p_threads_link, p_phone, p_views, now())
  on conflict (threads_link) do update
    set username   = excluded.username,
        phone      = excluded.phone,
        views      = excluded.views,
        updated_at = now();
end;
$$;

revoke all on function public.submit_entry(text, text, text, integer) from public;
grant execute on function public.submit_entry(text, text, text, integer) to anon, authenticated;

-- (Tiada Storage diperlukan — penyertaan disahkan melalui pautan thread,
--  bukan muat naik screenshot.)
