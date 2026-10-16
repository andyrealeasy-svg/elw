import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { 
  Sparkles, CheckCircle2, Gift, Lock,
  Swords, Play, Droplets, Zap, Flame, Shield, Skull, BookOpen,
  Waves, Anchor, RotateCcw, Award, ChevronRight, Gem, Compass,
  Eye, Trees, Flower2, Hammer, Sun, Moon, Clock, ArrowRight, RefreshCw,
  Target, Volume2
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
// EVENT 1: MAIN STORY EVENT — «ЗОВ ДИКИХ ЧАЩОБ: ТЕНЬ ДРЕВА»
// Featuring: Вайрен, Фенрис, Крона, Зефир, Аурум
// -------------------------------------------------------------
interface DialogueLine {
  speaker: string;
  charId?: string;
  text: string;
  role?: 'hero' | 'guide' | 'antagonist';
}

interface StoryStage {
  id: string;
  name: string;
  description: string;
  dialogue: DialogueLine[];
  reward: { gold: number; gems: number };
}

const wildGroveStoryStages: StoryStage[] = [
  {
    id: "grove_story_1",
    name: "Глава I: Пробуждение Древней Чащи",
    description: "Вайрен и Фенрис ощущают искажение в глубинах священных зарослей.",
    dialogue: [
      {
        speaker: "Вайрен",
        charId: "vairen",
        role: "hero",
        text: "Корни Первозданного Древа гудят от аномального резонанса... Тёмные семена раскрываются сами по себе, словно само время в чаще вышло из-под контроля."
      },
      {
        speaker: "Фенрис",
        charId: "fenris",
        role: "hero",
        text: "Ветер доносит запах озона и замерзшего железа. Звери стаи встревожены — древние тропы перекручены, а хищники теряют ориентиры."
      },
      {
        speaker: "Крона",
        charId: "krona",
        role: "guide",
        text: "Это темпоральный разлом. Кто-то нарушил ход временных колец Древа. Прошлое и будущее переплетаются с ядовитыми лозами скверны."
      },
      {
        speaker: "Вайрен",
        charId: "vairen",
        role: "hero",
        text: "Мы не позволим осквернить это святилище. Фенрис, веди по следам скверны! Нам нужно очистить корни и восстановить печать рун."
      }
    ],
    reward: { gold: 60000, gems: 200 }
  },
  {
    id: "grove_story_2",
    name: "Глава II: Хроно-След и Золотая Эгида",
    description: "Аурум и Зефир присоединяются к расследованию аномалии.",
    dialogue: [
      {
        speaker: "Зефир",
        charId: "zephyr",
        role: "guide",
        text: "Мои иллюзорные бури засекли очаги перегрузки у зеркальных озер! Электрические дуги отражаются в листве с пугающей скоростью."
      },
      {
        speaker: "Аурум",
        charId: "aurum",
        role: "guide",
        text: "Спокойствие. Моя Золотая Эгида выдержит даже падение небесных камней. Нам нужно укрепить барьеры вокруг священного ствола."
      },
      {
        speaker: "Фенрис",
        charId: "fenris",
        role: "hero",
        text: "Я нашел логово порождений! Они прячутся в узлах рун и перекусывают жилы Древа. Пора обнажить клыки и устроить Великую Охоту!"
      }
    ],
    reward: { gold: 80000, gems: 250 }
  },
  {
    id: "grove_story_3",
    name: "Глава III: Сердце Первозданной Чащи",
    description: "Финальное единение сил природы, времени и золота для исцеления Древа.",
    dialogue: [
      {
        speaker: "Крона",
        charId: "krona",
        role: "guide",
        text: "Темпоральный вектор зафиксирован! Я замедлю пульсацию скверны, давая вам окно для точного удара!"
      },
      {
        speaker: "Вайрен",
        charId: "vairen",
        role: "hero",
        text: "Тёмные Цветы распускаются в полную силу! Вся первозданная мощь Дендро сливается воедино — скверна, рассыпься прахом!"
      },
      {
        speaker: "Фенрис",
        charId: "fenris",
        role: "hero",
        text: "Добыча повержена! Лес снова дышит спокойно, и вой стаи звучит гимном победы!"
      },
      {
        speaker: "Аурум",
        charId: "aurum",
        role: "guide",
        text: "Древние жилы сияют чистым золотом. Это великий триумф единства стихий."
      }
    ],
    reward: { gold: 120000, gems: 350 }
  }
];

// Minigame 1: Combat Stages
interface GroveCombatStage {
  id: string;
  name: string;
  desc: string;
  modifier: string;
  enemies: string[];
  level: number;
  rewardGems: number;
  rewardGold: number;
}

const groveCombatStages: GroveCombatStage[] = [
  {
    id: "grove_combat_1",
    name: "Зал I: Прорастание Бутонов",
    desc: "Сразитесь с авангардом зараженных слаймов у внешних корней.",
    modifier: "Всплеск Бутонизации: Урон реакций Бутонизации увеличен на +120%, а Дендро-атаки продвигают ATB отряда на +15%.",
    enemies: ["glitch_slime", "tide", "glitch_slime"],
    level: 55,
    rewardGems: 100,
    rewardGold: 50000
  },
  {
    id: "grove_combat_2",
    name: "Зал II: Ярость Хищной Стаи",
    desc: "Отразите натиск теневых гончих в сердце тёмной чащобы.",
    modifier: "Звериный Инстинкт: Критические удары вызывают кровотечение и повышают Скорость атаки отряда на +25.",
    enemies: ["viper", "fenris", "pulse"],
    level: 70,
    rewardGems: 150,
    rewardGold: 75000
  },
  {
    id: "grove_combat_3",
    name: "Зал III: Хроно-Заморозка",
    desc: "Пробейтесь сквозь темпоральные фантомы, нарушающие ход времени.",
    modifier: "Вектор Замедления: Крио-удары и откат ATB наносят по замедленным врагам дополнительно 60 000 чистого урона.",
    enemies: ["glacier", "ice_monolith", "spark"],
    level: 85,
    rewardGems: 200,
    rewardGold: 100000
  },
  {
    id: "grove_combat_4",
    name: "Зал IV: Первозданный Титан Чащи",
    desc: "Финальный босс заражения: сокрушите древнего колосса корней!",
    modifier: "Апогей Древа: Все стихийные реакции наносят на 150% больше урона, но босс каждые 3 хода призывает шипы.",
    enemies: ["boss_colossus", "gaia"],
    level: 95,
    rewardGems: 300,
    rewardGold: 150000
  }
];

// Minigame 2: Lianes / Node Energy Puzzle Levels
interface VinePuzzleLevel {
  id: string;
  name: string;
  desc: string;
  gridSize: number;
  initialNodes: number[]; // 0: 0deg, 1: 90deg, 2: 180deg, 3: 270deg
  correctNodes: number[]; // solution
  gems: number;
  gold: number;
}

const vinePuzzleLevels: VinePuzzleLevel[] = [
  {
    id: "vine_lvl_1",
    name: "Узел I: Изумрудный Исток",
    desc: "Поверните узлы рунных лоз, чтобы направить живительный сок от Истока к Первому Бутону.",
    gridSize: 3,
    initialNodes: [1, 2, 0, 3, 1, 0, 2, 0, 1],
    correctNodes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    gems: 100,
    gold: 50000
  },
  {
    id: "vine_lvl_2",
    name: "Узел II: Лазурный Приток",
    desc: "Сформируйте непрерывный контур гидро-энергии для распускания кувшинки.",
    gridSize: 3,
    initialNodes: [2, 1, 3, 0, 2, 1, 3, 1, 2],
    correctNodes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    gems: 120,
    gold: 60000
  },
  {
    id: "vine_lvl_3",
    name: "Узел III: Грозовая Развязка",
    desc: "Сложное переплетение корней: стабилизируйте электро-импульсы чащи.",
    gridSize: 3,
    initialNodes: [3, 0, 1, 2, 3, 0, 1, 2, 3],
    correctNodes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    gems: 150,
    gold: 80000
  },
  {
    id: "vine_lvl_4",
    name: "Узел IV: Сердце Первозданного Древа",
    desc: "Финальная синхронизация всех стихийных потоков для пробуждения Древа Жизни!",
    gridSize: 3,
    initialNodes: [1, 3, 2, 0, 1, 3, 2, 0, 1],
    correctNodes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    gems: 200,
    gold: 100000
  }
];

// Minigame 3: Hunting Tracking Memory Match
interface HuntingLevel {
  id: string;
  name: string;
  desc: string;
  pairsCount: number;
  gems: number;
  gold: number;
}

const huntingLevels: HuntingLevel[] = [
  { id: "hunt_lvl_1", name: "Тропа I: Следы Молодого Волка", desc: "Найдите парные звериные следы в подлеске.", pairsCount: 3, gems: 80, gold: 40000 },
  { id: "hunt_lvl_2", name: "Тропа II: Охотничьи Угодья Стаи", desc: "Сконцентрируйте зрение: парные тотемы зверей чащи.", pairsCount: 4, gems: 100, gold: 50000 },
  { id: "hunt_lvl_3", name: "Тропа III: Заповедный Грот", desc: "Редкие реликты и следы древних хищников.", pairsCount: 5, gems: 140, gold: 70000 },
  { id: "hunt_lvl_4", name: "Тропа IV: Владыка Великой Охоты", desc: "Мастерский след Фенриса: раскройте все тайные знаки!", pairsCount: 6, gems: 180, gold: 90000 },
];

const HUNT_ICONS = ["🐺", "🏹", "🐾", "🦌", "🦅", "🐗", "🌲", "💎"];

export default function EventsMenu({ profile, updateProfile, setRoute }: Props) {
  const [subTab, setSubTab] = useState<'WILD_GROVE' | 'TACHYON_MAZE' | 'PRISM_REFRACTOR' | 'GOLDEN_FORGE' | 'TESTRUN' | 'VKUSNO' | 'UPDATE' | 'LOGIN'>('WILD_GROVE');
  const [groveSection, setGroveSection] = useState<'STORY' | 'COMBAT' | 'VINES' | 'HUNTING'>('STORY');

  // Story Dialogue State
  const [activeStoryStage, setActiveStoryStage] = useState<StoryStage | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Vine Puzzle State
  const [activeVineLevel, setActiveVineLevel] = useState<VinePuzzleLevel | null>(null);
  const [currentVineRotations, setCurrentVineRotations] = useState<number[]>([]);
  const [vineSolved, setVineSolved] = useState(false);

  // Hunting Game State
  const [activeHuntLevel, setActiveHuntLevel] = useState<HuntingLevel | null>(null);
  const [huntCards, setHuntCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [huntWon, setHuntWon] = useState(false);

  // Tachyon Maze State
  const [mazeLevel, setMazeLevel] = useState(0);
  const [mazePhase, setMazePhase] = useState<'PAST' | 'PRESENT' | 'FUTURE'>('PRESENT');
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mazeWon, setMazeWon] = useState(false);

  // Prism Refractor State
  const [refractorLevel, setRefractorLevel] = useState(0);
  const [mirrors, setMirrors] = useState<number[]>([0, 1, 2, 3]); // angles in increments of 90deg
  const [refractorWon, setRefractorWon] = useState(false);

  // Golden Forge State
  const [forgeTier, setForgeTier] = useState(0);
  const [hammerPower, setHammerPower] = useState(50);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [forgeSuccess, setForgeSuccess] = useState(false);

  // Dates & Checks
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper getters
  const eventsData = profile.events || {};
  const completedStoryStages: string[] = eventsData.wildGroveStory || [];
  const completedCombatStages: string[] = eventsData.wildGroveCombat || [];
  const completedVineLevels: string[] = eventsData.wildGroveVines || [];
  const completedHuntLevels: string[] = eventsData.wildGroveHunting || [];
  const completedTachyonLevels: number[] = eventsData.tachyonMazeCompleted || [];
  const completedPrismLevels: number[] = eventsData.prismRefractorCompleted || [];
  const completedForgeTiers: number[] = eventsData.goldenForgeCompleted || [];

  // ==========================================
  // STORY DIALOGUE HANDLER
  // ==========================================
  const handleFinishDialogue = () => {
    if (!activeStoryStage) return;
    const stageId = activeStoryStage.id;
    if (!completedStoryStages.includes(stageId)) {
      updateProfile(p => ({
        ...p,
        gems: p.gems + activeStoryStage.reward.gems,
        gold: p.gold + activeStoryStage.reward.gold,
        events: {
          ...p.events,
          wildGroveStory: [...(p.events?.wildGroveStory || []), stageId]
        }
      }));
    }
    setActiveStoryStage(null);
    setDialogueIndex(0);
  };

  // ==========================================
  // COMBAT LAUNCHER
  // ==========================================
  const handleStartGroveBattle = (stage: GroveCombatStage) => {
    const isCompleted = completedCombatStages.includes(stage.id);
    setRoute({
      type: 'TRIAL_BATTLE',
      trialId: 10,
      title: `ЧАЩА: ${stage.name}`,
      rewardGems: isCompleted ? 0 : stage.rewardGems,
      rewardGold: isCompleted ? 0 : stage.rewardGold,
      testId: stage.id,
      isTestRun: false,
      team: profile.team
    });
  };

  // ==========================================
  // VINE PUZZLE CONTROLLER
  // ==========================================
  const handleStartVineLevel = (lvl: VinePuzzleLevel) => {
    setActiveVineLevel(lvl);
    setCurrentVineRotations([...lvl.initialNodes]);
    setVineSolved(false);
  };

  const handleRotateNode = (index: number) => {
    if (!activeVineLevel || vineSolved) return;
    setCurrentVineRotations(prev => {
      const next = [...prev];
      next[index] = (next[index] + 1) % 4;
      
      // Check win condition (all rotated to 0 or matching orientation)
      const allAligned = next.every(val => val === 0);
      if (allAligned) {
        setVineSolved(true);
        setTimeout(() => {
          const nextDone = [...completedVineLevels, activeVineLevel.id];
          updateProfile(p => ({
            ...p,
            gems: p.gems + activeVineLevel.gems,
            gold: p.gold + activeVineLevel.gold,
            events: { ...p.events, wildGroveVines: nextDone }
          }));
        }, 800);
      }
      return next;
    });
  };

  // ==========================================
  // HUNTING MEMORY MATCH CONTROLLER
  // ==========================================
  const handleStartHuntLevel = (lvl: HuntingLevel) => {
    setActiveHuntLevel(lvl);
    setHuntWon(false);
    setSelectedCards([]);

    const chosenIcons = HUNT_ICONS.slice(0, lvl.pairsCount);
    const deck = [...chosenIcons, ...chosenIcons]
      .sort(() => Math.random() - 0.5)
      .map((sym, idx) => ({ id: idx, symbol: sym, flipped: false, matched: false }));

    setHuntCards(deck);
  };

  const handleFlipHuntCard = (index: number) => {
    if (huntCards[index].flipped || huntCards[index].matched || selectedCards.length >= 2 || huntWon) return;

    const nextCards = [...huntCards];
    nextCards[index].flipped = true;
    setHuntCards(nextCards);

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      const [first, second] = nextSelected;
      if (nextCards[first].symbol === nextCards[second].symbol) {
        nextCards[first].matched = true;
        nextCards[second].matched = true;
        setSelectedCards([]);

        // Check if all matched
        if (nextCards.every(c => c.matched) && activeHuntLevel) {
          setHuntWon(true);
          setTimeout(() => {
            const nextDone = [...completedHuntLevels, activeHuntLevel.id];
            updateProfile(p => ({
              ...p,
              gems: p.gems + activeHuntLevel.gems,
              gold: p.gold + activeHuntLevel.gold,
              events: { ...p.events, wildGroveHunting: nextDone }
            }));
          }, 700);
        }
      } else {
        setTimeout(() => {
          nextCards[first].flipped = false;
          nextCards[second].flipped = false;
          setHuntCards([...nextCards]);
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  // ==========================================
  // EVENT 2: TACHYON MAZE CONTROLLER
  // ==========================================
  const TACHYON_LEVELS = [
    { id: 0, name: "Хроно-Врата I: Точка Отсчета", targetX: 3, targetY: 2, gems: 100, gold: 50000 },
    { id: 1, name: "Хроно-Врата II: Парадокс Прошлого", targetX: 4, targetY: 3, gems: 120, gold: 60000 },
    { id: 2, name: "Хроно-Врата III: Временная Петля", targetX: 3, targetY: 4, gems: 150, gold: 80000 },
    { id: 3, name: "Хроно-Врата IV: Сингулярность Кроны", targetX: 4, targetY: 4, gems: 200, gold: 100000 }
  ];

  const handleMovePlayer = (dx: number, dy: number) => {
    if (mazeWon) return;
    const currentTarget = TACHYON_LEVELS[mazeLevel];
    const newX = Math.max(0, Math.min(4, playerPos.x + dx));
    const newY = Math.max(0, Math.min(4, playerPos.y + dy));
    setPlayerPos({ x: newX, y: newY });

    if (newX === currentTarget.targetX && newY === currentTarget.targetY) {
      setMazeWon(true);
      setTimeout(() => {
        const nextDone = [...completedTachyonLevels, mazeLevel];
        updateProfile(p => ({
          ...p,
          gems: p.gems + currentTarget.gems,
          gold: p.gold + currentTarget.gold,
          events: { ...p.events, tachyonMazeCompleted: nextDone }
        }));
      }, 700);
    }
  };

  // ==========================================
  // EVENT 3: PRISM REFRACTOR CONTROLLER
  // ==========================================
  const PRISM_LEVELS = [
    { id: 0, name: "Призма I: Алое Преломление", targetAngle: 1, gems: 100, gold: 50000 },
    { id: 1, name: "Призма II: Золотой Луч", targetAngle: 2, gems: 120, gold: 60000 },
    { id: 2, name: "Призма III: Грозовой Спектр", targetAngle: 3, gems: 150, gold: 80000 },
    { id: 3, name: "Призма IV: Вспышка Рассвета", targetAngle: 0, gems: 200, gold: 100000 }
  ];

  const handleRotatePrismMirror = (idx: number) => {
    if (refractorWon) return;
    const next = [...mirrors];
    next[idx] = (next[idx] + 1) % 4;
    setMirrors(next);

    const target = PRISM_LEVELS[refractorLevel];
    if (next[refractorLevel % next.length] === target.targetAngle) {
      setRefractorWon(true);
      setTimeout(() => {
        const nextDone = [...completedPrismLevels, refractorLevel];
        updateProfile(p => ({
          ...p,
          gems: p.gems + target.gems,
          gold: p.gold + target.gold,
          events: { ...p.events, prismRefractorCompleted: nextDone }
        }));
      }, 700);
    }
  };

  // ==========================================
  // EVENT 4: GOLDEN FORGE CONTROLLER
  // ==========================================
  const FORGE_TIERS = [
    { id: 0, name: "Ковка I: Меч Закалённого Золота", targetRange: [40, 60], gems: 100, gold: 60000 },
    { id: 1, name: "Ковка II: Щит Несокрушимой Эгиды", targetRange: [45, 65], gems: 120, gold: 80000 },
    { id: 2, name: "Ковка III: Корона Тектонического Титана", targetRange: [48, 62], gems: 150, gold: 100000 },
    { id: 3, name: "Ковка IV: Шедевр Магистра Аурума", targetRange: [49, 58], gems: 200, gold: 150000 }
  ];

  const handleHammerStrike = () => {
    if (forgeSuccess) return;
    const tier = FORGE_TIERS[forgeTier];
    const isPerfect = hammerPower >= tier.targetRange[0] && hammerPower <= tier.targetRange[1];
    const gain = isPerfect ? 35 : 15;
    const newProgress = Math.min(100, forgeProgress + gain);
    setForgeProgress(newProgress);

    if (newProgress >= 100) {
      setForgeSuccess(true);
      setTimeout(() => {
        const nextDone = [...completedForgeTiers, forgeTier];
        updateProfile(p => ({
          ...p,
          gems: p.gems + tier.gems,
          gold: p.gold + tier.gold,
          events: { ...p.events, goldenForgeCompleted: nextDone }
        }));
      }, 700);
    }
  };

  // ==========================================
  // EVENT 5: TEST RUN (ACCORDING TO BANNERS)
  // Squads strictly following user's instructions:
  // Вайрен: Вайрен + Фенрис + Нереус + Авелин
  // Зефир: Зефир + Инеффа + Эгида + Рикс
  // Аурум: Аурум + Инеффа + Нейрон + Рикс
  // Крона: Крона + Аэлита + Ива + Гайя
  // ==========================================
  const testRuns = [
    { 
      id: 'test_vairen', 
      char: 'vairen', 
      title: 'Вайрен',
      desc: 'Сердце Древнего Леса • Тёмные Семена & Цветы',
      team: ['vairen', 'fenris', 'nereus', 'aveline'] 
    },
    { 
      id: 'test_zephyr', 
      char: 'zephyr', 
      title: 'Зефир',
      desc: 'Грозовая Призма • Ускорение Отражения',
      team: ['zephyr', 'ineffa', 'aegis', 'rix'] 
    },
    { 
      id: 'test_aurum', 
      char: 'aurum', 
      title: 'Аурум',
      desc: 'Золотая Эгида • Тектонический Щит & Крит-Бафф',
      team: ['aurum', 'ineffa', 'neuron', 'rix'] 
    },
    { 
      id: 'test_krona', 
      char: 'krona', 
      title: 'Крона',
      desc: 'Вектор Времени • Крио-Застой & Темпоральный Сдвиг',
      team: ['krona', 'aelita', 'iva', 'gaia'] 
    },
  ];

  const completedTestRuns: string[] = eventsData.completedTestRuns || [];

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
  const lastLoginDate = eventsData.initLastClaimDay || "";
  const loginStreak = eventsData.initStreak || 0;
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
        
        {/* NEW MAIN STORY EVENT: WILD GROVE */}
        <button 
          onClick={() => setSubTab('WILD_GROVE')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'WILD_GROVE' 
              ? "bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-200 border-emerald-500/50 shadow-lg shadow-emerald-950/50" 
              : "bg-[#0b1812] text-white/80 hover:bg-[#0f281d] hover:text-white border-emerald-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Trees className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-black bg-emerald-400 px-1.5 py-0.2 rounded font-mono">Основное</span>
              <span className="text-[9px] text-emerald-400/80 font-bold truncate">Сюжет + 3 Игры</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Зов Диких Чащоб</div>
          </div>
        </button>

        {/* NEW EVENT 2: TACHYON MAZE (KRONA) */}
        <button 
          onClick={() => setSubTab('TACHYON_MAZE')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'TACHYON_MAZE' 
              ? "bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-200 border-cyan-500/50 shadow-lg shadow-cyan-950/50" 
              : "bg-[#0b161c] text-white/80 hover:bg-[#10222b] hover:text-white border-cyan-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-black bg-cyan-400 px-1.5 py-0.2 rounded font-mono">Головоломка</span>
              <span className="text-[9px] text-cyan-400/80 font-bold truncate">Хроно-Сдвиг</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Тахионный Лабиринт</div>
          </div>
        </button>

        {/* NEW EVENT 3: PRISM REFRACTOR (INEFFA & ZEPHYR) */}
        <button 
          onClick={() => setSubTab('PRISM_REFRACTOR')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'PRISM_REFRACTOR' 
              ? "bg-gradient-to-r from-rose-950 to-purple-950 text-rose-200 border-rose-500/50 shadow-lg shadow-rose-950/50" 
              : "bg-[#180d14] text-white/80 hover:bg-[#261320] hover:text-white border-rose-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4 text-rose-300" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-rose-500 px-1.5 py-0.2 rounded font-mono">Оптика</span>
              <span className="text-[9px] text-rose-400/80 font-bold truncate">Отражение</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Зеркальная Призма</div>
          </div>
        </button>

        {/* NEW EVENT 4: GOLDEN FORGE (AURUM) */}
        <button 
          onClick={() => setSubTab('GOLDEN_FORGE')} 
          className={cn(
            "flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold transition shrink-0 relative overflow-hidden border",
            subTab === 'GOLDEN_FORGE' 
              ? "bg-gradient-to-r from-amber-950 to-yellow-950 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-950/50" 
              : "bg-[#1a140b] text-white/80 hover:bg-[#281e0f] hover:text-white border-amber-900/30"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Hammer className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-black bg-amber-400 px-1.5 py-0.2 rounded font-mono">Кузница</span>
              <span className="text-[9px] text-amber-400/80 font-bold truncate">Реликвии</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white">Золотая Кузня</div>
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

        {/* UPDATE 1.4 */}
        <button 
          onClick={() => setSubTab('UPDATE')} 
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition shrink-0", 
            subTab === 'UPDATE' ? "bg-emerald-600 text-white" : "text-white/50 hover:bg-[#1a1a1a]/50"
          )}
        >
          <Gift className="w-4 h-4" /> Обновление 1.4
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
        {/* TAB 1: WILD GROVE (MAIN STORY & 3 MINIGAMES)             */}
        {/* ======================================================== */}
        {subTab === 'WILD_GROVE' && (
          <div className="space-y-6 max-w-4xl mx-auto relative h-full">
            {/* Story Dialogue Modal */}
            {activeStoryStage && (
              <div className="fixed inset-0 z-[100] bg-black/95 p-4 sm:p-8 flex flex-col justify-end animate-in fade-in">
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                   {activeStoryStage.dialogue[dialogueIndex]?.charId && (
                     <div className="relative flex items-center justify-center max-h-[65vh]">
                       <img 
                         src={getCharSplash(activeStoryStage.dialogue[dialogueIndex].charId!) || ''} 
                         className="max-h-[65vh] object-contain opacity-80 animate-in zoom-in-95 duration-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]"
                         alt="Speaker splash"
                       />
                     </div>
                   )}
                </div>

                <div className="bg-[#0f1d16] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto w-full relative shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3">
                       <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                         {activeStoryStage.dialogue[dialogueIndex]?.role === 'hero' ? 'Хранитель Чащи' : 'Союзник'}
                       </span>
                       <h4 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                         {activeStoryStage.dialogue[dialogueIndex]?.speaker || "..."}
                       </h4>
                     </div>
                     <span className="text-xs font-mono text-white/40">
                       Реплика {dialogueIndex + 1} из {activeStoryStage.dialogue.length}
                     </span>
                   </div>

                   <p className="text-base sm:text-lg text-white/90 leading-relaxed font-sans min-h-[70px]">
                     {activeStoryStage.dialogue[dialogueIndex]?.text}
                   </p>

                   <div className="mt-6 flex justify-end gap-3">
                     <button 
                       onClick={() => {
                         if (dialogueIndex < activeStoryStage.dialogue.length - 1) {
                           setDialogueIndex(prev => prev + 1);
                         } else {
                           handleFinishDialogue();
                         }
                       }}
                       className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase rounded-2xl tracking-widest transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95"
                     >
                       {dialogueIndex < activeStoryStage.dialogue.length - 1 ? 'Далее' : 'Завершить главу'} <ChevronRight className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#0e241b] to-[#121f24] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                   <Trees className="w-4 h-4 animate-bounce" /> Главное Событие Версии 1.4
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                   Зов Диких Чащоб: Тень Первозданного Древа
                 </h2>
                 <p className="text-sm text-emerald-100/70 mt-2 max-w-2xl leading-relaxed">
                   Древнее Древо пробуждается! Исследуйте сюжетные главы вместе с <strong className="text-emerald-300">Вайреном</strong>, <strong className="text-amber-300">Фенрисом</strong>, <strong className="text-cyan-300">Кроной</strong>, <strong className="text-purple-300">Зефиром</strong> и <strong className="text-yellow-300">Аурумом</strong>! Пройдите 3 мини-игры: очищайте корни в битвах, соединяйте руны лоз и выслеживайте редкую дичь!
                 </p>
                 <div className="mt-4 flex flex-wrap gap-3">
                   <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                     <Gem className="w-4 h-4 text-emerald-400" /> Награды события: <span className="text-emerald-300 font-black">2 400 💎</span>
                   </div>
                   <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-400">
                     🪙 1 200 000 Золота
                   </div>
                 </div>
               </div>
            </div>

            {/* Sub-navigation inside Main Event */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
              <button
                onClick={() => setGroveSection('STORY')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 flex items-center gap-2",
                  groveSection === 'STORY' ? "bg-emerald-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <BookOpen className="w-4 h-4" /> 1. Сюжет
              </button>
              <button
                onClick={() => setGroveSection('COMBAT')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 flex items-center gap-2",
                  groveSection === 'COMBAT' ? "bg-rose-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <Swords className="w-4 h-4" /> 2. Битвы: Очищение Корней
              </button>
              <button
                onClick={() => setGroveSection('VINES')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 flex items-center gap-2",
                  groveSection === 'VINES' ? "bg-teal-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <Flower2 className="w-4 h-4" /> 3. Руны: Сплетение Лоз
              </button>
              <button
                onClick={() => setGroveSection('HUNTING')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 flex items-center gap-2",
                  groveSection === 'HUNTING' ? "bg-amber-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <Target className="w-4 h-4" /> 4. Охота: След Хищника
              </button>
            </div>

            {/* SECTION 1: STORY CHAPTERS */}
            {groveSection === 'STORY' && (
              <div className="space-y-4">
                {wildGroveStoryStages.map((stage, idx) => {
                  const isCompleted = completedStoryStages.includes(stage.id);
                  const isUnlocked = idx === 0 || completedStoryStages.includes(wildGroveStoryStages[idx - 1].id);

                  return (
                    <div 
                      key={stage.id} 
                      className={cn(
                        "p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden",
                        isCompleted 
                          ? "bg-[#0c1812]/60 border-emerald-900/30 opacity-80" 
                          : isUnlocked 
                            ? "bg-gradient-to-r from-[#0d2218] to-[#121d18] border-emerald-500/50 shadow-lg shadow-emerald-950/40 hover:border-emerald-400" 
                            : "bg-[#0c0f12] border-white/5 opacity-50"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-black text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                                Глава {idx + 1}
                              </span>
                              <h3 className="text-lg sm:text-xl font-black text-white">{stage.name}</h3>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">
                              {isUnlocked ? stage.description : "Пройдите предыдущую главу для разблокировки..."}
                            </p>
                         </div>
                         
                         <div className="flex flex-col sm:items-end justify-center shrink-0 space-y-3 w-full sm:w-auto">
                            <div className="flex items-center gap-3 font-mono text-xs font-bold bg-black/60 px-3.5 py-2 rounded-xl border border-white/10">
                              <span className="text-cyan-400 flex items-center gap-1">💎 {stage.reward.gems}</span>
                              <span className="text-amber-400 flex items-center gap-1">🪙 {stage.reward.gold}</span>
                            </div>

                            {isCompleted ? (
                              <button className="w-full sm:w-auto px-6 py-2.5 bg-black/40 text-emerald-400/60 border border-emerald-900/40 rounded-xl text-xs uppercase font-black flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Пройдено
                              </button>
                            ) : isUnlocked ? (
                              <button 
                                onClick={() => { setActiveStoryStage(stage); setDialogueIndex(0); }} 
                                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black uppercase rounded-xl tracking-wider text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                              >
                                Читать главу <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="px-6 py-2.5 text-white/30 text-xs font-mono uppercase flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Закрыто
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SECTION 2: COMBAT MINIGAME (ОЧИЩЕНИЕ КОРНЕЙ) */}
            {groveSection === 'COMBAT' && (
              <div className="space-y-4">
                <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex items-center gap-3">
                  <Swords className="w-5 h-5 text-rose-400 shrink-0" />
                  <p className="text-xs text-rose-200">
                    Боевая мини-игра: сокрушите волны оскверненных порождений! Используйте благословения стихий Дендро, Крио и Физ. урона для быстрого прохождения.
                  </p>
                </div>
                {groveCombatStages.map((stg, i) => {
                  const isDone = completedCombatStages.includes(stg.id);
                  return (
                    <div key={stg.id} className="p-5 bg-[#120f12] border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">УР. {stg.level}</span>
                          <h4 className="text-base font-bold text-white">{stg.name}</h4>
                        </div>
                        <p className="text-xs text-white/50">{stg.desc}</p>
                        <p className="text-xs text-amber-300 font-mono bg-black/40 p-2 rounded-xl border border-white/5">{stg.modifier}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-xs font-mono font-bold text-cyan-400 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                          💎 {stg.rewardGems}
                        </div>
                        <button
                          onClick={() => handleStartGroveBattle(stg)}
                          className={cn(
                            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition",
                            isDone ? "bg-white/10 text-white/70" : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50"
                          )}
                        >
                          {isDone ? "Повторить бой" : "Вступить в бой"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SECTION 3: VINES ROTATION PUZZLE */}
            {groveSection === 'VINES' && (
              <div className="space-y-6">
                <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-2xl flex items-center gap-3">
                  <Flower2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <p className="text-xs text-teal-200">
                    Интерактивная мини-игра: кликайте по руническим узлам, чтобы поворачивать энергетические лозы и соединить поток жизни Древа (приведите все узлы к истинной ориентации 0°).
                  </p>
                </div>

                {activeVineLevel ? (
                  <div className="p-6 bg-[#0c1618] border-2 border-teal-500/40 rounded-3xl space-y-6 max-w-md mx-auto text-center">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-base font-bold text-white">{activeVineLevel.name}</h4>
                      <button onClick={() => setActiveVineLevel(null)} className="text-xs text-white/40 hover:text-white">Назад</button>
                    </div>

                    <p className="text-xs text-teal-300">{activeVineLevel.desc}</p>

                    {/* Interactive 3x3 Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-black/50 rounded-2xl border border-teal-500/20 max-w-xs mx-auto">
                      {currentVineRotations.map((rot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRotateNode(idx)}
                          className={cn(
                            "aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all active:scale-95 cursor-pointer shadow-md",
                            rot === 0 
                              ? "bg-teal-500/20 border-teal-400 text-teal-300 shadow-teal-500/20" 
                              : "bg-black/60 border-white/15 text-white/40 hover:border-teal-500/50"
                          )}
                          style={{ transform: `rotate(${rot * 90}deg)` }}
                        >
                          🌿
                        </button>
                      ))}
                    </div>

                    {vineSolved ? (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs animate-bounce">
                        ✓ Поток синхронизирован! Получено 💎 {activeVineLevel.gems}!
                      </div>
                    ) : (
                      <div className="text-[11px] text-white/40">
                        Кликайте по плиткам лоз, пока все ростки не встанут ровно!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vinePuzzleLevels.map((lvl) => {
                      const isDone = completedVineLevels.includes(lvl.id);
                      return (
                        <div key={lvl.id} className="p-5 bg-[#0d161a] border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-white">{lvl.name}</h4>
                              {isDone && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                            </div>
                            <p className="text-xs text-white/50">{lvl.desc}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs font-mono font-bold text-cyan-400">💎 {lvl.gems}</span>
                            <button
                              onClick={() => handleStartVineLevel(lvl)}
                              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase transition"
                            >
                              {isDone ? "Повторить" : "Решить"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: HUNTING MEMORY MATCH */}
            {groveSection === 'HUNTING' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                  <Target className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-200">
                    Интерактивная мини-игра: чутьё хищника Фенриса! Переворачивайте плитки подлеска и находите парные знаки зверей чащи без ошибок.
                  </p>
                </div>

                {activeHuntLevel ? (
                  <div className="p-6 bg-[#16120b] border-2 border-amber-500/40 rounded-3xl space-y-6 max-w-md mx-auto text-center">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-base font-bold text-white">{activeHuntLevel.name}</h4>
                      <button onClick={() => setActiveHuntLevel(null)} className="text-xs text-white/40 hover:text-white">Назад</button>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 p-4 bg-black/60 rounded-2xl border border-amber-500/20">
                      {huntCards.map((c, i) => (
                        <button
                          key={c.id}
                          onClick={() => handleFlipHuntCard(i)}
                          className={cn(
                            "aspect-square rounded-xl border flex items-center justify-center text-xl transition-all active:scale-95 cursor-pointer",
                            c.matched 
                              ? "bg-amber-500/30 border-amber-400 opacity-80" 
                              : c.flipped 
                                ? "bg-amber-600/20 border-amber-500 text-white" 
                                : "bg-white/5 border-white/10 hover:border-amber-400/50"
                          )}
                        >
                          {(c.flipped || c.matched) ? c.symbol : "🐾"}
                        </button>
                      ))}
                    </div>

                    {huntWon ? (
                      <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-xs animate-bounce">
                        ✓ След взят! Награда: 💎 {activeHuntLevel.gems}!
                      </div>
                    ) : (
                      <div className="text-[11px] text-white/40">
                        Найдите все одинаковые пары следов!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {huntingLevels.map((lvl) => {
                      const isDone = completedHuntLevels.includes(lvl.id);
                      return (
                        <div key={lvl.id} className="p-5 bg-[#18130c] border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-white">{lvl.name}</h4>
                              {isDone && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                            </div>
                            <p className="text-xs text-white/50">{lvl.desc}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs font-mono font-bold text-amber-400">💎 {lvl.gems}</span>
                            <button
                              onClick={() => handleStartHuntLevel(lvl)}
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase transition"
                            >
                              {isDone ? "Повторить" : "Выследить"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* EVENT 2: TACHYON MAZE (KRONA)                            */}
        {/* ======================================================== */}
        {subTab === 'TACHYON_MAZE' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-cyan-950 via-[#0c1f26] to-black border border-cyan-500/40 rounded-3xl p-6 relative overflow-hidden">
              <h2 className="text-2xl font-black text-cyan-300 uppercase tracking-tight flex items-center gap-3">
                <Clock className="w-7 h-7 text-cyan-400 animate-spin" /> Тахионный Лабиринт Кроны
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100/70 mt-2 leading-relaxed">
                Интерактивная темпоральная головоломка: переключайте фазы времени (Прошлое, Настоящее, Будущее), чтобы преодолеть барьеры и довести сферу времени до выхода!
              </p>
            </div>

            <div className="p-6 bg-[#0b161c] border border-cyan-500/30 rounded-3xl space-y-6 text-center">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-cyan-300">{TACHYON_LEVELS[mazeLevel].name}</span>
                <span className="text-xs font-mono text-cyan-400">💎 {TACHYON_LEVELS[mazeLevel].gems}</span>
              </div>

              {/* Phase Switcher */}
              <div className="flex justify-center gap-2">
                {(['PAST', 'PRESENT', 'FUTURE'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setMazePhase(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition",
                      mazePhase === p ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    {p === 'PAST' ? '⏪ Прошлое' : p === 'PRESENT' ? '⏸️ Настоящее' : '⏩ Будущее'}
                  </button>
                ))}
              </div>

              {/* 5x5 Maze Grid */}
              <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto p-3 bg-black/60 rounded-2xl border border-cyan-500/20">
                {Array.from({ length: 25 }).map((_, i) => {
                  const x = i % 5;
                  const y = Math.floor(i / 5);
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const isTarget = TACHYON_LEVELS[mazeLevel].targetX === x && TACHYON_LEVELS[mazeLevel].targetY === y;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-xl border flex items-center justify-center text-sm font-mono font-bold transition",
                        isPlayer 
                          ? "bg-cyan-400 text-black border-cyan-300 scale-105 shadow-md shadow-cyan-400/50" 
                          : isTarget 
                            ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse" 
                            : mazePhase === 'PAST' && (x + y) % 3 === 0
                              ? "bg-blue-950/40 border-blue-900/40 opacity-40"
                              : mazePhase === 'FUTURE' && (x * y) % 2 === 1
                                ? "bg-cyan-950/40 border-cyan-900/40 opacity-50"
                                : "bg-white/5 border-white/5 text-white/20"
                      )}
                    >
                      {isPlayer ? "⏳" : isTarget ? "🚪" : ""}
                    </div>
                  );
                })}
              </div>

              {/* Direction controls */}
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => handleMovePlayer(0, -1)} className="w-12 h-10 bg-white/10 hover:bg-white/20 rounded-xl font-bold">▲</button>
                <div className="flex gap-2">
                  <button onClick={() => handleMovePlayer(-1, 0)} className="w-12 h-10 bg-white/10 hover:bg-white/20 rounded-xl font-bold">◀</button>
                  <button onClick={() => handleMovePlayer(0, 1)} className="w-12 h-10 bg-white/10 hover:bg-white/20 rounded-xl font-bold">▼</button>
                  <button onClick={() => handleMovePlayer(1, 0)} className="w-12 h-10 bg-white/10 hover:bg-white/20 rounded-xl font-bold">▶</button>
                </div>
              </div>

              {mazeWon && (
                <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-300 font-bold text-xs animate-bounce">
                  ✓ Выход найден! Пройдено!
                  {mazeLevel < TACHYON_LEVELS.length - 1 && (
                    <button 
                      onClick={() => { setMazeLevel(prev => prev + 1); setPlayerPos({ x: 0, y: 0 }); setMazeWon(false); }}
                      className="ml-3 px-3 py-1 bg-cyan-500 text-black rounded-lg text-xs"
                    >
                      Следующий уровень
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EVENT 3: PRISM REFRACTOR (INEFFA & ZEPHYR)               */}
        {/* ======================================================== */}
        {subTab === 'PRISM_REFRACTOR' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-rose-950 via-[#1f0e1a] to-black border border-rose-500/40 rounded-3xl p-6 relative overflow-hidden">
              <h2 className="text-2xl font-black text-rose-300 uppercase tracking-tight flex items-center gap-3">
                <Sun className="w-7 h-7 text-rose-400 animate-spin" /> Зеркальная Призма Инеффы
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/70 mt-2 leading-relaxed">
                Интерактивная световая головоломка: вращайте отражающие зеркала, чтобы направить луч рассветного солнца в призматический резонатор!
              </p>
            </div>

            <div className="p-6 bg-[#180e15] border border-rose-500/30 rounded-3xl space-y-6 text-center">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-rose-300">{PRISM_LEVELS[refractorLevel].name}</span>
                <span className="text-xs font-mono text-rose-400">💎 {PRISM_LEVELS[refractorLevel].gems}</span>
              </div>

              {/* Interactive Reflector Discs */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto p-4 bg-black/60 rounded-2xl border border-rose-500/20">
                {mirrors.map((angle, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRotatePrismMirror(idx)}
                    className="aspect-square bg-gradient-to-br from-rose-950/60 to-purple-950/60 border-2 border-rose-500/40 hover:border-rose-400 rounded-2xl flex flex-col items-center justify-center p-2 transition active:scale-95 cursor-pointer shadow-lg"
                  >
                    <div 
                      className="text-3xl transition-transform duration-300" 
                      style={{ transform: `rotate(${angle * 90}deg)` }}
                    >
                      🪞
                    </div>
                    <span className="text-[10px] font-mono text-rose-300 mt-1">{angle * 90}°</span>
                  </button>
                ))}
              </div>

              {refractorWon ? (
                <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300 font-bold text-xs animate-bounce">
                  ✓ Призма резонирует! Получено 💎 {PRISM_LEVELS[refractorLevel].gems}!
                  {refractorLevel < PRISM_LEVELS.length - 1 && (
                    <button 
                      onClick={() => { setRefractorLevel(prev => prev + 1); setRefractorWon(false); }}
                      className="ml-3 px-3 py-1 bg-rose-500 text-black rounded-lg text-xs font-bold"
                    >
                      Далее
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40">
                  Кликайте по зеркалам, чтобы поймать фокус луча рассвета!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EVENT 4: GOLDEN FORGE (AURUM)                            */}
        {/* ======================================================== */}
        {subTab === 'GOLDEN_FORGE' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-amber-950 via-[#26180a] to-black border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden">
              <h2 className="text-2xl font-black text-amber-300 uppercase tracking-tight flex items-center gap-3">
                <Hammer className="w-7 h-7 text-amber-400" /> Золотая Кузня Аурума
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/70 mt-2 leading-relaxed">
                Интерактивная кузнечная мастерская: управляйте силой молота, попадайте в диапазон идеальной ковки и создавайте шедевры для каравана купцов!
              </p>
            </div>

            <div className="p-6 bg-[#161009] border border-amber-500/30 rounded-3xl space-y-6 text-center">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-amber-300">{FORGE_TIERS[forgeTier].name}</span>
                <span className="text-xs font-mono text-amber-400">💎 {FORGE_TIERS[forgeTier].gems}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-white/50">
                  <span>Готовность реликвии</span>
                  <span className="text-amber-400 font-bold">{forgeProgress}%</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300" style={{ width: `${forgeProgress}%` }} />
                </div>
              </div>

              {/* Power Slider */}
              <div className="p-4 bg-black/50 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/40">Сила удара молота:</span>
                  <span className="text-amber-300 font-bold">{hammerPower}% (Цель: {FORGE_TIERS[forgeTier].targetRange[0]}-{FORGE_TIERS[forgeTier].targetRange[1]}%)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={hammerPower} 
                  onChange={(e) => setHammerPower(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleHammerStrike}
                disabled={forgeSuccess}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition cursor-pointer active:scale-95 shadow-lg",
                  forgeSuccess 
                    ? "bg-white/10 text-white/30" 
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-950/50"
                )}
              >
                {forgeSuccess ? "Выковано!" : "Удар молота 🔨"}
              </button>

              {forgeSuccess && (
                <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 font-bold text-xs animate-bounce">
                  ✓ Шедевр выкован! Заработано 💎 {FORGE_TIERS[forgeTier].gems}!
                  {forgeTier < FORGE_TIERS.length - 1 && (
                    <button 
                      onClick={() => { setForgeTier(prev => prev + 1); setForgeProgress(0); setForgeSuccess(false); }}
                      className="ml-3 px-3 py-1 bg-amber-500 text-black rounded-lg text-xs font-bold"
                    >
                      Следующий заказ
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: TEST RUN (BANNER SQUADS)                          */}
        {/* ======================================================== */}
        {subTab === 'TESTRUN' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/40 to-black border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
               <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-3">
                 <Swords className="w-8 h-8" /> Тестовый Забег (Баннеры 1.4)
               </h2>
               <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                 Испытайте персонажей текущих баннеров в сбалансированных синергетических отрядах на среднем уровне прокачки! Получите 50 Гемов за каждое первое прохождение.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRuns.map((tr) => {
                const isCompleted = completedTestRuns.includes(tr.id);
                const charSplash = getCharSplash(tr.char);
                const charName = tr.title || characterBlueprints[tr.char]?.(tr.char, 1, 0, []).name || tr.char;
                return (
                  <div key={tr.id} className="relative rounded-2xl overflow-hidden border border-white/10 group h-56">
                    <img src={charSplash || ''} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition duration-500 scale-105 group-hover:scale-110" alt="splash" />
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
                      
                      {/* Squad members roster preview */}
                      <div className="flex items-center gap-2 mt-2 mb-3">
                        {tr.team.map((tid, i) => {
                          const cInfo = characterBlueprints[tid]?.(tid, 1, 0, []);
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden bg-black/60 shadow-md">
                                <img src={getCharSplash(tid) || ''} className="w-full h-full object-cover" alt={tid} />
                              </div>
                              <span className="text-[8px] font-mono text-white/60 truncate max-w-[40px] text-center mt-0.5">{cInfo?.name || tid}</span>
                            </div>
                          );
                        })}
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
        {/* TAB 7: UPDATE 1.4 (800 GEMS)                             */}
        {/* ======================================================== */}
        {subTab === 'UPDATE' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
            <div className="w-full bg-[#0a0a0a] border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                💎
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Обновление 1.4</h2>
              <p className="text-xs font-mono text-emerald-300 font-bold mb-3">«Тень Первозданного Древа & Зов Чащоб»</p>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Выход обновления 1.4! В игре появились новые интерактивные события «Зов Диких Чащоб», «Тахионный Лабиринт», «Зеркальная Призма», «Золотая Кузня», обновлённый Теневой Натиск (Сезон 4) и новые тестовые забеги. Заберите 800 Камней Истока в честь обновления!
              </p>
              
              <div className="flex items-center gap-3 mb-8 bg-emerald-950/30 px-6 py-3 rounded-2xl border border-emerald-500/30">
                 <span className="text-2xl">💎</span>
                 <span className="text-2xl font-black text-emerald-300 font-mono tracking-widest">800</span>
              </div>
              
              <button 
                onClick={() => {
                  if (!profile.events?.update14Claimed) {
                    updateProfile(p => ({
                      ...p, gems: p.gems + 800, events: { ...p.events, update14Claimed: true }
                    }));
                  }
                }} 
                disabled={profile.events?.update14Claimed} 
                className={cn(
                  "w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition cursor-pointer active:scale-95 shadow-lg", 
                  profile.events?.update14Claimed 
                    ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed" 
                    : "bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:from-emerald-300 hover:to-teal-400 shadow-emerald-950/50"
                )}
              >
                {profile.events?.update14Claimed ? "Получено" : "Получить 💎 800"}
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
