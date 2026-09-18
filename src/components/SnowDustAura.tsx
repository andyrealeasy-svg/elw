import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SnowDustAuraProps {
  active: boolean;
  stacks?: number;
  className?: string;
}

// 4 lightweight snow specks around the enemy card
const DUST_PARTICLES = [
  { id: 1, left: '10%', top: '80%', glyph: '❄', size: '10px', dur: 2.8, delay: 0 },
  { id: 2, left: '85%', top: '75%', glyph: '✧', size: '10px', dur: 3.2, delay: 0.7 },
  { id: 3, left: '20%', top: '30%', glyph: '•', size: '7px', dur: 2.5, delay: 1.2 },
  { id: 4, left: '80%', top: '25%', glyph: '❅', size: '9px', dur: 3.0, delay: 0.4 },
];

export const SnowDustAura: React.FC<SnowDustAuraProps> = React.memo(({ active, stacks = 1, className }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="snow-dust-aura"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute -inset-1.5 sm:-inset-2 pointer-events-none rounded-xl sm:rounded-2xl z-30 overflow-visible select-none",
            className
          )}
        >
          {/* Subtle Frost Border & Glow (GPU Accelerated via CSS) */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-white/80 shadow-[0_0_10px_rgba(224,242,254,0.5)] anim-subtle-pulse" />

          {/* Light Frost Vignette */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-cyan-200/[0.08]" />

          {/* 3 Lightweight Rising Snow Particles (Pure GPU CSS animations) */}
          {DUST_PARTICLES.slice(0, 3).map((p) => (
            <div
              key={p.id}
              style={{
                left: p.left,
                top: p.top,
                fontSize: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`
              }}
              className="absolute text-cyan-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)] anim-float-particle"
            >
              {p.glyph}
            </div>
          ))}

          {/* Compact Snow Dust Badge */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0a1826]/95 border border-cyan-300/60 text-[8px] font-black text-cyan-100 uppercase tracking-wider shadow-md whitespace-nowrap z-40">
            <span className="text-[9px] text-cyan-200 leading-none">❄</span>
            <span>Пыль {stacks}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
