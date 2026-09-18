const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf-8');

// extract blueprint ids
const bpMatches = [...content.matchAll(/([a-zA-Z0-9_]+):\s*\((?:uid|l|c)/g)].map(m => m[1]);
console.log('All blueprint IDs in data.ts:', bpMatches);
