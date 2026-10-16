import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCharSplash } from '../../data';
import { cn } from '../../lib/utils';
import { playUltimateBurstSound, playVairenUltimateSound } from '../../lib/sound';

export interface UltimateCutsceneData {
  charId: string;
  charName: string;
  skillName: string;
  element: 'Electro' | 'Cryo' | 'Hydro' | 'Pyro' | 'Dendro' | 'Geo' | 'Physical' | string;
  quote: string;
  duration?: number;
}

// 11 special characters + Fenris + fallbacks
export const ULTIMATE_CHARACTER_CONFIGS: Record<string, { quote: string; title: string; subtitle: string; themeColor: string; bgTint: string; particleColor: string; accentColor: string }> = {
  volta: {
    title: 'ПЕРЕГРУЗКА ВОЛЬТА',
    subtitle: 'Сверхпроводящий Биоэлектрический Коллапс',
    quote: '«Максимальное напряжение в сети! Примите всю мощь биоэлектричества!»',
    themeColor: 'text-yellow-300 border-yellow-400 [text-shadow:0_0_16px_rgba(253,224,71,0.9)]',
    bgTint: 'from-amber-950/40 via-purple-950/30 to-black/60',
    particleColor: 'rgba(253, 224, 71, 0.9)',
    accentColor: '#fde047'
  },
  aveline: {
    title: 'ВЕЧНОЕ ЦВЕТЕНИЕ',
    subtitle: 'Танец Лазурного Лотоса и Океана',
    quote: '«Расцветайте, священные воды! Да наполнится мир чистотой лазури!»',
    themeColor: 'text-pink-200 border-fuchsia-400 [text-shadow:0_0_16px_rgba(236,72,153,0.9)]',
    bgTint: 'from-fuchsia-950/40 via-sky-950/30 to-black/60',
    particleColor: 'rgba(236, 72, 153, 0.9)',
    accentColor: '#f472b6'
  },
  kairen: {
    title: 'ТРОН ВЕЧНОЙ ЗИМЫ',
    subtitle: 'Владыка Первозданного Ледника',
    quote: '«Преклоните колени перед Вечным Престолом Стужи!»',
    themeColor: 'text-sky-200 border-sky-400 [text-shadow:0_0_16px_rgba(56,189,248,0.95)]',
    bgTint: 'from-sky-950/40 via-blue-950/30 to-black/60',
    particleColor: 'rgba(56, 189, 248, 0.9)',
    accentColor: '#38bdf8'
  },
  cyrus: {
    title: 'ПРИГОВОР: КАЗНЬ',
    subtitle: 'Финальный Рапирный Вердикт Дуэлянта',
    quote: '«Дуэль окончена. Приговор окончателен и обжалованию не подлежит!»',
    themeColor: 'text-rose-200 border-red-500 [text-shadow:0_0_16px_rgba(239,68,68,0.95)]',
    bgTint: 'from-red-950/40 via-rose-950/30 to-black/60',
    particleColor: 'rgba(239, 68, 68, 0.9)',
    accentColor: '#ef4444'
  },
  raven: {
    title: 'ТАНЕЦ С ТЕНЬЮ',
    subtitle: 'Вихрь Призрачных Теневых Кос',
    quote: '«Тьма пожирает слабых... Ты даже не успеешь осознать свой конец.»',
    themeColor: 'text-indigo-200 border-purple-400 [text-shadow:0_0_16px_rgba(168,85,247,0.95)]',
    bgTint: 'from-purple-950/40 via-indigo-950/30 to-black/60',
    particleColor: 'rgba(168, 85, 247, 0.9)',
    accentColor: '#a855f7'
  },
  nereus: {
    title: 'САД ВЕЧНОГО МОРЯ',
    subtitle: 'Пробуждение Владыки Бездны',
    quote: '«Глубины океана пробуждаются! Владыка Приливов принимает жертву!»',
    themeColor: 'text-cyan-200 border-cyan-400 [text-shadow:0_0_16px_rgba(34,211,238,0.95)]',
    bgTint: 'from-cyan-950/40 via-teal-950/30 to-black/60',
    particleColor: 'rgba(34, 211, 238, 0.9)',
    accentColor: '#22d3ee'
  },
  iva: {
    title: 'ПРОБУЖДЕНИЕ ФЛОРЫ',
    subtitle: 'Первозданный Дендро-Резонанс',
    quote: '«Корни древнего леса, оплетите врагов! Сила земли непоколебима!»',
    themeColor: 'text-emerald-200 border-emerald-400 [text-shadow:0_0_16px_rgba(16,185,129,0.95)]',
    bgTint: 'from-emerald-950/40 via-green-950/30 to-black/60',
    particleColor: 'rgba(16, 185, 129, 0.9)',
    accentColor: '#10b981'
  },
  aelita: {
    title: 'ТЕОРЕМА О ДИКОЙ ПРИРОДЕ',
    subtitle: 'Сакральная Ботаническая Мандала',
    quote: '«Формула дикой природы совершенна... Доказательство окончено!»',
    themeColor: 'text-lime-200 border-emerald-400 [text-shadow:0_0_16px_rgba(52,211,153,0.95)]',
    bgTint: 'from-emerald-950/40 via-lime-950/30 to-black/60',
    particleColor: 'rgba(52, 211, 153, 0.9)',
    accentColor: '#34d399'
  },
  maestro: {
    title: 'ФИНАЛЬНЫЙ АККОРД',
    subtitle: 'Симфонический Резонанс Изоляции',
    quote: '«Слушайте эту симфонию! Это ваша последняя кода!»',
    themeColor: 'text-purple-200 border-purple-400 [text-shadow:0_0_16px_rgba(192,132,252,0.95)]',
    bgTint: 'from-purple-950/40 via-fuchsia-950/30 to-black/60',
    particleColor: 'rgba(192, 132, 252, 0.9)',
    accentColor: '#c084fc'
  },
  ineffa: {
    title: 'ГИБРИДНАЯ ЭНЕРГИЯ',
    subtitle: 'Сверхновая Солнечного Зеркала',
    quote: '«Зеркала рассвета, соберите весь свет! Вспышка истинного солнца!»',
    themeColor: 'text-amber-200 border-rose-500 [text-shadow:0_0_16px_rgba(244,63,94,0.95)]',
    bgTint: 'from-rose-950/40 via-amber-950/30 to-black/60',
    particleColor: 'rgba(244, 63, 94, 0.9)',
    accentColor: '#f43f5e'
  },
  vairen: {
    title: 'СЕРДЦЕ ДРЕВНЕГО ЛЕСА',
    subtitle: 'Владыка Тёмных Лоз и Семени Мрака',
    quote: '«Тёмные лозы пробуждаются... Почувствуйте биение первозданного леса!»',
    themeColor: 'text-emerald-300 border-emerald-400 [text-shadow:0_0_16px_rgba(16,185,129,0.95)]',
    bgTint: 'from-emerald-950/50 via-teal-950/30 to-black/70',
    particleColor: 'rgba(16, 185, 129, 0.95)',
    accentColor: '#10b981'
  },
  fenris: {
    title: 'ВЕЛИКАЯ ОХОТА',
    subtitle: 'Ярость Первозданной Стаи и Зверя',
    quote: '«Клыки обнажены, добыча загнана! Начинается Великая Охота!»',
    themeColor: 'text-amber-300 border-emerald-400 [text-shadow:0_0_16px_rgba(245,158,11,0.9)]',
    bgTint: 'from-amber-950/45 via-emerald-950/35 to-black/70',
    particleColor: 'rgba(245, 158, 11, 0.95)',
    accentColor: '#f59e0b'
  },
  krona: {
    title: 'ВЕКТОР ВРЕМЕНИ',
    subtitle: 'Сингулярность Абсолютного Застоя и Хроно-Сдвига',
    quote: '«Время подвластно лишь мне... Замрите в вечности ледяного мига!»',
    themeColor: 'text-cyan-200 border-cyan-400 [text-shadow:0_0_16px_rgba(34,211,238,0.95)]',
    bgTint: 'from-cyan-950/60 via-blue-950/40 to-black/80',
    particleColor: 'rgba(34, 211, 238, 0.95)',
    accentColor: '#22d3ee'
  },
  aurum: {
    title: 'ОСКОЛКИ РОСКОШИ',
    subtitle: 'Тектонический Золотой Колосс и Сияние Эгиды',
    quote: '«Золото не ведает ржавчины! Узрите несокрушимое сияние богатства!»',
    themeColor: 'text-amber-200 border-yellow-400 [text-shadow:0_0_16px_rgba(251,191,36,0.95)]',
    bgTint: 'from-amber-950/60 via-yellow-950/40 to-black/80',
    particleColor: 'rgba(251, 191, 36, 0.95)',
    accentColor: '#f59e0b'
  },
  zephyr: {
    title: 'ЗЕРКАЛЬНЫЙ ШТОРМ',
    subtitle: 'Призма Иллюзий и Грозовой Сверхпроводник',
    quote: '«Разве ты видишь меня? Гроза отражается в тысяче зеркал... Исчезни!»',
    themeColor: 'text-purple-200 border-fuchsia-400 [text-shadow:0_0_16px_rgba(192,132,252,0.95)]',
    bgTint: 'from-purple-950/60 via-fuchsia-950/40 to-black/80',
    particleColor: 'rgba(192, 132, 252, 0.95)',
    accentColor: '#c084fc'
  }
};

export const UltimateCutsceneOverlay: React.FC<{
  cutscene: UltimateCutsceneData | null;
  fastMode?: boolean;
  onImpact?: () => void;
  onComplete: () => void;
}> = React.memo(({ cutscene, fastMode = false, onImpact, onComplete }) => {
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
    if (cutscene.charId === 'vairen') {
      playVairenUltimateSound();
    } else {
      playUltimateBurstSound();
    }

    const t1Delay = fastMode ? 120 : 220;
    const t2Delay = fastMode ? 380 : 700;
    const t3Delay = fastMode ? 600 : 1150;

    const t1 = setTimeout(() => {
      setPhase('climax');
    }, t1Delay);

    const t2 = setTimeout(() => {
      setPhase('whiteout');
      triggerImpact();
    }, t2Delay);

    const t3 = setTimeout(() => {
      handleFinish();
    }, t3Delay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cutscene?.charId, cutscene?.skillName, fastMode, triggerImpact, handleFinish]);

  if (!cutscene) return null;

  const config = ULTIMATE_CHARACTER_CONFIGS[cutscene.charId] || {
    title: cutscene.skillName.toUpperCase(),
    subtitle: 'Абсолютный Спецнавык',
    quote: cutscene.quote,
    themeColor: 'text-white border-white [text-shadow:0_0_14px_rgba(255,255,255,0.8)]',
    bgTint: 'from-indigo-950/60 to-black/80',
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
        transition={{ duration: 0.15 }}
        onClick={handleFinish}
        style={{
          transform: 'translateZ(0)',
          contain: 'strict',
          willChange: 'opacity'
        }}
        className="fixed inset-0 z-[120] pointer-events-auto flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer bg-[#050609] cutscene-gpu-layer"
      >
        
        {/* Darkened Battlefield Backdrop with Dynamic Elemental Vignette (Solid opaque layer for hardware culling) */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b transition-colors pointer-events-none opacity-85",
            config.bgTint
          )}
        />

        {/* Ambient Radial Energy Core (Hardware-accelerated CSS gradient with NO filter: blur) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] rounded-full pointer-events-none opacity-40 transition-opacity duration-300"
          style={{ background: `radial-gradient(ellipse at center, ${config.particleColor} 0%, transparent 70%)` }}
        />

        {/* Cinematic Top Letterbox Bar */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-40 w-full h-9 sm:h-11 bg-[#090a0f] border-b border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-2xl shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.25em] text-white/90">
              TIME FREEZE • ULTIMATE BURST
            </span>
          </div>
          <div className="flex items-center gap-3 text-[9px] sm:text-[11px] font-mono text-white/70 tracking-widest uppercase">
            <span>{cutscene.element} RESONANCE</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-yellow-300 text-[9px] font-bold border border-white/15">
              ПРОПУСК: КЛИК
            </span>
          </div>
        </motion.div>

        {/* Dynamic Character Cut-in Banner in Upper Field */}
        <div className="relative z-30 w-full max-w-5xl px-4 sm:px-6 flex items-center justify-center my-auto">
          <motion.div
            initial={{ scale: 0.92, y: -15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full relative flex flex-col md:flex-row items-center gap-4 sm:gap-8 bg-[#0a0c12]/95 p-3 sm:p-5 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/10"
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
                className="absolute inset-0 rounded-2xl border-2"
                style={{ borderColor: config.accentColor }}
              />
              {splash ? (
                <img
                  src={splash}
                  alt={cutscene.charName}
                  className="w-full h-full object-cover rounded-2xl border-2 border-white/60 shadow-xl"
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
                <p className="text-[11px] sm:text-xs font-sans italic text-white/90 leading-snug">
                  {config.quote}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Battlefield-Spanning Fullscreen Vector VFX Layer (Optimized vector rendering without CPU filter drop-shadows) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
          
          {/* 1. VOLTA */}
          {cutscene.charId === 'volta' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[360px] h-[360px] rounded-full border-2 border-yellow-300" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <path d="M 0 300 L 250 150 L 400 400 L 600 200 L 750 450 L 1000 300" stroke="#fde047" strokeWidth="14" opacity="0.25" strokeLinecap="round" />
                <path d="M 0 300 L 250 150 L 400 400 L 600 200 L 750 450 L 1000 300" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
                <path d="M 1000 300 L 750 150 L 600 400 L 400 200 L 250 450 L 0 300" stroke="#c084fc" strokeWidth="12" opacity="0.25" strokeLinecap="round" />
                <path d="M 1000 300 L 750 150 L 600 400 L 400 200 L 250 450 L 0 300" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
                <circle cx="500" cy="300" r="140" stroke="#fde047" strokeWidth="2.5" strokeDasharray="12 8" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute top-1/4 left-1/4 text-3xl">⚡</div>
              <div className="absolute bottom-1/4 right-1/4 text-3xl">⚡</div>
            </div>
          )}

          {/* 2. AVELINE */}
          {cutscene.charId === 'aveline' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[360px] h-[360px] rounded-full border-2 border-fuchsia-400" />
              <svg className="w-[500px] h-[500px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="85" stroke="#f472b6" strokeWidth="2" strokeDasharray="8 6" opacity="0.7" />
                <polygon points="100,10 125,75 190,100 125,125 100,190 75,125 10,100 75,75" stroke="#38bdf8" strokeWidth="8" opacity="0.25" fill="rgba(244,114,182,0.2)" />
                <polygon points="100,10 125,75 190,100 125,125 100,190 75,125 10,100 75,75" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                <circle cx="100" cy="100" r="35" stroke="#ffffff" strokeWidth="2" fill="rgba(56,189,248,0.25)" />
              </svg>
              <div className="absolute text-4xl top-1/3 left-1/4">🌸</div>
            </div>
          )}

          {/* 3. KAIREN */}
          {cutscene.charId === 'kairen' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-sky-300" />
              <svg className="w-[500px] h-[500px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <polygon points="100,10 120,175 100,190 80,175" fill="rgba(224,242,254,0.4)" stroke="#bae6fd" strokeWidth="8" opacity="0.3" />
                <polygon points="100,10 120,175 100,190 80,175" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <polygon points="55,45 72,165 55,178 38,165" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2" />
                <polygon points="145,45 162,165 145,178 128,165" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="100" cy="100" r="70" stroke="#bae6fd" strokeWidth="2" strokeDasharray="10 6" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl bottom-1/4 left-1/3">👑</div>
            </div>
          )}

          {/* 4. CYRUS */}
          {cutscene.charId === 'cyrus' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-red-500" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <line x1="500" y1="0" x2="500" y2="600" stroke="#ef4444" strokeWidth="16" opacity="0.25" />
                <line x1="500" y1="0" x2="500" y2="600" stroke="#ffffff" strokeWidth="5" />
                <line x1="100" y1="80" x2="900" y2="520" stroke="#ef4444" strokeWidth="3" opacity="0.8" />
                <line x1="900" y1="80" x2="100" y2="520" stroke="#ef4444" strokeWidth="3" opacity="0.8" />
                <circle cx="500" cy="300" r="120" stroke="#f87171" strokeWidth="2.5" strokeDasharray="16 8" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/4">⚔️</div>
            </div>
          )}

          {/* 5. RAVEN */}
          {cutscene.charId === 'raven' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-purple-500" />
              <svg className="w-[500px] h-[500px] overflow-visible anim-shadow-cyclone" viewBox="0 0 200 200" fill="none">
                <path d="M 15 100 A 85 85 0 0 1 185 100" stroke="#c084fc" strokeWidth="14" opacity="0.25" strokeLinecap="round" />
                <path d="M 15 100 A 85 85 0 0 1 185 100" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <path d="M 185 100 A 85 85 0 0 1 15 100" stroke="#818cf8" strokeWidth="14" opacity="0.25" strokeLinecap="round" />
                <path d="M 185 100 A 85 85 0 0 1 15 100" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="absolute text-3xl top-1/3 left-1/3">🦅</div>
            </div>
          )}

          {/* 6. NEREUS */}
          {cutscene.charId === 'nereus' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-cyan-400" />
              <svg className="w-[500px] h-[500px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="12 6" />
                <path d="M 25 100 Q 100 15 175 100 Q 100 185 25 100" stroke="#0ea5e9" strokeWidth="14" opacity="0.25" fill="none" />
                <path d="M 25 100 Q 100 15 175 100 Q 100 185 25 100" stroke="#0ea5e9" strokeWidth="4" fill="rgba(14,165,233,0.2)" />
              </svg>
              <div className="absolute text-3xl bottom-1/4 right-1/4">🌊</div>
            </div>
          )}

          {/* 7. IVA */}
          {cutscene.charId === 'iva' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-emerald-400" />
              <svg className="w-[500px] h-[500px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <path d="M 15 185 Q 80 50 185 15" stroke="#10b981" strokeWidth="14" opacity="0.25" strokeLinecap="round" />
                <path d="M 15 185 Q 80 50 185 15" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                <path d="M 185 185 Q 120 50 15 15" stroke="#34d399" strokeWidth="12" opacity="0.25" strokeLinecap="round" />
                <path d="M 185 185 Q 120 50 15 15" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="100" cy="100" r="75" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="8 6" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/3">🌿</div>
            </div>
          )}

          {/* 8. AELITA */}
          {cutscene.charId === 'aelita' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-emerald-300" />
              <svg className="w-[500px] h-[500px] overflow-visible anim-bloom-rotate" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="85" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
                <polygon points="100,15 175,145 25,145" stroke="#6ee7b7" strokeWidth="8" opacity="0.25" fill="none" />
                <polygon points="100,15 175,145 25,145" stroke="#6ee7b7" strokeWidth="2.5" fill="rgba(16,185,129,0.2)" />
                <polygon points="100,185 25,55 175,55" stroke="#a7f3d0" strokeWidth="2" fill="rgba(110,231,183,0.15)" />
              </svg>
              <div className="absolute text-3xl top-1/3 left-1/4">📐</div>
            </div>
          )}

          {/* 9. MAESTRO */}
          {cutscene.charId === 'maestro' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-purple-400" />
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 600" fill="none">
                <path d="M 50 180 Q 500 30 950 180" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
                <path d="M 50 300 Q 500 120 950 300" stroke="#ffffff" strokeWidth="12" opacity="0.2" />
                <path d="M 50 300 Q 500 120 950 300" stroke="#ffffff" strokeWidth="4" />
                <path d="M 50 420 Q 500 270 950 420" stroke="#a855f7" strokeWidth="3" opacity="0.8" />
                <circle cx="500" cy="300" r="130" stroke="#e879f9" strokeWidth="2.5" strokeDasharray="14 7" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/4">🎼</div>
            </div>
          )}

          {/* 10. INEFFA */}
          {cutscene.charId === 'ineffa' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[380px] h-[380px] rounded-full border-2 border-rose-500" />
              <svg className="w-[500px] h-[500px] overflow-visible" viewBox="0 0 200 200" fill="none">
                <polygon points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75" stroke="#ffffff" strokeWidth="10" opacity="0.25" fill="none" />
                <polygon points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75" stroke="#ffffff" strokeWidth="3" fill="rgba(244,63,94,0.3)" />
                <polygon points="100,30 150,50 170,100 150,150 100,170 50,150 30,100 50,50" stroke="#f59e0b" strokeWidth="2" fill="rgba(251,191,36,0.2)" className="anim-bloom-rotate" />
              </svg>
              <div className="absolute text-3xl top-1/4 right-1/3">🪞</div>
            </div>
          )}

          {/* 11. VAIREN */}
          {cutscene.charId === 'vairen' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[400px] h-[400px] rounded-full border-2 border-emerald-400" />
              <svg className="w-[520px] h-[520px] overflow-visible" viewBox="0 0 200 200" fill="none">
                {/* Ancient coiled thorny vines */}
                <path d="M 10 190 Q 60 70 100 100 T 190 10" stroke="#047857" strokeWidth="16" opacity="0.3" strokeLinecap="round" />
                <path d="M 10 190 Q 60 70 100 100 T 190 10" stroke="#047857" strokeWidth="5" strokeLinecap="round" />
                <path d="M 190 190 Q 140 70 100 100 T 10 10" stroke="#10b981" strokeWidth="14" opacity="0.3" strokeLinecap="round" />
                <path d="M 190 190 Q 140 70 100 100 T 10 10" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                {/* Dark blooming mandala */}
                <circle cx="100" cy="100" r="85" stroke="#34d399" strokeWidth="2.5" strokeDasharray="10 5" className="anim-bloom-rotate" />
                <circle cx="100" cy="100" r="45" stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="6 4" />
                {/* Central dark blossom heart */}
                <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" stroke="#059669" strokeWidth="2.5" fill="rgba(16,185,129,0.3)" />
              </svg>
              <div className="absolute text-4xl top-1/4 left-1/3">🥀</div>
              <div className="absolute text-3xl bottom-1/4 right-1/3">🌿</div>
            </div>
          )}

          {/* 12. FENRIS */}
          {cutscene.charId === 'fenris' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[400px] h-[400px] rounded-full border-2 border-amber-400" />
              <svg className="w-[520px] h-[520px] overflow-visible" viewBox="0 0 200 200" fill="none">
                {/* Beast Claw Slash Marks */}
                <path d="M 40 20 L 70 180" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
                <path d="M 85 10 L 115 190" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" opacity="0.95" />
                <path d="M 130 20 L 160 180" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
                {/* Dendro Wild Hunter Rune Ring */}
                <circle cx="100" cy="100" r="85" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 6" className="anim-bloom-rotate" />
                <polygon points="100,30 160,100 100,170 40,100" stroke="#34d399" strokeWidth="2" fill="rgba(16,185,129,0.2)" />
              </svg>
              <div className="absolute text-4xl top-1/4 right-1/3">🐺</div>
              <div className="absolute text-3xl bottom-1/4 left-1/3">🏹</div>
            </div>
          )}

          {/* 13. KRONA */}
          {cutscene.charId === 'krona' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[420px] h-[420px] rounded-full border-2 border-cyan-400" />
              <div className="anim-shockwave-ring absolute w-[260px] h-[260px] rounded-full border border-sky-300" style={{ animationDelay: '0.08s' }} />
              <svg className="w-[520px] h-[520px] overflow-visible" viewBox="0 0 200 200" fill="none">
                {/* Rotating Roman Dial & Chrono Rings */}
                <circle cx="100" cy="100" r="90" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="16 8" className="anim-bloom-rotate" />
                <circle cx="100" cy="100" r="70" stroke="#e0f2fe" strokeWidth="1.5" strokeDasharray="8 4" className="anim-bloom-rotate" style={{ animationDirection: 'reverse' }} />
                {/* Frozen Clock Hands */}
                <line x1="100" y1="100" x2="100" y2="15" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
                <line x1="100" y1="100" x2="165" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                {/* Hourglass Cryo Prism Core */}
                <polygon points="70,40 130,40 100,100 130,160 70,160 100,100" stroke="#0284c7" strokeWidth="2.5" fill="rgba(6,182,212,0.25)" className="anim-impact-burst drop-shadow-[0_0_18px_rgba(34,211,238,1)]" />
                <circle cx="100" cy="100" r="12" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
              </svg>
              <div className="absolute text-4xl top-1/4 left-1/3">⏳</div>
              <div className="absolute text-3xl bottom-1/4 right-1/3">❄️</div>
            </div>
          )}

          {/* 14. AURUM */}
          {cutscene.charId === 'aurum' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[420px] h-[420px] rounded-full border-2 border-yellow-400" />
              <div className="anim-shockwave-ring absolute w-[280px] h-[280px] rounded-full border border-amber-300" style={{ animationDelay: '0.08s' }} />
              <svg className="w-[520px] h-[520px] overflow-visible" viewBox="0 0 200 200" fill="none">
                {/* Octagonal Golden Aegis Monolith */}
                <polygon points="100,12 165,38 190,100 165,162 100,188 35,162 10,100 35,38" stroke="#fbbf24" strokeWidth="4" fill="rgba(245,158,11,0.25)" className="drop-shadow-[0_0_24px_rgba(251,191,36,1)]" />
                <circle cx="100" cy="100" r="68" stroke="#fde047" strokeWidth="2" strokeDasharray="12 6" className="anim-bloom-rotate" />
                {/* Tectonic Gilded Crystal Pillars */}
                <polygon points="45,55 65,155 45,170 25,155" fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth="2" />
                <polygon points="155,55 175,155 155,170 135,155" fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth="2" />
                {/* Central Brilliant Wealth Diamond */}
                <polygon points="100,45 130,85 100,125 70,85" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" className="anim-impact-burst drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
                <circle cx="100" cy="85" r="10" fill="#eab308" />
              </svg>
              <div className="absolute text-4xl top-1/4 right-1/3">🪙</div>
              <div className="absolute text-3xl bottom-1/4 left-1/3">👑</div>
            </div>
          )}

          {/* 15. ZEPHYR */}
          {cutscene.charId === 'zephyr' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[420px] h-[420px] rounded-full border-2 border-purple-500" />
              <div className="anim-shockwave-ring absolute w-[260px] h-[260px] rounded-full border border-fuchsia-400" style={{ animationDelay: '0.08s' }} />
              <svg className="w-[520px] h-[520px] overflow-visible" viewBox="0 0 200 200" fill="none">
                {/* Prismatic Mirror Rhombus Cluster */}
                <polygon points="100,15 175,100 100,185 25,100" stroke="#c084fc" strokeWidth="3" fill="rgba(147,51,234,0.22)" className="drop-shadow-[0_0_20px_rgba(192,132,252,1)]" />
                <circle cx="100" cy="100" r="82" stroke="#e879f9" strokeWidth="2" strokeDasharray="14 7" className="anim-bloom-rotate" />
                {/* High-Voltage Electro Lightning Bolts */}
                <path d="M 30 25 L 75 80 L 55 100 L 120 180" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_0_14px_rgba(255,255,255,1)]" />
                <path d="M 170 25 L 125 80 L 145 100 L 80 180" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_16px_rgba(168,85,247,1)]" />
                {/* Inner Prismatic Refraction Core */}
                <polygon points="100,60 125,100 100,140 75,100" fill="#ffffff" stroke="#9333ea" strokeWidth="2" className="anim-impact-burst drop-shadow-[0_0_18px_rgba(255,255,255,1)]" />
                <circle cx="100" cy="100" r="14" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
              </svg>
              <div className="absolute text-4xl top-1/4 left-1/3">⚡</div>
              <div className="absolute text-3xl bottom-1/4 right-1/3">🪞</div>
            </div>
          )}
        </div>

        {/* Cinematic Bottom Letterbox Bar */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-40 w-full h-8 sm:h-10 bg-[#090a0f] border-t border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-2xl shrink-0"
        >
          <div className="text-[9px] sm:text-[11px] font-mono font-bold text-white/60 uppercase tracking-widest truncate max-w-md">
            {config.subtitle}
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 h-3 bg-white/40 rounded-full" />
            ))}
          </div>
        </motion.div>

        {/* Phase Whiteout Climax Flash (Lightweight opacity pulse) */}
        {phase === 'whiteout' && (
          <motion.div
            key="whiteout-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}

      </motion.div>
    </AnimatePresence>
  );
});
