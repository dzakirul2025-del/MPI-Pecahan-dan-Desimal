import React, { useState, useEffect, useMemo } from 'react';
import { QuizQuestion, StudentSession, MediaIdentity, QuizSubmission } from '../types';
import { audioManager } from '../utils/audio';
import { sendToGoogleAppsScript } from '../services/apiService';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  ArrowLeft,
  Award, 
  Sparkles, 
  AlertTriangle,
  Clock,
  Layers,
  Check,
  Filter,
  Grid,
  List,
  Flame,
  Bookmark
} from 'lucide-react';

interface LatihanViewProps {
  questions: QuizQuestion[];
  identity: MediaIdentity;
  session: StudentSession;
  scriptUrl: string;
  onFinishQuiz: (score: number) => void;
}

type DrillMode = 10 | 25 | 50 | 150;
type SubtopicFilter = 'ALL' | 'Konversi Pecahan ke Desimal' | 'Konversi Desimal ke Pecahan' | 'Membandingkan & Mengurutkan' | 'Operasi Penjumlahan & Pengurangan' | 'Operasi Hitung Campuran & Masalah Kontekstual';

export const LatihanView: React.FC<LatihanViewProps> = ({
  questions: allQuestions,
  identity,
  session,
  scriptUrl,
  onFinishQuiz
}) => {
  // Drill selection config
  const [selectedCount, setSelectedCount] = useState<DrillMode>(25);
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicFilter>('ALL');

  // Filtered active question set
  const activeQuestions = useMemo(() => {
    let pool = [...allQuestions];
    if (selectedSubtopic !== 'ALL') {
      pool = pool.filter((q: any) => q.subtopic === selectedSubtopic);
    }
    // Limit to selected count
    return pool.slice(0, selectedCount);
  }, [allQuestions, selectedCount, selectedSubtopic]);

  // Current active question index in single-view mode
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Answers & Evaluation
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let timer: number;
    if (isTimerRunning && !isEvaluated) {
      timer = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, isEvaluated]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = activeQuestions.length;
  const isAllAnswered = answeredCount === totalCount;
  const currentQuestion = activeQuestions[currentIdx] || activeQuestions[0];

  // Select an option
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isEvaluated) return;
    audioManager.playClick();
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  // Evaluate Quiz
  const handleEvaluate = () => {
    if (!isAllAnswered) {
      audioManager.playWrong();
      return;
    }

    setIsEvaluated(true);
    setIsTimerRunning(false);

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / totalCount) * 100);

    if (calculatedScore >= identity.passingScore) {
      audioManager.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      audioManager.playWrong();
    }
  };

  // Calculate results
  let correctAnswers = 0;
  let wrongAnswers = 0;
  if (isEvaluated) {
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });
  }
  const score = totalCount > 0 ? Math.round((correctAnswers / totalCount) * 100) : 0;
  const isPassed = score >= identity.passingScore;

  // Reset Quiz
  const handleResetQuiz = () => {
    audioManager.playClick();
    setSelectedAnswers({});
    setIsEvaluated(false);
    setHasSubmitted(false);
    setSubmitFeedback(null);
    setCurrentIdx(0);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  // Submit to Google Spreadsheet
  const handleSubmitToSheet = async () => {
    if (!isEvaluated || isSubmitting || hasSubmitted) return;

    audioManager.playClick();
    setIsSubmitting(true);
    setSubmitFeedback(null);

    const submissionData: QuizSubmission = {
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      studentName: session.studentName,
      studentClass: session.studentClass,
      topic: `${identity.topic} (Drill ${totalCount} Soal)`,
      totalQuestions: totalCount,
      correctAnswers,
      wrongAnswers,
      score,
      status: isPassed ? 'TUNTAS' : 'PERLU BIMBINGAN',
      answers: activeQuestions.map(q => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id],
        isCorrect: selectedAnswers[q.id] === q.correctAnswerIndex
      }))
    };

    try {
      const response = await sendToGoogleAppsScript(scriptUrl, 'SAVE_QUIZ', submissionData);
      if (response.success) {
        audioManager.playCorrect();
        setHasSubmitted(true);
        setSubmitFeedback({
          type: 'success',
          message: response.message || 'Hasil drill latihan berhasil dicatat ke Google Spreadsheet!'
        });
      } else {
        setSubmitFeedback({
          type: 'warning',
          message: response.message
        });
      }
    } catch (err: any) {
      setSubmitFeedback({
        type: 'error',
        message: 'Gagal mengirim nilai: ' + (err.message || 'Kesalahan jaringan.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Top Header & Student Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Drill Master • 150 Bank Soal Valid
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Kelas 6 • Pecahan & Desimal
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-800 mt-1">
            Tantangan Latihan & Uji Keterampilan Matematika
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Siswa: <span className="font-bold text-slate-700">{session.studentName}</span> ({session.studentClass}) • Standar Kelulusan KKTP: <strong className="text-blue-600">{identity.passingScore}</strong>
          </p>
        </div>

        {/* Live Status Indicators: Timer & Counter */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{answeredCount}/{totalCount} Terjawab</span>
          </div>

          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            title="Buka Nomor Soal"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Palet Nomor</span>
          </button>
        </div>
      </div>

      {/* FILTER & DRILL MODE SELECTOR (Only accessible before evaluation) */}
      {!isEvaluated && (
        <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Pilih Paket Soal:
            </span>
            {[
              { count: 10, label: '10 Soal (Kilat)' },
              { count: 25, label: '25 Soal (Standar)' },
              { count: 50, label: '50 Soal (Try Out)' },
              { count: 150, label: '150 Soal (Maraton Penuh)' }
            ].map(m => (
              <button
                key={m.count}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedCount(m.count as DrillMode);
                  setSelectedAnswers({});
                  setCurrentIdx(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedCount === m.count
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* View Toggle: Single Focus vs All */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <button
              onClick={() => {
                audioManager.playClick();
                setViewMode('single');
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'single'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              title="Tampilan Fokus 1 Soal"
            >
              Mode Fokus
            </button>
            <button
              onClick={() => {
                audioManager.playClick();
                setViewMode('all');
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'all'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              title="Tampilkan Semua Soal (Lembar Kerja)"
            >
              Mode Lembar
            </button>
          </div>
        </div>
      )}

      {/* QUESTION PALETTE / NAVIGATOR DRAWER */}
      {isPaletteOpen && (
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-amber-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-heading font-bold text-slate-800 text-sm flex items-center gap-2">
              <Grid className="w-4 h-4 text-amber-500" />
              <span>Palet Nomor Soal (Klik nomor untuk langsung melompat)</span>
            </h3>
            <button
              onClick={() => setIsPaletteOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Tutup ✕
            </button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-1.5 max-h-56 overflow-y-auto p-1">
            {activeQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              const isCorrect = isEvaluated && selectedAnswers[q.id] === q.correctAnswerIndex;
              const isWrong = isEvaluated && selectedAnswers[q.id] !== undefined && !isCorrect;

              let btnColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
              if (isEvaluated) {
                if (isCorrect) btnColor = 'bg-emerald-500 text-white font-bold border-emerald-600';
                else if (isWrong) btnColor = 'bg-red-500 text-white font-bold border-red-600';
                else btnColor = 'bg-slate-200 text-slate-400';
              } else if (isAnswered) {
                btnColor = 'bg-blue-600 text-white font-bold border-blue-700';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    audioManager.playClick();
                    setCurrentIdx(idx);
                    if (viewMode === 'all') {
                      document.getElementById(`soal-card-${q.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`h-9 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${btnColor} ${
                    isCurrent ? 'ring-2 ring-amber-400 ring-offset-1 scale-105 shadow-xs' : ''
                  }`}
                >
                  <span>{idx + 1}</span>
                  {selectedAnswers[q.id] !== undefined && !isEvaluated && (
                    <span className="text-[9px] opacity-80 leading-none">
                      {['A', 'B', 'C', 'D'][selectedAnswers[q.id]]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200" /> Belum Dijawab
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" /> Sudah Terjawab
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" /> Soal Aktif
            </span>
            {isEvaluated && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Jawaban Benar
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" /> Jawaban Salah
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* SCORE SUMMARY CARD (Shown after evaluation) */}
      {isEvaluated && (
        <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border animate-fadeIn ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400'
            : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                {isPassed ? '🎉 Hebat! Capaian Pembelajaran Tuntas' : '💪 Perlu Latihan Lebih Lanjut'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">
                {isPassed ? 'Luar Biasa, Kemampuan Matematikamu Sangat Matang!' : 'Jangan Menyerah, Mari Pelajari Pembahasannya!'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-lg">
                Kamu telah menyelesaikan drill <strong>{totalCount} soal</strong> dalam waktu <strong>{formatTime(elapsedSeconds)}</strong>.
                {isPassed ? ` Nilaimu ${score} melampaui KKTP (${identity.passingScore}).` : ` Nilaimu ${score} masih di bawah KKTP (${identity.passingScore}).`}
              </p>
            </div>

            {/* Score Badge */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/30 text-center min-w-[170px]">
              <span className="text-xs font-bold text-white/80 uppercase block">Skor Akhir</span>
              <span className="text-4xl sm:text-5xl font-heading font-black drop-shadow-md">
                {score}
              </span>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold mt-1 text-white/90">
                <span className="text-emerald-200">✓ {correctAnswers} Benar</span>
                <span>•</span>
                <span className="text-red-200">✗ {wrongAnswers} Salah</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Drill Latihan</span>
            </button>

            <button
              disabled={isSubmitting || hasSubmitted}
              onClick={handleSubmitToSheet}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-heading font-extrabold text-xs sm:text-sm shadow-md transition-all ${
                hasSubmitted
                  ? 'bg-white text-emerald-800 cursor-default ring-2 ring-emerald-300'
                  : isSubmitting
                  ? 'bg-white/50 text-white cursor-wait'
                  : 'bg-white text-slate-800 hover:bg-sky-50 hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              {hasSubmitted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nilai Tersimpan di Spreadsheet Guru!</span>
                </>
              ) : isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Hasil ke Spreadsheet Guru</span>
                </>
              )}
            </button>
          </div>

          {submitFeedback && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
              submitFeedback.type === 'success'
                ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-300'
                : 'bg-amber-900/60 text-amber-100 border border-amber-300'
            }`}>
              {submitFeedback.message}
            </div>
          )}
        </div>
      )}

      {/* QUESTIONS DISPLAY: SINGLE FOCUS MODE */}
      {viewMode === 'single' ? (
        <div className="space-y-4">
          {currentQuestion && (
            <div
              key={currentQuestion.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 shadow-md border transition-all ${
                isEvaluated
                  ? selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswerIndex
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-red-300 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-bold text-base flex items-center justify-center shrink-0">
                    {currentIdx + 1}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Soal Nomor {currentIdx + 1} dari {totalCount}
                    </span>
                    {(currentQuestion as any).subtopic && (
                      <span className="text-xs font-semibold text-blue-600">
                        {(currentQuestion as any).subtopic}
                      </span>
                    )}
                  </div>
                </div>

                {isEvaluated && (
                  <div className="shrink-0">
                    {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswerIndex ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Benar (+1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                        <XCircle className="w-4 h-4" /> Salah
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h3 className="font-heading font-extrabold text-slate-800 text-base sm:text-lg leading-relaxed mb-6">
                {currentQuestion.question}
              </h3>

              {/* 4 Options: A, B, C, D */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isThisSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  const isThisCorrect = optIdx === currentQuestion.correctAnswerIndex;

                  let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-200';

                  if (isEvaluated) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'bg-red-100 border-red-400 text-red-950 font-medium';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
                  }

                  const alphabet = ['A', 'B', 'C', 'D'][optIdx];

                  return (
                    <button
                      key={optIdx}
                      disabled={isEvaluated}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                        isThisSelected && !isEvaluated
                          ? 'bg-white text-blue-600'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {alphabet}
                      </span>
                      <span className="leading-relaxed flex-1 font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step-by-Step Mathematical Explanation */}
              {isEvaluated && (
                <div className="mt-5 pt-5 border-t border-slate-200">
                  <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-950 text-xs sm:text-sm leading-relaxed space-y-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-blue-900">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      Pembahasan Matematis Resmi:
                    </span>
                    <p className="font-medium text-slate-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single Mode Navigation Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              disabled={currentIdx === 0}
              onClick={() => {
                audioManager.playClick();
                setCurrentIdx(prev => Math.max(0, prev - 1));
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Soal Sebelumnya</span>
            </button>

            <span className="text-xs font-bold text-slate-500">
              {currentIdx + 1} / {totalCount}
            </span>

            <button
              disabled={currentIdx === totalCount - 1}
              onClick={() => {
                audioManager.playClick();
                setCurrentIdx(prev => Math.min(totalCount - 1, prev + 1));
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <span>Soal Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* QUESTIONS DISPLAY: ALL QUESTIONS MODE (LEMBER KERTAS) */
        <div className="space-y-6">
          {activeQuestions.map((q, qIndex) => {
            const selectedOption = selectedAnswers[q.id];
            const isCorrect = selectedOption === q.correctAnswerIndex;

            return (
              <div
                id={`soal-card-${q.id}`}
                key={q.id}
                className={`bg-white rounded-3xl p-6 shadow-xs border transition-all ${
                  isEvaluated
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-red-300 bg-red-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        {q.question}
                      </h3>
                      {(q as any).subtopic && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {(q as any).subtopic}
                        </span>
                      )}
                    </div>
                  </div>

                  {isEvaluated && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Benar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Salah
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2.5 pl-0 sm:pl-11">
                  {q.options.map((opt, optIdx) => {
                    const isThisSelected = selectedOption === optIdx;
                    const isThisCorrect = optIdx === q.correctAnswerIndex;

                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50';

                    if (isEvaluated) {
                      if (isThisCorrect) {
                        optionStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                      } else if (isThisSelected && !isThisCorrect) {
                        optionStyle = 'bg-red-100 border-red-400 text-red-950 font-medium';
                      } else {
                        optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    } else if (isThisSelected) {
                      optionStyle = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
                    }

                    const alphabet = ['A', 'B', 'C', 'D'][optIdx];

                    return (
                      <button
                        key={optIdx}
                        disabled={isEvaluated}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isThisSelected && !isEvaluated
                            ? 'bg-white text-blue-600'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {alphabet}
                        </span>
                        <span className="leading-relaxed flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isEvaluated && (
                  <div className="mt-4 pt-4 border-t border-slate-100 pl-0 sm:pl-11">
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs leading-relaxed space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-blue-900">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        Pembahasan Matematis:
                      </span>
                      <p className="font-medium text-slate-700">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOTTOM FINISH BAR */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isEvaluated ? (
          <>
            <div className="text-xs text-slate-500 text-center sm:text-left">
              {isAllAnswered ? (
                <span className="text-emerald-600 font-bold">
                  ✓ Semua {totalCount} soal telah kamu jawab! Siap untuk memeriksa nilai?
                </span>
              ) : (
                <span>
                  Kamu baru menjawab <strong>{answeredCount}</strong> dari <strong>{totalCount}</strong> soal. Selesaikan semua sebelum menekan tombol periksa.
                </span>
              )}
            </div>
            <button
              disabled={!isAllAnswered}
              onClick={handleEvaluate}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-heading font-extrabold text-sm sm:text-base transition-all ${
                isAllAnswered
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Periksa Jawaban Sekarang</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="text-xs text-slate-500">
              Drill evaluasi telah selesai. Mari lanjutkan ke lembar refleksi untuk mencatat progres belajarmu.
            </div>
            <button
              onClick={() => {
                audioManager.playCorrect();
                onFinishQuiz(score);
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-heading font-extrabold text-sm sm:text-base shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Lanjut ke Lembar Refleksi</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
