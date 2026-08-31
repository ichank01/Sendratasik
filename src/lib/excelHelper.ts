import * as XLSX from 'xlsx';
import { Question, Competency, PositionProfile, Participant } from '../types.js';

export interface ExcelQuestionRow {
  'No'?: number | string;
  'Kode Kompetensi'?: string;
  'Nama Kompetensi'?: string;
  'Tingkat Kesulitan'?: string;
  'Indikator Perilaku'?: string;
  'Teks Soal / Skenario Kasus': string;
  'Pilihan A': string;
  'Bobot A': number | string;
  'Pilihan B': string;
  'Bobot B': number | string;
  'Pilihan C': string;
  'Bobot C': number | string;
  'Pilihan D': string;
  'Bobot D': number | string;
  'Pilihan E': string;
  'Bobot E': number | string;
  'Penjelasan / Rasional Bobot'?: string;
  'Status'?: string;
}

/**
 * Downloads a structured Excel template containing sample questions and guidance.
 */
export const downloadQuestionExcelTemplate = (competencies: Competency[]) => {
  const compListText = competencies.length > 0 
    ? competencies.map(c => `${c.code} (${c.name})`).join(', ')
    : 'COMP_01 s/d COMP_08';

  // 1. Template Questions Sheet Data
  const templateData = [
    {
      'No': 1,
      'Kode Kompetensi': competencies[0]?.code || 'COMP_01',
      'Nama Kompetensi': competencies[0]?.name || 'Kepemimpinan & Visi Organisasi',
      'Tingkat Kesulitan': 'Sedang',
      'Indikator Perilaku': 'Kemampuan mengambil keputusan strategis saat terjadi kendala teknis',
      'Teks Soal / Skenario Kasus': 'Dua jam sebelum gladi bersih panggung festival seni dimulai, lampu tata panggung utama mengalami korsleting dan teknisi menyatakan butuh waktu 3 jam untuk perbaikan. Apa tindakan Anda sebagai ketua seksi acara?',
      'Pilihan A': 'Segera menginstruksikan tim untuk memindahkan gladi bersih adegan tari ke ruang latihan tertutup agar jadwal latihan tidak terbuang, sembari menugaskan wakil berkoordinasi intensif dengan teknisi kelistrikan.',
      'Bobot A': 5,
      'Pilihan B': 'Mengumpulkan seluruh koordinator seksi untuk merumuskan ulang urutan penampilan yang tidak membutuhkan pencahayaan penuh.',
      'Bobot B': 4,
      'Pilihan C': 'Menghubungi pembina sanggar dan meminta arahan apakah gladi bersih harus ditunda atau tetap dilaksanakan tanpa tata lampu.',
      'Bobot C': 3,
      'Pilihan D': 'Meminta seluruh penampil beristirahat sejenak sambil menunggu perbaikan teknis selesai dilakukan teknisi.',
      'Bobot D': 2,
      'Pilihan E': 'Menyalahkan tim perlengkapan karena tidak memeriksa instalasi listrik gedung sejak pagi hari.',
      'Bobot E': 1,
      'Penjelasan / Rasional Bobot': 'Opsi A bernilai 5 karena proaktif memitigasi waktu dengan fleksibilitas tinggi tanpa menghentikan persiapan pertunjukan.',
      'Status': 'Approved'
    },
    {
      'No': 2,
      'Kode Kompetensi': competencies[1]?.code || 'COMP_02',
      'Nama Kompetensi': competencies[1]?.name || 'Integritas & Tanggung Jawab',
      'Tingkat Kesulitan': 'Sedang',
      'Indikator Perilaku': 'Transparansi pelaporan keuangan dan akuntabilitas kepengurusan',
      'Teks Soal / Skenario Kasus': 'Setelah acara pementasan teater selesai, Anda menemukan sisa dana kas sebesar Rp 450.000 yang tidak tercatat dalam pembukuan sementara bendahara panitia. Tindakan terbaik Anda adalah:',
      'Pilihan A': 'Membawa uang tersebut ke rapat evaluasi resmi, menyerahkannya kepada bendahara dengan berita acara penyerahan terbuka, serta mencatatnya ke saldo akhir kas sanggar.',
      'Bobot A': 5,
      'Pilihan B': 'Menghubungi bendahara secara empat mata untuk mengecek ulang nota belanja sebelum memasukkannya ke kas.',
      'Bobot B': 4,
      'Pilihan C': 'Menyimpan uang tersebut sebagai dana darurat pribadi panitia untuk persiapan acara berikutnya.',
      'Bobot C': 2,
      'Pilihan D': 'Menggunakannya untuk membelikan konsumsi tambahan bagi tim pembersih panggung.',
      'Bobot D': 3,
      'Pilihan E': 'Mendiamkannya hingga ada anggota yang merasa kehilangan uang tersebut.',
      'Bobot E': 1,
      'Penjelasan / Rasional Bobot': 'Opsi A mencerminkan standar integritas tertinggi dengan transparansi berita acara tertulis.',
      'Status': 'Approved'
    }
  ];

  // 2. Reference Sheet for Competencies & Guidelines
  const guideData = competencies.map((c, idx) => ({
    'No': idx + 1,
    'Kode Kompetensi (Wajib Sama)': c.code,
    'Nama Kompetensi': c.name,
    'Bobot Standar (%)': `${c.weight}%`,
    'Deskripsi Singkat': c.description,
    'Indikator Contoh': (c.indicators || []).join('; ')
  }));

  const instructionsData = [
    { 'Petunjuk Pengisian': '1. Jangan mengubah nama kolom pada baris pertama (Header Baris 1).' },
    { 'Petunjuk Pengisian': '2. Kode Kompetensi wajib sesuai dengan kode yang tertera pada Sheet "Daftar_Kompetensi" (misal: COMP_01).' },
    { 'Petunjuk Pengisian': '3. Tingkat Kesulitan dapat diisi: "Mudah", "Sedang", atau "Sulit".' },
    { 'Petunjuk Pengisian': '4. Bobot Pilihan A s/d E harus berupa angka 1 sampai 5 (Skala SJT: 5 = Solusi Terbaik/Sangat Efektif, 1 = Paling Tidak Efektif).' },
    { 'Petunjuk Pengisian': '5. Status dapat diisi "Approved" (langsung aktif) atau "Draft".' },
    { 'Petunjuk Pengisian': '6. Anda dapat menghapus baris contoh dan memasukkan soal buatan Anda sebanyak mungkin.' }
  ];

  const wb = XLSX.utils.book_new();

  const wsTemplate = XLSX.utils.json_to_sheet(templateData);
  // Column widths
  wsTemplate['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Kode
    { wch: 28 }, // Nama
    { wch: 15 }, // Difficulty
    { wch: 30 }, // Indikator
    { wch: 50 }, // Teks Soal
    { wch: 35 }, // Pilihan A
    { wch: 10 }, // Bobot A
    { wch: 35 }, // Pilihan B
    { wch: 10 }, // Bobot B
    { wch: 35 }, // Pilihan C
    { wch: 10 }, // Bobot C
    { wch: 35 }, // Pilihan D
    { wch: 10 }, // Bobot D
    { wch: 35 }, // Pilihan E
    { wch: 10 }, // Bobot E
    { wch: 35 }, // Penjelasan
    { wch: 12 }  // Status
  ];

  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 30 },
    { wch: 18 },
    { wch: 45 },
    { wch: 50 }
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 80 }];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Soal_SJT');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Daftar_Kompetensi');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Bank_Soal_CBT_SENDRATASIK.xlsx');
};

/**
 * Exports all existing questions into an Excel file.
 */
export const exportQuestionsToExcel = (questions: Question[]) => {
  const exportData = questions.map((q, idx) => ({
    'No': idx + 1,
    'ID Soal': q.id,
    'Kode Kompetensi': q.competency_code || '',
    'Nama Kompetensi': q.competency_name || '',
    'Tingkat Kesulitan': q.difficulty || 'Sedang',
    'Indikator Perilaku': q.indicator || '-',
    'Teks Soal / Skenario Kasus': q.question_text,
    'Pilihan A': q.options.A?.text || '',
    'Bobot A': q.options.A?.weight || 0,
    'Pilihan B': q.options.B?.text || '',
    'Bobot B': q.options.B?.weight || 0,
    'Pilihan C': q.options.C?.text || '',
    'Bobot C': q.options.C?.weight || 0,
    'Pilihan D': q.options.D?.text || '',
    'Bobot D': q.options.D?.weight || 0,
    'Pilihan E': q.options.E?.text || '',
    'Bobot E': q.options.E?.weight || 0,
    'Penjelasan / Rasional Bobot': q.explanation || '-',
    'Status': q.status,
    'Tipe Soal': q.is_sample ? 'Sampel Bawaan' : 'Kustom Pembina',
    'Dibuat Oleh': q.created_by || 'Admin',
    'Tanggal Buat': q.created_at ? new Date(q.created_at).toLocaleDateString('id-ID') : '-'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 28 },
    { wch: 15 },
    { wch: 30 },
    { wch: 50 },
    { wch: 35 },
    { wch: 10 },
    { wch: 35 },
    { wch: 10 },
    { wch: 35 },
    { wch: 10 },
    { wch: 35 },
    { wch: 10 },
    { wch: 35 },
    { wch: 10 },
    { wch: 35 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data_Bank_Soal');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Bank_Soal_CBT_SENDRATASIK_${dateStr}.xlsx`);
};

export interface ParsedQuestionItem {
  isValid: boolean;
  validationError?: string;
  data: {
    competency_id: string;
    competency_code: string;
    competency_name: string;
    question_text: string;
    difficulty: string;
    indicator: string;
    explanation: string;
    status: string;
    options: {
      A: { text: string; weight: number };
      B: { text: string; weight: number };
      C: { text: string; weight: number };
      D: { text: string; weight: number };
      E: { text: string; weight: number };
    };
  };
}

/**
 * Parses an uploaded Excel file and validates rows against competencies and SJT criteria.
 */
export const parseQuestionsExcelFile = async (
  file: File,
  competencies: Competency[]
): Promise<{ success: boolean; results: ParsedQuestionItem[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Find primary sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ success: false, results: [], error: 'File Excel tidak memiliki lembar kerja (worksheet).' });
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          resolve({ success: false, results: [], error: 'Lembar kerja Excel kosong atau tidak memiliki data baris.' });
          return;
        }

        const parsedItems: ParsedQuestionItem[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // considering 1-based index + header

          // Extract fields flexibly by key name match
          const getVal = (keys: string[]): string => {
            for (const k of keys) {
              const matchedKey = Object.keys(row).find(
                rk => rk.trim().toLowerCase() === k.trim().toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const getNum = (keys: string[], defaultVal = 1): number => {
            const strVal = getVal(keys);
            const num = Number(strVal);
            return isNaN(num) ? defaultVal : num;
          };

          const compCodeInput = getVal(['Kode Kompetensi', 'Kode', 'competency_code', 'Kode_Kompetensi']);
          const compNameInput = getVal(['Nama Kompetensi', 'Kompetensi', 'competency_name']);
          const questionText = getVal(['Teks Soal / Skenario Kasus', 'Teks Soal', 'Pertanyaan', 'question_text', 'Soal']);
          const difficultyRaw = getVal(['Tingkat Kesulitan', 'Kesulitan', 'difficulty']);
          const indicator = getVal(['Indikator Perilaku', 'Indikator', 'indicator']);
          const explanation = getVal(['Penjelasan / Rasional Bobot', 'Penjelasan', 'Pembahasan', 'explanation']);
          const statusRaw = getVal(['Status', 'status']);

          const optAText = getVal(['Pilihan A', 'Opsi A', 'Option A', 'A']);
          const optBText = getVal(['Pilihan B', 'Opsi B', 'Option B', 'B']);
          const optCText = getVal(['Pilihan C', 'Opsi C', 'Option C', 'C']);
          const optDText = getVal(['Pilihan D', 'Opsi D', 'Option D', 'D']);
          const optEText = getVal(['Pilihan E', 'Opsi E', 'Option E', 'E']);

          const optAWeight = getNum(['Bobot A', 'Skor A', 'Weight A'], 5);
          const optBWeight = getNum(['Bobot B', 'Skor B', 'Weight B'], 4);
          const optCWeight = getNum(['Bobot C', 'Skor C', 'Weight C'], 3);
          const optDWeight = getNum(['Bobot D', 'Skor D', 'Weight D'], 2);
          const optEWeight = getNum(['Bobot E', 'Skor E', 'Weight E'], 1);

          // Skip completely blank rows
          if (!questionText && !optAText && !compCodeInput) {
            return;
          }

          let validationError = '';
          let matchedComp: Competency | undefined;

          // Match competency
          if (compCodeInput) {
            matchedComp = competencies.find(
              c => c.code.toLowerCase() === compCodeInput.toLowerCase() || c.id === compCodeInput
            );
          }
          if (!matchedComp && compNameInput) {
            matchedComp = competencies.find(
              c => c.name.toLowerCase().includes(compNameInput.toLowerCase()) ||
                   compNameInput.toLowerCase().includes(c.name.toLowerCase())
            );
          }
          if (!matchedComp && competencies.length > 0) {
            matchedComp = competencies[0]; // fallback if not strict
          }

          if (!matchedComp) {
            validationError = `Baris ${rowNum}: Kompetensi "${compCodeInput || compNameInput}" tidak ditemukan dalam sistem.`;
          } else if (!questionText || questionText.length < 5) {
            validationError = `Baris ${rowNum}: Teks soal / skenario kasus terlalu pendek atau kosong.`;
          } else if (!optAText || !optBText || !optCText || !optDText || !optEText) {
            validationError = `Baris ${rowNum}: Seluruh opsi A, B, C, D, dan E wajib terisi lengkap.`;
          }

          // Difficulty validation
          let difficulty = 'Sedang';
          if (['mudah', 'easy'].includes(difficultyRaw.toLowerCase())) difficulty = 'Mudah';
          if (['sulit', 'hard'].includes(difficultyRaw.toLowerCase())) difficulty = 'Sulit';

          // Status validation
          let status = 'Approved';
          if (['draft', 'draf'].includes(statusRaw.toLowerCase())) status = 'Draft';

          parsedItems.push({
            isValid: !validationError,
            validationError,
            data: {
              competency_id: matchedComp?.id || competencies[0]?.id || '',
              competency_code: matchedComp?.code || compCodeInput || 'COMP_01',
              competency_name: matchedComp?.name || compNameInput || 'Kompetensi',
              question_text: questionText,
              difficulty,
              indicator: indicator || '-',
              explanation: explanation || '-',
              status,
              options: {
                A: { text: optAText, weight: Math.min(Math.max(1, optAWeight), 5) },
                B: { text: optBText, weight: Math.min(Math.max(1, optBWeight), 5) },
                C: { text: optCText, weight: Math.min(Math.max(1, optCWeight), 5) },
                D: { text: optDText, weight: Math.min(Math.max(1, optDWeight), 5) },
                E: { text: optEText, weight: Math.min(Math.max(1, optEWeight), 5) }
              }
            }
          });
        });

        resolve({ success: true, results: parsedItems });
      } catch (err: any) {
        resolve({
          success: false,
          results: [],
          error: `Gagal membaca file Excel: ${err.message || 'Format berkas tidak didukung.'}`
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, results: [], error: 'Terjadi kesalahan saat membaca file.' });
    };

    reader.readAsArrayBuffer(file);
  });
};

// ============================================================================
// PARTICIPANT EXCEL MODULE (TEMPLATE, EXPORT, IMPORT & PARSER)
// ============================================================================

export interface ExcelParticipantRow {
  'No'?: number | string;
  'NISN (Wajib - 10 Digit)'?: string | number;
  'NISN (Wajib)'?: string | number;
  'NISN'?: string | number;
  'Nama Lengkap (Wajib)'?: string;
  'Nama Lengkap'?: string;
  'Nama'?: string;
  'Kelas (Wajib)'?: string;
  'Kelas'?: string;
  'Jurusan'?: string;
  'Jenis Kelamin (Laki-laki / Perempuan)'?: string;
  'Jenis Kelamin'?: string;
  'No HP / WhatsApp'?: string | number;
  'No HP'?: string | number;
  'Telepon'?: string | number;
  'Email'?: string;
  'Pilihan Divisi Utama (Wajib)'?: string;
  'Pilihan Divisi Utama'?: string;
  'Pilihan Utama'?: string;
  'Pilihan Divisi Alternatif'?: string;
  'Pilihan Alternatif'?: string;
  'Motivasi / Alasan Mendaftar'?: string;
  'Motivasi'?: string;
  [key: string]: any;
}

export interface ParticipantImportData {
  nisn: string;
  name: string;
  class_grade: string;
  major: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email: string;
  primary_choice: string;
  alternative_choice: string;
  motivation: string;
}

export interface ParsedParticipantItem {
  isValid: boolean;
  validationError?: string;
  data: ParticipantImportData;
}

const DEFAULT_POSITIONS = [
  'Ketua Umum Eksekutif SENDRATASIK',
  'Wakil Ketua Eksekutif',
  'Sekretaris Eksekutif',
  'Bendahara Eksekutif',
  'Koordinator Hubungan Masyarakat & Publikasi',
  'Koordinator Sarana, Prasarana & Tata Panggung',
  'Koordinator Divisi Seni Musik / Vokal',
  'Koordinator Divisi Seni Tari & Koreografi',
  'Koordinator Divisi Seni Drama & Teater'
];

/**
 * Generates and downloads a structured Excel template for participant registration.
 */
export const downloadParticipantExcelTemplate = (positions?: PositionProfile[]) => {
  const positionList = (positions && positions.length > 0)
    ? positions.map(p => p.position_name)
    : DEFAULT_POSITIONS;

  // 1. Template Sheet with realistic sample records
  const templateData = [
    {
      'No': 1,
      'NISN (Wajib - 10 Digit)': '0081122331',
      'Nama Lengkap (Wajib)': 'Ahmad Fauzi Rahman',
      'Kelas (Wajib)': 'X MIPA 1',
      'Jurusan': 'MIPA',
      'Jenis Kelamin (Laki-laki / Perempuan)': 'Laki-laki',
      'No HP / WhatsApp': '081234567890',
      'Email': 'ahmad.fauzi@gmail.com',
      'Pilihan Divisi Utama (Wajib)': positionList[0] || 'Ketua Umum Eksekutif SENDRATASIK',
      'Pilihan Divisi Alternatif': positionList[6] || 'Koordinator Divisi Seni Musik / Vokal',
      'Motivasi / Alasan Mendaftar': 'Ingin berkontribusi memajukan sanggar seni dan melatih jiwa kepemimpinan tim pementasan.'
    },
    {
      'No': 2,
      'NISN (Wajib - 10 Digit)': '0082233442',
      'Nama Lengkap (Wajib)': 'Nabila Putri Maharani',
      'Kelas (Wajib)': 'X IPS 2',
      'Jurusan': 'IPS',
      'Jenis Kelamin (Laki-laki / Perempuan)': 'Perempuan',
      'No HP / WhatsApp': '081398765432',
      'Email': 'nabila.putri@gmail.com',
      'Pilihan Divisi Utama (Wajib)': positionList[2] || 'Sekretaris Eksekutif',
      'Pilihan Divisi Alternatif': positionList[3] || 'Bendahara Eksekutif',
      'Motivasi / Alasan Mendaftar': 'Memiliki ketelitian tinggi dalam tata kelola administrasi surat-menyurat dan arsip sanggar.'
    },
    {
      'No': 3,
      'NISN (Wajib - 10 Digit)': '0083344553',
      'Nama Lengkap (Wajib)': 'Bagas Satria Pratama',
      'Kelas (Wajib)': 'X MIPA 3',
      'Jurusan': 'MIPA',
      'Jenis Kelamin (Laki-laki / Perempuan)': 'Laki-laki',
      'No HP / WhatsApp': '085712348899',
      'Email': 'bagas.satria@gmail.com',
      'Pilihan Divisi Utama (Wajib)': positionList[5] || 'Koordinator Sarana, Prasarana & Tata Panggung',
      'Pilihan Divisi Alternatif': positionList[8] || 'Koordinator Divisi Seni Drama & Teater',
      'Motivasi / Alasan Mendaftar': 'Tertarik mendalami tata artistik panggung, tata cahaya/lighting, dan manajemen logistik festival.'
    }
  ];

  // 2. Reference Sheet for Available Divisions
  const divisionsData = (positions && positions.length > 0)
    ? positions.map((p, idx) => ({
        'No': idx + 1,
        'Kode Posisi': p.code,
        'Nama Posisi / Divisi (Salin ke Template)': p.position_name,
        'Deskripsi Tugas & Tanggung Jawab': p.description
      }))
    : DEFAULT_POSITIONS.map((name, idx) => ({
        'No': idx + 1,
        'Kode Posisi': `POS_0${idx + 1}`,
        'Nama Posisi / Divisi (Salin ke Template)': name,
        'Deskripsi Tugas & Tanggung Jawab': `Tanggung jawab koordinasi struktural divisi ${name}.`
      }));

  // 3. Instruction Sheet
  const instructionsData = [
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '1. Jangan mengubah, menambah, atau menghapus susunan nama kolom header pada baris pertama (Row 1).' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '2. Kolom "NISN", "Nama Lengkap", "Kelas", dan "Pilihan Divisi Utama" merupakan data WAJIB terisi.' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '3. NISN akan secara otomatis digunakan sebagai Username dan Password default peserta untuk login ke aplikasi CBT.' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '4. Format "Jenis Kelamin" dapat diisi "Laki-laki" atau "Perempuan".' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '5. Nama "Pilihan Divisi Utama" dan "Pilihan Divisi Alternatif" dapat disalin langsung dari Sheet "Daftar_Pilihan_Divisi".' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '6. Anda dapat menghapus data contoh pada baris 2-4 dan mengisi data calon peserta sebanyak yang dibutuhkan.' },
    { 'Petunjuk Pengisian Template Peserta CBT SENDRATASIK': '7. Simpan file dalam format .xlsx atau .xls sebelum diunggah kembali ke sistem.' }
  ];

  const wb = XLSX.utils.book_new();

  const wsTemplate = XLSX.utils.json_to_sheet(templateData);
  wsTemplate['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // NISN
    { wch: 28 }, // Nama
    { wch: 16 }, // Kelas
    { wch: 14 }, // Jurusan
    { wch: 20 }, // Jenis Kelamin
    { wch: 18 }, // No HP
    { wch: 25 }, // Email
    { wch: 38 }, // Pilihan Utama
    { wch: 38 }, // Pilihan Alternatif
    { wch: 55 }  // Motivasi
  ];

  const wsDivisions = XLSX.utils.json_to_sheet(divisionsData);
  wsDivisions['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 42 },
    { wch: 60 }
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 100 }];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Peserta');
  XLSX.utils.book_append_sheet(wb, wsDivisions, 'Daftar_Pilihan_Divisi');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Peserta_CBT_SENDRATASIK.xlsx');
};

/**
 * Exports participants list with test results, scores, and status into an Excel file.
 */
export const exportParticipantsToExcel = (participants: any[]) => {
  const exportData = participants.map((p, idx) => {
    let statusText = 'Belum Mulai';
    if (p.status === 'completed') statusText = 'Selesai (Completed)';
    if (p.status === 'in_progress') statusText = 'Sedang Ujian';

    return {
      'No': idx + 1,
      'ID Peserta': p.id || '',
      'NISN (Username & Password)': p.nisn || '',
      'Nama Lengkap': p.name || '',
      'Kelas': p.class_grade || '',
      'Jurusan': p.major || '-',
      'Jenis Kelamin': p.gender || 'Laki-laki',
      'No HP / WhatsApp': p.phone || '-',
      'Email': p.email || '-',
      'Pilihan Divisi Utama': p.primary_choice || '-',
      'Pilihan Divisi Alternatif': p.alternative_choice || '-',
      'Status CBT': statusText,
      'Nilai Akhir Ujian': p.final_score !== null && p.final_score !== undefined ? p.final_score : '-',
      'Rekomendasi Jabatan Utama': p.top_recommendation || '-',
      'Motivasi Pendaftaran': p.motivation || '-',
      'Tanggal Terdaftar': p.created_at ? new Date(p.created_at).toLocaleString('id-ID') : '-'
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 16 }, // ID
    { wch: 22 }, // NISN
    { wch: 28 }, // Nama
    { wch: 14 }, // Kelas
    { wch: 12 }, // Jurusan
    { wch: 15 }, // Gender
    { wch: 18 }, // Phone
    { wch: 25 }, // Email
    { wch: 38 }, // Primary
    { wch: 38 }, // Alternative
    { wch: 20 }, // Status
    { wch: 16 }, // Score
    { wch: 38 }, // Recommendation
    { wch: 45 }, // Motivation
    { wch: 22 }  // Created At
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Direktori_Peserta_CBT');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Data_Peserta_CBT_SENDRATASIK_${dateStr}.xlsx`);
};

/**
 * Parses and validates an uploaded Excel file for participant registration.
 */
export const parseParticipantsExcelFile = async (
  file: File,
  positions?: PositionProfile[]
): Promise<{ success: boolean; results: ParsedParticipantItem[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Prefer sheet named 'Template_Peserta' or first sheet
        let sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('peserta')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          resolve({ success: false, results: [], error: 'Berkas Excel tidak memiliki sheet yang dapat dibaca.' });
          return;
        }

        const rawJson: ExcelParticipantRow[] = XLSX.utils.sheet_to_json(worksheet);
        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, results: [], error: 'Lembar kerja Excel kosong atau tidak memiliki baris data.' });
          return;
        }

        const validPositions = (positions && positions.length > 0)
          ? positions.map(p => p.position_name)
          : DEFAULT_POSITIONS;

        const parsedItems: ParsedParticipantItem[] = [];
        const seenNisns = new Set<string>();

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // Excel row number including header

          // Extract fields flexibly across possible column header variations
          const nisnRaw = String(
            row['NISN (Wajib - 10 Digit)'] ||
            row['NISN (Wajib)'] ||
            row['NISN'] ||
            row['nisn'] ||
            ''
          ).trim();

          const nameRaw = String(
            row['Nama Lengkap (Wajib)'] ||
            row['Nama Lengkap'] ||
            row['Nama'] ||
            row['nama'] ||
            ''
          ).trim();

          const classRaw = String(
            row['Kelas (Wajib)'] ||
            row['Kelas'] ||
            row['kelas'] ||
            ''
          ).trim();

          const majorRaw = String(
            row['Jurusan'] ||
            row['jurusan'] ||
            ''
          ).trim();

          const genderRaw = String(
            row['Jenis Kelamin (Laki-laki / Perempuan)'] ||
            row['Jenis Kelamin'] ||
            row['gender'] ||
            ''
          ).trim();

          const phoneRaw = String(
            row['No HP / WhatsApp'] ||
            row['No HP'] ||
            row['Telepon'] ||
            row['No. HP'] ||
            row['phone'] ||
            ''
          ).trim();

          const emailRaw = String(
            row['Email'] ||
            row['email'] ||
            ''
          ).trim();

          const primaryChoiceRaw = String(
            row['Pilihan Divisi Utama (Wajib)'] ||
            row['Pilihan Divisi Utama'] ||
            row['Pilihan Utama'] ||
            row['pilihan_utama'] ||
            ''
          ).trim();

          const altChoiceRaw = String(
            row['Pilihan Divisi Alternatif'] ||
            row['Pilihan Alternatif'] ||
            row['pilihan_alternatif'] ||
            ''
          ).trim();

          const motivationRaw = String(
            row['Motivasi / Alasan Mendaftar'] ||
            row['Motivasi'] ||
            row['motivasi'] ||
            ''
          ).trim();

          // Skip completely empty spacer rows
          if (!nisnRaw && !nameRaw && !classRaw && !primaryChoiceRaw) {
            return;
          }

          let validationError = '';

          // Validate NISN
          if (!nisnRaw) {
            validationError = `Baris ${rowNum}: NISN wajib diisi.`;
          } else if (nisnRaw.length < 4) {
            validationError = `Baris ${rowNum}: Format NISN terlalu pendek (minimal 4 karakter).`;
          } else if (seenNisns.has(nisnRaw)) {
            validationError = `Baris ${rowNum}: Terdapat duplikasi NISN (${nisnRaw}) dalam berkas Excel ini.`;
          } else {
            seenNisns.add(nisnRaw);
          }

          // Validate Name
          if (!validationError && (!nameRaw || nameRaw.length < 2)) {
            validationError = `Baris ${rowNum}: Nama lengkap wajib diisi (minimal 2 huruf).`;
          }

          // Validate Class
          if (!validationError && !classRaw) {
            validationError = `Baris ${rowNum}: Kelas wajib diisi (misal: X MIPA 1).`;
          }

          // Normalize Gender
          let gender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
          const gLower = genderRaw.toLowerCase();
          if (gLower.includes('perempuan') || gLower.startsWith('p') || gLower.includes('wanita') || gLower.startsWith('f')) {
            gender = 'Perempuan';
          }

          // Resolve Primary Choice (Fuzzy Match if possible)
          let resolvedPrimary = primaryChoiceRaw;
          if (!resolvedPrimary) {
            resolvedPrimary = validPositions[0] || 'Ketua Umum Eksekutif SENDRATASIK';
          } else {
            const matched = validPositions.find(p => 
              p.toLowerCase() === primaryChoiceRaw.toLowerCase() ||
              p.toLowerCase().includes(primaryChoiceRaw.toLowerCase()) ||
              primaryChoiceRaw.toLowerCase().includes(p.toLowerCase())
            );
            if (matched) resolvedPrimary = matched;
          }

          let resolvedAlternative = altChoiceRaw;
          if (altChoiceRaw) {
            const matchedAlt = validPositions.find(p => 
              p.toLowerCase() === altChoiceRaw.toLowerCase() ||
              p.toLowerCase().includes(altChoiceRaw.toLowerCase()) ||
              altChoiceRaw.toLowerCase().includes(p.toLowerCase())
            );
            if (matchedAlt) resolvedAlternative = matchedAlt;
          }

          parsedItems.push({
            isValid: !validationError,
            validationError,
            data: {
              nisn: nisnRaw,
              name: nameRaw,
              class_grade: classRaw || 'X',
              major: majorRaw || '-',
              gender,
              phone: phoneRaw || '-',
              email: emailRaw || '-',
              primary_choice: resolvedPrimary,
              alternative_choice: resolvedAlternative || '-',
              motivation: motivationRaw || '-'
            }
          });
        });

        resolve({ success: true, results: parsedItems });
      } catch (err: any) {
        resolve({
          success: false,
          results: [],
          error: `Gagal memproses file Excel: ${err.message || 'Format berkas tidak sesuai.'}`
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, results: [], error: 'Gagal membaca berkas Excel.' });
    };

    reader.readAsArrayBuffer(file);
  });
};

