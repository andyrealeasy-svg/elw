const fs = require('fs');
let code = fs.readFileSync('src/components/BattleScreen.tsx', 'utf-8');

// Add import for EffectsOverlay
if (!code.includes('EffectsOverlay')) {
  code = code.replace("import { cn } from '../lib/utils';", "import { cn } from '../lib/utils';\nimport { EffectsOverlay, EffectsOverlayRef } from './EffectsOverlay';");
}

// Remove floatingTexts and visualEffects state
code = code.replace(/const \[floatingTexts, setFloatingTexts\] = useState[^;]+;/g, '');
code = code.replace(/const \[visualEffects, setVisualEffects\] = useState[^;]+;/g, '');

// Add effectsRefs to stateRef
code = code.replace(/damageDealt: damageDealtRef.current,/, "damageDealt: damageDealtRef.current,\n    effectsRefs: {} as Record<string, EffectsOverlayRef>,");

// Rewrite addFloatText
const oldAddFloatText = /const addFloatText = React\.useCallback\(\(targetUid: string, text: string, color: string\) => {[^}]+}, 1500\);\n  }, \[\]\);/ms;
const newAddFloatText = `const addFloatText = React.useCallback((targetUid: string, text: string, color: string) => {
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].addFloatText(targetUid, text, color);
    }
  }, []);`;
code = code.replace(oldAddFloatText, newAddFloatText);

// Rewrite playEffect
const oldPlayEffect = /const playEffect = React\.useCallback\(\(targetUid: string, type: string\) => {[^}]+}, duration\);\n  }, \[triggerShake\]\);/ms;
const newPlayEffect = `const playEffect = React.useCallback((targetUid: string, type: string) => {
    if (type === "shake" || type === "ultimate_aoe") triggerShake();
    if (stateRef.current.effectsRefs[targetUid]) {
      stateRef.current.effectsRefs[targetUid].playEffect(targetUid, type);
    }
  }, [triggerShake]);`;
code = code.replace(oldPlayEffect, newPlayEffect);

// Remove the old inline JSX for effects
// It's located between {/* Visual Effects */} and </motion.div>
const visualEffectsJsx = /\{\/\* Visual Effects \*\/\}.*?\{\/\* Floating texts \*\/\}.*?<\/div>/ms;
code = code.replace(visualEffectsJsx, '<EffectsOverlay unitId={unit.uid} ref={el => { if(el) stateRef.current.effectsRefs[unit.uid] = el; }} />');

fs.writeFileSync('src/components/BattleScreen.tsx', code);
