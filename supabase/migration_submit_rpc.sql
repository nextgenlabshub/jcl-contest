-- =============================================================
--  MIGRASI: fungsi submit_entry (RPC) untuk hantar penyertaan
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query
--  (Jalankan SELEPAS migration_add_phone.sql.)
--
--  KENAPA: upsert (INSERT ... ON CONFLICT DO UPDATE) memerlukan SELECT
--  peringkat-jadual penuh. Kita tak boleh beri itu kepada anon tanpa
--  mendedahkan kolum `phone`. Jadi anon panggil fungsi ini (security
--  definer) yang buat upsert sebagai PEMILIK jadual — phone kekal privasi.
-- =============================================================

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
  -- Kuatkuasa kunci masa tamat di pelayan.
  if not public.contest_is_open() then
    raise exception 'Peraduan telah tamat.';
  end if;

  -- CHECK constraint pada jadual masih menapis data buruk (format phone,
  -- username, julat views) walaupun dipanggil terus dengan anon key.
  insert into public.threads_leaderboard (username, threads_link, phone, views, updated_at)
  values (p_username, p_threads_link, p_phone, p_views, now())
  on conflict (threads_link) do update
    set username   = excluded.username,
        phone      = excluded.phone,
        views      = excluded.views,
        updated_at = now();
end;
$$;

-- Hanya benarkan panggil fungsi (bukan akses jadual terus).
revoke all on function public.submit_entry(text, text, text, integer) from public;
grant execute on function public.submit_entry(text, text, text, integer) to anon, authenticated;
