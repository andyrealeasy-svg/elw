import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { 
  Gem, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  FlaskConical, 
  Swords, 
  Flame, 
  Zap, 
  Snowflake, 
  Droplets, 
  Trophy, 
  ChevronRight, 
  RefreshCw,
  ZapOff,
  Cpu,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
}

export default function EventsMenu({ profile, updateProfile, setRoute }: Props) {
  const [subTab, setSubTab] = useState<'LOGIN' | 'BREACH' | 'ALCHEMY' | 'TRIALS'>('LOGIN');

  // --- UPDATE 1.1 REWARD ---
  const update11Claimed = profile.events.update11Claimed || false;

  // --- EVENT 0: 7-DAY LOGIN ---
  const todayStr = new Date().toISOString().split('T')[0];
  const lastLoginDate = profile.events.initLastClaimDay || "";
  const loginStreak = profile.events.initStreak || 0;
  const alreadyCheckedIn = lastLoginDate === todayStr;

  const handleCheckIn = () => {
    if (alreadyCheckedIn) return;
    const nextStreak = loginStreak >= 7 ? 1 : loginStreak + 1;
    const rewardGems = nextStreak * 60;
    const rewardGold = nextStreak * 5000;

    updateProfile(p => ({
      ...p,
      gems: p.gems + rewardGems,
      gold: p.gold + rewardGold,
      events: {
        ...p.events,
        initStreak: nextStreak,
        initLastClaimDay: todayStr
      }
    }));
  };

  // --- EVENT 1: ANOMALY BREACH (Glitch Hunt) ---
  const clearedSectors: number[] = profile.events.clearedSectors || [];

  const sectors = [
    { id: 1, name: "Сектор Альфа-1: Взлом Протокола", threat: "★☆☆☆☆", enemy: "Глитч-Слайм", rewardGems: 100, rewardGold: 15000, desc: "Базовое искажение данных в периметре сети." },
    { id: 2, name: "Сектор Бета-2: Патруль Дронов", threat: "★★☆☆☆", enemy: "Кибер-Дрон X9", rewardGems: 150, rewardGold: 25000, desc: "Автономные дроны сошли с ума от разрыва матрицы." },
    { id: 3, name: "Сектор Гамма-3: Теневой Узел", threat: "★★★☆☆", enemy: "Фантом Пустоты", rewardGems: 200, rewardGold: 35000, desc: "Концентрированный сгусток темной материи." },
    { id: 4, name: "Сектор Дельта-4: Вирусная Буря", threat: "★★★★☆", enemy: "Кодовый Паразит", rewardGems: 250, rewardGold: 50000, desc: "Опасная аномалия, поглощающая энергию отряда." },
    { id: 5, name: "Сектор Эпсилон-5: Ядро Ядра", threat: "★★★★★", enemy: "Матричный Страж", rewardGems: 400, rewardGold: 100000, desc: "Центральный страж аномальной зоны Сервера Анубис." }
  ];

  const handleAttackSector = (sectorId: number) => {
    if (clearedSectors.includes(sectorId)) return;
    
    const sec = sectors.find(s => s.id === sectorId);
    if (!sec) return;

    setRoute({
      type: 'GLITCH_BATTLE',
      sectorId: sectorId,
      level: sec.id * 15 + 25, // Just for display/scaling if needed
      name: sec.name,
      rewardGems: sec.rewardGems,
      rewardGold: sec.rewardGold
    });
  };

  // --- EVENT 2: MATRIX ALCHEMY (Synthesis) ---
  const [crucibleSlots, setCrucibleSlots] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [lastRecipeResult, setLastRecipeResult] = useState<string | null>(null);

  const alchemyDate = profile.events.alchemyDate || "";
  const alchemyDailyAttempts = alchemyDate === todayStr ? (profile.events.alchemyDailyAttempts ?? 0) : 0;
  const maxAlchemyAttempts = 3;
  const alchemyAttemptsLeft = Math.max(0, maxAlchemyAttempts - alchemyDailyAttempts);

  const addShard = (type: string) => {
    if (crucibleSlots.length < 3) {
      setCrucibleSlots([...crucibleSlots, type]);
    }
  };

  const clearCrucible = () => {
    setCrucibleSlots([]);
    setLastRecipeResult(null);
  };

  const handleSynthesize = () => {
    if (crucibleSlots.length < 3 || isSynthesizing || alchemyAttemptsLeft <= 0) return;
    setIsSynthesizing(true);
    setLastRecipeResult("Запуск алхимического тигеля...");

    setTimeout(() => {
      setIsSynthesizing(false);
      const countFlame = crucibleSlots.filter(s => s === 'Flame').length;
      const countSurge = crucibleSlots.filter(s => s === 'Surge').length;
      const countFrost = crucibleSlots.filter(s => s === 'Frost').length;

      let rewardGems = 40;
      let rewardGold = 5000;
      let recipeName = "Стандартный Кристалл";

      if (countFlame === 3) {
        rewardGems = 120;
        rewardGold = 20000;
        recipeName = "🔥 Ядро Огненной Соли (120 Гемов + 20,000 Моры)";
      } else if (countSurge === 3) {
        rewardGems = 100;
        rewardGold = 40000;
        recipeName = "⚡ Электро-Матрица (100 Гемов + 40,000 Моры)";
      } else if (countFrost === 3) {
        rewardGems = 150;
        recipeName = "❄️ Крио-Призма Сингулярности (150 Гемов)";
      } else if (countFlame >= 1 && countSurge >= 1 && countFrost >= 1) {
        rewardGems = 200;
        rewardGold = 30000;
        recipeName = "🌟 Квантовый Равновесный Кристалл (200 Гемов + 30,000 Моры)";
      } else {
        rewardGems = 60;
        rewardGold = 10000;
        recipeName = "💎 Гибридный Энергетический Сплав (60 Гемов + 10,000 Моры)";
      }

      updateProfile(p => ({
        ...p,
        gems: p.gems + rewardGems,
        gold: p.gold + rewardGold,
        events: {
          ...p.events,
          alchemyDate: todayStr,
          alchemyDailyAttempts: (p.events.alchemyDate === todayStr ? (p.events.alchemyDailyAttempts || 0) : 0) + 1
        }
      }));

      setLastRecipeResult(`Синтез завершен! Вы получили: ${recipeName}`);
      setCrucibleSlots([]);
    }, 2000);
  };

  // --- EVENT 3: AEGIS TACTICAL TRIALS ---
  const completedTrials: number[] = profile.events.completedTrials || [];

  const trials = [
    { 
      id: 1, 
      title: "Симуляция №1: Грозовой Перегруз", 
      modifier: "Электро-урон персонажей +100%. Враги атакуют на 15% быстрее.", 
      recElement: "Electro", 
      gems: 250, 
      gold: 30000 
    },
    { 
      id: 2, 
      title: "Симуляция №2: Заморозка Времени", 
      modifier: "Крио-реакции снижают защиту врагов на 50%.", 
      recElement: "Cryo", 
      gems: 300, 
      gold: 50000 
    },
    { 
      id: 3, 
      title: "Симуляция №3: Зеркальное Эхо", 
      modifier: "Реакция «Отражение» и Пиро-урон наносят удвоенный критический урон.", 
      recElement: "Pyro", 
      gems: 400, 
      gold: 80000 
    },
    { 
      id: 4, 
      title: "Симуляция №4: Абсолютная Сингулярность", 
      modifier: "Все типы урона ультимейтов усилены на 150%. Враги имеют повышенный запас HP.", 
      recElement: "Any", 
      gems: 600, 
      gold: 150000 
    }
  ];

  const handleStartTrial = (trialId: number) => {
    if (completedTrials.includes(trialId)) return;
    
    const tr = trials.find(t => t.id === trialId);
    if (!tr) return;

    setRoute({
      type: 'TRIAL_BATTLE',
      trialId: trialId,
      title: tr.title,
      rewardGems: tr.gems,
      rewardGold: tr.gold
    });
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Top Navigation Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs sm:text-sm overflow-x-auto gap-1">
        <button 
          onClick={() => setSubTab('LOGIN')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition shrink-0 min-h-[40px]",
            subTab === 'LOGIN' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Проект: Инициализация
        </button>
        <button 
          onClick={() => setSubTab('BREACH')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition shrink-0 min-h-[40px]",
            subTab === 'BREACH' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" /> Охота на Глитчи
        </button>
        <button 
          onClick={() => setSubTab('ALCHEMY')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition shrink-0 min-h-[40px]",
            subTab === 'ALCHEMY' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <FlaskConical className="w-4 h-4 text-emerald-400" /> Синтез Матрицы
        </button>
        <button 
          onClick={() => setSubTab('TRIALS')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition shrink-0 min-h-[40px]",
            subTab === 'TRIALS' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <Swords className="w-4 h-4 text-cyan-400" /> Боевые Испытания
        </button>
      </div>

      {/* UPDATE 1.1 REWARD BAR */}
      {!update11Claimed && (
        <div className="bg-gradient-to-r from-emerald-950/60 to-green-950/60 border border-green-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest border border-green-500/30 px-2.5 py-1 rounded-md bg-green-500/10">
              ОБНОВЛЕНИЕ 1.1
            </span>
            <p className="text-sm text-slate-200 mt-2 font-medium">
              Празднуем выход крупного обновления 1.1! Заберите специальный подарок за вход.
            </p>
            <div className="flex gap-4 mt-2 text-xs font-mono">
              <span className="text-green-400 font-bold flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" /> +600 Гемов
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              updateProfile(p => ({
                ...p,
                gems: p.gems + 600,
                events: { ...p.events, update11Claimed: true }
              }));
              alert("Награда за обновление 1.1 получена!");
            }}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold tracking-wider rounded-xl uppercase transition-all shadow-lg min-h-[44px]"
          >
            Забрать 600 Гемов
          </button>
        </div>
      )}

      {/* TAB 0: DAILY LOGIN */}
      {subTab === 'LOGIN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Проект: Инициализация (7 Дней Входа)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Синхронизируйтесь с сетью ежедневно, чтобы открывать фрагменты памяти и получать ценные камни истока.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isClaimed = day <= loginStreak;
              const isToday = day === loginStreak + 1;

              return (
                <div
                  key={day}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center text-center relative transition-all min-h-[120px] justify-between",
                    isClaimed
                      ? "bg-indigo-950/40 border-indigo-500/50"
                      : isToday && !alreadyCheckedIn
                        ? "bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/40 shadow-lg"
                        : "bg-slate-950/60 border-slate-800 opacity-60"
                  )}
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    День {day}
                  </span>

                  <div className="my-2 p-2 rounded-full bg-slate-900">
                    <Gem className={cn("w-6 h-6", isClaimed ? "text-indigo-400" : "text-slate-500")} />
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-200">
                    +{day * 60} 💎
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    +{day * 5000} 🪙
                  </div>

                  {isClaimed && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-indigo-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-300">
              Текущая серия входов: <strong className="text-indigo-400">{loginStreak} / 7</strong> дней
            </span>

            <button
              onClick={handleCheckIn}
              disabled={alreadyCheckedIn}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold rounded-xl uppercase text-xs tracking-wider transition min-h-[44px]"
            >
              {alreadyCheckedIn ? "Награда за сегодня получена" : "Синхронизироваться и забрать"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: ANOMALY BREACH */}
      {subTab === 'BREACH' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black text-red-400 uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Аномальный Прорыв: Охота на Глитчи
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Зачищайте зараженные вирусом виртуальные сектора. Каждая зачистка уничтожает аномалию и приносит гемы.
            </p>
          </div>

          {/* (Breach Log was here) */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectors.map((sec) => {
              const isCleared = clearedSectors.includes(sec.id);

              return (
                <div
                  key={sec.id}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all",
                    isCleared
                      ? "bg-slate-950/60 border-slate-800 opacity-60"
                      : "bg-slate-950 border-red-900/40 hover:border-red-500/50 shadow-md"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-red-400 font-bold block">
                        Угроза: {sec.threat}
                      </span>
                      <h3 className="text-sm font-black uppercase text-slate-100">
                        {sec.name}
                      </h3>
                    </div>
                    {isCleared && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                        Зачищено
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    {sec.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-indigo-400 font-bold">💎 +{sec.rewardGems}</span>
                      <span className="text-amber-400 font-bold">🪙 +{sec.rewardGold}</span>
                    </div>

                    <button
                      onClick={() => handleAttackSector(sec.id)}
                      disabled={isCleared}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition min-h-[36px]"
                    >
                      {isCleared ? "Зачищено" : "Атаковать"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MATRIX ALCHEMY */}
      {subTab === 'ALCHEMY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5" /> Алхимия Матрицы: Синтез Кристаллов
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Поместите 3 стихийных осколка в тигель, чтобы переплавить их в чистые гемы и ресурсы.
            </p>
          </div>

          {/* Crucible Altar */}
          <div className="bg-slate-950 border border-emerald-900/40 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Алхимический Тигель (Выбрано {crucibleSlots.length} / 3)
              </span>
              <span className={cn(
                "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border",
                alchemyAttemptsLeft > 0 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}>
                Попыток синтеза сегодня: {alchemyAttemptsLeft} / {maxAlchemyAttempts}
              </span>
            </div>

            <div className="flex gap-3 my-2">
              {[0, 1, 2].map((slotIdx) => {
                const shard = crucibleSlots[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all shadow-inner",
                      shard === 'Flame'
                        ? "bg-red-950/60 border-red-500 text-red-400"
                        : shard === 'Surge'
                          ? "bg-purple-950/60 border-purple-500 text-purple-400"
                          : shard === 'Frost'
                            ? "bg-cyan-950/60 border-cyan-500 text-cyan-400"
                            : "bg-slate-900 border-slate-800 border-dashed text-slate-600"
                    )}
                  >
                    {shard === 'Flame' && <Flame className="w-8 h-8 animate-bounce" />}
                    {shard === 'Surge' && <Zap className="w-8 h-8 animate-pulse" />}
                    {shard === 'Frost' && <Snowflake className="w-8 h-8 animate-pulse" />}
                    {!shard && <span className="text-xs font-mono opacity-50">Слот {slotIdx + 1}</span>}
                  </div>
                );
              })}
            </div>

            {/* Shard Selection Controls */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => addShard('Flame')}
                disabled={crucibleSlots.length >= 3 || alchemyAttemptsLeft <= 0}
                className="px-4 py-2 bg-red-950/50 hover:bg-red-800 text-red-400 border border-red-800/60 disabled:opacity-40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition min-h-[40px]"
              >
                <Flame className="w-4 h-4" /> + Огненный Осколок
              </button>
              <button
                onClick={() => addShard('Surge')}
                disabled={crucibleSlots.length >= 3 || alchemyAttemptsLeft <= 0}
                className="px-4 py-2 bg-purple-950/50 hover:bg-purple-800 text-purple-400 border border-purple-800/60 disabled:opacity-40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition min-h-[40px]"
              >
                <Zap className="w-4 h-4" /> + Импульсный Осколок
              </button>
              <button
                onClick={() => addShard('Frost')}
                disabled={crucibleSlots.length >= 3 || alchemyAttemptsLeft <= 0}
                className="px-4 py-2 bg-cyan-950/50 hover:bg-cyan-800 text-cyan-400 border border-cyan-800/60 disabled:opacity-40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition min-h-[40px]"
              >
                <Snowflake className="w-4 h-4" /> + Крио Осколок
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full max-w-xs pt-2">
              <button
                onClick={clearCrucible}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition min-h-[40px]"
              >
                Очистить
              </button>
              <button
                onClick={handleSynthesize}
                disabled={crucibleSlots.length < 3 || isSynthesizing || alchemyAttemptsLeft <= 0}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/50 min-h-[40px]"
              >
                {isSynthesizing ? "Синтез..." : alchemyAttemptsLeft <= 0 ? "Лимит исчерпан" : "Синтезировать"}
              </button>
            </div>

            {lastRecipeResult && (
              <div className="mt-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-center w-full max-w-md">
                {lastRecipeResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TACTICAL TRIALS */}
      {subTab === 'TRIALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-tight flex items-center gap-2">
              <Swords className="w-5 h-5" /> Тактические Испытания Эгиды
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Боевые симуляции с элементальными аномалиями поля боя. Испытайте свой отряд!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {trials.map((tr) => {
              const isCompleted = completedTrials.includes(tr.id);

              return (
                <div
                  key={tr.id}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all",
                    isCompleted
                      ? "bg-slate-950/60 border-slate-800 opacity-60"
                      : "bg-slate-950 border-slate-800 hover:border-cyan-500/40"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-cyan-400">
                        {tr.title}
                      </span>
                      {isCompleted && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                          Пройдено
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Модификатор: <span className="text-amber-400">{tr.modifier}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs font-mono pt-1">
                      <span className="text-indigo-400 font-bold">💎 +{tr.gems} Гемов</span>
                      <span className="text-amber-400 font-bold">🪙 +{tr.gold} Моры</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTrial(tr.id)}
                    disabled={isCompleted}
                    className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition min-h-[44px]"
                  >
                    {isCompleted ? "Пройдено" : "Начать испытание"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
