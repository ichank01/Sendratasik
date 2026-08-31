export interface RawCompetency {
  code: string;
  name: string;
  weight: number;
  description: string;
  indicators: string[];
}

export interface RawPosition {
  code: string;
  position_name: string;
  description: string;
  priority_weights: Record<string, number>;
}

export interface RawQuestion {
  competency_code: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  indicator: string;
  question_text: string;
  options: {
    A: { text: string; weight: number };
    B: { text: string; weight: number };
    C: { text: string; weight: number };
    D: { text: string; weight: number };
    E: { text: string; weight: number };
  };
  explanation: string;
}

export const SEED_COMPETENCIES: RawCompetency[] = [
  {
    code: 'KEPEMIMPINAN',
    name: 'Kepemimpinan',
    weight: 12,
    description: 'Kemampuan memimpin, memberi arah, ketegasan, keteladanan, tanggung jawab, dan pengambilan inisiatif secara bijaksana.',
    indicators: [
      'Memimpin dengan memberi contoh langsung',
      'Berani mengambil keputusan dengan mempertimbangkan masukan',
      'Memprioritaskan kepentingan visi organisasi SENDRATASIK'
    ]
  },
  {
    code: 'INTEGRITAS',
    name: 'Integritas & Kejujuran',
    weight: 10,
    description: 'Kejujuran, konsistensi moral, keterbukaan laporan kegiatan & keuangan, serta tidak menyalahgunakan amanah jabatan.',
    indicators: [
      'Transparansi dan ketepatan laporan keuangan/kegiatan',
      'Tidak memanfaatkan inventaris/fasilitas untuk kepentingan pribadi',
      'Berani mengakui kekeliruan dan bertanggung jawab memperbaikinya'
    ]
  },
  {
    code: 'DISIPLIN',
    name: 'Tanggung Jawab & Disiplin',
    weight: 10,
    description: 'Ketepatan waktu kehadiran gladi/latihan, komitmen menuntaskan tugas divisi, dan konsistensi dedikasi.',
    indicators: [
      'Disiplin waktu kehadiran gladi bersih dan rapat rutin',
      'Menuntaskan amanah tugas divisi hingga tuntas',
      'Dapat dipercaya dan konsisten dalam menjalankan jadwal'
    ]
  },
  {
    code: 'KOMUNIKASI',
    name: 'Komunikasi',
    weight: 8,
    description: 'Kemampuan menyampaikan gagasan secara asertif, mendengarkan aktif, serta komunikasi santun kepada anggota dan Pembina.',
    indicators: [
      'Menyampaikan instruksi dan kritik teknis secara konstruktif',
      'Komunikasi proaktif dengan Pembina dan pihak sekolah',
      'Mendengarkan aspirasi anggota tanpa menghakimi'
    ]
  },
  {
    code: 'KERJA_SAMA',
    name: 'Kerja Sama Tim',
    weight: 10,
    description: 'Kolaborasi lintas divisi (Musik, Tari, Drama, Humas, Sarpras), saling melengkapi, dan mengutamakan harmoni panggung.',
    indicators: [
      'Mendukung kelancaran divisi lain saat persiapan pementasan',
      'Menghargai keberagaman karakter dan talenta anggota',
      'Mengutamakan keselarasan ansambel di atas ego individu'
    ]
  },
  {
    code: 'PROBLEM_SOLVING',
    name: 'Problem Solving',
    weight: 10,
    description: 'Identifikasi akar masalah operasional pementasan, merumuskan solusi kreatif, dan evaluasi berkelanjutan.',
    indicators: [
      'Mengidentifikasi kendala teknis panggung dengan cepat',
      'Menyusun alternatif solusi yang realistis dan efisien',
      'Mengevaluasi faktor penghambat pasca kegiatan'
    ]
  },
  {
    code: 'PENGAMBILAN_KEPUTUSAN',
    name: 'Pengambilan Keputusan',
    weight: 8,
    description: 'Ketegasan memilih tindakan strategis berdasar pertimbangan risiko, data faktual, dan kondisi darurat pementasan.',
    indicators: [
      'Keberanian mengambil keputusan saat situasi kritis panggung',
      'Mempertimbangkan dampak risiko terhadap keselamatan & nama baik',
      'Bertanggung jawab penuh atas konsekuensi keputusan'
    ]
  },
  {
    code: 'MANAJEMEN_KONFLIK',
    name: 'Manajemen Konflik',
    weight: 7,
    description: 'Mediasi objektif, meredakan ketegangan antarpemain/pengurus, serta mencari solusi yang membangun kesatuan tim.',
    indicators: [
      'Mendengarkan dua belah pihak yang berselisih secara netral',
      'Mencegah perselisihan pribadi mengganggu profesionalitas latihan',
      'Mencapai kesepakatan damai (win-win solution)'
    ]
  },
  {
    code: 'MANAJEMEN_WAKTU',
    name: 'Manajemen Waktu',
    weight: 7,
    description: 'Penyusunan timeline produksi, manajemen jadwal latihan bersama, serta keseimbangan antara akademik dan organisasi.',
    indicators: [
      'Menyusun rundown dan jadwal produksi pertunjukan secara terukur',
      'Menjaga keseimbangan prestasi akademik dan kegiatan ekstrakurikuler',
      'Mencegah penundaan pekerjaan menjelang hari pementasan'
    ]
  },
  {
    code: 'KREATIVITAS',
    name: 'Kreativitas & Inisiatif',
    weight: 6,
    description: 'Inovasi konsep pertunjukan, aransemen, koreografi, tata panggung, dan inisiatif solutif tanpa harus menunggu instruksi.',
    indicators: [
      'Menyumbangkan ide artistik yang segar untuk konsep pementasan',
      'Mengambil langkah solutif proaktif saat melihat celah kendala',
      'Berani bereksperimen dengan tetap mengindahkan norma madrasah'
    ]
  },
  {
    code: 'ADAPTASI',
    name: 'Adaptasi & Ketahanan',
    weight: 6,
    description: 'Resiliensi terhadap perubahan mendadak jadwal panggung, kendala teknis tak terduga, dan penerimaan kritik membangun.',
    indicators: [
      'Tetap tenang dan fleksibel saat terjadi perubahan teknis panggung mendadak',
      'Menerima evaluasi dan kritik dari Pembina secara positif',
      'Cepat menyesuaikan formasi atau strategi saat kondisi berubah'
    ]
  },
  {
    code: 'PROFESIONALISME',
    name: 'Orientasi Prestasi & Profesionalisme',
    weight: 6,
    description: 'Dedikasi menjaga standar estetika pertunjukan, disiplin panggung, mengharumkan nama MAN Purbalingga di ajang seni.',
    indicators: [
      'Menjaga nama baik dan etika madrasah di setiap pementasan/festival',
      'Berorientasi pada kesempurnaan detail teknis seni',
      'Menjunjung tinggi etika berkesenian yang santun dan berkarakter'
    ]
  }
];

export const SEED_POSITIONS: RawPosition[] = [
  {
    code: 'KETUA',
    position_name: 'Ketua Umum Eksekutif SENDRATASIK',
    description: 'Pimpinan tertinggi yang bertanggung jawab atas seluruh arah kebijakan, visi pementasan, pembinaan anggota, dan koordinasi dengan Pembina & Madrasah.',
    priority_weights: {
      KEPEMIMPINAN: 25,
      PENGAMBILAN_KEPUTUSAN: 15,
      INTEGRITAS: 15,
      PROBLEM_SOLVING: 10,
      KOMUNIKASI: 10,
      KERJA_SAMA: 10,
      DISIPLIN: 10,
      PROFESIONALISME: 5
    }
  },
  {
    code: 'WAKIL_KETUA',
    position_name: 'Wakil Ketua Eksekutif',
    description: 'Mendampingi Ketua dalam pengawasan internal, koordinasi lintas divisi seni, serta pemecahan masalah operasional harian.',
    priority_weights: {
      KEPEMIMPINAN: 20,
      KERJA_SAMA: 15,
      PROBLEM_SOLVING: 15,
      KOMUNIKASI: 15,
      DISIPLIN: 15,
      ADAPTASI: 10,
      PENGAMBILAN_KEPUTUSAN: 10
    }
  },
  {
    code: 'SEKRETARIS',
    position_name: 'Sekretaris Eksekutif',
    description: 'Pengelola administrasi, persuratan izin, dokumentasi naskah/notulensi rapat, presensi latihan, dan arsip legalitas organisasi.',
    priority_weights: {
      KOMUNIKASI: 20,
      DISIPLIN: 20,
      MANAJEMEN_WAKTU: 20,
      INTEGRITAS: 15,
      PROBLEM_SOLVING: 15,
      PROFESIONALISME: 10
    }
  },
  {
    code: 'BENDAHARA',
    position_name: 'Bendahara Eksekutif',
    description: 'Pengelola kas organisasi, penyusunan RAB pementasan, pembukuan transparansi pengeluaran properti panggung, dan laporan pertanggungjawaban dana.',
    priority_weights: {
      INTEGRITAS: 25,
      DISIPLIN: 20,
      PROFESIONALISME: 15,
      PROBLEM_SOLVING: 15,
      MANAJEMEN_WAKTU: 15,
      PENGAMBILAN_KEPUTUSAN: 10
    }
  },
  {
    code: 'HUMAS',
    position_name: 'Koordinator Hubungan Masyarakat & Publikasi',
    description: 'Jembatan komunikasi dengan pihak luar, publikasi media sosial karya SENDRATASIK, kerja sama antar-ekskul, dan sambung rasa dengan alumni/pembina.',
    priority_weights: {
      KOMUNIKASI: 30,
      KERJA_SAMA: 20,
      ADAPTASI: 15,
      PROFESIONALISME: 15,
      INTEGRITAS: 10,
      KREATIVITAS: 10
    }
  },
  {
    code: 'SARPRAS',
    position_name: 'Koordinator Sarana, Prasarana & Tata Panggung',
    description: 'Penanggung jawab inventaris alat musik, kostum tari, tata cahaya/sound system, properti drama, serta kelayakan ruang latihan.',
    priority_weights: {
      DISIPLIN: 20,
      PROBLEM_SOLVING: 20,
      INTEGRITAS: 15,
      MANAJEMEN_WAKTU: 15,
      KERJA_SAMA: 15,
      PROFESIONALISME: 15
    }
  },
  {
    code: 'DIVISI_MUSIK',
    position_name: 'Koordinator Divisi Seni Musik / Vokal',
    description: 'Pemimpin teknis aransemen instrumen/vokal, penjadwalan latihan musik pengiring, dan harmonisasi ansambel pertunjukan.',
    priority_weights: {
      KREATIVITAS: 20,
      KERJA_SAMA: 20,
      DISIPLIN: 15,
      PROBLEM_SOLVING: 15,
      ADAPTASI: 10,
      PROFESIONALISME: 10,
      KEPEMIMPINAN: 10
    }
  },
  {
    code: 'DIVISI_TARI',
    position_name: 'Koordinator Divisi Seni Tari & Koreografi',
    description: 'Pemimpin teknis koreografi tari tradisional/kreasi, keselarasan gerak, wiraga-wirama-wirasa penari, dan fitting kostum tari.',
    priority_weights: {
      KREATIVITAS: 20,
      KERJA_SAMA: 20,
      DISIPLIN: 20,
      ADAPTASI: 15,
      PROFESIONALISME: 15,
      KEPEMIMPINAN: 10
    }
  },
  {
    code: 'DIVISI_DRAMA',
    position_name: 'Koordinator Divisi Seni Drama & Teater',
    description: 'Pemimpin pendalaman naskah lakon, penghayatan karakter, olah vokal aktor/aktris, blocking panggung, dan sinergi adegan dramatik.',
    priority_weights: {
      KOMUNIKASI: 25,
      KREATIVITAS: 20,
      ADAPTASI: 20,
      KERJA_SAMA: 15,
      PROBLEM_SOLVING: 10,
      PROFESIONALISME: 10
    }
  }
];

export const SEED_QUESTIONS: RawQuestion[] = [
  // --- 1. KEPEMIMPINAN (7 Soal) ---
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Sulit',
    indicator: 'Memimpin dengan memberi arahan terstruktur dalam krisis pementasan',
    question_text: 'Dua hari menjelang Pagelaran Akbar SENDRATASIK MAN Purbalingga, hasil gladi bersih menunjukkan tempo musik pengiring dan dinamika blocking penari belum selaras. Sebagai koordinator pertunjukan, langkah strategis yang paling tepat Anda ambil adalah...',
    options: {
      A: { text: 'Mengumpulkan koordinator musik dan tari untuk membedah titik ketidakselarasan pada rekaman gladi, menyepakati count ketukan baku, lalu menggelar latihan bersama terfokus malam itu.', weight: 5 },
      B: { text: 'Menyerahkan sepenuhnya kepada Pembina untuk memutuskan divisi mana yang harus mengalah dan menyesuaikan tempo.', weight: 3 },
      C: { text: 'Menambah durasi latihan umum secara maraton tanpa jeda hingga kedua tim merasa hafal sendiri.', weight: 2 },
      D: { text: 'Menegur keras kedua koordinator di hadapan seluruh anggota agar mereka menyadari kesalahan dan berlatih lebih serius.', weight: 1 },
      E: { text: 'Meminta koordinator musik menurunkan tempo aransemen dan meminta koordinator tari memangkas koreografi yang terlalu cepat.', weight: 4 }
    },
    explanation: 'Opsi A mengedepankan kepemimpinan berbasis data (rekaman gladi), kolaborasi konstruktif, dan tindakan terarah.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Sedang',
    indicator: 'Keteladanan dan pembagian tugas dalam tim kepengurusan',
    question_text: 'Sebagai Ketua terpilih, Anda mendapati beberapa anggota pengurus baru bersikap pasif dan hanya menunggu instruksi spesifik sebelum bergerak. Cara terbaik Anda untuk menggerakkan kepengurusan adalah...',
    options: {
      A: { text: 'Mengambil alih seluruh pekerjaan agar program kerja tetap berjalan sesuai target madrasah.', weight: 2 },
      B: { text: 'Memetakan potensi masing-masing pengurus, mendelegasikan tugas secara terperinci dengan indikator jelas, serta mendampingi secara konsisten.', weight: 5 },
      C: { text: 'Membuat sistem sanksi denda bagi pengurus yang tidak proaktif dalam setiap rapat.', weight: 1 },
      D: { text: 'Mengadakan evaluasi berkala dan memberikan apresiasi terbuka bagi pengurus yang mulai menunjukkan inisiatif.', weight: 4 },
      E: { text: 'Membiarkan mereka hingga menyadari sendiri tanggung jawab yang telah diembannya.', weight: 3 }
    },
    explanation: 'Opsi B mencerminkan kepemimpinan memberdayakan (empowering) dengan pendampingan dan pembagian tanggung jawab yang jelas.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Sedang',
    indicator: 'Menghadapi penolakan terhadap keputusan strategis',
    question_text: 'Dalam rapat persiapan lomba seni tingkat kabupaten, sebagian besar pengurus mengusulkan tema klasik yang aman, sementara Anda dan divisi kreatif meyakini tema eksperimental berakar kearifan Purbalingga memiliki peluang juara lebih tinggi. Sikap kepemimpinan Anda adalah...',
    options: {
      A: { text: 'Menggunakan hak veto Ketua untuk langsung menetapkan tema eksperimental tanpa perdebatan lanjutan.', weight: 2 },
      B: { text: 'Memaparkan analisis komparatif peluang juara, mendengar kekhawatiran pengurus lain, lalu mencari sintesis konsep yang memadukan kekuatan keduanya.', weight: 5 },
      C: { text: 'Mengikuti suara terbanyak secara mutlak demi menjaga suasana rapat tetap damai meskipun peluang juara berkurang.', weight: 3 },
      D: { text: 'Menyerahkan keputusan sepenuhnya kepada voting cepat tanpa penjelasan mendalam.', weight: 4 },
      E: { text: 'Membatalkan keikutsertaan lomba karena internal pengurus belum memiliki kesatuan pandangan.', weight: 1 }
    },
    explanation: 'Opsi B memadukan ketegasan visi dengan keterbukaan dialog dan sintesis gagasan.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Mudah',
    indicator: 'Menjaga motivasi tim saat mengalami kegagalan',
    question_text: 'SENDRATASIK MAN Purbalingga belum berhasil meraih juara 1 dalam ajang festival drama tingkat karesidenan. Anggota merasa sangat kecewa dan terpuruk. Tindakan Anda sebagai salah satu pimpinan organisasi adalah...',
    options: {
      A: { text: 'Menghindari pembahasan hasil lomba selama sebulan agar suasana dingin terlebih dahulu.', weight: 2 },
      B: { text: 'Menyalahkan divisi yang dinilai melakukan kesalahan teknis di atas panggung.', weight: 1 },
      C: { text: 'Mengumpulkan seluruh tim, mengapresiasi kerja keras bersama, lalu memfasilitasi sesi evaluasi reflektif yang fokus pada pertumbuhan karya berikutnya.', weight: 5 },
      D: { text: 'Membuat surat permohonan maaf terbuka kepada madrasah atas kegagalan tersebut.', weight: 3 },
      E: { text: 'Mengajak anggota fokus pada kegiatan rekreasi dan menunda rencana evaluasi teknis.', weight: 4 }
    },
    explanation: 'Opsi C menunjukkan ketahanan mental pemimpin yang mampu menjaga moral tim sekaligus mengonversi kegagalan menjadi pembelajaran terstruktur.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Sedang',
    indicator: 'Mengakomodasi regenerasi dan kaderisasi anggota',
    question_text: 'Saat menyusun susunan panitia pergelaran tahunan, Anda melihat beberapa adik kelas kelas X memiliki potensi tinggi tetapi ragu untuk memegang peran penanggung jawab seksi. Tindakan kepemimpinan Anda adalah...',
    options: {
      A: { text: 'Memasangkan anggota kelas X tersebut sebagai wakil atau partner dengan pengurus senior kelas XI yang berpengalaman sebagai mentor.', weight: 5 },
      B: { text: 'Hanya memberikan mereka tugas-tugas teknis ringan seperti konsumsi atau kebersihan.', weight: 2 },
      C: { text: 'Memaksa mereka langsung menjadi ketua seksi agar mereka terbiasa di bawah tekanan tinggi.', weight: 3 },
      D: { text: 'Menunda pelibatan mereka hingga tahun depan saat mereka sudah naik ke kelas XI.', weight: 1 },
      E: { text: 'Memberikan materi pembekalan teori kepanitiaan tanpa memberi peran tanggung jawab nyata.', weight: 4 }
    },
    explanation: 'Opsi A mewujudkan prinsip kaderisasi berjenjang melalui sistem mentoring aktif.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Sulit',
    indicator: 'Menangani situasi ketua umum berhalangan mendadak',
    question_text: 'Pada hari H pementasan wisuda madrasah, Ketua Umum tiba-tiba sakit keras dan tidak dapat hadir ke lokasi. Anda adalah salah satu koordinator inti. Sikap yang paling tepat adalah...',
    options: {
      A: { text: 'Menunggu arahan tertulis dari Ketua Umum melalui WhatsApp sebelum mengambil tindakan apa pun.', weight: 2 },
      B: { text: 'Segera berkoordinasi dengan Pembina dan Wakil Ketua untuk mengaktifkan rantai komando darurat, membagi PIC panggung, dan memastikan rundown tetap berjalan.', weight: 5 },
      C: { text: 'Mengumumkan kepada pihak panitia wisuda bahwa penampilan SENDRATASIK sebaiknya dibatalkan.', weight: 1 },
      D: { text: 'Mengambil alih seluruh peran kendali panggung seorang diri tanpa berkonsultasi dengan pembina.', weight: 3 },
      E: { text: 'Meminta perwakilan pengurus menjenguk Ketua ke rumah sakit sementara sisa tim menunggu perkembangan.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan kepemimpinan adaptif dengan aktivasi sistem komando cadangan dan koordinasi resmi.'
  },
  {
    competency_code: 'KEPEMIMPINAN',
    difficulty: 'Mudah',
    indicator: 'Memberikan teladan disiplin waktu latihan',
    question_text: 'Sebagai calon pengurus, Anda melihat fenomena keterlambatan hadir latihan sudah mulai dianggap biasa oleh sebagian anggota. Contoh tindakan kepemimpinan nyata yang harus Anda lakukan adalah...',
    options: {
      A: { text: 'Selalu hadir 15 menit sebelum jadwal, membantu mempersiapkan aula/alat, dan menyapa anggota yang datang tepat waktu dengan ramah.', weight: 5 },
      B: { text: 'Membuat sindiran di grup WhatsApp tentang pentingnya disiplin.', weight: 2 },
      C: { text: 'Ikut datang terlambat karena menganggap latihan pasti molor dari jadwal semula.', weight: 1 },
      D: { text: 'Mengusulkan aturan hukuman fisik bagi yang terlambat lebih dari 10 menit.', weight: 3 },
      E: { text: 'Mencatat semua nama yang terlambat dan menyerahkannya kepada Pembina.', weight: 4 }
    },
    explanation: 'Opsi A menegakkan prinsip kepemimpinan berbasis keteladanan (leading by example).'
  },

  // --- 2. INTEGRITAS & KEJUJURAN (6 Soal) ---
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Sulit',
    indicator: 'Transparansi dan pertanggungjawaban anggaran kas',
    question_text: 'Setelah selesai membeli bahan kostum dan properti panggung di pasar Purbalingga, Anda menyadari ada selisih lebih uang sisa belanja sebesar Rp150.000 karena toko memberikan diskon khusus tanpa kuitansi resmi terpisah. Tindakan Anda adalah...',
    options: {
      A: { text: 'Memasukkan uang tersebut ke kas pribadi sebagai uang lelah karena telah berbelanja seharian.', weight: 1 },
      B: { text: 'Menggunakan uang tersebut untuk mentraktir makan anggota tim belanja tanpa mencatatnya di buku kas.', weight: 2 },
      C: { text: 'Mencatat nominal real pembelian di nota internal, menyerahkan sisa uang secara utuh ke Bendahara disertai catatan penjelasan tertulis.', weight: 5 },
      D: { text: 'Menyimpan uang tersebut sebagai dana darurat pribadi divisi tanpa memberitahu pengurus lain.', weight: 3 },
      E: { text: 'Membuat kuitansi rekayasa agar totalnya pas dengan anggaran awal yang dicairkan.', weight: 4 }
    },
    explanation: 'Opsi C menjunjung tinggi kejujuran, akuntabilitas, dan pencatatan kas organisasi yang transparan.'
  },
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Sedang',
    indicator: 'Pemanfaatan fasilitas dan inventaris ekstrakurikuler',
    question_text: 'Teman sekelas Anda yang bukan anggota SENDRATASIK ingin meminjam mikrofon wireless dan sound portabel milik ekskul untuk acara kumpul komunitas di luar sekolah tanpa surat izin resmi. Sikap integritas Anda adalah...',
    options: {
      A: { text: 'Meminjamkannya secara diam-diam karena yakin teman tersebut dapat dipercaya menjaga alat.', weight: 1 },
      B: { text: 'Meminta imbalan uang sewa pribadi sebagai syarat peminjaman alat inventaris.', weight: 2 },
      C: { text: 'Menjelaskan dengan sopan bahwa aset organisasi terikat SOP inventaris madrasah dan mengarahkannya menempuh prosedur izin resmi ke Pembina/Sarpras.', weight: 5 },
      D: { text: 'Menolak secara kasar dan memarahinya karena berani meminjam aset madrasah.', weight: 3 },
      E: { text: 'Mengizinkan peminjaman asalkan barang dikembalikan sebelum jam latihan ekskul dimulai.', weight: 4 }
    },
    explanation: 'Opsi C memegang teguh regulasi dan etika pengelolaan aset organisasi madrasah.'
  },
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Sedang',
    indicator: 'Kejujuran dalam mengakui kesalahan teknis',
    question_text: 'Saat menyeting kabel mixer audio di panggung, Anda tidak sengaja menyenggol kabel hingga jack patah di dalam soket. Tidak ada orang lain yang melihat kejadian tersebut. Tindakan Anda adalah...',
    options: {
      A: { text: 'Membiarkan alat tersebut dan berpura-pura tidak tahu saat tim audio mendapati kerusakan.', weight: 1 },
      B: { text: 'Segera melapor kepada koordinator Sarpras dan Pembina, menceritakan kronologi sebenarnya, dan menawarkan solusi atau membantu perbaikan.', weight: 5 },
      C: { text: 'Menyalahkan kabel yang kondisinya sudah usang agar tidak dianggap sebagai kelalaian pribadi.', weight: 2 },
      D: { text: 'Mencoba menempelkan patahan dengan lem secara rahasia tanpa memberitahu siapa pun.', weight: 3 },
      E: { text: 'Melapor kepada teman terdekat saja agar tidak dimarahi pengurus senior.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan integritas tinggi, keberanian moral mengakui kekhilafan, dan orientasi pertanggungjawaban.'
  },
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Mudah',
    indicator: 'Objektivitas dalam proses seleksi pemeran/posisi',
    question_text: 'Anda menjadi salah satu tim penilai seleksi pemeran utama drama. Sahabat akrab Anda ikut audisi, tetapi penampilannya secara obyektif masih di bawah peserta lain yang belum Anda kenal akrab. Sikap Anda adalah...',
    options: {
      A: { text: 'Memberikan nilai tinggi kepada sahabat agar ia tidak kecewa dan persahabatan tetap terjaga.', weight: 1 },
      B: { text: 'Memberikan penilaian secara adil dan objektif sesuai rubrik baku, serta memberi masukan suportif kepada sahabat di luar sesi seleksi.', weight: 5 },
      C: { text: 'Sengaja memberi nilai sangat rendah kepada sahabat agar tidak dicurigai bersikap nepotisme.', weight: 3 },
      D: { text: 'Menyerahkan form penilaian sahabat kepada juri lain tanpa memberikan feedback apa pun.', weight: 4 },
      E: { text: 'Mengusulkan penambahan kuota peran utama agar sahabat tetap bisa masuk.', weight: 2 }
    },
    explanation: 'Opsi B menegakkan profesionalitas dan keadilan berbasis rubrik tanpa mengorbankan hubungan personal.'
  },
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Sedang',
    indicator: 'Konsistensi kehadiran dan pembagian komitmen',
    question_text: 'Anda telah berjanji hadir pada rapat evaluasi bulanan SENDRATASIK. Tiba-tiba teman bermain mengajak Anda pergi menonton turnamen yang sangat Anda minati pada jam yang sama. Tindakan Anda adalah...',
    options: {
      A: { text: 'Pergi menonton dan membuat alasan sakit di grup kepengurusan.', weight: 1 },
      B: { text: 'Tetap memprioritaskan menghadiri rapat evaluasi sesuai komitmen yang telah disepakati bersama.', weight: 5 },
      C: { text: 'Menghadiri rapat sebentar selama 10 menit lalu pamit pulang lebih awal dengan alasan dibuat-buat.', weight: 2 },
      D: { text: 'Meminta izin secara jujur kepada pimpinan rapat jika ada materi yang bisa Anda pelajari via notulensi.', weight: 4 },
      E: { text: 'Mengusulkan penundaan jadwal rapat demi kepentingan pribadi Anda.', weight: 3 }
    },
    explanation: 'Opsi B mencerminkan loyalitas integritas moral terhadap komitmen organisasi.'
  },
  {
    competency_code: 'INTEGRITAS',
    difficulty: 'Sulit',
    indicator: 'Menjaga kerahasiaan data dan dokumen organisasi',
    question_text: 'Sebagai calon sekretaris, Anda memiliki akses ke draf penilaian internal dan catatan evaluasi karakter anggota dari Pembina. Teman Anda mendesak ingin melihat catatan tentang dirinya. Sikap Anda adalah...',
    options: {
      A: { text: 'Memperlihatkan dokumen tersebut asalkan teman tersebut berjanji tidak memberitahu siapa pun.', weight: 1 },
      B: { text: 'Membacakan rangkuman secara lisan di tempat tersembunyi.', weight: 2 },
      C: { text: 'Menolak dengan santun dan menjelaskan bahwa dokumen evaluasi bersifat konfidensial, serta menyarankannya berkonsultasi langsung ke Pembina.', weight: 5 },
      D: { text: 'Mengabaikan permintaan tersebut tanpa memberikan penjelasan apa pun sehingga timbul kecurigaan.', weight: 3 },
      E: { text: 'Memberikan informasi umum yang positif saja tanpa membuka dokumen resmi.', weight: 4 }
    },
    explanation: 'Opsi C menjaga etika kerahasiaan data organisasi secara profesional.'
  },

  // --- 3. TANGGUNG JAWAB & DISIPLIN (6 Soal) ---
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Sedang',
    indicator: 'Menuntaskan amanah sesuai tenggat waktu',
    question_text: 'Anda ditugaskan menyusun draf proposal izin pementasan ke kepala madrasah dengan tenggat waktu esok pagi. Pada malam hari, Anda merasa lelah setelah jadwal gladi. Tindakan Anda adalah...',
    options: {
      A: { text: 'Menunda pengerjaan dan baru menyusunnya esok hari di sela-sela jam pelajaran pertama.', weight: 2 },
      B: { text: 'Mengatur waktu istirahat singkat, lalu menyelesaikan draf proposal secara cermat dan mengirimkannya tepat waktu kepada Pembina untuk direview.', weight: 5 },
      C: { text: 'Mengirimkan draf seadanya yang belum dicek kerapian dan kelengkapannya.', weight: 3 },
      D: { text: 'Meminta teman lain mengerjakan bagian Anda secara mendadak lewat pesan singkat.', weight: 1 },
      E: { text: 'Mengerjakan draf inti terlebih dahulu dan melengkapi lampiran pagi hari sebelum rapat.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan dedikasi menyelesaikan amanah dengan manajemen energi yang baik.'
  },
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Mudah',
    indicator: 'Kepatuhan terhadap tata tertib ruang latihan/aula',
    question_text: 'SOP penggunaan Sanggar Seni MAN Purbalingga mewajibkan penataan kembali karpet tari, peletakan alat musik pada rak khusus, dan mematikan AC sebelum ruang dikunci. Seusai latihan lelah, sebagian anggota langsung pulang. Sikap Anda adalah...',
    options: {
      A: { text: 'Ikut langsung pulang karena merasa sudah lelah berlatih.', weight: 1 },
      B: { text: 'Bersama pengurus yang ada mengajak anggota yang tersisa merapikan sanggar sesuai SOP hingga tuntas sebelum mengunci ruangan.', weight: 5 },
      C: { text: 'Memotret ruangan yang berantakan lalu mengeluh di status media sosial.', weight: 2 },
      D: { text: 'Hanya merapikan alat musik milik divisi sendiri dan mengabaikan bagian lain.', weight: 3 },
      E: { text: 'Melaporkan nama-nama yang langsung pulang kepada satpam madrasah.', weight: 4 }
    },
    explanation: 'Opsi B mewujudkan disiplin kolektif dan kepedulian terhadap fasilitas bersama.'
  },
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Sedang',
    indicator: 'Konsistensi pelaksanaan program kerja divisi',
    question_text: 'Divisi Anda memiliki jadwal latihan rutin mingguan setiap Jumat sore. Namun, dua minggu berturut-turut jumlah peserta yang hadir berkurang karena cuaca sering hujan. Sikap tanggung jawab Anda adalah...',
    options: {
      A: { text: 'Membatalkan seluruh jadwal latihan rutin hingga musim hujan selesai.', weight: 1 },
      B: { text: 'Mengevaluasi kendala kehadiran, merancang modul materi teori/bedah naskah yang bisa dilakukan fleksibel, dan mengingatkan komitmen anggota dengan empati.', weight: 5 },
      C: { text: 'Mengurangi target pementasan secara drastis.', weight: 2 },
      D: { text: 'Tetap menjalankan latihan hanya dengan mereka yang hadir tanpa peduli materi tertinggal bagi yang absen.', weight: 4 },
      E: { text: 'Memberikan surat peringatan keras kepada semua anggota yang tidak hadir.', weight: 3 }
    },
    explanation: 'Opsi B menunjukkan tanggung jawab adaptif dalam menjaga kontinuitas program kerja.'
  },
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Sulit',
    indicator: 'Keseimbangan tanggung jawab akademik dan ekstrakurikuler',
    question_text: 'Pekan depan bertepatan dengan pelaksanaan Penilaian Akhir Semester (PAS) madrasah sekaligus persiapan panggung seni milad. Cara Anda menunjukkan tanggung jawab dan disiplin adalah...',
    options: {
      A: { text: 'Fokus 100% pada seni dan mengabaikan nilai PAS karena menganggap seni lebih penting.', weight: 1 },
      B: { text: 'Membuat jadwal harian yang ketat antara jam belajar intensif PAS dan slot latihan yang efisien, serta berkomunikasi dengan tim jika perlu penyesuaian durasi.', weight: 5 },
      C: { text: 'Mengundurkan diri sementara dari ekstrakurikuler secara mendadak tanpa serah terima tugas.', weight: 2 },
      D: { text: 'Meminta dispensasi khusus kepada guru untuk tidak mengikuti beberapa mata pelajaran PAS.', weight: 3 },
      E: { text: 'Belajar dengan sistem kebut semalam setelah larut malam gladi.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan profil siswa madrasah berprestasi yang mampu membagi prioritas secara terencana.'
  },
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Sedang',
    indicator: 'Menjaga konsistensi kehadiran gladi bersih',
    question_text: 'Anda merupakan pemain musik gamelan pengiring drama. Menjelang gladi bersih terakhir, Anda merasa agak flu ringan namun masih sanggup beraktivitas normal. Tindakan Anda adalah...',
    options: {
      A: { text: 'Tidak hadir sama sekali tanpa memberi kabar karena merasa berhak beristirahat.', weight: 1 },
      B: { text: 'Meminum obat/vitamin, memakai masker pelindung, tetap hadir tepat waktu untuk menjaga keselarasan ansambel, dan mengomunikasikan kondisi fisik pada koordinator.', weight: 5 },
      C: { text: 'Datang hanya saat bagian musik Anda dimainkan lalu langsung pulang.', weight: 3 },
      D: { text: 'Meminta orang lain yang belum pernah berlatih menggantikan Anda mendadak.', weight: 2 },
      E: { text: 'Menghubungi koordinator beberapa menit sebelum gladi dimulai untuk meminta izin.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan komitmen tinggi pada keutuhan penampilan kelompok dengan mitigasi kesehatan yang bijak.'
  },
  {
    competency_code: 'DISIPLIN',
    difficulty: 'Mudah',
    indicator: 'Menjaga kerapian dokumen presensi dan arsip',
    question_text: 'Sebagai pengurus, Anda mendapati lembar presensi latihan bulanan tercecer dan belum direkap ke buku induk selama dua pekan. Tindakan Anda adalah...',
    options: {
      A: { text: 'Mengumpulkan seluruh lembar fisik yang tercecer, menginput data presensi secara rapi ke spreadsheet arsip, dan meletakkan berkas pada map khusus.', weight: 5 },
      B: { text: 'Membuang lembar presensi lama dan membuat lembaran baru untuk bulan depan.', weight: 1 },
      C: { text: 'Menunggu sekretaris utama yang mengerjakannya sendiri.', weight: 2 },
      D: { text: 'Mengingatkan di grup agar lain kali presensi jangan sampai hilang.', weight: 4 },
      E: { text: 'Mengisi perkiraan presensi secara acak agar rekap terlihat penuh.', weight: 3 }
    },
    explanation: 'Opsi A mencerminkan kepedulian nyata dan disiplin administrasi.'
  },

  // --- 4. KOMUNIKASI (5 Soal) ---
  {
    competency_code: 'KOMUNIKASI',
    difficulty: 'Sedang',
    indicator: 'Menyampaikan kritik teknis secara konstruktif',
    question_text: 'Seorang penari baru sering salah ketukan pada babak transisi, yang membuat tempo tarian kacau. Cara terbaik Anda menyampaikan koreksi adalah...',
    options: {
      A: { text: 'Meneriakkan kesalahannya di depan panggung dengan mikrofon agar yang lain mendengar.', weight: 1 },
      B: { text: 'Mengajak penari tersebut berdiskusi empat mata saat jeda istirahat, menunjukkan rekaman ketukan yang tepat, dan mengajaknya berlatih perlahan bersama.', weight: 5 },
      C: { text: 'Menyuruhnya mundur ke barisan belakang tanpa memberi penjelasan teknis.', weight: 2 },
      D: { text: 'Membicarakan kesalahannya kepada anggota lain di belakang punggungnya.', weight: 3 },
      E: { text: 'Menegur koordinator tari agar segera mengganti penari tersebut.', weight: 4 }
    },
    explanation: 'Opsi B mengaplikasikan komunikasi asertif, empatik, dan solutif tanpa menjatuhkan mental anggota.'
  },
  {
    competency_code: 'KOMUNIKASI',
    difficulty: 'Sulit',
    indicator: 'Komunikasi diplomatik dan santun kepada Pembina/Pihak Madrasah',
    question_text: 'Usulan konsep panggung pertunjukan yang disusun tim Anda belum disetujui Pembina karena dinilai terlalu memakan banyak anggaran. Pendekatan komunikasi yang paling tepat adalah...',
    options: {
      A: { text: 'Melakukan protes keras dan mengancam membatalkan pementasan seni.', weight: 1 },
      B: { text: 'Memohon audiensi santun dengan Pembina, menyajikan simulasi revisi draf RAB efisien berbasis daur ulang properti, serta mendengarkan arahan beliau secara seksama.', weight: 5 },
      C: { text: 'Mengabaikan masukan Pembina dan tetap mencari dana luar secara sepihak tanpa izin.', weight: 2 },
      D: { text: 'Langsung menyerah dan membatalkan elemen dekorasi panggung sama sekali.', weight: 3 },
      E: { text: 'Membuat petisi di kalangan anggota untuk menekan keputusan Pembina.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan etika komunikasi santun kepada guru pembina dipadukan dengan solusi kreatif.'
  },
  {
    competency_code: 'KOMUNIKASI',
    difficulty: 'Mudah',
    indicator: 'Kejelasan alur informasi di grup komunikasi resmi',
    question_text: 'Terdapat perubahan jam gladi bersih yang dimajukan 1 jam lebih awal karena aula akan digunakan rapat dewan guru. Cara Anda mengomunikasikannya di grup WhatsApp ekskul adalah...',
    options: {
      A: { text: 'Hanya mengirim pesan singkat "Besok kumpul lebih pagi ya guys".', weight: 2 },
      B: { text: 'Membuat broadcast berstruktur jelas (hari/tanggal, jam baru, lokasi, agenda, alasan perubahan), meminta konfirmasi kehadiran (read/reply), dan menelepon koordinator divisi.', weight: 5 },
      C: { text: 'Mengirim pesan suara panjang tanpa ringkasan teks sehingga banyak yang melewatkannya.', weight: 3 },
      D: { text: 'Berharap setiap anggota saling mengabari secara berantai tanpa broadcast resmi.', weight: 1 },
      E: { text: 'Mengunggah poster gambar saja tanpa penjelasan keterangan di kolom chat.', weight: 4 }
    },
    explanation: 'Opsi B memastikan informasi krusial tersampaikan secara presisi, terstruktur, dan terverifikasi.'
  },
  {
    competency_code: 'KOMUNIKASI',
    difficulty: 'Sedang',
    indicator: 'Mendengarkan aktif aspirasi dan keluh kesah anggota',
    question_text: 'Beberapa anggota junior merasa jadwal latihan tambahan terlalu padat dan mengganggu waktu mengaji/les mereka. Sikap Anda saat menerima keluhan ini adalah...',
    options: {
      A: { text: 'Menghardik mereka dan mengatakan bahwa mereka tidak memiliki dedikasi terhadap seni.', weight: 1 },
      B: { text: 'Menyediakan waktu khusus untuk mendengarkan keluhan mereka secara terbuka, lalu mendiskusikan penyesuaian jadwal latihan agar lebih padat dan efektif tanpa memakan waktu berlebih.', weight: 5 },
      C: { text: 'Menyuruh mereka memilih antara keluar dari ekskul atau tetap ikut jadwal lama.', weight: 2 },
      D: { text: 'Mengabaikan keluhan karena merasa jadwal sudah disepakati di awal semester.', weight: 3 },
      E: { text: 'Menyerahkan masalah tersebut kepada wali kelas mereka masing-masing.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan keterampilan mendengarkan aktif dan merumuskan titik temu yang proporsional.'
  },
  {
    competency_code: 'KOMUNIKASI',
    difficulty: 'Sedang',
    indicator: 'Komunikasi publik dan representasi SENDRATASIK di luar sekolah',
    question_text: 'Saat diundang tampil pada acara seni tingkat kota, panitia luar sekolah menyampaikan komplain mengenai rundown penampilan SENDRATASIK yang dianggap melebihi batas waktu 5 menit. Cara Anda merespons adalah...',
    options: {
      A: { text: 'Menyalahkan panitia kota karena dinilai tidak memahami esensi karya seni yang utuh.', weight: 1 },
      B: { text: 'Menyampaikan permohonan maaf dengan santun, segera berkoordinasi dengan tim panggung untuk memangkas adegan transisi, dan menjaga hubungan baik dengan panitia.', weight: 5 },
      C: { text: 'Tetap melanjutkan pementasan sesuai durasi awal tanpa mempedulikan peringatan panitia.', weight: 2 },
      D: { text: 'Menghentikan pertunjukan seketika di tengah lagu sehingga panggung hening.', weight: 3 },
      E: { text: 'Meminta pembina untuk berdebat dengan pihak panitia kota.', weight: 4 }
    },
    explanation: 'Opsi B menjaga citra positif madrasah melalui diplomasi santun dan tindakan solutif cepat.'
  },

  // --- 5. KERJA SAMA TIM (6 Soal) ---
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Sedang',
    indicator: 'Kolaborasi lintas divisi seni',
    question_text: 'Divisi Tari membutuhkan properti payung lukis khusus, namun divisi Sarpras sedang kewalahan mempersiapkan panggung utama. Sebagai anggota yang berada di divisi Musik, tindakan kerja sama yang Anda lakukan adalah...',
    options: {
      A: { text: 'Fokus hanya pada instrumen musik sendiri dan tidak peduli dengan kendala divisi lain.', weight: 1 },
      B: { text: 'Setelah latihan musik selesai, berinisiatif mengajak rekan divisi musik membantu divisi tari membuat properti payung lukis bersama-sama.', weight: 5 },
      C: { text: 'Menyindir divisi Sarpras di grup karena dinilai lambat bekerja.', weight: 2 },
      D: { text: 'Menyarankan divisi tari membatalkan adegan payung agar tidak merepotkan.', weight: 3 },
      E: { text: 'Hanya memberikan saran lisan tanpa ikut turun tangan membantu secara fisik.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan semangat gotong royong dan kesadaran bahwa kesuksesan pementasan adalah kerja tim kolektif.'
  },
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Sulit',
    indicator: 'Mengikis ego sektoral antar cabang seni',
    question_text: 'Terjadi perdebatan antara divisi Teater/Drama dan divisi Musik; pemain teater merasa suara musik latar menenggelamkan dialog aktor, sementara pemusik merasa musiknya harus klimaks pada adegan tersebut. Sikap kolaboratif Anda adalah...',
    options: {
      A: { text: 'Membela divisi asal Anda secara membabi buta agar divisi Anda yang paling dominan di panggung.', weight: 1 },
      B: { text: 'Memfasilitasi uji coba balancing audio di panggung, menyesuaikan volume instrumen pengiring di bawah frekuensi vokal aktor, sehingga makna dramatik dan keindahan melodi saling menguatkan.', weight: 5 },
      C: { text: 'Mematikan seluruh musik latar selama dialog agar tidak ada perdebatan lagi.', weight: 2 },
      D: { text: 'Meminta aktor berteriak sekeras mungkin untuk mengimbangi volume musik.', weight: 3 },
      E: { text: 'Menyerahkan keputusan kepada penonton latihan untuk voting.', weight: 4 }
    },
    explanation: 'Opsi B mengedepankan harmoni seni ansambel dan penyelarasan teknis yang saling melengkapi.'
  },
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Mudah',
    indicator: 'Menghargai keragaman kemampuan anggota',
    question_text: 'Dalam kelompok persiapan vokal ensambel, terdapat seorang anggota yang lambat dalam membaca notasi angka. Sikap Anda dalam kelompok tersebut adalah...',
    options: {
      A: { text: 'Mengucilkannya dan meminta koordinator mencoretnya dari kelompok.', weight: 1 },
      B: { text: 'Dengan sabar membimbingnya menghafal ketukan dan melodi melalui rekaman vokal audio, sehingga ia bisa menyatu dengan harmoni tim.', weight: 5 },
      C: { text: 'Menyuruhnya hanya menggerakkan bibir (lip sync) saat tampil nanti.', weight: 2 },
      D: { text: 'Membiarkannya tertinggal tanpa memberi bantuan tambahan.', weight: 3 },
      E: { text: 'Mengeluhkan kelemahannya kepada anggota vokal yang lain.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan empati tim, inklusivitas, dan dedikasi membangun kapabilitas rekan sesama anggota.'
  },
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Sedang',
    indicator: 'Dukungan moral dan operasional saat rekan kelelahan',
    question_text: 'Rekan satu tim Anda di kepanitiaan tampak sangat kelelahan dan kewalahan menangani konsumsi pementasan yang harus dibagikan kepada 80 pengisi acara. Sikap Anda adalah...',
    options: {
      A: { text: 'Menonton dari kejauhan karena merasa itu bukan rincian tugas resmi divisi Anda.', weight: 1 },
      B: { text: 'Segera mendekat, mengambil bagian pembagian paket konsumsi untuk barisan pemain musik dan penari, serta memastikan rekan Anda mendapat waktu istirahat dan minum.', weight: 5 },
      C: { text: 'Menertawakannya karena terlihat panik mengurus konsumsi.', weight: 2 },
      D: { text: 'Melaporkan ke Ketua bahwa sie konsumsi bekerja lambat.', weight: 3 },
      E: { text: 'Menyuruh adik kelas lain untuk menggantikan rekan tersebut tanpa Anda sendiri ikut membantu.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan solidaritas nyata dan kesigapan membantu sesama rekan pengurus.'
  },
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Sedang',
    indicator: 'Menerima dan menjalankan kesepakatan bersama',
    question_text: 'Dalam musyawarah penentuan warna kostum, usulan warna favorit Anda kalah dalam voting demokratis dan terpilih konsep warna lain. Sikap kerja sama Anda adalah...',
    options: {
      A: { text: 'Menolak mengenakan kostum tersebut dan mengancam tidak ikut tampil.', weight: 1 },
      B: { text: 'Menerima hasil keputusan musyawarah dengan lapang dada, dan aktif mendukung proses penjahitan/fitting kostum terpilih agar tampil maksimal di panggung.', weight: 5 },
      C: { text: 'Mengikuti keputusan tetapi terus menggerutu sepanjang gladi.', weight: 2 },
      D: { text: 'Berusaha mengubah keputusan secara diam-diam di belakang panitia.', weight: 3 },
      E: { text: 'Hanya hadir saat tampil tanpa mau terlibat dalam persiapan kostum.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan kedewasaan berorganisasi dan kepatuhan pada komitmen musyawarah mufakat.'
  },
  {
    competency_code: 'KERJA_SAMA',
    difficulty: 'Sulit',
    indicator: 'Membangun sinergi dengan ekstrakurikuler lain',
    question_text: 'Pentas SENDRATASIK membutuhkan bantuan ekskul PKS untuk pengamanan dan ekskul Jurnalistik/Fotografi untuk dokumentasi panggung. Pendekatan kerja sama yang paling produktif adalah...',
    options: {
      A: { text: 'Menuntut mereka melayani seluruh kebutuhan SENDRATASIK tanpa koordinasi teknis.', weight: 1 },
      B: { text: 'Mengadakan rapat koordinasi bersama, memaparkan kebutuhan teknis secara detail, memberikan kartu identitas resmi, dan menyediakan konsumsi serta apresiasi yang layak bagi mereka.', weight: 5 },
      C: { text: 'Hanya mengirim surat resmi tanpa pernah mengajak mereka rapat koordinasi teknis.', weight: 3 },
      D: { text: 'Mengabaikan ekskul lain dan merekrut pihak luar berbayar.', weight: 2 },
      E: { text: 'Menyerahkan seluruh urusan hubungan antar-ekskul kepada pembina OSIS.', weight: 4 }
    },
    explanation: 'Opsi B membina kemitraan setara, saling menghormati, dan terkoordinasi rapi antarekskul madrasah.'
  },

  // --- 6. PROBLEM SOLVING (6 Soal) ---
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Sulit',
    indicator: 'Mengatasi gangguan teknis sound system saat pementasan berlangsung',
    question_text: 'Saat pertunjukan drama musikal sedang berlangsung di atas panggung, mikrofon pemeran utama tiba-tiba mati total di tengah dialog klimaks. Tindakan problem solving tercepat dan tertepat adalah...',
    options: {
      A: { text: 'Menghentikan seluruh musik dan menyuruh penonton menunggu hingga mikrofon diperbaiki.', weight: 1 },
      B: { text: 'Pemeran utama secara natural mendekat ke aktor pendamping yang menggunakan mikrofon aktif sambil memproyeksikan vokal diafragma lebih lantang, sementara kru panggung menyiapkan mic cadangan di sayap panggung.', weight: 5 },
      C: { text: 'Pemeran utama berlari ke belakang panggung meninggalkan adegan yang sedang berjalan.', weight: 2 },
      D: { text: 'Kru audio berteriak dari ruang operator memberi tahu bahwa baterai habis.', weight: 3 },
      E: { text: 'Pemain musik memainkan instrumen sekencang mungkin untuk menutupi ketiadaan suara vokal.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan improvisasi panggung profesional (the show must go on) dengan proyeksi suara dan koordinasi kru.'
  },
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Sedang',
    indicator: 'Mengatasi keterbatasan anggaran properti panggung',
    question_text: 'Naskah drama memerlukan setting latar keraton kuno yang megah, namun sisa anggaran Sarpras sangat minim. Solusi kreatif dan realistis yang Anda tawarkan adalah...',
    options: {
      A: { text: 'Memaksa setiap anggota membayar iuran pribadi dalam jumlah besar secara mendadak.', weight: 2 },
      B: { text: 'Memanfaatkan bahan kardus bekas tebal dan kain sisa yang dicat tekstur batu bata/ukiran kayu, dipadukan dengan teknik tata cahaya siluet lampu panggung yang dramatis.', weight: 5 },
      C: { text: 'Membatalkan seluruh pementasan drama dan menggantinya dengan baca puisi tunggal.', weight: 1 },
      D: { text: 'Menyewa properti mewah dari sanggar komersial meskipun berhutang kas.', weight: 3 },
      E: { text: 'Tampil di panggung kosong tanpa properti apa pun tanpa penyesuaian konsep.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan pemecahan masalah artistik yang ekonomis, kreatif, dan memaksimalkan tata artistik pencahayaan.'
  },
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Sedang',
    indicator: 'Mengatasi konflik jadwal pemakaian aula madrasah',
    question_text: 'Aula madrasah yang telah dijadwalkan untuk gladi kotor SENDRATASIK tiba-tiba harus digunakan untuk sosialisasi dinas pendidikan selama 2 jam. Tindakan problem solving Anda adalah...',
    options: {
      A: { text: 'Membuat keributan dan menolak mengosongkan aula.', weight: 1 },
      B: { text: 'Memindahkan sesi sementara ke teras sanggar atau kelas kosong untuk mematangkan hafalan dialog, olah vokal, dan blocking parsial, lalu menggunakan aula setelah sosialisasi selesai.', weight: 5 },
      C: { text: 'Membubarkan seluruh anggota dan meliburkan latihan hari itu.', weight: 2 },
      D: { text: 'Menunggu di depan pintu aula sambil mengeluh selama 2 jam penuh.', weight: 3 },
      E: { text: 'Mengalihkan latihan ke lapangan terbuka di bawah terik matahari tanpa rencana materi.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan fleksibilitas operasional dan pemanfaatan waktu secara optimal.'
  },
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Mudah',
    indicator: 'Identifikasi akar masalah penurunan semangat latihan',
    question_text: 'Selama sepekan terakhir, kualitas gerakan penari tampak layu dan tidak bertenaga. Langkah problem solving pertama yang harus Anda lakukan adalah...',
    options: {
      A: { text: 'Langsung menghukum penari dengan push up tanpa bertanya.', weight: 1 },
      B: { text: 'Mengidentifikasi akar penyebab melalui dialog santai (apakah faktor kelelahan fisik, kejenuhan koreografi, atau beban tugas sekolah) sebelum menyusun solusi penyesuaian metode latihan.', weight: 5 },
      C: { text: 'Mengganti seluruh materi tarian dengan gerakan baru dari awal.', weight: 2 },
      D: { text: 'Mengabaikan performa mereka karena menganggap nanti saat tampil di panggung pasti akan otomatis bersemangat.', weight: 3 },
      E: { text: 'Mengancam akan memotong nilai ekstrakurikuler mereka di rapor.', weight: 4 }
    },
    explanation: 'Opsi B mengedepankan identifikasi akar masalah (root cause analysis) sebelum melompat pada tindakan korektif.'
  },
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Sulit',
    indicator: 'Mitigasi properti panggung patah saat gladi resik',
    question_text: 'Saat gladi resik berlangsung 3 jam sebelum penonton masuk, tongkat pusaka yang menjadi instrumen utama dalam tarian drama patah menjadi dua bagian. Tindakan Anda adalah...',
    options: {
      A: { text: 'Menangis panik dan menyalahkan penari yang memegang properti tersebut.', weight: 1 },
      B: { text: 'Segera mengamankan patahan, menggunakan lem kayu kuat dan kawat penguat internal dilapisi lilitan kain prada emas yang selaras dengan kostum sehingga kokoh dan tetap estetik.', weight: 5 },
      C: { text: 'Menghapus adegan pusaka dari naskah drama secara mendadak.', weight: 3 },
      D: { text: 'Menyuruh anggota mencari toko barang antik di luar kota saat itu juga.', weight: 2 },
      E: { text: 'Mengganti tongkat dengan sapu seadanya tanpa dekorasi.', weight: 4 }
    },
    explanation: 'Opsi B merupakan solusi perbaikan darurat yang cerdas dan menjaga estetika visual pertunjukan.'
  },
  {
    competency_code: 'PROBLEM_SOLVING',
    difficulty: 'Sedang',
    indicator: 'Mengatasi kekurangan alat musik pengiring',
    question_text: 'Jumlah kendang dan gamelan di madrasah terbatas untuk mengiringi pergelaran kolosal. Solusi pemecahan masalah yang paling tepat adalah...',
    options: {
      A: { text: 'Memaksa madrasah membeli set gamelan baru minggu ini juga.', weight: 1 },
      B: { text: 'Menggabungkan instrumen akustik modern (seperti jimbe, cajon, kibor ber-sample gamelan) dan teknik vokal senggakan secara harmonis untuk melengkapi orkestrasi.', weight: 5 },
      C: { text: 'Hanya menggunakan rekaman kaset MP3 bajakan berkualitas rendah.', weight: 2 },
      D: { text: 'Membatalkan seluruh unsur musik tradisional.', weight: 3 },
      E: { text: 'Meminjam dari sanggar luar tanpa ada yang bertanggung jawab atas transportasinya.', weight: 4 }
    },
    explanation: 'Opsi B menggabungkan kreativitas aransemen fusi dan solusi realistis.'
  },

  // --- 7. PENGAMBILAN KEPUTUSAN (5 Soal) ---
  {
    competency_code: 'PENGAMBILAN_KEPUTUSAN',
    difficulty: 'Sulit',
    indicator: 'Mengambil keputusan tegas saat cuaca ekstrem panggung terbuka',
    question_text: 'Pementasan seni diselenggarakan di panggung outdoor lapangan madrasah. Saat acara baru berlangsung separuh, angin kencang dan rintik hujan mulai membasahi kabel sound system serta lampu panggung. Sebagai koordinator lapangan, keputusan Anda adalah...',
    options: {
      A: { text: 'Membiarkan acara tetap berjalan di panggung terbuka demi menjaga antusiasme penonton tanpa peduli risiko sengatan listrik.', weight: 1 },
      B: { text: 'Menginstruksikan pemutusan sementara arus listrik utama, memandu evakuasi instrumen & pemain ke aula tertutup, lalu melanjutkan pementasan dalam format adaptasi indoor.', weight: 5 },
      C: { text: 'Langsung membubarkan seluruh penonton dan membatalkan sisa acara tanpa opsi lanjutan.', weight: 2 },
      D: { text: 'Meminta para pemain memegang payung di atas panggung di samping instalasi listrik bertegangan tinggi.', weight: 3 },
      E: { text: 'Melarikan diri ke ruang guru tanpa memberikan instruksi kepada tim kru.', weight: 4 }
    },
    explanation: 'Opsi B memprioritaskan keselamatan jiwa (safety first) sekaligus memiliki rencana kontinjensi penyelamatan pementasan.'
  },
  {
    competency_code: 'PENGAMBILAN_KEPUTUSAN',
    difficulty: 'Sedang',
    indicator: 'Memilih pemeran pengganti dalam situasi darurat',
    question_text: 'Aktris utama drama mendadak dirawat di rumah sakit 1 hari sebelum pentas. Terdapat dua pilihan pengganti: (1) Asisten sutradara yang hafal seluruh dialog tapi kemampuan aktingnya standar, atau (2) Penari berbakat yang aktingnya memukau tapi baru hafal 60% naskah. Keputusan Anda adalah...',
    options: {
      A: { text: 'Memilih asisten sutradara yang telah menguasai alur cerita dan dialog demi meminimalkan risiko blang di panggung, sambil memoles ekspresinya secara intensif.', weight: 5 },
      B: { text: 'Memilih penari berbakat dan membiarkannya berimprovisasi ngawur saat lupa naskah.', weight: 2 },
      C: { text: 'Membatalkan seluruh pementasan drama.', weight: 1 },
      D: { text: 'Memaksa aktris yang sedang sakit untuk tetap keluar rumah sakit dan naik ke panggung.', weight: 3 },
      E: { text: 'Mengundi dengan melempar koin tanpa pertimbangan teknis.', weight: 4 }
    },
    explanation: 'Opsi A merupakan keputusan berbasis mitigasi risiko panggung yang paling terukur dan rasional.'
  },
  {
    competency_code: 'PENGAMBILAN_KEPUTUSAN',
    difficulty: 'Sedang',
    indicator: 'Keputusan alokasi sisa dana kas organisasi',
    question_text: 'Terdapat sisa kas surplus Rp500.000 setelah acara pergelaran sukses. Ada usulan untuk jalan-jalan makan bersama seluruh pengurus, dan usulan lain untuk servis/reparasi rebana dan kostum yang robek. Keputusan bijak Anda adalah...',
    options: {
      A: { text: 'Menghabiskan seluruh uang untuk makan di restoran mahal hingga kas nol rupiah.', weight: 1 },
      B: { text: 'Memprioritaskan 70% dana untuk servis alat musik & perawatan kostum sebagai investasi aset, dan 30% sisanya untuk syukuran sederhana snack kebersamaan pengurus.', weight: 5 },
      C: { text: 'Membagikan uang tunai kepada ketua dan pengurus inti saja.', weight: 2 },
      D: { text: 'Menyimpan seluruh uang tanpa perawatan alat meskipun alat rusak.', weight: 3 },
      E: { text: 'Menggunakan uang untuk membeli perlengkapan yang tidak dibutuhkan ekskul.', weight: 4 }
    },
    explanation: 'Opsi B menyeimbangkan keberlanjutan organisasi (pemeliharaan aset) dengan apresiasi kebersamaan tim secara proporsional.'
  },
  {
    competency_code: 'PENGAMBILAN_KEPUTUSAN',
    difficulty: 'Mudah',
    indicator: 'Ketegasan menolak tawaran sponsor yang melanggar norma madrasah',
    question_text: 'Sebuah produk komersial menawarkan dana sponsor besar untuk festival musik SENDRATASIK, namun menyaratkan pemajangan baliho promosi yang bertentangan dengan norma etika madrasah. Keputusan Anda adalah...',
    options: {
      A: { text: 'Menerima dana sponsor tersebut secara sembunyi-sembunyi demi kemewahan acara.', weight: 1 },
      B: { text: 'Menolak tawaran tersebut secara tegas dan sopan, lalu bersama tim mencari sponsor alternatif yang selaras dengan nilai-nilai madrasah.', weight: 5 },
      C: { text: 'Menerima sponsor dan berdebat dengan kepala madrasah jika ditegur.', weight: 2 },
      D: { text: 'Menyalahkan divisi dana usaha karena tidak mampu mencari sponsor lain.', weight: 3 },
      E: { text: 'Mengurangi anggaran acara dan membiarkan acara berlangsung apa adanya tanpa ikhtiar sponsor lain.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan integritas prinsip, ketegasan memegang marwah madrasah, dan komitmen mencari jalan keluar yang halal.'
  },
  {
    competency_code: 'PENGAMBILAN_KEPUTUSAN',
    difficulty: 'Sedang',
    indicator: 'Menentukan durasi maksimal penampilan agar tidak melanggar waktu salat',
    question_text: 'Acara pementasan seni sore hari molor karena sambutan tamu undangan terlalu lama. Waktu tersisa tinggal 20 menit sebelum azan Magrib berkumandang. Tindakan Anda adalah...',
    options: {
      A: { text: 'Tetap melanjutkan seluruh nomor pementasan hingga menabrak waktu salat Magrib.', weight: 1 },
      B: { text: 'Memutuskan secara cepat untuk memadatkan susunan acara, menampilkan nomor inti dengan durasi efisien sehingga acara selesai 5 menit sebelum azan Magrib berkumandang.', weight: 5 },
      C: { text: 'Menghentikan acara seketika saat itu juga tanpa penutupan yang layak.', weight: 3 },
      D: { text: 'Menyuruh pemain musik mempercepat tempo lagu hingga tidak beraturan.', weight: 2 },
      E: { text: 'Membiarkan para pengisi acara memutuskan sendiri apakah mau tampil atau tidak.', weight: 4 }
    },
    explanation: 'Opsi B mengambil keputusan adaptif yang menghormati waktu ibadah salat sekaligus memberikan sajian seni yang tuntas.'
  },

  // --- 8. MANAJEMEN KONFLIK (4 Soal) ---
  {
    competency_code: 'MANAJEMEN_KONFLIK',
    difficulty: 'Sulit',
    indicator: 'Mediasi perselisihan personal antarpemain inti',
    question_text: 'Dua orang penari utama yang berpasangan terlibat perselisihan pribadi di luar sekolah, sehingga saat latihan mereka menolak saling menatap dan gerakan tarian menjadi kaku tanpa penghayatan rasa (wirasa). Tindakan Anda untuk mengatasi konflik ini adalah...',
    options: {
      A: { text: 'Mengeluarkan salah satu penari secara sepihak agar suasana tidak canggung.', weight: 2 },
      B: { text: 'Mengajak kedua penari berdialog bersama di ruang tenang, mendengarkan duduk perkara secara netral, menegaskan komitmen profesionalitas demi nama baik panggung SENDRATASIK, dan memfasilitasi rekonsiliasi.', weight: 5 },
      C: { text: 'Membiarkan konflik tersebut dan berharap mereka akan akur sendiri saat di panggung.', weight: 1 },
      D: { text: 'Memarahi keduanya di depan seluruh anggota agar merasa malu.', weight: 3 },
      E: { text: 'Mengubah konsep tarian tunggal tanpa membicarakan masalah dasarnya.', weight: 4 }
    },
    explanation: 'Opsi B mengedepankan mediasi empatik, profesionalisme panggung, dan rekonsiliasi berbasis kesadaran bersama.'
  },
  {
    competency_code: 'MANAJEMEN_KONFLIK',
    difficulty: 'Sedang',
    indicator: 'Meredakan ketegangan antarpengurus senior dan junior',
    question_text: 'Pengurus junior merasa pengurus senior terlalu mendikte dan tidak memberi ruang untuk berkreasi dalam pembuatan dekorasi panggung, sementara senior merasa junior kurang teliti. Cara Anda memediasi ketegangan ini adalah...',
    options: {
      A: { text: 'Membuat forum diskusi santai bertajuk "sharing session", di mana senior membagikan standar mutu teknis sementara junior diberikan kebebasan mengeksekusi konsep kreatif dengan pendampingan suportif.', weight: 5 },
      B: { text: 'Membela pihak junior dan menuduh senior bersikap otoriter.', weight: 2 },
      C: { text: 'Membela pihak senior secara mutlak dengan dalih senioritas.', weight: 1 },
      D: { text: 'Memisahkan lokasi kerja mereka agar tidak pernah bertemu satu sama lain.', weight: 3 },
      E: { text: 'Menyerahkan perselisihan tersebut ke guru BK madrasah.', weight: 4 }
    },
    explanation: 'Opsi A menjembatani kesenjangan antargenerasi melalui kolaborasi standar mutu dan ruang kreativitas.'
  },
  {
    competency_code: 'MANAJEMEN_KONFLIK',
    difficulty: 'Sedang',
    indicator: 'Menangani silang pendapat mengenai pembagian peran panggung',
    question_text: 'Dua orang anggota drama sama-sama bersikeras ingin memerankan tokoh antagonis utama dalam naskah lakon. Cara Anda menyelesaikan persaingan ini secara adil adalah...',
    options: {
      A: { text: 'Memberikan peran kepada yang memiliki hubungan pertemanan lebih dekat dengan Anda.', weight: 1 },
      B: { text: 'Menggelar sesi uji baca dialog (reading audition) tertutup di hadapan tim sutradara dan Pembina dengan kriteria vokal, ekspresi, dan karakterisasi yang transparan.', weight: 5 },
      C: { text: 'Menghapus tokoh antagonis dari naskah cerita.', weight: 2 },
      D: { text: 'Menyuruh mereka saling berdebat siapa yang paling pantas.', weight: 3 },
      E: { text: 'Menentukan peran berdasarkan undian kertas acak.', weight: 4 }
    },
    explanation: 'Opsi B menyelesaikan kompetisi peran melalui prosedur seleksi artistik yang objektif, transparan, dan dapat dipertanggungjawabkan.'
  },
  {
    competency_code: 'MANAJEMEN_KONFLIK',
    difficulty: 'Mudah',
    indicator: 'Mencegah rumor/isu tidak benar memecah belah organisasi',
    question_text: 'Beredar rumor di kalangan anggota bahwa dana kas ekstrakurikuler disalahgunakan oleh salah satu koordinator. Sikap Anda untuk menghentikan perpecahan akibat isu ini adalah...',
    options: {
      A: { text: 'Ikut menyebarkan rumor tersebut di media sosial pribadi.', weight: 1 },
      B: { text: 'Mendorong Bendahara dan Ketua segera menggelar transparansi buku kas terbuka di forum rapat resmi pengurus dengan bukti nota lengkap untuk mengklarifikasi fakta sebenarnya.', weight: 5 },
      C: { text: 'Menyerang dan menuduh orang yang dicurigai menyebarkan rumor tanpa bukti.', weight: 2 },
      D: { text: 'Mendiamkan rumor tersebut hingga hilang dengan sendirinya.', weight: 3 },
      E: { text: 'Menghapus grup WhatsApp ekstrakurikuler.', weight: 4 }
    },
    explanation: 'Opsi B menyelesaikan konflik berbasis rumor dengan keterbukaan data faktual dan akuntabilitas terbuka.'
  },

  // --- 9. MANAJEMEN WAKTU (4 Soal) ---
  {
    competency_code: 'MANAJEMEN_WAKTU',
    difficulty: 'Sedang',
    indicator: 'Penyusunan rundown dan timeline produksi pertunjukan',
    question_text: 'Dalam menyusun jadwal persiapan produksi pementasan seni yang berjarak 2 bulan dari hari H, prinsip manajemen waktu yang paling efektif adalah...',
    options: {
      A: { text: 'Memulai latihan secara intensif hanya pada H-7 sebelum pementasan.', weight: 1 },
      B: { text: 'Membuat jadwal milestone bertahap: Pekan 1-2 (bedah naskah & aransemen dasar), Pekan 3-5 (latihan divisi parsial), Pekan 6-7 (latihan gabungan & blocking), Pekan 8 (gladi kotor & gladi bersih).', weight: 5 },
      C: { text: 'Mengadakan latihan setiap hari tanpa hari libur sejak hari pertama.', weight: 3 },
      D: { text: 'Menyerahkan jadwal kepada masing-masing anggota tanpa ada tenggat waktu evaluasi berkala.', weight: 2 },
      E: { text: 'Menyesuaikan jadwal secara spontan setiap minggu tanpa target tertulis.', weight: 4 }
    },
    explanation: 'Opsi B menerapkan manajemen proyek pertunjukan berbasis milestone terukur dan terencana matang.'
  },
  {
    competency_code: 'MANAJEMEN_WAKTU',
    difficulty: 'Sedang',
    indicator: 'Efisiensi durasi latihan agar tidak berlarut-larut',
    question_text: 'Seringkali sesi latihan molor hingga menjelang Magrib karena 30 menit awal dihabiskan untuk mengobrol dan menunggu keterlambatan. Cara Anda memperbaiki manajemen waktu latihan adalah...',
    options: {
      A: { text: 'Memulai latihan tepat waktu sesuai jam yang tertera di jadwal tanpa menunggu yang terlambat, dengan alokasi target capaian per 30 menit yang terstruktur.', weight: 5 },
      B: { text: 'Menambah durasi latihan menjadi lebih malam hingga jam 8 malam.', weight: 2 },
      C: { text: 'Membatalkan latihan setiap kali ada yang datang terlambat.', weight: 1 },
      D: { text: 'Membiarkan obrolan santai karena menganggap itu bagian dari keakraban organisasi.', weight: 3 },
      E: { text: 'Mengunci pintu aula dan melarang siapa pun masuk setelah jam mulai.', weight: 4 }
    },
    explanation: 'Opsi A membangun disiplin sistemik melalui konsistensi ketepatan waktu mulai dan target per sesi.'
  },
  {
    competency_code: 'MANAJEMEN_WAKTU',
    difficulty: 'Sulit',
    indicator: 'Prioritisasi tugas mendesak dan penting menjelang hari pementasan',
    question_text: 'H-1 menjelang pementasan, Anda memiliki 3 tugas tertunda: (1) Menyetrika kostum utama, (2) Membuat desain postingan promosi media sosial hari H, (3) Memeriksa kesiapan jalur listrik sound system. Urutan prioritas terbaik adalah...',
    options: {
      A: { text: '2 - 1 - 3', weight: 2 },
      B: { text: '3 (kritis untuk keselamatan panggung) dilanjutkan 1 (kebutuhan wajib pemain), kemudian 2 (dapat didelegasikan ke tim publikasi).', weight: 5 },
      C: { text: '2 dulu karena paling mudah dikerjakan sambil rebahan.', weight: 1 },
      D: { text: '1 - 2 - 3', weight: 3 },
      E: { text: 'Mengerjakan ketiganya sekaligus tanpa bantuan siapa pun.', weight: 4 }
    },
    explanation: 'Opsi B menerapkan matriks prioritas Eisenhower: aspek keselamatan dan operasional panggung kritis didahulukan.'
  },
  {
    competency_code: 'MANAJEMEN_WAKTU',
    difficulty: 'Mudah',
    indicator: 'Manajemen waktu pribadi antara tugas madrasah dan ekstrakurikuler',
    question_text: 'Anda memiliki tugas pekerjaan rumah (PR) matematika yang harus dikumpulkan besok pagi dan jadwal latihan vokal sore ini pukul 15.30 - 17.00. Strategi waktu Anda adalah...',
    options: {
      A: { text: 'Mencontek PR teman besok pagi sebelum bel masuk berbunyi.', weight: 1 },
      B: { text: 'Menyelesaikan sebagian besar PR saat jam istirahat siang madrasah atau tepat setelah pulang latihan vokal, sehingga kedua kewajiban selesai optimal.', weight: 5 },
      C: { text: 'Membolos latihan vokal untuk mengerjakan PR sambil menonton televisi.', weight: 2 },
      D: { text: 'Mengerjakan PR di tengah-tengah sesi bernyanyi vokal.', weight: 3 },
      E: { text: 'Tidak mengerjakan PR dan siap menerima hukuman guru.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan manajemen waktu pribadi yang bertanggung jawab tanpa kompromi integritas akademik.'
  },

  // --- 10. KREATIVITAS & INISIATIF (3 Soal) ---
  {
    competency_code: 'KREATIVITAS',
    difficulty: 'Sedang',
    indicator: 'Inovasi penggabungan unsur tradisional lokal Purbalingga dalam karya seni',
    question_text: 'SENDRATASIK diminta menampilkan pertunjukan kolaborasi seni modern dan tradisi madrasah. Gagasan kreatif dan orisinal yang dapat Anda ajukan adalah...',
    options: {
      A: { text: 'Meniru persis tarian modern dari video viral luar negeri tanpa penyesuaian nilai kesantunan madrasah.', weight: 1 },
      B: { text: 'Mengangkat kisah legenda atau kearifan lokal Purbalingga (seperti kisah Gua Lawa / Sungai Klawing) yang dikemas dalam drama musikal perpaduan irama Calung Banyumasan dan harmoni vokal kontemporer bernuansa Islami.', weight: 5 },
      C: { text: 'Menolak memadukan tradisi karena menganggap seni tradisional sudah kuno.', weight: 2 },
      D: { text: 'Hanya menampilkan pembacaan puisi tanpa iringan musik apa pun.', weight: 3 },
      E: { text: 'Menggunakan kostum yang sama persis seperti penampilan tahun lalu.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan eksplorasi kreatif yang kaya nilai budaya lokal, relevan dengan identitas madrasah, dan berdaya tarik tinggi.'
  },
  {
    competency_code: 'KREATIVITAS',
    difficulty: 'Sulit',
    indicator: 'Inisiatif proaktif mengatasi kekosongan panggung saat kendala teknis',
    question_text: 'Di tengah pementasan, terjadi jeda tak terduga selama 3 menit karena pergantian set dekorasi panggung macet di balik tirai. Sebagai pemusik pengiring yang memiliki inisiatif tinggi, tindakan Anda adalah...',
    options: {
      A: { text: 'Ikut terdiam dan melihat ke arah tirai dengan wajah cemas.', weight: 2 },
      B: { text: 'Secara spontan memimpin ansambel memainkan melodi transisi instrumental dinamis/solois kendang yang memikat perhatian penonton, sehingga jeda teknis terasa seperti bagian dari pertunjukan seni.', weight: 5 },
      C: { text: 'Berteriak menyuruh kru panggung mempercepat pergantian set.', weight: 1 },
      D: { text: 'Meninggalkan instrumen musik dan pergi ke belakang panggung.', weight: 3 },
      E: { text: 'Meminta MC naik ke panggung untuk menceritakan lelucon pribadi.', weight: 4 }
    },
    explanation: 'Opsi B merupakan bentuk inisiatif cerdas (stage presence) yang menyelamatkan atmosfer pertunjukan secara elegan.'
  },
  {
    competency_code: 'KREATIVITAS',
    difficulty: 'Mudah',
    indicator: 'Ide publikasi kreatif untuk menarik minat penonton',
    question_text: 'Untuk meningkatkan antusiasme warga madrasah menyaksikan Pagelaran Akhir Tahun SENDRATASIK, inisiatif publikasi kreatif yang Anda gagas adalah...',
    options: {
      A: { text: 'Hanya menempelkan selembar kertas fotokopi hitam putih di papan pengumuman sudut sekolah.', weight: 2 },
      B: { text: 'Membuat teaser video sinematik pendek cuplikan latihan di media sosial resmi, poster digital estetik, serta pertunjukan kilat (flashmob mini) 2 menit saat jam istirahat sekolah.', weight: 5 },
      C: { text: 'Memaksa setiap siswa madrasah membeli tiket dengan ancaman denda.', weight: 1 },
      D: { text: 'Mengandalkan promosi dari mulut ke mulut tanpa konten visual.', weight: 3 },
      E: { text: 'Membuat pengumuman suara berulang-ulang melalui pengeras suara madrasah saat jam pelajaran.', weight: 4 }
    },
    explanation: 'Opsi B menggabungkan strategi publikasi modern multi-channel yang atraktif dan persuasif.'
  },

  // --- 11. ADAPTASI & KETAHANAN (4 Soal) ---
  {
    competency_code: 'ADAPTASI',
    difficulty: 'Sedang',
    indicator: 'Kesiapan menghadapi perubahan susunan formasi mendadak',
    question_text: 'Satu jam sebelum tampil di panggung festival, seorang penari dalam formasi tarian 7 orang pingsan karena dehidrasi. Penata tari mengubah pola lantai formasi menjadi 6 orang. Sikap adaptasi Anda sebagai salah satu penari adalah...',
    options: {
      A: { text: 'Menolak tampil karena merasa formasi 6 orang akan merusak hafalan gerakan Anda.', weight: 1 },
      B: { text: 'Menerima perubahan dengan tenang, segera menyimak penyesuaian blocking baru bersama rekan penari lain, dan fokus menjaga kekompakan saat berada di panggung.', weight: 5 },
      C: { text: 'Menangis di ruang ganti dan mengeluh kepada panitia festival.', weight: 2 },
      D: { text: 'Memaksa penari yang pingsan untuk tetap naik panggung dengan risiko pingsan lagi.', weight: 3 },
      E: { text: 'Menari dengan pola lama tanpa mempedulikan ketimpangan posisi di panggung.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan ketenangan mental, fleksibilitas kognitif, dan kemampuan adaptasi blocking panggung di bawah tekanan.'
  },
  {
    competency_code: 'ADAPTASI',
    difficulty: 'Sedang',
    indicator: 'Sikap positif menerima kritik evaluatif dari Pembina',
    question_text: 'Seusai penampilan perdana, Pembina memberikan kritik pedus bahwa penjiwaan karakter drama yang Anda bawakan masih terasa datar dan monoton. Sikap ketahanan mental Anda adalah...',
    options: {
      A: { text: 'Merasa sakit hati dan memutuskan berhenti dari kegiatan ekstrakurikuler.', weight: 1 },
      B: { text: 'Menerima kritik tersebut sebagai bahan refleksi berharga, mencatat poin evaluasi, dan meminta bimbingan teknik olah rasa tambahan kepada Pembina/senior.', weight: 5 },
      C: { text: 'Membantah kritik Pembina dan merasa penampilan Anda sudah yang paling sempurna.', weight: 2 },
      D: { text: 'Menyalahkan naskah cerita yang menurut Anda membosankan.', weight: 3 },
      E: { text: 'Mengabaikan masukan tersebut dan tetap bermain dengan gaya yang sama pada pementasan berikutnya.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan pola pikir berkembang (growth mindset) dan kematangan menyikapi masukan konstruktif.'
  },
  {
    competency_code: 'ADAPTASI',
    difficulty: 'Sulit',
    indicator: 'Adaptasi panggung ukuran sempit yang berbeda dari lokasi latihan',
    question_text: 'Saat tiba di lokasi panggung lomba luar kota, ternyata ukuran luas panggung hanya separuh dari ukuran aula latihan madrasah. Tindakan adaptif tim Anda adalah...',
    options: {
      A: { text: 'Memprotes panitia lomba dan menuntut panggung diperlebar.', weight: 1 },
      B: { text: 'Memanfaatkan waktu gladi bersih untuk mengompresi jarak rentang langkah penari, menyesuaikan sudut blocking aktor, dan mengatur peletakan instrumen musik agar tetap aman dan leluasa.', weight: 5 },
      C: { text: 'Tetap bergerak dengan jangkauan langkah lebar hingga menabrak pemain lain dan properti.', weight: 2 },
      D: { text: 'Membatalkan keikutsertaan lomba karena panggung tidak ideal.', weight: 3 },
      E: { text: 'Mengurangi separuh gerakan tarian menjadi gerakan duduk saja.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan kemampuan spasial adaptif dan penyesuaian teknis koreografi yang cepat dan terukur.'
  },
  {
    competency_code: 'ADAPTASI',
    difficulty: 'Mudah',
    indicator: 'Ketahanan fisik dan fokus saat jadwal gladi larut',
    question_text: 'Jadwal gladi bersih bersama gabungan seluruh ekskul madrasah berlangsung molor hingga petang hari. Sikap Anda untuk menjaga ketahanan dan fokus adalah...',
    options: {
      A: { text: 'Tidur-tiduran di lantai panggung dan mengeluh tanpa henti.', weight: 1 },
      B: { text: 'Menjaga asupan air putih, melakukan peregangan otot ringan berkala, dan tetap menyimak jalannya gladi agar siap seketika saat giliran divisi Anda dipanggil.', weight: 5 },
      C: { text: 'Meninggalkan lokasi gladi tanpa izin pengurus.', weight: 2 },
      D: { text: 'Makan makanan berlemak berat di luar madrasah saat sesi gladi masih berlangsung.', weight: 3 },
      E: { text: 'Bermain game online di ponsel hingga baterai habis dan tidak mendengar panggilan panggung.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan disiplin pemeliharaan stamina dan kesiapsiagaan operasional panggung.'
  },

  // --- 12. ORIENTASI PRESTASI & PROFESIONALISME (4 Soal) ---
  {
    competency_code: 'PROFESIONALISME',
    difficulty: 'Sulit',
    indicator: 'Menjaga etika panggung dan kehormatan madrasah',
    question_text: 'Saat tampil di hadapan tamu kehormatan dari kantor kementerian dan masyarakat umum, salah satu tali kostum penari terlepas sedikit. Sikap profesional yang wajib ditunjukkan adalah...',
    options: {
      A: { text: 'Berteriak histeris dan langsung lari keluar panggung di tengah alunan musik.', weight: 1 },
      B: { text: 'Tetap tenang mempertahankan ketukan wirama dan ekspresi wajah, melakukan penyesuaian posisi secara tersamar melalui variasi gerak koreografi hingga masuk ke sisi sayap panggung.', weight: 5 },
      C: { text: 'Duduk diam di lantai panggung hingga tarian selesai.', weight: 2 },
      D: { text: 'Menyalahkan perias kostum di atas panggung.', weight: 3 },
      E: { text: 'Menghentikan pemain musik secara paksa dengan lambaian tangan panik.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan etika panggung tingkat tinggi (stagecraft) dan ketenangan profesional dalam menjaga kelancaran sajian seni.'
  },
  {
    competency_code: 'PROFESIONALISME',
    difficulty: 'Sedang',
    indicator: 'Target keunggulan kualitas artistik (quality orientation)',
    question_text: 'Sebuah garapan aransemen musik telah selesai dibuat dan sudah dianggap "cukup bagus" oleh sebagian anggota. Namun, Anda melihat ada celah harmonisasi nada minor pada reffrain yang jika diperbaiki akan membuat karya jauh lebih memukau. Tindakan Anda adalah...',
    options: {
      A: { text: 'Membiarkannya apa adanya karena malas menambah sesi latihan aransemen.', weight: 2 },
      B: { text: 'Mengusulkan eksplorasi perbaikan nada tersebut kepada penata musik secara santun, mendemonstrasikan perbandingannya, dan berlatih bersama demi mencapai standar karya terbaik.', weight: 5 },
      C: { text: 'Mengejek penata musik karena karyanya belum sempurna.', weight: 1 },
      D: { text: 'Mengubah aransemen secara sepihak saat pementasan tanpa latihan bersama.', weight: 3 },
      E: { text: 'Menyerahkan urusan tersebut kepada penonton apakah mereka sadar atau tidak.', weight: 4 }
    },
    explanation: 'Opsi B mencerminkan orientasi pada kesempurnaan mutu seni (pursuit of excellence) dengan cara yang kolegial.'
  },
  {
    competency_code: 'PROFESIONALISME',
    difficulty: 'Sedang',
    indicator: 'Menjaga sportivitas dan apresiasi terhadap kompetitor',
    question_text: 'Dalam sebuah festival seni antar-pelajar se-Jawa Tengah, kontingen sekolah lain menampilkan karya seni yang sangat memukau dan mendapatkan sambutan meriah. Sikap profesional Anda adalah...',
    options: {
      A: { text: 'Mencemooh penampilan mereka dan menyebarkan komentar kebencian di media sosial.', weight: 1 },
      B: { text: 'Menyaksikan penampilan mereka dengan apresiasi tulus, memetik inspirasi positif dari keunggulan karya mereka untuk pengembangan SENDRATASIK, dan tetap optimis menampilkan karya terbaik tim sendiri.', weight: 5 },
      C: { text: 'Merasa rendah diri dan pesimis sebelum tim sendiri tampil di panggung.', weight: 2 },
      D: { text: 'Berusaha mengganggu konsentrasi pemain kontingen lain di belakang panggung.', weight: 3 },
      E: { text: 'Meninggalkan arena lomba sebelum acara pengumuman pemenang selesai.', weight: 4 }
    },
    explanation: 'Opsi B mewujudkan sportivitas luhur, etika berkesenian yang matang, dan mental pembelajar.'
  },
  {
    competency_code: 'PROFESIONALISME',
    difficulty: 'Mudah',
    indicator: 'Menjaga kebersihan dan etika kostum sewaan/inventaris',
    question_text: 'Seusai pementasan pergelaran selesai larut malam, kondisi kostum tari dan properti drama penuh dengan keringat dan riasan bedak. Tanggung jawab profesional Anda adalah...',
    options: {
      A: { text: 'Melempar kostum begitu saja ke dalam karung kotor dan membiarkannya berjamur.', weight: 1 },
      B: { text: 'Menggantung kostum dengan rapi agar diangin-anginkan, memisahkan aksesoris perhiasan/mahkota ke kotak khusus, dan menginventarisasi kelengkapan sebelum disimpan/dikembalikan ke sanggar.', weight: 5 },
      C: { text: 'Membawa pulang kostum favorit untuk dipakai pribadi tanpa izin.', weight: 2 },
      D: { text: 'Menyuruh adik kelas kelas X mencuci semua kostum sendirian.', weight: 3 },
      E: { text: 'Membiarkan kostum berserakan di lantai ruang ganti hingga hari Senin.', weight: 4 }
    },
    explanation: 'Opsi B menunjukkan kepedulian terhadap pemeliharaan aset seni dan etika perlakuan terhadap kostum pertunjukan.'
  }
];
