import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sword, Info, Zap, Shield, ChevronLeft, Lock } from 'lucide-react';
import { ARTIFACT_DUNGEONS } from '../data';
import { Dungeon, PlayerProfile } from '../types';

interface Props {
  profile: PlayerProfile;
  setRoute: (route: any) => void;
  onBack: () => void;
}

export default function ArtifactDungeon({ profile, setRoute, onBack }: Props) {
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);

  const handleEnter = (dungeon: Dungeon) => {
    if (profile.resin < dungeon.entryCost) {
      alert("Недостаточно первородной смолы!");
      return;
    }
    setRoute({ type: 'DUNGEON', level: dungeon.level, dungeonType: 'ARTIFACT', dungeonId: dungeon.id });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-indigo-400">Подземелья Артефактов</h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Фарм снаряжения</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-mono font-bold text-sm">{profile.resin}/160</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Dungeon List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 pb-20">
          {ARTIFACT_DUNGEONS.map((dungeon) => (
            <motion.button
              key={dungeon.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDungeon(dungeon)}
              className={`w-full text-left p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group ${
                selectedDungeon?.id === dungeon.id
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight mb-1">{dungeon.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">LVL {dungeon.level}</span>
                    <span className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {dungeon.entryCost}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${selectedDungeon?.id === dungeon.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                   <Sword className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Dungeon Details */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          {selectedDungeon ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedDungeon.id}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black uppercase mb-2 text-white">{selectedDungeon.name}</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{selectedDungeon.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Аномалия артерий земли</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-normal">{selectedDungeon.effectDescription}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-amber-400">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Возможные награды</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDungeon.rewardSets.map(setId => (
                       <div key={setId} className="px-3 py-1 bg-slate-800/80 rounded-full border border-amber-500/20 text-[10px] font-bold text-slate-200">
                         Сет: {setId.replace('_', ' ').toUpperCase()}
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Отряд противников</h4>
                <div className="flex gap-4">
                  {selectedDungeon.enemyTeam.map((eId, idx) => (
                    <div key={idx} className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-2xl grayscale opacity-50">
                      👾
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => handleEnter(selectedDungeon)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <Sword className="w-5 h-5" />
                  Начать испытание
                </button>
                <p className="text-center text-[10px] text-slate-600 font-mono mt-4">Расход: {selectedDungeon.entryCost} первородной смолы</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center">
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
