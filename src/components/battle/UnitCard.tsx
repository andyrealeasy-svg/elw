import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Combatant } from '../../types';
import { SnowDustAura } from '../SnowDustAura';
import {
  VoltageCircuitAura,
  OvercoolFrostAura,
  AzurePetalsAura,
  KairenFrostShardsAura,
  KairenColdMarkAura,
  DuelReticleAura,
  CyrusDuelistAura,
  RavenPhantomAura,
} from './UnitCardAuras';
import { EffectsOverlay } from '../EffectsOverlay';

interface UnitCardProps {
  unit: Combatant;
  isPlayer: boolean;
  isActive: boolean;
  isAttacking: boolean;
  isTargetable: boolean;
  hasRavenInParty: boolean;
  onSelect: (target: Combatant, isPlayer: boolean) => void;
  onRegisterRef: (uid: string, el: any) => void;
}

export const UnitCard: React.FC<UnitCardProps> = React.memo(({
  unit,
  isPlayer,
  isActive,
  isAttacking,
  isTargetable,
  hasRavenInParty,
  onSelect,
  onRegisterRef,
}) => {
  const isDead = unit.stats.hp <= 0;
  const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;

  const handleRef = React.useCallback((el: any) => {
    if (onRegisterRef) onRegisterRef(unit.uid, el);
  }, [unit.uid, onRegisterRef]);

  const handleClick = React.useCallback(() => {
    if (!isDead) onSelect(unit, isPlayer);
  }, [isDead, onSelect, unit, isPlayer]);

  return (
    <div 
      onClick={handleClick}
      style={{ 
        transform: isAttacking 
          ? (isPlayer ? 'translateY(-30px) translateX(15px) rotate(4deg) scale(1.08)' : 'translateY(30px) translateX(-15px) rotate(-4deg) scale(1.08)')
          : isActive ? 'translateY(-6px) scale(1.08)' : 'none',
        transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease-out',
        zIndex: isAttacking || isActive ? 50 : 1,
      }}
      className={cn(
        "relative flex flex-col p-0 rounded-xl sm:rounded-2xl border-2 cursor-pointer flex-1 min-w-[70px] sm:min-w-[80px] max-w-[95px] sm:max-w-[120px] shadow-lg group bg-[#0a0a0a] select-none",
        unit.color,
        isActive ? "ring-2 sm:ring-4 ring-yellow-400 ring-offset-2 sm:ring-offset-4 ring-offset-gray-950 border-white shadow-md" : "border-white/10 opacity-90",
        isDead ? "opacity-30 grayscale cursor-not-allowed contrast-75 brightness-50" : "hover:scale-105 hover:opacity-100",
        isTargetable && !isDead ? "animate-pulse cursor-crosshair border-white ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
      )}
    >
      {/* Snow Dust Aura on Enemy (Снежная пыль) */}
      <SnowDustAura 
        active={Boolean(!isPlayer && unit.buffs.snowDust && unit.buffs.snowDust > 0 && !isDead)} 
        stacks={unit.buffs.snowDust} 
      />

      {/* Dynamic Character Visual Auras (Вольта, Снежана, Авелин, Кайрен, Сайрус, Рейвен) */}
      <VoltageCircuitAura unit={unit} isDead={isDead} />
      <OvercoolFrostAura unit={unit} isDead={isDead} />
      <AzurePetalsAura unit={unit} isDead={isDead} />
      <KairenFrostShardsAura unit={unit} isDead={isDead} />
      <KairenColdMarkAura unit={unit} isDead={isDead} />
      <DuelReticleAura unit={unit} isDead={isDead} />
      <CyrusDuelistAura unit={unit} isDead={isDead} />
      <RavenPhantomAura unit={unit} isDead={isDead} isPlayer={isPlayer} hasRavenInParty={hasRavenInParty} />

      {/* Upper Splashart Wrapper */}
      <div className="relative w-full aspect-[1.15] sm:aspect-square rounded-t-[6px] sm:rounded-t-[10px] overflow-hidden bg-[#111111]/60 flex-shrink-0">
        {unit.image ? (
          <img 
            src={unit.image} 
            alt={unit.name} 
            className={cn(
              "w-full h-full object-cover scale-105 group-hover:scale-120 transition-transform duration-700 opacity-95 group-hover:opacity-100", 
              unit.name.includes("БОСС") && "brightness-125 contrast-125"
            )} 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-[#1a1a1a]">
            ⚔️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-transparent" />
        {unit.name.includes("БОСС") && <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay animate-pulse" />}

        {/* Buff Icons & Aura inside Splashart Wrapper for clean layout */}
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end z-30">
          {unit.aura && (
            <div 
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px] text-white font-black rounded border border-white/40 uppercase shadow-lg",
                unit.aura === "Hydro" ? "bg-blue-600" :
                unit.aura === "Pyro" ? "bg-red-600" :
                unit.aura === "Dendro" ? "bg-green-600" :
                unit.aura === "Electro" ? "bg-purple-600" :
                unit.aura === "Cryo" ? "bg-cyan-500" :
                unit.aura === "Geo" ? "bg-orange-600" : "bg-gray-500"
              )}
            >
              {unit.aura.substring(0, 1)}
            </div>
          )}
           
          <div className="flex gap-0.5 flex-wrap justify-end max-w-[40px]">
            {unit.buffs.duelMark > 0 && <div className="text-[7px] bg-red-950 text-red-200 font-bold rounded-sm px-0.5 border border-red-500/60 shadow-sm" title="Метка дуэли">ДУЭЛЬ</div>}
            {unit.buffs.shield > 0 && <Shield className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-300 shadow-sm" />}
            {unit.buffs.puppets > 0 && <div className="text-[7px] bg-red-700 text-white rounded-sm px-0.5 border border-white/20 font-bold">🎭{unit.buffs.puppets}</div>}
            {unit.buffs.frenzyStacks > 0 && <div className="text-[7px] bg-amber-600 text-white rounded-sm px-0.5 border border-white/20 font-bold">🔥{unit.buffs.frenzyStacks}</div>}
            {unit.buffs.joyStacks > 0 && <div className="text-[7px] bg-purple-600 text-white rounded-sm px-0.5 border border-white/20 font-bold">✨{unit.buffs.joyStacks}</div>}
            {unit.buffs.thorns > 0 && <div className="text-[7px] bg-emerald-700 text-white rounded-sm px-0.5 border border-white/20 font-bold">🌿{unit.buffs.thorns}</div>}
            {unit.buffs.roseEmbers > 0 && <div className="text-[7px] bg-rose-700 text-white rounded-sm px-0.5 border border-white/20 font-bold">🌹{unit.buffs.roseEmbers}</div>}
            {unit.buffs.trapStacks > 0 && <div className="text-[7px] bg-orange-700 text-white rounded-sm px-0.5 border border-white/20 font-bold">💣{unit.buffs.trapStacks}</div>}
            {unit.buffs.isolationMark > 0 && <div className="text-[7px] bg-purple-600 text-white rounded-sm px-0.5 border border-purple-400 font-bold">🎯{unit.buffs.isolationMark}</div>}
            {(unit.buffs.voltage ?? 0) > 0 && <div className="text-[7px] bg-violet-600 text-yellow-300 font-bold rounded-sm px-0.5 border border-yellow-400/40">⚡{unit.buffs.voltage}</div>}
            {(unit.buffs.conductionCircuit ?? 0) > 0 && <div className="text-[7px] bg-cyan-600 text-white font-bold rounded-sm px-0.5 border border-cyan-300/40">🔄{unit.buffs.conductionCircuit}</div>}
            {(unit.buffs.kairenShards ?? 0) > 0 && <div className="text-[7px] bg-sky-600 text-white font-bold rounded-sm px-0.5 border border-sky-300/40" title="Осколки инея">❄️{unit.buffs.kairenShards}</div>}
            {(unit.buffs.kairenWinterTurns ?? 0) > 0 && <div className="text-[7px] bg-cyan-900 text-cyan-200 font-bold rounded-sm px-0.5 border border-cyan-400/50" title="Вечная зима">👑{unit.buffs.kairenWinterTurns}</div>}
            {(unit.buffs.kairenFrostTurns ?? 0) > 0 && <div className="text-[7px] bg-cyan-800 text-cyan-100 font-bold rounded-sm px-0.5 border border-cyan-300/40" title="Иней (+20% Cryo)">❄️+{unit.buffs.kairenFrostTurns}</div>}
            {(unit.buffs.kairenColdMark ?? 0) > 0 && <div className="text-[7px] bg-sky-950 text-cyan-300 font-bold rounded-sm px-0.5 border border-cyan-400 animate-pulse" title="Холодная метка (C4)">❄️🎯{unit.buffs.kairenColdMark}</div>}
            {(unit.buffs.kairenC6CryoBuff ?? 0) > 0 && <div className="text-[7px] bg-indigo-900 text-cyan-100 font-bold rounded-sm px-0.5 border border-cyan-200" title="Конец вечной зимы: +30% Cryo">🏔️{unit.buffs.kairenC6CryoBuff}</div>}
            {(unit.buffs.avelinePetals ?? 0) > 0 && <div className="text-[7px] bg-pink-600 text-white font-bold rounded-sm px-0.5 border border-pink-300/40">🌸{unit.buffs.avelinePetals}</div>}
            {(unit.buffs.avelineGardenTurns ?? 0) > 0 && <div className="text-[7px] bg-sky-700 text-cyan-200 font-bold rounded-sm px-0.5 border border-sky-400/40" title="Лазурный сад">🪷{unit.buffs.avelineGardenTurns}</div>}
            {(unit.buffs.avelineGreatFlowerTurns ?? 0) > 0 && <div className="text-[7px] bg-fuchsia-800 text-fuchsia-100 font-bold rounded-sm px-0.5 border border-fuchsia-400/50" title="Вечное цветение">🌺{unit.buffs.avelineGreatFlowerTurns}</div>}
            {(unit.buffs.snowDust ?? 0) > 0 && <div className="text-[7px] bg-cyan-700 text-cyan-100 font-bold rounded-sm px-0.5 border border-cyan-300/40">❄️{unit.buffs.snowDust}</div>}
            {(unit.buffs.whiteField ?? 0) > 0 && <div className="text-[7px] bg-sky-800 text-sky-100 font-bold rounded-sm px-0.5 border border-sky-300/40">🌨️{unit.buffs.whiteField}</div>}
          </div>
        </div>
      </div>

      {isActive && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-[100] pointer-events-none">
          <div className={cn("w-2 h-2 rounded-full shadow-sm animate-pulse", unit.name.includes("БОСС") ? "bg-red-500" : "bg-yellow-400")} />
          <div className={cn("text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-widest shadow-md whitespace-nowrap shadow-2xl", unit.name.includes("БОСС") ? "bg-red-600" : "bg-yellow-500")}>
            {unit.name.includes("БОСС") ? "БОСС" : "Ходит"}
          </div>
        </div>
      )}

      {/* Lower Info Wrapper */}
      <div className="p-1.5 sm:p-2 flex flex-col gap-1 sm:gap-1.5 bg-[#0a0a0a]/95 rounded-b-[6px] sm:rounded-b-[10px] flex-grow">
        <div className={cn(
          "text-white font-black text-[9px] sm:text-xs uppercase tracking-tight text-center truncate shadow-sm",
          unit.name.includes("БОСС") && "text-red-400 sm:text-sm font-black"
        )}>
          {unit.name}
        </div>
        
        {/* HP Bar (GPU CSS transition) */}
        <div className="relative w-full bg-black/60 h-2 sm:h-2.5 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div 
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
            className={cn(
              "h-full relative rounded-full transition-all duration-300 ease-out",
              hpPercent > 50 ? "bg-gradient-to-r from-green-600 to-green-400" : hpPercent > 20 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-red-400"
            )}
          >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-black text-white uppercase leading-none mt-0.5">
           <span className="text-white/50">HP</span>
           <span className="tabular-nums tracking-tight">
             {unit.stats.maxHp >= 1000000 
               ? `${(unit.stats.hp / 1000000).toFixed(2)}M / ${(unit.stats.maxHp / 1000000).toFixed(2)}M`
               : unit.stats.maxHp >= 10000 
                 ? `${(unit.stats.hp / 1000).toFixed(1)}k / ${(unit.stats.maxHp / 1000).toFixed(1)}k`
                 : `${Math.floor(unit.stats.hp)} / ${unit.stats.maxHp}`
             }
           </span>
        </div>
        
        {/* ATB Bar (GPU CSS transition) */}
        <div className="w-full bg-black/40 h-1 sm:h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-transform duration-100 ease-linear" 
            style={{ transform: `scaleX(${unit.atb / 100})`, transformOrigin: 'left' }} 
          />
        </div>
      </div>

      <EffectsOverlay unitId={unit.uid} ref={handleRef} />
    </div>
  );
});
