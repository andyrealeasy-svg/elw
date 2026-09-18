import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# Add White Field rxn bonus
rxn_bonus = """
      let rxnMult = 1.0;
      let reactionMsg = "";
"""
rxn_bonus_new = """
      let rxnMult = 1.0;
      let reactionMsg = "";
      
      const farina = state?.playerParty.find(p => p.id === 'farina');
      let farinaBonus = 0;
      if (farina && farina.buffs.whiteField && farina.buffs.whiteField > 0) {
         farinaBonus = 0.05 + (farina.buffs.farinaRxnBonus || 0);
      }
"""

content = content.replace(rxn_bonus, rxn_bonus_new)

# Apply farinaBonus if reaction happened
apply_bonus = """
      if (reactionMsg && playEffect) playEffect(target.uid, "shake");
"""
apply_bonus_new = """
      if (reactionMsg) rxnMult += farinaBonus;
      if (reactionMsg && playEffect) playEffect(target.uid, "shake");
"""
content = content.replace(apply_bonus, apply_bonus_new)

with open('src/data.ts', 'w') as f:
    f.write(content)

print("Injected rxn bonus")
