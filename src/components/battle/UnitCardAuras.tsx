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

// 7. Nereus: Abyssal Sea Garden Aura on Nereus Card
export const NereusSeaGardenAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isNereus = unit.id === 'nereus';
  const gardenTurns = unit.buffs.nereusGardenTurns ?? 0;
  const eAtkBuff = unit.buffs.nereusEAtkBuffTurns ?? 0;
  const active = isNereus && !isDead && (gardenTurns > 0 || eAtkBuff > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="nereus-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Ocean current light blue border (GPU CSS) */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-sky-400/90 shadow-[0_0_12px_rgba(56,189,248,0.6)] bg-sky-400/[0.08] anim-subtle-pulse" />

        {/* Floating coral motif */}
        <div className="absolute bottom-2 left-1 text-[10px] text-sky-300 drop-shadow-[0_0_4px_rgba(56,189,248,0.8)] anim-float-particle">
          🪸
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#031424]/95 border border-sky-400/80 text-[8px] font-black text-sky-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🪸</span>
          <span>{gardenTurns > 0 ? `Сад Моря ${gardenTurns}х` : `Водоворот ${eAtkBuff}х`}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 8. Nereus: Sea Flower Reticle on Marked Enemy
export const NereusSeaFlowerAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const flower = unit.buffs.nereusFlower;
  const hits = flower?.hits ?? 0;
  const active = !isDead && hits > 0;

  if (!active) return null;

  const isEruptionReady = hits >= 2;

  return (
    <AnimatePresence>
      <motion.div
        key="nereus-flower-aura"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="absolute -inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-35 select-none"
      >
        {/* Undersea flower reticle border */}
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border ${
          isEruptionReady 
            ? 'border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.8)] bg-sky-500/[0.12] animate-pulse' 
            : 'border-sky-400/75 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
        }`} />

        {/* Coral corner ticks */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-sky-300/90 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-sky-300/90 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-sky-300/90 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-sky-300/90 rounded-br-sm" />

        {/* Badge */}
        <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase shadow whitespace-nowrap z-40 border ${
          isEruptionReady 
            ? 'bg-[#031726]/95 border-sky-300 text-sky-100 shadow-[0_0_8px_rgba(56,189,248,0.6)]' 
            : 'bg-[#02111d]/95 border-sky-500/70 text-sky-200'
        }`}>
          <span>🪸</span>
          <span>ЦВЕТОК ({hits}/2)</span>
          {isEruptionReady && (
            <span className="text-[7px] text-sky-200 font-bold px-1 rounded bg-sky-950 border border-sky-400/50">
              ВЗРЫВ
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 9. Iva: Flora Bond & Blooming Aura on Iva / Party
export const IvaFloraBondAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isIva = unit.id === 'iva';
  const floralBondTurns = unit.buffs.ivaFloralBondTurns ?? 0;
  const bloomTurns = unit.buffs.ivaBloomTurns ?? 0;
  const thornHealStacks = unit.buffs.ivaThornHealStacks ?? 0;
  const active = !isDead && (
    (isIva && (floralBondTurns > 0 || bloomTurns > 0 || thornHealStacks > 0)) ||
    (!isIva && floralBondTurns > 0)
  );

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="iva-flora-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Emerald Botanical Vine border */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.45)] bg-emerald-500/[0.06] anim-subtle-pulse" />

        {/* Floating Sprout/Leaf */}
        <div className="absolute top-1 -left-1 text-[10px] text-emerald-300 anim-float-particle">
          🌿
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#041a0f]/95 border border-emerald-400/70 text-[8px] font-black text-emerald-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>{bloomTurns > 0 ? '🌸' : '🌿'}</span>
          <span>
            {bloomTurns > 0 
              ? `Цветение ${bloomTurns}х` 
              : floralBondTurns > 0 
              ? `Связь ${floralBondTurns}х` 
              : `Шипы ${thornHealStacks}`}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 10. Iva: Thorns & RES-Down Aura on Enemy Card
export const IvaThornDebuffAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const thorns = unit.buffs.thorns ?? 0;
  const resDown = unit.buffs.resDown ?? 0;
  const active = !isDead && (thorns > 0 || resDown > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="iva-thorn-enemy-aura"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute -inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-35 select-none"
      >
        {/* Thorny green corner indicators */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500/90 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500/90 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500/90 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500/90 rounded-br-sm" />

        {/* Badge */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#03180c]/95 border border-emerald-500/60 shadow text-[8px] font-bold text-emerald-200 uppercase whitespace-nowrap z-40">
          <span>🌿</span>
          <span>{thorns > 0 ? `Шипы (${thorns})` : `-20% RES`}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 11. Kern: Tectonic Overload & Critical Overload (C6) Aura
export const KernTectonicAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isKern = unit.id === 'kern';
  const overloadTurns = unit.buffs.kernOverloadTurns ?? 0;
  const qBonusTurns = unit.buffs.kernQBonusTurns ?? 0;
  const isCritOverload = Boolean(unit.buffs.kernCritOverloadActive);
  const critTurns = unit.buffs.kernCritOverloadTurns ?? 0;
  const c2Stacks = unit.buffs.kernC2DefStacks ?? 0;

  const active = isKern && !isDead && (overloadTurns > 0 || isCritOverload || qBonusTurns > 0 || c2Stacks > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="kern-tectonic-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Tectonic Molten Magma Border */}
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 ${
          isCritOverload
            ? 'border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)] bg-rose-500/[0.1] animate-pulse'
            : qBonusTurns > 0
            ? 'border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.6)] bg-orange-500/[0.08]'
            : 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] bg-amber-500/[0.06] anim-subtle-pulse'
        }`} />

        {/* Floating Magma Spark */}
        <div className="absolute top-1 -right-1 text-[10px] text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] anim-float-particle">
          {isCritOverload ? '🌋' : '⚡'}
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1c0b02]/95 border border-amber-400 text-[8px] font-black text-amber-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🌋</span>
          <span>
            {isCritOverload 
              ? `КРИТ. ПЕРЕГРУЗКА (${critTurns}х)` 
              : (qBonusTurns > 0 ? `РАЗЛОМ (${qBonusTurns}х)` : `ПЕРЕГРУЗКА (${overloadTurns}х)`)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 12. Aelita: Thorns Empower & Wild Botanical Aura
export const AelitaThornsEmpowerAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isAelita = unit.id === 'aelita';
  const atkBuff = (unit.buffs.atk ?? 0) > 0;
  const shield = (unit.buffs.shield ?? 0) > 0;
  const active = isAelita && !isDead && (atkBuff || shield);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="aelita-thorns-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Emerald botanical glowing border */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.55)] bg-emerald-500/[0.08] anim-subtle-pulse" />

        {/* Floating Thorn Leaves */}
        <div className="absolute top-1 -right-1 text-[10px] text-emerald-300 drop-shadow-[0_0_4px_rgba(16,185,129,0.9)] anim-float-particle">
          🌱
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#022214]/95 border border-emerald-400 text-[8px] font-black text-emerald-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🌿</span>
          <span>{shield ? 'ОРАНЖЕРЕЯ +ЩИТ' : 'ТЕОРЕМА +АТК'}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 13. Maestro: Conductor Electric Soundwave Aura
export const MaestroConductorAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isMaestro = unit.id === 'maestro';
  const active = isMaestro && !isDead;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="maestro-conductor-aura"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-1 pointer-events-none rounded-xl sm:rounded-2xl z-25 select-none"
      >
        {/* Subtle violet acoustic frame */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)] bg-purple-900/[0.04] anim-subtle-pulse" />

        {/* Floating Music Note */}
        <div className="absolute top-0 -left-1 text-[9px] text-purple-300 anim-float-particle">
          🎵
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 14. Maestro: Isolation Target Reticle Aura on Enemy
export const MaestroIsolationTargetAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isolation = unit.buffs.isolationMark ?? 0;
  const active = !isDead && isolation > 0;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="maestro-isolation-enemy-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-35 select-none"
      >
        {/* Violet Acoustic Isolation Border */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)] bg-purple-500/[0.08] anim-subtle-pulse" />

        {/* Floating Targeting Crosshair */}
        <div className="absolute top-0.5 -right-1 text-[10px] text-purple-300 animate-spin" style={{ animationDuration: '6s' }}>
          🎯
        </div>

        {/* Badge */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#1e072b]/95 border border-purple-400 shadow-md text-[8px] font-black text-purple-200 uppercase whitespace-nowrap z-40">
          <span>🎯</span>
          <span>ИЗОЛЯЦИЯ ({isolation}х)</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 15. Ineffa: Prismatic Solar Mirror Aura
export const IneffaMirrorAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isIneffa = unit.id === 'ineffa';
  const reflectedForm = unit.buffs.reflectedForm ?? 0;
  const mirrorFragments = unit.buffs.mirrorFragment ?? 0;
  const active = isIneffa && !isDead && (reflectedForm > 0 || mirrorFragments > 0);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ineffa-mirror-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Prismatic Crimson-Ruby Border */}
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 ${
          mirrorFragments >= 4 
            ? 'border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)] bg-rose-500/[0.1] animate-pulse'
            : 'border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-red-500/[0.06] anim-subtle-pulse'
        }`} />

        {/* Floating Mirror Spark */}
        <div className="absolute top-1 -right-1 text-[10px] text-rose-300 drop-shadow-[0_0_4px_rgba(244,63,94,0.9)] anim-float-particle">
          🔥
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#20050a]/95 border border-rose-400 text-[8px] font-black text-rose-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🪞</span>
          <span>
            {reflectedForm > 0 ? `ОТРАЖЕНИЕ (${reflectedForm}х)` : `ФРАГМЕНТЫ: ${mirrorFragments}`}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 16. Gotka: Dark Marionette Threads Aura
export const GotkaPuppetAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isGotka = unit.id === 'gotka';
  const puppets = unit.buffs.puppets ?? 0;
  const active = isGotka && !isDead && puppets > 0;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gotka-puppet-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Dark Crimson Shadow Puppet Border */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-red-500/90 shadow-[0_0_12px_rgba(220,38,38,0.6)] bg-red-950/[0.12] anim-subtle-pulse" />

        {/* Floating Marionette Mask */}
        <div className="absolute top-0.5 -left-1 text-[10px] text-red-300 anim-float-particle">
          🎭
        </div>

        {/* Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1f0404]/95 border border-red-500 text-[8px] font-black text-red-200 uppercase shadow-md whitespace-nowrap z-40">
          <span>🎭</span>
          <span>МАРИОНЕТКИ: {puppets}/4</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// 17. Volosatinya: Azure Wave & Hair Blade Aura
export const VolosatinyaHairAura: React.FC<{ unit: Combatant; isDead: boolean }> = React.memo(({ unit, isDead }) => {
  const isVolosatinya = unit.id === 'volosatinya';
  const atkBuff = (unit.buffs.atk ?? 0) > 0;
  const active = isVolosatinya && !isDead;

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="volosatinya-hair-aura"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className="absolute -inset-1 sm:-inset-1.5 pointer-events-none rounded-xl sm:rounded-2xl z-30 select-none"
      >
        {/* Flowing Azure Hydro Hair Border */}
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 ${
          atkBuff 
            ? 'border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.7)] bg-sky-400/[0.1] animate-pulse' 
            : 'border-blue-400/80 shadow-[0_0_8px_rgba(59,130,246,0.4)] bg-blue-500/[0.05] anim-subtle-pulse'
        }`} />

        {/* Floating Ocean Water / Hair Sparkle */}
        <div className="absolute top-1 -right-1 text-[10px] text-sky-300 anim-float-particle">
          🌊
        </div>

        {/* Badge */}
        {atkBuff && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#031525]/95 border border-sky-400 text-[8px] font-black text-sky-200 uppercase shadow-md whitespace-nowrap z-40">
            <span>💇‍♂️</span>
            <span>ПОЛЯНА ВОЛОС (+АТК)</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});


