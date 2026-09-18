import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WhiteFieldOverlayProps {
  active: boolean;
  duration?: number;
}

// 6 lightweight drifting snow particles across the arena (optimized for 60fps)
const PARTICLES = [
  { id: 1, left: '15%', top: '25%', glyph: '❄', size: '10px', dur: 5, delay: 0 },
  { id: 2, left: '38%', top: '65%', glyph: '✧', size: '12px', dur: 6, delay: 1.5 },
  { id: 3, left: '60%', top: '20%', glyph: '❅', size: '11px', dur: 5.5, delay: 0.8 },
  { id: 4, left: '78%', top: '55%', glyph: '❄', size: '9px', dur: 6.5, delay: 2 },
  { id: 5, left: '48%', top: '35%', glyph: '•', size: '6px', dur: 4.8, delay: 1 },
  { id: 6, left: '88%', top: '30%', glyph: '✧', size: '10px', dur: 5.2, delay: 2.5 },
];

export const WhiteFieldOverlay: React.FC<WhiteFieldOverlayProps> = React.memo(({ active, duration = 2 }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="white-field-optimized"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
        >
          {/* Base Atmospheric Frost Mist Layer (GPU accelerated opacity) */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/15 via-white/[0.08] to-cyan-950/25" />

          {/* Drifting White Dust Mist (GPU CSS animation, zero JS CPU load) */}
          <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.2)_0%,_rgba(186,230,253,0.1)_45%,_transparent_75%)] anim-mist-drift" />

          {/* Ground Frost Mist Wave (GPU CSS animation) */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 via-cyan-100/10 to-transparent anim-subtle-pulse" />

          {/* Frosted Arena Vignette Border */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/25 shadow-[inset_0_0_30px_rgba(255,255,255,0.15)]" />

          {/* 4 Lightweight Drifting Snowflakes (pure CSS animation) */}
          {PARTICLES.slice(0, 4).map((p) => (
            <div
              key={p.id}
              style={{
                left: p.left,
                top: p.top,
                fontSize: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`
              }}
              className="absolute text-cyan-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.7)] anim-float-particle"
            >
              {p.glyph}
            </div>
          ))}

          {/* Clean Status Badge */}
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-[#05131f]/90 border border-cyan-300/40 shadow-lg whitespace-nowrap"
          >
            <span className="text-cyan-200 text-xs">❄</span>
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-white uppercase">
              БЕЛОЕ ПОЛЕ
            </span>
            <span className="text-[9px] font-bold text-cyan-200 px-1.5 py-0.2 rounded-full bg-cyan-900/60 border border-cyan-400/20">
              {duration} {duration === 1 ? 'ход' : duration < 5 ? 'хода' : 'ходов'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
