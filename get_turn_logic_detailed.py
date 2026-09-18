import re

with open('src/components/BattleScreen.tsx', 'r') as f:
    content = f.read()

# Let's extract the inside of setInterval
match = re.search(r'const tick = setInterval\(\(\) => \{([\s\S]*?)\}, 50\);', content)
if match:
    code = match.group(1)
    print(code[:2000])
else:
    print("Not found")

