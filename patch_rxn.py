import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# Add White Field rxn bonus
rxn_bonus = """
      let rxnMult = 1.0;
      let reactionMsg = "";
      
      const farina = state?.playerParty.find(p => p.id === 'farina');
      let farinaBonus = 0;
      if (farina && farina.buffs.whiteField && farina.buffs.whiteField > 0) {
         farinaBonus = 0.05 + (farina.buffs.farinaRxnBonus || 0);
      }
"""

content = content.replace("let rxnMult = 1.0;\n      let reactionMsg = \"\";", rxn_bonus)

# Then apply the farinaBonus when rxnMult is set > 1.0.
def replace_rxnMult(m):
    val = m.group(1)
    if float(val) > 1.0:
        return f"rxnMult = {val} + farinaBonus;"
    return m.group(0)

# Replace assignments like rxnMult = 1.5;
# Because we do rxnMult += farinaBonus at the end of the block instead! It's safer.
