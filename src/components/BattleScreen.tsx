import React, { useState, useEffect, useRef } from 'react';
import { Combatant, BattleState, TargetType, Skill } from '../types';
import { Shovel, Shield, Volume2, VolumeX, Sword, Zap, Sparkles, Target, Info, Activity, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { EffectsOverlay, EffectsOverlayRef } from './EffectsOverlay';
import { WhiteFieldOverlay } from './WhiteFieldOverlay';
import { BattleArenaOverlays } from './battle/BattleArenaOverlays';
import { UnitCard } from './battle/UnitCard';
import { motion, AnimatePresence } from 'motion/react';
import { dealDamage } from '../data';
import { playNormalAttackSound, playElementalSkillSound, playUltimateBurstSound, playVictorySound, getSoundMuteState, setSoundMuteState } from '../lib/sound';

interface BattleScreenProps {
  key?: React.Key;
  playerParty: Combatant[];
  enemyWaves: Combatant[][]; // Changed from enemyParty
  onDefeat: (stats: Record<string, number>) => void;
  onVictory: (stats: Record<string, number>) => void;
  onExit?: () => void;
  onSkillUse?: () => void;
  battleBuff?: string;
  stageTitle?: string;
}

export default function BattleScreen({ playerParty: initialPlayers, enemyWaves, onDefeat, onVictory, onExit, onSkillUse, battleBuff, stageTitle }: BattleScreenProps) {
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
  const [showExitModal, setShowExitModal] = useState(false);

  const damageDealtRef = useRef<Record<string, number>>({});
  const battleStartTimeRef = useRef<number>(Date.now());

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    setSoundMuteState(newState);
  };
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const logsRef = useRef<string[]>(["Бой начался!"]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  const triggerShake = React.useCallback(() => {
    const el = arenaRef.current;
    if (el) {
      el.classList.remove('anim-screen-shake');
      void el.offsetWidth;
      el.classList.add('anim-screen-shake');
    }
  }, []);

  // We use a ref for state to avoid dependency cycles in our game loop interval
  const stateRef = useRef({
    players,
    enemies,
    activeUnitId,
    isRunning: true,
    addFloatText: null as any,
    playEffect: null as any,
    damageDealt: damageDealtRef.current,
    effectsRefs: {} as Record<string, EffectsOverlayRef>,
    lastChecksum: 0,
    isAutoBattle: false
  });

  const registerEffectsRef = React.useCallback((uid: string, el: any) => {
    if (el) stateRef.current.effectsRefs[uid] = el;
  }, []);

  const addFloatText = React.useCallback((targetUid: string, text: string, color: string) => {
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].addFloatText(targetUid, text, color);
    }
  }, []);

  const playEffect = React.useCallback((targetUid: string, type: string) => {
    if (type === "shake" || type === "ultimate_aoe") triggerShake();
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].playEffect(targetUid, type);
    }
  }, [triggerShake]);

  useEffect(() => {
    stateRef.current = { 
      ...stateRef.current,
      players, 
      enemies, 
      activeUnitId, 
      isRunning: (!activeUnitId || isAutoBattle) && !showExitModal, 
      addFloatText, 
      playEffect,
      damageDealt: damageDealtRef.current,
      lastChecksum: 0,
      isAutoBattle
    };
  }, [players, enemies, activeUnitId, addFloatText, playEffect, isAutoBattle, showExitModal]);

  const addLog = React.useCallback((msg: string) => {
    logsRef.current.push(msg);
    if (logsRef.current.length > 25) logsRef.current.shift();
  }, []);

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
          setPlayers(prev => prev.map(p => ({
             ...p,
             stats: { ...p.stats, hp: p.stats.maxHp }, // Restore HP fully
             cooldowns: {}, // Reset all skill cooldowns
             atb: Math.min(p.atb, 50) // Reset ATB partially
          })));
          addLog(`Волна ${nextWaveIndex + 1} приближается! ХП восстановлено, навыки готовы!`);
          
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

      const currentChecksum = currPlayers.reduce((sum, p) => sum + p.stats.hp + p.atb, 0) + currEnemies.reduce((sum, e) => sum + e.stats.hp + e.atb, 0);
      if (!stateRef.current.isRunning) {
        if (stateRef.current.lastChecksum !== currentChecksum) {
          setPlayers([...currPlayers]);
          setEnemies([...currEnemies]);
          stateRef.current.lastChecksum = currentChecksum;
        }
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
          
          // --- Farina Turn Start Logic ---
          const farina = currPlayers.find(f => f.id === 'farina');
          if (farina && farina.buffs.whiteField && farina.buffs.whiteField > 0 && farina.stats.hp > 0) {
            const aliveEnemies = newEnemies.filter(e => e.stats.hp > 0);
            if (aliveEnemies.length > 0) {
              const targetEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
              const fakeState = { playerParty: currPlayers, enemyParty: newEnemies, turnQueue: [], activeUnit: p, logs: [], damageDealt: damageDealtRef.current, lastChecksum: 0 };
              const isCryo = targetEnemy.aura === 'Cryo' || targetEnemy.buffs.frozen;
              const mult = isCryo ? 0.8 : 0.4;
              dealDamage(farina, targetEnemy, mult, "Cryo", addLog, stateRef.current.addFloatText, stateRef.current.playEffect, 1, fakeState);
              farina.buffs.whiteField--; // Decrement duration. Wait, maybe duration should be decremented only on Farina's own turn start? The skill says "Пока активно «Белое поле»... на 2 хода". Usually buffs decrement on the caster's turn start. So we won't decrement here, we let the normal turn logic decrement it when Farina moves.
            }
          }

          if (stateRef.current.isAutoBattle) {
            aiPlayerAction = p;
          }
          return p;
        } else if (p.atb < 100) {
          return { ...p, atb: Math.min(100, p.atb + p.stats.spd * 0.0625) };
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
            if (aliveEnemies.length > 0) {
               const dueledEnemy = aliveEnemies.find(e => e.buffs && e.buffs.duelMark);
               if (dueledEnemy) {
                  targets = [dueledEnemy];
               } else {
                  targets = [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]];
               }
            }
         } else if (skill.target === "SingleAlly") {
            const aliveAllies = newPlayers.filter(a => a.stats.hp > 0);
            if (aliveAllies.length > 0) targets = [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]];
         } else if (skill.target === "AllAllies") targets = newPlayers.filter(a => a.stats.hp > 0);
         else if (skill.target === "Self") targets = [p];

         if (targets.length > 0) {
            const fakeState = { playerParty: newPlayers, enemyParty: newEnemies, turnQueue: [], activeUnit: p, logs: [], damageDealt: damageDealtRef.current,
    lastChecksum: 0 };
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

            if (p.id === 'farina' && p.buffs.whiteField && p.buffs.whiteField > 0) {
               p.buffs.whiteField--;
               if (p.buffs.whiteField === 0) {
                  addLog(`Действие «Белого поля» рассеялось.`);
               }
            }

            if (p.buffs.conductionCircuit && p.buffs.conductionCircuit > 0) {
               p.buffs.conductionCircuit--;
            }

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
                damageDealt: damageDealtRef.current,
    lastChecksum: 0 
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

            if (modifiedE.buffs.critOvercool && modifiedE.buffs.critOvercool > 0) {
               modifiedE.buffs.critOvercool--;
            }

            if (modifiedE.buffs.snowDust && modifiedE.buffs.snowDust > 0) {
               modifiedE.buffs.snowDust--;
               if (modifiedE.buffs.snowDust === 0 && stateRef.current.addFloatText) {
                  stateRef.current.addFloatText(modifiedE.uid, "Пыль рассеялась", "text-cyan-200/80 text-xs font-bold");
               }
            }

            // Pick random alive player
            const alivePlayers = newPlayers.filter(p => p.stats.hp > 0);
            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            
            if (target) {
               // Execute random skill (currently just 1)
               const skill = modifiedE.skills[0];
               const fakeState = { playerParty: newPlayers, enemyParty: newEnemies, turnQueue: [], activeUnit: modifiedE, logs: [], damageDealt: damageDealtRef.current,
    lastChecksum: 0 };
               
               // Visual jump for enemy
               setAttackingUnitId(modifiedE.uid);
               setTimeout(() => setAttackingUnitId(null), 500);

               skill.execute(modifiedE, [target], fakeState, addLog, stateRef.current.addFloatText, stateRef.current.playEffect);
               playNormalAttackSound();
            }
          } else {
             modifiedE.atb = Math.min(100, modifiedE.atb + modifiedE.stats.spd * 0.0625);
          }
          return modifiedE;
        });
      }

      setPlayers(newPlayers);
      setEnemies(newEnemies);
      
    }, 125); // 8 ticks per second, throttled for smooth 60fps rendering

    return () => clearInterval(tick);
  }, [onDefeat, onVictory]);

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleTargetSelect = React.useCallback((target: Combatant, isPlayerParty: boolean) => {
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
    const fakeState = { playerParty: players, enemyParty: enemies, turnQueue: [], activeUnit: activeUnit, logs: [], damageDealt: damageDealtRef.current,
    lastChecksum: 0 };
    selectedSkill.execute(activeUnit, targets, fakeState, addLog, addFloatText, playEffect);
    
    // Play sound matching skill type
    if (selectedSkill.type === "Attack") {
      playNormalAttackSound();
    } else if (selectedSkill.type === "Skill1") {
      playElementalSkillSound();
    } else {
      playUltimateBurstSound();
      if (activeUnit.buffs && activeUnit.buffs.noblesse4pc && !activeUnit.isEnemy) {
        players.forEach(p => {
          if (p.stats.hp > 0) {
            p.buffs.atk = (p.buffs.atk || 0) + Math.floor(p.stats.atk * 0.20);
            addFloatText(p.uid, "+20% АТК (Знать)", "text-amber-300 font-bold text-xs");
          }
        });
        addLog(`${activeUnit.name} активирует эффект «Церемонии Древней Знати» (+20% АТК отряду)!`);
      }
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

    if (activeUnit.id === 'farina' && activeUnit.buffs.whiteField && activeUnit.buffs.whiteField > 0) {
       activeUnit.buffs.whiteField--;
       if (activeUnit.buffs.whiteField === 0) {
          addLog(`Действие «Белого поля» рассеялось.`);
       }
    }

    if (activeUnit.buffs.conductionCircuit && activeUnit.buffs.conductionCircuit > 0) {
       activeUnit.buffs.conductionCircuit--;
    }

    // Reset ATB and clear active state
    activeUnit.atb = 0;
    
    // Force React to deep update arrays
    setPlayers([...players]);
    setEnemies([...enemies]);
    
    setSelectedSkill(null);
    setActiveUnitId(null);
  }, [selectedSkill, activeUnitId, players, enemies, addLog, addFloatText, playEffect, onSkillUse]);

  const hasRavenInParty = players.some(p => p.id === 'raven' && p.stats.hp > 0);

  // Memoized primitives for BattleArenaOverlays
  const circuitAlly = players.find(p => p.stats.hp > 0 && (p.buffs.conductionCircuit ?? 0) > 0);
  const circuitTurns = circuitAlly?.buffs.conductionCircuit ?? 0;
  const isPermafrostActive = enemies.some(e => e.stats.hp > 0 && (e.buffs.critOvercool ?? 0) > 0);
  const aveline = players.find(p => p.id === 'aveline' && p.stats.hp > 0);
  const gardenTurns = aveline?.buffs.avelineGardenTurns ?? 0;
  const flowerTurns = aveline?.buffs.avelineGreatFlowerTurns ?? 0;
  const elementalFlowers = aveline?.buffs.avelineElementalFlowers ?? 0;
  const isGardenActive = gardenTurns > 0;
  const kairen = players.find(p => p.id === 'kairen' && p.stats.hp > 0);
  const winterTurns = kairen?.buffs.kairenWinterTurns ?? 0;
  const isWinterActive = winterTurns > 0;
  const kairenShards = kairen?.buffs.kairenShards ?? 0;
  const kairenMaxShards = (kairen?.constellation ?? 0) >= 5 && winterTurns > 0 ? 7 : 5;
  const isDuelActive = enemies.some(e => e.stats.hp > 0 && (e.buffs.duelMark ?? 0) > 0);
  const cleanTargetCount = hasRavenInParty ? enemies.filter(e => e.stats.hp > 0 && !(
    (e.buffs.thorns ?? 0) > 0 || 
    (e.buffs.poison ?? 0) > 0 || 
    (e.buffs.frozen ?? 0) > 0 || 
    (e.buffs.burn ?? 0) > 0 || 
    (e.buffs.mute ?? 0) > 0 || 
    (e.buffs.resDown ?? 0) > 0 || 
    (e.buffs.bleed ?? 0) > 0 || 
    (e.buffs.duelMark ?? 0) > 0 || 
    (e.buffs.spd ?? 0) < 0 || 
    (e.buffs.def ?? 0) < 0 || 
    (e.buffs.atk ?? 0) < 0
  )).length : 0;

  const activePlayer = players.find(p => p.id === activeUnitId);
  const farinaUnit = players.find(p => p.id === 'farina');
  const whiteFieldDuration = (farinaUnit && farinaUnit.stats.hp > 0) ? (farinaUnit.buffs.whiteField ?? 0) : 0;
  const isWhiteFieldActive = whiteFieldDuration > 0;

  return (
    <div 
      className="w-full max-w-6xl h-[100dvh] md:h-[85dvh] flex flex-col bg-[#0a0a0a] md:rounded-3xl overflow-hidden md:border-8 border-white/5 shadow-2xl font-sans text-white/90 ring-1 ring-white/10"
    >
      
      {/* Top Half: Arena */}
      <div ref={arenaRef} className="flex-1 relative bg-gradient-to-br from-[#111111] via-[#0a0a0a] to-[#111111] p-4 sm:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* White Field Battle Visual Effect (Белое поле Фарины) */}
        <WhiteFieldOverlay active={isWhiteFieldActive} duration={whiteFieldDuration} />

        {/* Dynamic Character Arena Overlays (Вольта, Снежана, Авелин, Кайрен, Сайрус, Рейвен) */}
        <BattleArenaOverlays 
          circuitTurns={circuitTurns}
          isPermafrostActive={isPermafrostActive}
          isGardenActive={isGardenActive}
          flowerTurns={flowerTurns}
          gardenTurns={gardenTurns}
          elementalFlowers={elementalFlowers}
          isWinterActive={isWinterActive}
          winterTurns={winterTurns}
          kairenShards={kairenShards}
          kairenMaxShards={kairenMaxShards}
          isDuelActive={isDuelActive}
          hasRavenActive={hasRavenInParty}
          cleanTargetCount={cleanTargetCount}
        />

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
              className="group relative bg-[#111111]/40  hover:bg-white/10 border border-white/5 p-2 sm:py-2 sm:px-3 rounded-2xl sm:rounded-3xl text-white/50 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs font-bold backdrop-blur-md"
              title="Звук"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline uppercase tracking-tighter">Звук</span>
            </button>
            <button 
              onClick={() => setIsAutoBattle(!isAutoBattle)}
              className={cn("group relative bg-[#111111]/40  hover:bg-white/10 border p-2 sm:py-2 sm:px-3 rounded-2xl sm:rounded-3xl transition-all duration-300 flex items-center gap-2 text-xs font-bold backdrop-blur-md", isAutoBattle ? "text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10" : "text-white/50 hover:text-white border-white/5")}
              title="Автобой"
            >
              <Sword className={cn("w-4 h-4", isAutoBattle ? "opacity-100" : "opacity-50")} />
              <span className="hidden sm:inline uppercase tracking-tighter">Авто</span>
            </button>
            {onExit && (
              <button 
                onClick={() => setShowExitModal(true)}
                className="group relative bg-[#111111]/40 hover:bg-red-500/15 border border-white/5 hover:border-red-500/30 p-2 sm:py-2 sm:px-3 rounded-2xl sm:rounded-3xl text-white/50 hover:text-red-400 transition-all duration-300 flex items-center gap-2 text-xs font-bold backdrop-blur-md"
                title="Покинуть бой"
              >
                <LogOut className="w-4 h-4 text-red-400/80 group-hover:text-red-400" />
                <span className="hidden sm:inline uppercase tracking-tighter">Выход</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 scale-90 sm:scale-100 origin-right">
             {stageTitle ? (
               <div className="bg-fuchsia-950/80 border border-fuchsia-500/50 px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-fuchsia-300 shadow-sm flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                 {stageTitle}
               </div>
             ) : (
               <>
                 <div className="text-[8px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Волна {currentWave + 1} из {enemyWaves.length}</div>
                 <div className="bg-white/5 border border-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold text-white/80">Узел-7</div>
               </>
             )}
          </div>
        </div>

        <div className="flex flex-col flex-1 justify-center gap-8 sm:gap-14 mt-12 sm:mt-10">
          {/* Enemies Row */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-6 w-full overflow-visible px-2 sm:px-4">
            {enemies.map(e => (
              <UnitCard
                key={e.uid}
                unit={e}
                isPlayer={false}
                isActive={e.id === activeUnitId}
                isAttacking={e.uid === attackingUnitId}
                isTargetable={Boolean(selectedSkill && (
                  (selectedSkill.target === "SingleEnemy") ||
                  (selectedSkill.target === "AllEnemies")
                ))}
                hasRavenInParty={hasRavenInParty}
                onSelect={handleTargetSelect}
                onRegisterRef={registerEffectsRef}
              />
            ))}
          </div>

          {/* Players Row */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-6 z-10 w-full overflow-visible px-2 sm:px-4">
            {players.map(p => (
              <UnitCard
                key={p.uid}
                unit={p}
                isPlayer={true}
                isActive={p.id === activeUnitId}
                isAttacking={p.uid === attackingUnitId}
                isTargetable={Boolean(selectedSkill && (
                  (selectedSkill.target === "SingleAlly") ||
                  (selectedSkill.target === "AllAllies") ||
                  (selectedSkill.target === "Self" && p.id === activeUnitId)
                ))}
                hasRavenInParty={hasRavenInParty}
                onSelect={handleTargetSelect}
                onRegisterRef={registerEffectsRef}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Half: Command Menu UI */}
      <div className="flex flex-col md:flex-row h-auto md:h-48 bg-[#0a0c10] border-t border-white/10 relative overflow-hidden  shadow-2xl shrink-0">
        
        {/* Subtle glow behind active player panel */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-indigo-500/5  pointer-events-none" />

        {/* Unit Info & Portrait */}
        <div className="w-full md:w-1/3 flex border-b md:border-b-0 md:border-r border-white/5 p-3 sm:p-4 shrink-0 relative bg-gradient-to-r from-black/20 to-transparent">
            {activePlayer ? (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-row md:flex-col h-full w-full items-center md:items-start justify-between md:justify-center gap-3"
                >
                    <div className="flex items-center md:items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 text-xl sm:text-2xl shadow-inner">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400/80" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tighter uppercase shadow-sm leading-none">{activePlayer.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                          <div className={cn("px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase text-white/90 shadow-sm", activePlayer.color)}>
                            {activePlayer.element}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full gap-2 mt-1 md:mt-3">
                        <div className="bg-[#111111] border border-white/10 px-3 py-2 rounded-2xl flex items-center justify-between flex-1">
                          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Атака (ATK)</span>
                          <span className="text-sm sm:text-base font-black text-white tabular-nums">
                            {activePlayer.buffs.atk ? <span className="text-emerald-400">{activePlayer.stats.atk + activePlayer.buffs.atk}</span> : activePlayer.stats.atk}
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
        <div className="w-full md:w-2/3 p-3 sm:p-4 min-h-[140px] md:min-h-0 md:overflow-y-auto relative bg-gradient-to-l from-black/40 via-transparent to-transparent">
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
                              if (isSelected) return "border-yellow-400 bg-white/10 text-white shadow-sm scale-[0.98]";
                              if (isCoolingDown) return "bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed text-white/50";
                              return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 active:scale-95 text-white/70 hover:text-white";
                            };

                            return (
                                <button
                                    key={skill.id}
                                    disabled={isCoolingDown}
                                    onClick={() => handleSkillSelect(skill)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 min-h-[64px] sm:min-h-[90px]",
                                        getTheme()
                                    )}
                                >
                                    {getIcon()}
                                    <span className="font-black text-[9px] sm:text-[11px] uppercase tracking-tighter text-center leading-tight whitespace-normal break-words line-clamp-2 w-full px-1">
                                      {skill.name}
                                    </span>
                                    {isCoolingDown && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl sm:rounded-3xl">
                                        <span className="text-rose-500 font-black text-xl sm:text-2xl ">
                                          {activePlayer.cooldowns[skill.id]}
                                        </span>
                                      </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    
                      {selectedSkill && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-3xl flex gap-3 items-center backdrop- shadow-xl"
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

      {/* Exit Battle Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                Покинуть бой?
              </h3>
              <p className="text-xs text-white/50 mt-1.5 font-mono leading-relaxed">
                Текущий прогресс сражения будет сброшен, награды не будут получены.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 px-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-xs font-bold uppercase tracking-wider transition-all"
              >
                Остаться
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  if (onExit) onExit();
                }}
                className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-950/50 active:scale-95"
              >
                Покинуть
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
