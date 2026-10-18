import React from 'react';
import { MediaIdentity } from '../types';
import { LEARNING_OBJECTIVES } from '../data/defaultConfig';
import { audioManager } from '../utils/audio';
import { 
  Target, 
  CheckCircle, 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  BookMarked, 
  Award, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface TujuanViewProps {
  identity: MediaIdentity;
  onBack: () => void;
  onNext: () => void;
}

export const TujuanView: React.FC<TujuanViewProps> = ({
  identity,
  onBack,
  onNext
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-sky-200">
            <Target className="w-4 h-4 text-yellow-300" />
            <span>Fase Belajar {identity.phase}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Tujuan & Panduan Belajar
          </h1>
          <p className="text-sky-100 text-sm sm:text-base max-w-3xl">
            Sebelum memulai petualangan materi, yuk pahami apa saja hal hebat yang akan kamu kuasai hari ini!
          </p>
        </div>
      </div>

      {/* Grid: Capaian, Tujuan & Indikator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Kompetensi & Tujuan Pembelajaran */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-sky-100 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-800">
                Tujuan Pembelajaran (TP)
              </h2>
              <span className="text-xs text-slate-500 font-medium">Target capaian materi kita</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-900 text-xs sm:text-sm font-medium leading-relaxed">
            <span className="font-bold block text-sky-950 mb-1">🌟 Kompetensi Utama:</span>
            {LEARNING_OBJECTIVES.competence}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Setelah belajar, kamu diharapkan:
            </span>
            {LEARNING_OBJECTIVES.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-sky-50/50 transition-colors border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Indikator & Petunjuk Penggunaan */}
        <div className="space-y-6">
          {/* Indikator Keberhasilan */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-sky-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-800">
                  Indikator Keberhasilan
                </h2>
                <span className="text-xs text-slate-500 font-medium">Bukti kamu telah menguasai materi</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {LEARNING_OBJECTIVES.indicators.map((ind, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <span>Nilai Kriteria Ketuntasan (KKTP):</span>
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-sm font-bold">
                  {identity.passingScore} Poin
                </span>
              </div>
            </div>
          </div>

          {/* Petunjuk Penggunaan */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <Compass className="w-5 h-5 text-blue-600" />
              <h3 className="font-heading font-bold text-base">
                Petunjuk Belajar Siswa
              </h3>
            </div>
            <ul className="space-y-2">
              {LEARNING_OBJECTIVES.userGuide.map((guide, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons: Kembali / Lanjutkan */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={() => {
            audioManager.playCorrect();
            onNext();
          }}
          className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-heading font-bold text-sm sm:text-base shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>Lanjutkan ke Materi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
