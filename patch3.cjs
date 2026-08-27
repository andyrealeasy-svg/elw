const fs = require('fs');
const code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');

const search = `<motion.div 
              initial={{ width: 0 }}
              animate={{ width: \`\${hpPercent}%\` }}
              className={cn(
                "h-full relative rounded-full",
                hpPercent > 50 ? "bg-gradient-to-r from-green-600 to-green-400" : hpPercent > 20 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-red-400"
              )}
            >`;

const replace = `<motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: hpPercent / 100 }}
              style={{ originX: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={cn(
                "h-full relative rounded-full",
                hpPercent > 50 ? "bg-gradient-to-r from-green-600 to-green-400" : hpPercent > 20 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" : "bg-gradient-to-r from-red-600 to-red-400"
              )}
            >`;

if(code.includes('initial={{ width: 0 }}')) {
   fs.writeFileSync('src/components/BattleScreen.tsx', code.replace(search, replace));
   console.log("Patched HP Bar");
}
