const fs = require('fs');

let code = fs.readFileSync('src/components/Gacha.tsx', 'utf-8');

// 1. Revert activeBanner state
code = code.replace(
  "const [activeBanner, setActiveBanner] = useState<'VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'AELITA' | 'STANDARD'>('VOLTA');",
  "const [activeBanner, setActiveBanner] = useState<'VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'STANDARD'>('VOLTA');"
);

// 2. Revert permanentBanners
code = code.replace(
  "const permanentBanners: ('VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER' | 'AELITA')[] = ['VOLTA', 'SELINA', 'INEFFA', 'ASHER', 'AELITA'];",
  "const permanentBanners: ('VOLTA' | 'SELINA' | 'INEFFA' | 'ASHER')[] = ['VOLTA', 'SELINA', 'INEFFA', 'ASHER'];"
);

// 3. Remove AELITA block from bannerDisplayDetails
const startIndex = code.indexOf("    AELITA: {");
const endIndex = code.indexOf("    STANDARD: {", startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// 4. Revert getBannerTabEmoji
code = code.replace(
  "bKey: 'VOLTA' | 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM' | 'AELITA'): string => {",
  "bKey: 'VOLTA' | 'SELINA' | 'KRONA' | 'ASHER' | 'CYRUS' | 'RAVEN' | 'MAESTRO' | 'INEFFA' | 'ZEPHYR' | 'AURUM'): string => {"
);
code = code.replace(
  "case 'AURUM': return '🛡️';\n      case 'AELITA': return '🍃';",
  "case 'AURUM': return '🛡️';"
);

// 5. Remove from activeBanner glow check
code = code.replace(
  "activeBanner === 'VOLTA' ? 'from-violet-500/25 via-transparent to-cyan-500/30' :\n                        activeBanner === 'AELITA' ? 'from-emerald-500/15 via-transparent to-emerald-500/30' :",
  "activeBanner === 'VOLTA' ? 'from-violet-500/25 via-transparent to-cyan-500/30' :"
);

fs.writeFileSync('src/components/Gacha.tsx', code);
console.log("Done");
