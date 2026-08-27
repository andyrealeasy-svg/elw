const fs = require('fs');
let code = fs.readFileSync('src/components/SquadBuilder.tsx', 'utf-8');

code = code.replace(
  /"px-3 py-1\.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-\[38px\]"/g,
  `"px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-[38px] whitespace-nowrap shrink-0"`
);

fs.writeFileSync('src/components/SquadBuilder.tsx', code);
