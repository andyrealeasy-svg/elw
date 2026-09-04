const fs = require('fs');
const content = fs.readFileSync('src/data/chapter1.ts', 'utf8');

const regex = /id:\s*['"](s1_\d+)['"][\s\S]*?reward:\s*\{\s*gems:\s*(\d+)/g;
let match;
let total = 0;
while ((match = regex.exec(content)) !== null) {
  const stageNum = parseInt(match[1].replace('s1_', ''));
  if (stageNum >= 28 && stageNum <= 52) {
    total += parseInt(match[2]);
    console.log(match[1], match[2]);
  }
}
console.log("Total for 28-52:", total);
