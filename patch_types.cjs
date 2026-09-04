const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('tutorialCompleted')) {
    code = code.replace(/export interface PlayerProfile \{/, 'export interface PlayerProfile {\n  tutorialCompleted?: boolean;');
    fs.writeFileSync('src/types.ts', code);
    console.log("Patched types.ts");
}
