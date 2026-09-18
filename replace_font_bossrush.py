import re

with open('src/components/HubMenu.tsx', 'r') as f:
    content = f.read()

# Make bossrush desktop less accented
content = content.replace(
    'className="desk-tutorial-bossrush w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-fuchsia-950/40 text-fuchsia-300 transition-colors"',
    'className="desk-tutorial-bossrush w-full flex items-center gap-3 p-2.5 rounded-xl font-medium hover:bg-[#1a1a1a]/50 text-white/70 transition-colors"'
)

# Make bossrush mobile less accented
content = content.replace(
    'className="mob-tutorial-bossrush flex items-center justify-start p-3 rounded-2xl border-2 border-fuchsia-500/50 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all gap-3 text-left"',
    'className="mob-tutorial-bossrush flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-white/70"'
)

# Replace 'font-bold font-mono' with 'font-medium tracking-wide' in all mob-tutorial elements and mobile Gacha button
# Also for the quick access buttons
content = content.replace('font-bold font-mono', 'font-medium tracking-wide')

# Replace 'font-bold' with 'font-medium' for all desktop menu buttons (those with desk-tutorial or 'Сюжет' etc)
# Let's do a targeted replace for desktop nav
def repl_desktop_fonts(m):
    return m.group(0).replace('font-bold', 'font-medium')

content = re.sub(r'<nav className="px-2 pb-4 space-y-0.5 mt-2 flex-1 overflow-y-auto">.*?</nav>', repl_desktop_fonts, content, flags=re.DOTALL)

with open('src/components/HubMenu.tsx', 'w') as f:
    f.write(content)

print("Replacement complete")
