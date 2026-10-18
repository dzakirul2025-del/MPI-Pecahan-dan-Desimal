import React, { useState } from 'react';
import { audioManager } from '../../utils/audio';
import { Sparkles, PieChart, Info, HelpCircle } from 'lucide-react';

interface PresetFraction {
  label: string;
  numerator: number;
  denominator: number;
  decimal: string;
  percent: string;
  story: string;
}

const PRESETS: PresetFraction[] = [
  { label: 'Setengah (1/2)', numerator: 1, denominator: 2, decimal: '0,5', percent: '50%', story: '1 dari 2 potong pizza lezat' },
  { label: 'Seperempat (1/4)', numerator: 1, denominator: 4, decimal: '0,25', percent: '25%', story: '1 potong dari 4 bagian kue ulang tahun' },
  { label: 'Tiga Perempat (3/4)', numerator: 3, denominator: 4, decimal: '0,75', percent: '75%', story: '3 potong dari 4 bagian martabak manis' },
  { label: 'Dua Perlima (2/5)', numerator: 2, denominator: 5, decimal: '0,4', percent: '40%', story: '2 potong dari 5 batang cokelat' },
  { label: 'Tiga Persepuluh (3/10)', numerator: 3, denominator: 10, decimal: '0,3', percent: '30%', story: '3 kotak dari 10 kotak petak sawah' },
  { label: 'Lima Perdelapan (5/8)', numerator: 5, denominator: 8, decimal: '0,625', percent: '62,5%', story: '5 potong dari 8 iris semangka segar' },
];

export const FractionVisualizerSvg: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const preset = PRESETS[selectedPresetIndex];
  const num = preset.numerator;
  const den = preset.denominator;
  const fractionValue = num / den;

  // Generate SVG Pie Slices
  const radius = 100;
  const cx = 130;
  const cy = 130;

  const slices = Array.from({ length: den }, (_, i) => {
    const isSelected = i < num;
    const startAngle = (i * 2 * Math.PI) / den - Math.PI / 2;
    const endAngle = ((i + 1) * 2 * Math.PI) / den - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArcFlag = 2 * Math.PI / den > Math.PI ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      index: i,
      isSelected,
      pathData
    };
  });

  return (
    <div className={`rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50 border-2 border-amber-200 shadow-md space-y-5 ${className}`}>
      {/* Header Manipulatif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            🍕
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-1.5">
              <span>Laboratorium Visual Pecahan & Desimal</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Pilih pecahan untuk melihat perubahan wujud lingkaran pizza dan posisi garis bilangannya!
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-white text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
          Interaktif Kelas 6
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              audioManager.playClick();
              setSelectedPresetIndex(idx);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPresetIndex === idx
                ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 scale-105'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Display: Pie SVG + Card Equivalences */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Pie SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white/90 rounded-2xl border border-amber-200/60 shadow-xs">
          <svg viewBox="0 0 260 260" className="w-48 h-48 sm:w-56 sm:h-56 select-none">
            {/* Outer Crust */}
            <circle cx={cx} cy={cy} r={radius + 6} fill="#f59e0b" opacity="0.3" />
            <circle cx={cx} cy={cy} r={radius + 2} fill="#d97706" />
            {/* Pizza Base */}
            <circle cx={cx} cy={cy} r={radius} fill="#fef3c7" />

            {/* Slices */}
            {slices.map((slice) => (
              <path
                key={slice.index}
                d={slice.pathData}
                fill={slice.isSelected ? '#f97316' : '#fef9c3'}
                stroke="#b45309"
                strokeWidth="2.5"
                className="transition-colors duration-300"
              />
            ))}

            {/* Pepperoni / Toppings on selected slices */}
            {slices.filter(s => s.isSelected).map((s) => {
              const midAngle = ((s.index + 0.5) * 2 * Math.PI) / den - Math.PI / 2;
              const tx = cx + (radius * 0.6) * Math.cos(midAngle);
              const ty = cy + (radius * 0.6) * Math.sin(midAngle);
              return (
                <circle
                  key={`top-${s.index}`}
                  cx={tx}
                  cy={ty}
                  r="7"
                  fill="#dc2626"
                  stroke="#991b1b"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Center Pivot */}
            <circle cx={cx} cy={cy} r="6" fill="#78350f" />
          </svg>

          <span className="text-xs font-bold text-slate-600 mt-2 text-center">
            {preset.story} ({num} dari {den} bagian)
          </span>
        </div>

        {/* Right: 3 Equivalent Form Cards */}
        <div className="md:col-span-7 space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Pecahan Biasa */}
            <div className="p-3 bg-white rounded-2xl border-2 border-orange-200 text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-orange-600 block">Pecahan Biasa</span>
              <div className="mt-1 font-heading font-black text-2xl sm:text-3xl text-orange-700 flex flex-col items-center">
                <span>{num}</span>
                <span className="w-8 h-0.5 bg-orange-600 my-0.5" />
                <span>{den}</span>
              </div>
            </div>

            {/* Bentuk Desimal */}
            <div className="p-3 bg-white rounded-2xl border-2 border-blue-200 text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Bentuk Desimal</span>
              <div className="mt-2.5 font-heading font-black text-2xl sm:text-3xl text-blue-700">
                {preset.decimal}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">({num} ÷ {den})</span>
            </div>

            {/* Bentuk Persen */}
            <div className="p-3 bg-white rounded-2xl border-2 border-emerald-200 text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Bentuk Persen</span>
              <div className="mt-2.5 font-heading font-black text-2xl sm:text-3xl text-emerald-700">
                {preset.percent}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">(per seratus)</span>
            </div>
          </div>

          {/* Konsep Rumus Mini-Explainer */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Cara Mengubah {num}/{den} Menjadi Desimal:
            </span>
            <p className="font-medium text-[11px] text-slate-600 leading-relaxed">
              {den === 10 || den === 100 ? (
                <>Karena penyebutnya sudah {den}, langsung tulis sesuai nilai persepuluhan/perseratusan: <strong>{preset.decimal}</strong>.</>
              ) : den === 2 || den === 4 || den === 5 ? (
                <>Ubah penyebut ke 10 atau 100: ({num} × {100 / den}) / ({den} × {100 / den}) = {num * (100 / den)}/100 = <strong>{preset.decimal}</strong>.</>
              ) : (
                <>Gunakan pembagian bersusun (porogapit): {num} dibagi {den} menghasilkan <strong>{preset.decimal}</strong>.</>
              )}
            </p>
          </div>

          {/* Interactive Decimal Number Line (0 to 1) */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Garis Bilangan (0 hingga 1):</span>
              <span className="text-blue-600 font-mono font-bold">Posisi: {preset.decimal}</span>
            </div>

            <div className="relative w-full h-8 flex items-center">
              {/* Track line */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-orange-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${fractionValue * 100}%` }}
                />
              </div>

              {/* Pin indicator */}
              <div
                className="absolute -top-1.5 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${fractionValue * 100}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-[9px] text-white font-bold">
                  📍
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
              <span>0 (Nol)</span>
              <span>0,25</span>
              <span>0,50</span>
              <span>0,75</span>
              <span>1,0 (Utuh)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
