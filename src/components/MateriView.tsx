import React, { useState } from 'react';
import { MateriSlide, MediaIdentity } from '../types';
import { audioManager } from '../utils/audio';
import { FractionVisualizerSvg } from './illustrations/FractionVisualizerSvg';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Sparkles, 
  RefreshCw, 
  Award,
  MoveUp,
  MoveDown,
  Layers
} from 'lucide-react';

interface MateriViewProps {
  slides: MateriSlide[];
  identity: MediaIdentity;
  onFinishMateri: () => void;
  onBackToTujuan: () => void;
}

export const MateriView: React.FC<MateriViewProps> = ({
  slides,
  identity,
  onFinishMateri,
  onBackToTujuan
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // States for interactive mini-activities
  // 1. Hotspot state
  const [activeHotspot, setActiveHotspot] = useState<number | null>(0);

  // 2. Matching game state
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [matchingFeedback, setMatchingFeedback] = useState<string>('');

  // 3. Ordering game state
  const [orderItems, setOrderItems] = useState<{ stepId: number; text: string }[]>(() => {
    const slide4 = slides.find(s => s.activity?.type === 'ordering');
    if (slide4?.activity?.data) {
      // Shuffle initial order
      return [...slide4.activity.data].sort(() => Math.random() - 0.5);
    }
    return [];
  });
  const [orderStatus, setOrderStatus] = useState<'untested' | 'correct' | 'incorrect'>('untested');

  // 4. Checklist / Categorize state
  const [categorizeAnswers, setCategorizeAnswers] = useState<Record<number, string>>({});

  const slide = slides[currentSlideIndex] || slides[0];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;

  // Handle Matching Logic
  const handleSelectTerm = (id: string) => {
    audioManager.playClick();
    setSelectedTerm(id);
    setMatchingFeedback('');
  };

  const handleSelectDefinition = (matchId: string) => {
    if (!selectedTerm) return;
    const activityData = slide.activity?.data as { id: string; term: string; matchId: string; definition: string }[];
    const item = activityData?.find(d => d.id === selectedTerm);

    if (item && item.matchId === matchId) {
      audioManager.playCorrect();
      setMatchedPairs(prev => [...prev, item.id]);
      setSelectedTerm(null);
      setMatchingFeedback('🎉 Hebat! Pasangan jawabanmu benar!');
    } else {
      audioManager.playWrong();
      setMatchingFeedback('❌ Kurang tepat, coba baca lagi penjelasannya!');
    }
  };

  // Handle Ordering Move Up / Down
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    audioManager.playClick();
    const newItems = [...orderItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setOrderItems(newItems);
    setOrderStatus('untested');
  };

  const verifyOrder = () => {
    const isCorrect = orderItems.every((item, idx) => item.stepId === idx + 1);
    if (isCorrect) {
      audioManager.playVictory();
      setOrderStatus('correct');
    } else {
      audioManager.playWrong();
      setOrderStatus('incorrect');
    }
  };

  const resetOrder = () => {
    audioManager.playClick();
    const slide4 = slides.find(s => s.activity?.type === 'ordering');
    if (slide4?.activity?.data) {
      setOrderItems([...slide4.activity.data].sort(() => Math.random() - 0.5));
    }
    setOrderStatus('untested');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Slide Progress Bar & Title */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
            {currentSlideIndex + 1}
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {identity.topic}
            </span>
            <h1 className="font-heading font-extrabold text-slate-800 text-lg sm:text-xl">
              {slide.title}
            </h1>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                audioManager.playClick();
                setCurrentSlideIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-8 bg-sky-500'
                  : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Buka Halaman ${idx + 1}`}
            />
          ))}
          <span className="text-xs text-slate-400 font-semibold ml-2">
            {currentSlideIndex + 1}/{slides.length}
          </span>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-sky-100 space-y-6">
        {/* Subtitle & Key Concept */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold mb-2">
            💡 {slide.subtitle}
          </span>
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            {slide.concept}
          </p>
        </div>

        {/* Visual / Illustration Area */}
        {slide.id === 1 && (
          <div className="space-y-3">
            <FractionVisualizerSvg />
          </div>
        )}

        {/* Content Paragraphs */}
        <div className="space-y-3">
          {slide.content.map((paragraph, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-50/40 border border-sky-100/60">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {paragraph}
              </p>
            </div>
          ))}
        </div>

        {/* Fun Fact Callout */}
        {slide.funFact && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 block">
                Tahukah Kamu?
              </span>
              <p className="text-xs sm:text-sm font-medium mt-0.5">
                {slide.funFact}
              </p>
            </div>
          </div>
        )}

        {/* INTERACTIVE MINI ACTIVITY SECTION */}
        {slide.activity && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" />
              <h3 className="font-heading font-bold text-slate-800 text-base sm:text-lg">
                {slide.activity.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {slide.activity.instruction}
            </p>

            {/* ACTIVITY 1: HOTSPOT EXPLORER */}
            {slide.activity.type === 'hotspot' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slide.activity.data.map((item: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        audioManager.playClick();
                        setActiveHotspot(idx);
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        activeHotspot === idx
                          ? 'bg-sky-500 text-white shadow-md border-sky-600 ring-2 ring-sky-200'
                          : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{item.name}</span>
                      <span className={`text-[10px] block mt-0.5 ${activeHotspot === idx ? 'text-sky-100' : 'text-slate-500'}`}>
                        {item.role}
                      </span>
                    </button>
                  ))}
                </div>

                {activeHotspot !== null && slide.activity.data[activeHotspot] && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 animate-fadeIn">
                    <span className="font-bold text-sm text-blue-800 block mb-1">
                      🔍 Peran: {slide.activity.data[activeHotspot].name} ({slide.activity.data[activeHotspot].role})
                    </span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {slide.activity.data[activeHotspot].desc}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY 2: MATCHING GAME */}
            {slide.activity.type === 'matching' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Terms */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase block">
                      Kolom A: Istilah Sains
                    </span>
                    {(slide.activity.data as any[]).map((item) => {
                      const isMatched = matchedPairs.includes(item.id);
                      const isSelected = selectedTerm === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={isMatched}
                          onClick={() => handleSelectTerm(item.id)}
                          className={`w-full p-3 rounded-xl text-left font-bold text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-between ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60'
                              : isSelected
                              ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-300'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{item.term}</span>
                          {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Definitions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase block">
                      Kolom B: Makna / Penjelasan
                    </span>
                    {(slide.activity.data as any[]).map((item) => {
                      const isMatched = matchedPairs.includes(item.id);
                      return (
                        <button
                          key={item.matchId}
                          disabled={isMatched}
                          onClick={() => handleSelectDefinition(item.matchId)}
                          className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60'
                              : 'bg-white hover:bg-sky-50/70 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{item.definition}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {matchingFeedback && (
                  <div className="p-3 rounded-xl bg-slate-100 text-xs sm:text-sm font-bold text-slate-800 text-center animate-fadeIn">
                    {matchingFeedback}
                  </div>
                )}

                {matchedPairs.length === slide.activity.data.length && (
                  <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-center space-y-1 animate-bounce">
                    <span className="text-xl">🌟 Luar Biasa!</span>
                    <p className="text-xs font-bold">Semua pasangan istilah sains berhasil kamu cocokkan dengan sempurna!</p>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY 3: ORDERING GAME */}
            {slide.activity.type === 'ordering' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div
                      key={item.stepId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-800 font-medium">
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveOrderItem(idx, 'up')}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Geser ke Atas"
                        >
                          <MoveUp className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          disabled={idx === orderItems.length - 1}
                          onClick={() => moveOrderItem(idx, 'down')}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Geser ke Bawah"
                        >
                          <MoveDown className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={verifyOrder}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Periksa Urutan
                  </button>
                  <button
                    onClick={resetOrder}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Acak Ulang</span>
                  </button>
                </div>

                {orderStatus === 'correct' && (
                  <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold animate-fadeIn">
                    🎉 Tepat sekali! Urutan pecahan dan desimalmu dari yang terkecil ke terbesar 100% benar!
                  </div>
                )}
                {orderStatus === 'incorrect' && (
                  <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold animate-fadeIn">
                    ⚠️ Urutan belum tepat. Tips: samakan semuanya ke bentuk desimal (0,15 &lt; 0,25 &lt; 0,40 &lt; 0,65 &lt; 0,75) lalu urutkan kembali!
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY 4: CATEGORIZE / CHECKLIST */}
            {slide.activity.type === 'checklist' && (
              <div className="space-y-3">
                {(slide.activity.data as any[]).map((q, idx) => {
                  const currentAnswer = categorizeAnswers[idx];
                  const options = q.answer === 'Benar' || q.answer === 'Salah'
                    ? ['Benar', 'Salah']
                    : ['0,25', '0,5', '0,8'];

                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                        {idx + 1}. {q.scenario}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {options.map((opt) => {
                          const isSelected = currentAnswer === opt;
                          const isVerified = currentAnswer !== undefined;
                          const isCorrect = opt === q.answer;

                          let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50';
                          if (isSelected) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                            } else {
                              btnStyle = 'bg-red-500 text-white border-red-600 font-bold';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                if (opt === q.answer) {
                                  audioManager.playCorrect();
                                } else {
                                  audioManager.playWrong();
                                }
                                setCategorizeAnswers(prev => ({ ...prev, [idx]: opt }));
                              }}
                              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide Navigation Bottom Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            audioManager.playClick();
            if (isFirstSlide) {
              onBackToTujuan();
            } else {
              setCurrentSlideIndex(prev => prev - 1);
            }
          }}
          className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFirstSlide ? 'Kembali ke Tujuan' : 'Halaman Sebelumnya'}</span>
        </button>

        {!isLastSlide ? (
          <button
            onClick={() => {
              audioManager.playClick();
              setCurrentSlideIndex(prev => prev + 1);
            }}
            className="flex items-center gap-2 px-6 sm:px-7 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-sky-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Halaman Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              audioManager.playVictory();
              onFinishMateri();
            }}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-heading font-bold text-sm sm:text-base shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <span>Lanjut ke Latihan Kuis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
