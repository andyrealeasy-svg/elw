import { Combatant, Skill, Element, Artifact, ArtifactSlot, StatType, BattleState, Rarity, ArtifactSet, Dungeon, ArtifactSubStat, PlayerProfile } from "./types";
import { playCritSound } from "./lib/sound";
import { SPLASH_IMAGES } from "./lib/images";


export const triggerKairenIceEcho = (s, state, ft, log, c, pl) => {
  s.buffs.kairenShards = 0;
  if (ft) ft(s.uid, "❄️ ЛЕДЯНОЕ ЭХО", "text-cyan-300 font-black");
  if (pl) pl(s.uid, "kairen_ice_echo");
  let baseMult = 1.5;
  if (state && state.enemyParty) {
    state.isKairenEchoing = true;
    state.enemyParty.forEach(e => {
      if (e.stats.hp > 0) {
        if (pl) pl(e.uid, "kairen_ice_echo");
        let debuffCount = (e.aura ? 1 : 0) + (e.buffs.frozen ? 1 : 0);
        dealDamage(s, e, baseMult + (debuffCount * 0.5), 'Cryo', log, ft, pl, 1, state);
        if (c >= 4) {
          e.buffs.kairenColdMark = 2;
          if (ft) ft(e.uid, "❄️ ХОЛОДНАЯ МЕТКА", "text-cyan-200 text-xs font-bold");
        }
      }
    });
    state.isKairenEchoing = false;
  }
};

export const triggerKairenC6 = (s, state, ft, log, pl) => {
  s.buffs.kairenShards = 0;
  s.buffs.kairenC6UsedThisWinter = true;
  s.buffs.kairenC6CryoBuff = 2;
  if (ft) ft(s.uid, "🏔️ КОНЕЦ ВЕЧНОЙ ЗИМЫ", "text-cyan-200 font-black text-sm");
  if (pl) pl(s.uid, "kairen_c6_winter_end");
  if (state && state.enemyParty) {
    state.isKairenEchoing = true;
    state.enemyParty.forEach(e => {
      if (e.stats.hp > 0) {
        if (pl) pl(e.uid, "kairen_c6_winter_end");
        let extra = (e.buffs.frozen || e.isBoss) ? 1.5 : 0;
        dealDamage(s, e, 3.0 + extra, 'Cryo', log, ft, pl, 1, state);
      }
    });
    state.isKairenEchoing = false;
  }
};

export const addKairenShards = (s, amount, c, state, ft, log, pl) => {
  let actualAmount = amount;
  for (let i=0; i<amount; i++) {
    if (c >= 3 && Math.random() < 0.2) actualAmount++;
  }
  let maxShards = (c >= 5 && s.buffs.kairenWinterTurns > 0) ? 7 : 5;
  s.buffs.kairenShards = (s.buffs.kairenShards || 0) + actualAmount;
  if (ft && actualAmount > 0) ft(s.uid, `❄️ ОСКОЛКИ (+${actualAmount})`, "text-cyan-200 text-xs");

  if (s.buffs.kairenShards >= maxShards) {
    if (c >= 6 && maxShards === 7 && !s.buffs.kairenC6UsedThisWinter) {
      triggerKairenC6(s, state, ft, log, pl);
    } else {
      triggerKairenIceEcho(s, state, ft, log, c, pl);
    }
  }
  s.buffs.kairenShards = Math.min(s.buffs.kairenShards || 0, maxShards);
};

export const kairenTurnStart = (s, t, state, log, ft, pl, c) => {
  if (s.buffs.kairenWinterTurns && s.buffs.kairenWinterTurns > 0) {
    s.buffs.kairenWinterTurns--;
    if (state && state.enemyParty) {
       state.isKairenEchoing = true;
       if (ft) ft(s.uid, '❄️ ВЕЧНАЯ ЗИМА', 'text-cyan-300 text-xs font-bold');
       if (pl) pl(s.uid, 'kairen_winter_pulse');
       state.enemyParty.forEach(e => {
         if (e.stats.hp > 0) {
           let extra = (e.buffs.frozen || e.isBoss) ? 0.5 : 0;
           dealDamage(s, e, 1.0 + extra, 'Cryo', log, ft, pl, 1, state);
         }
       });
       state.isKairenEchoing = false;
    }
    if (s.buffs.kairenWinterTurns <= 0) s.buffs.kairenC6UsedThisWinter = false;
  }
  if (s.buffs.kairenFrostTurns && s.buffs.kairenFrostTurns > 0) s.buffs.kairenFrostTurns--;
  if (s.buffs.kairenC6CryoBuff && s.buffs.kairenC6CryoBuff > 0) s.buffs.kairenC6CryoBuff--;
  
  if (state && state.enemyParty) {
    state.enemyParty.forEach(e => {
      if (e.buffs.kairenColdMark && e.buffs.kairenColdMark > 0) e.buffs.kairenColdMark--;
    });
  }
};

export const addPetals = (aveline, amount, ft, c) => {
  const maxPetals = c >= 1 ? (c >= 3 ? 6 : 5) : 3;
  aveline.buffs.avelinePetals = Math.min(maxPetals, (aveline.buffs.avelinePetals || 0) + amount);
  if (ft) ft(aveline.uid, '🌸 ЛЕПЕСТКИ (' + aveline.buffs.avelinePetals + ')', 'text-cyan-300 text-xs');
};

export const avelineTurnStart = (s, t, state, log, ft, pl, c) => {
  if (s.buffs.avelineGardenTurns && s.buffs.avelineGardenTurns > 0) {
    s.buffs.avelineGardenTurns--;
    if (s.buffs.avelineGardenTurns > 0) {
      addPetals(s, 1, ft, c);
      if (state && state.enemyParty) {
        state.enemyParty.forEach(e => {
          if (e.stats.hp > 0) dealDamage(s, e, 0.5, 'Hydro', log, null, null, 1, state);
        });
      }
      const heal = s.stats.maxHp * 0.05;
      if (state && state.playerParty) {
        state.playerParty.forEach(a => {
          if (a.stats.hp > 0) {
            a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal);
          }
        });
      }
      if (ft) ft(s.uid, '🪷 САД: УРОН И ЛЕЧЕНИЕ', 'text-sky-300 text-xs font-bold');
      if (pl) pl(s.uid, 'aveline_azure_garden');
    }
  }
  if (s.buffs.avelineGreatFlowerTurns && s.buffs.avelineGreatFlowerTurns > 0) {
    s.buffs.avelineGreatFlowerTurns--;
    if (s.buffs.avelineGreatFlowerTurns > 0) {
      addPetals(s, 1, ft, c);
    }
  }
};

export const triggerAvelinePetalBloom = (aveline, state, ft, log, c) => {
  if (aveline.buffs.avelinePetals && aveline.buffs.avelinePetals > 0) {
    aveline.buffs.avelinePetals--;
    let bonus = 8;
    if (c >= 2) {
      aveline.buffs.avelineC2Stacks = Math.min(3, (aveline.buffs.avelineC2Stacks || 0) + 1);
      bonus += 4 * aveline.buffs.avelineC2Stacks;
    }
    
    // Since buff duration is handled differently, we'll just stack the dmg boost here permanently (or rather, for the battle session duration as per typical game mechanics in this engine unless it implements timed buffs).
    state.playerParty.forEach(p => {
      p.buffs.dmgBoost = (p.buffs.dmgBoost || 0) + bonus;
      if (c >= 1) {
        const heal = p.stats.maxHp * 0.03;
        p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
      }
    });
    if (ft) ft(aveline.uid, '🌸 РАСЦВЕТ (' + aveline.buffs.avelinePetals + ')', 'text-pink-300 text-xs');
  }
};

export const triggerAvelineElementalFlower = (aveline, state, ft, log, c) => {
  if (aveline.buffs.avelineGreatFlowerTurns && aveline.buffs.avelineGreatFlowerTurns > 0) {
    aveline.buffs.avelineElementalFlowers = (aveline.buffs.avelineElementalFlowers || 0) + 1;
    if (ft) ft(aveline.uid, '🌺 ЦВЕТОК (' + aveline.buffs.avelineElementalFlowers + '/5)', 'text-indigo-300 text-xs');
    
    if (aveline.buffs.avelineElementalFlowers >= 5) {
       let dmgBonus = 15;
       let healPct = 0.15;
       if (c >= 6) {
          aveline.buffs.avelineC6Bonus = Math.min(25, (aveline.buffs.avelineC6Bonus || 0) + 5);
          dmgBonus += aveline.buffs.avelineC6Bonus;
          if (aveline.buffs.avelineC6Bonus >= 25) {
             healPct = 0.20;
             if (state.enemyParty) {
                state.enemyParty.forEach(e => {
                   if (e.stats.hp > 0) dealDamage(aveline, e, 2.0, 'Hydro', log, null, null, 1, state);
                });
             }
          }
       }
       if (c < 6) aveline.buffs.avelineElementalFlowers = 0;
       
       state.playerParty.forEach(p => {
          p.buffs.dmgBoost = (p.buffs.dmgBoost || 0) + dmgBonus;
          if (c >= 5) p.buffs.reactionDmg = (p.buffs.reactionDmg || 0) + 10;
          const heal = p.stats.maxHp * healPct;
          p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
       });
       if (ft) ft(aveline.uid, '✨ ВЕЛИКОЕ ЦВЕТЕНИЕ ✨', 'text-purple-400 font-bold text-xs');
    }
  }
};

export const notifyThornAcquired = (
  source: Combatant,
  target: Combatant,
  state: BattleState | undefined,
  log?: (msg: string) => void,
  floatText?: (targetUid: string, text: string, color: string) => void,
  playEffect?: (targetUid: string, effectType: string) => void
) => {
  if (!state) return;
  const iva = state.playerParty.find(p => p.id === 'iva' && p.stats.hp > 0);
  if (!iva) return;

  // Q Bloom:
  const maxBloomHeals = iva.constellation >= 5 ? 3 : 2;
  if ((iva.buffs.ivaBloomTurns ?? 0) > 0 && (iva.buffs.ivaBloomHealsThisTurn || 0) < maxBloomHeals) {
    iva.buffs.ivaBloomHealsThisTurn = (iva.buffs.ivaBloomHealsThisTurn || 0) + 1;
    const healPct = iva.constellation >= 5 ? 0.06 : 0.05;
    const healVal = Math.round(source.stats.maxHp * healPct);
    source.stats.hp = Math.min(source.stats.maxHp, source.stats.hp + healVal);
    if (floatText) floatText(source.uid, `+${healVal} HP (Цветение)`, "text-emerald-300 font-bold text-xs");
    if (log) log(`«Цветение» Ивы исцеляет ${source.name} на ${healVal} HP!`);
    if (playEffect) playEffect(source.uid, "heal");
  }

  // C4:
  if (iva.constellation >= 4 && !iva.buffs.ivaC4TriggeredThisTurn && (iva.buffs.ivaFloralBondTurns ?? 0) > 0) {
    iva.buffs.ivaC4TriggeredThisTurn = true;
    iva.buffs.ivaFloralBondTurns += 1;
    if (floatText) floatText(iva.uid, "🌿 СВЯЗЬ +1 ХОД (C4)", "text-emerald-300 font-bold text-xs");
    if (log) log(`C4 Ивы: Флоральная связь продлена на 1 ход.`);
  }

  // C6:
  if (iva.constellation >= 6 && (iva.buffs.ivaFloralBondTurns ?? 0) > 0 && !iva.buffs.ivaC6TriggeredThisE) {
    iva.buffs.ivaC6ThornCounter = (iva.buffs.ivaC6ThornCounter || 0) + 1;
    if (iva.buffs.ivaC6ThornCounter >= 3) {
      iva.buffs.ivaC6TriggeredThisE = true;
      if (floatText) floatText(iva.uid, "🌸 ЦВЕТОК ЖИЗНИ (C6)", "text-emerald-200 font-black text-sm");
      if (log) log(`C6 Ивы: «Цветок жизни» раскрывается! Весь отряд восстановил 10% HP и получил +15% ATK.`);
      state.playerParty.forEach(ally => {
        if (ally.stats.hp > 0) {
          const heal = Math.round(ally.stats.maxHp * 0.10);
          ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + heal);
          ally.buffs.atk = (ally.buffs.atk || 0) + Math.round(ally.stats.atk * 0.15);
          if (floatText) floatText(ally.uid, `+${heal} HP / +15% ATK`, "text-emerald-300 font-bold text-xs");
          if (playEffect) playEffect(ally.uid, "heal");
        }
      });
    }
  }
};

export const dealDamage = (source: Combatant, target: Combatant, multiplier: number, element: Element, log: (msg: string) => void, floatText?: (targetUid: string, text: string, color: string) => void, playEffect?: (targetUid: string, effectType: string) => void, hits: number = 1, state?: BattleState, defIgnore: number = 0, ignoreShields: boolean = false, guaranteedCrit: boolean = false) => {
  const hitDelay = 200;

  for (let i = 0; i < hits; i++) {
    setTimeout(() => {
      if (target.stats.hp <= 0 && i > 0) return; 
      
      let baseCritRate = source.stats.critRate ?? 5;
      let critChance = (baseCritRate + (source.buffs.critChance || 0)) / 100;
      
      // Snezhana C3: +15% crit rate against overcooled targets
      if (state && state.playerParty.some(p => p.id === 'snezhana' && p.constellation >= 3) && target.buffs && (target.buffs.overcool || target.buffs.critOvercool)) {
        critChance += 0.15;
      }
      
      // Maestro (Isolation Mark) & Asher Passive Logic 
      let baseCritDamage = source.stats.critDamage ?? 50;
      let bonusCritDamage = (source.buffs.critDamage || 0) + (source.buffs.critDamageBoost || 0);
      if (source.buffs.shatteredWinter4pc) {
         let stacks = (source.buffs.kairenShards || 0) + (source.buffs.avelinePetals || 0);
         bonusCritDamage += Math.min(40, stacks * 10);
      }
      if (target.aura === "Pyro" && state && state.playerParty.some(p => p.id === 'asher')) {
        bonusCritDamage += 50;
      }
      
      let actualDefIgnore = defIgnore;
      let actualDmgBoost = 1 + (source.buffs.dmgBoost || 0) / 100;

      if (target.buffs.frostbite && target.buffs.frostbite > 0) {
        actualDmgBoost += 0.15;
        if (i === hits - 1 && !state?.isSubDmg) {
           target.buffs.frostbite -= 1;
        }
      }

      if (source.buffs.oceanSongBuff && source.buffs.oceanSongBuff > 0) actualDmgBoost += 0.20;
      if (source.buffs.shatteredWinter4pc && target.buffs.frozen) actualDmgBoost += 0.20;
      if (source.id === 'kairen') {
         if (source.buffs.kairenFrostTurns && source.buffs.kairenFrostTurns > 0) actualDmgBoost += 0.20;
         if (source.buffs.kairenC6CryoBuff && source.buffs.kairenC6CryoBuff > 0) actualDmgBoost += 0.30;
         if (source.constellation >= 2) {
            if (target.buffs.frozen) actualDmgBoost += 0.25;
            else if (target.isBoss) actualDmgBoost += 0.15;
         }
      }

      // Snezhana Overcooling & Critical Overcooling target debuffs
      if (target.buffs) {
        if (target.buffs.overcool) {
          actualDefIgnore = Math.min(1.0, actualDefIgnore + target.buffs.overcool * 0.10);
          actualDmgBoost += target.buffs.overcool * 0.12;
        }
        if (target.buffs.critOvercool) {
          actualDefIgnore = Math.min(1.0, actualDefIgnore + 0.50);
          actualDmgBoost += 0.60;
        }
      }

      // Snezhana C6: Ignore additional 30% defense against targets with Critical Overcooling
      if (state && state.playerParty.some(p => p.id === 'snezhana' && p.constellation >= 6) && target.buffs && target.buffs.critOvercool) {
        actualDefIgnore = Math.min(1.0, actualDefIgnore + 0.30);
      }

      if (state && source.isEnemy === false) {
        const isSingleTarget = state.activeSkill?.target === "SingleEnemy";
        
        if (isSingleTarget && source.buffs.defIgnoreBoost) {
           actualDefIgnore += source.buffs.defIgnoreBoost;
        }
        const isAoE = state.activeSkill?.target === "AllEnemies";
        const hasMaestro = state.playerParty.some(p => p.id === 'maestro');

        // Isolation Mark vulnerability
        if (isSingleTarget && target.buffs.isolationMark) {
          actualDmgBoost += 0.40;
        }

        // AoE against non-isolated targets -> +50% Crit DMG
        if (hasMaestro && isAoE && !target.buffs.isolationMark && !state.isSubDmg) {
          bonusCritDamage += 50;
        }

        // Single target attack -> ignore 30% DEF
        if (hasMaestro && isSingleTarget && !state.isSubDmg) {
          actualDefIgnore = Math.max(actualDefIgnore, actualDefIgnore + 0.30);
        }
      }

      const isCrit = guaranteedCrit || Math.random() < critChance; 
      const critMult = isCrit ? (1.0 + ((baseCritDamage + bonusCritDamage) / 100)) : 1.0;
      
      if (isCrit) {
        playCritSound();
      }

      const effectiveDef = target.stats.def * (1 - actualDefIgnore);
      
      // Aveline scales off max HP instead of ATK (roughly 10% of Max HP per 100% multiplier)
      let baseStat = source.stats.atk;
      if (source.id === 'aveline') {
        baseStat = source.stats.maxHp * 0.12;
      } else if (source.id === 'kern') {
        baseStat = source.stats.def;
        if (source.buffs.kernC2DefStacks) {
          baseStat = Math.floor(baseStat * (1 + 0.10 * source.buffs.kernC2DefStacks));
        }
      }
      
      let baseDmg = multiplier === 0 ? 0 : Math.max(1, Math.floor(((baseStat * multiplier * critMult) / hits)) - (effectiveDef * 0.5));
      
      // Apply Damage Boosts
      baseDmg *= actualDmgBoost;

      // Iva Floral Bond: Dendro RES and Cryo RES reduced by 20% (25% on C2)
      if (!source.isEnemy && (element === "Dendro" || element === "Cryo") && state) {
        const iva = state.playerParty.find(p => p.id === 'iva' && p.stats.hp > 0);
        if (iva && (iva.buffs.ivaFloralBondTurns ?? 0) > 0) {
          const resShred = (iva.constellation >= 2) ? 0.25 : 0.20;
          baseDmg = Math.floor(baseDmg * (1 + resShred));
        }
      }

      // Snezhana source debuff: reduces damage dealt by overcooled/crit-overcooled enemies
      if (source.buffs) {
        if (source.buffs.overcool) {
          baseDmg = Math.max(1, Math.floor(baseDmg * (1 - source.buffs.overcool * 0.10)));
        }
        if (source.buffs.critOvercool) {
          baseDmg = Math.max(1, Math.floor(baseDmg * 0.50));
        }
      }

      let rxnMult = 1;
      let reactionMsg = "";
      const farinaInstance = state?.playerParty.find(p => p.id === 'farina');
      let farinaBonus = 0;
      if (farinaInstance && farinaInstance.buffs.whiteField && farinaInstance.buffs.whiteField > 0) {
        farinaBonus = 0.05 + (farinaInstance.buffs.farinaRxnBonus || 0);
      }

      if (element !== "Physical") {
        if (target.aura && target.aura !== element) {
          const combo = [target.aura, element].sort().join("+");
          if (combo === "Hydro+Pyro") { rxnMult = 1.5; reactionMsg = "🔥Пар(x1.5)"; target.aura = null; }
          else if (combo === "Electro+Pyro") { 
            const isReflection = state?.playerParty.some(p => ['ineffa', 'zephyr', 'aurum'].includes(p.id)) || ['ineffa', 'zephyr', 'aurum'].includes(source.id);
            if (isReflection) {
              rxnMult = 1.3; 
              reactionMsg = "🪞Отражение"; 
              if (source.buffs.reflectionDmgBonus) rxnMult += source.buffs.reflectionDmgBonus;
              
              if (source.buffs.stormMirror4pc && state) {
                state.playerParty.forEach(p => {
                  p.buffs.atk = (p.buffs.atk || 0) + Math.floor(p.stats.atk * 0.20);
                });
                if (floatText) floatText(source.uid, "АТАКА ОТРЯДА +20%", "text-yellow-400 text-xs");
              }
              if (source.buffs.crystalResonance4pc && state) {
                state.playerParty.forEach(p => {
                  p.buffs.critDamage = (p.buffs.critDamage || 0) + 30;
                });
                if (floatText) floatText(source.uid, "КРИТ. УРОН +30%", "text-amber-300 text-xs");
              }
            } else {
              rxnMult = 1.3; 
              reactionMsg = "💥Перегрузка"; 
            }
            target.aura = null; 
          }
          else if (combo === "Electro+Hydro") { rxnMult = 1.2; reactionMsg = "⚡Заряжен"; target.aura = "Electro"; }
          else if (combo === "Dendro+Pyro") { rxnMult = 1.4; reactionMsg = "🔥Горение"; target.aura = null; }
          else if (combo === "Dendro+Hydro") { rxnMult = 1.4; reactionMsg = "🌱Бутонизация"; target.aura = null; }
          else if (combo === "Dendro+Electro") { rxnMult = 1.5; reactionMsg = "✨Стимуляция(x1.5)"; target.aura = "Dendro"; }
          else if (combo === "Cryo+Pyro") { rxnMult = 1.5; reactionMsg = "❄️Таяние(x1.5)"; target.aura = null; }
          else if (combo === "Cryo+Hydro") { rxnMult = 1.1; reactionMsg = "❄️Заморозка"; target.aura = "Cryo"; target.buffs.spd = (target.buffs.spd || 0) - 10; }
          else if (combo === "Cryo+Electro") { rxnMult = 1.3; reactionMsg = "⚡Сверхпроводник (-DEF)"; target.aura = null; target.stats.def = Math.max(5, target.stats.def - 15); }
          else if (combo === "Cryo+Dendro") { rxnMult = 1.1; reactionMsg = "❄️Ледяные Шипы"; target.aura = "Cryo"; }
          else if (combo === "Geo+Hydro" || combo === "Geo+Pyro" || combo === "Geo+Electro" || combo === "Geo+Dendro" || combo === "Cryo+Geo") {
            reactionMsg = "🛡️Кристаллизация";
            source.buffs.shield = (source.buffs.shield || 0) + 100;
            target.aura = null;
          } else {
            target.aura = element; 
          }
        } else if (!target.aura) {
          if (element !== "Geo") target.aura = Math.random() > 0.5 ? element : null; // 50% chance to apply aura per hit
        }
      }

      
      if (reactionMsg && state && !source.isEnemy && !state.isSubDmg && i === 0) {
         const farina = state.playerParty.find(p => p.id === 'farina');
         if (farina) {
            if (target.buffs.snowDust && target.buffs.snowDust > 0) {
               if (farina.constellation >= 4) {
                 farina.buffs.farinaUltStacks = (farina.buffs.farinaUltStacks || 0) + 1;
               }
               if (farina.constellation >= 6) {
                 target.buffs.snowDust += 1;
                 farina.buffs.farinaRxnBonus = (farina.buffs.farinaRxnBonus || 0) + 0.025;
                 if (floatText) floatText(target.uid, "ПЫЛЬ ПРОДЛЕНА", "text-cyan-300 text-xs");
               }
            }
            if (farina.buffs.whiteField && farina.buffs.whiteField > 0 && farina.constellation >= 5) {
               if (!farina.buffs.farinaC5Triggered) {
                 farina.buffs.farinaC5Triggered = true;
                 if (log) log(`Метель над белым полем!`);
                 state.enemyParty.forEach(e => {
                   if (e.stats.hp > 0) dealDamage(farina, e, 0.8, "Cryo", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
                 });
               }
            }
         }

         // Kairen Winter Throne Passive: +1 shard on ally reactions
         const kairen = state.playerParty.find(p => p.id === 'kairen' && p.stats.hp > 0);
         if (kairen && (kairen.buffs.kairenWinterTurns ?? 0) > 0) {
           addKairenShards(kairen, 1, kairen.constellation, state, floatText, log, playEffect);
         }
         // Kairen C4 Cold Mark Retribution
         if (target.buffs.kairenColdMark && target.buffs.kairenColdMark > 0 && kairen) {
           if (playEffect) playEffect(target.uid, "kairen_ice_dance");
           if (floatText) floatText(target.uid, "❄️ ОТВЕТНЫЙ УДАР", "text-cyan-200 text-xs font-bold");
           dealDamage(kairen, target, 0.8, "Cryo", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
           addKairenShards(kairen, 1, kairen.constellation, state, floatText, log, playEffect);
         }
      }

      if (reactionMsg) rxnMult += farinaBonus;
      if (reactionMsg && playEffect) playEffect(target.uid, "shake");
      
      // Ocean Song 4pc bonus trigger
      if (reactionMsg && state && !source.isEnemy) {
        if (i === 0 && source.buffs.oceanSong4pc) {
          state.playerParty.forEach(p => {
             p.buffs.oceanSongBuff = 2; // 2 turns
          });
          if (floatText) floatText(source.uid, "🌊 ПЕСНЬ ОКЕАНА (+20% DMG)", "text-blue-300 text-xs");
        }
      }

      let dmg = Math.floor(baseDmg * rxnMult * (0.9 + Math.random() * 0.2));

      // Volta Conduction Circuit damage mitigation
      if (target.isEnemy === false && target.buffs.conductionCircuit && target.buffs.conductionCircuit > 0) {
        const volta = state?.playerParty.find(p => p.id === 'volta' && p.stats.hp > 0);
        const reduction = (volta?.constellation || 0) >= 2 ? 0.25 : 0.15;
        dmg = Math.max(1, Math.floor(dmg * (1 - reduction)));
      }

      if (!ignoreShields && target.buffs.shield && target.buffs.shield > 0) {
        if (target.buffs.shield >= dmg) {
          target.buffs.shield -= dmg;
          if (floatText) floatText(target.uid, `БЛОК`, 'text-gray-400 font-bold text-sm');
          if (playEffect) playEffect(target.uid, "shield");
          return;
        } else {
          dmg -= target.buffs.shield;
          target.buffs.shield = 0;
          reactionMsg += " (Щит сломан!)";
          if(playEffect) playEffect(target.uid, "shake");
        }
      }

      // Volta C6 Emergency Matrix Save
      if (target.isEnemy === false && target.buffs.conductionCircuit && target.stats.hp - dmg <= 0 && !target.buffs.voltaC6Used) {
        const volta = state?.playerParty.find(p => p.id === 'volta' && p.stats.hp > 0);
        if (volta && (volta.constellation || 0) >= 6) {
          target.buffs.voltaC6Used = 1;
          dmg = target.stats.hp - 1; // Prevent death
          const healVal = Math.floor(volta.stats.maxHp * 0.60);
          target.stats.hp = Math.min(target.stats.maxHp, 1 + healVal);
          target.atb = 100;
          volta.buffs.voltage = 0;
          if (floatText) {
            floatText(target.uid, "⚡ МАТРИЦА СПАСЕНИЯ!", "text-yellow-400 font-black text-sm drop-shadow");
            floatText(target.uid, `+${healVal} HP`, "text-emerald-400 font-black");
          }
          if (playEffect) playEffect(target.uid, "heal");
        }
      }

      target.stats.hp -= dmg;
      if (target.stats.hp < 0) target.stats.hp = 0;
      target.stats.hp = Math.round(target.stats.hp);

      // Kern C6 Check: Critical Overload when HP < 30%
      if (state && target.id === 'kern' && target.constellation >= 6 && !target.buffs.kernC6Used && target.stats.hp > 0 && (target.stats.hp / target.stats.maxHp) < 0.30) {
        target.buffs.kernC6Used = true;
        target.buffs.kernCritOverloadActive = true;
        target.buffs.kernCritOverloadTurns = 3;
        if (floatText) floatText(target.uid, "🌋 КРИТИЧЕСКОЕ ПЕРЕНАПРЯЖЕНИЕ (C6)", "text-amber-400 font-black text-xs");
        if (log) log(`C6 Керна: HP упало ниже 30%! Керн переходит в «Критическое перенапряжение» (+30% урон обычных атак, 20% DEF AoE, иммунитет к потере HP)!`);
      }

      // Volta Voltage accumulation on incoming damage
      if (state && target.isEnemy === false && dmg > 0) {
        const volta = state.playerParty.find(p => p.id === 'volta' && p.stats.hp > 0);
        if (volta) {
          const c = volta.constellation || 0;
          const maxVolts = c >= 1 ? 15 : 10;
          const add = (c >= 2 ? 2 : 1) * (target.buffs.conductionCircuit ? 1 : 1);
          volta.buffs.voltage = Math.min(maxVolts, (volta.buffs.voltage || 0) + add);
          if (floatText && i === 0) {
            floatText(volta.uid, `⚡ ВОЛЬТАЖ +${add} (${volta.buffs.voltage})`, "text-cyan-300 font-bold text-xs");
          }
        }
      }

      // Volta Voltage accumulation when marked ally attacks
      if (state && source.isEnemy === false && source.buffs.conductionCircuit && i === 0) {
        const volta = state.playerParty.find(p => p.id === 'volta' && p.stats.hp > 0);
        if (volta) {
          const c = volta.constellation || 0;
          const maxVolts = c >= 1 ? 15 : 10;
          volta.buffs.voltage = Math.min(maxVolts, (volta.buffs.voltage || 0) + 1);
        }
      }

      // Track Damage
      if (state && state.damageDealt) {
        state.damageDealt[source.uid] = (state.damageDealt[source.uid] || 0) + dmg;
      }

      if (floatText) {
        const elemColorMap: Record<Element, string> = {
          Physical: 'text-slate-100',
          Hydro: 'text-blue-400',
          Pyro: 'text-red-500',
          Dendro: 'text-emerald-400',
          Electro: 'text-purple-400',
          Cryo: 'text-cyan-300',
          Geo: 'text-amber-400'
        };

        const baseElemColor = elemColorMap[element] || 'text-yellow-400';

        let tColor = `${baseElemColor} text-sm sm:text-base font-bold`;
        if (isCrit) {
          tColor = `${baseElemColor} text-2xl sm:text-4xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] z-20 scale-125`;
          if (playEffect) playEffect(target.uid, "shake");
        } else if (rxnMult > 1) {
          tColor = `${baseElemColor} text-lg sm:text-2xl font-black z-10`;
        }

        const textLabel = `-${dmg}`;
        floatText(target.uid, textLabel, tColor);
        if (reactionMsg) {
           setTimeout(() => floatText(target.uid, reactionMsg, `${baseElemColor} text-xs sm:text-sm font-bold`), 300);
        }
      }

      if (playEffect) {
        playEffect(target.uid, element);
      }

      // Farina Snow Dust joint attack
      if (state && source.isEnemy === false && !state.isSubDmg && i === hits - 1 && target.stats.hp > 0) {
        if (target.buffs.snowDust && target.buffs.snowDust > 0) {
          const farina = state.playerParty.find(p => p.id === 'farina');
          if (farina && farina.uid !== source.uid) {
            if (!farina.buffs.farinaDustTriggered) {
              farina.buffs.farinaDustTriggered = true;
              if (log) log(`${farina.name} (Снежная пыль) поддерживает атаку!`);
              dealDamage(farina, target, 0.5, "Cryo", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
              
              if (farina.constellation >= 1) {
                Object.keys(farina.cooldowns).forEach(k => {
                  if (farina.cooldowns[k] > 0) farina.cooldowns[k]--;
                });
              }
              if (farina.constellation >= 3) {
                target.buffs.frostbite = 1;
                if (floatText) floatText(target.uid, "НАЛЕДЬ", "text-cyan-200 text-xs");
              }
            }
          }
        }
      }

      // Maestro joint attack
      if (state && source.isEnemy === false) {
        const isSingleTarget = state.activeSkill?.target === "SingleEnemy";
        const hasMaestro = state.playerParty.some(p => p.id === 'maestro');
        const maestroInstance = state.playerParty.find(p => p.id === 'maestro');
        
        if (hasMaestro && isSingleTarget && !state.isSubDmg && i === hits - 1 && target.stats.hp > 0 && maestroInstance) {
          const jointDmg = Math.floor(dmg * 0.6);
          const aliveEnemies = state.enemyParty.filter(e => e.stats.hp > 0 && e.uid !== target.uid);
          
          if (aliveEnemies.length > 0) {
            if (log) log(`${maestroInstance.name} отвечает: Эхо Одиночества!`);
            aliveEnemies.forEach((enemy, idx) => {
               setTimeout(() => {
                 if (enemy.stats.hp > 0) {
                   enemy.stats.hp = Math.max(0, enemy.stats.hp - jointDmg);
                   if (state.damageDealt) state.damageDealt[maestroInstance.uid] = (state.damageDealt[maestroInstance.uid] || 0) + jointDmg;
                   if (floatText) floatText(enemy.uid, `-${jointDmg}`, "text-purple-300");
                   if (playEffect) playEffect(enemy.uid, "Electro");
                 }
               }, idx * 100);
            });
          }
        }
      }

      // Nereus Sea Flower (Морской цветок) on hit & reaction explosion
      if (state && !state.isSubDmg && i === hits - 1 && target.buffs.nereusFlower && target.buffs.nereusFlower.hits > 0) {
        const nereus = state.playerParty.find(p => p.id === 'nereus' && p.stats.hp > 0);
        if (nereus) {
          const flower = target.buffs.nereusFlower;
          const c = nereus.constellation || 0;

          // 1. Regular flower hit damage: 25% (35% C3) Max HP
          const flowerRatio = c >= 3 ? 0.35 : 0.25;
          const flowerMult = Math.round(nereus.stats.maxHp * flowerRatio) / Math.max(1, nereus.stats.atk);
          if (log) log(`${nereus.name} (Морской цветок) наносит урон по ${target.name}!`);
          if (floatText) floatText(target.uid, "🪸 МОРСКОЙ ЦВЕТОК", "text-cyan-300 font-bold text-xs");
          dealDamage(nereus, target, flowerMult, "Hydro", log, floatText, playEffect, 1, { ...state, isSubDmg: true });

          // C2: When flower deals damage, recover 1 Cost (max 2 per turn)
          if (c >= 2) {
            nereus.buffs.nereusC2Triggers = (nereus.buffs.nereusC2Triggers || 0);
            if (nereus.buffs.nereusC2Triggers < 2) {
              nereus.buffs.nereusC2Triggers++;
              Object.keys(nereus.cooldowns).forEach(k => {
                if (nereus.cooldowns[k] > 0) nereus.cooldowns[k]--;
              });
              if (floatText) floatText(nereus.uid, "💧 КД -1 (C2)", "text-blue-300 text-xs font-bold");
            }
          }

          let rxnExploded = false;
          // 2. Reaction explosion:
          // If hit caused elemental reaction, flower additionally explodes: 15% Max HP Hydro DMG and spreads Hydro to remaining enemies.
          // Max 1 reaction explosion per turn per enemy.
          if (reactionMsg && !flower.rxnExplosionUsedThisTurn) {
            rxnExploded = true;
            flower.rxnExplosionUsedThisTurn = true;
            const rxnMult = Math.round(nereus.stats.maxHp * 0.15) / Math.max(1, nereus.stats.atk);
            if (log) log(`Взрыв Морского цветка на ${target.name}! Волна Hydro окутывает противников!`);
            if (floatText) floatText(target.uid, "💥 РЕАКЦИОННЫЙ ВЗРЫВ", "text-blue-400 font-black text-xs");
            dealDamage(nereus, target, rxnMult, "Hydro", log, floatText, playEffect, 1, { ...state, isSubDmg: true });

            // Spread Hydro to all other alive enemies
            state.enemyParty.forEach(e => {
              if (e.stats.hp > 0 && e.uid !== target.uid) {
                e.aura = "Hydro";
              }
            });

            // C4: When flower explodes after elemental reaction, all other enemies take additional 10% Max HP Hydro DMG.
            if (c >= 4) {
              const c4Mult = Math.round(nereus.stats.maxHp * 0.10) / Math.max(1, nereus.stats.atk);
              state.enemyParty.forEach(e => {
                if (e.stats.hp > 0 && e.uid !== target.uid) {
                  dealDamage(nereus, e, c4Mult, "Hydro", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
                }
              });
            }

            // C5: While Garden of Eternal Sea is active, first reaction explosion each turn deals +20% Max HP Hydro DMG to all enemies.
            if (c >= 5 && (nereus.buffs.nereusGardenTurns ?? 0) > 0 && !nereus.buffs.nereusC5UsedThisTurn) {
              nereus.buffs.nereusC5UsedThisTurn = true;
              const c5Mult = Math.round(nereus.stats.maxHp * 0.20) / Math.max(1, nereus.stats.atk);
              state.enemyParty.forEach(e => {
                if (e.stats.hp > 0) {
                  dealDamage(nereus, e, c5Mult, "Hydro", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
                }
              });
              if (floatText) floatText(nereus.uid, "🌊 ВЕЧНЫЙ ПРИЛИВ (+20% HP)", "text-cyan-300 text-xs font-bold");
            }

            // C6: After flower triggers reaction explosion for the 3rd time within Nereus application, Great Bloom occurs (50% Max HP Hydro DMG to all enemies).
            if (c >= 6) {
              nereus.buffs.nereusC6RxnCount = (nereus.buffs.nereusC6RxnCount || 0) + 1;
              if (nereus.buffs.nereusC6RxnCount >= 3) {
                nereus.buffs.nereusC6RxnCount = 0;
                const c6Mult = Math.round(nereus.stats.maxHp * 0.50) / Math.max(1, nereus.stats.atk);
                state.enemyParty.forEach(e => {
                  if (e.stats.hp > 0) {
                    dealDamage(nereus, e, c6Mult, "Hydro", log, floatText, playEffect, 1, { ...state, isSubDmg: true });
                  }
                });
                if (floatText) floatText(nereus.uid, "🪸 ВЕЛИКОЕ ЦВЕТЕНИЕ (50% HP) 🪸", "text-cyan-400 font-black text-sm");
                if (log) log(`✨ ВЕЛИКОЕ ЦВЕТЕНИЕ НЕРЕУСА охватывает всех врагов! ✨`);
              }
            }
          }

          // Flower hit consumption rule:
          // C1: reaction explosion does not consume a hit.
          // Garden of Eternal Sea: flowers do not disappear after reaction explosion and continue until hits are exhausted.
          const isGardenActive = (nereus.buffs.nereusGardenTurns ?? 0) > 0;
          const preserveHit = rxnExploded && (c >= 1 || isGardenActive);
          if (!preserveHit) {
            flower.hits--;
            if (flower.hits <= 0) {
              delete target.buffs.nereusFlower;
              if (floatText) floatText(target.uid, "Цветок увял", "text-white/50 text-xs");
            }
          }
        }
      }

      // Iva Floral Bond: Every 2nd ally attack creates 1 Thorn (up to 2 times per turn)
      if (state && !source.isEnemy && !state.isSubDmg && i === hits - 1 && target && target.stats.hp > 0) {
        const iva = state.playerParty.find(p => p.id === 'iva' && p.stats.hp > 0);
        if (iva && (iva.buffs.ivaFloralBondTurns ?? 0) > 0) {
          iva.buffs.ivaAllyAttackCount = (iva.buffs.ivaAllyAttackCount || 0) + 1;
          if (iva.buffs.ivaAllyAttackCount % 2 === 0 && (iva.buffs.ivaThornsGeneratedThisTurn || 0) < 2) {
            iva.buffs.ivaThornsGeneratedThisTurn = (iva.buffs.ivaThornsGeneratedThisTurn || 0) + 1;
            target.buffs.thorns = Math.min((target.buffs.thorns || 0) + 1, 3);
            if (floatText) floatText(target.uid, `🌿 +1 ШИП (${target.buffs.thorns}/3)`, "text-emerald-400 font-bold text-xs");
            if (log) log(`«Связь с флорой» Ивы создаёт 1 Шип на ${target.name} (${target.buffs.thorns}/3)!`);

            // C1: +10% ATK on ally for 1 turn
            if (iva.constellation >= 1) {
              source.buffs.atk = (source.buffs.atk || 0) + Math.round(source.stats.atk * 0.10);
              if (floatText) floatText(source.uid, "+10% ATK (C1)", "text-emerald-300 font-bold text-xs");
            }

            // C3: Every 2nd attack restoring 5% HP (max 2 times per turn)
            if (iva.constellation >= 3 && (iva.buffs.ivaC3HealsThisTurn || 0) < 2) {
              iva.buffs.ivaC3HealsThisTurn = (iva.buffs.ivaC3HealsThisTurn || 0) + 1;
              const c3Heal = Math.round(source.stats.maxHp * 0.05);
              source.stats.hp = Math.min(source.stats.maxHp, source.stats.hp + c3Heal);
              if (floatText) floatText(source.uid, `+${c3Heal} HP (C3)`, "text-green-400 font-bold text-xs");
            }

            notifyThornAcquired(source, target, state, log, floatText, playEffect);
          }
        }
      }
    }, i * hitDelay);
  }
};

export const ARTIFACT_SETS: Record<string, ArtifactSet> = {
  "storm_mirror": {
    id: "storm_mirror",
    name: "Грозовое Зеркало",
    twoPieceBonus: "+15% Электро урон",
    fourPieceBonus: "Увеличивает урон реакции Отражение на 20%. При вызове реакции атака отряда увеличивается на 20% (для Зефира).",
    bonusEffect: (c) => {}
  },
  "crystal_resonance": {
    id: "crystal_resonance",
    name: "Кристаллический Резонанс",
    twoPieceBonus: "+20% Защита",
    fourPieceBonus: "При вызове реакции Отражение Крит. урон отряда увеличивается на 30%.",
    bonusEffect: (c) => {}
  },
  "shards_of_dawn": {
    id: "shards_of_dawn",
    name: "Осколки Последнего Рассвета",
    twoPieceBonus: "Увеличивает урон реакций Отражение и Перегрузка на 20%.",
    fourPieceBonus: "При Отражении дает 1 ур. Преломления (макс 3) на 10 сек. Каждый уровень дает +12% к урону Отражения и +6% к Крит. урону. При 3 ур. следующий удар наносит +40% доп. Пиро-урона.",
    bonusEffect: (c) => {}
  },
  "blazing_rose": {
    id: "blazing_rose",
    name: "Алая Роза",
    twoPieceBonus: "+18% Сила Атаки",
    fourPieceBonus: "+40% Пиро урон и +20% урон реакций",
    bonusEffect: (c) => {
      c.buffs.atk = (c.buffs.atk || 0) + Math.floor(c.stats.atk * 0.18);
    }
  },
  "frozen_time": {
    id: "frozen_time",
    name: "Замёрзшее Время",
    twoPieceBonus: "+15% Крио урон",
    fourPieceBonus: "+20% Шанс Крита по врагам со статусом",
    bonusEffect: (c) => {
      // Logic handled in dealDamage or specific skills
    }
  },
  "wolf_instinct": {
    id: "wolf_instinct",
    name: "Инстинкт Волка",
    twoPieceBonus: "+15% Дендро урон",
    fourPieceBonus: "Атаки зверя снижают сопротивление на 20%",
    bonusEffect: (c) => {}
  },
  "ocean_song": {
    id: "ocean_song",
    name: "Песнь Океана",
    twoPieceBonus: "+15% Гидро урон",
    fourPieceBonus: "При вызове элементальной реакции увеличивает урон всей команды на 20% на 2 хода.",
    bonusEffect: (c) => {}
  },
  "shattered_winter": {
    id: "shattered_winter",
    name: "Расколотая Зима",
    twoPieceBonus: "+15% Крио урон",
    fourPieceBonus: "За каждый полученный осколок или стак баффа крит. урон увеличивается на 10% (до 40%). Урон по замороженным врагам +20%.",
    bonusEffect: (c) => {}
  },
  "gladiator": {
    id: "gladiator",
    name: "Конец Гладиатора",
    twoPieceBonus: "+18% Сила Атаки",
    fourPieceBonus: "+35% Урон обычных атак",
    bonusEffect: (c) => {
      c.buffs.atk = (c.buffs.atk || 0) + Math.floor(c.stats.atk * 0.18);
    }
  },
  "isolation_protocol": {
    id: "isolation_protocol",
    name: "Протокол Изоляции",
    twoPieceBonus: "+15% Электро урон",
    fourPieceBonus: "+30% Крит. урон и +10% Скорости",
    bonusEffect: (c) => {
      c.buffs.critDamage = (c.buffs.critDamage || 0) + 30;
      c.buffs.spd = (c.buffs.spd || 0) + 10;
    }
  },
  "echo_of_solitude": {
    id: "echo_of_solitude",
    name: "Эхо Одиночества",
    twoPieceBonus: "+15% Электро урон",
    fourPieceBonus: "При атаке одиночной цели игнорирует 15% защиты",
    bonusEffect: (c) => {}
  },
  "noblesse": {
    id: "noblesse",
    name: "Церемония Древней Знати",
    twoPieceBonus: "+20% Урон навыков",
    fourPieceBonus: "Ульта баффает АТК отряда на 20%",
    bonusEffect: (c) => {}
  },
  "bounty_hunter": {
    id: "bounty_hunter",
    name: "Гордость Дуэлянта",
    twoPieceBonus: "+25% Физический урон",
    fourPieceBonus: "+40% Крит. урон после использования навыка. Дает +15 Скорости.",
    bonusEffect: (c) => {
      c.buffs.spd = (c.buffs.spd || 0) + 15;
    }
  },
  "ashes_of_forge": {
    id: "ashes_of_forge",
    name: "Пепел Запретного Горна",
    twoPieceBonus: "+20% HP",
    fourPieceBonus: "Урон Горения +50%, Крит. Урон отряда по Горящим врагам +40%",
    bonusEffect: (c) => {
      c.stats.hp = Math.floor(c.stats.hp * 1.2);
      c.stats.maxHp = c.stats.hp;
    }
  },
  "voltage_circuit": {
    id: "voltage_circuit",
    name: "Проводящий Контур",
    twoPieceBonus: "+20% HP",
    fourPieceBonus: "При получении урона или поглощении щитом увеличивает Защиту отряда на 15% и силу лечения на 25% на 2 хода.",
    bonusEffect: (c) => {
      c.stats.hp = Math.floor(c.stats.hp * 1.2);
      c.stats.maxHp = c.stats.hp;
    }
  },
  "absolute_zero": {
    id: "absolute_zero",
    name: "Абсолютный Ноль",
    twoPieceBonus: "+15% Крио урон",
    fourPieceBonus: "Атаки по Переохлажденным целям наносят на 25% больше урона и имеют +15% Шанса крита. При возникновении Критического переохлаждения дает +20% ATB.",
    bonusEffect: (c) => {}
  },
  "coral_tide": {
    id: "coral_tide",
    name: "Коралловый Прилив",
    twoPieceBonus: "+20% HP",
    fourPieceBonus: "Увеличивает урон Гидро-атак и навыков, зависящих от HP, на 35%. При создании или взрыве Морского цветка крит. урон персонажа повышается на 40%, а урон Гидро-реакций всего отряда увеличивается на 25% на 2 хода.",
    bonusEffect: (c) => {
      c.stats.hp = Math.floor(c.stats.hp * 1.20);
      c.stats.maxHp = c.stats.hp;
    }
  },
  "thorn_whisper": {
    id: "thorn_whisper",
    name: "Шёпот Терновника",
    twoPieceBonus: "+20% Эффективность лечения и +15 Скорости",
    fourPieceBonus: "При активации «Связи с флорой» или генерации Шипов увеличивает силу атаки всего отряда на 20% и ускоряет набор ATB на 15%. Снижает сопротивление врагов к стихиям ещё на 10%.",
    bonusEffect: (c) => {
      c.buffs.spd = (c.buffs.spd || 0) + 15;
      c.stats.hp = Math.floor(c.stats.hp * 1.15);
      c.stats.maxHp = c.stats.hp;
    }
  }
};

export const CHARACTER_PREFERENCES: Record<string, { main: string[], sub: string[], sets: string[] }> = {
  volta: { main: ["hp", "def", "spd"], sub: ["hp", "def", "spd"], sets: ["voltage_circuit", "ashes_of_forge"] },
  snezhana: { main: ["atk", "spd", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["absolute_zero", "frozen_time"] },
  zephyr: { main: ["atk", "spd", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["isolation_protocol", "echo_of_solitude"] },
  aurum: { main: ["def", "hp", "spd"], sub: ["def", "hp", "spd"], sets: ["crystal_resonance", "voltage_circuit"] },
  rix: { main: ["hp", "spd", "atk"], sub: ["hp", "spd", "atk"], sets: ["voltage_circuit"] },
  ineffa: { main: ["atk", "critDamage", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["ashes_of_forge", "gladiator"] },
  volosatinya: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  gotka: { main: ["atk", "critDamage", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  kopro: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  selva: { main: ["atk", "spd", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  moyan: { main: ["hp", "def", "spd"], sub: ["hp", "def", "spd"], sets: ["voltage_circuit"] },
  aelita: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  asher: { main: ["hp", "spd", "def"], sub: ["hp", "spd", "def"], sets: ["voltage_circuit"] },
  selina: { main: ["atk", "critDamage", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  neuron: { main: ["atk", "spd", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["isolation_protocol"] },
  krona: { main: ["spd", "atk", "critRate"], sub: ["spd", "atk", "critRate", "critDamage"], sets: ["gladiator"] },
  cyrus: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  raven: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  echo: { main: ["spd", "atk", "critRate"], sub: ["spd", "atk", "critRate", "critDamage"], sets: ["gladiator"] },
  patch: { main: ["hp", "spd", "def"], sub: ["hp", "spd", "def"], sets: ["voltage_circuit"] },
  claymore: { main: ["atk", "def"], sub: ["atk", "def", "critRate", "critDamage"], sets: ["gladiator"] },
  viper: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  spark: { main: ["spd", "atk", "critRate"], sub: ["spd", "atk", "critRate", "critDamage"], sets: ["gladiator"] },
  aegis: { main: ["def", "hp", "spd"], sub: ["def", "hp", "spd"], sets: ["crystal_resonance", "voltage_circuit"] },
  blaze: { main: ["atk", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["ashes_of_forge"] },
  tide: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  nova: { main: ["hp", "atk", "spd"], sub: ["hp", "atk", "spd"], sets: ["voltage_circuit"] },
  glacier: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["absolute_zero"] },
  pulse: { main: ["spd", "atk", "critRate"], sub: ["spd", "atk", "critRate", "critDamage"], sets: ["isolation_protocol"] },
  gaia: { main: ["hp", "spd", "def"], sub: ["hp", "spd", "def"], sets: ["voltage_circuit"] },
  fenris: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["gladiator"] },
  farina: { main: ["atk", "spd", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["noblesse", "frozen_time", "shattered_winter"] },
  kairen: { main: ["atk", "spd", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["shattered_winter", "gladiator"] },
  aveline: { main: ["hp", "spd", "def"], sub: ["hp", "spd", "def"], sets: ["ocean_song", "voltage_circuit"] },
  nereus: { main: ["hp", "critDamage", "critRate", "spd"], sub: ["hp", "critDamage", "critRate", "spd"], sets: ["coral_tide", "ocean_song", "voltage_circuit"] },
  iva: { main: ["hp", "spd", "def"], sub: ["hp", "spd", "def"], sets: ["thorn_whisper", "voltage_circuit", "ocean_song"] },
  kern: { main: ["def", "critDamage", "critRate", "spd"], sub: ["def", "critDamage", "critRate", "spd"], sets: ["crystal_resonance", "gladiator", "voltage_circuit"] },
  maestro: { main: ["atk", "critDamage", "critRate", "spd"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["isolation_protocol", "ashes_of_forge"] },
  kamikaze: { main: ["atk", "spd", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"], sets: ["ashes_of_forge"] },
};

export const scoreArtifact = (art: Artifact, charId: string): number => {
  const prefs = CHARACTER_PREFERENCES[charId] || { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"], sets: [] };
  
  // Base score from rarity (1000 - 5000)
  let score = art.rarity * 1000;
  
  // Level weight
  score += art.level * 40;

  // Main stat weight with strict hierarchy
  const mainIdx = prefs.main.indexOf(art.mainStat.type);
  if (mainIdx === 0) {
    // Top priority stat (e.g. HP for Nereus/Iva, DEF for Kern, ATK for DPS)
    score += 25000;
  } else if (mainIdx === 1) {
    score += 15000;
  } else if (mainIdx === 2) {
    score += 10000;
  } else if (mainIdx >= 3) {
    score += 6000;
  } else {
    // Main stat NOT in character's desired list
    if (art.slot === 'plume' || art.slot === 'flower') {
      // Flower is fixed HP, Plume is fixed ATK by system design
      score += 1000;
    } else {
      // Variable slot (sands, goblet, circlet): massive penalty for unwanted main stat!
      score -= 25000;
    }
  }

  // Set bonus weight
  if (prefs.sets && prefs.sets.includes(art.setName)) {
    const setIdx = prefs.sets.indexOf(art.setName);
    score += Math.max(1000, 4000 - setIdx * 1000);
  }

  // Sub stats weight (normalized according to stat magnitude and priority)
  art.subStats?.forEach(s => {
    const subIdx = prefs.sub.indexOf(s.type);
    if (subIdx !== -1) {
      let statWeight = 0;
      if (s.type === 'critRate') statWeight = s.value * 120;
      else if (s.type === 'critDamage') statWeight = s.value * 60;
      else if (s.type === 'spd') statWeight = s.value * 90;
      else if (s.type === 'hp' || s.type === 'atk' || s.type === 'def') statWeight = s.value * 6;
      
      const priorityMult = Math.max(0.6, 2.0 - subIdx * 0.4);
      score += Math.round(statWeight * priorityMult);
    } else {
      // Penalty for ATK substat on characters that scale purely with HP or DEF
      if (s.type === 'atk' && (prefs.main[0] === 'hp' || prefs.main[0] === 'def')) {
        score -= 500;
      }
    }
  });

  return score;
};

export const ARTIFACT_DUNGEONS: Dungeon[] = [
  {
    id: "domain_frozen_tide",
    name: "Храм Замерзшего Прилива",
    description: 'Древний храм, где океан навеки скован льдами. Здесь добываются сеты Песнь Океана и Расколотая Зима.',
    level: 90,
    entryCost: 20,
    rewardSets: ["ocean_song", "shattered_winter"],
    enemyTeam: ["aveline", "kairen", "glacier"],
    effectDescription: "Гидро и Крио урон увеличен на 30%. Заморозка длится дольше.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Hydro' || p.element === 'Cryo') p.buffs.atk = (p.buffs.atk || 0) + 80; 
      });
    }
  },
  {
    id: "domain_illusions",
    name: "Врата Иллюзий",
    description: 'Пространство обмана и зеркальных копий. Здесь добываются сеты Грозовое Зеркало и Кристаллический Резонанс.',
    level: 85,
    entryCost: 20,
    rewardSets: ["storm_mirror", "crystal_resonance"],
    enemyTeam: ["neuron", "pulse", "neuron"],
    effectDescription: "Электро урон и Защита отряда увеличены на 40%.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Electro') p.buffs.atk = (p.buffs.atk || 0) + 120;
        p.buffs.defBoost = (p.buffs.defBoost || 0) + 40;
      });
    }
  },
  {
    id: "domain_dawn",
    name: "Обитель Рассвета",
    description: 'Зеркальное святилище, искажающее свет. Здесь добываются сеты Осколки Последнего Рассвета и Эхо Одиночества.',
    level: 85,
    entryCost: 20,
    rewardSets: ["shards_of_dawn", "echo_of_solitude"],
    enemyTeam: ["neuron", "blaze", "neuron"],
    effectDescription: "Реакции Отражение и Перегрузка наносят двойной урон.",
    effect: (state) => {
      // Passive effect representation
    }
  },
  {
    id: "domain_flame",
    name: "Пик Розы",
    description: 'Дворец, объятый пламенем. Здесь добываются сеты Алой Розы и Гладиатора.',
    level: 80,
    entryCost: 20,
    rewardSets: ["blazing_rose", "gladiator"],
    enemyTeam: ["kamikaze", "blaze", "kamikaze"],
    effectDescription: "Пиро урон увеличен на 50%. Враги атакуют быстрее.",
    effect: (state) => {
      state.playerParty.forEach(p => { if (p.element === 'Pyro') p.buffs.atk = (p.buffs.atk || 0) + 100; });
    }
  },
  {
    id: "domain_frost",
    name: "Шпиль Времени",
    description: 'Замерзшая башня, где время течет иначе. Сеты Замёрзшего Времени и Знати.',
    level: 80,
    entryCost: 20,
    rewardSets: ["frozen_time", "noblesse"],
    enemyTeam: ["glacier", "krona", "glacier"],
    effectDescription: "Крио реакции наносят двойной урон. Скорость ATB снижена.",
    effect: (state) => {
      state.playerParty.forEach(p => { if (p.element === 'Cryo') p.buffs.atk = (p.buffs.atk || 0) + 120; });
    }
  },
  {
    id: "domain_ashes",
    name: "Кузница Пепла",
    description: 'Древний горн, где рождаются легенды. Здесь добываются сеты Пепла Запретного Горна и Инстинкта Волка.',
    level: 90,
    entryCost: 20,
    rewardSets: ["ashes_of_forge", "wolf_instinct"],
    enemyTeam: ["claymore", "aegis", "claymore"],
    effectDescription: "Дендро и Пиро персонажи получают +40% Крит. Урона.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Dendro' || p.element === 'Pyro') {
          p.buffs.critDamage = (p.buffs.critDamage || 0) + 40; 
        }
      });
    }
  },
  {
    id: "domain_neon",
    name: "Сектор Неона",
    description: 'Заброшенный кибер-сектор, освещённый неоном. Обитель протоколов безопасности. Здесь добываются сеты Протокол Изоляции и Церемония Древней Знати.',
    level: 85,
    entryCost: 20,
    rewardSets: ["isolation_protocol", "noblesse"],
    enemyTeam: ["raven", "spark", "pulse"],
    effectDescription: "Скорость врагов повышена на 15. Электро урон союзников +40%.",
    effect: (state) => {
      state.playerParty.forEach(p => { if (p.element === 'Electro') p.buffs.atk = (p.buffs.atk || 0) + 80; });
      state.enemyParty.forEach(e => { e.buffs.spd = (e.buffs.spd || 0) + 15; });
    }
  },
  {
    id: "domain_duel",
    name: "Арена Охотников",
    description: 'Старый амфитеатр, где проливалась кровь лучших бойцов. Сеты Гордость Дуэлянта и Конец Гладиатора.',
    level: 85,
    entryCost: 20,
    rewardSets: ["bounty_hunter", "gladiator"],
    enemyTeam: ["nova", "cyrus", "nova"],
    effectDescription: "Физический урон увеличен на 60%. Крит урон увеличен на 30%.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Physical') {
          p.buffs.atk = (p.buffs.atk || 0) + 100;
          p.buffs.critDamage = (p.buffs.critDamage || 0) + 30;
        }
      });
    }
  },
  {
    id: "domain_symphony",
    name: "Театр Иллюзий",
    description: 'Старый театр, где эхо прошлых выступлений сводит с ума. Добываются сеты Протокол Изоляции и Эхо Одиночества.',
    level: 85,
    entryCost: 20,
    rewardSets: ["isolation_protocol", "echo_of_solitude"],
    enemyTeam: ["echo", "raven", "pulse"],
    effectDescription: "Электро урон увеличен на 60%. Персонажи с меткой изоляции игнорируют 20% защиты врага.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Electro') {
          p.buffs.atk = (p.buffs.atk || 0) + 120;
        }
      });
    }
  },
  {
    id: "domain_cryothunder",
    name: "Шпиль Сверхпроводимости",
    description: 'Древний пик, окутанный вечной грозой и ледяным штормом. Здесь добываются новые комплекты артефактов Проводящий Контур и Абсолютный Ноль, идеально подходящие для Вольты и Снежаны.',
    level: 85,
    entryCost: 20,
    rewardSets: ["voltage_circuit", "absolute_zero"],
    enemyTeam: ["volta", "snezhana", "volta"],
    effectDescription: "Крио и Электро урон отряда увеличен на 45%. При возникновении реакции Сверхпроводник или Критического переохлаждения, отряд немедленно продвигает свое ATB на 15%.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Cryo' || p.element === 'Electro') {
          p.buffs.atk = (p.buffs.atk || 0) + 130;
        }
      });
    }
  },
  {
    id: "domain_verdant_tide",
    name: "Святилище Прилива и Терний",
    description: 'Древнее затопленное святилище на стыке измерений, где прозрачные приливные воды омывают первозданный терновник. Здесь добываются новые сеты Коралловый Прилив (для Нереуса) и Шёпот Терновника (для Ивы).',
    level: 90,
    entryCost: 20,
    rewardSets: ["coral_tide", "thorn_whisper"],
    enemyTeam: ["nereus", "iva", "void_prism"],
    effectDescription: "Гидро и Дендро урон отряда увеличен на 50%. При вызове реакций с участием Гидро или Дендро союзники восстанавливают 10% HP и продвигают свое действие на 15% ATB.",
    effect: (state) => {
      state.playerParty.forEach(p => { 
        if (p.element === 'Hydro' || p.element === 'Dendro') {
          p.buffs.atk = (p.buffs.atk || 0) + 140;
          p.buffs.critDamage = (p.buffs.critDamage || 0) + 35;
        }
      });
    }
  }
];

export const formatStatName = (type: string): string => {
  switch (type) {
    case 'hp': return 'HP';
    case 'atk': return 'ATK';
    case 'def': return 'DEF';
    case 'spd': return 'SPD';
    case 'critRate': return 'Крит Шанс';
    case 'critDamage': return 'Крит Урон';
    default: return type.toUpperCase();
  }
};

export const formatStatValue = (type: string, value: number): string => {
  if (type === 'critRate' || type === 'critDamage') {
    const num = Math.round((value || 0) * 10) / 10;
    return `+${num}%`;
  }
  return `+${Math.round(value || 0)}`;
};

export const generateArtifact = (setName: string, rarity: number = 5): Artifact => {
  const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  let mainStatType: StatType | "critRate" | "critDamage";
  if (slot === "flower") {
    mainStatType = "hp";
  } else if (slot === "plume") {
    mainStatType = "atk";
  } else if (slot === "circlet") {
    const circletPool: (StatType | "critRate" | "critDamage")[] = ["hp", "atk", "def", "spd", "critRate", "critDamage", "critRate", "critDamage"];
    mainStatType = circletPool[Math.floor(Math.random() * circletPool.length)];
  } else {
    const mainPool: (StatType | "critRate" | "critDamage")[] = ["hp", "atk", "def", "spd", "critRate", "critDamage"];
    mainStatType = mainPool[Math.floor(Math.random() * mainPool.length)];
  }

  let mainVal = rarity * 50 + (slot === "flower" ? 100 : 20);
  if (mainStatType === "spd") {
    mainVal = Math.floor(mainVal * 0.12);
  } else if (mainStatType === "critRate") {
    // Genshin 5★ CR main stat: 3.1% at lvl 0 (+1.4% per lvl -> 31.1% at lvl 20)
    mainVal = Number((rarity * 0.62).toFixed(1));
  } else if (mainStatType === "critDamage") {
    // Genshin 5★ CD main stat: 6.2% at lvl 0 (+2.8% per lvl -> 62.2% at lvl 20)
    mainVal = Number((rarity * 1.24).toFixed(1));
  }

  const subStats: ArtifactSubStat[] = [];
  const numSubs = Math.floor(Math.random() * 3) + 2; // 2..4 substats
  const allSubTypes: (StatType | "critRate" | "critDamage")[] = ["hp", "atk", "def", "spd", "critRate", "critDamage"];
  const availableSubTypes = allSubTypes.filter(t => t !== mainStatType);

  for (let i = 0; i < numSubs; i++) {
    if (availableSubTypes.length === 0) break;
    const pickIdx = Math.floor(Math.random() * availableSubTypes.length);
    const type = availableSubTypes.splice(pickIdx, 1)[0];

    let value = Math.floor(Math.random() * 20 * rarity) + 5;
    if (type === "spd") {
      value = Math.floor(Math.random() * 1.5 * rarity) + 1;
    } else if (type === "critRate") {
      // Genshin 5★ CR substat initial roll: 2.7% - 3.9%
      const roll = (Math.random() * 1.2 + 2.7) * (rarity / 5);
      value = Number(roll.toFixed(1));
    } else if (type === "critDamage") {
      // Genshin 5★ CD substat initial roll: 5.4% - 7.8%
      const roll = (Math.random() * 2.4 + 5.4) * (rarity / 5);
      value = Number(roll.toFixed(1));
    }

    subStats.push({ type, value });
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    slot,
    setName,
    mainStat: { type: mainStatType, value: mainVal },
    subStats,
    rarity,
    level: 0
  };
};

export const applySetBonuses = (combatant: Combatant, artifacts: Artifact[]) => {
  const setCounts: Record<string, number> = {};
  artifacts.forEach(a => {
    setCounts[a.setName] = (setCounts[a.setName] || 0) + 1;
  });

  Object.entries(setCounts).forEach(([setName, count]) => {
    const set = ARTIFACT_SETS[setName];
    if (set) {
      if (count >= 2) {
        if (setName === 'blazing_rose' || setName === 'gladiator') {
           combatant.buffs.atk = (combatant.buffs.atk || 0) + Math.floor(combatant.stats.atk * 0.18);
        } else if (setName === 'frozen_time') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15; // 15% Cryo dmg (generalized as dmgBoost for simplicity)
        } else if (setName === 'noblesse') {
           combatant.buffs.skillDmg = (combatant.buffs.skillDmg || 0) + 20;
        } else if (setName === 'wolf_instinct') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15;
        } else if (setName === 'ashes_of_forge') {
           combatant.buffs.hpBoost = (combatant.buffs.hpBoost || 0) + 20;
        } else if (setName === 'isolation_protocol' || setName === 'echo_of_solitude' || setName === 'bounty_hunter') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15;
        } else if (setName === 'shards_of_dawn') {
           combatant.buffs.reflectionDmgBonus = (combatant.buffs.reflectionDmgBonus || 0) + 0.20;
        } else if (setName === 'storm_mirror') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15;
        } else if (setName === 'ocean_song') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15;
        } else if (setName === 'shattered_winter') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 15;
        } else if (setName === 'crystal_resonance') {
           combatant.buffs.defBoost = (combatant.buffs.defBoost || 0) + 20;
           combatant.stats.def = Math.floor(combatant.stats.def * 1.20);
        } else if (setName === 'coral_tide') {
           combatant.buffs.hpBoost = (combatant.buffs.hpBoost || 0) + 20;
           combatant.stats.hp = Math.floor(combatant.stats.hp * 1.20);
           combatant.stats.maxHp = combatant.stats.hp;
        } else if (setName === 'thorn_whisper') {
           combatant.buffs.spd = (combatant.buffs.spd || 0) + 15;
           combatant.buffs.hpBoost = (combatant.buffs.hpBoost || 0) + 15;
           combatant.buffs.healBoost = (combatant.buffs.healBoost || 0) + 20;
        }
      }
      if (count >= 4) {
        if (setName === 'blazing_rose') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 40;
        } else if (setName === 'gladiator') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 35;
        } else if (setName === 'frozen_time') {
           combatant.buffs.critChance = (combatant.buffs.critChance || 0) + 20;
        } else if (setName === 'ashes_of_forge') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 25; // Burning and general dmg
           combatant.buffs.critDamage = (combatant.buffs.critDamage || 0) + 40;
        } else if (setName === 'isolation_protocol') {
           combatant.buffs.critDamage = (combatant.buffs.critDamage || 0) + 30;
           combatant.buffs.spd = (combatant.buffs.spd || 0) + 10;
        } else if (setName === 'bounty_hunter') {
           combatant.buffs.critChance = (combatant.buffs.critChance || 0) + 10;
           combatant.buffs.critDamage = (combatant.buffs.critDamage || 0) + 20;
        } else if (setName === 'echo_of_solitude') {
           combatant.buffs.defIgnoreBoost = (combatant.buffs.defIgnoreBoost || 0) + 0.15;
        } else if (setName === 'shards_of_dawn') {
           combatant.buffs.shardsOfDawn4pc = 1;
        } else if (setName === 'storm_mirror') {
           combatant.buffs.stormMirror4pc = 1;
           combatant.buffs.reflectionDmgBonus = (combatant.buffs.reflectionDmgBonus || 0) + 0.20;
        } else if (setName === 'crystal_resonance') {
           combatant.buffs.crystalResonance4pc = 1;
        } else if (setName === 'noblesse') {
           combatant.buffs.noblesse4pc = 1;
        } else if (setName === 'coral_tide') {
           combatant.buffs.dmgBoost = (combatant.buffs.dmgBoost || 0) + 35;
           combatant.buffs.critDamage = (combatant.buffs.critDamage || 0) + 40;
           combatant.buffs.coralTide4pc = 1;
        } else if (setName === 'thorn_whisper') {
           combatant.buffs.atk = (combatant.buffs.atk || 0) + Math.floor(combatant.stats.atk * 0.20);
           combatant.buffs.defIgnoreBoost = (combatant.buffs.defIgnoreBoost || 0) + 0.10;
           combatant.buffs.thornWhisper4pc = 1;
        }
      }
    }
  });
};

const scaleStats = (baseHp: number, baseAtk: number, baseDef: number, baseSpd: number, level: number, c: number, artifacts: Artifact[] = [], isAbyss: boolean = false, isBoss: boolean = false) => {
  let hpMult = isAbyss ? (isBoss ? 6 : 2.5) : 1;
  let atkMult = isAbyss ? (isBoss ? 1.4 : 1.1) : 1;
  
  let hp = Math.floor(baseHp * (1 + (level - 1) * 0.05 + c * 0.1) * hpMult);
  let atk = Math.floor(baseAtk * (1 + (level - 1) * 0.05 + c * 0.15) * atkMult);
  let def = Math.floor(baseDef * (1 + (level - 1) * 0.05 + c * 0.1) * (isAbyss ? 1.2 : 1));
  let spd = baseSpd + Math.floor(c * 2) + (isAbyss ? 2 : 0);

  let critRate = 5; // Base 5%
  let critDamage = 50; // Base 50%

  // Stats from artifacts
  artifacts.forEach(art => {
    if (!art) return;
    const subStats = art.subStats || [];
    const stats = [art.mainStat, ...subStats];
    stats.forEach(s => {
      if (!s || !s.type) return;
      const sVal = s.value || 0;
      if (s.type === 'hp') hp += Math.round(sVal);
      if (s.type === 'atk') atk += Math.round(sVal);
      if (s.type === 'def') def += Math.round(sVal);
      if (s.type === 'spd') spd += Math.round(sVal);
      if (s.type === 'critRate') critRate += sVal;
      if (s.type === 'critDamage') critDamage += sVal;
    });
  });

  const finalHp = Math.round(hp);
  const finalAtk = Math.round(atk);
  const finalDef = Math.round(def);
  const finalSpd = Math.round(Math.min(180, spd)); // Hard cap speed to prevent infinite turns
  const finalCritRate = Math.round(critRate * 10) / 10;
  const finalCritDamage = Math.round(critDamage * 10) / 10;
  return { hp: finalHp, maxHp: finalHp, atk: finalAtk, def: finalDef, spd: finalSpd, critRate: finalCritRate, critDamage: finalCritDamage };
};

export const charRarity: Record<string, Rarity> = {
  kern: 'A',
  iva: 'S',
  nereus: 'S',
  aveline: 'S',
  kairen: 'S',
  zephyr: "S",
  aurum: "S",
  rix: "A",
  maestro: "S",
  ineffa: "S",
  asher: "S",
  volosatinya: "B",
  kamikaze: "B",
  patch: "B",
  gotka: "A",
  kopro: "A",
  echo: "A",
  selva: "S",
  moyan: "S",
  aelita: "S",
  selina: "S",
  neuron: "S",
  krona: "S",
  cyrus: "S",
  raven: "S",
  claymore: "A",
  viper: "A",
  spark: "B",
  aegis: "A",
  blaze: "A",
  tide: "A",
  nova: "B",
  glacier: "A",
  pulse: "A",
  gaia: "A",
  fenris: "S",
  volta: "S",
  snezhana: "A",
  farina: "B"
};

export const getCharEmoji = (id: string): string => {
  switch (id) {
    case 'kern': return '⛏️';
    case 'iva': return '🌿';
    case 'nereus': return '🪸';
    case 'aveline': return '🌸';
    case 'kairen': return '❄️';
    case 'snezhana': return '❄️';
    case 'farina': return '🌨️';
    case 'volta': return '⚡';
    case 'zephyr': return '⚡';
    case 'aurum': return '🪨';
    case 'rix': return '🔋';
    case 'volosatinya': return '🌊';
    case 'kamikaze': return '💥';
    case 'gotka': return '🔮';
    case 'kopro': return '🌿';
    case 'echo': return '👥';
    case 'selva': return '⚡';
    case 'moyan': return '🪨';
    case 'aelita': return '🍃';
    case 'selina': return '🌹';
    case 'ineffa': return '🪞';
    case 'maestro': return '🎻';
    case 'neuron': return '🧠';
    case 'krona': return '❄️';
    case 'cyrus': return '🎯';
    case 'raven': return '🔪';
    case 'patch': return '🩹';
    case 'claymore': return '🧨';
    case 'viper': return '🐍';
    case 'spark': return '🔌';
    case 'aegis': return '🛡️';
    case 'blaze': return '🔥';
    case 'tide': return '🌊';
    case 'nova': return '👊';
    case 'glacier': return '🏔️';
    case 'pulse': return '⚙️';
    case 'gaia': return '🌳';
    case 'fenris': return '🐺';
    case 'asher': return '⚒️';
    default: return '🌟';
  }
};

export interface ConstellationInfo {
  level: number;
  name: string;
  description: string;
}

export { characterConstellations } from "./data/constellationsExport";


export const getCharSplash = (id: string): string | null => {
  return SPLASH_IMAGES[id] || null;
};

export const applySnezhanaOvercool = (source: Combatant, target: Combatant, state: BattleState, ft: any, log: any) => {
  if (target.buffs.critOvercool && target.buffs.critOvercool > 0) {
    if (source.constellation >= 1) {
      target.buffs.critOvercool++;
      if (ft) ft(target.uid, "❄️ ДЛИТЕЛЬНОСТЬ +1", "text-cyan-300 text-xs");
      if (log) log(`${source.name} продлевает действие Критического переохлаждения на ${target.name}!`);
    } else {
      if (ft) ft(target.uid, "Уже переохлажден!", "text-cyan-200 text-xs");
    }
    return;
  }
  const current = target.buffs.overcool || 0;
  if (current >= 3) {
    target.buffs.overcool = 0;
    target.buffs.critOvercool = 2;
    if (ft) ft(target.uid, "🥶 КРИТ. ПЕРЕОХЛАЖДЕНИЕ", "text-cyan-400 font-black text-sm");
    if (log) log(`${target.name} впадает в состояние Критического переохлаждения!`);
    
    if (source.constellation >= 2) {
      state.playerParty.forEach(p => {
        if (p.stats.hp > 0) {
          p.atb = Math.min(100, p.atb + 15);
        }
      });
      if (log) log(`[Эффект С2] Команда получает +15 ATB!`);
    }

    if (source.constellation >= 4) {
      const sortedByHp = [...state.playerParty]
        .filter(p => p.stats.hp > 0)
        .sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp));
      const targetAlly = sortedByHp[0];
      if (targetAlly) {
        const healAmt = Math.floor(source.stats.maxHp * 0.15);
        targetAlly.stats.hp = Math.min(targetAlly.stats.maxHp, targetAlly.stats.hp + healAmt);
        if (ft) ft(targetAlly.uid, `+${healAmt} HP`, "text-green-400 font-bold");
        if (log) log(`[Эффект С4] Снежана исцеляет ${targetAlly.name} на ${healAmt} HP!`);
      }
    }
  } else {
    target.buffs.overcool = current + 1;
    if (ft) ft(target.uid, `❄️ Переохлаждение x${target.buffs.overcool}`, "text-cyan-300 font-bold text-xs");
  }

  if (source.constellation >= 5) {
    target.buffs.spd = (target.buffs.spd || 0) - 10;
  }
};

export const characterBlueprints: Record<string, (uid: string, level: number, c: number, arts?: Artifact[]) => Combatant> = {

  farina: (uid, l, c, arts = []) => ({
    id: 'farina', uid, isEnemy: false, name: 'Фарина', element: 'Cryo', color: 'bg-cyan-600 text-white', level: l, constellation: c,
    image: getCharSplash('farina') || undefined,
    stats: scaleStats(1380, 180, 60, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: {
       farinaDustTriggered: false,
       farinaC5Triggered: false,
       whiteField: 0,
       farinaUltStacks: 0,
       farinaRxnBonus: 0
    },
    skills: [
      {
        id: 'farina_atk', name: 'Тихое просеивание', type: 'Attack', cost: 0, target: 'SingleEnemy',
        description: 'Наносит небольшой Cryo DMG.',
        statsText: "Урон: 55% АТК",
        execute: (s, t, state, log, ft, pl) => {
          let target = t[0];
          dealDamage(s, target, 0.55, 'Cryo', log, ft, pl, 1, state);
        }
      },
      {
        id: 'farina_e', name: 'Белый покров', type: 'Skill1', cost: 3, target: 'SingleEnemy',
        description: 'Наносит Cryo DMG и накладывает «Снежная пыль» на 2 хода. Доп. атаки от союзников.',
        statsText: "Урон: 90% АТК\nДлительность: 2 хода, 2 хода (3 на C2)",
        execute: (s, t, state, log, ft, pl) => {
          let target = t[0];
          dealDamage(s, target, 0.9, 'Cryo', log, ft, pl, 1, state);
          target.buffs.snowDust = c >= 2 ? 3 : 2;
          if (ft) ft(target.uid, "СНЕЖНАЯ ПЫЛЬ", "text-cyan-300 font-bold");
          if (pl) pl(target.uid, "farina_snow_dust");
        }
      },
      {
        id: 'farina_q', name: 'Безмолвие белого поля', type: 'Skill2', cost: 5, target: 'AllEnemies',
        description: 'AoE Cryo DMG всем врагам. Создаёт «Белое поле» на 2 хода.',
        statsText: "Урон: 150% АТК\nДлительность: 2 хода",
        execute: (s, t, state, log, ft, pl) => {
          let mult = 1.5;
          if (c >= 4) {
             mult += (s.buffs.farinaUltStacks || 0) * 0.2;
             s.buffs.farinaUltStacks = 0;
          }
          t.forEach(e => {
            if (e.stats.hp > 0) dealDamage(s, e, mult, 'Cryo', log, ft, pl, 1, state);
          });
          s.buffs.whiteField = 3; // 2 turns + 1 for current
          s.buffs.farinaRxnBonus = 0;
          if (ft) ft(s.uid, "БЕЛОЕ ПОЛЕ", "text-cyan-100 font-bold drop-shadow");
          if (pl) pl(s.uid, "farina_white_field");
        }
      }
    ]
  }),

  kairen: (uid, l, c, arts = []) => ({
    id: 'kairen', uid, isEnemy: false, name: 'Кайрен', element: 'Cryo', color: 'bg-cyan-600 text-white', level: l, constellation: c,
    image: getCharSplash('kairen') || undefined,
    stats: scaleStats(1350, 220, 65, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {
       kairenShards: 0,
       kairenFrostTurns: 0,
       kairenWinterTurns: 0
    },
    skills: [
      {
        id: 'ka_atk', name: 'Ледяной танец', type: 'Attack', cost: 0, target: 'SingleEnemy',
        description: 'Cryo DMG + сплеш урон. Дает 1 Осколок инея за каждого пораженного (2 по замороженным).',
        statsText: "Урон: 100% АТК / 40% АТК",
        execute: (s, t, state, log, ft, pl) => {
          kairenTurnStart(s, t, state, log, ft, pl, c);
          let target = t[0];
          if (pl) pl(target.uid, 'kairen_ice_dance');
          dealDamage(s, target, 1.0, 'Cryo', log, ft, pl, 1, state);
          let shardsGained = target.buffs.frozen ? 2 : 1;
          
          if (state && state.enemyParty) {
            state.enemyParty.forEach(e => {
              if (e.uid !== target.uid && e.stats.hp > 0) {
                dealDamage(s, e, 0.4, 'Cryo', log, ft, pl, 1, state);
                shardsGained += (e.buffs.frozen ? 2 : 1);
              }
            });
          }
          addKairenShards(s, shardsGained, c, state, ft, log, pl);
        }
      },
      {
        id: 'ka_e', name: 'Венец вечной зимы', type: 'Skill1', cost: 3, target: 'AllEnemies',
        description: 'AoE Cryo. Поглощает все Осколки (+урон, +случайные доп. удары). Накладывает «Иней» (2 хода: +20% Cryo DMG).',
        statsText: "Урон: 150% АТК (Базово) / 50% АТК / 100% АТК\nДлительность: 2 хода",
        execute: (s, t, state, log, ft, pl) => {
          kairenTurnStart(s, t, state, log, ft, pl, c);
          let shards = s.buffs.kairenShards || 0;
          s.buffs.kairenShards = 0;
          let hasFrozen = false;
          if (pl) pl(s.uid, 'kairen_frost_crown');
          
          t.forEach(e => {
            if (e.stats.hp > 0) {
               if (e.buffs.frozen) hasFrozen = true;
               dealDamage(s, e, 1.5 + (shards * 0.2), 'Cryo', log, ft, pl, 1, state);
            }
          });
          
          if (state && state.enemyParty) {
            let aliveEnemies = state.enemyParty.filter(e => e.stats.hp > 0);
            for(let i=0; i<shards; i++) {
               if (aliveEnemies.length > 0) {
                 let rndTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                 dealDamage(s, rndTarget, 0.5, 'Cryo', log, ft, pl, 1, state);
                 aliveEnemies = state.enemyParty.filter(e => e.stats.hp > 0);
               }
            }
          }
          
          if (hasFrozen) {
            t.forEach(e => {
               if (e.stats.hp > 0 && e.buffs.frozen) {
                 dealDamage(s, e, 1.0, 'Cryo', log, ft, pl, 1, state);
               }
            });
          }
          
          s.buffs.kairenFrostTurns = 3; 
          if (ft) ft(s.uid, '❄️ ИНЕЙ (+20% CRYO)', 'text-cyan-300 font-bold');
          
          if (c >= 1) {
             let bonusShards = 2 + (hasFrozen ? 1 : 0);
             addKairenShards(s, bonusShards, c, state, ft, log, pl);
          }
        }
      },
      {
        id: 'ka_q', name: 'Трон безмолвной зимы', type: 'Skill2', cost: 5, target: 'AllEnemies',
        description: 'Мощный AoE Cryo DMG. «Вечная зима» (3 хода): урон в начале хода, +1 Осколок за реакции союзников. При 5 осколках срабатывает Ледяное эхо.',
        statsText: "Урон: 250% АТК\nДлительность: 3 хода",
        execute: (s, t, state, log, ft, pl) => {
          kairenTurnStart(s, t, state, log, ft, pl, c);
          if (pl) pl(s.uid, 'kairen_winter_throne');
          t.forEach(e => {
            if (e.stats.hp > 0) dealDamage(s, e, 2.5, 'Cryo', log, ft, pl, 1, state);
          });
          s.buffs.kairenWinterTurns = 4;
          if (ft) ft(s.uid, '👑 ВЕЧНАЯ ЗИМА', 'text-cyan-200 font-black text-sm');
          
          if (c >= 5) {
            addKairenShards(s, 3, c, state, ft, log, pl);
          }
        }
      }
    ]
  }),
  aveline: (uid, l, c, arts = []) => ({
    id: 'aveline', uid, isEnemy: false, name: 'Авелин', element: 'Hydro', color: 'bg-blue-400 text-white', level: l, constellation: c,
    image: getCharSplash('aveline') || undefined,
    stats: scaleStats(1400, 150, 75, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: {
       avelinePetals: 0,
       avelineGardenTurns: 0,
       avelineGreatFlowerTurns: 0,
       avelineElementalFlowers: 0,
       avelineC6Bonus: 0
    },
    skills: [
      {
        id: 'av_atk', name: 'Лепесток прилива', type: 'Attack', cost: 0, target: 'SingleEnemy',
        description: 'Hydro DMG (зависит от макс. ХП). Создаёт 1 Лепесток прилива.',
        statsText: "Урон: 12% HP",
        execute: (s, t, state, log, ft, pl) => {
          avelineTurnStart(s, t, state, log, ft, pl, c);
          if (pl) pl(t[0].uid, 'aveline_nature');
          dealDamage(s, t[0], 1.0, 'Hydro', log, ft, pl, 2, state);
          addPetals(s, 1, ft, c);
        }
      },
      {
        id: 'av_e', name: 'Цветение лазурного сада', type: 'Skill1', cost: 3, target: 'AllEnemies',
        description: 'Лазурный сад (3 хода). В начале хода: Hydro AoE DMG (от макс. ХП), лечение от макс. ХП, +1 Лепесток.',
        statsText: "Урон: 10% HP\nЛечение: 10% HP\nДлительность: 3 хода",
        execute: (s, t, state, log, ft, pl) => {
          avelineTurnStart(s, t, state, log, ft, pl, c);
          if (pl) pl(s.uid, 'aveline_azure_garden');
          s.buffs.avelineGardenTurns = 4; // +1 for next turn tick
          addPetals(s, c >= 3 ? 2 : 1, ft, c);
          if (ft) ft(s.uid, '🪷 ЛАЗУРНЫЙ САД', 'text-sky-300 font-bold');
          t.forEach(e => {
            if (e.stats.hp > 0) dealDamage(s, e, 0.8, 'Hydro', log, ft, pl, 1, state);
          });
          const heal = s.stats.maxHp * 0.10;
          state?.playerParty.forEach(a => {
            if (a.stats.hp > 0) {
              a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal);
              if (ft) ft(a.uid, '+' + Math.floor(heal), 'text-green-400');
            }
          });
        }
      },
      {
        id: 'av_q', name: 'Вечное цветение', type: 'Skill2', cost: 5, target: 'AllAllies',
        description: '+20% Elemental DMG отряду (4 хода). В начале хода: +1 Лепесток. Реакции копят цветы для Великого цветения.',
        statsText: "Длительность: 4 хода\nБафф: +20% Элем. Урон",
        execute: (s, t, state, log, ft, pl) => {
          avelineTurnStart(s, t, state, log, ft, pl, c);
          if (pl) pl(s.uid, 'aveline_eternal_bloom');
          s.buffs.avelineGreatFlowerTurns = 5; // +1 for next turn tick
          s.buffs.avelineElementalFlowers = 0;
          if (c < 6) s.buffs.avelineC6Bonus = 0;
          if (ft) ft(s.uid, '🌺 ВЕЧНОЕ ЦВЕТЕНИЕ', 'text-fuchsia-300 font-bold');
          state?.playerParty.forEach(a => {
            a.buffs.dmgBoost = (a.buffs.dmgBoost || 0) + 20;
          });
        }
      }
    ]
  }),

  nereus: (uid, l, c, arts = []) => ({
    id: 'nereus', uid, isEnemy: false, name: 'Нереус', element: 'Hydro', color: 'bg-teal-700 text-white', level: l, constellation: c,
    image: getCharSplash('nereus') || undefined,
    stats: scaleStats(1550, 150, 80, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {
      nereusGardenTurns: 0,
      nereusC2Triggers: 0,
      nereusC5UsedThisTurn: false,
      nereusC6RxnCount: 0
    },
    skills: [
      {
        id: 'ne_atk', name: 'Прикосновение прилива', type: 'Attack', cost: 0, target: 'SingleEnemy',
        description: 'Нереус наносит выбранному врагу 100% ATK Hydro DMG.',
        statsText: "Урон: 100% ATK (Hydro)",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, 'heal');
          dealDamage(s, t[0], 1.0, 'Hydro', log, ft, pl, 1, state);
        }
      },
      {
        id: 'ne_e', name: 'Вуаль прилива', type: 'Skill1', cost: 3, target: 'SingleEnemy',
        description: 'Создаёт Морской цветок на выбранном враге на 2 хода (до 2 ударов). При каждом ударе по цели цветок наносит 25% Max HP (35% на C3) Hydro DMG. При элементальной реакции цветок взрывается (+15% Max HP Hydro DMG) и распространяет Hydro на всех врагов.',
        statsText: "Морской цветок: 2 хода (2 удара)\nУрон цветка: 25% Max HP (35% C3)\nВзрыв: 15% Max HP Hydro + Hydro всем",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, 'heal');
          t[0].aura = 'Hydro';
          t[0].buffs.nereusFlower = {
            hits: 2,
            turns: 2,
            nereusUid: s.uid,
            rxnExplosionUsedThisTurn: false
          };
          if (ft) ft(t[0].uid, '🪸 МОРСКОЙ ЦВЕТОК', 'text-cyan-300 font-bold');
          if (log) log(`${s.name} накладывает Морской цветок на ${t[0].name}!`);
        }
      },
      {
        id: 'ne_q', name: 'Сад вечного моря', type: 'Skill2', cost: 5, target: 'AllEnemies',
        description: 'Создаёт Сад вечного моря на 2 хода. Наносит 30% Max HP Hydro DMG всем врагам, накладывает Hydro и даёт +1 удар существующим Морским цветам. В начале хода каждого врага наносит 17% Max HP Hydro DMG и накладывает Hydro. При окончании сада: Последнее цветение (10% Max HP Hydro DMG + Hydro всем).',
        statsText: "AoE урон: 30% Max HP Hydro\nСад: 2 хода (17% Max HP в ход врага)\nЦветы: +1 удар\nФинал сада: 10% Max HP Hydro всем",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, 'heal');
          s.buffs.nereusGardenTurns = 3; // +1 for turn-end tick
          if (ft) ft(s.uid, '🌊 САД ВЕЧНОГО МОРЯ', 'text-cyan-400 font-black text-sm');
          if (log) log(`${s.name} раскрывает Сад вечного моря!`);

          const burstMult = Math.round(s.stats.maxHp * 0.30) / Math.max(1, s.stats.atk);
          t.forEach(e => {
            if (e.stats.hp > 0) {
              e.aura = 'Hydro';
              dealDamage(s, e, burstMult, 'Hydro', log, ft, pl, 1, state);
              if (e.buffs.nereusFlower) {
                e.buffs.nereusFlower.hits += 1;
                if (ft) ft(e.uid, '🪸 +1 УДАР ЦВЕТКА', 'text-cyan-200 text-xs font-bold');
              }
            }
          });
        }
      }
    ]
  }),

  iva: (uid, l, c, arts = []) => ({
    id: "iva", uid, isEnemy: false, name: "Ива", element: "Dendro", color: "bg-emerald-700 text-white", level: l, constellation: c,
    image: getCharSplash('iva') || undefined,
    stats: scaleStats(1520, 180, 85, 46, l, c, arts), atb: 0, cooldowns: {}, buffs: {
      ivaFloralBondTurns: 0,
      ivaBloomTurns: 0,
      ivaAllyAttackCount: 0,
      ivaThornsGeneratedThisTurn: 0,
      ivaBloomHealsThisTurn: 0,
      ivaC4TriggeredThisTurn: false,
      ivaC6TriggeredThisE: false,
      ivaC6ThornCounter: 0,
      ivaC3HealsThisTurn: 0,
    },
    skills: [
      {
        id: "iva_atk", name: "Первые ростки", type: "Attack", cost: 0, target: "SingleEnemy",
        description: "Ива выполняет серию из 5 атак, не наносящих урона.",
        statsText: "Удары: 5 ударов\nУрон: 0% АТК\nСтоимость: 0",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, "heal");
          dealDamage(s, t[0], 0, "Dendro", log, ft, pl, 5, state);
          if (log) log(`${s.name} использует «Первые ростки» (5 атак, 0 урона).`);
        }
      },
      {
        id: "iva_e", name: "Связь с флорой", type: "Skill1", cost: 3, target: "AllAllies",
        description: "Ива создаёт Флоральную связь на 2 хода. Пока действует связь: Dendro и Cryo RES всех врагов снижены на 20% (25% на C2); каждая 2-я атака союзника дополнительно создаёт 1 Шип (до 2 раз за ход).",
        statsText: "Длительность: 2 хода\nСнижение RES: -20% (Dendro/Cryo, -25% C2)\nШипы: каждые 2 атаки союзника (до 2/ход)\nСтоимость: 3",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "heal");
          s.buffs.ivaFloralBondTurns = 3; // 2 full turns
          s.buffs.ivaThornsGeneratedThisTurn = 0;
          s.buffs.ivaC6TriggeredThisE = false;
          s.buffs.ivaC6ThornCounter = 0;
          if (ft) ft(s.uid, "🌿 СВЯЗЬ С ФЛОРОЙ", "text-emerald-300 font-extrabold");
          if (log) log(`${s.name} активирует «Связь с флорой» на 2 хода! Снижение Dendro/Cryo RES врагов на ${c >= 2 ? "25%" : "20%"}.`);
        }
      },
      {
        id: "iva_q", name: "Цветение первозданной природы", type: "Skill2", cost: 6, target: "AllEnemies",
        description: "Ива призывает силу природы, нанося всем врагам 200% ATK Dendro DMG и восстанавливая всему отряду 20% HP. Создаёт эффект «Цветение» на 2 хода: каждый раз, когда союзник получает Шип, он восстанавливает 5% HP (6% на C5, до 2 раз за ход, 3 на C5).",
        statsText: "Урон: 200% ATK Dendro всем\nЛечение: 20% HP отряду\nЦветение: 2 хода (5% HP за Шип, до 2/ход)\nСтоимость: 6",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "heal");
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 2.0, "Dendro", log, ft, pl, 2, state);
            }
          });
          state?.playerParty.forEach(ally => {
            if (ally.stats.hp > 0) {
              const heal = Math.round(ally.stats.maxHp * 0.20);
              ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + heal);
              if (ft) ft(ally.uid, `+${heal} HP`, "text-green-400 font-bold");
              if (pl) pl(ally.uid, "heal");
            }
          });
          s.buffs.ivaBloomTurns = 3; // 2 full turns
          s.buffs.ivaBloomHealsThisTurn = 0;
          if (ft) ft(s.uid, "🌸 ЦВЕТЕНИЕ ПРИРОДЫ", "text-emerald-200 font-black text-sm");
          if (log) log(`${s.name} вызывает «Цветение первозданной природы»! 200% AoE Dendro DMG и 20% исцеление отряда.`);
        }
      }
    ]
  }),

  kern: (uid, l, c, arts = []) => ({
    id: "kern", uid, isEnemy: false, name: "Керн", element: "Geo", color: "bg-amber-800 text-white", level: l, constellation: c,
    image: getCharSplash('kern') || undefined,
    stats: scaleStats(1380, 160, 110, 44, l, c, arts), atb: 0, cooldowns: {}, buffs: {
      kernOverloadTurns: 0,
      kernQBonusTurns: 0,
      kernC4BonusTurns: 0,
      kernCritOverloadActive: false,
      kernCritOverloadTurns: 0,
      kernC6Used: false,
      kernC2DefStacks: 0,
      kernC2DefTurns: 0,
      kernNormalAttackCount: 0,
    },
    skills: [
      {
        id: "kern_atk", name: "Каменный натиск", type: "Attack", cost: 0, target: "SingleEnemy",
        description: "Керн выполняет серию из 5 атак, наносящих Geo DMG: 70% / 80% / 90% / 100% / 120% DEF. Обычные атаки являются основным источником урона Керна.",
        statsText: "Удары: 5 ударов (70%/80%/90%/100%/120% ЗАЩ)\nСуммарно: 460% ЗАЩ Geo DMG\nСтоимость: 0",
        execute: (s, t, state, log, ft, pl) => {
          const isOverload = (s.buffs.kernOverloadTurns ?? 0) > 0;
          const isQBonus = (s.buffs.kernQBonusTurns ?? 0) > 0;
          const isC1 = c >= 1 && (s.stats.hp / s.stats.maxHp) < 0.70;
          const isC3 = c >= 3;
          const isC4 = c >= 4 && (s.buffs.kernC4BonusTurns ?? 0) > 0;
          const isC6 = !!s.buffs.kernCritOverloadActive;

          let bonusPct = 0;
          if (isOverload) bonusPct += 0.10;
          if (isQBonus) bonusPct += 0.15;
          if (isC1) bonusPct += 0.15;
          if (isC3) bonusPct += 0.20;
          if (isC4) bonusPct += 0.15;
          if (isC6) bonusPct += 0.30;

          const totalMult = 4.6 * (1 + bonusPct);
          s.buffs.kernNormalAttackCount = (s.buffs.kernNormalAttackCount || 0) + 1;

          if (pl) pl(t[0].uid, "Geo");
          dealDamage(s, t[0], totalMult, "Geo", log, ft, pl, 5, state);
          if (log) log(`${s.name} проводит «Каменный натиск» (5 ударов, суммарно ${Math.round(totalMult * 100)}% DEF Geo DMG${bonusPct > 0 ? `, бонус +${Math.round(bonusPct * 100)}%` : ""})!`);

          // C5: While Overload is active, every 5th Normal Attack deals 50% DEF Geo DMG to all enemies
          if (c >= 5 && isOverload && (s.buffs.kernNormalAttackCount % 5 === 0)) {
            if (ft) ft(s.uid, "💥 НЕУКРОТИМАЯ СИЛА (C5)", "text-amber-300 font-extrabold text-xs");
            if (log) log(`C5 Керна: 5-я обычная атака в Перенапряжении наносит 50% DEF Geo DMG всем врагам!`);
            state?.enemyParty.forEach(e => {
              if (e.stats.hp > 0) {
                dealDamage(s, e, 0.50, "Geo", log, ft, pl, 1, { ...state, isSubDmg: true });
              }
            });
          }

          // C6: Normal attacks additionally deal 20% DEF Geo DMG to all enemies
          if (isC6) {
            state?.enemyParty.forEach(e => {
              if (e.stats.hp > 0) {
                dealDamage(s, e, 0.20, "Geo", log, ft, pl, 1, { ...state, isSubDmg: true });
              }
            });
          }
        }
      },
      {
        id: "kern_e", name: "Разлом ядра", type: "Skill1", cost: 3, target: "AllEnemies",
        description: "Керн высвобождает Гео-энергию, нанося всем врагам 80% DEF Geo DMG. После атаки Керн теряет 15% текущего HP и получает эффект «Перенапряжение» на 2 хода (+10% урон обычных атак). При повторном применении длительность обновляется.",
        statsText: "Урон: 80% ЗАЩ Geo всем\nСамоурон: 15% текущего HP\nПеренапряжение: +10% урон обычных атак (2 хода)\nСтоимость: 3",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "Geo");
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 0.8, "Geo", log, ft, pl, 1, state);
            }
          });

          // HP loss if not in C6 Critical Overload
          if (!s.buffs.kernCritOverloadActive) {
            const hpLoss = Math.floor(s.stats.hp * 0.15);
            s.stats.hp = Math.max(1, s.stats.hp - hpLoss);
            if (ft) ft(s.uid, `-${hpLoss} HP (Самоурон)`, "text-amber-400 font-bold text-xs");
            if (log) log(`${s.name} теряет ${hpLoss} HP от «Разлома ядра».`);

            if (c >= 2) {
              s.buffs.kernC2DefStacks = Math.min(2, (s.buffs.kernC2DefStacks || 0) + 1);
              s.buffs.kernC2DefTurns = 3;
              if (ft) ft(s.uid, `+${s.buffs.kernC2DefStacks * 10}% DEF (C2)`, "text-amber-300 font-bold text-xs");
            }
          } else {
            if (ft) ft(s.uid, "🛡️ ИММУНИТЕТ К САМОУРОНУ (C6)", "text-amber-200 font-bold text-xs");
          }

          // Check C6 trigger
          if (c >= 6 && !s.buffs.kernC6Used && (s.stats.hp / s.stats.maxHp) < 0.30) {
            s.buffs.kernC6Used = true;
            s.buffs.kernCritOverloadActive = true;
            s.buffs.kernCritOverloadTurns = 3;
            if (ft) ft(s.uid, "🌋 КРИТИЧЕСКОЕ ПЕРЕНАПРЯЖЕНИЕ (C6)", "text-amber-400 font-black text-sm");
            if (log) log(`C6 Керна: HP упало ниже 30%! Керн переходит в «Критическое перенапряжение» (+30% урон обычных атак, 20% DEF AoE, иммунитет к потере HP)!`);
          }

          s.buffs.kernOverloadTurns = 3; // 2 full turns
          if (ft) ft(s.uid, "⚡ ПЕРЕНАПРЯЖЕНИЕ (+10%)", "text-amber-300 font-extrabold");
          if (log) log(`${s.name} активирует «Перенапряжение» на 2 хода (+10% к урону обычных атак).`);
        }
      },
      {
        id: "kern_q", name: "Катастрофа недр", type: "Skill2", cost: 5, target: "AllEnemies",
        description: "Керн высвобождает мощную Гео-энергию, нанося всем врагам 140% DEF Geo DMG. После атаки теряет 20% текущего HP и усиливает «Перенапряжение»: урон обычных атак увеличивается ещё на 15% на 2 хода (+25% суммарно).",
        statsText: "Урон: 140% ЗАЩ Geo всем\nСамоурон: 20% текущего HP\nБонус к атакам: +15% (итого +25% с E)\nC4: +10% исцеление и +15% урон атак\nСтоимость: 5",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "Geo");
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 1.4, "Geo", log, ft, pl, 2, state);
            }
          });

          // HP loss if not in C6 Critical Overload
          if (!s.buffs.kernCritOverloadActive) {
            const hpLoss = Math.floor(s.stats.hp * 0.20);
            s.stats.hp = Math.max(1, s.stats.hp - hpLoss);
            if (ft) ft(s.uid, `-${hpLoss} HP (Самоурон)`, "text-amber-400 font-bold text-xs");
            if (log) log(`${s.name} теряет ${hpLoss} HP от «Катастрофы недр».`);

            if (c >= 2) {
              s.buffs.kernC2DefStacks = Math.min(2, (s.buffs.kernC2DefStacks || 0) + 1);
              s.buffs.kernC2DefTurns = 3;
              if (ft) ft(s.uid, `+${s.buffs.kernC2DefStacks * 10}% DEF (C2)`, "text-amber-300 font-bold text-xs");
            }
          } else {
            if (ft) ft(s.uid, "🛡️ ИММУНИТЕТ К САМОУРОНУ (C6)", "text-amber-200 font-bold text-xs");
          }

          // C4: Restores 10% HP, +15% normal attack damage for 2 turns
          if (c >= 4) {
            const c4Heal = Math.round(s.stats.maxHp * 0.10);
            s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + c4Heal);
            s.buffs.kernC4BonusTurns = 3;
            if (ft) ft(s.uid, `+${c4Heal} HP / +15% АТАКИ (C4)`, "text-green-300 font-bold text-xs");
            if (log) log(`C4 Керна: восстановлено ${c4Heal} HP и получено +15% к урону обычных атак.`);
          }

          // Check C6 trigger
          if (c >= 6 && !s.buffs.kernC6Used && (s.stats.hp / s.stats.maxHp) < 0.30) {
            s.buffs.kernC6Used = true;
            s.buffs.kernCritOverloadActive = true;
            s.buffs.kernCritOverloadTurns = 3;
            if (ft) ft(s.uid, "🌋 КРИТИЧЕСКОЕ ПЕРЕНАПРЯЖЕНИЕ (C6)", "text-amber-400 font-black text-sm");
            if (log) log(`C6 Керна: HP упало ниже 30%! Керн переходит в «Критическое перенапряжение» (+30% урон обычных атак, 20% DEF AoE, иммунитет к потере HP)!`);
          }

          s.buffs.kernQBonusTurns = 3; // +15% for 2 turns
          if (ft) ft(s.uid, "💥 УСИЛЕНИЕ (+15% УРОНА)", "text-amber-300 font-extrabold");
          if (log) log(`${s.name} усиливает Перенапряжение: +15% к урону обычных атак на 2 хода.`);
        }
      }
    ]
  }),

  ineffa: (uid, l, c, arts = []) => ({
    id: "ineffa", uid, isEnemy: false, name: "Инеффа", element: "Pyro", color: "bg-red-800", level: l, constellation: c,
    image: getCharSplash('ineffa') || undefined,
    stats: scaleStats(1245, 230, 72, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "ineffa_atk", name: "Осколки памяти", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Физ. урон или Пиро урон (если в Отраженной форме). Атаки Пиро по Электро целям вызывают Отражение, дающее Фрагмент зеркала.',
        statsText: "Урон: 90% АТК (110% на C5, +15% за фрагмент в Пиро-форме)\nОтражение (по Электро): +125% АТК и +1 фрагмент\nИгнор ЗАЩ (C6): 30%",
        execute: (s, t, state, log, ft, pl) => {
          const isPyro = s.buffs.reflectedForm && s.buffs.reflectedForm > 0;
          let element: Element = isPyro ? "Pyro" : "Physical";
          let mult = 0.9;
          if (c >= 5) mult += 0.2;
          const target = t[0];
          
          const fragments = s.buffs.mirrorFragment || 0;
          if (isPyro) mult += fragments * 0.15; // Passive boost
          
          if (pl) pl(target.uid, isPyro ? "ineffa_mirror_slash" : "Physical");
          dealDamage(s, target, mult, element, log, ft, pl, isPyro ? 3 : 2, state, c >= 6 ? 0.3 : 0);
          
          if (isPyro && target.aura === "Electro") {
             const maxFragments = c >= 1 ? 6 : 4;
             let fragmentsToAdd = 1;
             if (c >= 1 && Math.random() < 0.5) fragmentsToAdd++;
             
             s.buffs.mirrorFragment = Math.min(maxFragments, fragments + fragmentsToAdd);
             if (ft) ft(s.uid, `ФРАГМЕНТ +${fragmentsToAdd}`, "text-red-500");
             
             if (ft) ft(target.uid, "ОТРАЖЕНИЕ", "text-rose-400 font-bold");
             let bonusMult = 1.25; 
             if (c >= 4) bonusMult += 0.25;
             if (s.buffs.mirrorFragment >= 5) bonusMult *= 1.3;
             
             if (s.buffs.reflectionDmgBonus) {
               bonusMult += s.buffs.reflectionDmgBonus;
             }
             if (s.buffs.shardsOfDawn4pc) {
               s.buffs.refractionStacks = Math.min(3, (s.buffs.refractionStacks || 0) + 1);
               bonusMult += s.buffs.refractionStacks * 0.12;
               s.buffs.critDamageBoost = s.buffs.refractionStacks * 6;
               if (s.buffs.refractionStacks === 3) {
                 bonusMult += 0.40;
               }
             }
             
             dealDamage(s, target, bonusMult, "Pyro", log, ft, pl, 1, state, c >= 6 ? 0.3 : 0);
          }
        }
      },
      {
        id: "ineffa_e", name: "Зеркало Рассветного Утра", type: "Skill1", cost: 3, target: "SingleEnemy",
        description: 'Наносит Пиро урон и дает Отраженную форму, меняя атаки на Пиро. Фрагменты усиливают урон.',
        statsText: "Урон: 30% АТК / 150% АТК\nБафф: +15 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          s.buffs.reflectedForm = 4;
          s.buffs.spd = (s.buffs.spd || 0) + 15; // Passive 1 representation
          if (ft) ft(s.uid, "ОТРАЖЕННАЯ ФОРМА", "text-red-400 font-bold");
          if (pl) {
            pl(s.uid, "ineffa_dawn_mirror");
            pl(t[0].uid, "ineffa_mirror_slash");
          }
          let mult = 1.5;
          let fragmentBonus = (s.buffs.mirrorFragment || 0) * 0.25;
          mult += fragmentBonus;
          dealDamage(s, t[0], mult, "Pyro", log, ft, pl, 2, state, c >= 6 ? 0.3 : 0);
        }
      },
      {
        id: "ineffa_q", name: "Гибридная Энергия", type: "Skill2", cost: 6, target: "SingleEnemy",
        description: 'Использует фрагменты для огромного Пиро урона. Чем больше фрагментов, тем больше урон.',
        statsText: "Урон: 30% АТК / 350% АТК / 400% АТК",
        execute: (s, t, state, log, ft, pl) => {
          let fragments = s.buffs.mirrorFragment || 0;
          let mult = 3.5 + fragments * 0.9;
          if (c >= 3) mult += 0.5;
          if (pl) {
            pl(s.uid, "ineffa_dawn_mirror");
            pl(t[0].uid, "ineffa_hybrid_energy");
          }
          dealDamage(s, t[0], mult, "Pyro", log, ft, pl, fragments + 2, state, c >= 6 ? 0.3 : 0);
          
          if (c >= 6 && fragments >= 6) {
             if (ft) ft(s.uid, "ИСТИННОЕ ЗЕРКАЛО", "text-rose-500 font-black");
          }
          
          if (c < 2) {
             s.buffs.mirrorFragment = 0;
          }
        }
      }
    ]
  }),
  snezhana: (uid, l, c, arts = []) => ({
    id: "snezhana", uid, isEnemy: false, name: "Снежана", element: "Cryo", color: "bg-cyan-600", level: l, constellation: c,
    image: getCharSplash('snezhana') || undefined,
    stats: scaleStats(1150, 160, 85, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "sn_atk", name: "Ледяной укол", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Крио урон. Накладывает 1 стак [Переохлаждения] (макс. 4 стака). Каждый стак снижает Защиту врага на 10%, наносимый им урон на 10% и увеличивает получаемый им урон на 12%. При 4 стаках вызывает [Критическое переохлаждение] на 2 хода (-50% DEF, -50% урон, +60% входящий урон).',
        statsText: "Урон: 90% АТК\nДлительность: 2 хода\nСтаки: 1 стак, 4 стака/ов\nДебафф: -50% ЗАЩ, -50% Урон, +60% Получ. Урон",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, "snezhana_overcool");
          dealDamage(s, t[0], 0.9, "Cryo", log, ft, pl, 1, state);
          applySnezhanaOvercool(s, t[0], state, ft, log);
        }
      },
      {
        id: "sn_e", name: "Морозное дыхание", type: "Skill1", cost: 2, target: "SingleEnemy",
        description: 'Крио урон. Накладывает сразу 2 стака [Переохлаждения]. Если цель уже находится под действием Критического переохлаждения, продвигает ATB выбранного союзника с наивысшей Атакой на 35%.',
        statsText: "Урон: 120% АТК\nПродвижение хода: 35%\nСтаки: 2 стака/ов",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, "snezhana_overcool");
          dealDamage(s, t[0], 1.2, "Cryo", log, ft, pl, 2, state);
          applySnezhanaOvercool(s, t[0], state, ft, log);
          applySnezhanaOvercool(s, t[0], state, ft, log);
          if (t[0].buffs.critOvercool && t[0].buffs.critOvercool > 0) {
            const bestAlly = state.playerParty
              .filter(p => p.stats.hp > 0)
              .sort((a, b) => b.stats.atk - a.stats.atk)[0];
            if (bestAlly) {
              bestAlly.atb = Math.min(100, bestAlly.atb + 35);
              if (ft) ft(bestAlly.uid, "+35% ATB", "text-cyan-300");
              if (log) log(`${s.name} мотивирует союзника ${bestAlly.name}!`);
            }
          }
        }
      },
      {
        id: "sn_q", name: "Вечная мерзлота", type: "Skill2", cost: 4, target: "AllEnemies",
        description: 'AoE Крио урон. Накладывает 1 стак [Переохлаждения] на всех врагов. Замораживает на 1 ход тех, у кого уже было Критическое переохлаждение.',
        statsText: "Урон: 140% АТК\nДлительность: 1 ход\nСтаки: 1 стак",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "snezhana_overcool");
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              const wasCrit = !!(enemy.buffs.critOvercool && enemy.buffs.critOvercool > 0);
              dealDamage(s, enemy, 1.4, "Cryo", log, ft, pl, 3, state);
              applySnezhanaOvercool(s, enemy, state, ft, log);
              if (wasCrit) {
                enemy.buffs.frozen = 1;
                enemy.atb = 0;
                if (ft) ft(enemy.uid, "ЗАМОРОЗКА", "text-cyan-400 font-bold");
                if (log) log(`${enemy.name} полностью скован Вечной мерзлотой!`);
              }
            }
          });
        }
      }
    ]
  }),
  zephyr: (uid, l, c, arts = []) => ({
    id: "zephyr", uid, isEnemy: false, name: "Зефир", element: "Electro", color: "bg-purple-600", level: l, constellation: c,
    image: getCharSplash('zephyr') || undefined,
    stats: scaleStats(1100, 220, 65, 52, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "ze_atk", name: "Иллюзорный выпад", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Электро урон. Зефир превращает Перегрузку в Отражение.',
        statsText: "Урон: 100% АТК",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.0, "Electro", log, ft, pl, 2, state, c >= 6 ? 0.2 : 0);
        }
      },
      {
        id: "ze_e", name: "Грозовая призма", type: "Skill1", cost: 3, target: "AllEnemies",
        description: 'Электро урон по всем врагам, накладывает статус Электро. Повышает урон Отражения отряда на 15%.',
        statsText: "Урон: 120% АТК\nПродвижение хода: 10%",
        execute: (s, t, state, log, ft, pl) => {
          t.forEach(e => {
            if (e.stats.hp > 0) {
              dealDamage(s, e, 1.2, "Electro", log, ft, pl, 3, state);
            }
          });
          state?.playerParty.forEach(p => p.buffs.reflectionDmgBonus = (p.buffs.reflectionDmgBonus || 0) + 0.15);
          if (ft) ft(s.uid, "УРОН ОТРАЖЕНИЯ +15%", "text-purple-400 font-bold text-xs");
        }
      },
      {
        id: "ze_q", name: "Зеркальный шторм", type: "Skill2", cost: 6, target: "AllEnemies",
        description: 'Колоссальный Электро урон. При активации Отражения или Перегрузки снижает защиту врагов.',
        statsText: "Урон: 280% АТК\nДебафф: -20% Сопротивление, -20% ЗАЩ",
        execute: (s, t, state, log, ft, pl) => {
          t.forEach(e => {
            if (e.stats.hp > 0) {
              dealDamage(s, e, 2.8, "Electro", log, ft, pl, 5, state, 0.2);
              e.buffs.resDown = (e.buffs.resDown || 0) + 20; // Reduce resistance/def logically
              e.stats.def = Math.floor(e.stats.def * 0.8);
            }
          });
          if (ft) ft(s.uid, "ШТОРМ ИЛЛЮЗИЙ", "text-purple-300 font-black");
        }
      }
    ]
  }),
  aurum: (uid, l, c, arts = []) => ({
    id: "aurum", uid, isEnemy: false, name: "Аурум", element: "Geo", color: "bg-yellow-600", level: l, constellation: c,
    image: getCharSplash('aurum') || undefined,
    stats: scaleStats(1400, 160, 120, 38, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "au_atk", name: "Золотой блеск", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Гео урон. Аурум превращает Перегрузку в Отражение.',
        statsText: "Урон: 90% АТК (множитель растёт от ЗАЩ)",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 0.9, "Geo", log, ft, pl, 1, state);
        }
      },
      {
        id: "au_e", name: "Золотая эгида", type: "Skill1", cost: 3, target: "AllAllies",
        description: 'Накладывает щит на всех союзников, зависящий от Защиты Аурума. Усиливает Крит. урон отряда на 15%.',
        statsText: "Щит: 150% ЗАЩ\nБафф: +15% Крит. Урон",
        execute: (s, t, state, log, ft, pl) => {
          const shieldVal = s.stats.def * 2.5;
          t.forEach(a => {
            a.buffs.shield = (a.buffs.shield || 0) + shieldVal;
            a.buffs.critDamage = (a.buffs.critDamage || 0) + 15;
            if (ft) ft(a.uid, `ЩИТ +${Math.floor(shieldVal)}`, 'text-yellow-400 text-xs');
          });
        }
      },
      {
        id: "au_q", name: "Осколки роскоши", type: "Skill2", cost: 5, target: "AllEnemies",
        description: 'Огромный Гео урон, зависящий от Защиты. Дает отряду бафф Силы Атаки.',
        statsText: "Урон: 180% АТК (множитель растёт от ЗАЩ)\nБафф: +40% ЗАЩ в АТК отряду",
        execute: (s, t, state, log, ft, pl) => {
          t.forEach(e => {
            if (e.stats.hp > 0) {
              const dmgMulti = 1.0 + (s.stats.def / 1000);
              dealDamage(s, e, 1.8 * dmgMulti, "Geo", log, ft, pl, 3, state);
            }
          });
          state?.playerParty.forEach(a => {
            a.buffs.atk = (a.buffs.atk || 0) + Math.floor(s.stats.def * 0.4);
            if (ft) ft(a.uid, "АТАКА БАФФ", "text-yellow-300 text-xs");
          });
        }
      }
    ]
  }),
  rix: (uid, l, c, arts = []) => ({
    id: "rix", uid, isEnemy: false, name: "Рикс", element: "Electro", color: "bg-indigo-500", level: l, constellation: c,
    image: getCharSplash('rix') || undefined,
    stats: scaleStats(1200, 180, 80, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "rx_atk", name: "Шок", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Электро урон. Слегка восстанавливает HP союзнику с наименьшим здоровьем.',
        statsText: "Урон: 100% АТК\nЛечение: 50% АТК (союзнику с мин. HP)",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.0, "Electro", log, ft, pl, 1, state);
          if (state) {
            const lowest = [...state.playerParty].sort((a,b) => (a.stats.hp/a.stats.maxHp) - (b.stats.hp/b.stats.maxHp))[0];
            if (lowest) {
               lowest.stats.hp = Math.min(lowest.stats.maxHp, lowest.stats.hp + (s.stats.atk * 0.5));
            }
          }
        }
      },
      {
        id: "rx_e", name: "Дефибриллятор", type: "Skill1", cost: 3, target: "SingleAlly",
        description: 'Лечит выбранного союзника и ускоряет его действия (дает ATB).',
        statsText: "Лечение: 20% HP\nПродвижение хода: 30%",
        execute: (s, t, state, log, ft, pl) => {
          const heal = s.stats.maxHp * 0.2;
          t[0].stats.hp = Math.min(t[0].stats.maxHp, t[0].stats.hp + heal);
          t[0].atb = Math.min(100, t[0].atb + 30);
          if (ft) ft(t[0].uid, `+${Math.floor(heal)} HP`, 'text-green-400 font-bold');
        }
      },
      {
        id: "rx_q", name: "Перезагрузка", type: "Skill2", cost: 5, target: "AllAllies",
        description: 'Лечит отряд и повышает Скорость. Электро-реакции наносят больше урона.',
        statsText: "Лечение: 25% HP (35% на C4)\nБафф: +15 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          t.forEach(a => {
            a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + (s.stats.atk * 1.5));
            a.buffs.spd = (a.buffs.spd || 0) + 15;
            a.buffs.reflectionDmgBonus = (a.buffs.reflectionDmgBonus || 0) + 0.10; 
            if (ft) ft(a.uid, "+СКОРОСТЬ", 'text-indigo-300');
          });
        }
      }
    ]
  }),
  maestro: (uid, l, c, arts = []) => ({
    id: "maestro", uid, isEnemy: false, name: "Маэстро", element: "Electro", color: "bg-purple-800", level: l, constellation: c,
    image: getCharSplash('maestro') || undefined,
    stats: scaleStats(1250, 210, 80, 50, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "maes_atk",
        name: "Укол",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Одиночный укол. Наносит выбранному противнику небольшой урон.',
        statsText: "Урон: 100% АТК",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(t[0].uid, "maestro_stab");
          dealDamage(s, t[0], 1.0, "Electro", log, ft, pl, 1, state);
        }
      },
      {
        id: "maes_e",
        name: "Фокус Внимания",
        type: "Skill1",
        cost: 3,
        target: "SingleEnemy",
        description: 'Накладывает [Метку Изоляции] на 2 хода. Противник получает на 40% больше урона от одиночных атак.',
        statsText: "Урон: 120% АТК\nДлительность: 2 хода",
        execute: (s, t, state, log, ft, pl) => {
          t[0].buffs.isolationMark = 2;
          if (ft) ft(t[0].uid, "🎯 Метка Изоляции", "text-purple-400 font-bold");
          if (pl) {
            pl(s.uid, "buff");
            pl(t[0].uid, "maestro_isolation");
          }
          dealDamage(s, t[0], 1.2, "Electro", log, ft, pl, 1, state);
        }
      },
      {
        id: "maes_q",
        name: "Финальный Аккорд",
        type: "Skill2",
        cost: 6,
        target: "AllAllies",
        description: 'Продвигает АТВ союзников на 20%. Если есть враж. дебаффы - союзник с макс. ATK получает мгновенный ход.',
        statsText: "Продвижение хода: 20% / 100%",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) {
            pl(s.uid, "maestro_final_chord");
            t.forEach(ally => pl(ally.uid, "maestro_echo"));
          }
          t.forEach(ally => {
            if (ally.stats.hp > 0 && ally.uid !== s.uid) {
              ally.atb = Math.min(100, ally.atb + 20);
              if (ft) ft(ally.uid, "⚡ +20% ATB", "text-yellow-300");
            }
          });
          if (state && state.enemyParty) {
            const hasDebuffs = state.enemyParty.some(e => e.stats.hp > 0 && (e.buffs.isolationMark || e.buffs.frozen || e.buffs.burn || e.buffs.bleed || e.buffs.poison || e.buffs.thorns || e.buffs.resDown));
            if (hasDebuffs) {
              let maxAtkAlly = null;
              let maxAtk = -1;
              state.playerParty.forEach(ally => {
                if (ally.stats.hp > 0 && ally.uid !== s.uid) {
                  const currentAtk = ally.stats.atk + (ally.buffs.atk || 0);
                  if (currentAtk > maxAtk) { maxAtk = currentAtk; maxAtkAlly = ally; }
                }
              });
              if (maxAtkAlly) {
                maxAtkAlly.atb = 100;
                if (ft) ft(maxAtkAlly.uid, "⚡ ДОП. ХОД!", "text-yellow-400 font-black");
              }
            }
          }
        }
      }
    ]
  }),
  volosatinya: (uid, l, c, arts = []) => ({
    id: "volosatinya", uid, isEnemy: false, name: "Волосатиня", element: "Hydro", color: "bg-blue-500", level: l, constellation: c,
    image: getCharSplash('volosatinya') || undefined,
    stats: scaleStats(1200, 180, 80, 40, l, c, arts), atb: 0, cooldowns: {}, buffs: { lastHitBlocked: false },
    skills: [
      { id: "v_atk", name: "Обычная атака", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Удар мечами (Гидро урон).',
        statsText: "Урон: 100% АТК", execute: (s, t, state, log, ft, pl) => { 
          if (pl) pl(t[0].uid, "volosatinya_slice");
          dealDamage(s, t[0], 1.0, "Hydro", log, ft, pl, 2, state); 
        } },
      { id: "v_e", name: "Волосатый разрез", type: "Skill1", cost: 3, target: "SingleEnemy", description: 'Гидро урон, замедляет врага.',
        statsText: "Урон: 150% АТК (210% по Пиро)\nДебафф: -10 СКОР", execute: (s, t, state, log, ft, pl) => { 
          let mult = 1.5; 
          if (c >= 6 && t[0].aura === "Pyro") mult *= 1.4; 
          if (pl) pl(t[0].uid, "volosatinya_hair_slash");
          dealDamage(s, t[0], mult, "Hydro", log, ft, pl, 3, state); 
          t[0].buffs.spd = (t[0].buffs.spd || 0) - 10; 
          if(ft) ft(t[0].uid, '↓Скорость', 'text-blue-300'); 
        } },
      { id: "v_q", name: "Поляна лобковых волос", type: "Skill2", cost: 5, target: "AllEnemies", description: 'AoE Гидро урон, усиливает атаку отряда.',
        statsText: "Урон: 200% АТК (280% по Пиро)\nБафф: +30 АТК", execute: (s, t, state, log, ft, pl) => { 
          if (pl) {
            pl(s.uid, "volosatinya_hair_meadow");
            t.forEach(enemy => pl(enemy.uid, "volosatinya_slice"));
          }
          t.forEach(enemy => { 
            if(enemy.stats.hp > 0) { 
              let mult = 2.0; 
              if (c >= 6 && enemy.aura === "Pyro") mult *= 1.4; 
              dealDamage(s, enemy, mult, "Hydro", log, ft, pl, 4, state); 
            } 
          }); 
          state.playerParty.forEach(p => { 
            p.buffs.atk = (p.buffs.atk || 0) + 30; 
            if(ft) ft(p.uid, '+АТК', 'text-red-400'); 
            if(pl) pl(p.uid, 'buff'); 
          }); 
        } }
    ]
  }),
  gotka: (uid, l, c, arts = []) => ({
    id: "gotka", uid, isEnemy: false, name: "Готка", element: "Pyro", color: "bg-red-600", level: l, constellation: c,
    image: getCharSplash('gotka') || undefined,
    stats: scaleStats(900, 250, 60, 35, l, c, arts), atb: 0, cooldowns: {}, buffs: { puppets: 0 },
    skills: [
      { id: "g_atk", name: "Выстрел", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Урон выше с марионетками.',
        statsText: "Урон: 100% АТК (+50% за марионетку)", execute: (s, t, state, log, ft, pl) => { 
          const p = s.buffs.puppets || 0; 
          if (pl) pl(t[0].uid, "gotka_shot");
          dealDamage(s, t[0], 1.0 + (p * 0.5), "Pyro", log, ft, pl, 1, state, c >= 6 ? 0.3 : 0); 
        } },
      { id: "g_e", name: "Театр искаженных теней", type: "Skill1", cost: 2, target: "Self", description: 'Призывает марионеток.',
        statsText: "Призыв: +2 марионетки (+3 на C1, макс. 4)\nШанс безмолвия (C1): 50%", execute: (s, t, state, log, ft, pl) => { 
          s.buffs.puppets = Math.min((s.buffs.puppets || 0) + (c >= 1 ? 3 : 2), 4); 
          if (c >= 1 && Math.random() < 0.5) state.enemyParty.forEach(e => { if (e.stats.hp > 0) e.buffs.mute = 1; }); 
          if(ft) ft(s.uid, `+${s.buffs.puppets} Кукол`, 'text-purple-300'); 
          if(pl) pl(s.uid, 'gotka_theater'); 
        } },
      { id: "g_q", name: "Разрыв нитей", type: "Skill2", cost: 5, target: "AllEnemies", description: 'Взрывает марионеток для огромного AoE урона.',
        statsText: "Урон: 150% АТК (+150% за марионетку)", execute: (s, t, state, log, ft, pl) => { 
          const p = s.buffs.puppets || 0; 
          if (pl) {
            pl(s.uid, "gotka_thread_snap");
            t.forEach(enemy => pl(enemy.uid, "gotka_shot"));
          }
          t.forEach(enemy => { 
            if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.5 + (p * 1.5), "Pyro", log, ft, pl, p > 0 ? p + 1 : 1, state, c >= 6 ? 0.3 : 0); 
          }); 
          s.buffs.puppets = 0; 
        } }
    ]
  }),
  kopro: (uid, l, c, arts = []) => ({
    id: "kopro", uid, isEnemy: false, name: "Копро", element: "Dendro", color: "bg-green-600", level: l, constellation: c,
    image: getCharSplash('kopro') || undefined,
    stats: scaleStats(1100, 210, 75, 38, l, c, arts), atb: 0, cooldowns: {}, buffs: { frenzyStacks: 0 },
    skills: [
      { id: "k_atk", name: "Атака копьем", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Удары Дендро копьем.',
        statsText: "Урон: 120% АТК\nЛечение: 20% HP", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.2, "Dendro", log, ft, pl, 3, state); if (c >= 6) { const heal = Math.round(s.stats.atk * 0.2); s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + heal); if(ft) ft(s.uid, `+${Math.floor(heal)}`, 'text-green-400'); } } },
      { id: "k_e", name: "Приступ истерики", type: "Skill1", cost: c >= 1 ? 1 : 3, target: "Self", description: 'Входит в Безумие, повышая скорость и силу.',
        statsText: "Бафф: +40 АТК, +15 СКОР", execute: (s, t, state, log, ft, pl) => { s.buffs.frenzyStacks = Math.min((s.buffs.frenzyStacks || 0) + 2, 5); s.buffs.spd = (s.buffs.spd || 0) + 15; s.buffs.atk = (s.buffs.atk || 0) + 40; if(ft) ft(s.uid, 'БЕЗУМИЕ!', 'text-green-500'); if(pl) pl(s.uid, 'buff'); } },
      { id: "k_q", name: "Время дендродов!", type: "Skill2", cost: c >= 1 ? 4 : 6, target: "AllEnemies", description: 'Дендро-взрыв, тратит Безумие.',
        statsText: "Урон: 100% АТК (растёт от стаков ловушек)", execute: (s, t, state, log, ft, pl) => { const stacks = s.buffs.frenzyStacks || 0; t.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.0 + (stacks * 0.8), "Dendro", log, ft, pl, 5, state); }); s.buffs.frenzyStacks = 0; } }
    ]
  }),
  selva: (uid, l, c, arts = []) => ({
    id: "selva", uid, isEnemy: false, name: "Сельва", element: "Electro", color: "bg-purple-600", level: l, constellation: c,
    image: getCharSplash('selva') || undefined,
    stats: scaleStats(1000, 220, 70, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: { joyStacks: 0 },
    skills: [
      { id: "s_atk", name: "Панч!", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Электро удар из-под земли.',
        statsText: "Урон: 110% АТК", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.1, "Electro", log, ft, pl, 1, state); } },
      { id: "s_e", name: "Любитель пострелять", type: "Skill1", cost: 2, target: "AllEnemies", description: 'AoE Электро урон, дает Срытый рейтинг.',
        statsText: "Урон: 120% АТК\nБафф: +5 СКОР", execute: (s, t, state, log, ft, pl) => { t.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.2, "Electro", log, ft, pl, 4, state); }); s.buffs.joyStacks = Math.min((s.buffs.joyStacks || 0) + 1, c >= 2 ? 15 : 10); if (c >= 1) s.buffs.spd = (s.buffs.spd || 0) + 5; if(ft) ft(s.uid, '+Рейтинг', 'text-yellow-300'); if(pl) pl(s.uid, 'buff'); } },
      { id: "s_q", name: "Режим Бога!", type: "Skill2", cost: 6, target: "AllEnemies", description: 'Тратит Радость на мега-атаки.',
        statsText: "Урон: 200% АТК (Базово)", execute: (s, t, state, log, ft, pl) => { const joy = s.buffs.joyStacks || 0; if(joy === 0) { if(ft) ft(s.uid, 'Нет рейтинга', 'text-gray-400'); return; } t.forEach(enemy => { if(enemy.stats.hp > 0) { dealDamage(s, enemy, 2.0 + (joy * 0.5), "Electro", log, ft, pl, 6, state); if (c >= 6) { s.stats.hp = Math.min(s.stats.maxHp, Math.round(s.stats.hp + (s.stats.maxHp * 0.02))); } } }); s.buffs.joyStacks = 0; } }
    ]
  }),
  moyan: (uid, l, c, arts = []) => ({
    id: "moyan", uid, isEnemy: false, name: "Мо Янь", element: "Geo", color: "bg-yellow-600", level: l, constellation: c,
    image: getCharSplash('moyan') || undefined,
    stats: scaleStats(1500, 120, 150, 30, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "m_atk", name: "Взмах чернилами", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Гео урон чернилами.',
        statsText: "Урон: 80% АТК\nПродвижение хода: 15%", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 0.8, "Geo", log, ft, pl, 2, state); if (c >= 2 && Math.random() < 0.5) { s.atb += 15; if(ft) ft(s.uid, 'C2: ATB UP', 'text-yellow-400'); } } },
      { id: "m_e", name: "Запись Контракта", type: "Skill1", cost: 4, target: "AllAllies", description: 'Щит на всех союзников.',
        statsText: "Щит: 15% HP", execute: (s, t, state, log, ft, pl) => { t.forEach(ally => { const shieldMult = c >= 4 ? 1.3 : 1.0; ally.buffs.shield = (ally.buffs.shield || 0) + 400 * (1 + l * 0.05) * shieldMult; if(ft) ft(ally.uid, '+Щит', 'text-yellow-500'); if(pl) pl(ally.uid, 'shield'); }); } },
      { id: "m_q", name: "Оживление рукописи", type: "Skill2", cost: 6, target: "AllAllies", description: 'Лечит отряд и наносит AoE Гео урон врагам.',
        statsText: "Урон: 250% АТК\nЛечение: 500 (базово)\nПродвижение хода: 40%", execute: (s, t, state, log, ft, pl) => { t.forEach(ally => { if(ally.stats.hp > 0) { const heal = Math.round(500 * (1 + l * 0.05)); ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + heal); if(ft) ft(ally.uid, `+${Math.floor(heal)}`, 'text-green-500'); } }); if (c >= 6) { s.atb += 40; if(ft) ft(s.uid, 'C6: RECOVER', 'text-yellow-400'); } state.enemyParty.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 2.5, "Geo", log, ft, pl, 3, state); }); if(pl) state.playerParty.forEach(ally => pl(ally.uid, 'heal')); } }
    ]
  }),
  aelita: (uid, l, c, arts = []) => ({
    id: "aelita", uid, isEnemy: false, name: "Аэлита", element: "Dendro", color: "bg-emerald-600", level: l, constellation: c,
    image: getCharSplash('aelita') || undefined,
    stats: scaleStats(1350, 240, 60, 42, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "a_atk", name: "Шипы Справедливости", type: "Attack", cost: 0, target: "SingleEnemy", description: '4 удара. Накладывает 1 стак [Шипы].',
        statsText: "Урон: 100% АТК\nСтаки: 1 стак\nДебафф: -5 СКОР", execute: (s, t, state, log, ft, pl) => { 
          if (pl) pl(t[0].uid, "aelita_thorns");
          dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 4, state); 
          t[0].buffs.thorns = Math.min((t[0].buffs.thorns || 0) + 1, 3); 
          if (c >= 1) t[0].buffs.spd = (t[0].buffs.spd || 0) - 5; 
          if(ft) ft(t[0].uid, '+Шипы', 'text-emerald-400'); 
          notifyThornAcquired(s, t[0], state, log, ft, pl); 
        } },
      { id: "a_e", name: "Связь с флорой", type: "Skill1", cost: 3, target: "SingleEnemy", description: 'Снимает все Шипы с врага. Огромный урон за каждый стак.',
        statsText: "Урон: 120% АТК (+150% АТК за каждый стак Шипов)\nЛечение (C4): 150 HP за стак", execute: (s, t, state, log, ft, pl) => { 
          const thorns = t[0].buffs.thorns || 0; 
          if (pl) pl(t[0].uid, "aelita_flora_burst");
          dealDamage(s, t[0], 1.2 + (thorns * 1.5), "Dendro", log, ft, pl, 1, state); 
          t[0].buffs.thorns = 0; 
          if (c >= 4) { 
            s.stats.hp = Math.min(s.stats.maxHp, Math.round(s.stats.hp + 150 * thorns)); 
            if(ft) ft(s.uid, 'Облегчение', 'text-green-300'); 
          } 
        } },
      { id: "a_q", name: "Теорема о Дикой Природе", type: "Skill2", cost: 6, target: "AllEnemies", description: 'AоE урон. Баффает АТК Аэлиты, дает всем врагам Шипы.',
        statsText: "Урон: 200% АТК\nЩит: 200% ЗАЩ (на C6)\nБафф: +100 АТК", execute: (s, t, state, log, ft, pl) => { 
          if (pl) {
            pl(s.uid, "aelita_wild_theorem");
            t.forEach(enemy => pl(enemy.uid, "aelita_thorns"));
          }
          t.forEach(enemy => { 
            if(enemy.stats.hp > 0) { 
              dealDamage(s, enemy, 2.0, "Dendro", log, ft, pl, 2, state); 
              enemy.buffs.thorns = Math.min((enemy.buffs.thorns || 0) + 1, 3); 
              notifyThornAcquired(s, enemy, state, log, ft, pl); 
            } 
          }); 
          s.buffs.atk = (s.buffs.atk || 0) + 100 + (l * 5); 
          if (c >= 6) { 
            s.buffs.shield = (s.buffs.shield || 0) + s.stats.def * 2; 
            if(ft) ft(s.uid, 'C6: SHIELD', 'text-emerald-300'); 
          } 
          if(ft) ft(s.uid, 'Оранжерея Знаний!', 'text-emerald-300'); 
        } }
    ]
  }),
  asher: (uid, l, c, arts = []) => ({
    id: "asher", uid, isEnemy: false, name: "Ашер", element: "Dendro", color: "bg-emerald-900", level: l, constellation: c,
    image: getCharSplash('asher') || undefined,
    stats: scaleStats(1400, 180, 120, 48, l, c, arts),
    atb: 0, buffs: { shield: 0 }, cooldowns: {},
    skills: [
      { id: "sm_atk", name: "Молот Тления", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Дендро урон, вешает Дендро ауру.',
        statsText: "Урон: 100% АТК", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 1, state); } },
      { id: "sm_e", name: "Цепи Тлеющего Угля", type: "Skill1", cost: 3, target: "SingleAlly", description: 'Связывает союзника. Селина получает 3 стака вместо 1. Крит. Урон по Горящим врагам +50%.',
        statsText: "Стаки: 3 стака/ов", execute: (s, t, state, log, ft, pl) => { 
        t[0].buffs.smolderLink = 3; 
        if(ft) ft(t[0].uid, "🔗 ТЛЕЮЩАЯ СВЯЗЬ", "text-emerald-400 font-black");
        if(pl) pl(t[0].uid, "asher_nature");
      } },
      { id: "sm_q", name: "Сердце Печи", type: "Skill2", cost: 6, target: "AllAllies", description: 'Замораживает ОЗ на 45% (для баффов). Дает щит за каждый взрыв Углей Селины.',
        statsText: "Продвижение хода: 100%", execute: (s, t, state, log, ft, pl) => { 
        t.forEach(ally => {
          ally.buffs.hpFreeze = 45;
          if (ally.stats.hp / ally.stats.maxHp > 0.45) {
            ally.stats.hp = Math.round(ally.stats.maxHp * 0.45);
          }
          if(ft) ft(ally.uid, "🛡️ СТАБИЛИЗАЦИЯ ОЗ", "text-orange-300 font-bold text-[10px]");
        });
        if(pl) {
          pl(s.uid, "asher_nature");
          pl(s.uid, "ultimate_aoe");
        }
        if (c >= 6) {
          state.playerParty.filter(p => p.id === 'selina').forEach(p => p.atb = 100);
        }
      } }
    ]
  }),
  selina: (uid, l, c, arts = []) => ({
    id: "selina", uid, isEnemy: false, name: "Селина", element: "Pyro", color: "bg-rose-600", level: l, constellation: c,
    image: getCharSplash('selina') || undefined,
    stats: scaleStats(1150, 260, 65, 44, l, c, arts), atb: 0, cooldowns: {}, buffs: { roseEmbers: 0 },
    skills: [
      { 
        id: "sl_atk", 
        name: "Шорох Лепестков", 
        type: "Attack", 
        cost: 0, 
        target: "SingleEnemy", 
        description: 'Серия быстрых уколов огненным копьем (2 удара). Накладывает 1 стак [Угли Розы] (макс. 5).',
        statsText: "Урон: 110% АТК\nСтаки: 1 стак", 
        execute: (s, t, state, log, ft, pl) => { 
          dealDamage(s, t[0], 1.1, "Pyro", log, ft, pl, 2, state); 
          const stackInc = s.buffs.smolderLink || 1;
          s.buffs.roseEmbers = Math.min((s.buffs.roseEmbers || 0) + stackInc, 5); 
          if (ft) ft(s.uid, `+${stackInc} Угли Розы`, 'text-rose-400'); 
          if (pl) pl(s.uid, 'buff');
        } 
      },
      { 
        id: "sl_e", 
        name: "Бутон Алого Пламени", 
        type: "Skill1", 
        cost: 3, 
        target: "AllEnemies", 
        description: 'Призывает огненный бутон, взрывающийся в гуще врагов. Наносит AoE Pyro урон. Каждый стак [Угли Розы] усиливает урон на 30%.',
        statsText: "Урон: 130% АТК\nЩит: 15% HP", 
        execute: (s, t, state, log, ft, pl) => { 
          const embers = s.buffs.roseEmbers || 0;
          const multiplier = 1.3 + (embers * 0.3);
          t.forEach(enemy => { 
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, multiplier, "Pyro", log, ft, pl, 3, state); 
              if (pl) pl(enemy.uid, "selina_rose");
            }
          }); 
          
          // Asher Synergy: Shield when stacks explode
          if (s.buffs.hpFreeze && state.playerParty.some(p => p.id === 'asher')) {
            const shieldVal = s.stats.maxHp * 0.05 * embers;
            s.buffs.shield = (s.buffs.shield || 0) + shieldVal;
            if (ft) ft(s.uid, `🛡️ +${Math.floor(shieldVal)} Щит`, "text-cyan-400");
          }

          if (ft) ft(s.uid, `Вспышка! x${embers}`, 'text-red-500 font-bold');
          s.buffs.roseEmbers = 0; 
        } 
      },
      { 
        id: "sl_q", 
        name: "Пламенный Вальс Роз", 
        type: "Skill2", 
        cost: 6, 
        target: "AllAllies", 
        description: 'Танец пламенного вихря. Дает всем союзникам щит [Алая Роза] и восстанавливает им HP, а врагам наносит сокрушительный Pyro урон.',
        statsText: "Урон: 220% АТК\nЩит: 20% HP", 
        execute: (s, t, state, log, ft, pl) => { 
          if(pl) {
            pl(s.uid, "selina_rose");
            pl(s.uid, "ultimate_aoe");
          }
          t.forEach(ally => { 
            if (ally.stats.hp > 0) {
              const shieldVal = 300 + (l * 10) + (s.stats.atk * 0.5);
              ally.buffs.shield = (ally.buffs.shield || 0) + shieldVal;
              const healVal = 400 + (l * 15);
              
              const healLimit = ally.buffs.hpFreeze ? (ally.stats.maxHp * ally.buffs.hpFreeze / 100) : ally.stats.maxHp;
              ally.stats.hp = Math.min(healLimit, ally.stats.hp + healVal);
              
              if (ft) {
                ft(ally.uid, `+${Math.floor(healVal)} HP`, 'text-green-400');
                setTimeout(() => ft(ally.uid, `+Щит`, 'text-yellow-400'), 300);
              }
              if (pl) {
                pl(ally.uid, 'heal');
                setTimeout(() => pl(ally.uid, 'shield'), 300);
              }
            }
          }); 
          state.enemyParty.forEach(enemy => { 
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 2.2, "Pyro", log, ft, pl, 4, state); 
              if (pl) {
                setTimeout(() => pl(enemy.uid, "selina_rose"), 200);
              }
            }
          }); 
          s.buffs.roseEmbers = 5;
          if (ft) ft(s.uid, 'Роза Расцвела!', 'text-rose-400 font-bold text-lg');
        } 
      }
    ]
  }),
  neuron: (uid, l, c, arts = []) => ({
    id: "neuron", uid, isEnemy: false, name: "Нейрон", element: "Electro", color: "bg-indigo-600", level: l, constellation: c,
    image: getCharSplash('neuron') || undefined,
    stats: scaleStats(1100, 110, 70, 46, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "n_atk",
        name: "Импульсный Клик",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Удары током (коэфф. 0.6). Если на цели есть любой элементальный статус или дебафф, урон возрастает в 2.5 раза (коэфф. 1.5).',
        statsText: "Урон: 250% АТК / 60% АТК",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const hasAura = !!target.aura;
          const hasDebuff = (target.buffs.spd || 0) < 0 || (target.buffs.thorns || 0) > 0;
          const mult = (hasAura || hasDebuff) ? 2.5 : 0.6;
          dealDamage(s, target, mult, "Electro", log, ft, pl, 2, state);
          if ((hasAura || hasDebuff) && ft) {
             setTimeout(() => ft(target.uid, "🎯 СИНАПС-ТРИГГЕР!", "text-yellow-400 font-extrabold"), 300);
          }
        }
      },
      {
        id: "n_e",
        name: "Каталитический Взрыв",
        type: "Skill1",
        cost: 3,
        target: "SingleEnemy",
        description: 'Волна разряда. Если на враге есть статус или дебафф, наносит сокрушительный урон (коэфф. 3.5), рассеивает статус и снижает скорость врага на 15.',
        statsText: "Урон: 350% АТК / 100% АТК\nДебафф: -15 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const hasAura = !!target.aura;
          const hasDebuff = (target.buffs.spd || 0) < 0 || (target.buffs.thorns || 0) > 0;
          const mult = (hasAura || hasDebuff) ? 3.5 : 1.0;
          dealDamage(s, target, mult, "Electro", log, ft, pl, 3, state);
          if (hasAura || hasDebuff) {
             target.aura = null; // Consume status
             target.buffs.spd = (target.buffs.spd || 0) - 15;
             if (ft) {
                setTimeout(() => {
                   ft(target.uid, "💥 РЕЗОНАНС РЕАКТОРА!", "text-purple-400 font-black text-sm");
                   ft(target.uid, "↓ Скорость -15", "text-cyan-300 text-xs font-boldHeading");
                }, 400);
             }
          }
        }
      },
      {
        id: "n_q",
        name: "Нейросетевой Синапс",
        type: "Skill2",
        cost: 6,
        target: "AllEnemies",
        description: 'Грандиозный запуск импульсов по всем врагам. Урон по целям со статусами увеличивается в 3 раза (коэфф. 3.3). Дает Нейрону +25% силы атаки за каждый триггер.',
        statsText: "Урон: 330% АТК / 110% АТК",
        execute: (s, t, state, log, ft, pl) => {
          let triggersCount = 0;
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              const hasAura = !!enemy.aura;
              const hasDebuff = (enemy.buffs.spd || 0) < 0 || (enemy.buffs.thorns || 0) > 0;
              const isTrigger = hasAura || hasDebuff;
              const mult = isTrigger ? 3.3 : 1.1;
              dealDamage(s, enemy, mult, "Electro", log, ft, pl, 4, state);
              if (isTrigger) {
                triggersCount++;
                if (ft) setTimeout(() => ft(enemy.uid, "🧬 СВЯЗЬ!", "text-indigo-400 font-extrabold"), 350);
              }
            }
          });
          if (triggersCount > 0) {
             s.buffs.atk = (s.buffs.atk || 0) + Math.floor(triggersCount * s.stats.atk * 0.25);
             if (ft) {
                setTimeout(() => ft(s.uid, `+${triggersCount * 25}% АТК Реактора`, "text-yellow-300 font-bold"), 450);
             }
             if (pl) {
                setTimeout(() => pl(s.uid, "buff"), 450);
             }
          }
        }
      }
    ]
  }),
  krona: (uid, l, c, arts = []) => ({
    id: "krona", uid, isEnemy: false, name: "Крона", element: "Cryo", color: "bg-cyan-600", level: l, constellation: c,
    image: getCharSplash('krona') || undefined,
    stats: scaleStats(1050, 190, 85, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "kr_atk",
        name: "Вектор Холода",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Укол шпагой времени (коэфф. 0.9). Отбрасывает шкалу ходов (ATB) врага назад на 15%.',
        statsText: "Урон: 90% АТК\nЗадержка хода: 15%",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          dealDamage(s, target, 0.9, "Cryo", log, ft, pl, 2, state, (c >= 6 && target.aura === "Cryo") ? 1.0 : 0);
          target.atb = Math.max(0, target.atb - 15);
          if (ft) {
            setTimeout(() => ft(target.uid, "⏳ ATB -15%", "text-cyan-400 font-extrabold"), 350);
          }
        }
      },
      {
        id: "kr_e",
        name: "Крио-Застой",
        type: "Skill1",
        cost: 3,
        target: "SingleEnemy",
        description: 'Заморозка шкалы врага (коэфф. 1.8). Отбрасывает ATB врага на 35% и замедляет его (-20 к скорости) до конца боя.',
        statsText: "Урон: 180% АТК\nЗадержка хода: 35%\nДебафф: -20 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          dealDamage(s, target, 1.8, "Cryo", log, ft, pl, 1, state);
          target.atb = Math.max(0, target.atb - 35);
          target.buffs.spd = (target.buffs.spd || 0) - 20;
          if (ft) {
             setTimeout(() => {
                ft(target.uid, "❄️ ATB -35%", "text-cyan-300 font-black");
                ft(target.uid, "↓ Скорость -20", "text-sky-300 text-xs font-bold");
             }, 350);
          }
        }
      },
      {
        id: "kr_q",
        name: "Темпоральное Ускорение",
        type: "Skill2",
        cost: 6,
        target: "AllEnemies",
        description: 'Ледяной хроно-взрыв по всем врагам (коэфф. 2.2). Продвигает шкалу ходов (ATB) союзников вперед на 30%!',
        statsText: "Урон: 220% АТК\nПродвижение хода: 30%\nЗадержка хода: 15%",
        execute: (s, t, state, log, ft, pl) => {
          if(pl) {
            pl(s.uid, "krona_ice");
            pl(s.uid, "ultimate_aoe");
          }
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 2.2, "Cryo", log, ft, pl, 3, state);
              enemy.atb = Math.max(0, enemy.atb - 15);
              if(pl) pl(enemy.uid, "krona_ice");
              if (ft) setTimeout(() => ft(enemy.uid, "⏳ Вектор задержки", "text-cyan-200 text-xs"), 350);
            }
          });
          state.playerParty.forEach(ally => {
            if (ally.stats.hp > 0) {
              ally.atb = Math.min(100, ally.atb + 30);
              if (ft) {
                 setTimeout(() => ft(ally.uid, "⚡ ВРЕМЯ ВПЕРЕД! ATB +30%", "text-teal-400 font-black text-xs"), 400);
              }
              if (pl) {
                 setTimeout(() => pl(ally.uid, "buff"), 400);
              }
            }
          });
        }
      }
    ]
  }),
  cyrus: (uid, l, c, arts = []) => ({
    id: "cyrus", uid, isEnemy: false, name: "Сайрус", element: "Physical", color: "bg-red-800", level: l, constellation: c,
    image: getCharSplash('cyrus') || undefined,
    stats: scaleStats(1300, 180, 100, 110, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "cy_atk", name: "Холодный выпад", type: "Attack", cost: 0, target: "SingleEnemy",
        description: 'Физ удар. Метка дуэли: урон x2, бонус крита. Отбрасывает ATB врага.',
        statsText: "Урон: 200% АТК / 70% АТК\nПродвижение хода: 10%\nЗадержка хода: 20%\nБафф: +40% Крит. Урон",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const marked = target.buffs.duelMark;
          const mult = marked ? 2.0 : 0.7;
          if (pl) pl(t[0].uid, "cyrus_duel");
          if (marked && c >= 4) {
             s.buffs.critDamage = (s.buffs.critDamage || 0) + 40;
          }
          dealDamage(s, t[0], mult, "Physical", log, ft, pl, 2, state, marked ? (c >= 2 ? 0.7 : 0.5) : 0);
          if (marked) {
            s.atb = Math.min(100, s.atb + 10);
            target.atb = Math.max(0, target.atb - 20);
            if (ft) setTimeout(() => ft(s.uid, "↑ ТЕМП", "text-red-400 font-bold"), 300);
          }
          if (marked && c >= 4) {
             s.buffs.critDamage -= 40;
          }
        }
      },
      {
        id: "cy_e", name: "Вызов на дуэль", type: "Skill1", cost: 2, target: "SingleEnemy",
        description: 'Снимает все метки, вешает метку [Дуэль] на цель. Сразу делает выпад с 50% игнором защиты.',
        statsText: "Урон: 150% АТК",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          if (state) state.enemyParty.forEach(e => e.buffs.duelMark = 0);
          target.buffs.duelMark = 1;
          if (ft) ft(target.uid, "ДУЭЛЬ", "text-rose-500 font-black tracking-widest text-xl");
          if (pl) {
            pl(target.uid, "cyrus_duel");
            pl(target.uid, "shake");
          }
          
          dealDamage(s, target, 1.5, "Physical", log, ft, pl, 1, state, c >= 2 ? 0.7 : 0.5);
          s.atb = Math.min(100, s.atb + (c >= 1 ? 40 : 30));
        }
      },
      {
        id: "cy_q", name: "Казнь", type: "Skill2", cost: 6, target: "SingleEnemy",
        description: 'Огромный удар (коэфф 4.5 с меткой). Если у цели в процентах ХП <30% - гарант. Крит и игнор Щитов! Если убивает, Сайрус восстанавливает 6 Энергии и 100 ATB.',
        statsText: "Урон: 450% АТК / 250% АТК\nПродвижение хода: 100%",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const marked = target.buffs.duelMark;
          let mult = marked ? 4.5 : 2.5; 
          const limit = c >= 6 ? 0.5 : 0.3;
          const isExecute = target.stats.hp > 0 && target.stats.hp < target.stats.maxHp * limit;
          
          if (isExecute) {
             if (ft) ft(s.uid, "КАЗНЬ!", "text-red-500 font-black tracking-widest text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]");
             if (pl) {
               pl(target.uid, "cyrus_execute");
               pl(target.uid, "shake");
             }
          } else {
             if (ft) ft(s.uid, "Последний Удар", "text-rose-400 font-bold tracking-wide");
             if (pl) pl(target.uid, "cyrus_duel");
          }
          
          dealDamage(s, target, mult, "Physical", log, ft, pl, 1, state, marked ? (c >= 2 ? 0.7 : 0.5) : 0, isExecute, isExecute);
          
          if (target.stats.hp <= 0 && state) {
            setTimeout(() => { s.cooldowns['cy_q'] = 0; }, 10);
            s.atb = 100;
            if (ft) setTimeout(() => ft(s.uid, "ГОНОРАР (+100% ATB)", "text-amber-400 font-bold tracking-wide text-sm"), 400);
          }
        }
      }
    ]
  }),
  echo: (uid, l, c, arts = []) => ({
    id: "echo", uid, isEnemy: false, name: "Эхо", element: "Hydro", color: "bg-teal-500", level: l, constellation: c,
    image: getCharSplash('echo') || undefined,
    stats: scaleStats(1100, 150, 75, 52, l, c, arts), atb: 0, cooldowns: {}, buffs: { echoAura: null },
    skills: [
      {
        id: "ec_atk",
        name: "Резонансный Импульс",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Удар звуковой волной (коэфф. 0.7). Если у врага есть стихийная аура, Эхо запоминает её. Если ауры нет, но у Эха есть сохраненная аура, он передает её врагу.',
        statsText: "Урон: 70% АТК\nПродвижение хода: 5%",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const initialAura = target.aura;
          dealDamage(s, target, 0.7, "Hydro", log, ft, pl, 1, state);
          if (c >= 1) state.playerParty.forEach(p => { p.atb = Math.min(100, p.atb + 5); });
          setTimeout(() => {
            if (initialAura) {
              s.buffs.echoAura = initialAura;
              if (ft) ft(s.uid, `✨ Запомнил: ${initialAura}`, 'text-teal-300 font-extrabold text-xs');
            } else if (s.buffs.echoAura) {
              target.aura = s.buffs.echoAura as any;
              if (ft) ft(target.uid, `👥 Эхо: ${s.buffs.echoAura}`, 'text-cyan-300 font-extrabold text-xs');
            }
          }, 350);
        }
      },
      {
        id: "ec_e",
        name: "Синхронная Репликация",
        type: "Skill1",
        cost: 2,
        target: "SingleEnemy",
        description: 'Радиус Эха. Наносит Hydro-урон цели (коэфф. 1.0). Запоминает её ауру и распыляет её (дублирует) на ВСЕХ остальных противников на поле боя!',
        statsText: "Урон: 100% АТК",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const initialAura = target.aura || s.buffs.echoAura;
          dealDamage(s, target, 1.0, "Hydro", log, ft, pl, 1, state);
          setTimeout(() => {
            const auraToSpread = initialAura;
            if (auraToSpread) {
              s.buffs.echoAura = auraToSpread;
              state.enemyParty.forEach(enemy => {
                if (enemy.stats.hp > 0 && enemy.uid !== target.uid) {
                  enemy.aura = auraToSpread as any;
                  if (ft) ft(enemy.uid, `👥 Распыление: ${auraToSpread}`, 'text-cyan-300 text-xs font-bold');
                }
              });
              if (ft) ft(s.uid, `📢 Эхо-Поле: ${auraToSpread}`, 'text-teal-300 font-black text-xs');
            }
          }, 400);
        }
      },
      {
        id: "ec_q",
        name: "Домен Отражений",
        type: "Skill2",
        cost: 5,
        target: "AllEnemies",
        description: 'Потоки иллюзий (коэфф. 1.3). Дублирует запомненную ауру на всех врагов без стихийных статусов, и дает +20% силы атаки всему отряду на 2 хода.',
        statsText: "Урон: 130% АТК\nБафф: +20% АТК отряду (2 хода)\nБонус (C6): +20 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          if (c >= 6) { s.buffs.spd = (s.buffs.spd || 0) + 20; if(ft) ft(s.uid, 'ГАРМОНИЯ!', 'text-cyan-400'); }
          const auraToSpread = s.buffs.echoAura;
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 1.3, "Hydro", log, ft, pl, 2, state);
              if (auraToSpread && !enemy.aura) {
                setTimeout(() => {
                  enemy.aura = auraToSpread as any;
                  if (ft) ft(enemy.uid, `👥 Отражение: ${auraToSpread}`, 'text-teal-300 text-xs font-extrabold');
                }, 400);
              }
            }
          });
          state.playerParty.forEach(ally => {
            if (ally.stats.hp > 0) {
              ally.buffs.atk = (ally.buffs.atk || 0) + Math.floor(s.stats.atk * 0.2);
              if (ft) {
                setTimeout(() => ft(ally.uid, "✨ Эхо: +20% АТК", "text-cyan-300 text-xs font-bold"), 450);
              }
              if (pl) {
                setTimeout(() => pl(ally.uid, "buff"), 450);
              }
            }
          });
        }
      }
    ]
  }),
  kamikaze: (uid, l, c, arts = []) => ({
    id: "kamikaze", uid, isEnemy: false, name: "Камикадзе", element: "Physical", color: "bg-red-800", level: l, constellation: c,
    image: getCharSplash('kamikaze') || undefined,
    stats: scaleStats(850, 250, 30, 60, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "km_atk",
        name: "Самоубийственное Лезвие",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Удар наотмашь (коэфф. 1.6). Камикадзе наносит огромный урон, но теряет 15% своего текущего HP.',
        statsText: "Урон: 160% АТК\nРасход: 15% HP\nБафф: +200 АТК",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          if (c >= 6) {
            const lostHpPercent = (s.stats.maxHp - s.stats.hp) / s.stats.maxHp;
            s.buffs.atk = (s.buffs.atk || 0) + (lostHpPercent * 10 * 10); // Simple passive logic
          }
          const hpCost = Math.floor(s.stats.hp * 0.15);
          s.stats.hp = Math.max(1, s.stats.hp - hpCost);
          if (ft) ft(s.uid, `-${hpCost} ОЗ`, "text-red-500 font-extrabold text-xs");
          dealDamage(s, target, 1.6, "Physical", log, ft, pl, 1, state);
          if (c >= 1 && s.stats.hp < s.stats.maxHp * 0.2) {
             s.buffs.atk = (s.buffs.atk || 0) + 200;
             if(ft) ft(s.uid, 'ПОСЛЕДНИЙ РЫВОК', 'text-amber-500');
          }
        }
      },
      {
        id: "km_e",
        name: "Перегрузка Крови",
        type: "Skill1",
        cost: 2,
        target: "SingleEnemy",
        description: 'Стеклянный таран (коэфф. 3.0), наносящий колоссальный удар по одной цели. Камикадзе теряет 25% своего текущего HP.',
        statsText: "Урон: 300% АТК\nРасход: 25% HP",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const hpCost = Math.floor(s.stats.hp * 0.25);
          s.stats.hp = Math.max(1, s.stats.hp - hpCost);
          if (ft) {
            ft(s.uid, `💥 ПЕРЕГРУЗКА`, "text-orange-500 font-black text-xs");
            setTimeout(() => ft(s.uid, `-${hpCost} ОЗ`, "text-red-500 font-extrabold text-xs"), 200);
          }
          dealDamage(s, target, 3.0, "Physical", log, ft, pl, 2, state);
        }
      },
      {
        id: "km_q",
        name: "Сверхзвуковой Таран",
        type: "Skill2",
        cost: 5,
        target: "SingleEnemy",
        description: 'Сокрушительный суицидальный удар невероятной мощи (коэфф. 5.5). Камикадзе теряет 45% своего текущего HP.',
        statsText: "Урон: 550% АТК\nРасход: 45% HP",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const hpCost = Math.floor(s.stats.hp * 0.45);
          s.stats.hp = Math.max(1, s.stats.hp - hpCost);
          if (ft) {
            ft(s.uid, `🔥 ВЫГОРАНИЕ!`, "text-red-500 font-black text-sm animate-bounce");
            setTimeout(() => ft(s.uid, `-${hpCost} ОЗ`, "text-rose-600 font-black text-xs"), 200);
          }
          dealDamage(s, target, 5.5, "Physical", log, ft, pl, 3, state);
        }
      }
    ]
  }),
  patch: (uid, l, c, arts = []) => ({
    id: "patch", uid, isEnemy: false, name: "Патч", element: "Dendro", color: "bg-emerald-500", level: l, constellation: c,
    image: getCharSplash('patch') || undefined,
    stats: scaleStats(1300, 100, 60, 35, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "pa_atk",
        name: "Удар сумкой",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Неуклюжий удар медицинской сумкой (коэфф. 0.5). Наносит совсем немного Dendro-урона.',
        statsText: "Урон: 50% АТК (множитель растёт от ЗАЩ)",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 0.5, "Dendro", log, ft, pl, 1, state);
        }
      },

      {
        id: "pa_e",
        name: "Первая помощь",
        type: "Skill1",
        cost: 2,
        target: "SingleAlly",
        description: 'Простое лечение. Моментально восстанавливает фиксированное количество HP выбранному союзнику (база 500).',
        statsText: "Лечение: 500 базово (+10% за уровень, +30% на C1)",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          if (target.stats.hp > 0) {
            const healVal = 500 * (1 + l * 0.1) * (c >= 1 ? 1.3 : 1.0);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healVal);
            if (ft) ft(target.uid, `+${Math.floor(healVal)} HP`, "text-green-400 font-bold");
            if (pl) pl(target.uid, "heal");
          }
        }
      },
      {
        id: "pa_q",
        name: "Экстренная терапия",
        type: "Skill2",
        cost: 4,
        target: "SingleAlly",
        description: 'Мощная доза исцеления. Восстанавливает огромное количество здоровья цели (база 1500).',
        statsText: "Лечение: 1500 базово (+12% за уровень, +30% на C1)\nВоскрешение (C6): 10% HP",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          if (target.stats.hp > 0 || (c >= 6 && target.stats.hp === 0)) {
            if (target.stats.hp === 0) target.stats.hp = target.stats.maxHp * 0.1; // Revive mechanics
            const healVal = 1500 * (1 + l * 0.12) * (c >= 1 ? 1.3 : 1.0);
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healVal);
            if (ft) ft(target.uid, `💉 +${Math.floor(healVal)}!`, "text-emerald-400 font-black");
            if (pl) pl(target.uid, "heal");
          }
        }
      }
    ]
  }),
  claymore: (uid, l, c, arts = []) => ({
    id: "claymore", uid, isEnemy: false, name: "Минёр", element: "Geo", color: "bg-orange-700", level: l, constellation: c,
    image: getCharSplash('claymore') || undefined,
    stats: scaleStats(1250, 200, 100, 36, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { 
        id: "cl_atk", 
        name: "Удар киркой", 
        type: "Attack", 
        cost: 0, 
        target: "SingleEnemy", 
        description: 'Физический удар киркой (коэфф. 1.0).',
        statsText: "Урон: 100% АТК", 
        execute: (s, t, state, log, ft, pl) => { 
          dealDamage(s, t[0], 1.0, "Physical", log, ft, pl, 1, state); 
        } 
      },
      { 
        id: "cl_e", 
        name: "Подрывной заряд", 
        type: "Skill1", 
        cost: 3, 
        target: "SingleEnemy", 
        description: 'Устанавливает на врага [Ловушку]. Ловушка наноситGeo-урон (коэфф. 2.0) и отменяет ход врага, когда его ATB достигает максимума.',
        statsText: "Ловушка: +1 стак (+2 на C1)\nУрон взрыва: 200% АТК\nЭффект: отмена хода врага", 
        execute: (s, t, state, log, ft, pl) => { 
          const target = t[0];
          target.buffs.trapStacks = (target.buffs.trapStacks || 0) + (c >= 1 ? 2 : 1);
          if (ft) ft(target.uid, "💣 ЛОВУШКА", "text-orange-500 font-black");
          if (pl) pl(target.uid, "buff");
        } 
      },
      { 
        id: "cl_q", 
        name: "Минное поле", 
        type: "Skill2", 
        cost: 6, 
        target: "AllEnemies", 
        description: 'Наносит небольшой AoE Geo-урон (коэфф. 0.8) и устанавливает [Ловушку] на всех выживших врагов.',
        statsText: "Урон: 80% АТК\nДоп. урон: 100% АТК за ловушку", 
        execute: (s, t, state, log, ft, pl) => { 
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 0.8, "Geo", log, ft, pl, 1, state);
              setTimeout(() => {
                enemy.buffs.trapStacks = (enemy.buffs.trapStacks || 0) + (c >= 1 ? 2 : 1);
                if (c >= 6) {
                   const traps = enemy.buffs.trapStacks || 0;
                   dealDamage(s, enemy, traps * 1.0, "Geo", log, ft, pl, 1, state);
                   enemy.buffs.trapStacks = 0;
                }
                if (ft) ft(enemy.uid, "💣 ЛОВУШКА", "text-orange-500 font-bold");
                if (pl) pl(enemy.uid, "buff");
              }, 400);
            }
          });
        } 
      }
    ]
  }),
  viper: (uid, l, c, arts = []) => ({
    id: "viper", uid, isEnemy: false, name: "Гадюка", element: "Dendro", color: "bg-emerald-700", level: l, constellation: c,
    image: getCharSplash('viper') || undefined,
    stats: scaleStats(1100, 220, 65, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "vi_atk", name: "Змеиный укус", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Дендро урон, шанс отравить.',
        statsText: "Урон: 100% АТК\nСтаки яда: +1 стак (+2 на C1, шанс 50%/80%)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 2, state); if(Math.random() < (c >= 1 ? 0.8 : 0.5)) t[0].buffs.poison = (t[0].buffs.poison || 0) + (c >= 1 ? 2 : 1); } },
      { id: "vi_e", name: "Токсичное облако", type: "Skill1", cost: 3, target: "AllEnemies", description: 'Отравивает всех врагов.',
        statsText: "Стаки яда: +2 стака всем врагам (+4 на C1)", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { e.buffs.poison = (e.buffs.poison || 0) + (c >= 1 ? 4 : 2); if(ft) ft(e.uid, 'ЯД x4', 'text-green-400'); } }); } },
      { id: "vi_q", name: "Пир яда", type: "Skill2", cost: 5, target: "SingleEnemy", description: 'Огромный урон, зависящий от стаков яда.',
        statsText: "Урон: 150% АТК (+120% АТК за каждый стак яда)\nИгнор ЗАЩ (C6): 30%", execute: (s, t, state, log, ft, pl) => { const p = t[0].buffs.poison || 0; dealDamage(s, t[0], 1.5 + (p * 1.2), "Dendro", log, ft, pl, 5, state, c >= 6 ? 0.3 : 0); t[0].buffs.poison = 0; } }
    ]
  }),
  spark: (uid, l, c, arts = []) => ({
    id: "spark", uid, isEnemy: false, name: "Искр", element: "Electro", color: "bg-yellow-400 text-black", level: l, constellation: c,
    image: getCharSplash('spark') || undefined,
    stats: scaleStats(950, 180, 55, 55, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "sp_atk", name: "Разряд", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Быстрый удар током.',
        statsText: "Урон: 80% АТК\nПродвижение хода: 10%", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 0.8, "Electro", log, ft, pl, 1, state); s.atb = Math.min(100, s.atb + 10); } },
      { id: "sp_e", name: "Перегрузка цепи", type: "Skill1", cost: 2, target: "Self", description: 'Увеличивает свою скорость.',
        statsText: "Бафф: +20 СКОР", execute: (s, t, state, log, ft, pl) => { s.buffs.spd = (s.buffs.spd || 0) + 20; if(ft) ft(s.uid, '↑СКОРОСТЬ', 'text-yellow-400'); } },
      { id: "sp_q", name: "Короткое замыкание", type: "Skill2", cost: 4, target: "SingleEnemy", description: 'Шанс мгновенно получить ход.',
        statsText: "Урон: 200% АТК\nПродвижение хода: ~100% (Мгновенно)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 2.0, "Electro", log, ft, pl, 3, state); if(Math.random() < 0.4) s.atb = 99; } }
    ]
  }),
  aegis: (uid, l, c, arts = []) => ({
    id: "aegis", uid, isEnemy: false, name: "Эгида", element: "Geo", color: "bg-amber-600", level: l, constellation: c,
    image: getCharSplash('aegis') || undefined,
    stats: scaleStats(1400, 140, 160, 32, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ae_atk", name: "Удар щитом", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Гео урон, зависит от защиты.',
        statsText: "Урон: 50% АТК (множитель растёт от ЗАЩ)", execute: (s, t, state, log, ft, pl) => { const mult = 0.5 + (s.stats.def / 200); dealDamage(s, t[0], mult, "Geo", log, ft, pl, 1, state); } },
      { id: "ae_e", name: "Непоколебимость", type: "Skill1", cost: 3, target: "AllAllies", description: 'Дает щит, зависящий от защиты.',
        statsText: "Щит: 400% ЗАЩ (560% на C1)", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const shieldVal = (s.stats.def * 4) * (c >= 1 ? 1.4 : 1.0); a.buffs.shield = (a.buffs.shield || 0) + shieldVal; if(ft) ft(a.uid, '+ЩИТ', 'text-amber-200'); }); } },
      { id: "ae_q", name: "Бастион", type: "Skill2", cost: 5, target: "Self", description: 'Разворачивает абсолютную защиту.',
        statsText: "Щит: 50% HP\nБафф: +100 ЗАЩ, +50 Сопротивление", execute: (s, t, state, log, ft, pl) => { s.buffs.def = (s.buffs.def || 0) + 100; s.buffs.shield = (s.buffs.shield || 0) + (s.stats.hp * 0.5); if (c >= 6) s.buffs.res = (s.buffs.res || 0) + 50; if(ft) ft(s.uid, 'БАСТИОН', 'text-amber-400'); } }
    ]
  }),
  blaze: (uid, l, c, arts = []) => ({
    id: "blaze", uid, isEnemy: false, name: "Блэйз", element: "Pyro", color: "bg-red-700", level: l, constellation: c,
    image: getCharSplash('blaze') || undefined,
    stats: scaleStats(1150, 240, 65, 42, l, c, arts), atb: 0, cooldowns: {}, buffs: { critStacks: 0 },
    skills: [
      { id: "bl_atk", name: "Огненный взмах", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Пиро урон, шанс поджечь.',
        statsText: "Урон: 110% АТК", execute: (s, t, state, log, ft, pl) => { if (c >= 1) s.buffs.critStacks = (s.buffs.critStacks || 0) + 1; dealDamage(s, t[0], 1.1, "Pyro", log, ft, pl, 2, state); if(Math.random() < 0.3) t[0].buffs.burn = (t[0].buffs.burn || 0) + 1; } },
      { id: "bl_e", name: "Инферно", type: "Skill1", cost: 3, target: "AllEnemies", description: 'AoE Пиро урон, поджигает врагов.',
        statsText: "Урон: 80% АТК", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { dealDamage(s, e, 0.8, "Pyro", log, ft, pl, 3, state); e.buffs.burn = (e.buffs.burn || 0) + 1; } }); } },
      { id: "bl_q", name: "Новая звезда", type: "Skill2", cost: 6, target: "AllEnemies", description: 'Огромный взрыв Пиро энергии.',
        statsText: "Урон: 300% АТК / 600% АТК", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { let mult = 3.0; if (c >= 6 && e.stats.hp < e.stats.maxHp * 0.5) mult *= 2.0; dealDamage(s, e, mult, "Pyro", log, ft, pl, 1, state); } }); } }
    ]
  }),
  tide: (uid, l, c, arts = []) => ({
    id: "tide", uid, isEnemy: false, name: "Прилив", element: "Hydro", color: "bg-cyan-500", level: l, constellation: c,
    image: getCharSplash('tide') || undefined,
    stats: scaleStats(1250, 160, 80, 38, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ti_atk", name: "Струя воды", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Гидро урон.',
        statsText: "Урон: 100% АТК", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Hydro", log, ft, pl, 3, state); } },
      { id: "ti_e", name: "Восстановление", type: "Skill1", cost: 3, target: "SingleAlly", description: 'Сильное лечение и бафф.',
        statsText: "Лечение: 300% АТК\nПродвижение хода: 10%", execute: (s, t, state, log, ft, pl) => { const heal = Math.round(s.stats.atk * 3); t[0].stats.hp = Math.min(t[0].stats.maxHp, t[0].stats.hp + heal); t[0].buffs.atk = (t[0].buffs.atk || 0) + 30; if (c >= 1) t[0].atb = Math.min(100, t[0].atb + 10); if(ft) ft(t[0].uid, `+${Math.floor(heal)}`, 'text-green-400'); } },
      { id: "ti_q", name: "Океанская молитва", type: "Skill2", cost: 6, target: "AllAllies", description: 'Лечит весь отряд и дает регенерацию.',
        statsText: "Лечение: 200% АТК\nПродвижение хода: 10%\nБафф: +30 Сопротивление", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const heal = Math.round(s.stats.atk * 2); a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal); a.buffs.regen = (a.buffs.regen || 0) + 3; if (c >= 1) a.atb = Math.min(100, a.atb + 10); if(ft) ft(a.uid, 'РЕГЕН', 'text-cyan-300'); }); if (c >= 6) { s.buffs.res = (s.buffs.res || 0) + 30; if(ft) ft(s.uid, 'C6: OCEAN', 'text-blue-300'); } } }
    ]
  }),
  nova: (uid, l, c, arts = []) => ({
    id: "nova", uid, isEnemy: false, name: "Нова", element: "Physical", color: "bg-slate-300 text-black", level: l, constellation: c,
    image: getCharSplash('nova') || undefined,
    stats: scaleStats(1000, 300, 40, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "no_atk", name: "Сокрушение", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Массивный физ урон.',
        statsText: "Урон: 130% АТК\nЛечение: 8% HP (на C1)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.3, "Physical", log, ft, pl, 1, state); if (c >= 1) { s.stats.hp = Math.min(s.stats.maxHp, Math.round(s.stats.hp + s.stats.maxHp * 0.08)); if(ft) ft(s.uid, 'C1: REGEN', 'text-green-400'); } } },
      { id: "no_e", name: "Боевой азарт", type: "Skill1", cost: 2, target: "Self", description: 'Тратит HP для баффа атаки.',
        statsText: "Расход: 20% HP\nБафф: +100 АТК, +30 СКОР", execute: (s, t, state, log, ft, pl) => { const cost = Math.round(s.stats.hp * 0.2); s.stats.hp = Math.max(1, s.stats.hp - cost); s.buffs.atk = (s.buffs.atk || 0) + 100; if (c >= 2) s.buffs.spd = (s.buffs.spd || 0) + 30; if(ft) ft(s.uid, 'ЯРОСТЬ', 'text-red-600'); } },
      { id: "no_q", name: "Удар сверхновой", type: "Skill2", cost: 5, target: "SingleEnemy", description: 'Ультимативный физический удар.',
        statsText: "Урон: 450% АТК (доп. +50% игнор. ЗАЩ на C6)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 4.5, "Physical", log, ft, pl, 1, state, c >= 6 ? 0.5 : 0); } }
    ]
  }),
  glacier: (uid, l, c, arts = []) => ({
    id: "glacier", uid, isEnemy: false, name: "Глетчер", element: "Cryo", color: "bg-blue-200 text-black", level: l, constellation: c,
    image: getCharSplash('glacier') || undefined,
    stats: scaleStats(1100, 200, 75, 40, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "gl_atk", name: "Осколок льда", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Крио урон.',
        statsText: "Урон: 100% АТК (множитель растёт от ЗАЩ)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.1, "Cryo", log, ft, pl, 2, state); } },
      { id: "gl_e", name: "Обморожение", type: "Skill1", cost: 3, target: "SingleEnemy", description: 'Замораживает врага (пропуск хода).',
        statsText: "Урон: 150% АТК (множитель растёт от ЗАЩ)", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.5, "Cryo", log, ft, pl, 1, state); t[0].buffs.frozen = 1; t[0].atb = 0; if(ft) ft(t[0].uid, 'ЗАМОРОЗКА', 'text-cyan-400'); } },
      { id: "gl_q", name: "Ледниковый период", type: "Skill2", cost: 6, target: "AllEnemies", description: 'AoE Крио урон, шанс заморозить всех.',
        statsText: "Урон: 200% АТК (множитель растёт от ЗАЩ)\nШанс заморозить: 30%", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { let mult = 2.0; if (c >= 6 && e.aura === "Cryo") mult = 3.0; dealDamage(s, e, mult, "Cryo", log, ft, pl, 4, state); if(Math.random() < 0.3) e.buffs.frozen = 1; } }); } }
    ]
  }),
  pulse: (uid, l, c, arts = []) => ({
    id: "pulse", uid, isEnemy: false, name: "Пульс", element: "Electro", color: "bg-indigo-400", level: l, constellation: c,
    image: getCharSplash('pulse') || undefined,
    stats: scaleStats(1050, 170, 70, 50, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "pu_atk", name: "Импульс", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Электро урон, дает ATB.',
        statsText: "Урон: 90% АТК / 120% АТК\nПродвижение хода: 15%", execute: (s, t, state, log, ft, pl) => { let mult = 0.9; if (c >= 6 && s.stats.hp > s.stats.maxHp * 0.8) mult = 1.2; dealDamage(s, t[0], mult, "Electro", log, ft, pl, 2, state); s.atb += 15; } },
      { id: "pu_e", name: "Подзарядка", type: "Skill1", cost: 3, target: "SingleAlly", description: 'Дает 50 ATB союзнику.',
        statsText: "Продвижение хода: 50%", execute: (s, t, state, log, ft, pl) => { t[0].atb = Math.min(100, t[0].atb + 50); if(ft) ft(t[0].uid, 'ATB +50', 'text-yellow-400'); } },
      { id: "pu_q", name: "Тотальный разряд", type: "Skill2", cost: 5, target: "AllAllies", description: 'Дает ATB всему отряду.',
        statsText: "Продвижение хода: 30%", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { if(a.stats.hp > 0) a.atb = Math.min(100, a.atb + 30); }); } }
    ]
  }),
  gaia: (uid, l, c, arts = []) => ({
    id: "gaia", uid, isEnemy: false, name: "Гайя", element: "Dendro", color: "bg-lime-600", level: l, constellation: c,
    image: getCharSplash('gaia') || undefined,
    stats: scaleStats(1300, 150, 90, 35, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ga_atk", name: "Лоза", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Дендро урон.',
        statsText: "Урон: 100% АТК", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 2, state); } },
      { id: "ga_e", name: "Рост", type: "Skill1", cost: 3, target: "AllAllies", description: 'Лечит отряд в зависимости от макс HP.',
        statsText: "Лечение: 15% HP", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const heal = Math.round(s.stats.maxHp * 0.15); a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal); }); } },
      { id: "ga_q", name: "Дух леса", type: "Skill2", cost: 5, target: "AllAllies", description: 'Огромное лечение.',
        statsText: "Лечение: 30% HP (+5% HP на C1)", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + Math.round(s.stats.maxHp * 0.3)); if (c >= 1) { a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + Math.round(a.stats.maxHp * 0.05)); if(ft) ft(a.uid, '+5% HP', 'text-green-400'); } }); } }
    ]
  }),
  fenris: (uid, l, c, arts = []) => ({
    id: "fenris", uid, isEnemy: false, name: "Фенрис", element: "Dendro", color: "bg-emerald-800", level: l, constellation: c,
    image: getCharSplash('fenris') || undefined,
    stats: scaleStats(1100, 185, 75, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: { beastMode: 'Aggressive' },
    skills: [
      { 
        id: "fe_atk", 
        name: "Охотничий дуэт", 
        type: "Attack", 
        cost: 0, 
        target: "SingleEnemy", 
        description: 'Двойная атака: выстрел Охотника (Дендро), затем укус Зверя (Физ). Продлевает статусы врага.',
        statsText: "Урон: 70% АТК + 60% АТК\nДебафф: -15% Сопротивление", 
        execute: (s, t, state, log, ft, pl) => { 
          const target = t[0];
          // Part 1: Hunter
          dealDamage(s, target, 0.7, "Dendro", log, ft, pl, 1, state);
          
          // Part 2: Beast
          setTimeout(() => {
            if (target.stats.hp <= 0) return;
            let beastMult = 0.6;
            if (c >= 1) beastMult *= 1.2;
            if (c >= 6) beastMult *= 1.4;

            // Pack Hunt logic
            if (target.aura === "Pyro" || target.aura === "Electro" || target.aura === "Dendro") {
               if (ft) ft(target.uid, "ЗАГОННАЯ ОХОТА!", "text-emerald-400 font-black");
               target.buffs.resDown = (target.buffs.resDown || 0) + 0.15;
               // Extend aura? Simple logic: if aura is nullified by next tick, we keep it. 
               // In this engine, aura stays until reaction. So "Extend" might mean nothing happens or we just add a buff.
            }

            dealDamage(s, target, beastMult, "Physical", log, ft, pl, 1, state);
            if (c >= 2) s.atb = Math.min(100, s.atb + 10);
            
            // Random chance for Bleed
            if (Math.random() < 0.4) {
              target.buffs.bleed = (target.buffs.bleed || 0) + 1;
              if (ft) ft(target.uid, "КРОВОТЕЧЕНИЕ", "text-red-600 font-bold");
            }
          }, 500);
        } 
      },
      { 
        id: "fe_e", 
        name: "Команда: Зверь", 
        type: "Skill1", 
        cost: 3, 
        target: "SingleEnemy", 
        description: 'Смена режима зверя. Агрессия: мощный удар и кровотечение. Защита: щит для Охотника.',
        statsText: "Урон (Атака): 180% АТК\nЩит (Защита): 20% HP", 
        execute: (s, t, state, log, ft, pl) => { 
          const target = t[0];
          const mode = s.buffs.beastMode || 'Aggressive';
          
          if (mode === 'Aggressive') {
            // Aggressive Action: Beast pounces
            dealDamage(s, target, 1.8, "Physical", log, ft, pl, 2, state);
            target.buffs.bleed = (target.buffs.bleed || 0) + 2;
            if (ft) ft(target.uid, "РАЗОДРАЛ!", "text-red-500 font-black");
            s.buffs.beastMode = 'Protective'; // Toggle
            if (ft) setTimeout(() => ft(s.uid, "РЕЖИМ: ЗАЩИТА", "text-blue-400"), 400);
          } else {
            // Protective Action: Beast guards
            let shieldVal = s.stats.maxHp * 0.2;
            if (c >= 4) shieldVal *= 1.5;
            s.buffs.shield = (s.buffs.shield || 0) + shieldVal;
            if (ft) ft(s.uid, "ЗВЕРЬ ПРИКРЫВАЕТ!", "text-blue-300 font-bold");
            if (pl) pl(s.uid, "shield");
            s.buffs.beastMode = 'Aggressive'; // Toggle
            if (ft) setTimeout(() => ft(s.uid, "РЕЖИМ: АТАКА", "text-red-400"), 400);
          }
        } 
      },
      { 
        id: "fe_q", 
        name: "Великая Охота", 
        type: "Skill2", 
        cost: 6, 
        target: "AllEnemies", 
        description: 'Охотник выпускает стрелы, Зверь разрывает всех. Наносит огромный Dendro и Physical урон.',
        statsText: "Урон: 120% АТК + 150% АТК", 
        execute: (s, t, state, log, ft, pl) => { 
          t.forEach(enemy => { 
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 1.2, "Dendro", log, ft, pl, 3, state);
              setTimeout(() => {
                if (enemy.stats.hp > 0) {
                  dealDamage(s, enemy, 1.5, "Physical", log, ft, pl, 2, state);
                  enemy.buffs.bleed = (enemy.buffs.bleed || 0) + 2;
                }
              }, 600);
            }
          }); 
          if (ft) ft(s.uid, "СМЕРТЕЛЬНАЯ ЛОВУШКА!", "text-emerald-500 font-black text-lg");
        } 
      }
    ]
  }),
  raven: (uid, l, c, arts = []) => ({
    id: "raven", uid, isEnemy: false, name: "Рейвен", element: "Electro", color: "bg-indigo-900", level: l, constellation: c,
    image: getCharSplash('raven') || undefined,
    stats: scaleStats(1050, 240, 70, 52, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { 
        id: "ra_atk", 
        name: "Фантомный бросок", 
        type: "Attack", 
        cost: 0, 
        target: "SingleEnemy", 
        description: 'Электро урон (1.0x). Если на цели нет дебаффов, урон х1.5. При убийстве цели без дебаффов продвигает союзников на 15 ATB.',
        statsText: "Урон: 100% АТК / 150% АТК\nПродвижение хода: 15%", 
        execute: (s, t, state, log, ft, pl) => { 
          const target = t[0];
          const hasDebuff = (target.buffs.thorns ?? 0) > 0 || (target.buffs.poison ?? 0) > 0 || (target.buffs.frozen ?? 0) > 0 || (target.buffs.burn ?? 0) > 0 || (target.buffs.mute ?? 0) > 0 || (target.buffs.resDown ?? 0) > 0 || (target.buffs.bleed ?? 0) > 0 || (target.buffs.duelMark ?? 0) > 0 || (target.buffs.spd ?? 0) < 0 || (target.buffs.def ?? 0) < 0 || (target.buffs.atk ?? 0) < 0;
          const mult = hasDebuff ? 1.0 : 1.5;
          if (pl) pl(target.uid, "raven_throw");
          dealDamage(s, target, mult, "Electro", log, ft, pl, 2, state);
          if (target.stats.hp <= 0 && !hasDebuff && state) {
             state.playerParty.forEach(a => { if(a.uid !== s.uid && a.stats.hp > 0) a.atb = Math.min(100, a.atb + 15); });
             if (ft) ft(s.uid, "АТБ +15", "text-indigo-400 font-bold");
          }
        } 
      },
      { 
        id: "ra_e", 
        name: "Сектор зачистки", 
        type: "Skill1", 
        cost: 2, 
        target: "AllEnemies", 
        description: 'AoE Электро урон. Враги с дебаффами игнорируются (0 урона). Базовый урон (1.2x) умножается на (Всего живых врагов / Врагов без дебаффов). При убийстве врага без дебаффов союзники получают 20 ATB.',
        statsText: "Урон: 120% АТК\nПродвижение хода: 20%", 
        execute: (s, t, state, log, ft, pl) => { 
          if (pl) {
            pl(s.uid, "raven_sector");
            pl(s.uid, "shake");
          }
          const aliveEnemies = t.filter(e => e.stats.hp > 0);
          const totalAlive = aliveEnemies.length;
          if (totalAlive === 0) return;
          const enemiesWithoutDebuff = aliveEnemies.filter(e => {
            return !((e.buffs.thorns ?? 0) > 0 || (e.buffs.poison ?? 0) > 0 || (e.buffs.frozen ?? 0) > 0 || (e.buffs.burn ?? 0) > 0 || (e.buffs.mute ?? 0) > 0 || (e.buffs.resDown ?? 0) > 0 || (e.buffs.bleed ?? 0) > 0 || (e.buffs.duelMark ?? 0) > 0 || (e.buffs.spd ?? 0) < 0 || (e.buffs.def ?? 0) < 0 || (e.buffs.atk ?? 0) < 0);
          });
          const noDebuffCount = enemiesWithoutDebuff.length;
          let kills = 0;

          if (noDebuffCount === 0) {
            if (ft) ft(s.uid, "Изоляция целей...", "text-indigo-400 font-semibold");
            return;
          }

          const multiplier = 1.2 * (totalAlive / noDebuffCount);
          aliveEnemies.forEach(enemy => {
            const hasDebuff = !enemiesWithoutDebuff.includes(enemy);
            if (hasDebuff) {
              if (ft) ft(enemy.uid, "Изолирован", "text-slate-500 text-xs");
            } else {
              dealDamage(s, enemy, multiplier, "Electro", log, ft, pl, 3, state);
              if (enemy.stats.hp <= 0) kills++;
            }
          });

          if (kills > 0 && state) {
            state.playerParty.forEach(a => { if(a.uid !== s.uid && a.stats.hp > 0) a.atb = Math.min(100, a.atb + 20 * kills); });
            if (ft) ft(s.uid, "Цели устранены", "text-indigo-400 font-bold");
          }
        } 
      },
      { 
        id: "ra_q", 
        name: "Танец с тенью", 
        type: "Skill2", 
        cost: 6, 
        target: "AllEnemies", 
        description: 'Огромный AoE Электро урон (2.5x). Враги с дебаффами игнорируются, но за каждого проигнорированного врага Крит. урон Рейвена повышается на 20%. Убивая цели, дает 30 ATB союзникам.',
        statsText: "Урон: 250% АТК / 400% АТК\nПродвижение хода: 30%", 
        execute: (s, t, state, log, ft, pl) => { 
          if (pl) {
            pl(s.uid, "raven_dance");
            pl(s.uid, "shake");
          }
          const aliveEnemies = t.filter(e => e.stats.hp > 0);
          let ignoredCount = 0;
          let kills = 0;

          aliveEnemies.forEach(enemy => {
            const hasDebuff = (enemy.buffs.thorns ?? 0) > 0 || (enemy.buffs.poison ?? 0) > 0 || (enemy.buffs.frozen ?? 0) > 0 || (enemy.buffs.burn ?? 0) > 0 || (enemy.buffs.mute ?? 0) > 0 || (enemy.buffs.resDown ?? 0) > 0 || (enemy.buffs.bleed ?? 0) > 0 || (enemy.buffs.duelMark ?? 0) > 0 || (enemy.buffs.spd ?? 0) < 0 || (enemy.buffs.def ?? 0) < 0 || (enemy.buffs.atk ?? 0) < 0;
            if (hasDebuff) {
              ignoredCount++;
              if (ft) ft(enemy.uid, "Изолирован", "text-slate-500 text-xs");
            } else {
              let mult = 2.5;
              if (c >= 6) mult = 4.0;
              dealDamage(s, enemy, mult, "Electro", log, ft, pl, 5, state);
              if (enemy.stats.hp <= 0) kills++;
            }
          });

          if (ignoredCount > 0) {
            s.buffs.critDamage = (s.buffs.critDamage || 0) + (20 * ignoredCount);
            if (ft) ft(s.uid, `+${20 * ignoredCount}% КРИТ. УРОН`, "text-fuchsia-500 font-bold");
          }

          if (kills > 0 && state) {
            state.playerParty.forEach(a => { if(a.uid !== s.uid && a.stats.hp > 0) a.atb = Math.min(100, a.atb + 30 * kills); });
          }
        } 
      }
    ]
  }),
  volta: (uid, l, c, arts = []) => ({
    id: "volta", uid, isEnemy: false, name: "Вольта", element: "Electro", color: "bg-violet-700", level: l, constellation: c,
    image: getCharSplash('volta') || undefined,
    stats: scaleStats(1550, 140, 95, 48, l, c, arts), atb: 0, cooldowns: {},
    buffs: {
      voltage: c >= 1 ? 5 : 0
    },
    skills: [
      {
        id: "vt_atk",
        name: "Токовый Импульс",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Электро урон (0.6x ATK + 15% от макс. HP Вольты). Если есть ≥2 стака Вольтажа, тратит 2 стака для лечения союзника с наименьшим HP на 10% от макс. HP Вольты.',
        statsText: "Урон: 60% АТК + 15% HP\nЛечение: 10% HP (при 2 Вольтаже)",
        execute: (s, t, state, log, ft, pl) => {
          let baseHpDmg = s.stats.maxHp * 0.15;
          if (c >= 6) baseHpDmg += s.stats.maxHp * 0.10;
          const totalAtkFactor = 0.6 + (baseHpDmg / Math.max(1, s.stats.atk));

          if (pl) pl(t[0].uid, "volta_pulse");
          dealDamage(s, t[0], totalAtkFactor, "Electro", log, ft, pl, 2, state);

          const currentV = s.buffs.voltage || 0;
          if (currentV >= 2 && state) {
            s.buffs.voltage = Math.max(0, currentV - 2);
            let healVal = s.stats.maxHp * 0.10;
            if (c >= 3) healVal *= 1.2;

            const aliveAllies = state.playerParty.filter(p => p.stats.hp > 0);
            const lowest = [...aliveAllies].sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0];
            if (lowest) {
              lowest.stats.hp = Math.min(lowest.stats.maxHp, lowest.stats.hp + healVal);
              if (ft) {
                ft(s.uid, "-2 ВОЛЬТАЖ", "text-cyan-400 text-xs");
                ft(lowest.uid, `+${Math.floor(healVal)} HP`, "text-emerald-400 font-bold");
              }
              if (pl) pl(lowest.uid, "heal");
            }
          }
          if (pl) pl(s.uid, "attack");
        }
      },
      {
        id: "vt_e",
        name: "Проводящий Контур",
        type: "Skill1",
        cost: c >= 5 ? 2 : 3,
        target: "AllAllies",
        description: 'Накладывает метку «Проводящий контур» на всех союзников на 3 хода (-15% входящего урона, накапливает Вольтаж при атаках и уроне). Мгновенно лечит команду от макс. HP Вольты и заряда.',
        statsText: "Лечение: от 6% HP (зависит от Вольтажа)\nДлительность: 3 хода\nБафф: +15 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          const currentV = s.buffs.voltage || 0;
          let healBasePct = 0.06 + (currentV * 0.015);
          if (c >= 3) healBasePct *= 1.2;
          const healAmount = Math.floor(s.stats.maxHp * healBasePct);

          t.forEach(ally => {
            if (ally.stats.hp > 0) {
              ally.buffs.conductionCircuit = 3;
              ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + healAmount);
              if (ft) {
                ft(ally.uid, "⚡ ПРОВОДЯЩИЙ КОНТУР", "text-violet-400 font-bold text-xs");
                ft(ally.uid, `+${healAmount} HP`, "text-emerald-400 text-xs");
              }
              if (pl) pl(ally.uid, "shield");
            }
          });

          if (c >= 4 && currentV >= 5) {
            t.forEach(ally => {
              ally.buffs.spd = (ally.buffs.spd || 0) + 15;
              if (ft) ft(ally.uid, "+15 СКОРОСТЬ", "text-cyan-300 text-xs");
            });
          }

          if (pl) pl(s.uid, "volta_pulse");
          if (log) log(`${s.name} активирует Проводящий Контур: команда замкнута в защитную энергоцепь!`);
        }
      },
      {
        id: "vt_q",
        name: "Биоэлектрический Резонанс",
        type: "Skill2",
        cost: c >= 5 ? 4 : 5,
        target: "AllAllies",
        description: 'Разряжает весь накопленный Вольтаж! Массово исцеляет отряд (15% HP + 3.5% за каждый стак Вольтажа), накладывает Щит Сверхпроводимости и заливает ATB. При ≥6 стаках поражает всех врагов током.',
        statsText: "Лечение: от 15% HP (зависит от Вольтажа)\nЩит: от 10% HP (зависит от Вольтажа)",
        execute: (s, t, state, log, ft, pl) => {
          const currentV = s.buffs.voltage || 0;
          let healPct = 0.15 + (currentV * 0.035);
          if (c >= 3) healPct *= 1.2;
          const healAmount = Math.floor(s.stats.maxHp * healPct);

          let shieldPct = 0.10 + (currentV * 0.02);
          const shieldAmount = Math.floor(s.stats.maxHp * shieldPct);

          const atbSurge = 15 + Math.floor(currentV * 1.5);

          t.forEach(ally => {
            if (ally.stats.hp > 0) {
              ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + healAmount);
              ally.buffs.shield = (ally.buffs.shield || 0) + shieldAmount;
              ally.atb = Math.min(100, ally.atb + atbSurge);
              if (ft) {
                ft(ally.uid, `+${healAmount} HP`, "text-emerald-400 font-extrabold");
                ft(ally.uid, `🛡️ ЩИТ +${shieldAmount}`, "text-cyan-400 font-bold text-xs");
                ft(ally.uid, `⚡ +${atbSurge}% ATB`, "text-yellow-300 font-bold text-xs");
              }
              if (pl) pl(ally.uid, "heal");
            }
          });

          // Discharge shockwave against enemies if high voltage
          if (currentV >= 6 && state && state.enemyParty) {
            let shockDmg = s.stats.maxHp * 0.20;
            if (c >= 6) shockDmg += s.stats.maxHp * 0.10;
            const shockMultiplier = shockDmg / Math.max(1, s.stats.atk);

            if (log) log(`${s.name} высвобождает колоссальный разряд Вольтажа по врагам!`);
            state.enemyParty.forEach(e => {
              if (e.stats.hp > 0) {
                dealDamage(s, e, shockMultiplier, "Electro", log, ft, pl, 3, state);
              }
            });
          }

          if (ft) ft(s.uid, `💥 РАЗРЯДКА (${currentV} СТАКОВ)`, "text-violet-300 font-black text-sm");
          s.buffs.voltage = 0; // consume all voltage
          if (pl) {
            pl(s.uid, "volta_pulse");
            pl(s.uid, "ultimate_burst");
          }
        }
      }
    ]
  })
};


export const baseCharacterPool = Object.keys(characterBlueprints);

export const getAdaptiveStoryStageLevel = (
  stage: { id: string; level?: number; isBoss?: boolean },
  chapterId?: string,
  profile?: PlayerProfile
): number => {
  if (!profile || !profile.team || profile.team.length === 0) {
    return Math.max(1, stage.level || 1);
  }

  // 1. Calculate active team power level (average and top hero level)
  const teamMemberLevels = profile.team
    .map(id => profile.roster?.[id]?.level || 1)
    .filter(lvl => typeof lvl === 'number' && lvl > 0);

  const avgLevel = teamMemberLevels.length > 0
    ? teamMemberLevels.reduce((sum, l) => sum + l, 0) / teamMemberLevels.length
    : 1;
  const maxLevel = teamMemberLevels.length > 0 ? Math.max(...teamMemberLevels) : 1;
  
  // Weighted player base level: 70% average of current 4-man team, 30% top hero
  const playerBaseLevel = Math.max(1, Math.round(avgLevel * 0.7 + maxLevel * 0.3));

  // 2. Identify chapter and stage progression
  const targetChapterId = chapterId || 'chap1';
  const chapIndex = STORY_CHAPTERS.findIndex(c => c.id === targetChapterId);
  const currentChapter = STORY_CHAPTERS[chapIndex >= 0 ? chapIndex : 0] || STORY_CHAPTERS[0];
  
  const stageIndex = currentChapter ? currentChapter.stages.findIndex(s => s.id === stage.id) : 0;
  const totalStages = Math.max(1, currentChapter?.stages?.length || 20);
  const stageProgressRatio = stageIndex >= 0 ? stageIndex / Math.max(1, totalStages - 1) : 0;

  // 3. Progressive offset:
  // - Early stages (stage 1-3) start directly at player level (or Level 1 for starter)
  // - Stage progression adds +0 to +3 levels smoothly across the chapter
  // - Boss stages add a +2 level challenge
  // - Subsequent chapters add +1 base per chapter
  const chapterBaseBonus = Math.max(0, chapIndex >= 0 ? chapIndex : 0);
  const stageProgressionBonus = Math.round(stageProgressRatio * 3); // 0, 1, 2, 3
  const bossBonus = stage.isBoss ? 2 : 0;

  let adaptiveLevel = playerBaseLevel + chapterBaseBonus + (stageProgressionBonus - (playerBaseLevel <= 3 ? 0 : 1)) + bossBonus;

  // At the absolute beginning of the game (player level 1 and early stages):
  if (playerBaseLevel === 1 && stageProgressRatio < 0.25) {
    adaptiveLevel = 1;
  }

  return Math.max(1, Math.min(100, adaptiveLevel));
};

export const createBasicEnemy = (level: number = 1, blueprintId?: string, isAbyss: boolean = false, isBoss: boolean = false): Combatant => {
  const effectiveLevel = Math.max(1, Math.min(100, Math.round(level)));

  if (blueprintId && characterBlueprints[blueprintId]) {
    const enemy = characterBlueprints[blueprintId]("v_" + Math.random(), effectiveLevel, 0);
    enemy.isEnemy = true;
    enemy.name = isBoss ? `БОСС: ${enemy.name}` : `${enemy.name} (Заражённый)`;
    
    // Balanced HP and damage scaling for standard vs abyss vs boss
    const hpMult = isAbyss ? (isBoss ? 10 : 4) : (isBoss ? 2.5 : 1.2);
    const atkMult = isAbyss ? (isBoss ? 1.6 : 1.2) : (isBoss ? 1.15 : 0.95);
    const defMult = isAbyss ? 1.2 : 1.0;
    
    enemy.stats.hp = Math.floor(enemy.stats.hp * hpMult);
    enemy.stats.maxHp = enemy.stats.hp;
    enemy.stats.atk = Math.floor(enemy.stats.atk * atkMult);
    enemy.stats.def = Math.floor(enemy.stats.def * defMult);
    
    return enemy;
  }

  const enemyImages = [
    '/src/assets/images/glitch_slime_enemy_1779480847452.png',
    '/src/assets/images/glitch_robot_enemy_1779480865219.png',
    '/src/assets/images/glitch_void_enemy_1779480881509.png'
  ];
  const hpMult = isAbyss ? (isBoss ? 25 : 8) : (isBoss ? 2.8 : 1.2);
  const atkMult = isAbyss ? (isBoss ? 3 : 2) : (isBoss ? 1.2 : 0.95);

  const baseHp = isBoss ? 2800 : 1300;
  const baseAtk = isBoss ? 160 : 120;
  const baseDef = isBoss ? 80 : 60;

  return {
    id: "virus_" + Math.random(), 
    uid: "v_" + Math.random(), 
    isEnemy: true, 
    image: enemyImages[Math.floor(Math.random() * enemyImages.length)],
    name: isBoss ? "СУПЕРГЛИТЧ (БОСС)" : `Глитч-сканер (Ур.${effectiveLevel})`, 
    element: "Physical", 
    color: "bg-gray-700", 
    level: effectiveLevel, 
    constellation: 0,
    stats: scaleStats(baseHp * hpMult, baseAtk * atkMult, baseDef, 30, effectiveLevel, 0, [], isAbyss, isBoss), 
    atb: 0, 
    cooldowns: {}, 
    buffs: {},
    skills: [
      { id: "e_atk", name: "Пакетная атака", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Удар данными.', execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], isBoss ? 2.0 : 1.2, "Physical", log, ft, pl, isBoss ? 4 : 1, state); } }
    ]
  };
};

export const generateAbyssWaves = (floorId: number, level: number): Combatant[][] => {
  const waves: Combatant[][] = [];
  const numWaves = Math.min(3, 1 + Math.floor(floorId / 4)); // Adjusted for 12 floors
  
  // For resettable floors (9-12), use the current hour to rotate boss pool
  const now = new Date();
  const hour = now.getHours();
  
  for (let w = 0; w < numWaves; w++) {
    const isBossWave = w === numWaves - 1;
    const enemies: Combatant[] = [];
    const numEnemies = isBossWave ? 2 : 3;
    
    for (let i = 0; i < numEnemies; i++) {
      const isBoss = isBossWave && i === 0;
      
      const normalBlueprints = ['kamikaze', 'gotka', 'viper', 'blaze', 'glacier', 'aegis', 'claymore', 'spark'];
      const bossBlueprints = ['selva', 'moyan', 'aelita', 'selina', 'neuron', 'krona', 'fenris', 'asher'];
      
      let bp: string | undefined;
      if (isBoss) {
         if (floorId >= 9) {
            // Rotate bosses for lunar floors
            bp = bossBlueprints[(floorId + hour + i) % bossBlueprints.length];
         } else {
            bp = bossBlueprints[floorId % bossBlueprints.length];
         }
      } else {
         if (floorId >= 9) {
            bp = normalBlueprints[(floorId + hour + i) % normalBlueprints.length];
         }
      }
      
      enemies.push(createBasicEnemy(level, bp, true, isBoss));
    }
    waves.push(enemies);
  }
  
  return waves;
};

import { StoryChapter } from "./types";
import { CHAPTER_1 } from "./data/chapter1";

export const STORY_CHAPTERS: StoryChapter[] = [CHAPTER_1];


export const createGlitchSectorEnemy = (sectorId: number): Combatant => {
  const sectorConfigs = [
    {
      name: "Глитч-Слайм",
      element: "Dendro" as Element,
      color: "bg-emerald-900 border-emerald-500",
      hp: 40000,
      atk: 450,
      def: 150,
      level: 40,
      image: '/src/assets/images/glitch_slime_enemy_1779480847452.png'
    },
    {
      name: "Кибер-Дрон X9",
      element: "Electro" as Element,
      color: "bg-purple-900 border-purple-500",
      hp: 80000,
      atk: 700,
      def: 250,
      level: 55,
      image: '/src/assets/images/glitch_robot_enemy_1779480865219.png'
    },
    {
      name: "Фантом Пустоты",
      element: "Anemo" as Element,
      color: "bg-slate-800 border-indigo-500",
      hp: 140000,
      atk: 1000,
      def: 350,
      level: 70,
      image: '/src/assets/images/glitch_void_enemy_1779480881509.png'
    },
    {
      name: "Кодовый Паразит",
      element: "Hydro" as Element,
      color: "bg-blue-900 border-blue-400",
      hp: 220000,
      atk: 1400,
      def: 450,
      level: 80,
      image: '/src/assets/images/glitch_void_enemy_1779480881509.png'
    },
    {
      name: "Матричный Страж",
      element: "Geo" as Element,
      color: "bg-orange-950 border-orange-500",
      hp: 400000,
      atk: 1800,
      def: 600,
      level: 90,
      image: '/src/assets/images/glitch_robot_enemy_1779480865219.png'
    }
  ];

  const config = sectorConfigs[sectorId - 1] || sectorConfigs[0];

  return {
    id: `glitch_sec_${sectorId}_${Math.random()}`,
    uid: `gs_${sectorId}_${Math.random()}`,
    isEnemy: true,
    name: config.name,
    element: config.element,
    color: config.color,
    level: config.level,
    constellation: 0,
    image: config.image,
    stats: {
      hp: config.hp,
      maxHp: config.hp,
      atk: config.atk,
      def: config.def,
      spd: 85 + (sectorId * 2)
    },
    buffs: {
      critChance: 10 + sectorId,
      critDamage: 30 + (sectorId * 5)
    },
    atb: 0,
    cooldowns: {},
    skills: [
      {
        id: "glitch_basic",
        name: "Искажение данных",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Наносит урон и может снизить атаку цели.',
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.2, s.element, log, ft, pl, 1, state);
          if (Math.random() > 0.7) {
            t[0].buffs.atk = (t[0].buffs.atk || 0) - Math.floor(t[0].stats.atk * 0.1);
            if (ft) ft(t[0].uid, "↓АТК", "text-red-400 font-bold");
          }
        }
      },
      {
        id: "glitch_skill",
        name: "Системная ошибка",
        type: "Skill1",
        cost: 3,
        target: "AllEnemies",
        description: 'AoE урон, накладывающий случайный дебафф.',
        statsText: "Дебафф: -15 ЗАЩ, -15 СКОР",
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "ultimate_aoe");
          t.forEach(enemy => {
            if (enemy.stats.hp > 0) {
              dealDamage(s, enemy, 1.0, s.element, log, ft, pl, 2, state);
              const r = Math.random();
              if (r < 0.3) enemy.buffs.spd = -15;
              else if (r < 0.6) enemy.buffs.def = -15;
              else enemy.buffs.burn = 2;
            }
          });
        }
      }
    ]
  };
};

export const createTrialEnemy = (trialId: number): Combatant => {
  const configs = [
    { name: "Теневой Рыцарь", element: "Pyro" as Element, hp: 120000, atk: 800, def: 300, level: 50 },
    { name: "Информационный Страж", element: "Cryo" as Element, hp: 200000, atk: 1100, def: 400, level: 65 },
    { name: "Отраженная Тень", element: "Electro" as Element, hp: 350000, atk: 1500, def: 500, level: 80 },
    { name: "Сингулярное Ядро", element: "Anemo" as Element, hp: 600000, atk: 2200, def: 700, level: 95 }
  ];

  const config = configs[trialId - 1] || configs[0];

  return {
    id: `trial_e_${trialId}_${Math.random()}`,
    uid: `te_${trialId}_${Math.random()}`,
    isEnemy: true,
    name: config.name,
    element: config.element,
    color: "bg-slate-900 border-indigo-500",
    level: config.level,
    constellation: 0,
    image: getCharSplash('maestro') || undefined,
    stats: {
      hp: config.hp,
      maxHp: config.hp,
      atk: config.atk,
      def: config.def,
      spd: 90 + trialId * 5
    },
    buffs: {
      critChance: 15,
      critDamage: 50
    },
    atb: 0,
    cooldowns: {},
    skills: [
      {
        id: "trial_atk",
        name: "Удар Испытания",
        type: "Attack",
        cost: 0,
        target: "SingleEnemy",
        description: 'Наносит урон и восстанавливает энергию босса.',
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.5, s.element, log, ft, pl, 1, state);
        }
      },
      {
        id: "trial_burst",
        name: "Выброс Сингулярности",
        type: "Skill2",
        cost: 6,
        target: "AllEnemies",
        description: 'Огромный AoE урон.',
        execute: (s, t, state, log, ft, pl) => {
          if (pl) pl(s.uid, "ultimate_aoe");
          t.forEach(e => {
            if (e.stats.hp > 0) dealDamage(s, e, 2.5, s.element, log, ft, pl, 5, state);
          });
        }
      }
    ]
  };
};


export const createShadowDrone = (): Combatant => {
  const drone = createBasicEnemy(80, 'glacier');
  drone.id = 'shadow_drone';
  drone.uid = 'drone_' + Math.random();
  drone.name = 'Теневой Дрон';
  drone.element = 'Physical';
  drone.stats.maxHp = 50000;
  drone.stats.hp = 50000;
  drone.stats.def = 100;
  drone.image = '/src/assets/images/shadow_drone_enemy_1788132867651.jpg';
  drone.color = "bg-slate-800";
  drone.skills = [{ id: "dr_atk", name: "Выстрел", type: "Attack", cost: 0, target: "SingleEnemy", description: 'Урон.',
        statsText: "Урон: 80% АТК", execute: (ds, dt, ds_state, dlog, dft, dpl) => { dealDamage(ds, dt[0], 0.8, "Physical", dlog, dft, dpl, 1, ds_state); } }];
  return drone;
};

export const createIceMonolith = (): Combatant => {
  const monolith = createBasicEnemy(90, 'glacier');
  monolith.id = 'ice_monolith';
  monolith.uid = 'monolith_' + Math.random();
  monolith.name = 'Ледяной Монолит';
  monolith.element = 'Cryo';
  monolith.stats.maxHp = 150000;
  monolith.stats.hp = 150000;
  monolith.stats.atk = 500;
  monolith.stats.def = 200;
  monolith.image = '/src/assets/images/ice_monolith_enemy_1788132882968.jpg';
  monolith.color = "bg-cyan-900 border-cyan-400";
  monolith.skills = [{ id: "im_atk", name: "Морозный Импульс", type: "Attack", cost: 0, target: "AllEnemies", description: 'Слабый AoE Крио урон.',
        statsText: "Урон: 40% АТК", execute: (ds, dt, ds_state, dlog, dft, dpl) => { dt.forEach(e => { if(e.stats.hp > 0) dealDamage(ds, e, 0.4, "Cryo", dlog, dft, dpl, 1, ds_state); }); } }];
  return monolith;
};

export const generateBossRushWave = (stage: number): Combatant[] => {
  const boss = createBossRushEnemy(stage);
  const wave = [boss];
  
  if (stage === 0) {
    // Stage 0: Cyrus + Raven + Maestro
    wave.push(createShadowDrone());
    wave.push(createShadowDrone());
  } else if (stage === 1) {
    // Stage 1: Aelita + Iva (Flora / Slimes to build Thorns stacks)
    wave.push(createBasicEnemy(80, 'glitch_slime'));
    wave.push(createBasicEnemy(80, 'glitch_slime'));
  } else if (stage === 2) {
    // Stage 2: Kairen + Nereus + Aveline (Pyro minions to easily freeze & explode)
    wave.push(createBasicEnemy(85, 'blaze'));
    wave.push(createBasicEnemy(85, 'blaze'));
  }
  
  return wave;
};

export const createBossRushEnemy = (stage: number): Combatant => {
  const configs = [
    {
      id: "boss_matrix_inquisitor",
      name: "«МАТРИЧНЫЙ ИНКВИЗИТОР»",
      element: "Physical" as Element,
      color: "bg-purple-950 border-purple-500",
      level: 82,
      hp: 520000,
      atk: 1100,
      def: 1600, // Tremendous DEF: Cyrus's 100% DEF ignore completely bypasses this!
      spd: 95,
      critRate: 20,
      critDamage: 50,
      image: getCharSplash('boss_colossus') || undefined,
      skills: [
        {
          id: "br_inq_strike",
          name: "Теневой Залп",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: 'Наносит Физ урон (1.2x). Воскрешает уничтоженного Теневого Дрона.',
          statsText: "Урон: 120% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            dealDamage(s, t[0], 1.2, "Physical", log, ft, pl, 2, state);
            if (state && state.enemyParty) {
              const deadDrones = state.enemyParty.filter(e => e.id === 'shadow_drone' && e.stats.hp <= 0);
              if (deadDrones.length > 0) {
                const targetDrone = deadDrones[0];
                targetDrone.stats.hp = targetDrone.stats.maxHp;
                targetDrone.buffs = {};
                targetDrone.atb = 0;
                if (ft) ft(s.uid, "РЕЗОНАТОР ВОЗРОЖДЁН", "text-purple-400 font-bold text-xs");
              }
            }
          }
        },
        {
          id: "br_inq_wave",
          name: "Импульс Матрицы",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: 'AoE Физ урон (1.4x). Если на боссе висит метка Изоляции (Маэстро) или метка Дуэли (Сайрус), босс получает на 80% больше урона и теряет 30 ATB.',
          statsText: "Урон: 140% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "Physical");
            const hasIsolation = Boolean(s.buffs.isolationMark || s.buffs.duelMark);
            if (hasIsolation) {
              s.atb = Math.max(0, s.atb - 30);
              if (ft) ft(s.uid, "СБОЙ ИЗОЛЯЦИИ! (-30 ATB)", "text-purple-300 font-black");
              if (log) log("Метка Изоляции сбивает импульс Матричного Инквизитора!");
            }
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                const mult = hasIsolation ? 0.7 : 1.4;
                dealDamage(s, enemy, mult, "Physical", log, ft, pl, 2, state);
              }
            });
          }
        },
        {
          id: "br_inq_protocol",
          name: "Карающий Протокол",
          type: "Skill2" as const,
          cost: 6,
          target: "AllEnemies" as const,
          description: 'Ультимативный залп (2.6x). Если активна Сверхпроводимость или снижение физ. защиты (Рейвен), урон босса падает на 60%, а босс теряет 12% здоровья!',
          statsText: "Урон: 260% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            const hasPhysShred = (s.buffs.def || 0) < 0 || (s.buffs.resDown || 0) > 0 || s.aura === 'Electro';
            if (hasPhysShred) {
              const recoil = Math.floor(s.stats.maxHp * 0.12);
              s.stats.hp = Math.max(1, s.stats.hp - recoil);
              if (ft) ft(s.uid, `СВЕРХПРОВОДИМОСТЬ: -${recoil}`, "text-cyan-400 font-black");
              if (log) log(`Сверхпроводимость перегружает матрицу босса на ${recoil} урона!`);
            }
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                const mult = hasPhysShred ? 1.0 : 2.6;
                dealDamage(s, enemy, mult, "Physical", log, ft, pl, 2, state);
              }
            });
          }
        }
      ]
    },
    {
      id: "boss_primal_bramble",
      name: "«ПЕРВОБЫТНЫЙ ТЕРНОВНИК»",
      element: "Dendro" as Element,
      color: "bg-emerald-950 border-emerald-500",
      level: 88,
      hp: 780000,
      atk: 1250,
      def: 420,
      spd: 100,
      critRate: 20,
      critDamage: 50,
      image: getCharSplash('gaia') || undefined,
      skills: [
        {
          id: "br_bramble_strike",
          name: "Хлыст Лозы",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: 'Наносит Дендро урон (1.3x). Если на боссе есть стаки «Шипов» (Аэлита/Ива), урон босса снижается на 15% за каждый стак, а босс получает ответный урон.',
          statsText: "Урон: 130% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            const thornStacks = s.buffs.thorns || 0;
            const mult = Math.max(0.4, 1.3 - thornStacks * 0.15);
            dealDamage(s, t[0], mult, "Dendro", log, ft, pl, 2, state);
            if (thornStacks > 0) {
              const recoil = Math.floor(s.stats.maxHp * 0.04 * thornStacks);
              s.stats.hp = Math.max(1, s.stats.hp - recoil);
              if (ft) ft(s.uid, `ОТДАЧА ШИПОВ: -${recoil}`, "text-emerald-400 font-bold");
              if (log) log(`Шипы вонзаются в Первобытный Терновник на ${recoil} урона!`);
            }
          }
        },
        {
          id: "br_bramble_tempest",
          name: "Терновый Буран",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: 'AoE Дендро урон (1.4x). Если у союзников активна «Связь с флорой» (Ива), урон нейтрализуется и восстанавливает 15% здоровья отряду!',
          statsText: "Урон: 140% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "Dendro");
            const hasFloralBond = t.some(hero => (hero.buffs.ivaFloralBondTurns || 0) > 0);
            if (hasFloralBond) {
              t.forEach(hero => {
                if (hero.stats.hp > 0) {
                  const heal = Math.floor(hero.stats.maxHp * 0.15);
                  hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + heal);
                  if (ft) ft(hero.uid, `+${heal} (СВЯЗЬ С ФЛОРОЙ)`, "text-emerald-300 font-bold");
                }
              });
              if (log) log("Связь с Флорой Ивы поглощает буран и исцеляет команду!");
            } else {
              t.forEach(enemy => {
                if (enemy.stats.hp > 0) dealDamage(s, enemy, 1.4, "Dendro", log, ft, pl, 2, state);
              });
            }
          }
        },
        {
          id: "br_bramble_shell",
          name: "Древесный Панцирь",
          type: "Skill2" as const,
          cost: 5,
          target: "AllEnemies" as const,
          description: 'Босс укрепляет кору. Детонация стаков «Шипов» (навык Аэлиты) полностью срывает панцирь и наносит боссу колоссальный урон в размере 150 000!',
          statsText: "Урон: 240% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            const thornStacks = s.buffs.thorns || 0;
            if (thornStacks >= 2) {
              const shatterDmg = 150000;
              s.stats.hp = Math.max(1, s.stats.hp - shatterDmg);
              s.buffs.thorns = 0;
              s.atb = 0;
              if (ft) ft(s.uid, `РАСКОЛ ПАНЦИРЯ: -${shatterDmg}`, "text-emerald-400 font-black");
              if (log) log(`Шипы Аэлиты раскалывают Древесный Панцирь босса на ${shatterDmg} урона!`);
              return;
            }
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) dealDamage(s, enemy, 2.4, "Dendro", log, ft, pl, 3, state);
            });
          }
        }
      ]
    },
    {
      id: "boss_magma_leviathan",
      name: "«МАГМАТИЧЕСКИЙ ЛЕВИАФАН»",
      element: "Pyro" as Element,
      color: "bg-red-950 border-orange-500",
      level: 95,
      hp: 1150000,
      atk: 1600,
      def: 650,
      spd: 105,
      critRate: 20,
      critDamage: 50,
      image: getCharSplash('blaze') || undefined,
      skills: [
        {
          id: "br_leviathan_spit",
          name: "Магматический Выброс",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: 'Наносит Пиро урон (1.5x). Если цель обладает высоким HP (Нереус), урон рассеивается на 50%.',
          statsText: "Урон: 150% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            const isHighHp = t[0].stats.maxHp > 35000;
            const mult = isHighHp ? 0.75 : 1.5;
            dealDamage(s, t[0], mult, "Pyro", log, ft, pl, 2, state);
            if (isHighHp && ft) ft(t[0].uid, "ПРИЛИВНЫЙ БАРЬЕР HP", "text-blue-300 font-bold");
          }
        },
        {
          id: "br_leviathan_geyser",
          name: "Кипящий Гейзер",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: 'AoE Пиро урон (1.4x). Если активен «Сад Вечного Моря» Нереуса или Лотосы Авелин, гейзер мгновенно охлаждается и наносит боссу обратный Гидро урон!',
          statsText: "Урон: 140% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "Pyro");
            const hasOceanAura = t.some(hero => (hero.buffs.nereusGardenTurns || 0) > 0 || (hero.buffs.hpBoost || 0) > 0);
            if (hasOceanAura) {
              const tideRecoil = 90000;
              s.stats.hp = Math.max(1, s.stats.hp - tideRecoil);
              if (ft) ft(s.uid, `ОХЛАЖДЕНИЕ ПРИЛИВОМ: -${tideRecoil}`, "text-cyan-400 font-black");
              if (log) log("Сад Вечного Моря Нереуса и Лотосы Авелин охлаждают лаву Левиафана!");
            }
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                const mult = hasOceanAura ? 0.7 : 1.4;
                dealDamage(s, enemy, mult, "Pyro", log, ft, pl, 2, state);
              }
            });
          }
        },
        {
          id: "br_leviathan_rift",
          name: "Инфернальный Разлом",
          type: "Skill2" as const,
          cost: 6,
          target: "AllEnemies" as const,
          description: 'Заряжает катастрофический взрыв (3.2x). Если босс Заморожен (Заморозка Кайрена + Нереус/Авелин), взрыв прерывается, босс получает «Термальный Шок» и теряет 200 000 HP!',
          statsText: "Урон: 320% АТК",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            const isFrozen = (s.buffs.frozenTurns || 0) > 0 || s.aura === 'Cryo';
            if (isFrozen) {
              const freezeShatter = 200000;
              s.stats.hp = Math.max(1, s.stats.hp - freezeShatter);
              s.buffs.frozenTurns = 0;
              s.atb = 0;
              if (ft) ft(s.uid, `ТЕРМАЛЬНЫЙ ШОК: -${freezeShatter}`, "text-cyan-300 font-black");
              if (log) log(`Заморозка Кайрена и Нереуса вызывает Термальный Шок Левиафана на ${freezeShatter} урона!`);
              return;
            }
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) dealDamage(s, enemy, 3.2, "Pyro", log, ft, pl, 3, state);
            });
          }
        }
      ]
    },
  ];
  const cfg = configs[Math.min(stage, configs.length - 1)];
  return {
    id: cfg.id + "_" + Math.random(),
    uid: "br_boss_" + Math.random(),
    isEnemy: true,
    image: cfg.image,
    name: cfg.name,
    element: cfg.element,
    color: cfg.color,
    level: cfg.level,
    constellation: 6,
    stats: {
      hp: cfg.hp,
      maxHp: cfg.hp,
      atk: cfg.atk,
      def: cfg.def,
      spd: cfg.spd
    },
    atb: 20,
    cooldowns: {},
    buffs: {
      critChance: cfg.critRate,
      critDamage: cfg.critDamage
    },
    skills: cfg.skills
  };
};

