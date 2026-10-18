import React, { useState } from 'react';
import { StudentSession, ReflectionSubmission, MediaIdentity } from '../types';
import { audioManager } from '../utils/audio';
import { sendToGoogleAppsScript } from '../services/apiService';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Smile, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  Sparkles,
  Star
} from 'lucide-react';

interface RefleksiViewProps {
  session: StudentSession;
  identity: MediaIdentity;
  scriptUrl: string;
  onFinishReflection: () => void;
}

const UNDERSTANDING_OPTIONS = [
  { label: 'Sangat Paham', emoji: '🤩', desc: 'Saya menguasai konversi pecahan ke desimal dan operasi hitungnya' },
  { label: 'Paham', emoji: '😊', desc: 'Saya memahami sebagian besar materi pecahan dan desimal' },
  { label: 'Cukup Paham', emoji: '🤔', desc: 'Masih ada beberapa cara pembagian atau penyederhanaan yang membingungkan' },
  { label: 'Belum Paham', emoji: '😟', desc: 'Saya membutuhkan bimbingan guru dan latihan soal tambahan' }
];

const FAVORITE_OPTIONS = [
  'Eksplorasi Pizza Pecahan & Garis Bilangan',
  'Mini-Game Mencocokkan Pecahan & Desimal',
  'Tantangan Mengurutkan Bilangan dari Terkecil',
  'Pilah Pernyataan Operasi Hitung',
  'Kuis Latihan Evaluasi Mandiri'
];

export const RefleksiView: React.FC<RefleksiViewProps> = ({
  session,
  identity,
  scriptUrl,
  onFinishReflection
}) => {
  const [understandingLevel, setUnderstandingLevel] = useState('Sangat Paham');
  const [confidenceRating, setConfidenceRating] = useState(5);
  const [favoriteActivity, setFavoriteActivity] = useState('Mini-Game Mencocokkan Istilah');
  const [difficultPart, setDifficultPart] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || hasSubmitted) return;

    audioManager.playClick();
    setIsSubmitting(true);
    setSubmitResult(null);

    const payload: ReflectionSubmission = {
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      studentName: session.studentName,
      studentClass: session.studentClass,
      understandingLevel,
      confidenceRating,
      favoriteActivity,
      difficultPart: difficultPart.trim() || 'Tidak ada kesulitan berarti',
      additionalNotes: additionalNotes.trim() || '-'
    };

    try {
      const response = await sendToGoogleAppsScript(scriptUrl, 'SAVE_REFLECTION', payload);
      if (response.success) {
        audioManager.playVictory();
        setHasSubmitted(true);
        setSubmitResult({
          success: true,
          message: response.message || 'Refleksi belajarmu berhasil disimpan ke Google Spreadsheet Guru!'
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        setSubmitResult({
          success: false,
          message: response.message || 'Gagal menyimpan refleksi ke spreadsheet.'
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: 'Kendala jaringan: ' + (err.message || 'Gagal tersambung.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-teal-100">
            <Heart className="w-4 h-4 text-pink-300" />
            <span>Refleksi Diri Siswa</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold">
            Bagaimana Pengalaman Belajarmu Hari Ini?
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm max-w-2xl">
            Hai <span className="font-bold text-white">{session.studentName}</span>, ceritakan pengalaman dan perasaanmu secara jujur. Tidak ada jawaban salah dalam refleksi!
          </p>
        </div>
      </div>

      {/* Main Reflection Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-sky-100 space-y-8">
        {/* Question 1: Tingkat Pemahaman */}
        <div className="space-y-3">
          <label className="block font-heading font-bold text-slate-800 text-sm sm:text-base">
            1. Bagaimana tingkat pemahamanmu terhadap materi {identity.topic}?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNDERSTANDING_OPTIONS.map((opt) => {
              const isSelected = understandingLevel === opt.label;
              return (
                <button
                  type="button"
                  key={opt.label}
                  disabled={hasSubmitted}
                  onClick={() => {
                    audioManager.playClick();
                    setUnderstandingLevel(opt.label);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Bintang Keyakinan (1 - 5) */}
        <div className="space-y-3">
          <label className="block font-heading font-bold text-slate-800 text-sm sm:text-base">
            2. Seberapa percaya diri kamu dalam menerapkan materi ini?
          </label>
          <div className="flex items-center gap-2 sm:gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                type="button"
                key={starVal}
                disabled={hasSubmitted}
                onClick={() => {
                  audioManager.playClick();
                  setConfidenceRating(starVal);
                }}
                className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                  starVal <= confidenceRating
                    ? 'text-yellow-400 hover:scale-110'
                    : 'text-slate-300 hover:text-slate-400'
                }`}
                title={`Tingkat ${starVal} Bintang`}
              >
                <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${starVal <= confidenceRating ? 'fill-yellow-400' : ''}`} />
              </button>
            ))}
            <span className="ml-2 text-xs sm:text-sm font-bold text-slate-700">
              {confidenceRating} dari 5 Bintang
            </span>
          </div>
        </div>

        {/* Question 3: Aktivitas Favorit */}
        <div className="space-y-3">
          <label className="block font-heading font-bold text-slate-800 text-sm sm:text-base">
            3. Aktivitas atau bagian apa yang paling kamu sukai di media ini?
          </label>
          <div className="flex flex-wrap gap-2.5">
            {FAVORITE_OPTIONS.map((fav) => {
              const isSelected = favoriteActivity === fav;
              return (
                <button
                  type="button"
                  key={fav}
                  disabled={hasSubmitted}
                  onClick={() => {
                    audioManager.playClick();
                    setFavoriteActivity(fav);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {fav}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 4: Bagian Sulit */}
        <div className="space-y-2">
          <label className="block font-heading font-bold text-slate-800 text-sm sm:text-base">
            4. Apakah ada konsep atau istilah yang masih terasa sulit dipahami?
          </label>
          <input
            type="text"
            disabled={hasSubmitted}
            value={difficultPart}
            onChange={(e) => setDifficultPart(e.target.value)}
            placeholder="Contoh: Mengubah desimal ke pecahan paling sederhana, pembagian bersusun, atau tidak ada"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
        </div>

        {/* Question 5: Catatan / Saran untuk Guru */}
        <div className="space-y-2">
          <label className="block font-heading font-bold text-slate-800 text-sm sm:text-base">
            5. Pesan atau pertanyaan tambahan untuk {identity.teacherName}:
          </label>
          <textarea
            rows={3}
            disabled={hasSubmitted}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Tuliskan pesanmu di sini (opsional)..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
        </div>

        {/* Feedback Status Alert */}
        {submitResult && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm font-semibold ${
            submitResult.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-amber-50 text-amber-800 border border-amber-300'
          }`}>
            {submitResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="block font-bold">
                {submitResult.success ? 'Berhasil Terkirim!' : 'Pemberitahuan Status'}
              </span>
              <p className="mt-0.5">{submitResult.message}</p>
            </div>
          </div>
        )}

        {/* Submit Button & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {!hasSubmitted ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-heading font-extrabold text-sm sm:text-base shadow-lg shadow-teal-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SIMPAN REFLEKSI KE GURU</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Refleksi Berhasil Dicatat!</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              audioManager.playCorrect();
              onFinishReflection();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-heading font-extrabold text-sm sm:text-base shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Lihat Ringkasan & Sertifikat</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
