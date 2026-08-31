import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface GeneratedQuestionDraft {
  question_text: string;
  indicator: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  explanation: string;
  options: {
    A: { text: string; weight: number };
    B: { text: string; weight: number };
    C: { text: string; weight: number };
    D: { text: string; weight: number };
    E: { text: string; weight: number };
  };
}

// Psychometric Question Bank covering all 12 competencies of SENDRATASIK
const PSYCHOMETRIC_BANK: Record<string, Array<{
  text: string;
  indicator: string;
  exp: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  options: [string, number][];
}>> = {
  KEPEMIMPINAN: [
    {
      text: 'Dua minggu menjelang pergelaran akbar SENDRATASIK MAN Purbalingga, terjadi perbedaan pandangan tajam antara divisi musik dan divisi tari mengenai alokasi durasi waktu panggung. Sebagai salah satu calon pimpinan/koordinator, tindakan kepemimpinan yang paling bijak dan solutif adalah...',
      indicator: 'Kemampuan mediasi, ketegasan, dan resolusi konflik harmonis',
      difficulty: 'Sedang',
      exp: 'Pilihan dengan bobot 5 menunjukkan kepemimpinan fasilitatif yang mengedepankan musyawarah mufakat, solusi berbasis data teknis, dan keutuhan visi pementasan.',
      options: [
        ['Mengumpulkan ketua divisi tari dan musik bersama pembina dalam forum mediasi, membedah naskah dan partitur secara objektif untuk menentukan titik temu durasi yang proporsional.', 5],
        ['Meminta pembina ekstrakurikuler langsung menetapkan keputusan mutlak agar perdebatan segera berakhir tanpa perlu rapat panjang.', 4],
        ['Memberikan tambahan waktu panggung kepada divisi yang dinilai anggotanya paling rajin hadir latihan.', 3],
        ['Membiarkan kedua divisi beradu argumen hingga salah satu divisi mengalah dengan sendirinya demi menjaga kebebasan berekspresi.', 2],
        ['Menghindari konflik dan fokus hanya pada persiapan divisi pribadi tanpa memedulikan ketegangan yang terjadi.', 1]
      ]
    },
    {
      text: 'Saat gladi kotor, salah satu penanggung jawab divisi terlihat kewalahan dan beberapa anggota mulai kehilangan arah kerja karena kurangnya arahan jelas. Sikap kepemimpinan teladan Anda adalah...',
      indicator: 'Keteladanan kepemimpinan, kepedulian tim, dan inisiatif perbaikan',
      difficulty: 'Sedang',
      exp: 'Pemimpin sejati hadir memberi pendampingan langsung, merapikan alur koordinasi, dan membakar semangat tim tanpa merendahkan rekannya.',
      options: [
        ['Mendekati koordinator divisi tersebut secara persuasif, membantu memetakan checklist prioritas kerja, dan turut mendampingi pengarahan anggota.', 5],
        ['Mengambil alih seluruh tugas divisi tersebut secara sepihak agar pekerjaan lekas selesai sebelum ditegur pembina.', 4],
        ['Menyemangati anggota divisi dari kejauhan dan mengingatkan mereka tentang tenggat waktu.', 3],
        ['Menegur koordinator divisi di depan seluruh anggota agar ia segera sadar dan bekerja lebih sigap.', 2],
        ['Melaporkan ketidakmampuan rekan tersebut ke grup umum organisasi agar mendapat perhatian pengurus lain.', 1]
      ]
    }
  ],
  INTEGRITAS: [
    {
      text: 'Setelah kegiatan pergelaran selesai, Anda menemukan sisa dana operasional belanja properti sebesar Rp 250.000 yang kuitansinya tidak diminta oleh pedagang pasar tradisional. Sikap integritas moral Anda adalah...',
      indicator: 'Kejujuran, transparansi keuangan, dan akuntabilitas amanah',
      difficulty: 'Mudah',
      exp: 'Integritas menuntut pencatatan jujur atas setiap rupiah dana organisasi tanpa memanfaatkan celah administrasi untuk kepentingan pribadi.',
      options: [
        ['Mencatat sisa dana tersebut secara rinci dalam pembukuan laporan pertanggungjawaban (LPJ) dan mengembalikannya utuh kepada bendahara umum.', 5],
        ['Menyimpan uang tersebut sebagai kas darurat divisi pribadi untuk keperluan tak terduga di masa depan.', 4],
        ['Menggunakan uang tersebut untuk membelikan konsumsi tambahan bagi rekan-rekan divisi yang telah bekerja lembur.', 3],
        ['Membuat kuitansi perkiraan sendiri agar seluruh dana anggaran tampak habis terpakai sesuai rencana awal.', 2],
        ['Membagi-bagikan uang sisa tersebut kepada pengurus inti divisi sebagai uang lelah pementasan.', 1]
      ]
    }
  ],
  DISIPLIN: [
    {
      text: 'Jadwal gladi bersih ditetapkan tepat pukul 13.30 WIB di aula madrasah. Pada saat bersamaan, Anda ada tugas kelompok mata pelajaran umum yang belum selesai dikerjakan bersama teman sekelas. Tindakan manajemen disiplin Anda adalah...',
      indicator: 'Komitmen jadwal, integritas waktu, dan tanggung jawab ganda',
      difficulty: 'Sedang',
      exp: 'Siswa berkarakter mampu menyusun skala prioritas, menyelesaikan kewajiban akademik lebih awal atau berkoordinasi santun agar kedua amanah tertunaikan tepat waktu.',
      options: [
        ['Menyelesaikan bagian tugas akademik saya secara maksimal sebelum jam 13.00, berpamitan santun pada teman sekelas, dan hadir di aula 10 menit sebelum gladi dimulai.', 5],
        ['Datang ke aula gladi tepat waktu, lalu mengerjakan tugas sekolah secara sembunyi-sembunyi di belakang panggung saat giliran divisi lain tampil.', 4],
        ['Memilih menuntaskan tugas sekolah hingga selesai dan baru datang ke aula gladi dengan keterlambatan 45 menit.', 3],
        ['Menitipkan presensi gladi kepada teman divisi dan tidak hadir tanpa konfirmasi langsung kepada Pembina.', 2],
        ['Memutuskan tidak hadir pada kedua kegiatan tersebut karena merasa lelah dan tertekan oleh jadwal.', 1]
      ]
    }
  ],
  KOMUNIKASI: [
    {
      text: 'Anda merasa ada beberapa keputusan artistik panggung dari senior yang kurang relevan dengan tema pentas madrasah bernuansa Islami. Cara komunikasi asertif yang paling tepat untuk menyampaikan masukan adalah...',
      indicator: 'Komunikasi asertif, etika penyampaian kritik, dan kesantunan madrasah',
      difficulty: 'Sedang',
      exp: 'Komunikasi yang efektif dibangun di atas rasa hormat, argumentasi berbasis data/konsep, serta forum diskusi tertutup yang kondusif.',
      options: [
        ['Meminta waktu berdiskusi secara personal dengan senior, menyampaikan apresiasi atas ide awal, lalu memaparkan alternatif konsep bernuansa Islami secara santun dan logis.', 5],
        ['Menyampaikan ketidaksetujuan secara terbuka di depan seluruh anggota saat rapat besar agar mendapat dukungan suara terbanyak.', 4],
        ['Menyampaikan unek-unek kepada pembina ekstrakurikuler tanpa terlebih dahulu berbicara dengan senior yang bersangkutan.', 3],
        ['Membicarakan kekurangan konsep senior tersebut bersama teman-teman sebaya di luar forum resmi.', 2],
        ['Memilih diam dan pasif menjalankan konsep tersebut meskipun di dalam hati merasa tidak sejalan.', 1]
      ]
    }
  ],
  KERJA_SAMA: [
    {
      text: 'Divisi tata panggung dan artistik mengalami kekurangan tenaga untuk mengangkat set dekorasi berat saat malam sebelum pementasan, sementara divisi Anda sudah menuntaskan seluruh tugas operasional. Tindakan solidaritas kerja sama tim Anda adalah...',
      indicator: 'Solidaritas lintas divisi, sinergi ansambel, dan kepedulian bersama',
      difficulty: 'Mudah',
      exp: 'Kesuksesan pergelaran seni adalah karya kolektif seluruh lini; kesediaan membantu divisi lain merupakan wujud nyata kematangan kolaborasi.',
      options: [
        ['Mengajak anggota divisi Anda yang sedang luang untuk bergotong-royong membantu divisi artistik hingga seluruh set dekorasi siap dan aman.', 5],
        ['Menawarkan bantuan seadanya selama 15 menit kemudian pamit pulang untuk beristirahat.', 4],
        ['Menyemangati divisi artistik dan membelikan mereka air minum tanpa ikut membantu tenaga fisik.', 3],
        ['Mengumumkan di grup pesan bahwa divisi Anda sudah selesai dan mengingatkan divisi lain agar tidak terlambat.', 2],
        ['Langsung pulang ke rumah karena merasa tugas divisi sendiri sudah selesai dan bukan tanggung jawab divisi Anda.', 1]
      ]
    }
  ],
  PROBLEM_SOLVING: [
    {
      text: 'Tiga puluh menit sebelum tirai panggung dibuka, lampu sorot utama (spotlight) panggung mati total karena sekring terbakar dan tidak ada cadangan di lokasi. Tindakan pemecahan masalah cepat Anda adalah...',
      indicator: 'Pemecahan masalah darurat, berpikir kreatif, dan ketenangan teknis',
      difficulty: 'Sulit',
      exp: 'Kemampuan problem solving panggung menuntut ketenangan, pemanfaatan sumber daya alternatif, dan penyesuaian tata cahaya kreatif tanpa membatalkan acara.',
      options: [
        ['Segera berkoordinasi dengan tim teknisi dan penata panggung untuk mengatur ulang kombinasi lampu halogen samping serta senter panggung fokus sebagai pencahayaan alternatif.', 5],
        ['Mencari toko listrik terdekat dengan sepeda motor untuk membeli sekring baru meskipun berisiko jadwal acara mundur.', 4],
        ['Mengubah alur pementasan menjadi tanpa tata cahaya khusus dan hanya mengandalkan lampu neon aula.', 3],
        ['Panik dan meminta pembina untuk membatalkan segmen penampilan yang membutuhkan lampu spotlight.', 2],
        ['Menyalahkan tim sarana prasarana yang dianggap lalai memeriksa kelayakan listrik sebelum acara.', 1]
      ]
    }
  ],
  PENGAMBILAN_KEPUTUSAN: [
    {
      text: 'Saat festival seni sedang berlangsung, salah satu pemeran utama drama mendadak kehilangan suara akibat radang tenggorokan akut. Sebagai koordinator pertunjukan, keputusan strategis yang Anda ambil adalah...',
      indicator: 'Ketegasan keputusan strategis, analisis risiko, dan penyelamatan pertunjukan',
      difficulty: 'Sulit',
      exp: 'Keputusan terbaik mengutamakan keselamatan pemain, mengaktifkan sistem pemain pengganti (understudy), dan menjaga kelancaran alur cerita seni.',
      options: [
        ['Segera mengaktifkan pemain pengganti (understudy) yang telah terlatih, memberi briefing kilat 10 menit, dan menata ulang sedikit dialog untuk kelancaran panggung.', 5],
        ['Memaksa pemeran utama tetap tampil dengan menyederhanakan dialog menjadi lebih pendek.', 4],
        ['Mengubah naskah drama di atas panggung secara mendadak tanpa latihan bagi pemeran lainnya.', 3],
        ['Menghentikan pementasan drama dan langsung melompati ke penampilan musik instrumen.', 2],
        ['Membiarkan pemeran utama bingung di panggung tanpa mengambil tindakan penyesuaian apapun.', 1]
      ]
    }
  ],
  MANAJEMEN_KONFLIK: [
    {
      text: 'Terjadi perselisihan pribadi di luar ekstrakurikuler antara dua penari utama yang menyebabkan suasana latihan menjadi canggung dan gerakan tarian tidak sinkron. Langkah mediasi konflik Anda adalah...',
      indicator: 'Mediasi objektif, profesionalisme panggung, dan rekonsiliasi',
      difficulty: 'Sedang',
      exp: 'Mediasi yang efektif memisahkan persoalan pribadi dengan komitmen seni panggung, menumbuhkan empati, dan menjaga kekompakan ansambel.',
      options: [
        ['Mengajak kedua penari berbicara dari hati ke hati di ruang tersendiri, mengingatkan visi bersama SENDRATASIK, dan memfasilitasi rekonsiliasi profesional demi kesuksesan pementasan.', 5],
        ['Mengganti salah satu penari tersebut dengan anggota cadangan agar tidak merusak suasana latihan.', 4],
        ['Menegur kedua penari dengan keras di depan seluruh anggota agar mereka merasa malu dan segera berbaikan.', 3],
        ['Membiarkan perselisihan tersebut karena menganggap itu urusan privasi yang akan selesai dengan sendirinya.', 2],
        ['Berpihak pada salah satu penari yang merupakan teman dekat dan menjauhi penari lainnya.', 1]
      ]
    }
  ],
  MANAJEMEN_WAKTU: [
    {
      text: 'Waktu produksi pementasan tersisa 3 minggu, namun progres penguasaan gerak tari dan aransemen musik baru mencapai 50%. Strategi manajemen waktu yang Anda terapkan adalah...',
      indicator: 'Penyusunan timeline terstruktur, skala prioritas, dan optimasi jadwal',
      difficulty: 'Sedang',
      exp: 'Manajemen waktu yang unggul mampu memetakan hambatan, menyusun target mingguan terukur (milestones), dan mengoptimalkan efisiensi latihan tanpa mengganggu belajar.',
      options: [
        ['Membuat matriks target harian yang terfokus pada adegan inti yang belum matang, membagi sesi latihan parsial per divisi, dan melakukan simulasi utuh tiap akhir pekan.', 5],
        ['Menambah jam latihan setiap hari hingga larut malam tanpa mempertimbangkan waktu istirahat dan tugas madrasah anggota.', 4],
        ['Memangkas 50% materi pementasan agar sisa waktu 3 minggu terasa longgar.', 3],
        ['Menyerahkan sepenuhnya kepada masing-masing anggota untuk latihan mandiri di rumah tanpa jadwal kontrol terpusat.', 2],
        ['Pasrah dengan hasil yang ada dan tampil seadanya pada hari H pergelaran.', 1]
      ]
    }
  ],
  KREATIVITAS: [
    {
      text: 'Tema pergelaran tahun ini adalah "Harmoni Budaya Banyumasan dan Nilai Islami". Anggaran kostum sangat terbatas. Ide inisiatif kreatif yang Anda sumbangkan adalah...',
      indicator: 'Inovasi artistik, pemanfaatan bahan lokal/daur ulang, dan efisiensi biaya',
      difficulty: 'Sedang',
      exp: 'Kreativitas sejati memadukan estetika kearifan lokal (seperti batik Banyumasan/lurik) dengan kreasi daur ulang yang bernilai seni tinggi dan hemat biaya.',
      options: [
        ['Mengusulkan perpaduan kain lurik tradisional dengan aksen bordir modern buatan mandiri serta memanfaatkan properti daur ulang yang dicat artistik bernuansa etnik.', 5],
        ['Menyewa kostum mewah dari sanggar luar kota dengan membebankan iuran tambahan yang cukup besar kepada seluruh anggota.', 4],
        ['Memakai seragam madrasah biasa tanpa sentuhan artistik apapun agar menghemat biaya 100%.', 3],
        ['Menjiplak persis konsep kostum dari pementasan sekolah lain yang pernah viral di media sosial.', 2],
        ['Menolak ikut merancang kostum karena merasa keterbatasan dana membatasi imajinasi seni.', 1]
      ]
    }
  ],
  ADAPTASI: [
    {
      text: 'Satu jam sebelum tampil di festival kabupaten, panitia mengumumkan bahwa dimensi panggung yang disediakan 40% lebih sempit dari denah panggung yang diinfokan sebelumnya. Respons adaptabilitas Anda adalah...',
      indicator: 'Penyesuaian teknis cepat, orientasi ruang (blocking), dan ketenangan mental',
      difficulty: 'Sedang',
      exp: 'Sikap adaptif ditandai oleh ketenangan mengolah formasi ruang, komunikasi koreografi sigap, dan optimisme menjaga dinamika gerak panggung.',
      options: [
        ['Segera mengumpulkan seluruh pemain di belakang panggung untuk mengadaptasi formasi pola lantai menjadi lebih rapat, mengatur sudut gerak dinamis, dan melakukan gladi resik singkat 10 menit.', 5],
        ['Tetap menggunakan blocking formasi awal dan berharap para penari bisa saling menghindar secara spontan di atas panggung.', 4],
        ['Mengajukan protes keras kepada panitia dan mengancam membatalkan keikutsertaan kontingen madrasah.', 3],
        ['Mengurangi jumlah penari yang naik ke panggung secara mendadak sehingga beberapa anggota kecewa.', 2],
        ['Mengeluh di media sosial mengenai ketidakprofesionalan panitia festival.', 1]
      ]
    }
  ],
  PROFESIONALISME: [
    {
      text: 'Saat pementasan selesai dan mendapat tepuk tangan meriah dari ribuan penonton, salah satu media lokal meminta wawancara mengenai keberhasilan karya SENDRATASIK. Sikap profesionalisme Anda adalah...',
      indicator: 'Rendah hati, apresiasi kolektif, dan representasi positif madrasah',
      difficulty: 'Mudah',
      exp: 'Profesionalisme berkesenian menempatkan keberhasilan sebagai karya kolektif seluruh anggota, pembina, dan madrasah, dengan tetap santun dan berkarakter.',
      options: [
        ['Menyampaikan rasa syukur kepada Allah SWT, mengapresiasi kerja keras seluruh tim lintas divisi, pembina, serta dukungan penuh MAN Purbalingga secara santun dan proporsional.', 5],
        ['Menonjolkan peran dan kehebatan divisi pribadi sebagai kunci utama kesuksesan pementasan.', 4],
        ['Mempromosikan akun media sosial pribadi saat sesi wawancara berlangsung.', 3],
        ['Menolak diwawancarai dan menyuruh wartawan mencari pembina saja karena merasa lelah.', 2],
        ['Menceritakan konflik internal yang sempat terjadi di belakang panggung kepada wartawan.', 1]
      ]
    }
  ]
};

// Fallback generator incorporating custom contexts seamlessly
function generateContextualFallbackQuestions(params: {
  competency_name: string;
  competency_code: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  context: string;
  count: number;
}): GeneratedQuestionDraft[] {
  const compCode = (params.competency_code || '').toUpperCase().trim();
  const compName = params.competency_name || 'Kompetensi Kepemimpinan';
  const customContext = params.context ? ` [Konteks: ${params.context}]` : '';

  // Look for matching key in bank
  let matchedBank = PSYCHOMETRIC_BANK[compCode];
  if (!matchedBank || matchedBank.length === 0) {
    // Try fuzzy match
    const key = Object.keys(PSYCHOMETRIC_BANK).find(k => compCode.includes(k) || k.includes(compCode));
    matchedBank = key ? PSYCHOMETRIC_BANK[key] : PSYCHOMETRIC_BANK['KEPEMIMPINAN'];
  }

  const results: GeneratedQuestionDraft[] = [];

  for (let i = 0; i < params.count; i++) {
    const base = matchedBank[i % matchedBank.length];
    const textWithContext = params.context
      ? `${base.text.replace('...', '')}${customContext}. Tindakan yang paling tepat dan profesional adalah...`
      : base.text;

    // Deterministic option permutation so weights 5, 4, 3, 2, 1 vary across options
    const rawOptions = [...base.options];
    if (i % 3 === 1) {
      // Rotation 1
      const temp = rawOptions.pop()!;
      rawOptions.unshift(temp);
    } else if (i % 3 === 2) {
      // Rotation 2
      rawOptions.reverse();
    }

    const letters = ['A', 'B', 'C', 'D', 'E'] as const;
    const optionMap: any = {};
    letters.forEach((l, idx) => {
      const opt = rawOptions[idx] || ['Pilihan tindakan adaptif.', 3];
      optionMap[l] = {
        text: opt[0],
        weight: opt[1]
      };
    });

    results.push({
      question_text: textWithContext,
      indicator: base.indicator || `Penguasaan indikator utama ${compName}`,
      difficulty: params.difficulty || base.difficulty || 'Sedang',
      explanation: base.exp || `Pilihan berbobot 5 merefleksikan nilai unggul ${compName}.`,
      options: optionMap
    });
  }

  return results;
}

// Timeout wrapper with Abort / Race support
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs))
  ]);
}

export async function generateSJTQuestionsWithAI(params: {
  competency_name: string;
  competency_code: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  context: string;
  count: number;
}): Promise<GeneratedQuestionDraft[]> {
  const ai = getAIClient();
  if (!ai) {
    return generateContextualFallbackQuestions(params);
  }

  const prompt = `Anda adalah pakar psikometri seleksi kepemimpinan ekstrakurikuler seni MAN Purbalingga (SENDRATASIK: Drama, Tari, Musik).
Buat ${params.count} draf soal Situational Judgment Test (SJT) untuk kompetensi: ${params.competency_name} (${params.competency_code}).
Tingkat Kesulitan: ${params.difficulty}.
Konteks: ${params.context || 'Dinamika organisasi ekstrakurikuler seni madrasah aliyah, gladi panggung, latihan, kolaborasi musik/tari/drama, atau anggaran'}.

Ketentuan:
- Skenario realistis madrasah aliyah.
- 5 opsi (A, B, C, D, E) dengan bobot skor terdistribusi unik: 5 (sangat tepat), 4 (tepat), 3 (cukup), 2 (kurang tepat), 1 (tidak tepat).
- Gunakan Bahasa Indonesia formal, komunikatif, dan edukatif.`;

  // Models optimized for fast, zero-thinking-latency response
  const fastModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  for (const modelName of fastModels) {
    try {
      const generateTask = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          // Disable thinking budget for instantaneous response
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question_text: { type: Type.STRING, description: 'Skenario situasi dan pertanyaan' },
                indicator: { type: Type.STRING, description: 'Indikator perilaku' },
                difficulty: { type: Type.STRING, description: 'Mudah, Sedang, atau Sulit' },
                explanation: { type: Type.STRING, description: 'Alasan penilaian untuk bobot opsi' },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: {
                      type: Type.OBJECT,
                      properties: { text: { type: Type.STRING }, weight: { type: Type.INTEGER } },
                      required: ['text', 'weight']
                    },
                    B: {
                      type: Type.OBJECT,
                      properties: { text: { type: Type.STRING }, weight: { type: Type.INTEGER } },
                      required: ['text', 'weight']
                    },
                    C: {
                      type: Type.OBJECT,
                      properties: { text: { type: Type.STRING }, weight: { type: Type.INTEGER } },
                      required: ['text', 'weight']
                    },
                    D: {
                      type: Type.OBJECT,
                      properties: { text: { type: Type.STRING }, weight: { type: Type.INTEGER } },
                      required: ['text', 'weight']
                    },
                    E: {
                      type: Type.OBJECT,
                      properties: { text: { type: Type.STRING }, weight: { type: Type.INTEGER } },
                      required: ['text', 'weight']
                    }
                  },
                  required: ['A', 'B', 'C', 'D', 'E']
                }
              },
              required: ['question_text', 'indicator', 'difficulty', 'explanation', 'options']
            }
          }
        }
      });

      // Strict 4500ms timeout per model attempt so the admin never waits too long
      const response = await withTimeout(generateTask, 4500);
      const rawJson = response.text ? response.text.trim() : '[]';
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Try next fast model or immediately proceed to instant fallback
      continue;
    }
  }

  // Instant zero-wait fallback with high psychometric fidelity
  return generateContextualFallbackQuestions(params);
}
