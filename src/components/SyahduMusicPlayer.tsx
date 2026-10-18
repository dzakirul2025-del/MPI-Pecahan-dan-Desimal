import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../utils/audio';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  ExternalLink,
  Radio,
  Sliders
} from 'lucide-react';

interface SyahduMusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  youtubeUrl?: string;
  bgmMode?: 'youtube' | 'synth';
  onChangeBgmMode?: (mode: 'youtube' | 'synth') => void;
}

export function extractYouTubeId(url: string): string {
  if (!url) return 'n7atIjNY07E';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : 'n7atIjNY07E';
}

export const SyahduMusicPlayer: React.FC<SyahduMusicPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  youtubeUrl = 'https://youtu.be/n7atIjNY07E?si=IoPvBKXMLReoM9QW',
  bgmMode = 'youtube',
  onChangeBgmMode
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<'youtube' | 'synth'>(bgmMode);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoId = extractYouTubeId(youtubeUrl);

  // Synchronize with synth audioManager when mode is 'synth'
  useEffect(() => {
    if (mode === 'synth') {
      if (isPlaying) {
        audioManager.startBGM();
      } else {
        audioManager.stopBGM();
      }
    } else {
      audioManager.stopBGM();
    }
  }, [isPlaying, mode]);

  // Send play/pause postMessage commands to YouTube Iframe
  useEffect(() => {
    if (mode === 'youtube' && iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: '' }),
          '*'
        );
      } catch (e) {
        // PostMessage blocked or iframe loading
      }
    }
  }, [isPlaying, mode, videoId]);

  const handleModeChange = (newMode: 'youtube' | 'synth') => {
    audioManager.playClick();
    setMode(newMode);
    onChangeBgmMode?.(newMode);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden select-none">
      {/* Hidden YouTube Iframe for Audio Playback */}
      {mode === 'youtube' && (
        <div className="hidden">
          <iframe
            ref={iframeRef}
            width="200"
            height="150"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${videoId}&controls=0`}
            title="Lagu Syahdu Belajar"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Floating Card */}
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-amber-200 transition-all duration-300 ${
        isMinimized ? 'p-2' : 'p-3.5 sm:p-4 w-72 sm:w-80'
      }`}>
        {isMinimized ? (
          /* Minimized Pill */
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioManager.playClick();
                onTogglePlay();
              }}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200 animate-pulse' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isPlaying ? 'Jeda Musik' : 'Putar Musik Syahdu'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-500 animate-bounce' : ''}`} />
              <span className="text-[11px] font-bold line-clamp-1 max-w-[90px]">
                {isPlaying ? 'Lagu Syahdu...' : 'Musik Mati'}
              </span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded Player Panel */
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
                  <Music className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-heading font-extrabold text-slate-800">
                  Suasana Belajar Syahdu
                </span>
              </div>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Sembunyikan"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Track Info & Equalizer */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  {mode === 'youtube' ? 'Lagu Syahdu (YouTube)' : 'Instrumen Sintetis (Offline)'}
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {mode === 'youtube' ? 'Koleksi Lagu Syahdu & Relaksasi Belajar' : 'Harmoni Edukasi Ceria'}
                </p>
                <span className="text-[10px] text-slate-500 block">
                  {isPlaying ? '▶ Sedang mengalun merdu...' : '⏸ Musik dijeda'}
                </span>
              </div>

              {/* Animated Audio Equalizer Bars */}
              <div className="flex items-end gap-1 h-6 shrink-0 px-2">
                <span className={`w-1 bg-amber-500 rounded-full transition-all duration-300 ${isPlaying ? 'h-5 animate-pulse' : 'h-1.5'}`} />
                <span className={`w-1 bg-amber-600 rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-bounce' : 'h-1.5'}`} />
                <span className={`w-1 bg-orange-500 rounded-full transition-all duration-300 ${isPlaying ? 'h-6 animate-pulse' : 'h-1.5'}`} />
                <span className={`w-1 bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-4 animate-bounce' : 'h-1.5'}`} />
              </div>
            </div>

            {/* Play/Pause Main Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  audioManager.playClick();
                  onTogglePlay();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-heading font-extrabold text-xs transition-all shadow-sm cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 ring-2 ring-amber-300'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>JEDA MUSIK</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>PUTAR LAGU SYAHDU</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Source Selector: YouTube vs Web Audio */}
            <div className="flex items-center gap-1.5 pt-1 text-[11px]">
              <button
                onClick={() => handleModeChange('youtube')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                  mode === 'youtube'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="Putar lagu syahdu dari link YouTube pilihan"
              >
                Lagu Syahdu (YT)
              </button>

              <button
                onClick={() => handleModeChange('synth')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                  mode === 'synth'
                    ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="Putar nada santai sintetis (bisa tanpa internet)"
              >
                Instrumen (Offline)
              </button>
            </div>

            {/* Direct YouTube Link Reference */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span className="truncate max-w-[190px]">Link: youtu.be/n7atIjNY07E</span>
              <a 
                href={youtubeUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Buka YT</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
