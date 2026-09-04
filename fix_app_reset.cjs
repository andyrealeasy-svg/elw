const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the daily reset in the initial state load
code = code.replace(
/if\s*\(lastReset\s*<\s*startOfDay\)\s*\{\s*resetProfile\s*=\s*\{\s*\.\.\.resetProfile,\s*bpExp:\s*0,\s*bpClaimedLevels:\s*\[\],\s*bpClaimedLevelsPremium:\s*\[\],\s*hasGoldenPass:\s*false,\s*bpResetTime:\s*Date\.now\(\),\s*dailies:/g,
`if (lastReset < startOfDay) {
           resetProfile = {
              ...resetProfile,
              dailies:`
);

// Add BP reset logic to initial state load
code = code.replace(
/const abyssResetTime\s*=\s*parsed\.lunarAbyssResetTime\s*\|\|\s*0;/,
`// Battle Pass Reset (every 3 days)
        const bpReset = parsed.bpResetTime || 0;
        if (now.getTime() >= bpReset) {
           resetProfile.bpExp = 0;
           resetProfile.bpClaimedLevels = [];
           resetProfile.bpClaimedLevelsPremium = [];
           resetProfile.hasGoldenPass = false;
           resetProfile.bpResetTime = now.getTime() + 3 * 24 * 60 * 60 * 1000;
        }

        const abyssResetTime = parsed.lunarAbyssResetTime || 0;`
);

// Fix the daily reset in the useEffect checkReset
code = code.replace(
/if\s*\(lastReset\s*<\s*startOfDay\)\s*\{\s*newP\s*=\s*\{\s*\.\.\.newP,\s*bpExp:\s*0,\s*bpClaimedLevels:\s*\[\],\s*bpClaimedLevelsPremium:\s*\[\],\s*hasGoldenPass:\s*false,\s*bpResetTime:\s*Date\.now\(\),\s*dailies:/g,
`if (lastReset < startOfDay) {
          newP = {
            ...newP,
            dailies:`
);

// Add BP reset logic to checkReset
code = code.replace(
/\/\/\s*Lunar Abyss Reset/,
`// Battle Pass Reset
        if (nowTime > (p.bpResetTime || 0)) {
           newP = {
              ...newP,
              bpExp: 0,
              bpClaimedLevels: [],
              bpClaimedLevelsPremium: [],
              hasGoldenPass: false,
              bpResetTime: nowTime + 3 * 24 * 60 * 60 * 1000
           };
           updated = true;
        }

        // Lunar Abyss Reset`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
