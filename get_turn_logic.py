import re

with open('src/components/BattleScreen.tsx', 'r') as f:
    content = f.read()

# Let's find the main game loop / interval
match = re.search(r'(useEffect\(\(\) => \{[\s\S]*?setInterval[\s\S]*?\}\);)', content)
if match:
    print("Found interval!")
else:
    print("Not found")

