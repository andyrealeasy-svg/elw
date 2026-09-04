const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');
const lines = code.split('\n');

const cleanedLines = lines.filter((line, index) => {
    // line 53 is index 52
    if (index >= 50 && index <= 52 && line.includes('profile, setRoute')) {
        return false; // Skip the bad line
    }
    return true;
});

fs.writeFileSync('src/components/HubMenu.tsx', cleanedLines.join('\n'));
console.log("Fixed lines");
