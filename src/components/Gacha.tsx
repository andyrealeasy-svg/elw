import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { ArrowLeft, Sparkles, Gem, Star, SkipForward } from 'lucide-react';
import { baseCharacterPool, characterBlueprints, charRarity, getCharEmoji, getCharSplash } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBack: () => void;
}

type PullResult = {
  charId: string;
  charName: string;
  rarity: "B" | "A" | "S";
  isNew: boolean;
  constellation: number;
  refunded: number;
  element: string;
  won5050?: boolean | null;
};

export default function Gacha({ profile, updateProfile, onBack }: Props) {
  const [activeBanner, setActiveBanner] = useState<'STANDARD' | 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM'>('STANDARD');
  
  const permanentBanners: ('SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM')[] = ['SELINA', 'KRONA', 'ASHER', 'CYRUS', 'RAVEN', 'MAESTRO', 'INEFFA', 'ZEPHYR', 'AURUM'];
  const allAvailableBanners = permanentBanners;

  const bannerDisplayDetails = {
    STANDARD: {
      title: "ЭХО ВРЕМЕНИ",
      subtitle: "КОСМИЧЕСКИЙ ПЕРЕКРЕСТОК",
      sId: "aelita",
      sName: "Аэлита",
      sElement: "Dendro",
      sThemeColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/40",
      sBgAccent: "from-indigo-600/20 to-transparent",
      desc: "Стандартная молитва. Содержит всех героев в равной пропорции! Теперь доступен S-ранг Фенрис!",
      aRateUps: ["viper", "aegis", "blaze", "tide", "glacier", "pulse", "claymore", "echo", "gotka", "kopro", "patch", "neuron", "selva", "moyan", "fenris"] as string[]
    },
    KRONA: {
      title: "ПЕСКИ ВЕЧНОСТИ",
      subtitle: "Хроно-контроль и Крио власть",
      sId: "krona",
      sName: "Крона",
      sElement: "Cryo",
      sThemeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
      sBgAccent: "from-cyan-600/20 to-transparent",
      desc: "Шанс на получение Кроны [S] увеличен! Также повышен шанс на Глетчер [A] и Минёра [A]!",
      aRateUps: ["glacier", "claymore"] as string[]
    },
    SELINA: {
      title: "ПЛАМЕННАЯ РОЗА",
      subtitle: "Алая Роза распускается во тьме",
      sId: "selina",
      sName: "Селина",
      sElement: "Pyro",
      sThemeColor: "text-rose-400 border-rose-500/40 bg-rose-950/40",
      sBgAccent: "from-rose-600/20 to-transparent",
      desc: "Шанс на получение Селины [S] увеличен! Также повышен шанс на Блэйза [A]!",
      aRateUps: ["blaze"] as string[]
    },
    ASHER: {
      title: "ПЛАВКА ПЕПЛА",
      subtitle: "Мастер Дыхания Горна",
      sId: "asher",
      sName: "Ашер",
      sElement: "Dendro",
      sThemeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
      sBgAccent: "from-emerald-600/20 to-transparent",
      desc: "Шанс на получение Ашера [S] увеличен! Идеальный саппорт для Селины!",
      aRateUps: ["patch", "viper"] as string[]
    },
    CYRUS: {
      title: "ПРИЦЕЛ ОХОТНИКА",
      subtitle: "Хладнокровный Дуэлянт",
      sId: "cyrus",
      sName: "Сайрус",
      sElement: "Physical",
      sThemeColor: "text-red-400 border-red-500/40 bg-red-950/40",
      sBgAccent: "from-red-600/20 to-transparent",
      desc: "Шанс на получение Сайруса [S] увеличен! Точечный Physical урон.",
      aRateUps: ["nova", "claymore"] as string[]
    },
    RAVEN: {
      title: "ТИШИНА НОЧИ",
      subtitle: "Изоляция Цели",
      sId: "raven",
      sName: "Рейвен",
      sElement: "Electro",
      sThemeColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/40",
      sBgAccent: "from-indigo-600/20 to-transparent",
      desc: "Шанс на получение Рейвена [S] увеличен! Идеальный массовый Электро урон.",
      aRateUps: ["gotka", "spark"] as string[]
    },
    MAESTRO: {
      title: "СИМФОНИЯ ЭХА",
      subtitle: "Дирижёр Изоляции",
      sId: "maestro",
      sName: "Маэстро",
      sElement: "Electro",
      sThemeColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
      sBgAccent: "from-purple-600/20 to-transparent",
      desc: "Шанс на получение Маэстро [S] увеличен! Совместные атаки с игнором защиты.",
      aRateUps: ["echo", "aegis"] as string[]
    },
    INEFFA: {
      title: "РАССВЕТНОЕ УТРО",
      subtitle: "Осколки памяти",
      sId: "ineffa",
      sName: "Инеффа",
      sElement: "Pyro",
      sThemeColor: "text-red-400 border-red-500/40 bg-red-950/40",
      sBgAccent: "from-red-600/20 to-transparent",
      desc: "Шанс на получение Инеффы [S] увеличен! Вызывает Отражение и сокрушает врагов зеркалами.",
      aRateUps: ["nova", "viper"] as string[]
    },
    ZEPHYR: {
      title: "ГРОЗОВОЕ ЗЕРКАЛО",
      subtitle: "Ткач Молний",
      sId: "zephyr",
      sName: "Зефир",
      sElement: "Electro",
      sThemeColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
      sBgAccent: "from-purple-600/20 to-transparent",
      desc: "Шанс на получение Зефира [S] увеличен! Создает грозовые зеркала и усиливает Отражение.",
      aRateUps: ["rix", "echo"] as string[]
    },
    AURUM: {
      title: "ЗОЛОТАЯ ЭГИДА",
      subtitle: "Аристократ Иллюзий",
      sId: "aurum",
      sName: "Аурум",
      sElement: "Geo",
      sThemeColor: "text-yellow-400 border-yellow-500/40 bg-yellow-950/40",
      sBgAccent: "from-yellow-600/20 to-transparent",
      desc: "Шанс на получение Аурума [S] увеличен! Непробиваемый щит и колоссальный бафф Отражения.",
      aRateUps: ["rix", "gotka"] as string[]
    }
  };

  const currentBannerData = bannerDisplayDetails[activeBanner];

  const [pullStage, setPullStage] = useState<'IDLE' | 'ANIMATING' | 'REVEALING' | 'SUMMARY'>('IDLE');
  const [pulls, setPulls] = useState<PullResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  
  const PULL_COST = 160;
  const MAX_PITY_S = 80;
  const MAX_PITY_A = 10;
  
  const performPull = (times: number) => {
    const totalCost = times * PULL_COST;
    if (profile.gems < totalCost) return;

    let nextP = { 
      ...profile, 
      gems: profile.gems - totalCost, 
      dailies: { ...profile.dailies, gachaPulls: profile.dailies.gachaPulls + times },
      roster: { ...profile.roster }
    };
    
    let currentPulls: PullResult[] = [];
    
    let currentPityS = nextP.gachaPityS ?? 0;
    let currentPityA = nextP.gachaPityA ?? 0;
    let currentGuaranteed = nextP.gachaGuaranteed ?? false;

    const LIMITED_S = ["selina", "krona", "asher", "cyrus", "raven", "maestro", "ineffa", "zephyr", "aurum"];
    const S_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "S");
    const STANDARD_S_POOL = S_POOL.filter(id => !LIMITED_S.includes(id));
    const A_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "A");
    const B_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "B");

    for(let i=0; i<times; i++) {
      currentPityS += 1;
      currentPityA += 1;

      let rarityTarget: "S" | "A" | "B" = "B";
      const roll = Math.random();

      if (roll < 0.05 || currentPityS >= MAX_PITY_S) {
        rarityTarget = "S";
      } else if (roll < 0.20 || currentPityA >= MAX_PITY_A) {
        rarityTarget = "A";
      } else {
        rarityTarget = "B";
      }
      
      let charId = "";
      let won5050: boolean | null = null;
      
      if (rarityTarget === "S") {
        currentPityS = 0; // reset S-pity
        
        if (activeBanner === 'STANDARD') {
           charId = STANDARD_S_POOL[Math.floor(Math.random() * STANDARD_S_POOL.length)];
        } else {
           const featuredS = activeBanner.toLowerCase();

           if (currentGuaranteed) {
              charId = featuredS;
              currentGuaranteed = false;
              won5050 = true; // guarantee counts as positive
           } else {
              const won = Math.random() < 0.5;
              if (won) {
                 charId = featuredS;
                 currentGuaranteed = false;
                 won5050 = true;
              } else {
                 charId = STANDARD_S_POOL[Math.floor(Math.random() * STANDARD_S_POOL.length)];
                 currentGuaranteed = true;
                 won5050 = false;
              }
           }
        }
      } else if (rarityTarget === "A") {
         currentPityA = 0; // reset A-pity
         const rateUps = currentBannerData.aRateUps;
         if (rateUps && rateUps.length > 0 && Math.random() < 0.50) {
            charId = rateUps[Math.floor(Math.random() * rateUps.length)];
         } else {
            charId = A_POOL[Math.floor(Math.random() * A_POOL.length)];
         }
      } else {
         charId = B_POOL[Math.floor(Math.random() * B_POOL.length)];
      }
      
      const bp = characterBlueprints[charId]("t",1,0);
      const charName = bp.name;
      const element = bp.element;
      
      let isNew = false;
      let constel = 0;
      let refunded = 0;

      if (nextP.roster[charId]) {
         if(nextP.roster[charId].constellation < 6) {
           nextP.roster[charId] = { ...nextP.roster[charId], constellation: nextP.roster[charId].constellation + 1 };
           constel = nextP.roster[charId].constellation;
         } else {
           nextP.gems += 200;
           refunded = 200;
           constel = 6;
         }
      } else {
         nextP.roster[charId] = { level: 1, constellation: 0 };
         isNew = true;
      }

      currentPulls.push({
         charId, charName, rarity: rarityTarget as "B"|"A"|"S", isNew, constellation: constel, refunded, element, won5050
      });
    }
    
    nextP.gachaPityS = currentPityS;
    nextP.gachaPityA = currentPityA;
    nextP.gachaGuaranteed = currentGuaranteed;

    updateProfile(() => nextP);
    setPulls(currentPulls);
    setRevealIndex(0);
    setPullStage('ANIMATING');

    setTimeout(() => {
       setPullStage(prev => prev === 'ANIMATING' ? 'REVEALING' : prev);
    }, 4500); // Wait for meteor animation
  };

  const handleNextReveal = () => {
     if (revealIndex < pulls.length - 1) {
        setRevealIndex(r => r + 1);
     } else {
        setPullStage('SUMMARY');
     }
  };

  const skipToSummary = () => {
     setPullStage('SUMMARY');
  };

  const getBannerTabEmoji = (bKey: 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM'): string => {
    switch (bKey) {
      case 'SELINA': return '🌹';
      case 'KRONA': return '❄️';
      case 'ASHER': return '⚒️';
      case 'CYRUS': return '🎯';
      case 'RAVEN': return '🔪';
      case 'MAESTRO': return '🎻';
      case 'INEFFA': return '🪞';
      case 'ZEPHYR': return '⚡';
      case 'AURUM': return '🛡️';
    }
  };

  const getBannerTabColor = (bKey: 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM', isActive: boolean): string => {
    if (!isActive) return 'text-gray-400 hover:text-white border-transparent';
    switch (bKey) {
      case 'SELINA': return 'bg-rose-600 text-white border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      case 'KRONA': return 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
      case 'ASHER': return 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
      case 'CYRUS': return 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'RAVEN': return 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]';
      case 'MAESTRO': return 'bg-purple-600 text-white border-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.4)]';
      case 'INEFFA': return 'bg-red-700 text-white border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]';
      case 'ZEPHYR': return 'bg-purple-800 text-white border-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
      case 'AURUM': return 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    }
  };

  const getBannerTabName = (bKey: 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM'): string => {
    switch (bKey) {
      case 'SELINA': return 'Селина';
      case 'KRONA': return 'Крона';
      case 'ASHER': return 'Ашер';
      case 'CYRUS': return 'Сайрус';
      case 'RAVEN': return 'Рейвен';
      case 'MAESTRO': return 'Маэстро';
      case 'INEFFA': return 'Инеффа';
      case 'ZEPHYR': return 'Зефир';
      case 'AURUM': return 'Аурум';
    }
  };

  const maxRarityInPulls = pulls.reduce((max, p) => p.rarity === 'S' ? 'S' : (p.rarity === 'A' && max !== 'S') ? 'A' : max, 'B');
  const meteorColor = maxRarityInPulls === 'S' ? 'from-yellow-400 to-yellow-600 shadow-yellow-500' : maxRarityInPulls === 'A' ? 'from-purple-400 to-purple-600 shadow-purple-500' : 'from-blue-400 to-blue-600 shadow-blue-500';

  return (
    <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[600px] bg-gradient-to-br from-indigo-950 via-purple-900 to-black md:rounded-xl border-4 border-gray-800 shadow-2xl flex flex-col font-sans text-gray-200 overflow-hidden relative">
      
      {/* Top Bar for IDLE only */}
      {pullStage === 'IDLE' && (
        <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md shrink-0 absolute top-0 left-0 right-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-white/10 rounded transition">
                <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="text-xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
               Молитвы
             </h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/80 px-4 py-1.5 rounded-full border border-gray-700">
             <Gem className="w-4 h-4 text-pink-400" />
             <span className="font-mono font-bold">{profile.gems}</span>
          </div>
        </div>
      )}

      {/* IDLE state */}
      {pullStage === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 relative overflow-y-auto mt-16 w-full pb-12">
           <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <Sparkles className="w-96 h-96 text-purple-500 animate-pulse" />
           </div>

           <div className="z-10 w-full flex flex-col items-center">
              <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center bg-black/40 p-1.5 rounded-xl backdrop-blur-sm border border-purple-900/50 overflow-x-auto md:overflow-x-visible max-w-full gap-2 mb-6 w-full md:w-auto shadow-xl custom-scrollbar">
                <button 
                  onClick={() => setActiveBanner('STANDARD')} 
                  className={cn(
                    "px-4 py-3 sm:py-2 shrink-0 font-bold uppercase text-[11px] sm:text-[10px] tracking-wider rounded-lg transition-all whitespace-nowrap", 
                    activeBanner === 'STANDARD' ? 'bg-white text-black shadow-md scale-[1.02]' : 'text-gray-400 hover:text-white'
                  )}
                >
                  Стандарт
                </button>
                {allAvailableBanners.map(bKey => (
                  <button 
                    key={bKey}
                    onClick={() => setActiveBanner(bKey)} 
                    className={cn(
                      "px-4 py-3 sm:py-2 shrink-0 font-bold uppercase text-[11px] sm:text-[10px] tracking-wider rounded-lg transition-all whitespace-nowrap flex items-center gap-2 border", 
                      getBannerTabColor(bKey, activeBanner === bKey),
                      activeBanner === bKey ? "shadow-md scale-[1.02]" : ""
                    )}
                  >
                    <span>{getBannerTabEmoji(bKey)} {getBannerTabName(bKey)}</span>
                  </button>
                ))}
              </div>
               {/* Genshin-styled Banner Card with S-star splash art background and A-star rate-ups */}
               <div className="relative w-full max-w-2xl px-1">
                  <div className="relative w-full h-[250px] sm:h-[280px] md:h-[320px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex bg-slate-950 mb-6 group">
                     {/* Animated glow matching banner element */}
                     <div className={`absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none transition-all duration-700 bg-gradient-to-tr ${
                        activeBanner === 'SELINA' ? 'from-rose-500/15 via-transparent to-rose-500/30' :
                        activeBanner === 'KRONA' ? 'from-cyan-500/15 via-transparent to-cyan-500/30' :
                        activeBanner === 'ASHER' ? 'from-emerald-500/15 via-transparent to-emerald-500/30' :
                        activeBanner === 'CYRUS' ? 'from-red-500/15 via-transparent to-red-500/30' :
                        activeBanner === 'RAVEN' ? 'from-indigo-500/15 via-transparent to-indigo-500/30' :
                        activeBanner === 'MAESTRO' ? 'from-purple-500/15 via-transparent to-purple-500/30' :
                        activeBanner === 'ZEPHYR' ? 'from-purple-400/15 via-transparent to-purple-400/30' :
                        activeBanner === 'AURUM' ? 'from-yellow-500/15 via-transparent to-yellow-500/30' :
                        'from-indigo-500/15 via-transparent to-indigo-500/30'
                     }`}></div>
                     
                     {/* Background splash of the featured char */}
                     {getCharSplash(currentBannerData.sId) && (
                        <div className="absolute inset-0 pointer-events-none select-none z-0">
                           <img 
                              src={getCharSplash(currentBannerData.sId) || ""} 
                              className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]" 
                              alt={currentBannerData.sName}
                              referrerPolicy="no-referrer"
                           />
                           {/* Beautiful darkening gradients to maintain supreme legibility */}
                           <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                           <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent font-sans"></div>
                        </div>
                     )}

                     {/* Main Content inside Banner Card */}
                     <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10 select-none">
                        {/* Top Side: Banner Title context */}
                        <div>
                           <div className="flex items-center gap-2">
                              <span className={`text-[9px] sm:text-[10px] font-sans font-extrabold tracking-widest uppercase bg-black/60 px-2.5 py-0.5 rounded border ${currentBannerData.sThemeColor}`}>
                                 {currentBannerData.subtitle}
                              </span>
                           </div>
                           <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white mt-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                              {currentBannerData.title}
                           </h2>
                        </div>

                        {/* Bottom Side: Featured S Character + A Characters Rateup */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                           {/* Left side: Golden 5-Star S-rank character information */}
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-yellow-500 tracking-wider bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded uppercase">
                                    Рекомендуемый S-Ранг
                                 </span>
                                 <span className="text-xs text-white/70 font-mono font-bold">
                                    [{currentBannerData.sElement}]
                                 </span>
                              </div>
                              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-1 flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                 {currentBannerData.sName}
                              </h3>
                              <div className="flex gap-0.5 mt-1">
                                 {Array.from({length: 5}).map((_, idx) => (
                                    <Star key={idx} className="w-4 h-4 fill-current text-yellow-400 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] animate-pulse" style={{ animationDelay: `${idx * 150}ms` }} />
                                 ))}
                              </div>
                           </div>

                           {/* Right side: Rate Up/Featured Characters (the lower-rarity representation) */}
                           {currentBannerData.aRateUps.length > 0 && (
                              <div className="flex flex-col bg-slate-950/85 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl backdrop-blur-md max-w-[280px]">
                                 <span className="text-[9px] uppercase font-black tracking-widest text-purple-400 mb-1.5 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                                    {activeBanner === 'STANDARD' ? 'Содержимое баннера (4★/3★):' : 'Вероятность Повышена (4★):'}
                                 </span>
                                 <div className="flex gap-4">
                                    {currentBannerData.aRateUps.map(aId => {
                                       const bp = characterBlueprints[aId]("temp", 1, 0);
                                       const rarity = charRarity[aId];
                                       const starText = rarity === 'S' ? '5★' : rarity === 'A' ? '4★' : '3★';
                                       
                                       const isS = rarity === 'S';
                                       const isA = rarity === 'A';
                                       
                                       const ringColor = isS 
                                          ? 'border-yellow-500/60 shadow-[0_0_8px_rgba(234,179,8,0.3)]' 
                                          : isA 
                                             ? 'border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]' 
                                             : 'border-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.3)]';
                                       
                                       const badgeBg = isS 
                                          ? 'bg-yellow-600' 
                                          : isA 
                                             ? 'bg-purple-600' 
                                             : 'bg-blue-600';

                                       const textSub = isS
                                          ? 'text-yellow-300'
                                          : isA
                                             ? 'text-purple-300'
                                             : 'text-blue-300';
                                       
                                       return (
                                          <div key={aId} className="flex items-center gap-1.5">
                                             <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border bg-slate-900 ${ringColor} flex items-center justify-center relative shrink-0`}>
                                                {getCharSplash(aId) ? (
                                                   <img src={getCharSplash(aId) || ""} className="w-full h-full object-cover" alt={bp.name} referrerPolicy="no-referrer" />
                                                ) : (
                                                   <span className="text-xl">{getCharEmoji(aId)}</span>
                                                )}
                                                <div className={`absolute top-0 right-0 ${badgeBg} text-[6px] px-0.5 font-bold text-white rounded-bl leading-none`}>{starText}</div>
                                             </div>
                                             <div className="flex flex-col justify-center">
                                                <span className="text-[10px] sm:text-[11px] font-black text-white drop-shadow leading-none">{bp.name}</span>
                                                <span className={`text-[8px] sm:text-[9px] ${textSub} font-bold tracking-tight font-mono`}>{bp.element}</span>
                                             </div>
                                          </div>
                                       );
                                    })}
                                 </div>
                              </div>
                           )}

                           {/* Standard fallback message */}
                           {currentBannerData.aRateUps.length === 0 && (
                              <div className="text-right text-[10px] text-white/50 max-w-[180px] leading-snug font-mono hidden sm:block">
                                 Содержит всех стандартных 4★ и 5★ персонажей в равной пропорции.
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

              {/* PITY counters and 50/50 status */}
              <div className="z-10 w-full max-w-lg mb-8 bg-black/60 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm font-mono flex flex-col gap-2.5 shadow-xl backdrop-blur-sm">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-gray-400 flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse"></span>
                       До гаранта <span className="text-yellow-400 font-bold">★ S-ранга</span>:
                    </span>
                    <span className="text-yellow-400 font-black">{MAX_PITY_S - (profile.gachaPityS ?? 0)} / {MAX_PITY_S}</span>
                 </div>
                 <div className="flex justify-between items-center px-1">
                    <span className="text-gray-400 flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                       До гаранта <span className="text-purple-400 font-bold">★ A-ранга</span>:
                    </span>
                    <span className="text-purple-400 font-black">{MAX_PITY_A - (profile.gachaPityA ?? 0)} / {MAX_PITY_A}</span>
                 </div>
                 {activeBanner !== 'STANDARD' && (
                    <div className="border-t border-slate-900/80 pt-2.5 flex justify-between items-center px-1">
                       <span className="text-gray-400">Текущий статус 50/50:</span>
                       <span className={`font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded ${(profile.gachaGuaranteed ?? false) ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-orange-950 text-orange-400 border border-orange-500/30'}`}>
                          {(profile.gachaGuaranteed ?? false) ? 'Гарантирован (100%)' : 'Шанс 50/50'}
                       </span>
                    </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center">
                 <button 
                   onClick={() => performPull(1)}
                   disabled={profile.gems < PULL_COST}
                   className="flex-1 bg-slate-100 hover:bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-xl flex flex-col items-center transition hover:scale-105 active:scale-95"
                 >
                    <span className="uppercase tracking-widest mb-1">1 Молитва</span>
                    <div className="flex items-center gap-1 text-sm font-mono opacity-80">
                       <Gem className="w-3 h-3 text-pink-600" /> {PULL_COST}
                    </div>
                 </button>
                 <button 
                   onClick={() => performPull(10)}
                   disabled={profile.gems < PULL_COST * 10}
                   className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.5)] flex flex-col items-center transition hover:scale-105 active:scale-95"
                 >
                    <span className="uppercase tracking-widest mb-1">10 Молитв</span>
                    <div className="flex items-center gap-1 text-sm font-mono opacity-90">
                       <Gem className="w-3 h-3" /> {PULL_COST * 10}
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ANIMATING (Meteor) */}
      <AnimatePresence>
         {pullStage === 'ANIMATING' && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.5}}
               className="absolute inset-0 bg-slate-950 flex justify-center items-center overflow-hidden z-40 cursor-pointer"
               onClick={skipToSummary}
            >
               <motion.div 
                 initial={{ x: '100vw', y: '-100vh', scale: 0.5 }} 
                 animate={{ x: '-50vw', y: '50vh', scale: 3 }} 
                 transition={{ duration: 3.5, ease: "easeIn" }}
                 className={`w-32 h-1 bg-gradient-to-r ${meteorColor} rotate-45 transform-gpu blur-[1px] shadow-[0_0_50px_rgba(255,255,255,1)] relative`}
               >
                  <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r ${meteorColor} rounded-full blur-xl`}></div>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full blur-sm`}></div>
               </motion.div>
               <div className="absolute top-4 right-4 text-white/50 text-xs font-bold uppercase flex items-center gap-1"><SkipForward className="w-3 h-3"/> Пропустить (Click)</div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* REVEALING item by item */}
      <AnimatePresence mode="wait">
        {pullStage === 'REVEALING' && (
           <motion.div 
              key={`reveal-${revealIndex}`}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{duration: 0.3}}
              className="absolute inset-0 bg-slate-950 flex flex-col justify-start md:justify-center items-center z-40 cursor-pointer p-6 overflow-y-auto pt-16 pb-12"
              onClick={handleNextReveal}
           >
              <div className="absolute top-4 right-4 text-white/50 text-xs font-bold uppercase flex items-center gap-1 z-50" onClick={(e) => { e.stopPropagation(); skipToSummary(); }}><SkipForward className="w-3 h-3"/> Skip All</div>
              
              <div className="relative">
                 {pulls[revealIndex].rarity === 'S' && <div className="absolute inset-0 bg-yellow-500 blur-[100px] opacity-30 rounded-full scale-150 animate-pulse"></div>}
                 {pulls[revealIndex].rarity === 'A' && <div className="absolute inset-0 bg-purple-500 blur-[80px] opacity-30 rounded-full scale-150 animate-pulse"></div>}
                 
                 <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-2 relative z-10 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {pulls[revealIndex].charName}
                 </h2>
                 <div className="flex justify-center gap-1 mb-8 relative z-10">
                    {Array.from({length: pulls[revealIndex].rarity === 'S' ? 5 : pulls[revealIndex].rarity === 'A' ? 4 : 3}).map((_, i) => (
                       <Star key={i} className={`w-6 h-6 fill-current ${pulls[revealIndex].rarity === 'S' ? 'text-yellow-400' : pulls[revealIndex].rarity === 'A' ? 'text-purple-400' : 'text-blue-400'}`} />
                    ))}
                 </div>
              </div>

              {/* Gorgeous Splash Art render */}
              {getCharSplash(pulls[revealIndex].charId) ? (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-slate-800/80 mb-6 group bg-slate-900/10 flex items-center justify-center z-10"
                 >
                    <img 
                       src={getCharSplash(pulls[revealIndex].charId) || ""} 
                       className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none" 
                       alt={pulls[revealIndex].charName}
                       referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                 </motion.div>
              ) : (
                 <div className="w-40 h-40 bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center text-7xl select-none mb-6 relative z-10 shadow-[inner_0_4px_12px_rgba(0,0,0,0.6)]">
                    {getCharEmoji(pulls[revealIndex].charId)}
                 </div>
              )}

              {pulls[revealIndex].rarity === 'S' && pulls[revealIndex].won5050 !== undefined && pulls[revealIndex].won5050 !== null && (
                 <div className={`px-4 py-2 rounded-xl border-2 font-black text-xs sm:text-sm uppercase tracking-wider mb-6 animate-pulse relative z-10 text-center ${
                    pulls[revealIndex].won5050 
                       ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                       : 'bg-rose-950/90 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                 }`}>
                    {pulls[revealIndex].won5050 ? '🎉 Выигран 50/50!' : '😢 Проигран 50/50 (Гарант на след. S-героя)'}
                 </div>
              )}

              {pulls[revealIndex].isNew ? (
                 <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-yellow-300 font-bold px-6 py-2 rounded-full mt-4 flex items-center gap-2 uppercase tracking-widest text-sm animate-bounce">
                    ✨ Новый
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-2 mt-4">
                   <div className="bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm px-4 py-1 rounded">
                      Дубликат: Созвездие {pulls[revealIndex].constellation}
                   </div>
                   {pulls[revealIndex].refunded > 0 && (
                      <div className="bg-pink-900/50 border border-pink-500/50 text-pink-300 font-bold text-sm px-4 py-1 rounded flex items-center gap-1">
                         Макс. Созвездие! Вернули: {pulls[revealIndex].refunded} <Gem className="w-3 h-3" />
                      </div>
                   )}
                 </div>
              )}
           </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY */}
      <AnimatePresence>
         {pullStage === 'SUMMARY' && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
               className="absolute inset-0 bg-slate-950 flex flex-col z-40 p-4 sm:p-8 overflow-y-auto"
            >
               <h2 className="text-2xl sm:text-4xl font-black uppercase text-center mt-4 mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 tracking-widest">
                 Результат
               </h2>
               
               <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto w-full">
                  {pulls.map((p, i) => (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className={`w-28 sm:w-32 h-40 sm:h-48 border rounded-xl flex flex-col items-center justify-between p-2 relative overflow-hidden bg-slate-900 ${
                           p.rarity === 'S' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                           p.rarity === 'A' ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                           'border-blue-900'
                        }`}
                     >
                        <div className={`absolute inset-0 opacity-20 ${
                           p.rarity === 'S' ? 'bg-gradient-to-t from-yellow-600 to-transparent' :
                           p.rarity === 'A' ? 'bg-gradient-to-t from-purple-600 to-transparent' :
                           'bg-gradient-to-t from-blue-600 to-transparent'
                        }`}></div>

                        {p.rarity === 'S' && p.won5050 !== undefined && p.won5050 !== null && (
                           <div className={`absolute top-1 left-1 text-[8px] font-black uppercase px-1 py-0.5 rounded tracking-tight z-20 shadow border ${
                              p.won5050 
                                 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/90' 
                                 : 'border-rose-500/50 text-rose-400 bg-rose-950/90'
                           }`}>
                              {p.won5050 ? 'Выигран' : '50/50'}
                           </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] pointer-events-none select-none">
                           {getCharSplash(p.charId) ? (
                              <img src={getCharSplash(p.charId) || ""} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                           ) : (
                              <span className="text-7xl">{getCharEmoji(p.charId)}</span>
                           )}
                        </div>

                        <div className="flex gap-0.5 mt-1 z-10">
                           {Array.from({length: p.rarity === 'S' ? 5 : p.rarity === 'A' ? 4 : 3}).map((_, starIdx) => (
                              <Star key={starIdx} className={`w-3 h-3 fill-current ${p.rarity === 'S' ? 'text-yellow-400' : p.rarity === 'A' ? 'text-purple-400' : 'text-blue-400'}`} />
                           ))}
                        </div>

                        <div className="z-10 flex-1 flex items-center text-center">
                           <span className="font-bold text-sm sm:text-base leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{p.charName}</span>
                        </div>

                        {p.isNew ? (
                           <div className="z-10 bg-yellow-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full uppercase w-full text-center">Новый</div>
                        ) : p.refunded > 0 ? (
                           <div className="z-10 bg-pink-600 text-white font-bold text-[10px] px-1 py-0.5 rounded-full flex items-center justify-center gap-1 w-full text-center truncate">+{p.refunded}<Gem className="w-2 h-2"/></div>
                        ) : (
                           <div className="z-10 bg-slate-700 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full w-full text-center">C{p.constellation}</div>
                        )}
                     </motion.div>
                  ))}
               </div>

               <div className="mt-auto pt-8 flex justify-center pb-4">
                  <button 
                     onClick={() => setPullStage('IDLE')} 
                     className="px-12 py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-xl"
                  >
                     Завершить
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
