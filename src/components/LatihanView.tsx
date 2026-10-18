import React, { useState } from 'react';
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
  Award, 
  Sparkles, 
  AlertTriangle,
  Clock,
  Layers,
  Check
} from 'lucide-react';

interface LatihanViewProps {
  questions: QuizQuestion[];
  identity: MediaIdentity;
  session: StudentSession;
  scriptUrl: string;
  onFinishQuiz: (score: number) => void;
}

export const LatihanView: React.FC<LatihanViewProps> = ({
  questions,
  identity,
  session,
  scriptUrl,
  onFinishQuiz
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const isAllAnswered = answeredCount === totalCount;

  // Select an option
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isEvaluated) return; // Locked after evaluation
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

    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
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
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });
  }
  const score = totalCount > 0 ? Math.round((correctAnswers / totalCount) * 100) : 0;
  const isPassed = score >= identity.passingScore;

  // Reset / Repeat Quiz
  const handleResetQuiz = () => {
    audioManager.playClick();
    setSelectedAnswers({});
    setIsEvaluated(false);
    setHasSubmitted(false);
    setSubmitFeedback(null);
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
      topic: identity.topic,
      totalQuestions: totalCount,
      correctAnswers,
      wrongAnswers,
      score,
      status: isPassed ? 'TUNTAS' : 'PERLU BIMBINGAN',
      answers: questions.map(q => ({
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
          message: response.message || 'Hasil latihan berhasil dicatat ke Google Spreadsheet!'
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
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Quiz Header & Student Info */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Latihan Mandiri • {identity.subject}
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-slate-800">
            Kuis Evaluasi: {identity.topic}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Siswa: <span className="font-bold text-slate-700">{session.studentName}</span> ({session.studentClass}) • KKTP: {identity.passingScore}
          </p>
        </div>

        {/* Counter of answered questions */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 border border-sky-200">
          <Layers className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-sky-900">
            Terjawab: {answeredCount}/{totalCount} Soal
          </span>
        </div>
      </div>

      {/* RESULT SCORE SUMMARY CARD (Shown after evaluation) */}
      {isEvaluated && (
        <div className={`p-6 sm:p-8 rounded-3xl shadow-lg border animate-fadeIn ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400'
            : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                {isPassed ? '🎉 Hebat! Capaian Pembelajaran Tuntas' : '💪 Terus Semangat! Perlu Bimbingan'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">
                {isPassed ? 'Selamat, Kamu Berhasil Menguasai Materi!' : 'Yuk, Ulangi dan Pelajari Kembali!'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-lg">
                {isPassed
                  ? `Nilaimu melampaui kriteria ketuntasan (${identity.passingScore}). Pertahankan prestasi belajarmu!`
                  : `Nilaimu masih di bawah kriteria ketuntasan (${identity.passingScore}). Kamu bisa mengulang latihan ini kapan saja.`}
              </p>
            </div>

            {/* Score Badge */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/30 text-center min-w-[160px]">
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

          {/* Action Row: Re-test & Send */}
          <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Latihan</span>
            </button>

            <div className="flex items-center gap-3">
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
                    <span>Hasil Tersimpan di Spreadsheet!</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Hasil ke Guru</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real Submit Status Feedback */}
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

      {/* QUIZ QUESTIONS LIST */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                isEvaluated
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-red-300 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {qIndex + 1}
                  </span>
                  <h3 className="font-heading font-bold text-slate-800 text-sm sm:text-base leading-snug">
                    {q.question}
                  </h3>
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

                  let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50';

                  if (isEvaluated) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'bg-red-100 border-red-400 text-red-950 font-medium';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'bg-sky-500 border-sky-600 text-white font-bold shadow-xs';
                  }

                  const alphabet = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);

                  return (
                    <button
                      key={optIdx}
                      disabled={isEvaluated}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isThisSelected && !isEvaluated
                          ? 'bg-white text-sky-600'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {alphabet}
                      </span>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown after evaluation) */}
              {isEvaluated && (
                <div className="mt-4 pt-4 border-t border-slate-100 pl-0 sm:pl-11">
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs leading-relaxed space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-blue-900">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      Pembahasan Soal #{qIndex + 1}:
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

      {/* Bottom Action Footer */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isEvaluated ? (
          <>
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Pastikan semua {totalCount} soal telah kamu jawab sebelum menekan tombol periksa jawaban.
            </p>
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
              Hasil latihanmu siap dilaporkan. Sekarang, mari luangkan waktu untuk mengisi lembar refleksi.
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
