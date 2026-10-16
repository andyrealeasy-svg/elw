import React, { useState, useImperativeHandle, forwardRef, memo } from 'react';
import { cn } from "../lib/utils";

export interface EffectsOverlayRef {
  addFloatText: (targetUid: string, text: string, color: string) => void;
  playEffect: (targetUid: string, type: string) => void;
}

export const EffectsOverlay = memo(forwardRef<EffectsOverlayRef, { unitId: string }>((props, ref) => {
  const [floatingTexts, setFloatingTexts] = useState<{ id: string, text: string, color: string }[]>([]);
  const [visualEffects, setVisualEffects] = useState<{ id: string, type: string }[]>([]);

  useImperativeHandle(ref, () => ({
    addFloatText: (targetUid: string, text: string, color: string) => {
      if (targetUid !== props.unitId) return;
      const id = Math.random().toString();
      // Keep at most 3 simultaneous floating texts to prevent DOM buildup
      setFloatingTexts(prev => [...prev.slice(-2), { id, text, color }]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 850);
    },
    playEffect: (targetUid: string, type: string) => {
      if (targetUid !== props.unitId) return;
      const id = Math.random().toString();
      // Keep at most 2 simultaneous visual effects to avoid layout stress
      setVisualEffects(prev => [...prev.slice(-1), { id, type }]);
      setTimeout(() => {
        setVisualEffects(prev => prev.filter(ve => ve.id !== id));
      }, 500);
    }
  }));

  const renderEffectGraphic = (type: string) => {
    switch (type) {
      case "Physical":
        return <div className="anim-slash-burst absolute text-4xl select-none">⚔️</div>;
      case "Hydro":
        return <div className="anim-impact-burst absolute text-blue-400 text-6xl opacity-90 select-none">🌊</div>;
      case "Pyro":
        return <div className="anim-impact-burst absolute text-red-500 text-6xl select-none">🔥</div>;
      case "Electro":
        return <div className="anim-impact-burst absolute text-purple-400 text-6xl select-none">⚡</div>;
      case "Cryo":
        return <div className="anim-impact-burst absolute text-cyan-200 text-6xl select-none">❄️</div>;
      case "Dendro":
        return <div className="anim-impact-burst absolute text-emerald-400 text-6xl select-none">🌿</div>;
      case "Geo":
        return <div className="anim-impact-burst absolute text-amber-500 text-6xl select-none">☄️</div>;
      case "hit":
        return <div className="anim-impact-burst absolute text-5xl select-none">💥</div>;
      case "heal":
        return <div className="anim-heal-float absolute text-5xl select-none">💚</div>;
      case "shield":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border-2 border-emerald-400" />
            <div className="anim-impact-burst text-emerald-300 text-5xl select-none">🛡️</div>
          </div>
        );
      case "buff":
        return <div className="anim-impact-burst absolute text-yellow-300 text-5xl select-none">✨</div>;
      case "ultimate_aoe":
        return <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border-4 border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-50" />;
      case "selina_rose":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border-2 border-rose-500" />
            <div className="anim-impact-burst text-6xl select-none">🌹</div>
          </div>
        );
      case "asher_nature":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border-2 border-emerald-500" />
            <div className="anim-impact-burst text-5xl select-none">🌳</div>
          </div>
        );
      case "krona_ice":
      case "kairen_frost":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-16 h-16 overflow-visible anim-impact-burst" viewBox="0 0 64 64" fill="none">
              <path d="M32 4 L35 29 L60 32 L35 35 L32 60 L29 35 L4 32 L29 29 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              <circle cx="32" cy="32" r="3" fill="#ffffff" />
            </svg>
          </div>
        );
      case "kairen_ice_dance":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-28 h-28 overflow-visible" viewBox="0 0 120 120" fill="none">
              {/* Primary diagonal slash */}
              <line x1="15" y1="15" x2="105" y2="105" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-ice-slash drop-shadow-[0_0_10px_rgba(56,189,248,1)]" />
              <line x1="20" y1="20" x2="100" y2="100" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" opacity="0.6" className="anim-ice-slash" />
              {/* Counter diagonal slash */}
              <line x1="105" y1="15" x2="15" y2="105" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0.04s' }} className="anim-ice-slash drop-shadow-[0_0_10px_rgba(56,189,248,1)]" />
              {/* Center crystal diamond spark */}
              <polygon points="60,48 68,60 60,72 52,60" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" className="anim-impact-burst drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
            </svg>
          </div>
        );
      case "kairen_frost_crown":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-32 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Hexagonal Frost Star / Crown Prisms */}
              <polygon points="70,12 82,50 125,50 90,75 105,118 70,92 35,118 50,75 15,50 58,50" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(34,211,238,0.12)" className="drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              {/* Inner Diamond Core */}
              <polygon points="70,42 84,70 70,98 56,70" fill="#ffffff" stroke="#7dd3fc" strokeWidth="1" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              {/* Clean Crystalline Shockwave */}
              <circle cx="70" cy="70" r="44" stroke="#e0f2fe" strokeWidth="1.2" strokeDasharray="5 5" className="anim-shockwave-ring opacity-75" />
            </svg>
          </div>
        );
      case "kairen_winter_throne":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Center Tall Glacial Spire */}
              <polygon points="80,10 92,140 80,150 68,140" fill="rgba(224,242,254,0.3)" stroke="#e0f2fe" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_14px_rgba(56,189,248,1)]" />
              {/* Left Spire */}
              <polygon points="50,40 60,135 50,142 40,135" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" style={{ animationDelay: '0.04s' }} className="anim-impact-burst" />
              {/* Right Spire */}
              <polygon points="110,40 120,135 110,142 100,135" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" style={{ animationDelay: '0.04s' }} className="anim-impact-burst" />
              {/* Sharp Horizontal Glacial Fracture */}
              <line x1="10" y1="130" x2="150" y2="130" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="anim-ice-slash drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            </svg>
          </div>
        );
      case "kairen_ice_echo":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-28 h-28 overflow-visible anim-impact-burst" viewBox="0 0 100 100" fill="none">
              {/* Resonant Diamond Rhombus */}
              <polygon points="50,15 80,50 50,85 20,50" stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.15)" className="drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
              {/* Inner Crystal Core */}
              <polygon points="50,32 63,50 50,68 37,50" fill="#ffffff" opacity="0.9" />
              {/* Radial Acoustic Needles */}
              <line x1="50" y1="5" x2="50" y2="15" stroke="#7dd3fc" strokeWidth="1.5" />
              <line x1="50" y1="85" x2="50" y2="95" stroke="#7dd3fc" strokeWidth="1.5" />
              <line x1="5" y1="50" x2="20" y2="50" stroke="#7dd3fc" strokeWidth="1.5" />
              <line x1="80" y1="50" x2="95" y2="50" stroke="#7dd3fc" strokeWidth="1.5" />
            </svg>
          </div>
        );
      case "kairen_c6_winter_end":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-44 h-44 overflow-visible anim-impact-burst" viewBox="0 0 160 160" fill="none">
              {/* Expanding Octagonal Permafrost Prism */}
              <polygon points="80,10 125,25 150,70 135,120 80,150 25,120 10,70 35,25" stroke="#ffffff" strokeWidth="2.5" fill="rgba(224,242,254,0.25)" className="drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
              {/* Internal Crystal Fracture Web */}
              <line x1="80" y1="10" x2="80" y2="150" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="10" y1="70" x2="150" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="35" y1="25" x2="135" y2="120" stroke="#7dd3fc" strokeWidth="1.2" />
              <line x1="125" y1="25" x2="25" y2="120" stroke="#7dd3fc" strokeWidth="1.2" />
              {/* Blinding Center Diamond Core */}
              <polygon points="80,45 100,75 80,105 60,75" fill="#ffffff" className="drop-shadow-[0_0_16px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );
      case "kairen_winter_pulse":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent anim-ice-slash shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        );
      case "aveline_nature":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border-2 border-pink-400" />
            <div className="anim-impact-burst text-5xl select-none">🌸</div>
          </div>
        );
      case "aveline_azure_garden":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border-2 border-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.9)]" />
            <div className="anim-shockwave-ring absolute w-20 h-20 rounded-full border border-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.7)]" style={{ animationDelay: '0.08s' }} />
            <div className="anim-impact-burst text-6xl select-none filter drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">
              🪷
            </div>
          </div>
        );
      case "aveline_eternal_bloom":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
            <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.85)]" style={{ animationDelay: '0.08s' }} />
            <div className="anim-impact-burst text-6xl select-none filter drop-shadow-[0_0_14px_rgba(236,72,153,0.9)] flex items-center justify-center gap-1">
              <span>🌺</span>
              <span className="text-3xl text-yellow-300 -ml-3 -mt-4 animate-bounce">✨</span>
            </div>
          </div>
        );
      case "farina_snow_dust":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
            <div className="anim-impact-burst text-5xl select-none">❄️</div>
          </div>
        );
      case "farina_white_field":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border border-cyan-200 shadow-[0_0_20px_rgba(224,242,254,0.7)]" />
            <div className="anim-impact-burst text-6xl select-none">🌨️</div>
          </div>
        );
      case "volta_pulse":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border-2 border-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.8)]" />
            <div className="anim-impact-burst text-5xl select-none">⚡</div>
          </div>
        );
      case "snezhana_overcool":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border-2 border-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.7)]" />
            <div className="anim-impact-burst text-5xl select-none">❄️</div>
          </div>
        );
      case "cyrus_duel":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-32 overflow-visible" viewBox="0 0 120 120" fill="none">
              {/* Lightning-fast Piercing Rapier Thrust */}
              <line x1="10" y1="60" x2="105" y2="60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-duelist-thrust drop-shadow-[0_0_10px_rgba(239,68,68,1)]" />
              <line x1="25" y1="60" x2="100" y2="60" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" opacity="0.6" className="anim-duelist-thrust" />
              {/* Sharp Angled Counter-Slash */}
              <line x1="90" y1="25" x2="30" y2="95" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '0.04s' }} className="anim-ice-slash drop-shadow-[0_0_8px_rgba(244,63,94,1)]" />
              {/* Center Diamond Penetration Spark */}
              <polygon points="65,52 75,60 65,68 55,60" fill="#ffffff" stroke="#ef4444" strokeWidth="1" className="anim-impact-burst drop-shadow-[0_0_8px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );
      case "cyrus_execute":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-40 h-40 overflow-visible" viewBox="0 0 140 140" fill="none">
              {/* Devastating Vertical Guillotine Cleave */}
              <line x1="70" y1="5" x2="70" y2="135" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" className="anim-execution-cleave drop-shadow-[0_0_14px_rgba(220,38,38,1)]" />
              <line x1="70" y1="15" x2="70" y2="125" stroke="#b91c1c" strokeWidth="8" strokeLinecap="round" opacity="0.5" className="anim-execution-cleave" />
              
              {/* Heavy Cross-Cleave Shockwave (X-Cleave) */}
              <line x1="20" y1="25" x2="120" y2="115" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0.04s' }} className="anim-ice-slash drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
              <line x1="120" y1="25" x2="20" y2="115" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0.06s' }} className="anim-ice-slash drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
              
              {/* Horizontal Razor Shock Line */}
              <line x1="10" y1="70" x2="130" y2="70" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="anim-ice-slash drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              
              {/* Lethal Diamond Core Flare */}
              <polygon points="70,48 82,70 70,92 58,70" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );
      case "raven_shadow":
      case "raven_throw":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-32 overflow-visible" viewBox="0 0 120 120" fill="none">
              {/* Dual Phantom Shadow Daggers */}
              <line x1="15" y1="20" x2="105" y2="100" stroke="#818cf8" strokeWidth="5" strokeLinecap="round" opacity="0.4" className="anim-phantom-thrust" />
              <line x1="20" y1="25" x2="100" y2="95" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" className="anim-phantom-thrust drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
              <line x1="30" y1="35" x2="95" y2="90" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="anim-phantom-thrust" />
              
              {/* Counter-Angle Shadow Spark */}
              <line x1="95" y1="35" x2="35" y2="95" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" className="anim-ice-slash" />
              
              {/* Central Dark Electro Diamond */}
              <polygon points="60,48 70,60 60,72 50,60" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_10px_rgba(129,140,248,1)]" />
            </svg>
          </div>
        );
      case "raven_sector":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible" viewBox="0 0 130 130" fill="none">
              {/* Sweeping Blade Fan Trails */}
              <path d="M 15 80 Q 65 20 115 80" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" className="anim-shadow-fan drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
              <path d="M 25 85 Q 65 35 105 85" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" className="anim-shadow-fan" />
              
              {/* Radiating Precision Shadow Blades */}
              <line x1="65" y1="105" x2="25" y2="40" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" className="anim-phantom-thrust" />
              <line x1="65" y1="105" x2="65" y2="25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" className="anim-phantom-thrust" />
              <line x1="65" y1="105" x2="105" y2="40" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" className="anim-phantom-thrust" />
              
              {/* Sharp Target Reticle Diamond */}
              <polygon points="65,30 73,40 65,50 57,40" fill="#312e81" stroke="#c084fc" strokeWidth="1" className="anim-impact-burst" />
            </svg>
          </div>
        );
      case "raven_dance":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* High-Velocity Twin Shadow Scythe Cleave (Rotating Cyclone) */}
              <g className="anim-shadow-cyclone origin-center">
                {/* Upper Crescent Blade */}
                <path d="M 20 80 A 60 60 0 0 1 140 80" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_14px_rgba(129,140,248,0.9)]" />
                <path d="M 30 80 A 50 50 0 0 1 130 80" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                
                {/* Lower Crescent Blade */}
                <path d="M 140 80 A 60 60 0 0 1 20 80" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]" />
                <path d="M 130 80 A 50 50 0 0 1 30 80" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
                
                {/* Radial Shadow Quills (Geometric Vectors, not emojis) */}
                <line x1="80" y1="10" x2="80" y2="35" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="80" y1="150" x2="80" y2="125" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="80" x2="35" y2="80" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="80" x2="125" y2="80" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Central Geometric Phantom Core Flare */}
              <polygon points="80,55 95,80 80,105 65,80" fill="#1e1b4b" stroke="#ffffff" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_16px_rgba(192,132,252,1)]" />
              <polygon points="80,65 89,80 80,95 71,80" fill="#a855f7" opacity="0.8" className="anim-impact-burst" />
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 1. AELITA (Дендро: Шипы, Флора, Теорема Дикой Природы)   */
      /* ======================================================== */
      case "aelita_thorns":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible" viewBox="0 0 130 130" fill="none">
              {/* Spiral Sharp Thorn Vines */}
              <path d="M 20 110 Q 65 20 110 65 Q 65 110 35 45" stroke="#10b981" strokeWidth="3" strokeLinecap="round" className="anim-thorn-burst drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              <path d="M 30 115 Q 70 35 105 75" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" className="anim-thorn-burst" style={{ animationDelay: '0.04s' }} />
              
              {/* Radial Thorn Needles */}
              <polygon points="65,20 70,40 60,40" fill="#6ee7b7" className="anim-impact-burst" />
              <polygon points="110,65 90,60 90,70" fill="#6ee7b7" className="anim-impact-burst" />
              <polygon points="40,85 55,75 50,85" fill="#6ee7b7" className="anim-impact-burst" />
              
              {/* Center Emerald Crystal Sprout */}
              <polygon points="65,48 78,65 65,82 52,65" fill="#064e3b" stroke="#34d399" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_12px_rgba(52,211,153,1)]" />
              <circle cx="65" cy="65" r="4" fill="#ffffff" />
            </svg>
          </div>
        );

      case "aelita_flora_burst":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)]" />
            <div className="anim-shockwave-ring absolute w-24 h-24 rounded-full border border-green-300 shadow-[0_0_12px_rgba(74,222,128,0.8)]" style={{ animationDelay: '0.06s' }} />
            <svg className="w-40 h-40 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Expanding 8-Point Flora Mandala */}
              <polygon points="70,10 82,50 122,35 95,70 122,105 82,90 70,130 58,90 18,105 45,70 18,35 58,50" stroke="#10b981" strokeWidth="2" fill="rgba(16,185,129,0.18)" className="drop-shadow-[0_0_16px_rgba(16,185,129,1)]" />
              <circle cx="70" cy="70" r="16" fill="#022c22" stroke="#6ee7b7" strokeWidth="1.5" />
              <text x="70" y="76" textAnchor="middle" fontSize="16" fill="#34d399">🌿</text>
            </svg>
          </div>
        );

      case "aelita_wild_theorem":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border-2 border-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.8)]" style={{ animationDelay: '0.08s' }} />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Rotating Sacred Botanical Geometry */}
              <circle cx="80" cy="80" r="60" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" className="anim-bloom-rotate opacity-80" />
              <polygon points="80,15 135,115 25,115" stroke="#34d399" strokeWidth="2" fill="rgba(16,185,129,0.12)" className="anim-impact-burst drop-shadow-[0_0_16px_rgba(52,211,153,1)]" />
              <polygon points="80,145 25,45 135,45" stroke="#a7f3d0" strokeWidth="1.5" fill="rgba(110,231,183,0.08)" className="anim-impact-burst" style={{ animationDelay: '0.05s' }} />
              
              {/* Central Glowing Core Theorem */}
              <circle cx="80" cy="80" r="22" fill="#064e3b" stroke="#ffffff" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
              <text x="80" y="87" textAnchor="middle" fontSize="20" fill="#ffffff">🌱</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 2. MAESTRO (Электро: Изоляция, Укол, Финальный Аккорд)  */
      /* ======================================================== */
      case "maestro_stab":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible" viewBox="0 0 120 120" fill="none">
              {/* Lightning Rapier Piercing Ray */}
              <line x1="5" y1="60" x2="115" y2="60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-duelist-thrust drop-shadow-[0_0_12px_rgba(168,85,247,1)]" />
              <line x1="15" y1="60" x2="110" y2="60" stroke="#a855f7" strokeWidth="7" strokeLinecap="round" opacity="0.6" className="anim-duelist-thrust" />
              
              {/* Electric Tuning Fork Prongs */}
              <line x1="85" y1="40" x2="115" y2="60" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" className="anim-duelist-thrust" />
              <line x1="85" y1="80" x2="115" y2="60" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" className="anim-duelist-thrust" />
              
              {/* Electro Spark Diamond */}
              <polygon points="70,52 82,60 70,68 58,60" fill="#ffffff" stroke="#9333ea" strokeWidth="1" className="anim-impact-burst drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );

      case "maestro_isolation":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-soundwave-ring absolute w-32 h-32 rounded-full border-2 border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.9)]" />
            <div className="anim-soundwave-ring absolute w-20 h-20 rounded-full border border-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.8)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-36 h-36 overflow-visible anim-impact-burst" viewBox="0 0 120 120" fill="none">
              {/* Concentric Isolation Crosshairs & Clef Nodes */}
              <circle cx="60" cy="60" r="38" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 3" />
              <circle cx="60" cy="60" r="22" stroke="#c084fc" strokeWidth="2" fill="rgba(126,34,206,0.2)" />
              
              <line x1="60" y1="10" x2="60" y2="110" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="10" y1="60" x2="110" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
              
              {/* Center Acoustic Core */}
              <polygon points="60,46 72,60 60,74 48,60" fill="#ffffff" stroke="#7e22ce" strokeWidth="1.5" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );

      case "maestro_final_chord":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-44 h-44 rounded-full border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,1)] z-50" />
            <svg className="w-48 h-48 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Musical Harmonic Stave Wave */}
              <path d="M 10 50 Q 80 10 150 50" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" className="anim-soundwave-ring" />
              <path d="M 10 80 Q 80 40 150 80" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-soundwave-ring" style={{ animationDelay: '0.04s' }} />
              <path d="M 10 110 Q 80 70 150 110" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" className="anim-soundwave-ring" style={{ animationDelay: '0.08s' }} />
              
              {/* Grand Symphonic Treble Clef & Lightning Core */}
              <polygon points="80,20 100,80 80,140 60,80" fill="rgba(147,51,234,0.25)" stroke="#ffffff" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(192,132,252,1)]" />
              <circle cx="80" cy="80" r="18" fill="#3b0764" stroke="#facc15" strokeWidth="2" className="anim-impact-burst" />
              <text x="80" y="87" textAnchor="middle" fontSize="18" fill="#facc15">⚡</text>
            </svg>
          </div>
        );

      case "maestro_echo":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-soundwave-ring absolute w-28 h-28 rounded-full border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.7)]" />
            <div className="anim-impact-burst text-4xl select-none drop-shadow-[0_0_10px_rgba(192,132,252,1)]">
              🎵
            </div>
          </div>
        );

      /* ======================================================== */
      /* 3. INEFFA (Пиро: Отражение, Зеркало Рассвета, Взрыв)     */
      /* ======================================================== */
      case "ineffa_mirror_slash":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible" viewBox="0 0 130 130" fill="none">
              {/* Prismatic Crimson Reflection Blade */}
              <polygon points="20,20 110,110 95,115 15,35" fill="rgba(239,68,68,0.3)" stroke="#f43f5e" strokeWidth="2" className="anim-mirror-shard drop-shadow-[0_0_14px_rgba(244,63,94,1)]" />
              <line x1="15" y1="20" x2="115" y2="110" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-mirror-shard" />
              
              {/* Shattered Mirror Shards */}
              <polygon points="40,25 55,15 48,35" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1" className="anim-impact-burst" />
              <polygon points="85,95 105,90 95,108" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1" className="anim-impact-burst" style={{ animationDelay: '0.04s' }} />
              <polygon points="75,45 90,40 85,55" fill="#ffffff" stroke="#f43f5e" strokeWidth="1" className="anim-impact-burst" />
            </svg>
          </div>
        );

      case "ineffa_dawn_mirror":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.9)]" />
            <svg className="w-40 h-40 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Octagonal Solar Mirror Barrier */}
              <polygon points="70,12 110,28 128,70 110,112 70,128 30,112 12,70 30,28" stroke="#fb7185" strokeWidth="2.5" fill="rgba(225,29,72,0.18)" className="drop-shadow-[0_0_18px_rgba(244,63,94,1)]" />
              {/* Inner Diamond Reflector */}
              <polygon points="70,35 95,70 70,105 45,70" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.5" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
              <circle cx="70" cy="70" r="10" fill="#e11d48" />
              <text x="70" y="75" textAnchor="middle" fontSize="14" fill="#ffffff">🔥</text>
            </svg>
          </div>
        );

      case "ineffa_hybrid_energy":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-52 h-52 rounded-full border-4 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Supernova Pyro Flare with Refraction Beams */}
              <polygon points="80,5 98,62 155,80 98,98 80,155 62,98 5,80 62,62" fill="rgba(244,63,94,0.3)" stroke="#ffffff" strokeWidth="3" className="anim-impact-burst drop-shadow-[0_0_25px_rgba(244,63,94,1)]" />
              {/* Secondary Diagonal Diamond Star */}
              <polygon points="80,30 115,45 130,80 115,115 80,130 45,115 30,80 45,45" stroke="#f59e0b" strokeWidth="2" fill="rgba(251,191,36,0.2)" className="anim-impact-burst" style={{ animationDelay: '0.05s' }} />
              {/* Blinding Center Core */}
              <circle cx="80" cy="80" r="20" fill="#ffffff" className="drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 4. GOTKA (Пиро: Марионетки, Нити Тьмы, Разрыв Нитей)     */
      /* ======================================================== */
      case "gotka_shot":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-32 overflow-visible" viewBox="0 0 110 110" fill="none">
              {/* Shadow Marionette Needle Shot */}
              <line x1="10" y1="10" x2="100" y2="100" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" className="anim-thread-snap drop-shadow-[0_0_10px_rgba(220,38,38,1)]" />
              <line x1="25" y1="10" x2="100" y2="85" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="anim-thread-snap" />
              <polygon points="100,100 88,94 94,88" fill="#ef4444" />
            </svg>
          </div>
        );

      case "gotka_theater":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-red-600 shadow-[0_0_18px_rgba(220,38,38,0.9)]" />
            <svg className="w-44 h-44 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Marionette Crossbar */}
              <line x1="20" y1="30" x2="120" y2="30" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <line x1="70" y1="10" x2="70" y2="50" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* Hanging Strings */}
              <line x1="30" y1="30" x2="40" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="70" y1="30" x2="70" y2="95" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="110" y1="30" x2="100" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
              
              {/* Ominous Floating Puppet Mask */}
              <circle cx="70" cy="95" r="16" fill="#450a0a" stroke="#dc2626" strokeWidth="2" className="drop-shadow-[0_0_14px_rgba(220,38,38,1)]" />
              <text x="70" y="102" textAnchor="middle" fontSize="16" fill="#ffffff">🎭</text>
            </svg>
          </div>
        );

      case "gotka_thread_snap":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,1)] z-50" />
            <svg className="w-48 h-48 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Snapping X-Threads Cleave */}
              <line x1="10" y1="10" x2="150" y2="150" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" className="anim-thread-snap drop-shadow-[0_0_14px_rgba(239,68,68,1)]" />
              <line x1="150" y1="10" x2="10" y2="150" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" className="anim-thread-snap" style={{ animationDelay: '0.04s' }} />
              
              {/* Horizontal Thread Shatter */}
              <line x1="5" y1="80" x2="155" y2="80" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 4" className="anim-impact-burst" />
              
              {/* Center Shattered Puppet Spark */}
              <polygon points="80,55 95,80 80,105 65,80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_16px_rgba(239,68,68,1)]" />
              <circle cx="80" cy="80" r="6" fill="#ffffff" />
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 5. VOLOSATINYA (Гидро: Волосатый Разрез, Поляна Волос)   */
      /* ======================================================== */
      case "volosatinya_slice":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-32 h-32 overflow-visible" viewBox="0 0 120 120" fill="none">
              {/* Azure Curved Hair Wave Slash */}
              <path d="M 15 25 Q 75 15 105 95" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" className="anim-hair-wave drop-shadow-[0_0_12px_rgba(56,189,248,1)]" />
              <path d="M 25 35 Q 80 30 95 100" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="anim-hair-wave" />
            </svg>
          </div>
        );

      case "volosatinya_hair_slash":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-44 h-44 overflow-visible" viewBox="0 0 150 150" fill="none">
              {/* Signature «Волосатый Разрез» — Cascading Hydro-Hair Blades */}
              <path d="M 15 15 Q 110 30 135 135" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" className="anim-hair-wave drop-shadow-[0_0_18px_rgba(14,165,233,1)]" />
              <path d="M 20 20 Q 105 40 125 130" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-hair-wave" />
              <path d="M 135 15 Q 40 50 15 135" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" className="anim-hair-wave" style={{ animationDelay: '0.05s' }} />
              
              {/* Water Splash Foam Droplets */}
              <circle cx="85" cy="70" r="5" fill="#e0f2fe" className="anim-impact-burst" />
              <circle cx="105" cy="50" r="4" fill="#38bdf8" className="anim-impact-burst" />
              <circle cx="45" cy="95" r="4" fill="#38bdf8" className="anim-impact-burst" />
              
              {/* Center Hydro Diamond Core */}
              <polygon points="75,55 90,75 75,95 60,75" fill="#0369a1" stroke="#ffffff" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_14px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );

      case "volosatinya_hair_meadow":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-4 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border-2 border-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Grand Ocean Hair Wave Mandala */}
              <circle cx="80" cy="80" r="62" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 4" className="anim-bloom-rotate opacity-75" />
              <path d="M 20 80 Q 80 15 140 80 Q 80 145 20 80" stroke="#0284c7" strokeWidth="4" fill="rgba(14,165,233,0.18)" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(14,165,233,1)]" />
              <path d="M 80 20 Q 145 80 80 140 Q 15 80 80 20" stroke="#38bdf8" strokeWidth="3" fill="rgba(56,189,248,0.12)" className="anim-impact-burst" style={{ animationDelay: '0.04s' }} />
              
              {/* Glistening Hair Shine Core */}
              <circle cx="80" cy="80" r="20" fill="#075985" stroke="#ffffff" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_18px_rgba(255,255,255,1)]" />
              <text x="80" y="87" textAnchor="middle" fontSize="18" fill="#ffffff">🌊</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 6. FENRIS (Дендро/Физ: Стрелы Охотника, Когти Зверя)    */
      /* ======================================================== */
      case "fenris_arrow":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
            <svg className="w-44 h-44 overflow-visible" viewBox="0 0 140 140" fill="none">
              {/* Hunter Tracking Crosshair Rings */}
              <circle cx="70" cy="70" r="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 3" className="anim-bloom-rotate opacity-70" />
              <line x1="70" y1="20" x2="70" y2="35" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <line x1="70" y1="105" x2="70" y2="120" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="70" x2="35" y2="70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <line x1="105" y1="70" x2="120" y2="70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

              {/* Spiraling Verdant Wind Trails */}
              <path d="M 15 125 Q 50 85 125 15" stroke="#059669" strokeWidth="6" strokeLinecap="round" opacity="0.4" className="anim-duelist-thrust" />
              <path d="M 20 120 Q 60 75 120 20" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" className="anim-duelist-thrust drop-shadow-[0_0_14px_rgba(16,185,129,1)]" />

              {/* Central Piercing Emerald Hunter Arrow */}
              <line x1="12" y1="128" x2="124" y2="16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="anim-duelist-thrust drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <line x1="25" y1="115" x2="115" y2="25" stroke="#10b981" strokeWidth="5.5" strokeLinecap="round" className="anim-duelist-thrust" />

              {/* Diamond Hunter Arrowhead */}
              <polygon points="126,14 96,22 118,44" fill="#6ee7b7" stroke="#047857" strokeWidth="2" className="anim-duelist-thrust drop-shadow-[0_0_16px_rgba(110,231,183,1)]" />
              
              {/* Feathers & Leaf Splinters */}
              <polygon points="16,124 6,134 22,134" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
              <polygon points="28,112 18,122 34,122" fill="#34d399" />
              <circle cx="85" cy="55" r="3.5" fill="#fde047" className="anim-impact-burst drop-shadow-[0_0_6px_rgba(253,224,71,1)]" />
              <circle cx="55" cy="85" r="4" fill="#34d399" className="anim-impact-burst" />
            </svg>
          </div>
        );

      case "fenris_claw":
      case "fenris_pounce":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-44 h-44 rounded-full border-2 border-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.9)]" />
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.8)]" style={{ animationDelay: '0.06s' }} />
            <svg className="w-48 h-48 overflow-visible anim-beast-claw" viewBox="0 0 160 160" fill="none">
              {/* Savage Beast Fang Silhouette in Background */}
              <polygon points="80,20 105,75 80,60 55,75" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="1.5" />

              {/* Quadruple Razor Beast Claw Slash Gouges */}
              <path d="M 20 20 L 55 145" stroke="#7f1d1d" strokeWidth="9" strokeLinecap="round" opacity="0.6" />
              <path d="M 22 22 L 53 143" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" className="drop-shadow-[0_0_16px_rgba(239,68,68,1)]" />
              
              <path d="M 55 10 L 92 150" stroke="#9a3412" strokeWidth="11" strokeLinecap="round" opacity="0.6" />
              <path d="M 57 12 L 90 148" stroke="#f97316" strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_18px_rgba(249,115,22,1)]" />
              
              <path d="M 95 12 L 128 148" stroke="#78350f" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
              <path d="M 97 14 L 126 146" stroke="#fbbf24" strokeWidth="6.5" strokeLinecap="round" className="drop-shadow-[0_0_16px_rgba(251,191,36,1)]" />

              <path d="M 130 25 L 152 135" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_0_14px_rgba(255,255,255,1)]" />

              {/* Explosive Blood & Amber Spark Embers */}
              <circle cx="45" cy="75" r="5" fill="#ef4444" className="anim-impact-burst drop-shadow-[0_0_8px_rgba(239,68,68,1)]" />
              <circle cx="75" cy="65" r="6" fill="#fbbf24" className="anim-impact-burst drop-shadow-[0_0_10px_rgba(251,191,36,1)]" />
              <circle cx="110" cy="85" r="5.5" fill="#f97316" className="anim-impact-burst" />
              <circle cx="135" cy="70" r="4" fill="#ffffff" className="anim-impact-burst" />
            </svg>
          </div>
        );

      case "fenris_beast_guard":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-44 h-44 rounded-full border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.9)]" />
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border-2 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.8)]" style={{ animationDelay: '0.08s' }} />
            <svg className="w-48 h-48 overflow-visible anim-impact-burst" viewBox="0 0 160 160" fill="none">
              {/* Outer Ancestral Wolf Rune Ring */}
              <circle cx="80" cy="80" r="65" stroke="#10b981" strokeWidth="2.5" strokeDasharray="10 5" className="anim-bloom-rotate" />
              <circle cx="80" cy="80" r="52" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 3" />

              {/* Guardian Totem Wolf Shield */}
              <polygon points="80,18 125,50 115,115 80,140 45,115 35,50" fill="rgba(16,185,129,0.25)" stroke="#34d399" strokeWidth="3" className="drop-shadow-[0_0_20px_rgba(52,211,153,1)]" />
              <polygon points="80,30 112,56 104,106 80,126 56,106 48,56" stroke="#fbbf24" strokeWidth="2" fill="rgba(245,158,11,0.18)" />
              
              {/* Glowing Wolf Spirit Eyes */}
              <polygon points="65,65 75,70 65,75" fill="#f59e0b" className="drop-shadow-[0_0_6px_rgba(245,158,11,1)]" />
              <polygon points="95,65 85,70 95,75" fill="#f59e0b" className="drop-shadow-[0_0_6px_rgba(245,158,11,1)]" />
              <text x="80" y="98" textAnchor="middle" fontSize="30" fill="#fde047" className="drop-shadow-[0_0_12px_rgba(253,224,71,1)]">🐺</text>
            </svg>
          </div>
        );

      case "fenris_great_hunt":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-60 h-60 rounded-full border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-3 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.95)]" style={{ animationDelay: '0.06s' }} />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]" style={{ animationDelay: '0.12s' }} />
            <svg className="w-60 h-60 overflow-visible" viewBox="0 0 180 180" fill="none">
              {/* Hunter Crosshair Reticle & Star Ring */}
              <circle cx="90" cy="90" r="76" stroke="#10b981" strokeWidth="2.5" strokeDasharray="14 6" className="anim-bloom-rotate" />
              <circle cx="90" cy="90" r="58" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="8 4" className="anim-bloom-rotate" style={{ animationDirection: 'reverse' }} />
              
              {/* Hunter Target Cross Lines */}
              <line x1="90" y1="10" x2="90" y2="40" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              <line x1="90" y1="140" x2="90" y2="170" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              <line x1="10" y1="90" x2="40" y2="90" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              <line x1="140" y1="90" x2="170" y2="90" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />

              {/* Savage Cross Beast Slash Gouges */}
              <path d="M 25 30 L 75 160" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_18px_rgba(245,158,11,1)]" />
              <path d="M 90 15 L 115 165" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" className="drop-shadow-[0_0_22px_rgba(239,68,68,1)]" />
              <path d="M 155 30 L 125 155" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_16px_rgba(251,191,36,1)]" />

              {/* Raining Hunter Emerald Arrows */}
              <line x1="30" y1="10" x2="60" y2="80" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
              <line x1="150" y1="10" x2="120" y2="80" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />

              {/* Target Lock Diamond Crest */}
              <polygon points="90,48 118,90 90,132 62,90" fill="rgba(4,120,87,0.4)" stroke="#ffffff" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
              <circle cx="90" cy="90" r="12" fill="#047857" stroke="#fde047" strokeWidth="2" />
              <text x="90" y="97" textAnchor="middle" fontSize="22" fill="#ffffff">🏹</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 7. KRONA (Крио: Темпоральный Сдвиг, Часы, Застой Времени)*/
      /* ======================================================== */
      case "krona_time_thrust":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.85)]" />
            <svg className="w-48 h-48 overflow-visible" viewBox="0 0 150 150" fill="none">
              {/* Chronometric Rapier Vector Thrust Beam */}
              <line x1="5" y1="75" x2="145" y2="75" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="anim-duelist-thrust drop-shadow-[0_0_16px_rgba(255,255,255,1)]" />
              <line x1="15" y1="75" x2="135" y2="75" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" opacity="0.65" className="anim-duelist-thrust drop-shadow-[0_0_20px_rgba(56,189,248,1)]" />
              <line x1="30" y1="75" x2="125" y2="75" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" opacity="0.3" className="anim-duelist-thrust" />

              {/* Frost Chrono Gears & Dial */}
              <circle cx="105" cy="75" r="30" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="6 3" className="anim-chrono-dial" />
              <circle cx="105" cy="75" r="18" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
              
              {/* Piercing Prism Needle Tip */}
              <polygon points="148,75 125,62 132,75 125,88" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" className="anim-duelist-thrust drop-shadow-[0_0_16px_rgba(255,255,255,1)]" />

              {/* Floating Frozen Roman Numerals */}
              <text x="105" y="52" textAnchor="middle" fontSize="9" fill="#bae6fd" fontWeight="bold" fontFamily="serif">XII</text>
              <text x="130" y="78" textAnchor="middle" fontSize="9" fill="#bae6fd" fontWeight="bold" fontFamily="serif">III</text>
              <text x="105" y="102" textAnchor="middle" fontSize="9" fill="#bae6fd" fontWeight="bold" fontFamily="serif">VI</text>
              <text x="80" y="78" textAnchor="middle" fontSize="9" fill="#bae6fd" fontWeight="bold" fontFamily="serif">IX</text>
            </svg>
          </div>
        );

      case "krona_time_freeze":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-3 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,1)]" />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-sky-200 shadow-[0_0_20px_rgba(186,230,253,0.9)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible anim-impact-burst" viewBox="0 0 160 160" fill="none">
              {/* Grand Frozen Clock Face */}
              <circle cx="80" cy="80" r="62" stroke="#38bdf8" strokeWidth="3" fill="rgba(6,182,212,0.22)" className="drop-shadow-[0_0_22px_rgba(56,189,248,1)]" />
              <circle cx="80" cy="80" r="50" stroke="#e0f2fe" strokeWidth="1.5" strokeDasharray="8 4" className="anim-bloom-rotate" />
              
              {/* 12 Clock Hour Marker Needles */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 80 + Math.cos(rad) * 44;
                const y1 = 80 + Math.sin(rad) * 44;
                const x2 = 80 + Math.cos(rad) * 50;
                const y2 = 80 + Math.sin(rad) * 50;
                return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />;
              })}

              {/* Frozen Clock Hands */}
              <line x1="80" y1="80" x2="80" y2="34" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <line x1="80" y1="80" x2="116" y2="80" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(56,189,248,1)]" />
              
              {/* Center Cryo Core Diamond */}
              <circle cx="80" cy="80" r="9" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
              <polygon points="80,72 88,80 80,88 72,80" fill="#0284c7" />

              {/* Corner Ice Needle Flakes */}
              <line x1="32" y1="32" x2="48" y2="48" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
              <line x1="128" y1="128" x2="112" y2="112" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
              <line x1="128" y1="32" x2="112" y2="48" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="128" x2="48" y2="112" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case "krona_chrono_burst":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-60 h-60 rounded-full border-4 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-2 border-sky-300 shadow-[0_0_25px_rgba(125,211,252,0.9)]" style={{ animationDelay: '0.06s' }} />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border border-white shadow-[0_0_20px_rgba(255,255,255,0.95)]" style={{ animationDelay: '0.12s' }} />
            <svg className="w-60 h-60 overflow-visible" viewBox="0 0 180 180" fill="none">
              {/* Triple Concentric Rotating Celestial Chronometer Mandala */}
              <circle cx="90" cy="90" r="78" stroke="#38bdf8" strokeWidth="3" strokeDasharray="16 8" className="anim-bloom-rotate" />
              <circle cx="90" cy="90" r="62" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="10 5" className="anim-bloom-rotate" style={{ animationDirection: 'reverse' }} />
              <circle cx="90" cy="90" r="44" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" className="anim-bloom-rotate" />

              {/* 8-Pointed Celestial Chrono Star */}
              <polygon points="90,12 110,72 168,90 110,108 90,168 70,108 12,90 70,72" fill="rgba(34,211,238,0.3)" stroke="#ffffff" strokeWidth="3" className="anim-impact-burst drop-shadow-[0_0_24px_rgba(56,189,248,1)]" />
              
              {/* Diamond Hourglass Prisms */}
              <polygon points="76,45 104,45 90,75 104,105 76,105 90,75" stroke="#38bdf8" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
              <circle cx="90" cy="90" r="16" fill="#082f49" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="90" y="98" textAnchor="middle" fontSize="24" fill="#ffffff">⏳</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 8. AURUM (Гео: Золотой Блеск, Золотая Эгида, Осколки)   */
      /* ======================================================== */
      case "aurum_gold_strike":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.85)]" />
            <svg className="w-48 h-48 overflow-visible anim-slash-burst" viewBox="0 0 150 150" fill="none">
              {/* Heavy Gilded Colossus Ingot Cleave */}
              <line x1="15" y1="20" x2="135" y2="130" stroke="#78350f" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
              <line x1="18" y1="22" x2="132" y2="128" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" className="drop-shadow-[0_0_18px_rgba(245,158,11,1)]" />
              <line x1="22" y1="26" x2="128" y2="124" stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_0_12px_rgba(253,224,71,1)]" />
              <line x1="28" y1="32" x2="122" y2="118" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

              {/* Scattered Gilded Coins & Diamond Wealth Shards */}
              <circle cx="48" cy="42" r="6" fill="#fde047" stroke="#b45309" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_8px_rgba(253,224,71,1)]" />
              <circle cx="102" cy="98" r="7" fill="#fde047" stroke="#b45309" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_8px_rgba(253,224,71,1)]" />
              <polygon points="75,55 86,68 75,82 64,68" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" className="anim-impact-burst drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <polygon points="115,50 124,60 115,70 106,60" fill="#fde047" className="anim-impact-burst" />
            </svg>
          </div>
        );

      case "aurum_gold_shield":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-3 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)]" />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.9)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible anim-impact-burst" viewBox="0 0 160 160" fill="none">
              {/* Royal Imperial Golden Hexagonal Aegis */}
              <polygon points="80,14 135,38 135,110 80,146 25,110 25,38" fill="rgba(234,179,8,0.28)" stroke="#fbbf24" strokeWidth="3.5" className="drop-shadow-[0_0_24px_rgba(251,191,36,1)]" />
              <polygon points="80,28 120,48 120,100 80,126 40,100 40,48" stroke="#ffffff" strokeWidth="2" fill="rgba(245,158,11,0.2)" />
              
              {/* Orbiting Gold Ingot Crests */}
              <circle cx="80" cy="80" r="54" stroke="#fde047" strokeWidth="1.5" strokeDasharray="8 4" className="anim-bloom-rotate" />
              <circle cx="80" cy="80" r="18" fill="#78350f" stroke="#fde047" strokeWidth="2.5" />
              <text x="80" y="88" textAnchor="middle" fontSize="22" fill="#fde047" className="drop-shadow-[0_0_10px_rgba(253,224,71,1)]">🛡️</text>
            </svg>
          </div>
        );

      case "aurum_luxury_eruption":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-60 h-60 rounded-full border-4 border-yellow-500 shadow-[0_0_42px_rgba(234,179,8,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-2 border-amber-300 shadow-[0_0_28px_rgba(252,211,77,0.9)]" style={{ animationDelay: '0.06s' }} />
            <svg className="w-60 h-60 overflow-visible anim-gold-fissure" viewBox="0 0 180 180" fill="none">
              {/* Tectonic Gilded Crystal Pillars Rising */}
              <polygon points="90,10 112,160 90,172 68,160" fill="rgba(251,191,36,0.35)" stroke="#fde047" strokeWidth="3.5" className="drop-shadow-[0_0_24px_rgba(250,204,21,1)]" />
              <polygon points="48,45 64,155 48,164 32,155" fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth="2.5" />
              <polygon points="132,45 148,155 132,164 116,155" fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth="2.5" />

              {/* Brilliant Golden Coin Geyser Burst */}
              <circle cx="65" cy="85" r="7" fill="#fde047" stroke="#b45309" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(253,224,71,1)]" />
              <circle cx="115" cy="85" r="7" fill="#fde047" stroke="#b45309" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(253,224,71,1)]" />
              
              {/* Diamond Wealth Flare & Imperial Seal */}
              <polygon points="90,48 116,84 90,120 64,84" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
              <circle cx="90" cy="84" r="10" fill="#eab308" />
              <text x="90" y="91" textAnchor="middle" fontSize="16" fill="#ffffff">👑</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 9. ZEPHYR (Электро: Иллюзии, Грозовая Призма, Шторм)    */
      /* ======================================================== */
      case "zephyr_mirror_thrust":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.85)]" />
            <svg className="w-48 h-48 overflow-visible anim-duelist-thrust" viewBox="0 0 150 150" fill="none">
              {/* Electric Mirror Rapier Dash Beam */}
              <line x1="5" y1="75" x2="145" y2="75" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_16px_rgba(255,255,255,1)]" />
              <line x1="15" y1="75" x2="135" y2="75" stroke="#c084fc" strokeWidth="8" strokeLinecap="round" opacity="0.7" className="drop-shadow-[0_0_20px_rgba(192,132,252,1)]" />
              <line x1="25" y1="75" x2="125" y2="75" stroke="#9333ea" strokeWidth="12" strokeLinecap="round" opacity="0.35" />

              {/* Shattered Prismatic Holographic Mirror Shards */}
              <polygon points="55,52 75,40 68,66" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <polygon points="95,78 115,64 108,90" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <polygon points="120,62 142,75 120,88 114,75" fill="#ffffff" stroke="#9333ea" strokeWidth="1.5" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />

              {/* Micro Lightning Spark Arcs */}
              <path d="M 60 75 L 70 60 L 80 85 L 90 75" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case "zephyr_thunder_prism":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-3 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,1)]" />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-fuchsia-300 shadow-[0_0_20px_rgba(240,171,252,0.9)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible anim-impact-burst" viewBox="0 0 160 160" fill="none">
              {/* Prismatic Tetrahedral Electric Crystal Prism */}
              <polygon points="80,16 140,122 20,122" stroke="#c084fc" strokeWidth="3" fill="rgba(147,51,234,0.25)" className="drop-shadow-[0_0_22px_rgba(192,132,252,1)]" />
              <polygon points="80,16 80,122 20,122" fill="rgba(192,132,252,0.18)" />
              <polygon points="80,16 140,122 80,122" fill="rgba(147,51,234,0.3)" />

              {/* Orbiting Refraction Halo */}
              <circle cx="80" cy="80" r="58" stroke="#e879f9" strokeWidth="1.5" strokeDasharray="8 4" className="anim-bloom-rotate" />

              {/* High-Voltage Branching Lightning Bolts */}
              <path d="M 80 28 L 98 68 L 74 86 L 110 126" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
              <path d="M 80 28 L 62 68 L 86 86 L 50 126" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />

              <circle cx="80" cy="80" r="14" fill="#3b0764" stroke="#a855f7" strokeWidth="2.5" />
              <text x="80" y="87" textAnchor="middle" fontSize="16" fill="#ffffff">⚡</text>
            </svg>
          </div>
        );

      case "zephyr_mirror_cyclone":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-60 h-60 rounded-full border-4 border-purple-500 shadow-[0_0_42px_rgba(168,85,247,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-48 h-48 rounded-full border-2 border-fuchsia-400 shadow-[0_0_28px_rgba(232,121,249,0.9)]" style={{ animationDelay: '0.06s' }} />
            <svg className="w-60 h-60 overflow-visible anim-lightning-fork" viewBox="0 0 180 180" fill="none">
              {/* Dual Swirling Electric Mirror Blades */}
              <circle cx="90" cy="90" r="76" stroke="#c084fc" strokeWidth="3" strokeDasharray="16 8" className="anim-bloom-rotate" />
              <path d="M 15 90 Q 90 15 165 90 Q 90 165 15 90" stroke="#9333ea" strokeWidth="5" fill="rgba(147,51,234,0.3)" className="drop-shadow-[0_0_26px_rgba(168,85,247,1)]" />

              {/* 8-Facet Holographic Mirror Prism Cluster */}
              <polygon points="90,32 130,55 148,90 130,125 90,148 50,125 32,90 50,55" stroke="#ffffff" strokeWidth="2.5" fill="rgba(255,255,255,0.18)" className="anim-bloom-rotate" style={{ animationDirection: 'reverse' }} />
              
              {/* Multi-Angle Laser Refraction Beams */}
              <line x1="32" y1="90" x2="148" y2="90" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="90" y1="32" x2="90" y2="148" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />

              <circle cx="90" cy="90" r="20" fill="#ffffff" className="drop-shadow-[0_0_24px_rgba(255,255,255,1)]" />
              <text x="90" y="98" textAnchor="middle" fontSize="22" fill="#9333ea">🪞</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 10. RIX (Электро: Шок, Дефибриллятор, Перезагрузка)      */
      /* ======================================================== */
      case "rix_electro_jolt":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible anim-defibrillator-jolt" viewBox="0 0 120 120" fill="none">
              {/* ECG Heartbeat Lightning Wave */}
              <path d="M 10 60 L 35 60 L 45 30 L 60 90 L 75 45 L 85 60 L 110 60" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_12px_rgba(99,102,241,1)]" />
              <path d="M 15 60 L 35 60 L 45 30 L 60 90 L 75 45 L 85 60 L 105 60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case "rix_defibrillator":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-40 h-40 rounded-full border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.9)]" />
            <svg className="w-44 h-44 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Twin Defibrillator Paddles High-Voltage Discharge */}
              <circle cx="70" cy="70" r="48" stroke="#818cf8" strokeWidth="2.5" strokeDasharray="6 3" />
              <rect x="25" y="45" width="30" height="50" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
              <rect x="85" y="45" width="30" height="50" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
              {/* Resuscitation Pulse Core */}
              <polygon points="70,40 82,70 70,100 58,70" fill="#34d399" stroke="#ffffff" strokeWidth="2" className="drop-shadow-[0_0_16px_rgba(52,211,153,1)]" />
              <text x="70" y="76" textAnchor="middle" fontSize="18" fill="#ffffff">⚡</text>
            </svg>
          </div>
        );

      case "rix_reboot_wave":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-52 h-52 rounded-full border-4 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,1)] z-50" />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Full System Reboot Circular Grid & Overclock Trails */}
              <circle cx="80" cy="80" r="64" stroke="#818cf8" strokeWidth="2" strokeDasharray="8 4" className="anim-bloom-rotate" />
              <polygon points="80,20 130,50 130,110 80,140 30,110 30,50" fill="rgba(99,102,241,0.2)" stroke="#a5b4fc" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(99,102,241,1)]" />
              <text x="80" y="87" textAnchor="middle" fontSize="24" fill="#ffffff">🔋</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 11. ECHO (Гидро: Сонар, Дублирование Аур, Домен)         */
      /* ======================================================== */
      case "echo_sonar_pulse":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-sonar-wave absolute w-36 h-36 rounded-full border-2 border-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.9)]" />
            <svg className="w-36 h-36 overflow-visible anim-impact-burst" viewBox="0 0 120 120" fill="none">
              {/* Concentric Sonar Sound Ripples */}
              <circle cx="60" cy="60" r="45" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx="60" cy="60" r="30" stroke="#5eead4" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="60" cy="60" r="14" fill="#0f766e" stroke="#ffffff" strokeWidth="2" />
              <text x="60" y="66" textAnchor="middle" fontSize="14" fill="#ffffff">📡</text>
            </svg>
          </div>
        );

      case "echo_replication_splash":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-40 h-40 rounded-full border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.9)]" />
            <svg className="w-44 h-44 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Holographic Water Droplet & Twin Duplicate Reflections */}
              <circle cx="45" cy="70" r="22" stroke="#2dd4bf" strokeWidth="1.5" fill="rgba(45,212,191,0.15)" />
              <circle cx="95" cy="70" r="22" stroke="#2dd4bf" strokeWidth="1.5" fill="rgba(45,212,191,0.15)" />
              <path d="M 70 30 Q 88 65 70 85 Q 52 65 70 30 Z" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" className="drop-shadow-[0_0_16px_rgba(6,182,212,1)]" />
              <text x="70" y="115" textAnchor="middle" fontSize="18" fill="#5eead4">👥</text>
            </svg>
          </div>
        );

      case "echo_reflection_domain":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-52 h-52 rounded-full border-4 border-teal-400 shadow-[0_0_35px_rgba(45,212,191,1)] z-50" />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Grand Harmonic Sonar Domain Dome */}
              <circle cx="80" cy="80" r="66" stroke="#2dd4bf" strokeWidth="2.5" strokeDasharray="10 5" className="anim-bloom-rotate" />
              <circle cx="80" cy="80" r="45" stroke="#a5f3fc" strokeWidth="1.5" strokeDasharray="6 3" />
              <polygon points="80,25 118,55 118,105 80,135 42,105 42,55" fill="rgba(20,184,166,0.2)" stroke="#ffffff" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_18px_rgba(20,184,166,1)]" />
              <text x="80" y="87" textAnchor="middle" fontSize="22" fill="#ffffff">🌊</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 12. GAIA (Дендро: Лоза, Рост Земли, Дух Леса)           */
      /* ======================================================== */
      case "gaia_vine_lash":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-36 h-36 overflow-visible anim-vine-lash" viewBox="0 0 120 120" fill="none">
              {/* Coiling Sacred Briar Vine Whip */}
              <path d="M 15 105 Q 60 20 105 45 Q 60 95 30 35" stroke="#65a30d" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_14px_rgba(101,163,13,1)]" />
              <path d="M 20 110 Q 65 30 100 50" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
              {/* Blooming Floral Thorns */}
              <circle cx="65" cy="40" r="5" fill="#bef264" />
              <circle cx="95" cy="50" r="6" fill="#84cc16" />
            </svg>
          </div>
        );

      case "gaia_sprout_heal":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-40 h-40 rounded-full border-2 border-lime-400 shadow-[0_0_24px_rgba(163,230,53,0.9)]" />
            <svg className="w-44 h-44 overflow-visible anim-heal-float" viewBox="0 0 140 140" fill="none">
              {/* Blooming Earth Sprout & Healing Dew */}
              <circle cx="70" cy="70" r="46" stroke="#84cc16" strokeWidth="2" strokeDasharray="8 4" />
              <path d="M 70 110 L 70 50 Q 85 30 100 45 Q 75 65 70 85" stroke="#65a30d" strokeWidth="3" fill="rgba(132,204,22,0.2)" />
              <path d="M 70 80 Q 55 55 40 70 Q 65 90 70 105" stroke="#65a30d" strokeWidth="2.5" fill="rgba(132,204,22,0.2)" />
              <circle cx="70" cy="45" r="8" fill="#bef264" stroke="#ffffff" strokeWidth="1.5" className="anim-impact-burst" />
              <text x="70" y="52" textAnchor="middle" fontSize="12" fill="#365314">🌱</text>
            </svg>
          </div>
        );

      case "gaia_ancient_canopy":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-52 h-52 rounded-full border-4 border-lime-500 shadow-[0_0_35px_rgba(132,204,22,1)] z-50" />
            <svg className="w-52 h-52 overflow-visible" viewBox="0 0 160 160" fill="none">
              {/* Grand Ancient World Tree Canopy */}
              <circle cx="80" cy="80" r="64" stroke="#84cc16" strokeWidth="2.5" strokeDasharray="10 5" className="anim-bloom-rotate" />
              <path d="M 25 130 Q 80 40 135 130" stroke="#65a30d" strokeWidth="6" strokeLinecap="round" />
              <circle cx="80" cy="65" r="35" fill="rgba(101,163,13,0.25)" stroke="#bef264" strokeWidth="3" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(190,242,100,1)]" />
              <text x="80" y="74" textAnchor="middle" fontSize="28" fill="#ffffff">🌳</text>
            </svg>
          </div>
        );

      /* ======================================================== */
      /* 13. AEGIS (Гео: Удар Щитом, Непоколебимость, Бастион)    */
      /* ======================================================== */
      case "aegis_shield_slam":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <svg className="w-38 h-38 overflow-visible anim-fortress-slam" viewBox="0 0 130 130" fill="none">
              {/* Massive Granite Tower Shield Bash */}
              <rect x="35" y="20" width="60" height="90" rx="10" fill="#78350f" stroke="#d97706" strokeWidth="4" className="drop-shadow-[0_0_18px_rgba(217,119,6,1)]" />
              <line x1="35" y1="65" x2="95" y2="65" stroke="#fcd34d" strokeWidth="2.5" />
              <line x1="65" y1="20" x2="65" y2="110" stroke="#fcd34d" strokeWidth="2.5" />
              {/* Ground Impact Shocklines */}
              <line x1="15" y1="115" x2="115" y2="115" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        );

      case "aegis_fortress_wall":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-40 h-40 rounded-full border-2 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.9)]" />
            <svg className="w-44 h-44 overflow-visible anim-impact-burst" viewBox="0 0 140 140" fill="none">
              {/* Interlocking Amber Fortress Barrier Slabs */}
              <polygon points="70,15 118,40 118,100 70,125 22,100 22,40" fill="rgba(180,83,9,0.25)" stroke="#f59e0b" strokeWidth="3" className="drop-shadow-[0_0_18px_rgba(245,158,11,1)]" />
              <line x1="45" y1="40" x2="95" y2="100" stroke="#fde68a" strokeWidth="2" />
              <line x1="95" y1="40" x2="45" y2="100" stroke="#fde68a" strokeWidth="2" />
              <circle cx="70" cy="70" r="16" fill="#451a03" stroke="#fbbf24" strokeWidth="2" />
              <text x="70" y="77" textAnchor="middle" fontSize="16" fill="#fbbf24">🏰</text>
            </svg>
          </div>
        );

      case "aegis_citadel_bastion":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-52 h-52 rounded-full border-4 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-36 h-36 rounded-full border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]" style={{ animationDelay: '0.07s' }} />
            <svg className="w-52 h-52 overflow-visible anim-fortress-slam" viewBox="0 0 160 160" fill="none">
              {/* Grand Citadel Bastion Golden Core */}
              <rect x="40" y="30" width="80" height="100" rx="12" fill="rgba(120,53,15,0.3)" stroke="#fbbf24" strokeWidth="4" className="drop-shadow-[0_0_24px_rgba(251,191,36,1)]" />
              <circle cx="80" cy="80" r="26" fill="#78350f" stroke="#ffffff" strokeWidth="2.5" />
              <text x="80" y="89" textAnchor="middle" fontSize="26" fill="#ffffff">🛡️</text>
            </svg>
          </div>
        );


      /* ======================================================== */
      /* 14. VAIREN (Дендро: Семя мрака, Цветок, Сердце леса)      */
      /* ======================================================== */
      case "vairen_seed_plant":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-28 h-28 rounded-full border-2 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
            <svg className="w-32 h-32 overflow-visible anim-impact-burst" viewBox="0 0 100 100" fill="none">
              {/* Entwined Thorn Vines */}
              <circle cx="50" cy="50" r="32" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              {/* Sprouting Dark Seed Core */}
              <ellipse cx="50" cy="56" rx="14" ry="18" fill="#064e3b" stroke="#34d399" strokeWidth="2" className="drop-shadow-[0_0_12px_rgba(52,211,153,1)]" />
              <path d="M50 38 Q56 26 50 16 Q44 26 50 38 Z" fill="#6ee7b7" />
              <text x="50" y="63" textAnchor="middle" fontSize="16" fill="#a7f3d0">🌱</text>
            </svg>
          </div>
        );

      case "vairen_flower_bloom":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-44 h-44 rounded-full border-2 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.9)]" />
            <div className="anim-shockwave-ring absolute w-32 h-32 rounded-full border border-teal-300 shadow-[0_0_16px_rgba(20,184,166,0.8)]" style={{ animationDelay: '0.06s' }} />
            <svg className="w-40 h-40 overflow-visible anim-impact-burst" viewBox="0 0 120 120" fill="none">
              {/* Dark Blooming Petals */}
              <circle cx="60" cy="60" r="42" fill="rgba(6,78,59,0.4)" stroke="#10b981" strokeWidth="2" className="drop-shadow-[0_0_16px_rgba(16,185,129,1)]" />
              <polygon points="60,16 74,48 106,48 80,68 90,100 60,80 30,100 40,68 14,48 46,48" stroke="#34d399" strokeWidth="2" fill="rgba(4,120,87,0.35)" />
              <circle cx="60" cy="60" r="14" fill="#022c22" stroke="#6ee7b7" strokeWidth="2" />
              <text x="60" y="68" textAnchor="middle" fontSize="22" fill="#6ee7b7">🥀</text>
            </svg>
          </div>
        );

      case "vairen_forest_heart":
        return (
          <div className="absolute flex items-center justify-center pointer-events-none">
            <div className="anim-shockwave-ring absolute w-56 h-56 rounded-full border-4 border-emerald-400 shadow-[0_0_36px_rgba(52,211,153,1)] z-50" />
            <div className="anim-shockwave-ring absolute w-40 h-40 rounded-full border-2 border-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.9)]" style={{ animationDelay: '0.08s' }} />
            <svg className="w-48 h-48 overflow-visible anim-impact-burst" viewBox="0 0 150 150" fill="none">
              {/* Primordial Forest Heart Mandala */}
              <circle cx="75" cy="75" r="54" fill="rgba(6,78,59,0.5)" stroke="#10b981" strokeWidth="3" className="drop-shadow-[0_0_24px_rgba(16,185,129,1)]" />
              <polygon points="75,22 118,50 118,100 75,128 32,100 32,50" stroke="#34d399" strokeWidth="2.5" fill="rgba(16,185,129,0.2)" />
              <line x1="75" y1="22" x2="75" y2="128" stroke="#6ee7b7" strokeWidth="2" />
              <line x1="32" y1="50" x2="118" y2="100" stroke="#6ee7b7" strokeWidth="1.5" />
              <line x1="118" y1="50" x2="32" y2="100" stroke="#6ee7b7" strokeWidth="1.5" />
              <circle cx="75" cy="75" r="20" fill="#064e3b" stroke="#a7f3d0" strokeWidth="2.5" />
              <text x="75" y="84" textAnchor="middle" fontSize="26" fill="#a7f3d0">🌿</text>
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-40 overflow-visible">
        {visualEffects.map((ve) => (
          <React.Fragment key={ve.id}>
            {renderEffectGraphic(ve.type)}
          </React.Fragment>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className={cn("anim-float-damage absolute font-black whitespace-nowrap select-none", ft.color)} 
            style={{ textShadow: "0 2px 4px rgba(0,0,0,1)" }}
          >
            {ft.text}
          </div>
        ))}
      </div>
    </>
  );
}));
