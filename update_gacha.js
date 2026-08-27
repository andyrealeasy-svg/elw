const fs = require('fs');

let code = fs.readFileSync('src/components/Gacha.tsx', 'utf-8');

// 1. Update permanentBanners
code = code.replace(
  "const permanentBanners: ('VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER')[] = ['VOLTA', 'SELINA', 'INEFFA', 'ASHER'];",
  "const permanentBanners: ('VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'AELITA')[] = ['VOLTA', 'SELINA', 'INEFFA', 'ASHER', 'AELITA'];"
);

// 2. Add AELITA to bannerDisplayDetails
code = code.replace(
  "    STANDARD: {",
  `    AELITA: {
      title: "ЭХО ПРИРОДЫ",
      subtitle: "Теорема о Дикой Природе",
      sId: "aelita",
      sName: "Аэлита",
      sElement: "Dendro",
      sThemeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
      sBgAccent: "from-emerald-600/20 to-transparent",
      desc: "Шанс на получение Аэлиты [S] увеличен! Накладывает Шипы и наносит мощный Dendro-урон.",
      aRateUps: ["kopro", "patch", "echo"] as string[]
    },
    STANDARD: {`
);

// 3. Update STANDARD sId and sName
code = code.replace(
  /sId: "aelita",\s*sName: "Аэлита",\s*sElement: "Dendro",/,
  `sId: "neuron",
      sName: "Нейрон",
      sElement: "Electro",`
);

// 4. Update LIMITED_S
code = code.replace(
  /const LIMITED_S = \["volta", "selina", "krona", "asher", "cyrus", "raven", "maestro", "ineffa", "zephyr", "aurum"\];/,
  'const LIMITED_S = ["volta", "selina", "krona", "asher", "cyrus", "raven", "maestro", "ineffa", "zephyr", "aurum", "aelita"];'
);

// 5. Update activeBanner type
code = code.replace(
  "const [activeBanner, setActiveBanner] = useState<'VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'STANDARD'>('VOLTA');",
  "const [activeBanner, setActiveBanner] = useState<'VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'AELITA' | 'STANDARD'>('VOLTA');"
);

fs.writeFileSync('src/components/Gacha.tsx', code);
console.log("Done.");
