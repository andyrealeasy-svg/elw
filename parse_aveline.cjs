const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

const match = code.match(/const avelineStoryStages = \[([\s\S]*?)\];/);
if (match) {
    const lines = match[0].split('\n');
    let totalGems = 0;
    for (let line of lines) {
        let m = line.match(/gems:\s*(\d+)/);
        if (m) {
            totalGems += parseInt(m[1]);
        }
    }
    console.log("Aveline Gems:", totalGems);
}
