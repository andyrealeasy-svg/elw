const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf-8');

function getSkillStats(skillBody, charId, description) {
    let stats = [];
    
    // 1. Damage
    let dmgs = [];
    let dmgRegex = /dealDamage\([^,]+,\s*[^,]+,\s*([a-zA-Z\d\.\s\+\-\*]+?)\s*,\s*["']/g;
    let m;
    while ((m = dmgRegex.exec(skillBody)) !== null) {
       let val = m[1].trim();
       let nums = [];
       // If it's a number directly
       if (/^[\d\.]+$/.test(val)) {
           nums.push(parseFloat(val));
       } else if (val === 'mult' || val === 'multiplier') {
           // Look for let mult = ... or const mult = ...
           
           // Ternary mult = cond ? 1.0 : 1.5;
           let multTernary = skillBody.match(/(?:let|const|var)\s+(?:mult|multiplier)\s*=\s*[^?]+\?\s*([\d\.]+)\s*:\s*([\d\.]+)/);
           if (multTernary) {
               nums.push(parseFloat(multTernary[1]));
               nums.push(parseFloat(multTernary[2]));
           } else {
              // Direct assignment
              let multMatch = [...skillBody.matchAll(/(?:let|const|var)?\s*(?:mult|multiplier)\s*=\s*([\d\.]+)/g)];
              for (let mm of multMatch) {
                  nums.push(parseFloat(mm[1]));
              }
           }
       } else if (val.includes('+')) {
           let parts = val.split('+');
           for (let p of parts) {
              if (/^[\d\.\s]+$/.test(p)) nums.push(parseFloat(p));
           }
       }
       
       for (let n of nums) {
           let num = Math.round(n * 100);
           let statType = 'АТК';
           if (charId === 'aveline') {
               statType = 'HP';
               num = Math.round(n * 12);
           } else if (['aurum', 'maestro', 'kamikaze', 'glacier', 'patch'].includes(charId)) {
               statType = 'DEF / АТК';
           } else if (charId === 'nova') {
               statType = 'HP';
           }
           let str = `${num}% ${statType}`;
           if (!dmgs.includes(str)) dmgs.push(str);
       }
    }
    
    if (dmgs.length > 0) {
       stats.push(`Урон: ${dmgs.join(' / ')}`);
    } else if (description.toLowerCase().includes('урон') && charId === 'raven') { // explicit raven fallback just in case
       // this branch is skipped if dmgs > 0
    }
    
    // 2. Healing
    let heals = [];
    let healRegex = /(?:heal\s*=\s*|\.hp\s*[+=]=\s*[^;]*?)(s\.stats\.atk|s\.stats\.maxHp|ally\.stats\.maxHp|maxHp|atk)\s*\*\s*([\d\.]+)/g;
    let hm;
    while ((hm = healRegex.exec(skillBody)) !== null) {
        let type = hm[1].includes('atk') ? 'АТК' : 'HP';
        heals.push(`${Math.round(parseFloat(hm[2]) * 100)}% ${type}`);
    }

    let healStatic = [...skillBody.matchAll(/heal = (\d{2,})/g)];
    for (let match of healStatic) heals.push(`${match[1]} (базово)`);

    let uniqHeals = [...new Set(heals)];
    if (uniqHeals.length > 0) {
        stats.push(`Лечение: ${uniqHeals.join(' / ')}`);
    } else if (description.toLowerCase().includes('лечит') || description.toLowerCase().includes('восстанавливает hp') || description.toLowerCase().includes('восстанавливает хп') || description.toLowerCase().includes('исцеляет')) {
        stats.push(`Лечение: (Специальное)`);
    }

    // 3. Shields
    let shieldAtkMatch = skillBody.match(/shield (?:=| \+=)[^;]*?(atk|maxHp)\s*\*\s*([\d\.]+)/);
    if (shieldAtkMatch) {
        stats.push(`Щит: ${Math.round(parseFloat(shieldAtkMatch[2]) * 100)}% ${shieldAtkMatch[1].includes('atk') ? 'АТК' : 'HP'}`);
    } else if (skillBody.includes('.shield =')) {
        stats.push(`Щит: (Специальный)`);
    }

    // 4. ATB Продвижение
    let atbGains = [];
    for (let match of skillBody.matchAll(/\.atb \+ (\d+)/g)) atbGains.push(`${match[1]}%`);
    for (let match of skillBody.matchAll(/\.atb \+= (\d+)/g)) atbGains.push(`${match[1]}%`);
    if (skillBody.match(/\.atb = 100/)) atbGains.push(`100%`);
    
    let uniqAtbGains = [...new Set(atbGains)];
    if (uniqAtbGains.length > 0) stats.push(`Продвижение хода: ${uniqAtbGains.join(' / ')}`);

    // 5. ATB Задержка
    let atbLosses = [];
    for (let match of skillBody.matchAll(/\.atb - (\d+)/g)) atbLosses.push(`${match[1]}%`);
    for (let match of skillBody.matchAll(/\.atb -= (\d+)/g)) atbLosses.push(`${match[1]}%`);
    
    let uniqAtbLosses = [...new Set(atbLosses)];
    if (uniqAtbLosses.length > 0) stats.push(`Задержка хода: ${uniqAtbLosses.join(' / ')}`);

    return stats.join('\\n');
}

let out = "";
let lastIdx = 0;
let regex = /description:\s*(['"`])([\s\S]*?)\1\s*(?:,\s*statsText:\s*"[^"]*")?,/g;
let matches = [];
while ((m = regex.exec(content)) !== null) {
   matches.push({ start: m.index, end: m.index + m[0].length, full: m[0], desc: m[2] });
}

for (let match of matches) {
    let cleanMatch = `description: '${match.desc.replace(/'/g, "\\'")}',`;
    out += content.substring(lastIdx, match.start) + cleanMatch;
    
    let charContext = content.substring(Math.max(0, match.start - 3000), match.start);
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
