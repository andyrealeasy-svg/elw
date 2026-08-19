import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Artifact } from '../types';
import { Gem, Gift, Sparkles, CheckCircle, Flame, Coffee, Trophy, Compass, Swords, Zap, RefreshCw, Star } from 'lucide-react';
import { generateArtifact } from '../data';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
}

// Recipes for Drink A-Dreaming
interface Recipe {
  name: string;
  ingredients: string[];
  desc: string;
}

const RECIPES: Recipe[] = [
  { name: "Библиотекарь", ingredients: ["Кофе", "Кофе", "Кофе"], desc: "Чистый насыщенный кофе для любителей крепкого вкуса." },
  { name: "Карамельное Облако", ingredients: ["Чай", "Молоко", "Карамель"], desc: "Сладкий молочный чай с нежной карамелью." },
  { name: "Бодрость Дендро", ingredients: ["Чай", "Мята", "Мята"], desc: "Освежающий чай с тройным ароматом горной мяты." },
  { name: "Сумеречный Остров", ingredients: ["Какао", "Какао", "Шоколад"], desc: "Сверхнасыщенный шоколадный какао для праздничных вечеров." },
  { name: "Звездный Латте", ingredients: ["Кофе", "Кофе", "Молоко"], desc: "Классический бодрящий кофе, разбавленный мягким молоком." },
  { name: "Шоколадная Колыбель", ingredients: ["Какао", "Карамель", "Шоколад"], desc: "Райский десертный напиток с шоколадной крошкой и нугой." }
];

const CUSTOMERS = [
  { name: "Моян", avatarColor: "bg-blue-600", greeting: "Эх, спина ломит после руды... Сделай крепкий «Библиотекарь»!", wantedRecipe: "Библиотекарь" },
  { name: "Аэлита", avatarColor: "bg-emerald-600", greeting: "Привет! Мне нужно что-то освежающее для концентрации, «Бодрость Дендро» подойдет?", wantedRecipe: "Бодрость Дендро" },
  { name: "Копрофил", avatarColor: "bg-amber-700", greeting: "Слушай, хочу чего-то безумно сладкого! Намешай мне «Шоколадная Колыбель»!", wantedRecipe: "Шоколадная Колыбель" },
  { name: "Готка", avatarColor: "bg-slate-800", greeting: "В соборе душно. Налей мне «Карамельное Облако»... Только быстрее.", wantedRecipe: "Карамельное Облако" },
  { name: "Сельва", avatarColor: "bg-pink-600", greeting: "Ура! Вечеринка! Мне нужен самый вкусный «Сумеречный Остров»!", wantedRecipe: "Сумеречный Остров" }
];

export default function EventsMenu({ profile, updateProfile }: Props) {
  const [subTab, setSubTab] = useState<'LOGIN' | 'BARTENDER' | 'LANTERN' | 'DUEL'>('LOGIN');

  // --- COMPENSATION SECTION ---
  const compensationClaimed = profile.events.compensationClaimed || false;
  const artCompClaimed = profile.events.artCompClaimed || false;

  // --- EVENT 1: LOGIN (Seizing the Day) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const lastLoginDate = profile.events.lastLoginDate || "";
  const loginStreak = profile.events.loginStreak || 0;
  const alreadyCheckedIn = lastLoginDate === todayStr;

  const handleCheckIn = () => {
    if (alreadyCheckedIn) return;
    const nextStreak = loginStreak >= 7 ? 1 : loginStreak + 1;
    const rewardGems = nextStreak * 25;
    const rewardGold = nextStreak * 1500;

    updateProfile(p => ({
      ...p,
      gems: p.gems + rewardGems,
      gold: p.gold + rewardGold,
      events: {
        ...p.events,
        loginStreak: nextStreak,
        lastLoginDate: todayStr
      }
    }));
  };

  // --- EVENT 2: BARTENDER (Of Drink A-Dreaming) ---
  const [customerIndex, setCustomerIndex] = useState(0);
  const [currentCup, setCurrentCup] = useState<string[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixingSuccessMsg, setMixingSuccessMsg] = useState("");
  const [bartenderLog, setBartenderLog] = useState<string[]>([]);
  const activeCustomer = CUSTOMERS[customerIndex];

  const addIngredient = (ing: string) => {
    if (currentCup.length >= 3) return;
    setCurrentCup([...currentCup, ing]);
  };

  const clearCup = () => {
    setCurrentCup([]);
    setMixingSuccessMsg("");
  };

  const mixDrink = () => {
    if (currentCup.length < 3) {
      alert("Добавьте ровно 3 ингредиента, чтобы приготовить напиток!");
      return;
    }
    setIsMixing(true);
    setMixingSuccessMsg("");

    setTimeout(() => {
      setIsMixing(false);
      // Determine what drink was mixed
      const sortedCup = [...currentCup].sort();
      let matchedRecipeName = "Мутный состав";
      
      for (const recipe of RECIPES) {
        if ([...recipe.ingredients].sort().join(',') === sortedCup.join(',')) {
          matchedRecipeName = recipe.name;
          break;
        }
      }

      const isCorrect = matchedRecipeName === activeCustomer.wantedRecipe;

      if (isCorrect) {
        const rewardGems = 60;
        const rewardGold = 2500;
        const currentPoints = profile.events.bartenderPoints || 0;
        const rewardPoints = 20;

        updateProfile(p => ({
          ...p,
          gems: p.gems + rewardGems,
          gold: p.gold + rewardGold,
          events: {
            ...p.events,
            bartenderPoints: currentPoints + rewardPoints
          }
        }));

        setMixingSuccessMsg(`Успех! Вы подали «${matchedRecipeName}». ${activeCustomer.name} в восторге! Получено +${rewardGems} 💎, +${rewardGold} G, +${rewardPoints} Очков Лихорадки!`);
        setBartenderLog(prev => [`Подан правильный напиток для ${activeCustomer.name}!`, ...prev]);
        
        // Go to next customer after delay
        setTimeout(() => {
          setCustomerIndex((prev) => (prev + 1) % CUSTOMERS.length);
          setCurrentCup([]);
          setMixingSuccessMsg("");
        }, 3000);
      } else {
        setMixingSuccessMsg(`Вы подали «${matchedRecipeName}», но ${activeCustomer.name} просил «${activeCustomer.wantedRecipe}». Попробуйте ещё раз!`);
        setBartenderLog(prev => [`Неудачно приготовлен напиток для ${activeCustomer.name}`, ...prev]);
      }
    }, 1500);
  };

  // --- EVENT 3: LANTERN RITE (Lantern Crafting & Shop) ---
  const lanternFever = profile.events.lanternRitePoints || 0;
  const initialGiftsClaimedStr = profile.events.lanternGiftsClaimedDate || "";
  const hasClaimedTodayGifts = initialGiftsClaimedStr === todayStr;

  // Inventory of crafting parts kept in profile.events
  const fiberCount = profile.events.lanternFibers || 0;
  const wickCount = profile.events.lanternWicks || 0;
  const oilCount = profile.events.lanternOils || 0;

  const handleClaimDailyMaterials = () => {
    if (hasClaimedTodayGifts) return;
    updateProfile(p => ({
      ...p,
      events: {
        ...p.events,
        lanternFibers: (p.events.lanternFibers || 0) + 3,
        lanternWicks: (p.events.lanternWicks || 0) + 3,
        lanternOils: (p.events.lanternOils || 0) + 3,
        lanternGiftsClaimedDate: todayStr
      }
    }));
  };

  const handleBuyMaterial = (type: 'fiber' | 'wick' | 'oil') => {
    if (profile.gold < 800) {
      alert("Недостаточно золота!");
      return;
    }
    updateProfile(p => {
      const currentFibers = p.events.lanternFibers || 0;
      const currentWicks = p.events.lanternWicks || 0;
      const currentOils = p.events.lanternOils || 0;

      return {
        ...p,
        gold: p.gold - 800,
        events: {
          ...p.events,
          lanternFibers: type === 'fiber' ? currentFibers + 1 : currentFibers,
          lanternWicks: type === 'wick' ? currentWicks + 1 : currentWicks,
          lanternOils: type === 'oil' ? currentOils + 1 : currentOils,
        }
      };
    });
  };

  const [isLaunching, setIsLaunching] = useState(false);
  const [lanternLaunchedCount, setLanternLaunchedCount] = useState(0);

  const handleCraftAndLaunch = () => {
    if (fiberCount < 1 || wickCount < 1 || oilCount < 1) {
      alert("Недостаточно компонентов для сборки Небесного Фонаря!");
      return;
    }

    setIsLaunching(true);
    updateProfile(p => ({
      ...p,
      events: {
        ...p.events,
        lanternFibers: (p.events.lanternFibers || 0) - 1,
        lanternWicks: (p.events.lanternWicks || 0) - 1,
        lanternOils: (p.events.lanternOils || 0) - 1,
        lanternRitePoints: (p.events.lanternRitePoints || 0) + 30
      }
    }));

    setTimeout(() => {
      setIsLaunching(false);
      setLanternLaunchedCount(prev => prev + 1);
    }, 2000);
  };

  const shopItems = [
    { id: 'artifact_5s', title: '5★ Легендарный Артефакт', pointsCost: 100, desc: 'Дропает случайный крутой артефакт 5 ур.' },
    { id: 'gems_300', title: '300 Примогемов', pointsCost: 40, desc: 'Бесплатные камни истока.' },
    { id: 'gold_20k', title: '20,000 Золота моры', pointsCost: 20, desc: 'Кошелёк набитый золотом.' },
    { id: 'hero_exp_large', title: 'Книга Опыта Героя (50к)', pointsCost: 30, desc: 'Дарует горы опыта вашему отряду.' }
  ];

  const handleRedeem = (itemId: string, cost: number) => {
    if (lanternFever < cost) {
      alert("Недостаточно очков Праздничной Лихорадки!");
      return;
    }

    updateProfile(p => {
      let extraProps: Partial<PlayerProfile> = {};
      if (itemId === 'artifact_5s') {
        const art = generateArtifact("gladiator", 5); // gladiator set, 5★ Level
        extraProps = { artifacts: [...p.artifacts, art] };
        alert(`Вы выкупили легендарный артефакт: ${art.setName} (${art.slot})!`);
      } else if (itemId === 'gems_300') {
        extraProps = { gems: p.gems + 300 };
        alert("Вы выкупили 300 камней истока!");
      } else if (itemId === 'gold_20k') {
        extraProps = { gold: p.gold + 20000 };
        alert("Вы получили 20,000 золота!");
      } else if (itemId === 'hero_exp_large') {
        extraProps = { heroExp: p.heroExp + 50000 };
        alert("Вы получили 50,000 ед. опыта!");
      }

      return {
        ...p,
        ...extraProps,
        events: {
          ...p.events,
          lanternRitePoints: (p.events.lanternRitePoints || 0) - cost
        }
      };
    });
  };

  // --- EVENT 4: WARRIOR'S DUEL (Parry reflex mini-game) ---
  const [duelActive, setDuelActive] = useState(false);
  const [playerHp, setPlayerHp] = useState(2000);
  const [bossHp, setBossHp] = useState(5000);
  const [roundTimer, setRoundTimer] = useState(0); // in percent
  const [duelLog, setDuelLog] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'CHARGING' | 'WIN' | 'LOSE'>('IDLE');
  const [parryWindow, setParryWindow] = useState({ start: 0, end: 18 }); // active interval in roundTimer (18% left down to 0%)
  const [strikeName, setStrikeName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to avoid stale closures in timeouts/asynchronous functions
  const gameStateRef = useRef(gameState);
  const playerHpRef = useRef(playerHp);
  const bossHpRef = useRef(bossHp);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    playerHpRef.current = playerHp;
  }, [playerHp]);

  useEffect(() => {
    bossHpRef.current = bossHp;
  }, [bossHp]);

  const startNewDuel = () => {
    setPlayerHp(2000);
    setBossHp(5000);
    setDuelLog(["Дуэль началась! Дождитесь атаки Гладиатора и нажмите КНОПКУ ПАРИРОВАНИЯ когда полоска дойдет до зеленой зоны!"]);
    setGameState('IDLE');
    setDuelActive(true);
    
    // Schedule first attack cleanly
    setTimeout(() => {
      triggerBossAttack();
    }, 100);
  };

  const triggerBossAttack = () => {
    if (gameStateRef.current === 'WIN' || gameStateRef.current === 'LOSE') return;

    // Wait a random time before charging
    const typesOfStrikes = [
      { name: "Сильный взмах", speed: 18, pWindow: { start: 16, end: 0 } },
      { name: "Выпад копьем", speed: 28, pWindow: { start: 20, end: 0 } },
      { name: "Быстрый рубящий удар", speed: 40, pWindow: { start: 24, end: 0 } }
    ];

    const chosenStrike = typesOfStrikes[Math.floor(Math.random() * typesOfStrikes.length)];
    setStrikeName(chosenStrike.name);
    setParryWindow(chosenStrike.pWindow);
    setRoundTimer(100);
    setGameState('CHARGING');
  };

  // Run the charging loop
  useEffect(() => {
    if (!duelActive || gameState !== 'CHARGING') return;

    let speedMultiplier = 1.0;
    if (strikeName === "Быстрый рубящий удар") speedMultiplier = 2.4;
    else if (strikeName === "Выпад копьем") speedMultiplier = 1.6;
    else speedMultiplier = 0.9;

    timerRef.current = setInterval(() => {
      setRoundTimer(prev => {
        const next = prev - (1.5 * speedMultiplier);
        if (next <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return next;
      });
    }, 20);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duelActive, gameState, strikeName]);

  // Handle hit if timer reaches 0
  useEffect(() => {
    if (duelActive && gameState === 'CHARGING' && roundTimer === 0) {
      // Prevent further ticks by changing gameState to IDLE
      setGameState('IDLE');

      const dmg = 450;
      const nextPlayerHp = Math.max(0, playerHpRef.current - dmg);
      setPlayerHp(nextPlayerHp);

      if (nextPlayerHp <= 0) {
        setGameState('LOSE');
        setDuelLog(prev => ["Вы пали в бою. Тренируйтесь дальше!", ...prev]);
      } else {
        setDuelLog(prev => [`ПРОМАХ! ${strikeName} попал по вам! Нанесено ${dmg} урона.`, ...prev]);
        setTimeout(() => {
          triggerBossAttack();
        }, 1500);
      }
    }
  }, [roundTimer, gameState, duelActive, strikeName]);

  const handleParryClick = () => {
    if (gameState !== 'CHARGING') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const pVal = roundTimer;
    const cleanParry = pVal <= parryWindow.start && pVal >= parryWindow.end;

    if (cleanParry) {
      // Success counter-attack
      const nextBossHp = Math.max(0, bossHpRef.current - 1250);
      setBossHp(nextBossHp);

      if (nextBossHp <= 0) {
        setGameState('WIN');
        setDuelLog(prev => ["ПОБЕДА! Вы сразили Гладиатора идеальным контратакующим парированием!", ...prev]);
        // Grant rewards
        updateProfile(p => ({
          ...p,
          gems: p.gems + 250,
          gold: p.gold + 5000,
          events: {
            ...p.events,
            parryHighScore: Math.max(p.events.parryHighScore || 0, 1)
          }
        }));
      } else {
        setDuelLog(prev => ["ВЕЛИКОЛЕПНОЕ ПАРИРОВАНИЕ! Вы отразили удар и провели контратаку на 1250 урона!", ...prev]);
        setTimeout(() => {
          triggerBossAttack();
        }, 1500);
      }
    } else {
      // Failed parry (too early or too late)
      const dmg = pVal > parryWindow.start ? 300 : 450;
      const nextPlayerHp = Math.max(0, playerHpRef.current - dmg);
      setPlayerHp(nextPlayerHp);

      if (nextPlayerHp <= 0) {
        setGameState('LOSE');
        setDuelLog(prev => ["Вы пали в бою. Парируйте точнее во время зеленой фазы!", ...prev]);
      } else {
        setDuelLog(prev => [
          pVal > parryWindow.start 
            ? `СЛИШКОМ РАНО! Парируйте позже. Получено ${dmg} урона.` 
            : `СЛИШКОМ ПОЗДНО! Щит не успел раскрыться. Получено ${dmg} урона.`,
          ...prev
        ]);
        setTimeout(() => {
          triggerBossAttack();
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Tabs Navigation */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-lg border border-slate-800 text-xs sm:text-sm overflow-x-auto gap-1">
        <button 
          onClick={() => setSubTab('LOGIN')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition shrink-0 ${
            subTab === 'LOGIN' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Семидневка входа
        </button>
        <button 
          onClick={() => setSubTab('BARTENDER')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition shrink-0 ${
            subTab === 'BARTENDER' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Coffee className="w-4 h-4" /> Глоток пьянящей мечты
        </button>
        <button 
          onClick={() => setSubTab('LANTERN')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition shrink-0 ${
            subTab === 'LANTERN' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-4 h-4" /> Праздник фонарей
        </button>
        <button 
          onClick={() => setSubTab('DUEL')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition shrink-0 ${
            subTab === 'DUEL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Trophy className="w-4 h-4" /> Дуэль на мечах
        </button>
      </div>

      {/* COMPENSATION FOR WIP CLAIM BAR - STAY AT TOP OF EVENT SECTIONS IF UNCLAIMED */}
      {!compensationClaimed && (
        <div className="bg-gradient-to-r from-red-950/40 to-pink-950/40 border border-pink-500/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest border border-pink-500/30 px-2 py-0.5 rounded-md bg-pink-500/10">КОМПЕНСАЦИЯ ЗА ВАЙП</span>
            <p className="text-sm text-slate-300 mt-2 font-sans">
              Приносим свои извинения за недавнее сохранение файлов. Вот ваш быстрый стартовый бонус!
            </p>
            <div className="flex gap-4 mt-2.5 text-xs font-mono">
              <span className="text-pink-400 font-bold">💎 +10,000 Гемов</span>
              <span className="text-yellow-500 font-bold">🪙 +100,000 Моры</span>
            </div>
          </div>
          <button 
            onClick={() => {
              updateProfile(p => ({
                ...p,
                gems: p.gems + 10000,
                gold: p.gold + 100000,
                events: { ...p.events, compensationClaimed: true }
              }));
              alert("Вы забрали компенсацию!");
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold tracking-wider rounded-lg uppercase transition-all"
          >
            Восстановить отряд
          </button>
        </div>
      )}

      {/* ARTIFACT BALANCE COMPENSATION */}
      {!artCompClaimed && (
        <div className="bg-gradient-to-r from-blue-950/40 to-cyan-950/40 border border-cyan-500/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded-md bg-cyan-500/10">БАЛАНС АРТЕФАКТОВ</span>
            <p className="text-sm text-slate-300 mt-2 font-sans">
              Максимальный уровень артефактов теперь ограничен 20. Мы ценим ваши прошлые достижения!
            </p>
            <div className="flex gap-4 mt-2.5 text-xs font-mono">
              <span className="text-cyan-400 font-bold">💎 +1,600 Гемов</span>
              <span className="text-yellow-500 font-bold">🪙 +500,000 Моры</span>
            </div>
          </div>
          <button 
            onClick={() => {
              updateProfile(p => ({
                ...p,
                gems: p.gems + 1600,
                gold: p.gold + 500000,
                events: { ...p.events, artCompClaimed: true }
              }));
              alert("Компенсация за ребаланс получена!");
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold tracking-wider rounded-lg uppercase transition-all"
          >
            Забрать награду
          </button>
        </div>
      )}

      {/* TAB CONTENTS */}

      {/* 1. SEIZING THE DAY (DAILY LOGIN) */}
      {subTab === 'LOGIN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="h-28 bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-950 p-6 flex flex-col justify-end">
            <h3 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">ВРЕМЯ ПРИКЛЮЧЕНИЙ</h3>
            <p className="text-xs text-purple-200 uppercase font-mono tracking-wider">Ежедневный вход в затерянный мир</p>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <div>
                <span className="text-xs text-slate-400 font-mono">Серия входов: <strong className="text-purple-400">{loginStreak} дн.</strong></span>
                <p className="text-xs text-slate-500 mt-1">Отмечайтесь ежедневно, получая всё больше камней истока и золота.</p>
              </div>
              <button 
                onClick={handleCheckIn}
                disabled={alreadyCheckedIn}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold rounded uppercase tracking-wider text-xs transition"
              >
                {alreadyCheckedIn ? 'Отмечено' : 'Отметиться сегодня'}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const isClaimedPast = loginStreak >= day;
                const isCurrentToday = (loginStreak + 1 === day || (loginStreak === 7 && day === 1)) && !alreadyCheckedIn;
                
                return (
                  <div 
                    key={day} 
                    className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center text-center relative ${
                      isClaimedPast 
                        ? 'border-green-600/50 bg-green-900/10' 
                        : isCurrentToday 
                        ? 'border-purple-500 bg-purple-950/30 animate-pulse' 
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 mb-1">ДЕНЬ {day}</div>
                    <Gem className={`w-4 h-4 ${isClaimedPast ? 'text-green-400' : 'text-slate-600'}`} />
                    <div className="text-[11px] font-bold mt-1.5 text-slate-300">+{day * 25}</div>
                    <div className="text-[8px] font-mono text-slate-500">+{day * 1500}G</div>
                    {isClaimedPast && <CheckCircle className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-green-500 bg-slate-950 rounded-full" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. DRINK A-DREAMING (BARTENDER MIXING) */}
      {subTab === 'BARTENDER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3">
          
          {/* Main preparation counter */}
          <div className="md:col-span-2 p-5 border-r border-slate-800 space-y-4">
            <div className="h-24 bg-gradient-to-r from-amber-950 to-orange-950 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-orange-900/20 border border-orange-500/30 rounded-lg text-amber-400">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Глоток пьянящей мечты</h4>
                <p className="text-xs text-orange-200 font-sans mt-1">Смешайте любимый коктейль гостей, соблюдая точные рецепты!</p>
              </div>
            </div>

            {/* Guest request dialog */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
              <div className={`w-12 h-12 ${activeCustomer.avatarColor} rounded-full shrink-0 flex items-center justify-center font-black text-white text-lg shadow-inner`}>
                {activeCustomer.name[0]}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{activeCustomer.name}</span>
                  <span className="text-[10px] font-mono uppercase bg-orange-600/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-md">
                    Заказ: {activeCustomer.wantedRecipe}
                  </span>
                </div>
                <p className="text-xs italic text-slate-300">"{activeCustomer.greeting}"</p>
              </div>
            </div>

            {/* Mixing container / current cup inventory */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Шейкер для напитков</span>
              
              <div className="h-20 flex items-center justify-center gap-3 border-y border-slate-900 my-2">
                {currentCup.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Шейкер пуст. Выберите ингредиенты ниже...</span>
                ) : (
                  currentCup.map((ing, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 text-orange-200 shadow-sm">
                      ☕ {ing}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <button 
                  onClick={clearCup}
                  className="px-3 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition"
                >
                  Очистить
                </button>
                <button 
                  onClick={mixDrink}
                  disabled={currentCup.length < 3 || isMixing}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-30 text-white font-bold rounded-md uppercase tracking-wider transition shadow-md shadow-amber-900/30"
                >
                  {isMixing ? 'Взбалтывание...' : 'Взболтать и Подать'}
                </button>
              </div>
            </div>

            {/* Feedback alert */}
            {mixingSuccessMsg && (
              <div className="p-3 bg-purple-950/50 border border-purple-500/50 rounded-xl text-xs font-sans text-purple-200 text-center animate-bounce">
                {mixingSuccessMsg}
              </div>
            )}

            {/* Control Ingredient Shelf */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Ингредиенты (Выберите 3 шт)</span>
              
              <div className="space-y-3">
                {/* Bases */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">База:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Кофе", "Чай", "Какао"].map(b => (
                      <button 
                        key={b}
                        onClick={() => addIngredient(b)}
                        className="py-2 px-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg text-xs transition"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fillers */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Топпинги:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["Молоко", "Карамель", "Мята", "Шоколад"].map(f => (
                      <button 
                        key={f}
                        onClick={() => addIngredient(f)}
                        className="py-1.5 px-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium rounded-lg text-xs transition"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipes side column */}
          <div className="p-5 bg-slate-950/40 font-sans space-y-4">
            <div>
              <h5 className="font-bold text-orange-400 text-sm flex items-center gap-1"><BookOpen className="w-4 h-4"/> Книга Рецептов</h5>
              <p className="text-[11px] text-slate-500">Подбирайте точные пропорции, чтобы угодить посетителям таверны.</p>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {RECIPES.map(recipe => (
                <div key={recipe.name} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex justify-between items-center gap-1">
                    <span className="font-bold text-slate-300 text-xs">{recipe.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.map((ing, i) => (
                      <span key={i} className="text-[8px] bg-slate-850 px-1 py-0.5 rounded text-orange-200 border border-slate-800 font-mono">
                        {ing}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-serif leading-tight">{recipe.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 font-mono text-center text-xs">
              <span className="text-slate-500">Набрано очков бартендера: </span>
              <div className="text-lg font-bold text-orange-400">{profile.events.bartenderPoints || 0} ФП</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LANTERN RITE (FESTIVAL PROGRESS & SHOP) */}
      {subTab === 'LANTERN' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            
            <HeaderImageSection />

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left crafting column */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-base">Стол Сборки Фонарей</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Собирайте из волокон, фитилей и масел небесные фонари и запускайте их в небо ради очков лихорадки.</p>
                </div>

                {/* Material claims */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">Ежедневный набор материалов</span>
                    <span className="text-[10px] text-slate-500">Заберите бесплатную партию руды и волокна: +3 ко всему</span>
                  </div>
                  <button 
                    onClick={handleClaimDailyMaterials}
                    disabled={hasClaimedTodayGifts}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 disabled:opacity-40 disabled:from-slate-800 text-white font-bold rounded-lg uppercase tracking-wider text-[10px] transition"
                  >
                    {hasClaimedTodayGifts ? 'Забрано' : 'Забрать'}
                  </button>
                </div>

                {/* Materials Count */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-2 text-center rounded-xl border border-slate-800 space-y-1 relative group">
                    <span className="text-[10px] text-slate-500 font-sans block uppercase">Волокно Плио</span>
                    <strong className="text-base text-amber-100">{fiberCount} шт</strong>
                    <button onClick={() => handleBuyMaterial('fiber')} className="w-full mt-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-[9px] text-amber-300 rounded font-bold transition">купить 800G</button>
                  </div>
                  <div className="bg-slate-950 p-2 text-center rounded-xl border border-slate-800 space-y-1 relative group">
                    <span className="text-[10px] text-slate-500 font-sans block uppercase">Фитиль Удачи</span>
                    <strong className="text-base text-orange-200">{wickCount} шт</strong>
                    <button onClick={() => handleBuyMaterial('wick')} className="w-full mt-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-[9px] text-orange-300 rounded font-bold transition">купить 800G</button>
                  </div>
                  <div className="bg-slate-950 p-2 text-center rounded-xl border border-slate-800 space-y-1 relative group">
                    <span className="text-[10px] text-slate-500 font-sans block uppercase">Флуор. Масло</span>
                    <strong className="text-base text-red-200">{oilCount} шт</strong>
                    <button onClick={() => handleBuyMaterial('oil')} className="w-full mt-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-[9px] text-red-300 rounded font-bold transition">купить 800G</button>
                  </div>
                </div>

                {/* Crafting Button action */}
                <button 
                  onClick={handleCraftAndLaunch}
                  disabled={isLaunching || fiberCount < 1 || wickCount < 1 || oilCount < 1}
                  className="w-full p-4 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 disabled:opacity-30 disabled:from-slate-800 font-black text-white text-xs tracking-widest rounded-xl uppercase transition shadow-lg shadow-red-900/30"
                >
                  {isLaunching ? 'СБОРКА И ЗАПУСК ФОНАРЯ...' : 'СОЗДАТЬ И ЗАПУСТИТЬ ФОНАРЬ (+30 Очков)'}
                </button>

                {lanternLaunchedCount > 0 && (
                  <p className="text-xs text-center text-amber-400 font-serif italic">Вы успешно запустили небесный фонарь #{lanternLaunchedCount} в ночное небо Ли Юэ!</p>
                )}
              </div>

              {/* Right Souvenir Shop exchange board */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-base">Сувенирная Награда Ли Юэ</h4>
                  <p className="text-xs text-slate-400 mt-0.5">ВЫБЕРИТЕ ПРИЗЫ И ИСПОЛЬЗУЙТЕ СВОЮ НАКОПЛЕННУЮ ПРАЗДНИЧНУЮ ЛИХОРАДКУ.</p>
                </div>

                <div className="space-y-3.5 bg-slate-950 p-4 border border-slate-850 rounded-xl max-h-[300px] overflow-y-auto">
                  {shopItems.map(item => (
                    <div key={item.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-left">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block uppercase font-mono">{item.title}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-sans">{item.desc}</span>
                      </div>
                      <button 
                        onClick={() => handleRedeem(item.id, item.pointsCost)}
                        className="px-3 py-1.5 shrink-0 bg-amber-650 hover:bg-amber-600 text-[10px] font-mono font-bold text-slate-900 rounded-md transition"
                      >
                        За {item.pointsCost} Очков
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-950 border border-amber-900/30 rounded-xl font-mono text-center flex items-center justify-between text-xs px-5">
                  <span className="text-slate-500">Ваша Лихорадка:</span>
                  <strong className="text-amber-400 font-black text-sm flex items-center gap-1">🌟 {lanternFever} Очков</strong>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. WARRIOR'S DUEL (PARRY PRACTICE MINI GAME) */}
      {subTab === 'DUEL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="h-28 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 flex flex-col justify-end relative">
            <h3 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">ДУЭЛЬ ВОИНОВ: ИСКУССТВО ПАРИРОВАНИЯ</h3>
            <p className="text-xs text-blue-200 uppercase font-mono tracking-wider">Отражайте стремительные выпады противника идеальным блоком</p>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {!duelActive ? (
              <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-900/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400">
                  <Swords className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200 text-sm">Готовы бросить вызов Громовому Гладиатору?</h4>
                  <p className="text-xs text-slate-400">Парируйте атаки именно во время зеленой фазы (когда шкала опустится к самому левому краю). Идеальный контрудар наносит титанический урон!</p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300 font-serif">
                   Награда за победу: 💎 250 Примогемов, 🪙 5,000 Моры
                </div>
                <button 
                  onClick={startNewDuel}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider transition w-full"
                >
                  Сразиться!
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Fight Arena Bars */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Player HP */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                      <span className="text-slate-400">Путешественник (Вы)</span>
                      <strong className="text-emerald-400">{playerHp} HP</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${(playerHp / 2000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Robot Gladiator HP */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-right">
                    <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                      <strong className="text-red-400">{bossHp} HP</strong>
                      <span className="text-slate-400">Громовой Гладиатор</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300 ml-auto" 
                        style={{ width: `${(bossHp / 5000) * 100}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Central charge-bar animation container */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                  
                  {gameState === 'CHARGING' ? (
                    <div className="space-y-3 animate-pulse">
                      <span className="text-xs font-mono uppercase bg-red-950 text-red-400 border border-red-900 px-3 py-1 rounded-full">
                        Враг готовит: <span className="font-extrabold">{strikeName}</span>!
                      </span>

                      {/* Bar indicator */}
                      <div className="w-full max-w-xl mx-auto h-6 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-800">
                        {/* Parry perfect marker band zone at the left end (from 0 to 18%) */}
                        <div 
                          className="absolute h-full bg-teal-500/50" 
                          style={{ left: '0%', width: '18%' }}
                        />
                        <div 
                          className="absolute h-full bg-red-600 transition-all duration-75 text-[10px] font-mono font-black text-white flex items-center justify-end pr-2"
                          style={{ left: '0%', width: `${roundTimer}%` }}
                        >
                           {roundTimer > 18 ? '...' : 'ПАРИРУЙТЕ!'}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex justify-between max-w-xl mx-auto px-1">
                        <span>ИДЕАЛЬНАЯ ЗОНА</span>
                        <span>ПОДГОТОВКА УДАРА</span>
                      </div>

                      <button 
                        onClick={handleParryClick}
                        className="px-8 py-4 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black rounded-xl uppercase text-sm tracking-widest transition-all w-full max-w-sm mt-3 shadow-lg shadow-teal-500/20"
                      >
                        ⚡ ПАРИРОВАТЬ!
                      </button>
                    </div>
                  ) : gameState === 'WIN' ? (
                    <div className="py-6 space-y-4 font-serif">
                      <span className="text-3xl">🏆</span>
                      <h4 className="text-xl font-bold text-teal-400 uppercase tracking-wide">Испытание Пройдено!</h4>
                      <p className="text-xs text-slate-300 max-w-xs mx-auto">Вы мастерски овладели дуэльным оружием и добыли щедрые сокровища.</p>
                      
                      <div className="p-3 bg-teal-900/10 border border-teal-500/20 rounded-xl text-xs text-teal-300 max-w-xs mx-auto font-mono">
                         Поздравляем! Начислено в инвентарь: 250 гемов, 5,000 моры.
                      </div>
                      <button 
                        onClick={startNewDuel}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-xs tracking-wider"
                      >
                        Пройти повторно
                      </button>
                    </div>
                  ) : gameState === 'LOSE' ? (
                    <div className="py-6 space-y-4">
                      <span className="text-4xl">💀</span>
                      <h4 className="text-xl font-bold text-red-500">Поражение</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">Удар Гладиатора был слишком стремителен. Тренируйте реакцию в зеленом коридоре.</p>
                      <button 
                        onClick={startNewDuel}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-505 text-white font-bold rounded-lg text-xs uppercase"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 font-bold text-slate-500 text-xs uppercase">Ожидание...</div>
                  )}

                </div>

                {/* Duell logs of combat actions */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Лог сражения</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-xs text-left">
                    {duelLog.map((log_line, index) => (
                      <div key={index} className="text-slate-300 border-l-2 border-slate-800 pl-2">
                         {log_line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit duel option */}
                <div className="text-right">
                  <button 
                    onClick={() => setDuelActive(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 underline"
                  >
                    Закончить дуэль
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Subordinate SVG or visual parts to manage file size & neat look
function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function HeaderImageSection() {
  return (
    <div className="h-32 bg-gradient-to-r from-red-900 via-yellow-950 to-amber-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
      
      {/* Absolute decorative absolute elements representing flying lanterns */}
      <div className="absolute top-2 left-1/4 w-3.5 h-5 bg-orange-500/80 rounded-t-lg animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)] rotate-6"></div>
      <div className="absolute top-6 left-1/2 w-4.5 h-6 bg-amber-400/85 rounded-t-lg animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)] -rotate-12 duration-1000"></div>
      <div className="absolute top-4 right-1/4 w-3 h-4 bg-orange-400/70 rounded-t-lg animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)] rotate-12 duration-700"></div>

      <div className="absolute bottom-4 left-6">
        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">ПРАЗДНИК МОРСКИХ ФОНАРЕЙ</h3>
        <p className="text-xs text-amber-200 uppercase font-mono tracking-wider">Грандиозный весенний фестиваль в Ли Юэ</p>
      </div>
    </div>
  );
}
