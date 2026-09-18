import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ArenaOverlaysProps {
  circuitTurns: number;
  isPermafrostActive: boolean;
  isGardenActive?: boolean;
  flowerTurns: number;
  gardenTurns: number;
  elementalFlowers?: number;
  isWinterActive: boolean;
  winterTurns: number;
  kairenShards?: number;
  kairenMaxShards?: number;
  isDuelActive: boolean;
  hasRavenActive?: boolean;
  cleanTargetCount?: number;
}

export const BattleArenaOverlays: React.FC<ArenaOverlaysProps> = React.memo(({
  circuitTurns,
  isPermafrostActive,
  flowerTurns,
  gardenTurns,
  elementalFlowers = 0,
  isWinterActive,
  winterTurns,
  kairenShards = 0,
  kairenMaxShards = 5,
  isDuelActive,
  hasRavenActive = false,
  cleanTargetCount = 0,
}) => {
  const isCircuitActive = circuitTurns > 0;
  const isAzureGardenActive = gardenTurns > 0;
  const isEternalBloomActive = flowerTurns > 0;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      {/* 1. Volta Bioelectric Circuit Arena Overlay */}
      <AnimatePresence>
        {isCircuitActive && (
          <motion.div
            key="volta-circuit-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Soft violet electric ambient floor glow */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-violet-900/20 via-violet-500/8 to-transparent" />
            
            {/* Ground electric circuit pulse line (GPU CSS) */}
            <div className="absolute bottom-6 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_8px_rgba(167,139,250,0.7)] anim-subtle-pulse" />

            {/* Circuit Status Banner */}
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#120824]/90 border border-violet-400/50 shadow-md text-[9px] sm:text-[10px] font-black text-violet-200 uppercase whitespace-nowrap"
            >
              <span className="text-yellow-300">⚡</span>
              <span>ПРОВОДЯЩИЙ КОНТУР</span>
              <span className="px-1 py-0.2 rounded-full bg-violet-900/60 text-yellow-300 text-[8px]">
                {circuitTurns} х
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Snezhana Eternal Permafrost Arena Overlay */}
      <AnimatePresence>
        {isPermafrostActive && (
          <motion.div
            key="snezhana-permafrost-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Cold Cyan Glacial Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-950/25 via-cyan-500/8 to-transparent" />
            
            {/* Vignette Frost Edges */}
            <div className="absolute inset-0 border border-cyan-400/25 rounded-2xl sm:rounded-3xl shadow-[inset_0_0_24px_rgba(34,211,238,0.12)]" />

            {/* Status Banner */}
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#031520]/90 border border-cyan-400/60 shadow-md text-[9px] sm:text-[10px] font-black text-cyan-200 uppercase whitespace-nowrap"
            >
              <span>🥶</span>
              <span>ВЕЧНАЯ МЕРЗЛОТА</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Aveline Azure Garden Arena Overlay (Serene Hydro Water Lake Sanctuary) */}
      <AnimatePresence>
        {isAzureGardenActive && (
          <motion.div
            key="aveline-azure-garden-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            {/* Serene Hydro Water Floor Surface & Blue Ambient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sky-950/40 via-cyan-950/20 via-sky-500/10 to-transparent pointer-events-none" />

            {/* Glowing Water Horizon Line */}
            <div className="absolute bottom-10 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.7)] anim-subtle-pulse pointer-events-none" />

            {/* Concentric Expanding Water Ripples on Lake Floor */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-20 sm:h-24 border border-sky-400/30 rounded-[100%] anim-water-ripple pointer-events-none" />
            <div 
              style={{ animationDelay: '1.6s' }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-14 sm:h-16 border border-cyan-300/25 rounded-[100%] anim-water-ripple pointer-events-none" 
            />

            {/* Aquamarine Water Vignette Edges */}
            <div className="absolute inset-0 border border-sky-400/25 rounded-2xl sm:rounded-3xl shadow-[inset_0_0_28px_rgba(14,165,233,0.18)] pointer-events-none" />

            {/* Water Lilies and Aquatic Motifs */}
            <div style={{ left: '16%', bottom: '26px' }} className="absolute text-sm text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] anim-mist-drift select-none">
              🪷
            </div>
            <div style={{ right: '18%', bottom: '22px', animationDelay: '3.5s' }} className="absolute text-sm text-cyan-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] anim-mist-drift select-none">
              🪷
            </div>
            <div style={{ left: '42%', bottom: '18px' }} className="absolute text-xs text-sky-300 drop-shadow-[0_0_4px_rgba(56,189,248,0.6)] anim-float-particle select-none">
              💧
            </div>
            <div style={{ right: '40%', bottom: '14px', animationDelay: '1.4s' }} className="absolute text-xs text-cyan-300 drop-shadow-[0_0_4px_rgba(103,232,249,0.6)] anim-float-particle select-none">
              🫧
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Aveline Eternal Bloom Arena Overlay (Radiant Celestial Floral Aurora) */}
      <AnimatePresence>
        {isEternalBloomActive && (
          <motion.div
            key="aveline-eternal-bloom-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            {/* Radiant Magenta & Violet Cosmic Flora Floor Aurora */}
            <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-fuchsia-950/45 via-purple-950/25 via-pink-900/10 to-transparent pointer-events-none" />

            {/* Sacred Rotating Celestial Floral Mandala on Floor */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-80 sm:w-[460px] h-36 sm:h-48 border-2 border-dashed border-fuchsia-400/35 rounded-[100%] anim-bloom-rotate pointer-events-none shadow-[0_0_30px_rgba(217,70,239,0.25)]" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 bg-gradient-to-r from-fuchsia-500/15 via-pink-400/25 to-fuchsia-500/15 blur-md rounded-[100%] anim-subtle-pulse pointer-events-none" />

            {/* Sacred Blooming Vine & Gold-Rose Border */}
            <div className="absolute inset-0 border border-fuchsia-400/35 rounded-2xl sm:rounded-3xl shadow-[inset_0_0_35px_rgba(236,72,153,0.22)] pointer-events-none" />
            <div className="absolute top-2.5 left-3 text-xs text-fuchsia-300/80 drop-shadow-[0_0_6px_rgba(217,70,239,0.8)] select-none">
              🌸
            </div>
            <div className="absolute top-2.5 right-3 text-xs text-fuchsia-300/80 drop-shadow-[0_0_6px_rgba(217,70,239,0.8)] select-none">
              🌸
            </div>

            {/* Swirling Celestial Blossoms & Golden Pollen Stardust */}
            <div style={{ left: '12%', bottom: '38px' }} className="absolute text-sm text-pink-300 drop-shadow-[0_0_6px_rgba(244,114,182,0.9)] anim-float-particle select-none">
              🌺
            </div>
            <div style={{ left: '28%', bottom: '24px' }} className="absolute text-xs text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] anim-sparkle-twinkle select-none">
              ✨
            </div>
            <div style={{ left: '50%', bottom: '34px', animationDelay: '1.2s' }} className="absolute text-xs text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.8)] anim-float-particle select-none">
              🌸
            </div>
            <div style={{ right: '26%', bottom: '26px', animationDelay: '1.8s' }} className="absolute text-xs text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] anim-sparkle-twinkle select-none">
              🏵️
            </div>
            <div style={{ right: '12%', bottom: '32px', animationDelay: '2.4s' }} className="absolute text-sm text-pink-200 drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] anim-float-particle select-none">
              🌺
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Kairen Winter Throne Arena Overlay (Silent Glacial Mirror) */}
      <AnimatePresence>
        {isWinterActive && (
          <motion.div
            key="kairen-winter-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Subtle Glacial Permafrost Floor Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-cyan-950/25 via-sky-950/10 to-transparent" />

            {/* Crisp Arctic Horizon Line */}
            <div className="absolute bottom-10 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.4)]" />

            {/* Elegant Minimalist Geometric Frost Fractures on Floor (SVG) */}
            <svg 
              className="absolute bottom-0 left-0 w-full h-28 opacity-40 overflow-visible" 
              viewBox="0 0 800 120" 
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Central Ice Mirror Fractures */}
              <line x1="400" y1="120" x2="400" y2="40" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="400" y1="75" x2="330" y2="25" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.35" />
              <line x1="400" y1="75" x2="470" y2="25" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.35" />
              <line x1="330" y1="25" x2="280" y2="15" stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.25" />
              <line x1="470" y1="25" x2="520" y2="15" stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.25" />
              <line x1="400" y1="100" x2="240" y2="60" stroke="#38bdf8" strokeWidth="0.7" strokeOpacity="0.3" />
              <line x1="400" y1="100" x2="560" y2="60" stroke="#38bdf8" strokeWidth="0.7" strokeOpacity="0.3" />
              
              {/* Subtle Floor Ambient Glow */}
              <circle cx="400" cy="75" r="50" fill="url(#glacial-glow)" opacity="0.15" />
              <defs>
                <radialGradient id="glacial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            {/* Clean Cold Vignette Edge (Subtle 1px border, no emojis or heavy shadows) */}
            <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 shadow-[inset_0_0_24px_rgba(34,211,238,0.12)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Cyrus Dueling Piste Arena Overlay (Duelist's Focus) */}
      <AnimatePresence>
        {isDuelActive && (
          <motion.div
            key="cyrus-duel-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Ambient Crimson Floor Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rose-950/25 via-red-950/8 to-transparent" />

            {/* Sharp Dueling Axis Line */}
            <div className="absolute bottom-8 left-16 right-16 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent shadow-[0_0_8px_rgba(244,63,94,0.25)]" />

            {/* Tactical Dueling Ground Focus (SVG) */}
            <svg
              className="absolute bottom-0 left-0 w-full h-24 opacity-35 overflow-visible"
              viewBox="0 0 800 100"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Perspective Fencing Piste Guidelines */}
              <line x1="200" y1="95" x2="350" y2="25" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="6 4" />
              <line x1="600" y1="95" x2="450" y2="25" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="6 4" />
              {/* Center Challenge Crosshairs */}
              <line x1="400" y1="15" x2="400" y2="35" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
              <line x1="385" y1="25" x2="415" y2="25" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
            </svg>

            {/* Subtle Vignette Red Tint */}
            <div className="absolute inset-0 rounded-2xl border border-rose-500/15 shadow-[inset_0_0_24px_rgba(244,63,94,0.08)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status Banners Container (Aveline + Kairen + Cyrus side-by-side gracefully) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 pointer-events-none max-w-full px-2">
        {/* Aveline Azure Garden */}
        <AnimatePresence>
          {isAzureGardenActive && (
            <motion.div
              key="badge-azure-garden"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#031524]/95 border border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.35)] text-[9px] sm:text-[10px] font-black text-sky-200 uppercase whitespace-nowrap"
            >
              <span>🪷</span>
              <span>ЛАЗУРНЫЙ САД</span>
              <span className="px-1 py-0.2 rounded-full bg-sky-950/90 text-cyan-300 text-[8px] border border-sky-500/30">
                {gardenTurns} х
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aveline Eternal Bloom */}
        <AnimatePresence>
          {isEternalBloomActive && (
            <motion.div
              key="badge-eternal-bloom"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e0626]/95 border border-fuchsia-400/80 shadow-[0_0_14px_rgba(217,70,239,0.45)] text-[9px] sm:text-[10px] font-black text-fuchsia-100 uppercase whitespace-nowrap"
            >
              <span>🌺</span>
              <span>ВЕЧНОЕ ЦВЕТЕНИЕ</span>
              <span className="px-1 py-0.2 rounded-full bg-fuchsia-950/90 text-fuchsia-200 text-[8px] border border-fuchsia-500/30">
                {flowerTurns} х
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-pink-950/90 text-amber-300 text-[8px] font-mono border border-amber-500/30 flex items-center gap-1">
                <span>Цветы:</span>
                <span className="font-bold text-amber-200">{elementalFlowers}/5</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kairen Winter Throne */}
        <AnimatePresence>
          {isWinterActive && (
            <motion.div
              key="badge-winter-throne"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#021422]/90 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)] text-[9px] sm:text-[10px] font-bold text-cyan-200 tracking-wider uppercase whitespace-nowrap"
            >
              <span className="text-[10px]">❄️</span>
              <span>Вечная зима</span>
              <span className="text-cyan-400/70 font-mono text-[8px]">({winterTurns}х)</span>
              <span className="text-cyan-500/50">·</span>
              <span className="font-mono text-[8px] text-cyan-300">
                Осколки: {kairenShards}/{kairenMaxShards}
              </span>
              {kairenShards >= kairenMaxShards && (
                <span className="px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-200 text-[8px] font-bold border border-cyan-400/40 animate-pulse">
                  ЭХО
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cyrus Duel */}
        <AnimatePresence>
          {isDuelActive && (
            <motion.div
              key="badge-cyrus-duel"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#180307]/90 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)] text-[9px] sm:text-[10px] font-bold text-rose-200 tracking-wider uppercase whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Дуэль</span>
              <span className="text-rose-400/70 font-mono text-[8px]">· Вызов цели</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Raven Phantom Target Hunt */}
        <AnimatePresence>
          {hasRavenActive && cleanTargetCount > 0 && (
            <motion.div
              key="badge-raven-hunt"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0d0a1f]/90 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)] text-[9px] sm:text-[10px] font-bold text-indigo-200 tracking-wider uppercase whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Фантом</span>
              <span className="text-indigo-400/70 font-mono text-[8px]">· Чистых целей: {cleanTargetCount}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
