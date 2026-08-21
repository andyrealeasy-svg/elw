import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, 
  Lock, 
  Unlock, 
  Gift, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  ChevronLeft, 
  Coins, 
  ShieldCheck, 
  Flame, 
  Award,
  Zap,
  Globe
} from 'lucide-react';
import { PlayerProfile, GameRoute, StoryStage } from '../types';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
  onBack: () => void;
}

interface MapRegion {
  id: string;
  name: string;
  description: string;
  element: "Pyro" | "Cryo" | "Electro" | "Dendro" | "Geo";
  elementColor: string;
  unlockedBy: string; // s1_1, s1_2 etc.
  unlockLabel: string;
  bgGradient: string;
  glowColor: string;
  coords: { x: number; y: number }; // Percentage coords on screen
  dungeons: { id: string; name: string; desc: string }[];
  chests: { id: string; name: string; cost: number; gems: number; gold: number; condition: string }[];
  anomaly: {
    id: string;
    name: string;
    level: number;
    disorder: string;
    reward: { gems: number; gold: number; exp: number };
    enemies: string[];
    enemyIcons: string[];
  };
}

const REGIONS: MapRegion[] = [
  {
    id: "dawn_forge",
    name: "Горнило Зари",
    description: "Величественные шахтерские острова, висящие над раскаленным ядром мира. Здесь зародилась энергия Горна.",
    element: "Pyro",
    elementColor: "text-red-500 border-red-500/30 bg-red-950/10",
    unlockedBy: "always",
    unlockLabel: "Доступно изначально",
    bgGradient: "from-red-950/40 via-slate-900/50 to-slate-950/80",
    glowColor: "shadow-red-500/20",
    coords: { x: 25, y: 70 },
    dungeons: [
      { id: "domain_flame", name: "Пик Розы", desc: "Добыча сетов 'Алая Роза' и 'Конец Гладиатора'" },
      { id: "domain_ashes", name: "Кузница Пепла", desc: "Добыча сетов 'Пепел Запретного Горна' и 'Инстинкта Волка'" }
    ],
    chests: [
      { id: "chest_dawn_1", name: "Ржавый ящик шахтёра", cost: 0, gems: 20, gold: 3000, condition: "Свободен для открытия" },
      { id: "chest_dawn_2", name: "Сейф Кузницы Пепла", cost: 10, gems: 50, gold: 8000, condition: "Требуется 10 Смолы" }
    ],
    anomaly: {
      id: "anomaly_dawn",
      name: "Вспышка Пылающего Ядра",
      level: 25,
      disorder: "Пиро урон в отряде увеличен на 40%.",
      reward: { gems: 45, gold: 5000, exp: 500 },
      enemies: ["blaze", "claymore"],
      enemyIcons: ["🔥", "🧨"]
    }
  },
  {
    id: "frost_fringe",
    name: "Морозные Окраины",
    description: "Древние криогенные архипелаги, погружённые во мглу векового льда. Здесь обитают вечные стражи времени.",
    element: "Cryo",
    elementColor: "text-cyan-400 border-cyan-500/30 bg-cyan-950/10",
    unlockedBy: "s1_1",
    unlockLabel: "Очистите этап Сюжета s1_1 'Тлеющая Поляна'",
    bgGradient: "from-cyan-950/40 via-slate-900/50 to-slate-950/80",
    glowColor: "shadow-cyan-400/20",
    coords: { x: 50, y: 35 },
    dungeons: [
      { id: "domain_frost", name: "Шпиль Времени", desc: "Добыча сетов 'Замёрзшее Время' и 'Знать'" },
      { id: "domain_cryothunder", name: "Шпиль Сверхпроводимости", desc: "Сеты 'Проводящий Контур' и 'Абсолютный Ноль'" }
    ],
    chests: [
      { id: "chest_frost_1", name: "Хрустальный Ларь", cost: 0, gems: 30, gold: 4000, condition: "Свободен для открытия" },
      { id: "chest_frost_2", name: "Ледяной Контейнер Альянса", cost: 15, gems: 60, gold: 10000, condition: "Требуется 15 Смолы" }
    ],
    anomaly: {
      id: "anomaly_frost",
      name: "Крио-Завихрение времени",
      level: 35,
      disorder: "Перегрузка и Сверхпроводник прерывают ходы врагов на 10% ATB.",
      reward: { gems: 50, gold: 6000, exp: 600 },
      enemies: ["glacier", "krona"],
      enemyIcons: ["🏔️", "❄️"]
    }
  },
  {
    id: "neon_sector",
    name: "Неоновый Квартал",
    description: "Заброшенный мегаполис безопасности с бесконечным электро-дождём. Энергетическое логово Рейвен.",
    element: "Electro",
    elementColor: "text-indigo-400 border-indigo-500/30 bg-indigo-950/10",
    unlockedBy: "s1_2",
    unlockLabel: "Ответьте на Загадку Стража в Сюжете s1_2",
    bgGradient: "from-indigo-950/40 via-slate-900/50 to-slate-950/80",
    glowColor: "shadow-indigo-400/20",
    coords: { x: 70, y: 75 },
    dungeons: [
      { id: "domain_neon", name: "Сектор Неона", desc: "Добыча сетов 'Протокол Изоляции' и 'Знать'" }
    ],
    chests: [
      { id: "chest_neon_1", name: "Цифровой Чемодан", cost: 0, gems: 30, gold: 5000, condition: "Свободен для открытия" },
      { id: "chest_neon_2", name: "Гипер-Дроп Прогресса", cost: 20, gems: 80, gold: 12000, condition: "Требуется 20 Смолы" }
    ],
    anomaly: {
      id: "anomaly_neon",
      name: "Подавление Систем Защиты",
      level: 50,
      disorder: "Электро урон увеличен на 50%. Враги восстанавливают на 20% меньше ATB.",
      reward: { gems: 60, gold: 8000, exp: 800 },
      enemies: ["raven", "spark", "pulse"],
      enemyIcons: ["🔪", "🔌", "⚙️"]
    }
  },
  {
    id: "jade_grove",
    name: "Дендро Тропики Гайи",
    description: "Густые кибер-джунгли, питаемые био-топливом древней экосистемы. Здесь сила природы сливается с кодом.",
    element: "Dendro",
    elementColor: "text-emerald-400 border-emerald-500/30 bg-emerald-950/10",
    unlockedBy: "s1_3",
    unlockLabel: "Пройдите диалог s1_3 'Встреча с Ашером'",
    bgGradient: "from-emerald-950/40 via-slate-900/50 to-slate-950/80",
    glowColor: "shadow-emerald-400/20",
    coords: { x: 80, y: 30 },
    dungeons: [
      { id: "domain_ashes", name: "Кузница Пепла", desc: "Стыковые био-сеты" }
    ],
    chests: [
      { id: "chest_jade_1", name: "Забытая био-капсула", cost: 0, gems: 40, gold: 6000, condition: "Свободен для открытия" }
    ],
    anomaly: {
      id: "anomaly_jade",
      name: "Лесной Дендро-Синтез",
      level: 60,
      disorder: "Каждое Дендро наложение исцеляет активного героя на 5% HP.",
      reward: { gems: 70, gold: 10000, exp: 1000 },
      enemies: ["gaia", "selva"],
      enemyIcons: ["🌳", "⚡"]
    }
  },
  {
    id: "abyss_depths",
    name: "Пучина Бездны",
    description: "Самая глубокая складка реальности. Космический вакуум, где законы физики окончательно уступают место энтропии.",
    element: "Geo",
    elementColor: "text-purple-400 border-purple-500/30 bg-purple-950/10",
    unlockedBy: "s1_4",
    unlockLabel: "Пройдите Испытание Молота Ашера s1_4",
    bgGradient: "from-purple-950/40 via-slate-900/50 to-slate-950/80",
    glowColor: "shadow-purple-400/20",
    coords: { x: 45, y: 80 },
    dungeons: [
      { id: "domain_duel", name: "Арена Охотников", desc: "Гордость Дуэлянта" }
    ],
    chests: [
      { id: "chest_abyss_1", name: "Сингулярный Сундук", cost: 20, gems: 100, gold: 15000, condition: "Требуется 20 Смолы" }
    ],
    anomaly: {
      id: "anomaly_abyss",
      name: "Апокалиптическая Аномалия Бездны",
      level: 80,
      disorder: "Усиление Крит. урона всех союзников на 35%. Штрафы исцеления отсутствуют.",
      reward: { gems: 100, gold: 20000, exp: 1200 },
      enemies: ["moyan", "aegis", "cyrus"],
      enemyIcons: ["🪨", "🛡️", "🎯"]
    }
  }
];

export default function WorldMap({ profile, updateProfile, setRoute, onBack }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(REGIONS[0]);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const completedStages = profile.storyProgress?.completedStages || [];

  const isRegionUnlocked = (region: MapRegion) => {
    if (region.unlockedBy === "always") return true;
    return completedStages.includes(region.unlockedBy);
  };

  const getChestsClaimed = () => profile.mapState?.claimedChests || [];
  const getAnomaliesCompleted = () => profile.mapState?.completedAnomalies || [];

  const claimChest = (regionId: string, chest: typeof REGIONS[0]['chests'][0]) => {
    const claimed = getChestsClaimed();
    if (claimed.includes(chest.id)) return;

    if (profile.resin < chest.cost) {
      alert("Недостаточно смолы для разблокировки сундука!");
      return;
    }

    updateProfile(p => {
      const currentClaimed = p.mapState?.claimedChests || [];
      const currentCompleted = p.mapState?.completedAnomalies || [];
      const currentUnlocked = p.mapState?.unlockedRegions || [];

      return {
        ...p,
        gems: p.gems + chest.gems,
        gold: p.gold + chest.gold,
        resin: p.resin - chest.cost,
        mapState: {
          claimedChests: [...currentClaimed, chest.id],
          completedAnomalies: currentCompleted,
          unlockedRegions: currentUnlocked
        }
      };
    });

    setClaimSuccessMsg(`Ресурс получен!\n💎 +${chest.gems} Кристаллов\n🪙 +${chest.gold} Золота`);
    setTimeout(() => setClaimSuccessMsg(null), 3000);
  };

  const startAnomalyBattle = (region: MapRegion) => {
    const completed = getAnomaliesCompleted();
    
    // Dynamically design a story stage on the fly to fit our layout perfectly
    const stage: StoryStage = {
      id: region.anomaly.id,
      name: region.anomaly.name,
      description: `Аномалия Измерения: ${region.anomaly.disorder}`,
      type: 'BATTLE',
      level: region.anomaly.level,
      enemyBlueprintIds: region.anomaly.enemies,
      reward: {
        gems: region.anomaly.reward.gems,
        gold: region.anomaly.reward.gold,
        exp: region.anomaly.reward.exp
      }
    };

    // Update profile so when they win, the anomaly registers as completed
    updateProfile(p => {
      const currentClaimed = p.mapState?.claimedChests || [];
      const currentCompleted = p.mapState?.completedAnomalies || [];
      const currentUnlocked = p.mapState?.unlockedRegions || [];

      // Interceptor to mark anomaly as completed
      return {
        ...p,
        mapState: {
          claimedChests: currentClaimed,
          completedAnomalies: currentCompleted.includes(region.anomaly.id) ? currentCompleted : [...currentCompleted, region.anomaly.id],
          unlockedRegions: currentUnlocked
        }
      };
    });

    // Take them straight to battle selection screen via dynamic route injection
    setRoute({ type: 'STORY_STAGE', stage });
  };

  // Stats
  const unlockedCount = REGIONS.filter(isRegionUnlocked).length;
  const totalChests = REGIONS.reduce((sum, r) => sum + r.chests.length, 0);
  const claimedChestsCount = REGIONS.reduce((sum, r) => {
    return sum + r.chests.filter(c => getChestsClaimed().includes(c.id)).length;
  }, 0);
  const completedAnomaliesCount = REGIONS.reduce((sum, r) => {
    return sum + (getAnomaliesCompleted().includes(r.anomaly.id) ? 1 : 0);
  }, 0);

  return (
    <div className="w-full max-w-6xl h-[95dvh] md:h-[85vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative text-slate-200 font-sans">
      
      {/* Background Cyber Stars Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Globe className="w-7 h-7 text-indigo-400 animate-spin-slow" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
              Карта Иного Измерения
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
              <span>Регионов: {unlockedCount}/{REGIONS.length}</span>
              <span className="text-slate-700">|</span>
              <span>Сундуки: {claimedChestsCount}/{totalChests}</span>
              <span className="text-slate-700">|</span>
              <span>Аномалии: {completedAnomaliesCount}/{REGIONS.length}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 sm:px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-white font-bold rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider"
        >
          Назад
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Main Canvas Area */}
        <div className="flex-1 min-h-[40vh] md:min-h-0 relative bg-slate-950/40 overflow-hidden border-b-2 md:border-b-0 md:border-r border-slate-900 flex items-center justify-center">
          
          {/* Map Grid and Layout */}
          <div className="absolute w-full h-full inset-0 overflow-hidden">
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-40">
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Draw connected lines between available zones */}
              {REGIONS.map((r, i) => {
                if (i === 1) { // Connect Forge to Frost
                  const from = REGIONS[0];
                  return (
                    <line 
                      key={r.id}
                      x1={`${from.coords.x}%`} 
                      y1={`${from.coords.y}%`} 
                      x2={`${r.coords.x}%`} 
                      y2={`${r.coords.y}%`} 
                      stroke="url(#glowGrad)" 
                      strokeWidth="2" 
                      strokeDasharray="4 6" 
                      className="animate-pulse"
                    />
                  );
                }
                if (i === 2) { // Connect Frost to Neon
                  const from = REGIONS[1];
                  return (
                    <line 
                      key={r.id}
                      x1={`${from.coords.x}%`} 
                      y1={`${from.coords.y}%`} 
                      x2={`${r.coords.x}%`} 
                      y2={`${r.coords.y}%`} 
                      stroke="url(#glowGrad)" 
                      strokeWidth="2" 
                      strokeDasharray="4 6"
                    />
                  );
                }
                if (i === 3) { // Connect Frost to Jade
                  const from = REGIONS[1];
                  return (
                    <line 
                      key={r.id}
                      x1={`${from.coords.x}%`} 
                      y1={`${from.coords.y}%`} 
                      x2={`${r.coords.x}%`} 
                      y2={`${r.coords.y}%`} 
                      stroke="url(#glowGrad)" 
                      strokeWidth="2" 
                      strokeDasharray="4 6"
                    />
                  );
                }
                if (i === 4) { // Connect Neon to Abyss
                  const from = REGIONS[2];
                  return (
                    <line 
                      key={r.id}
                      x1={`${from.coords.x}%`} 
                      y1={`${from.coords.y}%`} 
                      x2={`${r.coords.x}%`} 
                      y2={`${r.coords.y}%`} 
                      stroke="url(#glowGrad)" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 6"
                    />
                  );
                }
                return null;
              })}
            </svg>

            {/* Region Interactive Circle Nodes */}
            {REGIONS.map((region) => {
              const unlocked = isRegionUnlocked(region);
              const selected = selectedRegion?.id === region.id;
              
              let elementalBadge = "🔥";
              if (region.element === 'Cryo') elementalBadge = "❄️";
              if (region.element === 'Electro') elementalBadge = "⚡";
              if (region.element === 'Dendro') elementalBadge = "🌱";
              if (region.element === 'Geo') elementalBadge = "🪨";

              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region)}
                  style={{ left: `${region.coords.x}%`, top: `${region.coords.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-350 active:scale-95",
                    unlocked ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <div className="relative">
                    {/* Pulsing Outer Aura */}
                    {unlocked && (
                      <div className={cn(
                        "absolute -inset-3 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity animate-pulse-slow duration-1000",
                        region.element === 'Pyro' ? 'bg-red-500/20' :
                        region.element === 'Cryo' ? 'bg-cyan-500/20' :
                        region.element === 'Electro' ? 'bg-indigo-500/20' :
                        region.element === 'Dendro' ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                      )} />
                    )}

                    {/* Ring Border */}
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center relative shadow-lg transition-transform group-hover:scale-110",
                      selected ? "border-amber-400 bg-slate-900 shadow-amber-500/20" :
                      unlocked 
                        ? "border-slate-700 bg-slate-900 hover:border-indigo-400" 
                        : "border-slate-800 bg-slate-950 opacity-60"
                    )}>
                      {unlocked ? (
                        <span className="text-xl sm:text-2xl drop-shadow-[0_4px_5px_rgba(0,0,0,0.6)]">{elementalBadge}</span>
                      ) : (
                        <Lock className="w-5 h-5 text-slate-700" />
                      )}

                      {/* Spark indicator for unfinished Anomaly */}
                      {unlocked && !getAnomaliesCompleted().includes(region.anomaly.id) && (
                        <div className="absolute -top-1 -right-1 z-10 w-3.5 h-3.5 bg-red-500 rounded-full border border-black animate-ping" />
                      )}
                    </div>
                  </div>

                  {/* Region Information Bubble */}
                  <div className={cn(
                    "mt-2.5 px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border text-center transition-colors shadow-xl",
                    selected ? "border-amber-500/50 text-white" : "border-slate-800 text-slate-400 group-hover:text-white"
                  )}>
                    <div className="text-[10px] sm:text-xs font-black truncate max-w-[100px] uppercase tracking-tighter sm:tracking-normal">{region.name}</div>
                    {!unlocked && (
                      <div className="text-[7px] text-red-500/80 font-mono tracking-wider font-extrabold uppercase mt-0.5 whitespace-nowrap">Заблокировано</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-3 rounded-xl max-w-xs text-xs pointer-events-none space-y-1 shadow-2xl">
             <div className="font-extrabold text-[10px] text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
               <Compass className="w-3.5 h-3.5" /> Подсказка исследователя
             </div>
             <p className="text-slate-400 font-mono text-[10px] leading-relaxed">
               Прогрессируйте в сюжетной линии, открывая новые этапы Летописи Мира, чтобы рассеять туман и разблокировать новые регионы на карте!
             </p>
          </div>
        </div>

        {/* Info Sidebar Section */}
        <div className="w-full md:w-2/5 shrink-0 bg-slate-900/40 p-5 overflow-y-auto max-h-[50vh] md:max-h-none flex flex-col relative z-20">
          <AnimatePresence mode="wait">
            {selectedRegion ? (
              <motion.div
                key={selectedRegion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 h-full"
              >
                {/* Visual Banner */}
                <div className={cn("p-4 rounded-2xl border bg-gradient-to-br shadow-inner text-left relative overflow-hidden", selectedRegion.bgGradient, selectedRegion.elementColor)}>
                   <div className="relative z-10">
                     <span className="text-[9px] font-black uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/5">{selectedRegion.element} РЕГИОН</span>
                     <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mt-2">{selectedRegion.name}</h3>
                     <p className="text-sm text-slate-300 font-medium leading-relaxed mt-1">{selectedRegion.description}</p>
                   </div>
                   <Map className="absolute -right-8 -bottom-8 w-32 h-32 opacity-5 pointer-events-none transform rotate-12" />
                </div>

                {isRegionUnlocked(selectedRegion) ? (
                  <div className="space-y-5">
                    {/* Dungeons Panel */}
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-2.5">Доступные испытания</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedRegion.dungeons.map(dung => (
                          <div 
                            key={dung.id}
                            className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-indigo-500/20 flex justify-between items-center transition-all group"
                          >
                            <div className="min-w-0 pr-4">
                              <span className="font-bold text-slate-200 text-sm block truncate group-hover:text-indigo-400">{dung.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate">{dung.desc}</span>
                            </div>
                            <button
                              onClick={() => setRoute('ARTIFACT_DUNGEON_SELECTOR')}
                              className="px-3.5 py-1.5 bg-indigo-900/30 border border-indigo-700 hover:bg-indigo-600 transition text-white rounded-lg font-mono font-bold text-[10px] uppercase shrink-0"
                            >
                              Перейти
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Treasure Chests Panel */}
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-2.5">Сокровища региона</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedRegion.chests.map(chest => {
                          const claimed = getChestsClaimed().includes(chest.id);
                          return (
                            <div 
                              key={chest.id}
                              className={cn(
                                "p-3 bg-slate-950 rounded-xl border transition-all flex justify-between items-center",
                                claimed ? "border-slate-900/80 opacity-60" : "border-slate-800"
                              )}
                            >
                              <div className="min-w-0 pr-4">
                                <span className={cn("font-bold text-sm block truncate", claimed ? "text-slate-500 line-through" : "text-slate-200")}>{chest.name}</span>
                                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                                  <span>Награда:</span>
                                  <span className="text-pink-400 font-black">+{chest.gems} 💎</span>
                                  <span className="text-yellow-400 font-black">+{chest.gold} G</span>
                                  {chest.cost > 0 && <span className="text-blue-400 font-bold">({chest.cost} смолы)</span>}
                                </div>
                              </div>
                              <button
                                disabled={claimed}
                                onClick={() => claimChest(selectedRegion.id, chest)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase shrink-0 transition-all",
                                  claimed 
                                    ? "bg-slate-900 text-slate-600 border border-slate-800" 
                                    : "bg-amber-600 hover:bg-amber-500 text-slate-950 hover:scale-105 active:scale-95"
                                )}
                              >
                                {claimed ? "Собрано" : "Открыть"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Regional Anomaly Panel (Daily Fight) */}
                    <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                       <div className="flex justify-between items-center mb-2.5">
                          <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-indigo-400 animate-pulse" /> Сигнатура аномалии
                          </h4>
                          {getAnomaliesCompleted().includes(selectedRegion.anomaly.id) && (
                            <span className="flex items-center gap-1.5 text-xs text-green-400 font-black font-mono">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Зачищено
                            </span>
                          )}
                       </div>

                       <h5 className="font-extrabold text-base text-white">{selectedRegion.anomaly.name}</h5>
                       <p className="text-xs text-slate-400 leading-relaxed mt-1 font-mono">
                         <span className="text-indigo-300 font-bold">Эффект аномалии: </span>{selectedRegion.anomaly.disorder}
                       </p>

                       <div className="flex flex-wrap gap-2 items-center my-3">
                          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">Группа врагов ({selectedRegion.anomaly.level} lvl):</span>
                          <div className="flex gap-1.5">
                             {selectedRegion.anomaly.enemyIcons.map((ic, index) => (
                               <span key={index} className="w-7 h-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-sm shadow-md" title={selectedRegion.anomaly.enemies[index]}>
                                 {ic}
                               </span>
                             ))}
                          </div>
                       </div>

                       <div className="flex items-end justify-between pt-2 border-t border-indigo-500/10">
                          <div className="text-[9px] font-mono text-slate-400 space-y-0.5">
                             <div className="text-pink-400 font-black flex items-center gap-0.5">+ {selectedRegion.anomaly.reward.gems} 💎</div>
                             <div className="text-yellow-400 font-black">+ {selectedRegion.anomaly.reward.gold} G</div>
                             <div className="text-green-400 font-bold">+ {selectedRegion.anomaly.reward.exp} EXP</div>
                          </div>
                          
                          <button
                            onClick={() => startAnomalyBattle(selectedRegion)}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                          >
                             Вызвать Глитч
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-900 border-dashed">
                    <Lock className="w-12 h-12 text-slate-800 mb-3 animate-bounce" />
                    <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Сектор заблокирован</h4>
                    <p className="text-xs text-slate-600 font-mono mt-1 px-4 leading-relaxed">
                      {selectedRegion.unlockLabel}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <Globe className="w-16 h-16 mb-4 opacity-10 animate-pulse-slow" />
                <p className="font-mono uppercase tracking-widest text-xs">Выберите регион на карте</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Claim Chest Success Alert Modal */}
      <AnimatePresence>
        {claimSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <div className="bg-slate-900 border-2 border-amber-500 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.3)] max-w-sm">
               <Award className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
               <h3 className="text-lg font-black uppercase text-amber-400 tracking-tight">Ларь открыт!</h3>
               <p className="text-sm text-slate-300 font-mono mt-2 whitespace-pre-wrap leading-relaxed">{claimSuccessMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
