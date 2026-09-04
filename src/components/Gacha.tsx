import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { ArrowLeft, Sparkles, Gem, Star, SkipForward, Info, X } from 'lucide-react';
import { baseCharacterPool, characterBlueprints, charRarity, getCharEmoji, getCharSplash } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const LIMITED_S = ["volta", "selina", "krona", "asher", "cyrus", "raven", "maestro", "ineffa", "zephyr", "aurum", "aelita", "aveline", "kairen"];
const S_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "S");
const STANDARD_S_POOL = S_POOL.filter(id => !LIMITED_S.includes(id));
const A_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "A");
const B_POOL = Object.keys(charRarity).filter(id => charRarity[id] === "B");

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
  const [activeBanner, setActiveBanner] = useState<string>('AVELINE');
  
  const permanentBanners: ('AVELINE' | 'KAIREN' | 'CYRUS' | 'RAVEN')[] = ['AVELINE', 'KAIREN', 'CYRUS', 'RAVEN'];
  const allAvailableBanners = permanentBanners;

  const bannerDisplayDetails = {
    AVELINE: {
      title: "ПЕСНЬ ПРИЛИВА",
      subtitle: "Танец Лепестков",
      sId: "aveline",
      sName: "Авелин",
      sElement: "Hydro",
      sThemeColor: "text-blue-400 border-blue-500/40 bg-blue-950/40",
      sBgAccent: "from-blue-600/20 to-transparent",
      desc: "Шанс на получение Авелин [S] увеличен! Гидро Саппорт: создает лепестки прилива, усиливающие элементальные реакции отряда!",
      aRateUps: ["aegis", "kopro", "gotka"] as string[]
    },
    KAIREN: {
      title: "ТРОН ЗИМЫ",
      subtitle: "Ледяное Эхо",
      sId: "kairen",
      sName: "Кайрен",
      sElement: "Cryo",
      sThemeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
      sBgAccent: "from-cyan-600/20 to-transparent",
      desc: "Шанс на получение Кайрена [S] увеличен! Крио DPS: поглощает осколки инея для нанесения разрушительного массового урона!",
      aRateUps: ["aegis", "kopro", "gotka"] as string[]
    },
    CYRUS: {
      title: "ТОЧНЫЙ ВЫСТРЕЛ",
      subtitle: "Смертельное Яблочко",
      sId: "cyrus",
      sName: "Сайрус",
      sElement: "Physical",
      sThemeColor: "text-yellow-400 border-yellow-500/40 bg-yellow-950/40",
      sBgAccent: "from-yellow-600/20 to-transparent",
      desc: "Шанс на получение Сайруса [S] увеличен! Физ DPS: специализируется на критическом уроне и мощных одиночных выстрелах!",
      aRateUps: ["aegis", "kopro", "gotka"] as string[]
    },
    RAVEN: {
      title: "ФАНТОМНЫЙ КЛИНОК",
      subtitle: "Тень Безмолвия",
      sId: "raven",
      sName: "Рейвен",
      sElement: "Electro",
      sThemeColor: "text-indigo-400 border-indigo-500/40 bg-indigo-950/40",
      sBgAccent: "from-indigo-600/20 to-transparent",
      desc: "Шанс на получение Рейвен [S] увеличен! Электро Убийца: наносит огромный урон целям без дебаффов и разгоняет отряд!",
      aRateUps: ["aegis", "kopro", "gotka"] as string[]
    },
    STANDARD: {
      title: "ЭХО ПРЕДКОВ",
      subtitle: "Обычная молитва",
      sId: "nova", // doesn't matter much, it's just for display
      sName: "Стандарт",
      sElement: "Physical",
      sThemeColor: "text-gray-400 border-gray-500/40 bg-gray-950/40",
      sBgAccent: "from-gray-600/20 to-transparent",
      desc: "Обычная молитва. Базовые шансы на получение всех стандартных персонажей.",
      aRateUps: [] as string[]
    }
  };

  const currentBannerData = bannerDisplayDetails[activeBanner];

  const [pullStage, setPullStage] = useState<'IDLE' | 'ANIMATING' | 'REVEALING' | 'SUMMARY'>('IDLE');
  const [showRatesModal, setShowRatesModal] = useState(false);
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
         if (activeBanner === 'STANDARD') {
            charId = A_POOL[Math.floor(Math.random() * A_POOL.length)];
         } else {
            if (rateUps && rateUps.length > 0 && Math.random() < 0.50) {
               charId = rateUps[Math.floor(Math.random() * rateUps.length)];
            } else {
               // Exclude the featured characters to make it exactly 50% featured and 50% non-featured
               const nonFeaturedA = A_POOL.filter(id => !rateUps.includes(id));
               if (nonFeaturedA.length > 0) {
                  charId = nonFeaturedA[Math.floor(Math.random() * nonFeaturedA.length)];
               } else {
                  charId = A_POOL[Math.floor(Math.random() * A_POOL.length)];
               }
            }
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
           nextP.gems += 80;
           refunded = 80;
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

  const getBannerTabEmoji = (bKey: string): string => {
    if (bKey === 'AVELINE') return '🌸';
    if (bKey === 'KAIREN') return '❄️';
    switch (bKey) {
      case 'VOLTA': return '⚡';
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

  const getBannerTabColor = (bKey: string, isActive: boolean): string => {
    if (!isActive) return 'text-white/50 hover:text-white border-transparent';
    if (bKey === 'AVELINE') return 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]';
    if (bKey === 'KAIREN') return 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
    if (!isActive) return 'text-white/50 hover:text-white border-transparent';
    switch (bKey) {
      case 'VOLTA': return 'bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]';
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

  const getBannerTabName = (bKey: string): string => {
    if (bKey === 'AVELINE') return 'Авелин';
    if (bKey === 'KAIREN') return 'Кайрен';
    switch (bKey) {
      case 'VOLTA': return 'Вольта';
      case 'SELINA': return 'Селина';
      case 'KRONA': return 'Крона';
      case 'ASHER': return 'Ашер';
      case 'CYRUS': return 'Сайрус';
      case 'RAVEN': return 'Рейвен';
      case 'MAESTRO': return 'Маэстро';
      case 'INEFFA': return 'Инеффа';
      case 'ZEPHYR': return 'Зефир';
      case 'AURUM': return 'Аурум';
      default: return bKey;
    }
  };

  const maxRarityInPulls = pulls.reduce((max, p) => p.rarity === 'S' ? 'S' : (p.rarity === 'A' && max !== 'S') ? 'A' : max, 'B');
  const meteorColor = maxRarityInPulls === 'S' ? 'from-yellow-400 to-yellow-600 shadow-yellow-500' : maxRarityInPulls === 'A' ? 'from-purple-400 to-purple-600 shadow-purple-500' : 'from-blue-400 to-blue-600 shadow-blue-500';

  return (
    <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[600px] bg-gradient-to-br from-indigo-950 via-purple-900 to-black md:rounded-2xl border-4 border-white/5 shadow-2xl flex flex-col font-sans text-white/90 overflow-hidden relative">
      
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
          <div className="flex items-center gap-2 bg-[#111111]/80 px-4 py-1.5 rounded-full border border-white/10">
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
              <div className="flex flex-nowrap justify-start md:justify-center overflow-x-auto max-w-full gap-3 mb-8 w-full px-4 custom-scrollbar pb-2">
                {['STANDARD', ...allAvailableBanners].map((bKey) => {
                  const data = bannerDisplayDetails[bKey as keyof typeof bannerDisplayDetails];
                  const splash = getCharSplash(data.sId);
                  const isActive = activeBanner === bKey;

                  return (
                    <button
                      key={bKey}
                      onClick={() => setActiveBanner(bKey as any)}
                      className={cn(
                        "group relative h-16 sm:h-20 shrink-0 rounded-2xl overflow-hidden transition-all duration-500 border bg-[#0a0a0a]",
                        isActive 
                          ? "w-48 sm:w-56 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                          : "w-20 sm:w-24 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20 hover:shadow-lg"
                      )}
                    >
                      {splash && (
                         <img 
                           src={splash} 
                           alt={data.title} 
                           className={cn(
                             "absolute inset-0 w-full h-full object-cover object-top transition-all duration-700",
                             isActive ? "opacity-100 scale-100" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-70 scale-110"
                           )} 
                           style={{ 
                             WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
                             maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)'
                           }}
                           referrerPolicy="no-referrer" 
                         />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none"></div>
                      
                      <div className="absolute inset-0 flex flex-col justify-center items-start px-3 sm:px-4 z-10">
                        {isActive ? (
                          <div className="flex flex-col items-start gap-1">
                             <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">{bKey === 'STANDARD' ? 'Базовый' : 'Событие'}</span>
                             <span className="text-xs sm:text-sm font-black uppercase text-white truncate tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                               {bKey === 'STANDARD' ? 'Стандарт' : getBannerTabName(bKey as any)}
                             </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center w-full gap-1">
                             <span className="text-sm drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                               {bKey === 'STANDARD' ? '✨' : getBannerTabEmoji(bKey as any)}
                             </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
               {/* Genshin-styled Banner Card with S-star splash art background and A-star rate-ups */}
               <div className="relative w-full max-w-2xl px-1">
                  <div className="relative w-full h-[250px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex bg-[#0a0a0a] mb-6 group">
                     {/* Animated glow matching banner element */}
                     <div className={`absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none transition-all duration-700 bg-gradient-to-tr ${
                        activeBanner === 'VOLTA' ? 'from-violet-500/25 via-transparent to-cyan-500/30' :
                        activeBanner === 'SELINA' ? 'from-rose-500/15 via-transparent to-rose-500/30' :
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
                           <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
                           <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent font-sans"></div>
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
                              <div className="flex flex-col bg-[#0a0a0a]/85 border border-white/5 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md max-w-[280px]">
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
                                             <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border bg-[#111111] ${ringColor} flex items-center justify-center relative shrink-0`}>
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
              <div className="z-10 w-full max-w-lg mb-8 bg-black/60 border border-white/5 rounded-2xl p-4 text-xs sm:text-sm flex flex-col gap-2.5 shadow-xl backdrop-blur-sm">
                 <div className="flex justify-between items-center mb-1 pb-2 border-b border-white/5">
                    <span className="font-bold uppercase tracking-widest text-white/50 text-[10px]">Статистика Молитв</span>
                    <button onClick={() => setShowRatesModal(true)} className="flex items-center gap-1 text-white/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest bg-white/5 px-2 py-1 rounded-full">
                       <Info className="w-3 h-3" />
                       Шансы и Детали
                    </button>
                 </div>
                 <div className="flex justify-between items-center px-1 font-mono">
                    <span className="text-white/50 flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse"></span>
                       До гаранта <span className="text-yellow-400 font-bold">★ S-ранга</span>:
                    </span>
                    <span className="text-yellow-400 font-black">{MAX_PITY_S - (profile.gachaPityS ?? 0)} / {MAX_PITY_S}</span>
                 </div>
                 <div className="flex justify-between items-center px-1 font-mono">
                    <span className="text-white/50 flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                       До гаранта <span className="text-purple-400 font-bold">★ A-ранга</span>:
                    </span>
                    <span className="text-purple-400 font-black">{MAX_PITY_A - (profile.gachaPityA ?? 0)} / {MAX_PITY_A}</span>
                 </div>
                 {activeBanner !== 'STANDARD' && (
                    <div className="border-t border-white/5 pt-2.5 flex justify-between items-center px-1">
                       <span className="text-white/50">Текущий статус 50/50:</span>
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
                   className="flex-1 bg-slate-100 hover:bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-2xl shadow-xl flex flex-col items-center transition hover:scale-105 active:scale-95"
                 >
                    <span className="uppercase tracking-widest mb-1">1 Молитва</span>
                    <div className="flex items-center gap-1 text-sm font-mono opacity-80">
                       <Gem className="w-3 h-3 text-pink-600" /> {PULL_COST}
                    </div>
                 </button>
                 <button 
                   onClick={() => performPull(10)}
                   disabled={profile.gems < PULL_COST * 10}
                   className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.5)] flex flex-col items-center transition hover:scale-105 active:scale-95"
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
               className="absolute inset-0 bg-[#0a0a0a] flex justify-center items-center overflow-hidden z-40 cursor-pointer"
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
              className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-start md:justify-center items-center z-40 cursor-pointer p-6 overflow-y-auto pt-16 pb-12"
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
                    className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/5 mb-6 group bg-[#111111]/10 flex items-center justify-center z-10"
                 >
                    <img 
                       src={getCharSplash(pulls[revealIndex].charId) || ""} 
                       className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none" 
                       alt={pulls[revealIndex].charName}
                       referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 pointer-events-none"></div>
                 </motion.div>
              ) : (
                 <div className="w-40 h-40 bg-[#111111] border-2 border-white/5 rounded-full flex items-center justify-center text-7xl select-none mb-6 relative z-10 shadow-[inner_0_4px_12px_rgba(0,0,0,0.6)]">
                    {getCharEmoji(pulls[revealIndex].charId)}
                 </div>
              )}

              {pulls[revealIndex].rarity === 'S' && pulls[revealIndex].won5050 !== undefined && pulls[revealIndex].won5050 !== null && (
                 <div className={`px-4 py-2 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-wider mb-6 animate-pulse relative z-10 text-center ${
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
                   <div className="bg-[#1a1a1a] border border-white/10 text-white/70 font-mono text-sm px-4 py-1 rounded">
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
               className="absolute inset-0 bg-[#0a0a0a] flex flex-col z-40 p-4 sm:p-8 overflow-y-auto"
            >
               <h2 className="text-2xl sm:text-4xl font-black uppercase text-center mt-4 mb-8 text-white tracking-widest">
                 Результат
               </h2>
               
               <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto w-full">
                  {pulls.map((p, i) => (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className={`w-28 sm:w-32 h-40 sm:h-48 border rounded-2xl flex flex-col items-center justify-between p-2 relative overflow-hidden bg-[#111111] ${
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
                              <img src={getCharSplash(p.charId) || ""} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
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
                           <div className="z-10 bg-white/10 text-white/70 font-bold text-[10px] px-2 py-0.5 rounded-full w-full text-center">C{p.constellation}</div>
                        )}
                     </motion.div>
                  ))}
               </div>

               <div className="mt-auto pt-8 flex justify-center pb-4">
                  <button 
                     onClick={() => setPullStage('IDLE')} 
                     className="px-12 py-4 bg-white hover:bg-gray-200 text-black rounded-2xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-xl"
                  >
                     Завершить
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      <AnimatePresence>
         {showRatesModal && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRatesModal(false)}></div>
               <motion.div 
                  initial={{ y: 50, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 20, scale: 0.95 }}
                  className="relative w-full max-w-2xl max-h-[85vh] bg-[#0f0f13] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
               >
                  <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
                     <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Детали Молитвы</h2>
                     </div>
                     <button onClick={() => setShowRatesModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8 text-sm text-white/80">
                     <section>
                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400 fill-current" /> Базовые Шансы</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div className="bg-[#1a1a24] border border-yellow-500/30 rounded-2xl p-4 flex flex-col gap-1">
                              <span className="text-yellow-400 font-black text-lg">5★ (S-ранг)</span>
                              <span className="text-white/90 font-mono text-xl">5.0%</span>
                              <span className="text-white/50 text-xs mt-1">Гарант на 80-й молитве</span>
                           </div>
                           <div className="bg-[#1a1a24] border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-1">
                              <span className="text-purple-400 font-black text-lg">4★ (A-ранг)</span>
                              <span className="text-white/90 font-mono text-xl">15.0%</span>
                              <span className="text-white/50 text-xs mt-1">Гарант на 10-й молитве</span>
                           </div>
                           <div className="bg-[#1a1a24] border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-1">
                              <span className="text-blue-400 font-black text-lg">3★ (B-ранг)</span>
                              <span className="text-white/90 font-mono text-xl">80.0%</span>
                              <span className="text-white/50 text-xs mt-1">Остальные исходы</span>
                           </div>
                        </div>
                     </section>
                     
                     <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-md font-bold text-white mb-3 uppercase tracking-wider">Правила Баннера "{currentBannerData.title}"</h3>
                        <ul className="list-disc list-inside space-y-2 text-white/70">
                           {activeBanner === 'STANDARD' ? (
                              <>
                                 <li>Все доступные персонажи 5★ и 4★ имеют равный шанс выпадения.</li>
                                 <li>В стандартной молитве не бывает проигрыша 50/50.</li>
                              </>
                           ) : (
                              <>
                                 <li><span className="text-yellow-400 font-bold">Правило 50/50:</span> При получении персонажа 5★, есть 50% шанс получить главного ивентового героя — <strong>{currentBannerData.sName}</strong>.</li>
                                 <li>Если вы получили стандартного 5★ персонажа, следующий полученный 5★ будет гарантированно 100% ивентовым.</li>
                                 <li>При получении персонажа 4★, есть 50% шанс получить одного из персонажей с повышенным шансом: {currentBannerData.aRateUps.map(id => characterBlueprints[id]("temp",1,0).name).join(', ')}.</li>
                              </>
                           )}
                        </ul>
                     </section>

                     <section>
                        <h3 className="text-md font-bold text-white mb-4 uppercase tracking-wider">Список 5★ Персонажей</h3>
                        <div className="flex flex-wrap gap-2">
                           {activeBanner !== 'STANDARD' && (
                              <div className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                 {getCharEmoji(currentBannerData.sId)} {currentBannerData.sName} <span className="text-[10px] uppercase bg-yellow-500/30 px-1.5 py-0.5 rounded ml-1">Ивент</span>
                              </div>
                           )}
                           {STANDARD_S_POOL.map(id => {
                              const bp = characterBlueprints[id]("temp",1,0);
                              return (
                                 <div key={id} className="bg-white/5 border border-white/10 text-white/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    {getCharEmoji(id)} {bp.name}
                                 </div>
                              );
                           })}
                        </div>
                     </section>

                     <section>
                        <h3 className="text-md font-bold text-white mb-4 uppercase tracking-wider">Список 4★ Персонажей</h3>
                        <div className="flex flex-wrap gap-2">
                           {activeBanner !== 'STANDARD' && currentBannerData.aRateUps.map(id => {
                              const bp = characterBlueprints[id]("temp",1,0);
                              return (
                                 <div key={id} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    {getCharEmoji(id)} {bp.name} <span className="text-[10px] uppercase bg-purple-500/30 px-1.5 py-0.5 rounded ml-1">Повышен шанс</span>
                                 </div>
                              );
                           })}
                           {A_POOL.filter(id => activeBanner === 'STANDARD' || !currentBannerData.aRateUps.includes(id)).map(id => {
                              const bp = characterBlueprints[id]("temp",1,0);
                              return (
                                 <div key={id} className="bg-white/5 border border-white/10 text-white/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    {getCharEmoji(id)} {bp.name}
                                 </div>
                              );
                           })}
                        </div>
                     </section>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}