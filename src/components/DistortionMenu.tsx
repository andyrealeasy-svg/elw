import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Swords, 
  ChevronLeft, 
  RotateCcw, 
  Check, 
  X, 
  Skull, 
  Layers, 
  Info, 
  ArrowRight, 
  HelpCircle,
  Crown,
  Search,
  CheckCircle2,
  UserCheck,
  Flame,
  Droplets,
  Wind,
  Leaf,
  Mountain,
  Snowflake,
  Activity,
  SlidersHorizontal,
  Award,
  ArrowLeftRight,
  User,
  Lock
} from 'lucide-react';
import { PlayerProfile, Element } from '../types';
import { 
  DISTORTION_BUFFS, 
  DISTORTION_STAGES, 
  DistortionBuff, 
  DistortionTeamSlot, 
  DistortionRunState, 
  createDistortionCombatant,
  loadDistortionProgression,
  DISTORTION_ALL_LEVELS,
  DISTORTION_MAX_LEVEL
} from '../data/distortionData';
import { characterBlueprints, charRarity, getCharEmoji, getCharSplash } from '../data';
import { DistortionLevelPass } from './DistortionLevelPass';
import { cn } from '../lib/utils';

interface DistortionMenuProps {
  profile: PlayerProfile;
  updateProfile?: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBack: () => void;
  onStartBattle: (stage: number, buffIds: string[], teamSlots: DistortionTeamSlot[]) => void;
  initialRunState?: DistortionRunState | null;
  onUpdateRunState?: (state: DistortionRunState | null) => void;
}

const STORAGE_KEY = 'ed_distortion_run_state_v1';

export const DistortionMenu: React.FC<DistortionMenuProps> = ({
  profile,
  updateProfile,
  onBack,
  onStartBattle,
  initialRunState,
  onUpdateRunState
}) => {
  const [activeTab, setActiveTab] = useState<'STAGES' | 'LEVELS'>('STAGES');
  const distortionProg = useMemo(() => loadDistortionProgression(profile), [profile]);
  const claimableRewardsCount = useMemo(() => {
    return DISTORTION_ALL_LEVELS.filter(
      r => r.level <= distortionProg.level && !distortionProg.claimedLevels.includes(r.level)
    ).length;
  }, [distortionProg]);

  // Load or initialize run state
  const [runState, setRunState] = useState<DistortionRunState>(() => {
    if (initialRunState) return initialRunState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentStage === 'number') {
          parsed.currentStage = Math.max(1, Math.min(10, parsed.currentStage));
          return parsed;
        }
      }
    } catch (e) {}

    // Default starting team from player's active team or standard roster
    const defaultTeam: DistortionTeamSlot[] = (profile.team || ['moyan', 'kopro', 'selva', 'selina'])
      .slice(0, 4)
      .map(charId => ({
        charId: characterBlueprints[charId] ? charId : 'moyan',
        usePlayerBuild: !!(profile.roster && profile.roster[charId])
      }));

    while (defaultTeam.length < 4) {
      const allKeys = Object.keys(characterBlueprints);
      const nextChar = allKeys.find(k => !defaultTeam.some(t => t.charId === k)) || 'moyan';
      defaultTeam.push({
        charId: nextChar,
        usePlayerBuild: !!(profile.roster && profile.roster[nextChar])
      });
    }

    return {
      currentStage: 1,
      activeBuffIds: [],
      team: defaultTeam,
      status: 'LOBBY',
      pendingBuffPicks: [],
      pendingPickCount: 1,
      selectedInBatch: [],
      historyStages: []
    };
  });

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [filterElement, setFilterElement] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBuffsViewer, setShowBuffsViewer] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [selectedStageView, setSelectedStageView] = useState<number>(() => runState.currentStage);
  const [selectedBuffCandidate, setSelectedBuffCandidate] = useState<string | null>(() => {
    return runState.pendingBuffPicks?.[0] || null;
  });

  // Sync selectedStageView with runState.currentStage
  React.useEffect(() => {
    setSelectedStageView(runState.currentStage);
  }, [runState.currentStage]);

  // Keep selectedBuffCandidate synchronized with pendingBuffPicks
  React.useEffect(() => {
    if (runState.status === 'SELECTING_BUFFS' && runState.pendingBuffPicks.length > 0) {
      if (!selectedBuffCandidate || !runState.pendingBuffPicks.includes(selectedBuffCandidate)) {
        setSelectedBuffCandidate(runState.pendingBuffPicks[0]);
      }
    }
  }, [runState.status, runState.pendingBuffPicks, selectedBuffCandidate]);

  // If selecting buffs but list is empty (e.g. state inconsistency), auto-generate
  React.useEffect(() => {
    if (runState.status === 'SELECTING_BUFFS' && (!runState.pendingBuffPicks || runState.pendingBuffPicks.length === 0)) {
      const options = generateRandomBuffOptions(3, runState.activeBuffIds);
      setSelectedBuffCandidate(options[0] || null);
      updateRunState(prev => ({
        ...prev,
        pendingBuffPicks: options,
        pendingPickCount: 1,
        selectedInBatch: []
      }));
    } else if (runState.status === 'CHECKPOINT_STAGE_5' && (!runState.pendingBuffPicks || runState.pendingBuffPicks.length === 0)) {
      const options = generateRandomBuffOptions(5, runState.activeBuffIds);
      updateRunState(prev => ({
        ...prev,
        pendingBuffPicks: options,
        pendingPickCount: 3,
        selectedInBatch: []
      }));
    }
  }, [runState.status, runState.pendingBuffPicks, runState.activeBuffIds]);

  // Sync state helper
  const updateRunState = (updater: (prev: DistortionRunState) => DistortionRunState) => {
    setRunState(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      if (onUpdateRunState) onUpdateRunState(next);
      return next;
    });
  };

  const allCharacterKeys = useMemo(() => {
    return Object.keys(characterBlueprints);
  }, []);

  const currentStageConfig = useMemo(() => {
    return DISTORTION_STAGES.find(s => s.stage === selectedStageView) || DISTORTION_STAGES[0];
  }, [selectedStageView]);

  // Generate random buffs not yet active
  const generateRandomBuffOptions = (count: number, currentActive: string[]): string[] => {
    const available = DISTORTION_BUFFS.filter(b => !currentActive.includes(b.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(b => b.id);
  };

  // Start Stage flow: triggers buff selection or checkpoint
  const handleInitiateStage = () => {
    const isStage5Checkpoint = (runState.currentStage === 6 && runState.status === 'CHECKPOINT_STAGE_5') || (runState.currentStage === 6 && runState.activeBuffIds.length < 8);
    const count = isStage5Checkpoint ? 5 : 3;
    const picksNeeded = isStage5Checkpoint ? 3 : 1;

    const options = generateRandomBuffOptions(count, runState.activeBuffIds);
    setSelectedBuffCandidate(options[0] || null);

    updateRunState(prev => ({
      ...prev,
      status: isStage5Checkpoint ? 'CHECKPOINT_STAGE_5' : 'SELECTING_BUFFS',
      pendingBuffPicks: options,
      pendingPickCount: picksNeeded,
      selectedInBatch: []
    }));
  };

  // Quick Start without opening buff selection
  const handleQuickLaunch = () => {
    const options = generateRandomBuffOptions(1, runState.activeBuffIds);
    const chosenBuff = options[0] || 'time_warp';
    handleConfirmSingleBuffAndLaunch(chosenBuff);
  };

  // Handle buff selection in modal
  const handleSelectBuff = (buffId: string) => {
    if (runState.pendingPickCount === 1) {
      setSelectedBuffCandidate(buffId);
    } else {
      // Multi-selection (picking 3 of 5 for checkpoint)
      const already = runState.selectedInBatch.includes(buffId);
      let nextBatch: string[];
      if (already) {
        nextBatch = runState.selectedInBatch.filter(id => id !== buffId);
      } else {
        if (runState.selectedInBatch.length >= runState.pendingPickCount) {
          nextBatch = [...runState.selectedInBatch.slice(1), buffId];
        } else {
          nextBatch = [...runState.selectedInBatch, buffId];
        }
      }
      updateRunState(prev => ({ ...prev, selectedInBatch: nextBatch }));
    }
  };

  // Confirm single buff and immediately launch battle
  const handleConfirmSingleBuffAndLaunch = (buffId: string) => {
    const nextActive = [...runState.activeBuffIds, buffId];
    updateRunState(prev => ({
      ...prev,
      activeBuffIds: nextActive,
      status: 'IN_BATTLE',
      pendingBuffPicks: [],
      pendingPickCount: 1
    }));
    onStartBattle(runState.currentStage, nextActive, runState.team);
  };

  // Confirm checkpoint 3 buffs and return to lobby for stage 6
  const handleConfirmMultiBuff = () => {
    if (runState.selectedInBatch.length !== runState.pendingPickCount) return;
    const nextActive = [...runState.activeBuffIds, ...runState.selectedInBatch];
    updateRunState(prev => ({
      ...prev,
      activeBuffIds: nextActive,
      status: 'LOBBY',
      pendingBuffPicks: [],
      selectedInBatch: []
    }));
  };

  // Change character in slot
  const handleSelectCharacterForSlot = (charId: string) => {
    if (selectedSlotIndex === null) return;
    const isOwned = !!(profile.roster && profile.roster[charId]);
    const nextTeam = [...runState.team];
    nextTeam[selectedSlotIndex] = {
      charId,
      usePlayerBuild: isOwned
    };
    updateRunState(prev => ({ ...prev, team: nextTeam }));
    setSelectedSlotIndex(null);
  };

  // Toggle build mode for a slot
  const handleSetBuildMode = (slotIdx: number, usePlayerBuild: boolean) => {
    const nextTeam = [...runState.team];
    if (nextTeam[slotIdx]) {
      nextTeam[slotIdx] = {
        ...nextTeam[slotIdx],
        usePlayerBuild
      };
      updateRunState(prev => ({ ...prev, team: nextTeam }));
    }
  };

  // Reset run state
  const handleExecuteReset = () => {
    setShowResetConfirmModal(false);
    const defaultTeam: DistortionTeamSlot[] = (profile.team || ['moyan', 'kopro', 'selva', 'selina'])
      .slice(0, 4)
      .map(charId => ({
        charId: characterBlueprints[charId] ? charId : 'moyan',
        usePlayerBuild: !!(profile.roster && profile.roster[charId])
      }));

    while (defaultTeam.length < 4) {
      const allKeys = Object.keys(characterBlueprints);
      const nextChar = allKeys.find(k => !defaultTeam.some(t => t.charId === k)) || 'moyan';
      defaultTeam.push({
        charId: nextChar,
        usePlayerBuild: !!(profile.roster && profile.roster[nextChar])
      });
    }

    const resetState: DistortionRunState = {
      currentStage: 1,
      activeBuffIds: [],
      team: defaultTeam,
      status: 'LOBBY',
      pendingBuffPicks: [],
      pendingPickCount: 1,
      selectedInBatch: [],
      historyStages: []
    };
    updateRunState(() => resetState);
    setSelectedStageView(1);
  };

  // Filtered characters for selector
  const filteredCharacters = useMemo(() => {
    return allCharacterKeys.filter(charId => {
      const dummy = characterBlueprints[charId]?.('temp', 1, 0);
      if (!dummy) return false;
      if (filterElement !== 'ALL' && dummy.element !== filterElement) return false;
      if (searchQuery.trim() && !dummy.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allCharacterKeys, filterElement, searchQuery]);

  const getElementIcon = (el: string) => {
    switch (el) {
      case 'Pyro': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Hydro': return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Electro': return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 'Cryo': return <Snowflake className="w-3.5 h-3.5 text-sky-300" />;
      case 'Dendro': return <Leaf className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Geo': return <Mountain className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  const renderDistortionBuffIcon = (buffId: string, className = "w-5 h-5") => {
    const buff = DISTORTION_BUFFS.find(b => b.id === buffId);
    if (!buff) return <Layers className={cn("text-cyan-400", className)} />;
    
    if (buff.id === 'absolute_mastery') {
      return <Crown className={cn("text-amber-300", className)} />;
    }
    if (buff.id.includes('shield') || buff.id.includes('aegis') || buff.id.includes('fortress') || buff.id.includes('endurance') || buff.category === 'DEFENSIVE') {
      return <Shield className={cn("text-emerald-400", className)} />;
    }
    if (buff.id.includes('fire') || buff.id.includes('solar') || buff.id.includes('kinetic') || buff.id.includes('frenzy') || (buff.tag && buff.tag.includes('ПИРО'))) {
      return <Flame className={cn("text-rose-400", className)} />;
    }
    if (buff.id.includes('chrono') || buff.id.includes('time') || (buff.tag && buff.tag.includes('ВРЕМЯ')) || (buff.tag && buff.tag.includes('ATB'))) {
      return <Zap className={cn("text-amber-400", className)} />;
    }
    if (buff.id.includes('lightning') || buff.id.includes('energy') || (buff.tag && buff.tag.includes('СКОРОСТЬ')) || (buff.tag && buff.tag.includes('ЭЛЕКТРО'))) {
      return <Zap className={cn("text-cyan-400", className)} />;
    }
    if (buff.id.includes('strike') || buff.id.includes('berserk') || buff.id.includes('critical') || buff.id.includes('cascade') || buff.category === 'OFFENSIVE') {
      return <Swords className={cn("text-rose-400", className)} />;
    }
    if (buff.id.includes('rift') || buff.id.includes('elemental') || buff.id.includes('glacial') || buff.id.includes('cyclone') || buff.category === 'ELEMENTAL') {
      return <Sparkles className={cn("text-teal-300", className)} />;
    }
    return <Layers className={cn("text-purple-300", className)} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0d14] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_rgba(30,41,59,0.35)_0%,_transparent_75%)]" />

      {/* Top Header - Mobile friendly & Responsive */}
      <header className="relative z-20 shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#0f131d]/95 backdrop-blur-md shadow-sm">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 transition-all text-slate-300 hover:text-white cursor-pointer shrink-0"
              title="Назад в Хаб"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                  ЭНДГЕЙМ
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-700/50 items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> ВОСКРЕШЕНИЕ 50%
                </span>
              </div>
              <h1 className="text-base sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5 truncate">
                ИСКАЖЕНИЕ
              </h1>
            </div>
          </div>

          {/* Desktop Center: Tab Controls */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-black/50 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('STAGES')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                activeTab === 'STAGES'
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Этапы</span>
            </button>
            <button
              onClick={() => setActiveTab('LEVELS')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer relative",
                activeTab === 'LEVELS'
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>Уровни ({distortionProg.level})</span>
              {claimableRewardsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-black text-[10px] font-black animate-pulse">
                  +{claimableRewardsCount}
                </span>
              )}
            </button>
          </div>

          {/* Right: Rules, Buffs, Reset Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Правила режима"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Правила</span>
            </button>

            <button
              onClick={() => setShowBuffsViewer(true)}
              className="px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold cursor-pointer"
              title="Активные искажения"
            >
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Искажения</span>
              <span className="font-mono text-cyan-300 font-bold">({runState.activeBuffIds.length})</span>
            </button>

            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-800/60 text-red-300 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
              title="Сбросить забег"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Row 2: Tab Controls (Segmented, full width) */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-black/60 rounded-xl border border-white/10 shadow-inner mt-2 w-full max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab('STAGES')}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer",
              activeTab === 'STAGES'
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Этапы</span>
          </button>
          <button
            onClick={() => setActiveTab('LEVELS')}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative",
              activeTab === 'LEVELS'
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Award className="w-3.5 h-3.5 text-purple-300" />
            <span>Уровни ({distortionProg.level})</span>
            {claimableRewardsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-black text-[10px] font-black animate-pulse">
                +{claimableRewardsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Conditionally Render: LEVELS Tab vs STAGES Tab */}
      {activeTab === 'LEVELS' ? (
        <DistortionLevelPass 
          profile={profile} 
          updateProfile={updateProfile} 
          onBackToStages={() => setActiveTab('STAGES')} 
        />
      ) : (
        <>
          {/* 10-Stage Progression Bar (Interactive) */}
          <div className="relative z-10 shrink-0 px-4 sm:px-6 py-2.5 bg-[#121622] border-b border-slate-800/80">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 max-w-7xl mx-auto overflow-x-auto no-scrollbar py-0.5">
              {DISTORTION_STAGES.map((st) => {
                const isSelected = st.stage === selectedStageView;
                const isCurrentRunStage = st.stage === runState.currentStage;
                const isCleared = st.stage < runState.currentStage;
                const isStageBoss = st.isBoss;
                const isUnlocked = st.stage <= runState.currentStage;

                return (
                  <button 
                    key={st.stage}
                    type="button"
                    onClick={() => {
                      if (isUnlocked) {
                        setSelectedStageView(st.stage);
                      }
                    }}
                    disabled={!isUnlocked}
                    className={cn(
                      "flex-1 min-w-[76px] sm:min-w-[94px] py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all shrink-0 text-left",
                      isSelected
                        ? "bg-slate-800 border-cyan-400 shadow-md ring-2 ring-cyan-400/80 cursor-pointer"
                        : isCurrentRunStage
                          ? "bg-slate-900/90 border-cyan-500/60 text-white cursor-pointer hover:border-cyan-400/80"
                          : isCleared 
                            ? "bg-[#101915] border-emerald-800/60 hover:border-emerald-600 text-slate-300 cursor-pointer" 
                            : "bg-[#0b0e16] border-slate-800/60 text-slate-600 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-mono font-black uppercase">
                      {isStageBoss && (
                        <Skull className={cn("w-3.5 h-3.5", isSelected || isCurrentRunStage ? "text-amber-400" : isCleared ? "text-emerald-400" : "text-slate-600")} />
                      )}
                      <span className={cn(isSelected ? "text-cyan-300 font-black" : isCleared ? "text-emerald-300 font-bold" : isUnlocked ? "text-slate-200 font-bold" : "text-slate-500")}>
                        {st.stage} ЭТАП
                      </span>
                      {isCleared && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                    </div>
                    <span className={cn(
                      "text-[9px] font-mono font-medium truncate max-w-full mt-0.5",
                      isSelected ? "text-cyan-300 font-bold" : isCleared ? "text-emerald-400/80" : isUnlocked ? "text-slate-400" : "text-slate-600"
                    )}>
                      {isStageBoss ? (st.stage === 5 ? 'МИД-БОСС' : 'ФИНАЛ') : `Ур. ${st.level}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Body - Standard block scroll layout with NO flex-shrink issues */}
          <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
            
            {/* Quick Level Pass Callout Card */}
            <div 
              onClick={() => setActiveTab('LEVELS')}
              className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/80 border border-purple-500/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-purple-400/60 transition-all hover:scale-[1.005] group shadow-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/50 flex items-center justify-center text-purple-300 text-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-purple-200">
                      Уровни Искажения: Уровень {distortionProg.level} / {DISTORTION_MAX_LEVEL}
                    </span>
                    {claimableRewardsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black animate-pulse">
                        +{claimableRewardsCount} Наград Доступно
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-300 truncate mt-0.5">
                    Получайте +200 EXP за полную зачистку. Награды: B-ранг персонажи, гемы, билеты и артефакты!
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-purple-300 group-hover:text-purple-200 shrink-0">
                <span>Открыть Уровни</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Stage Cleared Notification Banner */}
            {runState.historyStages.length > 0 && runState.currentStage <= 10 && (
              <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/80 border border-emerald-500/60 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      Этап {runState.currentStage - 1} успешно пройден!
                    </p>
                    <p className="text-emerald-300/80 text-[11px] font-mono mt-0.5">
                      Этап пройден. Выберите усиление для следующей битвы. Основные награды завязаны на Системе Уровней Искажения.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleInitiateStage}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
                >
                  <span>Выбрать усиление для Этапа {runState.currentStage}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

        {/* Stage Hero Banner (Non-collapsible, fully visible) */}
        <div className="w-full shrink-0 bg-[#131724] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5 border",
                  currentStageConfig.isBoss
                    ? "bg-amber-950/80 text-amber-300 border-amber-600/70"
                    : "bg-slate-800 text-slate-200 border-slate-600/80"
                )}>
                  {currentStageConfig.isBoss ? <Skull className="w-3.5 h-3.5 text-amber-400" /> : <Layers className="w-3.5 h-3.5 text-cyan-400" />}
                  ЭТАП {currentStageConfig.stage} ИЗ 10 {currentStageConfig.isBoss ? '• БОСС' : ''}
                </span>
                <span className="text-slate-300 text-xs font-mono bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700">
                  Уровень противников: {currentStageConfig.level}
                </span>
                <span className="text-emerald-400 text-xs font-mono bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/70 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Возрождение 50% HP
                </span>
                {selectedStageView < runState.currentStage && (
                  <span className="text-emerald-300 text-xs font-mono bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-700/80 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Пройден
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase mt-1">
                {currentStageConfig.title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                {currentStageConfig.description}
              </p>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
              <div className="hidden lg:block text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Активные искажения</span>
                <div className="text-lg font-black text-cyan-400 font-mono">{runState.activeBuffIds.length} / 32</div>
              </div>

              {selectedStageView === runState.currentStage ? (
                <>
                  <button
                    onClick={handleInitiateStage}
                    className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 border border-slate-600 shadow-lg cursor-pointer hover:border-cyan-400/60"
                  >
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>
                      {runState.currentStage === 6 && runState.status === 'CHECKPOINT_STAGE_5' 
                        ? 'ЧЕКПОИНТ: ВЫБРАТЬ 3 ИСКАЖЕНИЯ' 
                        : `ВЫБРАТЬ УСИЛЕНИЕ И В БОЙ (ЭТАП ${runState.currentStage})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleQuickLaunch}
                    className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white font-mono text-[11px] font-bold uppercase rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Автоматически выбрать случайное искажение и сразу начать бой"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Быстрый старт (Этап {runState.currentStage})</span>
                  </button>
                </>
              ) : selectedStageView < runState.currentStage ? (
                <div className="flex flex-col gap-2">
                  <div className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 justify-end">
                    <CheckCircle2 className="w-4 h-4" /> Этап уже завершен
                  </div>
                  <button
                    onClick={() => setSelectedStageView(runState.currentStage)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs uppercase tracking-wider rounded-xl border border-cyan-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Перейти к активному Этапу {runState.currentStage}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-500 text-xs font-mono font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Пройдите Этап {selectedStageView - 1} для разблокировки</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Squad Selection Section */}
        <div className="w-full shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" /> Боевой Отряд Искажения (4 Героя)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Все персонажи игры доступны на 90 уровне (C0). Для персонажей из вашей коллекции можно включить свою сборку.
              </p>
            </div>
          </div>

          {/* 4 Hero Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {runState.team.map((slot, slotIdx) => {
              const charId = slot.charId;
              const isOwned = !!(profile.roster && profile.roster[charId]);
              const playerCharData = isOwned ? profile.roster[charId] : null;
              const splash = getCharSplash(charId);
              const rarity = charRarity[charId] || 'A';
              const rColor = rarity === 'S' ? 'text-amber-400' : rarity === 'A' ? 'text-purple-400' : 'text-blue-400';

              const previewHero = createDistortionCombatant(charId, slot.usePlayerBuild, profile, slotIdx);

              return (
                <div 
                  key={slotIdx}
                  className="bg-[#131724] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Character Card Header with Prominent Portrait */}
                    <div 
                      className="relative w-full h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-3 group cursor-pointer"
                      onClick={() => setSelectedSlotIndex(slotIdx)}
                    >
                      {splash ? (
                        <img 
                          src={splash} 
                          alt={previewHero.name} 
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                          <User className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-slate-200 border border-white/10 uppercase flex items-center gap-1">
                          {getElementIcon(previewHero.element)}
                          {previewHero.element}
                        </span>
                        <span className={cn("px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-black border border-white/10", rColor)}>
                          {rarity}★
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-white/10 font-bold">
                          Слот {slotIdx + 1}
                        </span>
                      </div>

                      {/* Bottom Info on Splash */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                        <div>
                          <div className="font-black text-sm text-white uppercase tracking-tight drop-shadow-md">
                            {previewHero.name}
                          </div>
                          <span className="text-[10px] font-mono text-slate-300 block">
                            Ур. {slot.usePlayerBuild ? (playerCharData?.level || 90) : 90}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1">
                          <ArrowLeftRight className="w-3 h-3" /> Сменить
                        </span>
                      </div>
                    </div>

                    {/* Stats Compact Table */}
                    <div className="grid grid-cols-4 gap-1 bg-slate-950/90 rounded-xl p-2.5 mb-3 text-[10px] font-mono border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[8px] uppercase">HP</span>
                        <span className="font-bold text-emerald-400 truncate">{previewHero.stats.maxHp.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[8px] uppercase">АТК</span>
                        <span className="font-bold text-rose-400 truncate">{previewHero.stats.atk.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[8px] uppercase">КРИТ</span>
                        <span className="font-bold text-amber-400 truncate">{previewHero.stats.critRate}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[8px] uppercase">СКОР</span>
                        <span className="font-bold text-sky-400 truncate">{previewHero.stats.spd}</span>
                      </div>
                    </div>
                  </div>

                  {/* Build Mode Segmented Control */}
                  <div className="pt-2 border-t border-slate-800">
                    {isOwned ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Сборка:</span>
                          <span className={cn("font-bold", slot.usePlayerBuild ? "text-amber-400" : "text-cyan-400")}>
                            {slot.usePlayerBuild 
                              ? `Своя (Ур.${playerCharData?.level || 1}, C${playerCharData?.constellation || 0})` 
                              : 'Стандарт 90 (C0)'}
                          </span>
                        </div>

                        {/* Segmented Toggle Buttons */}
                        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleSetBuildMode(slotIdx, false)}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer",
                              !slot.usePlayerBuild 
                                ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                                : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            Стандарт 90
                          </button>
                          <button
                            onClick={() => handleSetBuildMode(slotIdx, true)}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer",
                              slot.usePlayerBuild 
                                ? "bg-amber-950/80 text-amber-300 border border-amber-600/60 shadow-sm" 
                                : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            Своя сборка
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl py-2 px-2.5 text-center">
                        <span className="text-[10px] font-mono text-slate-300 block font-bold">
                          Стандартная сборка 90 ур. (C0)
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                          Герой открыт для всех в Искажении
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Buffs Showcase Section */}
        <div className="w-full shrink-0 bg-[#131724] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Активные Искажения ({runState.activeBuffIds.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Сохраняются до 10-го этапа</span>
          </div>

          {runState.activeBuffIds.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Искажения ещё не выбраны. Нажмите «Выбрать усиление» перед началом боя!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {runState.activeBuffIds.map(buffId => {
                const buff = DISTORTION_BUFFS.find(b => b.id === buffId);
                if (!buff) return null;

                return (
                  <div 
                    key={buffId}
                    className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-start gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {renderDistortionBuffIcon(buff.id, "w-4 h-4")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white uppercase tracking-tight truncate">
                          {buff.name}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded uppercase border border-slate-700">{buff.tag}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-tight">
                        {buff.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHARACTER SELECTOR (LARGE SPLASH ART, RARITY, ELEMENT, NEVER SQUEEZED) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSlotIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121d] border border-slate-700/90 rounded-2xl max-w-6xl w-full shadow-2xl relative flex flex-col h-[88vh] max-h-[88vh] overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1017] flex items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-wider border border-cyan-700/50">
                      Слот #{selectedSlotIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      Все 32+ персонажа доступны со средними статами 90 ур.
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
                    Выберите Героя в Отряд
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSlotIndex(null)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-3 sm:p-4 bg-[#141824] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                {/* Search Box */}
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 px-3.5 py-2 rounded-xl flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск героя по имени..."
                    className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 outline-none w-full font-mono"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Element Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {['ALL', 'Pyro', 'Hydro', 'Electro', 'Cryo', 'Dendro', 'Geo', 'Physical'].map(el => (
                    <button
                      key={el}
                      onClick={() => setFilterElement(el)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer",
                        filterElement === el 
                          ? "bg-slate-700 text-white border border-cyan-400/80 shadow-sm" 
                          : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                      )}
                    >
                      {el !== 'ALL' && getElementIcon(el)}
                      <span>{el === 'ALL' ? 'Все' : el}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Characters Grid with Big Solid Cards */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {filteredCharacters.map(charId => {
                  const isOwned = !!(profile.roster && profile.roster[charId]);
                  const playerCharData = isOwned ? profile.roster[charId] : null;
                  const splash = getCharSplash(charId);
                  const rarity = charRarity[charId] || 'A';
                  const rColor = rarity === 'S' ? 'text-amber-400' : rarity === 'A' ? 'text-purple-400' : 'text-blue-400';
                  const dummy = characterBlueprints[charId]?.('temp', 1, 0);

                  const teamSlotIdx = runState.team.findIndex(t => t.charId === charId);
                  const isAlreadyInTeam = teamSlotIdx !== -1 && teamSlotIdx !== selectedSlotIndex;
                  const isCurrentSlotHero = runState.team[selectedSlotIndex]?.charId === charId;

                  return (
                    <div 
                      key={charId}
                      onClick={() => !isAlreadyInTeam && handleSelectCharacterForSlot(charId)}
                      className={cn(
                        "bg-[#141926] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all relative group select-none shadow-md min-h-[220px]",
                        isAlreadyInTeam 
                          ? "opacity-35 border-slate-800 cursor-not-allowed grayscale" 
                          : isCurrentSlotHero
                            ? "border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900 cursor-pointer"
                            : "border-slate-800 hover:border-cyan-400/70 hover:bg-[#192133] cursor-pointer"
                      )}
                    >
                      {/* Character Artwork Header */}
                      <div className="relative w-full h-36 bg-slate-950 overflow-hidden shrink-0">
                        {splash ? (
                          <img 
                            src={splash} 
                            alt={dummy?.name || charId} 
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-900">
                            {getCharEmoji(charId)}
                          </div>
                        )}

                        {/* Gradient Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141926] via-transparent to-black/60" />

                        {/* Element & Rarity Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-white border border-white/10 uppercase flex items-center gap-1">
                            {getElementIcon(dummy?.element || 'Physical')}
                            {dummy?.element}
                          </span>
                          <span className={cn("px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-black border border-white/10", rColor)}>
                            {rarity}★
                          </span>
                        </div>

                        {/* Status Badges on Art */}
                        {isAlreadyInTeam && (
                          <div className="absolute top-2 right-2 bg-rose-950/90 border border-rose-600/70 text-rose-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                            В слоте #{teamSlotIdx + 1}
                          </div>
                        )}

                        {isCurrentSlotHero && (
                          <div className="absolute top-2 right-2 bg-cyan-950/90 border border-cyan-500/80 text-cyan-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> Выбран
                          </div>
                        )}
                      </div>

                      {/* Character Content Body */}
                      <div className="p-3 flex flex-col justify-between flex-1">
                        <div>
                          <h4 className="font-black text-sm text-white uppercase tracking-tight truncate">
                            {dummy?.name || charId}
                          </h4>
                        </div>

                        {/* Ownership & Build Info Banner */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                          {isOwned ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 truncate">
                              <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" /> Своя (Ур.{playerCharData?.level})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">
                              Стандарт 90 ур.
                            </span>
                          )}

                          <span className="text-[10px] text-cyan-400 font-bold uppercase group-hover:underline ml-1 shrink-0">
                            Выбрать
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: BUFF SELECTION (3 PER STAGE / 3 OF 5 AT CHECKPOINT)               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {(runState.status === 'SELECTING_BUFFS' || runState.status === 'CHECKPOINT_STAGE_5') && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111420] border border-slate-700/90 rounded-2xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Buff Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-wider border border-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {runState.pendingPickCount === 1 ? 'ВЫБОР ИСКАЖЕНИЯ' : 'ЧЕКПОИНТ: ВЫБЕРИТЕ 3 ИЗ 5'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    {runState.pendingPickCount === 1 
                      ? `Усиление перед ${runState.currentStage} этапом` 
                      : 'Чекпоинт 5 Этапа: Выберите 3 Усиления'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {runState.pendingPickCount === 1 
                      ? 'Выберите одно искажение из предложенных. Оно будет действовать до конца 10 этапа.' 
                      : `Выберите сразу 3 усиления из 5 предложенных (${runState.selectedInBatch.length} / 3).`}
                  </p>
                </div>
                <button
                  onClick={() => updateRunState(prev => ({ ...prev, status: 'LOBBY', pendingBuffPicks: [], selectedInBatch: [] }))}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Buff Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 overflow-y-auto pr-1 flex-1 py-1">
                {runState.pendingBuffPicks.map(buffId => {
                  const buff = DISTORTION_BUFFS.find(b => b.id === buffId);
                  if (!buff) return null;

                  const isSelected = runState.pendingPickCount === 1 
                    ? selectedBuffCandidate === buffId 
                    : runState.selectedInBatch.includes(buffId);

                  return (
                    <motion.div
                      key={buffId}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectBuff(buffId)}
                      className={cn(
                        "rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative shadow-md",
                        isSelected 
                          ? "bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                            {renderDistortionBuffIcon(buff.id, "w-5 h-5")}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded uppercase border border-slate-700">
                            {buff.tag}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {buff.name}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {buff.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                          {buff.rarity}
                        </span>
                        {runState.pendingPickCount === 1 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmSingleBuffAndLaunch(buffId);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                              isSelected 
                                ? "bg-cyan-500 text-black font-black hover:bg-cyan-400 shadow-md" 
                                : "bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-200"
                            )}
                          >
                            <span>Выбрать и в бой</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all",
                            isSelected 
                              ? "bg-cyan-500 text-black font-black" 
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          )}>
                            {isSelected ? (
                              <span className="flex items-center gap-1"><Check className="w-3 h-3 stroke-[3]" /> Выбрано</span>
                            ) : 'Выбрать'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                {runState.pendingPickCount === 1 ? (
                  <>
                    <button
                      onClick={() => updateRunState(prev => ({ ...prev, status: 'LOBBY' }))}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-mono uppercase cursor-pointer"
                    >
                      Настроить отряд
                    </button>
                    <button
                      onClick={() => selectedBuffCandidate && handleConfirmSingleBuffAndLaunch(selectedBuffCandidate)}
                      disabled={!selectedBuffCandidate}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider transition-all text-black shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Swords className="w-4 h-4" />
                      <span>В БОЙ (ЭТАП {runState.currentStage})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-mono text-slate-300">
                      Выбрано: {runState.selectedInBatch.length} из {runState.pendingPickCount}
                    </span>
                    <button
                      onClick={handleConfirmMultiBuff}
                      disabled={runState.selectedInBatch.length !== runState.pendingPickCount}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider transition-all text-black shadow-lg cursor-pointer"
                    >
                      Подтвердить выбор ({runState.selectedInBatch.length}/3)
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ACTIVE BUFFS VIEWER                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBuffsViewer && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111420] border border-slate-700/90 rounded-2xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black uppercase text-white">
                    Коллекция Искажений Забега ({runState.activeBuffIds.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Все активные бонусы действуют на всю команду до 10-го этапа.
                  </p>
                </div>
                <button
                  onClick={() => setShowBuffsViewer(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
                {runState.activeBuffIds.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-mono">
                    В этом забеге пока нет выбранных искажений.
                  </div>
                ) : (
                  runState.activeBuffIds.map(buffId => {
                    const buff = DISTORTION_BUFFS.find(b => b.id === buffId);
                    if (!buff) return null;

                    return (
                      <div key={buffId} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {renderDistortionBuffIcon(buff.id, "w-4 h-4")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-white uppercase">{buff.name}</span>
                            <span className="text-[8px] font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded uppercase border border-slate-700">{buff.tag}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{buff.description}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: RULES HELP                                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111420] border border-slate-700/90 rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white">Правила Режима «Искажение»</h3>
                    <span className="text-xs text-slate-400">Эндгейм-испытание из 10 этапов</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-4 text-xs text-slate-300 leading-relaxed pr-1">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-white uppercase text-[13px] flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-amber-400" /> 1. Доступ ко всем персонажам (90 ур.)
                  </h4>
                  <p>
                    Вам доступны абсолютно все персонажи игры на 90 уровне (C0) со сбалансированными стандартными статами.
                    Если у вас есть персонаж в личной коллекции, вы можете в любой момент переключиться на <strong>свою сборку</strong> (сохраняются ваш уровень, созвездия C1–C6 и надетые артефакты).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-white uppercase text-[13px] flex items-center gap-2 mb-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" /> 2. 10 Боевых Этапов и 32 Усиления
                  </h4>
                  <p>
                    Перед каждым этапом вам предлагается на выбор 3 уникальных «Искажения». Выбранное усиление суммируется и действует на команду до конца забега. Всего в режиме 32 различных искажения.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-white uppercase text-[13px] flex items-center gap-2 mb-1.5">
                    <Skull className="w-4 h-4 text-amber-400" /> 3. Чекпоинт 5-го Этапа и Боссы
                  </h4>
                  <p>
                    На 5-м этапе вас ждет усиленный Мид-Босс, а на 10-м — финальный босс. После прохождения 5-го этапа открывается супер-выбор: <strong>3 усиления сразу из 5 предложенных</strong>, а также возможность пересобрать команду перед решающими битвами.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-emerald-300 uppercase text-[13px] flex items-center gap-2 mb-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" /> 4. Механика Бессмертия
                  </h4>
                  <p>
                    В этом режиме персонажи не умирают окончательно. При получении фатального урона персонаж моментально возрождается с <strong>50% максимального здоровья</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="font-bold text-purple-300 uppercase text-[13px] flex items-center gap-2 mb-1.5">
                    <Award className="w-4 h-4 text-purple-400" /> 5. Система 200 Уровней и Еженедельные Лимиты
                  </h4>
                  <p>
                    За каждое полное прохождение Искажения (победа на 10-м этапе) начисляется <strong>+200 EXP</strong> уровней Искажения (еженедельный лимит 1600 EXP, позволяющий дойти до 10-го уровня за неделю!). Прямые награды за полное прохождение выдаются только <strong>2 раза в неделю</strong>. Все основные награды (гемы, билеты, артефакты и B-ранг персонажи с анимацией призыва) открываются на вкладке «Уровни»!
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: RESET RUN CONFIRMATION                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111420] border border-red-800/80 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">Сбросить Забег?</h3>
                  <span className="text-xs text-red-300 font-mono">Прогресс вернется к 1 этапу</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Вы действительно хотите сбросить текущий прогресс забега Искажения? Все полученные усиления будут очищены, и забег начнется заново с 1 этапа.
              </p>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Сбросить забег
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
