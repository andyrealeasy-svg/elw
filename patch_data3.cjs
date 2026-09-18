const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf-8');

function getSkillStats(skillBody, charId, description) {
    let stats = [];
    
    // 1. Damage
    let dmgs = [];
    let dmgRegex = /dealDamage\([^,]+,\s*[^,]+,\s*([\d\.]+)/g;
    let m;
    while ((m = dmgRegex.exec(skillBody)) !== null) {
       let num = Math.round(parseFloat(m[1]) * 100);
       let statType = 'АТК';
       if (charId === 'aveline') {
           statType = 'HP';
           num = Math.round(parseFloat(m[1]) * 12); // multiplier was divided by something maybe? Wait. baseStat = maxHp * 0.12 in data.ts. So multiplier * 0.12 of HP. 1.0 -> 12% HP.
       } else if (['aurum', 'maestro', 'kamikaze', 'glacier'].includes(charId)) {
           statType = 'DEF / АТК';
       }
       let str = `${num}% ${statType}`;
       if (!dmgs.includes(str)) dmgs.push(str);
    }
    if (dmgs.length > 0) {
       stats.push(`Урон: ${dmgs.join(' / ')}`);
    }
    
    // 2. Healing
    let heals = [];
    let healVars = [...skillBody.matchAll(/heal = (?:s\.stats\.)?(atk|maxHp) \* ([\d\.]+)/g)];
    for (let match of healVars) {
        let type = match[1] === 'atk' ? 'АТК' : 'HP';
        heals.push(`${Math.round(parseFloat(match[2]) * 100)}% ${type}`);
    }
    
    let hpAdd = [...skillBody.matchAll(/(?:\.hp \+= |\+ )(?:s\.stats\.)?(atk|maxHp) \* ([\d\.]+)/g)];
    for (let match of hpAdd) {
        let type = match[1] === 'atk' ? 'АТК' : 'HP';
        heals.push(`${Math.round(parseFloat(match[2]) * 100)}% ${type}`);
    }

    let healStatic = [...skillBody.matchAll(/heal = (\d+)/g)];
    for (let match of healStatic) {
        if (parseFloat(match[1]) > 10) {
            heals.push(`${match[1]} (базово)`);
        }
    }

    let uniqHeals = [...new Set(heals)];
    if (uniqHeals.length > 0) {
        stats.push(`Лечение: ${uniqHeals.join(' / ')}`);
    } else if (description.toLowerCase().includes('лечит') || description.toLowerCase().includes('восстанавливает hp')) {
        stats.push(`Лечение: (Зависит от навыка)`);
    }

    // 3. Shields
    let shieldAtkMatch = skillBody.match(/shield = (?:s\.stats\.)?(atk|maxHp) \* ([\d\.]+)/);
    if (shieldAtkMatch) {
        let type = shieldAtkMatch[1] === 'atk' ? 'АТК' : 'HP';
        stats.push(`Щит: ${Math.round(parseFloat(shieldAtkMatch[2]) * 100)}% ${type}`);
    } else if (skillBody.includes('.shield =')) {
        stats.push(`Щит: (Специальный)`);
    }

    // 4. ATB Продвижение (Action Advance)
    let atbGains = [];
    let atbGain = [...skillBody.matchAll(/\.atb \+ (\d+)/g)];
    let atbGain2 = [...skillBody.matchAll(/\.atb \+= (\d+)/g)];
    for (let match of atbGain) atbGains.push(`${match[1]}%`);
    for (let match of atbGain2) atbGains.push(`${match[1]}%`);
    
    if (skillBody.match(/\.atb = 100/)) atbGains.push(`100%`);
    
    let uniqAtbGains = [...new Set(atbGains)];
    if (uniqAtbGains.length > 0) {
        stats.push(`Продвижение хода: ${uniqAtbGains.join(' / ')}`);
    }

    // 5. ATB Задержка (Action Delay)
    let atbLosses = [];
    let atbLoss = [...skillBody.matchAll(/\.atb - (\d+)/g)];
    let atbLoss2 = [...skillBody.matchAll(/\.atb -= (\d+)/g)];
    for (let match of atbLoss) atbLosses.push(`${match[1]}%`);
    for (let match of atbLoss2) atbLosses.push(`${match[1]}%`);
    
    let uniqAtbLosses = [...new Set(atbLosses)];
    if (uniqAtbLosses.length > 0) {
        stats.push(`Задержка хода: ${uniqAtbLosses.join(' / ')}`);
    }

    // 6. Conditional Buffs - maybe just a generic note if not captured above?
    // Not strictly required, user just asked for correct multipliers and "other details if required".
    // I think ATB + Shield + Heals + Dmg is already a massive improvement.

    return stats.join('\\n');
}

// Regex to find description and optional statsText
let regex = /description:\s*(['"`])([\s\S]*?)\1\s*(?:,\s*statsText:\s*"[^"]*")?,/g;
let matches = [];
let m;
while ((m = regex.exec(content)) !== null) {
   matches.push({ start: m.index, end: m.index + m[0].length, full: m[0], desc: m[2] });
}

let out = "";
let lastIdx = 0;
for (let match of matches) {
    // Replace just the matching part without `statsText` first
    let cleanMatch = `description: '${match.desc.replace(/'/g, "\\'")}',`;
    out += content.substring(lastIdx, match.start) + cleanMatch;
    
    // Find char ID
    let charContext = content.substring(Math.max(0, match.start - 3000), match.start);
    let charDefRegex = /([a-z0-9_]+):\s*\(\s*uid\s*,/g;
    let defMatch;
    let charId = 'unknown';
    while ((defMatch = charDefRegex.exec(charContext)) !== null) {
        charId = defMatch[1];
    }
    
    let execStart = content.indexOf('execute: ', match.end);
    // Be careful, maybe some spaces between description and execute
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
        let statsText = getSkillStats(execBody, charId, match.desc);
        if (statsText) {
            out += `\n        statsText: "${statsText}",`;
        }
    }
    lastIdx = match.end;
}
out += content.substring(lastIdx);

fs.writeFileSync('src/data.ts', out);
console.log(`Patched ${matches.length} skills`);
