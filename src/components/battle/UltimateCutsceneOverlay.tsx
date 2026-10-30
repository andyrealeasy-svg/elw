import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCharEmoji, getCharSplash } from '../../data';
import { cn } from '../../lib/utils';
import { playUltimateBurstSound, playVairenUltimateSound, playHofmannitaUltimateSound, playSignatureCombatSound } from '../../lib/sound';

export interface UltimateCutsceneData {
  charId: string;
  charName: string;
  skillName: string;
  element: 'Electro' | 'Cryo' | 'Hydro' | 'Pyro' | 'Dendro' | 'Geo' | 'Physical' | string;
  quote: string;
  duration?: number;
}

// Unique ultimate cutscene themes with a generic fallback for other characters.
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
  },
  selva: {
    title: 'РЕЖИМ БОГА',
    subtitle: 'Аркадный разряд • рейтинг на максимуме',
    quote: '«Секретный уровень разблокирован. Ну что, готовы к финальному боссу?»',
    themeColor: 'text-fuchsia-200 border-fuchsia-400 [text-shadow:0_0_18px_rgba(232,121,249,0.95)]',
    bgTint: 'from-fuchsia-950/60 via-violet-950/40 to-black/80',
    particleColor: 'rgba(232, 121, 249, 0.95)',
    accentColor: '#e879f9'
  },
  moyan: {
    title: 'ОЖИВЛЕНИЕ РУКОПИСИ',
    subtitle: 'Золотая печать • гео-чернила древнего контракта',
    quote: '«Пусть каждая строка станет опорой, а каждый знак — защитой.»',
    themeColor: 'text-amber-100 border-amber-400 [text-shadow:0_0_18px_rgba(251,191,36,0.95)]',
    bgTint: 'from-amber-950/60 via-yellow-950/35 to-black/80',
    particleColor: 'rgba(251, 191, 36, 0.95)',
    accentColor: '#fbbf24'
  },
  neuron: {
    title: 'НЕЙРОСЕТЕВОЙ СИНАПС',
    subtitle: 'Квантовый контур • все связи активны',
    quote: '«Связи найдены. Система синхронизирована. Запускаю каскадный импульс!»',
    themeColor: 'text-indigo-100 border-indigo-400 [text-shadow:0_0_18px_rgba(129,140,248,0.95)]',
    bgTint: 'from-indigo-950/60 via-blue-950/40 to-black/80',
    particleColor: 'rgba(129, 140, 248, 0.95)',
    accentColor: '#818cf8'
  },
  selina: {
    title: 'АЛЫЙ ВАЛЬС РОЗ',
    subtitle: 'Пламенный бутон • танец лепестков',
    quote: '«Пусть каждый лепесток вспыхнет алым пламенем!»',
    themeColor: 'text-rose-100 border-rose-400 [text-shadow:0_0_18px_rgba(251,113,133,0.95)]',
    bgTint: 'from-rose-950/60 via-red-950/40 to-black/80',
    particleColor: 'rgba(251, 113, 133, 0.95)',
    accentColor: '#fb7185'
  },
  asher: {
    title: 'СЕРДЦЕ ПЕЧИ',
    subtitle: 'Тлеющая связь • корни несокрушимости',
    quote: '«Пламя не погаснет, пока корни держат землю.»',
    themeColor: 'text-emerald-100 border-emerald-400 [text-shadow:0_0_18px_rgba(52,211,153,0.95)]',
    bgTint: 'from-emerald-950/60 via-lime-950/35 to-black/80',
    particleColor: 'rgba(110, 231, 183, 0.95)',
    accentColor: '#6ee7b7'
  },
  hofmannita: {
    title: 'КЛУБ НА КРАЮ КЛАДБИЩА',
    subtitle: 'MAIN STAGE • OVERDRIVE',
    quote: '«На сцену! ХАЙП на пике — этот клуб не закроется!»',
    themeColor: 'text-fuchsia-200 border-fuchsia-400 [text-shadow:0_0_18px_rgba(232,121,249,0.95)]',
    bgTint: 'from-fuchsia-950/60 via-violet-950/50 to-black/80',
    particleColor: 'rgba(232, 121, 249, 0.95)',
    accentColor: '#e879f9'
  },
  cmh: {
    title: 'CRAZY MEGA HELL',
    subtitle: 'FULL RAVE • FINAL DROP',
    quote: '«Громче! Этот бит разнесёт всю сцену!»',
    themeColor: 'text-orange-100 border-red-400 [text-shadow:0_0_18px_rgba(249,115,22,0.95)]',
    bgTint: 'from-red-950/70 via-orange-950/45 to-black/85',
    particleColor: 'rgba(249, 115, 22, 0.95)',
    accentColor: '#f97316'
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
    if (cutscene.charId === 'cmh' || cutscene.charId === 'iva' || cutscene.charId === 'nereus' || cutscene.charId === 'kairen' || cutscene.charId === 'aveline' || cutscene.charId === 'volta' || cutscene.charId === 'selina' || cutscene.charId === 'asher' || cutscene.charId === 'ineffa' || cutscene.charId === 'fenris' || cutscene.charId === 'zephyr' || cutscene.charId === 'aurum' || cutscene.charId === 'aelita' || cutscene.charId === 'maestro' || cutscene.charId === 'cyrus' || cutscene.charId === 'raven') {
      playSignatureCombatSound(cutscene.charId, 'ultimate');
    } else if (cutscene.charId === 'hofmannita') {
      playHofmannitaUltimateSound();
    } else if (cutscene.charId === 'vairen') {
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
                  {getCharEmoji(cutscene.charId)}
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
          
          {cutscene.charId === 'hofmannita' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[min(78vw,520px)] aspect-square rounded-full border-2 border-fuchsia-300/80 shadow-[0_0_45px_rgba(232,121,249,0.5)]" />
              <div className="anim-bloom-rotate absolute w-[min(62vw,410px)] aspect-square rounded-full border border-violet-300/70 border-dashed" />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <path d="M 0 300 L 170 300 L 205 245 L 250 360 L 300 180 L 345 420 L 390 275 L 430 300 L 1000 300" stroke="#e879f9" strokeWidth="5" opacity="0.8" className="anim-ice-slash" />
                <path d="M 0 330 L 1000 330" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="14 12" opacity="0.65" />
              </svg>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.9, 1.05, 1], opacity: [0, 1, 0.85] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute text-4xl sm:text-6xl font-black italic tracking-[0.25em] text-fuchsia-100 [text-shadow:0_0_20px_rgba(232,121,249,0.9)]"
              >
                DROP
              </motion.div>
            </div>
          )}

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

          {cutscene.charId === 'selina' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[min(70vw,440px)] aspect-square rounded-full border-2 border-rose-300/70 shadow-[0_0_45px_rgba(244,63,94,0.4)]" />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <circle cx="500" cy="300" r="210" stroke="#fb7185" strokeWidth="2" strokeDasharray="12 9" className="anim-bloom-rotate" />
                <circle cx="500" cy="300" r="160" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="4 10" />
                <path d="M500 430C455 368 380 333 402 267C419 220 469 237 500 280C531 237 581 220 598 267C620 333 545 368 500 430Z" fill="rgba(225,29,72,0.18)" stroke="#ffe4e6" strokeWidth="4" />
                <path d="M500 429V520M495 476L455 453M505 492L547 463" stroke="#86efac" strokeWidth="5" strokeLinecap="round" />
                <path d="M500 85V150M260 300H325M675 300H740M330 130L376 176M624 424L670 470M670 130L624 176M376 424L330 470" stroke="#fda4af" strokeWidth="3" strokeLinecap="round" />
                <path d="M155 195C280 125 360 170 410 233M845 405C720 475 640 430 590 367" stroke="#fb7185" strokeWidth="3" strokeDasharray="8 10" />
              </svg>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.8, 1.05, 1], opacity: [0, 0.9, 0.75] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute bottom-[18%] rounded-full border border-rose-200/50 bg-black/50 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-rose-100"
              >
                Petals ignite
              </motion.div>
            </div>
          )}

          {cutscene.charId === 'asher' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[min(70vw,440px)] aspect-square rounded-full border-2 border-emerald-300/70 shadow-[0_0_45px_rgba(16,185,129,0.4)]" />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <circle cx="500" cy="300" r="205" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="10 8" className="anim-bloom-rotate" />
                <path d="M500 470V175M500 365C390 365 338 285 360 215C439 218 492 278 500 365ZM500 298C605 298 665 213 637 145C555 154 505 216 500 298Z" fill="rgba(16,185,129,0.12)" stroke="#a7f3d0" strokeWidth="6" strokeLinecap="round" />
                <path d="M250 420C340 380 390 380 455 415M750 420C660 380 610 380 545 415M300 190L375 245M700 190L625 245" stroke="#d9f99d" strokeWidth="4" strokeLinecap="round" />
                <path d="M270 300C330 250 385 255 425 295M730 300C670 250 615 255 575 295" stroke="#34d399" strokeWidth="5" strokeDasharray="9 8" />
                <circle cx="500" cy="300" r="26" fill="rgba(132,204,22,0.3)" stroke="#ecfccb" strokeWidth="3" />
              </svg>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.8, 1.05, 1], opacity: [0, 0.9, 0.75] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute bottom-[18%] rounded-full border border-emerald-200/50 bg-black/50 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-emerald-100"
              >
                The hearth holds
              </motion.div>
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

          {cutscene.charId === 'selva' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.85, 1.08, 1], opacity: [0, 1, 0.9] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute rounded-2xl border-2 border-fuchsia-300/70 bg-fuchsia-950/20 shadow-[0_0_45px_rgba(217,70,239,0.5)] w-[min(78vw,500px)] aspect-square"
              />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <path d="M100 100H300V220H430V100H650V240H870V120H960M100 500H240V380H500V500H700V360H900V500" stroke="#e879f9" strokeWidth="5" strokeDasharray="12 10" className="anim-ice-slash" />
                <path d="M500 40L530 250L700 180L585 315L790 365L570 390L640 560L500 440L360 560L430 390L210 365L415 315L300 180L470 250Z" stroke="#f5d0fe" strokeWidth="3" fill="rgba(192,38,211,0.16)" className="anim-bloom-rotate" />
                <rect x="450" y="250" width="100" height="100" rx="10" stroke="#ffffff" strokeWidth="3" fill="rgba(217,70,239,0.25)" />
                <path d="M475 275H495V295H475ZM505 305H525V325H505Z" fill="#fdf4ff" />
              </svg>
              <div className="absolute text-4xl sm:text-6xl font-black italic tracking-[0.2em] text-fuchsia-100 [text-shadow:0_0_24px_rgba(232,121,249,1)]">MAX COMBO</div>
            </div>
          )}

          {cutscene.charId === 'moyan' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[min(72vw,460px)] aspect-square rounded-full border-2 border-amber-300/80 shadow-[0_0_40px_rgba(245,158,11,0.5)]" />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <path d="M230 115H770V485H230Z" stroke="#fbbf24" strokeWidth="3" strokeDasharray="15 8" className="anim-bloom-rotate" />
                <path d="M330 190C405 150 465 155 525 195M330 260C420 220 500 225 625 265M330 330C420 290 525 300 665 335M350 400C430 365 540 365 640 410" stroke="#fef3c7" strokeWidth="7" strokeLinecap="round" />
                <path d="M500 135L545 300L500 465L455 300Z" fill="rgba(217,119,6,0.2)" stroke="#fde68a" strokeWidth="3" />
                <circle cx="500" cy="300" r="22" fill="#b45309" stroke="#fff7ed" strokeWidth="3" />
              </svg>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: [0, 1, 0.9], y: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute bottom-[18%] rounded-full border border-amber-200/50 bg-black/60 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-[0.28em] text-amber-100"
              >
                The contract is sealed
              </motion.div>
            </div>
          )}

          {cutscene.charId === 'neuron' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="anim-shockwave-ring absolute w-[min(72vw,460px)] aspect-square rounded-full border-2 border-indigo-300/80 shadow-[0_0_42px_rgba(99,102,241,0.55)]" />
              <svg className="absolute w-full h-full" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="none">
                <circle cx="500" cy="300" r="190" stroke="#818cf8" strokeWidth="2" strokeDasharray="10 8" className="anim-bloom-rotate" />
                <circle cx="500" cy="300" r="125" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 7" />
                <path d="M170 180L340 250L500 130L660 250L830 180M170 420L340 350L500 470L660 350L830 420M340 250L340 350M660 250L660 350M340 250L500 300L660 250M340 350L500 300L660 350" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
                <path d="M490 220L455 305H490L470 385L545 280H505L530 220Z" fill="#6366f1" stroke="#e0e7ff" strokeWidth="3" strokeLinejoin="round" />
                {[170, 340, 500, 660, 830].map((x, index) => (
                  <circle key={x} cx={x} cy={index % 2 === 0 ? 180 : 250} r="11" fill="#312e81" stroke="#c7d2fe" strokeWidth="3" />
                ))}
                {[170, 340, 500, 660, 830].map((x, index) => (
                  <circle key={`lower-${x}`} cx={x} cy={index % 2 === 0 ? 420 : 350} r="9" fill="#4338ca" stroke="#e0e7ff" strokeWidth="2" />
                ))}
              </svg>
              <div className="absolute rounded-full border border-indigo-200/40 bg-[#080b25]/80 px-5 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-indigo-100 shadow-[0_0_24px_rgba(99,102,241,0.6)]">
                Neural link established
              </div>
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
