const fs = require('fs');
let code = fs.readFileSync('src/components/SquadBuilder.tsx', 'utf-8');

// replace [0, 1, 2].map with Array.from({length: 10}).map((_, idx)
code = code.replace(
  /{ *\[0, 1, 2\]\.map\(\(idx\) => \(/g, 
  `{Array.from({length: 10}).map((_, idx) => (`
);

// add overflow-x-auto to the container
// <div className="flex items-center bg-[#0a0a0a] p-1 rounded-2xl border border-white/5 gap-1">
code = code.replace(
  /<div className="flex items-center bg-\[#0a0a0a\] p-1 rounded-2xl border border-white\/5 gap-1">/g,
  `<div className="flex items-center bg-[#0a0a0a] p-1 rounded-2xl border border-white/5 gap-1 overflow-x-auto no-scrollbar max-w-full">`
);

fs.writeFileSync('src/components/SquadBuilder.tsx', code);
