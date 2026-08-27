const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Backgrounds
  [/bg-slate-950/g, 'bg-[#0a0a0a]'],
  [/bg-slate-900/g, 'bg-[#111111]'],
  [/bg-slate-800/g, 'bg-[#1a1a1a]'],
  [/bg-gray-950/g, 'bg-[#0a0a0a]'],
  [/bg-gray-900/g, 'bg-[#111111]'],
  [/bg-gray-800/g, 'bg-[#1a1a1a]'],
  
  // Borders
  [/border-slate-900/g, 'border-white/5'],
  [/border-slate-800/g, 'border-white/5'],
  [/border-slate-700/g, 'border-white/10'],
  [/border-gray-900/g, 'border-white/5'],
  [/border-gray-800/g, 'border-white/5'],
  [/border-gray-700/g, 'border-white/10'],
  
  // Texts
  [/text-slate-200/g, 'text-white/90'],
  [/text-slate-300/g, 'text-white/70'],
  [/text-slate-400/g, 'text-white/50'],
  [/text-slate-500/g, 'text-white/40'],
  [/text-gray-200/g, 'text-white/90'],
  [/text-gray-300/g, 'text-white/70'],
  [/text-gray-400/g, 'text-white/50'],
  [/text-gray-500/g, 'text-white/40'],

  // Gradients
  [/from-slate-900/g, 'from-[#111111]'],
  [/from-slate-950/g, 'from-[#0a0a0a]'],
  [/via-slate-900/g, 'via-[#111111]'],
  [/via-slate-950/g, 'via-[#0a0a0a]'],
  [/to-slate-900/g, 'to-[#111111]'],
  [/to-slate-950/g, 'to-[#0a0a0a]'],
  [/from-gray-900/g, 'from-[#111111]'],
  [/from-gray-950/g, 'from-[#0a0a0a]'],
  [/via-gray-900/g, 'via-[#111111]'],
  [/via-gray-950/g, 'via-[#0a0a0a]'],
  [/to-gray-900/g, 'to-[#111111]'],
  [/to-gray-950/g, 'to-[#0a0a0a]'],
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Radii - careful replacement to avoid double-stepping
  content = content.replace(/rounded-2xl/g, '%%R3XL%%');
  content = content.replace(/rounded-xl/g, '%%R2XL%%');
  content = content.replace(/rounded-lg/g, '%%RXL%%');
  
  content = content.replace(/%%R3XL%%/g, 'rounded-3xl');
  content = content.replace(/%%R2XL%%/g, 'rounded-2xl');
  content = content.replace(/%%RXL%%/g, 'rounded-xl');

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Also replace some common gradients that look cheap
  content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400/g, 'text-white');
  content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500/g, 'text-white');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

console.log("Replacements done.");
