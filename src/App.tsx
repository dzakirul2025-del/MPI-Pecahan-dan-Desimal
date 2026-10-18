import React, { useState, useEffect } from 'react';
import { 
  ViewStage, 
  AppConfig, 
  StudentSession, 
  QuizQuestion, 
  MateriSlide 
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

const STORAGE_KEY_CONFIG = 'mpi_app_config_v2_math';
const STORAGE_KEY_SESSION = 'mpi_active_session_v2_math';
const STORAGE_KEY_QUESTIONS = 'mpi_quiz_questions_v2_math';

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

  // Questions and Slides
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_QUIZ_QUESTIONS;
  });

  const [slides] = useState<MateriSlide[]>(DEFAULT_MATERI_SLIDES);
  const [currentStage, setCurrentStage] = useState<ViewStage>('opening');
  const [lastQuizScore, setLastQuizScore] = useState<number | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Audio state
  const [bgmActive, setBgmActive] = useState(false);
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
    const isNowPlaying = audioManager.toggleBGM();
    setBgmActive(isNowPlaying);
  };

  // Toggle SFX
  const handleToggleSfx = () => {
    const isNowMuted = audioManager.toggleMuteSFX();
    setSfxMuted(isNowMuted);
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
              onFinishQuiz={(score) => {
                setLastQuizScore(score);
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
              onReviewMateri={() => setCurrentStage('materi')}
              onRetryQuiz={() => setCurrentStage('latihan')}
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
    </div>
  );
}
