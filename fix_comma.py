import re

with open('src/data/constellations.ts', 'r') as f:
    content = f.read()

content = content.replace("]\n  farina: [", "],\n  farina: [")

with open('src/data/constellations.ts', 'w') as f:
    f.write(content)

print("Fixed comma")
