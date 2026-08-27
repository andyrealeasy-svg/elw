import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sword, Info, Zap, Shield, ChevronLeft, Lock, Star, Trophy, Award } from 'lucide-react';
import { ARTIFACT_DUNGEONS } from '../data';
import { Dungeon, PlayerProfile } from '../types';

interface Props {
  profile: PlayerProfile;
  updateProfile: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  setRoute: (route: any) => void;
  onBack: () => void;
}

interface DifficultyTier {
  rank: number;
  level: number;
  label: string;
  rarityDesc: string;
  gold: number;
  exp: number;
  starBadge: string;
}

export default function ArtifactDungeon({ profile, updateProfile, setRoute, onBack }: Props) {
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(ARTIFACT_DUNGEONS[0] || null);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [runs, setRuns] = useState<number>(1);

  const DIFFICULTY_TIERS: DifficultyTier[] = [
    { rank: 1, level: 20, label: "Уровень I", rarityDesc: "2★ - 3★ Реликвии", gold: 6000, exp: 3000, starBadge: "⭐⭐" },
    { rank: 2, level: 35, label: "Уровень II", rarityDesc: "3★ (шанс 4★)", gold: 12000, exp: 6000, starBadge: "⭐⭐⭐" },
    { rank: 3, level: 50, label: "Уровень III", rarityDesc: "4★ (шанс 5★ 20%)", gold: 20000, exp: 10000, starBadge: "⭐⭐⭐⭐" },
    { rank: 4, level: 65, label: "Уровень IV", rarityDesc: "4★ (шанс 5★ 50%)", gold: 32000, exp: 15000, starBadge: "⭐⭐⭐⭐" },
    { rank: 5, level: 80, label: "Уровень V", rarityDesc: "1-2x 5★ Гарантия", gold: 45000, exp: 20000, starBadge: "⭐⭐⭐⭐⭐" },
    { rank: 6, level: 95, label: "Уровень VI", rarityDesc: "2-3x 5★ Легендарные", gold: 65000, exp: 30000, starBadge: "⭐⭐⭐⭐⭐+" },
  ];

  const currentTier = DIFFICULTY_TIERS.find(t => t.rank === selectedRank) || DIFFICULTY_TIERS[0];

  const handleEnter = (dungeon: Dungeon) => {
    const totalCost = dungeon.entryCost * runs;
    if (profile.resin < totalCost) {
      alert("Недостаточно первородной смолы!");
      return;
    }
    updateProfile(p => ({
      ...p,
      resin: p.resin - totalCost,
      dailies: {
        ...p.dailies,
        resinsSpent: (p.dailies.resinsSpent || 0) + totalCost
      }
    }));
    setRoute({ 
      type: 'DUNGEON', 
      level: selectedRank, 
      dungeonType: 'ARTIFACT', 
      dungeonId: dungeon.id,
      runs: runs
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white overflow-hidden p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#1a1a1a] rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-indigo-400">Подземелья Реликвий</h1>
            <p className="text-xs text-white/40 font-mono tracking-widest uppercase">Фарм снаряжения по уровням сложности (1-6)</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/5 px-4 py-2 rounded-3xl flex items-center gap-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-mono font-bold text-sm">{profile.resin}/160</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        {/* Dungeon List */}
        <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 pb-6 custom-scrollbar">
          {ARTIFACT_DUNGEONS.map((dungeon) => (
            <motion.button
              key={dungeon.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedDungeon(dungeon)}
              className={`w-full text-left p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group ${
                selectedDungeon?.id === dungeon.id
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                  : 'border-white/5 bg-[#111111]/50 hover:border-white/10'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight mb-1 text-white/90">{dungeon.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#1a1a1a] px-2 py-0.5 rounded text-white/50 font-mono">
                      {dungeon.rewardSets.length} сета
                    </span>
                    <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {dungeon.entryCost}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-2xl transition-colors ${selectedDungeon?.id === dungeon.id ? 'bg-indigo-500 text-white' : 'bg-[#1a1a1a] text-white/50 group-hover:text-white'}`}>
                   <Sword className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Dungeon Details & Difficulty Selector */}
        <div className="lg:col-span-2 bg-[#111111]/40 border border-white/5 rounded-[28px] p-5 md:p-7 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          {selectedDungeon ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedDungeon.id}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-1 text-white">{selectedDungeon.name}</h2>
                <p className="text-white/50 text-xs md:text-sm leading-relaxed max-w-xl">{selectedDungeon.description}</p>
              </div>

              {/* Difficulty Level 1-6 Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                   <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                     <Award className="w-4 h-4" /> Выберите сложность (Ур. 1 - 6)
                   </h4>
                   <span className="text-xs font-mono text-amber-400 font-bold">
                     Враги ~Ур. {currentTier.level}
                   </span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {DIFFICULTY_TIERS.map(tier => {
                    const isSelected = selectedRank === tier.rank;
                    return (
                      <button
                        key={tier.rank}
                        onClick={() => setSelectedRank(tier.rank)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'bg-[#0a0a0a]/70 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="font-black text-xs uppercase">Ур. {tier.rank}</span>
                        <span className="text-[10px] opacity-75 font-mono mt-0.5">{tier.level} lvl</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Info & Loot Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Награды сложности</span>
                    <span className="text-xs font-mono text-amber-400">{currentTier.starBadge}</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-white/70">
                      <span>Реликвии:</span>
                      <span className="font-bold text-amber-300">{currentTier.rarityDesc}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Мора:</span>
                      <span className="font-bold text-yellow-400">+{currentTier.gold.toLocaleString()} G</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Опыт отряда:</span>
                      <span className="font-bold text-emerald-400">+{currentTier.exp.toLocaleString()} EXP</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-3xl p-4 space-y-2.5 text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Сеты данного подземелья</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDungeon.rewardSets.map(setId => (
                       <div key={setId} className="px-2.5 py-1 bg-[#111111] rounded-xl border border-amber-500/20 text-[10px] font-bold text-white/90">
                         {setId.replace(/_/g, ' ').toUpperCase()}
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-4 flex items-center gap-3 text-xs text-indigo-200">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <span><b>Аномалия:</b> {selectedDungeon.effectDescription}</span>
              </div>

              <div className="pt-2 space-y-4">
                {/* Runs Selector */}
                <div className="bg-[#0a0a0a]/85 border border-white/5 rounded-3xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-white/70">Количество заходов за 1 раз:</span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">{runs}x заход(ов)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const cost = selectedDungeon.entryCost * num;
                      const hasResin = profile.resin >= cost;
                      const isSelected = runs === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={!hasResin && num > 1}
                          onClick={() => setRuns(num)}
                          className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                              : !hasResin
                                ? 'bg-[#111111]/40 border-[#0a0a0a] text-white/40 cursor-not-allowed'
                                : 'bg-[#111111] border-white/5 text-white/70 hover:border-white/10'
                          }`}
                        >
                          <span>{num}x</span>
                          <span className="text-[9px] font-mono opacity-80 flex items-center gap-0.5 mt-0.5">
                            <Zap className="w-2.5 h-2.5" />{cost}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => handleEnter(selectedDungeon)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-3.5 rounded-3xl transition-all shadow-xl shadow-indigo-500/25 uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95"
                >
                  <Sword className="w-5 h-5" />
                  Начать испытание (Ур. {selectedRank})
                </button>
                <p className="text-center text-[10px] text-white/40 font-mono mt-2.5">
                  Расход: {selectedDungeon.entryCost * runs} первородной смолы
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
              <div className="w-16 h-16 bg-[#111111] rounded-3xl border border-white/5 flex items-center justify-center">
                <Lock className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">Выберите подземелье</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

