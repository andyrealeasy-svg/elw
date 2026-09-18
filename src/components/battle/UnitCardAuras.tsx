import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Combatant } from '../../types';

// 1. Volta: Electric Voltage & Conduction Circuit Aura
export const VoltageCircuitAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const voltage = unit.buffs.voltage ?? 0;
  const circuitTurns = unit.buffs.conductionCircuit ?? 0;
  const active = !isDead && (voltage > 0 || circuitTurns > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="voltage-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Pulsing violet-yellow neon border (GPU compositor via CSS) */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl sm:rounded-2xl border-2 shadow-sm anim-subtle-pulse",
            voltage >= 5 
              ? "border-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.5)]" 
              : "border-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.4)]"
          )}
        />
        {/* Subtle electric tint */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-violet-500/[0.07]" />

        {/* 2 Micro sparks with pure GPU CSS */}
        <div className="absolute top-1 -right-1 text-[10px] text-yellow-300 drop-shadow-[0_0_3px_rgba(253,224,71,0.8)] anim-float-particle">
          ⚡
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#130d24]/95 border border-violet-400/70 text-[8px] font-black text-yellow-300 uppercase shadow-md whitespace-nowrap z-40">
          <span>⚡</span>
          <span>{voltage > 0 ? `Вольт ${voltage}` : `Контур ${circuitTurns}`}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 2. Snezhana: Overcool & Crit Overcool Glacial Aura
export const OvercoolFrostAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const overcool = unit.buffs.overcool ?? 0;
  const critOvercool = unit.buffs.critOvercool ?? 0;
  const active = !isDead && (overcool > 0 || critOvercool > 0);
  const isCrit = critOvercool > 0;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overcool-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Icy border (GPU CSS) */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl sm:rounded-2xl border-2 anim-subtle-pulse",
            isCrit 
              ? "border-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.6)] bg-cyan-400/[0.10]" 
              : "border-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.35)] bg-sky-500/[0.05]"
          )}
        />

        {/* Frozen corner crystals */}
        <div className="absolute top-0 left-0 text-[9px] text-cyan-200">❅</div>
        <div className="absolute top-0 right-0 text-[9px] text-cyan-200">❅</div>

        {/* Badge */}
        <div className={cn(
          "absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase shadow-md whitespace-nowrap z-40 border",
          isCrit 
            ? "bg-[#041a26]/95 border-cyan-300 text-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.5)]" 
            : "bg-[#071927]/90 border-sky-400/60 text-sky-200"
        )}>
          <span>❄️</span>
          <span>{isCrit ? `Крит Холод ${critOvercool}` : `Холод ${overcool}/4`}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 3. Aveline: Azure Tide Petals Aura
export const AzurePetalsAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const petals = unit.buffs.avelinePetals ?? 0;
  const isAveline = unit.id === 'aveline';
  const active = !isDead && isAveline && petals > 0;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="aveline-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Azure water border (GPU CSS) */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-sky-300/80 shadow-[0_0_8px_rgba(125,211,252,0.4)] bg-sky-400/[0.06] anim-subtle-pulse" />

        {/* 1 Floating water petal (GPU CSS) */}
        <div className="absolute bottom-3 left-1 text-[9px] text-pink-300 anim-float-particle">
          🌸
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#081829]/95 border border-sky-300/60 text-[8px] font-black text-pink-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🌸</span>
          <span>Лепестки {petals}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 4. Kairen: Crystalline Frost Shards & Winter Aura
export const KairenFrostShardsAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const shards = unit.buffs.kairenShards ?? 0;
  const winterTurns = unit.buffs.kairenWinterTurns ?? 0;
  const frostTurns = unit.buffs.kairenFrostTurns ?? 0;
  const c6Buff = unit.buffs.kairenC6CryoBuff ?? 0;
  const isKairen = unit.id === 'kairen';
  const maxShards = ((unit.constellation ?? 0) >= 5 && winterTurns > 0) ? 7 : 5;
  const isEchoReady = shards >= maxShards;

  const active = !isDead && isKairen && (shards > 0 || winterTurns > 0 || frostTurns > 0 || c6Buff > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="kairen-aura"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute -inset-0.5 sm:-inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Sleek Crystalline Frame */}
        <div 
          className={`absolute inset-0 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
            isEchoReady 
              ? 'border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.7)] bg-cyan-500/[0.08] animate-pulse' 
              : winterTurns > 0
              ? 'border-cyan-400/70 shadow-[0_0_8px_rgba(34,211,238,0.3)] bg-cyan-600/[0.04]'
              : 'border-cyan-400/50 shadow-[0_0_6px_rgba(34,211,238,0.2)]'
          }`} 
        />

        {/* Minimalist Bottom Shard Counter Badge */}
        {shards > 0 && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#021321]/95 border border-cyan-400/60 text-[8px] font-bold text-cyan-200 uppercase shadow whitespace-nowrap z-40">
            <span>❄️</span>
            <span className="font-mono text-cyan-100">{shards}/{maxShards}</span>
            {isEchoReady && (
              <span className="text-[7px] text-amber-300 font-bold px-1 rounded bg-cyan-950 border border-cyan-400/40">
                ЭХО
              </span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

// 4.5. Kairen: C4 Cold Mark Targeting Aura on Enemies (Tactical Frost Reticle)
export const KairenColdMarkAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const coldMarkTurns = unit.buffs.kairenColdMark ?? 0;
  const active = !isDead && coldMarkTurns > 0;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cold-mark-aura"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute -inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-35 select-none"
      >
        {/* Subtle Frost Tint & 4 Corner Brackets */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm" />

        {/* Compact Mark Badge */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#011422]/95 border border-cyan-400/50 shadow text-[8px] font-bold text-cyan-200 uppercase whitespace-nowrap z-40">
          <span>❄️ Метка ({coldMarkTurns}х)</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 5. Cyrus: Duel Targeting Reticle & Execution Hazard Aura (on marked target)
export const DuelReticleAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isDuelMarked = (unit.buffs.duelMark ?? 0) > 0;
  const active = !isDead && isDuelMarked;
  const isExecuteRange = unit.stats.hp > 0 && (unit.stats.hp / unit.stats.maxHp) <= 0.35;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="duel-aura"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.06 }}
        transition={{ duration: 0.2 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-40 select-none"
      >
        {/* Tactical Targeting Border */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl sm:rounded-2xl border transition-colors duration-300",
            isExecuteRange 
              ? "border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.7)] bg-red-600/[0.08]" 
              : "border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.35)] bg-rose-500/[0.03]"
          )}
        />

        {/* Sharp Precision Corner Brackets (Zero emojis/misaligned unicode) */}
        <div className={cn("absolute top-0.5 left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 rounded-tl-sm", isExecuteRange ? "border-red-400 shadow-[0_0_4px_rgba(239,68,68,1)]" : "border-rose-400")} />
        <div className={cn("absolute top-0.5 right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 rounded-tr-sm", isExecuteRange ? "border-red-400 shadow-[0_0_4px_rgba(239,68,68,1)]" : "border-rose-400")} />
        <div className={cn("absolute bottom-0.5 left-0.5 w-2.5 h-2.5 border-b-2 border-l-2 rounded-bl-sm", isExecuteRange ? "border-red-400 shadow-[0_0_4px_rgba(239,68,68,1)]" : "border-rose-400")} />
        <div className={cn("absolute bottom-0.5 right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 rounded-br-sm", isExecuteRange ? "border-red-400 shadow-[0_0_4px_rgba(239,68,68,1)]" : "border-rose-400")} />

        {/* Crosshair Center Ticks */}
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-2 h-[1.5px]", isExecuteRange ? "bg-red-400" : "bg-rose-400/80")} />
        <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-[1.5px]", isExecuteRange ? "bg-red-400" : "bg-rose-400/80")} />
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 h-2 w-[1.5px]", isExecuteRange ? "bg-red-400" : "bg-rose-400/80")} />
        <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 h-2 w-[1.5px]", isExecuteRange ? "bg-red-400" : "bg-rose-400/80")} />

        {/* Tactical Badge (Clean, zero emojis) */}
        <div className={cn(
          "absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase shadow-md whitespace-nowrap z-50 border",
          isExecuteRange 
            ? "bg-[#200408]/95 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse" 
            : "bg-[#180307]/95 border-rose-500/70 text-rose-200 shadow-[0_0_6px_rgba(244,63,94,0.3)]"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", isExecuteRange ? "bg-red-500 animate-ping" : "bg-rose-400")} />
          <span>{isExecuteRange ? "КАЗНЬ · КРИТ" : "ДУЭЛЬ"}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// Cyrus Self Focus Aura (on Cyrus card when duel is active)
export const CyrusDuelistAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isCyrus = unit.id === "cyrus";
  const active = isCyrus && !isDead;

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-xl sm:rounded-2xl z-20">
      {/* Subtle Crimson-Steel Duelist Edge */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]" />
    </div>
  );
});

// 6. Raven: Shadow Phantom Hunter & Clean Target Indicator Aura
export const RavenPhantomAura: React.FC<{ 
  unit: Combatant; 
  isDead: boolean; 
  isPlayer: boolean; 
  hasRavenInParty: boolean 
}> = React.memo(({ unit, isDead, isPlayer, hasRavenInParty }) => {
  // On Raven himself:
  const isRaven = unit.id === 'raven' && !isDead;
  
  // On enemy: Clean Target (no debuffs)
  const isCleanTarget = !isPlayer && !isDead && hasRavenInParty && !(
    (unit.buffs.thorns ?? 0) > 0 || 
    (unit.buffs.poison ?? 0) > 0 || 
    (unit.buffs.frozen ?? 0) > 0 || 
    (unit.buffs.burn ?? 0) > 0 || 
    (unit.buffs.mute ?? 0) > 0 || 
    (unit.buffs.resDown ?? 0) > 0 || 
    (unit.buffs.bleed ?? 0) > 0 || 
    (unit.buffs.duelMark ?? 0) > 0 || 
    (unit.buffs.spd ?? 0) < 0 || 
    (unit.buffs.def ?? 0) < 0 || 
    (unit.buffs.atk ?? 0) < 0
  );

  return (
    <AnimatePresence>
      {isRaven && (
        <motion.div
          key="raven-self-aura"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute -inset-0.5 sm:-inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-20 select-none"
        >
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]" />
          <div className="absolute top-1 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0b0a1d]/90 border border-indigo-500/40 text-[7px] font-mono text-indigo-300">
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span>ТЕНЬ</span>
          </div>
        </motion.div>
      )}

      {isCleanTarget && (
        <motion.div
          key="clean-target-aura"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute -inset-1 pointer-events-none rounded-xl z-25 select-none"
        >
          {/* Precision corner brackets */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-400/80 rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-400/80 rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-400/80 rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-400/80 rounded-br-sm" />

          {/* Subtle hunter glow perimeter */}
          <div className="absolute inset-0 rounded-xl border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />

          {/* High-contrast status pill */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0c0a1f]/95 border border-indigo-400/70 text-[7px] font-bold text-indigo-200 uppercase whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>ЧИСТАЯ ЦЕЛЬ</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
