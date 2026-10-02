import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { 
  Sparkles, CheckCircle2, Gift, Lock,
  Swords, Play, Droplets, Zap, Flame, Shield, Skull, BookOpen,
  Waves, Anchor, RotateCcw, Award, ChevronRight, Gem, Compass
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCharSplash, characterBlueprints } from '../data';
import VkusnoCollabEvent, { VkusnoLogo } from './VkusnoCollabEvent';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  setRoute: (r: any) => void;
}

// -------------------------------------------------------------
// MAIN STORY EVENT: ПЕСНЬ ГЛУБИН: ПЕПЕЛЬНЫЙ ПРИЛИВ
// Featuring: Нереус, Авелин, Волосатиня vs Инеффа & Готка
// -------------------------------------------------------------
interface DialogueLine {
  speaker: string;
  charId?: string;
  text: string;
  role?: 'hero' | 'antagonist' | 'narrator';
}

interface StoryEventStage {
  id: string;
  name: string;
  description: string;
  type: 'DIALOGUE' | 'BATTLE';
  level: number;
  dialogue?: DialogueLine[];
  enemyBlueprintIds?: string[];
  isBoss?: boolean;
  reward: { exp: number; gold: number; gems: number };
}

const ashTideStages: StoryEventStage[] = [
  {
    id: "event_ash_1",
    name: "Глава I: Вскипающие Воды",
    description: "Аномальная жара испаряет приливные святилища. Появление первой угрозы.",
    type: "DIALOGUE",
    level: 1,
    dialogue: [
      { 
        speaker: "Авелин", 
        charId: "aveline", 
        role: "hero",
        text: "Температура моря у Южного Рифа поднялась почти до кипения... Вода испаряется плотной завесой пара, а священные кораллы обращаются в хрупкий белый пепел." 
      },
      { 
        speaker: "Нереус", 
        charId: "nereus", 
        role: "hero",
        text: "Я чувствую биение агрессивного чужеродного пламени. Кто-то намеренно стремится испепелить Сердце Прилива и нарушить баланс морских глубин." 
      },
      { 
        speaker: "Волосатиня", 
        charId: "volosatinya", 
        role: "hero",
        text: "Мои роскошные волосы никогда не ошибаются! Каждая прядь встала дыбом от этого сухого жара! Кто посмел испортить мою идеальную морскую укладку?!" 
      },
      { 
        speaker: "Готка", 
        charId: "gotka", 
        role: "antagonist",
        text: "Ой-ой, посмотрите на эту компанию мокрых праведников... Ваши лотосы и водоросли так красиво обугливаются. Мои тёмные марионетки только начали разогрев." 
      },
      { 
        speaker: "Волосатиня", 
        charId: "volosatinya", 
        role: "hero",
        text: "Марионетки?! Да я разрублю твоих кукол одним взмахом своего «Волосатого разреза»! Ты ответишь за посечённые кончики моих локонов!" 
      },
      { 
        speaker: "Нереус", 
        charId: "nereus", 
        role: "hero",
        text: "Осторожно. Её марионетки пропитаны адским огнём. Готовьтесь отразить первую волну!" 
      }
    ],
    reward: { exp: 0, gold: 50000, gems: 150 }
  },
  {
    id: "event_ash_2",
    name: "Глава II: Авангард Тёмных Марионеток",
    description: "Отразите отряд огнеопасных автоматонов под предводительством Готки.",
    type: "BATTLE",
    level: 55,
    enemyBlueprintIds: ["gotka", "blaze", "glitch_robot"],
    isBoss: false,
    reward: { exp: 8000, gold: 80000, gems: 200 }
  },
  {
    id: "event_ash_3",
    name: "Глава III: Пламенная Провокация",
    description: "В дело вступает Инеффа с арсеналом взрывчатки.",
    type: "DIALOGUE",
    level: 1,
    dialogue: [
      { 
        speaker: "Инеффа", 
        charId: "ineffa", 
        role: "antagonist",
        text: "Готка, ну сколько можно возиться с куклами?! Смотри, как надо решать вопросы! Больше пороха, больше огня — БАБАХ! И весь этот мокрый риф взлетит на воздух!" 
      },
      { 
        speaker: "Авелин", 
        charId: "aveline", 
        role: "hero",
        text: "Инеффа! Ты безрассудна! Разрушение Глубинного Истока вызовет цунами и иссушит земли на сотни миль вокруг!" 
      },
      { 
        speaker: "Инеффа", 
        charId: "ineffa", 
        role: "antagonist",
        text: "Ха-ха! Зато какой выйдет фейерверк! Огромный столб пара прямо до облаков! Никакая ваша водичка не потушит моё пламя хаоса!" 
      },
      { 
        speaker: "Волосатиня", 
        charId: "volosatinya", 
        role: "hero",
        text: "Только попробуй поднести свой фитиль, поджигательница! Густая грива Океана встанет непреодолимым щитом! «Волосатый разрез» рассечет твои бомбы прямо в воздухе!" 
      },
      { 
        speaker: "Нереус", 
        charId: "nereus", 
        role: "hero",
        text: "Океан глубок и безмятежен, но его гнев неостановим. «Сад Вечного Моря» поглотит ваш огонь. К оружию!" 
      }
    ],
    reward: { exp: 0, gold: 100000, gems: 200 }
  },
  {
    id: "event_ash_4",
    name: "Глава IV: Штормовой Прорыв",
    description: "Пробейтесь сквозь раскаленный рубеж элитных созданий Инеффы.",
    type: "BATTLE",
    level: 75,
    enemyBlueprintIds: ["ineffa", "void_prism", "superconducting_colossus"],
    isBoss: false,
    reward: { exp: 15000, gold: 150000, gems: 250 }
  },
  {
    id: "event_ash_5",
    name: "Глава V: Кульминация — Пламя и Прилив",
    description: "Решающая битва у Сердца Истока против тандема боссов: Инеффы и Готки!",
    type: "BATTLE",
    level: 90,
    enemyBlueprintIds: ["ineffa", "gotka"],
    isBoss: true,
    reward: { exp: 35000, gold: 250000, gems: 500 }
  },
  {
    id: "event_ash_6",
    name: "Глава VI: Эпилог — Торжество Океана",
    description: "Усмирение огня и восстановление вечного спокойствия глубин.",
    type: "DIALOGUE",
    level: 1,
    dialogue: [
      { 
        speaker: "Инеффа", 
        charId: "ineffa", 
        role: "antagonist",
        text: "Кх-кх... Да как так-то?! Мои лучшие пиро-заряды просто промокли насквозь! Все фитили отсырели... этот водоворот смыл весь мой взрывной кураж!" 
      },
      { 
        speaker: "Готка", 
        charId: "gotka", 
        role: "antagonist",
        text: "Нити моих марионеток разорваны в клочья... И этот нелепый воин с мечом и шевелюрой действительно разрубил теневые каналы... Признаю, Инеффа, пора отступать." 
      },
      { 
        speaker: "Волосатиня", 
        charId: "volosatinya", 
        role: "hero",
        text: "И чтобы больше ни ногой в наши воды! Мои локоны выдержали жар пяти взрывов и сохранили сияние! Сила ухоженности и Гидро-энергии абсолютна!" 
      },
      { 
        speaker: "Авелин", 
        charId: "aveline", 
        role: "hero",
        text: "Смотрите... вода вновь прозрачна и прохладна. Цветы лотоса распускаются прямо на глазах. Спасибо вам, друзья." 
      },
      { 
        speaker: "Нереус", 
        charId: "nereus", 
        role: "hero",
        text: "Пока Океанический союз крепок, никакой пожар не обратит этот мир в пепел. Пусть Песнь Прилива звучит вечно." 
      }
    ],
    reward: { exp: 50000, gold: 300000, gems: 300 }
  }
];

// -------------------------------------------------------------
// COMBAT EVENT: ГЛУБИННЫЙ ВОДОВОРОТ (MAELSTROM ARENA)
// -------------------------------------------------------------
interface ArenaStage {
  id: string;
  name: string;
  chamber: number;
  level: number;
  buff: string;
  enemies: string[];
  gems: number;
  gold: number;
  isBoss?: boolean;
}

const maelstromStages: ArenaStage[] = [
  {
    id: "arena_maelstrom_1",
    chamber: 1,
    name: "Палата Приливного Резонанса",
    level: 45,
    buff: "Реакции «Пар» и «Заморозка» наносят +60% урона. Скорость восполнения энергии повышена.",
    enemies: ["glacier", "blaze"],
    gems: 100,
    gold: 50000
  },
  {
    id: "arena_maelstrom_2",
    chamber: 2,
    name: "Палата Пробуждения Флоры",
    level: 60,
    buff: "Дендро-реакции и стаки «Шипов» наносят на 80% больше урона. Лечение союзников усилено на 40%.",
    enemies: ["gaia", "viper", "glitch_slime"],
    gems: 150,
    gold: 80000
  },
  {
    id: "arena_maelstrom_3",
    chamber: 3,
    name: "Палата Тектонической Мощи",
    level: 75,
    buff: "Гео-атаки и урон, масштабирующийся от Защиты, увеличены на 100%. Прочность щитов +50%.",
    enemies: ["aegis", "claymore", "glitch_robot"],
    gems: 200,
    gold: 120000
  },
  {
    id: "arena_maelstrom_4",
    chamber: 4,
    name: "Палата Грозового Импульса",
    level: 85,
    buff: "Электро-атаки ускоряют шкалу ходов отряда на 25% и наносят периодический урон цепной молнией.",
    enemies: ["pulse", "shadow_drone", "ice_monolith"],
    gems: 250,
    gold: 160000
  },
  {
    id: "arena_maelstrom_5",
    chamber: 5,
    name: "Апогей Бездны: Владыка Разлома",
    level: 95,
    buff: "Финальное испытание! Критический урон всего отряда увеличен на 70%, но враги каждые 3 хода вызывают волну пустоты.",
    enemies: ["superconducting_colossus", "void_prism"],
    gems: 400,
    gold: 250000,
    isBoss: true
  }
];

// -------------------------------------------------------------
// INTERACTIVE EVENT 3: ЖЕМЧУЖНЫЙ СИНТЕЗ (PEARL SYNTHESIS)
// -------------------------------------------------------------
type PearlElement = 'Hydro' | 'Dendro' | 'Pyro' | 'Cryo' | 'Electro';
const PEARL_ELEMENTS: PearlElement[] = ['Hydro', 'Dendro', 'Pyro', 'Cryo', 'Electro'];

const ELEMENT_STYLES: Record<PearlElement, { color: string; border: string; bg: string; icon: string; name: string }> = {
  Hydro: { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/20', icon: '💧', name: 'Гидро' },
  Dendro: { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/20', icon: '🌿', name: 'Дендро' },
  Pyro: { color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/20', icon: '🔥', name: 'Пиро' },
  Cryo: { color: 'text-cyan-300', border: 'border-cyan-500/40', bg: 'bg-cyan-500/20', icon: '❄️', name: 'Крио' },
  Electro: { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/20', icon: '⚡', name: 'Электро' },
};

// -------------------------------------------------------------
// INTERACTIVE EVENT 4: МОРСКИЕ ЭКСПЕДИЦИИ (NAUTICAL EXPEDITION)
// -------------------------------------------------------------
interface ExpeditionSector {
  id: string;
  name: string;
  title: string;
  coord: string;
  desc: string;
  taskTitle: string;
  taskType: 'RUNES' | 'CHEST' | 'CRYSTAL' | 'PRESSURE' | 'ALTAR';
  gems: number;
  gold: number;
}

const archipelagoSectors: ExpeditionSector[] = [
  {
    id: "sec_lagoon",
    name: "Коралловая Лагуна",
    title: "Святилище Лазурных Вод",
    coord: "Сектор A-1",
    desc: "Мелководный риф с древними гидро-стелами, покрытыми жемчужными инкрустациями.",
    taskTitle: "Синхронизация Приливных Рун",
    taskType: "RUNES",
    gems: 100,
    gold: 50000
  },
  {
    id: "sec_galleon",
    name: "Бухта Затонувших Галеонов",
    title: "Останки «Императрицы Прилива»",
    coord: "Сектор B-3",
    desc: "Тайный трюм флагманского корабля, запертый магическим кодовым механизмом стихий.",
    taskTitle: "Взлом Морского Кодового Замка",
    taskType: "CHEST",
    gems: 120,
    gold: 60000
  },
  {
    id: "sec_glow_depths",
    name: "Светящиеся Глубины",
    title: "Каверна Люминесценции",
    coord: "Сектор C-2",
    desc: "Подводная пещера, озарённая свечением редких кристаллов морской эссенции.",
    taskTitle: "Активация Резонансных Кристаллов",
    taskType: "CRYSTAL",
    gems: 150,
    gold: 75000
  },
  {
    id: "sec_volcano",
    name: "Вулканический Риф",
    title: "Охлаждение Магматического Жерла",
    coord: "Сектор D-4",
    desc: "Подводные гейзеры и лавовые трещины, грозящие вскипятить окружающие воды.",
    taskTitle: "Стабилизация Геотермальных Клапанов",
    taskType: "PRESSURE",
    gems: 180,
    gold: 90000
  },
  {
    id: "sec_throne",
    name: "Алтарь Владыки Прилива",
    title: "Сердце Океанической Впадины",
    coord: "Сектор E-5",
    desc: "Древнейший монумент на самом дне Бездны, хранящий первозданную силу Океана.",
    taskTitle: "Пробуждение Сердца Прилива",
    taskType: "ALTAR",
    gems: 250,
    gold: 150000
  }
];

export default function EventsMenu({ profile, updateProfile, setRoute }: Props) {
  // Navigation
  const [subTab, setSubTab] = useState<
    'ASH_TIDE' | 'MAELSTROM_ARENA' | 'PEARL_SYNTHESIS' | 'NAUTICAL_EXPEDITION' | 'TESTRUN' | 'VKUSNO' | 'UPDATE' | 'LOGIN'
  >('ASH_TIDE');

  const todayStr = new Date().toISOString().split('T')[0];

  // ==========================================
  // EVENT 1: ASH TIDE (MAIN STORY EVENT)
  // ==========================================
  const [activeDialogue, setActiveDialogue] = useState<StoryEventStage | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const completedStages = profile.storyProgress?.completedStages || [];

  const handleStartAshBattle = (stage: StoryEventStage) => {
    setRoute({
      type: 'STORY_STAGE',
      stage: {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        type: 'BATTLE',
        level: stage.level,
        enemyBlueprintIds: stage.enemyBlueprintIds,
        isBoss: stage.isBoss,
        reward: stage.reward
      }
    });
  };

  const handleFinishDialogue = () => {
    if (!activeDialogue) return;
    const nextCompleted = completedStages.includes(activeDialogue.id) 
      ? completedStages 
      : [...completedStages, activeDialogue.id];

    updateProfile(p => ({
      ...p,
      gems: p.gems + activeDialogue.reward.gems,
      gold: p.gold + activeDialogue.reward.gold,
      storyProgress: {
        ...p.storyProgress,
        completedStages: nextCompleted,
        unlockedChapters: p.storyProgress?.unlockedChapters || ['chap1']
      }
    }));
    setActiveDialogue(null);
    setDialogueIndex(0);
  };

  // ==========================================
  // EVENT 2: MAELSTROM ARENA (COMBAT EVENT)
  // ==========================================
  const handleStartArenaStage = (stage: ArenaStage) => {
    setRoute({
      type: 'STORY_STAGE',
      stage: {
        id: stage.id,
        name: stage.name,
        description: stage.buff,
        type: 'BATTLE',
        level: stage.level,
        enemyBlueprintIds: stage.enemies,
        isBoss: stage.isBoss,
        reward: { exp: stage.level * 100, gold: stage.gold, gems: stage.gems }
      }
    });
  };

  const arenaClearedCount = maelstromStages.filter(s => completedStages.includes(s.id)).length;
  const isArenaMasterClaimed = profile.events?.arenaMasterClaimed || false;

  const handleClaimArenaBonus = () => {
    if (arenaClearedCount < 5 || isArenaMasterClaimed) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems + 200,
      gold: p.gold + 100000,
      events: { ...p.events, arenaMasterClaimed: true }
    }));
  };

  // ==========================================
  // EVENT 3: PEARL SYNTHESIS (INTERACTIVE MINIGAME)
  // ==========================================
  const pearlScore = profile.events?.pearlSynthesisScore || 0;
  const claimedPearlRanks: number[] = profile.events?.pearlClaimedRanks || [];

  const [pearlGrid, setPearlGrid] = useState<PearlElement[]>(() => {
    return Array.from({ length: 25 }, () => PEARL_ELEMENTS[Math.floor(Math.random() * PEARL_ELEMENTS.length)]);
  });
  const [selectedPearls, setSelectedPearls] = useState<number[]>([]);
  const [lastComboGain, setLastComboGain] = useState<number | null>(null);

  const pearlMilestones = [
    { rank: 1, req: 150, gems: 100, gold: 50000, label: "Ранг I: Перламутровый отблеск" },
    { rank: 2, req: 350, gems: 150, gold: 80000, label: "Ранг II: Эссенция глубин" },
    { rank: 3, req: 650, gems: 200, gold: 120000, label: "Ранг III: Владыка рифов" },
    { rank: 4, req: 1000, gems: 250, gold: 150000, label: "Ранг IV: Совершенный синтез" }
  ];

  const handlePearlClick = (index: number) => {
    const targetElement = pearlGrid[index];
    if (!targetElement) return;

    // Find connected cluster using BFS
    const visited = new Set<number>();
    const queue: number[] = [index];
    visited.add(index);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const r = Math.floor(curr / 5);
      const c = curr % 5;
      const neighbors = [
        r > 0 ? curr - 5 : -1,
        r < 4 ? curr + 5 : -1,
        c > 0 ? curr - 1 : -1,
        c < 4 ? curr + 1 : -1
      ].filter(n => n >= 0);

      for (const n of neighbors) {
        if (!visited.has(n) && pearlGrid[n] === targetElement) {
          visited.add(n);
          queue.push(n);
        }
      }
    }

    if (visited.size < 2) {
      // Single pearl tap - show gentle feedback
      setSelectedPearls([index]);
      setTimeout(() => setSelectedPearls([]), 300);
      return;
    }

    // Explode cluster!
    const clusterIndices = Array.from(visited);
    setSelectedPearls(clusterIndices);

    const pointsGained = clusterIndices.length * 15 + (clusterIndices.length >= 4 ? 20 : 0);
    setLastComboGain(pointsGained);

    setTimeout(() => {
      // Replace with new pearls
      setPearlGrid(prev => {
        const next = [...prev];
        clusterIndices.forEach(idx => {
          next[idx] = PEARL_ELEMENTS[Math.floor(Math.random() * PEARL_ELEMENTS.length)];
        });
        return next;
      });
      setSelectedPearls([]);

      updateProfile(p => ({
        ...p,
        events: {
          ...p.events,
          pearlSynthesisScore: (p.events?.pearlSynthesisScore || 0) + pointsGained
        }
      }));
    }, 250);
  };

  const handleShufflePearls = () => {
    setPearlGrid(Array.from({ length: 25 }, () => PEARL_ELEMENTS[Math.floor(Math.random() * PEARL_ELEMENTS.length)]));
  };

  const handleClaimPearlMilestone = (milestone: typeof pearlMilestones[0]) => {
    if (pearlScore < milestone.req || claimedPearlRanks.includes(milestone.rank)) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems + milestone.gems,
      gold: p.gold + milestone.gold,
      events: {
        ...p.events,
        pearlClaimedRanks: [...(p.events?.pearlClaimedRanks || []), milestone.rank]
      }
    }));
  };

  // ==========================================
  // EVENT 4: NAUTICAL EXPEDITIONS (INTERACTIVE MAP)
  // ==========================================
  const completedExpeditions: string[] = profile.events?.archipelagoCompleted || [];
  const [activeExpedition, setActiveExpedition] = useState<ExpeditionSector | null>(null);
  const [expeditionTaskStep, setExpeditionTaskStep] = useState<number>(0);
  const [expeditionSolved, setExpeditionSolved] = useState<boolean>(false);

  const handleOpenExpedition = (sector: ExpeditionSector) => {
    setActiveExpedition(sector);
    setExpeditionTaskStep(0);
    setExpeditionSolved(false);
  };

  const handleSolveExpedition = () => {
    if (!activeExpedition) return;
    setExpeditionSolved(true);
    setTimeout(() => {
      const nextDone = [...completedExpeditions, activeExpedition.id];
      updateProfile(p => ({
        ...p,
        gems: p.gems + activeExpedition.gems,
        gold: p.gold + activeExpedition.gold,
        events: {
          ...p.events,
          archipelagoCompleted: nextDone
        }
      }));
      setActiveExpedition(null);
      setExpeditionSolved(false);
    }, 1200);
  };

  const isArchipelagoGrandClaimed = profile.events?.archipelagoGrandClaimed || false;
  const handleClaimArchipelagoGrand = () => {
    if (completedExpeditions.length < 5 || isArchipelagoGrandClaimed) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems + 300,
      gold: p.gold + 150000,
      events: {
        ...p.events,
        archipelagoGrandClaimed: true
      }
    }));
  };

  // ==========================================
  // EVENT 5: TEST RUN (UPDATED SQUADS)
  // ==========================================
  const testRuns = [
    { 
      id: 'test_nereus', 
      char: 'nereus', 
      title: 'Нереус',
      desc: 'Вуаль прилива • Сад Вечного Моря',
      team: ['nereus', 'kairen', 'aveline', 'farina'] 
    },
    { 
      id: 'test_iva', 
      char: 'iva', 
      title: 'Ива',
      desc: 'Первые ростки • Связь с Флорой',
      team: ['iva', 'kopro', 'farina', 'moyan'] 
    },
    { 
      id: 'test_aelita', 
      char: 'aelita', 
      title: 'Аэлита',
      desc: 'Шипы справедливости • Теорема природы',
      team: ['aelita', 'krona', 'farina', 'moyan'] 
    },
    { 
      id: 'test_maestro', 
      char: 'maestro', 
      title: 'Маэстро',
      desc: 'Симфония пустоты • Метка изоляции',
      team: ['maestro', 'cyrus', 'raven', 'volta'] 
    },
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
  // EVENT 7: LOGIN (7 DAYS)
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

  return (
    <div className="flex flex-col md:flex-row h-full select-none">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 border-r border-white/5 bg-[#0a0a0a] p-4 flex flex-col gap-2 overflow-y-auto shrink-0 md:h-[calc(100vh-120px)] hide-scrollbar">
        <h3 className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 px-2">События</h3>
        
        {/* NEW MAIN STORY EVENT: ASH TIDE */}
        <button 
          onClick={() => setSubTab('ASH_TIDE')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'ASH_TIDE' 
              ? "bg-gradient-to-r from-teal-950 to-blue-950 text-teal-200 border-teal-500/50 shadow-lg shadow-teal-950/50" 
              : "bg-[#0b1318] text-white/80 hover:bg-[#0f1f28] hover:text-white border-teal-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Waves className="w-4 h-4 text-teal-300 animate-pulse" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-black bg-teal-400 px-1.5 py-0.2 rounded font-mono">Сюжет</span>
              <span className="text-[9px] text-teal-400/80 font-bold truncate">1.3 Основной</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Пепельный Прилив</div>
          </div>
        </button>

        {/* NEW COMBAT EVENT: MAELSTROM ARENA */}
        <button 
          onClick={() => setSubTab('MAELSTROM_ARENA')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'MAELSTROM_ARENA' 
              ? "bg-gradient-to-r from-red-950 to-rose-950 text-rose-200 border-rose-500/50 shadow-lg shadow-rose-950/50" 
              : "bg-[#160c0f] text-white/80 hover:bg-[#201015] hover:text-white border-rose-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-rose-600 px-1.5 py-0.2 rounded font-mono">Битва</span>
              <span className="text-[9px] text-rose-400/80 font-bold truncate">5 Залов</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Арена Бездны</div>
          </div>
        </button>

        {/* NEW INTERACTIVE PUZZLE: PEARL SYNTHESIS */}
        <button 
          onClick={() => setSubTab('PEARL_SYNTHESIS')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'PEARL_SYNTHESIS' 
              ? "bg-gradient-to-r from-purple-950 to-indigo-950 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-950/50" 
              : "bg-[#120e1c] text-white/80 hover:bg-[#1a1429] hover:text-white border-purple-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-purple-600 px-1.5 py-0.2 rounded font-mono">Интерактив</span>
              <span className="text-[9px] text-purple-400/80 font-bold truncate">Головоломка</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Жемчужный Синтез</div>
          </div>
        </button>

        {/* NEW EXPLORATION EVENT: NAUTICAL EXPEDITIONS */}
        <button 
          onClick={() => setSubTab('NAUTICAL_EXPEDITION')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'NAUTICAL_EXPEDITION' 
              ? "bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-200 border-cyan-500/50 shadow-lg shadow-cyan-950/50" 
              : "bg-[#0b161c] text-white/80 hover:bg-[#102029] hover:text-white border-cyan-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-black bg-cyan-400 px-1.5 py-0.2 rounded font-mono">Карта</span>
              <span className="text-[9px] text-cyan-400/80 font-bold truncate">5 Секторов</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Архипелаг Руин</div>
          </div>
        </button>

        {/* TEST RUN */}
        <button 
          onClick={() => setSubTab('TESTRUN')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'TESTRUN' ? "bg-amber-500/20 text-amber-300 shadow-lg border border-amber-500/30" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Swords className="w-4 h-4" /> 
          <div className="text-left leading-tight">
            <div className="text-[10px] opacity-70">Специальное</div>
            Тестовый Забег
          </div>
        </button>

        {/* VKUSNO I TOCHKA COLLABORATION */}
        <button 
          onClick={() => setSubTab('VKUSNO')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'VKUSNO' 
              ? "bg-[#003c2f] text-emerald-200 border-[#005a46] shadow-md shadow-black/40" 
              : "bg-[#091410] text-white/80 hover:bg-[#003c2f]/40 hover:text-white border-[#005a46]/30"
          )}
        >
          <VkusnoLogo className="w-7 h-7 shrink-0" />
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#f35115] px-1.5 py-0.2 rounded">Коллаб</span>
              <span className="text-[9px] text-[#f59e0b] font-bold truncate">Сайрус & Рейвен</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Вкусно — и точка</div>
          </div>
        </button>
        
        <div className="h-px bg-white/10 w-full my-2"></div>

        {/* UPDATE 1.3 */}
        <button 
          onClick={() => setSubTab('UPDATE')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'UPDATE' ? "bg-cyan-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Gift className="w-4 h-4" /> Обновление 1.3
        </button>

        {/* LOGIN 7 DAYS */}
        <button 
          onClick={() => setSubTab('LOGIN')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'LOGIN' ? "bg-indigo-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Sparkles className="w-4 h-4" /> Инициализация
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black/40 overflow-y-auto relative h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] hide-scrollbar">
        
        {/* ======================================================== */}
        {/* TAB 1: ASH TIDE (MAIN STORY EVENT)                      */}
        {/* ======================================================== */}
        {subTab === 'ASH_TIDE' && (
          <div className="space-y-6 max-w-4xl mx-auto relative h-full">
            {/* Story Dialogue Modal */}
            {activeDialogue && (
              <div className="fixed inset-0 z-[100] bg-black/95 p-4 sm:p-8 flex flex-col justify-end animate-in fade-in">
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                   {activeDialogue.dialogue?.[dialogueIndex]?.charId && (
                     <div className="relative flex items-center justify-center max-h-[65vh]">
                       <img 
                         src={getCharSplash(activeDialogue.dialogue[dialogueIndex].charId!)} 
                         className="max-h-[65vh] object-contain opacity-80 animate-in zoom-in-95 duration-300 drop-shadow-[0_0_35px_rgba(20,184,166,0.3)]"
                         alt="Speaker splash"
                       />
                     </div>
                   )}
                </div>

                <div className="bg-[#11181e] border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto w-full relative shadow-[0_0_60px_rgba(20,184,166,0.2)]">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                         activeDialogue.dialogue?.[dialogueIndex]?.role === 'antagonist' 
                           ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                           : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                       )}>
                         {activeDialogue.dialogue?.[dialogueIndex]?.role === 'antagonist' ? 'Антагонист' : 'Защитник Океана'}
                       </span>
                       <h4 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                         {activeDialogue.dialogue?.[dialogueIndex]?.speaker || "..."}
                       </h4>
                     </div>
                     <span className="text-xs font-mono text-white/40">
                       Реплика {dialogueIndex + 1} из {activeDialogue.dialogue?.length || 1}
                     </span>
                   </div>

                   <p className="text-base sm:text-lg text-white/90 leading-relaxed font-sans min-h-[70px]">
                     {activeDialogue.dialogue?.[dialogueIndex]?.text}
                   </p>

                   <div className="mt-6 flex justify-end gap-3">
                     <button 
                       onClick={() => {
                         if (dialogueIndex < (activeDialogue.dialogue?.length || 0) - 1) {
                           setDialogueIndex(prev => prev + 1);
                         } else {
                           handleFinishDialogue();
                         }
                       }}
                       className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-black uppercase rounded-2xl tracking-widest transition flex items-center gap-2 shadow-lg shadow-teal-500/30 cursor-pointer active:scale-95"
                     >
                       {dialogueIndex < (activeDialogue.dialogue?.length || 0) - 1 ? 'Далее' : 'Завершить главу'} <ChevronRight className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-teal-950 via-[#0d1e26] to-[#1a0f18] border border-teal-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-500/40 text-teal-300 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                   <Waves className="w-4 h-4 animate-bounce" /> Главное Событие Версии 1.3
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                   Песнь Глубин: Пепельный Прилив
                 </h2>
                 <p className="text-sm text-teal-100/70 mt-2 max-w-2xl leading-relaxed">
                   Пламенная буря угрожает выжечь Сердце Океана! Объедините силы с <strong className="text-teal-300">Нереусом</strong>, <strong className="text-teal-300">Авелин</strong> и непревзойдённым мечником <strong className="text-teal-300">Волосатиней</strong>, чтобы сокрушить огненные амбиции опасного дуэта антагонисток — <strong className="text-rose-400">Инеффы</strong> и <strong className="text-rose-400">Готки</strong>!
                 </p>
                 <div className="mt-4 flex flex-wrap gap-3">
                   <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                     <Gem className="w-4 h-4 text-cyan-400" /> Награды сюжета: <span className="text-cyan-300 font-black">1 600 💎</span>
                   </div>
                   <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-400">
                     🪙 930 000 Золота
                   </div>
                 </div>
               </div>
            </div>

            {/* Stages List */}
            <div className="space-y-4">
              {ashTideStages.map((stage, idx) => {
                const isCompleted = completedStages.includes(stage.id);
                const prevCompleted = idx === 0 ? true : completedStages.includes(ashTideStages[idx - 1].id);
                const isUnlocked = prevCompleted;

                return (
                  <div 
                    key={stage.id} 
                    className={cn(
                      "p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden",
                      isCompleted 
                        ? "bg-[#0b1318]/60 border-teal-900/30 opacity-80" 
                        : isUnlocked 
                          ? "bg-gradient-to-r from-[#0d1f27] to-[#121920] border-teal-500/50 shadow-lg shadow-teal-950/40 hover:border-teal-400" 
                          : "bg-[#0c0f12] border-white/5 opacity-50"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                       <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-black text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 font-mono">
                              Часть {idx + 1}
                            </span>
                            <span className={cn(
                              "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider", 
                              stage.type === 'BATTLE' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            )}>
                              {stage.type === 'BATTLE' ? (stage.isBoss ? 'Финальный Босс' : 'Боевое столкновение') : 'Сюжетная сцена'}
                            </span>
                            <h3 className="text-lg sm:text-xl font-black text-white">{stage.name}</h3>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {isUnlocked ? stage.description : "Пройдите предыдущий этап для разблокировки..."}
                          </p>
                       </div>
                       
                       <div className="flex flex-col sm:items-end justify-center shrink-0 space-y-3 w-full sm:w-auto">
                          <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/60 px-3.5 py-2 rounded-xl border border-white/10">
                            <span className="text-cyan-400 flex items-center gap-1">💎 {stage.reward.gems}</span>
                            <span className="text-amber-400 flex items-center gap-1">🪙 {stage.reward.gold}</span>
                          </div>

                          {isCompleted ? (
                            <button className="w-full sm:w-auto px-6 py-2.5 bg-black/40 text-teal-400/60 border border-teal-900/40 rounded-xl text-xs uppercase font-black flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Пройдено
                            </button>
                          ) : isUnlocked ? (
                            <button 
                              onClick={() => { 
                                if (stage.type === 'DIALOGUE') { 
                                  setActiveDialogue(stage); 
                                  setDialogueIndex(0); 
                                } else { 
                                  handleStartAshBattle(stage); 
                                } 
                              }} 
                              className={cn(
                                "w-full sm:w-auto px-8 py-2.5 text-black font-black uppercase rounded-xl text-xs tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                                stage.type === 'BATTLE' 
                                  ? "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-rose-950/50" 
                                  : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-teal-950/50"
                              )}
                            >
                              <Play className="w-4 h-4 fill-current" /> {stage.type === 'BATTLE' ? 'В бой!' : 'Смотреть'}
                            </button>
                          ) : (
                            <button disabled className="w-full sm:w-auto px-6 py-2.5 bg-[#161a1e] text-white/20 rounded-xl text-xs uppercase font-bold flex items-center justify-center gap-2">
                              <Lock className="w-4 h-4" /> Закрыто
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

        {/* ======================================================== */}
        {/* TAB 2: MAELSTROM ARENA (COMBAT EVENT)                    */}
        {/* ======================================================== */}
        {subTab === 'MAELSTROM_ARENA' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-rose-950 via-[#1f1016] to-[#120a0f] border border-rose-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 blur-[90px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                   <Shield className="w-4 h-4" /> Испытание Мастерства Бездны
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                   Глубинный Водоворот: Арена Стихий
                 </h2>
                 <p className="text-sm text-white/70 mt-2 max-w-2xl leading-relaxed">
                   Пять палат испытаний с уникальными стихийными баффами. Подберите лучший отряд для каждого эффекта резонанса и зачистите все рубежи!
                 </p>
                 
                 {/* Master completion progress */}
                 <div className="mt-5 p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div>
                     <div className="text-xs text-white/50 font-bold uppercase tracking-wider">Прогресс зачистки арены</div>
                     <div className="text-lg font-black text-white mt-0.5">
                       {arenaClearedCount} из 5 Палат пройдено
                     </div>
                   </div>

                   <button 
                     onClick={handleClaimArenaBonus}
                     disabled={arenaClearedCount < 5 || isArenaMasterClaimed}
                     className={cn(
                       "px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition flex items-center gap-2",
                       isArenaMasterClaimed
                         ? "bg-white/10 text-white/30"
                         : arenaClearedCount >= 5
                           ? "bg-gradient-to-r from-amber-400 to-rose-500 text-black shadow-lg shadow-rose-900/50 hover:scale-105 cursor-pointer"
                           : "bg-[#1f1a1a] text-white/30 border border-white/5"
                     )}
                   >
                     {isArenaMasterClaimed ? "Бонус получен" : "Забрать бонус: 💎 200 + 🪙 100k"}
                   </button>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maelstromStages.map((stage) => {
                const isCompleted = completedStages.includes(stage.id);

                return (
                  <div 
                    key={stage.id} 
                    className={cn(
                      "p-5 rounded-3xl border transition-all flex flex-col justify-between min-h-[240px]",
                      isCompleted 
                        ? "bg-[#0e090b] border-rose-900/30 opacity-80" 
                        : "bg-gradient-to-b from-[#1a0d13] to-[#12080d] border-rose-500/40 shadow-lg shadow-rose-950/30 hover:border-rose-400"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-lg border border-rose-500/30 uppercase">
                          Палата {stage.chamber}
                        </span>
                        {stage.isBoss && (
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-500/30">
                            <Skull className="w-3.5 h-3.5" /> БОСС
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-white">{stage.name}</h3>
                      <p className="text-xs text-rose-300/80 font-mono mt-1">Рекомендуемый уровень: {stage.level}</p>
                      <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 leading-relaxed">
                        <span className="text-rose-400 font-bold">Бафф: </span>{stage.buff}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/60 p-2 rounded-xl justify-center border border-white/5">
                        <span className="text-cyan-400 flex items-center gap-1">💎 {stage.gems}</span>
                        <span className="text-amber-400 flex items-center gap-1">🪙 {stage.gold}</span>
                      </div>

                      {isCompleted ? (
                         <button 
                           onClick={() => handleStartArenaStage(stage)}
                           className="w-full py-2.5 bg-black/40 text-rose-400/60 border border-rose-900/40 rounded-xl text-xs uppercase font-black flex items-center justify-center gap-2 hover:text-rose-300 cursor-pointer"
                         >
                           <CheckCircle2 className="w-4 h-4 text-rose-400" /> Пройдено (Повторить)
                         </button>
                      ) : (
                         <button 
                           onClick={() => handleStartArenaStage(stage)} 
                           className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs uppercase font-black tracking-wider shadow-lg shadow-rose-950/50 flex justify-center items-center gap-2 cursor-pointer active:scale-95"
                         >
                           <Swords className="w-4 h-4" /> Вступить в бой
                         </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PEARL SYNTHESIS (INTERACTIVE MINIGAME)            */}
        {/* ======================================================== */}
        {subTab === 'PEARL_SYNTHESIS' && (
          <div className="space-y-6 max-w-3xl mx-auto flex flex-col items-center">
            <div className="text-center w-full">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                 <Sparkles className="w-4 h-4 animate-spin" /> Интерактивная Головоломка
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                 Жемчужный Синтез: Тайны Рифов
               </h2>
               <p className="text-sm text-white/60 mt-1 max-w-md mx-auto">
                 Нажимайте на группы одинаковых стихийных жемчужин (от 2 и более), чтобы взрывать их, накапливать очки чистоты резонанса и забирать ценные награды!
               </p>
            </div>

            {/* Score & Controls Bar */}
            <div className="w-full bg-[#120e1a] border border-purple-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-2xl text-purple-300">
                    🔮
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase font-black tracking-wider">Очки Чистоты</div>
                    <div className="text-2xl font-black text-purple-300 font-mono">
                      {pearlScore} <span className="text-xs text-white/40 font-normal">pts</span>
                      {lastComboGain && (
                        <span className="text-xs text-emerald-400 font-bold ml-2 animate-in fade-in">
                          +{lastComboGain}!
                        </span>
                      )}
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                 <button 
                   onClick={handleShufflePearls}
                   className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                   title="Перемешать поле жемчужин"
                 >
                   <RotateCcw className="w-3.5 h-3.5" /> Резонанс (Перемешать)
                 </button>
               </div>
            </div>

            {/* 5x5 Matrix of Pearls */}
            <div className="bg-[#0b0811] border-2 border-purple-500/40 p-4 sm:p-6 rounded-3xl shadow-2xl relative">
               <div className="grid grid-cols-5 gap-2.5 sm:gap-3 w-72 sm:w-84 aspect-square">
                 {pearlGrid.map((elem, idx) => {
                   const style = ELEMENT_STYLES[elem];
                   const isSelected = selectedPearls.includes(idx);

                   return (
                     <button
                       key={idx}
                       onClick={() => handlePearlClick(idx)}
                       className={cn(
                         "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-90",
                         style.bg,
                         style.border,
                         isSelected ? "scale-110 shadow-lg shadow-purple-500/60 ring-2 ring-white" : "hover:scale-105 hover:brightness-125"
                       )}
                       title={`${style.name} Жемчужина`}
                     >
                       <span className="text-xl sm:text-2xl drop-shadow">{style.icon}</span>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Rewards Milestones */}
            <div className="w-full space-y-3">
               <h3 className="text-xs font-black uppercase text-white/50 tracking-wider px-1">Шкала Наград Синтеза</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {pearlMilestones.map((m) => {
                   const isClaimed = claimedPearlRanks.includes(m.rank);
                   const isReady = pearlScore >= m.req && !isClaimed;

                   return (
                     <div 
                       key={m.rank}
                       className={cn(
                         "p-4 rounded-2xl border flex items-center justify-between transition",
                         isClaimed 
                           ? "bg-[#0b0811] border-purple-900/30 opacity-60" 
                           : isReady 
                             ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/50" 
                             : "bg-[#0e0a15] border-white/5 opacity-80"
                       )}
                     >
                       <div>
                         <div className="text-xs font-black text-white">{m.label}</div>
                         <div className="text-[11px] text-white/50 font-mono mt-0.5">Требуется: {m.req} очков</div>
                         <div className="flex items-center gap-2 mt-1.5 font-mono text-xs font-bold">
                           <span className="text-cyan-400">💎 {m.gems}</span>
                           <span className="text-amber-400">🪙 {m.gold}</span>
                         </div>
                       </div>

                       <div>
                         {isClaimed ? (
                           <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                             <CheckCircle2 className="w-4 h-4" /> Получено
                           </span>
                         ) : isReady ? (
                           <button 
                             onClick={() => handleClaimPearlMilestone(m)}
                             className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-900/50 animate-bounce cursor-pointer active:scale-95"
                           >
                             Забрать!
                           </button>
                         ) : (
                           <span className="text-xs font-mono text-white/30 font-bold">
                             {pearlScore}/{m.req}
                           </span>
                         )}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: NAUTICAL EXPEDITIONS (INTERACTIVE ARCHIPELAGO)    */}
        {/* ======================================================== */}
        {subTab === 'NAUTICAL_EXPEDITION' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Modal for Sector Interaction */}
            {activeExpedition && (
              <div className="fixed inset-0 z-[100] bg-black/95 p-4 sm:p-8 flex items-center justify-center animate-in fade-in">
                <div className="bg-[#0b161e] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-mono font-bold">
                      {activeExpedition.coord}
                    </span>
                    <button 
                      onClick={() => setActiveExpedition(null)}
                      className="text-white/40 hover:text-white text-xs font-mono uppercase font-bold cursor-pointer"
                    >
                      Закрыть
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-white">{activeExpedition.name}</h3>
                  <p className="text-xs text-cyan-300 font-mono mt-0.5">{activeExpedition.title}</p>
                  <p className="text-sm text-white/70 mt-3 leading-relaxed">{activeExpedition.desc}</p>

                  <div className="my-6 p-4 rounded-2xl bg-black/50 border border-cyan-500/20">
                    <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider mb-2">
                      Задание: {activeExpedition.taskTitle}
                    </h4>

                    {/* Interactive Puzzle Step */}
                    <div className="py-4 text-center">
                      {!expeditionSolved ? (
                        <div className="space-y-4">
                          <p className="text-xs text-white/60">
                            Активируйте резонанс трех стихийных рун прилива в правильном порядке:
                          </p>
                          <div className="flex justify-center gap-3">
                            {['Гидро 💧', 'Крио ❄️', 'Гео 🪨'].map((elem, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  if (expeditionTaskStep === i) {
                                    if (i === 2) {
                                      handleSolveExpedition();
                                    } else {
                                      setExpeditionTaskStep(i + 1);
                                    }
                                  } else {
                                    setExpeditionTaskStep(0);
                                  }
                                }}
                                className={cn(
                                  "px-4 py-3 rounded-xl border text-xs font-black transition cursor-pointer active:scale-95",
                                  expeditionTaskStep > i 
                                    ? "bg-cyan-500 text-black border-cyan-300 shadow-md shadow-cyan-500/30" 
                                    : "bg-white/5 text-white/80 border-white/10 hover:border-cyan-400"
                                )}
                              >
                                {elem}
                              </button>
                            ))}
                          </div>
                          {expeditionTaskStep > 0 && (
                            <span className="text-[11px] font-mono text-cyan-400">
                              Резонанс {expeditionTaskStep}/3 стабилизирован...
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2 animate-in zoom-in-95">
                          <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-bounce" />
                          <div className="text-lg font-black text-cyan-300">Реликвия успешно пробуждена!</div>
                          <div className="text-xs font-mono text-white/60 mt-1">Награды зачислены на ваш баланс.</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 font-mono text-xs font-bold">
                      <span className="text-cyan-400">💎 +{activeExpedition.gems}</span>
                      <span className="text-amber-400">🪙 +{activeExpedition.gold}</span>
                    </div>

                    <button
                      onClick={() => setActiveExpedition(null)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase transition"
                    >
                      Назад
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Map Header */}
            <div className="bg-gradient-to-r from-cyan-950 via-[#0a1a24] to-[#07131a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 blur-[90px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                   <Compass className="w-4 h-4 animate-spin" /> Исследование Акватории
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                   Морские Экспедиции: Затонувший Архипелаг
                 </h2>
                 <p className="text-sm text-white/70 mt-2 max-w-2xl leading-relaxed">
                   Исследуйте 5 ключевых секторов древней затонувшей цивилизации. Решайте интерактивные морские головоломки, открывайте реликтовые сундуки и соберите полное Благословение Океана!
                 </p>
                 
                 <div className="mt-5 p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div>
                     <div className="text-xs text-white/50 font-bold uppercase tracking-wider">Сектора архипелага</div>
                     <div className="text-lg font-black text-white mt-0.5">
                       {completedExpeditions.length} из 5 Секторов исследовано
                     </div>
                   </div>

                   <button 
                     onClick={handleClaimArchipelagoGrand}
                     disabled={completedExpeditions.length < 5 || isArchipelagoGrandClaimed}
                     className={cn(
                       "px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition flex items-center gap-2",
                       isArchipelagoGrandClaimed
                         ? "bg-white/10 text-white/30"
                         : completedExpeditions.length >= 5
                           ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-900/50 hover:scale-105 cursor-pointer"
                           : "bg-[#101b22] text-white/30 border border-white/5"
                     )}
                   >
                     {isArchipelagoGrandClaimed ? "Сундук открыт" : "Гран-при: 💎 300 + 🪙 150k"}
                   </button>
                 </div>
               </div>
            </div>

            {/* Sectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archipelagoSectors.map((sector) => {
                const isCompleted = completedExpeditions.includes(sector.id);

                return (
                  <div 
                    key={sector.id}
                    className={cn(
                      "p-5 rounded-3xl border transition-all flex flex-col justify-between min-h-[220px]",
                      isCompleted 
                        ? "bg-[#091217] border-cyan-900/30 opacity-80" 
                        : "bg-gradient-to-b from-[#0e1d26] to-[#08131a] border-cyan-500/40 shadow-lg shadow-cyan-950/30 hover:border-cyan-400"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-lg border border-cyan-500/30 uppercase">
                          {sector.coord}
                        </span>
                        <Anchor className="w-4 h-4 text-cyan-400/60" />
                      </div>
                      <h3 className="text-lg font-black text-white">{sector.name}</h3>
                      <p className="text-xs text-cyan-300/80 font-mono mt-0.5">{sector.title}</p>
                      <p className="text-xs text-white/60 mt-2 leading-relaxed">{sector.desc}</p>
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/60 p-2 rounded-xl justify-center border border-white/5">
                        <span className="text-cyan-400">💎 {sector.gems}</span>
                        <span className="text-amber-400">🪙 {sector.gold}</span>
                      </div>

                      {isCompleted ? (
                        <div className="w-full py-2.5 bg-black/40 text-cyan-400/60 border border-cyan-900/40 rounded-xl text-xs uppercase font-black flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Исследовано
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenExpedition(sector)}
                          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/50 flex justify-center items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Compass className="w-4 h-4" /> Исследовать сектор
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: TEST RUN                                          */}
        {/* ======================================================== */}
        {subTab === 'TESTRUN' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/40 to-black border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
               <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-3">
                 <Swords className="w-8 h-8" /> Тестовый Забег
               </h2>
               <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                 Испытайте персонажей текущих баннеров в оптимизированных синергетических отрядах! Получите 50 Гемов за каждое первое прохождение.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRuns.map((tr) => {
                const isCompleted = completedTestRuns.includes(tr.id);
                const charSplash = getCharSplash(tr.char);
                const charName = tr.title || characterBlueprints[tr.char]?.(tr.char, 1, 0, []).name || tr.char;
                return (
                  <div key={tr.id} className="relative rounded-2xl overflow-hidden border border-white/10 group h-52">
                    <img src={charSplash} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition duration-500 scale-105 group-hover:scale-110" alt="splash" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black text-white">{charName}</h3>
                          {tr.desc && <p className="text-[10px] text-amber-300/80 font-mono">{tr.desc}</p>}
                        </div>
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

        {/* ======================================================== */}
        {/* TAB 6: VKUSNO COLLABORATION                              */}
        {/* ======================================================== */}
        {subTab === 'VKUSNO' && (
          <VkusnoCollabEvent
            profile={profile}
            updateProfile={updateProfile}
            setRoute={setRoute}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 7: UPDATE 1.3 (800 GEMS)                             */}
        {/* ======================================================== */}
        {subTab === 'UPDATE' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
            <div className="w-full bg-[#0a0a0a] border border-cyan-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-500" />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl mb-4">
                💎
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Обновление 1.3</h2>
              <p className="text-xs font-mono text-cyan-300 font-bold mb-3">«Вуаль Бездны и Песнь Прилива»</p>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Выход обновления 1.3! В игре появились новые герои (Нереус, Ива, Керн), новые сюжетные и боевые события, обновлённый баланс артефактов и испытания. Заберите 800 Камней Истока в честь обновления!
              </p>
              
              <div className="flex items-center gap-3 mb-8 bg-cyan-950/30 px-6 py-3 rounded-2xl border border-cyan-500/30">
                 <span className="text-2xl">💎</span>
                 <span className="text-2xl font-black text-cyan-300 font-mono tracking-widest">800</span>
              </div>
              
              <button 
                onClick={() => {
                  if (!profile.events?.update13Claimed) {
                    updateProfile(p => ({
                      ...p, gems: p.gems + 800, events: { ...p.events, update13Claimed: true }
                    }));
                  }
                }} 
                disabled={profile.events?.update13Claimed} 
                className={cn(
                  "w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition cursor-pointer active:scale-95 shadow-lg", 
                  profile.events?.update13Claimed 
                    ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed" 
                    : "bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 shadow-cyan-950/50"
                )}
              >
                {profile.events?.update13Claimed ? "Получено" : "Получить 💎 800"}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: LOGIN (7 DAYS)                                    */}
        {/* ======================================================== */}
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
