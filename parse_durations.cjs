const fs = require('fs');

let content = fs.readFileSync('src/data.ts', 'utf-8');

function extractDurations(skillBody, charId, description) {
    let durations = [];
    
    // Pattern to look for buff assignments that are small numbers (<= 5). e.g., s.buffs.shield = 4, target.buffs.poison = 3
    let buffRegex = /(?:s|t\[\d+\]|target|e|ally|enemy|p)\.buffs\.([a-zA-Z0-9_]+)\s*=\s*(?:[a-zA-Z0-9_\.\s\+\-\*\?\:]+)?\s*(\d+)\s*;/g;
    let m;
    // We can also extract from descriptions (e.g. "на 2 хода", "на 3 хода").
    let descRegex = /на (\d+) ход(а|ов)?/ig;
    let md;
    while ((md = descRegex.exec(description)) !== null) {
       durations.push(`${md[1]} хода/ов`);
    }

    let buffAssignRegex = /\.buffs\.([a-zA-Z0-9_]+)\s*(=|\+=|-=)\s*([^;]+);/g;
    let ma;
    let hasStacks = false;
    let hasTurns = false;
    
    // We will just do a simpler search: Look through description first. If the description explicitly states "на 2 хода", we capture that.
    // Also "1 стак", "X стак"
    let stRegex = /(\d+)\s+стак(а|ов|)/ig;
    while ((md = stRegex.exec(description)) !== null) {
       if (md[1] !== '1' || true) {
           hasStacks = true;
       }
    }
    
    return { durations: [...new Set(durations)], hasStacks };
}

