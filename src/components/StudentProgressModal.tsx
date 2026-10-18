import React, { useState } from 'react';
import { StudentProgressReport, MediaIdentity } from '../types';
import { audioManager } from '../utils/audio';
import { sendToGoogleAppsScript } from '../services/apiService';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart3,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Share2,
  CloudUpload,
  BookOpen,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: StudentProgressReport | null;
  identity: MediaIdentity;
  scriptUrl?: string;
}

export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  isOpen,
  onClose,
  report,
  identity,
  scriptUrl
}) => {
  if (!isOpen || !report) return null;

  const [activeTab, setActiveTab] = useState<'rekap' | 'subtopik' | 'riwayat' | 'review'>('rekap');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const isPassed = report.latestScore >= identity.passingScore;
  const latestAttempt = report.attempts && report.attempts.length > 0 ? report.attempts[0] : null;

  // Print function
  const handlePrint = () => {
    audioManager.playClick();
    window.print();
  };

  // Export CSV
  const handleExportCsv = () => {
    audioManager.playClick();
    let csv = "data:text/csv;charset=utf-8,";
    csv += "LAPORAN HASIL DAN PROGRES PENGERJAAN SISWA (MPI MATEMATIKA KELAS 6)\n";
    csv += `Nama Lembaga,${identity.school}\n`;
    csv += `Mata Pelajaran,${identity.subject}\n`;
    csv += `Topik Materi,${identity.topic}\n`;
    csv += `Guru Pengampu,${identity.teacherName}\n`;
    csv += `Standar KKTP,${identity.passingScore}\n\n`;

    csv += "DATA IDENTITAS SISWA\n";
    csv += `Nama Siswa,${report.studentName}\n`;
    csv += `Kelas,${report.studentClass}\n`;
    csv += `Nomor Absen,${report.studentNumber}\n`;
    csv += `ID Sesi,${report.sessionId}\n`;
    csv += `Terakhir Diperbarui,${report.lastUpdated}\n\n`;

    csv += "6 INDIKATOR UTAMA EVALUASI\n";
    csv += `1. Nama Siswa,${report.studentName}\n`;
    csv += `2. Jumlah Soal yang Dikerjakan,${report.totalQuestionsAttempted}\n`;
    csv += `3. Jumlah Jawaban Benar,${report.totalCorrect}\n`;
    csv += `4. Jumlah Jawaban Salah,${report.totalWrong}\n`;
    csv += `5. Nilai Skor Terakhir,${report.latestScore}\n`;
    csv += `6. Rata-rata Nilai,${report.averageScore}\n`;
    csv += `Rata-rata Akurasi (%),${report.averageAccuracy}%\n`;
    csv += `Nilai Tertinggi,${report.highestScore}\n`;
    csv += `Status KKTP,${isPassed ? 'TUNTAS' : 'PERLU BIMBINGAN'}\n\n`;

    csv += "ANALISIS PENGUASAAN PER SUBTOPIK\n";
    csv += "Subtopik,Jumlah Soal,Benar,Salah,Akurasi (%),Predikat,Rekomendasi\n";
    if (report.subtopicStats && report.subtopicStats.length > 0) {
      report.subtopicStats.forEach(st => {
        csv += `"${st.subtopic}","${st.totalQuestions}","${st.correctAnswers}","${st.wrongAnswers}","${st.accuracy}%","${st.masteryStatus}","${st.recommendation}"\n`;
      });
    }
    csv += "\n";

    csv += "RIWAYAT PENGERJAAN DRILL\n";
    csv += "No,Waktu,Paket Latihan,Jumlah Soal,Benar,Salah,Nilai,Status\n";
    report.attempts.forEach((att, idx) => {
      csv += `"${idx + 1}","${att.timestamp}","${att.drillTitle}","${att.totalQuestions}","${att.correctAnswers}","${att.wrongAnswers}","${att.score}","${att.status}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Progres_${report.studentName.replace(/\s+/g, '_')}_Kelas6.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy WhatsApp Formatted Text
  const handleCopyWhatsApp = () => {
    audioManager.playClick();
    const text = `📊 *LAPORAN HASIL & PROGRES BELAJAR SISWA*
*Media Pembelajaran Interaktif (MPI) Digital*
Mata Pelajaran: *${identity.subject}*
Materi: *${identity.topic}* (${identity.grade})
Sekolah: *${identity.school}*
----------------------------------------
👤 *Nama Siswa:* ${report.studentName}
🏫 *Kelas / Absen:* ${report.studentClass} / ${report.studentNumber || '-'}
🆔 *ID Sesi:* ${report.sessionId}
🕒 *Waktu:* ${report.lastUpdated}

📋 *REKAPITULASI 6 INDIKATOR UTAMA:*
1. *Nama Siswa:* ${report.studentName}
2. *Jumlah Soal Dikerjakan:* ${report.totalQuestionsAttempted} Butir
3. *Jumlah Jawaban Benar:* ${report.totalCorrect} Poin
4. *Jumlah Jawaban Salah:* ${report.totalWrong} Butir
5. *Nilai Skor Terakhir:* ${report.latestScore} (KKTP: ${identity.passingScore})
6. *Rata-rata Nilai:* ${report.averageScore} (Akurasi: ${report.averageAccuracy}%)

🏆 *Status Ketercapaian:* ${isPassed ? '✓ TUNTAS' : '• PERLU BIMBINGAN REMEDIAL'}
📈 *Nilai Tertinggi:* ${report.highestScore}
🎯 *Total Sesi Drill:* ${report.attempts.length} Sesi Latihan
----------------------------------------
_Laporan resmi dihasilkan otomatis oleh sistem MPI Interaktif Matematika Kelas 6_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    }).catch(() => {
      // Fallback
      alert('Gagal menyalin teks ke clipboard.');
    });
  };

  // Sync to Google Spreadsheet
  const handleSyncToSpreadsheet = async () => {
    if (!scriptUrl || isSyncing) return;
    audioManager.playClick();
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const response = await sendToGoogleAppsScript(scriptUrl, 'SAVE_QUIZ', {
        sessionId: report.sessionId,
        timestamp: new Date().toISOString(),
        studentName: report.studentName,
        studentClass: report.studentClass,
        topic: `${identity.topic} (Akumulasi Progres Drill)`,
        totalQuestions: report.totalQuestionsAttempted,
        correctAnswers: report.totalCorrect,
        wrongAnswers: report.totalWrong,
        score: report.latestScore,
        status: isPassed ? 'TUNTAS' : 'PERLU BIMBINGAN'
      });

      if (response.success) {
        audioManager.playCorrect();
        setSyncFeedback({
          type: 'success',
          message: 'Laporan progres berhasil disinkronkan ke Google Spreadsheet Guru!'
        });
      } else {
        setSyncFeedback({
          type: 'warning',
          message: response.message || 'Gagal menyinkronkan data.'
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: 'Gagal sinkronisasi: ' + (err.message || 'Kesalahan jaringan.')
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered review questions from latest attempt
  const filteredReviewItems = latestAttempt?.answersDetail ? latestAttempt.answersDetail.filter(item => {
    if (reviewFilter === 'wrong') return !item.isCorrect;
    if (reviewFilter === 'correct') return item.isCorrect;
    return true;
  }) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-5xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Header Bar (Interactive, Hidden on Print) */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <BarChart3 className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg">
                  Laporan Progres Pengerjaan Siswa
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/40 text-[10px] font-extrabold uppercase tracking-wider text-sky-100 border border-sky-400/30">
                  MPI Kelas 6
                </span>
              </div>
              <p className="text-xs text-sky-100/90 font-medium">
                Rekapitulasi 6 indikator utama, analisis diagnostik 5 subtopik, dan riwayat latihan
              </p>
            </div>
          </div>

          {/* Action Tools Header */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* WhatsApp Share / Copy */}
            <button
              onClick={handleCopyWhatsApp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copiedToClipboard 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Salin Rangkuman Teks untuk WhatsApp"
            >
              {copiedToClipboard ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {copiedToClipboard ? 'Tersalin!' : 'Salin Teks WA'}
              </span>
            </button>

            {/* Sync to GAS / Spreadsheet */}
            {scriptUrl && (
              <button
                disabled={isSyncing}
                onClick={handleSyncToSpreadsheet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Kirim Progres ke Spreadsheet Guru"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {isSyncing ? 'Sinkron...' : 'Sinkron Sheet'}
                </span>
              </button>
            )}

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
              title="Cetak Lembar Laporan / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              title="Unduh File CSV/Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh CSV</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                audioManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncFeedback && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span>{syncFeedback.message}</span>
            <button 
              onClick={() => setSyncFeedback(null)} 
              className="text-xs font-bold underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Switcher (Interactive, Hidden on Print) */}
        <div className="px-5 pt-3 pb-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto print:hidden">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'rekap', label: 'Ringkasan & 6 Indikator', icon: BarChart3 },
              { id: 'subtopik', label: 'Diagnostik 5 Subtopik', icon: Layers },
              { id: 'riwayat', label: `Riwayat Drill (${report.attempts.length})`, icon: Clock },
              { id: 'review', label: 'Review Pembahasan Terakhir', icon: HelpCircle }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    audioManager.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-semibold text-slate-500 hidden lg:inline">
            Update: {report.lastUpdated}
          </span>
        </div>

        {/* Main Content Area / Printable Official Sheet */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800 print:p-4 print:overflow-visible">
          
          {/* Printable Official School Header (Clean on Print) */}
          <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
            <span className="text-xs font-extrabold tracking-widest uppercase text-slate-500">
              {identity.school}
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              LEMBAR LAPORAN HASIL & PROGRES BELAJAR SISWA
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Mata Pelajaran: <strong>{identity.subject}</strong> • Materi: <strong>{identity.topic}</strong> ({identity.grade})
            </p>
          </div>

          {/* Student Identity Information Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">Nama Siswa:</span>
              <span className="font-heading font-extrabold text-slate-800 text-sm">{report.studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">Kelas & No. Absen:</span>
              <span className="font-bold text-slate-800 text-sm">{report.studentClass} (Absen: {report.studentNumber || '-'})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">Nomor ID Sesi:</span>
              <span className="font-mono font-bold text-blue-700 text-xs">{report.sessionId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">Standar Kelulusan (KKTP):</span>
              <span className="font-bold text-emerald-700 text-xs">{identity.passingScore} (Kriteria Capaian Minimum)</span>
            </div>
          </div>

          {/* 6 MANDATORY SUMMARY METRICS (CARDS) - Always shown & visible on print */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                6 Indikator Rekapitulasi Progres Siswa
              </h3>
              <span className="text-[11px] text-slate-400">
                Status Capaian: <strong className={isPassed ? 'text-emerald-700' : 'text-amber-700'}>{isPassed ? 'TUNTAS' : 'PERLU BIMBINGAN'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Nama Siswa */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  1. Nama Siswa
                </span>
                <div className="my-1.5 font-heading font-black text-xs sm:text-sm text-slate-800 line-clamp-1" title={report.studentName}>
                  {report.studentName}
                </div>
                <span className="text-[10px] text-blue-600 font-bold block">{report.studentClass}</span>
              </div>

              {/* 2. Jumlah Soal yang Dikerjakan */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs text-center flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                  2. Soal Dikerjakan
                </span>
                <div className="my-1 font-heading font-black text-2xl sm:text-3xl text-blue-900">
                  {report.totalQuestionsAttempted}
                </div>
                <span className="text-[10px] text-blue-600 font-semibold block">Total Butir</span>
              </div>

              {/* 3. Jumlah Jawaban Benar */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs text-center flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  3. Jawaban Benar
                </span>
                <div className="my-1 font-heading font-black text-2xl sm:text-3xl text-emerald-800">
                  {report.totalCorrect}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block">Poin (+1)</span>
              </div>

              {/* 4. Jumlah Jawaban Salah */}
              <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 shadow-2xs text-center flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 block">
                  4. Jawaban Salah
                </span>
                <div className="my-1 font-heading font-black text-2xl sm:text-3xl text-red-800">
                  {report.totalWrong}
                </div>
                <span className="text-[10px] text-red-600 font-semibold block">Perlu Belajar</span>
              </div>

              {/* 5. Nilai (Skor Terakhir) */}
              <div className={`p-3.5 rounded-2xl border shadow-2xs text-center flex flex-col justify-between ${
                isPassed ? 'bg-emerald-100/70 border-emerald-300' : 'bg-amber-100/70 border-amber-300'
              }`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                  isPassed ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  5. Nilai Skor
                </span>
                <div className={`my-1 font-heading font-black text-2xl sm:text-3xl ${
                  isPassed ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  {report.latestScore}
                </div>
                <span className={`text-[10px] font-extrabold block ${
                  isPassed ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {isPassed ? '✓ TUNTAS' : '• REMEDIAL'}
                </span>
              </div>

              {/* 6. Rata-rata */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-2xs text-center flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                  6. Rata-rata Nilai
                </span>
                <div className="my-1 font-heading font-black text-2xl sm:text-3xl text-indigo-900">
                  {report.averageScore}
                </div>
                <span className="text-[10px] text-indigo-600 font-bold block">
                  Akurasi {report.averageAccuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: REKAPITULASI & VISUAL PROGRESS BAR (Shown if activeTab === 'rekap' or in print) */}
          <div className={`space-y-6 ${activeTab !== 'rekap' ? 'hidden print:block' : ''}`}>
            {/* Visual Progress Bar: Akurasi Penguasaan */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Akurasi Penguasaan Materi Keseluruhan ({report.totalCorrect} benar dari {report.totalQuestionsAttempted} soal)
                </span>
                <span className="text-blue-700 font-mono text-sm font-black">{report.averageAccuracy}%</span>
              </div>

              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${report.averageAccuracy}%` }} 
                  title={`Benar: ${report.totalCorrect} (${report.averageAccuracy}%)`}
                />
                <div 
                  className="h-full bg-red-400 transition-all duration-500" 
                  style={{ width: `${100 - report.averageAccuracy}%` }} 
                  title={`Salah: ${report.totalWrong}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
                <span className="text-emerald-700">✓ Akurasi Jawaban Benar: {report.averageAccuracy}%</span>
                <span className="text-red-600">✗ Tingkat Kesalahan: {report.totalQuestionsAttempted > 0 ? (100 - report.averageAccuracy).toFixed(1) : 0}%</span>
                <span className="text-slate-600">KKTP Target: {identity.passingScore}</span>
              </div>
            </div>

            {/* Quick Diagnostic Preview Banner */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-heading font-extrabold text-sky-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Rekomendasi Evaluasi Belajar Siswa
                </h4>
                <p className="text-sky-800/80">
                  {isPassed
                    ? `Siswa menunjukkan penguasaan materi yang matang dengan nilai rata-rata ${report.averageScore}. Siap untuk latihan drill tingkat lanjut.`
                    : `Siswa disarankan untuk mengulangi modul materi interaktif dan mencoba latihan dengan paket 10/25 soal terfokus.`}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('subtopik')}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shrink-0 cursor-pointer print:hidden"
              >
                Lihat Diagnostik Subtopik →
              </button>
            </div>
          </div>

          {/* TAB 2: DIAGNOSTIK 5 SUBTOPIK (Shown if activeTab === 'subtopik' or in print) */}
          <div className={`space-y-4 ${activeTab !== 'subtopik' ? 'hidden print:block' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-heading font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Analisis Diagnostik Penguasaan 5 Subtopik (Pecahan & Desimal Kelas 6)</span>
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">Bank 150 Soal Terstandar</span>
            </div>

            {report.subtopicStats && report.subtopicStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.subtopicStats.map((st, idx) => {
                  let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  let barBg = 'bg-slate-400';
                  if (st.totalQuestions > 0) {
                    if (st.accuracy >= 80) {
                      badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      barBg = 'bg-emerald-500';
                    } else if (st.accuracy >= 65) {
                      badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                      barBg = 'bg-amber-500';
                    } else {
                      badgeBg = 'bg-red-100 text-red-800 border-red-300';
                      barBg = 'bg-red-500';
                    }
                  }

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            Submateri #{idx + 1}
                          </span>
                          <h4 className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
                            {st.subtopic}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                          {st.masteryStatus}
                        </span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                          <span>Ketercapaian: {st.correctAnswers}/{st.totalQuestions} Soal Benar</span>
                          <span className="font-mono font-bold text-slate-800">{st.accuracy}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barBg} transition-all duration-300`} 
                            style={{ width: `${st.accuracy}%` }} 
                          />
                        </div>
                      </div>

                      {/* Recommendation note */}
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                        💡 <strong className="text-slate-700">Rekomendasi:</strong> {st.recommendation}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
                Data diagnostik akan terbentuk secara otomatis setelah siswa mengerjakan drill latihan.
              </div>
            )}
          </div>

          {/* TAB 3: RIWAYAT SESI LATIHAN (Shown if activeTab === 'riwayat' or in print) */}
          <div className={`space-y-3 ${activeTab !== 'riwayat' ? 'hidden print:block' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-heading font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Rincian Riwayat Pengerjaan Drill ({report.attempts.length} Sesi Latihan)</span>
              </h3>
              <span className="text-xs text-slate-500">
                Pengerjaan terbaru berada di baris atas
              </span>
            </div>

            {report.attempts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs space-y-2">
                <Clock className="w-6 h-6 mx-auto text-slate-300" />
                <p>Siswa belum menyelesaikan sesi latihan. Mulai kerjakan latihan di menu "Latihan"!</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-10">No</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Paket Latihan</th>
                      <th className="p-3 text-center">Durasi</th>
                      <th className="p-3 text-center">Soal</th>
                      <th className="p-3 text-center">Benar</th>
                      <th className="p-3 text-center">Salah</th>
                      <th className="p-3 text-center">Nilai</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.attempts.map((att, idx) => (
                      <tr key={att.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono text-[11px] whitespace-nowrap text-slate-500">
                          {att.timestamp}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {att.drillTitle}
                        </td>
                        <td className="p-3 text-center font-mono text-[11px] text-slate-600">
                          {att.durationSeconds 
                            ? `${Math.floor(att.durationSeconds / 60)}m ${att.durationSeconds % 60}s` 
                            : '-'}
                        </td>
                        <td className="p-3 text-center font-bold text-blue-700">
                          {att.totalQuestions}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-600">
                          {att.correctAnswers}
                        </td>
                        <td className="p-3 text-center font-bold text-red-500">
                          {att.wrongAnswers}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-heading font-black text-sm px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                            {att.score}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            att.status === 'TUNTAS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer with Averages */}
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">TOTAL & RATA-RATA:</td>
                      <td className="p-3 text-center text-blue-900">{report.totalQuestionsAttempted} Soal</td>
                      <td className="p-3 text-center text-emerald-800">{report.totalCorrect} Benar</td>
                      <td className="p-3 text-center text-red-700">{report.totalWrong} Salah</td>
                      <td className="p-3 text-center font-black text-indigo-900">{report.averageScore}</td>
                      <td className="p-3 text-center text-[10px] text-emerald-700">Rata-rata: {report.averageAccuracy}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* TAB 4: REVIEW PEMBAHASAN SOAL TERAKHIR (Interactive, Hidden on Print) */}
          <div className={`space-y-4 print:hidden ${activeTab !== 'review' ? 'hidden' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-heading font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Review Butir Soal & Pembahasan (Sesi Terakhir)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {latestAttempt ? latestAttempt.drillTitle : 'Belum ada sesi latihan'}
                </p>
              </div>

              {/* Filter: All / Wrong / Correct */}
              {latestAttempt?.answersDetail && latestAttempt.answersDetail.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      reviewFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Semua ({latestAttempt.answersDetail.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('wrong')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      reviewFilter === 'wrong' ? 'bg-red-500 text-white shadow-xs' : 'text-red-600'
                    }`}
                  >
                    Salah ({latestAttempt.answersDetail.filter(a => !a.isCorrect).length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('correct')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      reviewFilter === 'correct' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-700'
                    }`}
                  >
                    Benar ({latestAttempt.answersDetail.filter(a => a.isCorrect).length})
                  </button>
                </div>
              )}
            </div>

            {filteredReviewItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs space-y-2">
                <p>Tidak ada butir soal yang sesuai dengan filter atau belum ada sesi latihan yang diselesaikan.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {filteredReviewItems.map((item, idx) => (
                  <div 
                    key={item.questionId || idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      item.isCorrect 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-white text-[11px] ${
                          item.isCorrect ? 'bg-emerald-600' : 'bg-red-500'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.subtopic}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        item.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                      }`}>
                        {item.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.isCorrect ? 'Jawaban Benar' : 'Jawaban Keliru'}
                      </span>
                    </div>

                    <p className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
                      {item.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className={`p-2 rounded-xl border ${
                        item.isCorrect ? 'bg-white border-emerald-300 text-emerald-900' : 'bg-white border-red-300 text-red-900'
                      }`}>
                        <span className="text-slate-400 block text-[10px] font-semibold">Jawaban Siswa:</span>
                        <span className="font-bold">{item.studentAnswerText}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-800">
                        <span className="text-slate-400 block text-[10px] font-semibold">Kunci Jawaban Benar:</span>
                        <span className="font-bold text-emerald-700">{item.correctAnswerText}</span>
                      </div>
                    </div>

                    {/* Step-by-Step Mathematical Explanation */}
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-slate-700 space-y-1">
                      <span className="font-bold text-blue-900 flex items-center gap-1 text-[11px]">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        Pembahasan Ilmiah Matematika:
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Signature / Verification Block (For Official Printing & Portofolio) */}
          <div className="pt-8 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-slate-400 font-medium block">Pernyataan Status Ketercapaian:</span>
              <p className="font-semibold text-slate-800">
                {isPassed
                  ? 'Siswa dinyatakan TELAH MENCAPAI Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).'
                  : 'Siswa disarankan untuk mengikuti bimbingan remedial dan memperbanyak drill latihan mandiri.'}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Sistem Evaluasi Digital Media Pembelajaran Interaktif (MPI)
              </span>
            </div>

            <div className="text-center space-y-1 min-w-[220px]">
              <span className="text-slate-400 font-medium block">Mengetahui, Guru Pengampu</span>
              <div className="h-12" />
              <p className="font-bold text-slate-900 underline underline-offset-4">{identity.teacherName}</p>
              <span className="text-[11px] text-slate-500 block">{identity.school}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            Laporan ini berfungsi penuh sebagai portofolio penilaian kurikulum merdeka matematika SD/MI.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-heading font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={() => {
                audioManager.playClick();
                onClose();
              }}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-heading font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              Tutup Laporan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
