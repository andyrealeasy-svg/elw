const fs = require('fs');
let code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');

code = code.replace(
`  useEffect(() => {
    stateRef.current = { 
      players, 
      enemies, 
      activeUnitId, 
      isRunning: !activeUnitId || isAutoBattle, 
      addFloatText, 
      playEffect,
      damageDealt: damageDealtRef.current,
    lastChecksum: 0,
      isAutoBattle
    };
  },`,
`  useEffect(() => {
    stateRef.current = { 
      ...stateRef.current,
      players, 
      enemies, 
      activeUnitId, 
      isRunning: !activeUnitId || isAutoBattle, 
      addFloatText, 
      playEffect,
      damageDealt: damageDealtRef.current,
      lastChecksum: 0,
      isAutoBattle
    };
  },`);

fs.writeFileSync('src/components/BattleScreen.tsx', code);
