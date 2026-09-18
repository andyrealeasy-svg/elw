import re

with open('src/components/HubMenu.tsx', 'r') as f:
    content = f.read()

# I will replace the PC sidebar and the mobile drawer.
# It's better to just write a script that does surgical replacements.

