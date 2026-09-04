const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

// Frontier
const frontierMatch = code.match(/const frontierStages = \[([\s\S]*?)\];/);
if (frontierMatch) {
    const lines = frontierMatch[0].split('\n');
    let totalGems = 0;
    for (let line of lines) {
        let m = line.match(/gems:\s*(\d+)/);
        if (m) {
            totalGems += parseInt(m[1]);
        }
    }
    console.log("Frontier Gems:", totalGems);
}

// Minigame
// Minigame gives gems upon claiming. Let's see how often it can be claimed.
