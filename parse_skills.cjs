const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf-8');

const regex = /([a-z0-9_]+):\s*\([^)]+\)\s*=>\s*\(\{(?:[^{}]*|\{[^{}]*\})*skills:\s*\[/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m[1]);
}
