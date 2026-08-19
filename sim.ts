import { characterBlueprints, createBasicEnemy, dealDamage } from './src/data.js';
import type { Combatant, BattleState } from './src/types.js';

// Setup TSX to handle the .ts extension properly if running via tsx.
// Mock setTimeout
(global as any).setTimeout = (fn: any, delay: any) => {
    fn();
    return 0 as any;
};

const runSimulation = (teamIds: string[], teamName: string) => {
    let damageDealt: Record<string, number> = {};
    
    // Setup Players
    const players: Combatant[] = teamIds.map((id, idx) => {
        const p = characterBlueprints[id](`p_${idx}`, 90, 6);
        p.stats.atk = 8000;
        p.stats.maxHp = 10000;
        p.stats.hp = 10000;
        p.stats.def = 1000;
        p.stats.spd = 180;
        return p;
    });

    // Setup Enemies (a boss with lots of HP to survive long enough)
    const enemies: Combatant[] = [
        createBasicEnemy(90, 'asher', true, true)
    ];
    enemies[0].stats.maxHp = 10000000;
    enemies[0].stats.hp = 10000000;
    enemies[0].stats.def = 1000;

    let time = 0;
    
    const fakeState: BattleState = {
        playerParty: players,
        enemyParty: enemies,
        turnQueue: [],
        activeUnit: players[0],
        logs: [],
        damageDealt
    };

    while (time < 60) {
        time += 0.1;
        
        let hasActive = false;
        let pAction = null;
        
        for (const p of players) {
            if (p.stats.hp <= 0) continue;
            if (p.atb >= 100 && !hasActive) {
                hasActive = true;
                pAction = p;
            } else if (p.atb < 100) {
                p.atb = Math.min(100, p.atb + p.stats.spd * 0.05);
            }
        }
        
        if (pAction) {
            const p = pAction;
            const usableSkills = p.skills.filter(s => !p.cooldowns[s.id] || p.cooldowns[s.id] <= 0);
            const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)] || p.skills[0];
            
            let targets: Combatant[] = [];
            if (skill.target === "AllEnemies") targets = enemies;
            else if (skill.target === "SingleEnemy") targets = [enemies[0]];
            else if (skill.target === "SingleAlly") targets = [p]; // lazy targeting
            else if (skill.target === "AllAllies") targets = players;
            else if (skill.target === "Self") targets = [p];
            
            if (targets.length > 0) {
                fakeState.activeUnit = p;
                skill.execute(p, targets, fakeState, () => {}, undefined, undefined);
                
                if (skill.cost > 0) p.cooldowns[skill.id] = skill.cost;
                Object.keys(p.cooldowns).forEach(k => {
                   if (k !== skill.id && p.cooldowns[k] > 0) p.cooldowns[k]--;
                });
                
                p.atb = 0;
            }
        }
        
        // simple enemy logic to keep state clean (doesn't attack to avoid killing players in this DPS test)
        for (const e of enemies) {
            if (e.stats.hp <= 0) continue;
            
            // process dots
            if (e.buffs.burn && e.buffs.burn > 0) {
               dealDamage(players[0], e, e.buffs.burn * 0.15, "Pyro", () => {}, undefined, undefined, 1, fakeState, 0.5);
               e.buffs.burn--;
            }
            if (e.buffs.bleed && e.buffs.bleed > 0) {
               dealDamage(players[0], e, e.buffs.bleed * 0.2, "Physical", () => {}, undefined, undefined, 1, fakeState, 0.5);
               e.buffs.bleed--;
            }
            if (e.buffs.poison && e.buffs.poison > 0) {
               dealDamage(players[0], e, e.buffs.poison * 0.1, "Dendro", () => {}, undefined, undefined, 1, fakeState, 0.5);
               e.buffs.poison--;
            }
            
            if (e.atb >= 100) {
               e.atb = 0;
            } else {
               e.atb += e.stats.spd * 0.05;
            }
        }
    }
    
    let totalDmg = 0;
    Object.values(damageDealt).forEach(d => totalDmg += d);
    const dps = Math.floor(totalDmg / 60);
    console.log(`${teamName} (${teamIds.join(', ')}) -> DPS: ${dps}`);
    return dps;
};

runSimulation(['ineffa', 'zephyr', 'aurum', 'rix'], 'Идеальное Отражение');
runSimulation(['maestro', 'zephyr', 'raven', 'pulse'], 'Симфония Грома');
runSimulation(['ineffa', 'neuron', 'selva', 'moyan'], 'Разбитое Зеркало');
runSimulation(['selina', 'asher', 'moyan', 'neuron'], 'Пламя Погибели');
runSimulation(['selva', 'neuron', 'echo', 'moyan'], 'Электро-Резонанс');
