-- =============================================================
--  MIGRASI: Borang peserta TANPA medan "views"
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query.
--
--  KENAPA: Peserta kini hanya isi username + pautan thread + no telefon.
--  VIEWS ditetapkan HANYA oleh admin (Admin Dashboard). Ini penting sebab
--  borang guna UPSERT — kalau borang hantar views, peserta yang hantar
--  semula (pautan sama) akan memadam angka views yang admin dah isi.
--
--  Versi baru submit_entry:
--   • Tiada parameter p_views.
--   • INSERT baru → views guna DEFAULT 0.
--   • ON CONFLICT (hantar semula) → hanya username & phone dikemas kini;
--     `views` SENGAJA TIDAK disentuh (angka admin kekal selamat).
-- =============================================================

-- Buang versi lama yang menerima p_views (tukar tandatangan fungsi).
drop function if exists public.submit_entry(text, text, text, integer);

create or replace function public.submit_entry(
  p_username     text,
  p_threads_link text,
  p_phone        text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.contest_is_open() then
    raise exception 'Peraduan telah tamat.';
  end if;

  insert into public.threads_leaderboard (username, threads_link, phone, updated_at)
  values (p_username, p_threads_link, p_phone, now())
  on conflict (threads_link) do update
    set username   = excluded.username,
        phone      = excluded.phone,
        updated_at = now();
  -- NOTA: `views` SENGAJA tidak dikemas kini di sini — hanya admin set views.
end;
$$;

revoke all on function public.submit_entry(text, text, text) from public;
grant execute on function public.submit_entry(text, text, text) to anon, authenticated;
