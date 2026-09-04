const fs = require('fs');
let code = fs.readFileSync('src/components/EventsMenu.tsx', 'utf8');

// Minigame
code = code.replace(/gems: p\.gems \+ 200/g, 'gems: p.gems + 40');
code = code.replace(/Забрать 💎 200/g, 'Забрать 💎 40');

// Daily check-in
code = code.replace(/p\.gems \+ \(nextStreak \* 60\)/g, 'p.gems + 160');
code = code.replace(/\+\{day \* 60\} 💎/g, '+160 💎');

// Grid Event
code = code.replace(/if \(newItems\[index\]\.type === 'JACKPOT'\) rGems = 500;/g, "if (newItems[index].type === 'JACKPOT') rGems = 50;");
code = code.replace(/if \(newItems\[index\]\.type === 'GEMS'\) rGems = 100;/g, "if (newItems[index].type === 'GEMS') rGems = 10;");
code = code.replace(/500💎/g, '50💎');
code = code.replace(/100💎/g, '10💎');

fs.writeFileSync('src/components/EventsMenu.tsx', code);
console.log("Patched");
