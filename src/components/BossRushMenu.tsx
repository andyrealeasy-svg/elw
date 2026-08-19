import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sword, X, ChevronRight, Skull, ChevronLeft, Zap, Flame, Mountain } from 'lucide-react';
import { PlayerProfile } from '../types';
import { characterBlueprints, getCharSplash } from '../data';
import { cn } from '../lib/utils';

interface BossRushMenuProps {
  profile: PlayerProfile;
  onBack: () => void;
  onStartRush: (teams: string[][]) => void;
}

const BOSSES = [
  { id: 'asher', name: 'Испепелитель', level: 65, hpText: '220k HP', element: 'Pyro', desc: 'Наносит Пиро-урон и накладывает Горение. Восстанавливает здоровье.', icon: Flame, color: 'text-red-500' },
  { id: 'glacier', name: 'Абсолютный Ноль', level: 70, hpText: '320k HP', element: 'Cryo', desc: 'Замедляет отряд и срезает ATB. Обладает ледяным щитом.', icon: Zap, color: 'text-cyan-400' },
  { id: 'aegis', name: 'Кристальный Титан', level: 75, hpText: '450k HP', element: 'Geo', desc: 'Увеличенный запас здоровья и брони. Применяет сотрясение земной коры.', icon: Mountain, color: 'text-amber-500' }
];

export const BossRushMenu: React.FC<BossRushMenuProps> = ({ profile, onBack, onStartRush }) => {
  const [teams, setTeams] = useState<string[][]>([[], [], []]);
  const [activeSlot, setActiveSlot] = useState<{ teamIdx: number, charIdx: number } | null>(null);

  const handleSelectChar = (charId: string) => {
    if (!activeSlot) return;
    const { teamIdx, charIdx } = activeSlot;
    
    // Check if character is already in ANY team
    if (teams.some(t => t.includes(charId))) return;

    setTeams(prev => {
      const newTeams = [...prev];
      if (charIdx >= newTeams[teamIdx].length) {
        newTeams[teamIdx].push(charId);
      } else {
        newTeams[teamIdx][charIdx] = charId;
      }
      return newTeams;
    });
    setActiveSlot(null);
  };

  const handleRemoveChar = (teamIdx: number, charIdx: number) => {
    setTeams(prev => {
      const newTeams = [...prev];
      newTeams[teamIdx] = newTeams[teamIdx].filter((_, i) => i !== charIdx);
      return newTeams;
    });
  };

  const isReady = teams.every(t => t.length > 0);
  const usedChars = new Set(teams.flat());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans">
      <div className="flex-none p-6 pb-2 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-wider flex items-center gap-2">
              <Skull className="w-6 h-6 text-fuchsia-500" /> Теневой Натиск
            </h1>
            <p className="text-xs text-slate-400 font-medium">Соберите 3 уникальных отряда для 3 боссов</p>
          </div>
        </div>
        <button 
          onClick={() => isReady && onStartRush(teams)}
          disabled={!isReady}
          className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg tracking-widest uppercase transition-all"
        >
          Начать
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Teams List */}
        <div className="w-full lg:w-2/3 p-6 overflow-y-auto space-y-8">
          {BOSSES.map((boss, tIdx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: tIdx * 0.1 }}
              key={boss.id} 
              className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-1/3 flex flex-col justify-center border-r border-white/5 pr-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <boss.icon className={cn("w-4 h-4", boss.color)} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Этап {tIdx + 1}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                      УР. {boss.level} • {boss.hpText}
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">{boss.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{boss.desc}</p>
                </div>
                
                <div className="sm:w-2/3 grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map(cIdx => {
                    const charId = teams[tIdx][cIdx];
                    const charInfo = charId ? characterBlueprints[charId](charId, 1, 0) : null;
                    const isActive = activeSlot?.teamIdx === tIdx && activeSlot?.charIdx === cIdx;
                    
                    return (
                      <div 
                        key={cIdx}
                        onClick={() => setActiveSlot({ teamIdx: tIdx, charIdx: cIdx })}
                        className={cn(
                          "aspect-square rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group flex items-center justify-center",
                          charId ? "border-fuchsia-500/30 bg-slate-800" : isActive ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-white/5 bg-slate-900/50 hover:border-white/20"
                        )}
                      >
                        {charId ? (
                          <>
                            {charInfo?.image ? (
                              <img src={charInfo.image} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-2xl drop-shadow">⚔️</span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-3 text-center">
                              <span className="text-[9px] font-black uppercase truncate block text-white">{charInfo?.name}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveChar(tIdx, cIdx); }}
                              className="absolute top-1 right-1 p-1 bg-black/80 rounded-full hover:bg-red-500 text-white transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-2xl font-light text-white/10 group-hover:text-white/30">+</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Character Roster (Visible when slot selected) */}
        {activeSlot && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex w-1/3 border-l border-white/5 bg-slate-900/80 p-6 flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold uppercase tracking-widest text-sm">Выберите персонажа</h3>
              <button onClick={() => setActiveSlot(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pr-2 content-start">
              {Object.keys(profile.roster).map(charId => {
                const charData = profile.roster[charId];
                const isUsed = usedChars.has(charId);
                const info = characterBlueprints[charId] ? characterBlueprints[charId](charId, charData?.level || 1, charData?.constellation || 0) : null;
                if (!info) return null;
                
                return (
                  <div 
                    key={charId}
                    onClick={() => !isUsed && handleSelectChar(charId)}
                    className={cn(
                      "aspect-square rounded-xl border relative overflow-hidden transition-all flex items-center justify-center p-2 text-center",
                      isUsed ? "opacity-30 grayscale cursor-not-allowed border-white/5 bg-slate-900/40" : "cursor-pointer border-white/10 hover:border-fuchsia-500 hover:scale-105 bg-slate-900"
                    )}
                  >
                    {info.image ? (
                      <img src={info.image} className="absolute inset-0 w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl">{getCharSplash(charId) ? '⚔️' : '👤'}</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 text-center">
                      <span className="text-[9px] font-black uppercase truncate block text-white">{info.name}</span>
                      <span className="text-[7px] text-fuchsia-300 font-mono">LVL {charData?.level || 1}</span>
                    </div>
                    {isUsed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 rotate-[-15deg]">Занят</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        
        {/* Mobile Roster Modal */}
        {activeSlot && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-black/95 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Skull className="w-4 h-4 text-fuchsia-400" /> Выберите бойца
              </h3>
              <button onClick={() => setActiveSlot(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X className="w-5 h-5 text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2.5 pr-1 content-start">
              {Object.keys(profile.roster).map(charId => {
                const charData = profile.roster[charId];
                const isUsed = usedChars.has(charId);
                const info = characterBlueprints[charId] ? characterBlueprints[charId](charId, charData?.level || 1, charData?.constellation || 0) : null;
                if (!info) return null;
                
                return (
                  <div 
                    key={charId}
                    onClick={() => !isUsed && handleSelectChar(charId)}
                    className={cn(
                      "aspect-square rounded-xl border relative overflow-hidden transition-all flex items-center justify-center p-2 text-center",
                      isUsed ? "opacity-30 grayscale cursor-not-allowed border-white/5 bg-slate-900/40" : "cursor-pointer border-white/10 active:border-fuchsia-500 bg-slate-900"
                    )}
                  >
                    {info.image ? (
                      <img src={info.image} className="absolute inset-0 w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl">⚔️</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 text-center">
                      <span className="text-[9px] font-black uppercase truncate block text-white">{info.name}</span>
                      <span className="text-[7px] text-fuchsia-300 font-mono">LVL {charData?.level || 1}</span>
                    </div>
                    {isUsed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-400 rotate-[-15deg]">Занят</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
