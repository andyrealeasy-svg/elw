import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCharSplash } from '../../data';
import { cn } from '../../lib/utils';
import { playUltimateBurstSound } from '../../lib/sound';

export interface UltimateCutsceneData {
  charId: string;
  charName: string;
  skillName: string;
  element: 'Electro' | 'Cryo' | 'Hydro' | 'Pyro' | 'Dendro' | 'Geo' | 'Physical' | string;
  quote: string;
  duration?: number;
}

// 10 special characters (Snezhana removed):
// Volta, Aveline, Kairen, Cyrus, Raven, Nereus, Iva, Aelita, Maestro, Ineffa
export const ULTIMATE_CHARACTER_CONFIGS: Record<string, { quote: string; title: string; subtitle: string; themeColor: string; bgTint: string; particleColor: string; accentColor: string }> = {
  volta: {
    title: 'ПЕРЕГРУЗКА ВОЛЬТА',
    subtitle: 'Сверхпроводящий Биоэлектрический Коллапс',
    quote: '«Максимальное напряжение в сети! Примите всю мощь биоэлектричества!»',
    themeColor: 'text-yellow-300 border-yellow-400 drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]',
    bgTint: 'from-amber-950/40 via-purple-950/30 to-black/60',
    particleColor: 'rgba(253, 224, 71, 0.9)',
    accentColor: '#fde047'
  },
  aveline: {
    title: 'ВЕЧНОЕ ЦВЕТЕНИЕ',
    subtitle: 'Танец Лазурного Лотоса и Океана',
    quote: '«Расцветайте, священные воды! Да наполнится мир чистотой лазури!»',
    themeColor: 'text-pink-200 border-fuchsia-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]',
    bgTint: 'from-fuchsia-950/40 via-sky-950/30 to-black/60',
    particleColor: 'rgba(236, 72, 153, 0.9)',
    accentColor: '#f472b6'
  },
  kairen: {
    title: 'ТРОН ВЕЧНОЙ ЗИМЫ',
    subtitle: 'Владыка Первозданного Ледника',
    quote: '«Преклоните колени перед Вечным Престолом Стужи!»',
    themeColor: 'text-sky-200 border-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.95)]',
    bgTint: 'from-sky-950/40 via-blue-950/30 to-black/60',
    particleColor: 'rgba(56, 189, 248, 0.9)',
    accentColor: '#38bdf8'
  },
  cyrus: {
    title: 'ПРИГОВОР: КАЗНЬ',
    subtitle: 'Финальный Рапирный Вердикт Дуэлянта',
    quote: '«Дуэль окончена. Приговор окончателен и обжалованию не подлежит!»',
    themeColor: 'text-rose-200 border-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.95)]',
    bgTint: 'from-red-950/40 via-rose-950/30 to-black/60',
    particleColor: 'rgba(239, 68, 68, 0.9)',
    accentColor: '#ef4444'
  },
  raven: {
    title: 'ТАНЕЦ С ТЕНЬЮ',
    subtitle: 'Вихрь Призрачных Теневых Кос',
    quote: '«Тьма пожирает слабых... Ты даже не успеешь осознать свой конец.»',
    themeColor: 'text-indigo-200 border-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.95)]',
    bgTint: 'from-purple-950/40 via-indigo-950/30 to-black/60',
    particleColor: 'rgba(168, 85, 247, 0.9)',
    accentColor: '#a855f7'
  },
  nereus: {
    title: 'САД ВЕЧНОГО МОРЯ',
    subtitle: 'Пробуждение Владыки Бездны',
    quote: '«Глубины океана пробуждаются! Владыка Приливов принимает жертву!»',
    themeColor: 'text-cyan-200 border-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.95)]',
    bgTint: 'from-cyan-950/40 via-teal-950/30 to-black/60',
    particleColor: 'rgba(34, 211, 238, 0.9)',
    accentColor: '#22d3ee'
  },
  iva: {
    title: 'ПРОБУЖДЕНИЕ ФЛОРЫ',
    subtitle: 'Первозданный Дендро-Резонанс',
    quote: '«Корни древнего леса, оплетите врагов! Сила земли непоколебима!»',
    themeColor: 'text-emerald-200 border-emerald-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.95)]',
    bgTint: 'from-emerald-950/40 via-green-950/30 to-black/60',
    particleColor: 'rgba(16, 185, 129, 0.9)',
    accentColor: '#10b981'
  },
  aelita: {
    title: 'ТЕОРЕМА О ДИКОЙ ПРИРОДЕ',
    subtitle: 'Сакральная Ботаническая Мандала',
    quote: '«Формула дикой природы совершенна... Доказательство окончено!»',
    themeColor: 'text-lime-200 border-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.95)]',
    bgTint: 'from-emerald-950/40 via-lime-950/30 to-black/60',
    particleColor: 'rgba(52, 211, 153, 0.9)',
    accentColor: '#34d399'
  },
  maestro: {
    title: 'ФИНАЛЬНЫЙ АККОРД',
    subtitle: 'Симфонический Резонанс Изоляции',
    quote: '«Слушайте эту симфонию! Это ваша последняя кода!»',
    themeColor: 'text-purple-200 border-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.95)]',
    bgTint: 'from-purple-950/40 via-fuchsia-950/30 to-black/60',
    particleColor: 'rgba(192, 132, 252, 0.9)',
    accentColor: '#c084fc'
  },
  ineffa: {
    title: 'ГИБРИДНАЯ ЭНЕРГИЯ',
    subtitle: 'Сверхновая Солнечного Зеркала',
    quote: '«Зеркала рассвета, соберите весь свет! Вспышка истинного солнца!»',
    themeColor: 'text-amber-200 border-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.95)]',
    bgTint: 'from-rose-950/40 via-amber-950/30 to-black/60',
    particleColor: 'rgba(244, 63, 94, 0.9)',
    accentColor: '#f43f5e'
  }
};

export const UltimateCutsceneOverlay: React.FC<{
  cutscene: UltimateCutsceneData | null;
  onImpact?: () => void;
  onComplete: () => void;
}> = React.memo(({ cutscene, onImpact, onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'climax' | 'whiteout'>('enter');
  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const impactTriggeredRef = useRef(false);

  const triggerImpact = useCallback(() => {
    if (!impactTriggeredRef.current) {
      impactTriggeredRef.current = true;
      onImpactRef.current?.();
    }
  }, []);

  const handleFinish = useCallback(() => {
    triggerImpact();
    onCompleteRef.current?.();
  }, [triggerImpact]);

  useEffect(() => {
    if (!cutscene) {
      impactTriggeredRef.current = false;
      return;
    }
    impactTriggeredRef.current = false;
    setPhase('enter');

    // SFX
    playUltimateBurstSound();

    const t1 = setTimeout(() => {
      setPhase('climax');
    }, 450);

    const t2 = setTimeout(() => {
      setPhase('whiteout');
      triggerImpact();
    }, 1600);

    const t3 = setTimeout(() => {
      handleFinish();
    }, 2250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cutscene?.charId, cutscene?.skillName, triggerImpact, handleFinish]);

  if (!cutscene) return null;

  const config = ULTIMATE_CHARACTER_CONFIGS[cutscene.charId] || {
    title: cutscene.skillName.toUpperCase(),
    subtitle: 'Абсолютный Спецнавык',
    quote: cutscene.quote,
    themeColor: 'text-white border-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]',
    bgTint: 'from-indigo-950/40 to-black/60',
    particleColor: 'rgba(255,255,255,0.8)',
    accentColor: '#ffffff'
  };

  const splash = getCharSplash(cutscene.charId);

  return (
    <AnimatePresence>
      <motion.div 
        key={`cutscene-${cutscene.charId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={handleFinish}
        className="absolute inset-0 z-[120] pointer-events-auto flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer"
      >
        
        {/* Semi-transparent Darkened Battlefield Backdrop with Dynamic Elemental Vignette */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "absolute inset-0 bg-gradient-to-b backdrop-blur-[2px] transition-colors pointer-events-none",
            config.bgTint,
            "before:absolute before:inset-0 before:bg-black/45"
          )}
        />

        {/* Ambient Radial Energy Core over the Battlefield */}
        <motion.div
          animate={{
            scale: phase === 'climax' ? [0.9, 1.3, 1.1] : [0.8, 1],
            opacity: phase === 'climax' ? [0.35, 0.7, 0.5] : 0.3
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${config.particleColor} 0%, transparent 65%)` }}
        />

        {/* Cinematic Top Letterbox Bar */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-40 w-full h-9 sm:h-11 bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-xl shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.25em] text-white/90">
              TIME FREEZE • ULTIMATE BURST
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] sm:text-[11px] font-mono text-white/60 tracking-widest uppercase">
            <span>{cutscene.element} RESONANCE</span>
            <span className="hidden sm:inline text-white/30 text-[9px]">• КЛИК ДЛЯ ПРОПУСКА</span>
          </div>
        </motion.div>

        {/* Dynamic Character Cut-in Banner in Upper Field */}
        <div className="relative z-30 w-full max-w-5xl px-4 sm:px-6 flex items-center justify-center my-auto">
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative flex flex-col md:flex-row items-center gap-4 sm:gap-8 bg-black/60 backdrop-blur-md p-3 sm:p-5 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
          >
            {/* Diagonal Speedline Texture behind banner */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-15 pointer-events-none overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)'
              }}
            />

            {/* Character Portrait Card with Neon Halo */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-2xl border-2 animate-pulse blur-sm"
                style={{ borderColor: config.accentColor }}
              />
              {splash ? (
                <img
                  src={splash}
                  alt={cutscene.charName}
                  className="w-full h-full object-cover rounded-2xl border-2 border-white/60 shadow-2xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl">
                  ⚔️
                </div>
              )}
            </div>

            {/* Typography: Character Name, Ultimate Title & Voice Quote */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-white">
                  {cutscene.charName} • {cutscene.element}
                </span>
              </div>

              {/* Grand Ultimate Title */}
              <h1 className={cn(
                "text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-none truncate max-w-full",
                config.themeColor
              )}>
                {config.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-mono font-bold text-white/80 uppercase tracking-wide truncate max-w-full">
                {config.subtitle}
              </p>

              {/* Character Quote */}
              <div className="pt-1.5 border-t border-white/15 w-full">
                <p className="text-[11px] sm:text-xs font-sans italic text-white/90 leading-snug drop-shadow">
                  {config.quote}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Battlefield-Spanning Fullscreen Vector VFX Layer (Directly over the arena & combatants) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
          
          {/* 1. VOLTA: High-Voltage Lightning Matrix across the Battlefield */}
          {cutscene.charId === 'volta' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[550px] h-[550px] rounded-full border-4 border-yellow-300 shadow-[0_0_50px_rgba(253,224,71,0.9)]" />
              <div className="anim-soundwave-ring absolute w-[750px] h-[750px] rounded-full border-2 border-purple-400/60" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <path d="M 0 300 L 250 150 L 400 400 L 600 200 L 750 450 L 1000 300" stroke="#fde047" strokeWidth="6" className="drop-shadow-[0_0_25px_rgba(253,224,71,1)] animate-pulse" />
                <path d="M 1000 300 L 750 150 L 600 400 L 400 200 L 250 450 L 0 300" stroke="#c084fc" strokeWidth="4" className="drop-shadow-[0_0_20px_rgba(192,132,252,1)]" />
                <circle cx="500" cy="300" r="140" stroke="#fde047" strokeWidth="3" strokeDasharray="12 8" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute top-1/4 left-1/4 text-3xl animate-bounce">⚡</div>
              <div className="absolute bottom-1/4 right-1/4 text-3xl animate-pulse">⚡</div>
            </div>
          )}

          {/* 2. AVELINE: Celestial Lotus Tide Mandala */}
          {cutscene.charId === 'aveline' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[550px] h-[550px] rounded-full border-4 border-fuchsia-400 shadow-[0_0_50px_rgba(236,72,153,0.9)]" />
              <div className="anim-water-ripple absolute w-[750px] h-[750px] rounded-full border-2 border-sky-400/50" />
              <svg className="w-[600px] h-[600px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="85" stroke="#f472b6" strokeWidth="2.5" strokeDasharray="8 6" />
                <polygon points="100,10 125,75 190,100 125,125 100,190 75,125 10,100 75,75" stroke="#38bdf8" strokeWidth="3.5" fill="rgba(244,114,182,0.2)" className="drop-shadow-[0_0_30px_rgba(244,114,182,1)]" />
                <circle cx="100" cy="100" r="35" stroke="#ffffff" strokeWidth="2" fill="rgba(56,189,248,0.3)" />
              </svg>
              <div className="absolute text-4xl top-1/3 left-1/4 animate-pulse">🌸</div>
            </div>
          )}

          {/* 3. KAIREN: Glacial Sovereign Throne */}
          {cutscene.charId === 'kairen' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[600px] h-[600px] rounded-full border-4 border-sky-300 shadow-[0_0_60px_rgba(56,189,248,0.9)]" />
              <div className="anim-glacial-pulse absolute w-[450px] h-[450px] rounded-full border-2 border-sky-200" />
              <svg className="w-[650px] h-[650px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <polygon points="100,10 120,175 100,190 80,175" fill="rgba(224,242,254,0.5)" stroke="#ffffff" strokeWidth="3.5" className="drop-shadow-[0_0_35px_rgba(56,189,248,1)]" />
                <polygon points="55,45 72,165 55,178 38,165" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2.5" />
                <polygon points="145,45 162,165 145,178 128,165" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="70" stroke="#bae6fd" strokeWidth="2" strokeDasharray="10 6" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl bottom-1/4 left-1/3 animate-bounce">👑</div>
            </div>
          )}

          {/* 4. CYRUS: Guillotine Cleave Execution */}
          {cutscene.charId === 'cyrus' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[600px] h-[600px] rounded-full border-4 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.9)]" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <line x1="500" y1="0" x2="500" y2="600" stroke="#ffffff" strokeWidth="8" className="drop-shadow-[0_0_35px_rgba(239,68,68,1)]" />
                <line x1="100" y1="80" x2="900" y2="520" stroke="#ef4444" strokeWidth="5" className="drop-shadow-[0_0_20px_rgba(239,68,68,1)]" />
                <line x1="900" y1="80" x2="100" y2="520" stroke="#ef4444" strokeWidth="5" className="drop-shadow-[0_0_20px_rgba(239,68,68,1)]" />
                <circle cx="500" cy="300" r="120" stroke="#f87171" strokeWidth="3" strokeDasharray="16 8" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/4 animate-pulse">⚔️</div>
            </div>
          )}

          {/* 5. RAVEN: Shadow Scythe Cyclone */}
          {cutscene.charId === 'raven' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[600px] h-[600px] rounded-full border-4 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.9)]" />
              <svg className="w-[600px] h-[600px] overflow-visible anim-shadow-cyclone" viewBox="0 0 200 200" fill="none">
                <path d="M 15 100 A 85 85 0 0 1 185 100" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_30px_rgba(192,132,252,1)]" />
                <path d="M 185 100 A 85 85 0 0 1 15 100" stroke="#818cf8" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_30px_rgba(129,140,248,1)]" />
              </svg>
              <div className="absolute text-3xl top-1/3 left-1/3 animate-spin">🦅</div>
            </div>
          )}

          {/* 6. NEREUS: Abyssal Sea Garden Maelstrom */}
          {cutscene.charId === 'nereus' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[650px] h-[650px] rounded-full border-4 border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.9)]" />
              <div className="anim-water-ripple absolute w-[800px] h-[800px] rounded-full border-2 border-teal-300/60" />
              <svg className="w-[600px] h-[600px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="#38bdf8" strokeWidth="3" strokeDasharray="12 6" />
                <path d="M 25 100 Q 100 15 175 100 Q 100 185 25 100" stroke="#0ea5e9" strokeWidth="6" fill="rgba(14,165,233,0.2)" className="drop-shadow-[0_0_30px_rgba(14,165,233,1)]" />
              </svg>
              <div className="absolute text-3xl bottom-1/4 right-1/4 animate-bounce">🌊</div>
            </div>
          )}

          {/* 7. IVA: Primeval Botanical Roots Awakening */}
          {cutscene.charId === 'iva' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[600px] h-[600px] rounded-full border-4 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.9)]" />
              <div className="anim-thorn-burst absolute inset-0" />
              <svg className="w-[600px] h-[600px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <path d="M 15 185 Q 80 50 185 15" stroke="#10b981" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_30px_rgba(16,185,129,1)]" />
                <path d="M 185 185 Q 120 50 15 15" stroke="#34d399" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_25px_rgba(52,211,153,1)]" />
                <circle cx="100" cy="100" r="75" stroke="#a7f3d0" strokeWidth="2.5" strokeDasharray="8 6" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/3 animate-pulse">🌿</div>
            </div>
          )}

          {/* 8. AELITA: Cosmic Botanical Theorem Mandala */}
          {cutscene.charId === 'aelita' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[650px] h-[650px] rounded-full border-4 border-emerald-300 shadow-[0_0_60px_rgba(52,211,153,0.9)]" />
              <div className="anim-thorn-burst absolute inset-0" />
              <svg className="w-[600px] h-[600px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="85" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" />
                <polygon points="100,15 175,145 25,145" stroke="#6ee7b7" strokeWidth="3.5" fill="rgba(16,185,129,0.2)" className="drop-shadow-[0_0_35px_rgba(16,185,129,1)]" />
                <polygon points="100,185 25,55 175,55" stroke="#a7f3d0" strokeWidth="2.5" fill="rgba(110,231,183,0.15)" />
              </svg>
              <div className="absolute text-3xl top-1/3 left-1/4 animate-spin">📐</div>
            </div>
          )}

          {/* 9. MAESTRO: Symphonic Stave & Clef Lightning */}
          {cutscene.charId === 'maestro' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[600px] h-[600px] rounded-full border-4 border-purple-400 shadow-[0_0_60px_rgba(168,85,247,0.9)]" />
              <div className="anim-soundwave-ring absolute w-[750px] h-[750px] rounded-full border-2 border-fuchsia-300/60" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <path d="M 50 180 Q 500 30 950 180" stroke="#c084fc" strokeWidth="4" className="drop-shadow-[0_0_25px_rgba(192,132,252,1)]" />
                <path d="M 50 300 Q 500 120 950 300" stroke="#ffffff" strokeWidth="5" className="drop-shadow-[0_0_30px_rgba(255,255,255,1)]" />
                <path d="M 50 420 Q 500 270 950 420" stroke="#a855f7" strokeWidth="4" className="drop-shadow-[0_0_25px_rgba(168,85,247,1)]" />
                <circle cx="500" cy="300" r="130" stroke="#e879f9" strokeWidth="3" strokeDasharray="14 7" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/4 animate-bounce">🎼</div>
            </div>
          )}

          {/* 10. INEFFA: Prismatic Solar Mirror Supernova */}
          {cutscene.charId === 'ineffa' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[650px] h-[650px] rounded-full border-4 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.9)]" />
              <div className="anim-mirror-shard absolute inset-0" />
              <svg className="w-[600px] h-[600px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <polygon points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75" stroke="#ffffff" strokeWidth="4" fill="rgba(244,63,94,0.3)" className="drop-shadow-[0_0_35px_rgba(244,63,94,1)]" />
                <polygon points="100,30 150,50 170,100 150,150 100,170 50,150 30,100 50,50" stroke="#f59e0b" strokeWidth="2.5" fill="rgba(251,191,36,0.2)" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/3 animate-spin">🪞</div>
            </div>
          )}
        </div>

        {/* Cinematic Bottom Letterbox Bar */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-40 w-full h-8 sm:h-10 bg-black/85 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-xl shrink-0"
        >
          <div className="text-[9px] sm:text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest truncate max-w-md">
            {config.subtitle}
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </motion.div>

        {/* Phase Whiteout Climax Flash with Gentle Bloom Dissipate */}
        {phase === 'whiteout' && (
          <motion.div
            key="whiteout-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.35, 0] }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], times: [0, 0.15, 0.5, 1] }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}

      </motion.div>
    </AnimatePresence>
  );
});
