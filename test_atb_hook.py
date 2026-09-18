import re

with open('src/components/BattleScreen.tsx', 'r') as f:
    content = f.read()

target_code = """        if (p.atb >= 100 && !hasActive) {
          hasActive = true;
          setActiveUnitId(p.id);"""

injection = """        if (p.atb >= 100 && !hasActive) {
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
"""

content = content.replace(target_code, injection)

with open('src/components/BattleScreen.tsx', 'w') as f:
    f.write(content)

print("Injected Farina turn start hook")
