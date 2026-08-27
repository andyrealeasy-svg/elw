const fs = require('fs');
let code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');

// Remove double effectsRefs
code = code.replace("    effectsRefs: {} as Record<string, EffectsOverlayRef>,\n    effectsRefs: {} as Record<string, EffectsOverlayRef>,", "    effectsRefs: {} as Record<string, EffectsOverlayRef>,");

// Rewrite addFloatText properly
code = code.replace(/const addFloatText = React\.useCallback\(\(targetUid: string, text: string, color: string\) => \{[\s\S]*?\}, \[\]\);/, `const addFloatText = React.useCallback((targetUid: string, text: string, color: string) => {
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].addFloatText(targetUid, text, color);
    }
  }, []);`);

// Rewrite playEffect properly
code = code.replace(/const playEffect = React\.useCallback\(\(targetUid: string, type: string\) => \{[\s\S]*?\}, \[triggerShake\]\);/, `const playEffect = React.useCallback((targetUid: string, type: string) => {
    if (type === "shake" || type === "ultimate_aoe") triggerShake();
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].playEffect(targetUid, type);
    }
  }, [triggerShake]);`);

fs.writeFileSync('src/components/BattleScreen.tsx', code);
