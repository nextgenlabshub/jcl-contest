-- =============================================================
--  MIGRASI: KETATKAN KESELAMATAN (jalankan SEKALI, PALING AKHIR)
--  Supabase Dashboard > SQL Editor > New query.
--  Jalankan SELEPAS schema.sql, migration_form_no_views.sql,
--  dan migration_admin.sql.
--
--  APA YANG DIBAIKI (3 lubang keselamatan):
--   1) Dulu: sesiapa (anon) boleh TULIS `views` terus ke jadual guna anon
--      key — boleh tipu angka & menang. Sekarang: anon TAK boleh tulis
--      terus langsung; semua penghantaran WAJIB lalu fungsi submit_entry.
--   2) Dulu: sesiapa boleh edit/rosakkan penyertaan orang lain. Sekarang:
--      tiada tulisan terus untuk anon — tamat.
--   3) Dulu: mana-mana akaun yang LOG MASUK dikira "admin" (auth.uid() bukan
--      null) — kalau orang luar daftar akaun, dia nampak SEMUA no telefon.
--      Sekarang: admin = HANYA akaun dalam senarai `public.admins`.
--
--  PENTING (buat sekali di Dashboard, bukan SQL):
--   • Authentication > Providers > Email: MATIKAN "Allow new users to sign
--     up" (elak orang luar daftar akaun sendiri). Anda dah ada akaun admin,
--     jadi signup tak perlu dibuka.
-- =============================================================


-- 1) SENARAI ADMIN --------------------------------------------
--  Jadual kecil menyimpan akaun yang dibenarkan jadi admin.
create table if not exists public.admins (
  user_id  uuid        primary key references auth.users (id) on delete cascade,
  email    text,
  added_at timestamptz not null default now()
);

-- RLS hidup TANPA sebarang policy => tiada sesiapa (anon/authenticated)
-- boleh baca/tulis jadual ini terus. Hanya fungsi security-definer di bawah
-- (dan service_role di Dashboard) yang boleh membacanya.
alter table public.admins enable row level security;

-- Isi senarai admin secara automatik dari akaun email anda.
-- (Akaun nextgenlabshub@gmail.com mesti sudah wujud di Authentication>Users.)
insert into public.admins (user_id, email)
select id, email
  from auth.users
 where lower(email) = 'nextgenlabshub@gmail.com'
on conflict (user_id) do nothing;


-- 2) FUNGSI SEMAK ADMIN ---------------------------------------
--  Pulangkan true hanya jika pemanggil ada dalam senarai admin.
--  security definer supaya boleh baca public.admins walaupun RLS hidup.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- 3) TUKAR FUNGSI ADMIN: guna is_admin() ganti "auth.uid() bukan null" ----
create or replace function public.admin_list_entries()
returns setof public.threads_leaderboard
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak — bukan admin.';
  end if;
  return query
    select * from public.threads_leaderboard
    order by views desc, updated_at asc;
end;
$$;

create or replace function public.admin_update_views(
  p_id    uuid,
  p_views integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak — bukan admin.';
  end if;
  update public.threads_leaderboard
    set views = p_views, updated_at = now()
    where id = p_id;
end;
$$;

create or replace function public.admin_delete_entry(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak — bukan admin.';
  end if;
  delete from public.threads_leaderboard where id = p_id;
end;
$$;


-- 4) KUNCI JADUAL: anon TAK boleh tulis terus -----------------
--  submit_entry ialah security definer (jalan sebagai pemilik jadual), jadi
--  ia TIDAK perlukan grant ini untuk berfungsi. Dengan membuang grant
--  insert/update, satu-satunya jalan untuk anon menghantar ialah melalui
--  submit_entry — yang TAK PERNAH menyentuh `views`. Tipu views = mustahil.
revoke insert, update on public.threads_leaderboard from anon, authenticated;

-- Policy insert/update lama tak diperlukan lagi (tiada grant untuk dipakai).
drop policy if exists "public_insert" on public.threads_leaderboard;
drop policy if exists "public_update" on public.threads_leaderboard;

-- (SELECT untuk kolum awam KEKAL — leaderboard perlu baca. `phone` tetap
--  tak pernah di-grant kepada anon, jadi kekal privasi.)


-- 5) STATUS PERADUAN: "Sahkan Rasmi" untuk admin sahaja -------
--  Dulu mana-mana akaun log masuk boleh finalize. Sekarang admin sahaja.
drop policy if exists "state_update" on public.contest_state;
create policy "state_update"
  on public.contest_state for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
--  SELESAI. Uji cepat:
--   • Buka leaderboard biasa — masih boleh baca & hantar penyertaan.
--   • Cuba dari anon: PATCH views terus ke jadual => patut GAGAL (403).
--   • Log masuk ?admin sebagai nextgenlabshub@gmail.com => nampak senarai
--     + no telefon, boleh update views, padam, sahkan rasmi.
--   • Akaun lain (jika ada) log masuk => admin_list_entries() patut tolak.
-- =============================================================
