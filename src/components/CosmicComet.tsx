import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { SkipForward, Sparkles } from 'lucide-react';
import { playWishMeteorSound, playWishImpactSound } from '../lib/sound';

export type CometTheme = 'DISTORTION' | 'GOLD' | 'PURPLE' | 'BLUE';

interface CosmicCometProps {
  theme: CometTheme;
  isMulti?: boolean;
  subtitle?: string;
  onImpact?: () => void;
  onSkip?: () => void;
}

export const CosmicComet: React.FC<CosmicCometProps> = ({
  theme,
  isMulti = false,
  subtitle,
  onImpact,
  onSkip
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme color palettes (pure GPU shader gradients, zero expensive blurs)
  const colors = useMemo(() => {
    switch (theme) {
      case 'GOLD':
        return {
          glow: 'rgba(234, 179, 8, 0.75)',
          core: '#ffffff',
          primary: '#eab308',
          secondary: '#f59e0b',
          tailOuter: 'linear-gradient(to right, transparent 0%, rgba(245,158,11,0.25) 40%, rgba(234,179,8,0.7) 75%, rgba(255,255,255,0.95) 100%)',
          tailInner: 'linear-gradient(to right, transparent 0%, rgba(234,179,8,0.4) 30%, rgba(254,240,138,0.9) 70%, #ffffff 100%)',
          nebula1: 'from-amber-950/30 via-yellow-950/15 to-black',
          ray: '#fef08a',
          sparks: '#fde047',
          soundRarity: 'S' as const
        };
      case 'PURPLE':
        return {
          glow: 'rgba(168, 85, 247, 0.75)',
          core: '#ffffff',
          primary: '#a855f7',
          secondary: '#7c3aed',
          tailOuter: 'linear-gradient(to right, transparent 0%, rgba(124,58,237,0.25) 40%, rgba(168,85,247,0.7) 75%, rgba(255,255,255,0.95) 100%)',
          tailInner: 'linear-gradient(to right, transparent 0%, rgba(168,85,247,0.4) 30%, rgba(233,213,255,0.9) 70%, #ffffff 100%)',
          nebula1: 'from-purple-950/30 via-indigo-950/20 to-black',
          ray: '#e9d5ff',
          sparks: '#c084fc',
          soundRarity: 'A' as const
        };
      case 'DISTORTION':
        return {
          glow: 'rgba(192, 132, 252, 0.85)',
          core: '#ffffff',
          primary: '#a855f7',
          secondary: '#06b6d4',
          tailOuter: 'linear-gradient(to right, transparent 0%, rgba(6,182,212,0.25) 40%, rgba(168,85,247,0.7) 75%, rgba(255,255,255,0.95) 100%)',
          tailInner: 'linear-gradient(to right, transparent 0%, rgba(168,85,247,0.4) 30%, rgba(103,232,249,0.9) 70%, #ffffff 100%)',
          nebula1: 'from-indigo-950/40 via-purple-950/25 to-black',
          ray: '#67e8f9',
          sparks: '#38bdf8',
          soundRarity: 'A' as const
        };
      case 'BLUE':
      default:
        return {
          glow: 'rgba(56, 189, 248, 0.75)',
          core: '#ffffff',
          primary: '#38bdf8',
          secondary: '#2563eb',
          tailOuter: 'linear-gradient(to right, transparent 0%, rgba(37,99,235,0.25) 40%, rgba(56,189,248,0.7) 75%, rgba(255,255,255,0.95) 100%)',
          tailInner: 'linear-gradient(to right, transparent 0%, rgba(56,189,248,0.4) 30%, rgba(186,230,253,0.9) 70%, #ffffff 100%)',
          nebula1: 'from-sky-950/30 via-blue-950/20 to-black',
          ray: '#bae6fd',
          sparks: '#7dd3fc',
          soundRarity: 'B' as const
        };
    }
  }, [theme]);

  // Audio trigger on mount
  useEffect(() => {
    playWishMeteorSound(colors.soundRarity);
    const impactTimer = setTimeout(() => {
      playWishImpactSound(colors.soundRarity);
      if (onImpact) onImpact();
    }, 2400);

    return () => clearTimeout(impactTimer);
  }, [colors.soundRarity, onImpact]);

  // Multi-comet sub-stars for 10-pull (lightweight positions)
  const subComets = useMemo(() => {
    if (!isMulti) return [];
    if (isMobile) {
      return [
        { delay: 0.08, offsetX: 16, offsetY: -14, scale: 0.55, splitX: -10, splitY: -16 },
        { delay: 0.12, offsetX: -12, offsetY: 16, scale: 0.5, splitX: -18, splitY: 10 },
        { delay: 0.16, offsetX: 22, offsetY: 8, scale: 0.52, splitX: 12, splitY: -10 },
        { delay: 0.20, offsetX: -18, offsetY: -18, scale: 0.45, splitX: -14, splitY: -20 },
        { delay: 0.24, offsetX: 25, offsetY: -20, scale: 0.42, splitX: 16, splitY: -16 },
        { delay: 0.28, offsetX: -20, offsetY: 22, scale: 0.48, splitX: -20, splitY: 14 },
        { delay: 0.32, offsetX: 15, offsetY: 24, scale: 0.4, splitX: 8, splitY: 18 },
        { delay: 0.36, offsetX: -25, offsetY: -6, scale: 0.45, splitX: -16, splitY: -6 },
        { delay: 0.40, offsetX: 10, offsetY: -28, scale: 0.42, splitX: 4, splitY: -24 }
      ];
    }
    return [
      { delay: 0.08, offsetX: 35, offsetY: -30, scale: 0.65, splitX: -25, splitY: -30 },
      { delay: 0.12, offsetX: -30, offsetY: 35, scale: 0.55, splitX: -40, splitY: 20 },
      { delay: 0.16, offsetX: 55, offsetY: 20, scale: 0.6, splitX: 25, splitY: -25 },
      { delay: 0.20, offsetX: -50, offsetY: -40, scale: 0.5, splitX: -30, splitY: -45 },
      { delay: 0.24, offsetX: 70, offsetY: -45, scale: 0.45, splitX: 35, splitY: -35 },
      { delay: 0.28, offsetX: -60, offsetY: 55, scale: 0.55, splitX: -45, splitY: 30 },
      { delay: 0.32, offsetX: 40, offsetY: 60, scale: 0.4, splitX: 20, splitY: 38 },
      { delay: 0.36, offsetX: -75, offsetY: -15, scale: 0.5, splitX: -35, splitY: -15 },
      { delay: 0.40, offsetX: 25, offsetY: -70, scale: 0.45, splitX: 12, splitY: -55 }
    ];
  }, [isMulti, isMobile]);

  // Movement coordinates adjusted for centered flex positioning
  const heroAnimation = useMemo(() => {
    if (isMobile) {
      return {
        initial: { x: '55vw', y: '-44vh', scale: 0.7, opacity: 0.4 },
        animate: { 
          x: ['55vw', '5vw', '-22vw'], 
          y: ['-44vh', '-8vh', '16vh'], 
          scale: [0.7, 1.15, 1.45], 
          opacity: [0.4, 0.95, 1] 
        },
        rotation: 128
      };
    }
    return {
      initial: { x: '65vw', y: '-38vh', scale: 0.7, opacity: 0.4 },
      animate: { 
        x: ['65vw', '10vw', '-28vw'], 
        y: ['-38vh', '-6vh', '18vh'], 
        scale: [0.7, 1.2, 1.65], 
        opacity: [0.4, 0.95, 1] 
      },
      rotation: 140
    };
  }, [isMobile]);

  return (
    <div 
      onClick={onSkip}
      className="absolute inset-0 bg-[#04050a] flex items-center justify-center cursor-pointer select-none overflow-hidden font-sans z-40 transform-gpu"
    >
      {/* 1. Deep Cosmic Nebula & Starlight Glow (Fast native radial gradients, no filters) */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${colors.nebula1} pointer-events-none`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.95)_0%,_rgba(0,0,0,0.6)_50%,_transparent_100%)] pointer-events-none"></div>

      {/* 2. Hyperspace Warp Speed Streaks (Lightweight CSS-only SVG starfield, 0 JS RAF loops) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 overflow-hidden" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="streakGrad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="85%" y1="10%" x2="65%" y2="35%" stroke="url(#streakGrad)" strokeWidth="1.5" />
        <line x1="95%" y1="25%" x2="72%" y2="52%" stroke="url(#streakGrad)" strokeWidth="1.5" />
        <line x1="70%" y1="5%" x2="50%" y2="28%" stroke="url(#streakGrad)" strokeWidth="1" />
        <line x1="80%" y1="45%" x2="58%" y2="70%" stroke="url(#streakGrad)" strokeWidth="1.2" />
        <line x1="55%" y1="15%" x2="35%" y2="40%" stroke="url(#streakGrad)" strokeWidth="1.5" />
        <line x1="45%" y1="35%" x2="22%" y2="62%" stroke="url(#streakGrad)" strokeWidth="1" />
        <line x1="60%" y1="65%" x2="38%" y2="90%" stroke="url(#streakGrad)" strokeWidth="1.2" />
      </svg>

      {/* 3. Sub-Comets Cluster (for 10-Pull Wishes) */}
      {subComets.map((sub, idx) => (
        <motion.div
          key={idx}
          initial={{ 
            x: '60vw', 
            y: '-42vh', 
            scale: sub.scale * 0.7, 
            opacity: 0 
          }}
          animate={{ 
            x: ['60vw', `${(isMobile ? 8 : 12) + sub.offsetX * 0.12}vw`, `${(isMobile ? -18 : -26) + sub.splitX * 0.25}vw`],
            y: ['-42vh', `${(isMobile ? -8 : -5) + sub.offsetY * 0.12}vh`, `${(isMobile ? 14 : 20) + sub.splitY * 0.25}vh`],
            scale: [sub.scale * 0.7, sub.scale * 1.15, sub.scale * 1.4],
            opacity: [0, 0.9, 1]
          }}
          transition={{ 
            duration: 2.35, 
            delay: sub.delay, 
            ease: [0.22, 0.05, 0.25, 1] 
          }}
          className="absolute z-20 pointer-events-none transform-gpu will-change-transform"
          style={{ transformOrigin: 'center center' }}
        >
          <div 
            className="relative flex items-center justify-center"
            style={{ transform: `rotate(${heroAnimation.rotation}deg)` }}
          >
            {/* Sub-comet Tail extending backwards to the left (upwards-right in space) */}
            <div 
              className="absolute right-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: isMobile ? '100px' : '150px',
                height: isMobile ? '6px' : '10px',
                background: colors.tailOuter,
                borderRadius: '50% 0 0 50%'
              }}
            />
            {/* Sub-comet Head at the leading front (bottom-left) */}
            <div 
              className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5 rounded-full bg-white relative z-10 shrink-0"
              style={{
                boxShadow: `0 0 12px ${colors.glow}`
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* 4. Main Hero Comet (Cutting through Center of Screen) */}
      <motion.div
        initial={heroAnimation.initial}
        animate={heroAnimation.animate}
        transition={{ 
          duration: 2.35, 
          times: [0, 0.55, 1],
          ease: [0.22, 0.08, 0.2, 1] 
        }}
        className="absolute z-30 pointer-events-none transform-gpu will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        {/* Oriented along accurate motion vector: Head leads towards bottom-left, Tail streams up-right */}
        <div 
          className="relative flex items-center justify-center"
          style={{ transform: `rotate(${heroAnimation.rotation}deg)` }}
        >
          
          {/* A. Outer Volumetric Cosmic Ion Tail (extends backwards to the left, trailing behind upwards) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 right-1/2 pointer-events-none w-[220px] h-[36px] sm:w-[400px] sm:h-[60px]"
            style={{
              background: colors.tailOuter,
              borderRadius: '50% 0 0 50%'
            }}
          />

          {/* B. Middle Turbulent Plasma Flame Tongue */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 right-1/2 pointer-events-none w-[160px] h-[18px] sm:w-[300px] sm:h-[30px]"
            style={{
              background: colors.tailInner,
              borderRadius: '50% 0 0 50%'
            }}
          />

          {/* C. Inner Ultra-Hot Laser Spine */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 right-1/2 pointer-events-none w-[110px] h-[5px] sm:w-[220px] sm:h-[8px]"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.7) 40%, #ffffff 100%)',
              borderRadius: '50% 0 0 50%'
            }}
          />

          {/* D. Nucleus Core (Leading Front Head with Intense White-Hot Core & Corona Bloom at Bottom) */}
          <div 
            className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center pointer-events-none z-10 shrink-0"
            style={{
              background: `radial-gradient(circle, #ffffff 35%, ${colors.primary} 70%, transparent 100%)`,
              boxShadow: `0 0 28px 7px ${colors.glow}`
            }}
          >
            {/* White-hot center pin */}
            <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-white shadow-[0_0_10px_#ffffff]"></div>

            {/* Anamorphic Lens Flare Rays */}
            <div 
              className="absolute w-24 sm:w-40 h-0.5 rounded-full"
              style={{
                background: `linear-gradient(to right, transparent, ${colors.ray}, #ffffff, ${colors.ray}, transparent)`
              }}
            />
            <div 
              className="absolute w-0.5 h-16 sm:h-28 rounded-full"
              style={{
                background: `linear-gradient(to bottom, transparent, ${colors.ray}, #ffffff, ${colors.ray}, transparent)`
              }}
            />
          </div>

          {/* E. Atmospheric Bow Shock Glow Arc at the leading edge */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-10 sm:h-14 rounded-r-full border-r-2 pointer-events-none opacity-80 z-20"
            style={{ borderColor: colors.primary, boxShadow: `2px 0 8px ${colors.glow}` }}
          />

          {/* F. Periodic Expanding Sonic Shockwave Ring Centered on Head */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: isMobile ? 2.0 : 2.5, opacity: 0 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/50 pointer-events-none z-0"
            style={{ borderColor: colors.primary }}
          />

        </div>
      </motion.div>

      {/* 5. Impact Supernova Starburst (Expanding from comet convergence point) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 0, 1.8, 3.2], 
          opacity: [0, 0, 0.9, 0] 
        }}
        transition={{ 
          duration: 2.4, 
          times: [0, 0.75, 0.92, 1],
          ease: 'easeOut' 
        }}
        className="absolute z-35 pointer-events-none rounded-full w-40 sm:w-72 h-40 sm:h-72 transform-gpu will-change-transform"
        style={{
          left: isMobile ? '28%' : '24%',
          top: isMobile ? '58%' : '60%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, #ffffff 15%, ${colors.primary} 45%, transparent 75%)`
        }}
      />

      {/* 6. Atmospheric Ambient Screen Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.1, 0.85, 0] }}
        transition={{ duration: 2.4, times: [0, 0.4, 0.7, 0.95, 1], ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 35% 55%, ${colors.glow} 0%, transparent 65%)`
        }}
      />

      {/* 7. Bottom Status Pill (Comfortably positioned above phone safe areas) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none px-4 w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/85 border border-white/10 text-white/90 text-xs font-mono uppercase tracking-wider shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" style={{ color: colors.primary }} />
          <span className="truncate">{subtitle || (theme === 'DISTORTION' ? 'Призыв из Искажения...' : 'Падение Небесной Звезды...')}</span>
        </div>
      </motion.div>

      {/* 8. Skip Button (Touch-friendly and safe-padded for phones) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (onSkip) onSkip();
        }}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white/95 text-xs font-bold uppercase tracking-wider transition-all border border-white/15 shadow-lg cursor-pointer"
      >
        <SkipForward className="w-3.5 h-3.5" />
        <span>Пропустить</span>
      </button>
    </div>
  );
};


