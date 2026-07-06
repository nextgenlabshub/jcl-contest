import { supabase } from './supabase'

// Helper untuk Admin Dashboard (?admin pada URL). Login guna Supabase Auth
// (email + kata laluan). Semua tulisan pergi melalui RPC security-definer
// yang menyemak auth.uid() di server — lihat supabase/migration_admin.sql.

/** Log masuk admin. Pulangkan sesi jika berjaya, lontar ralat jika gagal. */
export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data.session
}

/** Log keluar admin. */
export async function adminSignOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Sesi semasa (null jika belum log masuk). */
export async function getAdminSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Langgan perubahan status auth. Pulangkan fungsi untuk berhenti langgan. */
export function onAdminAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) =>
    cb(session),
  )
  return () => data.subscription.unsubscribe()
}

/** Senarai penuh SEMUA penyertaan (termasuk no telefon). Admin sahaja. */
export async function adminListEntries() {
  const { data, error } = await supabase.rpc('admin_list_entries')
  if (error) throw error
  return data ?? []
}

/** Tetapkan views bagi satu penyertaan. */
export async function adminUpdateViews(id, views) {
  const { error } = await supabase.rpc('admin_update_views', {
    p_id: id,
    p_views: views,
  })
  if (error) throw error
}

/** Padam satu penyertaan (spam/duplikasi). */
export async function adminDeleteEntry(id) {
  const { error } = await supabase.rpc('admin_delete_entry', { p_id: id })
  if (error) throw error
}
