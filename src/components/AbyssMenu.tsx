import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Trophy, Shield, Zap, ChevronRight, Lock, Sparkles, Layers, History, Wand2, Skull } from 'lucide-react';
import { cn } from '../lib/utils';
import { DivingTransition } from './DivingTransition';

interface AbyssFloor {
  id: number;
  name: string;
  level: number;
  reward: { type: 'crystals' | 'exp' | 'artifacts', amount: number };
  description: string;
  isLunar?: boolean;
}

interface AbyssMenuProps {
  onBack: () => void;
  onEnterFloor: (floor: AbyssFloor) => void;
  onOpenBossRush?: () => void;
  clearedFloor: number;
  lunarClaimed: number[];
  resetTime: number;
}

export const AbyssMenu: React.FC<AbyssMenuProps> = ({ onBack, onEnterFloor, onOpenBossRush, clearedFloor, lunarClaimed, resetTime }) => {
  const floors: AbyssFloor[] = [
    { id: 1, name: "Корневой каталог", level: 20, reward: { type: 'crystals', amount: 100 }, description: "Остаточные данные старых систем." },
    { id: 2, name: "Облачный сектор", level: 35, reward: { type: 'crystals', amount: 150 }, description: "Высокая концентрация глитч-сигналов." },
    { id: 3, name: "Кэшированный мир", level: 50, reward: { type: 'exp', amount: 5000 }, description: "Фантомные воспоминания уничтоженных узлов." },
    { id: 4, name: "Буфер обмена", level: 65, reward: { type: 'artifacts', amount: 2 }, description: "Место, где хранятся временные сущности." },
    { id: 5, name: "Темная шина", level: 80, reward: { type: 'crystals', amount: 300 }, description: "Магистраль данных, поглощенная пустотой." },
    { id: 6, name: "Ядро системы", level: 95, reward: { type: 'crystals', amount: 600 }, description: "Последний рубеж перед полным стиранием." },
    { id: 7, name: "Нулевой указатель", level: 110, reward: { type: 'artifacts', amount: 5 }, description: "Ошибка, ставшая реальностью." },
    { id: 8, name: "Сингулярность кода", level: 130, reward: { type: 'crystals', amount: 1600 }, description: "Точка невозврата." },
    { id: 9, name: "Лунная инстанция I", level: 150, reward: { type: 'crystals', amount: 1600 }, description: "Изменчивое пространство, подвластное циклам.", isLunar: true },
    { id: 10, name: "Лунная инстанция II", level: 170, reward: { type: 'crystals', amount: 2400 }, description: "Гармония хаоса и порядка.", isLunar: true },
    { id: 11, name: "Лунная инстанция III", level: 190, reward: { type: 'crystals', amount: 3200 }, description: "Отражение невозможного будущего.", isLunar: true },
    { id: 12, name: "Горизонт событий", level: 220, reward: { type: 'crystals', amount: 5000 }, description: "Где данные обретают сознание.", isLunar: true },
  ];

  const [selectedFloor, setSelectedFloor] = useState<AbyssFloor | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isDiving, setIsDiving] = useState(false);
  const [targetFloor, setTargetFloor] = useState<AbyssFloor | null>(null);

  const handleEnterFloor = (floor: AbyssFloor) => {
    setTargetFloor(floor);
    setIsDiving(true);
  };

  useEffect(() => {
    const updateTimer = () => {
      const diff = resetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, [resetTime]);

  const blessings = [
    "Благословение кода: Крит. урон +50% для всех.",
    "Эхо пустоты: Шанс реакции увеличен.",
    "Щит Архитектора: Повышенная защита в начале хода.",
    "Сила Глитча: Базовая атака игнорирует 20% брони."
  ];
  
  const currentBlessing = blessings[Math.floor(resetTime / 3600000) % blessings.length];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gray-950 flex flex-col font-sans text-white overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.2)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="truncate">
            <h1 className="text-base sm:text-2xl font-black uppercase tracking-tighter italic leading-none truncate text-white">Цифровая Бездна</h1>
            <p className="text-[7px] sm:text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none mt-1">Lunar Spiral Update</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <div className="hidden xs:flex flex-col items-end mr-1 sm:mr-2">
             <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/20 mb-1">
               <History className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Сброс:</span> {timeLeft}
             </div>
             <div className="text-[7px] sm:text-[9px] text-white/30 uppercase font-black">Ротация</div>
          </div>
          <div className="text-right shrink-0">
             <div className="text-[7px] sm:text-[10px] text-white/30 uppercase font-black">Прогресс</div>
             <div className="text-sm sm:text-lg font-black tabular-nums">{clearedFloor} <span className="text-white/20 sm:mx-1">/</span> 8 <span className="text-indigo-400 text-[10px] sm:text-sm">+{lunarClaimed.length}</span></div>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Layers className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Mode Switcher Banner / Endgame Navigation */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-fuchsia-950/60 via-purple-900/40 to-slate-900/60 flex items-center justify-between border-b border-fuchsia-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
          <span className="text-[11px] sm:text-xs font-bold text-fuchsia-200">
            Эндгейм режим: <b className="text-white">Теневой Натиск</b> (3 отряда vs 3 босса)
          </span>
        </div>
        {onOpenBossRush && (
          <button
            onClick={onOpenBossRush}
            className="flex items-center gap-1.5 px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-fuchsia-600/30 active:scale-95 shrink-0"
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Перейти к боссам</span>
          </button>
        )}
      </div>

      {/* Blessing Banner */}
      <div className="relative z-10 px-6 py-2 bg-gradient-to-r from-indigo-900/50 to-transparent flex items-center gap-3 border-b border-white/5">
        <Wand2 className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-black uppercase tracking-tighter text-indigo-200">{currentBlessing}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className={cn(
          "flex-1 overflow-y-auto p-6 scrollbar-hide transition-all duration-500",
          selectedFloor ? "pr-0 lg:pr-6 opacity-40 lg:opacity-100" : ""
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {floors.map((floor) => {
              const baseLocked = floor.id > clearedFloor + 1 && floor.id <= 8;
              const lunarLocked = floor.id > 8 && clearedFloor < 8;
              const isLocked = baseLocked || lunarLocked;
              
              const isCleared = floor.id <= 8 
                ? floor.id <= clearedFloor 
                : lunarClaimed.includes(floor.id);
                
              const isCurrent = floor.id <= 8 
                ? floor.id === clearedFloor + 1 
                : floor.id === 9 && clearedFloor >= 8;

              return (
                <motion.button
                  key={floor.id}
                  whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  onClick={() => !isLocked && setSelectedFloor(floor)}
                  className={cn(
                    "relative h-48 rounded-3xl border-2 p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden text-left",
                    isLocked ? "bg-gray-900/20 border-white/5 grayscale" : 
                    isCleared ? "bg-emerald-500/10 border-emerald-500/30" :
                    isCurrent ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]" : 
                    floor.isLunar ? "bg-amber-500/5 border-amber-500/20" : "bg-white/5 border-white/10",
                    selectedFloor?.id === floor.id ? "ring-2 sm:ring-4 ring-indigo-400 border-white scale-[1.02]" : ""
                  )}
                >
                   {/* Background Number */}
                   <div className="absolute -bottom-2 -right-1 text-7xl sm:text-9xl font-black text-white/5 leading-none select-none">
                     {floor.id}
                   </div>

                   <div className="flex justify-between items-start relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                        isLocked ? "bg-white/5" : isCleared ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400",
                        floor.isLunar && !isCleared && !isLocked && "text-amber-500 bg-amber-500/20"
                      )}>
                        {isLocked ? <Lock className="w-5 h-5" /> : floor.id}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isCleared && <div className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Очищено</div>}
                        {floor.isLunar && <div className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Лунный</div>}
                      </div>
                   </div>

                   <div className="relative z-10">
                      <h3 className="text-lg font-black uppercase leading-tight">{floor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/40 uppercase font-black">Сложность</span>
                        <span className="text-xs font-black text-rose-500">Lv.{floor.level}</span>
                      </div>
                   </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Info Panel - Modal on mobile, Sidebar on desktop */}
        <AnimatePresence>
          {selectedFloor && (
            <motion.div 
              key={selectedFloor.id}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:absolute inset-0 lg:left-auto lg:right-0 w-full lg:w-[450px] bg-gray-950 lg:bg-gray-900/90 backdrop-blur-3xl flex flex-col z-[150] lg:z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5"
            >
              {/* Header for Mobile */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 lg:hidden">
                <button 
                  onClick={() => setSelectedFloor(null)}
                  className="flex items-center gap-2 text-white/60 font-black uppercase text-[10px] tracking-widest"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Назад
                </button>
                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Этаж {selectedFloor.id}</div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scrollbar-hide pb-32 lg:pb-10">
                <div className="space-y-4">
                  <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hidden lg:block">Этаж {selectedFloor.id}</div>
                  <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{selectedFloor.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase rounded">Рекомендуемый Lv.{selectedFloor.level}</span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase rounded">ID: 0x{selectedFloor.id.toString(16)}</span>
                  </div>
                  <p className="text-white/40 text-sm sm:text-base leading-relaxed">{selectedFloor.description}</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                   <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest">Информация о секторе</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] text-white/20 uppercase font-black mb-1">Группы глитчей</div>
                        <div className="text-2xl font-black italic">2 — 3</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/20 uppercase font-black mb-1">Сложность</div>
                        <div className="text-2xl font-black italic flex items-center gap-1 group">
                          {Array.from({length: Math.ceil(selectedFloor.id / 2)}).map((_, i) => (
                            <Zap key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-3 h-3" /> {selectedFloor.isLunar ? "Награда за цикл" : "Награда за прохождение"}
                  </h4>
                  <div className="bg-indigo-600/10 border-2 border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                    <div className="absolute top-0 right-0 w-48 h-full bg-indigo-500/5 rotate-12 blur-3xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-white/5 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform">
                        {selectedFloor.reward.type === 'crystals' ? '💎' : selectedFloor.reward.type === 'artifacts' ? '🎭' : '⭐️'}
                      </div>
                      <div>
                        <div className="text-2xl font-black tabular-nums tracking-tight">+{selectedFloor.reward.amount} {selectedFloor.reward.type === 'crystals' ? 'Кристаллов' : selectedFloor.reward.type === 'exp' ? 'EXP' : 'Артефактов'}</div>
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">{selectedFloor.isLunar ? "Обновляется каждый час" : "Единоразовый бонус"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Actions */}
              <div className="p-6 lg:p-10 border-t border-white/5 bg-gray-900/95 backdrop-blur-2xl fixed lg:relative bottom-0 inset-x-0 z-50">
                <button 
                  onClick={() => handleEnterFloor(selectedFloor)}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] flex items-center justify-center gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Sword className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 
                  <span className="text-sm border-b-2 border-white/20 group-hover:border-white transition-colors">Начать зачистку</span>
                </button>
                <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-white/20 font-black uppercase tracking-widest">
                   <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> ATB COST: 0</div>
                   <div className="w-1 h-1 rounded-full bg-white/10" />
                   <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> NO LOSS PENALTY</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedFloor && (
          <div className="flex-1 lg:w-[400px] border-l border-white/5 flex flex-col items-center justify-center gap-4 p-8 hidden lg:flex text-white/10">
               <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center">
                  <Layers className="w-10 h-10" />
               </div>
               <div className="text-sm font-black uppercase tracking-[0.3em]">Выберите этаж</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDiving && (
          <DivingTransition onComplete={() => targetFloor && onEnterFloor(targetFloor)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
