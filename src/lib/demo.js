// Data contoh untuk Mod Demo (bila Supabase belum disambung).
// Membolehkan anda lihat leaderboard, podium & skrin keputusan tanpa backend.

const mins = (n) => new Date(Date.now() - n * 60000).toISOString()

// Setiap baris ada `views` — skor = views (lihat lib/scoring).
export const DEMO_ENTRIES = [
  {
    id: 'demo-1',
    username: 'cikgu_math_online',
    threads_link: 'https://www.threads.net/@cikgu_math_online/post/demo1',
    views: 214800,
    updated_at: mins(12),
  },
  {
    id: 'demo-2',
    username: 'phonics_with_aisyah',
    threads_link: 'https://www.threads.net/@phonics_with_aisyah/post/demo2',
    views: 198350,
    updated_at: mins(45),
  },
  {
    id: 'demo-3',
    username: 'quranlab.my',
    threads_link: 'https://www.threads.net/@quranlab.my/post/demo3',
    views: 176420,
    updated_at: mins(90),
  },
  {
    id: 'demo-4',
    username: 'abah_homeschool',
    threads_link: 'https://www.threads.net/@abah_homeschool/post/demo4',
    views: 152900,
    updated_at: mins(30),
  },
  {
    id: 'demo-5',
    username: 'english_ceria',
    threads_link: 'https://www.threads.net/@english_ceria/post/demo5',
    views: 121075,
    updated_at: mins(210),
  },
  {
    id: 'demo-6',
    username: 'tadika_pintar',
    threads_link: 'https://www.threads.net/@tadika_pintar/post/demo6',
    views: 98640,
    updated_at: mins(320),
  },
  {
    id: 'demo-7',
    username: 'ummi_sains',
    threads_link: 'https://www.threads.net/@ummi_sains/post/demo7',
    views: 73210,
    updated_at: mins(500),
  },
]
