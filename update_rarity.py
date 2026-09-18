import re

with open('src/data.ts', 'r') as f:
    content = f.read()

content = content.replace("  snezhana: 'A'\n};", "  snezhana: 'A',\n  farina: 'B'\n};")
content = content.replace("case 'snezhana': return '❄️';", "case 'snezhana': return '❄️';\n    case 'farina': return '🌨️';")

with open('src/data.ts', 'w') as f:
    f.write(content)

print("Rarity and emoji added")
