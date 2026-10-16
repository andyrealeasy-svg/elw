import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Lock, 
  Check, 
  ChevronUp, 
  Gift, 
  Star, 
  Clock, 
  Filter, 
  Zap, 
  Gem, 
  Award, 
  ArrowRight, 
  Shield, 
  HelpCircle,
  Coins,
  BookOpen,
  Ticket,
  Package,
  User
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { 
  DISTORTION_MAX_LEVEL,
  DISTORTION_ALL_LEVELS,
  DISTORTION_WEEKLY_EXP_LIMIT,
  DISTORTION_EXP_PER_CLEAR,
  DistortionLevelReward,
  DistortionRewardType,
  DistortionProgression,
  loadDistortionProgression,
  saveDistortionProgression,
  getRequiredExpForDistortionLevel,
  getTimeUntilNextWeeklyReset
} from '../data/distortionData';
import { characterBlueprints, charRarity, getCharSplash, generateArtifact } from '../data';
import { ARTIFACT_DUNGEONS } from '../data';
import { DistortionGachaModal } from './DistortionGachaModal';
import { cn } from '../lib/utils';

const renderRewardIcon = (type: DistortionRewardType, className = "w-5 h-5") => {
  switch (type) {
    case 'GEMS': return <Gem className={cn("text-pink-400", className)} />;
    case 'GOLD': return <Coins className={cn("text-amber-400", className)} />;
    case 'HERO_EXP': return <BookOpen className={cn("text-emerald-400", className)} />;
    case 'TICKET': return <Ticket className={cn("text-indigo-400", className)} />;
    case 'ARTIFACT': return <Shield className={cn("text-yellow-400", className)} />;
    case 'RELIC_BOX': return <Package className={cn("text-purple-400", className)} />;
    case 'CHARACTER': return <Sparkles className={cn("text-cyan-400", className)} />;
    default: return <Gift className={cn("text-slate-300", className)} />;
  }
};

interface DistortionLevelPassProps {
  profile: PlayerProfile;
  updateProfile?: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBackToStages?: () => void;
}

export const DistortionLevelPass: React.FC<DistortionLevelPassProps> = ({
  profile,
  updateProfile,
  onBackToStages
}) => {
  const [progression, setProgression] = useState<DistortionProgression>(() => loadDistortionProgression(profile));
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHARACTERS' | 'CLAIMABLE'>('ALL');
  const [activeGachaChar, setActiveGachaChar] = useState<{ 
    charId: string; 
    level: number; 
    isNew: boolean; 
    constellation: number;
    isMaxConstellation: boolean;
  } | null>(null);

  const currentLevelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync progression on mount
  useEffect(() => {
    setProgression(loadDistortionProgression(profile));
  }, [profile]);

  const requiredExp = getRequiredExpForDistortionLevel(progression.level);
  const expProgressPercent = progression.level >= DISTORTION_MAX_LEVEL 
    ? 100 
    : Math.min(100, Math.floor((progression.currentExp / (requiredExp || 1)) * 100));

  const weeklyExpPercent = Math.min(100, Math.floor((progression.weeklyExpGained / DISTORTION_WEEKLY_EXP_LIMIT) * 100));

  // Count claimable rewards
  const claimableCount = useMemo(() => {
    return DISTORTION_ALL_LEVELS.filter(
      r => r.level <= progression.level && !progression.claimedLevels.includes(r.level)
    ).length;
  }, [progression.level, progression.claimedLevels]);

  // Scroll to active level
  const scrollToCurrentLevel = () => {
    if (currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Claim single reward
  const handleClaimReward = (reward: DistortionLevelReward) => {
    if (reward.level > progression.level || progression.claimedLevels.includes(reward.level)) {
      return;
    }

    if (reward.type === 'CHARACTER' && reward.charId) {
      const charId = reward.charId;
      const owned = profile.roster && profile.roster[charId];
      const isNew = !owned;
      const currentC = owned ? (owned.constellation ?? 0) : 0;
      const isMaxConstellation = !isNew && currentC >= 6;
      const newC = isNew ? 0 : Math.min(6, currentC + 1);

      // Trigger Gacha banner summon animation
      setActiveGachaChar({
        charId,
        level: reward.level,
        isNew,
        constellation: newC,
        isMaxConstellation
      });
      return;
    }

    // Process resource rewards
    const updatedClaimed = [...progression.claimedLevels, reward.level];
    const newProg = { ...progression, claimedLevels: updatedClaimed };
    setProgression(newProg);
    saveDistortionProgression(newProg);

    if (updateProfile) {
      updateProfile(p => {
        let nextP = { ...p, distortionProgress: newProg };

        if (reward.type === 'GEMS' && reward.amount) {
          nextP.gems += reward.amount;
        } else if (reward.type === 'GOLD' && reward.amount) {
          nextP.gold += reward.amount;
        } else if (reward.type === 'HERO_EXP' && reward.amount) {
          nextP.heroExp += reward.amount;
        } else if (reward.type === 'TICKET' && reward.amount) {
          nextP.gems += reward.amount * 160;
        } else if (reward.type === 'ARTIFACT') {
          const randomSet = ARTIFACT_DUNGEONS[Math.floor(Math.random() * ARTIFACT_DUNGEONS.length)].rewardSets[0];
          const newArt = generateArtifact(randomSet, 5);
          nextP.artifacts = [...nextP.artifacts, newArt];
        } else if (reward.type === 'RELIC_BOX') {
          const randomSet = ARTIFACT_DUNGEONS[0].rewardSets[0];
          const newArt = generateArtifact(randomSet, 5);
          nextP.gems += 150;
          nextP.gold += 50000;
          nextP.artifacts = [...nextP.artifacts, newArt];
        }

        return nextP;
      });
    }
  };

  // When Gacha animation completes
  const handleGachaComplete = () => {
    if (!activeGachaChar) return;
    const { charId, level } = activeGachaChar;

    const updatedClaimed = [...progression.claimedLevels, level];
    const newProg = { ...progression, claimedLevels: updatedClaimed };
    setProgression(newProg);
    saveDistortionProgression(newProg);

    if (updateProfile) {
      updateProfile(p => {
        const nextRoster = { ...p.roster };
        let nextGems = p.gems;
        if (!nextRoster[charId]) {
          nextRoster[charId] = {
            level: 1,
            constellation: 0,
            artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null }
          };
        } else {
          const currentC = nextRoster[charId].constellation ?? 0;
          if (currentC < 6) {
            nextRoster[charId] = {
              ...nextRoster[charId],
              constellation: currentC + 1
            };
          } else {
            // Already at max constellation C6: grant bonus refund gems and clamp to 6
            nextGems += 80;
            nextRoster[charId] = {
              ...nextRoster[charId],
              constellation: 6
            };
          }
        }
        return {
          ...p,
          gems: nextGems,
          roster: nextRoster,
          distortionProgress: newProg
        };
      });
    }

    setActiveGachaChar(null);
  };

  // Claim all non-character rewards
  const handleClaimAllResources = () => {
    const claimableResources = DISTORTION_ALL_LEVELS.filter(
      r => r.level <= progression.level && 
           !progression.claimedLevels.includes(r.level) && 
           r.type !== 'CHARACTER'
    );

    if (claimableResources.length === 0) return;

    let addedGems = 0;
    let addedGold = 0;
    let addedHeroExp = 0;
    const addedArts = [];
    const newClaimed = [...progression.claimedLevels];

    claimableResources.forEach(r => {
      newClaimed.push(r.level);
      if (r.type === 'GEMS' && r.amount) addedGems += r.amount;
      else if (r.type === 'GOLD' && r.amount) addedGold += r.amount;
      else if (r.type === 'HERO_EXP' && r.amount) addedHeroExp += r.amount;
      else if (r.type === 'TICKET' && r.amount) addedGems += r.amount * 160;
      else if (r.type === 'ARTIFACT') {
        const set = ARTIFACT_DUNGEONS[Math.floor(Math.random() * ARTIFACT_DUNGEONS.length)].rewardSets[0];
        addedArts.push(generateArtifact(set, 5));
      } else if (r.type === 'RELIC_BOX') {
        addedGems += 150;
        addedGold += 50000;
        const set = ARTIFACT_DUNGEONS[0].rewardSets[0];
        addedArts.push(generateArtifact(set, 5));
      }
    });

    const newProg = { ...progression, claimedLevels: newClaimed };
    setProgression(newProg);
    saveDistortionProgression(newProg);

    if (updateProfile) {
      updateProfile(p => ({
        ...p,
        gems: p.gems + addedGems,
        gold: p.gold + addedGold,
        heroExp: p.heroExp + addedHeroExp,
        artifacts: [...p.artifacts, ...addedArts],
        distortionProgress: newProg
      }));
    }
  };

  // Filtered levels list
  const filteredLevels = useMemo(() => {
    if (filterMode === 'CHARACTERS') {
      return DISTORTION_ALL_LEVELS.filter(r => r.type === 'CHARACTER');
    }
    if (filterMode === 'CLAIMABLE') {
      return DISTORTION_ALL_LEVELS.filter(
        r => r.level <= progression.level && !progression.claimedLevels.includes(r.level)
      );
    }
    return DISTORTION_ALL_LEVELS;
  }, [filterMode, progression.level, progression.claimedLevels]);

  return (
    <div className="flex flex-col h-full w-full bg-[#07080e] text-white/90 select-none overflow-hidden relative">
      {/* Top Header Card */}
      <div className="shrink-0 p-4 sm:p-6 bg-[#0a0c16]/95 border-b border-purple-500/20 backdrop-blur-md z-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          
          {/* Level Info & Header Titles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  Система Уровней Искажения
                </span>
                <span className="text-xs text-white/50 font-mono">200 Уровней Прокачки</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white flex items-center gap-3">
                <span>УРОВЕНЬ {progression.level}</span>
                <span className="text-sm not-italic font-bold text-white/40 font-mono">/ {DISTORTION_MAX_LEVEL}</span>
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={scrollToCurrentLevel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>К текущему уровню</span>
              </button>

              {claimableCount > 0 && (
                <button
                  onClick={handleClaimAllResources}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Забрать ресурсы ({claimableCount})</span>
                </button>
              )}

              {onBackToStages && (
                <button
                  onClick={onBackToStages}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>К этапам</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bars & Weekly Limits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            
            {/* Level EXP Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-[#0e1120] border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-white/60 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Опыт текущего уровня
                </span>
                <span className="font-mono font-black text-cyan-300">
                  {progression.level >= DISTORTION_MAX_LEVEL ? 'МАКСИМУМ' : `${progression.currentExp} / ${requiredExp} EXP`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  style={{ width: `${expProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40 mt-1.5">
                Каждая полная зачистка Искажения (Этап 10) даёт +{DISTORTION_EXP_PER_CLEAR} EXP
              </span>
            </div>

            {/* Weekly Caps Tracker */}
            <div className="p-3.5 rounded-2xl bg-[#0e1120] border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-white/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Недельный опыт Искажения
                </span>
                <span className="font-mono font-black text-purple-300">
                  {progression.weeklyExpGained} / {DISTORTION_WEEKLY_EXP_LIMIT} EXP
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${weeklyExpPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/40 mt-1.5">
                <span>Прямые награды 10-го этапа: <b className="text-white/70">{progression.weeklyFullClearsClaimed}/2</b> получено</span>
                <span>Сброс через: <b className="text-purple-300 font-mono">{getTimeUntilNextWeeklyReset()}</b></span>
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Фильтр:
            </span>
            <button
              onClick={() => setFilterMode('ALL')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
                filterMode === 'ALL' 
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/30" 
                  : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              Все 200 уровней
            </button>
            <button
              onClick={() => setFilterMode('CHARACTERS')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer",
                filterMode === 'CHARACTERS' 
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30" 
                  : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <Star className="w-3 h-3 fill-current" />
              Только Персонажи (B-Ранг)
            </button>
            <button
              onClick={() => setFilterMode('CLAIMABLE')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer",
                filterMode === 'CLAIMABLE' 
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30" 
                  : "bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <Gift className="w-3 h-3" />
              Доступные ({claimableCount})
            </button>
          </div>

        </div>
      </div>

      {/* Main Progression Track Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 relative custom-scrollbar"
      >
        <div className="max-w-4xl mx-auto relative">
          
          {/* Continuous Vertical Timeline Line */}
          <div className="absolute left-[26px] sm:left-[30px] top-6 bottom-6 w-1 bg-zinc-800 -translate-x-1/2 z-0" />
          
          {/* Dynamic Fill Progress Line */}
          <div 
            className="absolute left-[26px] sm:left-[30px] top-6 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-indigo-500 -translate-x-1/2 z-0 shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all duration-700"
            style={{ 
              height: `${Math.min(100, (progression.level / DISTORTION_MAX_LEVEL) * 100)}%` 
            }}
          />

          {/* Level List */}
          <div className="flex flex-col gap-5 relative z-10">
            {filteredLevels.map((reward) => {
              const isCurrent = reward.level === progression.level;
              const isUnlocked = reward.level <= progression.level;
              const isClaimed = progression.claimedLevels.includes(reward.level);
              const isClaimable = isUnlocked && !isClaimed;
              const isChar = reward.type === 'CHARACTER';

              return (
                <div 
                  key={reward.level}
                  ref={isCurrent ? currentLevelRef : null}
                  className={cn(
                    "flex items-center gap-3 sm:gap-5 transition-all duration-300",
                    isClaimable && "scale-[1.01]"
                  )}
                >
                  {/* Rounded Square with Level Number */}
                  <div className={cn(
                    "w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 font-black transition-all relative select-none shadow-lg",
                    isClaimed && "bg-[#091510] border-emerald-500/50 text-emerald-400",
                    isClaimable && "bg-gradient-to-br from-purple-900/90 via-indigo-950 to-black border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-2 ring-purple-500/40 animate-pulse",
                    !isUnlocked && "bg-[#0c0e18] border-white/10 text-white/30"
                  )}>
                    <span className="text-[9px] uppercase tracking-wider opacity-60">УР.</span>
                    <span className="text-base sm:text-lg font-mono font-black leading-none">
                      {reward.level}
                    </span>
                    {isClaimed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Reward Card Beside the Square */}
                  <div className="flex-1 min-w-0">
                    {isChar ? (
                      /* Special B-Tier Character Milestone Card */
                      <div className={cn(
                        "relative rounded-2xl sm:rounded-3xl border overflow-hidden p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300",
                        isClaimable 
                          ? "bg-gradient-to-r from-blue-950/80 via-purple-950/60 to-[#0c0e1a] border-blue-400/60 shadow-[0_0_25px_rgba(59,130,246,0.3)]" 
                          : isClaimed 
                            ? "bg-[#090b14] border-white/10 opacity-70" 
                            : "bg-[#0a0d18] border-white/10 opacity-90"
                      )}>
                        {/* Character Splash Background Watermark */}
                        {reward.charId && getCharSplash(reward.charId) && (
                          <div className="absolute right-0 top-0 bottom-0 w-2/3 sm:w-1/2 pointer-events-none overflow-hidden select-none">
                            <img 
                              src={getCharSplash(reward.charId) || ""} 
                              alt={reward.name} 
                              className="w-full h-full object-cover object-top opacity-35 sm:opacity-45 mask-linear-gradient"
                              style={{ 
                                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Character Info */}
                        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
                          {/* Mini Avatar or Icon */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-blue-400/40 bg-black/50 shrink-0 flex items-center justify-center text-3xl shadow-md">
                            {reward.charId && getCharSplash(reward.charId) ? (
                              <img 
                                src={getCharSplash(reward.charId) || ""} 
                                alt={reward.name} 
                                className="w-full h-full object-cover object-top"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-8 h-8 text-blue-300" />
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950/90 border border-blue-500/50 text-blue-300">
                                B-Ранг ★★★
                              </span>
                              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                Награда Вехи
                              </span>
                            </div>
                            <h3 className="text-base sm:text-xl font-black italic uppercase text-white truncate drop-shadow-md">
                              {reward.name}
                            </h3>
                            <p className="text-xs text-white/60 line-clamp-1 mt-0.5">
                              {reward.description}
                            </p>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="relative z-10 shrink-0 self-end sm:self-center">
                          {isClaimed ? (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                              <Check className="w-3.5 h-3.5" />
                              Получено
                            </span>
                          ) : isClaimable ? (
                            <button
                              onClick={() => handleClaimReward(reward)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                            >
                              <Sparkles className="w-4 h-4 text-cyan-300" />
                              <span>Призвать (Крутка)</span>
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-medium">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Требуется Ур. {reward.level}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Standard Resource Reward Card */
                      <div className={cn(
                        "rounded-2xl border p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all",
                        isClaimable 
                          ? "bg-[#111322] border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                          : isClaimed 
                            ? "bg-[#0a0c16]/60 border-white/5 opacity-60" 
                            : "bg-[#0c0e1a] border-white/5"
                      )}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border",
                            reward.type === 'GEMS' && "bg-pink-950/40 border-pink-500/30",
                            reward.type === 'GOLD' && "bg-amber-950/40 border-amber-500/30",
                            reward.type === 'HERO_EXP' && "bg-emerald-950/40 border-emerald-500/30",
                            reward.type === 'TICKET' && "bg-indigo-950/40 border-indigo-500/30",
                            reward.type === 'ARTIFACT' && "bg-yellow-950/40 border-yellow-500/30",
                            reward.type === 'RELIC_BOX' && "bg-purple-950/40 border-purple-500/30"
                          )}>
                            {renderRewardIcon(reward.type)}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                              {reward.name}
                            </h4>
                            <span className="text-[11px] text-white/50 truncate">
                              {reward.description}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isClaimed ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                              <Check className="w-3 h-3" />
                              <span className="hidden sm:inline">Получено</span>
                            </span>
                          ) : isClaimable ? (
                            <button
                              onClick={() => handleClaimReward(reward)}
                              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              Забрать
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-white/30 text-xs font-medium px-2.5 py-1">
                              <Lock className="w-3 h-3" />
                              <span className="hidden sm:inline">Закрыто</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Gacha Banner Summon Animation Modal */}
      <AnimatePresence>
        {activeGachaChar && (
          <DistortionGachaModal
            charId={activeGachaChar.charId}
            level={activeGachaChar.level}
            isNew={activeGachaChar.isNew}
            constellation={activeGachaChar.constellation}
            isMaxConstellation={activeGachaChar.isMaxConstellation}
            onComplete={handleGachaComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
