import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export interface UltimateAftermathData {
  charId: string;
  charName: string;
  element: string;
  skillName: string;
  title: string;
  timestamp: number;
}

export interface HofmannitaFieldEffectData {
  type: 'stage' | 'drop' | 'impulse';
  timestamp: number;
}

export const HofmannitaStageField: React.FC<{
  active: boolean;
  overdrive: boolean;
}> = React.memo(({ active, overdrive }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          overdrive
            ? "bg-[radial-gradient(ellipse_at_50%_55%,rgba(217,70,239,0.22),rgba(76,29,149,0.22)_48%,rgba(5,4,15,0.58)_100%)]"
            : "bg-[radial-gradient(ellipse_at_50%_60%,rgba(192,38,211,0.16),rgba(49,20,72,0.18)_48%,rgba(5,4,15,0.46)_100%)]"
        )}
      />
      <motion.div
        animate={{ opacity: [0.12, 0.3, 0.12], scaleX: [0.9, 1.08, 0.9] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-[18%] h-[78%] w-[24%] origin-top bg-gradient-to-b from-fuchsia-200/30 via-fuchsia-400/10 to-transparent [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.24, 0.08], scaleX: [1.05, 0.9, 1.05] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-0 right-[18%] h-[78%] w-[24%] origin-top bg-gradient-to-b from-violet-100/25 via-violet-400/10 to-transparent [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]"
      />
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-fuchsia-950/45 via-violet-950/15 to-transparent" />
      <div className="absolute bottom-[14%] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-fuchsia-200/70 to-transparent shadow-[0_0_18px_rgba(232,121,249,0.75)]" />
      <div className="absolute bottom-0 left-1/2 h-[30%] w-[min(100%,900px)] -translate-x-1/2 opacity-40 [perspective:250px]">
        <div
          className="absolute inset-0 origin-bottom bg-[linear-gradient(to_right,rgba(232,121,249,0.26)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,181,253,0.22)_1px,transparent_1px)] bg-[size:48px_30px] [mask-image:linear-gradient(to_top,black,transparent)]"
          style={{ transform: 'rotateX(58deg)' }}
        />
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full border border-fuchsia-200/50 bg-[#15091e]/75 px-3 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.4)]">
        {overdrive ? '⚡ OVERDRIVE • LIVE' : '♫ MAIN STAGE • LIVE'}
      </div>
    </div>
  );
});

export const HofmannitaFieldEffectOverlay: React.FC<{
  effect: HofmannitaFieldEffectData | null;
}> = React.memo(({ effect }) => {
  if (!effect) return null;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`hofmannita-field-${effect.type}-${effect.timestamp}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: effect.type === 'stage' ? 0.9 : 0.58, ease: 'easeOut' }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(217,70,239,0.3),rgba(76,29,149,0.12)_45%,transparent_75%)]"
          />

          <motion.div
            initial={{ scaleX: 0.12, scaleY: 0.45, opacity: 0.95 }}
            animate={{ scaleX: 1.25, scaleY: 1.7, opacity: 0 }}
            transition={{ duration: effect.type === 'stage' ? 0.85 : 0.55, ease: 'easeOut' }}
            className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[min(120vw,1100px)] h-20 rounded-[50%] border-[3px] border-fuchsia-200 shadow-[0_0_32px_rgba(232,121,249,0.9)]"
          />
          <motion.div
            initial={{ scaleX: 0.08, opacity: 0.8 }}
            animate={{ scaleX: 1.15, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: 'easeOut' }}
            className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[min(105vw,950px)] h-12 rounded-[50%] border border-violet-200 shadow-[0_0_20px_rgba(196,181,253,0.75)]"
          />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none">
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              d="M0 365H120L160 320L205 405L260 255L310 390L355 340L390 365H610L650 320L695 405L740 255L790 390L835 340L870 365H1000"
              stroke="#f5d0fe"
              strokeWidth={effect.type === 'drop' ? 5 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 12px rgba(232,121,249,0.9))' }}
            />
            <motion.path
              initial={{ scaleX: 0.1, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.55, delay: 0.04 }}
              d="M0 435H1000"
              stroke="#c4b5fd"
              strokeWidth="2"
              strokeDasharray="16 12"
              style={{ transformOrigin: 'center', filter: 'drop-shadow(0 0 8px rgba(196,181,253,0.9))' }}
            />
            <motion.path
              initial={{ scaleX: 0.1, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.55, delay: 0.09 }}
              d="M0 465H1000"
              stroke="#e879f9"
              strokeWidth="1.5"
              strokeDasharray="3 10"
              style={{ transformOrigin: 'center' }}
            />
          </svg>

          {effect.type === 'stage' && (
            <>
              <motion.div
                initial={{ y: 80, opacity: 0, scale: 0.7 }}
                animate={{ y: -70, opacity: [0, 1, 0], scale: 1.35 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute bottom-[16%] left-[18%] text-3xl sm:text-5xl text-fuchsia-100 [text-shadow:0_0_18px_rgba(232,121,249,1)]"
              >♫</motion.div>
              <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.6 }}
                animate={{ y: -90, opacity: [0, 1, 0], scale: 1.4 }}
                transition={{ duration: 0.9, delay: 0.08, ease: 'easeOut' }}
                className="absolute bottom-[15%] right-[20%] text-3xl sm:text-5xl text-violet-100 [text-shadow:0_0_18px_rgba(196,181,253,1)]"
              >♪</motion.div>
            </>
          )}

          {effect.type === 'drop' && (
            <motion.div
              initial={{ scale: 0.55, opacity: 0, y: 18 }}
              animate={{ scale: [0.55, 1.15, 1], opacity: [0, 1, 0], y: 0 }}
              transition={{ duration: 0.62, ease: 'easeOut' }}
              className="absolute bottom-[23%] left-1/2 -translate-x-1/2 text-4xl sm:text-6xl font-black italic tracking-[0.22em] text-fuchsia-50 [text-shadow:0_0_24px_rgba(232,121,249,1)]"
            >DROP</motion.div>
          )}

          {effect.type === 'impulse' && (
            <>
              <motion.div
                initial={{ scale: 0.1, opacity: 0.9, rotate: -18 }}
                animate={{ scale: 1.5, opacity: 0, rotate: 18 }}
                transition={{ duration: 0.58, ease: 'easeOut' }}
                className="absolute inset-x-[8%] top-[12%] bottom-[12%] border-x-2 border-fuchsia-100/70 [clip-path:polygon(50%_0,58%_35%,100%_45%,62%_54%,50%_100%,42%_59%,0_48%,40%_39%)] bg-fuchsia-300/10"
              />
              <motion.div
                initial={{ opacity: 0.9, scale: 0.2 }}
                animate={{ opacity: 0, scale: 1.7 }}
                transition={{ duration: 0.48 }}
                className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[min(70vw,600px)] aspect-square rounded-full border-2 border-white/80 shadow-[0_0_28px_rgba(232,121,249,1)]"
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export const UltimateAftermathField: React.FC<{
  aftermath: UltimateAftermathData | null;
}> = React.memo(({ aftermath }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      <AnimatePresence>
        {aftermath && (
          <motion.div
            key={`aftermath-action-${aftermath.charId}-${aftermath.timestamp}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ 
              duration: 0.2,
              ease: "easeOut"
            }}
            style={{ transform: 'translateZ(0)', willChange: 'opacity, transform' }}
            className="absolute inset-0 pointer-events-none"
          >
            
            {/* HOFMANNITA: Neon encore wave across the battlefield */}
            {aftermath.charId === 'hofmannita' && (
              <div className="absolute inset-0">
                <motion.div
                  initial={{ scaleX: 0.15, scaleY: 0.4, opacity: 0.95 }}
                  animate={{ scaleX: 2.2, scaleY: 1.8, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[min(85vw,900px)] h-36 rounded-[50%] border-4 border-fuchsia-200 shadow-[0_0_42px_rgba(232,121,249,1)]"
                />
                <motion.div
                  initial={{ scaleX: 0.08, opacity: 0.9 }}
                  animate={{ scaleX: 1.8, opacity: 0 }}
                  transition={{ duration: 0.72, delay: 0.08, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[min(70vw,760px)] h-24 rounded-[50%] border-2 border-violet-200 shadow-[0_0_28px_rgba(196,181,253,0.9)]"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-fuchsia-600/35 via-violet-950/20 to-transparent" />
                <div className="absolute bottom-10 left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-fuchsia-100 to-transparent shadow-[0_0_24px_rgba(232,121,249,1)]" />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 18 }}
                  animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0], y: 0 }}
                  transition={{ duration: 0.72, ease: "easeOut" }}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 text-4xl sm:text-6xl font-black italic tracking-[0.2em] text-fuchsia-50 [text-shadow:0_0_24px_rgba(232,121,249,1)]"
                >ENCORE</motion.div>
                <motion.div
                  initial={{ y: 24, x: -45, scale: 0.5, opacity: 1 }}
                  animate={{ y: -105, x: -150, scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.78, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-3xl text-fuchsia-100 drop-shadow-[0_0_16px_rgba(232,121,249,1)]"
                >♫</motion.div>
                <motion.div
                  initial={{ y: 20, x: 45, scale: 0.5, opacity: 1 }}
                  animate={{ y: -115, x: 150, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.76, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-3xl text-violet-100 drop-shadow-[0_0_16px_rgba(196,181,253,1)]"
                >♪</motion.div>
                <motion.div
                  initial={{ scale: 0.3, rotate: 0, opacity: 0.9 }}
                  animate={{ scale: 1.6, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.82, ease: "easeOut" }}
                  className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 w-64 h-64"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="82" stroke="#e879f9" strokeWidth="2.5" strokeDasharray="12 7" />
                    <circle cx="100" cy="100" r="58" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="4 6" />
                    <polygon points="100,18 120,78 182,100 120,122 100,182 80,122 18,100 80,78" stroke="#ffffff" strokeWidth="2.5" fill="rgba(192,38,211,0.16)" />
                  </svg>
                </motion.div>
              </div>
            )}

            {aftermath.charId === 'cmh' && (
              <div className="absolute inset-0">
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-red-700/35 via-orange-950/20 to-transparent" />
                <motion.div
                  initial={{ scaleX: 0.1, scaleY: 0.25, opacity: 1 }}
                  animate={{ scaleX: 2.3, scaleY: 1.5, opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[min(90vw,1000px)] h-40 rounded-[50%] border-4 border-orange-300 shadow-[0_0_48px_rgba(249,115,22,0.95)]"
                />
                <motion.div
                  initial={{ scale: 0.45, opacity: 0, y: 20 }}
                  animate={{ scale: [0.45, 1.15, 1], opacity: [0, 1, 0], y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 text-4xl sm:text-7xl font-black italic tracking-[0.16em] text-orange-50 [text-shadow:0_0_28px_rgba(249,115,22,1)]"
                >DROP</motion.div>
                <motion.div
                  initial={{ rotate: -25, scale: 0.3, opacity: 0.9 }}
                  animate={{ rotate: 30, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.78, ease: "easeOut" }}
                  className="absolute bottom-[-5rem] left-1/2 -translate-x-1/2 w-72 h-72"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="82" stroke="#fb923c" strokeWidth="3" strokeDasharray="10 7" />
                    <circle cx="100" cy="100" r="58" stroke="#fecaca" strokeWidth="2" strokeDasharray="4 6" />
                    <polygon points="100,15 119,78 185,100 119,122 100,185 81,122 15,100 81,78" stroke="#fff7ed" strokeWidth="3" fill="rgba(220,38,38,0.2)" />
                  </svg>
                </motion.div>
              </div>
            )}

            {/* 1. VOLTA: High-Voltage Lightning Ground Burst & Plasma Shockwave */}
            {aftermath.charId === 'volta' && (
              <div className="absolute inset-0">
                {/* Rapid expanding high-voltage shockwave */}
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full border-4 border-yellow-300 shadow-[0_0_35px_rgba(253,224,71,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-28 rounded-full border-2 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,1)]"
                />
                {/* Ground lightning arcs */}
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-yellow-500/35 via-purple-900/25 to-transparent" />
                <div className="absolute bottom-6 left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_20px_rgba(253,224,71,1)]" />
                {/* Fast explosive electric sparks */}
                <motion.div 
                  initial={{ y: 20, x: -60, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, x: -120, scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/3 text-2xl text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,1)] font-black"
                >⚡</motion.div>
                <motion.div 
                  initial={{ y: 20, x: 60, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, x: 130, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/3 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-black"
                >⚡</motion.div>
                <motion.div 
                  initial={{ y: 0, scale: 0.6, opacity: 1 }}
                  animate={{ y: -110, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 text-3xl text-yellow-100 drop-shadow-[0_0_16px_rgba(253,224,71,1)] font-black"
                >⚡</motion.div>
              </div>
            )}

            {/* 2. AVELINE: Tidal Lotus Eruption & Aqua Shockwave */}
            {aftermath.charId === 'aveline' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(244,114,182,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-sky-500/30 via-fuchsia-500/20 to-transparent" />
                <motion.div 
                  initial={{ y: 20, scale: 0.6, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/4 text-2xl text-pink-300 drop-shadow-[0_0_12px_rgba(244,114,182,1)]"
                >🌸</motion.div>
                <motion.div 
                  initial={{ y: 20, scale: 0.6, opacity: 1 }}
                  animate={{ y: -90, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/4 text-2xl text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
                >💧</motion.div>
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.8 }}
                  animate={{ scale: 1.5, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="75" stroke="#f472b6" strokeWidth="3" strokeDasharray="8 6" />
                    <polygon points="100,20 125,75 180,100 125,125 100,180 75,125 20,100 75,75" stroke="#38bdf8" strokeWidth="3" fill="rgba(244,114,182,0.25)" />
                  </svg>
                </motion.div>
              </div>
            )}

            {/* 3. KAIREN: Glacial Spike Eruption & Frost Shockwave */}
            {aftermath.charId === 'kairen' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-cyan-300 shadow-[0_0_35px_rgba(103,232,249,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sky-600/35 via-blue-950/25 to-transparent" />
                {/* Rapid ice spikes bursting upwards */}
                <motion.div 
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                >
                  <svg className="w-full h-full opacity-60" viewBox="0 0 800 120" preserveAspectRatio="none" fill="none">
                    <polygon points="60,120 90,10 120,120" fill="rgba(186,230,253,0.7)" stroke="#ffffff" strokeWidth="2" />
                    <polygon points="220,120 250,25 280,120" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="2" />
                    <polygon points="400,120 430,5 460,120" fill="rgba(224,242,254,0.8)" stroke="#ffffff" strokeWidth="2.5" />
                    <polygon points="570,120 600,15 630,120" fill="rgba(186,230,253,0.7)" stroke="#ffffff" strokeWidth="2" />
                    <polygon points="710,120 740,30 770,120" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="2" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/3 text-2xl text-cyan-200 drop-shadow-[0_0_12px_rgba(103,232,249,1)]"
                >❄️</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/3 text-2xl text-white drop-shadow-[0_0_14px_rgba(255,255,255,1)]"
                >✨</motion.div>
              </div>
            )}

            {/* 4. CYRUS: Blazing Crimson Cross Cleave & Blade Embers */}
            {aftermath.charId === 'cyrus' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-red-600/35 via-rose-950/25 to-transparent" />
                {/* Fast glowing cross cleave slash lines */}
                <motion.div 
                  initial={{ scaleX: 0.1, opacity: 1 }}
                  animate={{ scaleX: 1.4, opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="absolute bottom-8 left-6 right-6 h-[4px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_24px_rgba(239,68,68,1)]"
                />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] font-bold"
                >⚔️</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,1)] font-bold"
                >✦</motion.div>
              </div>
            )}

            {/* 5. RAVEN: Abyssal Shadow Nova & Dark Feather Cyclone */}
            {aftermath.charId === 'raven' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
                  animate={{ scale: 2.3, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-purple-900/40 via-indigo-950/30 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,1)]"
                >🪶</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-2xl text-indigo-300 drop-shadow-[0_0_12px_rgba(129,140,248,1)]"
                >🌑</motion.div>
              </div>
            )}

            {/* 6. NEREUS: Ocean Geyser Tidal Burst & Hydro Shockwave */}
            {aftermath.charId === 'nereus' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-teal-700/35 via-cyan-950/30 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,1)]"
                >🫧</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
                >🌊</motion.div>
              </div>
            )}

            {/* 7. IVA: World Tree Roots Explosive Bloom & Emerald Leaf Whirlwind */}
            {aftermath.charId === 'iva' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-emerald-700/35 via-green-950/25 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,1)]"
                >🍃</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-2xl text-green-200 drop-shadow-[0_0_12px_rgba(34,197,94,1)]"
                >🌿</motion.div>
              </div>
            )}

            {/* 8. AELITA: Botanical Hexagram Laser Blast & Prismatic Matrix */}
            {aftermath.charId === 'aelita' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1, rotate: 0 }}
                  animate={{ scale: 2.2, opacity: 0, rotate: 120 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[480px] h-32 rounded-full border-4 border-lime-400 shadow-[0_0_35px_rgba(163,230,53,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-lime-600/30 via-emerald-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.9 }}
                  animate={{ scale: 1.6, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" stroke="#34d399" strokeWidth="3" strokeDasharray="8 6" />
                    <polygon points="100,20 170,140 30,140" stroke="#6ee7b7" strokeWidth="3" fill="rgba(52,211,153,0.2)" />
                    <polygon points="100,180 30,60 170,60" stroke="#a7f3d0" strokeWidth="2.5" fill="rgba(110,231,183,0.15)" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-lime-300 drop-shadow-[0_0_12px_rgba(163,230,53,1)]"
                >📐</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,1)]"
                >✧</motion.div>
              </div>
            )}

            {/* 9. MAESTRO: Supersonic Resonance Pulse & Bursting Musical Staves */}
            {aftermath.charId === 'maestro' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-purple-400 shadow-[0_0_35px_rgba(192,132,252,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.1, opacity: 1 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[440px] h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(232,121,249,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-purple-800/35 via-fuchsia-950/25 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-bold"
                >♪</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.9, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-3xl text-fuchsia-300 drop-shadow-[0_0_14px_rgba(232,121,249,1)] font-bold"
                >♫</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 text-2xl text-purple-200 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-bold"
                >♬</motion.div>
              </div>
            )}

            {/* 10. INEFFA: Solar Corona Eruption & Prismatic Mirror Shard Blast */}
            {aftermath.charId === 'ineffa' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-rose-600/35 via-amber-600/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.9 }}
                  animate={{ scale: 1.6, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <polygon points="100,10 125,75 190,100 125,125 100,190 75,125 10,100 75,75" stroke="#f59e0b" strokeWidth="3" fill="rgba(244,63,94,0.25)" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,1)]"
                >🪞</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,1)]"
                >☀️</motion.div>
              </div>
            )}

            {/* 11. VAIREN: Ancient Forest Heart & Dark Thorn Vines Action Burst */}
            {aftermath.charId === 'vairen' && (
              <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                  initial={{ scale: 0.25, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-teal-300 shadow-[0_0_30px_rgba(52,211,153,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-emerald-950/50 via-teal-900/30 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.95 }}
                  animate={{ scale: 1.7, rotate: 60, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="75" stroke="#34d399" strokeWidth="3" strokeDasharray="10 5" />
                    <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" stroke="#059669" strokeWidth="3.5" fill="rgba(16,185,129,0.3)" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-emerald-300 drop-shadow-[0_0_14px_rgba(16,185,129,1)]"
                >🥀</motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-teal-300 drop-shadow-[0_0_14px_rgba(45,212,191,1)]"
                >🌿</motion.div>
              </div>
            )}

            {/* 12. FENRIS: Great Hunt Wild Beast Shockwave & Amber-Emerald Claws */}
            {aftermath.charId === 'fenris' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-amber-950/45 via-emerald-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, opacity: 0.95 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <path d="M 40 30 L 70 170" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 85 20 L 115 180" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round" />
                    <path d="M 130 30 L 160 170" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-3xl text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,1)]"
                >🐺</motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-emerald-300 drop-shadow-[0_0_14px_rgba(16,185,129,1)]"
                >🏹</motion.div>
              </div>
            )}

            {/* 13. KRONA: Temporal Chrono Dial Shockwave & Ice Mist */}
            {aftermath.charId === 'krona' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-sky-300 shadow-[0_0_25px_rgba(125,211,252,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-cyan-950/45 via-blue-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.95 }}
                  animate={{ scale: 1.6, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="16 8" />
                    <line x1="100" y1="100" x2="100" y2="25" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="100" y1="100" x2="160" y2="100" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-3xl text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,1)]"
                >⏳</motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-sky-200 drop-shadow-[0_0_14px_rgba(186,230,253,1)]"
                >❄️</motion.div>
              </div>
            )}

            {/* 14. AURUM: Tectonic Gold Ingot Shockwave & Gilded Coin Surge */}
            {aftermath.charId === 'aurum' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-amber-300 shadow-[0_0_25px_rgba(252,211,77,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-yellow-950/45 via-amber-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, opacity: 0.95 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <polygon points="100,15 165,40 190,100 165,160 100,185 35,160 10,100 35,40" stroke="#fbbf24" strokeWidth="3" fill="rgba(245,158,11,0.2)" />
                    <circle cx="100" cy="100" r="50" stroke="#fde047" strokeWidth="2" strokeDasharray="8 4" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-3xl text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,1)]"
                >🪙</motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,1)]"
                >👑</motion.div>
              </div>
            )}

            {/* 15. ZEPHYR: Prismatic Mirror Cyclone & Electro Arcs */}
            {aftermath.charId === 'zephyr' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_25px_rgba(232,121,249,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-purple-950/45 via-fuchsia-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.95 }}
                  animate={{ scale: 1.6, rotate: 120, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <polygon points="100,15 175,100 100,185 25,100" stroke="#c084fc" strokeWidth="2.5" fill="rgba(147,51,234,0.18)" />
                    <circle cx="100" cy="100" r="70" stroke="#e879f9" strokeWidth="2" strokeDasharray="10 5" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-3xl text-purple-300 drop-shadow-[0_0_14px_rgba(168,85,247,1)]"
                >⚡</motion.div>
                <motion.div 
                  initial={{ y: 15, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-fuchsia-200 drop-shadow-[0_0_14px_rgba(240,171,252,1)]"
                >🪞</motion.div>
              </div>
            )}


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
