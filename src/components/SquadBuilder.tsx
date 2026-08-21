import React, { useState } from 'react';
import { PlayerProfile, ArtifactSlot } from '../types';
import { characterBlueprints, getCharSplash, getCharEmoji, scoreArtifact, charRarity } from '../data';
import { ArrowLeft, Swords, Shield, Zap, Check, Plus, Trash2, Sparkles, Flame, Droplets, Leaf, Snowflake, Mountain, Users, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface SquadBuilderProps {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onClose: () => void;
}

const elementNamesRU: Record<string, string> = {
  Pyro: "Пиро",
  Hydro: "Гидро",
  Electro: "Электро",
  Dendro: "Дендро",
  Cryo: "Крио",
  Geo: "Гео",
  Physical: "Физ",
};

const elementIcons: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  Pyro: { icon: <Flame className="w-3.5 h-3.5 text-red-400" />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  Hydro: { icon: <Droplets className="w-3.5 h-3.5 text-blue-400" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Electro: { icon: <Zap className="w-3.5 h-3.5 text-purple-400" />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  Dendro: { icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  Cryo: { icon: <Snowflake className="w-3.5 h-3.5 text-cyan-400" />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  Geo: { icon: <Mountain className="w-3.5 h-3.5 text-amber-500" />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  Physical: { icon: <Shield className="w-3.5 h-3.5 text-slate-300" />, color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/30" },
};

export const SquadBuilder: React.FC<SquadBuilderProps> = ({ profile, updateProfile, onClose }) => {
  const activePreset = profile.activeTeamIndex ?? 0;
  const currentTeamIds = profile.teams[activePreset] || profile.team || [];
  const ownedIds = Object.keys(profile.roster);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [elementFilter, setElementFilter] = useState<string>("ALL");

  // Calculate team stats & resonance
  const teamBlueprints = currentTeamIds.map(id => {
    const cData = profile.roster[id];
    if (!cData) return null;
    const charArts = profile.artifacts.filter(a => cData.artifacts ? Object.values(cData.artifacts).includes(a.id) : false);
    return {
      id,
      data: cData,
      def: characterBlueprints[id]("", cData.level, cData.constellation, charArts)
    };
  }).filter(Boolean) as Array<{ id: string; data: any; def: any }>;

  const totalHp = teamBlueprints.reduce((sum, b) => sum + b.def.stats.maxHp, 0);
  const totalAtk = teamBlueprints.reduce((sum, b) => sum + b.def.stats.atk, 0);

  // Element counts for resonance
  const elementCounts: Record<string, number> = {};
  teamBlueprints.forEach(b => {
    elementCounts[b.def.element] = (elementCounts[b.def.element] || 0) + 1;
  });

  const resonances: Array<{ title: string; desc: string; active: boolean }> = [
    { title: "Пиро Резонанс (Пылкое солнце)", desc: "Атака отряда +25%", active: (elementCounts['Pyro'] || 0) >= 2 },
    { title: "Электро Резонанс (Высокое напряжение)", desc: "+20% Энергии от реакций", active: (elementCounts['Electro'] || 0) >= 2 },
    { title: "Гидро Резонанс (Лечащий поток)", desc: "Макс. HP +25%", active: (elementCounts['Hydro'] || 0) >= 2 },
    { title: "Дендро Резонанс (Буйная зелень)", desc: "Мастерство стихий +50", active: (elementCounts['Dendro'] || 0) >= 2 },
    { title: "Крио Резонанс (Разрушительный лед)", desc: "+15% Шанс Крита по замороженным", active: (elementCounts['Cryo'] || 0) >= 2 },
  ];

  const switchPreset = (presetIdx: number) => {
    updateProfile(p => {
      const newTeams = [...p.teams];
      newTeams[p.activeTeamIndex] = p.team; // save current
      const targetTeam = newTeams[presetIdx] || [];
      return {
        ...p,
        teams: newTeams,
        activeTeamIndex: presetIdx,
        team: targetTeam
      };
    });
  };

  const removeFromSquad = (charId: string) => {
    updateProfile(p => {
      const newTeam = p.team.filter(id => id !== charId);
      const newTeams = [...p.teams];
      newTeams[p.activeTeamIndex] = newTeam;
      return {
        ...p,
        team: newTeam,
        teams: newTeams
      };
    });
  };

  const assignToSquad = (charId: string) => {
    updateProfile(p => {
      let newTeam = [...p.team];
      
      if (newTeam.includes(charId)) {
        // Swap or remove if selecting same
        if (selectedSlotIndex !== null) {
          const existingIdx = newTeam.indexOf(charId);
          if (existingIdx !== selectedSlotIndex && selectedSlotIndex < newTeam.length) {
            // Swap positions
            const temp = newTeam[selectedSlotIndex];
            newTeam[selectedSlotIndex] = charId;
            newTeam[existingIdx] = temp;
          }
        }
      } else {
        if (selectedSlotIndex !== null && selectedSlotIndex < newTeam.length) {
          // Replace character at selected slot
          newTeam[selectedSlotIndex] = charId;
        } else if (newTeam.length < 4) {
          // Append to end
          newTeam.push(charId);
        } else if (selectedSlotIndex !== null) {
          newTeam[selectedSlotIndex] = charId;
        } else {
          // Replace last member
          newTeam[3] = charId;
        }
      }

      const newTeams = [...p.teams];
      newTeams[p.activeTeamIndex] = newTeam;

      return {
        ...p,
        team: newTeam,
        teams: newTeams
      };
    });

    setSelectedSlotIndex(null);
  };

  const filteredOwnedIds = ownedIds.filter(id => {
    if (elementFilter === "ALL") return true;
    const blueprint = characterBlueprints[id]("", 1, 0);
    return blueprint.element === elementFilter;
  });

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
              <Swords className="w-5 h-5 text-indigo-400" />
              Боевой Отряд
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
              Настройка состава для сражений
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => switchPreset(idx)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all min-h-[38px]",
                activePreset === idx
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Слот {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl w-full mx-auto">
        
        {/* Squad Summary Stats Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Сила Отряда</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-indigo-400">
                {(totalHp + totalAtk * 3).toLocaleString()}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Сумм. HP</span>
                <span className="text-green-400 font-bold">{totalHp.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Сумм. ATK</span>
                <span className="text-red-400 font-bold">{totalAtk.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Active Resonance Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {resonances.filter(r => r.active).map(r => (
              <span key={r.title} className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> {r.title.split(' ')[0]}
              </span>
            ))}
            {resonances.filter(r => r.active).length === 0 && (
              <span className="text-[10px] text-slate-500 font-mono italic">
                Возьмите 2 персонажей одной стихии для резонанса
              </span>
            )}
          </div>
        </div>

        {/* 4 Active Squad Slots Grid (Mobile Friendly 2x2 or 4x1) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Текущий состав ({currentTeamIds.length} / 4)
            </h2>
            <span className="text-[10px] text-slate-500 italic">
              Нажмите слот для выбора или смены
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[0, 1, 2, 3].map((slotIndex) => {
              const charId = currentTeamIds[slotIndex];
              const isSelectedSlot = selectedSlotIndex === slotIndex;
              const b = charId ? teamBlueprints.find(tb => tb.id === charId) : null;
              const elConf = b ? elementIcons[b.def.element] : null;

              if (b && elConf) {
                return (
                  <div
                    key={slotIndex}
                    onClick={() => setSelectedSlotIndex(isSelectedSlot ? null : slotIndex)}
                    className={cn(
                      "relative rounded-2xl border-2 p-3 sm:p-4 bg-slate-900/90 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px] sm:min-h-[200px] group",
                      isSelectedSlot
                        ? "border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/50"
                        : "border-slate-800 hover:border-slate-700"
                    )}
                  >
                    {/* Splash Art BG */}
                    <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
                      <img 
                        src={getCharSplash(b.id) || ''} 
                        alt="" 
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    </div>

                    {/* Top Badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-400">
                        {slotIndex === 0 ? "👑 Лидер" : `Слот ${slotIndex + 1}`}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSquad(b.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-600 hover:text-white transition-colors border border-red-800/40 min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Убрать из отряда"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Char Details */}
                    <div className="relative z-10 mt-auto pt-4">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1", elConf.bg, elConf.color, elConf.border)}>
                          {elConf.icon} {elementNamesRU[b.def.element] || b.def.element}
                        </span>
                        {(() => {
                          const tier = charRarity[b.id] || "B";
                          return (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider border",
                              tier === "S" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                              tier === "A" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                              "bg-slate-500/10 text-slate-400 border-slate-500/30"
                            )}>
                              {tier}-Tier
                            </span>
                          );
                        })()}
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Ур. {b.data.level}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate">
                        {b.def.name}
                      </h3>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                        <span>HP: <strong className="text-green-400">{b.def.stats.maxHp}</strong></span>
                        <span>ATK: <strong className="text-red-400">{b.def.stats.atk}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={slotIndex}
                  onClick={() => setSelectedSlotIndex(slotIndex)}
                  className={cn(
                    "rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] sm:min-h-[200px]",
                    isSelectedSlot
                      ? "border-indigo-500 bg-indigo-950/20 text-indigo-400"
                      : "border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-600 hover:text-slate-400"
                  )}
                >
                  <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Слот {slotIndex + 1}
                  </span>
                  <span className="text-[10px] font-mono mt-1 opacity-70">
                    Нажмите для назначения
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Selection Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Выбор персонажей из персонального ростера
            </h3>

            {/* Element Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {["ALL", "Pyro", "Hydro", "Electro", "Dendro", "Cryo", "Geo"].map((el) => (
                <button
                  key={el}
                  onClick={() => setElementFilter(el)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors min-h-[32px]",
                    elementFilter === el
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {el === "ALL" ? "Все" : el}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredOwnedIds.map((id) => {
              const cData = profile.roster[id];
              const preview = characterBlueprints[id]("", cData.level, cData.constellation);
              const isAlreadyInTeam = currentTeamIds.includes(id);
              const elConf = elementIcons[preview.element] || elementIcons.Physical;

              return (
                <button
                  key={id}
                  onClick={() => assignToSquad(id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left relative overflow-hidden transition-all flex flex-col justify-between group min-h-[100px]",
                    isAlreadyInTeam
                      ? "bg-slate-950 border-indigo-500/50 opacity-80"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-600"
                  )}
                >
                  {/* Splash Art BG */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                    <img 
                      src={getCharSplash(id) || ''} 
                      alt="" 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="relative z-10 flex flex-wrap gap-1 items-start">
                    <span className={cn("px-1 py-0.5 rounded text-[8px] font-bold border flex items-center gap-0.5", elConf.bg, elConf.color, elConf.border)}>
                      {elConf.icon} {elementNamesRU[preview.element] || preview.element}
                    </span>
                    {(() => {
                      const tier = charRarity[id] || "B";
                      return (
                        <span className={cn(
                          "px-1 py-0.5 rounded text-[8px] font-black border",
                          tier === "S" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                          tier === "A" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                          "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        )}>
                          {tier}
                        </span>
                      );
                    })()}
                    {isAlreadyInTeam && (
                      <span className="text-[8px] font-black uppercase px-1 py-0.5 bg-indigo-600 text-white rounded">
                        В отряде
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 mt-3">
                    <div className="text-xs font-black uppercase truncate text-slate-200">
                      {preview.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      Ур. {cData.level}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Confirm Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex justify-end items-center shrink-0">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all min-h-[44px]"
        >
          Готово / Сохранить
        </button>
      </div>
    </div>
  );
};
