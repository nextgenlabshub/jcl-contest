-- =============================================================
--  SEMAKAN KESELAMATAN (READ-ONLY — tak ubah apa-apa)
--  Supabase Dashboard > SQL Editor > New query. Run selepas
--  migration_security_hardening.sql. Baca lajur "expected".
-- =============================================================

-- 1) RLS HIDUP? -----------------------------------------------
--  rls_enabled mesti = true untuk KETIGA-TIGA jadual.
select
  n.nspname                       as schema,
  c.relname                       as jadual,
  c.relrowsecurity                as rls_enabled,   -- expected: true
  c.relforcerowsecurity           as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('threads_leaderboard', 'contest_state', 'admins')
order by c.relname;


-- 2) POLICY YANG ADA ------------------------------------------
--  Expected:
--   threads_leaderboard -> HANYA "public_read" (SELECT). TIADA
--                          public_insert / public_update lagi.
--   contest_state       -> "state_read" (SELECT) + "state_update"
--                          (UPDATE, qual ada "is_admin").
--   admins              -> TIADA policy (senarai = 0 baris di bawah).
select
  tablename                       as jadual,
  policyname                      as policy,
  cmd                             as operasi,
  roles                           as untuk_role,
  qual                            as using_condition,
  with_check                      as with_check_condition
from pg_policies
where schemaname = 'public'
  and tablename in ('threads_leaderboard', 'contest_state', 'admins')
order by tablename, policyname;


-- 3) GRANT PADA JADUAL threads_leaderboard --------------------
--  PALING PENTING. Expected untuk 'anon' dan 'authenticated':
--   • SELECT  -> ADA (untuk kolum awam)
--   • INSERT  -> TIADA
--   • UPDATE  -> TIADA
--   • DELETE  -> TIADA
--  Kalau anon masih ada INSERT/UPDATE di sini => hardening BELUM jalan.
select
  grantee                         as role,
  privilege_type                  as kebenaran
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name   = 'threads_leaderboard'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;


-- 3b) GRANT PERINGKAT-KOLUM (pastikan `phone` TAK di-grant ke anon) ----
--  Expected: 'phone' TIDAK muncul untuk anon (privasi). Untuk anon
--  patut nampak SELECT pada kolum awam sahaja.
select
  grantee                         as role,
  column_name                     as kolum,
  privilege_type                  as kebenaran
from information_schema.column_privileges
where table_schema = 'public'
  and table_name   = 'threads_leaderboard'
  and grantee in ('anon', 'authenticated')
order by grantee, column_name, privilege_type;


-- 4) SIAPA ADMIN? ---------------------------------------------
--  Expected: TEPAT 1 baris = nextgenlabshub@gmail.com.
--  Kalau 0 baris => akaun belum wujud masa migration dijalankan;
--  cipta akaun di Authentication>Users, kemudian jalankan semula
--  bahagian "insert into public.admins ..." dalam migration.
select user_id, email, added_at
from public.admins
order by added_at;


-- 5) FUNGSI: security definer & wujud? ------------------------
--  Expected: 5 fungsi, security_definer = true untuk semua.
select
  p.proname                       as fungsi,
  p.prosecdef                     as security_definer,  -- expected: true
  pg_get_function_identity_arguments(p.oid) as argumen
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_admin', 'submit_entry',
    'admin_list_entries', 'admin_update_views', 'admin_delete_entry'
  )
order by p.proname;


-- 6) GRANT EXECUTE pada fungsi admin --------------------------
--  Expected: anon TIDAK boleh execute admin_* (hanya 'authenticated').
--  submit_entry & is_admin boleh untuk anon + authenticated.
select
  routine_name                    as fungsi,
  grantee                         as role,
  privilege_type                  as kebenaran
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name in (
    'is_admin', 'submit_entry',
    'admin_list_entries', 'admin_update_views', 'admin_delete_entry'
  )
  and grantee in ('anon', 'authenticated')
order by routine_name, grantee;
