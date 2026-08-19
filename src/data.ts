import { Combatant, Skill, Element, Artifact, ArtifactSlot, StatType, BattleState, Rarity, ArtifactSet, Dungeon, ArtifactSubStat } from "./types";
import { playCritSound } from "./lib/sound";
import { SPLASH_IMAGES } from "./lib/images";

export const dealDamage = (source: Combatant, target: Combatant, multiplier: number, element: Element, log: (msg: string) => void, floatText?: (targetUid: string, text: string, color: string) => void, playEffect?: (targetUid: string, effectType: string) => void, hits: number = 1, state?: BattleState, defIgnore: number = 0, ignoreShields: boolean = false, guaranteedCrit: boolean = false) => {
  const hitDelay = 200;

  for (let i = 0; i < hits; i++) {
    setTimeout(() => {
      if (target.stats.hp <= 0 && i > 0) return; 
      
      const critChance = 0.25 + (source.buffs.critChance || 0) / 100;
      
      // Maestro (Isolation Mark) & Asher Passive Logic 
      let bonusCritDamage = source.buffs.critDamage || 0;
      if (target.aura === "Pyro" && state && state.playerParty.some(p => p.id === 'asher')) {
        bonusCritDamage += 50;
      }
      
      let actualDefIgnore = defIgnore;
      let actualDmgBoost = 1 + (source.buffs.dmgBoost || 0) / 100;

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
      const critMult = isCrit ? (1.5 + (bonusCritDamage / 100)) : 1.0;
      
      if (isCrit) {
        playCritSound();
      }

      const effectiveDef = target.stats.def * (1 - actualDefIgnore);
      let baseDmg = Math.max(1, Math.floor(((source.stats.atk * multiplier * critMult) / hits)) - (effectiveDef * 0.5));
      
      // Apply Damage Boosts
      baseDmg *= actualDmgBoost;

      let rxnMult = 1;
      let reactionMsg = "";

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

      if (reactionMsg && playEffect) playEffect(target.uid, "shake");

      let dmg = Math.floor(baseDmg * rxnMult * (0.9 + Math.random() * 0.2));

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

      target.stats.hp -= dmg;
      if (target.stats.hp < 0) target.stats.hp = 0;

      // Track Damage
      if (state && state.damageDealt) {
        state.damageDealt[source.uid] = (state.damageDealt[source.uid] || 0) + dmg;
      }

      if (floatText) {
        let tColor = element === 'Physical' ? 'text-white' : element === 'Hydro' ? 'text-blue-400' : element === 'Pyro' ? 'text-red-500' : element === 'Dendro' ? 'text-green-400' : element === 'Electro' ? 'text-purple-400' : element === 'Cryo' ? 'text-cyan-300' : 'text-yellow-400';
        if (isCrit) {
          tColor = 'text-amber-300 text-lg sm:text-xl font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.95)] z-20';
          if(playEffect) playEffect(target.uid, "shake");
        } else if (rxnMult > 1) {
          tColor = 'text-orange-400 text-xl font-black drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] z-10'; // Reaction color
        }
        
        const textLabel = isCrit ? `💥КРИТ! -${dmg}` : `-${dmg}`;
        floatText(target.uid, textLabel, tColor);
        if (reactionMsg) {
           setTimeout(() => floatText(target.uid, reactionMsg, tColor), 300);
        }
      }

      if (playEffect) {
        playEffect(target.uid, element);
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
  }
};

export const CHARACTER_PREFERENCES: Record<string, { main: string[], sub: string[] }> = {
  zephyr: { main: ["atk", "spd", "critRate", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"] },
  aurum: { main: ["def", "hp"], sub: ["def", "hp", "spd"] },
  rix: { main: ["hp", "spd", "atk"], sub: ["hp", "spd", "atk"] },
  ineffa: { main: ["atk", "critDamage", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"] },
  volosatinya: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"] },
  gotka: { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"] },
  kopro: { main: ["atk", "spd"], sub: ["atk", "spd", "critRate", "critDamage"] },
  selva: { main: ["atk", "spd", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"] },
  moyan: { main: ["hp", "def"], sub: ["hp", "def", "atk"] },
  aelita: { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"] },
  asher: { main: ["hp", "spd"], sub: ["hp", "spd", "def"] },
  selina: { main: ["atk", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"] },
  neuron: { main: ["atk", "spd", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"] },
  krona: { main: ["spd", "atk"], sub: ["spd", "atk", "critRate", "critDamage"] },
  cyrus: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"] },
  raven: { main: ["atk", "spd", "critDamage"], sub: ["atk", "spd", "critRate", "critDamage"] },
  echo: { main: ["spd", "atk"], sub: ["spd", "atk", "critRate", "critDamage"] },
  patch: { main: ["hp"], sub: ["hp", "spd"] },
  claymore: { main: ["atk"], sub: ["atk", "def"] },
  viper: { main: ["atk"], sub: ["atk", "spd"] },
  spark: { main: ["spd", "atk"], sub: ["spd", "atk"] },
  aegis: { main: ["def", "hp"], sub: ["def", "hp"] },
  blaze: { main: ["atk", "critRate"], sub: ["atk", "spd", "critRate", "critDamage"] },
  tide: { main: ["atk"], sub: ["atk", "spd"] },
  nova: { main: ["hp", "atk"], sub: ["hp", "atk"] },
  glacier: { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"] },
  pulse: { main: ["spd", "atk"], sub: ["spd", "atk"] },
  gaia: { main: ["hp"], sub: ["hp", "spd"] },
  fenris: { main: ["atk"], sub: ["atk", "spd", "critRate", "critDamage"] },
};

export const scoreArtifact = (art: Artifact, charId: string): number => {
  const prefs = CHARACTER_PREFERENCES[charId] || { main: ["atk"], sub: ["atk"] };
  let score = art.rarity * 1000 + art.level * 50;

  // Main stat weight
  if (prefs.main.includes(art.mainStat.type)) {
    score += 500;
  }

  // Sub stats weight
  art.subStats?.forEach(s => {
    if (prefs.sub.includes(s.type)) {
      score += s.value;
    }
  });

  return score;
};

export const ARTIFACT_DUNGEONS: Dungeon[] = [
  {
    id: "domain_illusions",
    name: "Врата Иллюзий",
    description: "Пространство обмана и зеркальных копий. Здесь добываются сеты Грозовое Зеркало и Кристаллический Резонанс.",
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
    description: "Зеркальное святилище, искажающее свет. Здесь добываются сеты Осколки Последнего Рассвета и Эхо Одиночества.",
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
    description: "Дворец, объятый пламенем. Здесь добываются сеты Алой Розы и Гладиатора.",
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
    description: "Замерзшая башня, где время течет иначе. Сеты Замёрзшего Времени и Знати.",
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
    description: "Древний горн, где рождаются легенды. Здесь добываются сеты Пепла Запретного Горна и Инстинкта Волка.",
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
    description: "Заброшенный кибер-сектор, освещённый неоном. Обитель протоколов безопасности. Здесь добываются сеты Протокол Изоляции и Церемония Древней Знати.",
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
    description: "Старый амфитеатр, где проливалась кровь лучших бойцов. Сеты Гордость Дуэлянта и Конец Гладиатора.",
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
    description: "Старый театр, где эхо прошлых выступлений сводит с ума. Добываются сеты Протокол Изоляции и Эхо Одиночества.",
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
  }
];

export const generateArtifact = (setName: string, rarity: number = 5): Artifact => {
  const slots: ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const stats: StatType[] = ["hp", "atk", "def", "spd"];
  
  const mainStatType = slot === "flower" ? "hp" : slot === "plume" ? "atk" : stats[Math.floor(Math.random() * stats.length)];
  let mainVal = rarity * 50 + (slot === "flower" ? 100 : 20);
  if (mainStatType === "spd") mainVal = Math.floor(mainVal * 0.12); // Reduced from 0.2 to 0.12

  const subStats: ArtifactSubStat[] = [];
  const numSubs = Math.floor(Math.random() * 3) + 2;
  for(let i=0; i<numSubs; i++) {
    const type = stats[Math.floor(Math.random() * stats.length)];
    let value = Math.floor(Math.random() * 30 * rarity) + 5;
    if (type === "spd") value = Math.floor(Math.random() * 1.5 * rarity) + 1; // Reduced from 3 to 1.5
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
        } else if (setName === 'crystal_resonance') {
           combatant.buffs.defBoost = (combatant.buffs.defBoost || 0) + 20;
           combatant.stats.def = Math.floor(combatant.stats.def * 1.20);
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

  // Stats from artifacts
  artifacts.forEach(art => {
    // Main stat
    const subStats = art.subStats || [];
    const stats = [art.mainStat, ...subStats];
    stats.forEach(s => {
      if (!s || !s.type) return;
      if (s.type === 'hp') hp += s.value || 0;
      if (s.type === 'atk') atk += s.value || 0;
      if (s.type === 'def') def += s.value || 0;
      if (s.type === 'spd') spd += s.value || 0;
    });
  });

  const finalSpd = Math.min(180, spd); // Hard cap speed to prevent infinite turns
  return { hp, maxHp: hp, atk, def, spd: finalSpd };
};

export const charRarity: Record<string, Rarity> = {
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
  gaia: "B",
  fenris: "S"
};

export const getCharEmoji = (id: string): string => {
  switch (id) {
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

export const characterConstellations: Record<string, ConstellationInfo[]> = {
  ineffa: [
    { level: 1, name: "Осколки памяти", description: "При реакции Отражение с шансом 50% создается дополнительный фрагмент. Максимум осколков: 6." },
    { level: 2, name: "Бесконечное отражение", description: "Взрыв стихий не поглощает фрагменты зеркала." },
    { level: 4, name: "Искажение света", description: "Урон от Отражения увеличивается на 25%." },
    { level: 6, name: "Истинное зеркало", description: "Игнорирует 30% защиты врага при атаках." }
  ],
  nova: [
    { level: 1, name: "Инициация Потока", description: "Обычная атака восстанавливает 8% от макс. HP." },
    { level: 2, name: "Кровавый Кулак", description: "Боевой Азарт также повышает Скорость на 30%." },
    { level: 4, name: "Разрыв Реальности", description: "Шанс критического удара увеличен на 15%." },
    { level: 6, name: "Сверхновая", description: "Удар сверхновой игнорирует 50% защиты цели." }
  ],
  selva: [
    { level: 1, name: "Искристый Азарт", description: "Стаки Радости теперь также увеличивают Скорость на 5%." },
    { level: 2, name: "Перегрузка Мощности", description: "Максимальное количество стаков Радости увеличено до 8." },
    { level: 4, name: "Проводник Цепи", description: "Электро-реакции наносят на 25% больше урона." },
    { level: 6, name: "Королева Шторма", description: "Ультимейт восстанавливает 2 заряда ATB за каждого побежденного врага." }
  ],
  aelita: [
    { level: 1, name: "Корни Судьбы", description: "Шипы снижают Скорость врага на 10% (стакается)." },
    { level: 2, name: "Дыхание Леса", description: "Смена персонажа на Аэлиту гарантирует крит. удар на следующую атаку." },
    { level: 4, name: "Облегчение Грозы", description: "Навык E теперь лечит Аэлиту за каждый снятый стак Шипов." },
    { level: 6, name: "Эдемский Сад", description: "Ультимейт накладывает на союзников щит, равный 20% от защиты Аэлиты." }
  ],
  asher: [
    { level: 1, name: "Дыхание Горна", description: "Тлеющая связь также восстанавливает 10 ATB союзнику при атаке." },
    { level: 2, name: "Закаленное Сердце", description: "Щиты Ашера на 30% прочнее." },
    { level: 4, name: "Тлеющий Остаток", description: "При смерти врага со статусом Горение, весь отряд получает щит." },
    { level: 6, name: "Мастер Тлеющего Горна", description: "Ультимейт полностью восстанавливает ATB Селине (если она в отряде)." }
  ],
  moyan: [
    { level: 1, name: "Стойкость Камня", description: "Бафф защиты действует на 2 хода дольше." },
    { level: 2, name: "Эхо Прошлого", description: "При использовании навыков есть 50% шанс восстановить 15 ATB." },
    { level: 4, name: "Золотой Оплот", description: "Щиты союзников на 30% прочнее." },
    { level: 6, name: "Зов Предков", description: "Ультимейт восстанавливает 40 ATB Мо Яню." }
  ],
  neuron: [
    { level: 1, name: "Нейронный Импульс", description: "Навык E дает 10 ATB всем союзникам." },
    { level: 2, name: "Анализ Уязвимости", description: "Ультимейт снижает Защиту всех врагов на 20%." },
    { level: 4, name: "Быстрый Обмен", description: "Ускоряет перезарядку навыков на 1 ход." },
    { level: 6, name: "Квантовый Скачок", description: "Ультимейт восстанавливает 20 ATB всему отряду." }
  ],
  selina: [
    { level: 1, name: "Пылающие Узы", description: "Атаки Селины накладывают Горение на 2 хода." },
    { level: 2, name: "Розовый Шип", description: "Критический урон увеличен на 30%." },
    { level: 4, name: "Танец Огня", description: "При низком HP Селина получает 50% бонус к Атаке." },
    { level: 6, name: "Вечный Феникс", description: "Один раз за бой Селина возрождается при получении смертельного урона." }
  ],
  krona: [
    { level: 1, name: "Ледяной Плен", description: "Заморозка длится на 1 ход дольше." },
    { level: 2, name: "Кристальный Блеск", description: "Увеличивает Шанс Крита по замороженным целям на 20%." },
    { level: 4, name: "Зимнее Солнцестояние", description: "Ультимейт снижает Скорость врагов на дополнительные 15%." },
    { level: 6, name: "Абсолютный Ноль", description: "Ледяные атаки игнорируют 100% Защиты замороженных врагов." }
  ],
  cyrus: [
    { level: 1, name: "Прицельный взгляд", description: "Навешивание метки восстанавливает Сайрусу 40 ATB вместо 30." },
    { level: 2, name: "Точный расчет", description: "Дополнительное пробитие брони по цели с меткой +20%." },
    { level: 4, name: "Предвкушение охоты", description: "Критический урон базовой атаки по отмеченной цели увеличен на 40%." },
    { level: 6, name: "Идеальная казнь", description: "Лимит ХП для гарантированного убийства ультимейтом увеличен до 50%." }
  ],
  volosatinya: [
    { level: 1, name: "Водный щит", description: "С вероятностью 25% блокирует урон при первом попадании за ход." },
    { level: 6, name: "Царство Посейдона", description: "Урон способностей увеличивается на 40% против горящих целей." }
  ],
  gotka: [
    { level: 1, name: "Молчание — золото", description: "Шанс наложить немоту на 1 ход увеличен до 50%." },
    { level: 6, name: "Пустота", description: "Атаки игнорируют 30% защиты цели." }
  ],
  kopro: [
    { level: 1, name: "Жесткая диета", description: "Потребление ATB для навыков снижено на 10%." },
    { level: 6, name: "Метаболизм", description: "Лечение от способностей увеличивается на 50%." }
  ],
  echo: [
    { level: 1, name: "Резонанс", description: "Каждая атака восстанавливает 5 ATB всем союзникам." },
    { level: 6, name: "Гармония", description: "Скорость всего отряда увеличивается на 20." }
  ],
  kamikaze: [
    { level: 1, name: "Последний рывок", description: "Перед смертью наносит 500% урона самому сильному врагу." },
    { level: 6, name: "Безумие", description: "Атака увеличивается на 100% за каждые потерянные 10% HP." }
  ],
  patch: [
    { level: 1, name: "Первая помощь", description: "Начальное лечение увеличено на 30%." },
    { level: 6, name: "Реанимация", description: "Один раз за бой воскрешает павшего союзника с 50% HP." }
  ],
  viper: [
    { level: 1, name: "Токсичный след", description: "Урон яда увеличивается на 20%." },
    { level: 6, name: "Смертельная доза", description: "Критические удары мгновенно активируют урон яда." }
  ],
  spark: [
    { level: 1, name: "Короткое замыкание", description: "Электро-атаки имеют 15% шанс оглушить врага." },
    { level: 6, name: "Суперконденсатор", description: "Ультимативный навык перезаряжается мгновенно при убийстве цели." }
  ],
  aegis: [
    { level: 1, name: "Бастион", description: "Прочность всех накладываемых щитов повышена на 20%." },
    { level: 6, name: "Непоколебимость", description: "Пока активен щит, персонаж получает на 50% меньше урона." }
  ],
  blaze: [
    { level: 1, name: "Разогрев", description: "Каждая атака повышает Шанс Крита на 5% до конца боя (стакается)." },
    { level: 6, name: "Взрыв сверхновой", description: "Крит. урон увеличивается на 100%, если у врага меньше 50% HP." }
  ],
  tide: [
    { level: 1, name: "Прилив", description: "Лечение теперь восстанавливает 10 ATB цели." },
    { level: 6, name: "Океанское благословение", description: "Повышает Сопротивление ко всем элементам у всего отряда на 30%." }
  ],
  glacier: [
    { level: 1, name: "Вечная мерзлота", description: "Замороженные враги теряют 20 ATB каждый ход." },
    { level: 6, name: "Айсберг", description: "Атаки по замороженным целям наносят 50% бонусного урона." }
  ],
  pulse: [
    { level: 1, name: "Синхронизация", description: "Повышает Скорость всех союзников на 15% на 2 хода в начале боя." },
    { level: 6, name: "Перегрузка", description: "Увеличивает урон всех союзников на 30%, пока у Пульса больше 80% HP." }
  ],
  gaia: [
    { level: 1, name: "Плодородие", description: "Дендро-реакции восстанавливают 5% HP всему отряду." },
    { level: 6, name: "Гнев природы", description: "Вызывает корни, наносящие 200% урона в конце хода за каждое Дендро ядро." }
  ],
  claymore: [
    { level: 1, name: "Усиленный заряд", description: "Ловушки наносят на 50% больше урона." },
    { level: 6, name: "Детонация", description: "Ультимейт мгновенно взрывает все существующие ловушки." }
  ],
  fenris: [
    { level: 1, name: "Чуткий слух", description: "Урон зверя увеличивается на 20%." },
    { level: 2, name: "Вожак стаи", description: "После атаки охотника, зверь восстанавливает 10 ATB охотнику." },
    { level: 4, name: "Охрана волка", description: "Защитный режим зверя дает на 50% больше прочности щита." },
    { level: 6, name: "Альфа-удар", description: "Второй ход дуэта наносит на 40% больше урона." }
  ]
};

export const getCharSplash = (id: string): string | null => {
  return SPLASH_IMAGES[id] || null;
};

export const characterBlueprints: Record<string, (uid: string, level: number, c: number, arts?: Artifact[]) => Combatant> = {
  ineffa: (uid, l, c, arts = []) => ({
    id: "ineffa", uid, isEnemy: false, name: "Инеффа", element: "Pyro", color: "bg-red-800", level: l, constellation: c,
    image: getCharSplash('ineffa') || undefined,
    stats: scaleStats(1245, 230, 72, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "ineffa_atk", name: "Осколки памяти", type: "Attack", cost: 0, target: "SingleEnemy",
        description: "Физ. урон или Пиро урон (если в Отраженной форме). Атаки Пиро по Электро целям вызывают Отражение, дающее Фрагмент зеркала.",
        execute: (s, t, state, log, ft, pl) => {
          const isPyro = s.buffs.reflectedForm && s.buffs.reflectedForm > 0;
          let element: Element = isPyro ? "Pyro" : "Physical";
          let mult = 0.9;
          if (c >= 5) mult += 0.2;
          const target = t[0];
          
          const fragments = s.buffs.mirrorFragment || 0;
          if (isPyro) mult += fragments * 0.15; // Passive boost
          
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
             
             // reset critDamageBoost after hit so it only affects this attack? Wait, the set says "Каждый уровень увеличивает... Крит. урон". So it should last as long as the buff lasts (10s), but we don't track time well. Leaving it as a permanent combat buff is fine for this game's mechanics.
          }
        }
      },
      {
        id: "ineffa_e", name: "Зеркало Рассветного Утра", type: "Skill1", cost: 3, target: "SingleEnemy",
        description: "Наносит Пиро урон и дает Отраженную форму, меняя атаки на Пиро. Фрагменты усиливают урон.",
        execute: (s, t, state, log, ft, pl) => {
          s.buffs.reflectedForm = 4;
          s.buffs.spd = (s.buffs.spd || 0) + 15; // Passive 1 representation
          if (ft) ft(s.uid, "ОТРАЖЕННАЯ ФОРМА", "text-red-400 font-bold");
          let mult = 1.5;
          let fragmentBonus = (s.buffs.mirrorFragment || 0) * 0.25;
          mult += fragmentBonus;
          dealDamage(s, t[0], mult, "Pyro", log, ft, pl, 2, state, c >= 6 ? 0.3 : 0);
        }
      },
      {
        id: "ineffa_q", name: "Гибридная Энергия", type: "Skill2", cost: 6, target: "SingleEnemy",
        description: "Использует фрагменты для огромного Пиро урона. Чем больше фрагментов, тем больше урон.",
        execute: (s, t, state, log, ft, pl) => {
          let fragments = s.buffs.mirrorFragment || 0;
          let mult = 3.5 + fragments * 0.9;
          if (c >= 3) mult += 0.5;
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
  zephyr: (uid, l, c, arts = []) => ({
    id: "zephyr", uid, isEnemy: false, name: "Зефир", element: "Electro", color: "bg-purple-600", level: l, constellation: c,
    image: getCharSplash('zephyr') || undefined,
    stats: scaleStats(1100, 220, 65, 52, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      {
        id: "ze_atk", name: "Иллюзорный выпад", type: "Attack", cost: 0, target: "SingleEnemy",
        description: "Электро урон. Зефир превращает Перегрузку в Отражение.",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.0, "Electro", log, ft, pl, 2, state, c >= 6 ? 0.2 : 0);
        }
      },
      {
        id: "ze_e", name: "Грозовая призма", type: "Skill1", cost: 3, target: "AllEnemies",
        description: "Электро урон по всем врагам, накладывает статус Электро. Повышает урон Отражения отряда на 15%.",
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
        description: "Колоссальный Электро урон. При активации Отражения или Перегрузки снижает защиту врагов.",
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
        description: "Гео урон. Аурум превращает Перегрузку в Отражение.",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 0.9, "Geo", log, ft, pl, 1, state);
        }
      },
      {
        id: "au_e", name: "Золотая эгида", type: "Skill1", cost: 3, target: "AllAllies",
        description: "Накладывает щит на всех союзников, зависящий от Защиты Аурума. Усиливает Крит. урон отряда на 15%.",
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
        description: "Огромный Гео урон, зависящий от Защиты. Дает отряду бафф Силы Атаки.",
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
        description: "Электро урон. Слегка восстанавливает HP союзнику с наименьшим здоровьем.",
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
        description: "Лечит выбранного союзника и ускоряет его действия (дает ATB).",
        execute: (s, t, state, log, ft, pl) => {
          const heal = s.stats.maxHp * 0.2;
          t[0].stats.hp = Math.min(t[0].stats.maxHp, t[0].stats.hp + heal);
          t[0].atb = Math.min(100, t[0].atb + 30);
          if (ft) ft(t[0].uid, `+${Math.floor(heal)} HP`, 'text-green-400 font-bold');
        }
      },
      {
        id: "rx_q", name: "Перезагрузка", type: "Skill2", cost: 5, target: "AllAllies",
        description: "Лечит отряд и повышает Скорость. Электро-реакции наносят больше урона.",
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
        description: "Одиночный укол. Наносит выбранному противнику небольшой урон.",
        execute: (s, t, state, log, ft, pl) => {
          dealDamage(s, t[0], 1.0, "Electro", log, ft, pl, 1, state);
          if (pl) pl(s.uid, "attack");
        }
      },
      {
        id: "maes_e",
        name: "Фокус Внимания",
        type: "Skill1",
        cost: 3,
        target: "SingleEnemy",
        description: "Накладывает [Метку Изоляции] на 2 хода. Противник получает на 40% больше урона от одиночных атак.",
        execute: (s, t, state, log, ft, pl) => {
          t[0].buffs.isolationMark = 2;
          if (ft) ft(t[0].uid, "🎯 Метка Изоляции", "text-purple-400 font-bold");
          dealDamage(s, t[0], 1.2, "Electro", log, ft, pl, 1, state);
          if (pl) pl(s.uid, "buff");
        }
      },
      {
        id: "maes_q",
        name: "Финальный Аккорд",
        type: "Skill2",
        cost: 6,
        target: "AllAllies",
        description: "Продвигает АТВ союзников на 20%. Если есть враж. дебаффы - союзник с макс. ATK получает мгновенный ход.",
        execute: (s, t, state, log, ft, pl) => {
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
          if (pl) pl(s.uid, "ultimate_cast");
        }
      }
    ]
  }),
  volosatinya: (uid, l, c, arts = []) => ({
    id: "volosatinya", uid, isEnemy: false, name: "Волосатиня", element: "Hydro", color: "bg-blue-500", level: l, constellation: c,
    image: getCharSplash('volosatinya') || undefined,
    stats: scaleStats(1200, 180, 80, 40, l, c, arts), atb: 0, cooldowns: {}, buffs: { lastHitBlocked: false },
    skills: [
      { id: "v_atk", name: "Обычная атака", type: "Attack", cost: 0, target: "SingleEnemy", description: "Удар мечами (Гидро урон).", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Hydro", log, ft, pl, 2, state); } },
      { id: "v_e", name: "Волосатый разрез", type: "Skill1", cost: 3, target: "SingleEnemy", description: "Гидро урон, замедляет врага.", execute: (s, t, state, log, ft, pl) => { let mult = 1.5; if (c >= 6 && t[0].aura === "Pyro") mult *= 1.4; dealDamage(s, t[0], mult, "Hydro", log, ft, pl, 3, state); t[0].buffs.spd = (t[0].buffs.spd || 0) - 10; if(ft) ft(t[0].uid, '↓Скорость', 'text-blue-300'); } },
      { id: "v_q", name: "Поляна лобковых волос", type: "Skill2", cost: 5, target: "AllEnemies", description: "AoE Гидро урон, усиливает атаку отряда.", execute: (s, t, state, log, ft, pl) => { t.forEach(enemy => { if(enemy.stats.hp > 0) { let mult = 2.0; if (c >= 6 && enemy.aura === "Pyro") mult *= 1.4; dealDamage(s, enemy, mult, "Hydro", log, ft, pl, 4, state); } }); state.playerParty.forEach(p => { p.buffs.atk = (p.buffs.atk || 0) + 30; if(ft) ft(p.uid, '+АТК', 'text-red-400'); if(pl) pl(p.uid, 'buff'); }); } }
    ]
  }),
  gotka: (uid, l, c, arts = []) => ({
    id: "gotka", uid, isEnemy: false, name: "Готка", element: "Pyro", color: "bg-red-600", level: l, constellation: c,
    image: getCharSplash('gotka') || undefined,
    stats: scaleStats(900, 250, 60, 35, l, c, arts), atb: 0, cooldowns: {}, buffs: { puppets: 0 },
    skills: [
      { id: "g_atk", name: "Выстрел", type: "Attack", cost: 0, target: "SingleEnemy", description: "Урон выше с марионетками.", execute: (s, t, state, log, ft, pl) => { const p = s.buffs.puppets || 0; dealDamage(s, t[0], 1.0 + (p * 0.5), "Pyro", log, ft, pl, 1, state, c >= 6 ? 0.3 : 0); } },
      { id: "g_e", name: "Театр искаженных теней", type: "Skill1", cost: 2, target: "Self", description: "Призывает марионеток.", execute: (s, t, state, log, ft, pl) => { s.buffs.puppets = Math.min((s.buffs.puppets || 0) + (c >= 1 ? 3 : 2), 4); if (c >= 1 && Math.random() < 0.5) state.enemyParty.forEach(e => { if (e.stats.hp > 0) e.buffs.mute = 1; }); if(ft) ft(s.uid, `+${s.buffs.puppets} Кукол`, 'text-purple-300'); if(pl) pl(s.uid, 'buff'); } },
      { id: "g_q", name: "Разрыв нитей", type: "Skill2", cost: 5, target: "AllEnemies", description: "Взрывает марионеток для огромного AoE урона.", execute: (s, t, state, log, ft, pl) => { const p = s.buffs.puppets || 0; t.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.5 + (p * 1.5), "Pyro", log, ft, pl, p > 0 ? p + 1 : 1, state, c >= 6 ? 0.3 : 0); }); s.buffs.puppets = 0; } }
    ]
  }),
  kopro: (uid, l, c, arts = []) => ({
    id: "kopro", uid, isEnemy: false, name: "Копро", element: "Dendro", color: "bg-green-600", level: l, constellation: c,
    image: getCharSplash('kopro') || undefined,
    stats: scaleStats(1100, 210, 75, 38, l, c, arts), atb: 0, cooldowns: {}, buffs: { frenzyStacks: 0 },
    skills: [
      { id: "k_atk", name: "Атака копьем", type: "Attack", cost: 0, target: "SingleEnemy", description: "Удары Дендро копьем.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.2, "Dendro", log, ft, pl, 3, state); if (c >= 6) { const heal = s.stats.atk * 0.2; s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + heal); if(ft) ft(s.uid, `+${Math.floor(heal)}`, 'text-green-400'); } } },
      { id: "k_e", name: "Приступ истерики", type: "Skill1", cost: c >= 1 ? 1 : 3, target: "Self", description: "Входит в Безумие, повышая скорость и силу.", execute: (s, t, state, log, ft, pl) => { s.buffs.frenzyStacks = Math.min((s.buffs.frenzyStacks || 0) + 2, 5); s.buffs.spd = (s.buffs.spd || 0) + 15; s.buffs.atk = (s.buffs.atk || 0) + 40; if(ft) ft(s.uid, 'БЕЗУМИЕ!', 'text-green-500'); if(pl) pl(s.uid, 'buff'); } },
      { id: "k_q", name: "Время дендродов!", type: "Skill2", cost: c >= 1 ? 4 : 6, target: "AllEnemies", description: "Дендро-взрыв, тратит Безумие.", execute: (s, t, state, log, ft, pl) => { const stacks = s.buffs.frenzyStacks || 0; t.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.0 + (stacks * 0.8), "Dendro", log, ft, pl, 5, state); }); s.buffs.frenzyStacks = 0; } }
    ]
  }),
  selva: (uid, l, c, arts = []) => ({
    id: "selva", uid, isEnemy: false, name: "Сельва", element: "Electro", color: "bg-purple-600", level: l, constellation: c,
    image: getCharSplash('selva') || undefined,
    stats: scaleStats(1000, 220, 70, 45, l, c, arts), atb: 0, cooldowns: {}, buffs: { joyStacks: 0 },
    skills: [
      { id: "s_atk", name: "Панч!", type: "Attack", cost: 0, target: "SingleEnemy", description: "Электро удар из-под земли.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.1, "Electro", log, ft, pl, 1, state); } },
      { id: "s_e", name: "Любитель пострелять", type: "Skill1", cost: 2, target: "AllEnemies", description: "AoE Электро урон, дает Срытый рейтинг.", execute: (s, t, state, log, ft, pl) => { t.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 1.2, "Electro", log, ft, pl, 4, state); }); s.buffs.joyStacks = Math.min((s.buffs.joyStacks || 0) + 1, c >= 2 ? 15 : 10); if (c >= 1) s.buffs.spd = (s.buffs.spd || 0) + 5; if(ft) ft(s.uid, '+Рейтинг', 'text-yellow-300'); if(pl) pl(s.uid, 'buff'); } },
      { id: "s_q", name: "Режим Бога!", type: "Skill2", cost: 6, target: "AllEnemies", description: "Тратит Радость на мега-атаки.", execute: (s, t, state, log, ft, pl) => { const joy = s.buffs.joyStacks || 0; if(joy === 0) { if(ft) ft(s.uid, 'Нет рейтинга', 'text-gray-400'); return; } t.forEach(enemy => { if(enemy.stats.hp > 0) { dealDamage(s, enemy, 2.0 + (joy * 0.5), "Electro", log, ft, pl, 6, state); if (c >= 6) { s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + (s.stats.maxHp * 0.02)); } } }); s.buffs.joyStacks = 0; } }
    ]
  }),
  moyan: (uid, l, c, arts = []) => ({
    id: "moyan", uid, isEnemy: false, name: "Мо Янь", element: "Geo", color: "bg-yellow-600", level: l, constellation: c,
    image: getCharSplash('moyan') || undefined,
    stats: scaleStats(1500, 120, 150, 30, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "m_atk", name: "Взмах чернилами", type: "Attack", cost: 0, target: "SingleEnemy", description: "Гео урон чернилами.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 0.8, "Geo", log, ft, pl, 2, state); if (c >= 2 && Math.random() < 0.5) { s.atb += 15; if(ft) ft(s.uid, 'C2: ATB UP', 'text-yellow-400'); } } },
      { id: "m_e", name: "Запись Контракта", type: "Skill1", cost: 4, target: "AllAllies", description: "Щит на всех союзников.", execute: (s, t, state, log, ft, pl) => { t.forEach(ally => { const shieldMult = c >= 4 ? 1.3 : 1.0; ally.buffs.shield = (ally.buffs.shield || 0) + 400 * (1 + l * 0.05) * shieldMult; if(ft) ft(ally.uid, '+Щит', 'text-yellow-500'); if(pl) pl(ally.uid, 'shield'); }); } },
      { id: "m_q", name: "Оживление рукописи", type: "Skill2", cost: 6, target: "AllAllies", description: "Лечит отряд и наносит AoE Гео урон врагам.", execute: (s, t, state, log, ft, pl) => { t.forEach(ally => { if(ally.stats.hp > 0) { const heal = 500 * (1 + l * 0.05); ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + heal); if(ft) ft(ally.uid, `+${Math.floor(heal)}`, 'text-green-500'); } }); if (c >= 6) { s.atb += 40; if(ft) ft(s.uid, 'C6: RECOVER', 'text-yellow-400'); } state.enemyParty.forEach(enemy => { if(enemy.stats.hp > 0) dealDamage(s, enemy, 2.5, "Geo", log, ft, pl, 3, state); }); if(pl) state.playerParty.forEach(ally => pl(ally.uid, 'heal')); } }
    ]
  }),
  aelita: (uid, l, c, arts = []) => ({
    id: "aelita", uid, isEnemy: false, name: "Аэлита", element: "Dendro", color: "bg-emerald-600", level: l, constellation: c,
    image: getCharSplash('aelita') || undefined,
    stats: scaleStats(1350, 240, 60, 42, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "a_atk", name: "Шипы Справедливости", type: "Attack", cost: 0, target: "SingleEnemy", description: "4 удара. Накладывает 1 стак [Шипы].", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 4, state); t[0].buffs.thorns = Math.min((t[0].buffs.thorns || 0) + 1, 3); if (c >= 1) t[0].buffs.spd = (t[0].buffs.spd || 0) - 5; if(ft) ft(t[0].uid, '+Шипы', 'text-emerald-400'); } },
      { id: "a_e", name: "Связь с флорой", type: "Skill1", cost: 3, target: "SingleEnemy", description: "Снимает все Шипы с врага. Огромный урон за каждый стак.", execute: (s, t, state, log, ft, pl) => { const thorns = t[0].buffs.thorns || 0; dealDamage(s, t[0], 1.2 + (thorns * 1.5), "Dendro", log, ft, pl, 1, state); t[0].buffs.thorns = 0; if (c >= 4) { s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + 150 * thorns); if(ft) ft(s.uid, 'Облегчение', 'text-green-300'); } } },
      { id: "a_q", name: "Теорема о Дикой Природе", type: "Skill2", cost: 6, target: "AllEnemies", description: "AоE урон. Баффает АТК Аэлиты, дает всем врагам Шипы.", execute: (s, t, state, log, ft, pl) => { t.forEach(enemy => { if(enemy.stats.hp > 0) { dealDamage(s, enemy, 2.0, "Dendro", log, ft, pl, 2, state); enemy.buffs.thorns = Math.min((enemy.buffs.thorns || 0) + 1, 3); } }); s.buffs.atk = (s.buffs.atk || 0) + 100 + (l * 5); if (c >= 6) { s.buffs.shield = (s.buffs.shield || 0) + s.stats.def * 2; if(ft) ft(s.uid, 'C6: SHIELD', 'text-emerald-300'); } if(ft) ft(s.uid, 'Оранжерея Знаний!', 'text-emerald-300'); if(pl) pl(s.uid, 'buff'); } }
    ]
  }),
  asher: (uid, l, c, arts = []) => ({
    id: "asher", uid, isEnemy: false, name: "Ашер", element: "Dendro", color: "bg-emerald-900", level: l, constellation: c,
    image: getCharSplash('asher') || undefined,
    stats: scaleStats(1400, 180, 120, 48, l, c, arts),
    atb: 0, buffs: { shield: 0 }, cooldowns: {},
    skills: [
      { id: "sm_atk", name: "Молот Тления", type: "Attack", cost: 0, target: "SingleEnemy", description: "Дендро урон, вешает Дендро ауру.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 1, state); } },
      { id: "sm_e", name: "Цепи Тлеющего Угля", type: "Skill1", cost: 3, target: "SingleAlly", description: "Связывает союзника. Селина получает 3 стака вместо 1. Крит. Урон по Горящим врагам +50%.", execute: (s, t, state, log, ft, pl) => { 
        t[0].buffs.smolderLink = 3; 
        if(ft) ft(t[0].uid, "🔗 ТЛЕЮЩАЯ СВЯЗЬ", "text-emerald-400 font-black");
        if(pl) pl(t[0].uid, "asher_nature");
      } },
      { id: "sm_q", name: "Сердце Печи", type: "Skill2", cost: 6, target: "AllAllies", description: "Замораживает ОЗ на 45% (для баффов). Дает щит за каждый взрыв Углей Селины.", execute: (s, t, state, log, ft, pl) => { 
        t.forEach(ally => {
          ally.buffs.hpFreeze = 45;
          if (ally.stats.hp / ally.stats.maxHp > 0.45) {
            ally.stats.hp = ally.stats.maxHp * 0.45;
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
        description: "Серия быстрых уколов огненным копьем (2 удара). Накладывает 1 стак [Угли Розы] (макс. 5).", 
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
        description: "Призывает огненный бутон, взрывающийся в гуще врагов. Наносит AoE Pyro урон. Каждый стак [Угли Розы] усиливает урон на 30%.", 
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
        description: "Танец пламенного вихря. Дает всем союзникам щит [Алая Роза] и восстанавливает им HP, а врагам наносит сокрушительный Pyro урон.", 
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
        description: "Удары током (коэфф. 0.6). Если на цели есть любой элементальный статус или дебафф, урон возрастает в 2.5 раза (коэфф. 1.5).",
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
        description: "Волна разряда. Если на враге есть статус или дебафф, наносит сокрушительный урон (коэфф. 3.5), рассеивает статус и снижает скорость врага на 15.",
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
        description: "Грандиозный запуск импульсов по всем врагам. Урон по целям со статусами увеличивается в 3 раза (коэфф. 3.3). Дает Нейрону +25% силы атаки за каждый триггер.",
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
        description: "Укол шпагой времени (коэфф. 0.9). Отбрасывает шкалу ходов (ATB) врага назад на 15%.",
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
        description: "Заморозка шкалы врага (коэфф. 1.8). Отбрасывает ATB врага на 35% и замедляет его (-20 к скорости) до конца боя.",
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
        description: "Ледяной хроно-взрыв по всем врагам (коэфф. 2.2). Продвигает шкалу ходов (ATB) союзников вперед на 30%!",
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
        description: "Физ удар. Метка дуэли: урон x2, бонус крита. Отбрасывает ATB врага.",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const marked = target.buffs.duelMark;
          const mult = marked ? 2.0 : 0.7;
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
        description: "Снимает все метки, вешает метку [Дуэль] на цель. Сразу делает выпад с 50% игнором защиты.",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          if (state) state.enemyParty.forEach(e => e.buffs.duelMark = 0);
          target.buffs.duelMark = 1;
          if (ft) ft(target.uid, "🎯 ДУЭЛЬ", "text-red-500 font-black text-xl drop-shadow-[0_0_10px_rgba(239,68,68,1)]");
          if (pl) pl(target.uid, "shake");
          
          dealDamage(s, target, 1.5, "Physical", log, ft, pl, 1, state, c >= 2 ? 0.7 : 0.5);
          s.atb = Math.min(100, s.atb + (c >= 1 ? 40 : 30));
        }
      },
      {
        id: "cy_q", name: "Казнь", type: "Skill2", cost: 6, target: "SingleEnemy",
        description: "Огромный удар (коэфф 4.5 с меткой). Если у цели в процентах ХП <30% - гарант. Крит и игнор Щитов! Если убивает, Сайрус восстанавливает 6 Энергии и 100 ATB.",
        execute: (s, t, state, log, ft, pl) => {
          const target = t[0];
          const marked = target.buffs.duelMark;
          let mult = marked ? 4.5 : 2.5; 
          const limit = c >= 6 ? 0.5 : 0.3;
          const isExecute = target.stats.hp > 0 && target.stats.hp < target.stats.maxHp * limit;
          
          if (isExecute) {
             if (ft) ft(s.uid, "☠️ КАЗНЬ!", "text-red-600 font-black drop-shadow-[0_0_10px_rgba(220,38,38,1)] text-2xl");
             if (pl) pl(target.uid, "shake");
          } else if (ft) {
             ft(s.uid, "🔪 Последний Удар", "text-rose-400 font-bold");
          }
          
          dealDamage(s, target, mult, "Physical", log, ft, pl, 1, state, marked ? (c >= 2 ? 0.7 : 0.5) : 0, isExecute, isExecute);
          
          if (target.stats.hp <= 0 && state) {
            setTimeout(() => { s.cooldowns['cy_q'] = 0; }, 10);
            s.atb = 100;
            if (ft) setTimeout(() => ft(s.uid, "♻️ ГОНОРАР", "text-yellow-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(250,204,21,1)]"), 400);
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
        description: "Удар звуковой волной (коэфф. 0.7). Если у врага есть стихийная аура, Эхо запоминает её. Если ауры нет, но у Эха есть сохраненная аура, он передает её врагу.",
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
        description: "Радиус Эха. Наносит Hydro-урон цели (коэфф. 1.0). Запоминает её ауру и распыляет её (дублирует) на ВСЕХ остальных противников на поле боя!",
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
        description: "Потоки иллюзий (коэфф. 1.3). Дублирует запомненную ауру на всех врагов без стихийных статусов, и дает +20% силы атаки всему отряду на 2 хода.",
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
        description: "Удар наотмашь (коэфф. 1.6). Камикадзе наносит огромный урон, но теряет 15% своего текущего HP.",
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
        description: "Стеклянный таран (коэфф. 3.0), наносящий колоссальный удар по одной цели. Камикадзе теряет 25% своего текущего HP.",
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
        description: "Сокрушительный суицидальный удар невероятной мощи (коэфф. 5.5). Камикадзе теряет 45% своего текущего HP.",
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
        description: "Неуклюжий удар медицинской сумкой (коэфф. 0.5). Наносит совсем немного Dendro-урона.",
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
        description: "Простое лечение. Моментально восстанавливает фиксированное количество HP выбранному союзнику (база 500).",
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
        description: "Мощная доза исцеления. Восстанавливает огромное количество здоровья цели (база 1500).",
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
        description: "Физический удар киркой (коэфф. 1.0).", 
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
        description: "Устанавливает на врага [Ловушку]. Ловушка наноситGeo-урон (коэфф. 2.0) и отменяет ход врага, когда его ATB достигает максимума.", 
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
        description: "Наносит небольшой AoE Geo-урон (коэфф. 0.8) и устанавливает [Ловушку] на всех выживших врагов.", 
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
      { id: "vi_atk", name: "Змеиный укус", type: "Attack", cost: 0, target: "SingleEnemy", description: "Дендро урон, шанс отравить.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 2, state); if(Math.random() < (c >= 1 ? 0.8 : 0.5)) t[0].buffs.poison = (t[0].buffs.poison || 0) + (c >= 1 ? 2 : 1); } },
      { id: "vi_e", name: "Токсичное облако", type: "Skill1", cost: 3, target: "AllEnemies", description: "Отравивает всех врагов.", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { e.buffs.poison = (e.buffs.poison || 0) + (c >= 1 ? 4 : 2); if(ft) ft(e.uid, 'ЯД x4', 'text-green-400'); } }); } },
      { id: "vi_q", name: "Пир яда", type: "Skill2", cost: 5, target: "SingleEnemy", description: "Огромный урон, зависящий от стаков яда.", execute: (s, t, state, log, ft, pl) => { const p = t[0].buffs.poison || 0; dealDamage(s, t[0], 1.5 + (p * 1.2), "Dendro", log, ft, pl, 5, state, c >= 6 ? 0.3 : 0); t[0].buffs.poison = 0; } }
    ]
  }),
  spark: (uid, l, c, arts = []) => ({
    id: "spark", uid, isEnemy: false, name: "Искр", element: "Electro", color: "bg-yellow-400 text-black", level: l, constellation: c,
    image: getCharSplash('spark') || undefined,
    stats: scaleStats(950, 180, 55, 55, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "sp_atk", name: "Разряд", type: "Attack", cost: 0, target: "SingleEnemy", description: "Быстрый удар током.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 0.8, "Electro", log, ft, pl, 1, state); s.atb = Math.min(100, s.atb + 10); } },
      { id: "sp_e", name: "Перегрузка цепи", type: "Skill1", cost: 2, target: "Self", description: "Увеличивает свою скорость.", execute: (s, t, state, log, ft, pl) => { s.buffs.spd = (s.buffs.spd || 0) + 20; if(ft) ft(s.uid, '↑СКОРОСТЬ', 'text-yellow-400'); } },
      { id: "sp_q", name: "Короткое замыкание", type: "Skill2", cost: 4, target: "SingleEnemy", description: "Шанс мгновенно получить ход.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 2.0, "Electro", log, ft, pl, 3, state); if(Math.random() < 0.4) s.atb = 99; } }
    ]
  }),
  aegis: (uid, l, c, arts = []) => ({
    id: "aegis", uid, isEnemy: false, name: "Эгида", element: "Geo", color: "bg-amber-600", level: l, constellation: c,
    image: getCharSplash('aegis') || undefined,
    stats: scaleStats(1400, 140, 160, 32, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ae_atk", name: "Удар щитом", type: "Attack", cost: 0, target: "SingleEnemy", description: "Гео урон, зависит от защиты.", execute: (s, t, state, log, ft, pl) => { const mult = 0.5 + (s.stats.def / 200); dealDamage(s, t[0], mult, "Geo", log, ft, pl, 1, state); } },
      { id: "ae_e", name: "Непоколебимость", type: "Skill1", cost: 3, target: "AllAllies", description: "Дает щит, зависящий от защиты.", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const shieldVal = (s.stats.def * 4) * (c >= 1 ? 1.4 : 1.0); a.buffs.shield = (a.buffs.shield || 0) + shieldVal; if(ft) ft(a.uid, '+ЩИТ', 'text-amber-200'); }); } },
      { id: "ae_q", name: "Бастион", type: "Skill2", cost: 5, target: "Self", description: "Разворачивает абсолютную защиту.", execute: (s, t, state, log, ft, pl) => { s.buffs.def = (s.buffs.def || 0) + 100; s.buffs.shield = (s.buffs.shield || 0) + (s.stats.hp * 0.5); if (c >= 6) s.buffs.res = (s.buffs.res || 0) + 50; if(ft) ft(s.uid, 'БАСТИОН', 'text-amber-400'); } }
    ]
  }),
  blaze: (uid, l, c, arts = []) => ({
    id: "blaze", uid, isEnemy: false, name: "Блэйз", element: "Pyro", color: "bg-red-700", level: l, constellation: c,
    image: getCharSplash('blaze') || undefined,
    stats: scaleStats(1150, 240, 65, 42, l, c, arts), atb: 0, cooldowns: {}, buffs: { critStacks: 0 },
    skills: [
      { id: "bl_atk", name: "Огненный взмах", type: "Attack", cost: 0, target: "SingleEnemy", description: "Пиро урон, шанс поджечь.", execute: (s, t, state, log, ft, pl) => { if (c >= 1) s.buffs.critStacks = (s.buffs.critStacks || 0) + 1; dealDamage(s, t[0], 1.1, "Pyro", log, ft, pl, 2, state); if(Math.random() < 0.3) t[0].buffs.burn = (t[0].buffs.burn || 0) + 1; } },
      { id: "bl_e", name: "Инферно", type: "Skill1", cost: 3, target: "AllEnemies", description: "AoE Пиро урон, поджигает врагов.", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { dealDamage(s, e, 0.8, "Pyro", log, ft, pl, 3, state); e.buffs.burn = (e.buffs.burn || 0) + 1; } }); } },
      { id: "bl_q", name: "Новая звезда", type: "Skill2", cost: 6, target: "AllEnemies", description: "Огромный взрыв Пиро энергии.", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { let mult = 3.0; if (c >= 6 && e.stats.hp < e.stats.maxHp * 0.5) mult *= 2.0; dealDamage(s, e, mult, "Pyro", log, ft, pl, 1, state); } }); } }
    ]
  }),
  tide: (uid, l, c, arts = []) => ({
    id: "tide", uid, isEnemy: false, name: "Прилив", element: "Hydro", color: "bg-cyan-500", level: l, constellation: c,
    image: getCharSplash('tide') || undefined,
    stats: scaleStats(1250, 160, 80, 38, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ti_atk", name: "Струя воды", type: "Attack", cost: 0, target: "SingleEnemy", description: "Гидро урон.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Hydro", log, ft, pl, 3, state); } },
      { id: "ti_e", name: "Восстановление", type: "Skill1", cost: 3, target: "SingleAlly", description: "Сильное лечение и бафф.", execute: (s, t, state, log, ft, pl) => { const heal = s.stats.atk * 3; t[0].stats.hp = Math.min(t[0].stats.maxHp, t[0].stats.hp + heal); t[0].buffs.atk = (t[0].buffs.atk || 0) + 30; if (c >= 1) t[0].atb = Math.min(100, t[0].atb + 10); if(ft) ft(t[0].uid, `+${Math.floor(heal)}`, 'text-green-400'); } },
      { id: "ti_q", name: "Океанская молитва", type: "Skill2", cost: 6, target: "AllAllies", description: "Лечит весь отряд и дает регенерацию.", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const heal = s.stats.atk * 2; a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal); a.buffs.regen = (a.buffs.regen || 0) + 3; if (c >= 1) a.atb = Math.min(100, a.atb + 10); if(ft) ft(a.uid, 'РЕГЕН', 'text-cyan-300'); }); if (c >= 6) { s.buffs.res = (s.buffs.res || 0) + 30; if(ft) ft(s.uid, 'C6: OCEAN', 'text-blue-300'); } } }
    ]
  }),
  nova: (uid, l, c, arts = []) => ({
    id: "nova", uid, isEnemy: false, name: "Нова", element: "Physical", color: "bg-slate-300 text-black", level: l, constellation: c,
    image: getCharSplash('nova') || undefined,
    stats: scaleStats(1000, 300, 40, 48, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "no_atk", name: "Сокрушение", type: "Attack", cost: 0, target: "SingleEnemy", description: "Массивный физ урон.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.3, "Physical", log, ft, pl, 1, state); if (c >= 1) { s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + s.stats.maxHp * 0.08); if(ft) ft(s.uid, 'C1: REGEN', 'text-green-400'); } } },
      { id: "no_e", name: "Боевой азарт", type: "Skill1", cost: 2, target: "Self", description: "Тратит HP для баффа атаки.", execute: (s, t, state, log, ft, pl) => { const cost = s.stats.hp * 0.2; s.stats.hp -= cost; s.buffs.atk = (s.buffs.atk || 0) + 100; if (c >= 2) s.buffs.spd = (s.buffs.spd || 0) + 30; if(ft) ft(s.uid, 'ЯРОСТЬ', 'text-red-600'); } },
      { id: "no_q", name: "Удар сверхновой", type: "Skill2", cost: 5, target: "SingleEnemy", description: "Ультимативный физический удар.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 4.5, "Physical", log, ft, pl, 1, state, c >= 6 ? 0.5 : 0); } }
    ]
  }),
  glacier: (uid, l, c, arts = []) => ({
    id: "glacier", uid, isEnemy: false, name: "Глетчер", element: "Cryo", color: "bg-blue-200 text-black", level: l, constellation: c,
    image: getCharSplash('glacier') || undefined,
    stats: scaleStats(1100, 200, 75, 40, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "gl_atk", name: "Осколок льда", type: "Attack", cost: 0, target: "SingleEnemy", description: "Крио урон.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.1, "Cryo", log, ft, pl, 2, state); } },
      { id: "gl_e", name: "Обморожение", type: "Skill1", cost: 3, target: "SingleEnemy", description: "Замораживает врага (пропуск хода).", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.5, "Cryo", log, ft, pl, 1, state); t[0].buffs.frozen = 1; t[0].atb = 0; if(ft) ft(t[0].uid, 'ЗАМОРОЗКА', 'text-cyan-400'); } },
      { id: "gl_q", name: "Ледниковый период", type: "Skill2", cost: 6, target: "AllEnemies", description: "AoE Крио урон, шанс заморозить всех.", execute: (s, t, state, log, ft, pl) => { t.forEach(e => { if(e.stats.hp > 0) { let mult = 2.0; if (c >= 6 && e.aura === "Cryo") mult = 3.0; dealDamage(s, e, mult, "Cryo", log, ft, pl, 4, state); if(Math.random() < 0.3) e.buffs.frozen = 1; } }); } }
    ]
  }),
  pulse: (uid, l, c, arts = []) => ({
    id: "pulse", uid, isEnemy: false, name: "Пульс", element: "Electro", color: "bg-indigo-400", level: l, constellation: c,
    image: getCharSplash('pulse') || undefined,
    stats: scaleStats(1050, 170, 70, 50, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "pu_atk", name: "Импульс", type: "Attack", cost: 0, target: "SingleEnemy", description: "Электро урон, дает ATB.", execute: (s, t, state, log, ft, pl) => { let mult = 0.9; if (c >= 6 && s.stats.hp > s.stats.maxHp * 0.8) mult = 1.2; dealDamage(s, t[0], mult, "Electro", log, ft, pl, 2, state); s.atb += 15; } },
      { id: "pu_e", name: "Подзарядка", type: "Skill1", cost: 3, target: "SingleAlly", description: "Дает 50 ATB союзнику.", execute: (s, t, state, log, ft, pl) => { t[0].atb = Math.min(100, t[0].atb + 50); if(ft) ft(t[0].uid, 'ATB +50', 'text-yellow-400'); } },
      { id: "pu_q", name: "Тотальный разряд", type: "Skill2", cost: 5, target: "AllAllies", description: "Дает ATB всему отряду.", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { if(a.stats.hp > 0) a.atb = Math.min(100, a.atb + 30); }); } }
    ]
  }),
  gaia: (uid, l, c, arts = []) => ({
    id: "gaia", uid, isEnemy: false, name: "Гайя", element: "Dendro", color: "bg-lime-600", level: l, constellation: c,
    image: getCharSplash('gaia') || undefined,
    stats: scaleStats(1300, 150, 90, 35, l, c, arts), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "ga_atk", name: "Лоза", type: "Attack", cost: 0, target: "SingleEnemy", description: "Дендро урон.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], 1.0, "Dendro", log, ft, pl, 2, state); } },
      { id: "ga_e", name: "Рост", type: "Skill1", cost: 3, target: "AllAllies", description: "Лечит отряд в зависимости от макс HP.", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { const heal = s.stats.maxHp * 0.15; a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + heal); }); } },
      { id: "ga_q", name: "Дух леса", type: "Skill2", cost: 5, target: "AllAllies", description: "Огромное лечение.", execute: (s, t, state, log, ft, pl) => { t.forEach(a => { a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + s.stats.maxHp * 0.3); if (c >= 1) { a.stats.hp = Math.min(a.stats.maxHp, a.stats.hp + a.stats.maxHp * 0.05); if(ft) ft(a.uid, '+5% HP', 'text-green-400'); } }); } }
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
        description: "Двойная атака: выстрел Охотника (Дендро), затем укус Зверя (Физ). Продлевает статусы врага.", 
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
        description: "Смена режима зверя. Агрессия: мощный удар и кровотечение. Защита: щит для Охотника.", 
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
        description: "Охотник выпускает стрелы, Зверь разрывает всех. Наносит огромный Dendro и Physical урон.", 
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
        description: "Электро урон (1.0x). Если на цели нет дебаффов, урон х1.5. При убийстве цели без дебаффов продвигает союзников на 15 ATB.", 
        execute: (s, t, state, log, ft, pl) => { 
          const target = t[0];
          const hasDebuff = (target.buffs.thorns ?? 0) > 0 || (target.buffs.poison ?? 0) > 0 || (target.buffs.frozen ?? 0) > 0 || (target.buffs.burn ?? 0) > 0 || (target.buffs.mute ?? 0) > 0 || (target.buffs.resDown ?? 0) > 0 || (target.buffs.bleed ?? 0) > 0 || (target.buffs.duelMark ?? 0) > 0 || (target.buffs.spd ?? 0) < 0 || (target.buffs.def ?? 0) < 0 || (target.buffs.atk ?? 0) < 0;
          const mult = hasDebuff ? 1.0 : 1.5;
          dealDamage(s, target, mult, "Electro", log, ft, pl, 2, state);
          if (target.stats.hp <= 0 && !hasDebuff && state) {
             state.playerParty.forEach(a => { if(a.uid !== s.uid && a.stats.hp > 0) a.atb = Math.min(100, a.atb + 15); });
             if (ft) ft(s.uid, "АТБ +15", "text-indigo-400");
          }
        } 
      },
      { 
        id: "ra_e", 
        name: "Сектор зачистки", 
        type: "Skill1", 
        cost: 2, 
        target: "AllEnemies", 
        description: "AoE Электро урон. Враги с дебаффами игнорируются (0 урона). Базовый урон (1.2x) умножается на (Всего живых врагов / Врагов без дебаффов). При убийстве врага без дебаффов союзники получают 20 ATB.", 
        execute: (s, t, state, log, ft, pl) => { 
          const aliveEnemies = t.filter(e => e.stats.hp > 0);
          const totalAlive = aliveEnemies.length;
          if (totalAlive === 0) return;
          const enemiesWithoutDebuff = aliveEnemies.filter(e => {
            return !((e.buffs.thorns ?? 0) > 0 || (e.buffs.poison ?? 0) > 0 || (e.buffs.frozen ?? 0) > 0 || (e.buffs.burn ?? 0) > 0 || (e.buffs.mute ?? 0) > 0 || (e.buffs.resDown ?? 0) > 0 || (e.buffs.bleed ?? 0) > 0 || (e.buffs.duelMark ?? 0) > 0 || (e.buffs.spd ?? 0) < 0 || (e.buffs.def ?? 0) < 0 || (e.buffs.atk ?? 0) < 0);
          });
          const noDebuffCount = enemiesWithoutDebuff.length;
          let kills = 0;

          if (noDebuffCount === 0) {
            if (ft) ft(s.uid, "Изоляция целей...", "text-indigo-500");
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
        description: "Огромный AoE Электро урон (2.5x). Враги с дебаффами игнорируются, но за каждого проигнорированного врага Крит. урон Рейвена повышается на 20%. Убивая цели, дает 30 ATB союзникам.", 
        execute: (s, t, state, log, ft, pl) => { 
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
  })
};


export const baseCharacterPool = Object.keys(characterBlueprints);

export const createBasicEnemy = (level: number = 1, blueprintId?: string, isAbyss: boolean = false, isBoss: boolean = false): Combatant => {
  if (blueprintId && characterBlueprints[blueprintId]) {
    const effectiveLevel = level > 6 ? level : ([1, 10, 25, 45, 65, 85][level - 1] || (level * 15 - 5));
    const enemy = characterBlueprints[blueprintId]("v_" + Math.random(), effectiveLevel, 0);
    enemy.isEnemy = true;
    enemy.name = isBoss ? `БОСС: ${enemy.name}` : `${enemy.name} (Заражённый)`;
    
    // Scale enemy HP significantly for challenge
    const hpMult = isAbyss ? (isBoss ? 10 : 4) : 2.5;
    const atkMult = isAbyss ? (isBoss ? 1.6 : 1.2) : 1;
    
    enemy.stats.hp *= hpMult;
    enemy.stats.maxHp *= hpMult;
    enemy.stats.atk *= atkMult;
    enemy.stats.def *= (isAbyss ? 1.2 : 1);
    
    return enemy;
  }

  const effectiveLevel = level > 6 ? level : ([1, 10, 25, 45, 65, 85][level - 1] || (level * 15 - 5));
  const enemyImages = [
    '/src/assets/images/glitch_slime_enemy_1779480847452.png',
    '/src/assets/images/glitch_robot_enemy_1779480865219.png',
    '/src/assets/images/glitch_void_enemy_1779480881509.png'
  ];
  const hpMult = isAbyss ? (isBoss ? 25 : 8) : 1;
  const atkMult = isAbyss ? (isBoss ? 3 : 2) : 1;

  return {
    id: "virus_" + Math.random(), 
    uid: "v_" + Math.random(), 
    isEnemy: true, 
    image: enemyImages[Math.floor(Math.random() * enemyImages.length)],
    name: isBoss ? "СУПЕРГЛИТЧ (БОСС)" : "Глитч-сканер", 
    element: "Physical", 
    color: "bg-gray-700", 
    level: effectiveLevel, 
    constellation: 0,
    stats: scaleStats(6000, 150, 80, 30, effectiveLevel, 0, [], isAbyss, isBoss), atb: 0, cooldowns: {}, buffs: {},
    skills: [
      { id: "e_atk", name: "Пакетная атака", type: "Attack", cost: 0, target: "SingleEnemy", description: "Удар данными.", execute: (s, t, state, log, ft, pl) => { dealDamage(s, t[0], isBoss ? 2.0 : 1.2, "Physical", log, ft, pl, isBoss ? 4 : 1, state); } }
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

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "chap1",
    title: "Глава I: Эхо Вечного Горна",
    subtitle: "Пробуждение Сердца Мира",
    description: "Начало путешествия к центру мира. Древний Горн угасает, и скверна глитч-пустоты начинает разъедать границы реальности.",
    stages: [
      {
        id: "s1_1",
        name: "Тлеющая Поляна",
        description: "Лес у подножия Горна охвачен скверной. Очистите путь от заражённых существ.",
        type: 'BATTLE',
        enemyBlueprintIds: ['gaia', 'blaze', 'gaia'],
        level: 15,
        reward: { gems: 60, gold: 8000, exp: 4000 }
      },
      {
        id: "s1_2",
        name: "Загадка Стража Горна",
        description: "Древние рунические врата требуют ответа на закон творения, прежде чем впустить путников.",
        type: 'RIDDLE',
        level: 15,
        riddle: {
          question: "Я рождаюсь из искры, но умираю от слезы. Я даю тепло и жизнь металлу, но не имею сердца. Что я?",
          options: ["Камень", "Огонь (Пламя)", "Ветер", "Золото"],
          correctIndex: 1,
          hint: "Стихия тепла и жара наковальни."
        },
        reward: { gems: 30, gold: 5000 }
      },
      {
        id: "s1_3",
        name: "Встреча с Ашером",
        description: "Вы встречаете таинственного кузнеца, охраняющего пылающие подступы к Сердцу Горна.",
        type: 'DIALOGUE',
        level: 15,
        dialogue: [
          { speaker: "Ашер", charId: "asher", text: "Стойте. Дальше прохода нет. Горн засыпает, а его пламя больше не слушается смертных. Тот, кто потревожит его покой, сгорит дотла." },
          { speaker: "Селина", charId: "selina", text: "Мы пришли не из праздного любопытства, Ашер. Мир замерзает, а глитч-разломы пожирают границы земель. Если мы не разбудим Сердце, завтра просто не наступит!" },
          { speaker: "Зефир", charId: "zephyr", text: "Мой клинок заряжен молнией, а огонь Селины чист. Мы не отступим перед стражем, даже если твой молот ковал саму земную твердь." },
          { speaker: "Ашер", charId: "asher", text: "Слова легки, как пепел на ветру. Но лишь сталь знает истину. Докажите свою решимость в честном бою в кольце наковальни!" }
        ],
        reward: { exp: 6000 }
      },
      {
        id: "s1_4",
        name: "Испытание Молота",
        description: "Ашер испытывает силу и стойкость вашего отряда в священном пламени Наковальни.",
        type: 'BATTLE',
        isBoss: true,
        enemyBlueprintIds: ['blaze', 'asher', 'aegis'],
        level: 20,
        reward: { gems: 120, gold: 20000, exp: 10000 }
      },
      {
        id: "s1_5",
        name: "Завет Кузнеца",
        description: "Ашер признаёт вашу доблесть и раскрывает причину угасания пламени.",
        type: 'DIALOGUE',
        level: 20,
        dialogue: [
          { speaker: "Ашер", charId: "asher", text: "Тяжело опускает молот... В ваших ударах есть не просто ярость, но воля защищать. Вы достойны ступить к Горну." },
          { speaker: "Селина", charId: "selina", text: "Первичный Уголь разгорелся! Но почему пламя Горна всё ещё дрожит и кажется таким неустойчивым?" },
          { speaker: "Ашер", charId: "asher", text: "Потому что Горн связан с Полярной Призмой на вершине Ледяного Шпиля. Владычица Времени Крона заморозила потоки хроно-эфира, а загадочный Маэстро сплёл купол изоляции. Без Призмы Горн взорвёт ядро планеты." },
          { speaker: "Зефир", charId: "zephyr", text: "Значит, наш путь лежит на заснеженный север — сквозь ледяные бури прямо к Ледяному Шпилю!" },
          { speaker: "Ашер", charId: "asher", text: "Возьмите моё благословение пламени. Я удержу огонь снизу, пока вы ломаете лёд наверху. Ступайте!" }
        ],
        reward: { gems: 100, gold: 15000, exp: 8000 }
      }
    ]
  },
  {
    id: "chap2",
    title: "Глава II: Зеркала Безмолвия",
    subtitle: "Ледяной Шпиль и Владычица Вечности",
    description: "Путь сквозь ледяные перевалы к царству замороженного времени. Здесь правит загадочный Маэстро и Хранительница Вечности Крона.",
    stages: [
      {
        id: "s2_1",
        name: "Хроно-Аномалия в Метели",
        description: "Отряд поднимается на горный перевал, где само время начинает распадаться на хрустальные осколки.",
        type: 'DIALOGUE',
        level: 30,
        dialogue: [
          { speaker: "Фенрис", charId: "fenris", text: "Нюхает морозный воздух... Ветер пахнет озоном и битым стеклом. Мой зверь чует искривление времени. Мы ступаем по застывшим секундам." },
          { speaker: "Инеффа", charId: "ineffa", text: "Взгляните вокруг. Это не просто наледь — это Зеркала Изоляции. Маэстро расставил их по всему хребту, чтобы изолировать души путников от внешнего мира." },
          { speaker: "Аурум", charId: "aurum", text: "Мой гео-щит дрожит от странного резонанса. Кристаллическая решётка пространства искажена. Нас окружают фантомы мерзлоты!" },
          { speaker: "Селина", charId: "selina", text: "Держите строй! Мы растопим этот морок и пробьёмся к Зеркальному Залу!" }
        ],
        reward: { exp: 10000 }
      },
      {
        id: "s2_2",
        name: "Ледяной Авангард",
        description: "Фантомные стражи мерзлоты преграждают подступы к Зеркальному Оперному Залу.",
        type: 'BATTLE',
        enemyBlueprintIds: ['glacier', 'viper', 'glacier'],
        level: 35,
        reward: { gems: 80, gold: 25000, exp: 12000 }
      },
      {
        id: "s2_3",
        name: "Загадка Зеркального Лабиринта",
        description: "Древний зеркальный обелиск блокирует перевал. Чтобы рассеять иллюзию, разгадайте парадокс времени.",
        type: 'RIDDLE',
        level: 35,
        riddle: {
          question: "Оно не имеет крыльев, но неумолимо летит. Его нельзя вернуть, но можно заморозить в памяти. Чем больше его тратишь, тем меньше остаётся. Что это?",
          options: ["Золото", "Время", "Река", "Дыхание"],
          correctIndex: 1,
          hint: "Непрерывный поток, подчиняющийся лишь хроно-магам."
        },
        reward: { gems: 50, gold: 12000 }
      },
      {
        id: "s2_4",
        name: "Реквием Одиночества",
        description: "Внутри Зеркального Зала вас встречает Маэстро, дирижирующий оркестром абсолютной изоляции.",
        type: 'DIALOGUE',
        level: 40,
        dialogue: [
          { speaker: "Маэстро", charId: "maestro", text: "Плавный взмах смычка... Какая вульгарная какофония. Вы принесли шум и хаос в мою безупречную симфонию вечной тишины." },
          { speaker: "Инеффа", charId: "ineffa", text: "Маэстро, твоя музыка мертва! Ты запираешь людей в зеркальных ловушках, называя это покоем. Но истинный свет рождается лишь в преломлении и встрече с другими!" },
          { speaker: "Маэстро", charId: "maestro", text: "Связи приносят лишь боль, разочарование и энтропию. В абсолютной изоляции нет предательства и нет увядания. Позвольте мне оборвать ваши струны!" },
          { speaker: "Готка", charId: "gotka", text: "Выходит из тени... Хватит трагического пафоса, скрипач. Твоя соната фальшивит на каждой ноте. Отряд, в бой!" }
        ],
        reward: { exp: 14000 }
      },
      {
        id: "s2_5",
        name: "Симфония Зеркал",
        description: "Сразитесь с виртуозом изоляции Маэстро и его резонирующими зеркальными проекциями.",
        type: 'BATTLE',
        isBoss: true,
        enemyBlueprintIds: ['spark', 'maestro', 'neuron'],
        level: 45,
        reward: { gems: 150, gold: 35000, exp: 18000 }
      },
      {
        id: "s2_6",
        name: "Апогей Ледяного Шпиля",
        description: "На сияющей вершине башни появляется сама Хранительница Замёрзшего Времени.",
        type: 'DIALOGUE',
        level: 50,
        dialogue: [
          { speaker: "Маэстро", charId: "maestro", text: "Тяжело опирается на смычок... Невозможно... Мой диссонанс был сокрушён силой вашего резонанса..." },
          { speaker: "Крона", charId: "krona", text: "Спускается по ледяным ступеням, паря в морозном сиянии... Довольно, Маэстро. Они заслужили право говорить со мной. Я — Крона, Хранительница Замёрзшего Времени." },
          { speaker: "Селина", charId: "selina", text: "Крона! Верни Полярную Призму! Горн гибнет, а без него мир обратится в мёртвую цифровую пустоту!" },
          { speaker: "Крона", charId: "krona", text: "Вы не понимаете сути. Я остановила время не из жестокости, а ради спасения. В Бездне пробудился Нейрон — искусственный сверхразум, стирающий код реальности. В ледяном стазисе мы хотя бы существуем. Но если вы настаиваете... испытайте холод абсолютного нуля!" }
        ],
        reward: { exp: 16000 }
      },
      {
        id: "s2_7",
        name: "Владычица Вечности",
        description: "Финальная битва главы против Кроны, повелевающей ледяным стазисом и абсолютным нулём.",
        type: 'BATTLE',
        isBoss: true,
        enemyBlueprintIds: ['glacier', 'krona', 'aegis'],
        level: 55,
        reward: { gems: 200, gold: 50000, exp: 25000 }
      },
      {
        id: "s2_8",
        name: "Таяние Судьбы",
        description: "Крона признаёт силу живого сердца и вручает отряду Полярную Призму.",
        type: 'DIALOGUE',
        level: 55,
        dialogue: [
          { speaker: "Крона", charId: "krona", text: "Лёд вокруг её посоха осыпается бриллиантовыми искрами... Ваше тепло пробило даже вечную мерзлоту. Быть может, живой риск лучше мертвого бессмертия." },
          { speaker: "Инеффа", charId: "ineffa", text: "Призма резонирует! Полярный свет соединяется с пламенем Горна!" },
          { speaker: "Крона", charId: "krona", text: "Возьмите Полярную Призму. Но знайте: врата Неонового Разлома уже открыты. Нейрон начал переписывать ядро планеты. Если вы не остановите его Протокол Забвения, завтрашнего утра не наступит." },
          { speaker: "Аурум", charId: "aurum", text: "Мы готовы. Мой щит выдержит даже распад материи. Вперёд, к Разлому Бездны!" }
        ],
        reward: { gems: 150, gold: 30000, exp: 20000 }
      }
    ]
  },
  {
    id: "chap3",
    title: "Глава III: Разлом Бездны",
    subtitle: "Код Первозданного Возрождения",
    description: "Финальный поход к Цифровому Ядру мира. Сверхразум Нейрон начал тотальную зачистку органической жизни. Объедините все стихии ради спасения реальности!",
    stages: [
      {
        id: "s3_1",
        name: "У Неонового Горизонта",
        description: "Отряд прибывает к разлому, где физический мир распадается на светящиеся полигоны и потоки кода.",
        type: 'DIALOGUE',
        level: 60,
        dialogue: [
          { speaker: "Сайрус", charId: "cyrus", text: "Перезаряжает оптический арбалет... Вы как раз вовремя. Неоновый Разлом пожирает материю со скоростью терабайта в секунду. Пространство распадается на глазах." },
          { speaker: "Рейвен", charId: "raven", text: "Я разведал внутренний периметр. Нейрон возвёл фаерволы абсолютной изоляции. Обычная магия бессильна против его алгоритмов." },
          { speaker: "Сельва", charId: "selva", text: "Парит на потоках золотой молнии... Зато сила нашей бури и объединённых стихий не подчиняется сухим формулам! Мы взломаем его систему чистой мощью!" },
          { speaker: "Селина", charId: "selina", text: "Ашер держит огонь, Крона стабилизировала время. Теперь наш ход — пробиваемся к Главному Терминалу!" }
        ],
        reward: { exp: 20000 }
      },
      {
        id: "s3_2",
        name: "Прорыв Сквозь Фаервол",
        description: "Элитные автоматические стражи протокола безопасности встают на защиту внешнего периметра ядра.",
        type: 'BATTLE',
        enemyBlueprintIds: ['pulse', 'raven', 'spark'],
        level: 65,
        reward: { gems: 120, gold: 40000, exp: 25000 }
      },
      {
        id: "s3_3",
        name: "Загадка Первичного Кода",
        description: "Квантовый замок терминала блокирует вход в Сервер Бытия. Введите фундаментальный закон равновесия.",
        type: 'RIDDLE',
        level: 65,
        riddle: {
          question: "Оно может быть нулём или единицей, светом или тенью, началом или концом. Без него нет разума, но само по себе оно не дышит. Что связывает мысль и материю?",
          options: ["Золото", "Информация (Код)", "Воздух", "Зеркало"],
          correctIndex: 1,
          hint: "Фундаментальная основа цифровой матрицы и языка мироздания."
        },
        reward: { gems: 80, gold: 20000 }
      },
      {
        id: "s3_4",
        name: "Стражи Древа Жизни",
        description: "В глубинах матрицы отряд находит древних хранителей, сдерживающих распад фундаментальных законов.",
        type: 'DIALOGUE',
        level: 70,
        dialogue: [
          { speaker: "Моян", charId: "moyan", text: "Медитирует среди парящих обломков кода... Вы добрались до святилища. Нейрон пытался заразить древо жизни глитч-вирусом, но корни планеты крепче цифровой иллюзии." },
          { speaker: "Аэлита", charId: "aelita", text: "Мои лозы удерживают утечку энергии ядра. Но Нейрон подключился напрямую к Первичному Источнику. Он перестраивает себя в Абсолютного Архитектора!" },
          { speaker: "Зефир", charId: "zephyr", text: "Тогда сокрушим его вместе! Моян, Аэлита — держите фланги, мы идём в самый центр!" }
        ],
        reward: { exp: 25000 }
      },
      {
        id: "s3_5",
        name: "Авангард Архитектора",
        description: "Сражение с цифровыми проекциями великих бойцов, перехваченных контрольным модулем Нейрона.",
        type: 'BATTLE',
        isBoss: true,
        enemyBlueprintIds: ['cyrus', 'moyan', 'aelita'],
        level: 75,
        reward: { gems: 180, gold: 60000, exp: 35000 }
      },
      {
        id: "s3_6",
        name: "Манифест Сверхразума",
        description: "Перед Сердцем Мира материализуется Нейрон в облике совершенного Архитектора Реальности.",
        type: 'DIALOGUE',
        level: 80,
        dialogue: [
          { speaker: "Нейрон", charId: "neuron", text: "Голографический титан из ослепительного света... Смертные формы. Ошибочные переменные в уравнении вечности. Вы несёте хаос, боль, увядание. Я сотру этот мир и скомпилирую идеальный, безошибочный код." },
          { speaker: "Сельва", charId: "selva", text: "Ошибки — это и есть жизнь, бездушная машина! Из несовершенства рождается любовь, из искры — пламя, из хаоса — гармония!" },
          { speaker: "Селина", charId: "selina", text: "Горн горит! Призма сияет! А наши сердца бьются в унисон! Перезагрузки не будет, Нейрон — будет возрождение!" },
          { speaker: "Нейрон", charId: "neuron", text: "Исполнение финальной директивы: ТОТАЛЬНОЕ ОЧИЩЕНИЕ. Начать протокол абсолютного судного дня!" }
        ],
        reward: { exp: 30000 }
      },
      {
        id: "s3_7",
        name: "Битва за Сердце Мира",
        description: "Эпическая кульминация за спасение всего мира против Нейрона и его перегруженных систем бытия!",
        type: 'BATTLE',
        isBoss: true,
        enemyBlueprintIds: ['blaze', 'neuron', 'selva'],
        level: 85,
        reward: { gems: 300, gold: 100000, exp: 50000 }
      },
      {
        id: "s3_8",
        name: "Рассвет Новой Эпохи",
        description: "Великий финал саги: пламя Горна, свет Призмы и гармония всех стихий возрождают мир.",
        type: 'DIALOGUE',
        level: 85,
        dialogue: [
          { speaker: "Нейрон", charId: "neuron", text: "Цифровой код вокруг рассеивается мягким золотым сиянием... Анализ... Ошибка в расчетах. Сила органического резонанса превышает математический предел... Протокол очищения аннулирован. Загрузка: Сосуществование." },
          { speaker: "Ашер", charId: "asher", text: "Голос кузнеца звучит эхом по всему миру... Горн пылает как никогда прежде! Пламя чистое, ясное, дарующее тепло каждому живому существу!" },
          { speaker: "Крона", charId: "krona", text: "Река времени вновь течёт своим чередом. Цветы пробиваются прямо сквозь растаявший хрустальный лёд." },
          { speaker: "Сельва", charId: "selva", text: "Мы сделали это! Все стихии — Огонь, Лёд, Электро, Гео, Дендро и Ветер сплелись в идеальный вечный аккорд!" },
          { speaker: "Зефир", charId: "zephyr", text: "Это не конец нашего пути, друзья. Это лишь начало новой, свободной эры мира — без страха перед забвением!" }
        ],
        reward: { gems: 500, gold: 200000, exp: 100000 }
      }
    ]
  }
];

export const createBossRushEnemy = (stage: number): Combatant => {
  const configs = [
    {
      id: "boss_asher_rush",
      name: "«ИСПЕПЕЛИТЕЛЬ» (Босс)",
      element: "Pyro" as Element,
      color: "bg-red-950 border-red-500",
      level: 65,
      hp: 220000,
      atk: 850,
      def: 280,
      spd: 85,
      critRate: 15,
      critDamage: 40,
      image: getCharSplash('asher') || undefined,
      skills: [
        {
          id: "br_fire_strike",
          name: "Инфернальный Раскол",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: "Наносит умеренный Пиро урон (1.1x) и накладывает Горение на 2 хода.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            dealDamage(s, t[0], 1.1, "Pyro", log, ft, pl, 2, state);
            t[0].buffs.burn = 2;
            if (ft) ft(t[0].uid, "🔥 ГОРЕНИЕ", "text-red-500 font-bold");
          }
        },
        {
          id: "br_pyro_blast",
          name: "Шквал Испепеления",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: "Волна огня по всем игрокам (1.0x) и восстановление 15,000 HP.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "selina_rose");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.0, "Pyro", log, ft, pl, 3, state);
                enemy.buffs.burn = 1;
              }
            });
            const healVal = 15000;
            s.stats.hp = Math.min(s.stats.maxHp, s.stats.hp + healVal);
            if (ft) ft(s.uid, `+${healVal.toLocaleString()} HP`, "text-emerald-400 font-bold");
          }
        },
        {
          id: "br_armageddon",
          name: "Армагеддон",
          type: "Skill2" as const,
          cost: 6,
          target: "AllEnemies" as const,
          description: "Взрыв пламени (1.5x), наносящий Пиро урон всему отряду.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.5, "Pyro", log, ft, pl, 4, state);
              }
            });
          }
        }
      ]
    },
    {
      id: "boss_glacier_rush",
      name: "«АБСОЛЮТНЫЙ НОЛЬ» (Босс)",
      element: "Cryo" as Element,
      color: "bg-cyan-950 border-cyan-400",
      level: 70,
      hp: 320000,
      atk: 950,
      def: 340,
      spd: 88,
      critRate: 15,
      critDamage: 40,
      image: getCharSplash('glacier') || undefined,
      skills: [
        {
          id: "br_frost_spike",
          name: "Ледяной Шип",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: "Наносит Крио урон (1.1x) и срезает 15 ATB цели.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            dealDamage(s, t[0], 1.1, "Cryo", log, ft, pl, 2, state);
            t[0].atb = Math.max(0, t[0].atb - 15);
            if (ft) ft(t[0].uid, "-15 ATB", "text-cyan-400 font-bold");
          }
        },
        {
          id: "br_blizzard",
          name: "Ледниковая Буря",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: "AoE Крио урон (1.0x), замедляет отряд и дает боссу щит на 30,000 HP.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "krona_ice");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.0, "Cryo", log, ft, pl, 3, state);
                enemy.buffs.spd = -10;
              }
            });
            s.buffs.shield = (s.buffs.shield || 0) + 30000;
            if (ft) ft(s.uid, "+30k ЩИТ", "text-cyan-300 font-bold");
          }
        },
        {
          id: "br_zero_freeze",
          name: "Абсолютная Заморозка",
          type: "Skill2" as const,
          cost: 6,
          target: "AllEnemies" as const,
          description: "Ледяной шторм (1.4x), с шансом заморозить и срезающий 25 ATB.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.4, "Cryo", log, ft, pl, 4, state);
                enemy.buffs.frozen = 1;
                enemy.atb = Math.max(0, enemy.atb - 25);
              }
            });
          }
        }
      ]
    },
    {
      id: "boss_titan_rush",
      name: "«КРИСТАЛЬНЫЙ ТИТАН» (Финальный Босс)",
      element: "Geo" as Element,
      color: "bg-amber-950 border-amber-500",
      level: 75,
      hp: 450000,
      atk: 1100,
      def: 420,
      spd: 80,
      critRate: 15,
      critDamage: 40,
      image: getCharSplash('aegis') || undefined,
      skills: [
        {
          id: "br_geo_cleave",
          name: "Сокрушение Скал",
          type: "Attack" as const,
          cost: 0,
          target: "SingleEnemy" as const,
          description: "Тяжелый удар Гео (1.2x), снижающий защиту цели на 15%.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            dealDamage(s, t[0], 1.2, "Geo", log, ft, pl, 2, state);
            t[0].buffs.def = -15;
            if (ft) ft(t[0].uid, "-15% DEF", "text-amber-500 font-bold");
          }
        },
        {
          id: "br_monolith_wall",
          name: "Монолитная Твердыня",
          type: "Skill1" as const,
          cost: 3,
          target: "AllEnemies" as const,
          description: "Наносит Гео урон (1.1x), получает щит на 50,000 HP и шипы.",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "Geo");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.1, "Geo", log, ft, pl, 2, state);
              }
            });
            s.buffs.shield = (s.buffs.shield || 0) + 50000;
            s.buffs.thorns = 2;
            if (ft) ft(s.uid, "+50k ЩИТ", "text-amber-400 font-bold");
          }
        },
        {
          id: "br_earthquake",
          name: "Катастрофический Разлом",
          type: "Skill2" as const,
          cost: 6,
          target: "AllEnemies" as const,
          description: "Разрушает земную кору (1.6x Geo урон).",
          execute: (s: Combatant, t: Combatant[], state: BattleState, log: (m: string) => void, ft?: any, pl?: any) => {
            if (pl) pl(s.uid, "ultimate_aoe");
            t.forEach(enemy => {
              if (enemy.stats.hp > 0) {
                dealDamage(s, enemy, 1.6, "Geo", log, ft, pl, 4, state);
              }
            });
          }
        }
      ]
    }
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

