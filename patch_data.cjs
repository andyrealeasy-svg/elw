const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf-8');

function getSkillStats(skillBody, charId) {
    let stats = [];
    
    let dmgMatch = skillBody.match(/dealDamage\([^,]+,\s*[^,]+,\s*([\d\.]+(?:\s*\+\s*\([^)]+\))?|[\d\.]+)/);
    if (dmgMatch) {
       let m = dmgMatch[1];
       let baseMult = m.match(/^([\d\.]+)/);
       if (baseMult) {
          let num = Math.round(parseFloat(baseMult[1]) * 100);
          let statType = 'АТК';
          
          if (charId === 'aveline') {
              statType = 'HP';
              num = Math.round(parseFloat(baseMult[1]) * 12);
          } else if (['aurum', 'maestro', 'kamikaze', 'glacier'].includes(charId)) {
              statType = 'DEF'; // Actually it's DEF or ATK depending on highest, but DEF is canonical for geo. We'll say DEF / АТК
          }

          stats.push(`Урон: ${num}% ${statType}`);
       }
    }
    
    // Heals
    let healAtkMatch = skillBody.match(/heal = s\.stats\.atk \* ([\d\.]+)/);
    let healHpMatch = skillBody.match(/heal = s\.stats\.maxHp \* ([\d\.]+)/);
    let healHpMatch2 = skillBody.match(/s\.stats\.hp \+= (?:s\.stats\.)?maxHp \* ([\d\.]+)/);
    let hpAddAtkMatch = skillBody.match(/hp \+ \(s\.stats\.atk \* ([\d\.]+)\)/);
    let hpAddHpMatch = skillBody.match(/hp \+ \(s\.stats\.maxHp \* ([\d\.]+)\)/);
    
    let healVals = [];
    if (healAtkMatch) healVals.push(`${Math.round(parseFloat(healAtkMatch[1]) * 100)}% АТК`);
    if (hpAddAtkMatch) healVals.push(`${Math.round(parseFloat(hpAddAtkMatch[1]) * 100)}% АТК`);
    if (healHpMatch) healVals.push(`${Math.round(parseFloat(healHpMatch[1]) * 100)}% HP`);
    if (hpAddHpMatch) healVals.push(`${Math.round(parseFloat(hpAddHpMatch[1]) * 100)}% HP`);
    if (healHpMatch2) healVals.push(`${Math.round(parseFloat(healHpMatch2[1]) * 100)}% HP`);
    
    if (healVals.length > 0) {
       stats.push(`Лечение: ${healVals[0]}`);
    } else if (skillBody.match(/ally\.stats\.hp = Math\.min[^;]+ally\.stats\.hp \+ (?!heal)[^;]+/)) {
       stats.push(`Лечение: (Зависит от навыка)`);
    } else if (skillBody.includes('dealDamage(s, t[0], 0.6,') && charId === 'ineffa') {
       // manual check
    }

    let shieldAtkMatch = skillBody.match(/shield = (?:s\.stats\.atk \* )?([\d\.]+)/);
    if (shieldAtkMatch && skillBody.includes('shield = s.stats.atk')) {
        stats.push(`Щит: ${Math.round(parseFloat(shieldAtkMatch[1]) * 100)}% АТК`);
    } else if (skillBody.includes('s.buffs.shield =')) {
        stats.push(`Щит: (Специальный)`);
    }

    return stats.join('\\n');
}

let out = "";
let regex = /description:\s*(['"`])([\s\S]*?)\1\s*,/g;
let matches = [];
let m;
while ((m = regex.exec(content)) !== null) {
   matches.push({ start: m.index, end: m.index + m[0].length, full: m[0] });
}

let lastIdx = 0;
for (let match of matches) {
    out += content.substring(lastIdx, match.end);
    
    // Find char ID by searching backwards for standard definition
    let charContext = content.substring(Math.max(0, match.start - 3000), match.start);
    // Find all blueprint definitions before this skill and get the last one
    let charDefRegex = /([a-z0-9_]+):\s*\(\s*uid\s*,/g;
    let defMatch;
    let charId = 'unknown';
    while ((defMatch = charDefRegex.exec(charContext)) !== null) {
        charId = defMatch[1];
    }
    
    let execStart = content.indexOf('execute: ', match.end);
    if (execStart !== -1 && execStart < match.end + 200) {
        let blockEnd = execStart;
        let openBraces = 0;
        let started = false;
        for (let j = execStart; j < content.length; j++) {
            if (content[j] === '{') { openBraces++; started = true; }
            else if (content[j] === '}') { openBraces--; }
            if (started && openBraces === 0) {
                blockEnd = j;
                break;
            }
        }
        let execBody = content.substring(execStart, blockEnd + 1);
        let statsText = getSkillStats(execBody, charId);
        if (statsText) {
            out += `\n        statsText: "${statsText}",`;
        }
    }
    lastIdx = match.end;
}
out += content.substring(lastIdx);

fs.writeFileSync('src/data.ts', out);
console.log('done');
