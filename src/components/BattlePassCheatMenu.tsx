import React, { useState } from 'react';
import { PlayerProfile, Artifact, ArtifactSlot, StatType, ArtifactSubStat } from '../types';
import { characterBlueprints, CHARACTER_PREFERENCES, ARTIFACT_SETS, STORY_CHAPTERS } from '../data';
import { 
  Key, Lock, Unlock, ShieldAlert, Sparkles, Crown, Swords, Users, 
  Gem, Coins, Zap, CheckCircle, AlertCircle, Terminal, Flame, 
  RefreshCw, LogOut, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
}

// Helper to generate a God-Tier 5-star +20 artifact tailored for character
export const createGodArtifact = (
  slot: ArtifactSlot,
  setName: string,
  charId: string,
  forcedMainType?: StatType
): Artifact => {
  const prefs = CHARACTER_PREFERENCES[charId] || { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"], sets: [setName] };
  
  // Character archetype determination
  const isHpScaler = prefs.main[0] === "hp" || (!prefs.main.includes("atk") && prefs.main.includes("hp"));
  const isDefScaler = prefs.main[0] === "def" || (!prefs.main.includes("atk") && prefs.main.includes("def"));
  const hasCrit = prefs.main.includes("critDamage") || prefs.main.includes("critRate");

  let mainType: StatType = "atk";
  let mainValue = 1800;

  if (forcedMainType) {
    mainType = forcedMainType;
    if (mainType === "hp") mainValue = 2400;
    else if (mainType === "def") mainValue = 1400;
    else if (mainType === "atk") mainValue = 1800;
    else if (mainType === "spd") mainValue = 35;
    else if (mainType === "critRate") mainValue = 31.1;
    else if (mainType === "critDamage") mainValue = 62.2;
  } else if (slot === "flower") {
    mainType = "hp";
    mainValue = 2400;
  } else if (slot === "plume") {
    mainType = "atk";
    mainValue = 1800;
  } else if (slot === "sands") {
    if (isHpScaler) {
      mainType = "hp";
      mainValue = 2400;
    } else if (isDefScaler) {
      mainType = "def";
      mainValue = 1400;
    } else if (prefs.main[0] === "spd") {
      mainType = "spd";
      mainValue = 35;
    } else {
      mainType = "atk";
      mainValue = 1800;
    }
  } else if (slot === "goblet") {
    if (isHpScaler) {
      mainType = "hp";
      mainValue = 2400;
    } else if (isDefScaler) {
      mainType = "def";
      mainValue = 1400;
    } else {
      mainType = "atk";
      mainValue = 1800;
    }
  } else if (slot === "circlet") {
    if (hasCrit) {
      if (prefs.main.includes("critDamage")) {
        mainType = "critDamage";
        mainValue = 62.2;
      } else {
        mainType = "critRate";
        mainValue = 31.1;
      }
    } else if (isHpScaler) {
      mainType = "hp";
      mainValue = 2400;
    } else if (isDefScaler) {
      mainType = "def";
      mainValue = 1400;
    } else {
      mainType = "critDamage";
      mainValue = 62.2;
    }
  }

  // God-tier substats (max 5★ +20 rolls) strictly adhering to character's stat priority
  const subStats: ArtifactSubStat[] = [];
  const allowedSubs = prefs.sub || ["atk", "spd", "critRate", "critDamage"];

  const candidatePool: { type: StatType; value: number }[] = [];
  if (allowedSubs.includes("critRate") && mainType !== "critRate") {
    candidatePool.push({ type: "critRate", value: 15.6 });
  }
  if (allowedSubs.includes("critDamage") && mainType !== "critDamage") {
    candidatePool.push({ type: "critDamage", value: 31.2 });
  }
  if (allowedSubs.includes("spd") && mainType !== "spd") {
    candidatePool.push({ type: "spd", value: 18 });
  }
  if (allowedSubs.includes("hp") && mainType !== "hp") {
    candidatePool.push({ type: "hp", value: 850 });
  }
  if (allowedSubs.includes("def") && mainType !== "def") {
    candidatePool.push({ type: "def", value: 220 });
  }
  if (allowedSubs.includes("atk") && mainType !== "atk") {
    candidatePool.push({ type: "atk", value: 320 });
  }

  candidatePool.forEach(c => {
    if (subStats.length < 4) {
      subStats.push(c);
    }
  });

  // Fallback fillers if fewer than 4 (strictly avoiding ATK for HP/DEF scalers!)
  const fallbackOrder: StatType[] = isHpScaler 
    ? ["hp", "spd", "def", "critRate", "critDamage"]
    : isDefScaler 
    ? ["def", "hp", "spd", "critRate", "critDamage"]
    : ["critRate", "critDamage", "spd", "atk", "hp"];

  fallbackOrder.forEach(st => {
    if (subStats.length < 4 && st !== mainType && !subStats.some(s => s.type === st)) {
      if (st === "hp") subStats.push({ type: "hp", value: 650 });
      else if (st === "def") subStats.push({ type: "def", value: 160 });
      else if (st === "spd") subStats.push({ type: "spd", value: 14 });
      else if (st === "critRate") subStats.push({ type: "critRate", value: 12.4 });
      else if (st === "critDamage") subStats.push({ type: "critDamage", value: 24.8 });
      else if (st === "atk" && !isHpScaler && !isDefScaler) subStats.push({ type: "atk", value: 260 });
    }
  });

  return {
    id: `god_${charId}_${slot}_${Math.random().toString(36).substr(2, 9)}`,
    slot,
    setName,
    mainStat: { type: mainType, value: mainValue },
    subStats,
    rarity: 5,
    level: 20
  };
};

export default function BattlePassCheatMenu({ profile, updateProfile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('bp_cheat_auth') === 'true';
  });
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCharForKit, setSelectedCharForKit] = useState<string>("nereus");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login.trim() === 'AssQueenGrrah' && password.trim() === 'AssSiCka123') {
      setIsAuthenticated(true);
      setErrorMsg(null);
      setStatusMsg('Авторизация успешна! Доступ к чит-кодам открыт.');
      try {
        sessionStorage.setItem('bp_cheat_auth', 'true');
      } catch (err) {
        // ignore
      }
    } else {
      setErrorMsg('Неверный логин или пароль чит-меню!');
      setStatusMsg(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin('');
    setPassword('');
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      sessionStorage.removeItem('bp_cheat_auth');
    } catch (err) {
      // ignore
    }
  };

  // 1. MASTER GOD-MODE: ALL IN ONE
  const activateMasterGodMode = () => {
    const allCharIds = Object.keys(characterBlueprints);
    const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
    
    updateProfile(p => {
      const nextRoster = { ...p.roster };
      const newArtifacts = [...(p.artifacts || [])];

      // Unlock all characters, max C6 & Lv. 90, generate & equip God artifacts
      allCharIds.forEach(charId => {
        const preferredSet = CHARACTER_PREFERENCES[charId]?.sets?.[0] || 'gladiator';
        const equippedArts: Record<ArtifactSlot, string | null> = {
          flower: null,
          plume: null,
          sands: null,
          goblet: null,
          circlet: null
        };

        slots.forEach(slot => {
          const art = createGodArtifact(slot, preferredSet, charId);
          newArtifacts.push(art);
          equippedArts[slot] = art.id;
        });

        nextRoster[charId] = {
          level: 90,
          constellation: 6,
          artifacts: equippedArts
        };
      });

      // Collect all story stages & chapters
      const allChapterIds = STORY_CHAPTERS.map(c => c.id);
      const allStageIds = STORY_CHAPTERS.flatMap(c => c.stages.map(s => s.id));

      // Max BP
      const allBPLevels = Array.from({ length: 100 }, (_, i) => i + 1);

      // Achievements
      const maxAchievements: Record<string, boolean> = {
        first_steps: true,
        veteran: true,
        collector: true,
        rich: true,
        full_house: true,
        master: true,
        big_spender: true,
        skill_master: true,
        gacha_addict: true
      };

      // Set meta team if not filled
      const defaultTeam = ['farina', 'kairen', 'aveline', 'volta'].filter(id => allCharIds.includes(id));

      return {
        ...p,
        gems: p.gems + 1000000,
        gold: p.gold + 50000000,
        heroExp: p.heroExp + 500000,
        resin: Math.max(p.resin + 2000, 2000),
        roster: nextRoster,
        artifacts: newArtifacts,
        team: p.team && p.team.length >= 4 ? p.team : defaultTeam,
        teams: p.teams && p.teams.length > 0 ? p.teams : [defaultTeam],
        bpExp: 750000, // 100 levels
        hasGoldenPass: true,
        bpClaimedLevels: allBPLevels,
        bpClaimedLevelsPremium: allBPLevels,
        clearedAbyssFloor: 12,
        lunarAbyssClaimed: [9, 10, 11, 12],
        storyProgress: {
          unlockedChapters: allChapterIds,
          completedStages: allStageIds
        },
        achievements: {
          ...p.achievements,
          ...maxAchievements
        }
      };
    });

    setStatusMsg(`🔥 МЕГА-ЧИТ АКТИВИРОВАН: Все ${allCharIds.length} персонажей С6 90 ур. открыты, экипированы в 5★ +20 артефакты, начислено 1,000,000 💎 и 50,000,000 🪙, БП 100 ур., Бездна 12!`);
  };

  // 2. Unlock all characters
  const unlockAllCharacters = () => {
    const allCharIds = Object.keys(characterBlueprints);
    updateProfile(p => {
      const nextRoster = { ...p.roster };
      allCharIds.forEach(charId => {
        if (!nextRoster[charId]) {
          nextRoster[charId] = {
            level: 90,
            constellation: 0,
            artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null }
          };
        } else {
          nextRoster[charId] = {
            ...nextRoster[charId],
            level: 90
          };
        }
      });
      return { ...p, roster: nextRoster };
    });
    setStatusMsg(`👥 Разблокированы все ${allCharIds.length} персонажей на 90 уровне!`);
  };

  // 3. Max Constellations (All C6)
  const setAllC6 = () => {
    const allCharIds = Object.keys(characterBlueprints);
    updateProfile(p => {
      const nextRoster = { ...p.roster };
      allCharIds.forEach(charId => {
        const existing = nextRoster[charId] || {
          level: 90,
          constellation: 0,
          artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null }
        };
        nextRoster[charId] = {
          ...existing,
          level: 90,
          constellation: 6
        };
      });
      return { ...p, roster: nextRoster };
    });
    setStatusMsg('⭐ Все персонажи теперь имеют Созвездие 6 (C6) и 90 уровень!');
  };

  // 4. Equip all characters with tailored 5★ +20 God Artifacts
  const equipAllWithGodArtifacts = () => {
    const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
    let countEquipped = 0;
    
    updateProfile(p => {
      const nextRoster = { ...p.roster };
      const newArtifacts = [...p.artifacts];

      Object.keys(nextRoster).forEach(charId => {
        const preferredSet = CHARACTER_PREFERENCES[charId]?.sets?.[0] || 'gladiator';
        const equippedArts: Record<ArtifactSlot, string | null> = {
          flower: null,
          plume: null,
          sands: null,
          goblet: null,
          circlet: null
        };

        slots.forEach(slot => {
          const art = createGodArtifact(slot, preferredSet, charId);
          newArtifacts.push(art);
          equippedArts[slot] = art.id;
        });

        nextRoster[charId] = {
          ...nextRoster[charId],
          artifacts: equippedArts
        };
        countEquipped++;
      });

      return {
        ...p,
        roster: nextRoster,
        artifacts: newArtifacts
      };
    });

    setStatusMsg(`⚔️ Успешно! Экипировано ${countEquipped} персонажей в лучшие 5★ +20 артефакты (все 5 слотов под их специализацию).`);
  };

  // 5. Generate pack of God Artifacts for all sets into inventory (with proper stats per set!)
  const generateGodArtifactPack = () => {
    const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
    const added: Artifact[] = [];

    // Signature mapping for each set to ensure appropriate stats matching intended heroes
    const setPrimaryChar: Record<string, string> = {
      coral_tide: 'nereus', // HP & Crit Hydro DPS (Nereus)
      thorn_whisper: 'iva', // HP, SPD, DEF Dendro Healer (Iva)
      crystal_resonance: 'kern', // DEF & Crit Geo DPS (Kern)
      ocean_song: 'aveline', // HP & SPD Hydro Healer (Aveline)
      voltage_circuit: 'volta', // HP & DEF Electro Sustain (Volta)
      absolute_zero: 'snezhana', // Cryo DPS
      frozen_time: 'farina', // Cryo Sub-DPS
      shattered_winter: 'kairen', // Cryo DPS
      isolation_protocol: 'zephyr', // Anemo/Electro DPS
      ashes_of_forge: 'ineffa', // Pyro DPS
      echo_of_solitude: 'zephyr', // DPS
      noblesse: 'farina', // Support / Sub-DPS
      gladiator: 'kairen' // General DPS
    };

    Object.keys(ARTIFACT_SETS).forEach(setName => {
      const charId = setPrimaryChar[setName] || 'kairen';
      slots.forEach(slot => {
        added.push(createGodArtifact(slot, setName, charId));
      });

      // Also generate versatile/dual-role pieces:
      if (setName === 'coral_tide') {
        // Extra pure HP Circlet for Nereus
        added.push(createGodArtifact('circlet', setName, 'nereus', 'hp'));
      } else if (setName === 'thorn_whisper') {
        // Extra SPD sands for Iva
        added.push(createGodArtifact('sands', setName, 'iva', 'spd'));
      } else if (setName === 'crystal_resonance') {
        // Extra pure DEF Circlet for Kern / Aurum
        added.push(createGodArtifact('circlet', setName, 'kern', 'def'));
      } else if (setName === 'voltage_circuit') {
        // Extra DEF pieces for tanks
        added.push(createGodArtifact('sands', setName, 'aurum', 'def'));
        added.push(createGodArtifact('goblet', setName, 'aurum', 'def'));
        added.push(createGodArtifact('circlet', setName, 'aurum', 'def'));
      }
    });

    updateProfile(p => ({
      ...p,
      artifacts: [...p.artifacts, ...added]
    }));

    setStatusMsg(`🛡️ В инвентарь добавлено ${added.length} лучших 5★ +20 артефактов (все сеты игры со специализированными статами: ХП для Нереуса/Ивы, ЗАЩ для Керна, АТК/Криты для DPS)!`);
  };

  // 5.1. Give tailored 5★ +20 kit for a specific chosen character
  const giveTailoredKitForCharacter = (charId: string) => {
    const preferredSet = CHARACTER_PREFERENCES[charId]?.sets?.[0] || 'gladiator';
    const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
    const added: Artifact[] = [];
    
    slots.forEach(slot => {
      added.push(createGodArtifact(slot, preferredSet, charId));
    });

    // If HP scaler (Nereus, Iva, Aveline), also add pure HP circlet option
    if (CHARACTER_PREFERENCES[charId]?.main[0] === 'hp') {
      added.push(createGodArtifact('circlet', preferredSet, charId, 'hp'));
    }
    // If DEF scaler (Kern, Aurum), also add pure DEF circlet option
    if (CHARACTER_PREFERENCES[charId]?.main[0] === 'def') {
      added.push(createGodArtifact('circlet', preferredSet, charId, 'def'));
    }

    updateProfile(p => ({
      ...p,
      artifacts: [...p.artifacts, ...added]
    }));

    const charName = characterBlueprints[charId]?.name || charId;
    const setName = ARTIFACT_SETS[preferredSet]?.name || preferredSet;
    const statsList = (CHARACTER_PREFERENCES[charId]?.main || ["atk"]).map(st => st === 'hp' ? 'ХП' : st === 'def' ? 'ЗАЩ' : st === 'atk' ? 'АТК' : st === 'spd' ? 'СКОР' : st === 'critRate' ? 'КШ' : st === 'critDamage' ? 'КУ' : st).join(', ');
    setStatusMsg(`🎁 Идеальный комплект 5★ +20 (${setName}) выдан для ${charName}! Статы строго подобраны под героя: ${statsList}.`);
  };

  // 5.2. Specialized gear overhaul for all characters (fixes HP for Nereus/Iva, DEF for Kern, etc.)
  const fixAllCharactersSpecializedGear = () => {
    const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
    let countFixed = 0;

    updateProfile(p => {
      const nextRoster = { ...p.roster };
      const newArtifacts = [...p.artifacts];

      Object.keys(nextRoster).forEach(charId => {
        const preferredSet = CHARACTER_PREFERENCES[charId]?.sets?.[0] || 'gladiator';
        const equippedArts: Record<ArtifactSlot, string | null> = {
          flower: null,
          plume: null,
          sands: null,
          goblet: null,
          circlet: null
        };

        slots.forEach(slot => {
          const art = createGodArtifact(slot, preferredSet, charId);
          newArtifacts.push(art);
          equippedArts[slot] = art.id;
        });

        nextRoster[charId] = {
          ...nextRoster[charId],
          artifacts: equippedArts
        };
        countFixed++;
      });

      return {
        ...p,
        roster: nextRoster,
        artifacts: newArtifacts
      };
    });

    setStatusMsg(`⚡ Успешно переэкипировано ${countFixed} персонажей! Нереус и Ива получили чистое ХП/Криты/Скорость (0% бесполезного АТК), Керн получил ЗАЩ, танки — ХП/ЗАЩ, DPS — АТК/Криты.`);
  };

  // 6. Give huge resources
  const addResources = () => {
    updateProfile(p => ({
      ...p,
      gems: p.gems + 1000000,
      gold: p.gold + 50000000,
      heroExp: p.heroExp + 500000,
      resin: Math.max(p.resin + 2000, 2000)
    }));
    setStatusMsg('💎 Начислено: +1,000,000 Гемов, +50,000,000 Золота, +500,000 Опыта, +2,000 Смолы!');
  };

  // 7. Max Battle Pass
  const maxBattlePass = () => {
    const allBPLevels = Array.from({ length: 100 }, (_, i) => i + 1);
    updateProfile(p => ({
      ...p,
      bpExp: 750000,
      hasGoldenPass: true,
      bpClaimedLevels: allBPLevels,
      bpClaimedLevelsPremium: allBPLevels
    }));
    setStatusMsg('👑 Боевой Пропуск прокачан до 100 уровня, Золотой Статус активен, все 100 наград получены!');
  };

  // 8. Clear Abyss and Story
  const clearAbyssAndStory = () => {
    const allChapterIds = STORY_CHAPTERS.map(c => c.id);
    const allStageIds = STORY_CHAPTERS.flatMap(c => c.stages.map(s => s.id));
    
    updateProfile(p => ({
      ...p,
      clearedAbyssFloor: 12,
      lunarAbyssClaimed: [9, 10, 11, 12],
      storyProgress: {
        unlockedChapters: allChapterIds,
        completedStages: allStageIds
      }
    }));
    setStatusMsg('🌌 Бездна закрыта на 12 этаж, все главы и этапы сюжета завершены!');
  };

  // 8. Repair all artifacts in profile & fix decimal stats
  const repairAllArtifactsAndStats = () => {
    updateProfile(p => {
      const sanitize = (art: Artifact): Artifact => {
        if (!art || !art.mainStat) return art;
        const currentLevel = Math.min(art.level || 0, 20);
        let mainVal = art.mainStat.value || 0;
        const mainType = art.mainStat.type;

        if (mainType === "critRate") {
          mainVal = Math.round(Math.min(mainVal, 31.1) * 10) / 10;
        } else if (mainType === "critDamage") {
          mainVal = Math.round(Math.min(mainVal, 62.2) * 10) / 10;
        } else {
          if (currentLevel >= 15) {
            if (mainType === "hp" && mainVal < 500) mainVal = 2400;
            else if (mainType === "atk" && mainVal < 350) mainVal = 1800;
            else if (mainType === "def" && mainVal < 250) mainVal = 1200;
            else if (mainType === "spd" && mainVal < 15) mainVal = 35;
          }
          mainVal = Math.round(mainVal);
        }

        const subStats = (art.subStats || []).map(s => {
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
          ...art,
          level: currentLevel,
          mainStat: { type: mainType, value: mainVal },
          subStats
        };
      };

      const cleanedArtifacts = (p.artifacts || []).map(sanitize);

      return {
        ...p,
        artifacts: cleanedArtifacts
      };
    });

    setStatusMsg('✨ Все артефакты в инвентаре и на персонажах починены! Дробные числа удалены, статы пересчитаны в полноценные целые числа.');
  };

  return (
    <div className="mt-12 pt-8 border-t-2 border-dashed border-red-500/30">
      <div className="bg-gradient-to-br from-[#120808] via-[#0d0d0d] to-[#120d1a] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  Чит-Код Меню <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono">DEV TERMINAL</span>
                </h3>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Секретный терминал администратора (доступ по логину и паролю)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition active:scale-95 cursor-pointer"
          >
            {isOpen ? (
              <>
                <ChevronUp className="w-4 h-4" /> Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> {isAuthenticated ? 'Открыть панель' : 'Ввести пароль'}
              </>
            )}
          </button>
        </div>

        {/* Expandable Terminal Content */}
        {isOpen && (
          <div className="mt-6 pt-6 border-t border-white/10 relative z-10 animate-in fade-in duration-300">
            {!isAuthenticated ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-center gap-2 text-center text-xs font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Для доступа к чит-панели введите секретные реквизиты разработчика.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                    Логин (Username)
                  </label>
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Введите логин..."
                    autoComplete="off"
                    className="w-full bg-[#161616] border border-white/10 focus:border-red-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-white/60 uppercase tracking-wider mb-1.5">
                    Пароль (Password)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль..."
                    autoComplete="off"
                    className="w-full bg-[#161616] border border-white/10 focus:border-red-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 outline-none transition"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" /> Войти в чит-меню
                </button>
              </form>
            ) : (
              /* AUTHENTICATED CHEAT CONSOLE */
              <div className="space-y-6">
                {/* Auth status bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Авторизован как: <strong className="text-white">AssQueenGrrah</strong></span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Заблокировать терминал
                  </button>
                </div>

                {statusMsg && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{statusMsg}</span>
                  </div>
                )}

                {/* 1. MEGA MASTER CHEAT BUTTON */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/60 via-purple-950/40 to-indigo-950/60 border-2 border-red-500/60 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        Главная кнопка разработчика
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                        🔥 ПОЛНЫЙ GOD-MODE (ВСЁ И СРАЗУ)
                      </h4>
                      <p className="text-xs text-white/60 font-mono mt-1 max-w-xl">
                        Разблокирует всех персонажей игры на 90 ур., делает всех С6, генерирует и надевает топовые 5★ +20 артефакты на каждого героя, начисляет 1,000,000 💎 и 50,000,000 🪙, закрывает 100 ур. БП и 12 этаж Бездны!
                      </p>
                    </div>

                    <button
                      onClick={activateMasterGodMode}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:via-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5" /> АКТИВИРОВАТЬ ВСЁ
                    </button>
                  </div>
                </div>

                {/* INDIVIDUAL CHEAT CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Unlock All Characters */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase mb-1">
                        <Users className="w-4 h-4" /> Персонажи
                      </div>
                      <h5 className="font-bold text-sm text-white">Все персонажи (90 ур.)</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Разблокировать всех персонажей из базы (36+ героев) сразу на 90 уровне.
                      </p>
                    </div>
                    <button
                      onClick={unlockAllCharacters}
                      className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Разблокировать всех
                    </button>
                  </div>

                  {/* All C6 */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                        <Crown className="w-4 h-4" /> Созвездия
                      </div>
                      <h5 className="font-bold text-sm text-white">Все персонажи С6</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Выставить 6-е созвездие (C6) и 90 уровень всем персонажам коллекции.
                      </p>
                    </div>
                    <button
                      onClick={setAllC6}
                      className="mt-4 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Сделать всех С6
                    </button>
                  </div>

                  {/* Equip all with best artifacts */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase mb-1">
                        <Swords className="w-4 h-4" /> Экипировка
                      </div>
                      <h5 className="font-bold text-sm text-white">Специализация всех героев (5★ +20)</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Создать и надеть на КАЖДОГО героя комплект +20 артефактов под их точный скейлинг: ХП для Нереуса/Ивы/Авелин, ЗАЩ для Керна/Аурума, АТК для DPS.
                      </p>
                    </div>
                    <button
                      onClick={fixAllCharactersSpecializedGear}
                      className="mt-4 w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-lg shadow-rose-600/20"
                    >
                      Специализировать всех героев
                    </button>
                  </div>

                  {/* Tailored Kit for Chosen Character */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase mb-1">
                        <Sparkles className="w-4 h-4" /> Персональный Сет
                      </div>
                      <h5 className="font-bold text-sm text-white">Комплект 5★ +20 под героя</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Выдать набор идеальных 5★ +20 артефактов строго со статами под выбранного героя (ХП для Нереуса/Ивы, ЗАЩ для Керна).
                      </p>
                      <div className="mt-3">
                        <select
                          value={selectedCharForKit}
                          onChange={(e) => setSelectedCharForKit(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          {Object.keys(characterBlueprints).map(cid => {
                            const cname = characterBlueprints[cid]?.name || cid;
                            const pref = CHARACTER_PREFERENCES[cid]?.main?.[0] || 'atk';
                            const prefStr = pref === 'hp' ? 'ХП' : pref === 'def' ? 'ЗАЩ' : 'АТК';
                            return (
                              <option key={cid} value={cid}>
                                {cname} (Приоритет: {prefStr})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => giveTailoredKitForCharacter(selectedCharForKit)}
                      className="mt-4 w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-lg shadow-teal-600/20"
                    >
                      Выдать комплект герою
                    </button>
                  </div>

                  {/* Pack of all artifacts */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase mb-1">
                        <ShieldAlert className="w-4 h-4" /> Склад
                      </div>
                      <h5 className="font-bold text-sm text-white">Склад 5★ +20 артефактов</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Добавить в инвентарь набор идеальных +20 артефактов всех сетов игры со специализированными статами (ХП для Кораллового Прилива и Шёпота Терновника, ЗАЩ для Кристального Резонанса).
                      </p>
                    </div>
                    <button
                      onClick={generateGodArtifactPack}
                      className="mt-4 w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Добавить все сеты
                    </button>
                  </div>

                  {/* Unlimited Resources */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                        <Gem className="w-4 h-4" /> Ресурсы
                      </div>
                      <h5 className="font-bold text-sm text-white">+1M Гемов & +50M Моры</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        +1,000,000 Кристаллов, +50,000,000 Золота, +500,000 Опыта, +2,000 Смолы.
                      </p>
                    </div>
                    <button
                      onClick={addResources}
                      className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Начислить ресурсы
                    </button>
                  </div>

                  {/* Max Battle Pass */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition">
                    <div>
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase mb-1">
                        <Crown className="w-4 h-4" /> Пропуск
                      </div>
                      <h5 className="font-bold text-sm text-white">100 Уровень БП + Золото</h5>
                      <p className="text-[11px] text-white/40 font-mono mt-1">
                        Активировать Золотой Пропуск и забрать все 100 уровней наград.
                      </p>
                    </div>
                    <button
                      onClick={maxBattlePass}
                      className="mt-4 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Максимум БП
                    </button>
                  </div>

                  {/* Abyss & Story */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition md:col-span-2 lg:col-span-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                          <Zap className="w-4 h-4" /> Контент
                        </div>
                        <h5 className="font-bold text-sm text-white">Пройти Бездну (12 этаж) и Сюжет</h5>
                        <p className="text-[11px] text-white/40 font-mono mt-1">
                          Мгновенно закрыть 12 этаж Витой и Лунной Бездны, а также открыть и пройти все сюжетные главы и диалоги.
                        </p>
                      </div>
                      <button
                        onClick={clearAbyssAndStory}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 shrink-0 cursor-pointer"
                      >
                        Завершить Бездну и Сюжет
                      </button>
                    </div>
                  </div>

                  {/* Fix decimal stats & repair artifacts */}
                  <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition md:col-span-2 lg:col-span-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                          <CheckCircle className="w-4 h-4" /> Нормализация
                        </div>
                        <h5 className="font-bold text-sm text-white">Починить все артефакты и убрать дроби</h5>
                        <p className="text-[11px] text-white/40 font-mono mt-1">
                          Пересчитывает статы всех артефактов в аккаунте: исправляет заниженные или дробные значения (46.6 ➔ 1800/2400), делая все HP, ATK, DEF целыми числами без десятичных дробей.
                        </p>
                      </div>
                      <button
                        onClick={repairAllArtifactsAndStats}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition active:scale-95 shrink-0 cursor-pointer shadow-lg shadow-emerald-600/30"
                      >
                        Починить артефакты и статы
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
