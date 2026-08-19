import React, { useState } from 'react';
import { PlayerProfile, GameRoute } from '../types';
import { Gem, Zap, Swords, Compass, Star, CheckCircle, Info, Users, Gift, Calendar, Map, Menu, X, Layers, Trophy, Book, Globe, Skull } from 'lucide-react';
import { characterBlueprints, charRarity, getCharEmoji, getCharSplash } from '../data';
import EventsMenu from './EventsMenu';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  setRoute: (r: GameRoute | { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT' }) => void;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
}

export default function HubMenu({ profile, setRoute, updateProfile }: Props) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DAILIES' | 'DUNGEONS' | 'ACHIEVEMENTS' | 'SHOP' | 'EVENTS' | 'EXPEDITIONS'>('OVERVIEW');
  const [menuOpen, setMenuOpen] = useState(false);

  // Daily Tasks Data
  const DAILIES = [
    { id: 0, title: "Путь воина", desc: "Одержать 1 победу в подземелье", target: 1, current: profile.dailies.battlesWon, rewardGems: 40, rewardBp: 25000 },
    { id: 1, title: "Искусство боя", desc: "Использовать 5 навыков", target: 5, current: profile.dailies.skillsUsed, rewardGems: 20, rewardBp: 15000 },
    { id: 2, title: "Зов судьбы", desc: "Сделать 1 молитву (Гача)", target: 1, current: profile.dailies.gachaPulls, rewardGems: 20, rewardBp: 10000 },
    { id: 3, title: "Цена силы", desc: "Потратить 20 смолы", target: 20, current: profile.dailies.resinsSpent, rewardGems: 30, rewardBp: 30000 },
    { id: 4, title: "Покупки", desc: "Совершить покупку в магазине обмена", target: 1, current: profile.dailies.itemsBought, rewardGems: 10, rewardBp: 20000 },
  ];

  const claimDaily = (id: number, rewardGems: number, rewardBp: number) => {
    updateProfile(p => {
       if (p.dailies.claimed[id]) return p;
       let next = {...p, gems: p.gems + rewardGems, bpExp: p.bpExp + rewardBp, dailies: {...p.dailies}};
       next.dailies.claimed = [...p.dailies.claimed];
       next.dailies.claimed[id] = true;
       return next;
    });
  };

  const ACHIEVEMENTS = [
    { id: "first_steps", title: "Первые шаги", desc: "Одержать 5 побед", target: 5, current: profile.dailies.battlesWon, reward: 100 },
    { id: "veteran", title: "Ветеран", desc: "Одержать 50 побед", target: 50, current: profile.dailies.battlesWon, reward: 500 },
    { id: "collector", title: "Коллекционер", desc: "Сделать 50 молитв", target: 50, current: profile.dailies.gachaPulls, reward: 500 },
    { id: "rich", title: "Богач", desc: "Собрать 50,000 золота", target: 50000, current: profile.gold, reward: 250 },
    { id: "full_house", title: "Отряд в сборе", desc: "Получить 4 персонажей", target: 4, current: Object.keys(profile.roster).length, reward: 300 },
    { id: "master", title: "Мастер", desc: "Собрать 150,000 золота", target: 150000, current: profile.gold, reward: 500 },
    { id: "big_spender", title: "Транжира", desc: "Потратить 1000 смолы", target: 1000, current: profile.dailies.resinsSpent, reward: 600 },
    { id: "skill_master", title: "Мастер навыков", desc: "Использовать 1000 навыков", target: 1000, current: profile.dailies.skillsUsed, reward: 400 },
    { id: "gacha_addict", title: "Лудоман", desc: "Сделать 200 молитв", target: 200, current: profile.dailies.gachaPulls, reward: 1000 },
  ];

  const claimAchievement = (id: string, reward: number) => {
    updateProfile(p => {
       if (p.achievements[id]) return p;
       let next = {...p, gems: p.gems + reward, achievements: {...p.achievements}};
       next.achievements[id] = true;
       return next;
    });
  };

  return (
    <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[600px] flex flex-col md:flex-row bg-slate-950 md:rounded-xl border-t-4 border-slate-900 shadow-2xl font-sans text-slate-200 overflow-hidden relative">
      
      {/* Sidebar Navigation - Desktop/Tablet Only */}
      <div className="hidden md:flex md:w-1/4 bg-slate-900 border-r border-slate-800 flex-col shrink-0 overflow-y-auto">
         <div className="p-4 md:p-6">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase">
               ИНОЕ ИЗМЕРЕНИЕ
            </h1>
         </div>
         
         <nav className="flex-1 flex flex-col gap-2 p-4">
            <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Compass className="w-5 h-5" /> Меню
            </button>
            <button onClick={() => setRoute('STORY')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-amber-500 transition-colors">
               <Book className="w-5 h-5" /> Сюжет
            </button>
            <button onClick={() => setRoute('MAP')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-indigo-400 transition-colors">
               <Globe className="w-5 h-5 animate-spin-slow" /> Карта мира
            </button>
            <button onClick={() => setActiveTab('DUNGEONS')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'DUNGEONS' ? 'bg-slate-800 text-blue-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Swords className="w-5 h-5" /> Подземелья
            </button>
            <button onClick={() => setRoute('ABYSS')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-purple-400 transition-colors">
               <Layers className="w-5 h-5" /> Бездна
            </button>
            <button onClick={() => setRoute('BOSS_RUSH_MENU')} className="flex items-center justify-between p-3 rounded-lg font-bold bg-fuchsia-950/40 border border-fuchsia-500/30 hover:bg-fuchsia-900/50 text-fuchsia-300 transition-all group">
               <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-fuchsia-400 group-hover:scale-110 transition-transform" /> 
                  <span>Теневой Натиск</span>
               </div>
               <span className="text-[9px] bg-fuchsia-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded font-black border border-fuchsia-500/40 uppercase">Новое</span>
            </button>
            <button onClick={() => setRoute('META')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-yellow-400 transition-colors group">
               <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Мета-гайд
            </button>
            <button onClick={() => setActiveTab('DAILIES')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'DAILIES' ? 'bg-slate-800 text-green-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <CheckCircle className="w-5 h-5" /> Поручения
            </button>
            <button onClick={() => setActiveTab('EXPEDITIONS')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'EXPEDITIONS' ? 'bg-slate-800 text-orange-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Map className="w-5 h-5" /> Экспедиции
            </button>
            <button onClick={() => setActiveTab('EVENTS')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'EVENTS' ? 'bg-slate-800 text-purple-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Calendar className="w-5 h-5" /> События
            </button>
            <button onClick={() => setActiveTab('ACHIEVEMENTS')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'bg-slate-800 text-yellow-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Star className="w-5 h-5" /> Достижения
            </button>
            <button onClick={() => setActiveTab('SHOP')} className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${activeTab === 'SHOP' ? 'bg-slate-800 text-pink-400' : 'hover:bg-slate-800/50 text-slate-400'}`}>
               <Gift className="w-5 h-5" /> Магазин
            </button>
            
            <div className="my-4 border-t border-slate-800"></div>
            
            <button onClick={() => setRoute('ROSTER')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-slate-400 transition-colors">
               <Users className="w-5 h-5" /> Отряд ({Object.keys(profile.roster).length})
            </button>
            <button onClick={() => setRoute('GACHA')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-slate-400 transition-colors">
               <Star className="w-5 h-5" /> Молитвы
            </button>
            <button onClick={() => setRoute('BP')} className="flex items-center gap-3 p-3 rounded-lg font-bold hover:bg-slate-800/50 text-slate-400 transition-colors">
               <Gift className="w-5 h-5" /> Бравл Пасс
            </button>
         </nav>
      </div>

      {/* Interactive Navigation Drawer Overlay for Mobile / Tablet */}
      {menuOpen && (
         <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-205">
            {/* Top Close Row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
               <div>
                  <h2 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase">
                     ИНОЕ ИЗМЕРЕНИЕ
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">Навигационное Меню</p>
               </div>
               <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 active:scale-95 transition"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Main Tabs Navigation Grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto pr-1">
               <button 
                  onClick={() => { setActiveTab('OVERVIEW'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'OVERVIEW' 
                        ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Compass className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-bold font-mono">Главная</span>
               </button>

               <button 
                  onClick={() => { setRoute('STORY'); setMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900 transition-all gap-2 text-center h-24"
               >
                  <Book className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-bold font-mono text-amber-400">Сюжет</span>
               </button>

               <button 
                  onClick={() => { setRoute('MAP'); setMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900 transition-all gap-2 text-center h-24"
               >
                  <Globe className="w-6 h-6 text-indigo-400 animate-spin-slow" />
                  <span className="text-xs font-bold font-mono text-indigo-400">Карта мира</span>
               </button>

               <button 
                  onClick={() => { setRoute('BOSS_RUSH_MENU'); setMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-fuchsia-500/50 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all gap-1.5 text-center h-24 relative overflow-hidden"
               >
                  <div className="absolute top-1 right-1 px-1 bg-fuchsia-500 text-[8px] font-black text-white rounded uppercase">NEW</div>
                  <Skull className="w-6 h-6 text-fuchsia-400" />
                  <span className="text-xs font-bold font-mono text-fuchsia-200">Теневой Натиск</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('DUNGEONS'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'DUNGEONS' 
                        ? 'border-blue-500/50 bg-blue-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Swords className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-bold font-mono">Подземелья</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('DAILIES'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'DAILIES' 
                        ? 'border-green-500/50 bg-green-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-xs font-bold font-mono">Поручения</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('EXPEDITIONS'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'EXPEDITIONS' 
                        ? 'border-orange-500/50 bg-orange-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Map className="w-6 h-6 text-orange-400" />
                  <span className="text-xs font-bold font-mono">Экспедиции</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('EVENTS'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'EVENTS' 
                        ? 'border-purple-500/50 bg-purple-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <span className="text-xs font-bold font-mono">События</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('ACHIEVEMENTS'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 text-center h-24 ${
                     activeTab === 'ACHIEVEMENTS' 
                        ? 'border-yellow-500/50 bg-yellow-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-xs font-bold font-mono">Достижения</span>
               </button>

               <button 
                  onClick={() => { setActiveTab('SHOP'); setMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all col-span-2 gap-2 text-center h-20 ${
                     activeTab === 'SHOP' 
                        ? 'border-pink-500/50 bg-pink-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                  }`}
               >
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-bold font-mono">Магазин обмена</span>
               </button>
            </div>

            {/* Game Screen Direct Links */}
            <div className="mt-4 pt-4 border-t border-slate-800">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Глобальные разделы</h3>
               <div className="grid grid-cols-3 gap-2">
                  <button 
                     onClick={() => { setRoute('ROSTER'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 transition rounded-xl text-slate-300"
                  >
                     <Users className="w-4 h-4 mb-1 text-slate-400" />
                     <span className="text-[10px] font-bold truncate">Отряд</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('GACHA'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 transition rounded-xl text-slate-300"
                  >
                     <Star className="w-4 h-4 mb-1 text-yellow-500 fill-yellow-500/20" />
                     <span className="text-[10px] font-bold truncate">Молитвы</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('BP'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 transition rounded-xl text-slate-300"
                  >
                     <Gift className="w-4 h-4 mb-1 text-pink-400" />
                     <span className="text-[10px] font-bold truncate">Бравл Пасс</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('ABYSS'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 transition rounded-xl text-slate-300"
                  >
                     <Layers className="w-4 h-4 mb-1 text-purple-400" />
                     <span className="text-[10px] font-bold truncate">Бездна</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('BOSS_RUSH_MENU'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-fuchsia-950/50 border border-fuchsia-500/50 hover:bg-fuchsia-900/50 active:scale-95 transition rounded-xl text-fuchsia-200"
                  >
                     <Skull className="w-4 h-4 mb-1 text-fuchsia-400" />
                     <span className="text-[10px] font-bold truncate">Натиск</span>
                  </button>
                  <button 
                     onClick={() => { setRoute('META'); setMenuOpen(false); }}
                     className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 transition rounded-xl text-slate-300"
                  >
                     <Trophy className="w-4 h-4 mb-1 text-yellow-400" />
                     <span className="text-[10px] font-bold truncate">Мета</span>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
         {/* Top Bar / Currency & Navigation Toggle */}
         <div className="h-14 sm:h-16 border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 bg-slate-900/50 shrink-0 font-mono text-sm sm:text-base">
            
            {/* Mobile Header elements on the left */}
            <div className="md:hidden flex items-center gap-2">
               <button 
                  onClick={() => setMenuOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 active:scale-95 transition border border-slate-700/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black whitespace-nowrap"
               >
                  <Menu className="w-4 h-4 text-blue-400" />
                  <span>МЕНЮ</span>
               </button>
               <button 
                  onClick={() => setRoute('BOSS_RUSH_MENU')}
                  className="flex items-center gap-1 bg-fuchsia-950/60 hover:bg-fuchsia-900/80 active:scale-95 transition border border-fuchsia-500/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black text-fuchsia-300 whitespace-nowrap shadow-lg shadow-fuchsia-900/30"
               >
                  <Skull className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>НАТИСК</span>
               </button>
            </div>

            {/* Desktop Center Header / Quick Boss Rush */}
            <div className="hidden md:flex items-center gap-2">
               <button 
                  onClick={() => setRoute('BOSS_RUSH_MENU')}
                  className="flex items-center gap-2 px-3 py-1 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-500/40 text-fuchsia-300 rounded-lg text-xs font-bold transition shadow-lg shadow-fuchsia-950/50"
               >
                  <Skull className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Теневой Натиск</span>
                  <span className="bg-fuchsia-500/30 text-fuchsia-200 text-[9px] px-1 rounded uppercase font-black">Босс-раш</span>
               </button>
            </div>

            {/* Currency trackers */}
            <div className="flex items-center gap-3 sm:gap-6">
               <div className="flex items-center gap-1.5" title="Смола (Используется для подземелий)">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="font-bold text-xs sm:text-base">{profile.resin}</span><span className="text-[10px] sm:text-sm text-slate-500">/160</span>
               </div>
               <div className="flex items-center gap-1.5" title="Гемы (Используются для молитв)">
                  <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                  <span className="font-bold text-xs sm:text-base">{profile.gems}</span>
               </div>
            </div>
         </div>

         {/* Dynamic Body */}
         <div className="p-4 sm:p-8 flex-1 overflow-x-hidden overflow-y-auto">
            {activeTab === 'OVERVIEW' && (
               <div className="flex flex-col space-y-6 animate-in fade-in">
                  <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-purple-900/40 rounded-3xl p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col items-start max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-indigo-500/10 text-indigo-400 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded-full border border-indigo-500/20">Профиль Путешественника</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black mb-3 italic tracking-tighter text-white drop-shadow-2xl leading-none">
                           {profile.team.length > 0 ? (profile.roster[profile.team[0]] ? characterBlueprints[profile.team[0]]("m", 1, 0).name : "Авантюрист") : "Авантюрист"}
                        </h2>
                        <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                           Ваш отряд готов к покорению кодовых пространств. Используйте экспедиции и поручения для накопления ресурсов.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                           <div className="bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5 flex flex-col items-start min-w-[120px] group-hover:border-white/10 transition-colors">
                              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Золото Моры</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-yellow-400 text-lg tabular-nums">{(profile.gold || 0).toLocaleString()}</span>
                                <div className="w-1 h-1 rounded-full bg-yellow-500/20" />
                              </div>
                           </div>
                           <div className="bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5 flex flex-col items-start min-w-[120px] group-hover:border-white/10 transition-colors">
                              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Опыт Героя</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-green-400 text-lg tabular-nums">{(profile.heroExp || 0).toLocaleString()}</span>
                                <div className="w-1 h-1 rounded-full bg-green-500/20" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <Compass className="absolute -right-12 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 text-white/5 transform rotate-12 transition-transform group-hover:rotate-45 duration-1000" />
                  </div>

                  {/* Endgame Feature: Boss Rush / Shadow Rush Card */}
                  <div className="bg-gradient-to-r from-fuchsia-950/80 via-purple-950/60 to-slate-900 border-2 border-fuchsia-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-fuchsia-500/20 text-fuchsia-300 font-black tracking-widest text-[9px] uppercase px-2.5 py-1 rounded-full border border-fuchsia-500/30 flex items-center gap-1.5">
                              <Skull className="w-3 h-3 text-fuchsia-400" /> Новый Эндгейм-Режим
                           </span>
                           <span className="text-[10px] text-fuchsia-400 font-mono font-bold">3 Отряда против 3 Мега-Боссов</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">ТЕНЕВОЙ НАТИСК</h3>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                           Сформируйте 3 уникальных отряда без повторения персонажей и одолейте Испепелителя, Абсолютный Ноль и Кристального Титана!
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-mono">
                           <span className="text-yellow-400 font-bold flex items-center gap-1">💎 200 Гемов</span>
                           <span className="text-amber-300 font-bold flex items-center gap-1">✨ 50,000 Моры</span>
                           <span className="text-purple-400 font-bold flex items-center gap-1">📦 Лег. Артефакты</span>
                        </div>
                     </div>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="relative z-10 w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-fuchsia-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 border border-fuchsia-400/40"
                     >
                        <Skull className="w-4 h-4" />
                        <span>Начать Натиск</span>
                     </button>
                  </div>
                  
                  <div className="pb-10">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-white/40 flex items-center gap-2">
                           <Users className="w-4 h-4 text-indigo-500" /> Активный отряд
                        </h3>
                        <div className="h-px flex-1 bg-white/5 ml-4" />
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                        {profile.team.map(id => {
                           const charInfo = profile.roster[id];
                           if (!charInfo) return null;
                           const char = characterBlueprints[id]("mock", charInfo.level, charInfo.constellation);
                           const rarity = charRarity[id];
                           const rColor = rarity === 'S' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : rarity === 'A' ? 'text-purple-400' : 'text-blue-400';
                           
                           return (
                              <div key={id} className="group bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-900 transition-all cursor-pointer relative overflow-hidden">
                                 <div className={cn("w-14 h-14 rounded-xl border-2 border-white/5 font-bold text-xl flex items-center justify-center relative shadow-2xl transition-transform group-hover:scale-105 overflow-hidden shrink-0", char.color)}>
                                    {getCharSplash(id) ? (
                                          <img src={getCharSplash(id) || ""} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                                       ) : (
                                          <span className="drop-shadow-md">{getCharEmoji(id)}</span>
                                       )}
                                    <div className="absolute top-0 right-0 p-1 bg-black/60 rounded-bl-lg">
                                       <div className={cn("text-[8px] font-black leading-none", rColor)}>{rarity}</div>
                                    </div>
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent pt-3 pb-0.5 text-center">
                                       <span className="text-[8px] font-black text-white/50 tracking-widest leading-none">LVL {char.level}</span>
                                    </div>
                                 </div>
                                 <div className="min-w-0 pr-4">
                                    <div className="font-black text-sm uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors truncate">{char.name}</div>
                                    <div className="text-[9px] font-black font-mono text-white/20 uppercase tracking-widest mt-0.5">Constellation {char.constellation}</div>
                                 </div>
                                 
                                 <div className={cn("absolute right-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity", rarity === 'S' ? 'bg-yellow-500' : 'bg-indigo-500')} />
                              </div>
                           );
                        })}
                        {profile.team.length < 4 && (
                           <button 
                              className="bg-slate-950/40 border-2 border-dashed border-white/5 p-4 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-900/80 hover:border-white/10 transition-all h-[84px] group w-full"
                              onClick={() => setRoute('ROSTER')}
                           >
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                 <Users className="w-4 h-4 text-white/20 group-hover:text-indigo-400" />
                              </div>
                              <span className="ml-3 text-white/30 font-black text-[10px] uppercase tracking-widest group-hover:text-white/60 transition-colors uppercase">
                                Добавить
                              </span>
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'DAILIES' && (
               <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-green-500"/> Ежедневные Поручения</h2>
                  <div className="space-y-4">
                     {DAILIES.map(d => {
                        const isDone = d.current >= d.target;
                        const isClaimed = profile.dailies.claimed[d.id];
                        return (
                           <div key={d.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                 <h3 className="font-bold text-slate-200">{d.title}</h3>
                                 <p className="text-sm text-slate-400 font-mono mt-1">{d.desc}</p>
                                 <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                       <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min(100, (d.current/d.target)*100)}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-500 w-12 text-right">{Math.min(d.current, d.target)}/{d.target}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0 items-end">
                                 <button 
                                    disabled={!isDone || isClaimed}
                                    onClick={() => claimDaily(d.id, d.rewardGems, d.rewardBp)}
                                    className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-all min-w-[120px] w-full ${
                                       isClaimed ? 'bg-slate-950 text-slate-600 border border-slate-800' : 
                                       isDone ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                                       'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                 >
                                    {isClaimed ? 'Получено' : 'Забрать'}
                                 </button>
                                 <div className="flex gap-2 text-[10px] font-mono text-slate-400 justify-center w-full">
                                    <span className="flex items-center gap-0.5 text-pink-400"><Gem className="w-3 h-3"/> +{d.rewardGems}</span>
                                    <span className="flex items-center gap-0.5 text-blue-300">BP +{d.rewardBp}</span>
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'ACHIEVEMENTS' && (
               <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Star className="text-yellow-400"/> Достижения</h2>
                  <div className="space-y-4">
                     {ACHIEVEMENTS.map(d => {
                        const isDone = d.current >= d.target;
                        const isClaimed = profile.achievements[d.id];
                        return (
                           <div key={d.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                 <h3 className="font-bold text-slate-200">{d.title}</h3>
                                 <p className="text-sm text-slate-400 font-mono mt-1">{d.desc}</p>
                                 <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                       <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.min(100, (d.current/d.target)*100)}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-500 w-16 text-right">{Math.min(d.current, d.target).toLocaleString()}/{d.target.toLocaleString()}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="text-pink-400 font-bold text-sm tracking-wider flex items-center gap-1">
                                   <Gem className="w-3 h-3" /> {d.reward}
                                </div>
                                <button 
                                   disabled={!isDone || isClaimed}
                                   onClick={() => claimAchievement(d.id, d.reward)}
                                   className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition-all min-w-[120px] w-full sm:w-auto ${
                                      isClaimed ? 'bg-slate-950 text-slate-600 border border-slate-800' : 
                                      isDone ? 'bg-yellow-600 hover:bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 
                                      'bg-slate-800 text-slate-500 cursor-not-allowed'
                                   }`}
                                >
                                   {isClaimed ? 'Получено' : 'Забрать'}
                                </button>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'SHOP' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Gift className="text-pink-400"/> Магазин Обмена</h2>
                  <p className="text-slate-400 font-mono mb-8">Лишнее золото или ресурсы можно обменять на гемы!</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                        <Gem className="w-12 h-12 text-pink-400 mb-4 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
                        <h3 className="font-bold text-xl mb-2 text-slate-200">Горсть Гемов</h3>
                        <p className="text-pink-400 font-mono font-bold text-lg mb-6">+160 Гемов</p>
                        <button 
                           onClick={() => {
                              if (profile.gold >= 25000) updateProfile(p => ({...p, gold: p.gold - 25000, gems: p.gems + 160, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно золота!");
                           }}
                           className="w-full py-3 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600 text-yellow-500 font-bold rounded-lg uppercase tracking-wider transition-all"
                        >
                           Купить за 25k G
                        </button>
                     </div>

                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                        <Zap className="w-12 h-12 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                        <h3 className="font-bold text-xl mb-2 text-slate-200">Фляга Смолы</h3>
                        <p className="text-blue-400 font-mono font-bold text-lg mb-6">+60 Смолы</p>
                        <button 
                           onClick={() => {
                              if (profile.gems >= 50) updateProfile(p => ({...p, gems: p.gems - 50, resin: p.resin + 60, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно гемов!");
                           }}
                           className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600 text-blue-400 font-bold rounded-lg uppercase tracking-wider transition-all"
                        >
                           Купить за 50 💎
                        </button>
                     </div>

                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
                        <div className="relative mb-4">
                           <Gem className="w-14 h-14 text-pink-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]" />
                           <Gem className="w-8 h-8 text-pink-300 absolute -bottom-2 -right-4" />
                        </div>
                        <h3 className="font-bold text-xl mb-2 text-slate-200">Мешок Гемов</h3>
                        <p className="text-pink-400 font-mono font-bold text-lg mb-6">+1600 Гемов</p>
                        <button 
                           onClick={() => {
                              if (profile.gold >= 250000) updateProfile(p => ({...p, gold: p.gold - 250000, gems: p.gems + 1600, dailies: { ...p.dailies, itemsBought: (p.dailies.itemsBought || 0) + 1}}));
                              else alert("Недостаточно золота!");
                           }}
                           className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(202,138,4,0.3)]"
                        >
                           Купить за 250k G
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'EVENTS' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 pt-4 pb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calendar className="text-purple-400"/> Временные События</h2>
                  <EventsMenu profile={profile} updateProfile={updateProfile} />
               </div>
            )}

            {activeTab === 'EXPEDITIONS' && (
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Map className="text-orange-400"/> Экспедиции</h2>
                  <p className="text-slate-400 font-mono mb-8">Отправляйте свободных персонажей на добычу ресурсов.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[...Array(4)].map((_, i) => {
                        const exp = profile.expeditions[i];
                        if (exp) {
                           const isDone = Date.now() >= exp.startTime + exp.durationHours * 3600000;
                           const char = characterBlueprints[exp.charId]("t", 1, 0);
                           return (
                              <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                                       <div className={`w-full h-full text-xs font-black flex items-center justify-center text-white ${char.color}`}>
                                          {char.name.substring(0,2).toUpperCase()}
                                       </div>
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-slate-200">{char.name}</h4>
                                       <p className="text-xs font-mono text-slate-400">
                                          {isDone ? 'Сбор завершен!' : 'В экспедиции...'}
                                       </p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       if (isDone) {
                                          const isGold = i % 2 === 0;
                                          updateProfile(p => {
                                             let nextExp = [...p.expeditions];
                                             nextExp.splice(i, 1);
                                             return {
                                                ...p,
                                                gold: p.gold + (isGold ? 5000 * exp.durationHours : 0),
                                                heroExp: p.heroExp + (!isGold ? 2000 * exp.durationHours : 0),
                                                expeditions: nextExp
                                             }
                                          });
                                       }
                                    }}
                                    disabled={!isDone}
                                    className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider transition ${isDone ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                 >
                                    {isDone ? 'Забрать' : 'В пути'}
                                 </button>
                              </div>
                           );
                        } else {
                           return (
                              <div key={i} className="bg-slate-900/50 border border-dashed border-slate-700 p-4 rounded-xl flex items-center justify-center min-h-[80px]">
                                 <button 
                                    onClick={() => {
                                       const availableChars = Object.keys(profile.roster).filter(id => !profile.expeditions.find(e => e.charId === id));
                                       if (availableChars.length === 0) { alert("Нет свободных персонажей!"); return; }
                                       
                                       updateProfile(p => ({
                                          ...p,
                                          expeditions: [...p.expeditions, {
                                             id: Math.random().toString(),
                                             charId: availableChars[0],
                                             startTime: Date.now(),
                                             durationHours: 4,
                                             completed: false,
                                             claimed: false
                                          }]
                                       }));
                                    }}
                                    className="text-slate-400 hover:text-orange-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2 transition"
                                 >
                                    + Отправить
                                 </button>
                              </div>
                           );
                        }
                     })}
                  </div>
               </div>
            )}

            {activeTab === 'DUNGEONS' && (
               <div className="animate-in fade-in pt-4 pb-8 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold flex items-center gap-2"><Swords className="text-blue-500"/> Выбор Подземелья</h2>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-950/60 hover:bg-fuchsia-900 border border-fuchsia-500/50 text-fuchsia-300 rounded-xl text-xs font-bold transition shadow-lg"
                     >
                        <Skull className="w-4 h-4 text-fuchsia-400" />
                        <span>Теневой Натиск</span>
                     </button>
                  </div>

                  {/* Boss Rush Quick Access */}
                  <div className="mb-6 bg-gradient-to-r from-fuchsia-950/50 via-purple-950/30 to-slate-900 border border-fuchsia-500/40 p-4 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                           <Skull className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-tight">Эндгейм испытание: Теневой Натиск</h3>
                           <p className="text-xs text-slate-400 font-mono">3 отряда против 3 уникальных боссов</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setRoute('BOSS_RUSH_MENU')}
                        className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition"
                     >
                        Открыть
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                     {(['GOLD', 'EXP', 'ARTIFACT'] as const).map(dType => {
                         const title = dType === 'GOLD' ? 'Подземелье Богатства' : dType === 'EXP' ? 'Подземелье Мудрости' : 'Подземелье Реликвий';
                         const desc = dType === 'GOLD' ? 'Много золота, мало опыта.' : dType === 'EXP' ? 'Много опыта, мало золота.' : 'Гарантированный шанс артефакта на высоких уровнях.';
                         const icon = dType === 'GOLD' ? '💎' : dType === 'EXP' ? '✨' : '📦';
                         const color = dType === 'GOLD' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/10' : dType === 'EXP' ? 'text-green-400 border-green-500/30 bg-green-900/10' : 'text-purple-400 border-purple-500/30 bg-purple-900/10';
                         const btnColor = dType === 'GOLD' ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-600/50' : dType === 'EXP' ? 'bg-green-600/20 hover:bg-green-600/40 text-green-500 border border-green-600/50' : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/50';

                         return (
                           <div key={dType} className={`border p-5 rounded-xl ${color}`}>
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{icon}</span>
                                <div>
                                   <h3 className={`font-black text-xl tracking-tight uppercase ${color.split(' ')[0]}`}>{title}</h3>
                                   <p className="text-sm font-mono text-slate-400">{desc}</p>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-5">
                                {[1, 2, 3, 4, 5, 6].map(lvl => (
                                   <div key={lvl} className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex flex-col justify-between group">
                                      <div className="mb-3 flex justify-between items-center bg-slate-900/40 p-1 rounded-md">
                                         <h4 className="font-bold text-slate-300 text-xs">Ур. {lvl}</h4>
                                         <div className="flex items-center gap-0.5 text-[9px] font-bold text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded border border-blue-800/50 uppercase">
                                            <Zap className="w-2.5 h-2.5 text-blue-400" /> 20
                                         </div>
                                      </div>
                                      <button 
                                         onClick={() => {
                                            if (dType === 'ARTIFACT') {
                                               setRoute('ARTIFACT_DUNGEON_SELECTOR');
                                            } else if (profile.resin >= 20) {
                                               updateProfile(p => ({...p, resin: p.resin - 20, dailies: { ...p.dailies, resinsSpent: (p.dailies.resinsSpent || 0) + 20 }}));
                                               setRoute({ type: 'DUNGEON', level: lvl, dungeonType: dType });
                                            } else {
                                               alert("Недостаточно смолы!");
                                            }
                                         }}
                                         className={`w-full py-2 font-bold rounded text-xs uppercase tracking-widest transition-all ${btnColor}`}
                                      >
                                         {dType === 'ARTIFACT' ? 'Выбор' : 'Начать'}
                                      </button>
                                   </div>
                                ))}
                             </div>
                           </div>
                         )
                     })}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
