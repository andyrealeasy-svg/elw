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
  // Nereus
  nereusGardenTurns?: number;
  nereusFlowersCount?: number;
  // Iva
  ivaFloralBondTurns?: number;
  ivaBloomTurns?: number;
  // Kern
  kernOverloadTurns?: number;
  kernQBonusTurns?: number;
  kernCritOverloadActive?: boolean;
  kernCritOverloadTurns?: number;
  // Aelita
  aelitaTheoremActive?: boolean;
  aelitaThornsEnemyCount?: number;
  // Maestro
  maestroIsolationActive?: boolean;
  // Ineffa
  ineffaReflectedActive?: boolean;
  ineffaFragmentsCount?: number;
  // Gotka
  gotkaPuppetsCount?: number;
  // Volosatinya
  volosatinyaMeadowActive?: boolean;
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
  nereusGardenTurns = 0,
  nereusFlowersCount = 0,
  ivaFloralBondTurns = 0,
  ivaBloomTurns = 0,
  kernOverloadTurns = 0,
  kernQBonusTurns = 0,
  kernCritOverloadActive = false,
  kernCritOverloadTurns = 0,
  aelitaTheoremActive = false,
  aelitaThornsEnemyCount = 0,
  maestroIsolationActive = false,
  ineffaReflectedActive = false,
  ineffaFragmentsCount = 0,
  gotkaPuppetsCount = 0,
  volosatinyaMeadowActive = false,
}) => {
  const isCircuitActive = circuitTurns > 0;
  const isAzureGardenActive = gardenTurns > 0;
  const isEternalBloomActive = flowerTurns > 0;
  const isNereusGardenActive = nereusGardenTurns > 0;
  const isIvaFloraActive = ivaFloralBondTurns > 0 || ivaBloomTurns > 0;
  const isKernOverloadActive = kernOverloadTurns > 0 || kernCritOverloadActive;

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

      {/* 7. Nereus Abyssal Sea Garden Arena Overlay (Deep Ocean Sanctuary) */}
      <AnimatePresence>
        {isNereusGardenActive && (
          <motion.div
            key="nereus-garden-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Deep Sea Light Blue Floor Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sky-950/45 via-blue-950/25 via-sky-500/10 to-transparent" />

            {/* Ocean Current Shimmer Line */}
            <div className="absolute bottom-8 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/80 to-transparent shadow-[0_0_14px_rgba(56,189,248,0.7)] anim-subtle-pulse" />

            {/* Undersea Coral Mandala & Ripple SVG */}
            <svg
              className="absolute bottom-0 left-0 w-full h-32 opacity-45 overflow-visible"
              viewBox="0 0 800 130"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Concentric Light Blue Wave Curves */}
              <path d="M 100,120 Q 250,60 400,110 T 700,70" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" fill="none" />
              <path d="M 50,90 Q 200,40 400,85 T 750,50" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 4" fill="none" />
              {/* Sea flower coral motifs */}
              <circle cx="400" cy="70" r="28" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.5" />
              <circle cx="400" cy="70" r="14" fill="#0284c7" fillOpacity="0.25" />
            </svg>

            {/* Floating Deep-Sea Motifs */}
            <div style={{ left: '15%', bottom: '28px' }} className="absolute text-sm text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] anim-mist-drift select-none">
              🪸
            </div>
            <div style={{ right: '16%', bottom: '26px', animationDelay: '2.5s' }} className="absolute text-sm text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.9)] anim-mist-drift select-none">
              🪸
            </div>
            <div style={{ left: '48%', bottom: '22px' }} className="absolute text-xs text-blue-200 drop-shadow-[0_0_6px_rgba(186,230,253,0.8)] anim-float-particle select-none">
              🫧
            </div>

            {/* Light Blue Abyssal Vignette Border */}
            <div className="absolute inset-0 rounded-2xl border border-sky-400/30 shadow-[inset_0_0_30px_rgba(56,189,248,0.2)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Iva Flora Bond & Verdant Botanical Arena Overlay */}
      <AnimatePresence>
        {isIvaFloraActive && (
          <motion.div
            key="iva-flora-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Lush Emerald Botanical Floor Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-38 bg-gradient-to-t from-emerald-950/40 via-green-950/15 via-emerald-600/8 to-transparent" />

            {/* Botanical Vine Horizon Line */}
            <div className="absolute bottom-8 left-12 right-12 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.5)] anim-subtle-pulse" />

            {/* Botanical Root & Sprout SVG Lines */}
            <svg
              className="absolute bottom-0 left-0 w-full h-28 opacity-35 overflow-visible"
              viewBox="0 0 800 110"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M 120,105 Q 260,45 400,90 T 680,60" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" fill="none" />
              <path d="M 200,95 Q 350,30 500,80 T 780,45" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="5 3" fill="none" />
              <circle cx="400" cy="65" r="22" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.3" />
            </svg>

            {/* Floating Leaves & Botanical Spores */}
            <div style={{ left: '18%', bottom: '26px' }} className="absolute text-sm text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] anim-float-particle select-none">
              🌿
            </div>
            <div style={{ right: '20%', bottom: '24px', animationDelay: '1.8s' }} className="absolute text-sm text-green-300 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)] anim-float-particle select-none">
              🌸
            </div>
            <div style={{ left: '46%', bottom: '18px', animationDelay: '1.1s' }} className="absolute text-xs text-emerald-200 drop-shadow-[0_0_4px_rgba(110,231,183,0.6)] anim-sparkle-twinkle select-none">
              🍃
            </div>

            {/* Emerald Vignette */}
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/25 shadow-[inset_0_0_24px_rgba(16,185,129,0.15)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Kern Tectonic Core Overload Arena Overlay */}
      <AnimatePresence>
        {isKernOverloadActive && (
          <motion.div
            key="kern-tectonic-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Molten Magma Amber Floor Gradient */}
            <div className={`absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t ${
              kernCritOverloadActive 
                ? 'from-rose-950/50 via-amber-950/30 via-orange-600/15 to-transparent' 
                : 'from-amber-950/40 via-orange-950/20 via-amber-600/10 to-transparent'
            }`} />

            {/* Glowing Magma Fracture Horizon */}
            <div className={`absolute bottom-8 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent ${
              kernCritOverloadActive ? 'via-rose-500' : 'via-amber-400/70'
            } to-transparent shadow-[0_0_12px_rgba(245,158,11,0.6)] anim-subtle-pulse`} />

            {/* Tectonic Fissure Ground Fractures (SVG) */}
            <svg
              className="absolute bottom-0 left-0 w-full h-32 opacity-45 overflow-visible"
              viewBox="0 0 800 130"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Central Core Rupture Lines */}
              <line x1="400" y1="130" x2="400" y2="45" stroke={kernCritOverloadActive ? "#f43f5e" : "#f59e0b"} strokeWidth="1.2" strokeOpacity="0.6" />
              <line x1="400" y1="85" x2="310" y2="30" stroke="#d97706" strokeWidth="1" strokeOpacity="0.5" />
              <line x1="400" y1="85" x2="490" y2="30" stroke="#d97706" strokeWidth="1" strokeOpacity="0.5" />
              <line x1="310" y1="30" x2="230" y2="15" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4" />
              <line x1="490" y1="30" x2="570" y2="15" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4" />
              <line x1="400" y1="110" x2="200" y2="70" stroke="#f97316" strokeWidth="0.9" strokeOpacity="0.4" />
              <line x1="400" y1="110" x2="600" y2="70" stroke="#f97316" strokeWidth="0.9" strokeOpacity="0.4" />

              {/* Core Rupture Circle */}
              <circle cx="400" cy="75" r="35" stroke={kernCritOverloadActive ? "#ef4444" : "#f59e0b"} strokeWidth="1" strokeDasharray="6 3" strokeOpacity="0.4" />
            </svg>

            {/* Floating Magma Embers */}
            <div style={{ left: '16%', bottom: '30px' }} className="absolute text-sm text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] anim-float-particle select-none">
              🌋
            </div>
            <div style={{ right: '18%', bottom: '28px', animationDelay: '1.5s' }} className="absolute text-sm text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.9)] anim-float-particle select-none">
              💥
            </div>
            <div style={{ left: '50%', bottom: '22px', animationDelay: '0.8s' }} className="absolute text-xs text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)] anim-sparkle-twinkle select-none">
              ⚡
            </div>

            {/* Amber Magma Vignette */}
            <div className={`absolute inset-0 rounded-2xl border ${
              kernCritOverloadActive 
                ? 'border-rose-500/35 shadow-[inset_0_0_30px_rgba(239,68,68,0.2)]' 
                : 'border-amber-500/25 shadow-[inset_0_0_24px_rgba(245,158,11,0.15)]'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Aelita Botanical Wild Theorem Arena Overlay */}
      <AnimatePresence>
        {aelitaTheoremActive && (
          <motion.div
            key="aelita-theorem-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Emerald Botanical Foliage Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/30 via-emerald-600/10 to-transparent" />
            
            {/* Botanical Rune Ground Ring */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full border border-emerald-400/40 shadow-[0_0_16px_rgba(16,185,129,0.3)] bg-emerald-500/[0.05] anim-subtle-pulse" />
            
            {/* Sprouting Emerald Leaves */}
            <div style={{ left: '20%', bottom: '25px' }} className="absolute text-sm text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] anim-float-particle select-none">
              🌿
            </div>
            <div style={{ right: '22%', bottom: '30px', animationDelay: '1.2s' }} className="absolute text-sm text-green-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.9)] anim-float-particle select-none">
              🌱
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. Maestro Isolation Acoustic Symphony Arena Overlay */}
      <AnimatePresence>
        {maestroIsolationActive && (
          <motion.div
            key="maestro-isolation-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Violet Electric Soundwave Floor Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-purple-950/25 via-purple-600/8 to-transparent" />
            
            {/* Harmonic Stave Line */}
            <div className="absolute bottom-7 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.7)] anim-subtle-pulse" />
            
            {/* Floating Music & Targeting Sparkles */}
            <div style={{ left: '15%', bottom: '28px' }} className="absolute text-xs text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.9)] anim-float-particle select-none">
              🎵
            </div>
            <div style={{ right: '15%', bottom: '28px', animationDelay: '1s' }} className="absolute text-xs text-violet-300 drop-shadow-[0_0_6px_rgba(196,181,253,0.9)] anim-float-particle select-none">
              ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 11. Ineffa Prismatic Solar Mirror Arena Overlay */}
      <AnimatePresence>
        {ineffaReflectedActive && (
          <motion.div
            key="ineffa-mirror-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Ruby Crimson Flame Reflection Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rose-950/30 via-rose-600/10 to-transparent" />
            
            {/* Crimson Vignette Border */}
            <div className="absolute inset-0 border border-rose-500/25 rounded-2xl shadow-[inset_0_0_24px_rgba(244,63,94,0.15)]" />
            
            {/* Solar Mirror Refraction Rays */}
            <div style={{ left: '25%', bottom: '24px' }} className="absolute text-xs text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.9)] anim-float-particle select-none">
              🪞
            </div>
            <div style={{ right: '25%', bottom: '26px', animationDelay: '0.8s' }} className="absolute text-xs text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] anim-sparkle-twinkle select-none">
              🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. Gotka Shadow Marionette Theater Arena Overlay */}
      <AnimatePresence>
        {gotkaPuppetsCount > 0 && (
          <motion.div
            key="gotka-theater-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Ominous Top Shadow & Hanging Strings */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-red-950/35 via-red-900/10 to-transparent" />
            
            {/* Suspended Marionette Strings from Ceiling */}
            <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none">
              <line x1="20%" y1="0" x2="25%" y2="80%" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50%" y1="0" x2="50%" y2="75%" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="80%" y1="0" x2="75%" y2="80%" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
            
            <div style={{ left: '12%', top: '35px' }} className="absolute text-xs text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] anim-float-particle select-none">
              🎭
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 13. Volosatinya Ocean Hair Meadow Arena Overlay */}
      <AnimatePresence>
        {volosatinyaMeadowActive && (
          <motion.div
            key="volosatinya-meadow-arena"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Azure Hydro Hair Tide Floor Mist */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sky-950/30 via-sky-500/10 to-transparent" />
            
            {/* Flowing Water Crest Line */}
            <div className="absolute bottom-5 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.7)] anim-subtle-pulse" />
            
            <div style={{ left: '22%', bottom: '25px' }} className="absolute text-sm text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] anim-float-particle select-none">
              🌊
            </div>
            <div style={{ right: '20%', bottom: '25px', animationDelay: '1.4s' }} className="absolute text-xs text-cyan-200 drop-shadow-[0_0_6px_rgba(103,232,249,0.9)] anim-float-particle select-none">
              💇‍♂️
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status Banners Container (Aveline + Kairen + Cyrus + Nereus + Iva + Kern + Aelita + Maestro + Ineffa + Gotka + Volosatinya) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 pointer-events-none max-w-full px-2">
        {/* Nereus Sea Garden */}
        <AnimatePresence>
          {isNereusGardenActive && (
            <motion.div
              key="badge-nereus-garden"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#031524]/95 border border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.4)] text-[9px] sm:text-[10px] font-black text-sky-200 uppercase whitespace-nowrap"
            >
              <span>🪸</span>
              <span>САД ВЕЧНОГО МОРЯ</span>
              <span className="px-1 py-0.2 rounded-full bg-sky-950/90 text-sky-300 text-[8px] border border-sky-500/40">
                {nereusGardenTurns} х
              </span>
              {nereusFlowersCount > 0 && (
                <span className="px-1 py-0.2 rounded-full bg-blue-950/90 text-sky-200 text-[8px] border border-blue-500/40">
                  Цветы: {nereusFlowersCount}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iva Floral Bond */}
        <AnimatePresence>
          {ivaFloralBondTurns > 0 && (
            <motion.div
              key="badge-iva-flora"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#041a10]/95 border border-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.35)] text-[9px] sm:text-[10px] font-black text-emerald-200 uppercase whitespace-nowrap"
            >
              <span>🌿</span>
              <span>СВЯЗЬ С ФЛОРОЙ</span>
              <span className="px-1 py-0.2 rounded-full bg-emerald-950/90 text-emerald-300 text-[8px] border border-emerald-500/30">
                {ivaFloralBondTurns} х
              </span>
              <span className="text-[8px] text-emerald-400/80 font-mono">-20% RES</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iva Bloom */}
        <AnimatePresence>
          {ivaBloomTurns > 0 && (
            <motion.div
              key="badge-iva-bloom"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a1f0a]/95 border border-green-400/70 shadow-[0_0_10px_rgba(34,197,94,0.3)] text-[9px] sm:text-[10px] font-black text-green-200 uppercase whitespace-nowrap"
            >
              <span>🌸</span>
              <span>ЦВЕТЕНИЕ</span>
              <span className="px-1 py-0.2 rounded-full bg-green-950/90 text-green-300 text-[8px] border border-green-500/30">
                {ivaBloomTurns} х
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kern Overload */}
        <AnimatePresence>
          {isKernOverloadActive && (
            <motion.div
              key="badge-kern-overload"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                kernCritOverloadActive 
                  ? 'bg-[#200808]/95 border border-rose-400/80 shadow-[0_0_14px_rgba(244,63,94,0.5)] text-rose-100 animate-pulse' 
                  : 'bg-[#1e1003]/95 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.35)] text-amber-200'
              } text-[9px] sm:text-[10px] font-black uppercase whitespace-nowrap`}
            >
              <span>{kernCritOverloadActive ? '🌋' : '⚡'}</span>
              <span>{kernCritOverloadActive ? 'КРИТ. ПЕРЕНАПРЯЖЕНИЕ (C6)' : 'ПЕРЕНАПРЯЖЕНИЕ'}</span>
              <span className={`px-1 py-0.2 rounded-full text-[8px] border ${
                kernCritOverloadActive 
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/30' 
                  : 'bg-amber-950/90 text-amber-300 border-amber-500/30'
              }`}>
                {kernCritOverloadActive ? `${kernCritOverloadTurns}х` : `${kernOverloadTurns}х`}
              </span>
              <span className="text-[8px] text-amber-300 font-mono">
                {kernCritOverloadActive ? '+30% АТК / AoE' : (kernQBonusTurns > 0 ? '+25% АТК' : '+10% АТК')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Aelita Wild Theorem / Thorns */}
        <AnimatePresence>
          {(aelitaTheoremActive || aelitaThornsEnemyCount > 0) && (
            <motion.div
              key="badge-aelita-theorem"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#021f12]/95 border border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.4)] text-[9px] sm:text-[10px] font-black text-emerald-100 uppercase whitespace-nowrap"
            >
              <span>🌿</span>
              <span>ДИКАЯ ПРИРОДА</span>
              {aelitaThornsEnemyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/90 text-emerald-300 text-[8px] border border-emerald-500/40">
                  Шипы целей: {aelitaThornsEnemyCount}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Maestro Isolation Focus */}
        <AnimatePresence>
          {maestroIsolationActive && (
            <motion.div
              key="badge-maestro-isolation"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e072b]/95 border border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.45)] text-[9px] sm:text-[10px] font-black text-purple-100 uppercase whitespace-nowrap"
            >
              <span className="text-yellow-300">🎵</span>
              <span>ФОКУС ВНИМАНИЯ</span>
              <span className="text-[8px] text-purple-300 font-mono">+40% Урон соло</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ineffa Solar Mirror */}
        <AnimatePresence>
          {(ineffaReflectedActive || ineffaFragmentsCount > 0) && (
            <motion.div
              key="badge-ineffa-mirror"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/95 border border-rose-400/80 shadow-[0_0_14px_rgba(244,63,94,0.45)] text-[9px] sm:text-[10px] font-black text-rose-100 uppercase whitespace-nowrap"
            >
              <span>🪞</span>
              <span>ОТРАЖЕНИЕ</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950/90 text-amber-300 text-[8px] border border-rose-500/40 font-mono">
                Фрагменты: {ineffaFragmentsCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gotka Puppets */}
        <AnimatePresence>
          {gotkaPuppetsCount > 0 && (
            <motion.div
              key="badge-gotka-puppets"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#200505]/95 border border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)] text-[9px] sm:text-[10px] font-black text-red-100 uppercase whitespace-nowrap"
            >
              <span>🎭</span>
              <span>ТЕАТР ТЕНЕЙ</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-950/90 text-red-200 text-[8px] border border-red-500/40 font-mono">
                Кукол: {gotkaPuppetsCount}/4
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Volosatinya Ocean Meadow */}
        <AnimatePresence>
          {volosatinyaMeadowActive && (
            <motion.div
              key="badge-volosatinya-meadow"
              initial={{ y: -15, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#031828]/95 border border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.4)] text-[9px] sm:text-[10px] font-black text-sky-100 uppercase whitespace-nowrap"
            >
              <span>🌊</span>
              <span>ПОЛЯНА ВОЛОС</span>
              <span className="text-[8px] text-sky-300 font-mono">+30 АТК отряду</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
