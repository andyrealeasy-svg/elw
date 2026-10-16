import React, { useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Trophy, Clock, Swords, Sword, Flame, Zap, Mountain, ChevronRight, Shield, Book, ArrowRight, RotateCcw, Package, Gem, Layers } from 'lucide-react';
import BattleScreen from './components/BattleScreen';
import CharacterMenu from './components/CharacterMenu';
import HubMenu from './components/HubMenu';
import AuthScreen from './components/AuthScreen';
import Gacha from './components/Gacha';
import BattlePass from './components/BattlePass';
import { AbyssMenu } from './components/AbyssMenu';
import { MetaGuide } from './components/MetaGuide';
import StoryMenu from './components/StoryMenu';
import { BossRushMenu } from './components/BossRushMenu';
import { DistortionMenu } from './components/DistortionMenu';
import { 
  createDistortionCombatant, 
  applyDistortionBuffsToParty, 
  generateDistortionWave, 
  DISTORTION_BUFFS,
  DISTORTION_EXP_PER_CLEAR,
  DISTORTION_WEEKLY_FULL_CLEAR_LIMIT,
  addDistortionExpToProgression,
  saveDistortionProgression
} from './data/distortionData';
import { characterBlueprints, createBasicEnemy, generateArtifact, ARTIFACT_DUNGEONS, STORY_CHAPTERS, generateAbyssWaves, createBossRushEnemy, generateBossRushWave, createGlitchSectorEnemy, createTrialEnemy, getCharSplash, formatStatName, formatStatValue, CHARACTER_PREFERENCES, getAdaptiveStoryStageLevel } from './data';
import { Combatant, PlayerProfile, GameRoute, Artifact, StoryStage, ArtifactSlot } from './types';
import { createGodArtifact, createMediumArtifact } from './components/BattlePassCheatMenu';
import ArtifactDungeon from './components/ArtifactDungeon';
import WorldMap from './components/WorldMap';
import { getNextThursdayResetTime } from './lib/utils';
import { parseTransferCode, usernameToUUID } from './lib/transferCode';

export interface BossRushStageResult {
  stage: number;
  stageTitle: string;
  bossName: string;
  bossElement: string;
  duration: number;
  party: Combatant[];
  stats: Record<string, number>;
  totalDamage: number;
}

// Mock initial profile for seamless dev testing
const defaultProfile: PlayerProfile = {
  gems: 1600,
  resin: 160,
  gold: 100000,
  heroExp: 50000,
  clearedAbyssFloor: 0,
  artifacts: [],
  roster: { 
     // Starter heroes
     moyan: { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } },
     kopro: { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } },
     vairen: { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } }
  },
  team: ['moyan', 'kopro'], // Up to 4 or 5
  teams: [['moyan', 'kopro'], ...Array(9).fill([])],
  activeTeamIndex: 0,
  bpExp: 250,
  bpClaimedLevels: [],
  bpClaimedLevelsPremium: [],
  hasGoldenPass: false,
  bpResetTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
  lunarAbyssClaimed: [],
  lunarAbyssResetTime: getNextThursdayResetTime(),
  bossRushSeason2Claimed: false,
  bossRushSeason3Claimed: false,
  bossRushSeason4Claimed: false,
  achievements: {},
  expeditions: [],
  events: {
    loginStreak: 0,
    lastLoginDay: 0,
    completedTestRuns: [],
    completedTrials: []
  },
  gachaPityS: 0,
  gachaPityA: 0,
  gachaGuaranteed: false,
  storyProgress: {
    unlockedChapters: ['chap1'],
    completedStages: []
  },
  mapState: {
    claimedChests: [],
    completedAnomalies: [],
    unlockedRegions: []
  },
  dailies: {
    battlesWon: 0,
    skillsUsed: 0,
    gachaPulls: 0,
    resinsSpent: 0,
    itemsBought: 0,
    claimed: [false, false, false, false, false]
  }
};

export const getUserStorageKey = (uid: string | null): string => {
  if (!uid || uid === 'local_user') return 'ed_profile_guest';
  return `ed_profile_${uid}`;
};

export const normalizeAndMigrateProfile = (raw: any): PlayerProfile => {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(defaultProfile));
  }

  const parsed = { ...raw };

  const sanitizeArtifact = (a: any) => {
    if (!a || !a.mainStat) return a;
    const currentLevel = Math.min(a.level || 0, 20);

    let mainVal = a.mainStat.value || 0;
    if (a.mainStat.type === "critRate") {
      mainVal = Math.min(mainVal, Math.round((3.1 + currentLevel * 1.4) * 10) / 10);
    } else if (a.mainStat.type === "critDamage") {
      mainVal = Math.min(mainVal, Math.round((6.2 + currentLevel * 2.8) * 10) / 10);
    } else {
      // Auto-fix any previous bugged artifacts generated with 46.6 or 58.3 at level 20
      if (currentLevel >= 15) {
        if (a.mainStat.type === "hp" && mainVal < 500) mainVal = 2400;
        else if (a.mainStat.type === "atk" && mainVal < 350) mainVal = 1800;
        else if (a.mainStat.type === "def" && mainVal < 250) mainVal = 1200;
        else if (a.mainStat.type === "spd" && mainVal < 15) mainVal = 35;
      }
      const cap = a.mainStat.type === "hp" ? 4800 : 2500;
      if (mainVal > cap) mainVal = cap;
      mainVal = Math.round(mainVal);
    }

    const subStats = (a.subStats || []).map((s: any) => {
      if (!s) return s;
      let sVal = s.value || 0;
      if (s.type === "critRate") {
        sVal = Math.round(Math.min(sVal, 20) * 10) / 10;
      } else if (s.type === "critDamage") {
        sVal = Math.round(Math.min(sVal, 40) * 10) / 10;
      } else {
        if (sVal > 1200) sVal = 1200;
        sVal = Math.round(sVal);
      }
      return { ...s, value: sVal };
    });

    return {
      ...a,
      level: currentLevel,
      mainStat: { ...a.mainStat, value: mainVal },
      subStats
    };
  };

  // Migration: Cap artifact levels to 20 and normalize stats
  let artifacts = parsed.artifacts;
  if (Array.isArray(artifacts)) {
    artifacts = artifacts.map(sanitizeArtifact);
  } else {
    artifacts = [];
  }

  let roster = parsed.roster ? { ...parsed.roster } : { ...defaultProfile.roster };
  if (!roster.vairen) {
    roster.vairen = { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } };
  }
  Object.keys(roster).forEach((charKey) => {
    const charObj = roster[charKey];
    if (charObj && charObj.artifacts) {
      const newArts: any = {};
      Object.keys(charObj.artifacts).forEach((slotKey) => {
        if (charObj.artifacts[slotKey]) {
          newArts[slotKey] = sanitizeArtifact(charObj.artifacts[slotKey]);
        } else {
          newArts[slotKey] = null;
        }
      });
      roster[charKey] = { ...charObj, artifacts: newArts };
    }
  });

  const teams = parsed.teams || [parsed.team || ['moyan', 'kopro'], ...Array(9).fill([])];
  while (teams.length < 10) teams.push([]);
  const activeTeamIndex = (parsed.activeTeamIndex !== undefined && parsed.activeTeamIndex >= 0 && parsed.activeTeamIndex < 10) 
    ? parsed.activeTeamIndex 
    : 0;

  // Daily Reset Logic
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastReset = parsed.events?.lastLoginDay || 0;

  let resetDailies = parsed.dailies ? { ...parsed.dailies } : { ...defaultProfile.dailies };
  let resetEvents = parsed.events ? { ...parsed.events } : { ...defaultProfile.events };

  if (lastReset < startOfDay) {
    resetDailies = {
      battlesWon: 0,
      skillsUsed: 0,
      gachaPulls: 0,
      resinsSpent: 0,
      itemsBought: 0,
      claimed: [false, false, false, false, false]
    };
    resetEvents = {
      ...resetEvents,
      lastLoginDay: startOfDay
    };
  }

  // BP reset
  let bpExp = parsed.bpExp ?? defaultProfile.bpExp;
  let bpClaimedLevels = parsed.bpClaimedLevels || [];
  let bpClaimedLevelsPremium = parsed.bpClaimedLevelsPremium || [];
  let hasGoldenPass = !!parsed.hasGoldenPass;
  let bpResetTime = parsed.bpResetTime || (now.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (now.getTime() >= bpResetTime) {
    bpExp = 0;
    bpClaimedLevels = [];
    bpClaimedLevelsPremium = [];
    hasGoldenPass = false;
    bpResetTime = now.getTime() + 3 * 24 * 60 * 60 * 1000;
  }

  // Lunar abyss reset
  let lunarAbyssClaimed = parsed.lunarAbyssClaimed || [];
  let lunarAbyssResetTime = parsed.lunarAbyssResetTime || getNextThursdayResetTime();
  if (now.getTime() >= lunarAbyssResetTime) {
    lunarAbyssClaimed = [];
    lunarAbyssResetTime = getNextThursdayResetTime();
  }

  return { 
    ...defaultProfile, 
    ...parsed, 
    artifacts,
    roster,
    teams,
    activeTeamIndex,
    team: teams[activeTeamIndex] || ['moyan', 'kopro'],
    dailies: resetDailies,
    events: resetEvents,
    bpExp,
    bpClaimedLevels,
    bpClaimedLevelsPremium,
    hasGoldenPass,
    bpResetTime,
    lunarAbyssClaimed,
    lunarAbyssResetTime,
    expeditions: parsed.expeditions || [],
    achievements: parsed.achievements || {},
    mapState: parsed.mapState || { claimedChests: [], completedAnomalies: [], unlockedRegions: [] },
    storyProgress: parsed.storyProgress || { unlockedChapters: ['chap1'], completedStages: [] }
  };
};

export const getProfileProgressScore = (p: any): number => {
  if (!p || typeof p !== 'object') return 0;
  let score = 0;
  if (p.roster && typeof p.roster === 'object') {
    const chars = Object.keys(p.roster);
    score += chars.length * 100;
    chars.forEach((c) => {
      const charObj = p.roster[c];
      const lvl = charObj?.level || 1;
      score += lvl * 10;
      if (charObj?.constellation) score += charObj.constellation * 50;
    });
  }
  if (Array.isArray(p.artifacts)) {
    score += p.artifacts.length * 20;
    p.artifacts.forEach((a: any) => {
      score += (a?.level || 0) * 5;
    });
  }
  if (p.clearedAbyssFloor) score += p.clearedAbyssFloor * 100;
  if (p.storyProgress?.completedStages?.length) {
    score += p.storyProgress.completedStages.length * 50;
  }
  if (p.gems && p.gems > 1600) score += Math.floor((p.gems - 1600) / 160) * 10;
  if (p.gold && p.gold > 100000) score += Math.floor((p.gold - 100000) / 10000) * 5;
  return score;
};

export const getBestLegacySave = (): { profile: PlayerProfile; source: string; score: number } | null => {
  const sources = [
    'ed_profile_v3',
    'ed_profile_backup',
    'ed_profile_v2',
    'ed_profile_v1',
    'ed_profile',
    'game_profile',
    'ed_profile_guest',
  ];
  let best: { profile: PlayerProfile; source: string; score: number } | null = null;
  for (const src of sources) {
    try {
      const raw = localStorage.getItem(src);
      if (raw) {
        const parsed = JSON.parse(raw);
        const norm = normalizeAndMigrateProfile(parsed);
        const score = getProfileProgressScore(norm);
        if (!best || score > best.score) {
          best = { profile: norm, source: src, score };
        }
      }
    } catch (e) {}
  }
  return best;
};

export const loadLocalProfileForUser = (uid: string | null): PlayerProfile => {
  const key = getUserStorageKey(uid);
  try {
    let saved = localStorage.getItem(key) || localStorage.getItem(`${key}_backup`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const norm = normalizeAndMigrateProfile(parsed);
      const score = getProfileProgressScore(norm);
      if (score > 220) {
        return norm;
      }
    }
    // If user's specific key has no save or only blank initial progress (<=220), check if legacy save exists
    const bestLegacy = getBestLegacySave();
    if (bestLegacy && bestLegacy.score > 220) {
      return bestLegacy.profile;
    }
    if (saved) {
      return normalizeAndMigrateProfile(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Error loading local profile for user:', e);
  }
  return JSON.parse(JSON.stringify(defaultProfile));
};

export default function App() {
  const [route, setRoute] = useState<GameRoute | 
    { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT', runs?: number } |
    { type: 'ABYSS_FLOOR', level: number, floorId: number } |
    { type: 'STORY_STAGE', stage: StoryStage, chapterId?: string } |
    { type: 'GLITCH_BATTLE', sectorId: number, level: number, name: string, rewardGems: number, rewardGold: number } |
    { type: 'TRIAL_BATTLE', trialId: number, title: string, rewardGems: number, rewardGold: number, team?: string[], isTestRun?: boolean, testId?: string }
  >('HUB');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileDbId, setProfileDbId] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    return JSON.parse(JSON.stringify(defaultProfile));
  });
  const [lastDrops, setLastDrops] = useState<{exp: number, gold: number, gems: number, artifacts: Artifact[]} | null>(null);
  const [lastDamageDealt, setLastDamageDealt] = useState<Record<string, number> | null>(null);
  const [lastBattleParty, setLastBattleParty] = useState<Combatant[]>([]);
  const [bossRushResults, setBossRushResults] = useState<BossRushStageResult[] | null>(null);
  const [bossRushTab, setBossRushTab] = useState<'all' | number>('all');
  const [lastStoryStage, setLastStoryStage] = useState<StoryStage | null>(null);
  const [lastStoryChapterId, setLastStoryChapterId] = useState<string>('chap1');
  const [lastDistortionStageResult, setLastDistortionStageResult] = useState<{ 
    clearedStage: number; 
    nextStage: number;
    expEarned?: number;
    newLevel?: number;
    weeklyFullClearsClaimed?: number;
    canClaimDirectRewards?: boolean;
    weeklyLimitReached?: boolean;
  } | null>(null);
  const [lastAbyssFloorResult, setLastAbyssFloorResult] = useState<{
    floorId: number;
    isLunar: boolean;
    wasAlreadyCleared: boolean;
  } | null>(null);
  const isVictoryProcessingRef = useRef(false);

  // Reset battle victory lock whenever a new battle route is entered
  React.useEffect(() => {
    if (typeof route === 'object') {
      isVictoryProcessingRef.current = false;
    }
  }, [route]);

  const handleLogin = (user: string, uid: string, initialProfile?: PlayerProfile) => {
    setUsername(user);
    setUserId(uid);
    setIsAuthenticated(true);
    setIsProfileLoaded(false);

    if (initialProfile) {
      setProfile(initialProfile);
      const key = getUserStorageKey(uid);
      try {
        localStorage.setItem(key, JSON.stringify(initialProfile));
        localStorage.setItem(`${key}_backup`, JSON.stringify(initialProfile));
      } catch (e) {}
    } else {
      const local = loadLocalProfileForUser(uid);
      setProfile(local);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ed_user');
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
    setProfileDbId(null);
    setIsProfileLoaded(false);
    setProfile(JSON.parse(JSON.stringify(defaultProfile)));
    setRoute('HUB');
  };

  // Synchronize profile from Supabase when user enters game with nickname
  React.useEffect(() => {
    if (!isAuthenticated || !username) {
      return;
    }

    let isCancelled = false;
    setIsProfileLoaded(false);

    const loadProfile = async () => {
      try {
        const cleanNick = (username || '').trim();
        const effectiveUserId = userId || usernameToUUID(cleanNick);
        let cloudRow: { id: string; username: string; game_data: any } | null = null;
        let rlsError: any = null;

        // 1. First attempt: search by nickname (case-insensitive) in profiles table
        if (cleanNick) {
          const byUser = await supabase
            .from('profiles')
            .select('id, username, game_data')
            .ilike('username', cleanNick)
            .maybeSingle();

          if (byUser.data) {
            cloudRow = byUser.data;
          } else if (byUser.error) {
            if (byUser.error.code === '42501' || byUser.error.message?.includes('policy') || byUser.error.message?.includes('security')) {
              rlsError = byUser.error;
            }
          }
        }

        // 2. Second attempt: search by id in profiles table
        if (!cloudRow && effectiveUserId) {
          const byId = await supabase
            .from('profiles')
            .select('id, username, game_data')
            .eq('id', effectiveUserId)
            .maybeSingle();

          if (byId.data) {
            cloudRow = byId.data;
          } else if (byId.error) {
            if (byId.error.code === '42501' || byId.error.message?.includes('policy') || byId.error.message?.includes('security')) {
              rlsError = byId.error;
            }
          }
        }

        if (isCancelled) return;

        if (rlsError) {
          console.warn('Supabase RLS is currently blocking read access to profiles table:', rlsError);
        }

        if (cloudRow && cloudRow.game_data) {
          // Found existing cloud profile in DB for this nickname
          setProfileDbId(cloudRow.id);
          let rawData = cloudRow.game_data;
          if (typeof rawData === 'string') {
            try { rawData = JSON.parse(rawData); } catch (e) {}
          }
          let cloudProfile = normalizeAndMigrateProfile(rawData);
          const cloudScore = getProfileProgressScore(cloudProfile);
          const bestLegacy = getBestLegacySave();

          // If cloud record is blank but this local machine has existing gameplay progress:
          if (cloudScore <= 330 && bestLegacy && bestLegacy.score > 330) {
            console.log('Adopting local progress into cloud profile for:', cleanNick);
            cloudProfile = bestLegacy.profile;
            try {
              await supabase.from('profiles').upsert({
                id: cloudRow.id,
                username: cleanNick,
                game_data: cloudProfile
              });
            } catch (e) {}
          }

          if (!isCancelled) {
            setProfile(cloudProfile);
            const key = getUserStorageKey(effectiveUserId);
            try {
              localStorage.setItem(key, JSON.stringify(cloudProfile));
              localStorage.setItem(`${key}_backup`, JSON.stringify(cloudProfile));
            } catch (e) {}
          }
        } else {
          // No profile found in DB for this nickname
          const key = getUserStorageKey(effectiveUserId);
          const existingLocal = localStorage.getItem(key);
          const bestLegacy = getBestLegacySave();

          let targetProfile: PlayerProfile;
          if (existingLocal) {
            targetProfile = normalizeAndMigrateProfile(JSON.parse(existingLocal));
          } else if (bestLegacy && bestLegacy.score > 330) {
            console.log('Adopting existing local save into new profile for:', cleanNick);
            targetProfile = bestLegacy.profile;
          } else {
            targetProfile = JSON.parse(JSON.stringify(defaultProfile));
          }

          if (!isCancelled) {
            setProfile(targetProfile);
            try {
              localStorage.setItem(key, JSON.stringify(targetProfile));
              localStorage.setItem(`${key}_backup`, JSON.stringify(targetProfile));
            } catch (e) {}

            // Save to DB if targetProfile actually has progress
            if (getProfileProgressScore(targetProfile) > 330) {
              setProfileDbId(effectiveUserId);
              try {
                await supabase.from('profiles').upsert({
                  id: effectiveUserId,
                  username: cleanNick,
                  game_data: targetProfile
                });
              } catch (e) {}
            }
          }
        }
      } catch (e) {
        console.error('Error in loadProfile:', e);
      } finally {
        if (!isCancelled) {
          setIsProfileLoaded(true);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, username, userId]);

  const handleRestoreBackup = async (): Promise<{ success: boolean; message: string }> => {
    const bestLegacy = getBestLegacySave();
    if (!bestLegacy || bestLegacy.score <= 330) {
      return { success: false, message: 'Локальных резервных копий с прогрессом не найдено.' };
    }

    setProfile(bestLegacy.profile);
    const cleanNick = (username || 'Игрок').trim();
    const effectiveId = profileDbId || userId || usernameToUUID(cleanNick);
    const storageKey = getUserStorageKey(effectiveId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(bestLegacy.profile));
      localStorage.setItem(`${storageKey}_backup`, JSON.stringify(bestLegacy.profile));
    } catch (e) {}
    
    try {
      await supabase.from('profiles').upsert({
        id: effectiveId,
        username: cleanNick,
        game_data: bestLegacy.profile
      });
    } catch (e) {
      console.error(e);
    }
    return {
      success: true,
      message: `Прогресс успешно восстановлен из «${bestLegacy.source}» (${Object.keys(bestLegacy.profile.roster || {}).length} персонажей, ${bestLegacy.profile.gems} кристаллов)!`
    };
  };

  const handleForceSyncCloud = async (): Promise<{ success: boolean; message: string }> => {
    const cleanNick = (username || '').trim();
    if (!cleanNick) {
      return { success: false, message: 'Сначала укажите никнейм.' };
    }
    const targetId = profileDbId || userId || usernameToUUID(cleanNick);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: targetId,
        username: cleanNick,
        game_data: profile
      });
      if (error) {
        if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('security')) {
          return {
            success: false,
            message: 'Ошибка: В Supabase включена блокировка RLS. Отключите её в Supabase SQL Editor: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
          };
        }
        throw error;
      }
      setProfileDbId(targetId);
      return { success: true, message: `Профиль «${cleanNick}» успешно сохранён в облако Supabase!` };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: 'Ошибка сохранения в облако: ' + (e?.message || 'Сеть недоступна') };
    }
  };

  const handleForceLoadCloud = async (): Promise<{ success: boolean; message: string }> => {
    const cleanNick = (username || '').trim();
    if (!cleanNick) {
      return { success: false, message: 'Укажите никнейм для загрузки из облака.' };
    }
    try {
      let cloudRow: { id: string; username: string; game_data: any } | null = null;
      let rlsErr: any = null;

      // 1. Search by nickname (case-insensitive)
      const byUser = await supabase
        .from('profiles')
        .select('id, username, game_data')
        .ilike('username', cleanNick)
        .maybeSingle();

      if (byUser.data) {
        cloudRow = byUser.data;
      } else if (byUser.error) {
        if (byUser.error.code === '42501' || byUser.error.message?.includes('policy') || byUser.error.message?.includes('security')) {
          rlsErr = byUser.error;
        }
      }

      // 2. Search by id
      const effectiveId = profileDbId || userId || usernameToUUID(cleanNick);
      if (!cloudRow && effectiveId) {
        const byId = await supabase
          .from('profiles')
          .select('id, username, game_data')
          .eq('id', effectiveId)
          .maybeSingle();

        if (byId.data) {
          cloudRow = byId.data;
        } else if (byId.error && (byId.error.code === '42501' || byId.error.message?.includes('policy'))) {
          rlsErr = byId.error;
        }
      }

      if (rlsErr) {
        return {
          success: false,
          message: 'Доступ заблокирован RLS в Supabase. Для загрузки без авторизации отключите RLS в SQL Editor: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
        };
      }

      if (!cloudRow || !cloudRow.game_data) {
        return { 
          success: false, 
          message: `В БД не найден профиль с ником «${cleanNick}». Убедитесь, что ник совпадает с тем, что записан в таблице profiles.` 
        };
      }

      setProfileDbId(cloudRow.id);
      let rawData = cloudRow.game_data;
      if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) {}
      }
      const cloudProfile = normalizeAndMigrateProfile(rawData);
      setProfile(cloudProfile);
      
      const storageKey = getUserStorageKey(effectiveId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(cloudProfile));
        localStorage.setItem(`${storageKey}_backup`, JSON.stringify(cloudProfile));
      } catch (e) {}

      const count = Object.keys(cloudProfile.roster || {}).length;
      return {
        success: true,
        message: `Профиль «${cloudRow.username || cleanNick}» успешно загружен: ${count} героев, ${cloudProfile.gems} кристаллов, этаж ${cloudProfile.clearedAbyssFloor || 0} Бездны!`
      };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: 'Ошибка загрузки из облака: ' + (e?.message || 'Сеть недоступна') };
    }
  };

  const handleImportTransferCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const parsed = parseTransferCode(code);
    if (!parsed) {
      return { success: false, message: 'Неверный код переноса. Убедитесь, что скопировали код полностью (начинается с DD-).' };
    }

    const norm = normalizeAndMigrateProfile(parsed);
    setProfile(norm);
    const cleanNick = (username || 'Игрок').trim();
    const effectiveId = profileDbId || userId || usernameToUUID(cleanNick);
    const storageKey = getUserStorageKey(effectiveId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(norm));
      localStorage.setItem(`${storageKey}_backup`, JSON.stringify(norm));
    } catch (e) {}

    try {
      await supabase.from('profiles').upsert({
        id: effectiveId,
        username: cleanNick,
        game_data: norm
      });
    } catch (e) {}

    const count = Object.keys(norm.roster || {}).length;
    return {
      success: true,
      message: `Прогресс успешно импортирован: ${count} героев, ${norm.gems} 💎, ${norm.gold.toLocaleString()} 🪙!`
    };
  };

  // Sync profile changes to Supabase and LocalStorage (isolated per user)
  React.useEffect(() => {
    if (!isAuthenticated || !username || !isProfileLoaded) {
      return;
    }

    const cleanNick = username.trim();
    const effectiveId = profileDbId || userId || usernameToUUID(cleanNick);
    const storageKey = getUserStorageKey(effectiveId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem(`${storageKey}_backup`, JSON.stringify(profile));
    } catch (e) {}

    const syncToDB = async () => {
      try {
        await supabase.from('profiles').upsert({
          id: effectiveId,
          username: cleanNick,
          game_data: profile
        });
      } catch (e) {
        console.error('Failed to auto-sync to DB:', e);
      }
    };
    const timer = setTimeout(syncToDB, 1500);
    return () => clearTimeout(timer);
  }, [profile, isAuthenticated, userId, username, profileDbId, isProfileLoaded]);


  // Periodic Daily Reset Check
  React.useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const nowTime = now.getTime();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      setProfile(p => {
        let updated = false;
        let newP = { ...p };

        // Daily Reset
        const lastReset = p.events?.lastLoginDay || 0;
        if (lastReset < startOfDay) {
          newP = {
            ...newP,
            dailies: {
              battlesWon: 0,
              skillsUsed: 0,
              gachaPulls: 0,
              resinsSpent: 0,
              itemsBought: 0,
              claimed: [false, false, false, false, false]
            },
            events: {
              ...p.events,
              lastLoginDay: startOfDay
            }
          };
          updated = true;
        }

        // Battle Pass Reset
        if (nowTime > (p.bpResetTime || 0)) {
           newP = {
              ...newP,
              bpExp: 0,
              bpClaimedLevels: [],
              bpClaimedLevelsPremium: [],
              hasGoldenPass: false,
              bpResetTime: nowTime + 3 * 24 * 60 * 60 * 1000
           };
           updated = true;
        }

        // Lunar Abyss Reset (every Thursday 04:00 AM)
        if (nowTime > (p.lunarAbyssResetTime || 0)) {
           newP = {
              ...newP,
              lunarAbyssClaimed: [],
              lunarAbyssResetTime: getNextThursdayResetTime()
           };
           updated = true;
        }

        return updated ? newP : p;
      });
    };

    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Derive active teams
  const getPartyFromIds = (teamIds: string[]): Combatant[] => {
    return teamIds.map(id => {
       const data = profile.roster[id];
       const equippedArts = profile.artifacts.filter(a => data?.artifacts ? Object.values(data.artifacts).includes(a.id) : false);
       return characterBlueprints[id](id, data?.level || 1, data?.constellation || 0, equippedArts);
    });
  };

  const playerParty: Combatant[] = (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE')
    ? getPartyFromIds(route.teams[route.stage])
    : (typeof route === 'object' && route.type === 'TRIAL_BATTLE' && route.team)
    ? route.team.map((id: string) => { 
        const prefSet = CHARACTER_PREFERENCES[id]?.sets?.[0] || 'gladiator';
        const slots: ArtifactSlot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
        const trialArts = slots.map(slot => createMediumArtifact(slot, prefSet, id));
        const c = characterBlueprints[id](id, 75, 0, trialArts); 
        if (c.stats.spd < 118) c.stats.spd = 118; 
        return c; 
      })
    : getPartyFromIds(profile.team);

  const getEnemies = (level: number) => {
     return Array.from({ length: Math.min(level, 4) }).map(() => createBasicEnemy(level));
  };

  const handleVictory = (stats: Record<string, number>, finalParty?: Combatant[]) => {
    // Prevent duplicate victory triggers (e.g. from backgrounded Telegram Mini App, WebView sleep/wake, or race conditions)
    if (isVictoryProcessingRef.current || typeof route !== 'object') {
      return;
    }
    isVictoryProcessingRef.current = true;

    if (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE') {
      const stageParty = (finalParty && finalParty.length > 0) ? finalParty : getPartyFromIds(route.teams[route.stage]);
      const bossConfig = [
        { name: '«Магистр Теней»', element: 'Physical', title: 'Этап 1: «Магистр Теней» (Physical)' },
        { name: '«Сверхпроводящий Колосс»', element: 'Electro', title: 'Этап 2: «Сверхпроводящий Колосс» (Electro)' },
        { name: '«Абсолютный Ноль»', element: 'Cryo', title: 'Этап 3: «Абсолютный Ноль» (Cryo)' }
      ][route.stage] || { name: 'Босс', element: 'Electro', title: `Этап ${route.stage + 1}` };

      const totalDmg = stageParty.reduce((sum, p) => sum + (stats[p.uid] || 0), 0);
      const stageResult: BossRushStageResult = {
        stage: route.stage,
        stageTitle: bossConfig.title,
        bossName: bossConfig.name,
        bossElement: bossConfig.element,
        duration: Math.max(1, (stats.__duration as number) || 1),
        party: stageParty,
        stats: { ...stats },
        totalDamage: totalDmg
      };

      if (route.stage < 2) {
         setBossRushResults(prev => [...(prev || []), stageResult]);
         setLastDamageDealt(stats);
         setLastBattleParty(stageParty);
         isVictoryProcessingRef.current = false;
         setRoute({ ...route, stage: route.stage + 1 });
         return;
      }
      
      // Stage 2 (final 3rd stage) clear rewards
      const allResults = [...(bossRushResults || []), stageResult];
      setBossRushResults(allResults);
      setBossRushTab('all');
      setLastDamageDealt(stats);
      setLastBattleParty(stageParty);

      const alreadyClaimed = !!profile.bossRushSeason4Claimed;
      const expReward = alreadyClaimed ? 6000 : 30000;
      const goldReward = alreadyClaimed ? 20000 : 150000;
      const gemsDrop = alreadyClaimed ? 0 : 1500;
      const droppedArtifacts = alreadyClaimed ? [] : [
         ...Array.from({length: 5}, () => generateArtifact("dark_grove", 5)),
         ...Array.from({length: 5}, () => generateArtifact("wild_hunt", 5))
      ];
      
      setProfile(p => ({
         ...p,
         bossRushSeason4Claimed: true,
         gems: p.gems + gemsDrop,
         gold: p.gold + goldReward,
         heroExp: p.heroExp + expReward,
         artifacts: [...p.artifacts, ...droppedArtifacts],
         dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 3 },
         bpExp: p.bpExp + 300
      }));
      setLastDrops({ exp: expReward, gold: goldReward, gems: gemsDrop, artifacts: droppedArtifacts });
      setRoute('VICTORY');
      return;
    }

    setBossRushResults(null);
    setLastBattleParty((finalParty && finalParty.length > 0) ? finalParty : playerParty);

    const isAbyss = typeof route === 'object' && route.type === 'ABYSS_FLOOR';
    const isStory = typeof route === 'object' && route.type === 'STORY_STAGE';
    const isGlitch = typeof route === 'object' && route.type === 'GLITCH_BATTLE';
    const isTrial = typeof route === 'object' && route.type === 'TRIAL_BATTLE';
    
    if (isGlitch && typeof route === 'object' && route.type === 'GLITCH_BATTLE') {
      const rewardGems = route.rewardGems;
      const rewardGold = route.rewardGold;
      const sectorId = route.sectorId;

      setProfile(p => ({
        ...p,
        gems: p.gems + rewardGems,
        gold: p.gold + rewardGold,
        events: {
          ...p.events,
          clearedSectors: [...(p.events.clearedSectors || []), sectorId]
        },
        dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 }
      }));

      setLastDrops({ exp: 0, gold: rewardGold, gems: rewardGems, artifacts: [] });
      setLastDamageDealt(stats);
      setRoute('VICTORY');
      return;
    }

    if (isTrial && typeof route === 'object' && route.type === 'TRIAL_BATTLE') {
      const trialId = route.trialId;
      const testId = route.testId;
      const isTestRun = Boolean(route.isTestRun);
      const isGroveCombat = Boolean(testId && testId.startsWith('grove_combat_'));

      // Check if this test run, grove stage, or trial was already completed before
      const alreadyCompleted = isGroveCombat
        ? ((profile.events && profile.events.wildGroveCombat) || []).includes(testId!)
        : (isTestRun && testId)
        ? ((profile.events && profile.events.completedTestRuns) || []).includes(testId)
        : ((profile.events && profile.events.completedTrials) || []).includes(trialId);

      // Gems and gold rewards are granted ONLY on the FIRST successful completion
      const actualGems = alreadyCompleted ? 0 : (route.rewardGems || 0);
      const actualGold = alreadyCompleted ? 0 : (route.rewardGold || 0);

      setProfile(p => {
        const events = p.events || {};
        const prevCompletedTestRuns: string[] = events.completedTestRuns || [];
        const newCompletedTestRuns = (isTestRun && testId && !prevCompletedTestRuns.includes(testId))
          ? [...prevCompletedTestRuns, testId]
          : prevCompletedTestRuns;

        const prevWildGroveCombat: string[] = events.wildGroveCombat || [];
        const newWildGroveCombat = (isGroveCombat && testId && !prevWildGroveCombat.includes(testId))
          ? [...prevWildGroveCombat, testId]
          : prevWildGroveCombat;

        const prevCompletedTrials: number[] = events.completedTrials || [];
        const newCompletedTrials = (!isTestRun && !isGroveCombat && !prevCompletedTrials.includes(trialId))
          ? [...prevCompletedTrials, trialId]
          : prevCompletedTrials;

        return {
          ...p,
          gems: p.gems + actualGems,
          gold: p.gold + actualGold,
          events: {
            ...events,
            completedTestRuns: newCompletedTestRuns,
            wildGroveCombat: newWildGroveCombat,
            completedTrials: newCompletedTrials
          },
          dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 }
        };
      });

      setLastDrops({ exp: 0, gold: actualGold, gems: actualGems, artifacts: [] });
      setLastDamageDealt(stats);
      setRoute('VICTORY');
      return;
    }

    if (typeof route === 'object' && route.type === 'DISTORTION_BATTLE') {
      const currentStage = Math.max(1, Math.min(10, Math.floor(Number(route.stage) || 1)));
      const duration = (stats.__duration as number) || 10;
      const distortionBattleParty = (finalParty && finalParty.length > 0)
        ? finalParty
        : route.teamSlots.map((slot, idx) => createDistortionCombatant(slot.charId, slot.usePlayerBuild, profile, idx));
      
      try {
        const saved = localStorage.getItem('ed_distortion_run_state_v1');
        const stateObj = saved ? JSON.parse(saved) : {};
        
        if (currentStage >= 10) {
          // Final Victory (Stage 10 Defeated)
          localStorage.removeItem('ed_distortion_run_state_v1');
          
          // Add Distortion Level EXP
          const expResult = addDistortionExpToProgression(DISTORTION_EXP_PER_CLEAR, profile);
          const canClaimDirectRewards = expResult.updatedProgression.weeklyFullClearsClaimed < DISTORTION_WEEKLY_FULL_CLEAR_LIMIT;

          if (canClaimDirectRewards) {
            expResult.updatedProgression.weeklyFullClearsClaimed += 1;
            saveDistortionProgression(expResult.updatedProgression);

            const droppedArts: Artifact[] = [];
            for (let i = 0; i < 12; i++) {
              const randomSet = ARTIFACT_DUNGEONS[Math.floor(Math.random() * ARTIFACT_DUNGEONS.length)].rewardSets[0];
              droppedArts.push(generateArtifact(randomSet, 5));
            }

            setProfile(p => ({
              ...p,
              gems: p.gems + 1500,
              gold: p.gold + 150000,
              heroExp: p.heroExp + 50000,
              artifacts: [...p.artifacts, ...droppedArts],
              dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 },
              bpExp: p.bpExp + 2000,
              distortionProgress: expResult.updatedProgression
            }));

            setLastDrops({ exp: 50000, gold: 150000, gems: 1500, artifacts: droppedArts });
          } else {
            saveDistortionProgression(expResult.updatedProgression);

            setProfile(p => ({
              ...p,
              dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 },
              bpExp: p.bpExp + 500,
              distortionProgress: expResult.updatedProgression
            }));

            setLastDrops({ exp: 0, gold: 0, gems: 0, artifacts: [] });
          }

          setLastDamageDealt(stats);
          setLastBattleParty(distortionBattleParty);
          setLastDistortionStageResult({ 
            clearedStage: 10, 
            nextStage: 10,
            expEarned: expResult.effectiveExpAdded,
            newLevel: expResult.updatedProgression.level,
            weeklyFullClearsClaimed: expResult.updatedProgression.weeklyFullClearsClaimed,
            canClaimDirectRewards,
            weeklyLimitReached: expResult.weeklyLimitReached
          });
          setRoute('VICTORY');
          return;
        } else if (currentStage === 5) {
          // Stage 5 Mid-boss cleared -> Checkpoint (5 options, pick 3)
          const active = route.distortionBuffIds || [];
          const available = DISTORTION_BUFFS.filter(b => !active.includes(b.id)).map(b => b.id);
          const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 5);

          const updatedState = {
            currentStage: 6,
            activeBuffIds: active,
            team: route.teamSlots,
            status: 'CHECKPOINT_STAGE_5',
            pendingBuffPicks: shuffled,
            pendingPickCount: 3,
            selectedInBatch: [],
            historyStages: [...(stateObj.historyStages || []), { stage: 5, duration }]
          };
          localStorage.setItem('ed_distortion_run_state_v1', JSON.stringify(updatedState));

          // Stage completion without direct currency rewards (moved to Distortion Levels)
          setProfile(p => ({ 
            ...p, 
            dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 },
            bpExp: p.bpExp + 100
          }));
          setLastDrops({ exp: 0, gold: 0, gems: 0, artifacts: [] });
          setLastDamageDealt(stats);
          setLastBattleParty(distortionBattleParty);
          setLastDistortionStageResult({ clearedStage: 5, nextStage: 6 });
          setRoute('VICTORY');
          return;
        } else {
          // Normal Stage cleared (1..4, 6..9)
          const nextStage = currentStage + 1;
          const active = route.distortionBuffIds || [];
          const available = DISTORTION_BUFFS.filter(b => !active.includes(b.id)).map(b => b.id);
          const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3);

          const updatedState = {
            currentStage: nextStage,
            activeBuffIds: active,
            team: route.teamSlots,
            status: 'SELECTING_BUFFS',
            pendingBuffPicks: shuffled,
            pendingPickCount: 1,
            selectedInBatch: [],
            historyStages: [...(stateObj.historyStages || []), { stage: currentStage, duration }]
          };
          localStorage.setItem('ed_distortion_run_state_v1', JSON.stringify(updatedState));

          // Stage completion without direct currency rewards (moved to Distortion Levels)
          setProfile(p => ({ 
            ...p, 
            dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 },
            bpExp: p.bpExp + 50
          }));
          setLastDrops({ exp: 0, gold: 0, gems: 0, artifacts: [] });
          setLastDamageDealt(stats);
          setLastBattleParty(distortionBattleParty);
          setLastDistortionStageResult({ clearedStage: currentStage, nextStage });
          setRoute('VICTORY');
          return;
        }
      } catch (e) {
        setRoute('DISTORTION');
        return;
      }
    }

    const dungeonLevel = typeof route === 'object' 
      ? (route.type === 'STORY_STAGE' 
          ? getAdaptiveStoryStageLevel(route.stage, (route as any).chapterId || 'chap1', profile)
          : (route as any).level || 1) 
      : 1;
    const dungeonType = typeof route === 'object' && route.type === 'DUNGEON' ? route.dungeonType : 'EXP';
    const dungeonRuns = (typeof route === 'object' && route.type === 'DUNGEON' && route.runs) ? route.runs : 1;
    
    // Tiered rewards for dungeons (1-6)
    const goldTiers = [6000, 12000, 20000, 32000, 45000, 65000];
    const expTiers = [3000, 6000, 10000, 15000, 20000, 30000];

    let expReward = dungeonLevel <= 6 ? (expTiers[dungeonLevel - 1] || dungeonLevel * 4000) : dungeonLevel * 1000;
    let goldReward = dungeonLevel <= 6 ? (goldTiers[dungeonLevel - 1] || dungeonLevel * 8000) : dungeonLevel * 4000;
    let artifactDropChance = 0.5;
    let gemsDrop = Math.random() > 0.5 ? Math.floor(Math.random() * 5 * dungeonLevel) + 1 : 0;
    let abyssGems = 0;
    let newFloorCleared = 0;
    let possibleSets = ["gladiator", "noblesse"];
    let isAbyssAlreadyCleared = false;
    let abyssFloorId = 0;
    let isLunarAbyssFloor = false;

    if (isAbyss && typeof route === 'object' && route.type === 'ABYSS_FLOOR') {
      abyssFloorId = route.floorId;
      isLunarAbyssFloor = abyssFloorId >= 9;
      gemsDrop = 0; // In Abyss, no random RNG gem drops

      if (isLunarAbyssFloor) {
        // Lunar Abyss (Floors 9-12) - periodic reset
        const alreadyClaimedThisPeriod = (profile.lunarAbyssClaimed || []).includes(abyssFloorId);
        if (alreadyClaimedThisPeriod) {
          isAbyssAlreadyCleared = true;
          abyssGems = 0;
          expReward = 0;
          goldReward = 0;
          artifactDropChance = 0;
        } else {
          isAbyssAlreadyCleared = false;
          const lunarRewards = [500, 600, 700, 800];
          abyssGems = lunarRewards[abyssFloorId - 9] || 500;
          expReward = dungeonLevel * 2000;
          goldReward = dungeonLevel * 5000;
          artifactDropChance = 0.8;
        }
      } else {
        // Corridor Abyss (Floors 1-8) - one-time permanent clear
        const alreadyClearedBase = abyssFloorId <= (profile.clearedAbyssFloor || 0);
        if (alreadyClearedBase) {
          isAbyssAlreadyCleared = true;
          abyssGems = 0;
          expReward = 0;
          goldReward = 0;
          artifactDropChance = 0;
        } else {
          isAbyssAlreadyCleared = false;
          const floorRewards = [100, 150, 200, 300, 450, 600, 1000, 1600];
          abyssGems = floorRewards[abyssFloorId - 1] || 100;
          newFloorCleared = abyssFloorId;
          expReward = dungeonLevel * 2000;
          goldReward = dungeonLevel * 5000;
          artifactDropChance = 0.8;
        }
      }
    } else if (dungeonType === 'GOLD') {
       const goldSpecialTiers = [15000, 35000, 65000, 110000, 180000, 300000];
       goldReward = dungeonLevel <= 6 ? (goldSpecialTiers[dungeonLevel - 1] || dungeonLevel * 50000) : dungeonLevel * 50000;
       expReward = Math.floor(expReward * 0.3);
       artifactDropChance = 0.2;
    } else if (dungeonType === 'EXP') {
       const expSpecialTiers = [8000, 18000, 35000, 60000, 100000, 160000];
       expReward = dungeonLevel <= 6 ? (expSpecialTiers[dungeonLevel - 1] || dungeonLevel * 25000) : dungeonLevel * 25000;
       goldReward = Math.floor(goldReward * 0.3);
       artifactDropChance = 0.2;
    } else if (dungeonType === 'ARTIFACT') {
       const dung = ARTIFACT_DUNGEONS.find(d => (route as any).dungeonId === d.id);
       if (dung) possibleSets = dung.rewardSets;
    } else if (isStory && typeof route === 'object' && route.type === 'STORY_STAGE') {
       const stage = route.stage;
       expReward = stage.reward.exp || 0;
       goldReward = stage.reward.gold || 0;
       gemsDrop = stage.reward.gems || 0;
    }
    
    // Multiply rewards for multi-run dungeons
    if (typeof route === 'object' && route.type === 'DUNGEON') {
       expReward *= dungeonRuns;
       goldReward *= dungeonRuns;
       gemsDrop *= dungeonRuns;
    }

    const droppedArtifacts: Artifact[] = [];
    const getRandomSet = () => possibleSets[Math.floor(Math.random() * possibleSets.length)];

    for (let runIdx = 0; runIdx < dungeonRuns; runIdx++) {
       if (dungeonType === 'ARTIFACT') {
          if (dungeonLevel === 1) {
             const count = 1 + (Math.random() > 0.5 ? 1 : 0);
             for (let i = 0; i < count; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), Math.random() > 0.6 ? 3 : 2));
             }
          } else if (dungeonLevel === 2) {
             const count = 1 + (Math.random() > 0.4 ? 1 : 0);
             for (let i = 0; i < count; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), Math.random() > 0.7 ? 4 : 3));
             }
          } else if (dungeonLevel === 3) {
             const count = 1 + (Math.random() > 0.3 ? 1 : 0);
             for (let i = 0; i < count; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), Math.random() > 0.8 ? 5 : 4));
             }
          } else if (dungeonLevel === 4) {
             for (let i = 0; i < 2; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), Math.random() > 0.5 ? 5 : 4));
             }
          } else if (dungeonLevel === 5) {
             const count = 1 + (Math.random() > 0.5 ? 1 : 0);
             for (let i = 0; i < count; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), 5));
             }
          } else if (dungeonLevel >= 6) {
             const count = 2 + (Math.random() > 0.5 ? 1 : 0);
             for (let i = 0; i < count; i++) {
                droppedArtifacts.push(generateArtifact(getRandomSet(), 5));
             }
          }
       } else if (!isAbyss && !isStory) {
          const rollAttempts = Math.floor(dungeonLevel / 2) + 1;
          for (let i = 0; i < rollAttempts; i++) {
             if (Math.random() < artifactDropChance) {
                const setName = getRandomSet();
                droppedArtifacts.push(generateArtifact(setName, Math.min(5, Math.max(1, Math.floor(dungeonLevel / 2)))));
             }
          }
       }
    }

    if (isAbyss && !isAbyssAlreadyCleared) {
       const rollAttempts = Math.floor(dungeonLevel / 2) + 1;
       for (let i = 0; i < rollAttempts; i++) {
          if (Math.random() < artifactDropChance) {
             const setName = getRandomSet();
             droppedArtifacts.push(generateArtifact(setName, Math.min(5, Math.max(1, Math.floor(dungeonLevel / 2)))));
          }
       }
    }

    const currentStoryStage = (isStory && typeof route === 'object' && route.type === 'STORY_STAGE') ? route.stage : null;
    if (currentStoryStage) {
      setLastStoryStage(currentStoryStage);
      setLastStoryChapterId((route as any).chapterId || 'chap1');
    }
    
    setProfile(p => {
      let storyProgress = p.storyProgress || { unlockedChapters: ['chap1'], completedStages: [] };
      let mapState = p.mapState || { claimedChests: [], completedAnomalies: [], unlockedRegions: [] };

      if (currentStoryStage) {
        const completedStages = storyProgress.completedStages.includes(currentStoryStage.id)
          ? storyProgress.completedStages
          : [...storyProgress.completedStages, currentStoryStage.id];

        const unlockedChapters = new Set(storyProgress.unlockedChapters || ['chap1']);
        unlockedChapters.add('chap1');

        STORY_CHAPTERS.forEach((c, idx) => {
          if (c.stages.every(s => completedStages.includes(s.id)) && STORY_CHAPTERS[idx + 1]) {
            unlockedChapters.add(STORY_CHAPTERS[idx + 1].id);
          }
        });

        storyProgress = {
          unlockedChapters: Array.from(unlockedChapters),
          completedStages
        };

        if (currentStoryStage.id.startsWith("anomaly_")) {
          const completedAnomalies = mapState.completedAnomalies || [];
          if (!completedAnomalies.includes(currentStoryStage.id)) {
            mapState = {
              ...mapState,
              completedAnomalies: [...completedAnomalies, currentStoryStage.id]
            };
          }
        }
      }

      const updatedLunarClaimed = (isLunarAbyssFloor && !isAbyssAlreadyCleared)
        ? [...(p.lunarAbyssClaimed || []), abyssFloorId]
        : (p.lunarAbyssClaimed || []);

      return {
        ...p,
        gold: p.gold + goldReward,
        heroExp: p.heroExp + expReward,
        gems: p.gems + gemsDrop + abyssGems,
        clearedAbyssFloor: Math.max(p.clearedAbyssFloor || 0, newFloorCleared),
        lunarAbyssClaimed: updatedLunarClaimed,
        artifacts: [...p.artifacts, ...droppedArtifacts],
        dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + (isAbyssAlreadyCleared ? 0 : dungeonRuns) },
        bpExp: p.bpExp + (isAbyssAlreadyCleared ? 0 : (dungeonLevel * 100 * dungeonRuns)),
        storyProgress,
        mapState
      };
    });

    if (isAbyss) {
      setLastAbyssFloorResult({
        floorId: abyssFloorId,
        isLunar: isLunarAbyssFloor,
        wasAlreadyCleared: isAbyssAlreadyCleared
      });
    } else {
      setLastAbyssFloorResult(null);
    }

    setLastDrops({ exp: expReward, gold: goldReward, gems: gemsDrop + abyssGems, artifacts: droppedArtifacts });
    setLastDamageDealt(stats);
    setLastStoryStage(currentStoryStage);
    setRoute('VICTORY');
  };

  const handleDefeat = (stats: Record<string, number>, finalParty?: Combatant[]) => {
    isVictoryProcessingRef.current = false;
    if (typeof route === 'object' && route.type === 'DISTORTION_BATTLE') {
      setLastBattleParty((finalParty && finalParty.length > 0) ? finalParty : route.teamSlots.map((slot, idx) => createDistortionCombatant(slot.charId, slot.usePlayerBuild, profile, idx)));
      setLastStoryStage(null);
    } else if (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE') {
      setLastBattleParty((finalParty && finalParty.length > 0) ? finalParty : getPartyFromIds(route.teams[route.stage]));
      setLastStoryStage(null);
    } else if (typeof route === 'object' && route.type === 'STORY_STAGE') {
      setLastBattleParty((finalParty && finalParty.length > 0) ? finalParty : playerParty);
      setLastStoryStage(route.stage);
      setLastStoryChapterId((route as any).chapterId || 'chap1');
    } else {
      setLastBattleParty((finalParty && finalParty.length > 0) ? finalParty : playerParty);
      setLastStoryStage(null);
    }
    setLastAbyssFloorResult(null);
    setLastDamageDealt(stats);
    setRoute('DEFEAT');
  };

  const handleExitBattle = () => {
    isVictoryProcessingRef.current = false;
    setLastAbyssFloorResult(null);
    if (typeof route === 'object') {
      if (route.type === 'DISTORTION_BATTLE') {
        setRoute('DISTORTION');
        return;
      }
      if (route.type === 'STORY_STAGE') {
        setRoute('STORY');
        return;
      }
      if (route.type === 'ABYSS_FLOOR') {
        setRoute('ABYSS');
        return;
      }
      if (route.type === 'BOSS_RUSH_BATTLE') {
        setRoute('BOSS_RUSH_MENU');
        return;
      }
      if (route.type === 'DUNGEON' && route.dungeonType === 'ARTIFACT') {
        setRoute('ARTIFACT_DUNGEON_SELECTOR');
        return;
      }
    }
    setRoute('HUB');
  };

  const currentRouteName = typeof route === 'object' ? route.type : route;

  const currentBlessing = [
    "Благословение кода: Крит. урон +50% для всех.",
    "Эхо пустоты: Шанс реакции увеличен.",
    "Щит Архитектора: Повышенная защита в начале хода.",
    "Сила Глитча: Базовая атака игнорирует 20% брони."
  ][Math.floor(profile.lunarAbyssResetTime / 3600000) % 4];

  const routeKey = typeof route === 'object' 
    ? (route.type === 'STORY_STAGE' ? `STORY_STAGE_${route.stage.id}` : route.type)
    : route;

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (!isProfileLoaded) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-widest text-indigo-300/70 font-mono">
            Синхронизация профиля...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center w-full md:p-4 text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="w-full flex justify-center items-center h-full min-h-screen transform-gpu will-change-opacity"
        >
      {currentRouteName === 'HUB' && (
        <HubMenu 
          profile={profile} 
          updateProfile={setProfile} 
          setRoute={setRoute} 
          username={username || 'Игрок'} 
          userId={userId}
          onLogout={handleLogout} 
          onRestoreBackup={handleRestoreBackup}
          onForceSyncCloud={handleForceSyncCloud}
          onForceLoadCloud={handleForceLoadCloud}
          onImportTransferCode={handleImportTransferCode}
        />
      )}

      {currentRouteName === 'ROSTER' && (
        <CharacterMenu profile={profile} updateProfile={setProfile} onBack={() => setRoute('HUB')} />
      )}

      {currentRouteName === 'GACHA' && (
        <Gacha profile={profile} updateProfile={setProfile} onBack={() => setRoute('HUB')} />
      )}

      {currentRouteName === 'BP' && (
        <BattlePass profile={profile} updateProfile={setProfile} onBack={() => setRoute('HUB')} />
      )}

      {currentRouteName === 'DISTORTION' && (
        <DistortionMenu 
          profile={profile} 
          updateProfile={setProfile}
          onBack={() => setRoute('HUB')} 
          onStartBattle={(stage, buffIds, teamSlots) => {
            setRoute({
              type: 'DISTORTION_BATTLE',
              stage,
              distortionBuffIds: buffIds,
              teamSlots
            });
          }}
        />
      )}

      {(currentRouteName === 'DUNGEON' || currentRouteName === 'ABYSS_FLOOR' || currentRouteName === 'BOSS_RUSH_BATTLE' || currentRouteName === 'GLITCH_BATTLE' || currentRouteName === 'TRIAL_BATTLE' || currentRouteName === 'DISTORTION_BATTLE' || (typeof route === 'object' && route.type === 'STORY_STAGE' && route.stage.type === 'BATTLE')) && typeof route === 'object' && (
        <BattleScreen 
          key={
            route.type === 'DISTORTION_BATTLE'
              ? `distortion_stage_${route.stage}_${route.distortionBuffIds.length}`
              : route.type === 'BOSS_RUSH_BATTLE'
              ? `boss_rush_stage_${route.stage}`
              : route.type === 'ABYSS_FLOOR'
                ? `abyss_floor_${route.floorId}_${route.level}`
                : route.type === 'DUNGEON'
                  ? `dungeon_${route.dungeonType}_${route.level}`
                  : route.type === 'GLITCH_BATTLE'
                    ? `glitch_hunt_${route.sectorId}`
                    : route.type === 'TRIAL_BATTLE'
                      ? (route.testId ? `testrun_${route.testId}` : `trial_${route.trialId}`)
                      : `story_stage_${(route as any).stage?.id || 'stage'}`
          }
          playerParty={
            route.type === 'DISTORTION_BATTLE'
              ? applyDistortionBuffsToParty(
                  route.teamSlots.map((slot, idx) => createDistortionCombatant(slot.charId, slot.usePlayerBuild, profile, idx)),
                  route.distortionBuffIds
                )
              : route.type === 'BOSS_RUSH_BATTLE'
              ? getPartyFromIds(route.teams[route.stage])
              : route.type === 'TRIAL_BATTLE' && route.team 
                ? getPartyFromIds(route.team) 
                : playerParty
          }
          stageTitle={
            route.type === 'DISTORTION_BATTLE'
              ? `ИСКАЖЕНИЕ • ЭТАП ${route.stage} / 10${route.stage === 5 ? ' • [МИД-БОСС]' : route.stage === 10 ? ' • [ФИНАЛЬНЫЙ БОСС]' : ''}`
              : route.type === 'BOSS_RUSH_BATTLE'
              ? `ТЕНЕВОЙ НАТИСК • ЭТАП ${route.stage + 1} / 3`
              : route.type === 'STORY_STAGE'
                ? `СЮЖЕТ: ${route.stage.name.toUpperCase()} (УР. ${getAdaptiveStoryStageLevel(route.stage, (route as any).chapterId || 'chap1', profile)})${route.stage.isBoss ? ' • [БОСС]' : ''}`
                : route.type === 'GLITCH_BATTLE'
                  ? `ОХОТА НА ГЛИТЧИ: ${route.name.toUpperCase()}`
                  : route.type === 'TRIAL_BATTLE'
                    ? `БОЕВОЕ ИСПЫТАНИЕ: ${route.title.toUpperCase()}`
                    : undefined
          }
          isDistortionMode={route.type === 'DISTORTION_BATTLE'}
          distortionBuffIds={route.type === 'DISTORTION_BATTLE' ? route.distortionBuffIds : undefined}
          battleBuff={route.type === 'ABYSS_FLOOR' ? currentBlessing : undefined}
          enemyWaves={
            route.type === 'DISTORTION_BATTLE'
              ? generateDistortionWave(route.stage)
              : route.type === 'ABYSS_FLOOR' 
              ? generateAbyssWaves(route.floorId, route.level)
              : route.type === 'BOSS_RUSH_BATTLE'
                ? [generateBossRushWave(route.stage)]
                : route.type === 'GLITCH_BATTLE'
                  ? [[createGlitchSectorEnemy(route.sectorId)]]
                : route.type === 'TRIAL_BATTLE'
                  ? (route.testId && route.testId.startsWith('grove_combat_')
                      ? [
                          route.testId === 'grove_combat_1' 
                            ? [createBasicEnemy(55), createBasicEnemy(55), createBasicEnemy(55)]
                            : route.testId === 'grove_combat_2'
                            ? [createBasicEnemy(70, 'viper'), createBasicEnemy(70, 'pulse')]
                            : route.testId === 'grove_combat_3'
                            ? [createBasicEnemy(85, 'glacier'), createBasicEnemy(85, 'spark')]
                            : [createBasicEnemy(95, 'gaia', false, true)]
                        ]
                      : route.isTestRun
                        ? [
                            route.testId === 'test_vairen'
                              ? [createBasicEnemy(75, 'tide'), createBasicEnemy(75), createBasicEnemy(75, undefined, false, true)]
                              : route.testId === 'test_zephyr'
                              ? [createBasicEnemy(75, 'blaze'), createBasicEnemy(75), createBasicEnemy(75, undefined, false, true)]
                              : route.testId === 'test_aurum'
                              ? [createBasicEnemy(75), createBasicEnemy(75), createBasicEnemy(75, undefined, false, true)]
                              : route.testId === 'test_krona'
                              ? [createBasicEnemy(75, 'pulse'), createBasicEnemy(75), createBasicEnemy(75, undefined, false, true)]
                              : [createBasicEnemy(75), createBasicEnemy(75), createBasicEnemy(75)]
                          ]
                        : [[createTrialEnemy(route.trialId)]])
                : route.type === 'DUNGEON'
                  ? Array.from({ length: route.runs || 1 }).map(() => (
                      route.dungeonType === 'ARTIFACT' && (route as any).dungeonId
                        ? ARTIFACT_DUNGEONS.find(d => d.id === (route as any).dungeonId)?.enemyTeam.map(id => createBasicEnemy(route.level, id)) || getEnemies(route.level)
                        : getEnemies(route.level)
                    ))
                  : route.type === 'STORY_STAGE'
                    ? [
                        (route.stage.enemyBlueprintIds && route.stage.enemyBlueprintIds.length > 0)
                          ? route.stage.enemyBlueprintIds.map((id: string) => 
                              createBasicEnemy(
                                getAdaptiveStoryStageLevel(route.stage, (route as any).chapterId || 'chap1', profile),
                                id,
                                false,
                                route.stage.isBoss || false
                              )
                            )
                          : Array.from({ 
                              length: Math.min(3, Math.max(1, (profile.team?.length || 2))) 
                            }).map(() => 
                              createBasicEnemy(
                                getAdaptiveStoryStageLevel(route.stage, (route as any).chapterId || 'chap1', profile),
                                undefined,
                                false,
                                route.stage.isBoss || false
                              )
                            )
                      ]
                    : [getEnemies((route as any).level || 1)]
          } 
          onDefeat={handleDefeat} 
          onVictory={handleVictory}
          onExit={handleExitBattle}
          onSkillUse={() => setProfile(p => ({ ...p, dailies: { ...p.dailies, skillsUsed: p.dailies.skillsUsed + 1 } }))}
        />
      )}

      {currentRouteName === 'ABYSS' && (
        <AbyssMenu 
          onBack={() => setRoute('HUB')} 
          clearedFloor={profile.clearedAbyssFloor}
          lunarClaimed={profile.lunarAbyssClaimed || []}
          resetTime={profile.lunarAbyssResetTime}
          onEnterFloor={(floor) => setRoute({ type: 'ABYSS_FLOOR', level: floor.level, floorId: floor.id })}
          onOpenBossRush={() => setRoute('BOSS_RUSH_MENU')}
        />
      )}

      {currentRouteName === 'BOSS_RUSH_MENU' && (
        <BossRushMenu
          profile={profile}
          onBack={() => setRoute('HUB')}
          onStartRush={(teams) => {
            setBossRushResults([]);
            setBossRushTab('all');
            setRoute({ type: 'BOSS_RUSH_BATTLE', stage: 0, teams });
          }}
        />
      )}

      {currentRouteName === 'ARTIFACT_DUNGEON_SELECTOR' && (
        <ArtifactDungeon 
          profile={profile} 
          updateProfile={setProfile} 
          setRoute={setRoute} 
          onBack={() => setRoute('HUB')} 
        />
      )}
      
      {currentRouteName === 'MAP' && (
        <WorldMap 
          profile={profile} 
          updateProfile={setProfile} 
          setRoute={setRoute} 
          onBack={() => setRoute('HUB')} 
        />
      )}

      {currentRouteName === 'META' && (
        <MetaGuide onBack={() => setRoute('HUB')} />
      )}

      {currentRouteName === 'STORY' && (
        <StoryMenu 
          profile={profile} 
          updateProfile={setProfile} 
          onBack={() => setRoute('HUB')} 
          onStartStage={(stage, chapterId) => setRoute({ type: 'STORY_STAGE', stage, chapterId })}
        />
      )}

      {(typeof route === 'object' && route.type === 'STORY_STAGE' && route.stage.type !== 'BATTLE') && (
        <StoryMenu 
          profile={profile} 
          updateProfile={setProfile} 
          onBack={() => setRoute('STORY')} 
          onStartStage={(stage, chapterId) => setRoute({ type: 'STORY_STAGE', stage, chapterId })}
        />
      )}

      {currentRouteName === 'VICTORY' && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-6 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-20">
          
          {bossRushResults && bossRushResults.length > 0 ? (
            /* ================= BOSS RUSH ALL 3 STAGES VICTORY SCREEN ================= */
            <div className="w-full space-y-6">
              <div className="flex flex-col items-center gap-3 text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5" />
                  Теневой Натиск: Завершен
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-widest">
                  Триумф
                </h2>
                <p className="text-white/40 text-xs sm:text-sm font-mono tracking-widest uppercase">
                  Все 3 босса повержены без повторений
                </p>
              </div>

              {/* Loot banner */}
              {lastDrops && (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                  <h3 className="font-bold text-[11px] text-white/70 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <Trophy className="w-4 h-4 text-white/50" /> Награды Операции
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Опыт отряда</span>
                       <span className="font-black text-green-400 text-lg">+{lastDrops.exp.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Золото</span>
                       <span className="font-black text-yellow-400 text-lg">+{lastDrops.gold.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Кристаллы</span>
                       <span className="font-black text-pink-400 text-lg">+{lastDrops.gems} 💎</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                       <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Артефакты</span>
                       <span className="font-black text-purple-400 text-lg">2x 5★</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Global Total Run Metrics */}
              {(() => {
                const totalDmg = bossRushResults.reduce((sum, r) => sum + r.totalDamage, 0);
                const totalSec = bossRushResults.reduce((sum, r) => sum + r.duration, 0);
                const allFighters = bossRushResults.flatMap(r =>
                  r.party.map(p => ({
                    name: p.name,
                    id: p.id,
                    element: p.element,
                    stageIdx: r.stage,
                    bossName: r.bossName,
                    damage: r.stats[p.uid] || 0
                  }))
                );
                const mvp = allFighters.length > 0 
                  ? allFighters.reduce((prev, curr) => curr.damage > prev.damage ? curr : prev, allFighters[0]) 
                  : null;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Swords className="w-3.5 h-3.5" /> Суммарный урон
                      </div>
                      <div className="text-2xl font-mono font-black text-white/90">
                        {Math.floor(totalDmg).toLocaleString()} <span className="text-xs text-white/40">DMG</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5" /> Общее время
                      </div>
                      <div className="text-2xl font-mono font-black text-white/90">
                        {totalSec.toFixed(1)} <span className="text-xs text-white/40">СЕК</span>
                      </div>
                    </div>

                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors flex flex-col gap-1">
                      <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Crown className="w-3.5 h-3.5 text-white/70" /> MVP Натиска
                      </div>
                      {mvp && (
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-3">
                            {getCharSplash(mvp.id) ? (
                               <img src={getCharSplash(mvp.id)!} alt={mvp.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                 {mvp.name[0]}
                               </div>
                            )}
                            <span className="text-sm font-black text-white/90 truncate max-w-[90px] uppercase tracking-widest">{mvp.name}</span>
                          </div>
                          <span className="text-sm font-mono font-black text-white/70">{Math.floor(mvp.damage).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tabs for Stage Breakdown */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-[#111111] border border-white/5 rounded-full w-fit mx-auto">
                <button
                  onClick={() => setBossRushTab('all')}
                  className={`px-6 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                    bossRushTab === 'all' 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  Обзор этапов
                </button>
                {bossRushResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setBossRushTab(i)}
                    className={`px-6 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                      bossRushTab === i 
                        ? 'bg-white text-black shadow-md' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    Этап {i + 1}
                  </button>
                ))}
              </div>

              {bossRushTab === 'all' ? (
                <div className="grid grid-cols-1 gap-4">
                  {bossRushResults.map((stageRes, sIdx) => {
                    const maxPartyDmg = Math.max(1, ...stageRes.party.map(p => stageRes.stats[p.uid] || 0));
                    const stageDps = Math.floor(stageRes.totalDamage / stageRes.duration);
                    return (
                      <div key={sIdx} className="bg-[#111111] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-sm font-black text-white/70">
                              {sIdx + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{stageRes.bossName}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Босс побеждён</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-mono">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">Время</span>
                              <span className="font-bold text-white/90">{stageRes.duration.toFixed(1)}с</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">DPS</span>
                              <span className="font-bold text-white/90">{stageDps.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">Урон</span>
                              <span className="font-bold text-white/90">{Math.floor(stageRes.totalDamage).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Heroes bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stageRes.party.map(hero => {
                            const heroDmg = stageRes.stats[hero.uid] || 0;
                            const pct = Math.max(2, (heroDmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((heroDmg / stageRes.totalDamage) * 100).toFixed(0) : '0';
                            const splash = getCharSplash(hero.id);
                            return (
                              <div key={hero.uid} className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-2.5">
                                    {splash ? (
                                      <img src={splash} alt={hero.name} className="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/50">
                                        {hero.name[0]}
                                      </div>
                                    )}
                                    <span className="font-bold text-white/90 truncate max-w-[100px] uppercase tracking-widest">{hero.name}</span>
                                    <span className="text-[10px] text-white/40 font-bold tracking-widest">({sharePct}%)</span>
                                  </div>
                                  <span className="text-white/90 font-black">{Math.floor(heroDmg).toLocaleString()} DMG</span>
                                </div>
                                <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${pct}%` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-white/70 rounded-full" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single Selected Stage Detailed View */
                (() => {
                  const stageRes = bossRushResults[bossRushTab as number];
                  if (!stageRes) return null;
                  const maxPartyDmg = Math.max(1, ...stageRes.party.map(p => stageRes.stats[p.uid] || 0));
                  const stageDps = Math.floor(stageRes.totalDamage / stageRes.duration);
                  return (
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 text-left hover:border-white/10 transition-colors space-y-5">
                      <div className="flex flex-wrap justify-between items-center border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-lg text-white/90 uppercase tracking-widest">
                            {stageRes.stageTitle}
                          </h3>
                          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                            Время: {stageRes.duration.toFixed(1)}с • Общий урон: {Math.floor(stageRes.totalDamage).toLocaleString()} DMG
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Средний DPS</span>
                          <div className="text-xl font-mono font-black text-white/90">{stageDps.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {stageRes.party
                          .map(hero => ({ hero, dmg: stageRes.stats[hero.uid] || 0 }))
                          .sort((a, b) => b.dmg - a.dmg)
                          .map(({ hero, dmg }) => {
                            const pct = Math.max(2, (dmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((dmg / stageRes.totalDamage) * 100).toFixed(1) : '0';
                            const splash = getCharSplash(hero.id);
                            return (
                              <div key={hero.uid} className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-3">
                                    {splash && (
                                      <img src={splash} alt={hero.name} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-white/90 uppercase tracking-widest">{hero.name}</span>
                                      <span className="text-[10px] text-white/40 tracking-widest uppercase">{hero.element}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-white/90 font-black text-base">{Math.floor(dmg).toLocaleString()} DMG</span>
                                    <span className="text-[10px] text-white/40 tracking-widest uppercase">{sharePct}% отряда</span>
                                  </div>
                                </div>
                                <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-white/5 mt-1">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${pct}%` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-white/70 rounded-full" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            /* ================= STANDARD SINGLE BATTLE VICTORY SCREEN ================= */
            <>
              <div className="text-center mb-6 flex flex-col items-center gap-3">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest">
                  Успех
                </h2>
                <div className="h-0.5 w-12 bg-white/20 mx-auto rounded-full" />
                <p className="text-white/40 font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-2">
                  Боевая задача выполнена. Награды распределены.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                {/* Loot */}
                {lastDrops && (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                    <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest border-b border-white/5 pb-4 mb-5 flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/50" /> Контейнер ресурсов
                    </h3>
                    
                    {lastDrops.gems === 0 && lastDrops.gold === 0 && lastDrops.exp === 0 ? (
                      <div className="text-center py-4 px-4 bg-[#0a0a0a] rounded-2xl border border-white/5 flex flex-col items-center gap-1.5">
                        {lastDistortionStageResult ? (
                          lastDistortionStageResult.clearedStage < 10 ? (
                            <>
                              <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">
                                Награды перенесены в Систему Уровней Искажения
                              </span>
                              <span className="text-white/50 text-[11px] max-w-md">
                                Промежуточные этапы 1–9 не содержат прямых наград. Выберите усиление и продолжайте продвижение к боссу!
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">
                                Лимит прямых наград за зачистку (2/2) исчерпан
                              </span>
                              <span className="text-white/50 text-[11px] max-w-md">
                                Прямые награды за полное прохождение выдаются 2 раза в неделю. Опыт уровней Искажения успешно начислен!
                              </span>
                            </>
                          )
                        ) : lastAbyssFloorResult ? (
                          <>
                            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
                              {lastAbyssFloorResult.wasAlreadyCleared
                                ? (lastAbyssFloorResult.isLunar 
                                    ? "Награды Лунной Бездны уже получены в текущем периоде" 
                                    : "Награды за этот этаж уже были получены ранее")
                                : "Боевая задача выполнена"}
                            </span>
                            <span className="text-white/50 text-[11px] max-w-md">
                              {lastAbyssFloorResult.isLunar 
                                ? "Награды за этот этаж выдаются один раз за период (до сброса в четверг). Повторное прохождение не приносит ресурсов." 
                                : "Награды за этажи 1–8 выдаются только за первое прохождение. Повторные прохождения не приносят ресурсов."}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/40 text-xs font-mono">
                            Повторный тестовый забег: награды за первый проход уже получены ранее
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                           <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Опыт героя</span>
                           <span className="font-black text-green-400 text-lg">+{lastDrops.exp}</span>
                        </div>
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                           <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Золото</span>
                           <span className="font-black text-yellow-400 text-lg">+{lastDrops.gold}</span>
                        </div>
                        {lastDrops.gems > 0 && (
                          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                             <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Кристаллы</span>
                             <span className="font-black text-pink-400 text-lg flex items-center justify-center gap-1">
                               +{lastDrops.gems}
                               <Gem className="w-4 h-4 text-pink-400" />
                             </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Distortion EXP bonus callout */}
                    {lastDistortionStageResult && lastDistortionStageResult.clearedStage === 10 && (
                      <div className="mt-4 p-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-purple-300 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          Опыт Искажения: <b className="text-white font-mono">+{lastDistortionStageResult.expEarned || 0} EXP</b>
                        </span>
                        <span className="text-white/60 font-mono text-[11px]">
                          Уровень: <b className="text-cyan-300">{lastDistortionStageResult.newLevel}</b> | Зачистки недели: <b className="text-amber-300">{lastDistortionStageResult.weeklyFullClearsClaimed}/2</b>
                        </span>
                      </div>
                    )}
                    
                    {lastDrops.artifacts && lastDrops.artifacts.length > 0 && (
                      <div className="pt-5 mt-5 border-t border-white/5">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-white/30" /> Найденные артефакты
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                          {lastDrops.artifacts.map((art, idx) => (
                            <div key={idx} className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 flex justify-between items-center text-left">
                              <span className="text-xs text-white/70 font-bold truncate max-w-[140px] uppercase tracking-widest">{art.setName}</span>
                              <span className="font-black text-white/90 text-xs">{formatStatValue(art.mainStat.type, art.mainStat.value)} {formatStatName(art.mainStat.type)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Damage Statistics */}
                {lastDamageDealt && (() => {
                  const activeParty = (lastBattleParty && lastBattleParty.length > 0) ? lastBattleParty : playerParty;
                  const matchHero = (uid: string) => {
                    return activeParty.find(p => p.uid === uid)
                      || activeParty.find(p => p.id === uid)
                      || activeParty.find(p => uid.startsWith(`dist_hero_${p.id}_`) || uid === `dist_hero_${p.id}`)
                      || activeParty.find(p => uid.includes(p.id));
                  };
                  const partyStats = Object.entries(lastDamageDealt)
                    .filter(([uid]) => uid !== '__duration' && !!matchHero(uid))
                    .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0));
                  const totalPartyDmg = partyStats.reduce((sum, [, d]) => sum + (Number(d) || 0), 0);
                  const duration = Math.max(1, Number(lastDamageDealt.__duration) || 1);
                  const avgDps = Math.floor(totalPartyDmg / duration);
                  const maxDmg = Math.max(1, ...partyStats.map(([, d]) => Number(d) || 0));

                  return (
                    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                      <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                        <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                          <Swords className="w-4 h-4 text-white/50" /> Анализ боя
                        </h3>
                        {lastDamageDealt.__duration && (
                          <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                            <span>Средний DPS</span>
                            <span className="text-white/90 text-sm mt-0.5">
                              {avgDps.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {partyStats.map(([uid, dmgVal]) => {
                          const dmg = Number(dmgVal) || 0;
                          const hero = matchHero(uid);
                          const name = hero?.name || uid;
                          const splash = hero ? getCharSplash(hero.id) : null;
                          const percent = Math.max(2, (dmg / maxDmg) * 100);
                          
                          return (
                            <div key={uid} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-mono">
                                <div className="flex items-center gap-3">
                                  {splash ? (
                                    <img src={splash} alt={name} className="w-7 h-7 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                                      {name[0]}
                                    </div>
                                  )}
                                  <span className="text-white/90 font-bold tracking-widest uppercase">{name}</span>
                                </div>
                                <span className="text-white/90 font-black text-sm">{Math.floor(dmg).toLocaleString()} DMG</span>
                              </div>
                              <div className="w-full bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${percent}%` }} 
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="h-full bg-white/70 rounded-full" 
                                />
                              </div>
                            </div>
                          );
                        })}
                        {partyStats.length === 0 && (
                          <div className="text-white/40 text-[10px] font-mono tracking-widest uppercase text-center py-4 border border-dashed border-white/5 rounded-2xl bg-[#0a0a0a]/50">Урон не зафиксирован</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {lastDistortionStageResult ? (
            <div className="flex flex-col items-center gap-4 w-full max-w-lg mt-6">
              <div className="text-xs font-mono text-cyan-300 bg-slate-900/90 border border-cyan-500/40 px-6 py-3 rounded-2xl uppercase tracking-widest text-center shadow-lg">
                🌀 Искажение: Этап <span className="text-white font-bold text-sm mx-1">{lastDistortionStageResult.clearedStage}</span> успешно пройден!
                {lastDistortionStageResult.clearedStage < 10 && (
                  <div className="text-[11px] text-slate-300 font-normal mt-1">
                    Следующий этап: <span className="text-cyan-400 font-bold">Этап {lastDistortionStageResult.nextStage}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                {lastDistortionStageResult.clearedStage < 10 ? (
                  <button 
                    onClick={() => { 
                      setRoute('DISTORTION'); 
                      setLastDamageDealt(null); 
                      setLastDrops(null); 
                      setLastDistortionStageResult(null); 
                    }}
                    className="w-full sm:w-2/3 px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl font-mono uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs shadow-lg cursor-pointer"
                  >
                    <span>Выбрать усиление для Этапа {lastDistortionStageResult.nextStage}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => { 
                      setRoute('DISTORTION'); 
                      setLastDamageDealt(null); 
                      setLastDrops(null); 
                      setLastDistortionStageResult(null); 
                    }}
                    className="w-full sm:w-1/2 px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl font-mono uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs shadow-lg cursor-pointer"
                  >
                    <span>В Меню Искажения</span>
                  </button>
                )}
                <button 
                  onClick={() => { 
                    setRoute('HUB'); 
                    setLastDamageDealt(null); 
                    setLastDrops(null); 
                    setLastDistortionStageResult(null); 
                  }}
                  className="w-full sm:w-1/3 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-2xl font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs cursor-pointer"
                >
                  В Хаб
                </button>
              </div>
            </div>
          ) : lastStoryStage ? (
            <div className="flex flex-col items-center gap-5 w-full max-w-lg mt-6">
              <div className="text-[10px] font-mono text-white/70 bg-[#111111] border border-white/5 px-6 py-3 rounded-full uppercase tracking-widest">
                Сюжетный этап <span className="text-white font-bold mx-1">«{lastStoryStage.name}»</span> пройден
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button 
                  onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-white text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs"
                >
                  <Book className="w-4 h-4" />
                  <span>К сюжету</span>
                </button>
                <button 
                  onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs"
                >
                  В Хаб
                </button>
              </div>
            </div>
          ) : lastAbyssFloorResult ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mt-6">
              <button 
                onClick={() => { setRoute('ABYSS'); setLastDamageDealt(null); setLastDrops(null); setLastAbyssFloorResult(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>В Бездну</span>
              </button>
              <button 
                onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setLastDrops(null); setLastAbyssFloorResult(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs cursor-pointer"
              >
                В Хаб
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); setLastDrops(null); setLastAbyssFloorResult(null); }}
              className="w-full sm:w-auto min-w-[240px] px-10 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 mt-6 text-xs"
            >
              Продолжить
            </button>
          )}
        </div>
      )}

      {currentRouteName === 'DEFEAT' && (
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-6 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-20">
           
           <div className="text-center flex flex-col items-center gap-3">
             <h2 className="text-5xl md:text-7xl font-black text-white/90 font-mono uppercase tracking-widest">
               Сбой
             </h2>
             <div className="h-0.5 w-12 bg-white/20 mx-auto rounded-full" />
             <p className="text-white/40 font-mono text-[10px] sm:text-xs tracking-widest uppercase mt-2">
               Отряд уничтожен. Протокол восстановления активен.
             </p>
           </div>

            {/* Damage Statistics (Defeat) */}
            {lastDamageDealt && (() => {
              const activeParty = (lastBattleParty && lastBattleParty.length > 0) ? lastBattleParty : playerParty;
              const matchHero = (uid: string) => {
                return activeParty.find(p => p.uid === uid)
                  || activeParty.find(p => p.id === uid)
                  || activeParty.find(p => uid.startsWith(`dist_hero_${p.id}_`) || uid === `dist_hero_${p.id}`)
                  || activeParty.find(p => uid.includes(p.id));
              };
              const partyStats = Object.entries(lastDamageDealt)
                .filter(([uid]) => uid !== '__duration' && !!matchHero(uid))
                .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0));
              const totalPartyDmg = partyStats.reduce((sum, [, d]) => sum + (Number(d) || 0), 0);
              const duration = Math.max(1, Number(lastDamageDealt.__duration) || 1);
              const avgDps = Math.floor(totalPartyDmg / duration);
              const maxDmg = Math.max(1, ...partyStats.map(([, d]) => Number(d) || 0));

              return (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full max-w-2xl text-left transition-colors hover:border-white/10">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                    <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                      <Swords className="w-4 h-4 text-white/50" /> Анализ неудачи
                    </h3>
                    {lastDamageDealt.__duration && (
                      <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                        <span>Средний DPS</span>
                        <span className="text-white/70 text-sm mt-0.5">
                          {avgDps.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {partyStats.map(([uid, dmgVal]) => {
                      const dmg = Number(dmgVal) || 0;
                      const hero = matchHero(uid);
                      const name = hero?.name || uid;
                      const splash = hero ? getCharSplash(hero.id) : null;
                      const percent = Math.max(2, (dmg / maxDmg) * 100);
                      
                      return (
                        <div key={uid} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <div className="flex items-center gap-3">
                              {splash ? (
                                <img src={splash} alt={name} className="w-7 h-7 rounded-full object-cover border border-white/10 grayscale opacity-80" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                  {name[0]}
                                </div>
                              )}
                              <span className="text-white/60 font-bold tracking-widest uppercase">{name}</span>
                            </div>
                            <span className="text-white/70 font-black text-sm">{Math.floor(dmg).toLocaleString()} DMG</span>
                          </div>
                          <div className="w-full bg-[#0a0a0a] h-1.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                               initial={{ width: 0 }} 
                               animate={{ width: `${percent}%` }} 
                               transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-white/20 rounded-full" 
                             />
                          </div>
                        </div>
                      );
                    })}
                    {partyStats.length === 0 && (
                      <div className="text-white/40 text-[10px] font-mono tracking-widest uppercase text-center py-4 border border-dashed border-white/5 rounded-2xl bg-[#0a0a0a]/50">Урон не зафиксирован</div>
                    )}
                  </div>
                </div>
              );
            })()}

          {lastStoryStage ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mt-4">
              <button 
                onClick={() => { setRoute({ type: 'STORY_STAGE', stage: lastStoryStage, chapterId: lastStoryChapterId }); setLastDamageDealt(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Повторить</span>
              </button>
              <button 
                onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastStoryStage(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-[#111111] hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 text-xs"
              >
                В сюжет
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); }}
              className="w-full sm:w-auto min-w-[240px] px-10 py-4 bg-white hover:bg-white/90 text-black font-black rounded-full font-mono uppercase tracking-widest transition-all border border-white/10 hover:scale-[1.02] active:scale-95 mt-4 text-xs"
            >
              В Хаб
            </button>
          )}
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}