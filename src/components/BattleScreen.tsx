import React, { useState, useEffect, useRef } from 'react';
import { Combatant, BattleState, TargetType, Skill } from '../types';
import { Shovel, Shield, Volume2, VolumeX, Sword, Zap, Sparkles, Target, Info, Activity, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { EffectsOverlay, EffectsOverlayRef } from './EffectsOverlay';
import { WhiteFieldOverlay } from './WhiteFieldOverlay';
import { BattleArenaOverlays } from './battle/BattleArenaOverlays';
import { UltimateAftermathField, UltimateAftermathData } from './battle/UltimateAftermathField';
import { UnitCard } from './battle/UnitCard';
import { UltimateCutsceneOverlay, UltimateCutsceneData, ULTIMATE_CHARACTER_CONFIGS } from './battle/UltimateCutsceneOverlay';
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
  const totalCutsceneTimeRef = useRef<number>(0);
  const cutsceneStartTimeRef = useRef<number | null>(null);

  const getBattleDurationSeconds = React.useCallback(() => {
    const now = Date.now();
    let currentCutsceneElapsed = 0;
    if (cutsceneStartTimeRef.current !== null) {
      currentCutsceneElapsed = now - cutsceneStartTimeRef.current;
    }
    const totalCutscenes = totalCutsceneTimeRef.current + currentCutsceneElapsed;
    const rawElapsed = now - battleStartTimeRef.current;
    const netElapsed = Math.max(500, rawElapsed - totalCutscenes);
    return Math.max(0.5, netElapsed / 1000);
  }, []);

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    setSoundMuteState(newState);
  };
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const logsRef = useRef<string[]>(["Бой начался!"]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeCutscene, setActiveCutscene] = useState<UltimateCutsceneData | null>(null);
  const [ultimateAftermath, setUltimateAftermath] = useState<UltimateAftermathData | null>(null);
  const aftermathTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUltimateRef = useRef<(() => void) | null>(null);
  const pendingAftermathRef = useRef<{
    charId: string;
    charName: string;
    element: string;
    skillName: string;
    title: string;
  } | null>(null);

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

  const triggerAftermath = React.useCallback((charId: string, charName: string, element: string, skillName: string, title: string) => {
    if (aftermathTimeoutRef.current) clearTimeout(aftermathTimeoutRef.current);
    triggerShake();
    setUltimateAftermath({
      charId,
      charName,
      element,
      skillName,
      title,
      timestamp: Date.now()
    });
    aftermathTimeoutRef.current = setTimeout(() => {
      setUltimateAftermath(null);
    }, 1000);
  }, [triggerShake]);

  const handleCutsceneImpact = React.useCallback(() => {
    if (pendingUltimateRef.current) {
      pendingUltimateRef.current();
      pendingUltimateRef.current = null;
    }
  }, []);

  const handleCutsceneComplete = React.useCallback(() => {
    if (cutsceneStartTimeRef.current !== null) {
      totalCutsceneTimeRef.current += (Date.now() - cutsceneStartTimeRef.current);
      cutsceneStartTimeRef.current = null;
    }
    if (pendingUltimateRef.current) {
      pendingUltimateRef.current();
      pendingUltimateRef.current = null;
    }
    setActiveCutscene(null);

    // Trigger battlefield effects strictly AFTER cutscene finishes and disappears
    if (pendingAftermathRef.current) {
      const { charId, charName, element, skillName, title } = pendingAftermathRef.current;
      pendingAftermathRef.current = null;
      triggerAftermath(charId, charName, element, skillName, title);
    }
  }, [triggerAftermath]);

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
      isRunning: (!activeUnitId || isAutoBattle) && !showExitModal && !activeCutscene, 
      addFloatText, 
      playEffect,
      damageDealt: damageDealtRef.current,
      lastChecksum: 0,
      isAutoBattle
    };
  }, [players, enemies, activeUnitId, addFloatText, playEffect, isAutoBattle, showExitModal, activeCutscene]);

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
        const stats = { ...damageDealt, __duration: getBattleDurationSeconds() };
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
          const stats = { ...damageDealt, __duration: getBattleDurationSeconds() };
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

            const isThirdSkill = skill.type === "Skill2" || p.skills[2]?.id === skill.id;
            const charConfig = ULTIMATE_CHARACTER_CONFIGS[p.id];

            const runAISkill = () => {
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
            };

            if (charConfig && isThirdSkill) {
              pendingUltimateRef.current = runAISkill;
              pendingAftermathRef.current = {
                charId: p.id,
                charName: p.name,
                element: p.element,
                skillName: skill.name,
                title: charConfig.title
              };
              cutsceneStartTimeRef.current = Date.now();
              setActiveCutscene({
                charId: p.id,
                charName: p.name,
                skillName: skill.name,
                element: p.element,
                quote: charConfig.quote,
              });
            } else {
              runAISkill();
            }

            if (p.id === 'nereus') {
               p.buffs.nereusC2Triggers = 0;
               p.buffs.nereusC5UsedThisTurn = false;
               if (p.buffs.nereusGardenTurns && p.buffs.nereusGardenTurns > 0) {
                  p.buffs.nereusGardenTurns--;
                  if (p.buffs.nereusGardenTurns === 0) {
                     addLog(`Сад вечного моря увядает: Последнее цветение!`);
                     if (stateRef.current.addFloatText) {
                        stateRef.current.addFloatText(p.uid, "🪸 ПОСЛЕДНЕЕ ЦВЕТЕНИЕ", "text-cyan-300 font-black text-xs");
                     }
                     const lastBloomMult = Math.round(p.stats.maxHp * 0.10) / Math.max(1, p.stats.atk);
                     const fakeState = { 
                        playerParty: newPlayers, 
                        enemyParty: newEnemies, 
                        turnQueue: [], 
                        activeUnit: p, 
                        logs: [], 
                        damageDealt: damageDealtRef.current,
                        lastChecksum: 0 
                     };
                     newEnemies.forEach(e => {
                        if (e.stats.hp > 0) {
                           e.aura = 'Hydro';
                           dealDamage(p, e, lastBloomMult, 'Hydro', addLog, stateRef.current.addFloatText, stateRef.current.playEffect, 1, fakeState);
                        }
                     });
                  }
               }
            }

            if (p.id === 'iva') {
               p.buffs.ivaThornsGeneratedThisTurn = 0;
               p.buffs.ivaBloomHealsThisTurn = 0;
               p.buffs.ivaC4TriggeredThisTurn = false;
               p.buffs.ivaC3HealsThisTurn = 0;
               if (p.buffs.ivaFloralBondTurns && p.buffs.ivaFloralBondTurns > 0) {
                  p.buffs.ivaFloralBondTurns--;
                  if (p.buffs.ivaFloralBondTurns === 0) {
                     addLog(`Флоральная связь рассеивается.`);
                  }
               }
               if (p.buffs.ivaBloomTurns && p.buffs.ivaBloomTurns > 0) {
                  p.buffs.ivaBloomTurns--;
                  if (p.buffs.ivaBloomTurns === 0) {
                     addLog(`Эффект Цветения завершается.`);
                  }
               }
            }

            if (p.id === 'kern') {
               if (p.buffs.kernOverloadTurns && p.buffs.kernOverloadTurns > 0) {
                  p.buffs.kernOverloadTurns--;
                  if (p.buffs.kernOverloadTurns === 0) {
                     addLog(`Эффект Перенапряжения Керна завершился.`);
                  }
               }
               if (p.buffs.kernQBonusTurns && p.buffs.kernQBonusTurns > 0) {
                  p.buffs.kernQBonusTurns--;
               }
               if (p.buffs.kernC4BonusTurns && p.buffs.kernC4BonusTurns > 0) {
                  p.buffs.kernC4BonusTurns--;
               }
               if (p.buffs.kernC2DefTurns && p.buffs.kernC2DefTurns > 0) {
                  p.buffs.kernC2DefTurns--;
                  if (p.buffs.kernC2DefTurns === 0) {
                     p.buffs.kernC2DefStacks = 0;
                  }
               }
               if (p.buffs.kernCritOverloadTurns && p.buffs.kernCritOverloadTurns > 0) {
                  p.buffs.kernCritOverloadTurns--;
                  if (p.buffs.kernCritOverloadTurns === 0) {
                     p.buffs.kernCritOverloadActive = false;
                     addLog(`Критическое перенапряжение Керна завершилось.`);
                  }
               }
            }

            // Reset per-turn reaction explosion on enemies' flowers
            newEnemies.forEach(e => {
               if (e.buffs.nereusFlower) {
                  e.buffs.nereusFlower.rxnExplosionUsedThisTurn = false;
               }
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

            if (modifiedE.buffs.nereusFlower) {
               modifiedE.buffs.nereusFlower.turns--;
               if (modifiedE.buffs.nereusFlower.turns <= 0) {
                  delete modifiedE.buffs.nereusFlower;
                  if (stateRef.current.addFloatText) {
                     stateRef.current.addFloatText(modifiedE.uid, "Цветок увял", "text-white/50 text-xs");
                  }
               }
            }

            // Nereus Garden of Eternal Sea (enemy turn start AoE Hydro DMG + Aura)
            const nereus = newPlayers.find(p => p.id === 'nereus' && p.stats.hp > 0);
            if (nereus && (nereus.buffs.nereusGardenTurns ?? 0) > 0) {
               const gardenMult = Math.round(nereus.stats.maxHp * 0.17) / Math.max(1, nereus.stats.atk);
               const fakeGardenState = { 
                  playerParty: newPlayers, 
                  enemyParty: newEnemies, 
                  turnQueue: [], 
                  activeUnit: nereus, 
                  logs: [], 
                  damageDealt: damageDealtRef.current,
                  lastChecksum: 0 
               };
               if (stateRef.current.addFloatText) {
                  stateRef.current.addFloatText(nereus.uid, "🌊 САД ВЕЧНОГО МОРЯ", "text-cyan-400 font-bold text-xs");
               }
               newEnemies.forEach(otherE => {
                  if (otherE.stats.hp > 0) {
                     otherE.aura = 'Hydro';
                     dealDamage(nereus, otherE, gardenMult, 'Hydro', addLog, stateRef.current.addFloatText, stateRef.current.playEffect, 1, fakeGardenState);
                  }
               });
            }

            if (modifiedE.stats.hp <= 0) return modifiedE; // Died to Garden DMG

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
    if (selectedSkill?.id === skill.id) {
      // If clicking already selected self/all skill, trigger execution automatically
      const activeUnit = players.find(p => p.id === activeUnitId);
      if (activeUnit) {
        if (skill.target === "AllEnemies") {
          const validTargets = enemies.filter(e => e.stats.hp > 0);
          if (validTargets.length > 0) handleTargetSelect(validTargets[0], false);
          return;
        } else if (skill.target === "AllAllies" || skill.target === "Self") {
          handleTargetSelect(activeUnit, true);
          return;
        }
      }
    }
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
    
    // Execute
    const isThirdSkill = selectedSkill.type === "Skill2" || activeUnit.skills[2]?.id === selectedSkill.id;
    const charConfig = ULTIMATE_CHARACTER_CONFIGS[activeUnit.id];

    const runPlayerSkill = () => {
      // Animate Attacker
      setAttackingUnitId(activeUnit.uid);
      setTimeout(() => setAttackingUnitId(null), 600);

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
      setSelectedSkill(null);
      setActiveUnitId(null);
      
      // Force React to deep update arrays
      setPlayers([...players]);
      setEnemies([...enemies]);
    };

    if (charConfig && isThirdSkill) {
      pendingUltimateRef.current = runPlayerSkill;
      pendingAftermathRef.current = {
        charId: activeUnit.id,
        charName: activeUnit.name,
        element: activeUnit.element,
        skillName: selectedSkill.name,
        title: charConfig.title
      };
      setSelectedSkill(null);
      setActiveUnitId(null);
      cutsceneStartTimeRef.current = Date.now();
      setActiveCutscene({
        charId: activeUnit.id,
        charName: activeUnit.name,
        skillName: selectedSkill.name,
        element: activeUnit.element,
        quote: charConfig.quote,
      });
    } else {
      runPlayerSkill();
    }
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

  // Keyboard shortcut listener (1, 2, 3 to pick skill, Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSkill(null);
      } else if (activePlayer && !isAutoBattle) {
        if (e.key === '1' && activePlayer.skills[0] && (activePlayer.cooldowns[activePlayer.skills[0].id] || 0) === 0) {
          handleSkillSelect(activePlayer.skills[0]);
        } else if (e.key === '2' && activePlayer.skills[1] && (activePlayer.cooldowns[activePlayer.skills[1].id] || 0) === 0) {
          handleSkillSelect(activePlayer.skills[1]);
        } else if (e.key === '3' && activePlayer.skills[2] && (activePlayer.cooldowns[activePlayer.skills[2].id] || 0) === 0) {
          handleSkillSelect(activePlayer.skills[2]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlayer, isAutoBattle, selectedSkill]);
  const farinaUnit = players.find(p => p.id === 'farina');
  const whiteFieldDuration = (farinaUnit && farinaUnit.stats.hp > 0) ? (farinaUnit.buffs.whiteField ?? 0) : 0;
  const isWhiteFieldActive = whiteFieldDuration > 0;

  // Nereus battle effect primitives
  const nereusUnit = players.find(p => p.id === 'nereus' && p.stats.hp > 0);
  const nereusGardenTurns = nereusUnit?.buffs.nereusGardenTurns ?? 0;
  const nereusFlowersCount = enemies.filter(e => e.stats.hp > 0 && e.buffs.nereusFlower && (e.buffs.nereusFlower.hits ?? 0) > 0).length;

  // Iva battle effect primitives
  const ivaUnit = players.find(p => p.id === 'iva' && p.stats.hp > 0);
  const ivaFloralBondTurns = ivaUnit?.buffs.ivaFloralBondTurns ?? 0;
  const ivaBloomTurns = ivaUnit?.buffs.ivaBloomTurns ?? 0;

  // Kern battle effect primitives
  const kernUnit = players.find(p => p.id === 'kern' && p.stats.hp > 0);
  const kernOverloadTurns = kernUnit?.buffs.kernOverloadTurns ?? 0;
  const kernQBonusTurns = kernUnit?.buffs.kernQBonusTurns ?? 0;
  const kernCritOverloadActive = Boolean(kernUnit?.buffs.kernCritOverloadActive);
  const kernCritOverloadTurns = kernUnit?.buffs.kernCritOverloadTurns ?? 0;

  // Aelita battle effect primitives
  const aelitaUnit = players.find(p => p.id === 'aelita' && p.stats.hp > 0);
  const aelitaTheoremActive = Boolean(aelitaUnit && (aelitaUnit.buffs.atk ?? 0) > 0);
  const aelitaThornsEnemyCount = enemies.filter(e => e.stats.hp > 0 && (e.buffs.thorns ?? 0) > 0).length;

  // Maestro battle effect primitives
  const maestroIsolationActive = enemies.some(e => e.stats.hp > 0 && (e.buffs.isolationMark ?? 0) > 0);

  // Ineffa battle effect primitives
  const ineffaUnit = players.find(p => p.id === 'ineffa' && p.stats.hp > 0);
  const ineffaReflectedActive = Boolean(ineffaUnit && (ineffaUnit.buffs.reflectedForm ?? 0) > 0);
  const ineffaFragmentsCount = ineffaUnit?.buffs.mirrorFragment ?? 0;

  // Gotka battle effect primitives
  const gotkaUnit = players.find(p => p.id === 'gotka' && p.stats.hp > 0);
  const gotkaPuppetsCount = gotkaUnit?.buffs.puppets ?? 0;

  // Volosatinya battle effect primitives
  const volosatinyaUnit = players.find(p => p.id === 'volosatinya' && p.stats.hp > 0);
  const volosatinyaMeadowActive = Boolean(volosatinyaUnit && (volosatinyaUnit.buffs.atk ?? 0) > 0);

  return (
    <div 
      className="w-full max-w-7xl h-[100dvh] md:h-[95dvh] flex flex-col bg-[#07080b] md:rounded-3xl overflow-hidden md:border border-white/10 shadow-2xl font-sans text-white/90 ring-1 ring-white/5 relative"
    >
      
      {/* Top Half: Arena */}
      <div ref={arenaRef} className="flex-1 relative bg-gradient-to-br from-[#101216] via-[#07080b] to-[#101216] p-3 sm:p-5 md:p-6 flex flex-col justify-between overflow-hidden min-h-0">
        
        {/* White Field Battle Visual Effect (Белое поле Фарины) */}
        <WhiteFieldOverlay active={isWhiteFieldActive} duration={whiteFieldDuration} />

        {/* Dynamic Character Arena Overlays (Вольта, Снежана, Авелин, Кайрен, Сайрус, Рейвен, Нереус, Ива, Керн, Аэлита, Маэстро, Инеффа, Готка, Волосатиня) */}
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
          nereusGardenTurns={nereusGardenTurns}
          nereusFlowersCount={nereusFlowersCount}
          ivaFloralBondTurns={ivaFloralBondTurns}
          ivaBloomTurns={ivaBloomTurns}
          kernOverloadTurns={kernOverloadTurns}
          kernQBonusTurns={kernQBonusTurns}
          kernCritOverloadActive={kernCritOverloadActive}
          kernCritOverloadTurns={kernCritOverloadTurns}
          aelitaTheoremActive={aelitaTheoremActive}
          aelitaThornsEnemyCount={aelitaThornsEnemyCount}
          maestroIsolationActive={maestroIsolationActive}
          ineffaReflectedActive={ineffaReflectedActive}
          ineffaFragmentsCount={ineffaFragmentsCount}
          gotkaPuppetsCount={gotkaPuppetsCount}
          volosatinyaMeadowActive={volosatinyaMeadowActive}
        />

        {/* Lingering Ultimate Aftermath Elemental Field Effects */}
        <UltimateAftermathField aftermath={ultimateAftermath} />

        {/* Background Decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[2px] border-white/20 rotate-45" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[1px] border-white/10 -rotate-45" />
        </div>

        {/* Audio Mute & Info */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-start z-50">
          <div className="flex gap-2">
            <button 
              onClick={toggleMute}
              className="group relative bg-[#111111]/60 hover:bg-white/10 border border-white/10 p-1.5 sm:py-2 sm:px-3 rounded-xl sm:rounded-2xl text-white/60 hover:text-white transition-all duration-300 flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
              title="Звук"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline uppercase tracking-tighter">Звук</span>
            </button>
            <button 
              onClick={() => setIsAutoBattle(!isAutoBattle)}
              className={cn(
                "group relative bg-[#111111]/60 hover:bg-white/10 border p-1.5 sm:py-2 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-1.5 text-xs font-bold backdrop-blur-md", 
                isAutoBattle ? "text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10" : "text-white/60 hover:text-white border-white/10"
              )}
              title="Автобой (A)"
            >
              <Sword className={cn("w-4 h-4", isAutoBattle ? "opacity-100 animate-pulse" : "opacity-50")} />
              <span className="hidden sm:inline uppercase tracking-tighter">Авто</span>
            </button>
            {onExit && (
              <button 
                onClick={() => setShowExitModal(true)}
                className="group relative bg-[#111111]/60 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 p-1.5 sm:py-2 sm:px-3 rounded-xl sm:rounded-2xl text-white/60 hover:text-red-400 transition-all duration-300 flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
                title="Покинуть бой"
              >
                <LogOut className="w-4 h-4 text-red-400/80 group-hover:text-red-400" />
                <span className="hidden sm:inline uppercase tracking-tighter">Выход</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 scale-90 sm:scale-100 origin-right">
             {stageTitle ? (
               <div className="bg-fuchsia-950/80 border border-fuchsia-500/50 px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-fuchsia-300 shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                 <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                 {stageTitle}
               </div>
             ) : (
               <>
                 <div className="text-[8px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Волна {currentWave + 1} из {enemyWaves.length}</div>
                 <div className="bg-white/5 border border-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold text-white/80 backdrop-blur-md">Узел-7</div>
               </>
             )}
          </div>
        </div>

        {/* Battlefield Center Stage */}
        <div className="flex flex-col flex-1 justify-center gap-4 sm:gap-6 md:gap-8 my-auto w-full max-w-5xl mx-auto px-1 sm:px-4 py-2">
          {/* Enemies Row */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-4 md:gap-5 w-full overflow-visible">
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
          <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 md:gap-5 z-10 w-full overflow-visible">
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

      {/* Bottom Half: Sleek Compact Command Dock UI */}
      <div className="h-auto md:h-24 lg:h-28 bg-[#090b0e]/95 backdrop-blur-xl border-t border-white/10 relative shrink-0 z-30 flex flex-col md:flex-row items-stretch px-3 py-2 sm:px-4 sm:py-2.5 gap-2 md:gap-4 shadow-2xl">
        
        {/* Unit Info Card on Left */}
        <div className="w-full md:w-56 lg:w-64 shrink-0 flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 border-b md:border-b-0 md:border-r border-white/10 pb-1.5 md:pb-0 md:pr-3">
            {activePlayer ? (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between md:justify-start w-full gap-2.5"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {activePlayer.image ? (
                        <img 
                          src={activePlayer.image} 
                          alt={activePlayer.name}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-white/20 shadow-md shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xl shadow-inner shrink-0">
                          <Activity className="w-5 h-5 text-yellow-400/80" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase truncate">{activePlayer.name}</h2>
                          <span className={cn("px-1.5 py-0.2 rounded text-[8px] font-black uppercase text-white shadow-sm shrink-0", activePlayer.color)}>
                            {activePlayer.element}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-white/40 text-[9px] font-mono font-bold uppercase">ATK</span>
                          <span className="text-xs font-black text-white tabular-nums">
                            {activePlayer.buffs.atk ? <span className="text-emerald-400 font-bold">+{Math.round(activePlayer.stats.atk + activePlayer.buffs.atk)}</span> : Math.round(activePlayer.stats.atk)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold">
                      <span>Ход</span>
                    </div>
                </motion.div>
            ) : (
                <div className="flex items-center justify-center w-full gap-2 opacity-40">
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Ожидание...</span>
                </div>
            )}
        </div>

        {/* Skills Action Dock on Right */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
            {activePlayer ? (
                <div className="w-full flex flex-col justify-center gap-1.5">
                    {/* Selected Skill Targeting Pill */}
                    {selectedSkill && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center justify-between px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-200"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Target className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                          <span className="text-yellow-300 uppercase font-black">{selectedSkill.name}:</span>
                          <span className="text-indigo-200 truncate">
                            {selectedSkill.target === "AllEnemies" ? "Все враги (кликните любого врага)" :
                             selectedSkill.target === "AllAllies" ? "Все союзники (кликните союзника)" :
                             selectedSkill.target === "Self" ? "На себя" : "Выберите цель на поле боя"}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSkill(null);
                          }}
                          className="px-1.5 py-0.2 rounded hover:bg-white/10 text-white/50 hover:text-white text-[9px] font-mono uppercase tracking-wider ml-2 shrink-0 flex items-center gap-0.5"
                          title="Отменить выбор (Esc)"
                        >
                          ✕ <span className="hidden sm:inline">Отмена</span>
                        </button>
                      </motion.div>
                    )}

                    {/* 3 Skill Buttons Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                        {activePlayer.skills.map((skill, idx) => {
                            const isCoolingDown = (activePlayer.cooldowns[skill.id] || 0) > 0;
                            const isSelected = selectedSkill?.id === skill.id;
                            
                            const getIcon = () => {
                              if (idx === 0) return <Sword className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />;
                              if (idx === 1) return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />;
                              return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />;
                            };

                            const getTheme = () => {
                              if (isSelected) return "border-yellow-400 bg-yellow-400/15 text-white ring-2 ring-yellow-400/60 shadow-[0_0_12px_rgba(250,204,21,0.35)] scale-[0.98]";
                              if (isCoolingDown) return "bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed text-white/40";
                              return "bg-white/[0.04] border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 active:scale-95 text-white/80 hover:text-white";
                            };

                            return (
                                <div key={skill.id} className="relative group/skill">
                                  <button
                                      disabled={isCoolingDown}
                                      onClick={() => handleSkillSelect(skill)}
                                      className={cn(
                                          "w-full relative flex items-center justify-between p-2 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 h-11 sm:h-12 md:h-13",
                                          getTheme()
                                      )}
                                  >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                                          {getIcon()}
                                        </div>
                                        <div className="text-left min-w-0">
                                          <div className="font-black text-[10px] sm:text-xs uppercase tracking-tight truncate leading-none">
                                            {skill.name}
                                          </div>
                                          <div className="text-[8px] sm:text-[9px] text-white/40 font-mono mt-0.5 truncate">
                                            {idx === 0 ? "Базовая" : idx === 1 ? "Навык (E)" : "Ульта (Q)"}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Key hint badge for desktop */}
                                      <div className="hidden sm:flex items-center justify-center w-4 h-4 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-white/40 group-hover/skill:text-yellow-300 shrink-0 ml-1">
                                        {idx + 1}
                                      </div>

                                      {/* Cooldown Overlay */}
                                      {isCoolingDown && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-xl backdrop-blur-xs">
                                          <span className="text-rose-400 font-mono font-black text-sm sm:text-base">
                                            {activePlayer.cooldowns[skill.id]}
                                          </span>
                                        </div>
                                      )}
                                  </button>

                                  {/* Floating Tooltip with Skill Description & Scaling on Hover */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 p-2.5 rounded-xl bg-[#12141a]/95 border border-white/15 shadow-2xl backdrop-blur-xl pointer-events-none opacity-0 group-hover/skill:opacity-100 transition-opacity duration-150 z-50">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                                      <span className="text-[11px] font-black text-white uppercase">{skill.name}</span>
                                      <span className="text-[8px] font-mono text-yellow-300 font-bold">КД: {skill.cost}</span>
                                    </div>
                                    <p className="text-[9px] text-white/70 leading-relaxed font-sans">{skill.description}</p>
                                    {skill.statsText && (
                                      <div className="mt-1 pt-1 border-t border-white/5 text-[8px] text-cyan-300/80 font-mono whitespace-pre-line">
                                        {skill.statsText}
                                      </div>
                                    )}
                                  </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="h-full w-full flex items-center justify-center opacity-30 gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white">
                      Ожидание хода игрока
                    </span>
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

      {/* Fullscreen Ultimate Cinematic Cutscene Overlay (Time Freeze & 2-3s Burst Animation) */}
      <UltimateCutsceneOverlay 
        cutscene={activeCutscene} 
        onImpact={handleCutsceneImpact}
        onComplete={handleCutsceneComplete} 
      />

    </div>
  );
}
