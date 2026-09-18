const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf-8');

// Find all skills array
const skillRegex = /skills:\s*\[([\s\S]*?)\]/g;
let match;
while ((match = skillRegex.exec(content)) !== null) {
   const skillsBlock = match[1];
   // parse individual skills
}
