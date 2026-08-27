const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /teams: \[\['moyan', 'kopro'\], \[\], \[\]\],/g,
  `teams: [['moyan', 'kopro'], ...Array(9).fill([])],`
);

code = code.replace(
  /const teams = parsed\.teams \|\| \[parsed\.team \|\| \['moyan', 'kopro'\], \[\], \[\]\];/g,
  `const teams = parsed.teams || [parsed.team || ['moyan', 'kopro'], ...Array(9).fill([])];\n        // Ensure we have at least 10 slots if coming from old save\n        while (teams.length < 10) teams.push([]);`
);

fs.writeFileSync('src/App.tsx', code);
