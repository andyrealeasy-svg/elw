import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  ChevronRight, 
  Flame, 
  Zap, 
  Droplets, 
  Leaf, 
  Snowflake, 
  Mountain, 
  Sparkles,
  Info,
  Shield,
  Sword,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { charRarity, getCharEmoji, getCharSplash } from '../data';
import { Rarity } from '../types';

interface TeamComposition {
  name: string;
  description: string;
  members: string[]; // Blueprint IDs
  tags: string[];
}

interface MetaGuideProps {
  onBack: () => void;
}

export const MetaGuide: React.FC<MetaGuideProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'TIER_LIST' | 'TEAMS' | 'REACTIONS'>('TIER_LIST');

  const reactions = [
    { 
      name: "Пар", 
      elements: ["Hydro", "Pyro"], 
      desc: "Увеличивает урон атаки в 1.5 раза. Мощная атакующая реакция.", 
      color: "from-blue-500 to-red-500",
      icon: <Droplets className="w-5 h-5 text-blue-400" />
    },
    { 
      name: "Таяние", 
      elements: ["Cryo", "Pyro"], 
      desc: "Увеличивает урон атаки в 1.5 раза. Классика для высоких цифр урона.", 
      color: "from-cyan-400 to-red-500",
      icon: <Snowflake className="w-5 h-5 text-cyan-300" />
    },
    { 
      name: "Стимуляция", 
      elements: ["Dendro", "Electro"], 
      desc: "Увеличивает урон в 1.5 раза. База для Дендро-ДД персонажей.", 
      color: "from-emerald-500 to-purple-500",
      icon: <Leaf className="w-5 h-5 text-emerald-400" />
    },
    { 
      name: "Горение", 
      elements: ["Dendro", "Pyro"], 
      desc: "Наносит постепенный урон огнем. Множитель 1.4x.", 
      color: "from-emerald-500 to-red-600",
      icon: <Flame className="w-5 h-5 text-orange-500" />
    },
    { 
      name: "Бутонизация", 
      elements: ["Dendro", "Hydro"], 
      desc: "Создает взрыв семян, наносящий AoE урон. Множитель 1.4x.", 
      color: "from-emerald-500 to-blue-600",
      icon: <Sparkles className="w-5 h-5 text-emerald-300" />
    },
    { 
      name: "Перегрузка", 
      elements: ["Electro", "Pyro"], 
      desc: "Вызывает взрыв, наносящий урон по площади. Множитель 1.3x.", 
      color: "from-purple-600 to-red-600",
      icon: <Zap className="w-5 h-5 text-purple-400" />
    },
    { 
      name: "Сверхпроводник", 
      elements: ["Cryo", "Electro"], 
      desc: "Снижает физическую защиту врага на 15 единиц. Урон 1.3x.", 
      color: "from-cyan-300 to-purple-600",
      icon: <Shield className="w-5 h-5 text-indigo-400" />
    },
    { 
      name: "Заряжен", 
      elements: ["Electro", "Hydro"], 
      desc: "Наносит цепочку Электро-ударов. Множитель 1.2x. Статус сохраняется.", 
      color: "from-purple-500 to-blue-500",
      icon: <Zap className="w-5 h-5 text-blue-300" />
    },
    { 
      name: "Заморозка", 
      elements: ["Cryo", "Hydro"], 
      desc: "Сковывает врагов, снижая их скорость (SPD) на 10. Множитель 1.1x.", 
      color: "from-cyan-200 to-blue-400",
      icon: <Snowflake className="w-5 h-5 text-white" />
    },
    { 
      name: "Кристаллизация", 
      elements: ["Geo", "All"], 
      desc: "При взаимодействии Гео с любым элементом создается щит (100 HP).", 
      color: "from-amber-600 to-slate-400",
      icon: <Mountain className="w-5 h-5 text-amber-500" />
    },
    { 
      name: "Отражение", 
      elements: ["Pyro", "Electro"], 
      desc: "Создает зеркальный импульс (только для Инеффы). Сохраняет часть урона и возвращает его усиленным.", 
      color: "from-red-600 to-rose-400",
      icon: <Sparkles className="w-5 h-5 text-rose-300" />
    },
  ];

  const getElementIcon = (el: string) => {
    switch(el) {
      case 'Pyro': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Hydro': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'Electro': return <Zap className="w-4 h-4 text-purple-500" />;
      case 'Dendro': return <Leaf className="w-4 h-4 text-emerald-500" />;
      case 'Cryo': return <Snowflake className="w-4 h-4 text-cyan-400" />;
      case 'Geo': return <Mountain className="w-4 h-4 text-amber-600" />;
      default: return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  interface TierEntry {
    id: string;
    c?: number; // Minimum constellation for this tier if it's an "upgrade"
  }

  const tierList: Record<string, TierEntry[]> = {
    'T0': [
      { id: 'ineffa' },
      { id: 'zephyr' },
      { id: 'aurum' },
      { id: 'maestro' },
      { id: 'raven' },
      { id: 'moyan' },
      { id: 'aelita' },
      { id: 'selva', c: 6 },
      { id: 'neuron', c: 2 }
    ],
    'T0.5': [
      { id: 'cyrus' },
      { id: 'asher' },
      { id: 'selina', c: 6 },
      { id: 'krona', c: 6 },
      { id: 'nova', c: 6 },
      { id: 'fenris' },
      { id: 'selva' },
      { id: 'neuron' }
    ],
    'T1': [
      { id: 'rix' },
      { id: 'gotka' },
      { id: 'echo', c: 6 },
      { id: 'viper', c: 6 },
      { id: 'blaze' },
      { id: 'tide' },
      { id: 'pulse' },
      { id: 'krona' },
      { id: 'selina' }
    ],
    'T2': [
      { id: 'kopro' },
      { id: 'claymore' },
      { id: 'aegis', c: 6 },
      { id: 'glacier', c: 6 },
      { id: 'spark', c: 6 },
      { id: 'echo' },
      { id: 'viper' }
    ],
    'T3': [
      { id: 'volosatinya' },
      { id: 'kamikaze' },
      { id: 'patch' },
      { id: 'nova' },
      { id: 'gaia' },
      { id: 'aegis' },
      { id: 'glacier' },
      { id: 'spark' }
    ]
  };

  const getTierInfo = (tier: string) => {
    switch(tier) {
      case 'T0': return { label: 'Абсолютная Мета', desc: 'Персонажи, ломающие баланс игры. Обязательны к прокачке.', color: 'bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)]' };
      case 'T0.5': return { label: 'Элита', desc: 'Почти идеальны, часто требуют созвездий для полного раскрытия.', color: 'bg-orange-500 text-black' };
      case 'T1': return { label: 'Сильные', desc: 'Очень надежные персонажи, составляющие основу большинства отрядов.', color: 'bg-indigo-500 text-white' };
      case 'T2': return { label: 'Средние', desc: 'Хороши в своих нишах, требуют специфических условий.', color: 'bg-slate-700 text-slate-300' };
      case 'T3': return { label: 'Слабые / Нишевые', desc: 'Требуют огромных вложений или очень специфических отрядов.', color: 'bg-slate-800 text-white/40' };
      default: return { label: 'Неизвестно', desc: '', color: 'bg-slate-800 text-white' };
    }
  };

  const recommendedTeams: TeamComposition[] = [
    {
      name: "Идеальное Отражение",
      description: "Ультимативная сборка для максимизации Отражения. Зефир и Аурум разгоняют урон реакции и дают колоссальный бафф, Рикс лечит и ускоряет, а Инеффа стирает врагов с лица земли.",
      members: ['ineffa', 'zephyr', 'aurum', 'rix'],
      tags: ["REFLECTION", "META", "SYNERGY"]
    },
    {
      name: "Симфония Грома",
      description: "Маэстро управляет полем боя, стягивая врагов и накладывая контроль, пока Зефир и Рейвен наносят сокрушительный АоЕ-урон.",
      members: ['maestro', 'zephyr', 'raven', 'pulse'],
      tags: ["AOE", "ELECTRO", "CONTROL"]
    },
    {
      name: "Разбитое Зеркало",
      description: "Сборка вокруг Инеффы и реакции Отражения. Нейрон или Сельва дают Электро статус, а Инеффа разносит всё своими зеркалами, стакая колоссальный урон.",
      members: ['ineffa', 'neuron', 'selva', 'moyan'],
      tags: ["REFLECTION", "PYRO", "BURST"]
    },
    {
      name: "Пламя Погибели",
      description: "Синергия Селины и Ашера. Ашер заливает стаки и контролирует HP, позволяя Селине наносить запредельный урон.",
      members: ['selina', 'asher', 'moyan', 'neuron'],
      tags: ["SYNERGY", "PYRO", "POWER-CREEP"]
    },
    {
      name: "Электро-Резонанс",
      description: "Команда сфокусирована на Электро реакциях и баффах от Нейрона. Идеально для быстрой зачистки.",
      members: ['selva', 'neuron', 'echo', 'moyan'],
      tags: ["META", "BURST", "ELECTRO"]
    },
    {
      name: "Дендро-Бутонизация",
      description: "Аэлита накладывает метки, Сельва триггерит реакции. Команда с огромным AoE уроном.",
      members: ['aelita', 'echo', 'selva', 'moyan'],
      tags: ["REACTIONS", "AOE", "DENDRO"]
    },
    {
      name: "Пиро-Синхронизация",
      description: "Селина обеспечивает выживаемость и урон, в то время как другие персонажи помогают накладывать статусы.",
      members: ['selina', 'neuron', 'blaze', 'moyan'],
      tags: ["STABLE", "PYRO", "SHIELD"]
    },
    {
       name: "Морозная Тюрьма",
       description: "Манипуляция шкалой ходов (ATB) и заморозка врагов. Противник просто не успевает ходить.",
       members: ['krona', 'tide', 'glacier', 'moyan'],
       tags: ["CONTROL", "CRYO", "ATB"]
    },
    {
      name: "Дуэльный Клуб",
      description: "Команда полностью посвящена усилению Сайруса. Моян дает защиту, Эгида баффает выживаемость, Нова помогает пробивать мелких врагов.",
      members: ['cyrus', 'nova', 'moyan', 'aegis'],
      tags: ["SINGLE-TARGET", "PHYSICAL", "EXECUTE"]
    },
    {
      name: "Идеальная Изоляция",
      description: "Синергия Рейвена и Сайруса. Сайрус вешает метку дуэли на главного босса, благодаря чему АоЕ Рейвена гарантированно не бьёт босса, но наносит умноженный урон по всей мелюзге, моментально расчищая поле.",
      members: ['cyrus', 'raven', 'tide', 'pulse'],
      tags: ["SMART-AOE", "ELECTRO", "SINGLE-TARGET"]
    },
    {
      name: "Стеклянная Пушка",
      description: "Максимальный физический урон. Требует аккуратной игры и постоянного подхилла/щитов.",
      members: ['kamikaze', 'patch', 'moyan', 'krona'],
      tags: ["HIGH-RISK", "PHYSICAL", "BOSS-KILLER"]
    },
    {
      name: "Ярость Новы",
      description: "Сборка вокруг Новы. Моян лечит последствия ее навыков, а Эгида дает щиты, чтобы она не погибла при низком HP.",
      members: ['nova', 'moyan', 'aegis', 'patch'],
      tags: ["BERSERK", "PHYSICAL", "SURVIVAL"]
    },
    {
      name: "Дикий Дуэт",
      description: "Фенрис и его зверь доминируют на поле, продлевая статусы. Идеально сочетается с Пиро/Электро саппортами.",
      members: ['fenris', 'selva', 'blaze', 'moyan'],
      tags: ["COMPANION", "DENDRO", "EXTEND"]
    }
  ];

  const getElementColor = (charId: string) => {
    // This is a bit redundant but helps with custom styling inside the component
    const char = charId.toLowerCase();
    if (['gotka', 'selina', 'blaze'].includes(char)) return 'text-red-400 border-red-500/20 bg-red-500/5';
    if (['cyrus', 'nova', 'kamikaze'].includes(char)) return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    if (['volosatinya', 'echo', 'tide'].includes(char)) return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    if (['kopro', 'aelita', 'viper', 'patch', 'gaia', 'fenris'].includes(char)) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (['selva', 'neuron', 'spark', 'pulse', 'raven'].includes(char)) return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
    if (['moyan', 'claymore', 'aegis'].includes(char)) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (['krona', 'glacier'].includes(char)) return 'text-cyan-300 border-cyan-500/20 bg-cyan-500/5';
    return 'text-white border-white/10 bg-white/5';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans text-white overflow-hidden"
    >
      {/* Background decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150 rotate-90" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Гайд по Мете</h1>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none">Meta Strategy & Team Building</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 rounded-2xl p-1 gap-1">
          {(['TIER_LIST', 'TEAMS', 'REACTIONS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              {tab === 'TIER_LIST' ? 'Тир-лист' : tab === 'TEAMS' ? 'Отряды' : 'Элементы'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <AnimatePresence mode="wait">
            {activeTab === 'TIER_LIST' ? (
              <motion.div 
                key="tier"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 pb-20"
              >
                {Object.keys(tierList).map((tier) => {
                  const info = getTierInfo(tier);
                  return (
                    <div key={tier} className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-indigo-500 pl-4">
                        <div className={cn(
                          "w-16 h-10 sm:w-20 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black italic shrink-0",
                          info.color
                        )}>
                          {tier}
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-1">
                            {info.label}
                          </h2>
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                            {info.desc}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 sm:gap-4">
                        {tierList[tier].map((entry) => (
                          <motion.div 
                            key={`${tier}-${entry.id}-${entry.c || 0}`}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className={cn(
                              "group p-3 sm:p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden",
                              getElementColor(entry.id),
                              tier === 'T0' ? "border-rose-500/40 bg-rose-500/5" : ""
                            )}
                          >
                            {/* Splash Background */}
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                               <img 
                                 src={getCharSplash(entry.id) || ''} 
                                 alt="" 
                                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                 referrerPolicy="no-referrer"
                               />
                               <div className="absolute inset-0 bg-slate-950/60" />
                            </div>

                            {tier === 'T0' && !entry.c && (
                              <div className="absolute top-2 right-2 z-20">
                                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                              </div>
                            )}

                            {entry.c && (
                              <div className="absolute top-2 right-2 z-20 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-black/10">
                                C{entry.c}
                              </div>
                            )}
                            
                            <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl mb-2 shadow-xl group-hover:scale-110 transition-transform">
                              {getCharEmoji(entry.id)}
                            </div>
                            <div className="relative z-10 text-[10px] font-black uppercase tracking-tighter truncate w-full text-white/80 drop-shadow-md">{entry.id}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                   <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-3xl shrink-0">
                      <Sparkles className="w-10 h-10 text-indigo-400" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-black uppercase italic">Совет от ветеранов</h3>
                     <p className="text-white/50 text-sm leading-relaxed italic">
                       "Не забывайте, что сила персонажа зависит от его синергии с другими. Даже персонаж B-тира может стать богом в правильной пачке с правильными артефактами. Всегда ищите баланс между уроном и выживаемостью."
                     </p>
                   </div>
                </div>
              </motion.div>
            ) : activeTab === 'TEAMS' ? (
              <motion.div 
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {recommendedTeams.map((team, idx) => (
                  <motion.div 
                    key={team.name}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-slate-900/50 border border-white/5 rounded-[40px] p-8 space-y-6 hover:bg-slate-900 transition-colors relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                    
                    <div className="space-y-2 relative z-10">
                      <div className="flex gap-2">
                        {team.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-black tracking-widest px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">{team.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{team.description}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 relative z-10">
                      {team.members.map((memberId) => (
                        <div key={memberId} className="flex flex-col items-center gap-2">
                           <div className={cn(
                             "w-full aspect-square rounded-2xl flex items-center justify-center text-2xl border-2",
                             getElementColor(memberId)
                           )}>
                             {getCharEmoji(memberId)}
                           </div>
                           <div className="text-[8px] font-black uppercase text-white/30 truncate w-full text-center">{memberId}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-[8px] text-white/20 font-black uppercase">Уровень сложности</span>
                           <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i <= (idx === 4 ? 5 : idx === 3 ? 4 : 3) ? "bg-indigo-500" : "bg-slate-800")} />
                              ))}
                           </div>
                        </div>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group/btn">
                        Собрать <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="reactions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8 pb-20"
              >
                <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
                   <h2 className="text-3xl font-black uppercase italic tracking-tight">Элементальные Реакции</h2>
                   <p className="text-slate-400 text-sm font-medium">Комбинируйте стихии для получения мощных эффектов. Правильное наложение статусов — ключ к победе в сложных сражениях.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reactions.map((rxn, idx) => (
                    <motion.div 
                      key={rxn.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-all hover:bg-slate-900/60"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rxn.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-xl">
                          {rxn.icon}
                        </div>
                        <div className="flex gap-1">
                          {rxn.elements.map(el => (
                            <div key={el} className="p-1 bg-black/40 rounded-lg border border-white/10" title={el}>
                              {getElementIcon(el)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white/90">{rxn.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-medium">{rxn.desc}</p>

                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{rxn.elements.join(" + ")}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-slate-900/80 border border-white/10 p-8 rounded-[40px] border-dashed">
                  <h4 className="text-lg font-black uppercase italic mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" /> Как это работает?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm text-slate-400 font-medium">
                    <div className="space-y-4">
                      <p>1. Первый элемент накладывает <span className="text-indigo-400 font-bold uppercase tracking-tighter">Ауру</span> на врага.</p>
                      <p>2. Второй элемент вызывает <span className="text-amber-400 font-bold uppercase tracking-tighter">Реакцию</span>.</p>
                    </div>
                    <div className="space-y-4">
                      <p>3. <span className="text-cyan-400 font-bold">Гео</span> и <span className="text-white/80 font-bold">Физический</span> урон обычно поглощают ауру или не реагируют с ней (кроме Кристаллизации).</p>
                      <p>4. Порядок наложения часто влияет на множитель и длительность статуса.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};
