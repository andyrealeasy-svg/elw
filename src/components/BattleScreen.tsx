import React, { useState, useEffect, useRef } from 'react';
import { Combatant, BattleState, TargetType, Skill } from '../types';
import { Shovel, Shield, Volume2, VolumeX, Sword, Zap, Sparkles, Target, Info, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { dealDamage } from '../data';
import { playNormalAttackSound, playElementalSkillSound, playUltimateBurstSound, playVictorySound, getSoundMuteState, setSoundMuteState } from '../lib/sound';

interface BattleScreenProps {
  key?: React.Key;
  playerParty: Combatant[];
  enemyWaves: Combatant[][]; // Changed from enemyParty
  onDefeat: (stats: Record<string, number>) => void;
  onVictory: (stats: Record<string, number>) => void;
  onSkillUse?: () => void;
  battleBuff?: string;
  stageTitle?: string;
}

export default function BattleScreen({ playerParty: initialPlayers, enemyWaves, onDefeat, onVictory, onSkillUse, battleBuff, stageTitle }: BattleScreenProps) {
  const [players, setPlayers] = useState<Combatant[]>(() => {
    if (!battleBuff) return initialPlayers;
    return initialPlayers.map(p => {
       const pb = { ...p, buffs: { ...p.buffs } };
       if (battleBuff.includes("Крит. урон")) pb.buffs.critDamage = (pb.buffs.critDamage || 0) + 50;
       if (battleBuff.includes("защита")) pb.buffs.shield = (pb.buffs.shield || 0) + p.stats.maxHp * 0.2;
       if (battleBuff.includes("игнорирует")) pb.buffs.dmgBoost = (pb.buffs.dmgBoost || 0) + 15;
       return pb;
    });
  });
  const [currentWave, setCurrentWave] = useState(0);
  const [enemies, setEnemies] = useState<Combatant[]>(enemyWaves[0]);
  const [muted, setMuted] = useState(getSoundMuteState());
  const [isAutoBattle, setIsAutoBattle] = useState(false);

  const damageDealtRef = useRef<Record<string, number>>({});
  const battleStartTimeRef = useRef<number>(Date.now());

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    setSoundMuteState(newState);
  };
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(["Бой начался!"]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string, targetUid: string, text: string, color: string }[]>([]);
  const [visualEffects, setVisualEffects] = useState<{ id: string, targetUid: string, type: string }[]>([]);
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = React.useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  }, []);

  // We use a ref for state to avoid dependency cycles in our game loop interval
  const stateRef = useRef({
    players,
    enemies,
    activeUnitId,
    isRunning: true,
    addFloatText: null as any,
    playEffect: null as any,
    damageDealt: damageDealtRef.current
  });

  const addFloatText = React.useCallback((targetUid: string, text: string, color: string) => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, targetUid, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1500);
  }, []);

  const playEffect = React.useCallback((targetUid: string, type: string) => {
    if (type === "shake" || type === "ultimate_aoe") triggerShake();
    
    const id = Math.random().toString();
    setVisualEffects(prev => [...prev, { id, targetUid, type }]);
    
    // Duration depends on effect type
    const duration = type.includes("ultimate") ? 2000 : 1000;
    
    setTimeout(() => {
      setVisualEffects(prev => prev.filter(ve => ve.id !== id));
    }, duration);
  }, [triggerShake]);

  useEffect(() => {
    stateRef.current = { 
      players, 
      enemies, 
      activeUnitId, 
      isRunning: !activeUnitId || isAutoBattle, 
      addFloatText, 
      playEffect,
      damageDealt: damageDealtRef.current,
      isAutoBattle
    };
  }, [players, enemies, activeUnitId, addFloatText, playEffect, isAutoBattle]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-10)); // keep last 10 logs
  };

  // Game Loop
  useEffect(() => {
    const tick = setInterval(() => {
      const { players: currPlayers, enemies: currEnemies, damageDealt } = stateRef.current;
      
      // Check Win/Loss
      if (currPlayers.every(p => p.stats.hp <= 0)) {
        const stats = { ...damageDealt, __duration: (Date.now() - battleStartTimeRef.current) / 1000 };
        onDefeat(stats);
        return;
      }
      if (currEnemies.every(e => e.stats.hp <= 0)) {
        if (currentWave < enemyWaves.length - 1) {
          // Next Wave!
          const nextWaveIndex = currentWave + 1;
          const nextEnemies = enemyWaves[nextWaveIndex];
          
          setCurrentWave(nextWaveIndex);
          setEnemies(nextEnemies);
          setPlayers(prev => prev.map(p => ({ ...p, atb: Math.min(p.atb, 50) }))); // Reset ATB partially
          addLog(`Волна ${nextWaveIndex + 1} приближается!`);
          
          // Clear active state if any
          setActiveUnitId(null);
          setSelectedSkill(null);
          return;
        } else {
          playVictorySound();
          const stats = { ...damageDealt, __duration: (Date.now() - battleStartTimeRef.current) / 1000 };
          onVictory(stats);
          return;
        }
      }

      if (!stateRef.current.isRunning) {
        // Even if paused, force React to update HP bars from delayed hits
        setPlayers([...currPlayers]);
        setEnemies([...currEnemies]);
        return;
      }


      let newPlayers = [...currPlayers];
      let newEnemies = [...currEnemies];
      let hasActive = false;
      let aiPlayerAction: Combatant | null = null;

      // ATB Tick for Players
      newPlayers = newPlayers.map(p => {
        if (p.stats.hp <= 0) return p;
        if (p.atb >= 100 && !hasActive) {
          hasActive = true;
          setActiveUnitId(p.id);
          if (stateRef.current.isAutoBattle) {
            aiPlayerAction = p;
          }
          return p;
        } else if (p.atb < 100) {
          return { ...p, atb: Math.min(100, p.atb + p.stats.spd * 0.05) };
        }
        return p;
      });

      if (aiPlayerAction) {
         const p = aiPlayerAction as Combatant;
         const availableSkills = p.skills.filter(s => (!p.cooldowns[s.id] || p.cooldowns[s.id] <= 0) && (!s.cost || s.cost <= 0)); // actually only check cooldown
         const usableSkills = p.skills.filter(s => !p.cooldowns[s.id] || p.cooldowns[s.id] <= 0);
         const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)] || p.skills[0];

         let targets: Combatant[] = [];
         if (skill.target === "AllEnemies") targets = newEnemies.filter(e => e.stats.hp > 0);
         else if (skill.target === "SingleEnemy") {
            const aliveEnemies = newEnemies.filter(e => e.stats.hp > 0);
            if (aliveEnemies.length > 0) targets = [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]];
         } else if (skill.target === "SingleAlly") {
            const aliveAllies = newPlayers.filter(a => a.stats.hp > 0);
            if (aliveAllies.length > 0) targets = [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]];
         } else if (skill.target === "AllAllies") targets = newPlayers.filter(a => a.stats.hp > 0);
         else if (skill.target === "Self") targets = [p];

         if (targets.length > 0) {
            const fakeState = { playerParty: newPlayers, enemyParty: newEnemies, turnQueue: [], activeUnit: p, logs: [], damageDealt: damageDealtRef.current };
            setAttackingUnitId(p.uid);
            setTimeout(() => setAttackingUnitId(null), 500);

            skill.execute(p, targets, fakeState, addLog, stateRef.current.addFloatText, stateRef.current.playEffect);
            
            if (skill.type === "Attack") playNormalAttackSound();
            else if (skill.type === "Skill1") playElementalSkillSound();
            else playUltimateBurstSound();

            if (skill.type !== "Attack" && onSkillUse) onSkillUse();

            if (skill.cost > 0) p.cooldowns[skill.id] = skill.cost;
            Object.keys(p.cooldowns).forEach(k => {
               if (k !== skill.id && p.cooldowns[k] > 0) p.cooldowns[k]--;
            });

            p.atb = 0;
            setActiveUnitId(null);
            setSelectedSkill(null);
            // hasActive remains true to prevent enemy from attacking immediately
         }
      }

      if (!hasActive) {
        // ATB Tick for Enemies
        newEnemies = newEnemies.map(e => {
          if (e.stats.hp <= 0) return e;

          // Process periodic DOTs before they gain ATB or take turn
          const modifiedE = { ...e };
          
          if (modifiedE.atb >= 100) {
            // Check for TRAPS first
            if (modifiedE.buffs.trapStacks && modifiedE.buffs.trapStacks > 0) {
              const miner = newPlayers.find(p => p.id === 'claymore');
              const source = miner || modifiedE; // Fallback to self if miner gone
              
              const fakeState = { 
                playerParty: newPlayers, 
                enemyParty: newEnemies, 
                turnQueue: [], 
                activeUnit: source, 
                logs: [], 
                damageDealt: damageDealtRef.current 
              };

              // Trigger explosion
              dealDamage(source, modifiedE, 2.0, "Geo", addLog, stateRef.current.addFloatText, stateRef.current.playEffect, 1, fakeState);
              
              modifiedE.atb = 0;
              modifiedE.buffs.trapStacks--;
              
              if (stateRef.current.addFloatText) {
                stateRef.current.addFloatText(modifiedE.uid, "💥 ПЕРЕХВАТ!", "text-orange-500 font-extrabold");
              }
              
              return modifiedE; // Skip turn
            }

            // Enemy Turn Execute!
            if (modifiedE.buffs.thorns && modifiedE.buffs.thorns > 0) {
               const dmg = modifiedE.buffs.thorns * 200; // base thorn dmg
               modifiedE.stats.hp = Math.max(0, modifiedE.stats.hp - Math.floor(dmg));
               if (stateRef.current.addFloatText) stateRef.current.addFloatText(modifiedE.uid, `-${Math.floor(dmg)}`, 'text-emerald-400');
               Math.random() > 0.5 && stateRef.current.playEffect(modifiedE.uid, 'hit');
            }

            if (modifiedE.stats.hp <= 0) return modifiedE; // Died to DOT

            modifiedE.atb = 0;

            if (modifiedE.buffs.isolationMark && modifiedE.buffs.isolationMark > 0) {
               modifiedE.buffs.isolationMark--;
            }

            // Pick random alive player
            const alivePlayers = newPlayers.filter(p => p.stats.hp > 0);
            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            
            if (target) {
               // Execute random skill (currently just 1)
               const skill = modifiedE.skills[0];
               const fakeState = { playerParty: newPlayers, enemyParty: newEnemies, turnQueue: [], activeUnit: modifiedE, logs: [], damageDealt: damageDealtRef.current };
               
               // Visual jump for enemy
               setAttackingUnitId(modifiedE.uid);
               setTimeout(() => setAttackingUnitId(null), 500);

               skill.execute(modifiedE, [target], fakeState, addLog, stateRef.current.addFloatText, stateRef.current.playEffect);
               playNormalAttackSound();
            }
          } else {
             modifiedE.atb = Math.min(100, modifiedE.atb + modifiedE.stats.spd * 0.05);
          }
          return modifiedE;
        });
      }

      setPlayers(newPlayers);
      setEnemies(newEnemies);
      
    }, 100); // 10 ticks per second

    return () => clearInterval(tick);
  }, [onDefeat, onVictory]);

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleTargetSelect = (target: Combatant, isPlayerParty: boolean) => {
    if (!selectedSkill || !activeUnitId) return;
    const activeUnit = players.find(p => p.id === activeUnitId);
    if (!activeUnit) return;

    // Validate target
    let targets: Combatant[] = [];
    if (selectedSkill.target === "SingleEnemy" && !isPlayerParty) targets = [target];
    if (selectedSkill.target === "AllEnemies") targets = enemies.filter(e => e.stats.hp > 0);
    if (selectedSkill.target === "SingleAlly" && isPlayerParty) targets = [target];
    if (selectedSkill.target === "AllAllies") targets = players.filter(p => p.stats.hp > 0);
    if (selectedSkill.target === "Self" && target.id === activeUnitId) targets = [activeUnit];

    if (targets.length === 0) return; // Invalid target clicked
    
    // Animate Attacker
    setAttackingUnitId(activeUnit.uid);
    setTimeout(() => setAttackingUnitId(null), 600);

    // Execute
    const fakeState = { playerParty: players, enemyParty: enemies, turnQueue: [], activeUnit: activeUnit, logs: [], damageDealt: damageDealtRef.current };
    selectedSkill.execute(activeUnit, targets, fakeState, addLog, addFloatText, playEffect);
    
    // Play sound matching skill type
    if (selectedSkill.type === "Attack") {
      playNormalAttackSound();
    } else if (selectedSkill.type === "Skill1") {
      playElementalSkillSound();
    } else {
      playUltimateBurstSound();
    }

    if (selectedSkill.type !== "Attack" && onSkillUse) {
       onSkillUse();
    }
    
    // Manage Cooldowns (Cost)
    if(selectedSkill.cost > 0) {
        activeUnit.cooldowns[selectedSkill.id] = selectedSkill.cost;
    }
    
    // Reduce cooldowns for other skills
    Object.keys(activeUnit.cooldowns).forEach(k => {
       if(k !== selectedSkill.id && activeUnit.cooldowns[k] > 0) {
           activeUnit.cooldowns[k]--;
       }
    });

    // Reset ATB and clear active state
    activeUnit.atb = 0;
    
    // Force React to deep update arrays
    setPlayers([...players]);
    setEnemies([...enemies]);
    
    setSelectedSkill(null);
    setActiveUnitId(null);
  };

  const renderUnit = (unit: Combatant, isPlayer: boolean) => {
    const isActive = unit.id === activeUnitId;
    const isAttacking = unit.uid === attackingUnitId;
    const isTargetable = selectedSkill && (
      (selectedSkill.target === "SingleEnemy" && !isPlayer) ||
      (selectedSkill.target === "AllEnemies" && !isPlayer) ||
      (selectedSkill.target === "SingleAlly" && isPlayer) ||
      (selectedSkill.target === "AllAllies" && isPlayer) ||
      (selectedSkill.target === "Self" && isActive)
    );
    const isDead = unit.stats.hp <= 0;
    const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;

    return (
      <motion.div 
        key={unit.uid}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: isActive ? 1.05 : 1, 
          y: isAttacking ? (isPlayer ? -40 : 40) : 0,
          x: isAttacking ? (isPlayer ? 20 : -20) : 0,
          rotate: isAttacking ? (isPlayer ? 5 : -5) : 0,
          zIndex: isAttacking || isActive ? 50 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        onClick={() => !isDead && handleTargetSelect(unit, isPlayer)}
        className={cn(
          "relative flex flex-col p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer flex-1 min-w-[65px] sm:min-w-[70px] max-w-[85px] sm:max-w-[120px] shadow-lg group",
          unit.color,
          isActive ? "ring-2 sm:ring-4 ring-yellow-400 ring-offset-2 sm:ring-offset-4 ring-offset-gray-950 border-white shadow-[0_0_25px_rgba(250,204,21,0.4)]" : "border-white/10 opacity-90",
          isDead ? "opacity-30 grayscale cursor-not-allowed contrast-75 brightness-50" : "hover:scale-105 hover:opacity-100",
          isTargetable && !isDead ? "animate-pulse cursor-crosshair border-white ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
        )}
      >
        {/* Background Image Portrait */}
        {unit.image && (
          <div className="absolute inset-0 z-0 opacity-50 group-hover:opacity-70 transition-opacity rounded-[10px] overflow-hidden">
            <img src={unit.image} alt={unit.name} className={cn("w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700", unit.name.includes("БОСС") && "brightness-125 contrast-125")} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
            {unit.name.includes("БОСС") && <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay animate-pulse" />}
          </div>
        )}

        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-[100]"
          >
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_12px_white] animate-pulse", unit.name.includes("БОСС") ? "bg-red-500" : "bg-yellow-400")} />
            <div className={cn("text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full tracking-widest drop-shadow-lg whitespace-nowrap shadow-2xl", unit.name.includes("БОСС") ? "bg-red-600" : "bg-yellow-500")}>
              {unit.name.includes("БОСС") ? "БОСС" : "Ходит"}
            </div>
          </motion.div>
        )}

        <div className={cn(
          "relative z-10 text-white font-black text-[10px] sm:text-xs uppercase tracking-tight text-center truncate mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          unit.name.includes("БОСС") && "text-red-400 sm:text-sm"
        )}>
          {unit.name}
        </div>
        
        {/* Buff Icons & Aura */}
        <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 items-end z-30">
           <AnimatePresence>
             {unit.aura && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-[11px] text-white font-black rounded-lg border-2 border-white/40 uppercase shadow-lg",
                    unit.aura === "Hydro" ? "bg-blue-600" :
                    unit.aura === "Pyro" ? "bg-red-600" :
                    unit.aura === "Dendro" ? "bg-green-600" :
                    unit.aura === "Electro" ? "bg-purple-600" :
                    unit.aura === "Cryo" ? "bg-cyan-500" :
                    unit.aura === "Geo" ? "bg-orange-600" : "bg-gray-500"
                  )}
                >
                  {unit.aura.substring(0, 1)}
                </motion.div>
             )}
           </AnimatePresence>
           <div className="flex gap-0.5 flex-wrap justify-end max-w-[40px]">
             {unit.buffs.duelMark > 0 && <div className="absolute -top-3 sm:-top-5 -right-3 text-lg sm:text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,1)] animate-bounce font-black text-red-500 z-50">🎯</div>}
             {unit.buffs.shield > 0 && <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-300 drop-shadow-md" />}
             {unit.buffs.puppets > 0 && <div className="text-[8px] bg-red-700 text-white rounded-sm px-1 border border-white/20">🎭{unit.buffs.puppets}</div>}
             {unit.buffs.frenzyStacks > 0 && <div className="text-[8px] bg-amber-600 text-white rounded-sm px-1 border border-white/20">🔥{unit.buffs.frenzyStacks}</div>}
             {unit.buffs.joyStacks > 0 && <div className="text-[8px] bg-purple-600 text-white rounded-sm px-1 border border-white/20">✨{unit.buffs.joyStacks}</div>}
             {unit.buffs.thorns > 0 && <div className="text-[8px] bg-emerald-700 text-white rounded-sm px-1 border border-white/20">🌿{unit.buffs.thorns}</div>}
             {unit.buffs.roseEmbers > 0 && <div className="text-[8px] bg-rose-700 text-white rounded-sm px-1 border border-white/20">🌹{unit.buffs.roseEmbers}</div>}
             {unit.buffs.trapStacks > 0 && <div className="text-[8px] bg-orange-700 text-white rounded-sm px-1 border border-white/20">💣{unit.buffs.trapStacks}</div>}
             {unit.buffs.isolationMark > 0 && <div className="text-[8px] bg-purple-600 text-white rounded-sm px-1 border border-purple-400">🎯{unit.buffs.isolationMark}</div>}
           </div>
        </div>

        {/* HP Bar */}
        <div className="relative z-10 w-full bg-black/60 h-2.5 sm:h-3 rounded-full mt-auto overflow-hidden border border-white/10 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            className={cn(
              "h-full transition-all duration-300 relative rounded-full",
              hpPercent > 50 ? "bg-gradient-to-r from-green-600 to-green-400" : hpPercent > 20 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-red-400"
            )}
          >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20" />
          </motion.div>
        </div>
        <div className="relative z-10 flex justify-between items-center text-[7px] sm:text-[9px] mt-1 font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] uppercase">
           <span className="opacity-70">HP</span>
           <span className="tabular-nums">
             {unit.stats.maxHp >= 1000000 
               ? `${(unit.stats.hp / 1000000).toFixed(2)}M / ${(unit.stats.maxHp / 1000000).toFixed(2)}M`
               : unit.stats.maxHp >= 10000 
                 ? `${(unit.stats.hp / 1000).toFixed(1)}k / ${(unit.stats.maxHp / 1000).toFixed(1)}k`
                 : `${Math.floor(unit.stats.hp)} / ${unit.stats.maxHp}`
             }
           </span>
        </div>
        
        {/* ATB Bar */}
        <div className="relative z-10 w-full bg-black/40 h-1 sm:h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="bg-yellow-400 h-full shadow-[0_0_8px_rgba(250,204,21,0.6)] rounded-full" 
            style={{ width: `${unit.atb}%` }} 
          />
        </div>

        {/* Visual Effects */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-40 overflow-visible">
           {visualEffects.filter(ve => ve.targetUid === unit.uid).map((ve) => (
              <React.Fragment key={ve.id}>
                {ve.type === "Physical" && <motion.div initial={{scale:0, rotate: -45}} animate={{scale:[0, 2, 0], opacity:[1,1,0]}} transition={{duration: 0.4}} className="absolute text-4xl">⚔️</motion.div>}
                {ve.type === "Hydro" && <motion.div initial={{scale:0}} animate={{scale:[0, 3, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-blue-500 text-6xl opacity-80 blur-[1px]">🌊</motion.div>}
                {ve.type === "Pyro" && <motion.div initial={{scale:0}} animate={{scale:[0.5, 3.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-red-500 text-7xl drop-shadow-[0_0_20px_rgba(239,68,68,1)]">🔥</motion.div>}
                {ve.type === "Electro" && <motion.div initial={{scale:0, rotate: 15}} animate={{scale:[1, 4.5, 1.5], opacity:[0,1,0]}} transition={{duration: 0.4}} className="absolute text-purple-400 text-7xl drop-shadow-[0_0_25px_rgba(168,85,247,1)] filter brightness-125">⚡</motion.div>}
                {ve.type === "Cryo" && <motion.div initial={{scale:0, rotate: -25}} animate={{scale:[1, 3.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-cyan-200 text-6xl drop-shadow-[0_0_25px_rgba(34,211,238,1)]">❄️</motion.div>}
                {ve.type === "Dendro" && <motion.div initial={{scale:0}} animate={{scale:[0, 2.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-green-400 text-6xl">🌿</motion.div>}
                {ve.type === "Geo" && <motion.div initial={{y:-100, opacity:0}} animate={{y:0, opacity:[0, 1, 0], scale:[1,1, 2]}} transition={{duration: 0.6}} className="absolute text-orange-500 text-8xl drop-shadow-[0_0_20px_rgba(234,179,8,0.9)]">☄️</motion.div>}
                
                {/* Special Character Effects */}
                {ve.type === "selina_rose" && (
                  <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: [0, 4, 3, 0], rotate: [180, 0, -10, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.2 }} className="absolute flex items-center justify-center">
                    <span className="text-8xl drop-shadow-[0_0_20px_rgba(225,29,72,0.8)] filter hue-rotate-15">🌹</span>
                    <motion.div animate={{ scale: [1, 2], opacity: [0, 0.5, 0] }} transition={{ duration: 0.6, repeat: 2 }} className="absolute w-32 h-32 rounded-full border-4 border-rose-500/30 blur-sm" />
                  </motion.div>
                )}
                {ve.type === "asher_nature" && (
                   <motion.div className="absolute flex items-center justify-center">
                      <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: [0, 5, 0], y: [50, 0, -20] }} transition={{ duration: 0.8 }} className="absolute text-8xl grayscale brightness-150 contrast-125 opacity-20">⚒️</motion.div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 4, 0], rotate: 360 }} transition={{ duration: 1 }} className="absolute text-7xl">🌳</motion.div>
                      {[...Array(4)].map((_, i) => (
                        <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: (Math.random() - 0.5) * 180, y: (Math.random() - 0.5) * 180, opacity: [1, 0], scale: [1, 0] }} transition={{ duration: 0.6, delay: i * 0.05 }} className="absolute text-xl">🌱</motion.div>
                      ))}
                   </motion.div>
                )}
                {ve.type === "krona_ice" && (
                   <motion.div className="absolute flex items-center justify-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 6, 4.5, 0], rotate: 45 }} transition={{ duration: 1 }} className="absolute text-8xl drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">❄️</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0], scale: [1, 2] }} transition={{ duration: 0.5 }} className="absolute w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl" />
                      {[...Array(6)].map((_, i) => (
                        <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 220, opacity: [1, 0], scale: [1.2, 0.5], rotate: 180 }} transition={{ duration: 0.7, delay: i * 0.05 }} className="absolute text-lg">💎</motion.div>
                      ))}
                   </motion.div>
                )}
                {ve.type === "ultimate_aoe" && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 10, 15], opacity: [0, 0.4, 0] }} transition={{ duration: 1 }} className="absolute w-20 h-20 bg-white rounded-full blur-[40px] z-[60]" />
                )}

                {ve.type === "heal" && <motion.div initial={{y:20, opacity:0}} animate={{y:-50, opacity:[0, 1, 0]}} transition={{duration: 0.8}} className="absolute text-6xl">💚</motion.div>}
                {ve.type === "shield" && <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:2.5, opacity:[0, 0.8, 0]}} transition={{duration: 0.5}} className="absolute text-emerald-300 text-7xl opacity-50">🛡️</motion.div>}
                {ve.type === "buff" && <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:2, opacity:[0, 1, 0]}} transition={{duration: 0.6}} className="absolute text-yellow-300 text-6xl">✨</motion.div>}
                {ve.type === "hit" && <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }} transition={{ duration: 0.3 }} className="absolute text-6xl">💥</motion.div>}
              </React.Fragment>
           ))}
        </div>

        {/* Floating texts */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
           <AnimatePresence>
            {floatingTexts.filter(ft => ft.targetUid === unit.uid).map((ft) => (
               <motion.div 
                  key={ft.id} 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.9], y: [10, -20, -40, -60] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, times: [0, 0.1, 0.8, 1], ease: "easeOut" }}
                  className={cn("absolute font-black text-lg sm:text-2xl drop-shadow-[0_0_12px_rgba(0,0,0,1)] whitespace-nowrap", ft.color)} 
                  style={{ textShadow: "0 4px 6px rgba(0,0,0,1), 0 0 4px rgba(0,0,0,1)" }}>
                  {ft.text}
               </motion.div>
            ))}
           </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const activePlayer = players.find(p => p.id === activeUnitId);
  const containerVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      animate={shake ? "shake" : ""}
      className="w-full max-w-6xl h-[100dvh] md:h-[85dvh] flex flex-col bg-gray-950 md:rounded-3xl overflow-hidden md:border-8 border-gray-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] font-sans text-gray-200 ring-1 ring-white/10"
    >
      
      {/* Top Half: Arena */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-4 sm:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Background Decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[2px] border-white/20 rotate-45" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[1px] border-white/10 -rotate-45" />
        </div>

        {/* Audio Mute & Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
          <div className="flex gap-2">
            <button 
              onClick={toggleMute}
              className="group relative bg-gray-900/40 backdrop-blur-md hover:bg-white/10 border border-white/5 p-2 sm:py-2 sm:px-3 rounded-xl sm:rounded-2xl text-white/50 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs font-bold"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline uppercase tracking-tighter">Звук</span>
            </button>
            <button 
              onClick={() => setIsAutoBattle(!isAutoBattle)}
              className={cn("group relative bg-gray-900/40 backdrop-blur-md hover:bg-white/10 border p-2 sm:py-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-2 text-xs font-bold", isAutoBattle ? "text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10" : "text-white/50 hover:text-white border-white/5")}
            >
              <Sword className={cn("w-4 h-4", isAutoBattle ? "opacity-100" : "opacity-50")} />
              <span className="hidden sm:inline uppercase tracking-tighter">Авто</span>
            </button>
          </div>

          <div className="flex flex-col items-end gap-1 scale-90 sm:scale-100 origin-right">
             {stageTitle ? (
               <div className="bg-fuchsia-950/80 border border-fuchsia-500/50 backdrop-blur px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                 {stageTitle}
               </div>
             ) : (
               <>
                 <div className="text-[8px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Волна {currentWave + 1} из {enemyWaves.length}</div>
                 <div className="bg-white/5 border border-white/10 backdrop-blur px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold text-white/80">Узел-7</div>
               </>
             )}
          </div>
        </div>

        {/* Enemies Row */}
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-8 mb-6 sm:mb-16 mt-14 sm:mt-20 w-full overflow-visible px-2 sm:px-4">
          <AnimatePresence>
            {enemies.map(e => renderUnit(e, false))}
          </AnimatePresence>
        </div>

        {/* Players Row */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-6 mb-2 sm:mb-4 z-10 w-full overflow-visible px-2 sm:px-4">
          <AnimatePresence>
            {players.map(p => renderUnit(p, true))}
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Half: Command Menu UI */}
      <div className="flex flex-col md:flex-row h-auto md:h-56 bg-[#0a0c10] border-t border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] shrink-0">
        
        {/* Subtle glow behind active player panel */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Unit Info & Portrait */}
        <div className="w-full md:w-1/3 flex border-b md:border-b-0 md:border-r border-white/5 p-3 sm:p-6 shrink-0 relative bg-gradient-to-r from-black/20 to-transparent">
            {activePlayer ? (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-row md:flex-col h-full w-full items-center md:items-start justify-between md:justify-center gap-3"
                >
                    <div className="flex items-center md:items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-xl sm:text-2xl shadow-inner">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400/80" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tighter uppercase drop-shadow-sm leading-none">{activePlayer.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                          <div className={cn("px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase text-white/90 shadow-sm", activePlayer.color)}>
                            {activePlayer.element}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:grid md:grid-cols-2 gap-2 mt-0 md:mt-2">
                        <div className="bg-white/5 border border-white/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-2 md:justify-between">
                          <span className="text-white/40 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">ATK</span>
                          <span className="text-xs sm:text-sm font-black text-white tabular-nums">
                            {activePlayer.buffs.atk ? <span className="text-green-400">{activePlayer.stats.atk + activePlayer.buffs.atk}</span> : activePlayer.stats.atk}
                          </span>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-white/20 animate-spin" />
                    <div className="text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">Ожидание...</div>
                </div>
            )}
        </div>

        {/* Skills Panel */}
        <div className="w-full md:w-2/3 p-4 sm:p-6 min-h-[160px] md:min-h-0 md:overflow-y-auto relative bg-gradient-to-l from-black/40 via-transparent to-transparent">
            {activePlayer ? (
                <div className="h-full flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-white/30 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Выберите действие
                       </h3>
                       <div className="flex gap-1">
                          <div className="w-1 h-1 rounded-full bg-yellow-400 animate-ping" />
                       </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 overflow-visible">
                        {activePlayer.skills.map((skill, idx) => {
                            const isCoolingDown = (activePlayer.cooldowns[skill.id] || 0) > 0;
                            const isSelected = selectedSkill?.id === skill.id;
                            
                            const getIcon = () => {
                              if (idx === 0) return <Sword className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />;
                              if (idx === 1) return <Zap className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />;
                              return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />;
                            };

                            const getTheme = () => {
                              if (isSelected) return "border-yellow-400 bg-white/10 text-white shadow-[0_0_20px_rgba(250,204,21,0.2)] scale-[0.98]";
                              if (isCoolingDown) return "bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed text-white/50";
                              return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 active:scale-95 text-white/70 hover:text-white";
                            };

                            return (
                                <button
                                    key={skill.id}
                                    disabled={isCoolingDown}
                                    onClick={() => handleSkillSelect(skill)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 min-h-[56px] sm:min-h-[80px]",
                                        getTheme()
                                    )}
                                >
                                    {getIcon()}
                                    <span className="font-black text-[8px] sm:text-[11px] uppercase tracking-tighter text-center leading-none truncate w-full px-1">
                                      {skill.name}
                                    </span>
                                    {isCoolingDown && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl sm:rounded-2xl">
                                        <span className="text-rose-500 font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                                          {activePlayer.cooldowns[skill.id]}
                                        </span>
                                      </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    <AnimatePresence>
                      {selectedSkill && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-2xl flex gap-3 items-center backdrop-blur-sm shadow-xl"
                          >
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4 text-indigo-400 animate-pulse" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                                    Цель: {selectedSkill.target === "AllEnemies" ? "Все враги" :
                                         selectedSkill.target === "AllAllies" ? "Все союзники" :
                                         selectedSkill.target === "Self" ? "На себя" : "Выберите цель"}
                                  </span>
                                </div>
                                <p className="text-white/60 text-[10px] leading-snug mt-0.5 line-clamp-1">{selectedSkill.description}</p>
                              </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="h-full w-full flex flex-col justify-center items-center opacity-20 gap-4">
                    <div className="flex gap-2">
                       {[0,1,2,3].map(i => <div key={i} className="w-1 h-8 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white text-center">
                       Система динамического боя активна
                    </div>
                </div>
            )}
        </div>
      </div>

    </motion.div>
  );
}
