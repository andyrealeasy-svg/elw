import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { ArrowLeft, Gift, Star, Gem, Lock, Crown, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBack: () => void;
}

interface BPReward {
  gems: number;
  gold?: number;
  heroExp?: number;
}

export default function BattlePass({ profile, updateProfile, onBack }: Props) {
  const [viewMode, setViewMode] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [summaryReward, setSummaryReward] = useState<BPReward | null>(null);
  const MAX_LEVELS = 100;
  const EXP_PER_LEVEL = 7500;
  const GOLDEN_PASS_COST = 1000;
  
  const currentLevel = Math.floor(profile.bpExp / EXP_PER_LEVEL);
  const currentExpInLevel = profile.bpExp % EXP_PER_LEVEL;
  
  const getFreeReward = (level: number): BPReward => {
     const isOdd = level % 2 === 1;
     return {
       gems: 5,
       gold: isOdd ? 500 + level * 20 : undefined,
       heroExp: !isOdd ? 250 + level * 10 : undefined
     };
  };

  const getPremiumReward = (level: number): BPReward => {
     const isOdd = level % 2 === 1;
     return {
       gems: 10,
       gold: isOdd ? 1500 + level * 50 : undefined,
       heroExp: !isOdd ? 800 + level * 25 : undefined
     };
  };

  const claimReward = (level: number, isPremium: boolean) => {
     const reward = isPremium ? getPremiumReward(level) : getFreeReward(level);
     updateProfile(p => {
        const claimedArray = isPremium ? p.bpClaimedLevelsPremium : p.bpClaimedLevels;
        if (claimedArray.includes(level) || level > currentLevel) return p;
        if (isPremium && !p.hasGoldenPass) return p;
        
        return {
           ...p,
           gems: p.gems + reward.gems,
           gold: p.gold + (reward.gold || 0),
           heroExp: p.heroExp + (reward.heroExp || 0),
           [isPremium ? 'bpClaimedLevelsPremium' : 'bpClaimedLevels']: [...claimedArray, level]
        };
     });
     setSummaryReward(reward);
  };

  const claimAll = () => {
    let totalGems = 0;
    let totalGold = 0;
    let totalExp = 0;
    const newFreeClaims: number[] = [];
    const newPremiumClaims: number[] = [];

    for (let l = 1; l <= currentLevel; l++) {
      if (!profile.bpClaimedLevels.includes(l)) {
        const r = getFreeReward(l);
        totalGems += r.gems;
        totalGold += r.gold || 0;
        totalExp += r.heroExp || 0;
        newFreeClaims.push(l);
      }
      if (profile.hasGoldenPass && !profile.bpClaimedLevelsPremium.includes(l)) {
        const r = getPremiumReward(l);
        totalGems += r.gems;
        totalGold += r.gold || 0;
        totalExp += r.heroExp || 0;
        newPremiumClaims.push(l);
      }
    }

    if (totalGems > 0 || totalGold > 0 || totalExp > 0) {
      updateProfile(p => ({
        ...p,
        gems: p.gems + totalGems,
        gold: p.gold + totalGold,
        heroExp: p.heroExp + totalExp,
        bpClaimedLevels: [...p.bpClaimedLevels, ...newFreeClaims],
        bpClaimedLevelsPremium: [...p.bpClaimedLevelsPremium, ...newPremiumClaims]
      }));
      setSummaryReward({ gems: totalGems, gold: totalGold, heroExp: totalExp });
    }
  };

  const buyGoldenPass = () => {
    if (profile.gems < GOLDEN_PASS_COST || profile.hasGoldenPass) return;
    updateProfile(p => ({
      ...p,
      gems: p.gems - GOLDEN_PASS_COST,
      hasGoldenPass: true
    }));
  };

  return (
    <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[700px] bg-slate-950 md:rounded-2xl border-4 border-slate-800 shadow-2xl flex flex-col font-sans text-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded transition">
              <ArrowLeft className="w-6 h-6" />
           </button>
           <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-200">
                Боевой Пропуск
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Обновление: Ежедневно</p>
           </div>
        </div>
        
        {profile.hasGoldenPass ? (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-amber-400 uppercase tracking-tight">Золотой статус</span>
          </div>
        ) : (
          <button 
            onClick={buyGoldenPass}
            disabled={profile.gems < GOLDEN_PASS_COST}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:opacity-50 disabled:grayscale transition-all rounded-lg shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Crown className="w-4 h-4 text-white" />
            <div className="text-left leading-none">
              <div className="text-[10px] font-bold text-white/80 uppercase">Купить Золотой Пропуск</div>
              <div className="text-sm font-black text-white flex items-center gap-1"><Gem className="w-3 h-3"/> {GOLDEN_PASS_COST}</div>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
         {/* Status Header */}
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative shrink-0">
               <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 flex items-center justify-center bg-slate-950 relative">
                  <Star className="w-14 h-14 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] fill-indigo-400/10" />
                  <span className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                    {currentLevel}
                  </span>
               </div>
               <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 uppercase">LVL</div>
            </div>
            <div className="flex-1 w-full">
               <div className="flex justify-between mb-2 text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2">Прогресс <span className="text-indigo-400">{Math.floor((profile.bpExp / (MAX_LEVELS * EXP_PER_LEVEL)) * 100)}%</span></span>
                  <span>{currentExpInLevel} / {EXP_PER_LEVEL} EXP</span>
               </div>
               <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                     className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all duration-1000" 
                     style={{ width: `${(currentExpInLevel / EXP_PER_LEVEL) * 100}%` }}
                  />
               </div>
               <p className="mt-3 text-[10px] font-medium text-slate-600 uppercase tracking-tight text-center sm:text-left">
                  Зарабатывайте EXP Боевого Пропуска за Ежедневные Поручения. 5 гемов на каждом уровне с чередованием Золота и Опыта Героя!
               </p>
            </div>
            
            {/* Claim All Button */}
            <button 
              onClick={claimAll}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs h-full flex flex-col items-center justify-center gap-1 group"
            >
              <Gift className="w-5 h-5 group-hover:bounce transition-transform" />
              <span>Забрать всё</span>
            </button>
         </div>

         {/* View Mode Switcher */}
         <div className="flex p-1 bg-slate-900 rounded-xl mb-6 gap-1 border border-slate-800 overflow-hidden">
            <button 
              onClick={() => setViewMode('FREE')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                viewMode === 'FREE' ? "bg-slate-800 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Gift className="w-4 h-4" />Обычные
            </button>
            <button 
              onClick={() => setViewMode('PREMIUM')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all gap-2 flex items-center justify-center relative",
                viewMode === 'PREMIUM' ? "bg-amber-600 text-white shadow-xl" : "text-amber-600/50 hover:text-amber-500"
              )}
            >
              <Crown className="w-4 h-4" />Золотые
              {!profile.hasGoldenPass && <Lock className="w-3 h-3 opacity-60" />}
            </button>
         </div>

         {/* Rewards Track */}
         <div className="space-y-3">
            {Array.from({ length: MAX_LEVELS }).map((_, i) => {
               const level = i + 1;
               const isUnlocked = currentLevel >= level;
               const isPremium = viewMode === 'PREMIUM';
               const claimedArray = isPremium ? profile.bpClaimedLevelsPremium : profile.bpClaimedLevels;
               const isClaimed = claimedArray.includes(level);
               const reward = isPremium ? getPremiumReward(level) : getFreeReward(level);
               const locked = isPremium && !profile.hasGoldenPass;

               return (
                  <div key={level} className={cn(
                     "flex items-center justify-between p-4 rounded-2xl border-2 transition-all relative overflow-hidden group",
                     isUnlocked && !isClaimed && !locked ? "bg-slate-900 border-indigo-500/30" : "bg-slate-950 border-slate-900",
                     isClaimed && "opacity-40 grayscale-[0.8]",
                     locked && "border-slate-900/50"
                  )}>
                     {locked && <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none" />}
                     
                     <div className="flex items-center gap-5 z-20">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-500/50 transition-colors">
                           <span className="text-[8px] font-black text-slate-500 leading-none tracking-tighter uppercase">Уровень</span>
                           <span className="font-black text-lg text-slate-300 leading-none mt-1">{level}</span>
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                isPremium ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                              )}>
                                {isPremium ? "Золотая Награда" : "Обычная Награда"}
                              </span>
                              {isClaimed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                           </div>
                           <div className="flex flex-wrap items-center gap-3">
                               <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                                 <Gem className={cn(
                                   "w-4 h-4",
                                   isPremium ? "text-amber-400" : "text-pink-400",
                                   isUnlocked && !isClaimed && "animate-pulse"
                                 )} />
                                 <span className="font-black text-sm text-slate-100 italic tracking-tighter">+{reward.gems}</span>
                               </div>

                               {reward.gold !== undefined && (
                                 <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                                   <Coins className="w-4 h-4 text-yellow-400" />
                                   <span className="font-black text-xs text-yellow-300">+{reward.gold.toLocaleString()} G</span>
                                 </div>
                                )}

                               {reward.heroExp !== undefined && (
                                 <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                                   <Sparkles className="w-4 h-4 text-emerald-400" />
                                   <span className="font-black text-xs text-emerald-300">+{reward.heroExp.toLocaleString()} EXP</span>
                                 </div>
                               )}
                           </div>
                        </div>
                     </div>

                     <div className="z-20">
                        {locked ? (
                          <div className="flex flex-col items-center gap-1 opacity-60">
                            <Lock className="w-5 h-5 text-slate-500" />
                            <span className="text-[8px] font-black uppercase text-slate-600">Закрыто</span>
                          </div>
                        ) : (
                          <button
                            disabled={!isUnlocked || isClaimed}
                            onClick={() => claimReward(level, isPremium)}
                            className={cn(
                               "px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95",
                               isClaimed ? "bg-slate-800 text-slate-600" :
                               isUnlocked ? (isPremium ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20") : "bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed"
                            )}
                          >
                             {isClaimed ? "Получено" : isUnlocked ? "Забрать" : "Ур. " + level}
                          </button>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Rewards Summary Overlay */}
      {summaryReward !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer p-4"
          onClick={() => setSummaryReward(null)}
        >
          <div className="flex flex-col items-center gap-6 max-w-md w-full bg-slate-900 border-2 border-indigo-500/40 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter text-center">
              Получено наград
            </h2>
            
            <div className="w-full flex flex-col gap-3 my-2">
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <Gem className="w-7 h-7 text-pink-400" />
                   <span className="font-bold text-slate-300 text-sm">Гемы</span>
                 </div>
                 <span className="font-black text-xl text-pink-300">+{summaryReward.gems}</span>
              </div>

              {(summaryReward.gold || 0) > 0 && (
                <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Coins className="w-7 h-7 text-yellow-400" />
                     <span className="font-bold text-slate-300 text-sm">Золото (Мора)</span>
                   </div>
                   <span className="font-black text-xl text-yellow-300">+{(summaryReward.gold || 0).toLocaleString()}</span>
                </div>
              )}

              {(summaryReward.heroExp || 0) > 0 && (
                <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-7 h-7 text-emerald-400" />
                     <span className="font-bold text-slate-300 text-sm">Опыт героя</span>
                   </div>
                   <span className="font-black text-xl text-emerald-300">+{(summaryReward.heroExp || 0).toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-xs animate-pulse text-center">
              Нажмите в любое место, чтобы закрыть
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
