import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface CharacterBattleBurstProps {
  effect: { type: string; timestamp: number; x: number; y: number; level: 'skill' | 'ultimate' } | null;
}

const CHARACTER_BURSTS: Record<string, { name: string; title: string; accent: string; secondary: string; glow: string }> = {
  iva: { name: 'ИВА', title: 'ПРОБУЖДЕНИЕ ДРЕВНЕГО ЛЕСА', accent: '#34d399', secondary: '#bef264', glow: 'rgba(16,185,129,0.25)' },
  nereus: { name: 'НЕРЕУС', title: 'ПРИЛИВЫ БЕЗДОННОГО МОРЯ', accent: '#22d3ee', secondary: '#60a5fa', glow: 'rgba(6,182,212,0.24)' },
  selva: { name: 'СЕЛЬВА', title: 'ГРАНД-ФИНАЛ: РЕЖИМ БОГА', accent: '#e879f9', secondary: '#facc15', glow: 'rgba(192,38,211,0.25)' },
  moyan: { name: 'МО ЯНЬ', title: 'ПЕЧАТЬ НЕБЕСНОГО СВИТКА', accent: '#fbbf24', secondary: '#fb7185', glow: 'rgba(217,119,6,0.24)' },
  neuron: { name: 'НЕЙРОН', title: 'СИНАПТИЧЕСКАЯ СИНГУЛЯРНОСТЬ', accent: '#818cf8', secondary: '#22d3ee', glow: 'rgba(79,70,229,0.25)' },
  kern: { name: 'КЕРН', title: 'РАСКОЛ ЯДРА ПЛАНЕТЫ', accent: '#f59e0b', secondary: '#fb7185', glow: 'rgba(180,83,9,0.3)' },
  pulse: { name: 'ПУЛЬС', title: 'РАЗРЯД ПРЕДЕЛЬНОЙ ЧАСТОТЫ', accent: '#a5b4fc', secondary: '#22d3ee', glow: 'rgba(99,102,241,0.24)' },
  kopro: { name: 'КОПРО', title: 'ЯРОСТЬ ПЕРВОЗДАННОЙ РОЩИ', accent: '#a3e635', secondary: '#34d399', glow: 'rgba(101,163,13,0.24)' },
};

const CharacterScene: React.FC<{ character: string; accent: string; secondary: string }> = ({ character, accent, secondary }) => {
  switch (character) {
    case 'iva':
      return (
        <>
          <motion.path d="M-30 520C120 450 135 310 280 270S430 180 470 55M1030 520C880 450 865 310 720 270S570 180 530 55M-20 250C150 280 210 390 330 600M1020 250C850 280 790 390 670 600" stroke={accent} strokeWidth="5" opacity=".75" />
          <motion.path d="M500 540V180M500 365C365 365 315 270 335 205C420 216 486 273 500 365ZM500 300C630 300 690 205 665 145C585 162 517 220 500 300Z" fill={`${accent}28`} stroke={secondary} strokeWidth="4" />
          {[160, 275, 390, 610, 725, 840].map((x, index) => <motion.ellipse key={x} cx={x} cy={90 + (index % 3) * 45} rx="18" ry="42" fill={secondary} opacity=".7" initial={{ y: -50, rotate: -35 }} animate={{ y: 220, rotate: 35 }} transition={{ duration: 1, delay: index * 0.05 }} />)}
        </>
      );
    case 'nereus':
      return (
        <>
          {[90, 145, 205].map((radius, index) => <motion.ellipse key={radius} cx="500" cy="390" rx={radius * 2.5} ry={radius * 0.55} stroke={index % 2 ? secondary : accent} strokeWidth={index === 1 ? 5 : 2} strokeDasharray={index ? '18 11' : 'none'} initial={{ scale: 0.25, opacity: 0 }} animate={{ scale: 1.5, opacity: [0, 0.85, 0] }} transition={{ duration: 1.15, delay: index * 0.11 }} />)}
          <motion.path d="M-20 410C90 310 180 505 290 405S490 310 600 410S800 505 910 405S1110 310 1220 410M-20 480C90 380 180 575 290 475S490 380 600 480S800 575 910 475S1110 380 1220 480M90 335C190 205 310 205 410 335M910 335C810 205 690 205 590 335" stroke={accent} strokeWidth="4" fill="none" />
          <motion.path d="M500 70C555 140 590 185 500 250C410 185 445 140 500 70ZM500 285L465 355H535Z" fill={`${accent}55`} stroke="#ecfeff" strokeWidth="3" />
        </>
      );
    case 'selva':
      return (
        <>
          <motion.path d="M0 115H225V220H385V115H615V220H775V115H1000M0 485H165V380H340V485H660V380H835V485H1000M330 0V155H420V260H580V155H670V0M330 600V445H420V340H580V445H670V600" stroke={accent} strokeWidth="5" strokeDasharray="14 9" />
          <motion.rect x="375" y="175" width="250" height="250" rx="25" fill={`${accent}12`} stroke="#fdf4ff" strokeWidth="3" initial={{ rotate: -20, scale: 0.2 }} animate={{ rotate: 160, scale: 1.3, opacity: [0, 1, 0] }} transition={{ duration: 1.1 }} />
          <motion.path d="M500 78L536 230L675 170L580 278L742 310L580 342L675 452L536 390L500 540L464 390L325 452L420 342L258 310L420 278L325 170L464 230Z" fill={`${accent}20`} stroke={secondary} strokeWidth="3" />
          {[0, 1, 2, 3].map((index) => <motion.rect key={index} x={90 + index * 260} y={120 + (index % 2) * 230} width="48" height="48" fill={secondary} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 0.7], rotate: 90 }} transition={{ duration: 0.8, delay: index * 0.08 }} />)}
        </>
      );
    case 'moyan':
      return (
        <>
          {[0, 1, 2].map((index) => <motion.rect key={index} x={220 + index * 45} y={72 + index * 28} width={560 - index * 90} height={456 - index * 56} rx="8" fill="none" stroke={index === 1 ? secondary : accent} strokeWidth={index === 1 ? 4 : 2} strokeDasharray={index === 1 ? '18 10' : 'none'} initial={{ rotate: -18, scale: 0.4, opacity: 0 }} animate={{ rotate: index % 2 ? 18 : -18, scale: 1.2, opacity: [0, 0.75, 0] }} transition={{ duration: 1.1, delay: index * 0.08 }} />)}
          <motion.path d="M240 150C360 90 425 205 520 150S690 90 780 150M220 235C350 175 430 290 530 235S690 175 800 235M220 365C350 305 430 420 530 365S690 305 800 365M240 450C360 390 425 505 520 450S690 390 780 450" stroke={secondary} strokeWidth="8" strokeLinecap="round" />
          <motion.path d="M500 60L560 300L500 540L440 300Z" fill={`${accent}22`} stroke="#fffbeb" strokeWidth="4" />
          <motion.text x="500" y="330" textAnchor="middle" fill="#fffbeb" fontSize="72" fontWeight="900">文</motion.text>
        </>
      );
    case 'neuron':
      return (
        <>
          {[0, 1, 2].map((index) => <motion.ellipse key={index} cx="500" cy="300" rx={180 + index * 65} ry={105 + index * 36} fill="none" stroke={index % 2 ? secondary : accent} strokeWidth={index === 1 ? 4 : 2} strokeDasharray={index ? '8 12' : 'none'} initial={{ rotate: -25 }} animate={{ rotate: 335 }} transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }} />)}
          <motion.path d="M100 165L300 255L500 110L700 255L900 165M100 435L300 345L500 490L700 345L900 435M300 255V345M700 255V345M300 255L500 300L700 255M300 345L500 300L700 345" stroke={secondary} strokeWidth="3" />
          {[[100,165],[300,255],[500,110],[700,255],[900,165],[100,435],[300,345],[500,490],[700,345],[900,435]].map(([cx, cy], index) => <motion.circle key={index} cx={cx} cy={cy} r="10" fill={index % 2 ? accent : secondary} initial={{ opacity: 0.25, scale: 0.6 }} animate={{ opacity: 1, scale: [0.7, 1.7, 0.7] }} transition={{ duration: 0.65, delay: index * 0.04, repeat: Infinity }} />)}
          <motion.path d="M485 190L430 315H490L465 410L575 270H515L545 190Z" fill={`${accent}cc`} stroke="#eef2ff" strokeWidth="4" />
        </>
      );
    case 'kern':
      return (
        <>
          <motion.path d="M0 180L170 205L245 125L340 260L430 90L520 235L610 95L700 260L800 125L875 205L1000 180M0 430L150 400L250 495L340 360L450 515L535 370L630 510L735 360L835 495L930 400L1000 430" stroke={accent} strokeWidth="9" strokeLinejoin="round" fill="none" />
          {[0, 1, 2].map((index) => <motion.polygon key={index} points="500,100 615,255 570,390 500,500 430,390 385,255" fill={`${index ? secondary : accent}18`} stroke={index ? secondary : accent} strokeWidth={index === 1 ? 5 : 2} initial={{ scale: 0.15, rotate: 0 }} animate={{ scale: [0.15, 1.25, 1], rotate: index % 2 ? 35 : -35, opacity: [0, 0.9, 0.5] }} transition={{ duration: 1, delay: index * 0.09 }} />)}
          <motion.circle cx="500" cy="300" r="44" fill="#f97316" stroke="#fff7ed" strokeWidth="6" initial={{ scale: 0 }} animate={{ scale: [0, 1.8, 0.9], opacity: [0, 1, 0.8] }} transition={{ duration: 0.8 }} />
        </>
      );
    case 'pulse':
      return (
        <>
          {[0, 1, 2, 3].map((index) => <motion.ellipse key={index} cx="500" cy="330" rx={95 + index * 80} ry={45 + index * 25} fill="none" stroke={index % 2 ? secondary : accent} strokeWidth={index === 1 ? 5 : 2} strokeDasharray={index % 2 ? '3 9' : 'none'} initial={{ scale: 0.1, opacity: 0.9 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1, delay: index * 0.1 }} />)}
          <motion.path d="M-20 290H235L285 240L330 350L395 155L455 390L510 235L565 305H1020M0 440H210L265 405L310 470L375 360L430 465H1000" stroke="#e0e7ff" strokeWidth="5" strokeLinejoin="round" fill="none" />
          <motion.path d="M520 45L410 295H490L445 545L610 245H520Z" fill={`${accent}66`} stroke="#ffffff" strokeWidth="5" />
          {[150, 330, 670, 850].map((x, index) => <motion.path key={x} d={`M${x} 50V155M${x - 35} 120L${x} 155L${x + 35} 120`} stroke={secondary} strokeWidth="4" initial={{ y: -45, opacity: 0 }} animate={{ y: 20, opacity: [0, 1, 0] }} transition={{ duration: 0.7, delay: index * 0.08 }} />)}
        </>
      );
    case 'kopro':
      return (
        <>
          <motion.path d="M-20 560C200 510 175 310 360 280S410 120 470 50M1020 560C800 510 825 310 640 280S590 120 530 50M60 600C220 450 240 390 290 300M940 600C780 450 760 390 710 300" stroke={accent} strokeWidth="8" fill="none" />
          {[0, 1, 2, 3].map((index) => <motion.path key={index} d={`M${180 + index * 190} ${125 + (index % 2) * 300}C${115 + index * 190} ${60 + (index % 2) * 300} ${100 + index * 190} ${190 + (index % 2) * 300} ${180 + index * 190} ${240 + (index % 2) * 300}C${260 + index * 190} ${170 + (index % 2) * 300} ${245 + index * 190} ${55 + (index % 2) * 300} ${180 + index * 190} ${125 + (index % 2) * 300}Z`} fill={`${index % 2 ? secondary : accent}40`} stroke={index % 2 ? secondary : accent} strokeWidth="3" initial={{ y: -60, rotate: -30 }} animate={{ y: 70, rotate: 35 }} transition={{ duration: 1.05, delay: index * 0.06 }} />)}
          <motion.path d="M340 465L615 105M572 110L650 84L623 160Z" stroke="#ecfccb" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill={`${accent}88`} />
          <motion.path d="M500 170L545 280L665 245L580 330L640 450L525 375L430 460L470 345L350 300L475 285Z" fill={`${secondary}28`} stroke={secondary} strokeWidth="3" />
        </>
      );
    default:
      return null;
  }
};

export const CharacterBattleBurst: React.FC<CharacterBattleBurstProps> = React.memo(({ effect }) => {
  const character = effect?.type.split('_')[0] ?? '';
  const config = CHARACTER_BURSTS[character];

  return (
    <AnimatePresence>
      {effect && config && (
        <motion.div
          key={`${effect.type}-${effect.timestamp}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            width: effect.level === 'ultimate' ? 'min(82vw, 410px)' : 'min(70vw, 320px)',
            aspectRatio: '5 / 3',
          }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.35, rotate: -8 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.35, 1, 1.08], rotate: 0 }}
            transition={{ duration: effect.level === 'ultimate' ? 1.05 : 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ filter: `drop-shadow(0 0 18px ${config.glow})` }}
          >
            <svg className="h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none">
              <motion.ellipse cx="500" cy="340" rx="210" ry="100" stroke={config.accent} strokeWidth="3" initial={{ scale: 0.45, opacity: 0 }} animate={{ scale: [0.45, 1.05, 1.2], opacity: [0, 0.85, 0] }} transition={{ duration: effect.level === 'ultimate' ? 1 : 0.75 }} />
              <motion.ellipse cx="500" cy="340" rx="155" ry="72" stroke={config.secondary} strokeWidth="2" strokeDasharray="14 10" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 1, 1.1], opacity: [0, 0.8, 0] }} transition={{ duration: 0.7, delay: 0.05 }} />
              <CharacterScene character={character} accent={config.accent} secondary={config.secondary} />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 0.8, 0], y: [6, 0, -3] }}
            transition={{ duration: 0.85, times: [0, 0.2, 1] }}
            className="absolute left-1/2 top-[82%] -translate-x-1/2 whitespace-nowrap text-center font-black"
            style={{ color: config.accent, textShadow: `0 0 18px ${config.glow}` }}
          >
            <div className="text-[7px] sm:text-[9px] opacity-80">{config.name} • {effect.type.split('_').slice(1).join(' ').replaceAll('_', ' ').toUpperCase()}</div>
            {effect.level === 'ultimate' && <div className="mt-0.5 text-[9px] sm:text-xs">{config.title}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
