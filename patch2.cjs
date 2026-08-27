const fs = require('fs');
const code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');

let newCode = code.replace(
  /"relative flex flex-col p-0 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer/g,
  '"relative flex flex-col p-0 rounded-xl sm:rounded-2xl border-2 cursor-pointer'
);

newCode = newCode.replace(
  /"h-full transition-all duration-300 relative rounded-full"/g,
  '"h-full relative rounded-full"'
);

newCode = newCode.replace(
  /"h-full transition-all duration-100 relative rounded-full"/g,
  '"h-full relative rounded-full"'
);

newCode = newCode.replace(
  /style={{ width: \`\${unit.atb}%\` }}/g,
  "style={{ transform: `scaleX(${unit.atb / 100})`, transformOrigin: 'left' }}"
);

newCode = newCode.replace(
  /animate={{ width: \`\${hpPercent}%\` }}/g,
  "animate={{ width: `${hpPercent}%` }}" // Actually let's use scaleX for HP as well
);

fs.writeFileSync('src/components/BattleScreen.tsx', newCode);
