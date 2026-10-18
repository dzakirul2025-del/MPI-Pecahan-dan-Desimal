import React, { useState, useEffect } from 'react';
import { 
  ViewStage, 
  AppConfig, 
  StudentSession, 
  QuizQuestion, 
  MateriSlide,
  StudentProgressReport,
  DrillAttemptRecord,
  SubtopicStat
} from './types';
import { 
  DEFAULT_IDENTITY, 
  DEFAULT_MATERI_SLIDES, 
  DEFAULT_QUIZ_QUESTIONS 
} from './data/defaultConfig';
import { audioManager } from './utils/audio';
import { sendToGoogleAppsScript } from './services/apiService';

import { Navbar } from './components/Navbar';
import { OpeningView } from './components/OpeningView';
import { TujuanView } from './components/TujuanView';
import { MateriView } from './components/MateriView';
import { LatihanView } from './components/LatihanView';
import { RefleksiView } from './components/RefleksiView';
import { SelesaiView } from './components/SelesaiView';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { StudentProgressModal } from './components/StudentProgressModal';
import { SyahduMusicPlayer } from './components/SyahduMusicPlayer';

const STORAGE_KEY_CONFIG = 'mpi_app_config_v2_math';
const STORAGE_KEY_SESSION = 'mpi_active_session_v2_math';
const STORAGE_KEY_QUESTIONS = 'mpi_quiz_questions_v2_math';
const STORAGE_KEY_PROGRESS = 'mpi_progress_report_v2_math';

export default function App() {
  // Load initial config from local storage or default
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      identity: DEFAULT_IDENTITY,
      scriptUrl: '',
      enableSoundEffects: true,
      enableBgm: false,
    };
  });

  // Active student session
  const [session, setSession] = useState<StudentSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Student Progress Report state
  const [progressReport, setProgressReport] = useState<StudentProgressReport | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Questions and Slides (Load full 150 verified math questions)
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 150) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_QUIZ_QUESTIONS;
  });

  const [slides] = useState<MateriSlide[]>(DEFAULT_MATERI_SLIDES);
  const [currentStage, setCurrentStage] = useState<ViewStage>('opening');
  const [lastQuizScore, setLastQuizScore] = useState<number | null>(null);

  // Modals state
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // Audio state
  const [bgmActive, setBgmActive] = useState(false);
  const [bgmMode, setBgmMode] = useState<'youtube' | 'synth'>('youtube');
  const [sfxMuted, setSfxMuted] = useState(false);

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch {}
  };

  // Save questions changes
  const handleSaveQuestions = (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(newQuestions));
    } catch {}
  };

  // Toggle BGM
  const handleToggleBgm = () => {
    setBgmActive(prev => !prev);
  };

  // Toggle SFX
  const handleToggleSfx = () => {
    const isNowMuted = audioManager.toggleMuteSFX();
    setSfxMuted(isNowMuted);
  };

  // Record an attempt into the student progress report
  const handleRecordAttempt = (attempt: DrillAttemptRecord) => {
    setProgressReport(prev => {
      const studentName = session?.studentName || prev?.studentName || 'Siswa';
      const studentClass = session?.studentClass || prev?.studentClass || 'Kelas 6';
      const studentNumber = session?.studentNumber || prev?.studentNumber || '-';
      const sessionId = session?.sessionId || prev?.sessionId || `SESI-${Date.now()}`;

      const existingAttempts = prev?.attempts || [];
      const existingIdx = existingAttempts.findIndex(a => a.id === attempt.id);
      let updatedAttempts: DrillAttemptRecord[];
      if (existingIdx >= 0) {
        updatedAttempts = [...existingAttempts];
        updatedAttempts[existingIdx] = attempt;
      } else {
        updatedAttempts = [attempt, ...existingAttempts];
      }

      const totalAttempted = updatedAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      const totalCorrect = updatedAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
      const totalWrong = updatedAttempts.reduce((sum, a) => sum + a.wrongAnswers, 0);
      const scores = updatedAttempts.map(a => a.score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const averageAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // Aggregasi Penguasaan per Subtopik dari seluruh sesi latihan
      const CORE_SUBTOPICS = [
        'Konversi Pecahan ke Desimal',
        'Konversi Desimal ke Pecahan',
        'Membandingkan & Mengurutkan',
        'Operasi Penjumlahan & Pengurangan',
        'Operasi Hitung Campuran & Masalah Kontekstual'
      ];

      const subtopicMap: Record<string, { total: number; correct: number; wrong: number }> = {};
      CORE_SUBTOPICS.forEach(sub => {
        subtopicMap[sub] = { total: 0, correct: 0, wrong: 0 };
      });

      updatedAttempts.forEach(att => {
        if (att.subtopicBreakdown && att.subtopicBreakdown.length > 0) {
          att.subtopicBreakdown.forEach(st => {
            const key = st.subtopic;
            if (!subtopicMap[key]) {
              subtopicMap[key] = { total: 0, correct: 0, wrong: 0 };
            }
            subtopicMap[key].total += st.total;
            subtopicMap[key].correct += st.correct;
            subtopicMap[key].wrong += st.wrong;
          });
        }
      });

      const subtopicStats: SubtopicStat[] = CORE_SUBTOPICS.map(subtopic => {
        const stats = subtopicMap[subtopic] || { total: 0, correct: 0, wrong: 0 };
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        let masteryStatus: 'Sangat Mahir' | 'Cukup Terampil' | 'Perlu Bimbingan' = 'Perlu Bimbingan';
        let recommendation = 'Belum ada latihan pada subtopik ini. Silakan pilih paket latihan terkait.';

        if (stats.total > 0) {
          if (accuracy >= 80) {
            masteryStatus = 'Sangat Mahir';
            recommendation = 'Penguasaan konsep sangat baik. Siap untuk level mahir dan soal tantangan HOTS!';
          } else if (accuracy >= 65) {
            masteryStatus = 'Cukup Terampil';
            recommendation = 'Konsep sudah dipahami. Perlu drill tambahan untuk meningkatkan ketelitian.';
          } else {
            masteryStatus = 'Perlu Bimbingan';
            recommendation = 'Perlu mempelajari kembali materi pada modul belajar dan mengulang latihan terbimbing.';
          }
        }

        return {
          subtopic,
          totalQuestions: stats.total,
          correctAnswers: stats.correct,
          wrongAnswers: stats.wrong,
          accuracy,
          masteryStatus,
          recommendation
        };
      });

      const updatedReport: StudentProgressReport = {
        studentName,
        studentClass,
        studentNumber,
        sessionId,
        lastUpdated: new Date().toLocaleString('id-ID'),
        attempts: updatedAttempts,
        totalQuestionsAttempted: totalAttempted,
        totalCorrect,
        totalWrong,
        latestScore: attempt.score,
        highestScore,
        averageScore,
        averageAccuracy,
        subtopicStats
      };

      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updatedReport));
      } catch {}

      return updatedReport;
    });
  };

  // Start learning from Opening screen
  const handleStartLearning = (studentName: string, studentClass: string, studentNumber: string) => {
    // Generate unique Session ID: SESI-20261018-XXXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSessionId = `SESI-${dateStr}-${randomHex}`;

    const newSession: StudentSession = {
      sessionId: newSessionId,
      studentName,
      studentClass,
      studentNumber,
      startTime: new Date().toISOString(),
      submittedLoginToSheet: false
    };

    setSession(newSession);
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
    } catch {}

    // Initialize or update Progress Report for new student
    const freshReport: StudentProgressReport = {
      studentName,
      studentClass,
      studentNumber,
      sessionId: newSessionId,
      lastUpdated: new Date().toLocaleString('id-ID'),
      attempts: [],
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalWrong: 0,
      latestScore: 0,
      highestScore: 0,
      averageScore: 0,
      averageAccuracy: 0
    };
    setProgressReport(freshReport);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(freshReport));
    } catch {}

    // Send login record to Google Apps Script (DATA_SISWA)
    sendToGoogleAppsScript(config.scriptUrl, 'SAVE_STUDENT', {
      sessionId: newSessionId,
      studentName,
      studentClass,
      studentNumber,
      mediaTitle: config.identity.mediaTitle,
      subject: config.identity.subject,
      topic: config.identity.topic
    }).then(res => {
      if (res.success) {
        newSession.submittedLoginToSheet = true;
        setSession({ ...newSession });
        try {
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
        } catch {}
      }
    });

    setCurrentStage('tujuan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-sky-200">
      {/* Top Navigation Bar */}
      <Navbar
        currentStage={currentStage}
        onNavigate={(stage) => setCurrentStage(stage)}
        identity={config.identity}
        session={session}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenProgressModal={() => setIsProgressModalOpen(true)}
        progressReport={progressReport}
        bgmActive={bgmActive}
        onToggleBgm={handleToggleBgm}
        sfxMuted={sfxMuted}
        onToggleSfx={handleToggleSfx}
      />

      {/* Main Learning Canvas */}
      <main className="flex-1 flex flex-col justify-start pb-12">
        {currentStage === 'opening' && (
          <OpeningView
            identity={config.identity}
            session={session}
            onStartLearning={handleStartLearning}
            bgmActive={bgmActive}
            onToggleBgm={handleToggleBgm}
          />
        )}

        {currentStage === 'tujuan' && (
          <TujuanView
            identity={config.identity}
            onBack={() => setCurrentStage('opening')}
            onNext={() => setCurrentStage('materi')}
          />
        )}

        {currentStage === 'materi' && (
          <MateriView
            slides={slides}
            identity={config.identity}
            onBackToTujuan={() => setCurrentStage('tujuan')}
            onFinishMateri={() => setCurrentStage('latihan')}
          />
        )}

        {currentStage === 'latihan' && (
          session ? (
            <LatihanView
              questions={questions}
              identity={config.identity}
              session={session}
              scriptUrl={config.scriptUrl}
              onRecordAttempt={handleRecordAttempt}
              onOpenProgressReport={() => setIsProgressModalOpen(true)}
              onFinishQuiz={(score, attemptRecord) => {
                setLastQuizScore(score);
                if (attemptRecord) {
                  handleRecordAttempt(attemptRecord);
                }
                setCurrentStage('refleksi');
              }}
            />
          ) : (
            <div className="max-w-md mx-auto p-8 text-center space-y-4">
              <p className="text-sm text-slate-600">
                Silakan isi data diri terlebih dahulu sebelum mengakses latihan.
              </p>
              <button
                onClick={() => setCurrentStage('opening')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Kembali ke Beranda
              </button>
            </div>
          )
        )}

        {currentStage === 'refleksi' && (
          session ? (
            <RefleksiView
              session={session}
              identity={config.identity}
              scriptUrl={config.scriptUrl}
              onFinishReflection={() => setCurrentStage('selesai')}
            />
          ) : (
            <div className="max-w-md mx-auto p-8 text-center space-y-4">
              <button
                onClick={() => setCurrentStage('opening')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Kembali ke Beranda
              </button>
            </div>
          )
        )}

        {currentStage === 'selesai' && (
          session ? (
            <SelesaiView
              session={session}
              identity={config.identity}
              lastQuizScore={lastQuizScore}
              progressReport={progressReport}
              onReviewMateri={() => setCurrentStage('materi')}
              onRetryQuiz={() => setCurrentStage('latihan')}
              onOpenProgressModal={() => setIsProgressModalOpen(true)}
            />
          ) : (
            <div className="max-w-md mx-auto p-8 text-center space-y-4">
              <button
                onClick={() => setCurrentStage('opening')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Kembali ke Beranda
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer (Kid-friendly & Informative) */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {config.identity.mediaTitle} • {config.identity.subject}
          </span>
          <span className="text-[11px] text-slate-400">
            Guru: {config.identity.teacherName} • {config.identity.school}
          </span>
        </div>
      </footer>

      {/* Teacher & Apps Script Setup Modal */}
      <TeacherSettingsModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        questions={questions}
        onSaveQuestions={handleSaveQuestions}
      />

      {/* Student Progress Report Modal */}
      <StudentProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        report={progressReport}
        identity={config.identity}
        scriptUrl={config.scriptUrl}
      />

      {/* Floating Syahdu Learning Music Player (YouTube & Synth Mode) */}
      <SyahduMusicPlayer
        isPlaying={bgmActive}
        onTogglePlay={handleToggleBgm}
        youtubeUrl="https://youtu.be/n7atIjNY07E?si=IoPvBKXMLReoM9QW"
        bgmMode={bgmMode}
        onChangeBgmMode={setBgmMode}
      />
    </div>
  );
}
