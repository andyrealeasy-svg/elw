const fs = require('fs');
const code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');
const search = `      if (!stateRef.current.isRunning) {
        // Even if paused, force React to update HP bars from delayed hits
        setPlayers([...currPlayers]);
        setEnemies([...currEnemies]);
        return;
      }`;
const replace = `      const currentChecksum = currPlayers.reduce((sum, p) => sum + p.stats.hp + p.atb, 0) + currEnemies.reduce((sum, e) => sum + e.stats.hp + e.atb, 0);
      if (!stateRef.current.isRunning) {
        if (stateRef.current.lastChecksum !== currentChecksum) {
          setPlayers([...currPlayers]);
          setEnemies([...currEnemies]);
          stateRef.current.lastChecksum = currentChecksum;
        }
        return;
      }`;
fs.writeFileSync('src/components/BattleScreen.tsx', code.replace(search, replace));
