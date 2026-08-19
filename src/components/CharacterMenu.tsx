import React, { useState } from 'react';
import { PlayerProfile, GameRoute, ArtifactSlot, Artifact } from '../types';
import { characterBlueprints, getCharEmoji, getCharSplash, characterConstellations, ARTIFACT_SETS, scoreArtifact } from '../data';
import { ArrowLeft, Zap, Shield, Users, Swords, Plus, TrendingUp, Package, Star, Sparkles, X, Check, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const elementColors: Record<string, string> = {
  Hydro: "text-blue-400 border-blue-400 focus:ring-blue-400",
  Pyro: "text-red-500 border-red-500 focus:ring-red-500",
  Dendro: "text-green-500 border-green-500 focus:ring-green-500",
  Electro: "text-purple-400 border-purple-400 focus:ring-purple-400",
  Geo: "text-yellow-500 border-yellow-500 focus:ring-yellow-500",
  Cryo: "text-cyan-400 border-cyan-400 focus:ring-cyan-400",
  Physical: "text-slate-300 border-slate-500 focus:ring-slate-500",
};

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBack: () => void;
}

export default function CharacterMenu({ profile, updateProfile, onBack }: Props) {
  const ownedIds = Object.keys(profile.roster);
  const [selectedId, setSelectedId] = useState<string>(ownedIds[0] || "");
  const [activeTab, setActiveTab] = useState<'STATS' | 'ARTIFACTS' | 'CONSTELLATIONS'>('STATS');
  const [selectingSlot, setSelectingSlot] = useState<ArtifactSlot | null>(null);
  const [artifactSearchQuery, setArtifactSearchQuery] = useState("");

  if (ownedIds.length === 0) return <div className="text-white p-4">Нет персонажей</div>;

  const selectedData = profile.roster[selectedId];
  const charArts = profile.artifacts.filter(a => selectedData.artifacts ? Object.values(selectedData.artifacts).includes(a.id) : false);
  const charDef = characterBlueprints[selectedId]("mock", selectedData.level, selectedData.constellation, charArts);
  const consts = characterConstellations[selectedId] || [];

  const inTeam = profile.team.includes(selectedId);
  const toggleTeam = () => {
    updateProfile(p => {
       const currentTeam = p.team || [];
       const newTeam = currentTeam.includes(selectedId) ? currentTeam.filter(id => id !== selectedId) : [...currentTeam, selectedId];
       if (newTeam.length === 0 || newTeam.length > 4) return p;
       
       const newTeams = [...p.teams];
       newTeams[p.activeTeamIndex] = newTeam;
       
       return { ...p, team: newTeam, teams: newTeams };
    });
  };

  const switchTeam = (idx: number) => {
    if (idx === profile.activeTeamIndex) return;
    updateProfile(p => {
       const currentTeams = [...p.teams];
       // Sync current team to storage before switching
       currentTeams[p.activeTeamIndex] = p.team;
       
       const targetTeam = currentTeams[idx] || [];
       return {
         ...p,
         teams: currentTeams,
         activeTeamIndex: idx,
         team: targetTeam.length > 0 ? targetTeam : (targetTeam.length === 0 && idx === 0 ? p.team : [])
       };
    });
  };

  const costGold = selectedData.level * 1000;
  const costExp = selectedData.level * 500;
  const canLevelUp = profile.gold >= costGold && profile.heroExp >= costExp && selectedData.level < 90;

  const levelUp = () => {
    if (!canLevelUp) return;
    updateProfile(p => ({
      ...p,
      gold: p.gold - costGold,
      heroExp: p.heroExp - costExp,
      roster: { ...p.roster, [selectedId]: { ...p.roster[selectedId], level: p.roster[selectedId].level + 1 } }
    }));
  };

  const equipAuto = () => {
    updateProfile(p => {
       const newP = { ...p };
       const cData = { ...newP.roster[selectedId] };
       cData.artifacts = cData.artifacts ? { ...cData.artifacts } : { flower: null, plume: null, sands: null, goblet: null, circlet: null };
       const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
       
       const allUsedArtifacts: Record<string, string> = {}; // artId -> charId
       Object.entries(newP.roster).forEach(([cid, data]) => {
         Object.values(data.artifacts || {}).forEach(aid => {
           if (aid) allUsedArtifacts[aid] = cid;
         });
       });

       slots.forEach(slot => {
          // Find best artifact for this slot based on score
          // Even if used by others, we might want to take it if it's significantly better?
          // For now, let's just use unused ones to avoid stripping other characters
          
          const available = p.artifacts
            .filter(a => a.slot === slot && !allUsedArtifacts[a.id])
            .sort((a,b) => scoreArtifact(b, selectedId) - scoreArtifact(a, selectedId));
          
          if (available[0]) {
             cData.artifacts![slot] = available[0].id;
             allUsedArtifacts[available[0].id] = selectedId;
          }
       });
       newP.roster[selectedId] = cData;
       return newP;
    });
  };

  const equipManual = (art: Artifact) => {
    updateProfile(p => {
      const next = { ...p };
      const cData = { ...next.roster[selectedId] };
      if (!cData.artifacts) cData.artifacts = { flower: null, plume: null, sands: null, goblet: null, circlet: null };
      
      // If artifact is used by someone else, remove it from them
      Object.entries(next.roster).forEach(([cid, data]) => {
        if (data.artifacts) {
          const slot = Object.keys(data.artifacts).find(s => (data.artifacts as any)[s] === art.id) as ArtifactSlot | undefined;
          if (slot) {
            next.roster[cid] = { ...data, artifacts: { ...data.artifacts, [slot]: null } };
          }
        }
      });

      cData.artifacts = { ...cData.artifacts, [art.slot]: art.id };
      next.roster[selectedId] = cData;
      return next;
    });
    setSelectingSlot(null);
  };

  return (
    <div className="w-full max-w-5xl h-[100dvh] md:h-[80vh] md:min-h-[600px] bg-gray-950 md:rounded-xl border-t-2 md:border-4 border-gray-800 shadow-2xl flex flex-col font-mono text-gray-200">
      <div className="flex items-center p-3 sm:p-4 border-b-2 border-gray-800 bg-gray-900 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded transition mr-3 sm:mr-4">
           <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold font-sans tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 uppercase">
          Отряд / Инвентарь
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
         {/* Roster Selection Sidebar */}
        <div className="w-full md:w-1/3 flex md:flex-col overflow-x-auto md:overflow-y-auto border-b-2 md:border-b-0 md:border-r-2 border-gray-800 p-2 gap-2 bg-gray-900/50 shrink-0 custom-scrollbar">
           {ownedIds.map(id => {
             const charData = profile.roster[id];
             const preview = characterBlueprints[id]("", charData.level, charData.constellation);
             const isTeam = profile.team.includes(id);
             return (
               <button
                 key={id}
                 onClick={() => setSelectedId(id)}
                 className={cn(
                   "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 text-left min-w-[140px] md:min-w-0 transition-all relative overflow-hidden shrink-0 md:shrink",
                   selectedId === id ? "bg-gray-800 " + elementColors[preview.element] : "border-transparent bg-gray-900 hover:bg-gray-800 text-gray-400"
                 ) + " leading-tight"}
               >
                  {isTeam && <div className="absolute top-0 right-0 bg-blue-600 text-[8px] sm:text-[9px] px-1 font-bold text-white uppercase rounded-bl">Отряд</div>}
                  <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded shadow-md shrink-0 border-2 flex items-center justify-center font-bold text-lg relative overflow-hidden", preview.color, elementColors[preview.element])}>
                     {getCharSplash(id) ? (
                        <img src={getCharSplash(id) || ""} className="w-full h-full object-cover animate-in fade-in" referrerPolicy="no-referrer" />
                     ) : (
                        getCharEmoji(id)
                     )}
                  </div>
                  <div className="min-w-0 flex-1">
                     <div className="font-bold text-xs sm:text-sm truncate">{preview.name}</div>
                     <div className="text-[9px] sm:text-xs opacity-70 uppercase tracking-widest">Ур. {charData.level}</div>
                  </div>
               </button>
             );
           })}
        </div>

        {/* Selected Char Details */}
        <div className="w-full md:w-2/3 p-4 sm:p-6 overflow-y-auto bg-gradient-to-br from-gray-950 to-gray-900 flex flex-col gap-4">
           
           {/* Team Switcher */}
           <div className="grid grid-cols-3 gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 shadow-inner shrink-0">
             {[0, 1, 2].map(idx => (
               <button
                 key={idx}
                 onClick={() => switchTeam(idx)}
                 className={cn(
                   "py-2 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-lg transition-all border-2 flex flex-col items-center justify-center gap-1",
                   profile.activeTeamIndex === idx 
                     ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                     : "bg-gray-950 border-gray-900 text-gray-600 hover:text-gray-400 hover:border-gray-800"
                 )}
               >
                 <span className="opacity-50">Слот {idx + 1}</span>
                 <div className="flex gap-0.5">
                    {profile.teams[idx] && profile.teams[idx].length > 0 ? (
                      profile.teams[idx].map(tid => (
                        <div key={tid} className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      ))
                    ) : (
                      <div className="text-[8px] italic opacity-30 lowercase font-normal">пусто</div>
                    )}
                 </div>
               </button>
             ))}
           </div>

           {/* Top Stats & Actions */}
           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-start gap-4">
                 <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-lg shadow-xl border-2 flex items-center justify-center text-3xl shrink-0 relative overflow-hidden", charDef.color, elementColors[charDef.element])}>
                     {getCharSplash(selectedId) ? (
                        <img src={getCharSplash(selectedId) || ""} className="w-full h-full object-cover animate-in fade-in" referrerPolicy="no-referrer" />
                     ) : (
                        getCharEmoji(selectedId)
                     )}
                  </div>
                 <div className="pt-1">
                    <h2 className={cn("text-2xl sm:text-3xl font-bold drop-shadow-md", (elementColors[charDef.element] || "text-slate-300").split(' ')[0])}>{charDef.name}</h2>
                    <p className="text-gray-400 flex items-center gap-2 mt-1 text-sm bg-gray-900/80 px-2 py-1 rounded inline-flex">
                       <Zap className="w-4 h-4" /> Ур. {charDef.level} | Созвездие {charDef.constellation}
                    </p>
                 </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                 <button onClick={toggleTeam} className={cn("px-4 py-2 font-bold uppercase text-xs tracking-wider rounded transition-all", inTeam ? "bg-red-900/50 hover:bg-red-800/80 text-red-200 border border-red-800" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg")}>
                    {inTeam ? "Убрать из отряда" : "Добавить в отряд"}
                 </button>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-4 border-b border-gray-800 shrink-0">
             <button onClick={() => setActiveTab('STATS')} className={cn("pb-2 font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-colors", activeTab === 'STATS' ? "text-gray-200 border-b-2 border-gray-400" : "text-gray-600 hover:text-gray-400")}>Бой</button>
             <button onClick={() => setActiveTab('ARTIFACTS')} className={cn("pb-2 font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-colors", activeTab === 'ARTIFACTS' ? "text-gray-200 border-b-2 border-gray-400" : "text-gray-600 hover:text-gray-400")}>Артефакты</button>
             <button onClick={() => setActiveTab('CONSTELLATIONS')} className={cn("pb-2 font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-colors", activeTab === 'CONSTELLATIONS' ? "text-gray-200 border-b-2 border-gray-400" : "text-gray-600 hover:text-gray-400")}>Созвездия</button>
           </div>

           {activeTab === 'STATS' && (
           <div className="animate-in fade-in space-y-4">
               {/* Level Up Banner */}
               <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div>
                    <h3 className="font-bold flex items-center gap-2 text-sm text-gray-300"><TrendingUp className="w-4 h-4 text-green-400"/> Возвышение (Ур. {selectedData.level} ➔ {selectedData.level + 1})</h3>
                    <div className="flex gap-4 mt-2 text-xs font-mono">
                      <span className={profile.heroExp >= costExp ? "text-gray-400" : "text-red-400"}>EXP: {costExp}</span>
                      <span className={profile.gold >= costGold ? "text-gray-400" : "text-red-400"}>Золото: {costGold}</span>
                    </div>
                  </div>
                  <button onClick={levelUp} disabled={!canLevelUp} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold rounded uppercase text-xs tracking-wider transition-all">
                     Повысить уровень
                  </button>
               </div>

           <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                 <Users className="w-4 h-4" /> Характеристики
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                 <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 block mb-1">HP</span> <span className="font-bold text-green-400">{charDef.stats.maxHp}</span></div>
                 <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 block mb-1">ATK</span> <span className="font-bold text-red-400">{charDef.stats.atk}</span></div>
                 <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 block mb-1">DEF</span> <span className="font-bold text-blue-400">{charDef.stats.def}</span></div>
                 <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 block mb-1">SPD</span> <span className="font-bold text-yellow-400">{charDef.stats.spd}</span></div>
              </div>
           </div>

           <div>
              <h3 className="font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                 <Shield className="w-4 h-4" /> Навыки
              </h3>
              <div className="flex flex-col gap-3">
                 {charDef.skills.map(skill => (
                    <div key={skill.id} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
                       <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-bold text-gray-200 text-sm">{skill.name}</h4>
                          <span className="text-[10px] px-2 py-1 bg-gray-950 rounded border border-gray-800 text-gray-400">COST: {skill.cost}</span>
                       </div>
                       <p className="text-xs text-gray-400">{skill.description}</p>
                    </div>
                 ))}
              </div>
           </div>
           </div>
           )}

            {activeTab === 'ARTIFACTS' && (
              <div className="animate-in fade-in space-y-6">
                {!selectingSlot ? (
                  <>
                    {/* Set Bonuses Summary */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Активные бонусы сетов</h4>
                      <div className="space-y-3">
                        {Object.entries(ARTIFACT_SETS).map(([setId, set]) => {
                          const count = charArts.filter(a => a.setName === setId).length;
                          if (count < 2) return null;
                          return (
                            <div key={setId} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span className="text-xs font-bold text-slate-200 uppercase">{set.name} ({count}/4)</span>
                              </div>
                              <div className="pl-5 space-y-1">
                                {count >= 2 && <p className="text-[10px] text-slate-400 leading-tight"><span className="text-amber-400/80 font-bold">2 предм:</span> {set.twoPieceBonus}</p>}
                                {count >= 4 && <p className="text-[10px] text-slate-400 leading-tight"><span className="text-amber-400/80 font-bold">4 предм:</span> {set.fourPieceBonus}</p>}
                              </div>
                            </div>
                          );
                        })}
                        {charArts.length === 0 && <p className="text-[10px] text-slate-600 italic">Нет активных бонусов</p>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-gray-300 uppercase tracking-widest flex items-center gap-2"><Package className="w-4 h-4"/> Снаряжение</h3>
                      <button onClick={equipAuto} className="text-xs uppercase tracking-widest bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 px-4 py-1.5 rounded-full text-indigo-400 font-black transition-all">Авто-Подбор</button>
                    </div>
                    
                    <div className="grid gap-4 pb-8">
                      {(["flower", "plume", "sands", "goblet", "circlet"] as ArtifactSlot[]).map(slot => {
                        const artId = selectedData.artifacts ? selectedData.artifacts[slot] : null;
                        const art = profile.artifacts.find(a => a.id === artId);
                        
                        return (
                           <div key={slot} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 group hover:border-slate-700 transition-colors">
                              <div className="flex-1 flex gap-4 cursor-pointer" onClick={() => setSelectingSlot(slot)}>
                                 <div className="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-xl font-mono text-[10px] text-slate-500 uppercase flex items-center justify-center shrink-0 shadow-inner group-hover:border-slate-700 transition-colors">
                                   {slot.slice(0,4)}
                                 </div>
                                 {art ? (
                                   <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-amber-400 font-bold">+{art.level || 0}</span>
                                        <h4 className="font-black text-xs text-slate-200 uppercase truncate">{ARTIFACT_SETS[art.setName]?.name || art.setName}</h4>
                                     </div>
                                     <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">{art.mainStat.type}: +{art.mainStat.value}</div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                           {art.subStats?.map((s, i) => (
                                              <div key={i} className="text-[9px] font-mono text-slate-500 flex justify-between">
                                                 <span className="uppercase opacity-70">{s.type}</span>
                                                 <span className="text-slate-300">+{s.value}</span>
                                              </div>
                                           ))}
                                        </div>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="flex items-center text-xs text-slate-600 font-mono italic">Ячейка свободна (Нажми для выбора)</div>
                                 )}
                              </div>
                              
                              <div className="flex sm:flex-col justify-end gap-2">
                                 {art && (
                                    <button 
                                       disabled={art.level >= 20}
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          if ((art.level || 0) >= 20) return;
                                          const cost = (art.level || 0) * 500 + 500;
                                          if (profile.gold < cost) {
                                             alert("Недостаточно золота!");
                                             return;
                                          }
                                          updateProfile(p => {
                                             const n = { ...p, gold: p.gold - cost };
                                             const artIdx = n.artifacts.findIndex(a => a.id === art.id);
                                             if (artIdx !== -1) {
                                                const target = { ...n.artifacts[artIdx] };
                                                target.level = (target.level || 0) + 1;
                                                target.mainStat.value = Math.floor(target.mainStat.value * 1.1) + 1;
                                                // Occasionally boost sub-stats
                                                if (target.level % 4 === 0 && target.subStats) {
                                                   const sIdx = Math.floor(Math.random() * target.subStats.length);
                                                   target.subStats[sIdx].value = Math.floor(target.subStats[sIdx].value * 1.2) + 1;
                                                }
                                                n.artifacts[artIdx] = target;
                                             }
                                             return n;
                                          })
                                       }}
                                       className="z-10 text-[10px] font-black uppercase px-4 py-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-400 transition-all border border-slate-700"
                                    >{art.level >= 20 ? 'МАКС' : 'Улучшить'}</button>
                                 )}
                                 {art && (
                                    <button 
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          updateProfile(p => {
                                             const n = { ...p };
                                             n.roster[selectedId].artifacts = { ...n.roster[selectedId].artifacts!, [slot]: null };
                                             return n;
                                          })
                                       }}
                                       className="z-10 text-[10px] font-black uppercase px-4 py-2 bg-red-950/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-900/50"
                                    >Снять</button>
                                 )}
                              </div>
                           </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <h4 className="font-black uppercase text-sm tracking-widest text-slate-100">Выбор артефакта: {selectingSlot}</h4>
                        </div>
                        <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={artifactSearchQuery}
                          onChange={(e) => setArtifactSearchQuery(e.target.value)}
                          placeholder="Поиск по названию сета или стату..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(() => {
                        const filteredArtifacts = profile.artifacts
                          .filter(a => a.slot === selectingSlot)
                          .filter(a => {
                            if (!artifactSearchQuery.trim()) return true;
                            const q = artifactSearchQuery.toLowerCase();
                            const setName = (ARTIFACT_SETS[a.setName]?.name || "").toLowerCase();
                            const setRaw = a.setName.toLowerCase();
                            const mainStat = a.mainStat.type.toLowerCase();
                            const subStats = a.subStats.map(s => s.type.toLowerCase()).join(" ");
                            return setName.includes(q) || setRaw.includes(q) || mainStat.includes(q) || subStats.includes(q);
                          })
                          .sort((a, b) => scoreArtifact(b, selectedId) - scoreArtifact(a, selectedId));

                        if (filteredArtifacts.length === 0) {
                          return (
                            <div className="p-10 text-center text-slate-600 italic font-mono uppercase tracking-widest bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                              {profile.artifacts.filter(a => a.slot === selectingSlot).length === 0 
                                ? "Нет доступных артефактов этого типа" 
                                : "Ничего не найдено"}
                            </div>
                          );
                        }

                        return filteredArtifacts.map(art => {
                          const usedBy = Object.keys(profile.roster).find(cid => profile.roster[cid].artifacts?.[selectingSlot!] === art.id);
                          const isCurrent = profile.roster[selectedId].artifacts?.[selectingSlot!] === art.id;
                          const score = scoreArtifact(art, selectedId);
                          
                          return (
                            <div 
                              key={art.id} 
                              onClick={() => !isCurrent && equipManual(art)}
                              className={cn(
                                "p-4 rounded-2xl border-2 flex flex-col sm:flex-row gap-4 cursor-pointer transition-all",
                                isCurrent ? "bg-indigo-900/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "bg-slate-900 border-slate-800 hover:border-slate-600 hover:shadow-lg"
                              )}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-500">+{art.level}</span>
                                    <h5 className="font-black text-xs uppercase text-slate-100">{ARTIFACT_SETS[art.setName]?.name}</h5>
                                    {score > 1200 && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Счет: {score}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-xs font-black text-indigo-400 uppercase">{art.mainStat.type}: +{art.mainStat.value}</div>
                                  <div className="space-y-0.5">
                                    {art.subStats.map((s, i) => (
                                      <div key={i} className="text-[10px] font-mono text-slate-500 flex justify-between">
                                        <span className="uppercase opacity-70">{s.type}</span>
                                        <span className="text-slate-300">+{s.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center shrink-0">
                                {isCurrent ? (
                                   <div className="text-[9px] font-bold uppercase py-1 px-3 bg-indigo-600 text-white rounded-full flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Экипировано
                                   </div>
                                ) : usedBy ? (
                                  <div className="text-[9px] font-bold uppercase py-1 px-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-full">
                                    У {characterBlueprints[usedBy]("mock", 1, 0).name}
                                  </div>
                                ) : (
                                  <div className="text-[9px] font-bold uppercase py-1 px-3 bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 rounded-full">
                                    Свободен
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })})()}
                    </div>
                  </div>
                )}
              </div>
            )}

           {activeTab === 'CONSTELLATIONS' && (
              <div className="animate-in fade-in space-y-6">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4">
                  <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Удаль героя
                  </h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    Копии персонажей открывают созвездия, которые значительно усиливают способности и открывают новые тактические возможности.
                  </p>
                </div>

                <div className="grid gap-3 pb-8">
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const cInfo = consts.find(c => c.level === num);
                    const isUnlocked = selectedData.constellation >= num;
                    
                    return (
                      <div 
                        key={num} 
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all group relative overflow-hidden",
                          isUnlocked 
                            ? "bg-gray-900 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                            : "bg-gray-950/50 border-gray-800 grayscale opacity-60"
                        )}
                      >
                        {isUnlocked && (
                          <div className="absolute top-0 right-0 p-1 bg-indigo-500 text-white text-[8px] font-black uppercase">Разблокировано</div>
                        )}
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-black border-2",
                            isUnlocked ? "bg-indigo-950 border-indigo-500 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-700"
                          )}>
                            {num}
                          </div>
                          <div>
                            <div className={cn("text-xs font-bold uppercase tracking-tight", isUnlocked ? "text-gray-200" : "text-gray-500")}>
                              {cInfo?.name || `Уровень ${num}`}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 leading-normal font-sans">
                              {cInfo?.description || (num === 3 || num === 5 ? "Значительно повышает эффективность навыков персонажа." : "Открывает скрытые резервы силы.")}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
