import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, Trophy, Clock, Swords, Flame, Zap, Mountain, ChevronRight, Shield, Book, ArrowRight, RotateCcw } from 'lucide-react';
import BattleScreen from './components/BattleScreen';
import CharacterMenu from './components/CharacterMenu';
import HubMenu from './components/HubMenu';
import Gacha from './components/Gacha';
import BattlePass from './components/BattlePass';
import { AbyssMenu } from './components/AbyssMenu';
import { MetaGuide } from './components/MetaGuide';
import StoryMenu from './components/StoryMenu';
import { BossRushMenu } from './components/BossRushMenu';
import { characterBlueprints, createBasicEnemy, generateArtifact, ARTIFACT_DUNGEONS, STORY_CHAPTERS, generateAbyssWaves, createBossRushEnemy, getCharSplash } from './data';
import { Combatant, PlayerProfile, GameRoute, Artifact, StoryStage } from './types';
import ArtifactDungeon from './components/ArtifactDungeon';
import WorldMap from './components/WorldMap';

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
  teams: [['moyan', 'kopro'], [], []],
  activeTeamIndex: 0,
  bpExp: 250,
  bpClaimedLevels: [],
  bpClaimedLevelsPremium: [],
  hasGoldenPass: false,
  lunarAbyssClaimed: [],
  lunarAbyssResetTime: Date.now() + 3600000, // 1 hour from now
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
    { type: 'DUNGEON', level: number, dungeonType: 'GOLD' | 'EXP' | 'ARTIFACT' } |
    { type: 'ABYSS_FLOOR', level: number, floorId: number } |
    { type: 'STORY_STAGE', stage: StoryStage }
  >('HUB');
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

        const teams = parsed.teams || [parsed.team || ['moyan', 'kopro'], [], []];
        const activeTeamIndex = parsed.activeTeamIndex !== undefined ? parsed.activeTeamIndex : 0;
        
        // Daily Reset Logic
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const lastReset = parsed.events?.lastLoginDay || 0;
        
        let resetProfile = { ...parsed };
        if (lastReset < startOfDay) {
           resetProfile = {
              ...parsed,
              bpExp: 0,
              bpClaimedLevels: [],
              bpClaimedLevelsPremium: [],
              hasGoldenPass: false,
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
    localStorage.setItem('ed_profile_v3', JSON.stringify(profile));
  }, [profile]);

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
            bpExp: 0,
            bpClaimedLevels: [],
            bpClaimedLevelsPremium: [],
            hasGoldenPass: false,
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
    : getPartyFromIds(profile.team);

  const getEnemies = (level: number) => {
     return Array.from({ length: Math.min(level, 4) }).map(() => createBasicEnemy(level));
  };

  const handleVictory = (stats: Record<string, number>) => {
    if (typeof route === 'object' && route.type === 'BOSS_RUSH_BATTLE') {
      const stageParty = getPartyFromIds(route.teams[route.stage]);
      const bossConfig = [
        { name: '«Испепелитель»', element: 'Pyro', title: 'Этап 1: «Испепелитель» (Pyro)' },
        { name: '«Абсолютный Ноль»', element: 'Cryo', title: 'Этап 2: «Абсолютный Ноль» (Cryo)' },
        { name: '«Кристальный Титан»', element: 'Geo', title: 'Этап 3: «Кристальный Титан» (Geo)' }
      ][route.stage] || { name: 'Босс', element: 'Pyro', title: `Этап ${route.stage + 1}` };

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

      const expReward = 20000;
      const goldReward = 50000;
      const gemsDrop = 200;
      const droppedArtifacts = [generateArtifact("gladiator", 5), generateArtifact("noblesse", 5)];
      
      setProfile(p => ({
         ...p,
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
    const dungeonLevel = typeof route === 'object' ? (route.type === 'STORY_STAGE' ? route.stage.level : route.level) : 1;
    const dungeonType = typeof route === 'object' && route.type === 'DUNGEON' ? route.dungeonType : 'EXP';
    
    let expReward = dungeonLevel * 1000;
    let goldReward = dungeonLevel * 4000;
    let artifactDropChance = 0.5;
    let gemsDrop = Math.random() > 0.5 ? Math.floor(Math.random() * 5 * dungeonLevel) + 1 : 0;
    let abyssGems = 0;
    let newFloorCleared = 0;
    let possibleSets = ["gladiator", "noblesse"];

    if (isAbyss && typeof route === 'object' && route.type === 'ABYSS_FLOOR') {
      const floorId = route.floorId;
      if (floorId >= 9) {
         // Lunar Abyss (Resettable)
         if (!profile.lunarAbyssClaimed.includes(floorId)) {
            const lunarRewards = [1600, 2400, 3200, 5000];
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
       goldReward *= 3;
       expReward = Math.floor(expReward * 0.3);
       artifactDropChance = 0.2;
    } else if (dungeonType === 'EXP') {
       expReward *= 3;
       goldReward = Math.floor(goldReward * 0.3);
       artifactDropChance = 0.2;
    } else if (dungeonType === 'ARTIFACT') {
       artifactDropChance = Math.min(1.0, 0.4 + (dungeonLevel * 0.1));
       goldReward = Math.floor(goldReward * 0.5);
       expReward = Math.floor(expReward * 0.5);
       const dung = ARTIFACT_DUNGEONS.find(d => (route as any).dungeonId === d.id);
       if (dung) possibleSets = dung.rewardSets;
    } else if (isStory && typeof route === 'object' && route.type === 'STORY_STAGE') {
       const stage = route.stage;
       expReward = stage.reward.exp || 0;
       goldReward = stage.reward.gold || 0;
       gemsDrop = stage.reward.gems || 0;
    }
    
    const droppedArtifacts: Artifact[] = [];
    const rollAttempts = dungeonType === 'ARTIFACT' ? Math.floor(dungeonLevel / 2) + 1 : 1;
    for (let i = 0; i < rollAttempts; i++) {
       if (Math.random() < artifactDropChance) {
          const setName = possibleSets[Math.floor(Math.random() * possibleSets.length)];
          droppedArtifacts.push(generateArtifact(setName, Math.min(5, Math.floor(dungeonLevel / 10))));
       }
    }
    
    // Guarantee at least 1 artifact on lvl 5 and 6 of ARTIFACT dungeon type
    if (dungeonType === 'ARTIFACT' && dungeonLevel >= 5 && droppedArtifacts.length === 0) {
       const setName = possibleSets[Math.floor(Math.random() * possibleSets.length)];
       droppedArtifacts.push(generateArtifact(setName, Math.min(5, Math.floor(dungeonLevel / 10))));
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

        const chap1 = STORY_CHAPTERS.find(c => c.id === 'chap1');
        if (chap1 && chap1.stages.every(s => completedStages.includes(s.id))) {
          unlockedChapters.add('chap2');
        }
        const chap2 = STORY_CHAPTERS.find(c => c.id === 'chap2');
        if (chap2 && chap2.stages.every(s => completedStages.includes(s.id))) {
          unlockedChapters.add('chap3');
        }

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
        dailies: { ...p.dailies, battlesWon: p.dailies.battlesWon + 1 },
        bpExp: p.bpExp + (dungeonLevel * 100),
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center w-full md:p-4 text-white">
      {currentRouteName === 'HUB' && (
        <HubMenu profile={profile} updateProfile={setProfile} setRoute={setRoute} />
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

      {(currentRouteName === 'DUNGEON' || currentRouteName === 'ABYSS_FLOOR' || currentRouteName === 'BOSS_RUSH_BATTLE' || (typeof route === 'object' && route.type === 'STORY_STAGE' && route.stage.type === 'BATTLE')) && typeof route === 'object' && (
        <BattleScreen 
          key={
            route.type === 'BOSS_RUSH_BATTLE'
              ? `boss_rush_stage_${route.stage}`
              : route.type === 'ABYSS_FLOOR'
                ? `abyss_floor_${route.floorId}_${route.level}`
                : route.type === 'DUNGEON'
                  ? `dungeon_${route.dungeonType}_${route.level}`
                  : `story_stage_${(route as any).stage?.id || 'stage'}`
          }
          playerParty={playerParty} 
          stageTitle={
            route.type === 'BOSS_RUSH_BATTLE'
              ? `ТЕНЕВОЙ НАТИСК • ЭТАП ${route.stage + 1} / 3`
              : route.type === 'STORY_STAGE'
                ? `СЮЖЕТ: ${route.stage.name.toUpperCase()}${route.stage.isBoss ? ' • [БОСС]' : ''}`
                : undefined
          }
          battleBuff={route.type === 'ABYSS_FLOOR' ? currentBlessing : undefined}
          enemyWaves={
            route.type === 'ABYSS_FLOOR' 
              ? generateAbyssWaves(route.floorId, route.level)
              : route.type === 'BOSS_RUSH_BATTLE'
                ? [[createBossRushEnemy(route.stage)]]
                : [
                    route.type === 'DUNGEON' && route.dungeonType === 'ARTIFACT' && (route as any).dungeonId
                      ? ARTIFACT_DUNGEONS.find(d => d.id === (route as any).dungeonId)?.enemyTeam.map(id => createBasicEnemy(route.level, id)) || getEnemies(route.level)
                      : route.type === 'STORY_STAGE' && route.stage.enemyBlueprintIds
                        ? route.stage.enemyBlueprintIds.map(id => createBasicEnemy(route.stage.level, id, false, route.stage.isBoss || false))
                        : getEnemies(route.level)
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
        <div className="flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-6 w-full max-w-3xl mx-auto text-center p-3 sm:p-5">
          {bossRushResults && bossRushResults.length > 0 ? (
            /* ================= BOSS RUSH ALL 3 STAGES VICTORY SCREEN ================= */
            <div className="w-full space-y-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 via-cyan-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-amber-400" />
                  ТЕНЕВОЙ НАТИСК: ВСЕ 3 ЭТАПА ПРОЙДЕНЫ
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 uppercase tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                  Триумф Во Тьме!
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm font-mono">
                  Все 3 босса повержены тремя отрядами без повторений
                </p>
              </div>

              {/* Loot banner */}
              {lastDrops && (
                <div className="bg-gray-900/80 border border-amber-500/30 rounded-xl p-3 sm:p-4 text-left shadow-lg">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-gray-800 pb-1.5 mb-2 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Награды за полное прохождение
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-gray-950/70 p-2 rounded border border-gray-800 flex flex-col">
                      <span className="text-gray-400 text-[10px]">Опыт отряда</span>
                      <span className="font-bold text-green-400 text-sm">+{lastDrops.exp.toLocaleString()} EXP</span>
                    </div>
                    <div className="bg-gray-950/70 p-2 rounded border border-gray-800 flex flex-col">
                      <span className="text-gray-400 text-[10px]">Золото</span>
                      <span className="font-bold text-yellow-400 text-sm">+{lastDrops.gold.toLocaleString()} G</span>
                    </div>
                    <div className="bg-gray-950/70 p-2 rounded border border-gray-800 flex flex-col">
                      <span className="text-gray-400 text-[10px]">Кристаллы</span>
                      <span className="font-bold text-pink-400 text-sm">+{lastDrops.gems} 💎</span>
                    </div>
                    <div className="bg-gray-950/70 p-2 rounded border border-purple-500/30 flex flex-col">
                      <span className="text-purple-300 text-[10px]">Артефакты</span>
                      <span className="font-bold text-purple-400 text-sm">2x 5★ Легендарных</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-left">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono mb-0.5">
                        <Swords className="w-3.5 h-3.5 text-red-400" /> Суммарный урон всех 3 боев
                      </div>
                      <div className="text-lg sm:text-xl font-mono font-black text-red-400">
                        {Math.floor(totalDmg).toLocaleString()} <span className="text-xs text-red-500 font-bold">DMG</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-left">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> Общее время битвы
                      </div>
                      <div className="text-lg sm:text-xl font-mono font-black text-cyan-300">
                        {totalSec.toFixed(1)} <span className="text-xs text-cyan-400 font-bold">сек</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/80 border border-amber-500/30 rounded-xl p-3 text-left">
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono mb-0.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" /> MVP всего Натиска
                      </div>
                      {mvp && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-white truncate max-w-[120px]">{mvp.name}</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{Math.floor(mvp.damage).toLocaleString()} DMG</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tabs for Stage Breakdown */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-gray-950/80 border border-gray-800 rounded-xl">
                <button
                  onClick={() => setBossRushTab('all')}
                  className={`flex-1 min-w-[110px] py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                    bossRushTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Все 3 боя
                </button>
                {bossRushResults.map((st, idx) => {
                  const icons = [Flame, Zap, Mountain];
                  const Icon = icons[idx] || Swords;
                  const colors = ['text-red-400', 'text-cyan-400', 'text-amber-400'];
                  return (
                    <button
                      key={idx}
                      onClick={() => setBossRushTab(idx)}
                      className={`flex-1 min-w-[110px] py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                        bossRushTab === idx
                          ? 'bg-gray-800 text-white border border-gray-600 shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-gray-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${colors[idx]}`} /> {st.bossName}
                    </button>
                  );
                })}
              </div>

              {/* Content for Selected View */}
              {bossRushTab === 'all' ? (
                /* All 3 Stages Grid / List */
                <div className="space-y-3">
                  {bossRushResults.map((stageRes, sIdx) => {
                    const bossColors = [
                      'border-red-500/30 bg-red-950/10',
                      'border-cyan-500/30 bg-cyan-950/10',
                      'border-amber-500/30 bg-amber-950/10'
                    ];
                    const elementIcons = [Flame, Zap, Mountain];
                    const ElementIcon = elementIcons[sIdx] || Swords;
                    const maxPartyDmg = Math.max(1, ...stageRes.party.map(p => stageRes.stats[p.uid] || 0));
                    const stageDps = Math.floor(stageRes.totalDamage / stageRes.duration);

                    return (
                      <div 
                        key={sIdx} 
                        className={`border rounded-xl p-3 sm:p-4 text-left shadow-lg transition-all ${bossColors[sIdx] || 'border-gray-800 bg-gray-900/60'}`}
                      >
                        <div className="flex flex-wrap justify-between items-center border-b border-gray-800 pb-2 mb-2.5 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-gray-900 border border-gray-700 text-white flex items-center gap-1">
                              <ElementIcon className="w-3 h-3" /> Этап {sIdx + 1}
                            </span>
                            <span className="text-sm font-bold text-white">{stageRes.bossName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                              Повержен ⚔️
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-mono">
                            <span className="text-gray-400">Время: <strong className="text-gray-200">{stageRes.duration.toFixed(1)}с</strong></span>
                            <span className="text-indigo-400">DPS: <strong className="text-white">{stageDps.toLocaleString()}</strong></span>
                            <span className="text-red-400 font-bold">Сумма: {Math.floor(stageRes.totalDamage).toLocaleString()} DMG</span>
                          </div>
                        </div>

                        {/* Heroes bars */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stageRes.party.map(hero => {
                            const heroDmg = stageRes.stats[hero.uid] || 0;
                            const pct = Math.max(2, (heroDmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((heroDmg / stageRes.totalDamage) * 100).toFixed(0) : '0';
                            const splash = getCharSplash(hero.id);

                            return (
                              <div key={hero.uid} className="bg-gray-950/70 p-2 rounded-lg border border-gray-800/80 flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-1.5">
                                    {splash ? (
                                      <img src={splash} alt={hero.name} className="w-5 h-5 rounded-full object-cover border border-gray-700" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] font-bold">
                                        {hero.name[0]}
                                      </div>
                                    )}
                                    <span className="font-bold text-gray-200 truncate max-w-[90px]">{hero.name}</span>
                                    <span className="text-[10px] text-gray-500 font-bold">({sharePct}%)</span>
                                  </div>
                                  <span className="text-red-400 font-black">{Math.floor(heroDmg).toLocaleString()} DMG</span>
                                </div>
                                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${pct}%` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full" 
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
                    <div className="bg-gray-900/90 border border-gray-700/60 rounded-xl p-4 text-left shadow-lg space-y-3">
                      <div className="flex flex-wrap justify-between items-center border-b border-gray-800 pb-2">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{stageRes.stageTitle}</span>
                          </h3>
                          <p className="text-xs text-gray-400 font-mono">
                            Длительность боя: {stageRes.duration.toFixed(1)} сек • Общий урон: {Math.floor(stageRes.totalDamage).toLocaleString()} DMG
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 font-mono">Средний DPS отряда:</span>
                          <div className="text-base font-mono font-black text-indigo-400">{stageDps.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {stageRes.party
                          .map(hero => ({ hero, dmg: stageRes.stats[hero.uid] || 0 }))
                          .sort((a, b) => b.dmg - a.dmg)
                          .map(({ hero, dmg }) => {
                            const pct = Math.max(2, (dmg / maxPartyDmg) * 100);
                            const sharePct = stageRes.totalDamage > 0 ? ((dmg / stageRes.totalDamage) * 100).toFixed(1) : '0';
                            const splash = getCharSplash(hero.id);

                            return (
                              <div key={hero.uid} className="bg-gray-950 p-2.5 rounded-lg border border-gray-800/90 flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    {splash && (
                                      <img src={splash} alt={hero.name} className="w-6 h-6 rounded-full object-cover border border-gray-700" referrerPolicy="no-referrer" />
                                    )}
                                    <span className="text-sm font-bold text-gray-100">{hero.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">{hero.element}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-gray-400 font-mono">{sharePct}% урона отряда</span>
                                    <span className="text-red-400 font-black text-sm">{Math.floor(dmg).toLocaleString()} DMG</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${pct}%` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full" 
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
              <h2 className="text-4xl md:text-6xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] uppercase">Победа</h2>
              <p className="text-gray-300 font-mono">Подземелье зачищено. Награды получены!</p>
              
              <div className="flex flex-col gap-4 w-full">
                {/* Loot */}
                {lastDrops && (
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 w-full text-left space-y-3 shadow-lg">
                     <h3 className="text-xs font-black text-gray-500 uppercase tracking-tighter border-b border-gray-800 pb-2 mb-2">Полученные ресурсы</h3>
                     <div className="flex justify-between items-center text-sm font-mono"><span className="text-gray-400">Опыт героя:</span> <span className="font-bold text-green-400">+{lastDrops.exp} EXP</span></div>
                     <div className="flex justify-between items-center text-sm font-mono"><span className="text-gray-400">Золото:</span> <span className="font-bold text-yellow-400">+{lastDrops.gold} G</span></div>
                     {lastDrops.gems > 0 && <div className="flex justify-between items-center text-sm font-mono"><span className="text-gray-400">Кристаллы:</span> <span className="font-bold text-pink-400">+{lastDrops.gems} 💎</span></div>}
                     {lastDrops.artifacts && lastDrops.artifacts.length > 0 && (
                        <div className="pt-3 space-y-2">
                          <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-1">
                            {lastDrops.artifacts.map((art, idx) => (
                              <div key={idx} className="bg-gray-950 p-2 rounded border border-purple-500/30 flex justify-between items-center text-left">
                                <span className="text-[10px] text-gray-200 font-bold truncate max-w-[100px]">{art.setName}</span>
                                <span className="font-bold text-indigo-400 text-[10px]">+{art.mainStat.value} {art.mainStat.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                     )}
                  </div>
                )}

                {/* Damage Statistics */}
                {lastDamageDealt && (
                  <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 w-full text-left shadow-lg">
                    <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-3">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-tighter">Статистика урона отряда</h3>
                      {lastDamageDealt.__duration && (
                        <div className="text-[10px] font-mono text-indigo-400 font-bold">
                          Средний DPS: <span className="text-white">
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
                    <div className="space-y-3">
                      {Object.entries(lastDamageDealt)
                        .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([uid, dmg]) => {
                          const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                          const name = activeParty.find(p => p.uid === uid)?.name || uid;
                          const playerStats = Object.entries(lastDamageDealt)
                            .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                            .map(([, d]) => d as number);
                          const maxDmg = Math.max(1, ...playerStats);
                          const percent = ((dmg as number) / maxDmg) * 100;
                          
                          return (
                            <div key={uid} className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-gray-200 font-bold">{name}</span>
                                <span className="text-red-400 font-black">{Math.floor(dmg as number).toLocaleString()} DMG</span>
                              </div>
                              <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${percent}%` }} 
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      {Object.entries(lastDamageDealt).filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration').length === 0 && (
                        <div className="text-gray-500 text-[10px] text-center italic">Урон не зафиксирован</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {lastStoryStage ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-md mt-2">
              <div className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                Сюжетный этап «{lastStoryStage.name}» пройден!
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button 
                  onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Book className="w-4 h-4" />
                  <span>К сюжету</span>
                </button>
                <button 
                  onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setLastDrops(null); setLastStoryStage(null); }}
                  className="w-full sm:w-1/2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl font-mono uppercase tracking-wider transition-all border border-slate-700 hover:scale-105 active:scale-95 text-xs sm:text-sm"
                >
                  В Хаб
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); setLastDrops(null); }}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg font-mono uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 mt-2"
            >
              Продолжить
            </button>
          )}
        </div>
      )}

      {currentRouteName === 'DEFEAT' && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-10 w-full max-w-lg mx-auto text-center p-4">
           <h2 className="text-4xl md:text-6xl font-bold text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] font-mono uppercase">Система сбоит</h2>
           <p className="text-gray-400 font-mono">Ваш отряд уничтожен. Протоколы восстановления запущены.</p>

            {/* Damage Statistics (Defeat) */}
            {lastDamageDealt && (
              <div className="bg-gray-900/80 border border-red-900/30 rounded-xl p-4 w-full text-left shadow-lg">
                <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-3">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-tighter">Статистика перед падением</h3>
                  {lastDamageDealt.__duration && (
                    <div className="text-[10px] font-mono text-red-400 font-bold">
                      Средний DPS: <span className="text-white">
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
                <div className="space-y-3">
                  {Object.entries(lastDamageDealt)
                    .filter(([uid]) => (lastBattleParty.length > 0 ? lastBattleParty : playerParty).some(p => p.uid === uid) && uid !== '__duration')
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([uid, dmg]) => {
                      const activeParty = lastBattleParty.length > 0 ? lastBattleParty : playerParty;
                      const name = activeParty.find(p => p.uid === uid)?.name || uid;
                      const playerStats = Object.entries(lastDamageDealt)
                        .filter(([u]) => activeParty.some(p => p.uid === u) && u !== '__duration')
                        .map(([, d]) => d as number);
                      const maxDmg = Math.max(1, ...playerStats);
                      const percent = ((dmg as number) / maxDmg) * 100;
                      
                      return (
                        <div key={uid} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-200 font-bold">{name}</span>
                            <span className="text-gray-400 font-black">{Math.floor(dmg as number).toLocaleString()} DMG</span>
                          </div>
                          <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${percent}%` }} 
                              transition={{ duration: 1 }}
                              className="h-full bg-gray-600 rounded-full" 
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          {lastStoryStage ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button 
                onClick={() => { setRoute({ type: 'STORY_STAGE', stage: lastStoryStage }); setLastDamageDealt(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl font-mono uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Повторить</span>
              </button>
              <button 
                onClick={() => { setRoute('STORY'); setLastDamageDealt(null); setLastStoryStage(null); }}
                className="w-full sm:w-1/2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl font-mono uppercase tracking-wider transition-all border border-slate-700 text-xs sm:text-sm"
              >
                В сюжет
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setRoute('HUB'); setLastDamageDealt(null); setBossRushResults(null); }}
              className="w-full sm:w-auto px-10 py-4 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg font-mono uppercase tracking-widest transition-all"
            >
              Отступить
            </button>
          )}
        </div>
      )}
    </div>
  );
}
