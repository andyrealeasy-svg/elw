import re

with open('src/components/HubMenu.tsx', 'r') as f:
    content = f.read()

# Make sure bossrush styling was applied (we can run it again safely)
content = content.replace(
    'className="desk-tutorial-bossrush w-full flex items-center gap-3 p-2.5 rounded-xl font-bold hover:bg-fuchsia-950/40 text-fuchsia-300 transition-colors"',
    'className="desk-tutorial-bossrush w-full flex items-center gap-3 p-2.5 rounded-xl font-medium hover:bg-[#1a1a1a]/50 text-white/70 transition-colors"'
)
content = content.replace(
    'className="mob-tutorial-bossrush flex items-center justify-start p-3 rounded-2xl border-2 border-fuchsia-500/50 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all gap-3 text-left"',
    'className="mob-tutorial-bossrush flex items-center justify-start p-3 rounded-2xl border-2 border-white/5 bg-[#111111]/40 hover:bg-[#111111] transition-all gap-3 text-left text-white/70"'
)
# Since the previous script replaced `font-bold font-mono` with `font-medium tracking-wide`, 
# some mobile elements might have `font-medium tracking-wide` now.

# We just want to replace `font-bold` with `font-medium` in both desktop and mobile menus.
# The desktop nav wrapper is `<nav className="flex-1 flex flex-col gap-1.5 p-4 pb-20">...</nav>`
def repl_desktop_fonts(m):
    return m.group(0).replace('font-bold', 'font-medium')

content = re.sub(r'<nav className="flex-1 flex flex-col gap-1.5 p-4 pb-20">.*?</nav>', repl_desktop_fonts, content, flags=re.DOTALL)

# For the mobile drawer, it starts after `{menuOpen && (` and has `<div className="fixed inset-0...`
# We can replace 'font-bold' with 'font-medium' inside the whole mobile menu area.
# Let's match from `{menuOpen && (` to ` {/* Main Content Area */}`
def repl_mobile_fonts(m):
    # Only replace for the navigation buttons, not the top headers or account details if we can avoid it.
    # But font-medium is okay for those too, actually. Let's just do it for all buttons in mobile menu.
    s = m.group(0)
    s = re.sub(r'<button([^>]*)font-bold([^>]*)>', r'<button\1font-medium\2>', s)
    s = re.sub(r'<span([^>]*)font-bold([^>]*)>', r'<span\1font-medium\2>', s)
    return s

content = re.sub(r'\{menuOpen && \([\s\S]*?\{\/\* Main Content Area \*\/\}', repl_mobile_fonts, content)

with open('src/components/HubMenu.tsx', 'w') as f:
    f.write(content)

print("Second replacement complete")
