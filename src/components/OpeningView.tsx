import React, { useState } from 'react';
import { MediaIdentity, StudentSession } from '../types';
import { audioManager } from '../utils/audio';
import { FractionVisualizerSvg } from './illustrations/FractionVisualizerSvg';
import { 
  Play, 
  Sparkles, 
  GraduationCap, 
  School, 
  Award, 
  BookOpen, 
  Music, 
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';

interface OpeningViewProps {
  identity: MediaIdentity;
  session: StudentSession | null;
  onStartLearning: (studentName: string, studentClass: string, studentNumber: string) => void;
  bgmActive: boolean;
  onToggleBgm: () => void;
}

const CLASS_OPTIONS = [
  'Kelas 6A',
  'Kelas 6B',
  'Kelas 6C',
  'Kelas 6D',
  'Kelas 5',
  'Lainnya (Ketik Manual)'
];

export const OpeningView: React.FC<OpeningViewProps> = ({
  identity,
  session,
  onStartLearning,
  bgmActive,
  onToggleBgm
}) => {
  const [name, setName] = useState(session?.studentName || '');
  const [selectedClass, setSelectedClass] = useState(session?.studentClass || 'Kelas 5A');
  const [customClass, setCustomClass] = useState('');
  const [studentNumber, setStudentNumber] = useState(session?.studentNumber || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      audioManager.playWrong();
      setErrorMsg('Nama siswa wajib diisi terlebih dahulu untuk mencatat progres belajarmu!');
      return;
    }
    if (name.trim().length < 2) {
      audioManager.playWrong();
      setErrorMsg('Nama siswa minimal 2 karakter.');
      return;
    }

    const finalClass = selectedClass === 'Lainnya (Ketik Manual)' ? (customClass.trim() || 'Kelas 5') : selectedClass;

    setErrorMsg('');
    audioManager.playCorrect();
    onStartLearning(name.trim(), finalClass, studentNumber.trim() || '-');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 text-white p-6 sm:p-10 shadow-xl border border-sky-300">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-300/10 rounded-full blur-2xl translate-y-20 -translate-x-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-semibold tracking-wide text-sky-100">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>Media Pembelajaran Interaktif (MPI) Digital</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
              {identity.mediaTitle}
            </h1>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Selamat datang di petualangan seru mengenal rahasia siklus air bumi, eksplorasi animasi interaktif, mini-game asyik, dan uji kemampuanmu secara digital!
            </p>

            {/* School & Teacher Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2 text-xs font-medium text-sky-100">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
                {identity.subject} • {identity.grade}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full">
                <School className="w-3.5 h-3.5 text-sky-200" />
                {identity.school}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                Guru: {identity.teacherName}
              </span>
            </div>
          </div>

          {/* Quick Play Audio Callout */}
          <div className="flex flex-col items-center p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-xl shadow-md">
              🎵
            </div>
            <span className="text-xs font-semibold text-white">Suasana Belajar</span>
            <button
              onClick={() => {
                audioManager.playClick();
                onToggleBgm();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                bgmActive
                  ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-200'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{bgmActive ? 'Musik Aktif 🔊' : 'Putar Musik 🎶'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Illustration & Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Illustration Preview */}
        <div className="lg:col-span-7 space-y-4">
          <FractionVisualizerSvg />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-center">
              <span className="block text-xs font-bold text-orange-800">1/2 = 0,5</span>
              <span className="text-[11px] text-orange-600">50% Setengah</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="block text-xs font-bold text-blue-800">1/4 = 0,25</span>
              <span className="text-[11px] text-blue-600">25% Seperempat</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <span className="block text-xs font-bold text-indigo-800">3/4 = 0,75</span>
              <span className="text-[11px] text-indigo-600">75% Tiga Perempat</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="block text-xs font-bold text-emerald-800">2/5 = 0,4</span>
              <span className="text-[11px] text-emerald-600">40% Dua Perlima</span>
            </div>
          </div>
        </div>

        {/* Right: Student Identity Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Langkah Awal
              </span>
              <h2 className="font-heading text-2xl font-bold text-slate-800 mt-1">
                Data Diri Siswa
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Isi namamu agar nilai latihan dan catatan refleksimu tercatat di rekap guru.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium text-slate-800 bg-slate-50/50"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor Absen
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="Contoh: 14"
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              {selectedClass === 'Lainnya (Ketik Manual)' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ketik Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Misal: Kelas 5-D / Kelompok 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 text-slate-800"
                  />
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-heading font-extrabold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>MULAI BELAJAR SEKARANG</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Data sesi aman & otomatis tersinkron ke Spreadsheet Guru</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
