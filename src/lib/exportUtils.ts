import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttemptResult } from '../types.js';

export function exportRecapToExcel(results: any[]) {
  const formattedData = results.map((r, index) => {
    const comps: Record<string, number> = {};
    if (r.competency_scores) {
      r.competency_scores.forEach((cs: any) => {
        comps[cs.competency_name || cs.competency_code] = cs.normalized_score;
      });
    }

    const recs = r.recommended_positions || [];

    return {
      'Peringkat': index + 1,
      'Nama Lengkap': r.name,
      'NISN': r.nisn,
      'Kelas': r.class_grade,
      'Pilihan Utama': r.primary_choice,
      'Pilihan Alternatif': r.alternative_choice || '-',
      'Nilai Akhir': r.final_score,
      ...comps,
      'Rekomendasi 1': recs[0] ? `${recs[0].position_name} (${recs[0].match_percentage}%)` : '-',
      'Rekomendasi 2': recs[1] ? `${recs[1].position_name} (${recs[1].match_percentage}%)` : '-',
      'Rekomendasi 3': recs[2] ? `${recs[2].position_name} (${recs[2].match_percentage}%)` : '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Seleksi');
  XLSX.writeFile(workbook, `Rekap_Seleksi_SENDRATASIK_MAN_Purbalingga_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportRecapToPDF(results: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REKAPITULASI HASIL SELEKSI EKSEKUTIF SENDRATASIK', 148.5, 15, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('MADRASAH ALIYAH NEGERI (MAN) PURBALINGGA', 148.5, 21, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 148.5, 26, { align: 'center' });

  const tableHead = [
    ['No', 'Nama Peserta', 'NISN', 'Kelas', 'Pilihan Utama', 'Nilai', 'Rekomendasi Utama', 'Kecocokan']
  ];

  const tableRows = results.map((r, idx) => [
    idx + 1,
    r.name,
    r.nisn,
    r.class_grade,
    r.primary_choice,
    r.final_score,
    r.recommended_positions?.[0]?.position_name || '-',
    r.recommended_positions?.[0] ? `${r.recommended_positions[0].match_percentage}%` : '-'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableRows,
    startY: 32,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 22 }
    }
  });

  doc.save(`Rekap_Seleksi_SENDRATASIK_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportCandidateIndividualPDF(result: any) {
  if (!result) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const participant = result.participant || {};
  const attempt = result.attempt || {};
  const competencyScores = Array.isArray(result.competency_scores) ? result.competency_scores : [];
  const positionScores = Array.isArray(result.position_scores) ? result.position_scores : [];

  // Kop Surat / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAPORAN HASIL TES KEMAMPUAN ORGANISASI', 105, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.text('SELEKSI EKSEKUTIF SENDRATASIK MAN PURBALINGGA', 105, 22, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(15, 26, 195, 26);

  // Biodata Peserta
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('A. DATA PESERTA', 15, 33);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Lengkap: ${participant.name || '-'}`, 15, 40);
  doc.text(`NISN: ${participant.nisn || '-'}`, 15, 46);
  doc.text(`Kelas / Jurusan: ${participant.class_grade || '-'} (${participant.major || '-'})`, 15, 52);
  doc.text(`Jenis Kelamin: ${participant.gender || '-'}`, 115, 40);
  doc.text(`Pilihan Utama: ${participant.primary_choice || '-'}`, 115, 46);
  doc.text(`Pilihan Alternatif: ${participant.alternative_choice || '-'}`, 115, 52);

  // Skor & Peringkat
  doc.setFont('helvetica', 'bold');
  doc.text('B. HASIL PENILAIAN UMUM', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nilai Akhir: ${result.final_score ?? '-'} / 100`, 15, 68);
  doc.text(`Peringkat: ${result.rank || '-'} dari ${result.total_participants || '-'} peserta`, 115, 68);
  doc.text(`Soal Terjawab: ${result.answered_questions ?? '-'} dari ${result.total_questions ?? '-'} soal`, 15, 74);
  doc.text(`Waktu Selesai: ${attempt.finished_at ? new Date(attempt.finished_at).toLocaleString('id-ID') : '-'}`, 115, 74);

  // Profil Kompetensi Table
  doc.setFont('helvetica', 'bold');
  doc.text('C. PROFIL KOMPETENSI ORGANISASI', 15, 84);

  const compTableData = competencyScores.map((cs: any) => [
    cs.competency_name || cs.name || '-',
    cs.raw_score ?? '-',
    cs.max_score ?? '-',
    `${cs.normalized_score ?? cs.score ?? 0}%`
  ]);

  autoTable(doc, {
    head: [['Kompetensi', 'Skor Aktual', 'Skor Maksimal', 'Skor Normalisasi']],
    body: compTableData,
    startY: 88,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      halign: 'center'
    },
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Analisis Rekomendasi Posisi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('D. REKOMENDASI KESESUAIAN POSISI STRUKTURAL', 15, currentY);

  const posTableData = positionScores.slice(0, 5).map((ps: any, idx: number) => [
    idx + 1,
    ps.position_name || '-',
    `${ps.match_percentage ?? 0}%`,
    ps.fit_category || '-'
  ]);

  autoTable(doc, {
    head: [['No', 'Posisi Organisasi', 'Tingkat Kesesuaian', 'Kategori']],
    body: posTableData,
    startY: currentY + 4,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      halign: 'center'
    },
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Disclaimer & Catatan Pembina
  if (result.admin_note) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('E. CATATAN PEMBINA:', 15, currentY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(result.admin_note, 15, currentY + 5, { maxWidth: 180 });
    currentY += 14;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    '* Disclaimer: Rekomendasi sistem ini adalah alat bantu analisis profil kemampuan berdasarkan tes CBT dan bukan keputusan mutlak penempatan. Keputusan akhir tetap berada pada Pembina dan musyawarah seleksi organisasi SENDRATASIK MAN Purbalingga.',
    15,
    currentY,
    { maxWidth: 180 }
  );

  // Tanda Tangan
  currentY += 12;
  if (currentY < 250) {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Purbalingga, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 140, currentY);
    doc.text('Pembina SENDRATASIK,', 140, currentY + 5);
    doc.text('( .................................................. )', 140, currentY + 24);
  }

  const safeNisn = participant.nisn || '0000';
  const safeName = (participant.name || 'peserta').replace(/\s+/g, '_');
  doc.save(`Hasil_CBT_${safeNisn}_${safeName}.pdf`);
}
