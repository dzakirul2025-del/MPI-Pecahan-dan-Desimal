import React from 'react';

interface WaterCycleSvgProps {
  activeStage?: 'all' | 'evaporasi' | 'kondensasi' | 'presipitasi' | 'infiltrasi';
  onSelectStage?: (stage: string) => void;
  className?: string;
}

export const WaterCycleSvg: React.FC<WaterCycleSvgProps> = ({
  activeStage = 'all',
  onSelectStage,
  className = ''
}) => {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg border border-sky-100 bg-linear-to-b from-sky-200 via-sky-50 to-emerald-100 p-2 sm:p-4 ${className}`}>
      <svg
        viewBox="0 0 800 480"
        className="w-full h-auto max-h-[420px] select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Filter glow */}
          <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sky Background */}
        <rect width="800" height="340" fill="url(#skyGrad)" />

        {/* Sun */}
        <g
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectStage && onSelectStage('evaporasi')}
        >
          <circle cx="110" cy="90" r="50" fill="#fde047" opacity="0.4" filter="url(#sunGlow)" />
          <circle cx="110" cy="90" r="38" fill="#facc15" />
          <circle cx="110" cy="90" r="30" fill="#eab308" />
          {/* Sun Rays */}
          <path d="M110 38 L110 20 M110 142 L110 160 M58 90 L40 90 M162 90 L180 90 M73 53 L60 40 M147 127 L160 140 M73 127 L60 140 M147 53 L160 40" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          {/* Friendly Sun Face */}
          <circle cx="100" cy="85" r="4" fill="#854d0e" />
          <circle cx="120" cy="85" r="4" fill="#854d0e" />
          <path d="M102 98 Q110 108 118 98" fill="none" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Mountains in background */}
        <polygon points="460,340 580,140 700,340" fill="url(#mountainGrad)" />
        <polygon points="580,140 545,195 565,200 580,185 600,205 615,190" fill="#f8fafc" />
        <polygon points="340,340 440,190 540,340" fill="#475569" />
        <polygon points="440,190 415,228 430,232 440,220 455,235 465,225" fill="#f8fafc" />

        {/* Green Hills & Forest */}
        <path d="M 260 340 Q 380 230 520 340 Z" fill="url(#hillGrad)" />
        <path d="M 450 340 Q 600 250 780 340 Z" fill="#16a34a" />

        {/* Small Trees on Hills */}
        <g fill="#14532d">
          <polygon points="400,310 392,330 408,330" />
          <polygon points="420,305 412,328 428,328" />
          <polygon points="440,312 433,332 447,332" />
          <polygon points="490,295 482,320 498,320" />
          <polygon points="515,302 507,325 523,325" />
          <polygon points="630,315 622,338 638,338" />
          <polygon points="655,308 647,332 663,332" />
        </g>

        {/* River from mountain to ocean */}
        <path d="M 520 280 Q 430 330 320 360 L 300 410 Q 440 370 540 300 Z" fill="#38bdf8" opacity="0.9" />

        {/* Ocean Body */}
        <rect x="0" y="340" width="360" height="140" fill="url(#seaGrad)" />
        {/* Ocean Waves */}
        <path d="M 0 355 Q 40 348 80 355 T 160 355 T 240 355 T 320 355" fill="none" stroke="#7dd3fc" strokeWidth="3" opacity="0.6" />
        <path d="M 10 380 Q 50 373 90 380 T 170 380 T 250 380" fill="none" stroke="#7dd3fc" strokeWidth="3" opacity="0.6" />

        {/* Soil & Groundwater Under Mountains */}
        <rect x="360" y="340" width="440" height="140" fill="url(#soilGrad)" />
        {/* Groundwater Layer */}
        <path d="M 360 410 Q 500 395 650 410 T 800 405 L 800 480 L 360 480 Z" fill="#0284c7" opacity="0.35" />
        <path d="M 360 435 Q 520 420 670 435 T 800 430" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 6" opacity="0.8" />

        {/* CLOUDS & CONDENSATION */}
        <g
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectStage && onSelectStage('kondensasi')}
        >
          {/* Light Cloud (Evaporating) */}
          <g transform="translate(180, 70)" opacity="0.95">
            <ellipse cx="60" cy="50" rx="45" ry="25" fill="#ffffff" />
            <ellipse cx="95" cy="42" rx="35" ry="25" fill="#ffffff" />
            <ellipse cx="35" cy="45" rx="30" ry="20" fill="#ffffff" />
            <ellipse cx="70" cy="30" rx="32" ry="22" fill="#ffffff" />
          </g>

          {/* Heavy Rain Cloud (Over Mountain) */}
          <g transform="translate(480, 60)" opacity="0.95">
            <ellipse cx="70" cy="55" rx="55" ry="30" fill="#94a3b8" />
            <ellipse cx="115" cy="48" rx="45" ry="30" fill="#64748b" />
            <ellipse cx="40" cy="50" rx="38" ry="24" fill="#94a3b8" />
            <ellipse cx="80" cy="32" rx="42" ry="28" fill="#cbd5e1" />
          </g>
        </g>

        {/* EVAPORATION ARROWS (Rising from Sea to Sky) */}
        <g
          className="cursor-pointer"
          onClick={() => onSelectStage && onSelectStage('evaporasi')}
        >
          <path d="M 100 330 C 90 270 120 230 110 180" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 4" />
          <polygon points="110,172 104,185 116,185" fill="#ef4444" />

          <path d="M 160 335 C 150 280 180 240 170 185" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 4" />
          <polygon points="170,177 164,190 176,190" fill="#ef4444" />

          <path d="M 220 330 C 210 275 235 245 230 190" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 4" />
          <polygon points="230,182 224,195 236,195" fill="#ef4444" />

          {/* Transpiration from trees */}
          <path d="M 430 300 C 420 270 435 250 430 220" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
          <polygon points="430,214 425,224 435,224" fill="#10b981" />
        </g>

        {/* PRECIPITATION (Rain drops falling from dark cloud) */}
        <g
          className="cursor-pointer"
          onClick={() => onSelectStage && onSelectStage('presipitasi')}
        >
          <g stroke="#0284c7" strokeWidth="3" strokeLinecap="round">
            <line x1="510" y1="120" x2="500" y2="150" />
            <line x1="535" y1="130" x2="525" y2="160" />
            <line x1="560" y1="125" x2="550" y2="155" />
            <line x1="585" y1="135" x2="575" y2="165" />
            <line x1="610" y1="122" x2="600" y2="152" />

            <line x1="520" y1="170" x2="510" y2="200" />
            <line x1="545" y1="175" x2="535" y2="205" />
            <line x1="570" y1="180" x2="560" y2="210" />
            <line x1="595" y1="172" x2="585" y2="202" />
          </g>
        </g>

        {/* INFILTRATION ARROWS (Down into soil) */}
        <g
          className="cursor-pointer"
          onClick={() => onSelectStage && onSelectStage('infiltrasi')}
        >
          <path d="M 600 345 L 600 395" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" />
          <polygon points="600,402 595,392 605,392" fill="#3b82f6" />

          <path d="M 680 345 L 680 395" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" />
          <polygon points="680,402 675,392 685,392" fill="#3b82f6" />

          {/* Underground flow to ocean */}
          <path d="M 580 440 L 400 440" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="8 4" />
          <polygon points="392,440 402,435 402,445" fill="#0ea5e9" />
        </g>

        {/* STAGE LABELS / BADGES */}
        {/* 1. Evaporasi */}
        <g transform="translate(90, 205)">
          <rect x="-10" y="-14" width="135" height="28" rx="14" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
          <text x="57" y="5" textAnchor="middle" fill="#991b1b" fontSize="13" fontWeight="bold">1. Evaporasi ☀️</text>
        </g>

        {/* 2. Kondensasi */}
        <g transform="translate(325, 75)">
          <rect x="-10" y="-14" width="145" height="28" rx="14" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
          <text x="62" y="5" textAnchor="middle" fill="#3730a3" fontSize="13" fontWeight="bold">2. Kondensasi ☁️</text>
        </g>

        {/* 3. Presipitasi */}
        <g transform="translate(620, 160)">
          <rect x="-10" y="-14" width="145" height="28" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
          <text x="62" y="5" textAnchor="middle" fill="#0369a1" fontSize="13" fontWeight="bold">3. Presipitasi 🌧️</text>
        </g>

        {/* 4. Infiltrasi */}
        <g transform="translate(635, 365)">
          <rect x="-10" y="-14" width="135" height="28" rx="14" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
          <text x="57" y="5" textAnchor="middle" fill="#92400e" fontSize="13" fontWeight="bold">4. Infiltrasi 🌱</text>
        </g>

        {/* Lautan & Aliran Permukaan */}
        <g transform="translate(85, 415)">
          <rect x="-10" y="-12" width="140" height="24" rx="12" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
          <text x="60" y="5" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">Lautan & Sungai 🌊</text>
        </g>
      </svg>
    </div>
  );
};
