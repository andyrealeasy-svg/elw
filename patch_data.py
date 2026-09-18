import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# 1. Add Farina mechanics to dealDamage

# A. DMG Boost from Frostbite
frostbite_injection = """
      if (target.buffs.frostbite && target.buffs.frostbite > 0) {
        actualDmgBoost += 0.15;
        if (i === hits - 1 && !state?.isSubDmg) {
           target.buffs.frostbite -= 1;
        }
      }
"""
content = content.replace("let actualDmgBoost = 1 + (source.buffs.dmgBoost || 0) / 100;", "let actualDmgBoost = 1 + (source.buffs.dmgBoost || 0) / 100;\n" + frostbite_injection)

# B. Snow Dust joint attack
maestro_joint = """      // Maestro joint attack"""
farina_joint = """      // Farina Snow Dust joint attack
      if (state && source.isEnemy === false && !state.isSubDmg && i === hits - 1 && target.stats.hp > 0) {
        if (target.buffs.snowDust && target.buffs.snowDust > 0) {
          const farina = state.playerParty.find(p => p.id === 'farina');
          if (farina && farina.uid !== source.uid) {
            if (!farina.buffs.farinaDustTriggered) {
              farina.buffs.farinaDustTriggered = true;
              if (log) log(`${farina.name} (Снежная пыль) поддерживает атаку!`);
              dealDamage(farina, target, 0.5, "Cryo", log, ft, pl, 1, { ...state, isSubDmg: true });
              
              if (farina.constellation >= 1) {
                Object.keys(farina.cooldowns).forEach(k => {
                  if (farina.cooldowns[k] > 0) farina.cooldowns[k]--;
                });
              }
              if (farina.constellation >= 3) {
                target.buffs.frostbite = 1;
                if (ft) ft(target.uid, "НАЛЕДЬ", "text-cyan-200 text-xs");
              }
            }
          }
        }
      }

"""
content = content.replace(maestro_joint, farina_joint + maestro_joint)


# C. Reactions tracking for Farina C4, C5, C6
reactions_injection = """
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
                 if (ft) ft(target.uid, "ПЫЛЬ ПРОДЛЕНА", "text-cyan-300 text-xs");
               }
            }
            if (farina.buffs.whiteField && farina.buffs.whiteField > 0 && farina.constellation >= 5) {
               if (!farina.buffs.farinaC5Triggered) {
                 farina.buffs.farinaC5Triggered = true;
                 if (log) log(`Метель над белым полем!`);
                 state.enemyParty.forEach(e => {
                   if (e.stats.hp > 0) dealDamage(farina, e, 0.8, "Cryo", log, ft, pl, 1, { ...state, isSubDmg: true });
                 });
               }
            }
         }
      }
"""
content = content.replace("if (reactionMsg && playEffect) playEffect(target.uid, \"shake\");", reactions_injection + "\n      if (reactionMsg && playEffect) playEffect(target.uid, \"shake\");")

with open('src/data.ts', 'w') as f:
    f.write(content)

print("Injected mechanics")
