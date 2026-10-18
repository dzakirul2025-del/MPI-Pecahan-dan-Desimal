import React from 'react';
import { StudentSession, MediaIdentity } from '../types';
import { audioManager } from '../utils/audio';
import { 
  Award, 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  HeartHandshake,
  Calendar,
  UserCheck
} from 'lucide-react';

interface SelesaiViewProps {
  session: StudentSession;
  identity: MediaIdentity;
  lastQuizScore: number | null;
  onReviewMateri: () => void;
  onRetryQuiz: () => void;
}

export const SelesaiView: React.FC<SelesaiViewProps> = ({
  session,
  identity,
  lastQuizScore,
  onReviewMateri,
  onRetryQuiz
}) => {
  const isPassed = (lastQuizScore ?? 0) >= identity.passingScore;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    audioManager.playClick();
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Misi Belajar Selesai dengan Sukses!</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800">
          Selamat, Kamu Telah Menyelesaikan MPI!
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Terima kasih telah aktif membaca materi, mencoba simulasi interaktif, mengerjakan kuis, dan menuliskan refleksi.
        </p>
      </div>

      {/* PRINTABLE CERTIFICATE / SUMMARY CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-sky-300 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Certificate Watermark Background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-100 rounded-full blur-2xl opacity-50 pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b-2 border-dashed border-sky-200 pb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
            {identity.school}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-800">
            PIAGAM PRESTASI BELAJAR DIGITAL
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Nomor Sesi Belajar: <span className="font-mono text-slate-700 font-bold">{session.sessionId}</span>
          </p>
        </div>

        {/* Certificate Body */}
        <div className="py-8 space-y-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600">
            Diberikan dengan bangga dan apresiasi setinggi-tingginya kepada:
          </p>

          <div className="inline-block px-6 py-2 border-b-2 border-sky-500">
            <span className="font-heading text-2xl sm:text-3xl font-black text-blue-900 tracking-wide">
              {session.studentName}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
            Siswa kelas <span className="font-bold text-slate-800">{session.studentClass}</span> (No. Absen: {session.studentNumber || '-'}), atas keberhasilannya mempelajari topik:
          </p>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 max-w-md mx-auto">
            <span className="font-bold text-sky-950 text-sm sm:text-base block">
              {identity.topic}
            </span>
            <span className="text-xs text-sky-700 font-semibold mt-0.5 block">
              {identity.subject} • {identity.grade}
            </span>
          </div>

          {/* Score Badge */}
          {lastQuizScore !== null && (
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-bold block uppercase">Perolehan Nilai</span>
                <span className="text-4xl font-heading font-black text-emerald-600">
                  {lastQuizScore}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block">KKTP: {identity.passingScore}</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-xs text-slate-400 font-bold block uppercase">Status Akhir</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold mt-1 ${
                  isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isPassed ? '✓ TUNTAS' : '• PERLU BIMBINGAN'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Signatures */}
        <div className="pt-6 border-t-2 border-dashed border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-slate-400 font-medium">Tanggal Selesai:</span>
            <p className="font-semibold text-slate-700">{currentDate}</p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tersinkron ke Spreadsheet Guru
            </span>
          </div>

          <div className="text-center space-y-1">
            <span className="text-slate-400 font-medium">Guru Pengampu:</span>
            <div className="h-8" /> {/* Space for signature */}
            <p className="font-bold text-slate-800 underline underline-offset-4">{identity.teacherName}</p>
            <span className="text-[10px] text-slate-400">{identity.school}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan Bukti Belajar</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            onReviewMateri();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Baca Ulang Materi</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            onRetryQuiz();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Coba Kuis Lagi</span>
        </button>
      </div>
    </div>
  );
};
