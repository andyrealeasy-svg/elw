
import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile } from '../types';
import { 
  Sparkles, Flower2, Grid3x3, Compass, CheckCircle2, Gift, Clock, Lock,
  Swords, Play, Droplets, Zap, Crosshair, Flame, Target, Shield, Skull, BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCharSplash, characterBlueprints } from '../data';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
}

export default function EventsMenu({ profile, updateProfile, setRoute }: Props) {
  const [subTab, setSubTab] = useState<'LOGIN' | 'AVELINE' | 'GRID' | 'FRONTIER' | 'TESTRUN' | 'MINIGAME' | 'UPDATE'>('AVELINE');
  const todayStr = new Date().toISOString().split('T')[0];

  // ==========================================
  // EVENT 1: LOGIN
  // ==========================================
  const lastLoginDate = profile.events.initLastClaimDay || "";
  const loginStreak = profile.events.initStreak || 0;
  const alreadyCheckedIn = lastLoginDate === todayStr;

  const handleCheckIn = () => {
    if (alreadyCheckedIn) return;
    const nextStreak = loginStreak >= 7 ? 1 : loginStreak + 1;
    updateProfile(p => ({
      ...p, gems: p.gems + 160, gold: p.gold + (nextStreak * 5000),
      events: { ...p.events, initStreak: nextStreak, initLastClaimDay: todayStr }
    }));
  };

  // ==========================================
  // EVENT 2: AVELINE (Story Event)
  // ==========================================
  const [activeDialogue, setActiveDialogue] = useState<typeof avelineStoryStages[0] | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const avelineStoryStages = [
    {
      id: "event_aveline_1",
      name: "Семя Сомнений",
      description: "Первые последствия сохраненного мира.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Этот мир... он дышит. Он не должен был существовать, но он здесь." },
        { speaker: "Кайрен", charId: "kairen", text: "Две истории наложились друг на друга. Если мы не вмешаемся, реальность разорвет сама себя." },
        { speaker: "Авелин", charId: "aveline", text: "Я не позволю стереть этот мир. Мы найдем способ объединить несовместимое. Даже если придется сражаться с самой границей." }
      ],
      reward: { exp: 0, gold: 50000, gems: 200 }
    },
    {
      id: "event_aveline_2",
      name: "Эхо Разрушения",
      description: "Отголоски старого мира пытаются стереть новый.",
      type: "BATTLE" as const,
      level: 50,
      enemyBlueprintIds: ["glitch_slime", "glitch_slime", "glitch_slime"],
      isBoss: false,
      reward: { exp: 5000, gold: 100000, gems: 300 }
    },
    {
      id: "event_aveline_3",
      name: "Холод и Отчаяние",
      description: "Кайрен пытается замедлить разрушение.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Аномалии множатся. Мой лед едва сдерживает трещины в пространстве." },
        { speaker: "Авелин", charId: "aveline", text: "Держись. Мы должны прорваться к Ядру. Там, где зародилась эта ошибка." },
        { speaker: "???", text: "ГЛУПЦЫ. ИСТОРИЯ ДОЛЖНА БЫТЬ ОДНА." }
      ],
      reward: { exp: 0, gold: 150000, gems: 400 }
    },
    {
      id: "event_aveline_4",
      name: "Страж Истории",
      description: "Воплощение алгоритма стирания преграждает путь.",
      type: "BATTLE" as const,
      level: 80,
      enemyBlueprintIds: ["matrix_guard"],
      isBoss: true,
      reward: { exp: 20000, gold: 200000, gems: 500 }
    },
    {
      id: "event_aveline_5",
      name: "Распустившийся Лотос",
      description: "Две истории сливаются воедино.",
      type: "DIALOGUE" as const,
      level: 1,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Смотри... алгоритм переписывается. Мы заставили его принять обе реальности." },
        { speaker: "Кайрен", charId: "kairen", text: "Это невозможно... но я вижу это. Сад первого цветения пустил корни прямо на границе." },
        { speaker: "Авелин", charId: "aveline", text: "Это только начало. Мы больше не пленники одного финала." }
      ],
      reward: { exp: 50000, gold: 500000, gems: 1000 }
    }
  ];

  // ==========================================
  // EVENT 3: GRID (Interactive Match/Find)
  // ==========================================
  const gridDate = profile.events.gridDate || "";
  let gridFlipsToday = profile.events.gridFlipsToday || 0;
  if (gridDate !== todayStr) gridFlipsToday = 0;
  const maxFlips = 5;
  const flipsLeft = Math.max(0, maxFlips - gridFlipsToday);
  
  const [gridItems, setGridItems] = useState<{id:number, type:string, flipped:boolean, claimed:boolean}[]>([]);
  useEffect(() => {
    if (gridItems.length === 0) {
      const types = ['GEMS', 'GEMS', 'GOLD', 'GOLD', 'EXP', 'EXP', 'JACKPOT', 'EMPTY', 'EMPTY'];
      setGridItems(types.sort(() => 0.5 - Math.random()).map((t, i) => ({ id: i, type: t, flipped: false, claimed: false })));
    }
  }, []);

  const handleFlipCard = (index: number) => {
    if (flipsLeft <= 0 || gridItems[index].flipped || gridItems[index].claimed) return;
    const newItems = [...gridItems];
    newItems[index].flipped = true;
    setGridItems(newItems);
    
    setTimeout(() => {
      let rGems = 0; let rGold = 0; let rExp = 0;
      if (newItems[index].type === 'JACKPOT') rGems = 50;
      if (newItems[index].type === 'GEMS') rGems = 10;
      if (newItems[index].type === 'GOLD') rGold = 50000;
      if (newItems[index].type === 'EXP') { rExp = 10000; rGold = 10000; }

      updateProfile(p => ({
        ...p, gems: p.gems + rGems, gold: p.gold + rGold, heroExp: p.heroExp + rExp,
        events: { ...p.events, gridDate: todayStr, gridFlipsToday: gridFlipsToday + 1 }
      }));
      
      const claimedItems = [...gridItems];
      claimedItems[index].claimed = true;
      setGridItems(claimedItems);
    }, 600);
  };

  // ==========================================
  // EVENT 4: FRONTIER (Combat Event)
  // ==========================================
  const frontierStages = [
    { id: "event_front_1", name: "Первый рубеж", level: 30, gems: 100, gold: 50000, enemies: ['slime_fire', 'slime_water'] },
    { id: "event_front_2", name: "Зона заражения", level: 50, gems: 150, gold: 75000, enemies: ['abyss_mage', 'slime_fire'] },
    { id: "event_front_3", name: "Глубинный разлом", level: 70, gems: 250, gold: 120000, enemies: ['glitch_robot', 'glitch_robot'] },
    { id: "event_front_4", name: "Эхо пустоты", level: 90, gems: 400, gold: 200000, enemies: ['phantom_void', 'glitch_slime'] },
    { id: "event_front_5", name: "Апогей искажений", level: 100, gems: 800, gold: 500000, enemies: ['matrix_guard'], isBoss: true }
  ];

  const handleStartFrontier = (stage: typeof frontierStages[0]) => {
    setRoute({
      type: 'STORY_STAGE',
      stage: {
        id: stage.id,
        name: stage.name,
        description: "Боевое испытание фронтира",
        type: 'BATTLE',
        level: stage.level,
        enemyBlueprintIds: stage.enemies,
        isBoss: stage.isBoss,
        reward: { exp: stage.level * 100, gold: stage.gold, gems: stage.gems }
      }
    });
  };

  // ==========================================
  // EVENT 5: TEST RUN
  // ==========================================
  const testRuns = [
    { id: 'test_aveline', char: 'aveline', team: ['aveline', 'ineffa', 'zephyr', 'aurum'] },
    { id: 'test_kairen1', char: 'kairen', team: ['kairen', 'volosatinya', 'glacier', 'snezhana'] },
    { id: 'test_cyrus', char: 'cyrus', team: ['cyrus', 'maestro', 'nova', 'moyan'] },
    { id: 'test_raven', char: 'raven', title: 'Рейвен', team: ['raven', 'maestro', 'tide', 'pulse'] },
  ];
  const completedTestRuns: string[] = (profile.events && profile.events.completedTestRuns) || [];

  const handleStartTestRun = (testId: string, team: string[], charName?: string) => {
    const isCompleted = completedTestRuns.includes(testId);
    setRoute({
      type: 'TRIAL_BATTLE',
      trialId: 1, 
      isTestRun: true,
      testId,
      team,
      title: charName ? `Тестовый Забег: ${charName}` : "Тестовый Забег",
      rewardGems: isCompleted ? 0 : 50,
      rewardGold: isCompleted ? 0 : 10000
    });
  };

  // ==========================================
  // EVENT 6: MINIGAME (Стрельбище)
  // ==========================================
  const minigameDate = profile.events.minigameDate || "";
  const minigamePlayed = minigameDate === todayStr;
  
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targets, setTargets] = useState<{id:number, x:number, y:number, life:number}[]>([]);
  const targetIdCounter = useRef(0);
  
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      setTargets(prev => {
        if (prev.length > 5) return prev;
        return [...prev, { id: targetIdCounter.current++, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, life: 2000 }];
      });
    }, 600);
    return () => clearInterval(spawner);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const lifeticker = setInterval(() => {
      setTargets(prev => prev.map(t => ({ ...t, life: t.life - 100 })).filter(t => t.life > 0));
    }, 100);
    return () => clearInterval(lifeticker);
  }, [isPlaying]);
  
  const claimMinigame = () => {
    if (score < 100 || minigamePlayed) return;
    updateProfile(p => ({
      ...p, gems: p.gems + 40, gold: p.gold + 50000, 
      events: { ...p.events, minigameDate: todayStr }
    }));
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 border-r border-white/5 bg-[#0a0a0a] p-4 flex flex-col gap-2 overflow-y-auto shrink-0 md:h-[calc(100vh-120px)] hide-scrollbar">
        <h3 className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 px-2">События</h3>
        
        <button onClick={() => setSubTab('AVELINE')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'AVELINE' ? "bg-rose-500/20 text-rose-300 shadow-lg border border-rose-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Flower2 className="w-4 h-4" /> <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Сюжет</div>Исход Авелин</div>
        </button>

        <button onClick={() => setSubTab('FRONTIER')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'FRONTIER' ? "bg-red-500/20 text-red-300 shadow-lg border border-red-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Shield className="w-4 h-4" /> <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Боевое Событие</div>Затмение Фронтира</div>
        </button>

        <button onClick={() => setSubTab('TESTRUN')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'TESTRUN' ? "bg-amber-500/20 text-amber-300 shadow-lg border border-amber-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Swords className="w-4 h-4" /> <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Специальное</div>Тестовый Забег</div>
        </button>

        <button onClick={() => setSubTab('MINIGAME')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'MINIGAME' ? "bg-green-500/20 text-green-300 shadow-lg border border-green-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Crosshair className="w-4 h-4" /> <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Аркада</div>Полигон Аномалий</div>
        </button>

        <button onClick={() => setSubTab('GRID')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'GRID' ? "bg-purple-500/20 text-purple-300 shadow-lg border border-purple-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Grid3x3 className="w-4 h-4" /> <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Ежедневно</div>Эхо Вероятностей</div>
        </button>

        
        <div className="h-px bg-white/10 w-full my-2"></div>
        <button onClick={() => setSubTab('UPDATE')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'UPDATE' ? "bg-cyan-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Gift className="w-4 h-4" /> Обновление 1.2
        </button>

        <button onClick={() => setSubTab('LOGIN')} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", subTab === 'LOGIN' ? "bg-indigo-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50")}>
          <Sparkles className="w-4 h-4" /> Инициализация
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black/40 overflow-y-auto relative h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] hide-scrollbar">
        
        {/* AVELINE STORY */}
        {subTab === 'AVELINE' && (
          <div className="space-y-6 max-w-4xl mx-auto relative h-full">
            {activeDialogue && (
              <div className="fixed inset-0 z-[100] bg-black/90 p-4 sm:p-8 flex flex-col justify-end animate-in fade-in">
                <div className="flex-1 flex items-center justify-center">
                   {activeDialogue.dialogue?.[dialogueIndex]?.charId && (
                     <img 
                       src={getCharSplash(activeDialogue.dialogue[dialogueIndex].charId!)} 
                       className="h-full max-h-[60vh] object-contain opacity-50"
                     />
                   )}
                </div>
                <div className="bg-[#111] border border-rose-500/30 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto w-full relative shadow-[0_0_50px_rgba(225,29,72,0.1)]">
                   <h4 className="text-xl font-black text-rose-400 uppercase tracking-widest mb-4">
                     {activeDialogue.dialogue?.[dialogueIndex]?.speaker || "..."}
                   </h4>
                   <p className="text-lg text-white/90 leading-relaxed font-serif">
                     {activeDialogue.dialogue?.[dialogueIndex]?.text}
                   </p>
                   <div className="mt-8 flex justify-end">
                     <button 
                       onClick={() => {
                         if (dialogueIndex < (activeDialogue.dialogue?.length || 0) - 1) {
                           setDialogueIndex(prev => prev + 1);
                         } else {
                           updateProfile(p => ({
                             ...p,
                             gems: p.gems + activeDialogue.reward.gems,
                             gold: p.gold + activeDialogue.reward.gold,
                             storyProgress: {
                               ...p.storyProgress,
                               completedStages: [...(p.storyProgress?.completedStages || []), activeDialogue.id]
                             }
                           }));
                           setActiveDialogue(null);
                         }
                       }}
                       className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded-xl tracking-widest transition flex items-center gap-2"
                     >
                       Далее <Play className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-rose-950/80 to-[#111] border border-rose-900/50 rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 blur-[100px] pointer-events-none" />
               <div className="relative z-10 flex justify-between items-center">
                 <div>
                   <h2 className="text-2xl sm:text-3xl font-black text-rose-300 uppercase tracking-tight flex items-center gap-3">
                     <BookOpen className="w-8 h-8" /> Осколки Памяти: Исход
                   </h2>
                   <p className="text-sm text-white/60 mt-2 max-w-xl">
                     Погрузитесь в эксклюзивную сюжетную линию Авелин. Следите за тем, как мир реагирует на ее решение сохранить несовместимые реальности, участвуйте в битвах и забирайте награды за каждый этап.
                   </p>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
              {avelineStoryStages.map((stage, idx) => {
                const isCompleted = profile.storyProgress?.completedStages.includes(stage.id) || false;
                const prevCompleted = idx === 0 ? true : profile.storyProgress?.completedStages.includes(avelineStoryStages[idx-1].id);
                const isUnlocked = prevCompleted;

                return (
                  <div key={stage.id} className={cn("p-5 rounded-2xl border transition-all relative overflow-hidden", isCompleted ? "bg-black/50 border-rose-900/30 opacity-70" : isUnlocked ? "bg-rose-950/30 border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.15)]" : "bg-[#111] border-white/5 opacity-50")}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                       <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Часть {idx + 1}</span>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", stage.type === 'BATTLE' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400")}>{stage.type === 'BATTLE' ? 'Битва' : 'Диалог'}</span>
                            <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                          </div>
                          <p className="text-sm text-white/50">{isUnlocked ? stage.description : "Требуется завершить предыдущий этап..."}</p>
                       </div>
                       
                       <div className="flex flex-col sm:items-end justify-center shrink-0 space-y-3 w-full sm:w-auto">
                          <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-indigo-400">💎 {stage.reward.gems}</span>
                            <span className="text-amber-400">🪙 {stage.reward.gold}</span>
                          </div>
                          {isCompleted ? (
                            <button className="w-full sm:w-auto px-6 py-2 bg-[#111] text-rose-500/50 border border-rose-900/50 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Пройдено
                            </button>
                          ) : isUnlocked ? (
                            <button onClick={() => { if(stage.type === 'DIALOGUE') { setActiveDialogue(stage); setDialogueIndex(0); } else { setRoute({ type: 'STORY_STAGE', stage }); } }} className="w-full sm:w-auto px-8 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs uppercase font-bold tracking-wider transition shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2">
                              <Play className="w-4 h-4" /> Начать
                            </button>
                          ) : (
                            <button disabled className="w-full sm:w-auto px-6 py-2 bg-[#1a1a1a] text-white/30 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                              <Lock className="w-4 h-4" /> Заблокировано
                            </button>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FRONTIER COMBAT EVENT */}
        {subTab === 'FRONTIER' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center rounded-3xl p-6 relative overflow-hidden border border-red-900/50">
               <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 to-black/80" />
               <div className="relative z-10">
                 <h2 className="text-2xl sm:text-3xl font-black text-red-400 uppercase tracking-tight flex items-center gap-3">
                   <Shield className="w-8 h-8" /> Затмение Фронтира
                 </h2>
                 <p className="text-sm text-white/60 mt-2 max-w-xl">
                   Динамичное боевое событие. Врата Фронтира открылись, выпуская полчища аномалий. Соберите лучший отряд и отразите 5 волн усиливающихся противников.
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frontierStages.map((stage, idx) => {
                const isCompleted = profile.storyProgress?.completedStages.includes(stage.id) || false;
                const prevCompleted = idx === 0 ? true : profile.storyProgress?.completedStages.includes(frontierStages[idx-1].id);
                const isUnlocked = prevCompleted;

                return (
                  <div key={stage.id} className={cn("p-5 rounded-3xl border transition-all relative flex flex-col justify-between min-h-[220px]", isCompleted ? "bg-[#0a0a0a] border-red-900/30 opacity-70" : isUnlocked ? "bg-red-950/20 border-red-500/50 shadow-lg shadow-red-900/20 hover:scale-[1.02]" : "bg-[#111] border-white/5 opacity-50")}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase">Этап {idx + 1}</span>
                        {stage.isBoss && <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Skull className="w-3 h-3"/> Босс</span>}
                      </div>
                      <h3 className="text-xl font-black text-white">{stage.name}</h3>
                      <p className="text-xs font-mono text-white/50 mt-1">Рекомендуемый уровень: {stage.level}</p>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold bg-black/40 p-2 rounded-xl justify-center">
                        <span className="text-indigo-400">💎 {stage.gems}</span>
                        <span className="text-amber-400">🪙 {stage.gold}</span>
                      </div>
                      {isCompleted ? (
                         <button className="w-full py-2.5 bg-black text-red-500/50 border border-red-900/50 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> Зачищено
                         </button>
                      ) : isUnlocked ? (
                         <button onClick={() => handleStartFrontier(stage)} className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs uppercase font-bold tracking-wider shadow-lg shadow-red-900/50 flex justify-center gap-2">
                           <Swords className="w-4 h-4" /> В бой
                         </button>
                      ) : (
                         <button disabled className="w-full py-2.5 bg-[#1a1a1a] text-white/30 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                           <Lock className="w-4 h-4" /> Закрыто
                         </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEST RUN */}
        {subTab === 'TESTRUN' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/40 to-black border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
               <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-3">
                 <Swords className="w-8 h-8" /> Тестовый Забег
               </h2>
               <p className="text-sm text-white/60 mt-2 max-w-2xl">
                 Испытайте персонажей текущего баннера в специально подготовленных отрядах! Получите 50 Гемов за каждое первое прохождение.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRuns.map((tr) => {
                const isCompleted = completedTestRuns.includes(tr.id);
                const charSplash = getCharSplash(tr.char);
                const charName = tr.title || characterBlueprints[tr.char]?.(tr.char,1,0,[]).name || tr.char;
                return (
                  <div key={tr.id} className="relative rounded-2xl overflow-hidden border border-white/10 group h-48">
                    <img src={charSplash} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition duration-500 scale-105 group-hover:scale-110" alt="splash" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white">{charName}</h3>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-green-400 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Пройдено
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 mb-3">
                        {tr.team.map((tid, i) => (
                           <div key={i} className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-black/50">
                             <img src={getCharSplash(tid)} className="w-full h-full object-cover" alt={tid} />
                           </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-mono font-bold px-2 py-1 rounded", isCompleted ? "text-white/40 bg-white/5 line-through" : "text-amber-400 bg-amber-500/10")}>
                          💎 50 Гемов {isCompleted && <span className="no-underline text-white/40 text-[10px] ml-1">(получено)</span>}
                        </span>
                        {isCompleted ? (
                          <button 
                            onClick={() => handleStartTestRun(tr.id, tr.team, charName)} 
                            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-white/10 flex items-center gap-1 active:scale-95 cursor-pointer"
                            title="Повторить забег (без наград)"
                          >
                            Повтор
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStartTestRun(tr.id, tr.team, charName)} 
                            className="px-6 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-900/50 active:scale-95 cursor-pointer"
                          >
                            Испытать
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MINIGAME */}
        {subTab === 'MINIGAME' && (
          <div className="space-y-6 max-w-3xl mx-auto flex flex-col items-center">
            <div className="text-center">
               <h2 className="text-3xl font-black text-green-400 uppercase tracking-tight flex items-center justify-center gap-3">
                 <Crosshair className="w-8 h-8" /> Полигон Аномалий
               </h2>
               <p className="text-sm text-white/50 mt-2">
                 Уничтожайте возникающие глитч-цели, кликая по ним. Наберите 100 очков для получения награды!
               </p>
            </div>
            
            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full max-w-md bg-black/40 px-6 py-3 rounded-2xl border border-green-900/30">
                <span className="text-lg font-bold text-white/70">Счет: <span className="text-green-400 font-black">{score} / 100</span></span>
                {minigamePlayed ? (
                  <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Награда получена</span>
                ) : score >= 100 ? (
                  <button onClick={claimMinigame} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-green-900/50 animate-bounce">Забрать 💎 40</button>
                ) : (
                  <button onClick={() => setIsPlaying(!isPlaying)} className={cn("px-4 py-1.5 font-bold rounded-lg text-xs shadow-lg", isPlaying ? "bg-red-600 text-white" : "bg-blue-600 text-white")}>
                    {isPlaying ? "Остановить" : "Старт!"}
                  </button>
                )}
              </div>

              <div className="w-full aspect-video bg-[url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80')] bg-cover bg-center rounded-2xl relative overflow-hidden border-2 border-white/10 cursor-crosshair">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                 {targets.map(t => (
                   <button 
                     key={t.id}
                     onClick={() => {
                        setTargets(prev => prev.filter(pt => pt.id !== t.id));
                        setScore(s => s + 10);
                     }}
                     style={{ left: `${t.x}%`, top: `${t.y}%` }}
                     className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-red-500/80 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)] hover:scale-95 active:scale-90 transition-transform animate-in zoom-in duration-200 flex items-center justify-center"
                   >
                     <Target className="w-6 h-6 text-white" />
                   </button>
                 ))}
                 {!isPlaying && score < 100 && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-white/30 font-black uppercase tracking-widest">Нажмите Старт</span>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* GRID */}
        {subTab === 'GRID' && (
          <div className="space-y-6 max-w-2xl mx-auto h-full flex flex-col justify-center">
            <div className="text-center">
               <h2 className="text-3xl font-black text-purple-400 uppercase tracking-tight flex items-center justify-center gap-3">
                 <Grid3x3 className="w-8 h-8" /> Эхо Вероятностей
               </h2>
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-xs font-bold font-mono mt-4">
                 Попыток: {flipsLeft} / {maxFlips}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
               {gridItems.map((item, idx) => (
                 <button
                   key={idx} onClick={() => handleFlipCard(idx)} disabled={item.flipped || item.claimed || flipsLeft <= 0}
                   className={cn(
                     "aspect-square rounded-2xl border-2 transition-all duration-300 relative",
                     item.flipped ? "bg-purple-950/40 border-purple-500/50 scale-95" : "bg-[#111] border-white/10 hover:border-purple-400/50 hover:scale-105 shadow-lg",
                     flipsLeft <= 0 && !item.flipped && "opacity-50 grayscale hover:scale-100"
                   )}
                 >
                   {!item.flipped ? (
                     <div className="absolute inset-0 flex items-center justify-center text-white/10"><Sparkles className="w-8 h-8" /></div>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-12">
                       {item.type === 'JACKPOT' && <span className="text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">50💎</span>}
                       {item.type === 'GEMS' && <span className="text-xl font-bold text-indigo-400">10💎</span>}
                       {item.type === 'GOLD' && <span className="text-xl font-bold text-yellow-500">50k🪙</span>}
                       {item.type === 'EXP' && <span className="text-xl font-bold text-green-400">EXP</span>}
                       {item.type === 'EMPTY' && <span className="text-white/20">Пусто</span>}
                     </div>
                   )}
                 </button>
               ))}
            </div>
          </div>
        )}

        
        
        {/* UPDATE REWARD */}
        {subTab === 'UPDATE' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-white mb-2">Обновление 1.2</h2>
              <p className="text-sm text-white/50 mb-8">Слияние Миров успешно завершено. Благодарим за участие.</p>
              
              <div className="flex items-center gap-2 mb-8 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                 <span className="text-xl">💎</span>
                 <span className="text-lg font-bold text-white tracking-widest">800</span>
              </div>
              
              <button 
                onClick={() => {
                  if (!profile.events?.update12Claimed) {
                    updateProfile(p => ({
                      ...p, gems: p.gems + 800, events: { ...p.events, update12Claimed: true }
                    }));
                  }
                }} 
                disabled={profile.events?.update12Claimed} 
                className={cn(
                  "w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition", 
                  profile.events?.update12Claimed ? "bg-white/5 text-white/30" : "bg-white text-black hover:bg-white/90"
                )}
              >
                {profile.events?.update12Claimed ? "Получено" : "Получить"}
              </button>
            </div>
          </div>
        )}

{/* LOGIN */}
        {subTab === 'LOGIN' && (
          <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Проект: Инициализация (7 Дней Входа)
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isClaimed = loginStreak >= day;
                const isToday = loginStreak + 1 === day && !alreadyCheckedIn;
                return (
                  <div key={day} className={cn("aspect-square rounded-2xl border flex flex-col items-center justify-center p-2", isClaimed ? "bg-indigo-900/30 border-indigo-500/50" : isToday ? "bg-indigo-600 border-indigo-400 shadow-lg scale-105 z-10" : "bg-[#0a0a0a] border-white/5 opacity-50")}>
                    <span className={cn("text-[10px] font-bold mb-1", (isClaimed || isToday) ? "text-white" : "text-white/40")}>День {day}</span>
                    {isClaimed ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Gift className={cn("w-5 h-5", isToday ? "text-white animate-pulse" : "text-white/20")} />}
                    <span className={cn("text-[10px] mt-1 font-mono font-bold", (isClaimed || isToday) ? "text-indigo-200" : "text-white/30")}>+160 💎</span>
                  </div>
                );
              })}
            </div>
            <button onClick={handleCheckIn} disabled={alreadyCheckedIn} className={cn("w-full py-4 rounded-2xl font-black uppercase text-sm flex justify-center gap-2", alreadyCheckedIn ? "bg-[#1a1a1a] text-white/30 border border-white/5" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg")}>
              {alreadyCheckedIn ? "Синхронизация завершена" : "Синхронизировать"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
