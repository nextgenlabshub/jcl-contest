-- =============================================================
--  MIGRASI: Buang grant baki (REFERENCES/TRIGGER/TRUNCATE)
--  Supabase Dashboard > SQL Editor. Selamat — app tak guna langsung.
--
--  KENAPA: Supabase secara default beri REFERENCES/TRIGGER/TRUNCATE
--  kepada anon & authenticated. App tak perlukannya. TRUNCATE khususnya
--  boleh mengosongkan seluruh jadual & ia LANGKAU RLS — jadi dibuang.
--  SELECT peringkat-kolum & EXECUTE fungsi TIDAK terjejas.
-- =============================================================

revoke references, trigger, truncate
  on public.threads_leaderboard from anon, authenticated;

revoke references, trigger, truncate
  on public.contest_state       from anon, authenticated;

-- admins: pastikan anon/authenticated tiada apa-apa langsung pada jadual ini.
revoke all on public.admins from anon, authenticated;
