const fs = require('fs');
let code = fs.readFileSync('src/components/HubMenu.tsx', 'utf8');

// 1. Replace the localStorage key and add menuOpen force
code = code.replace(/if \(!localStorage\.getItem\('tutorial_completed_v1'\)\) \{[\s\S]*?setShowTutorial\(true\);[\s\S]*?\}/, `if (!localStorage.getItem('tutorial_completed_v2')) {
      setShowTutorial(true);
      if (window.innerWidth < 768) {
        setMenuOpen(true);
      }
    }`);

code = code.replace(/localStorage\.setItem\('tutorial_completed_v1', 'true'\);/, `localStorage.setItem('tutorial_completed_v2', 'true');`);

// 2. Replace the tutorialSteps array
const newTutorialSteps = `
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const prefix = isMobile ? '.mob-' : '.desk-';
  const tutorialSteps: Step[] = [
    {
      target: prefix + 'tutorial-story',
      content: 'Здесь начинается ваш путь! Проходите сюжетные миссии, чтобы получать награды и открывать новый контент.',
      disableBeacon: true,
      placement: isMobile ? 'bottom' : 'right'
    },
    {
      target: prefix + 'tutorial-roster',
      content: 'Управляйте своими персонажами, прокачивайте их уровень и экипируйте артефакты.',
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-gacha',
      content: 'Испытайте удачу! Призывайте новых героев и расширяйте свой отряд.',
      placement: isMobile ? 'top' : 'right'
    },
    {
      target: prefix + 'tutorial-events',
      content: 'Участвуйте во временных событиях и забирайте ежедневные бонусы!',
      placement: isMobile ? 'bottom' : 'right'
    }
  ];
`;
code = code.replace(/const tutorialSteps: Step\[\] = \[[\s\S]*?\}\n  \];/m, newTutorialSteps);

// 3. Fix the desktop classes
code = code.replace(/className="tutorial-story tutorial-story/g, 'className="desk-tutorial-story');
code = code.replace(/className="tutorial-map tutorial-map/g, 'className="desk-tutorial-map');
code = code.replace(/className="tutorial-roster tutorial-roster/g, 'className="desk-tutorial-roster');
code = code.replace(/className="tutorial-gacha tutorial-gacha/g, 'className="desk-tutorial-gacha');
code = code.replace(/className=\{`tutorial-events tutorial-events/g, 'className={`desk-tutorial-events');
code = code.replace(/className="tutorial-abyss/g, 'className="desk-tutorial-abyss');

// 4. Inject mobile classes
code = code.replace(/onClick=\{\(\) => \{ setRoute\('STORY'\); setMenuOpen\(false\); \}\}\n\s*className="/, `onClick={() => { setRoute('STORY'); setMenuOpen(false); }}\n                  className="mob-tutorial-story `);
code = code.replace(/onClick=\{\(\) => \{ setRoute\('ROSTER'\); setMenuOpen\(false\); \}\}\n\s*className="/, `onClick={() => { setRoute('ROSTER'); setMenuOpen(false); }}\n                     className="mob-tutorial-roster `);
code = code.replace(/onClick=\{\(\) => \{ setRoute\('GACHA'\); setMenuOpen\(false\); \}\}\n\s*className="/, `onClick={() => { setRoute('GACHA'); setMenuOpen(false); }}\n                     className="mob-tutorial-gacha `);
code = code.replace(/onClick=\{\(\) => \{ setActiveTab\('EVENTS'\); setMenuOpen\(false\); \}\}\n\s*className=\{`/, `onClick={() => { setActiveTab('EVENTS'); setMenuOpen(false); }}\n                  className={\`mob-tutorial-events `);


fs.writeFileSync('src/components/HubMenu.tsx', code);
console.log("Patched HubMenu for Mobile");
