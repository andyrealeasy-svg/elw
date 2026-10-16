import { Combatant, BattleState, Element, StatBlock, PlayerProfile, Artifact } from '../types';
import { characterBlueprints, scaleStats, getCharSplash, getCharEmoji, charRarity, dealDamage } from '../data';

export interface DistortionBuff {
  id: string;
  name: string;
  category: 'OFFENSIVE' | 'DEFENSIVE' | 'UTILITY' | 'ELEMENTAL' | 'ANOMALY';
  tag: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description: string;
  icon: string; // emoji or identifier
  color: string;
}

export interface DistortionTeamSlot {
  charId: string;
  usePlayerBuild: boolean;
}

export interface DistortionRunState {
  currentStage: number; // 1 to 10
  activeBuffIds: string[];
  team: DistortionTeamSlot[];
  status: 'LOBBY' | 'SELECTING_BUFFS' | 'CHECKPOINT_STAGE_5' | 'IN_BATTLE' | 'VICTORY_RUN' | 'DEFEATED';
  pendingBuffPicks: string[]; // Options currently presented
  pendingPickCount: number; // How many to pick (1 or 3)
  selectedInBatch: string[]; // For stage 5 when picking 3
  battleStats?: Record<string, number>;
  historyStages: { stage: number; duration: number }[];
}

export const DISTORTION_BUFFS: DistortionBuff[] = [
  {
    id: 'time_warp',
    name: 'Искажение Времени',
    category: 'UTILITY',
    tag: 'ВРЕМЯ & КРИТ',
    rarity: 'LEGENDARY',
    icon: 'clock',
    color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-300',
    description: 'Каждый 3-й ход шкала ATB героя мгновенно заполняется до 100%, а следующая атака гарантированно наносит критический урон.'
  },
  {
    id: 'quantum_resonance',
    name: 'Квантовый Резонанс',
    category: 'OFFENSIVE',
    tag: 'АТАКА & СПЛЭШ',
    rarity: 'EPIC',
    icon: 'atom',
    color: 'from-purple-500/20 to-pink-600/30 border-purple-500/40 text-purple-300',
    description: 'Сила атаки всего отряда увеличена на +35%. Обычные атаки наносят 25% урона в виде всплеска по всем остальным врагам.'
  },
  {
    id: 'chrono_acceleration',
    name: 'Хроно-Ускорение',
    category: 'UTILITY',
    tag: 'СКОРОСТЬ & ATB',
    rarity: 'RARE',
    icon: 'zap',
    color: 'from-yellow-500/20 to-amber-600/30 border-yellow-500/40 text-yellow-300',
    description: 'Базовая скорость (SPD) всех героев повышена на +35. Шкала ATB заполняется на 30% быстрее.'
  },
  {
    id: 'prismatic_aegis',
    name: 'Призматический Щит',
    category: 'DEFENSIVE',
    tag: 'ЩИТ & ЗАЩИТА',
    rarity: 'EPIC',
    icon: 'shield',
    color: 'from-blue-500/20 to-indigo-600/30 border-blue-500/40 text-blue-300',
    description: 'В начале каждого своего хода каждый герой генерирует прочный барьер величиной в 25% от своего Макс. HP.'
  },
  {
    id: 'hypercritical_shift',
    name: 'Сверхкритический Сдвиг',
    category: 'OFFENSIVE',
    tag: 'КРИТ. УРОН',
    rarity: 'LEGENDARY',
    icon: 'target',
    color: 'from-rose-500/20 to-red-600/30 border-rose-500/40 text-rose-300',
    description: 'Шанс крит. попадания всего отряда +35%, а Критический урон увеличен на +75%.'
  },
  {
    id: 'anomaly_echo',
    name: 'Эхо Аномалии',
    category: 'ANOMALY',
    tag: 'СБРОС КД',
    rarity: 'EPIC',
    icon: 'users',
    color: 'from-teal-500/20 to-emerald-600/30 border-teal-500/40 text-teal-300',
    description: 'При использовании любого навыка с вероятностью 35% мгновенно сбрасывается его перезарядка и даруется +100% ATB.'
  },
  {
    id: 'aetheric_leech',
    name: 'Энергетический Вампиризм',
    category: 'DEFENSIVE',
    tag: 'ВАМПИРИЗМ',
    rarity: 'RARE',
    icon: 'droplet',
    color: 'from-red-500/20 to-rose-600/30 border-red-500/40 text-red-300',
    description: '25% от всего нанесённого отрядом урона моментально конвертируется в восстановление здоровья атакующего героя.'
  },
  {
    id: 'singularity_pierce',
    name: 'Сингулярность Пробития',
    category: 'OFFENSIVE',
    tag: 'ПРОБИТИЕ БРОНИ',
    rarity: 'EPIC',
    icon: 'disc',
    color: 'from-violet-500/20 to-purple-600/30 border-violet-500/40 text-violet-300',
    description: 'Все атаки отряда игнорируют 40% защиты врагов и наносят удвоенный урон по вражеским щитам.'
  },
  {
    id: 'elemental_rift',
    name: 'Элементальный Разлом',
    category: 'ELEMENTAL',
    tag: 'РЕАКЦИИ +120%',
    rarity: 'LEGENDARY',
    icon: 'whirlwind',
    color: 'from-emerald-500/20 to-cyan-600/30 border-emerald-500/40 text-emerald-300',
    description: 'Урон от всех элементальных реакций (Заморозка, Пар, Перегрузка, Бутонизация, Заряжен) увеличен на +120%.'
  },
  {
    id: 'retribution_pulse',
    name: 'Импульс Возмездия',
    category: 'DEFENSIVE',
    tag: 'ОТРАЖЕНИЕ',
    rarity: 'RARE',
    icon: 'sparkles',
    color: 'from-amber-500/20 to-orange-600/30 border-amber-500/40 text-amber-300',
    description: 'При получении удара 45% от полученного урона немедленно отражается обратно в атаковавшего противника.'
  },
  {
    id: 'immortal_surge',
    name: 'Прилив Искажения',
    category: 'ANOMALY',
    tag: 'ВОСКРЕШЕНИЕ БАФФ',
    rarity: 'EPIC',
    icon: 'sparkles',
    color: 'from-fuchsia-500/20 to-purple-600/30 border-fuchsia-500/40 text-fuchsia-300',
    description: 'При срабатывании бессмертия и возрождения герой получает +50% к АТК и +30 к Скорости на 3 хода.'
  },
  {
    id: 'gravitational_collapse',
    name: 'Гравитационный Коллапс',
    category: 'UTILITY',
    tag: 'ДЕБАФФ ВРАГОВ',
    rarity: 'RARE',
    icon: 'disc',
    color: 'from-slate-500/20 to-zinc-600/30 border-slate-500/40 text-slate-300',
    description: 'Скорость всех врагов снижена на 30%, а их базовая защита ослаблена на 25% на протяжении всего боя.'
  },
  {
    id: 'astral_battery',
    name: 'Астральная Батарея',
    category: 'UTILITY',
    tag: 'БЫСТРЫЙ КД',
    rarity: 'RARE',
    icon: 'battery',
    color: 'from-sky-500/20 to-blue-600/30 border-sky-500/40 text-sky-300',
    description: 'Все активные навыки героев перезаряжаются вдвое быстрее (-1 ход к откату за каждое действие).'
  },
  {
    id: 'viral_shock',
    name: 'Вирусный Шок',
    category: 'ANOMALY',
    tag: 'ПЕРИОД. УРОН',
    rarity: 'COMMON',
    icon: 'skull',
    color: 'from-lime-500/20 to-green-600/30 border-lime-500/40 text-lime-300',
    description: 'Нанесение любого урона накладывает на цель Горение и Кровотечение (наносящие по 20% АТК каждый ход).'
  },
  {
    id: 'titanic_bastion',
    name: 'Титанический Бастион',
    category: 'DEFENSIVE',
    tag: 'СНИЖЕНИЕ УРОНА',
    rarity: 'EPIC',
    icon: 'shield',
    color: 'from-stone-500/20 to-zinc-600/30 border-stone-500/40 text-stone-300',
    description: 'Весь получаемый отрядом урон снижен на 35%, а максимальный запас здоровья (Max HP) увеличен на +50%.'
  },
  {
    id: 'distortion_chain',
    name: 'Цепной Разряд',
    category: 'OFFENSIVE',
    tag: 'РИКОШЕТ',
    rarity: 'RARE',
    icon: 'zap',
    color: 'from-indigo-500/20 to-purple-600/30 border-indigo-500/40 text-indigo-300',
    description: 'Навыки по одной цели рикошетят в 2 случайных дополнительных противников, нанося 60% урона.'
  },
  {
    id: 'core_overdrive',
    name: 'Овердрайв Ядра',
    category: 'UTILITY',
    tag: 'СТАРТ 100% ATB',
    rarity: 'EPIC',
    icon: 'zap',
    color: 'from-orange-500/20 to-red-600/30 border-orange-500/40 text-orange-300',
    description: 'В начале боя все участники отряда мгновенно получают 100% шкалы ATB и +50% к наносимому урону на первый ход.'
  },
  {
    id: 'planar_catalyst',
    name: 'Планарный Катализатор',
    category: 'ELEMENTAL',
    tag: 'СТИХИЙНЫЙ ВЗРЫВ',
    rarity: 'RARE',
    icon: 'sparkles',
    color: 'from-teal-500/20 to-cyan-600/30 border-teal-500/40 text-teal-300',
    description: 'Любая Гидро, Дендро или Электро атака вызывает планарный детонационный взрыв на 80% АТК.'
  },
  {
    id: 'frozen_horizon',
    name: 'Ледяной Горизонт',
    category: 'ELEMENTAL',
    tag: 'КРИО & КОНТРОЛЬ',
    rarity: 'RARE',
    icon: 'snowflake',
    color: 'from-cyan-500/20 to-sky-600/30 border-cyan-500/40 text-cyan-300',
    description: 'Крио-атаки с шансом 50% замораживают противников. Замороженные враги получают на +45% больше урона.'
  },
  {
    id: 'infernal_crucible',
    name: 'Огненное Горнило',
    category: 'ELEMENTAL',
    tag: 'ПИРО ДЕТОНАЦИЯ',
    rarity: 'RARE',
    icon: 'flame',
    color: 'from-orange-500/20 to-red-600/30 border-orange-500/40 text-orange-300',
    description: 'Пиро-атаки накладывают на цель пламенную метку, которая взрывается при гибели цели на 150% АТК по всем врагам.'
  },
  {
    id: 'geo_monolith',
    name: 'Гео-Монолит',
    category: 'DEFENSIVE',
    tag: 'ЩИТ + УРОН 60%',
    rarity: 'RARE',
    icon: 'shield',
    color: 'from-amber-600/20 to-yellow-700/30 border-amber-600/40 text-amber-300',
    description: 'Под действием любого щита герои наносят на +60% больше урона и полностью невосприимчивы к отрицательным эффектам.'
  },
  {
    id: 'phase_shift',
    name: 'Фазовый Сдвиг',
    category: 'DEFENSIVE',
    tag: 'УКЛОНЕНИЕ 25%',
    rarity: 'COMMON',
    icon: 'wind',
    color: 'from-blue-400/20 to-cyan-500/30 border-blue-400/40 text-blue-300',
    description: '25% шанс полностью уклониться от любой входящей вражеской атаки и получить +25% к шкале ATB.'
  },
  {
    id: 'execution_cascade',
    name: 'Каскад Казней',
    category: 'OFFENSIVE',
    tag: 'ДОБИВАНИЕ +85%',
    rarity: 'RARE',
    icon: 'swords',
    color: 'from-red-600/20 to-rose-700/30 border-red-600/40 text-red-300',
    description: 'Атаки по противникам с уровнем здоровья ниже 45% наносят на +85% больше урона.'
  },
  {
    id: 'soullink_matrix',
    name: 'Матрица Связи Душ',
    category: 'DEFENSIVE',
    tag: 'КОМАНДНЫЙ ХИЛ',
    rarity: 'COMMON',
    icon: 'heart',
    color: 'from-emerald-500/20 to-teal-600/30 border-emerald-500/40 text-emerald-300',
    description: 'Любое исцеление одного героя восстанавливает 50% от этого объёма здоровья всему остальному отряду.'
  },
  {
    id: 'antimatter_shred',
    name: 'Антиматерия',
    category: 'OFFENSIVE',
    tag: 'СРЕЗ ЗАЩИТЫ',
    rarity: 'COMMON',
    icon: 'disc',
    color: 'from-neutral-500/20 to-zinc-700/30 border-neutral-500/40 text-neutral-300',
    description: 'Обычные атаки срезают 15% защиты цели (суммируется до 3 раз, ослабляя защиту до -45%).'
  },
  {
    id: 'spatial_tear',
    name: 'Пространственный Раскол',
    category: 'UTILITY',
    tag: 'СБРОС ATB ВРАГА',
    rarity: 'RARE',
    icon: 'sparkles',
    color: 'from-purple-600/20 to-indigo-700/30 border-purple-600/40 text-purple-300',
    description: 'При нанесении критического удара шкала хода (ATB) поражённого противника отбрасывается назад на 25%.'
  },
  {
    id: 'photonic_overload',
    name: 'Фотонная Перегрузка',
    category: 'OFFENSIVE',
    tag: 'УЛЬТРА БАФФ АТК',
    rarity: 'RARE',
    icon: 'zap',
    color: 'from-yellow-400/20 to-amber-500/30 border-yellow-400/40 text-yellow-200',
    description: 'Использование ультимативного навыка повышает силу атаки всего отряда на +30% на 2 хода (эффект суммируется).'
  },
  {
    id: 'void_aegis',
    name: 'Эгида Пустоты',
    category: 'DEFENSIVE',
    tag: 'СПАСАТЕЛЬНЫЙ ЩИТ',
    rarity: 'EPIC',
    icon: 'shield',
    color: 'from-fuchsia-600/20 to-pink-700/30 border-fuchsia-600/40 text-fuchsia-300',
    description: 'Когда здоровье героя падает ниже 50%, он получает щит на 40% Max HP и 50% ATB (срабатывает раз в 3 хода).'
  },
  {
    id: 'elemental_tempest',
    name: 'Стихийный Вихрь',
    category: 'ELEMENTAL',
    tag: 'СТИХИЙНЫЙ УРОН',
    rarity: 'RARE',
    icon: 'wind',
    color: 'from-teal-400/20 to-emerald-600/30 border-teal-400/40 text-teal-200',
    description: 'Чередование разных стихий в последовательных атаках отряда увеличивает весь стихийный урон на +40%.'
  },
  {
    id: 'magnetic_pull',
    name: 'Магнитный Резонанс',
    category: 'OFFENSIVE',
    tag: 'АОЕ БОНУС +35%',
    rarity: 'COMMON',
    icon: 'layers',
    color: 'from-blue-600/20 to-indigo-700/30 border-blue-600/40 text-blue-300',
    description: 'Если на поле боя находится 2 или более противников, весь наносимый по ним урон увеличивается на +35%.'
  },
  {
    id: 'dimensional_nova',
    name: 'Взрыв Пространства',
    category: 'ANOMALY',
    tag: 'СМЕРТЬ ВРАГА = АОЕ',
    rarity: 'LEGENDARY',
    icon: 'sparkles',
    color: 'from-pink-500/20 to-purple-600/30 border-pink-500/40 text-pink-300',
    description: 'Уничтожение любого врага высвобождает волну искажения, наносящую 100% от его Макс. HP всем оставшимся врагам.'
  },
  {
    id: 'absolute_mastery',
    name: 'Абсолютное Господство',
    category: 'ANOMALY',
    tag: 'ВСЕ СТАТЫ +25%',
    rarity: 'LEGENDARY',
    icon: 'crown',
    color: 'from-amber-400/20 to-yellow-600/30 border-amber-400/40 text-amber-200',
    description: 'Все ключевые характеристики отряда (HP, ATK, DEF, SPD, Крит. шанс, Крит. урон) увеличены на +25%.'
  }
];

export interface DistortionStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  level: number;
  isBoss: boolean;
  bossName?: string;
  description: string;
  enemyArchetypes: string[];
}

export const DISTORTION_STAGES: DistortionStageConfig[] = [
  {
    stage: 1,
    title: 'Разлом Реальности: Разведчики Аномалии',
    subtitle: 'Начало погружения в искажённое пространство',
    level: 70,
    isBoss: false,
    description: 'Первичные сгустки искажения. Враги быстры, но обладают стандартной защитой.',
    enemyArchetypes: ['glitch_scout', 'void_drone']
  },
  {
    stage: 2,
    title: 'Глитч-Вихрь: Стражи Разлома',
    subtitle: 'Активация охранных протоколов пустоты',
    level: 75,
    isBoss: false,
    description: 'Эшелон стражей пустоты, вооруженных дестабилизаторами материи.',
    enemyArchetypes: ['glitch_sentinel', 'void_reaver']
  },
  {
    stage: 3,
    title: 'Искажённые Фантомы: Эхо Прошлого',
    subtitle: 'Материализация фантомов древних битв',
    level: 80,
    isBoss: false,
    description: 'Фантомы обладают сопротивлением к стихийному урону и атакуют волнами.',
    enemyArchetypes: ['phantom_knight', 'echo_weaver']
  },
  {
    stage: 4,
    title: 'Планарный Перегруз: Авангард Пустоты',
    subtitle: 'Преддверие ядра аномалии',
    level: 85,
    isBoss: false,
    description: 'Элитный авангард, подготавливающий явление Хроно-Колосса.',
    enemyArchetypes: ['void_colossus_minion', 'singularity_stalker']
  },
  {
    stage: 5,
    title: 'МИД-БОСС: ХРОНО-КОЛОСС ИСКАЖЕНИЯ',
    subtitle: 'Особо опасный босс 5-го этапа разлома',
    level: 90,
    isBoss: true,
    bossName: 'Хроно-Колосс Искажения',
    description: 'Древний гигант времени. Управляет ходом боя, призывает искажённых миньонов и сотрясает всё поле боя сокрушительными ударами!',
    enemyArchetypes: ['distortion_chrono_colossus']
  },
  {
    stage: 6,
    title: 'Аномальная Зона: Прорыв Матрицы',
    subtitle: 'Углубление в нестабильные секторы',
    level: 92,
    isBoss: false,
    description: 'Плотность искажения возрастает. Враги получают щиты и ускоренное накопление шкалы хода.',
    enemyArchetypes: ['matrix_breaker', 'quantum_stalker']
  },
  {
    stage: 7,
    title: 'Квантовое Затмение: Титаны Глитча',
    subtitle: 'Сверхплотные конструкты пространства',
    level: 94,
    isBoss: false,
    description: 'Титаны с повышенным запасом прочности и способностью накапливать импульсы возмездия.',
    enemyArchetypes: ['glitch_titan', 'aether_vanguard']
  },
  {
    stage: 8,
    title: 'Глубинный Разлом: Теневые Отражения',
    subtitle: 'Зеркальные проекции героев',
    level: 96,
    isBoss: false,
    description: 'Теневые сущности, имитирующие боевые стили отряда и наносящие критические удары.',
    enemyArchetypes: ['shadow_mirror', 'void_assassin']
  },
  {
    stage: 9,
    title: 'Сингулярность: Элитный Легион Пустоты',
    subtitle: 'Последний рубеж перед Архитектором',
    level: 98,
    isBoss: false,
    description: 'Высшие стражи сингулярности. Колоссальный урон и непрерывная поддержка союзников.',
    enemyArchetypes: ['singularity_warden', 'abyssal_herald']
  },
  {
    stage: 10,
    title: 'ФИНАЛЬНЫЙ БОСС: АРХИТЕКТОР РАЗЛОМОВ',
    subtitle: 'Абсолютное Ядро Искажения Пространства',
    level: 100,
    isBoss: true,
    bossName: 'Архитектор Разломов • Ядро Искажения',
    description: 'Владыка искажения реальности. Обладает фазами трансформации, абсолютной защитой и космическими каскадными атаками!',
    enemyArchetypes: ['rift_architect_prime']
  }
];

// Helper to create a trial Lv 90 C0 character or real player build
export const createDistortionCombatant = (
  charId: string,
  usePlayerBuild: boolean,
  profile: PlayerProfile,
  slotIndex: number
): Combatant => {
  const uid = `dist_hero_${charId}_${slotIndex}`;
  const owned = profile.roster && profile.roster[charId];

  if (usePlayerBuild && owned) {
    const charData = owned;
    const equippedArts: Artifact[] = [];
    if (charData.artifacts) {
      Object.values(charData.artifacts).forEach(artId => {
        if (artId) {
          const found = profile.artifacts.find(a => a.id === artId);
          if (found) equippedArts.push(found);
        }
      });
    }
    const builder = characterBlueprints[charId];
    if (builder) {
      const combatant = builder(uid, charData.level, charData.constellation, equippedArts);
      combatant.buffs = { ...combatant.buffs, distortionImmortal: 1 };
      return combatant;
    }
  }

  // Standard Trial Build: Lv 90, C0, balanced solid stats
  const builder = characterBlueprints[charId];
  if (!builder) {
    // Fallback if char not found
    return {
      id: charId,
      uid,
      isEnemy: false,
      name: charId,
      element: 'Physical',
      stats: { hp: 20000, maxHp: 20000, atk: 2400, def: 1000, spd: 60, critRate: 50, critDamage: 120 },
      atb: 0,
      skills: [],
      color: 'bg-indigo-600',
      level: 90,
      constellation: 0,
      cooldowns: {},
      buffs: { distortionImmortal: 1 }
    };
  }

  // Create standard lv 90 c0 with balanced trial baseline
  const standardCombatant = builder(uid, 90, 0, []);
  
  // Apply balanced medium trial artifact stats:
  // Base Crit Rate 50%, Crit DMG 120%, solid HP & ATK & DEF
  standardCombatant.stats.hp = Math.max(standardCombatant.stats.hp, 22000);
  standardCombatant.stats.maxHp = standardCombatant.stats.hp;
  standardCombatant.stats.atk = Math.max(standardCombatant.stats.atk, 2400);
  standardCombatant.stats.def = Math.max(standardCombatant.stats.def, 950);
  standardCombatant.stats.spd = Math.max(standardCombatant.stats.spd, 58);
  standardCombatant.stats.critRate = Math.max(standardCombatant.stats.critRate || 5, 50);
  standardCombatant.stats.critDamage = Math.max(standardCombatant.stats.critDamage || 50, 120);
  standardCombatant.buffs = { ...standardCombatant.buffs, distortionImmortal: 1 };

  return standardCombatant;
};

// Generate Enemies for Distortion Stages
export const generateDistortionWave = (stageNum: number): Combatant[][] => {
  const safeStage = Math.max(1, Math.min(10, Math.floor(Number(stageNum) || 1)));
  const stageIdx = Math.max(0, Math.min(safeStage - 1, DISTORTION_STAGES.length - 1));
  const stageCfg = DISTORTION_STAGES[stageIdx];
  const lvl = stageCfg.level;
  
  if (stageCfg.isBoss) {
    if (safeStage === 5) {
      // Stage 5 Mid-Boss: Chrono-Colossus
      const boss: Combatant = {
        id: 'distortion_chrono_colossus',
        uid: 'dist_boss_5_' + Date.now(),
        isEnemy: true,
        isBoss: true,
        image: '/src/assets/images/glitch_robot_enemy_1779480865219.png',
        name: 'Хроно-Колосс Искажения (МИД-БОСС)',
        element: 'Cryo',
        color: 'bg-cyan-900 border-cyan-500',
        level: lvl,
        constellation: 3,
        stats: {
          hp: 850000,
          maxHp: 850000,
          atk: 3200,
          def: 1400,
          spd: 52,
          critRate: 25,
          critDamage: 90
        },
        atb: 25,
        cooldowns: {},
        buffs: {
          res: 20
        },
        skills: [
          {
            id: 'colossus_smash',
            name: 'Хроно-Дробитель',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Сокрушительный удар искажённой энергией времени.',
            statsText: 'Урон: 180% АТК',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'Cryo');
              dealDamage(s, t[0], 1.8, 'Cryo', log, ft, pl, 2, state);
            }
          },
          {
            id: 'temporal_freeze',
            name: 'Квантовый Заморозок',
            type: 'Skill1',
            cost: 3,
            target: 'AllEnemies',
            description: 'Выброс холода по всем героям (140% АТК), замедляющий ATB на 25%.',
            statsText: 'Урон: 140% АТК • AoE',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'ultimate_aoe');
              t.forEach(hero => {
                if (hero.stats.hp > 0) {
                  dealDamage(s, hero, 1.4, 'Cryo', log, ft, pl, 1, state);
                  hero.atb = Math.max(0, hero.atb - 25);
                }
              });
              if (log) log('Хроно-Колосс замедляет течение времени всего отряда на 25% ATB!');
            }
          },
          {
            id: 'space_quake',
            name: 'Искажённый Грави-Удар',
            type: 'Skill2',
            cost: 5,
            target: 'AllEnemies',
            description: 'Колоссальный взрыв ядра аномалии (240% АТК) по всем целям.',
            statsText: 'Урон: 240% АТК • AoE',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'Geo');
              t.forEach(hero => {
                if (hero.stats.hp > 0) {
                  dealDamage(s, hero, 2.4, 'Physical', log, ft, pl, 3, state);
                }
              });
            }
          }
        ]
      };

      const minion1: Combatant = {
        id: 'chrono_guardian_1',
        uid: 'dist_minion_5_1_' + Date.now(),
        isEnemy: true,
        name: 'Хранитель Разлома A',
        element: 'Electro',
        color: 'bg-indigo-800',
        level: lvl - 2,
        constellation: 0,
        stats: { hp: 160000, maxHp: 160000, atk: 1800, def: 800, spd: 48, critRate: 15, critDamage: 60 },
        atb: 15,
        cooldowns: {},
        buffs: {},
        skills: [
          {
            id: 'g_strike',
            name: 'Импульсный Удар',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Электро разряд.',
            execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.2, 'Electro', log, ft, pl, 1, state); }
          }
        ]
      };

      const minion2: Combatant = {
        id: 'chrono_guardian_2',
        uid: 'dist_minion_5_2_' + Date.now(),
        isEnemy: true,
        name: 'Хранитель Разлома B',
        element: 'Hydro',
        color: 'bg-blue-800',
        level: lvl - 2,
        constellation: 0,
        stats: { hp: 160000, maxHp: 160000, atk: 1800, def: 800, spd: 48, critRate: 15, critDamage: 60 },
        atb: 10,
        cooldowns: {},
        buffs: {},
        skills: [
          {
            id: 'g_wave',
            name: 'Гидро Волна',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Гидро атака.',
            execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.2, 'Hydro', log, ft, pl, 1, state); }
          }
        ]
      };

      return [[minion1, boss, minion2]];
    } else {
      // Stage 10 Final Supreme Boss: Architect of Rifts
      const finalBoss: Combatant = {
        id: 'rift_architect_prime',
        uid: 'dist_boss_10_' + Date.now(),
        isEnemy: true,
        isBoss: true,
        image: '/src/assets/images/glitch_void_enemy_1779480881509.png',
        name: 'Архитектор Разломов • Ядро Искажения (ФИНАЛ)',
        element: 'Physical',
        color: 'bg-purple-950 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
        level: 100,
        constellation: 6,
        stats: {
          hp: 1750000,
          maxHp: 1750000,
          atk: 4500,
          def: 1800,
          spd: 64,
          critRate: 35,
          critDamage: 120
        },
        atb: 35,
        cooldowns: {},
        buffs: {
          res: 30,
          shield: 200000
        },
        skills: [
          {
            id: 'arch_beam',
            name: 'Луч Распада Реальности',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Пронзающий луч пустоты, наносящий 220% урона.',
            statsText: 'Урон: 220% АТК',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'ultimate_single');
              dealDamage(s, t[0], 2.2, 'Physical', log, ft, pl, 4, state, 0.3);
            }
          },
          {
            id: 'arch_singularity',
            name: 'Сингулярность Пространства',
            type: 'Skill1',
            cost: 3,
            target: 'AllEnemies',
            description: 'Коллапсирующая черная дыра (190% АТК) по всему отряду с шансом наложить Смятение.',
            statsText: 'Урон: 190% АТК • AoE',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'ultimate_aoe');
              t.forEach(hero => {
                if (hero.stats.hp > 0) {
                  dealDamage(s, hero, 1.9, 'Physical', log, ft, pl, 2, state, 0.25);
                }
              });
              if (log) log('Архитектор Разломов искажает законы физики!');
            }
          },
          {
            id: 'arch_genesis_end',
            name: 'Абсолютный Коллапс Измерений',
            type: 'Skill2',
            cost: 5,
            target: 'AllEnemies',
            description: 'Катастрофический удар сингулярности (350% АТК).',
            statsText: 'Урон: 350% АТК • Все цели',
            execute: (s, t, state, log, ft, pl) => {
              if (pl) pl(s.uid, 'ultimate_aoe');
              t.forEach(hero => {
                if (hero.stats.hp > 0) {
                  dealDamage(s, hero, 3.5, 'Physical', log, ft, pl, 5, state, 0.4);
                }
              });
              if (log) log('[КОЛЛАПС] Архитектор высвобождает абсолютный коллапс измерений!');
            }
          }
        ]
      };

      const leftHerald: Combatant = {
        id: 'abyssal_herald_1',
        uid: 'dist_herald_1_' + Date.now(),
        isEnemy: true,
        name: 'Вестник Пустоты (Альфа)',
        element: 'Pyro',
        color: 'bg-red-900',
        level: 98,
        constellation: 2,
        stats: { hp: 280000, maxHp: 280000, atk: 2600, def: 1100, spd: 55, critRate: 20, critDamage: 80 },
        atb: 20,
        cooldowns: {},
        buffs: {},
        skills: [
          {
            id: 'h_flame',
            name: 'Огненный Шторм',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Пиро удар.',
            execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.5, 'Pyro', log, ft, pl, 2, state); }
          }
        ]
      };

      const rightHerald: Combatant = {
        id: 'abyssal_herald_2',
        uid: 'dist_herald_2_' + Date.now(),
        isEnemy: true,
        name: 'Вестник Пустоты (Омега)',
        element: 'Hydro',
        color: 'bg-teal-900',
        level: 98,
        constellation: 2,
        stats: { hp: 280000, maxHp: 280000, atk: 2600, def: 1100, spd: 55, critRate: 20, critDamage: 80 },
        atb: 15,
        cooldowns: {},
        buffs: {},
        skills: [
          {
            id: 'h_water',
            name: 'Прилив Разлома',
            type: 'Attack',
            cost: 0,
            target: 'SingleEnemy',
            description: 'Гидро удар.',
            execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.5, 'Hydro', log, ft, pl, 2, state); }
          }
        ]
      };

      return [[leftHerald, finalBoss, rightHerald]];
    }
  }

  // Normal Stages (1-4, 6-9)
  const elements: Element[] = ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Dendro', 'Geo', 'Physical'];
  const enemyImgs = [
    '/src/assets/images/glitch_slime_enemy_1779480847452.png',
    '/src/assets/images/glitch_robot_enemy_1779480865219.png',
    '/src/assets/images/glitch_void_enemy_1779480881509.png'
  ];

  // Stage scaling
  const baseHp = 120000 + (stageNum * 25000);
  const baseAtk = 1400 + (stageNum * 180);
  const baseDef = 600 + (stageNum * 80);
  const baseSpd = 42 + Math.floor(stageNum * 1.5);

  const numEnemies = stageNum >= 6 ? 3 : (stageNum % 2 === 0 ? 3 : 2);
  const enemies: Combatant[] = [];

  for (let i = 0; i < numEnemies; i++) {
    const el = elements[(stageNum + i) % elements.length];
    const isElite = i === 1 && numEnemies === 3;
    const hp = Math.floor(baseHp * (isElite ? 1.6 : 1.0));
    const atk = Math.floor(baseAtk * (isElite ? 1.25 : 1.0));
    const def = Math.floor(baseDef * (isElite ? 1.3 : 1.0));

    enemies.push({
      id: `dist_mob_${stageNum}_${i}`,
      uid: `dist_mob_${stageNum}_${i}_` + Math.random(),
      isEnemy: true,
      image: enemyImgs[i % enemyImgs.length],
      name: isElite ? `Элитный Страж Разлома (Ур.${lvl})` : `Искажённый Конструкт #${i + 1} (Ур.${lvl})`,
      element: el,
      color: 'bg-zinc-800 border-white/10',
      level: lvl,
      constellation: isElite ? 1 : 0,
      stats: {
        hp,
        maxHp: hp,
        atk,
        def,
        spd: baseSpd + (isElite ? 4 : 0),
        critRate: 15 + stageNum,
        critDamage: 60 + stageNum * 2
      },
      atb: Math.floor(Math.random() * 20),
      cooldowns: {},
      buffs: {},
      skills: [
        {
          id: `mob_atk_${i}`,
          name: isElite ? 'Искажённый Разряд' : 'Импульс Данных',
          type: 'Attack',
          cost: 0,
          target: 'SingleEnemy',
          description: 'Атака стихией.',
          execute: (s, t, state, log, ft, pl) => {
            dealDamage(s, t[0], isElite ? 1.6 : 1.2, el, log, ft, pl, isElite ? 2 : 1, state);
          }
        }
      ]
    });
  }

  return [enemies];
};

// Apply distortion buffs to party combatants
export const applyDistortionBuffsToParty = (party: Combatant[], buffIds: string[]): Combatant[] => {
  return party.map(member => {
    const p: Combatant = { ...member, stats: { ...member.stats }, buffs: { ...member.buffs, distortionImmortal: 1 } };
    
    buffIds.forEach(buffId => {
      switch (buffId) {
        case 'time_warp':
          p.buffs.timeWarpDistortion = 1;
          break;
        case 'quantum_resonance':
          p.stats.atk = Math.round(p.stats.atk * 1.35);
          p.buffs.quantumSplash = 1;
          break;
        case 'chrono_acceleration':
          p.stats.spd += 35;
          p.buffs.atbAccel = (p.buffs.atbAccel || 0) + 30;
          break;
        case 'prismatic_aegis':
          p.buffs.prismaticAegis = 1;
          p.buffs.shield = (p.buffs.shield || 0) + Math.round(p.stats.maxHp * 0.25);
          break;
        case 'hypercritical_shift':
          p.stats.critRate = Math.min(100, (p.stats.critRate || 5) + 35);
          p.stats.critDamage = (p.stats.critDamage || 50) + 75;
          break;
        case 'anomaly_echo':
          p.buffs.anomalyEcho = 1;
          break;
        case 'aetheric_leech':
          p.buffs.aethericLeech = 1;
          break;
        case 'singularity_pierce':
          p.buffs.defIgnoreBoost = (p.buffs.defIgnoreBoost || 0) + 0.40;
          p.buffs.shieldBreaker = 1;
          break;
        case 'elemental_rift':
          p.buffs.reactionDmg = (p.buffs.reactionDmg || 0) + 120;
          break;
        case 'retribution_pulse':
          p.buffs.retributionPulse = 1;
          break;
        case 'immortal_surge':
          p.buffs.immortalSurgeActive = 1;
          break;
        case 'gravitational_collapse':
          p.buffs.gravitationalCollapseAura = 1;
          break;
        case 'astral_battery':
          p.buffs.astralBatteryFastCd = 1;
          break;
        case 'viral_shock':
          p.buffs.viralShock = 1;
          break;
        case 'titanic_bastion':
          p.stats.maxHp = Math.round(p.stats.maxHp * 1.50);
          p.stats.hp = p.stats.maxHp;
          p.buffs.res = (p.buffs.res || 0) + 35;
          break;
        case 'distortion_chain':
          p.buffs.distortionChainRicochet = 1;
          break;
        case 'core_overdrive':
          p.atb = 100;
          p.buffs.dmgBoost = (p.buffs.dmgBoost || 0) + 50;
          break;
        case 'planar_catalyst':
          p.buffs.planarCatalyst = 1;
          break;
        case 'frozen_horizon':
          p.buffs.frozenHorizon = 1;
          break;
        case 'infernal_crucible':
          p.buffs.infernalCrucible = 1;
          break;
        case 'geo_monolith':
          p.buffs.geoMonolith = 1;
          break;
        case 'phase_shift':
          p.buffs.phaseShiftEvade = 1;
          break;
        case 'execution_cascade':
          p.buffs.executionCascade = 1;
          break;
        case 'soullink_matrix':
          p.buffs.soullinkMatrix = 1;
          break;
        case 'antimatter_shred':
          p.buffs.antimatterShred = 1;
          break;
        case 'spatial_tear':
          p.buffs.spatialTear = 1;
          break;
        case 'photonic_overload':
          p.buffs.photonicOverload = 1;
          break;
        case 'void_aegis':
          p.buffs.voidAegis = 1;
          break;
        case 'elemental_tempest':
          p.buffs.elementalTempest = 1;
          break;
        case 'magnetic_pull':
          p.buffs.magneticPull = 1;
          break;
        case 'dimensional_nova':
          p.buffs.dimensionalNova = 1;
          break;
        case 'absolute_mastery':
          p.stats.maxHp = Math.round(p.stats.maxHp * 1.25);
          p.stats.hp = p.stats.maxHp;
          p.stats.atk = Math.round(p.stats.atk * 1.25);
          p.stats.def = Math.round(p.stats.def * 1.25);
          p.stats.spd = Math.round(p.stats.spd * 1.25);
          p.stats.critRate = Math.min(100, (p.stats.critRate || 5) + 25);
          p.stats.critDamage = (p.stats.critDamage || 50) + 25;
          break;
      }
    });

    return p;
  });
};

// ==========================================
// DISTORTION LEVEL PROGRESSION SYSTEM (200 LEVELS)
// ==========================================

export const DISTORTION_MAX_LEVEL = 200;
export const DISTORTION_EXP_PER_CLEAR = 200; // EXP awarded per complete Stage 10 clear
export const DISTORTION_WEEKLY_EXP_LIMIT = 1600; // Weekly EXP cap (~8 full clears, reaches Level 10+)
export const DISTORTION_WEEKLY_FULL_CLEAR_LIMIT = 2; // Direct stage 10 rewards limited to 2 per week
export const DISTORTION_PROGRESS_STORAGE_KEY = 'ed_distortion_progression_v2';

export type DistortionRewardType = 
  | 'CHARACTER'
  | 'GEMS'
  | 'GOLD'
  | 'HERO_EXP'
  | 'TICKET'
  | 'ARTIFACT'
  | 'RELIC_BOX';

export interface DistortionLevelReward {
  level: number;
  type: DistortionRewardType;
  charId?: string; // B-tier: 'farina' | 'nova' | 'spark' | 'patch' | 'kamikaze' | 'volosatinya'
  amount?: number;
  name: string;
  description: string;
  icon?: string;
  rarity?: 'B' | 'A' | 'S';
}

export interface DistortionProgression {
  level: number; // Current level (1 to 200)
  currentExp: number; // EXP accumulated towards next level
  claimedLevels: number[]; // Array of claimed level numbers
  weeklyExpGained: number; // EXP gained during current week
  weeklyFullClearsClaimed: number; // Number of times stage 10 direct rewards claimed this week (max 2)
  lastWeekId: string; // ISO week identifier (e.g. "2026-W41")
}

// Compute ISO week string (e.g. "2026-W41")
export const getISOWeekId = (date = new Date()): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

// Human-readable countdown to next Monday reset
export const getTimeUntilNextWeeklyReset = (): string => {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day === 0 ? 1 : 8 - day); // Days until next Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  const ms = Math.max(0, d.getTime() - now.getTime());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days} дн. ${hours} ч.`;
};

// EXP needed to go from `level` to `level + 1`
// Scales progressively: higher levels require more EXP, ensuring meaningful progression.
export const getRequiredExpForDistortionLevel = (level: number): number => {
  if (level >= DISTORTION_MAX_LEVEL) return 0;
  return Math.floor(100 + (level - 1) * 8 + Math.floor(Math.pow(level, 1.25)));
};

// Character Milestones Map for 200 Levels (featuring B-tier characters)
const B_TIER_CHARACTER_LEVELS: Record<number, { charId: string; title: string }> = {
  10: { charId: 'spark', title: 'Спарк (B-Ранг, Pyro)' },
  20: { charId: 'patch', title: 'Патч (B-Ранг, Dendro)' },
  35: { charId: 'kamikaze', title: 'Камикадзе (B-Ранг, Electro)' },
  50: { charId: 'volosatinya', title: 'Волосатиня (B-Ранг, Hydro)' },
  65: { charId: 'nova', title: 'Нова (B-Ранг, Physical)' },
  80: { charId: 'farina', title: 'Фарина (B-Ранг, Cryo)' },
  95: { charId: 'spark', title: 'Спарк • Созвездие (B-Ранг)' },
  110: { charId: 'patch', title: 'Патч • Созвездие (B-Ранг)' },
  125: { charId: 'kamikaze', title: 'Камикадзе • Созвездие (B-Ранг)' },
  140: { charId: 'volosatinya', title: 'Волосатиня • Созвездие (B-Ранг)' },
  155: { charId: 'nova', title: 'Нова • Созвездие (B-Ранг)' },
  170: { charId: 'farina', title: 'Фарина • Созвездие (B-Ранг)' },
  185: { charId: 'spark', title: 'Спарк • Полное раскрытие (B-Ранг)' },
  200: { charId: 'farina', title: 'Фарина • Апогей Искажения (B-Ранг)' }
};

// Generate deterministic reward for level 1..200
export const getDistortionLevelReward = (level: number): DistortionLevelReward => {
  // Check if character milestone
  if (B_TIER_CHARACTER_LEVELS[level]) {
    const meta = B_TIER_CHARACTER_LEVELS[level];
    return {
      level,
      type: 'CHARACTER',
      charId: meta.charId,
      rarity: 'B',
      name: meta.title,
      description: 'Эксклюзивная награда этапа: при получении запускается анимация призыва персонажа!',
      icon: 'character'
    };
  }

  // Major milestones every 25 levels
  if (level % 25 === 0) {
    return {
      level,
      type: 'GEMS',
      amount: 500,
      name: '500 Звёздного Нефрита',
      description: 'Большая веха прогресса Искажения.',
      icon: 'gems'
    };
  }

  // Large milestone every 10 levels
  if (level % 10 === 0) {
    if (level % 20 === 0) {
      return {
        level,
        type: 'TICKET',
        amount: 2,
        name: 'Билеты Молитв ×2',
        description: '2 билета для призыва в любых баннерах.',
        icon: 'ticket'
      };
    } else {
      return {
        level,
        type: 'GEMS',
        amount: 250,
        name: '250 Звёздного Нефрита',
        description: 'Драгоценные кристаллы для призыва.',
        icon: 'gems'
      };
    }
  }

  // Semi-milestone every 5 levels
  if (level % 5 === 0) {
    if (level % 2 === 0) {
      return {
        level,
        type: 'ARTIFACT',
        amount: 1,
        name: 'Легендарный Артефакт 5★',
        description: 'Случайный золотой артефакт максимальной редкости.',
        icon: 'artifact'
      };
    } else {
      return {
        level,
        type: 'RELIC_BOX',
        amount: 1,
        name: 'Сундук Аномалий Разлома',
        description: 'Содержит 150 кристаллов, 50 000 золота и реликтовые материалы.',
        icon: 'relic_box'
      };
    }
  }

  // Pattern for regular levels (alternating between gold, exp, and gems)
  const pattern = level % 4;
  if (pattern === 1) {
    const amount = 25000 + Math.floor(level * 400);
    return {
      level,
      type: 'GOLD',
      amount,
      name: `${amount.toLocaleString('ru-RU')} Золота`,
      description: 'Золото для улучшения снаряжения и персонажей.',
      icon: 'gold'
    };
  } else if (pattern === 2) {
    const amount = 15000 + Math.floor(level * 300);
    return {
      level,
      type: 'HERO_EXP',
      amount,
      name: `${amount.toLocaleString('ru-RU')} Опыта Героя`,
      description: 'Материалы для повышения уровня персонажей.',
      icon: 'hero_exp'
    };
  } else if (pattern === 3) {
    const amount = 50 + (level > 100 ? 50 : 25);
    return {
      level,
      type: 'GEMS',
      amount,
      name: `${amount} Звёздного Нефрита`,
      description: 'Кристаллы для призыва и пополнения ресурсов.',
      icon: 'gems'
    };
  } else {
    const amount = 35000 + Math.floor(level * 500);
    return {
      level,
      type: 'GOLD',
      amount,
      name: `${amount.toLocaleString('ru-RU')} Золота`,
      description: 'Золото для возвышения отряда.',
      icon: 'gold'
    };
  }
};

// Generate list of all 200 levels
export const DISTORTION_ALL_LEVELS: DistortionLevelReward[] = Array.from(
  { length: DISTORTION_MAX_LEVEL }, 
  (_, idx) => getDistortionLevelReward(idx + 1)
);

// Load progression from storage or profile with weekly reset enforcement
export const loadDistortionProgression = (profile?: PlayerProfile): DistortionProgression => {
  const currentWeek = getISOWeekId();
  let base: DistortionProgression = {
    level: 1,
    currentExp: 0,
    claimedLevels: [],
    weeklyExpGained: 0,
    weeklyFullClearsClaimed: 0,
    lastWeekId: currentWeek
  };

  try {
    const saved = localStorage.getItem(DISTORTION_PROGRESS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.level === 'number') {
        base = {
          level: Math.max(1, Math.min(DISTORTION_MAX_LEVEL, parsed.level)),
          currentExp: Math.max(0, Number(parsed.currentExp) || 0),
          claimedLevels: Array.isArray(parsed.claimedLevels) ? parsed.claimedLevels : [],
          weeklyExpGained: Math.max(0, Number(parsed.weeklyExpGained) || 0),
          weeklyFullClearsClaimed: Math.max(0, Number(parsed.weeklyFullClearsClaimed) || 0),
          lastWeekId: parsed.lastWeekId || currentWeek
        };
      }
    } else if (profile?.distortionProgress) {
      base = {
        level: Math.max(1, Math.min(DISTORTION_MAX_LEVEL, profile.distortionProgress.level || 1)),
        currentExp: Math.max(0, profile.distortionProgress.currentExp || 0),
        claimedLevels: profile.distortionProgress.claimedLevels || [],
        weeklyExpGained: Math.max(0, profile.distortionProgress.weeklyExpGained || 0),
        weeklyFullClearsClaimed: Math.max(0, profile.distortionProgress.weeklyFullClearsClaimed || 0),
        lastWeekId: profile.distortionProgress.lastWeekId || currentWeek
      };
    }
  } catch (e) {}

  // Weekly Reset check
  if (base.lastWeekId !== currentWeek) {
    base.weeklyExpGained = 0;
    base.weeklyFullClearsClaimed = 0;
    base.lastWeekId = currentWeek;
    try {
      localStorage.setItem(DISTORTION_PROGRESS_STORAGE_KEY, JSON.stringify(base));
    } catch (e) {}
  }

  return base;
};

// Persist progression
export const saveDistortionProgression = (progression: DistortionProgression): void => {
  try {
    localStorage.setItem(DISTORTION_PROGRESS_STORAGE_KEY, JSON.stringify(progression));
  } catch (e) {}
};

// Add EXP to progression considering weekly limit and level progression
export const addDistortionExpToProgression = (
  rawExp: number,
  profile?: PlayerProfile
): {
  updatedProgression: DistortionProgression;
  levelsGained: number;
  effectiveExpAdded: number;
  weeklyLimitReached: boolean;
} => {
  const prog = loadDistortionProgression(profile);
  const remainingWeekly = Math.max(0, DISTORTION_WEEKLY_EXP_LIMIT - prog.weeklyExpGained);
  const effectiveExpAdded = Math.min(rawExp, remainingWeekly);
  const weeklyLimitReached = (prog.weeklyExpGained + effectiveExpAdded) >= DISTORTION_WEEKLY_EXP_LIMIT;

  if (effectiveExpAdded <= 0 || prog.level >= DISTORTION_MAX_LEVEL) {
    return {
      updatedProgression: prog,
      levelsGained: 0,
      effectiveExpAdded: 0,
      weeklyLimitReached: prog.weeklyExpGained >= DISTORTION_WEEKLY_EXP_LIMIT
    };
  }

  prog.weeklyExpGained += effectiveExpAdded;
  prog.currentExp += effectiveExpAdded;

  let levelsGained = 0;
  while (prog.level < DISTORTION_MAX_LEVEL) {
    const required = getRequiredExpForDistortionLevel(prog.level);
    if (prog.currentExp >= required) {
      prog.currentExp -= required;
      prog.level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  if (prog.level >= DISTORTION_MAX_LEVEL) {
    prog.currentExp = 0;
  }

  saveDistortionProgression(prog);

  return {
    updatedProgression: prog,
    levelsGained,
    effectiveExpAdded,
    weeklyLimitReached
  };
};

