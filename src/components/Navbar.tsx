import { ViewStage, MediaIdentity, StudentSession, StudentProgressReport } from '../types';
import { audioManager } from '../utils/audio';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Settings, 
  User, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface NavbarProps {
  currentStage: ViewStage;
  onNavigate: (stage: ViewStage) => void;
  identity: MediaIdentity;
  session: StudentSession | null;
  onOpenTeacherModal: () => void;
  onOpenProgressModal: () => void;
  progressReport: StudentProgressReport | null;
  bgmActive: boolean;
  onToggleBgm: () => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
}

const STAGES: { key: ViewStage; label: string; icon: string }[] = [
  { key: 'opening', label: 'Beranda', icon: '🏠' },
  { key: 'tujuan', label: 'Tujuan', icon: '🎯' },
  { key: 'materi', label: 'Materi', icon: '📖' },
  { key: 'latihan', label: 'Latihan', icon: '📝' },
  { key: 'refleksi', label: 'Refleksi', icon: '💡' },
  { key: 'selesai', label: 'Selesai', icon: '🏆' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  onNavigate,
  identity,
  session,
  onOpenTeacherModal,
  onOpenProgressModal,
  progressReport,
  bgmActive,
  onToggleBgm,
  sfxMuted,
  onToggleSfx,
}) => {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Identity */}
          <div 
            onClick={() => {
              audioManager.playClick();
              onNavigate('opening');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base sm:text-lg text-slate-800 leading-tight">
                  MPI Edukreatif
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  {identity.subject}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {identity.topic} • {identity.grade}
              </p>
            </div>
          </div>

          {/* Student Chip (If Logged In) */}
          {session?.studentName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-semibold">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{session.studentName}</span>
              <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-md text-[10px]">
                {session.studentClass}
              </span>
            </div>
          )}

          {/* Action Controls: Audio & Teacher Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Background Music Toggle */}
            <button
              onClick={() => {
                audioManager.playClick();
                onToggleBgm();
              }}
              className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                bgmActive
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={bgmActive ? 'Matikan Musik Latar' : 'Putar Musik Ceria'}
            >
              <Music className={`w-4 h-4 ${bgmActive ? 'animate-bounce text-amber-600' : ''}`} />
              <span className="hidden lg:inline text-[11px]">
                {bgmActive ? 'Musik: Hidup' : 'Musik: Mati'}
              </span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                audioManager.playClick();
                onToggleSfx();
              }}
              className={`p-2 rounded-xl text-xs font-medium transition-all ${
                sfxMuted
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
              }`}
              title={sfxMuted ? 'Suara Efek: Senyap' : 'Suara Efek: Aktif'}
            >
              {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Student Progress Report Button */}
            {session && (
              <button
                onClick={() => {
                  audioManager.playClick();
                  onOpenProgressModal();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer"
                title="Lihat Laporan Progres Pengerjaan Siswa"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Laporan Progres</span>
                {progressReport && progressReport.totalQuestionsAttempted > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-white/25 text-[10px] font-black">
                    {progressReport.latestScore}
                  </span>
                )}
              </button>
            )}

            {/* Teacher / Config Modal Button */}
            <button
              onClick={() => {
                audioManager.playClick();
                onOpenTeacherModal();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
              title="Pengaturan Guru & Integrasi Spreadsheet"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Panduan & Data Guru</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Bar / Flow Navigation */}
        <div className="mt-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none flex items-center justify-between gap-1 sm:gap-2">
          {STAGES.map((s, idx) => {
            const isCurrent = s.key === currentStage;
            const isPassed = idx < currentIndex;
            const canNavigate = session || idx <= 1; // Can navigate if already identified or viewing home/objectives

            return (
              <button
                key={s.key}
                disabled={!canNavigate && idx > 0}
                onClick={() => {
                  if (canNavigate || idx === 0) {
                    audioManager.playClick();
                    onNavigate(s.key);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-white shadow-xs'
                    : isPassed
                    ? 'text-sky-700 hover:bg-sky-50'
                    : 'text-slate-400 hover:text-slate-600'
                } ${!canNavigate && idx > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
                {idx < STAGES.length - 1 && (
                  <span className="text-slate-300 ml-1 hidden md:inline">›</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
