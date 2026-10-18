import { MediaIdentity, MateriSlide, QuizQuestion } from '../types';
import { QUESTION_BANK_150 } from './questionBank150';

export const DEFAULT_IDENTITY: MediaIdentity = {
  mediaTitle: 'Petualangan Pecahan & Desimal Master',
  subject: 'Matematika',
  grade: 'Kelas 6 SD/MI',
  phase: 'Fase C (Kurikulum Merdeka)',
  topic: 'Pecahan dan Desimal',
  school: 'SD Cendekia Nusantara',
  teacherName: 'Bapak Ahmad Fauzi, S.Pd., Gr.',
  passingScore: 75,
};

export const LEARNING_OBJECTIVES = {
  competence: 'Memahami hubungan antara pecahan dan desimal, mengubah bentuk pecahan ke desimal dan sebaliknya, membandingkan nilai, serta menyelesaikan operasi hitung pecahan dan desimal dalam masalah sehari-hari.',
  objectives: [
    'Siswa mampu mengubah pecahan biasa dan campuran ke dalam bentuk desimal dengan teknik pembagian atau mengubah penyebut ke 10, 100, atau 1000 secara tepat.',
    'Siswa mampu mengubah bilangan desimal menjadi pecahan biasa dalam bentuk yang paling sederhana.',
    'Siswa mampu membandingkan dan mengurutkan berbagai bentuk pecahan dan desimal dari yang terkecil ke terbesar atau sebaliknya.',
    'Siswa mampu menyelesaikan operasi hitung penjumlahan, pengurangan, perkalian, dan soal cerita kontekstual yang melibatkan pecahan dan desimal.'
  ],
  indicators: [
    'Mampu menentukan bentuk desimal dari pecahan umum (seperti 1/2, 1/4, 3/4, 2/5, 4/5) tanpa ragu.',
    'Mampu menyederhanakan pecahan desimal persepuluhan atau perseratusan ke pecahan paling sederhana menggunakan FPB.',
    'Mampu mengurutkan minimal 4 bilangan campuran (pecahan dan desimal) secara tepat pada garis bilangan.',
    'Memperoleh skor minimal kriteria ketercapaian tujuan pembelajaran (KKTP: 75) pada kuis latihan evaluasi.'
  ],
  userGuide: [
    'Cermati tujuan pembelajaran dan indikator keberhasilan sebelum memulai.',
    'Pelajari materi lembar demi lembar, coba manipulasi potongan pizza dan amati perubahan nilai desimalnya.',
    'Selesaikan aktivitas mini-game interaktif (mencocokkan nilai senilai, mengurutkan bilangan, dan kuis cek pemahaman).',
    'Kerjakan 5 soal latihan secara mandiri, teliti setiap pilihan, lalu kirimkan nilaimu ke guru.',
    'Tuliskan refleksi belajarmu dengan jujur agar gurumu dapat memberikan bimbingan terbaik.'
  ]
};

export const DEFAULT_MATERI_SLIDES: MateriSlide[] = [
  {
    id: 1,
    title: 'Mengenal Kembali Pecahan & Nilai Senilai',
    subtitle: 'Mengapa pecahan dan desimal adalah dua sisi dari koin yang sama?',
    concept: 'Pecahan melambangkan bagian dari suatu kesatuan utuh. Dalam pecahan a/b, bilangan atas (a) disebut PEMBILANG (bagian yang diambil), sedangkan bilangan bawah (b) disebut PENYEBUT (total seluruh potongan yang sama besar).',
    content: [
      'Pecahan Senilai: Dua pecahan bernilai sama jika pembilang dan penyebut dikalikan atau dibagi dengan bilangan yang sama (misal 1/2 = 2/4 = 5/10).',
      'Desimal adalah cara lain menuliskan pecahan yang memiliki penyebut kelipatan 10 (persepuluhan, perseratusan, perseribuan).',
      'Contoh: 1 bagian dari 10 kotak adalah 1/10 yang ditulis dalam desimal menjadi 0,1.'
    ],
    illustrationType: 'water-cycle',
    funFact: 'Tanda koma (,) di Indonesia atau titik (.) dalam standar internasional digunakan untuk memisahkan bilangan bulat dengan bagian pecahannya!',
    activity: {
      type: 'hotspot',
      title: 'Eksplorasi Konsep Nilai Pecahan',
      instruction: 'Sentuh atau klik kartu konsep di bawah ini untuk melihat contoh konkretnya!',
      data: [
        { name: 'Pecahan Biasa', role: 'Bentuk a/b', desc: 'Contoh: 3/4. Artinya ada 3 bagian yang diambil dari total 4 potongan yang berukuran sama rata.' },
        { name: 'Pecahan Campuran', role: 'Bulat + Pecahan', desc: 'Contoh: 1 1/2. Artinya ada 1 benda utuh ditambah setengah bagian lagi (senilai dengan 3/2 atau 1,5).' },
        { name: 'Bilangan Desimal', role: 'Basis Persepuluhan', desc: 'Contoh: 0,75. Angka 7 di tempat persepuluhan (7/10) dan angka 5 di tempat perseratusan (5/100).' },
        { name: 'Pecahan Senilai', role: 'Proporsi Sama', desc: 'Contoh: 2/5 senilai dengan 4/10. Karena penyebutnya sudah 10, bentuk desimalnya langsung 0,4!' }
      ]
    }
  },
  {
    id: 2,
    title: 'Trik Jitu Mengubah Pecahan ke Desimal',
    subtitle: 'Dua cara mudah: Menjadikan per 10/100 atau Pembagian Bersusun (Porogapit)',
    concept: 'Mengubah pecahan menjadi desimal sangatlah mudah! Ada 2 metode ampuh yang dapat kamu pilih:',
    content: [
      'METODE 1 (Mengubah Penyebut): Ubah penyebut menjadi 10, 100, atau 1000. Contoh: 3/5 dikalikan 2/2 menjadi 6/10 = 0,6. Atau 3/4 dikalikan 25/25 menjadi 75/100 = 0,75.',
      'METODE 2 (Porogapit / Pembagian Bersusun): Bagi pembilang dengan penyebut secara langsung. Contoh: 1/8 = 1 ÷ 8 = 0,125.',
      'MENGUBAH DESIMAL KE PECAHAN: Tulis sebagai per 10 (1 angka di belakang koma) atau per 100 (2 angka di belakang koma), lalu sederhanakan dengan membagi FPB. Contoh: 0,8 = 8/10 = (8÷2)/(10÷2) = 4/5.'
    ],
    illustrationType: 'clouds',
    funFact: 'Jika sebuah pecahan memiliki penyebut yang faktor primanya hanya 2 dan 5, maka pecahan tersebut pasti menghasilkan desimal terbatas (tidak berulang tanpa henti)!',
    activity: {
      type: 'checklist',
      title: 'Kuis Cepat: Nilai Desimal Kilat',
      instruction: 'Tebak bentuk desimal yang tepat untuk pecahan-pecahan berikut:',
      data: [
        { scenario: 'Bentuk desimal dari pecahan 1/2 adalah...', answer: '0,5' },
        { scenario: 'Bentuk desimal dari pecahan 1/4 adalah...', answer: '0,25' },
        { scenario: 'Bentuk desimal dari pecahan 4/5 adalah...', answer: '0,8' }
      ]
    }
  },
  {
    id: 3,
    title: 'Aktivitas Interaktif: Pasangan Pecahan & Desimal Senilai',
    subtitle: 'Uji ketangkasanmu mencocokkan bentuk pecahan dengan nilai desimalnya!',
    concept: 'Ayo latih daya ingat dan kepekaan angkamu. Klik satu pecahan di sebelah kiri, lalu klik nilai desimal yang setara di sebelah kanan!',
    content: [
      'Pecahan dan desimal di bawah ini memiliki nilai yang persis sama, hanya bentuk penulisannya yang berbeda.',
      'Cocokkan kelima pasangan dengan tepat untuk mendapatkan bintang kesempurnaan!'
    ],
    illustrationType: 'groundwater',
    activity: {
      type: 'matching',
      title: 'Tantangan Mencocokkan Nilai Senilai',
      instruction: 'Klik pecahan di kolom Kiri, lalu klik nilai desimal yang cocok di kolom Kanan.',
      data: [
        { id: 'p1', term: '1/2 (Setengah)', matchId: 'd1', definition: '0,5 (Lima persepuluhan)' },
        { id: 'p2', term: '1/4 (Seperempat)', matchId: 'd2', definition: '0,25 (Dua puluh lima perseratusan)' },
        { id: 'p3', term: '3/4 (Tiga perempat)', matchId: 'd3', definition: '0,75 (Tujuh puluh lima perseratusan)' },
        { id: 'p4', term: '2/5 (Dua perlima)', matchId: 'd4', definition: '0,4 (Empat persepuluhan / senilai 4/10)' },
        { id: 'p5', term: '1/8 (Seperdelapan)', matchId: 'd5', definition: '0,125 (Seratus dua puluh lima perseribuan)' }
      ]
    }
  },
  {
    id: 4,
    title: 'Aktivitas Interaktif: Mengurutkan Bilangan',
    subtitle: 'Susun pecahan dan desimal dari yang TERKECIL hingga TERBESAR!',
    concept: 'TIPS PENTING: Untuk membandingkan atau mengurutkan bilangan yang berbeda bentuk, ubahlah semuanya terlebih dahulu ke dalam bentuk DESIMAL yang seragam!',
    content: [
      'Urutkan bilangan di bawah ini dari yang paling kecil hingga yang paling besar.',
      'Gunakan tombol Naik atau Turun untuk mengatur posisi urutan bilangan, lalu klik "Periksa Urutan".'
    ],
    illustrationType: 'water-cycle',
    activity: {
      type: 'ordering',
      title: 'Tantangan Mengurutkan dari Terkecil ke Terbesar',
      instruction: 'Urutkan bilangan-bilangan ini secara berurutan mulai dari yang paling kecil (Nomor 1) ke paling besar (Nomor 5):',
      data: [
        { stepId: 1, text: '0,15 (Nilai desimal: 0,15)' },
        { stepId: 2, text: '1/4 (Nilai desimal: 0,25)' },
        { stepId: 3, text: '2/5 (Nilai desimal: 0,40)' },
        { stepId: 4, text: '0,65 (Nilai desimal: 0,65)' },
        { stepId: 5, text: '3/4 (Nilai desimal: 0,75)' }
      ]
    }
  },
  {
    id: 5,
    title: 'Operasi Hitung Pecahan & Desimal dalam Kehidupan',
    subtitle: 'Bagaimana pecahan dan desimal digunakan saat memasak, belanja, dan mengukur?',
    concept: 'Dalam kehidupan nyata, kita sering menjumpai perhitungan campuran antara pecahan dan desimal. Misalnya: membeli 1,5 kg beras dan menambah 1/2 kg gula.',
    content: [
      'PENJUMLAHAN & PENGURANGAN: Samakan bentuknya terlebih dahulu! Contoh: 1/2 + 0,25 = 0,5 + 0,25 = 0,75 (atau 1/2 + 1/4 = 2/4 + 1/4 = 3/4).',
      'PERKALIAN: Contoh: 0,4 × 1/2 = 4/10 × 1/2 = 4/20 = 2/10 = 0,2.',
      'Trik Cepat Menghitung Desimal: Jumlahkan dengan meluruskan tanda koma (,), bukan meluruskan angka paling kanan!'
    ],
    illustrationType: 'conservation',
    funFact: 'Dalam resep kue internasional, takaran bahan cair sering ditulis dalam pecahan (seperti 3/4 cangkir susu) sedangkan timbangan digital membaca dalam desimal (0,75 liter)!',
    activity: {
      type: 'checklist',
      title: 'Pilah Pernyataan Matematika: Benar atau Salah?',
      instruction: 'Tentukan apakah hasil operasi hitung berikut ini BENAR atau SALAH!',
      data: [
        { scenario: '1/2 + 0,5 hasilnya sama dengan 1 (satu utuh)', answer: 'Benar' },
        { scenario: 'Nilai dari 0,75 lebih kecil daripada 1/2', answer: 'Salah' },
        { scenario: '3/4 senilai dengan 0,75', answer: 'Benar' },
        { scenario: '0,2 jika diubah ke pecahan paling sederhana adalah 2/10 (belum disederhanakan)', answer: 'Salah' }
      ]
    }
  }
];

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = QUESTION_BANK_150;

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - BACKEND MEDIA PEMBELAJARAN INTERAKTIF (MPI)
 * =========================================================================
 * Script ini mengelola 3 sheet otomatis:
 * 1. DATA_SISWA   : Mencatat kehadiran dan sesi awal belajar siswa
 * 2. HASIL_LATIHAN : Mencatat hasil pengerjaan kuis/latihan dan nilai skor
 * 3. REFLEKSI     : Mencatat umpan balik, pemahaman, dan refleksi siswa
 *
 * Menggunakan ID SESI unik untuk menghubungkan data antar sheet tanpa duplikasi.
 */

// Nama-nama Sheet yang akan dibuat otomatis jika belum ada
const SHEET_NAMES = {
  SISWA: 'DATA_SISWA',
  LATIHAN: 'HASIL_LATIHAN',
  REFLEKSI: 'REFLEKSI'
};

// Struktur Header untuk setiap sheet
const HEADERS = {
  DATA_SISWA: [
    'ID Sesi',
    'Waktu Mulai',
    'Nama Siswa',
    'Kelas',
    'No Absen',
    'Nama Media',
    'Mata Pelajaran',
    'Materi'
  ],
  HASIL_LATIHAN: [
    'ID Sesi',
    'Waktu Selesai',
    'Nama Siswa',
    'Kelas',
    'Materi',
    'Jumlah Soal',
    'Jawaban Benar',
    'Jawaban Salah',
    'Skor Akhir',
    'Status Ketercapaian'
  ],
  REFLEKSI: [
    'ID Sesi',
    'Waktu Pengiriman',
    'Nama Siswa',
    'Kelas',
    'Tingkat Pemahaman',
    'Tingkat Keyakinan (1-5)',
    'Aktivitas Paling Disukai',
    'Bagian Paling Sulit',
    'Catatan / Pesan Tambahan'
  ]
};

/**
 * Endpoint GET - Untuk Pengujian Koneksi dan Cek Status Backend
 */
function doGet(e) {
  try {
    initAllSheets();
    const result = {
      status: 'success',
      message: 'Backend Google Apps Script MPI Aktif & Siap Menerima Data!',
      timestamp: new Date().toISOString(),
      sheets: Object.values(SHEET_NAMES)
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST - Menerima Pengiriman Data dari Aplikasi MPI
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return sendResponse({ status: 'error', message: 'Server sibuk, silakan coba kirim kembali.' });
  }

  try {
    initAllSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!e || !e.postData || !e.postData.contents) {
      return sendResponse({ status: 'error', message: 'Tidak ada data yang dikirimkan.' });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return sendResponse({ status: 'error', message: 'Format data JSON tidak valid.' });
    }

    const action = payload.action;
    const data = payload.data;
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    if (action === 'SAVE_STUDENT') {
      const sheet = ss.getSheetByName(SHEET_NAMES.SISWA);
      if (isSessionExists(sheet, data.sessionId)) {
        return sendResponse({ status: 'success', message: 'Data sesi siswa sudah tercatat sebelumnya.' });
      }

      sheet.appendRow([
        data.sessionId || 'S-' + new Date().getTime(),
        formattedDate,
        data.studentName || '-',
        data.studentClass || '-',
        data.studentNumber || '-',
        data.mediaTitle || '-',
        data.subject || '-',
        data.topic || '-'
      ]);

      return sendResponse({ status: 'success', message: 'Data kehadiran siswa berhasil disimpan di Spreadsheet!' });
    }

    else if (action === 'SAVE_QUIZ') {
      const sheet = ss.getSheetByName(SHEET_NAMES.LATIHAN);
      
      const totalSoal = Number(data.totalQuestions) || 1;
      const benar = Number(data.correctAnswers) || 0;
      const salah = Number(data.wrongAnswers) || 0;
      const serverCalculatedScore = Math.round((benar / totalSoal) * 100);
      const passingScore = Number(data.passingScore) || 75;
      const statusKetercapaian = serverCalculatedScore >= passingScore ? 'TUNTAS' : 'PERLU BIMBINGAN';

      const existingRow = findRowBySessionId(sheet, data.sessionId);
      if (existingRow > 0) {
        sheet.getRange(existingRow, 2).setValue(formattedDate);
        sheet.getRange(existingRow, 6).setValue(totalSoal);
        sheet.getRange(existingRow, 7).setValue(benar);
        sheet.getRange(existingRow, 8).setValue(salah);
        sheet.getRange(existingRow, 9).setValue(serverCalculatedScore);
        sheet.getRange(existingRow, 10).setValue(statusKetercapaian);
        return sendResponse({ status: 'success', message: 'Nilai latihan berhasil diperbarui di Spreadsheet!', score: serverCalculatedScore });
      }

      sheet.appendRow([
        data.sessionId || 'S-' + new Date().getTime(),
        formattedDate,
        data.studentName || '-',
        data.studentClass || '-',
        data.topic || '-',
        totalSoal,
        benar,
        salah,
        serverCalculatedScore,
        statusKetercapaian
      ]);

      return sendResponse({ status: 'success', message: 'Hasil latihan berhasil disimpan di Spreadsheet!', score: serverCalculatedScore });
    }

    else if (action === 'SAVE_REFLECTION') {
      const sheet = ss.getSheetByName(SHEET_NAMES.REFLEKSI);
      
      sheet.appendRow([
        data.sessionId || 'S-' + new Date().getTime(),
        formattedDate,
        data.studentName || '-',
        data.studentClass || '-',
        data.understandingLevel || '-',
        data.confidenceRating || 0,
        data.favoriteActivity || '-',
        data.difficultPart || '-',
        data.additionalNotes || '-'
      ]);

      return sendResponse({ status: 'success', message: 'Refleksi pembelajaran berhasil disimpan di Spreadsheet!' });
    }

    else {
      return sendResponse({ status: 'error', message: 'Aksi (' + action + ') tidak dikenali.' });
    }

  } catch (error) {
    return sendResponse({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function sendResponse(responseObj) {
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function initAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEET_NAMES).forEach(key => {
    const sheetName = SHEET_NAMES[key];
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = HEADERS[sheetName];
      if (headers) {
        sheet.appendRow(headers);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#2563EB');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');
        sheet.setFrozenRows(1);
      }
    }
  });

  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
}

function isSessionExists(sheet, sessionId) {
  if (!sessionId) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      return true;
    }
  }
  return false;
}

function findRowBySessionId(sheet, sessionId) {
  if (!sessionId) return -1;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      return i + 1;
    }
  }
  return -1;
}
`;
