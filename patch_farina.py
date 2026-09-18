import re

with open('src/data.ts', 'r') as f:
    content = f.read()

farina_blueprint = """
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
        execute: (s, t, state, log, ft, pl) => {
          let target = t[0];
          dealDamage(s, target, 0.6, 'Cryo', log, ft, pl, 1, state);
        }
      },
      {
        id: 'farina_e', name: 'Белый покров', type: 'Skill1', cost: 3, target: 'SingleEnemy',
        description: 'Наносит Cryo DMG и накладывает «Снежная пыль» на 2 хода. Доп. атаки от союзников.',
        execute: (s, t, state, log, ft, pl) => {
          let target = t[0];
          dealDamage(s, target, 1.2, 'Cryo', log, ft, pl, 1, state);
          target.buffs.snowDust = c >= 2 ? 3 : 2;
          if (ft) ft(target.uid, "СНЕЖНАЯ ПЫЛЬ", "text-cyan-300 font-bold");
        }
      },
      {
        id: 'farina_q', name: 'Безмолвие белого поля', type: 'Skill2', cost: 5, target: 'AllEnemies',
        description: 'AoE Cryo DMG всем врагам. Создаёт «Белое поле» на 2 хода.',
        execute: (s, t, state, log, ft, pl) => {
          let mult = 2.0;
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
        }
      }
    ]
  }),
"""

content = content.replace("export const characterBlueprints: Record<string, (uid: string, level: number, c: number, arts?: Artifact[]) => Combatant> = {", 
"export const characterBlueprints: Record<string, (uid: string, level: number, c: number, arts?: Artifact[]) => Combatant> = {\n" + farina_blueprint)

with open('src/data.ts', 'w') as f:
    f.write(content)

print("Added Farina blueprint")
