import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Trophy, Clock, Swords, Sword, Flame, Zap, Mountain, ChevronRight, Shield, Book, ArrowRight, RotateCcw, Package } from 'lucide-react';
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
import { characterBlueprints, createBasicEnemy, generateArtifact, ARTIFACT_DUNGEONS, STORY_CHAPTERS, generateAbyssWaves, createBossRushEnemy, generateBossRushWave, createGlitchSectorEnemy, createTrialEnemy, getCharSplash } from './data';
import { Combatant, PlayerProfile, GameRoute, Artifact, StoryStage } from './types';
import ArtifactDungeon from './components/ArtifactDungeon';
import WorldMap from './components/WorldMap';
import { getNextThursdayResetTime } from './lib/utils';

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
     // Give them Moyan and Kopro to start
     moyan: { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } },
     kopro: { level: 1, constellation: 0, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } }
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
  bossRushClaimed: false,
  achievements: {},
  expeditions: [],
  events: {
    loginStreak: 0,
    lastLoginDay: 0
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

export default function App() {
  const [route, setRoute] = useState<GameRoute | 
    { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT', runs?: number } |
    { type: 'ABYSS_FLOOR', level: number, floorId: number } |
    { type: 'STORY_STAGE', stage: StoryStage } |
    { type: 'GLITCH_BATTLE', sectorId: number, level: number, name: string, rewardGems: number, rewardGold: number } |
    { type: 'TRIAL_BATTLE', trialId: number, title: string, rewardGems: number, rewardGold: number, team?: string[], isTestRun?: boolean }
  >('HUB');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('ed_profile_v3') || localStorage.getItem('ed_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Migration: Cap artifact levels to 20 and normalize stats
        if (parsed.artifacts) {
          parsed.artifacts = parsed.artifacts.map((a: any) => {
            if (!a || !a.mainStat) return a;
            const currentLevel = a.level || 0;
            const needsClamp = currentLevel > 20 || a.mainStat.value > 3500;
            
            return {
              ...a,
              level: Math.min(currentLevel, 20),
              mainStat: {
                ...a.mainStat,
                value: needsClamp ? Math.min(a.mainStat.value, a.mainStat.type === "hp" ? 3500 : 2500) : a.mainStat.value
              },
              subStats: (a.subStats || []).map((s: any) => {
                if (!s) return s;
                return {
                  ...s,
                  value: needsClamp ? Math.min(s.value || 0, 800) : (s.value || 0)
                };
              })
            };
          });
        }

        const teams = parsed.teams || [parsed.team || ['moyan', 'kopro'], ...Array(9).fill([])];
        // Ensure we have at least 10 slots if coming from old save
        while (teams.length < 10) teams.push([]);
        const activeTeamIndex = parsed.activeTeamIndex !== undefined ? parsed.activeTeamIndex : 0;
        
        // Daily Reset Logic
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const lastReset = parsed.events?.lastLoginDay || 0;
        
        let resetProfile = { ...parsed };
        if (lastReset < startOfDay) {
           resetProfile = {
              ...resetProfile,
              dailies: {
                 battlesWon: 0,
                 skillsUsed: 0,
                 gachaPulls: 0,
                 resinsSpent: 0,
                 itemsBought: 0,
                 claimed: [false, false, false, false, false]
              },
              events: {
                 ...parsed.events,
                 lastLoginDay: startOfDay
              }
           };
        }

        // Weekly Thursday Reset for Abyss
        // Battle Pass Reset (every 3 days)
        const bpReset = parsed.bpResetTime || 0;
        if (now.getTime() >= bpReset) {
           resetProfile.bpExp = 0;
           resetProfile.bpClaimedLevels = [];
           resetProfile.bpClaimedLevelsPremium = [];
           resetProfile.hasGoldenPass = false;
           resetProfile.bpResetTime = now.getTime() + 3 * 24 * 60 * 60 * 1000;
        }

        const abyssResetTime = parsed.lunarAbyssResetTime || 0;
        if (now.getTime() >= abyssResetTime) {
          resetProfile.lunarAbyssClaimed = [];
          resetProfile.lunarAbyssResetTime = getNextThursdayResetTime();
        }

        return { 
           ...defaultProfile, 
           ...resetProfile, 
           teams,
           activeTeamIndex,
           team: teams[activeTeamIndex],
           dailies: resetProfile.dailies || { ...defaultProfile.dailies },
           events: resetProfile.events || { ...defaultProfile.events },
           expeditions: parsed.expeditions || [],
           achievements: parsed.achievements || {},
           mapState: parsed.mapState || { claimedChests: [], completedAnomalies: [], unlockedRegions: [] },
           storyProgress: parsed.storyProgress || { unlockedChapters: ['chap1'], completedStages: [] }
        };
      }
    } catch(e) {}
    return defaultProfile;
  });
  const [lastDrops, setLastDrops] = useState<{exp: number, gold: number, gems: number, artifacts: Artifact[]} | null>(null);
  const [lastDamageDealt, setLastDamageDealt] = useState<Record<string, number> | null>(null);
  const [lastBattleParty, setLastBattleParty] = useState<Combatant[]>([]);
  const [bossRushResults, setBossRushResults] = useState<BossRushStageResult[] | null>(null);
  const [bossRushTab, setBossRushTab] = useState<'all' | number>('all');
  const [lastStoryStage, setLastStoryStage] = useState<StoryStage | null>(null);


  React.useEffect(() => {
    if (isAuthenticated && userId) {
      const loadProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('game_data')
            .eq('id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
             console.error('Error loading profile:', error);
          }
          
          if (data && data.game_data) {
             setProfile(data.game_data);
          } else {
             // Create initial profile in DB
             await supabase.from('profiles').insert({
               id: userId,
               username: username || 'Player',
               game_data: profile
             });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsProfileLoaded(true);
        }
      };
      loadProfile();
    }
  }, [isAuthenticated, userId]);

  // Sync profile changes to Supabase
  React.useEffect(() => {
    if (isAuthenticated && userId && isProfileLoaded) {
      localStorage.setItem('ed_profile_v3', JSON.stringify(profile));
      const syncToDB = async () => {
        try {
          await supabase.from('profiles').upsert({
             id: userId,
             username: username || 'Player',
             game_data: profile
          });
        } catch (e) {
           console.error('Failed to sync to DB', e);
        }
      };
      // Simple debounce
      const timer = setTimeout(syncToDB, 1000);
      return () => clearTimeout(timer);
    } else if (!isAuthenticated || !userId) {
       localStorage.setItem('ed_profile_v3', JSON.stringify(profile));
    }
  }, [profile, isAuthenticated, userId, isProfileLoaded]);


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

        // Lunar Abyss Reset (every 1 hour)
        if (nowTime > (p.lunarAbyssResetTime || 0)) {
           newP = {
              ...newP,
              lunarAbyssClaimed: [],
              lunarAbyssResetTime: nowTime + 3600000 // Reset in 1 hour
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
    ? route.team.map((id: string) => { const c = characterBlueprints[id](id, 80, 0, []); if (c.stats.spd < 150) c.stats.spd = 150; return c; })
    : getPartyFromIds(profile.team);

  const getEnemies = (level: number) => {
     return Array.from({ length: Math.min(level, 4) }).map(() => createBasicEnemy(level));
  };

  const handleVictory = (stats: Record<string, number>) => {
    if (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE') {
      const stageParty = getPartyFromIds(route.teams[route.stage]);
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
         setRoute({ ...route, stage: route.stage + 1 });
         return;
      }
      
      // Stage 2 (final 3rd stage) clear rewards
      const allResults = [...(bossRushResults || []), stageResult];
      setBossRushResults(allResults);
      setBossRushTab('all');
      setLastDamageDealt(stats);
      setLastBattleParty(stageParty);

      const alreadyClaimed = !!profile.bossRushClaimed;
      const expReward = alreadyClaimed ? 5000 : 20000;
      const goldReward = alreadyClaimed ? 10000 : 50000;
      const gemsDrop = alreadyClaimed ? 0 : 200;
      const droppedArtifacts = alreadyClaimed ? [] : [generateArtifact("gladiator", 5), generateArtifact("noblesse", 5)];
      
      setProfile(p => ({
         ...p,
         bossRushClaimed: true,
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
    setLastBattleParty(playerParty);

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
      const rewardGems = route.rewardGems;
      const rewardGold = route.rewardGold;
      const trialId = route.trialId;

      setProfile(p => ({
        ...p,
        gems: p.gems + rewardGems,
        gold: p.gold + rewardGold,
        events: {
          ...p.events,
          completedTrials: [...(p.events.completedTrials || []), trialId]
        },
        dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 }
      }));

      setLastDrops({ exp: 0, gold: rewardGold, gems: rewardGems, artifacts: [] });
      setLastDamageDealt(stats);
      setRoute('VICTORY');
      return;
    }

    const dungeonLevel = typeof route === 'object' ? (route.type === 'STORY_STAGE' ? route.stage.level : (route as any).level || 1) : 1;
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

    if (isAbyss && typeof route === 'object' && route.type === 'ABYSS_FLOOR') {
      const floorId = route.floorId;
      if (floorId >= 9) {
         // Lunar Abyss (Weekly Thursday Reset)
         if (!profile.lunarAbyssClaimed.includes(floorId)) {
            const lunarRewards = [500, 600, 700, 800];
            abyssGems = lunarRewards[floorId - 9];
            setProfile(p => ({ ...p, lunarAbyssClaimed: [...p.lunarAbyssClaimed || [], floorId] }));
         }
      } else if (floorId > profile.clearedAbyssFloor) {
        const floorRewards = [100, 150, 200, 300, 450, 600, 1000, 1600];
        abyssGems = floorRewards[floorId - 1] || 100;
        newFloorCleared = floorId;
      }
      expReward = dungeonLevel * 2000;
      goldReward = dungeonLevel * 5000;
      artifactDropChance = 0.8;
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

    if (isAbyss) {
       const rollAttempts = Math.floor(dungeonLevel / 2) + 1;
       for (let i = 0; i < rollAttempts; i++) {
          if (Math.random() < artifactDropChance) {
             const setName = getRandomSet();
             droppedArtifacts.push(generateArtifact(setName, Math.min(5, Math.max(1, Math.floor(dungeonLevel / 2)))));
          }
       }
    }

    const currentStoryStage = (isStory && typeof route === 'object' && route.type === 'STORY_STAGE') ? route.stage : null;
    
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

      return {
        ...p,
        gold: p.gold + goldReward,
        heroExp: p.heroExp + expReward,
        gems: p.gems + gemsDrop + abyssGems,
        clearedAbyssFloor: Math.max(p.clearedAbyssFloor, newFloorCleared),
        artifacts: [...p.artifacts, ...droppedArtifacts],
        dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + dungeonRuns },
        bpExp: p.bpExp + (dungeonLevel * 100 * dungeonRuns),
        storyProgress,
        mapState
      };
    });

    setLastDrops({ exp: expReward, gold: goldReward, gems: gemsDrop + abyssGems, artifacts: droppedArtifacts });
    setLastDamageDealt(stats);
    setLastStoryStage(currentStoryStage);
    setRoute('VICTORY');
  };

  const handleDefeat = (stats: Record<string, number>) => {
    if (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE') {
      setLastBattleParty(getPartyFromIds(route.teams[route.stage]));
      setLastStoryStage(null);
    } else if (typeof route === 'object' && route.type === 'STORY_STAGE') {
      setLastBattleParty(playerParty);
      setLastStoryStage(route.stage);
    } else {
      setLastBattleParty(playerParty);
      setLastStoryStage(null);
    }
    setLastDamageDealt(stats);
    setRoute('DEFEAT');
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
    return <AuthScreen onLogin={(user, uid) => { setUsername(user); setUserId(uid); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center w-full md:p-4 text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center items-center h-full min-h-screen"
        >
      {currentRouteName === 'HUB' && (
        <HubMenu profile={profile} updateProfile={setProfile} setRoute={setRoute} username={username || 'Игрок'} onLogout={() => { supabase.auth.signOut().then(() => { localStorage.removeItem('ed_user'); localStorage.removeItem('ed_profile_v3'); setIsAuthenticated(false); setUserId(null); setUsername(null); }); }} />
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

      {(currentRouteName === 'DUNGEON' || currentRouteName === 'ABYSS_FLOOR' || currentRouteName === 'BOSS_RUSH_BATTLE' || currentRouteName === 'GLITCH_BATTLE' || currentRouteName === 'TRIAL_BATTLE' || (typeof route === 'object' && route.type === 'STORY_STAGE' && route.stage.type === 'BATTLE')) && typeof route === 'object' && (
        <BattleScreen 
          key={
            route.type === 'BOSS_RUSH_BATTLE'
              ? `boss_rush_stage_${route.stage}`
              : route.type === 'ABYSS_FLOOR'
                ? `abyss_floor_${route.floorId}_${route.level}`
                : route.type === 'DUNGEON'
                  ? `dungeon_${route.dungeonType}_${route.level}`
                  : route.type === 'GLITCH_BATTLE'
                    ? `glitch_hunt_${route.sectorId}`
                    : route.type === 'TRIAL_BATTLE'
                      ? `trial_${route.trialId}`
                      : `story_stage_${(route as any).stage?.id || 'stage'}`
          }
          playerParty={playerParty} 
          stageTitle={
            route.type === 'BOSS_RUSH_BATTLE'
              ? `ТЕНЕВОЙ НАТИСК • ЭТАП ${route.stage + 1} / 3`
              : route.type === 'STORY_STAGE'
                ? `СЮЖЕТ: ${route.stage.name.toUpperCase()}${route.stage.isBoss ? ' • [БОСС]' : ''}`
                : route.type === 'GLITCH_BATTLE'
                  ? `ОХОТА НА ГЛИТЧИ: ${route.name.toUpperCase()}`
                  : route.type === 'TRIAL_BATTLE'
                    ? `БОЕВОЕ ИСПЫТАНИЕ: ${route.title.toUpperCase()}`
                    : undefined
          }
          battleBuff={route.type === 'ABYSS_FLOOR' ? currentBlessing : undefined}
          enemyWaves={
            route.type === 'ABYSS_FLOOR' 
              ? generateAbyssWaves(route.floorId, route.level)
              : route.type === 'BOSS_RUSH_BATTLE'
                ? [generateBossRushWave(route.stage)]
                : route.type === 'GLITCH_BATTLE'
                  ? [[createGlitchSectorEnemy(route.sectorId)]]
                : route.type === 'TRIAL_BATTLE'
                  ? (route.isTestRun ? [Array.from({ length: 3 }).map(() => createBasicEnemy(80, 'slime_fire'))] : [[createTrialEnemy(route.trialId)]])
                : route.type === 'DUNGEON'
                  ? Array.from({ length: route.runs || 1 }).map(() => (
                      route.dungeonType === 'ARTIFACT' && (route as any).dungeonId
                        ? ARTIFACT_DUNGEONS.find(d => d.id === (route as any).dungeonId)?.enemyTeam.map(id => createBasicEnemy(route.level, id)) || getEnemies(route.level)
                        : getEnemies(route.level)
                    ))
                  : [
                      route.type === 'STORY_STAGE' && (route as any).stage.enemyBlueprintIds
                        ? (route as any).stage.enemyBlueprintIds.map((id: string) => createBasicEnemy((route as any).stage.level, id, false, (route as any).stage.isBoss || false))
                        : getEnemies((route as any).level || 1)
                    ]
          } 
          onDefeat={handleDefeat} 
          onVictory={handleVictory}
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
          onStartStage={(stage) => setRoute({ type: 'STORY_STAGE', stage })}
        />
      )}

      {(typeof route === 'object' && route.type === 'STORY_STAGE' && route.stage.type !== 'BATTLE') && (
        <StoryMenu 
          profile={profile} 
          updateProfile={setProfile} 
          onBack={() => setRoute('STORY')} 
          onStartStage={(stage) => setRoute({ type: 'STORY_STAGE', stage })}
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
                           <span className="font-black text-pink-400 text-lg">+{lastDrops.gems} 💎</span>
                        </div>
                      )}
                    </div>
                    
                    {lastDrops.artifacts && lastDrops.artifacts.length > 0 && (
                      <div className="pt-5 mt-5 border-t border-white/5">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-white/30" /> Найденные артефакты
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                          {lastDrops.artifacts.map((art, idx) => (
                            <div key={idx} className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 flex justify-between items-center text-left">
                              <span className="text-xs text-white/70 font-bold truncate max-w-[140px] uppercase tracking-widest">{art.setName}</span>
                              <span className="font-black text-white/90 text-xs">+{art.mainStat.value} {art.mainStat.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Damage Statistics */}
                {lastDamageDealt && (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full text-left transition-colors hover:border-white/10">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                        <Swords className="w-4 h-4 text-white/50" /> Анализ боя
                      </h3>
                      {lastDamageDealt.__duration && (
                        <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                          <span>Средний DPS</span>
                          <span className="text-white/90 text-sm mt-0.5">
                            {Math.floor(
                              Object.entries(lastDamageDealt)
                                .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                                .reduce((sum, [, d]) => sum + (d as number), 0) / 
                               (lastDamageDealt.__duration as number || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(lastDamageDealt)
                        .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([uid, dmg]) => {
                          const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                          const hero = activeParty.find(p => p.uid === uid);
                          const name = hero?.name || uid;
                          const splash = hero ? getCharSplash(hero.id) : null;
                          const playerStats = Object.entries(lastDamageDealt)
                            .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                            .map(([, d]) => d as number);
                          const maxDmg = Math.max(1, ...playerStats);
                          const percent = Math.max(2, ((dmg as number) / maxDmg) * 100);
                          
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
                                <span className="text-white/90 font-black text-sm">{Math.floor(dmg as number).toLocaleString()} DMG</span>
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
                      {Object.entries(lastDamageDealt).filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration').length === 0 && (
                        <div className="text-white/40 text-[10px] font-mono tracking-widest uppercase text-center py-4 border border-dashed border-white/5 rounded-2xl bg-[#0a0a0a]/50">Урон не зафиксирован</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {lastStoryStage ? (
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
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); setLastDrops(null); }}
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
            {lastDamageDealt && (
              <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 w-full max-w-2xl text-left transition-colors hover:border-white/10">
                <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-5">
                  <h3 className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                    <Swords className="w-4 h-4 text-white/50" /> Анализ неудачи
                  </h3>
                  {lastDamageDealt.__duration && (
                    <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest flex flex-col items-end">
                      <span>Средний DPS</span>
                      <span className="text-white/70 text-sm mt-0.5">
                        {Math.floor(
                          Object.entries(lastDamageDealt)
                            .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                            .reduce((sum, [, d]) => sum + (d as number), 0) / 
                           (lastDamageDealt.__duration as number || 1)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {Object.entries(lastDamageDealt)
                    .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([uid, dmg]) => {
                      const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                      const hero = activeParty.find(p => p.uid === uid);
                      const name = hero?.name || uid;
                      const splash = hero ? getCharSplash(hero.id) : null;
                      const playerStats = Object.entries(lastDamageDealt)
                        .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                        .map(([, d]) => d as number);
                      const maxDmg = Math.max(1, ...playerStats);
                      const percent = Math.max(2, ((dmg as number) / maxDmg) * 100);
                      
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
                            <span className="text-white/70 font-black text-sm">{Math.floor(dmg as number).toLocaleString()} DMG</span>
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
                </div>
              </div>
            )}

          {lastStoryStage ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mt-4">
              <button 
                onClick={() => { setRoute({ type: 'STORY_STAGE', stage: lastStoryStage }); setLastDamageDealt(null); }}
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