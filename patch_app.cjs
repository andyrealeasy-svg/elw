const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The line is: ? route.team.map((id: string) => characterBlueprints[id](id, 80, 0, []))
code = code.replace(
  "? route.team.map((id: string) => characterBlueprints[id](id, 80, 0, []))",
  "? route.team.map((id: string) => { const c = characterBlueprints[id](id, 80, 0, []); if (c.stats.speed < 150) c.stats.speed = 150; return c; })"
);

fs.writeFileSync('src/App.tsx', code);
