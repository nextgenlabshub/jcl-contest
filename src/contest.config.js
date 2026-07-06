// =============================================================
//  TETAPAN PERADUAN — edit fail ini sahaja untuk setiap kempen.
// =============================================================
export const contest = {
  title: 'Beat the Algo',
  subtitle: 'Kalahkan algoritma — kumpul views terbanyak di Threads. Top 4 menang hadiah!',

  // Pemenang ditentukan oleh VIEWS (impressions) tertinggi.
  // Nombor diisi peserta; disahkan dengan klik pautan thread (Threads papar
  // view count secara awam pada post). Nak tambah metrik lain? Tambah dalam
  // array ni dengan weight — sistem auto jadi skor gabungan.
  metrics: [{ key: 'views', label: 'Views', emoji: '👁️', weight: 1 }],

  // Tips naikkan views (dipaparkan dalam seksyen "Tips"). Edit ikut suka.
  tips: [
    'Komen di mana-mana post yang SAMA topik dengan fokus anda — sama ada Quran, 3M (menulis, mengira, membaca), Matematik sekolah rendah, atau apa-apa niche yang anda selesa. Tinggalkan komen berguna; ramai akan klik profil & Quote Post anda.',
    'Balas setiap komen dengan pantas — interaksi awal bantu algoritma tolak post anda lebih jauh.',
    'Kongsi Quote Post anda ke Story & group WhatsApp niche anda.',
    'Post & sebarkan pada waktu audience paling aktif (biasanya waktu malam).',
  ],

  // Link post utama rasmi (seed post). Peserta WAJIB Quote post ini.
  // Biar '' jika belum ada — butang akan papar "belum ditetapkan".
  // Contoh: 'https://www.threads.net/@akaun_anda/post/Cxxxxxx'
  mainPostUrl: 'https://www.threads.com/@amniazharan/post/DaZZOq6EvxA',

  // Tarikh & masa tamat peraduan (waktu Malaysia, +08:00).
  // Bila masa ini tiba: borang auto-kunci & keputusan auto keluar.
  // Biar '' untuk sembunyikan countdown.
  endsAt: '2026-07-16T00:00:00+08:00',

  // Bilangan pemenang yang dipaparkan di skrin keputusan.
  winnersCount: 4,

  // (Tidak lagi digunakan) — pentadbir kini log masuk di halaman ?admin
  // guna Supabase Auth (email + kata laluan). Lihat AdminDashboard.jsx.
  adminKey: '',

  // Hadiah — tukar 'reward' kepada hadiah sebenar anda.
  // `image`: letak gambar dalam folder `public/prizes/` dengan nama yang sama.
  // Jika gambar tiada, kad auto-tunjuk ikon pingat (tiada gambar rosak).
  prizes: [
    {
      place: 1,
      medal: '🥇',
      label: 'Juara (Top 1)',
      reward:
        'Emas 999 bentuk Rose exclusive 0.1g + Gelang Silver 925 Wah Chan full set',
      image: '/prizes/juara.jpg',
    },
    {
      place: 2,
      medal: '🥈',
      label: 'Naib Juara (Top 2)',
      reward: 'Gelang Silver Wah Chan full set',
      image: '/prizes/naib.jpg',
    },
    {
      place: 3,
      medal: '🥉',
      label: 'Tempat Ke-3 & Ke-4',
      reward: 'Gelang Silver Wah Chan full set',
      image: '/prizes/tempat3-4.jpg',
    },
  ],
}
