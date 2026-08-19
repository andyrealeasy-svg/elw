export type Element = "Hydro" | "Pyro" | "Dendro" | "Electro" | "Geo" | "Physical" | "Cryo";

export type StatBlock = {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number; // Speed determines how fast ATB fills
};

export type SkillType = "Attack" | "Skill1" | "Skill2";
export type TargetType = "SingleEnemy" | "AllEnemies" | "SingleAlly" | "AllAllies" | "Self";

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cost: number; // Cooldown turns
  target: TargetType;
  execute: (source: Combatant, target: Combatant[], battleState: BattleState, addLog: (msg: string) => void, addFloatText?: (targetUid: string, text: string, color: string) => void, playEffect?: (targetUid: string, effectType: string) => void) => void;
}

export interface Combatant {
  id: string; // Blueprint ID
  uid: string; // Instance ID
  isEnemy: boolean;
  image?: string;
  name: string;
  element: Element;
  stats: StatBlock;
  atb: number; // 0 to 100
  skills: Skill[];
  color: string;
  aura?: Element | null;
  level: number;
  constellation: number;
  // Status effects
  cooldowns: Record<string, number>;
  buffs: {
    atk?: number;
    def?: number;
    spd?: number;
    shield?: number;
    joyStacks?: number; // Specific to Selva
    frenzyStacks?: number; // Specific to Kopro
    puppets?: number; // Specific to Gotka
    thorns?: number; // Specific to Aelita
    roseEmbers?: number; // Specific to Selina
    echoAura?: string | null; // Specific to Echo
    trapStacks?: number; // Specific to Miner
    poison?: number;
    frozen?: number;
    burn?: number;
    regen?: number;
    mute?: number;
    res?: number;
    resDown?: number;
    critStacks?: number;
    bleed?: number;
    beastMode?: 'Aggressive' | 'Protective';
    lastHitBlocked?: boolean;
    frozenTurns?: number;
    dmgBoost?: number;
    critChance?: number;
    skillDmg?: number;
    critDamage?: number;
    hpBoost?: number;
    hpFreeze?: number;
    smolderLink?: number;
    duelMark?: number;
    isolationMark?: number;
    defIgnoreBoost?: number;
    [key: string]: any;
  };
}

export interface BattleState {
  playerParty: Combatant[];
  enemyParty: Combatant[];
  turnQueue: Combatant[];
  activeUnit: Combatant | null;
  activeSkill?: Skill;
  isSubDmg?: boolean;
  logs: string[];
  damageDealt: Record<string, number>; // uid -> total damage
}

export type GameRoute = 'HUB' | 'BATTLE' | 'VICTORY' | 'DEFEAT' | 'ROSTER' | 'GACHA' | 'BP' | 'ABYSS' | 'DUNGEON' | 'META' | 'ARTIFACT_DUNGEON_SELECTOR' | 'STORY' | 'MAP' | 'BOSS_RUSH_MENU' | { type: 'BOSS_RUSH_BATTLE', stage: number, teams: string[][] };

export type ArtifactSlot = "flower" | "plume" | "sands" | "goblet" | "circlet";
export type StatType = "hp" | "atk" | "def" | "spd";
export type Rarity = "S" | "A" | "B";

export interface ArtifactSubStat {
  type: StatType | "critRate" | "critDamage";
  value: number;
}

export interface Artifact {
  id: string;
  slot: ArtifactSlot;
  setName: string;
  mainStat: { type: StatType | "critRate" | "critDamage"; value: number };
  subStats: ArtifactSubStat[];
  rarity: number; // 1-5
  level: number; // 0-20
}

export interface ArtifactSet {
  id: string;
  name: string;
  twoPieceBonus: string;
  fourPieceBonus: string;
  bonusEffect: (combatant: Combatant) => void;
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  level: number;
  entryCost: number; // Resin
  rewardSets: string[]; // IDs of artifact sets
  enemyTeam: string[]; // IDs of enemies
  effectDescription: string;
  effect: (battleState: BattleState) => void;
}

export interface CharData {
  level: number;
  constellation: number;
  artifacts?: Record<ArtifactSlot, string | null>;
}

export interface Expedition {
  id: string;
  charId: string;
  startTime: number;
  durationHours: number;
  completed: boolean;
  claimed: boolean;
}

export interface StoryStage {
  id: string;
  name: string;
  description: string;
  type: 'BATTLE' | 'DIALOGUE' | 'RIDDLE';
  enemyBlueprintIds?: string[];
  isBoss?: boolean;
  level: number;
  dialogue?: { speaker: string; text: string; charId?: string }[];
  riddle?: { 
    question: string; 
    options: string[]; 
    correctIndex: number;
    hint: string;
  };
  reward: { gems?: number; gold?: number; exp?: number };
}

export interface StoryChapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  stages: StoryStage[];
}

export interface PlayerProfile {
  gems: number; // Premium currency
  resin: number; // Energy
  gold: number;
  heroExp: number;
  clearedAbyssFloor: number;
  artifacts: Artifact[];
  roster: Record<string, CharData>;
  team: string[]; // Blueprint IDs of active team (legacy/current sync)
  teams: string[][]; // Array of 3 team compositions
  activeTeamIndex: number; // 0, 1, or 2
  bpExp: number;
  bpClaimedLevels: number[];
  bpClaimedLevelsPremium: number[];
  hasGoldenPass: boolean;
  lunarAbyssClaimed: number[]; // floors 9-12
  lunarAbyssResetTime: number; 
  achievements: Record<string, boolean>; // id -> claimed
  expeditions: Expedition[];
  events: Record<string, any>;
  gachaPityS?: number;
  gachaPityA?: number;
  gachaGuaranteed?: boolean;
  storyProgress?: {
    unlockedChapters: string[];
    completedStages: string[]; // IDs
  };
  mapState?: {
    claimedChests: string[]; // IDs of claimed chests
    completedAnomalies: string[]; // IDs of completed anomalies
    unlockedRegions: string[]; // list of unlocked region IDs
  };
  dailies: {
    battlesWon: number;
    skillsUsed: number;
    gachaPulls: number;
    resinsSpent: number;
    itemsBought: number;
    claimed: boolean[]; // 0: win a battle, 1: use 5 skills, 2: 1 gacha pull, 3: spend 20 resin, 4: buy item from shop
  };
}
