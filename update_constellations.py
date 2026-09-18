import re

with open('src/data/constellations.ts', 'r') as f:
    content = f.read()

farina_constellations = """  farina: [
    { level: 1, name: "Первый снег", description: "Первый прок «Снежной пыли» за ход → Фарина получает 1 Cost." },
    { level: 2, name: "Мука на ветру", description: "«Снежная пыль» длится на 1 ход дольше." },
    { level: 3, name: "Хрупкая белизна", description: "После прока «Снежной пыли» накладывает «Наледь»: следующая атака союзника по врагу наносит +15% DMG." },
    { level: 4, name: "Следы на белом поле", description: "Реакции под «Снежной пылью» дают стаки для усиления ульты." },
    { level: 5, name: "Метель над белым полем", description: "Во время ульты первая реакция союзников за ход вызывает дополнительный AoE Cryo DMG." },
    { level: 6, name: "Когда выпадет последний снег", description: "Реакции продлевают «Снежную пыль» + бонус урона реакций увеличивается на +2,5%." }
  ],
};"""

content = content.replace("};", farina_constellations)

with open('src/data/constellations.ts', 'w') as f:
    f.write(content)

print("Constellations added")
