-- =============================================================
--  MIGRASI: Admin dashboard (senarai penuh + kemas kini views)
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query
--  (Jalankan SELEPAS schema.sql / migrasi lain.)
--
--  CARA SEDIA AKAUN ADMIN (sekali sahaja):
--   1. Supabase Dashboard > Authentication > Users > "Add user".
--   2. Isi email + kata laluan. TANDA "Auto Confirm User" — supaya tak
--      perlu verify email (macam yang diminta).
--   3. Guna email + kata laluan itu untuk log masuk di halaman ?admin.
--
--  Ketiga-tiga fungsi di bawah HANYA boleh dipanggil oleh pengguna yang
--  telah log masuk (auth.uid() bukan null). Ia security definer supaya
--  boleh lepasi sekatan kolum `phone` & buat perubahan bagi pihak admin.
-- =============================================================

-- 1) SENARAI PENUH — semua penyertaan termasuk `phone` (untuk hubungi
--    pemenang). Anon biasa TAK boleh baca phone; fungsi ini (definer) boleh.
create or replace function public.admin_list_entries()
returns setof public.threads_leaderboard
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Akses ditolak — sila log masuk.';
  end if;
  return query
    select * from public.threads_leaderboard
    order by views desc, updated_at asc;
end;
$$;

revoke all on function public.admin_list_entries() from public;
grant execute on function public.admin_list_entries() to authenticated;

-- 2) KEMAS KINI VIEWS satu penyertaan (admin kira/tetapkan manual).
--    CHECK constraint jadual masih menapis julat views yang sah.
create or replace function public.admin_update_views(
  p_id    uuid,
  p_views integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Akses ditolak — sila log masuk.';
  end if;
  update public.threads_leaderboard
    set views = p_views, updated_at = now()
    where id = p_id;
end;
$$;

revoke all on function public.admin_update_views(uuid, integer) from public;
grant execute on function public.admin_update_views(uuid, integer) to authenticated;

-- 3) PADAM penyertaan (buang spam / duplikasi). Admin sahaja.
create or replace function public.admin_delete_entry(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Akses ditolak — sila log masuk.';
  end if;
  delete from public.threads_leaderboard where id = p_id;
end;
$$;

revoke all on function public.admin_delete_entry(uuid) from public;
grant execute on function public.admin_delete_entry(uuid) to authenticated;
